import { FastifyInstance } from 'fastify'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/errors'

const FilterSchema = z.object({
  workspaceId: z.string().optional(),
  agentId: z.string().optional(),
  type: z.string().optional(),
  search: z.string().trim().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})

const QuerySchema = FilterSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})

type Filters = z.infer<typeof FilterSchema>

/**
 * Build the Prisma `where` clause shared by list, export, and type-count queries.
 * Shared team pool — the audit log is team-wide (each event still carries its
 * own userId for the "who" attribution column); it is not filtered by caller.
 */
function buildWhere(filters: Filters): Prisma.ActivityEventWhereInput {
  const where: Prisma.ActivityEventWhereInput = {}
  if (filters.workspaceId) where.workspaceId = filters.workspaceId
  if (filters.agentId) where.agentId = filters.agentId
  if (filters.type) where.type = filters.type
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { detail: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: filters.from } : {}),
      ...(filters.to ? { lte: filters.to } : {}),
    }
  }
  return where
}

/**
 * RFC-4180 CSV field escaping with spreadsheet formula-injection guarding.
 * Audit values include user-controlled text (e.g. assistant names, commands),
 * so cells beginning with a formula trigger are prefixed with a quote to keep
 * Excel/Sheets from evaluating them.
 */
function csvField(value: unknown): string {
  let str = value === null || value === undefined ? '' : String(value)
  // Neutralise formula triggers, including those hidden behind leading whitespace.
  if (/^[=+\-@\t\r]/.test(str) || /^\s+[=+\-@]/.test(str)) str = `'${str}`
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

const EXPORT_CAP = 5000

export async function activityRoutes(app: FastifyInstance) {
  // GET /api/activity — paginated, filterable audit log
  app.get('/api/activity', async (req, reply) => {
    try {
      const query = QuerySchema.parse(req.query)
      const { page, limit, ...filters } = query
      const where = buildWhere(filters)

      const [events, total] = await Promise.all([
        prisma.activityEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.activityEvent.count({ where }),
      ])

      reply.code(200).send({
        success: true,
        data: events,
        meta: { total, page, limit },
      })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // GET /api/activity/types — distinct event types with counts (for filters)
  app.get('/api/activity/types', async (req, reply) => {
    try {
      const filters = FilterSchema.omit({ type: true }).parse(req.query)
      const where = buildWhere(filters)

      const grouped = await prisma.activityEvent.groupBy({
        by: ['type'],
        where,
        _count: { _all: true },
      })

      const counts = grouped
        .map((g) => ({ type: g.type, count: g._count._all }))
        .sort((a, b) => b.count - a.count)

      sendSuccess(reply, counts)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // GET /api/activity/export — CSV download of the filtered audit log
  app.get('/api/activity/export', async (req, reply) => {
    try {
      const filters = FilterSchema.parse(req.query)
      const where = buildWhere(filters)

      const [events, total] = await Promise.all([
        prisma.activityEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: EXPORT_CAP,
        }),
        prisma.activityEvent.count({ where }),
      ])
      const truncated = total > EXPORT_CAP
      if (truncated) {
        req.log.warn({ total, cap: EXPORT_CAP }, 'audit log export truncated')
      }

      const header = ['timestamp', 'type', 'title', 'detail', 'agentId', 'workspaceId']
      const rows = events.map((e) =>
        [e.createdAt.toISOString(), e.type, e.title, e.detail, e.agentId, e.workspaceId]
          .map(csvField)
          .join(','),
      )
      const lines = [header.join(','), ...rows]
      if (truncated) {
        lines.push(
          csvField(
            `NOTE: export truncated to the most recent ${EXPORT_CAP} of ${total} matching events`,
          ),
        )
      }
      const csv = lines.join('\r\n')

      reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', 'attachment; filename="audit-log.csv"')
        .header('X-Total-Count', String(total))
        .header('X-Truncated', String(truncated))
        .code(200)
        .send(csv)
    } catch (error) {
      sendError(reply, error)
    }
  })
}
