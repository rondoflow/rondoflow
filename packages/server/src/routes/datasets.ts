import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError } from '../lib/errors'

const ListQuerySchema = z.object({
  workspaceId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
})

const DetailQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100),
})

export async function datasetRoutes(app: FastifyInstance) {
  // List saved structured datasets (most recent first). Shared team pool — an
  // optional workspaceId narrows the view (mirrors GET /api/runs).
  app.get('/api/datasets', async (req, reply) => {
    try {
      const query = ListQuerySchema.parse(req.query)
      const skip = (query.page - 1) * query.limit
      const where = query.workspaceId ? { workspaceId: query.workspaceId } : {}

      const [datasets, total] = await Promise.all([
        prisma.structuredDataset.findMany({
          where,
          select: {
            id: true,
            workspaceId: true,
            chainRunId: true,
            nodeId: true,
            name: true,
            format: true,
            rowCount: true,
            sourceAgentIds: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: query.limit,
        }),
        prisma.structuredDataset.count({ where }),
      ])

      reply.status(200).send({
        success: true,
        data: datasets,
        meta: { total, page: query.page, limit: query.limit },
      })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Fetch one dataset with its schema and a paginated slice of rows.
  app.get<{ Params: { id: string } }>('/api/datasets/:id', async (req, reply) => {
    try {
      const query = DetailQuerySchema.parse(req.query)
      const skip = (query.page - 1) * query.limit

      const dataset = await prisma.structuredDataset.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          workspaceId: true,
          chainRunId: true,
          nodeId: true,
          name: true,
          format: true,
          schema: true,
          rowCount: true,
          sourceAgentIds: true,
          createdAt: true,
        },
      })
      if (!dataset) throw new NotFoundError('Dataset', req.params.id)

      const rows = await prisma.structuredRow.findMany({
        where: { datasetId: dataset.id },
        orderBy: { idx: 'asc' },
        skip,
        take: query.limit,
        select: { idx: true, data: true },
      })

      reply.status(200).send({
        success: true,
        data: { ...dataset, rows },
        meta: { total: dataset.rowCount, page: query.page, limit: query.limit },
      })
    } catch (error) {
      sendError(reply, error)
    }
  })
}
