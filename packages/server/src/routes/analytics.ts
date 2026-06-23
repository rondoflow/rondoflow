import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/errors'

const QuerySchema = z.object({
  workspaceId: z.string().optional(),
  agentId: z.string().optional(),
  days: z.coerce.number().int().min(1).max(90).default(30),
})

export async function analyticsRoutes(app: FastifyInstance) {
  app.get('/api/analytics/cost', async (req, reply) => {
    try {
      const query = QuerySchema.parse(req.query)
      // Snap to UTC midnight so the query filter and the per-UTC-day chart
      // buckets share the same boundaries (no off-by-one across timezones).
      const since = new Date()
      since.setUTCHours(0, 0, 0, 0)
      since.setUTCDate(since.getUTCDate() - query.days)

      const where: Record<string, unknown> = {
        createdAt: { gte: since },
      }
      if (query.agentId) where.agentId = query.agentId
      if (query.workspaceId) where.workspaceId = query.workspaceId

      // Shared team pool — analytics aggregate across the whole team. Optional
      // agentId/workspaceId narrow the view above.

      const usages = await prisma.sessionUsage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })

      // Aggregate by model
      const byModel: Record<string, { inputTokens: number; outputTokens: number; costUsd: number; count: number }> = {}
      // Aggregate by UTC day (YYYY-MM-DD) for time-series charting
      type DayBucket = { costUsd: number; inputTokens: number; outputTokens: number; sessions: number }
      const dayMap = new Map<string, DayBucket>()
      // Aggregate by workspace (null bucketed under the empty string)
      type WorkspaceBucket = { inputTokens: number; outputTokens: number; costUsd: number; sessions: number }
      const workspaceMap = new Map<string, WorkspaceBucket>()
      let totalCost = 0
      let totalInput = 0
      let totalOutput = 0

      for (const usage of usages) {
        const model = usage.model ?? 'unknown'
        const entry = byModel[model] ?? { inputTokens: 0, outputTokens: 0, costUsd: 0, count: 0 }
        entry.inputTokens += usage.inputTokens
        entry.outputTokens += usage.outputTokens
        entry.costUsd += usage.costUsd
        entry.count++
        byModel[model] = entry

        const dayKey = usage.createdAt.toISOString().slice(0, 10)
        const day = dayMap.get(dayKey) ?? { costUsd: 0, inputTokens: 0, outputTokens: 0, sessions: 0 }
        day.costUsd += usage.costUsd
        day.inputTokens += usage.inputTokens
        day.outputTokens += usage.outputTokens
        day.sessions++
        dayMap.set(dayKey, day)

        const wsKey = usage.workspaceId ?? ''
        const ws = workspaceMap.get(wsKey) ?? { inputTokens: 0, outputTokens: 0, costUsd: 0, sessions: 0 }
        ws.inputTokens += usage.inputTokens
        ws.outputTokens += usage.outputTokens
        ws.costUsd += usage.costUsd
        ws.sessions++
        workspaceMap.set(wsKey, ws)

        totalCost += usage.costUsd
        totalInput += usage.inputTokens
        totalOutput += usage.outputTokens
      }

      // Resolve workspace names for the per-workspace breakdown.
      const workspaceIds = [...workspaceMap.keys()].filter((id) => id.length > 0)
      const workspaces = workspaceIds.length
        ? await prisma.workspace.findMany({
            where: { id: { in: workspaceIds } },
            select: { id: true, name: true },
          })
        : []
      const nameById = new Map(workspaces.map((w) => [w.id, w.name]))

      const byWorkspace = [...workspaceMap.entries()]
        .map(([workspaceId, bucket]) => ({
          workspaceId: workspaceId || null,
          name: workspaceId ? (nameById.get(workspaceId) ?? 'Unknown workspace') : 'No workspace',
          ...bucket,
        }))
        .sort((a, b) => b.costUsd - a.costUsd)

      // Build a continuous daily series (gaps filled with zeros) from `since` to today.
      const byDay: Array<{ date: string } & DayBucket> = []
      const cursor = new Date(since) // already UTC midnight
      const end = new Date()
      end.setUTCHours(0, 0, 0, 0)
      while (cursor <= end) {
        const key = cursor.toISOString().slice(0, 10)
        const bucket = dayMap.get(key) ?? { costUsd: 0, inputTokens: 0, outputTokens: 0, sessions: 0 }
        byDay.push({ date: key, ...bucket })
        cursor.setUTCDate(cursor.getUTCDate() + 1)
      }

      sendSuccess(reply, {
        period: { days: query.days, since: since.toISOString() },
        total: {
          costUsd: totalCost,
          inputTokens: totalInput,
          outputTokens: totalOutput,
          sessions: usages.length,
        },
        byModel,
        byDay,
        byWorkspace,
      })
    } catch (error) {
      sendError(reply, error)
    }
  })
}
