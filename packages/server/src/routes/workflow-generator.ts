import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { WorkflowGenerator } from '../engine/workflow-generator'

const GenerateBodySchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
})

export async function workflowGeneratorRoutes(app: FastifyInstance) {
  const generator = new WorkflowGenerator()

  // Each call spawns a Claude CLI subprocess that bills real money — cap it
  // well below the global limit.
  app.post('/api/workflows/generate', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const parsed = GenerateBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid input',
      })
    }

    try {
      const workflow = await generator.generate(parsed.data.description)
      return reply.send({ success: true, data: workflow })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Workflow generation failed'
      console.error('[WorkflowGenerator Route] ERROR:', message)
      return reply.status(500).send({ success: false, error: message })
    }
  })
}
