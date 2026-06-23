import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError, ValidationError } from '../lib/errors'
import { validateContainerPath, listAvailableFolders } from '../lib/external-folders'

const CreateExternalFolderSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  containerPath: z.string().min(1).max(1000),
  readOnly: z.boolean().default(false),
})

const UpdateExternalFolderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  readOnly: z.boolean().optional(),
  // containerPath is intentionally immutable after create so the create-time
  // validation invariant cannot be bypassed by re-pointing an existing record.
})

const AttachFolderSchema = z.object({
  priority: z.number().int().default(0),
  enabled: z.boolean().default(true),
})

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002'
}

export async function externalFolderRoutes(app: FastifyInstance) {
  // -------------------------------------------------------------------------
  // Registry CRUD
  // -------------------------------------------------------------------------

  app.get('/api/external-folders', async (_req, reply) => {
    try {
      const folders = await prisma.externalFolder.findMany({
        orderBy: { createdAt: 'desc' },
      })
      sendSuccess(reply, folders)
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * GET /api/external-folders/available
   * Scans the in-container mount root and returns the directories that are
   * actually mounted, so the UI can offer them for one-click registration.
   */
  app.get('/api/external-folders/available', async (_req, reply) => {
    try {
      const result = await listAvailableFolders()
      sendSuccess(reply, result)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/external-folders', async (req, reply) => {
    try {
      const body = CreateExternalFolderSchema.parse(req.body)
      // Validate + canonicalize; stored path is always the resolved real path.
      const containerPath = await validateContainerPath(body.containerPath)

      const folder = await prisma.externalFolder.create({
        data: {
          name: body.name,
          description: body.description,
          containerPath,
          readOnly: body.readOnly,
        },
      })
      sendSuccess(reply, folder, 201)
    } catch (error) {
      if (isUniqueViolation(error)) {
        return sendError(reply, new ValidationError('A folder with that path is already registered'))
      }
      sendError(reply, error)
    }
  })

  app.patch<{ Params: { id: string } }>('/api/external-folders/:id', async (req, reply) => {
    try {
      const body = UpdateExternalFolderSchema.parse(req.body ?? {})

      const existing = await prisma.externalFolder.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('ExternalFolder', req.params.id)

      const folder = await prisma.externalFolder.update({
        where: { id: req.params.id },
        data: body,
      })
      sendSuccess(reply, folder)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.delete<{ Params: { id: string } }>('/api/external-folders/:id', async (req, reply) => {
    try {
      const existing = await prisma.externalFolder.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('ExternalFolder', req.params.id)

      // Cascade removes any AgentExternalFolder attachments.
      await prisma.externalFolder.delete({ where: { id: req.params.id } })
      sendSuccess(reply, { deleted: true })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // -------------------------------------------------------------------------
  // Per-agent attachment (mirrors skills attach/detach)
  // -------------------------------------------------------------------------

  app.post<{ Params: { agentId: string; folderId: string } }>(
    '/api/agents/:agentId/external-folders/:folderId',
    async (req, reply) => {
      try {
        const { agentId, folderId } = req.params
        const body = AttachFolderSchema.parse(req.body ?? {})

        const agent = await prisma.agent.findUnique({ where: { id: agentId } })
        if (!agent) throw new NotFoundError('Agent', agentId)

        const folder = await prisma.externalFolder.findUnique({ where: { id: folderId } })
        if (!folder) throw new NotFoundError('ExternalFolder', folderId)

        const attachment = await prisma.agentExternalFolder.upsert({
          where: { agentId_externalFolderId: { agentId, externalFolderId: folderId } },
          create: { agentId, externalFolderId: folderId, ...body },
          update: body,
          include: { externalFolder: true },
        })
        sendSuccess(reply, attachment, 201)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  app.delete<{ Params: { agentId: string; folderId: string } }>(
    '/api/agents/:agentId/external-folders/:folderId',
    async (req, reply) => {
      try {
        const { agentId, folderId } = req.params

        const existing = await prisma.agentExternalFolder.findUnique({
          where: { agentId_externalFolderId: { agentId, externalFolderId: folderId } },
        })
        if (!existing) {
          throw new NotFoundError(`AgentExternalFolder(agent=${agentId}, folder=${folderId})`, '')
        }

        await prisma.agentExternalFolder.delete({
          where: { agentId_externalFolderId: { agentId, externalFolderId: folderId } },
        })
        sendSuccess(reply, { deleted: true })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
