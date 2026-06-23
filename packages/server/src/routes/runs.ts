import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError } from '../lib/errors'

const RunsQuerySchema = z.object({
  workspaceId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
})

export async function runRoutes(app: FastifyInstance) {
  // List historical workflow/chain runs (most recent first). Shared team pool —
  // all runs are visible; an optional workspaceId narrows the view.
  app.get('/api/runs', async (req, reply) => {
    try {
      const query = RunsQuerySchema.parse(req.query)
      const skip = (query.page - 1) * query.limit

      const where: Record<string, unknown> = query.workspaceId
        ? { workspaceId: query.workspaceId }
        : {}

      const [runs, total] = await Promise.all([
        prisma.chainRun.findMany({
          where,
          include: {
            steps: { select: { tokensIn: true, tokensOut: true, costUsd: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: query.limit,
        }),
        prisma.chainRun.count({ where }),
      ])

      const data = runs.map((run) => {
        const tokensIn = run.steps.reduce((sum, s) => sum + s.tokensIn, 0)
        const tokensOut = run.steps.reduce((sum, s) => sum + s.tokensOut, 0)
        const costUsd = run.steps.reduce((sum, s) => sum + s.costUsd, 0)
        return {
          id: run.id,
          chainId: run.chainId,
          workspaceId: run.workspaceId,
          status: run.status,
          initialMessage: run.initialMessage,
          totalSteps: run.totalSteps,
          stepCount: run.steps.length,
          tokensIn,
          tokensOut,
          costUsd,
          createdAt: run.createdAt,
          completedAt: run.completedAt,
        }
      })

      reply.status(200).send({
        success: true,
        data,
        meta: { total, page: query.page, limit: query.limit },
      })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Fetch a single run with its steps and full event transcript, enriched with
  // agent display names so the UI can replay the execution log faithfully.
  app.get<{ Params: { chainId: string } }>('/api/runs/:chainId', async (req, reply) => {
    try {
      const run = await prisma.chainRun.findUnique({
        where: { chainId: req.params.chainId },
        include: {
          steps: { orderBy: { stepIndex: 'asc' } },
          events: { orderBy: { seq: 'asc' } },
        },
      })
      if (!run) throw new NotFoundError('Run', req.params.chainId)

      // Resolve agent names once (agentId is a plain string, not a relation).
      const agentIds = [
        ...new Set([
          ...run.steps.map((s) => s.agentId),
          ...run.events.map((e) => e.agentId).filter((id): id is string => !!id),
        ]),
      ]
      const agents = agentIds.length
        ? await prisma.agent.findMany({
            where: { id: { in: agentIds } },
            select: { id: true, name: true, model: true },
          })
        : []
      const nameById = new Map(agents.map((a) => [a.id, a.name]))
      const modelById = new Map(agents.map((a) => [a.id, a.model]))

      const data = {
        id: run.id,
        chainId: run.chainId,
        workspaceId: run.workspaceId,
        status: run.status,
        initialMessage: run.initialMessage,
        totalSteps: run.totalSteps,
        createdAt: run.createdAt,
        completedAt: run.completedAt,
        steps: run.steps.map((s) => ({
          stepIndex: s.stepIndex,
          agentId: s.agentId,
          agentName: s.agentName ?? nameById.get(s.agentId) ?? null,
          model: modelById.get(s.agentId) ?? null,
          output: s.output,
          tokensIn: s.tokensIn,
          tokensOut: s.tokensOut,
          costUsd: s.costUsd,
          status: s.status,
          startedAt: s.startedAt,
          completedAt: s.completedAt,
        })),
        events: run.events.map((e) => ({
          seq: e.seq,
          type: e.type,
          stepIndex: e.stepIndex,
          agentId: e.agentId,
          agentName: e.agentName ?? (e.agentId ? nameById.get(e.agentId) ?? null : null),
          payload: e.payload,
          createdAt: e.createdAt,
        })),
      }

      sendSuccess(reply, data)
    } catch (error) {
      sendError(reply, error)
    }
  })
}
