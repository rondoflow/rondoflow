import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError, ValidationError } from '../lib/errors'
import { saveFile, deleteFile, MAX_FILE_SIZE } from '../resources/file-storage'
import { encrypt } from '../resources/encryption'
import type { WorkspaceResource as SharedResource } from '@rondoflow/shared'

// UUID regex used to validate path params before DB calls
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const CreateResourceSchema = z.object({
  type: z.enum(['url', 'note', 'variable']),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  url: z.string().url().optional(),
  content: z.string().optional(),
  varKey: z.string().min(1).max(100).optional(),
  varValue: z.string().optional(),
  isSecret: z.boolean().default(false),
})

const UpdateResourceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  content: z.string().optional(),
  varKey: z.string().min(1).max(100).optional(),
  varValue: z.string().optional(),
  isSecret: z.boolean().optional(),
})

function validateUUID(id: string, label: string): void {
  if (!UUID_REGEX.test(id)) {
    throw new ValidationError(`Invalid ${label}: "${id}"`)
  }
}

/**
 * Serialises a DB WorkspaceResource row for API responses.
 * varValue is always omitted for secrets so credentials never reach the frontend.
 */
function serializeResource(r: {
  id: string
  workspaceId: string
  type: string
  name: string
  description: string | null
  filePath: string | null
  fileSize: number | null
  mimeType: string | null
  url: string | null
  content: string | null
  varKey: string | null
  varValue: string | null
  isSecret: boolean
  createdAt: Date
  updatedAt: Date
}): SharedResource {
  return {
    id: r.id,
    workspaceId: r.workspaceId,
    type: r.type as SharedResource['type'],
    name: r.name,
    description: r.description,
    filePath: r.filePath,
    fileSize: r.fileSize,
    mimeType: r.mimeType,
    url: r.url,
    content: r.content,
    varKey: r.varKey,
    isSecret: r.isSecret,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

export async function resourceRoutes(app: FastifyInstance) {
  // ------------------------------------------------------------------
  // GET /api/workspaces/:workspaceId/resources
  // ------------------------------------------------------------------
  app.get<{
    Params: { workspaceId: string }
    Querystring: { type?: string }
  }>('/api/workspaces/:workspaceId/resources', async (req, reply) => {
    try {
      const { workspaceId } = req.params
      validateUUID(workspaceId, 'workspaceId')

      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
      if (!workspace) throw new NotFoundError('Workspace', workspaceId)

      const typeFilter = req.query.type
      const validTypes = ['file', 'url', 'note', 'variable'] as const
      type ResourceTypeFilter = typeof validTypes[number]

      const where: { workspaceId: string; type?: ResourceTypeFilter } = { workspaceId }
      if (typeFilter) {
        if (!validTypes.includes(typeFilter as ResourceTypeFilter)) {
          throw new ValidationError(`Invalid type filter: "${typeFilter}"`)
        }
        where.type = typeFilter as ResourceTypeFilter
      }

      const resources = await prisma.workspaceResource.findMany({
        where,
        orderBy: { createdAt: 'asc' },
      })

      sendSuccess(reply, resources.map(serializeResource))
    } catch (error) {
      sendError(reply, error)
    }
  })

  // ------------------------------------------------------------------
  // POST /api/workspaces/:workspaceId/resources
  // ------------------------------------------------------------------
  app.post<{ Params: { workspaceId: string } }>(
    '/api/workspaces/:workspaceId/resources',
    async (req, reply) => {
      try {
        const { workspaceId } = req.params
        validateUUID(workspaceId, 'workspaceId')

        const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
        if (!workspace) throw new NotFoundError('Workspace', workspaceId)

        const body = CreateResourceSchema.parse(req.body)

        if (body.type === 'url' && !body.url) {
          throw new ValidationError('url is required for resources of type "url"')
        }
        if (body.type === 'variable' && !body.varKey) {
          throw new ValidationError('varKey is required for resources of type "variable"')
        }

        // Encrypt secret variable values before storing
        let storedVarValue = body.varValue ?? null
        if (body.type === 'variable' && body.isSecret && body.varValue) {
          storedVarValue = encrypt(body.varValue)
        }

        const resource = await prisma.workspaceResource.create({
          data: {
            workspaceId,
            type: body.type,
            name: body.name,
            description: body.description ?? null,
            url: body.url ?? null,
            content: body.content ?? null,
            varKey: body.varKey ?? null,
            varValue: storedVarValue,
            isSecret: body.isSecret,
          },
        })

        sendSuccess(reply, serializeResource(resource), 201)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // ------------------------------------------------------------------
  // POST /api/workspaces/:workspaceId/resources/upload
  // ------------------------------------------------------------------
  app.post<{ Params: { workspaceId: string } }>(
    '/api/workspaces/:workspaceId/resources/upload',
    async (req, reply) => {
      try {
        const { workspaceId } = req.params
        validateUUID(workspaceId, 'workspaceId')

        const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
        if (!workspace) throw new NotFoundError('Workspace', workspaceId)

        const data = await req.file()
        if (!data) {
          throw new ValidationError('No file included in the request')
        }

        const chunks: Buffer[] = []
        let totalSize = 0

        for await (const chunk of data.file) {
          totalSize += chunk.length
          if (totalSize > MAX_FILE_SIZE) {
            throw new ValidationError(
              `File exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
            )
          }
          chunks.push(chunk as Buffer)
        }

        const buffer = Buffer.concat(chunks)
        const { storedName, filePath, fileSize } = await saveFile(
          workspaceId,
          data.filename,
          buffer,
          workspace.workingDirectory,
        )

        // Name field can be overridden via a multipart field named "name"
        const nameField = (data.fields as Record<string, { value: string } | undefined>)['name']
        const resourceName = nameField?.value ?? data.filename

        const resource = await prisma.workspaceResource.create({
          data: {
            workspaceId,
            type: 'file',
            name: resourceName,
            mimeType: data.mimetype,
            filePath,
            fileSize,
          },
        })

        // storedName is internal but we include it so callers can construct download URLs
        sendSuccess(reply, { ...serializeResource(resource), storedName }, 201)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // ------------------------------------------------------------------
  // GET /api/workspaces/:workspaceId/resources/:id
  // ------------------------------------------------------------------
  app.get<{ Params: { workspaceId: string; id: string } }>(
    '/api/workspaces/:workspaceId/resources/:id',
    async (req, reply) => {
      try {
        const { workspaceId, id } = req.params
        validateUUID(workspaceId, 'workspaceId')
        validateUUID(id, 'resource id')

        const resource = await prisma.workspaceResource.findFirst({
          where: { id, workspaceId },
        })
        if (!resource) throw new NotFoundError('WorkspaceResource', id)

        sendSuccess(reply, serializeResource(resource))
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // ------------------------------------------------------------------
  // PATCH /api/workspaces/:workspaceId/resources/:id
  // ------------------------------------------------------------------
  app.patch<{ Params: { workspaceId: string; id: string } }>(
    '/api/workspaces/:workspaceId/resources/:id',
    async (req, reply) => {
      try {
        const { workspaceId, id } = req.params
        validateUUID(workspaceId, 'workspaceId')
        validateUUID(id, 'resource id')

        const existing = await prisma.workspaceResource.findFirst({
          where: { id, workspaceId },
        })
        if (!existing) throw new NotFoundError('WorkspaceResource', id)

        const body = UpdateResourceSchema.parse(req.body)

        // Re-encrypt if the varValue is being updated and resource is (or will be) a secret
        const willBeSecret = body.isSecret ?? existing.isSecret
        let storedVarValue: string | null | undefined
        if (body.varValue !== undefined) {
          storedVarValue =
            existing.type === 'variable' && willBeSecret && body.varValue
              ? encrypt(body.varValue)
              : body.varValue
        }

        const updated = await prisma.workspaceResource.update({
          where: { id },
          data: {
            ...(body.name !== undefined && { name: body.name }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.url !== undefined && { url: body.url }),
            ...(body.content !== undefined && { content: body.content }),
            ...(body.varKey !== undefined && { varKey: body.varKey }),
            ...(storedVarValue !== undefined && { varValue: storedVarValue }),
            ...(body.isSecret !== undefined && { isSecret: body.isSecret }),
          },
        })

        sendSuccess(reply, serializeResource(updated))
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // ------------------------------------------------------------------
  // DELETE /api/workspaces/:workspaceId/resources/:id
  // ------------------------------------------------------------------
  app.delete<{ Params: { workspaceId: string; id: string } }>(
    '/api/workspaces/:workspaceId/resources/:id',
    async (req, reply) => {
      try {
        const { workspaceId, id } = req.params
        validateUUID(workspaceId, 'workspaceId')
        validateUUID(id, 'resource id')

        const resource = await prisma.workspaceResource.findFirst({
          where: { id, workspaceId },
        })
        if (!resource) throw new NotFoundError('WorkspaceResource', id)

        // If it is a file resource, remove the file from disk first
        if (resource.type === 'file' && resource.filePath) {
          const ws = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { workingDirectory: true } })
          const storedName = resource.filePath.split('/').pop() ?? resource.filePath.split('\\').pop() ?? ''
          if (storedName) {
            await deleteFile(workspaceId, storedName, ws?.workingDirectory).catch(() => {
              // Best-effort — continue with DB deletion even if file removal fails
            })
          }
        }

        await prisma.workspaceResource.delete({ where: { id } })

        sendSuccess(reply, { id })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // ------------------------------------------------------------------
  // GET /api/workspaces/:workspaceId/resources/:id/download
  // ------------------------------------------------------------------
  app.get<{ Params: { workspaceId: string; id: string } }>(
    '/api/workspaces/:workspaceId/resources/:id/download',
    async (req, reply) => {
      try {
        const { workspaceId, id } = req.params
        validateUUID(workspaceId, 'workspaceId')
        validateUUID(id, 'resource id')

        const resource = await prisma.workspaceResource.findFirst({
          where: { id, workspaceId },
        })
        if (!resource) throw new NotFoundError('WorkspaceResource', id)

        if (resource.type !== 'file' || !resource.filePath) {
          throw new ValidationError('Resource is not a downloadable file')
        }

        // Verify the file exists on disk
        const fileStat = await stat(resource.filePath).catch(() => null)
        if (!fileStat) {
          throw new ValidationError('File not found on disk — it may have been deleted')
        }

        const contentType = resource.mimeType ?? 'application/octet-stream'
        const encodedName = encodeURIComponent(resource.name)

        reply
          .header('Content-Type', contentType)
          .header('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`)
          .header('Content-Length', String(fileStat.size))

        const stream = createReadStream(resource.filePath)
        return reply.send(stream)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )
}
