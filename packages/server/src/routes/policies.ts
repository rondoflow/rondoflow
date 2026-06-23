import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError } from '../lib/errors'

const CreatePolicySchema = z.object({
  name: z.string().min(1).max(100),
  level: z.enum(['global', 'agent', 'session']),
  rules: z.record(z.unknown()),
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
})

const UpdatePolicySchema = CreatePolicySchema.partial()

const PolicyQuerySchema = z.object({
  level: z.enum(['global', 'agent', 'session']).optional(),
  agentId: z.string().optional(),
})

export async function policyRoutes(app: FastifyInstance) {
  app.get('/api/policies', async (req, reply) => {
    try {
      const query = PolicyQuerySchema.parse(req.query)
      const policies = await prisma.policy.findMany({
        where: {
          ...(query.level !== undefined && { level: query.level }),
          ...(query.agentId !== undefined && { agentId: query.agentId }),
        },
        orderBy: { createdAt: 'desc' },
      })
      sendSuccess(reply, policies)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get<{ Params: { id: string } }>('/api/policies/:id', async (req, reply) => {
    try {
      const policy = await prisma.policy.findUnique({
        where: { id: req.params.id },
        include: { agent: true, session: true },
      })
      if (!policy) throw new NotFoundError('Policy', req.params.id)
      sendSuccess(reply, policy)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/policies', async (req, reply) => {
    try {
      const body = CreatePolicySchema.parse(req.body)
      const policy = await prisma.policy.create({ data: { ...body, rules: body.rules as any } })
      sendSuccess(reply, policy, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.patch<{ Params: { id: string } }>('/api/policies/:id', async (req, reply) => {
    try {
      const body = UpdatePolicySchema.parse(req.body)
      const existing = await prisma.policy.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('Policy', req.params.id)
      const policy = await prisma.policy.update({
        where: { id: req.params.id },
        data: { ...body, rules: body.rules as any },
      })
      sendSuccess(reply, policy)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.delete<{ Params: { id: string } }>('/api/policies/:id', async (req, reply) => {
    try {
      const existing = await prisma.policy.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('Policy', req.params.id)
      await prisma.policy.delete({ where: { id: req.params.id } })
      sendSuccess(reply, { deleted: true })
    } catch (error) {
      sendError(reply, error)
    }
  })
}
