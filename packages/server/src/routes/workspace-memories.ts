import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError, ValidationError } from '../lib/errors'

// UUID regex used to validate path params before DB calls (mirrors resources.ts).
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validateUUID(id: string, label: string): void {
  if (!UUID_REGEX.test(id)) {
    throw new ValidationError(`Invalid ${label}: "${id}"`)
  }
}

const CreateMemorySchema = z.object({
  key: z.string().min(1).max(255),
  value: z.string(),
  source: z.enum(['manual', 'auto', 'director']).default('manual'),
  pinned: z.boolean().default(false),
  importance: z.number().int().min(0).max(100).default(0),
})

const UpdateMemorySchema = z.object({
  value: z.string().optional(),
  source: z.enum(['manual', 'auto', 'director']).optional(),
  pinned: z.boolean().optional(),
  importance: z.number().int().min(0).max(100).optional(),
})

const PinMemorySchema = z.object({
  pinned: z.boolean(),
})

async function ensureWorkspace(workspaceId: string): Promise<void> {
  validateUUID(workspaceId, 'workspaceId')
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!workspace) throw new NotFoundError('Workspace', workspaceId)
}

export async function workspaceMemoryRoutes(app: FastifyInstance) {
  // ------------------------------------------------------------------
  // GET /api/workspaces/:workspaceId/memories  (?source= &pinned=)
  // ------------------------------------------------------------------
  app.get<{
    Params: { workspaceId: string }
    Querystring: { source?: string; pinned?: string }
  }>('/api/workspaces/:workspaceId/memories', async (req, reply) => {
    try {
      const { workspaceId } = req.params
      await ensureWorkspace(workspaceId)

      const where: {
        workspaceId: string
        scope: 'workspace'
        source?: 'manual' | 'auto' | 'director'
        pinned?: boolean
      } = { workspaceId, scope: 'workspace' }

      const validSources = ['manual', 'auto', 'director'] as const
      type SourceFilter = (typeof validSources)[number]
      if (req.query.source) {
        if (!validSources.includes(req.query.source as SourceFilter)) {
          throw new ValidationError(`Invalid source filter: "${req.query.source}"`)
        }
        where.source = req.query.source as SourceFilter
      }
      if (req.query.pinned === 'true') where.pinned = true

      const memories = await prisma.memory.findMany({
        where,
        orderBy: [{ pinned: 'desc' }, { importance: 'desc' }, { updatedAt: 'desc' }],
      })
      sendSuccess(reply, memories)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // ------------------------------------------------------------------
  // POST /api/workspaces/:workspaceId/memories  (upsert by key)
  // ------------------------------------------------------------------
  app.post<{ Params: { workspaceId: string } }>(
    '/api/workspaces/:workspaceId/memories',
    async (req, reply) => {
      try {
        const { workspaceId } = req.params
        await ensureWorkspace(workspaceId)
        const body = CreateMemorySchema.parse(req.body)

        const memory = await prisma.memory.upsert({
          where: { workspaceId_key: { workspaceId, key: body.key } },
          create: {
            workspaceId,
            scope: 'workspace',
            source: body.source,
            key: body.key,
            value: body.value,
            pinned: body.pinned,
            importance: body.importance,
          },
          update: {
            value: body.value,
            source: body.source,
            pinned: body.pinned,
            importance: body.importance,
          },
        })
        sendSuccess(reply, memory, 201)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // ------------------------------------------------------------------
  // PATCH /api/workspaces/:workspaceId/memories/:id  (partial)
  // ------------------------------------------------------------------
  app.patch<{ Params: { workspaceId: string; id: string } }>(
    '/api/workspaces/:workspaceId/memories/:id',
    async (req, reply) => {
      try {
        const { workspaceId, id } = req.params
        validateUUID(workspaceId, 'workspaceId')
        validateUUID(id, 'memory id')

        const existing = await prisma.memory.findFirst({ where: { id, workspaceId } })
        if (!existing) throw new NotFoundError('Memory', id)

        const body = UpdateMemorySchema.parse(req.body)
        const updated = await prisma.memory.update({
          where: { id },
          data: {
            ...(body.value !== undefined && { value: body.value }),
            ...(body.source !== undefined && { source: body.source }),
            ...(body.pinned !== undefined && { pinned: body.pinned }),
            ...(body.importance !== undefined && { importance: body.importance }),
          },
        })
        sendSuccess(reply, updated)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // ------------------------------------------------------------------
  // PATCH /api/workspaces/:workspaceId/memories/:id/pin
  // ------------------------------------------------------------------
  app.patch<{ Params: { workspaceId: string; id: string } }>(
    '/api/workspaces/:workspaceId/memories/:id/pin',
    async (req, reply) => {
      try {
        const { workspaceId, id } = req.params
        validateUUID(workspaceId, 'workspaceId')
        validateUUID(id, 'memory id')

        const existing = await prisma.memory.findFirst({ where: { id, workspaceId } })
        if (!existing) throw new NotFoundError('Memory', id)

        const body = PinMemorySchema.parse(req.body)
        const updated = await prisma.memory.update({
          where: { id },
          data: { pinned: body.pinned },
        })
        sendSuccess(reply, updated)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // ------------------------------------------------------------------
  // DELETE /api/workspaces/:workspaceId/memories/:id
  // ------------------------------------------------------------------
  app.delete<{ Params: { workspaceId: string; id: string } }>(
    '/api/workspaces/:workspaceId/memories/:id',
    async (req, reply) => {
      try {
        const { workspaceId, id } = req.params
        validateUUID(workspaceId, 'workspaceId')
        validateUUID(id, 'memory id')

        const existing = await prisma.memory.findFirst({ where: { id, workspaceId } })
        if (!existing) throw new NotFoundError('Memory', id)

        await prisma.memory.delete({ where: { id } })
        sendSuccess(reply, { id })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
