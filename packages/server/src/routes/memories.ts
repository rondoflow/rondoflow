import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError } from '../lib/errors'

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

export async function memoryRoutes(app: FastifyInstance) {
  // List memories for an agent (pinned + important first).
  app.get<{ Params: { agentId: string } }>('/api/agents/:agentId/memories', async (req, reply) => {
    try {
      const memories = await prisma.memory.findMany({
        where: { agentId: req.params.agentId },
        orderBy: [{ pinned: 'desc' }, { importance: 'desc' }, { key: 'asc' }],
      })
      sendSuccess(reply, memories)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Create (or upsert by key) an agent memory.
  app.post<{ Params: { agentId: string } }>('/api/agents/:agentId/memories', async (req, reply) => {
    try {
      const body = CreateMemorySchema.parse(req.body)
      const agent = await prisma.agent.findUnique({ where: { id: req.params.agentId } })
      if (!agent) throw new NotFoundError('Agent', req.params.agentId)

      const memory = await prisma.memory.upsert({
        where: {
          agentId_key: {
            agentId: req.params.agentId,
            key: body.key,
          },
        },
        create: {
          agentId: req.params.agentId,
          scope: 'agent',
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
  })

  // Update a memory (partial).
  app.patch<{ Params: { agentId: string; memoryId: string } }>(
    '/api/agents/:agentId/memories/:memoryId',
    async (req, reply) => {
      try {
        const body = UpdateMemorySchema.parse(req.body)
        const existing = await prisma.memory.findFirst({
          where: { id: req.params.memoryId, agentId: req.params.agentId },
        })
        if (!existing) throw new NotFoundError('Memory', req.params.memoryId)

        const memory = await prisma.memory.update({
          where: { id: req.params.memoryId },
          data: {
            ...(body.value !== undefined && { value: body.value }),
            ...(body.source !== undefined && { source: body.source }),
            ...(body.pinned !== undefined && { pinned: body.pinned }),
            ...(body.importance !== undefined && { importance: body.importance }),
          },
        })
        sendSuccess(reply, memory)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Pin / unpin a memory.
  app.patch<{ Params: { agentId: string; memoryId: string } }>(
    '/api/agents/:agentId/memories/:memoryId/pin',
    async (req, reply) => {
      try {
        const body = PinMemorySchema.parse(req.body)
        const existing = await prisma.memory.findFirst({
          where: { id: req.params.memoryId, agentId: req.params.agentId },
        })
        if (!existing) throw new NotFoundError('Memory', req.params.memoryId)

        const memory = await prisma.memory.update({
          where: { id: req.params.memoryId },
          data: { pinned: body.pinned },
        })
        sendSuccess(reply, memory)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Delete a memory
  app.delete<{ Params: { agentId: string; memoryId: string } }>(
    '/api/agents/:agentId/memories/:memoryId',
    async (req, reply) => {
      try {
        const existing = await prisma.memory.findFirst({
          where: { id: req.params.memoryId, agentId: req.params.agentId },
        })
        if (!existing) throw new NotFoundError('Memory', req.params.memoryId)

        await prisma.memory.delete({ where: { id: req.params.memoryId } })
        sendSuccess(reply, { deleted: true })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
