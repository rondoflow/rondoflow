import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError } from '../lib/errors'

const SessionQuerySchema = z.object({
  agentId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export async function sessionRoutes(app: FastifyInstance) {
  app.get('/api/sessions', async (req, reply) => {
    try {
      const query = SessionQuerySchema.parse(req.query)
      const skip = (query.page - 1) * query.limit

      const [sessions, total] = await Promise.all([
        prisma.agentSession.findMany({
          where: {
            ...(query.agentId !== undefined && { agentId: query.agentId }),
          },
          include: {
            agent: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { startedAt: 'desc' },
          skip,
          take: query.limit,
        }),
        prisma.agentSession.count({
          where: {
            ...(query.agentId !== undefined && { agentId: query.agentId }),
          },
        }),
      ])

      reply.status(200).send({
        success: true,
        data: sessions,
        meta: {
          total,
          page: query.page,
          limit: query.limit,
        },
      })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get<{ Params: { id: string } }>('/api/sessions/:id', async (req, reply) => {
    try {
      const session = await prisma.agentSession.findUnique({
        where: { id: req.params.id },
        include: {
          agent: { select: { id: true, name: true, avatar: true } },
          messages: {
            orderBy: { timestamp: 'asc' },
          },
          policies: true,
        },
      })
      if (!session) throw new NotFoundError('Session', req.params.id)
      sendSuccess(reply, session)
    } catch (error) {
      sendError(reply, error)
    }
  })
}
