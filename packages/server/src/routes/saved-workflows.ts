import type { FastifyInstance } from 'fastify'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const SaveBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).default(''),
  workflow: z.record(z.unknown()),
})

export async function savedWorkflowRoutes(app: FastifyInstance) {
  // List all saved workflows (newest first)
  app.get('/api/saved-workflows', async (_request, reply) => {
    const workflows = await prisma.savedWorkflow.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        workflow: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return reply.send({ success: true, data: workflows })
  })

  // Save a new workflow
  app.post('/api/saved-workflows', async (request, reply) => {
    const parsed = SaveBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid input',
      })
    }

    const saved = await prisma.savedWorkflow.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        workflow: parsed.data.workflow as Prisma.InputJsonValue,
      },
    })

    return reply.status(201).send({ success: true, data: saved })
  })

  // Delete a saved workflow
  app.delete('/api/saved-workflows/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await prisma.savedWorkflow.delete({ where: { id } })
      return reply.send({ success: true })
    } catch {
      return reply.status(404).send({ success: false, error: 'Workflow not found' })
    }
  })
}
