import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import type { Scheduler } from '../engine/scheduler'

const CreateScheduleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).default(''),
  type: z.enum(['workflow', 'agent']),
  targetId: z.string().uuid(),
  message: z.string().max(5000).default(''),
  schedule: z.string().min(1).max(100),
  timezone: z.string().max(100).default('UTC'),
  directorEnabled: z.boolean().default(false),
})

const UpdateScheduleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  message: z.string().max(5000).optional(),
  schedule: z.string().min(1).max(100).optional(),
  timezone: z.string().max(100).optional(),
  enabled: z.boolean().optional(),
  directorEnabled: z.boolean().optional(),
})

export function scheduleRoutes(scheduler: Scheduler) {
  return async function (app: FastifyInstance) {
    // List all schedules
    app.get('/api/schedules', async (_request, reply) => {
      const schedules = await prisma.scheduledTask.findMany({
        orderBy: { createdAt: 'desc' },
      })
      return reply.send({ success: true, data: schedules })
    })

    // Create a new schedule
    app.post('/api/schedules', async (request, reply) => {
      const parsed = CreateScheduleSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid input',
        })
      }

      const task = await prisma.scheduledTask.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          type: parsed.data.type,
          targetId: parsed.data.targetId,
          message: parsed.data.message,
          schedule: parsed.data.schedule,
          timezone: parsed.data.timezone,
          directorEnabled: parsed.data.directorEnabled,
          enabled: true,
        },
      })

      // Start the cron job
      scheduler.scheduleTask(task.id, task.schedule, task.timezone)

      return reply.status(201).send({ success: true, data: task })
    })

    // Update a schedule
    app.patch('/api/schedules/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      const parsed = UpdateScheduleSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid input',
        })
      }

      try {
        const updated = await prisma.scheduledTask.update({
          where: { id },
          data: parsed.data,
        })

        // Re-schedule or unschedule based on enabled state
        if (updated.enabled) {
          scheduler.scheduleTask(updated.id, updated.schedule, updated.timezone)
        } else {
          scheduler.unscheduleTask(updated.id)
        }

        return reply.send({ success: true, data: updated })
      } catch {
        return reply.status(404).send({ success: false, error: 'Schedule not found' })
      }
    })

    // Delete a schedule
    app.delete('/api/schedules/:id', async (request, reply) => {
      const { id } = request.params as { id: string }

      try {
        scheduler.unscheduleTask(id)
        await prisma.scheduledTask.delete({ where: { id } })
        return reply.send({ success: true })
      } catch {
        return reply.status(404).send({ success: false, error: 'Schedule not found' })
      }
    })

    // Run a schedule immediately
    app.post('/api/schedules/:id/run-now', async (request, reply) => {
      const { id } = request.params as { id: string }

      const task = await prisma.scheduledTask.findUnique({ where: { id } })
      if (!task) {
        return reply.status(404).send({ success: false, error: 'Schedule not found' })
      }

      // Execute async — don't block the response
      void scheduler.executeTask(id)

      return reply.send({ success: true, data: { message: 'Execution started' } })
    })
  }
}
