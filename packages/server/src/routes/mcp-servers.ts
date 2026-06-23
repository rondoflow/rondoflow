import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError, ValidationError } from '../lib/errors'
import {
  buildStoredAuth,
  parseStoredAuth,
  redactStoredAuth,
  decryptStoredAuth,
  resolveAuthHeaders,
} from '../engine/mcp-auth'
import { isRemoteMcpTransport } from '@rondoflow/shared'
import type { McpServerData, McpTransport, McpAuthInput } from '@rondoflow/shared'
import { Prisma } from '@prisma/client'

// ------------------------------------------------------------------
// Validation schemas
// ------------------------------------------------------------------

const McpAuthInputSchema = z.object({
  type: z.enum(['none', 'bearer', 'header', 'oauth2_client_credentials']),
  token: z.string().optional(),
  headerName: z.string().optional(),
  headerValue: z.string().optional(),
  tokenUrl: z.string().url().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  scope: z.string().optional(),
})

// Base shape — used directly for PATCH (partial) and refined for POST.
const McpServerBaseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['stdio', 'http', 'sse']).default('stdio'),
  command: z.string().optional(),
  args: z.array(z.string()).default([]),
  env: z.record(z.string()).optional(),
  url: z.string().url().optional(),
  auth: McpAuthInputSchema.optional(),
})

const CreateMcpServerSchema = McpServerBaseSchema.refine(
  (v) => (v.type === 'stdio' ? !!v.command && v.command.trim().length > 0 : true),
  { message: 'command is required for stdio servers', path: ['command'] },
).refine((v) => (v.type === 'stdio' ? true : !!v.url && v.url.trim().length > 0), {
  message: 'url is required for http/sse servers',
  path: ['url'],
})

const UpdateMcpServerSchema = McpServerBaseSchema.partial()

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

type McpServerRow = Prisma.McpServerGetPayload<Record<string, never>>

/** Shape a DB row for the client — auth secrets are redacted to presence flags. */
function toClientMcpServer(row: McpServerRow): McpServerData {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type as McpTransport,
    command: row.command,
    args: row.args,
    env: (row.env as Record<string, string> | null) ?? null,
    url: row.url,
    auth: redactStoredAuth(parseStoredAuth(row.auth)),
    createdAt: row.createdAt.toISOString(),
  }
}

/** Reject a merged stdio/remote config that is missing its required field. */
function assertTransportConsistency(
  type: McpTransport,
  command: string | null,
  url: string | null,
): void {
  if (type === 'stdio' && !(command && command.trim().length > 0)) {
    throw new ValidationError('command is required for stdio servers')
  }
  if (type !== 'stdio' && !(url && url.trim().length > 0)) {
    throw new ValidationError('url is required for http/sse servers')
  }
}

// ------------------------------------------------------------------
// Route plugin
// ------------------------------------------------------------------

export async function mcpServerRoutes(app: FastifyInstance) {
  // -------------------------------------------------------------------------
  // MCP Server CRUD
  // -------------------------------------------------------------------------

  /**
   * GET /api/mcp-servers
   * List all registered MCP servers (auth secrets redacted).
   */
  app.get('/api/mcp-servers', async (_req, reply) => {
    try {
      const servers = await prisma.mcpServer.findMany({ orderBy: { createdAt: 'desc' } })
      sendSuccess(reply, servers.map(toClientMcpServer))
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * GET /api/mcp-servers/:id
   * Get a single MCP server with its agent assignments (auth secrets redacted).
   */
  app.get<{ Params: { id: string } }>('/api/mcp-servers/:id', async (req, reply) => {
    try {
      const server = await prisma.mcpServer.findUnique({
        where: { id: req.params.id },
        include: { agents: { include: { agent: true } } },
      })
      if (!server) throw new NotFoundError('McpServer', req.params.id)
      const { agents, ...row } = server
      sendSuccess(reply, { ...toClientMcpServer(row), agents })
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * POST /api/mcp-servers
   * Register a new MCP server. stdio servers carry command/args/env; http/sse
   * servers carry url + auth. Auth secrets are encrypted at rest.
   */
  app.post('/api/mcp-servers', async (req, reply) => {
    try {
      const body = CreateMcpServerSchema.parse(req.body)
      const auth = buildStoredAuth(body.auth as McpAuthInput | undefined, null)
      const server = await prisma.mcpServer.create({
        data: {
          name: body.name,
          description: body.description,
          type: body.type,
          command: body.type === 'stdio' ? body.command : null,
          args: body.args,
          url: body.type === 'stdio' ? null : body.url,
          ...(body.env && body.type === 'stdio' ? { env: body.env } : {}),
          ...(auth && body.type !== 'stdio'
            ? { auth: auth as unknown as Prisma.InputJsonValue }
            : {}),
        },
      })
      sendSuccess(reply, toClientMcpServer(server), 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * PATCH /api/mcp-servers/:id
   * Update an MCP server definition (partial). Blank auth secrets are preserved.
   */
  app.patch<{ Params: { id: string } }>('/api/mcp-servers/:id', async (req, reply) => {
    try {
      const existing = await prisma.mcpServer.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('McpServer', req.params.id)

      const body = UpdateMcpServerSchema.parse(req.body)

      const type = (body.type ?? existing.type) as McpTransport
      const command = body.command !== undefined ? body.command : existing.command
      const url = body.url !== undefined ? body.url : existing.url
      assertTransportConsistency(type, command ?? null, url ?? null)

      const updateData: Prisma.McpServerUpdateInput = {}
      if (body.name !== undefined) updateData.name = body.name
      if (body.description !== undefined) updateData.description = body.description
      if (body.type !== undefined) updateData.type = body.type
      if (body.args !== undefined) updateData.args = body.args

      // Reconcile transport-specific columns so switching transports never
      // leaves stale data (or secrets) behind: stdio keeps command/args/env and
      // drops url/auth; http/sse keeps url/auth and drops command/env.
      if (type === 'stdio') {
        updateData.command = command ?? null
        updateData.url = null
        updateData.auth = Prisma.DbNull
        if (body.env !== undefined) updateData.env = body.env as Prisma.InputJsonValue
      } else {
        updateData.command = null
        updateData.url = url ?? null
        updateData.env = Prisma.DbNull
        if (body.auth !== undefined) {
          const auth = buildStoredAuth(body.auth as McpAuthInput, parseStoredAuth(existing.auth))
          updateData.auth = (auth ?? Prisma.DbNull) as Prisma.InputJsonValue | typeof Prisma.DbNull
        }
      }

      const updated = await prisma.mcpServer.update({
        where: { id: req.params.id },
        data: updateData,
      })
      sendSuccess(reply, toClientMcpServer(updated))
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * DELETE /api/mcp-servers/:id
   * Remove an MCP server. AgentMcpServer join rows are cascade-deleted
   * by the database constraint.
   */
  app.delete<{ Params: { id: string } }>('/api/mcp-servers/:id', async (req, reply) => {
    try {
      const existing = await prisma.mcpServer.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('McpServer', req.params.id)
      await prisma.mcpServer.delete({ where: { id: req.params.id } })
      sendSuccess(reply, { deleted: true })
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * POST /api/mcp-servers/:id/test
   * Reachability + auth probe for a remote (http/sse) server: resolve auth
   * headers server-side (incl. an OAuth2 token exchange) and HEAD the URL.
   * Network/timeout errors and 401/403 are reported as `ok: false` rather than
   * surfaced as request failures. stdio servers can't be probed this way.
   */
  app.post<{ Params: { id: string } }>('/api/mcp-servers/:id/test', async (req, reply) => {
    try {
      const server = await prisma.mcpServer.findUnique({ where: { id: req.params.id } })
      if (!server) throw new NotFoundError('McpServer', req.params.id)

      const type = server.type as McpTransport
      if (!isRemoteMcpTransport(type)) {
        return sendSuccess(reply, { ok: false, unsupported: true })
      }
      if (!server.url) return sendSuccess(reply, { ok: false, message: 'No URL configured' })

      let headers: Record<string, string>
      try {
        headers = await resolveAuthHeaders(decryptStoredAuth(parseStoredAuth(server.auth)))
      } catch (authError) {
        return sendSuccess(reply, {
          ok: false,
          message: authError instanceof Error ? authError.message : 'Auth resolution failed',
        })
      }

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000)
      try {
        const res = await fetch(server.url, { method: 'HEAD', headers, signal: controller.signal })
        if (res.status === 401 || res.status === 403) {
          return sendSuccess(reply, {
            ok: false,
            status: res.status,
            message: 'Authentication rejected',
          })
        }
        return sendSuccess(reply, { ok: true, status: res.status })
      } catch (fetchError) {
        return sendSuccess(reply, {
          ok: false,
          message: fetchError instanceof Error ? fetchError.message : 'Unreachable',
        })
      } finally {
        clearTimeout(timer)
      }
    } catch (error) {
      sendError(reply, error)
    }
  })

  // -------------------------------------------------------------------------
  // Agent <-> MCP Server assignment
  // -------------------------------------------------------------------------

  /**
   * POST /api/agents/:agentId/mcp/:mcpServerId
   * Assign an MCP server to an agent.
   */
  app.post<{ Params: { agentId: string; mcpServerId: string } }>(
    '/api/agents/:agentId/mcp/:mcpServerId',
    async (req, reply) => {
      try {
        const { agentId, mcpServerId } = req.params

        const agent = await prisma.agent.findUnique({ where: { id: agentId } })
        if (!agent) throw new NotFoundError('Agent', agentId)

        const server = await prisma.mcpServer.findUnique({ where: { id: mcpServerId } })
        if (!server) throw new NotFoundError('McpServer', mcpServerId)

        const assignment = await prisma.agentMcpServer.upsert({
          where: { agentId_mcpServerId: { agentId, mcpServerId } },
          create: { agentId, mcpServerId },
          update: {},
          include: { mcpServer: true },
        })
        sendSuccess(
          reply,
          { ...assignment, mcpServer: toClientMcpServer(assignment.mcpServer) },
          201,
        )
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  /**
   * DELETE /api/agents/:agentId/mcp/:mcpServerId
   * Unassign an MCP server from an agent.
   */
  app.delete<{ Params: { agentId: string; mcpServerId: string } }>(
    '/api/agents/:agentId/mcp/:mcpServerId',
    async (req, reply) => {
      try {
        const { agentId, mcpServerId } = req.params

        const existing = await prisma.agentMcpServer.findUnique({
          where: { agentId_mcpServerId: { agentId, mcpServerId } },
        })
        if (!existing) {
          throw new NotFoundError(`AgentMcpServer(agent=${agentId}, mcp=${mcpServerId})`, '')
        }

        await prisma.agentMcpServer.delete({
          where: { agentId_mcpServerId: { agentId, mcpServerId } },
        })
        sendSuccess(reply, { deleted: true })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  /**
   * GET /api/agents/:agentId/mcp
   * List all MCP servers assigned to an agent (auth secrets redacted).
   */
  app.get<{ Params: { agentId: string } }>('/api/agents/:agentId/mcp', async (req, reply) => {
    try {
      const { agentId } = req.params

      const agent = await prisma.agent.findUnique({ where: { id: agentId } })
      if (!agent) throw new NotFoundError('Agent', agentId)

      const assignments = await prisma.agentMcpServer.findMany({
        where: { agentId },
        include: { mcpServer: true },
      })
      type AssignmentWithServer = { mcpServer: McpServerRow }
      sendSuccess(
        reply,
        assignments.map((a: AssignmentWithServer) => toClientMcpServer(a.mcpServer)),
      )
    } catch (error) {
      sendError(reply, error)
    }
  })
}
