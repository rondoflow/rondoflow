import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError, ValidationError } from '../lib/errors'
import { ModeratorEngine } from '../discussion/moderator'
import type { AgentRecord } from '../discussion/moderator'
import type { ParticipantRole, DiscussionFormat } from '@rondoflow/shared'
import { activeDiscussionEngines as activeEngines } from '../discussion/registry'

// Active discussion engines live in the shared discussion registry
// (imported above as `activeEngines`). The socket handler is the primary owner;
// these routes provide an HTTP control surface over the SAME engine instances.

const CreateDiscussionSchema = z.object({
  name: z.string().min(1).max(100),
  topic: z.string().min(1),
  format: z.enum(['brainstorm', 'review', 'deliberation']),
  moderatorId: z.string().min(1),
  maxRounds: z.number().int().min(1).default(5),
  participants: z
    .array(
      z.object({
        agentId: z.string().min(1),
        role: z.enum(['participant', 'observer', 'devil_advocate']).default('participant'),
      }),
    )
    .optional()
    .default([]),
})

const UpdateDiscussionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  topic: z.string().min(1).optional(),
  format: z.enum(['brainstorm', 'review', 'deliberation']).optional(),
  status: z.enum(['draft', 'active', 'concluded']).optional(),
  conclusion: z.string().optional(),
  maxRounds: z.number().int().min(1).optional(),
})

const AddParticipantSchema = z.object({
  agentId: z.string().min(1),
  role: z.enum(['participant', 'observer', 'devil_advocate']).default('participant'),
})

export async function discussionRoutes(app: FastifyInstance) {
  app.get('/api/discussions', async (_req, reply) => {
    try {
      const discussions = await prisma.discussionTable.findMany({
        include: {
          moderator: { select: { id: true, name: true, avatar: true } },
          participants: { include: { agent: { select: { id: true, name: true, avatar: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      })
      sendSuccess(reply, discussions)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get<{ Params: { id: string } }>('/api/discussions/:id', async (req, reply) => {
    try {
      const discussion = await prisma.discussionTable.findUnique({
        where: { id: req.params.id },
        include: {
          moderator: { select: { id: true, name: true, avatar: true } },
          participants: {
            include: { agent: { select: { id: true, name: true, avatar: true } } },
          },
          sessions: {
            orderBy: { startedAt: 'desc' },
            take: 10,
          },
        },
      })
      if (!discussion) throw new NotFoundError('Discussion', req.params.id)
      sendSuccess(reply, discussion)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/discussions', async (req, reply) => {
    try {
      const { participants, ...tableData } = CreateDiscussionSchema.parse(req.body)

      const moderator = await prisma.agent.findUnique({ where: { id: tableData.moderatorId } })
      if (!moderator) throw new NotFoundError('Agent', tableData.moderatorId)

      // Validate every participant agent exists before creating the table so the
      // nested create can't fail half-way with an opaque foreign-key error.
      if (participants.length > 0) {
        const ids = participants.map((p) => p.agentId)
        const found = await prisma.agent.findMany({ where: { id: { in: ids } }, select: { id: true } })
        const foundIds = new Set(found.map((a) => a.id))
        const missing = ids.filter((id) => !foundIds.has(id))
        if (missing.length > 0) {
          throw new NotFoundError('Agent', missing.join(', '))
        }
      }

      const discussion = await prisma.discussionTable.create({
        data: {
          ...tableData,
          participants:
            participants.length > 0
              ? { create: participants.map((p) => ({ agentId: p.agentId, role: p.role })) }
              : undefined,
        },
        include: {
          moderator: { select: { id: true, name: true, avatar: true } },
          participants: { include: { agent: { select: { id: true, name: true, avatar: true } } } },
        },
      })
      sendSuccess(reply, discussion, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.patch<{ Params: { id: string } }>('/api/discussions/:id', async (req, reply) => {
    try {
      const body = UpdateDiscussionSchema.parse(req.body)
      const existing = await prisma.discussionTable.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('Discussion', req.params.id)
      const discussion = await prisma.discussionTable.update({
        where: { id: req.params.id },
        data: body,
      })
      sendSuccess(reply, discussion)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.delete<{ Params: { id: string } }>('/api/discussions/:id', async (req, reply) => {
    try {
      const existing = await prisma.discussionTable.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('Discussion', req.params.id)
      await prisma.discussionTable.delete({ where: { id: req.params.id } })
      sendSuccess(reply, { deleted: true })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post<{ Params: { id: string } }>('/api/discussions/:id/participants', async (req, reply) => {
    try {
      const { id: tableId } = req.params
      const body = AddParticipantSchema.parse(req.body)

      const discussion = await prisma.discussionTable.findUnique({ where: { id: tableId } })
      if (!discussion) throw new NotFoundError('Discussion', tableId)

      const agent = await prisma.agent.findUnique({ where: { id: body.agentId } })
      if (!agent) throw new NotFoundError('Agent', body.agentId)

      const participant = await prisma.tableParticipant.upsert({
        where: { tableId_agentId: { tableId, agentId: body.agentId } },
        create: { tableId, agentId: body.agentId, role: body.role },
        update: { role: body.role },
        include: { agent: { select: { id: true, name: true, avatar: true } } },
      })
      sendSuccess(reply, participant, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.delete<{ Params: { id: string; agentId: string } }>(
    '/api/discussions/:id/participants/:agentId',
    async (req, reply) => {
      try {
        const { id: tableId, agentId } = req.params

        const existing = await prisma.tableParticipant.findUnique({
          where: { tableId_agentId: { tableId, agentId } },
        })
        if (!existing) {
          throw new NotFoundError(`Participant(table=${tableId}, agent=${agentId})`, '')
        }

        await prisma.tableParticipant.delete({
          where: { tableId_agentId: { tableId, agentId } },
        })
        sendSuccess(reply, { deleted: true })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  /**
   * PATCH /api/discussions/:id/moderator
   * Change the moderator of a draft discussion.
   */
  app.patch<{ Params: { id: string } }>('/api/discussions/:id/moderator', async (req, reply) => {
    try {
      const { id: tableId } = req.params
      const body = z.object({ moderatorId: z.string().min(1) }).parse(req.body)

      const discussion = await prisma.discussionTable.findUnique({ where: { id: tableId } })
      if (!discussion) throw new NotFoundError('Discussion', tableId)

      if (discussion.status !== 'draft') {
        throw new ValidationError('Can only change moderator of a draft discussion')
      }

      const moderator = await prisma.agent.findUnique({ where: { id: body.moderatorId } })
      if (!moderator) throw new NotFoundError('Agent', body.moderatorId)

      const updated = await prisma.discussionTable.update({
        where: { id: tableId },
        data: { moderatorId: body.moderatorId },
        include: {
          moderator: { select: { id: true, name: true, avatar: true } },
        },
      })
      sendSuccess(reply, updated)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // ------------------------------------------------------------------
  // Discussion engine control endpoints
  // ------------------------------------------------------------------

  /**
   * POST /api/discussions/:id/start
   * Start a discussion. Creates a ModeratorEngine and begins the discussion loop.
   * The engine emits events via Socket.IO; this endpoint just initiates it.
   */
  app.post<{ Params: { id: string } }>('/api/discussions/:id/start', async (req, reply) => {
    try {
      const { id: tableId } = req.params

      if (activeEngines.has(tableId)) {
        throw new ValidationError('Discussion is already running')
      }

      const table = await prisma.discussionTable.findUnique({
        where: { id: tableId },
        include: {
          moderator: true,
          participants: { include: { agent: true } },
        },
      })
      if (!table) throw new NotFoundError('Discussion', tableId)

      if (table.status === 'concluded') {
        throw new ValidationError('Discussion has already concluded')
      }

      if (table.participants.length === 0) {
        throw new ValidationError('Cannot start discussion: no participants added')
      }

      const participantsWithRoles = (table.participants as Array<{ agent: AgentRecord; role: string }>).map((p) => ({
        agent: p.agent,
        role: p.role as ParticipantRole,
      }))

      const engine = new ModeratorEngine(
        tableId,
        table.topic,
        table.format as DiscussionFormat,
        table.moderator as AgentRecord,
        participantsWithRoles,
        table.maxRounds,
      )

      engine.on('concluded', () => {
        activeEngines.delete(tableId)
      })

      engine.on('error', () => {
        activeEngines.delete(tableId)
      })

      activeEngines.set(tableId, engine)

      // Fire-and-forget — the discussion runs asynchronously
      engine.start().catch(() => {
        activeEngines.delete(tableId)
      })

      sendSuccess(reply, { started: true, tableId })
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * POST /api/discussions/:id/pause
   * Pause a running discussion after the current turn completes.
   */
  app.post<{ Params: { id: string } }>('/api/discussions/:id/pause', async (req, reply) => {
    try {
      const { id: tableId } = req.params

      const engine = activeEngines.get(tableId)
      if (!engine) {
        throw new ValidationError('Discussion is not currently running')
      }

      engine.pause()
      sendSuccess(reply, { paused: true, tableId })
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * POST /api/discussions/:id/resume
   * Resume a paused discussion.
   */
  app.post<{ Params: { id: string } }>('/api/discussions/:id/resume', async (req, reply) => {
    try {
      const { id: tableId } = req.params

      const engine = activeEngines.get(tableId)
      if (!engine) {
        throw new ValidationError('Discussion is not currently running or has not been started via this server instance')
      }

      await engine.resume()
      sendSuccess(reply, { resumed: true, tableId })
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * GET /api/discussions/:id/transcript
   * Return the full message transcript for the most recent session of this discussion.
   */
  app.get<{ Params: { id: string } }>('/api/discussions/:id/transcript', async (req, reply) => {
    try {
      const { id: tableId } = req.params

      const table = await prisma.discussionTable.findUnique({
        where: { id: tableId },
      })
      if (!table) throw new NotFoundError('Discussion', tableId)

      // Find the most recent session for this table
      const session = await prisma.agentSession.findFirst({
        where: { tableId },
        orderBy: { startedAt: 'desc' },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            select: {
              id: true,
              role: true,
              content: true,
              timestamp: true,
              tokenCount: true,
            },
          },
        },
      })

      sendSuccess(reply, {
        tableId,
        topic: table.topic,
        status: table.status,
        conclusion: table.conclusion,
        session: session
          ? {
              id: session.id,
              startedAt: session.startedAt,
              endedAt: session.endedAt,
              messages: session.messages,
            }
          : null,
      })
    } catch (error) {
      sendError(reply, error)
    }
  })
}
