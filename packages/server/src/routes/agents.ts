import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError } from '../lib/errors'
import { recordActivity } from '../services/activity'

const OpenAIProviderConfigSchema = z.object({
  model: z.string().min(1),
  webSearch: z.boolean().default(false),
  deepResearch: z.boolean().default(false),
  deepResearchModel: z.string().optional(),
})

const AgentBaseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  persona: z.string().min(1),
  description: z.string().optional(),
  avatar: z.string().optional(),
  purpose: z.string().optional(),
  scope: z.array(z.string()).default([]),
  allowedTools: z.array(z.string()).default([]),
  memoryEnabled: z.boolean().default(false),
  model: z.string().optional(),
  provider: z.enum(['claude-code', 'openai', 'perplexity']).default('claude-code'),
  providerConfig: OpenAIProviderConfigSchema.optional(),
  permissionMode: z.enum(['plan', 'default', 'edit', 'full']).default('default'),
  isFacilitator: z.boolean().default(false),
})

// API-backed agents (OpenAI, Perplexity) must carry their provider config
// (chat model + tool toggles).
const requireProviderConfig = (
  val: { provider?: string; providerConfig?: unknown },
  ctx: z.RefinementCtx,
): void => {
  if ((val.provider === 'openai' || val.provider === 'perplexity') && !val.providerConfig) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['providerConfig'],
      message: `providerConfig is required when provider is "${val.provider}"`,
    })
  }
}

const CreateAgentSchema = AgentBaseSchema.superRefine(requireProviderConfig)

const UpdateAgentSchema = AgentBaseSchema.partial().extend({
  isFavorite: z.boolean().optional(),
  isFacilitator: z.boolean().optional(),
})

export async function agentRoutes(app: FastifyInstance) {
  app.get('/api/agents', async (req, reply) => {
    try {
      const query = req.query as Record<string, string | undefined>
      const facilitatorFilter = query.facilitator === 'true' ? true : undefined

      // Shared team pool — all authenticated users see every agent.
      const where: Record<string, unknown> = {}
      if (facilitatorFilter !== undefined) {
        where.isFacilitator = facilitatorFilter
      }

      const agents = await prisma.agent.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: {
          skills: { include: { skill: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      sendSuccess(reply, agents)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get<{ Params: { id: string } }>('/api/agents/:id', async (req, reply) => {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: req.params.id },
        include: {
          skills: { include: { skill: true } },
          policies: true,
          memories: true,
          externalFolders: { include: { externalFolder: true } },
        },
      })
      if (!agent) throw new NotFoundError('Agent', req.params.id)
      sendSuccess(reply, agent)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/agents', async (req, reply) => {
    try {
      const body = CreateAgentSchema.parse(req.body)
      const agent = await prisma.agent.create({
        data: { ...body, userId: req.user?.id },
      })
      void recordActivity({
        userId: req.user?.id,
        agentId: agent.id,
        type: 'agent_created',
        title: `Created assistant “${agent.name}”`,
        detail: agent.purpose ? `Purpose: ${agent.purpose}` : undefined,
      })
      sendSuccess(reply, agent, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.patch<{ Params: { id: string } }>('/api/agents/:id', async (req, reply) => {
    try {
      const raw = req.body as Record<string, unknown>
      const body = UpdateAgentSchema.parse(raw)

      // Validate and pass through additional known fields
      const ExtraFieldsSchema = z.object({
        status: z.enum(['idle', 'running', 'error', 'waiting_approval']).optional(),
        canvasX: z.number().optional(),
        canvasY: z.number().optional(),
        loopEnabled: z.boolean().optional(),
        loopCriteria: z.union([
          z.object({ type: z.literal('max_iterations'), value: z.string().max(200) }),
          z.object({ type: z.literal('regex'), value: z.string().max(500) }),
          z.object({ type: z.literal('test_pass'), value: z.string().regex(/^[\w .\/\-]+$/).max(200) }),
          z.object({ type: z.literal('manual'), value: z.string().max(200) }),
        ]).nullable().optional(),
        maxIterations: z.number().int().min(1).max(100).optional(),
        teamEnabled: z.boolean().optional(),
      }).partial()
      const extra = ExtraFieldsSchema.parse(raw)
      const data: Record<string, unknown> = { ...body, ...extra }

      const existing = await prisma.agent.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('Agent', req.params.id)
      const agent = await prisma.agent.update({
        where: { id: req.params.id },
        data,
      })
      sendSuccess(reply, agent)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.delete<{ Params: { id: string } }>('/api/agents/:id', async (req, reply) => {
    try {
      const existing = await prisma.agent.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('Agent', req.params.id)
      await prisma.agent.delete({ where: { id: req.params.id } })
      void recordActivity({
        userId: req.user?.id,
        agentId: existing.id,
        type: 'agent_deleted',
        title: `Deleted assistant “${existing.name}”`,
      })
      sendSuccess(reply, { deleted: true })
    } catch (error) {
      sendError(reply, error)
    }
  })
}
