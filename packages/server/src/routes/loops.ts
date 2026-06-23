// Loop, Chain, and PRD routes
// Manages lifecycle of LoopEngine, ChainExecutor, and PrdPipelineEngine instances.

import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError, ValidationError } from '../lib/errors'
import { LoopEngine } from '../engine/loop-engine'
import { ChainExecutor, validateNoCycles } from '../engine/chain-executor'
import type { ChainDefinition } from '../engine/chain-executor'
import { PrdPipelineEngine } from '../engine/prd-pipeline'

// ------------------------------------------------------------------
// In-memory registries for active engines
// ------------------------------------------------------------------

export const activeLoops = new Map<string, LoopEngine>()
export const activeChains = new Map<string, ChainExecutor>()
export const activePipelines = new Map<string, PrdPipelineEngine>()

// ------------------------------------------------------------------
// Validation schemas
// ------------------------------------------------------------------

const StartLoopBodySchema = z.object({
  message: z.string().min(1, 'message is required'),
})

const ChainStepSchema = z.object({
  agentId: z.string().min(1),
  config: z.record(z.unknown()).optional(),
  conditions: z
    .array(
      z.object({
        pattern: z.string(),
        targetStepIndex: z.number().int().min(0),
      }),
    )
    .optional(),
})

const ChainEdgeSchema = z.object({
  from: z.number().int().min(0),
  to: z.number().int().min(0),
  condition: z.string().optional(),
})

const ExecuteChainBodySchema = z.object({
  chainId: z.string().optional(),
  steps: z.array(ChainStepSchema).min(1, 'At least one step is required'),
  edges: z.array(ChainEdgeSchema).default([]),
  initialMessage: z.string().min(1, 'initialMessage is required'),
})

const StopChainBodySchema = z.object({
  chainId: z.string().min(1),
})

const CreatePrdBodySchema = z.object({
  title: z.string().min(1).max(200),
})

const AddStoryBodySchema = z.object({
  title: z.string().min(1).max(200),
  acceptanceCriteria: z.string().min(1),
  priority: z.number().int().min(0).default(0),
})

const UpdateStoryBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  acceptanceCriteria: z.string().min(1).optional(),
  priority: z.number().int().min(0).optional(),
  status: z.enum(['pending', 'in_progress', 'passed', 'failed']).optional(),
})

const StartPipelineBodySchema = z.object({
  agentId: z.string().min(1, 'agentId is required'),
})

const ManualApprovalBodySchema = z.object({
  loopId: z.string().min(1),
  approved: z.boolean(),
})

// ------------------------------------------------------------------
// Route plugin
// ------------------------------------------------------------------

export async function loopRoutes(app: FastifyInstance): Promise<void> {

  // ----------------------------------------------------------------
  // Loop routes
  // ----------------------------------------------------------------

  app.post<{ Params: { id: string } }>(
    '/api/agents/:id/loop/start',
    async (req, reply) => {
      try {
        const { id: agentId } = req.params
        const body = StartLoopBodySchema.parse(req.body)

        const agent = await prisma.agent.findUnique({ where: { id: agentId } })
        if (!agent) throw new NotFoundError('Agent', agentId)

        if (!agent.loopEnabled) {
          throw new ValidationError(`Agent '${agentId}' does not have loopEnabled=true`)
        }

        if (activeLoops.has(agentId)) {
          throw new ValidationError(`Agent '${agentId}' already has a running loop`)
        }

        const engine = new LoopEngine(agentId)

        // Forward loop events as notifications (handled by socket layer later)
        engine.on('iteration', (data) => {
          app.log.info({ agentId, ...data }, 'loop:iteration')
        })

        engine.on('progress', (data) => {
          app.log.info({ agentId, ...data }, 'loop:progress')
        })

        engine.on('completed', (data) => {
          activeLoops.delete(agentId)
          app.log.info({ agentId, ...data }, 'loop:completed')
        })

        engine.on('failed', (data) => {
          activeLoops.delete(agentId)
          app.log.warn({ agentId, ...data }, 'loop:failed')
        })

        activeLoops.set(agentId, engine)

        // Fire-and-forget; errors are handled via the 'failed' event
        engine.start(body.message).catch((err: unknown) => {
          activeLoops.delete(agentId)
          app.log.error({ agentId, err }, 'loop engine threw unexpectedly')
        })

        sendSuccess(reply, { agentId, status: 'started' }, 202)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  app.post<{ Params: { id: string } }>(
    '/api/agents/:id/loop/stop',
    async (req, reply) => {
      try {
        const { id: agentId } = req.params
        const engine = activeLoops.get(agentId)
        if (!engine) {
          throw new ValidationError(`No active loop for agent '${agentId}'`)
        }
        engine.stop()
        activeLoops.delete(agentId)
        sendSuccess(reply, { agentId, status: 'stopped' })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  app.get<{ Params: { id: string } }>(
    '/api/agents/:id/loop/status',
    async (req, reply) => {
      try {
        const { id: agentId } = req.params
        const engine = activeLoops.get(agentId)
        if (!engine) {
          sendSuccess(reply, { agentId, active: false, state: null })
          return
        }
        sendSuccess(reply, { agentId, active: true, state: engine.getState() })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Manual approval endpoint for loops with criteria.type === 'manual'
  app.post<{ Params: { id: string } }>(
    '/api/agents/:id/loop/approve',
    async (req, reply) => {
      try {
        const { id: agentId } = req.params
        const body = ManualApprovalBodySchema.parse(req.body)
        const engine = activeLoops.get(agentId)
        if (!engine) {
          throw new ValidationError(`No active loop for agent '${agentId}'`)
        }
        engine.resolveManualApproval(body.loopId, body.approved)
        sendSuccess(reply, { resolved: true })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // ----------------------------------------------------------------
  // Chain routes
  // ----------------------------------------------------------------

  app.post('/api/chains/execute', async (req, reply) => {
    try {
      const body = ExecuteChainBodySchema.parse(req.body)
      const chainId = body.chainId ?? generateChainId()

      if (activeChains.has(chainId)) {
        throw new ValidationError(`Chain '${chainId}' is already running`)
      }

      const chainDef: ChainDefinition = {
        steps: body.steps,
        edges: body.edges,
      }

      // Validate for cycles before accepting the request
      validateNoCycles(chainDef)

      const executor = new ChainExecutor()
      activeChains.set(chainId, executor)

      executor.on('step_start', (data) => {
        app.log.info({ chainId, ...data }, 'chain:step_start')
      })

      executor.on('step_complete', (data) => {
        app.log.info({ chainId, stepIndex: data.stepIndex, agentId: data.agentId }, 'chain:step_complete')
      })

      executor.on('chain_complete', (data) => {
        activeChains.delete(chainId)
        app.log.info({ chainId, stepCount: data.outputs.size }, 'chain:completed')
      })

      executor.on('error', (data) => {
        app.log.warn({ chainId, ...data }, 'chain:step_error')
      })

      // Automated loop runs have no human to approve tools, so run them in
      // 'auto' mode with bypassPermissions — otherwise headless tools like
      // WebSearch would be denied ("requires permission approval").
      executor.execute(chainDef, body.initialMessage, {
        approvalMode: 'auto',
        permissionMode: 'bypassPermissions',
      }).catch((err: unknown) => {
        activeChains.delete(chainId)
        app.log.error({ chainId, err }, 'chain executor threw unexpectedly')
      })

      sendSuccess(reply, { chainId, status: 'started', stepCount: body.steps.length }, 202)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/chains/stop', async (req, reply) => {
    try {
      const body = StopChainBodySchema.parse(req.body)
      const executor = activeChains.get(body.chainId)
      if (!executor) {
        throw new ValidationError(`No active chain '${body.chainId}'`)
      }
      executor.stop()
      activeChains.delete(body.chainId)
      sendSuccess(reply, { chainId: body.chainId, status: 'stopped' })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // ----------------------------------------------------------------
  // PRD routes
  // ----------------------------------------------------------------

  app.post('/api/prds', async (req, reply) => {
    try {
      const body = CreatePrdBodySchema.parse(req.body)
      const prd = await prisma.pRD.create({ data: { title: body.title } })
      sendSuccess(reply, prd, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get('/api/prds', async (_req, reply) => {
    try {
      const prds = await prisma.pRD.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { stories: true } },
        },
      })
      sendSuccess(reply, prds)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get<{ Params: { id: string } }>('/api/prds/:id', async (req, reply) => {
    try {
      const prd = await prisma.pRD.findUnique({
        where: { id: req.params.id },
        include: {
          stories: { orderBy: { priority: 'asc' } },
        },
      })
      if (!prd) throw new NotFoundError('PRD', req.params.id)
      sendSuccess(reply, prd)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post<{ Params: { id: string } }>('/api/prds/:id/stories', async (req, reply) => {
    try {
      const prd = await prisma.pRD.findUnique({ where: { id: req.params.id } })
      if (!prd) throw new NotFoundError('PRD', req.params.id)

      const body = AddStoryBodySchema.parse(req.body)
      const story = await prisma.story.create({
        data: {
          prdId: req.params.id,
          title: body.title,
          acceptanceCriteria: body.acceptanceCriteria,
          priority: body.priority,
        },
      })
      sendSuccess(reply, story, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.patch<{ Params: { prdId: string; storyId: string } }>(
    '/api/prds/:prdId/stories/:storyId',
    async (req, reply) => {
      try {
        const story = await prisma.story.findFirst({
          where: { id: req.params.storyId, prdId: req.params.prdId },
        })
        if (!story) throw new NotFoundError('Story', req.params.storyId)

        const body = UpdateStoryBodySchema.parse(req.body)
        const updated = await prisma.story.update({
          where: { id: req.params.storyId },
          data: body,
        })
        sendSuccess(reply, updated)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  app.post<{ Params: { id: string } }>(
    '/api/prds/:id/pipeline/start',
    async (req, reply) => {
      try {
        const { id: prdId } = req.params
        const body = StartPipelineBodySchema.parse(req.body)

        const prd = await prisma.pRD.findUnique({ where: { id: prdId } })
        if (!prd) throw new NotFoundError('PRD', prdId)

        const agent = await prisma.agent.findUnique({ where: { id: body.agentId } })
        if (!agent) throw new NotFoundError('Agent', body.agentId)

        if (activePipelines.has(prdId)) {
          throw new ValidationError(`PRD '${prdId}' already has a running pipeline`)
        }

        const engine = new PrdPipelineEngine()
        activePipelines.set(prdId, engine)

        engine.on('story_start', (data) => {
          app.log.info({ prdId, ...data }, 'pipeline:story_start')
        })

        engine.on('story_complete', (data) => {
          app.log.info({ prdId, ...data }, 'pipeline:story_complete')
        })

        engine.on('progress', (data) => {
          app.log.info({ prdId, learning: data.learning }, 'pipeline:progress')
        })

        engine.on('pipeline_complete', (data) => {
          activePipelines.delete(prdId)
          app.log.info({ prdId, ...data }, 'pipeline:completed')
        })

        engine.start(prdId, body.agentId).catch((err: unknown) => {
          activePipelines.delete(prdId)
          app.log.error({ prdId, err }, 'pipeline engine threw unexpectedly')
        })

        sendSuccess(reply, { prdId, agentId: body.agentId, status: 'started' }, 202)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  app.post<{ Params: { id: string } }>(
    '/api/prds/:id/pipeline/stop',
    async (req, reply) => {
      try {
        const { id: prdId } = req.params
        const engine = activePipelines.get(prdId)
        if (!engine) {
          throw new ValidationError(`No active pipeline for PRD '${prdId}'`)
        }
        engine.stop()
        activePipelines.delete(prdId)
        sendSuccess(reply, { prdId, status: 'stopped' })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function generateChainId(): string {
  return `chain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
