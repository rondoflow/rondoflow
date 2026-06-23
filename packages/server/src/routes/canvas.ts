import { FastifyInstance } from 'fastify'
import { access, stat } from 'fs/promises'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError, ValidationError } from '../lib/errors'

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  workingDirectory: z.string().max(500).optional(),
})

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  workingDirectory: z.string().max(500).nullable().optional(),
})

const SaveCanvasSchema = z.object({
  name: z.string().min(1).default('default'),
  viewport: z.record(z.unknown()),
  nodes: z.array(z.record(z.unknown())),
  edges: z.array(z.record(z.unknown())),
})

export async function canvasRoutes(app: FastifyInstance) {
  // Detect the server's working directory for onboarding auto-fill
  app.get('/api/workspaces/detect-directory', async (_req, reply) => {
    sendSuccess(reply, { directory: process.cwd() })
  })

  // Read-only aggregated info/stats for a single workspace (powers the info modal).
  app.get<{ Params: { id: string } }>('/api/workspaces/:id/info', async (req, reply) => {
    try {
      const { id } = req.params

      const workspace = await prisma.workspace.findUnique({
        where: { id },
        include: {
          _count: { select: { canvasLayouts: true, resources: true, memories: true } },
        },
      })
      if (!workspace) throw new NotFoundError('Workspace', id)

      const [
        resourceGroups,
        latestLayout,
        runGroups,
        runAgg,
        completedRuns,
        usageAgg,
        activityCount,
        lastActivity,
      ] = await Promise.all([
        prisma.workspaceResource.groupBy({
          by: ['type'],
          where: { workspaceId: id },
          _count: { _all: true },
        }),
        prisma.canvasLayout.findFirst({
          where: { workspaceId: id },
          orderBy: { updatedAt: 'desc' },
          select: { nodes: true, edges: true, updatedAt: true },
        }),
        prisma.chainRun.groupBy({
          by: ['status'],
          where: { workspaceId: id },
          _count: { _all: true },
        }),
        prisma.chainRun.aggregate({
          where: { workspaceId: id },
          _sum: { totalSteps: true },
          _min: { createdAt: true },
          _max: { createdAt: true },
          _count: { _all: true },
        }),
        prisma.chainRun.findMany({
          where: { workspaceId: id, completedAt: { not: null } },
          select: { createdAt: true, completedAt: true },
        }),
        prisma.sessionUsage.aggregate({
          where: { workspaceId: id },
          _sum: { costUsd: true, inputTokens: true, outputTokens: true },
          _count: { _all: true },
        }),
        prisma.activityEvent.count({ where: { workspaceId: id } }),
        prisma.activityEvent.findFirst({
          where: { workspaceId: id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true, title: true },
        }),
      ])

      // Duration stats over completed/finished runs (completedAt is set on
      // completed/failed/stopped/skipped — every terminal state).
      let totalDurationMs = 0
      let maxDurationMs = 0
      for (const run of completedRuns) {
        if (!run.completedAt) continue
        const ms = run.completedAt.getTime() - run.createdAt.getTime()
        if (ms < 0) continue
        totalDurationMs += ms
        if (ms > maxDurationMs) maxDurationMs = ms
      }
      const avgDurationMs = completedRuns.length
        ? Math.round(totalDurationMs / completedRuns.length)
        : 0

      const byStatus: Record<string, number> = {}
      for (const group of runGroups) byStatus[group.status] = group._count._all

      const nodes = latestLayout?.nodes
      const edges = latestLayout?.edges

      sendSuccess(reply, {
        id: workspace.id,
        name: workspace.name,
        workingDirectory: workspace.workingDirectory,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        hasContextDocument: Boolean(workspace.contextDocument),
        hasPlanDocument: Boolean(workspace.planDocument),
        canvas: {
          layoutCount: workspace._count.canvasLayouts,
          nodeCount: Array.isArray(nodes) ? nodes.length : 0,
          edgeCount: Array.isArray(edges) ? edges.length : 0,
          lastUpdated: latestLayout?.updatedAt ?? null,
        },
        resources: {
          total: workspace._count.resources,
          byType: Object.fromEntries(resourceGroups.map((g) => [g.type, g._count._all])),
        },
        memories: { count: workspace._count.memories },
        runs: {
          total: runAgg._count._all,
          completed: byStatus['completed'] ?? 0,
          failed: byStatus['failed'] ?? 0,
          running: byStatus['running'] ?? 0,
          stopped: byStatus['stopped'] ?? 0,
          byStatus,
          totalSteps: runAgg._sum.totalSteps ?? 0,
          firstRunAt: runAgg._min.createdAt,
          lastRunAt: runAgg._max.createdAt,
          avgDurationMs,
          totalDurationMs,
          maxDurationMs,
        },
        usage: {
          costUsd: usageAgg._sum.costUsd ?? 0,
          inputTokens: usageAgg._sum.inputTokens ?? 0,
          outputTokens: usageAgg._sum.outputTokens ?? 0,
          sessions: usageAgg._count._all,
        },
        activity: {
          total: activityCount,
          lastAt: lastActivity?.createdAt ?? null,
          lastTitle: lastActivity?.title ?? null,
        },
      })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get('/api/workspaces', async (_req, reply) => {
    try {
      // Shared team pool — every authenticated user sees all workspaces.
      const workspaces = await prisma.workspace.findMany({
        include: {
          canvasLayouts: { select: { id: true, name: true, updatedAt: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      sendSuccess(reply, workspaces)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/workspaces', async (req, reply) => {
    try {
      const body = CreateWorkspaceSchema.parse(req.body)
      const workspace = await prisma.workspace.create({
        data: { ...body, userId: req.user?.id },
      })
      sendSuccess(reply, workspace, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.patch<{ Params: { id: string } }>('/api/workspaces/:id', async (req, reply) => {
    try {
      const { id } = req.params
      const body = UpdateWorkspaceSchema.parse(req.body)

      const workspace = await prisma.workspace.findUnique({ where: { id } })
      if (!workspace) throw new NotFoundError('Workspace', id)

      // Validate working directory exists and is a directory
      if (body.workingDirectory) {
        try {
          await access(body.workingDirectory)
          const stats = await stat(body.workingDirectory)
          if (!stats.isDirectory()) {
            throw new ValidationError(`Path is not a directory: ${body.workingDirectory}`)
          }
        } catch (err) {
          if (err instanceof ValidationError) throw err
          throw new ValidationError(`Directory not found: ${body.workingDirectory}`)
        }
      }

      const updated = await prisma.workspace.update({
        where: { id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.workingDirectory !== undefined ? { workingDirectory: body.workingDirectory } : {}),
        },
      })
      sendSuccess(reply, updated)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.delete<{ Params: { id: string } }>('/api/workspaces/:id', async (req, reply) => {
    try {
      const { id } = req.params

      const workspace = await prisma.workspace.findUnique({ where: { id } })
      if (!workspace) throw new NotFoundError('Workspace', id)

      // Prevent deleting the last workspace (shared pool — global count)
      const count = await prisma.workspace.count()
      if (count <= 1) {
        return reply.status(400).send({
          success: false,
          error: 'Cannot delete the last workspace',
        })
      }

      await prisma.workspace.delete({ where: { id } })
      sendSuccess(reply, { deleted: true })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get<{ Params: { id: string } }>('/api/workspaces/:id/canvas', async (req, reply) => {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: req.params.id },
      })
      if (!workspace) throw new NotFoundError('Workspace', req.params.id)

      const layout = await prisma.canvasLayout.findFirst({
        where: { workspaceId: req.params.id },
        orderBy: { updatedAt: 'desc' },
      })
      sendSuccess(reply, layout ?? null)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Update workspace context document
  app.patch<{ Params: { id: string } }>('/api/workspaces/:id/context', async (req, reply) => {
    try {
      const { id: workspaceId } = req.params
      const body = z.object({ contextDocument: z.string().nullable() }).parse(req.body)

      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
      if (!workspace) throw new NotFoundError('Workspace', workspaceId)

      const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { contextDocument: body.contextDocument },
      })
      sendSuccess(reply, updated)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Update workspace plan document
  app.patch<{ Params: { id: string } }>('/api/workspaces/:id/plan', async (req, reply) => {
    try {
      const { id: workspaceId } = req.params
      const body = z.object({ planDocument: z.string().nullable() }).parse(req.body)

      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
      if (!workspace) throw new NotFoundError('Workspace', workspaceId)

      const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { planDocument: body.planDocument },
      })
      sendSuccess(reply, updated)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.put<{ Params: { id: string } }>('/api/workspaces/:id/canvas', async (req, reply) => {
    try {
      const { id: workspaceId } = req.params
      const body = SaveCanvasSchema.parse(req.body)

      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
      if (!workspace) throw new NotFoundError('Workspace', workspaceId)

      const existing = await prisma.canvasLayout.findFirst({
        where: { workspaceId, name: body.name },
      })

      const layout = existing
        ? await prisma.canvasLayout.update({
            where: { id: existing.id },
            data: {
              viewport: body.viewport as any,
              nodes: body.nodes as any,
              edges: body.edges as any,
            },
          })
        : await prisma.canvasLayout.create({
            data: {
              workspaceId,
              viewport: body.viewport as any,
              nodes: body.nodes as any,
              edges: body.edges as any,
            },
          })

      sendSuccess(reply, layout)
    } catch (error) {
      sendError(reply, error)
    }
  })
}
