import { FastifyInstance } from 'fastify'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import {
  CANVAS_EXPORT_FORMAT,
  CANVAS_EXPORT_VERSION,
  type CanvasExportBundle,
  type CanvasImportReport,
  type ExportedAgent,
} from '@rondoflow/shared'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError } from '../lib/errors'
import { SKILL_CATALOG } from '@rondoflow/catalog'
import { installSkill } from '../skills/installer'

// ─── Helpers ────────────────────────────────────────────────────────────────

type JsonRecord = Record<string, unknown>

/** True for an agent node whose `id` is the underlying agent's DB id. */
function isAgentNode(node: JsonRecord): boolean {
  return node['type'] === 'agent' && typeof node['id'] === 'string'
}

// Upper bounds on a bundle's collections — a bundle is untrusted input, so cap
// the work a single import can trigger (sequential DB writes per entity).
const MAX_NODES = 5000
const MAX_EDGES = 5000
const MAX_AGENTS = 500
const MAX_SKILLS = 500
const MAX_MCP = 500

// Only these transports are safe to hand to `git clone`. Reject everything else
// (notably the remote-helper transports `ext::`/`fd::`, which execute arbitrary
// commands) and any value that git could parse as an option (leading '-').
const SAFE_GIT_SCHEMES = new Set(['http:', 'https:', 'git:', 'ssh:'])
function isSafeGitUrl(value: string): boolean {
  if (value.startsWith('-')) return false
  try {
    return SAFE_GIT_SCHEMES.has(new URL(value).protocol)
  } catch {
    return false
  }
}

/** Compare two MCP server definitions for the fields that affect execution. */
function mcpDefinitionsDiffer(
  existing: { command: string | null; args: string[]; type: string; url: string | null },
  incoming: { command?: string | null; args: readonly string[]; type: string; url?: string | null },
): boolean {
  return (
    (existing.command ?? null) !== (incoming.command ?? null) ||
    (existing.url ?? null) !== (incoming.url ?? null) ||
    existing.type !== incoming.type ||
    existing.args.length !== incoming.args.length ||
    existing.args.some((a, i) => a !== incoming.args[i])
  )
}

// ─── Import validation schema ─────────────────────────────────────────────────
// Lenient on raw node/edge records (React Flow shapes vary by node type); strict
// on the embedded entity definitions the importer needs to recreate the setup.

const exportedAgentSchema = z.object({
  nodeId: z.string(),
  name: z.string().min(1).max(100),
  persona: z.string().min(1),
  description: z.string().nullish(),
  purpose: z.string().nullish(),
  avatar: z.string().nullish(),
  model: z.string().nullish(),
  scope: z.array(z.string()).default([]),
  allowedTools: z.array(z.string()).default([]),
  permissionMode: z.enum(['plan', 'default', 'edit', 'full']).default('default'),
  memoryEnabled: z.boolean().default(false),
  isFacilitator: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
  mcpServers: z.array(z.string()).default([]),
  policies: z
    .array(
      z.object({
        name: z.string(),
        level: z.enum(['global', 'agent', 'session']),
        rules: z.record(z.unknown()).default({}),
      }),
    )
    .default([]),
})

const bundleSchema = z.object({
  format: z.literal(CANVAS_EXPORT_FORMAT),
  version: z.number(),
  exportedAt: z.string().optional(),
  workspace: z.object({
    name: z.string().min(1).max(100),
    contextDocument: z.string().nullish(),
    planDocument: z.string().nullish(),
  }),
  viewport: z.record(z.unknown()).optional(),
  nodes: z.array(z.record(z.unknown())).max(MAX_NODES).default([]),
  edges: z.array(z.record(z.unknown())).max(MAX_EDGES).default([]),
  agents: z.array(exportedAgentSchema).max(MAX_AGENTS).default([]),
  skills: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().default(''),
        source: z.enum(['marketplace', 'git', 'custom']),
        gitUrl: z.string().nullish(),
        version: z.string().nullish(),
        author: z.string().nullish(),
        category: z.string().nullish(),
        icon: z.string().nullish(),
      }),
    )
    .max(MAX_SKILLS)
    .default([]),
  mcpServers: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().nullish(),
        type: z.string().default('stdio'),
        command: z.string().nullish(),
        args: z.array(z.string()).default([]),
        url: z.string().nullish(),
      }),
    )
    .max(MAX_MCP)
    .default([]),
})

const ImportBodySchema = z.object({
  bundle: bundleSchema,
  name: z.string().min(1).max(100).optional(),
})

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function canvasTransferRoutes(app: FastifyInstance) {
  /**
   * GET /api/workspaces/:id/export
   * Build a self-contained, shareable bundle of the workspace's canvas: the
   * layout (nodes/edges/viewport) plus the full definitions of every referenced
   * agent, skill and MCP server. Secrets (MCP env) are never included.
   */
  app.get<{ Params: { id: string } }>('/api/workspaces/:id/export', async (req, reply) => {
    try {
      const { id } = req.params

      const workspace = await prisma.workspace.findUnique({ where: { id } })
      if (!workspace) throw new NotFoundError('Workspace', id)

      const layout = await prisma.canvasLayout.findFirst({
        where: { workspaceId: id },
        orderBy: { updatedAt: 'desc' },
      })

      const rawNodes = (Array.isArray(layout?.nodes) ? layout!.nodes : []) as JsonRecord[]
      const rawEdges = (Array.isArray(layout?.edges) ? layout!.edges : []) as JsonRecord[]

      // Agent node ids ARE agent DB ids.
      const agentIds = rawNodes.filter(isAgentNode).map((n) => n['id'] as string)

      // Skill ids and MCP server names referenced directly by their (decorative)
      // canvas nodes, which may not be attached to any agent.
      const skillNodeIds = new Set<string>()
      const mcpNodeNames = new Set<string>()
      for (const node of rawNodes) {
        if (!node['data'] || typeof node['data'] !== 'object') continue
        const data = node['data'] as JsonRecord
        if (node['type'] === 'skill' && typeof data['skillId'] === 'string') {
          skillNodeIds.add(data['skillId'])
        }
        if (node['type'] === 'mcp' && typeof data['name'] === 'string') {
          mcpNodeNames.add(data['name'])
        }
      }

      // Shared team pool — every agent in the canvas is visible to the requester.
      const agents = await prisma.agent.findMany({
        where: {
          id: { in: agentIds },
        },
        include: {
          skills: { include: { skill: true } },
          policies: true,
          mcpAssignments: { include: { mcpServer: true } },
        },
      })
      const resolvedAgentIds = new Set(agents.map((a) => a.id))

      const exportedAgents: ExportedAgent[] = agents.map((agent) => ({
        nodeId: agent.id,
        name: agent.name,
        persona: agent.persona,
        description: agent.description,
        purpose: agent.purpose,
        avatar: agent.avatar,
        model: agent.model,
        scope: agent.scope,
        allowedTools: agent.allowedTools,
        permissionMode: agent.permissionMode as ExportedAgent['permissionMode'],
        memoryEnabled: agent.memoryEnabled,
        isFacilitator: agent.isFacilitator,
        skills: agent.skills.map((s) => s.skill.name),
        mcpServers: agent.mcpAssignments.map((m) => m.mcpServer.name),
        policies: agent.policies.map((p) => ({
          name: p.name,
          level: p.level,
          rules: (p.rules ?? {}) as Record<string, unknown>,
        })),
      }))

      // Collect referenced skills: those attached to agents + those referenced by
      // skill nodes. Dedupe by id.
      const skillsById = new Map<string, (typeof agents)[number]['skills'][number]['skill']>()
      for (const agent of agents) {
        for (const link of agent.skills) skillsById.set(link.skill.id, link.skill)
      }
      const missingSkillNodeIds = [...skillNodeIds].filter((sid) => !skillsById.has(sid))
      if (missingSkillNodeIds.length > 0) {
        const extra = await prisma.skill.findMany({ where: { id: { in: missingSkillNodeIds } } })
        for (const skill of extra) skillsById.set(skill.id, skill)
      }

      const exportedSkills = [...skillsById.values()].map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        source: skill.source as 'marketplace' | 'git' | 'custom',
        gitUrl: skill.gitUrl,
        version: skill.version,
        author: skill.author,
        category: skill.category,
        icon: skill.icon,
      }))

      // Collect referenced MCP servers (by name), stripping env (secrets). Pulls
      // from agent assignments and from standalone MCP nodes (symmetric with skills).
      const mcpByName = new Map<string, (typeof agents)[number]['mcpAssignments'][number]['mcpServer']>()
      for (const agent of agents) {
        for (const link of agent.mcpAssignments) mcpByName.set(link.mcpServer.name, link.mcpServer)
      }
      const missingMcpNames = [...mcpNodeNames].filter((name) => !mcpByName.has(name))
      if (missingMcpNames.length > 0) {
        const extra = await prisma.mcpServer.findMany({ where: { name: { in: missingMcpNames } } })
        for (const server of extra) mcpByName.set(server.name, server)
      }
      const exportedMcpServers = [...mcpByName.values()].map((server) => ({
        name: server.name,
        description: server.description,
        type: server.type,
        command: server.command,
        args: server.args,
        url: server.url,
      }))

      // Drop agent nodes that have no DB-backed definition (local-only / not owned)
      // — they can't be shared and would import as dead-id phantoms — plus any
      // edges that touch them. Strip volatile per-run state from the rest.
      const droppedNodeIds = new Set(
        rawNodes
          .filter((n) => isAgentNode(n) && !resolvedAgentIds.has(n['id'] as string))
          .map((n) => n['id'] as string),
      )
      const cleanNodes = rawNodes
        .filter((node) => !(isAgentNode(node) && droppedNodeIds.has(node['id'] as string)))
        .map((node): JsonRecord => {
          if (node['type'] !== 'agent' || !node['data'] || typeof node['data'] !== 'object') {
            return node
          }
          const data: JsonRecord = { ...(node['data'] as JsonRecord), status: 'idle' }
          delete data['chainState']
          delete data['skipped']
          delete data['hasSchedule']
          return { ...node, data }
        })
      const cleanEdges = rawEdges.filter(
        (e) => !droppedNodeIds.has(e['source'] as string) && !droppedNodeIds.has(e['target'] as string),
      )

      const bundle: CanvasExportBundle = {
        format: CANVAS_EXPORT_FORMAT,
        version: CANVAS_EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        workspace: {
          name: workspace.name,
          contextDocument: workspace.contextDocument,
          planDocument: workspace.planDocument,
        },
        viewport:
          (layout?.viewport as unknown as CanvasExportBundle['viewport']) ?? { x: 0, y: 0, zoom: 1 },
        nodes: cleanNodes as unknown as CanvasExportBundle['nodes'],
        edges: cleanEdges as unknown as CanvasExportBundle['edges'],
        agents: exportedAgents,
        skills: exportedSkills,
        mcpServers: exportedMcpServers,
      }

      sendSuccess(reply, bundle)
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * POST /api/canvas/import
   * Recreate a shared canvas as a NEW workspace: recreate/reuse skills and MCP
   * servers (deduped by name), recreate agents with fresh ids and re-link their
   * skills/policies/MCP servers, remap node/edge ids, and persist the layout.
   * Non-destructive — never touches an existing workspace.
   */
  // Allow larger payloads than Fastify's 1 MB default — bundles embed full
  // agent personas and can grow well past 1 MB for rich multi-agent setups.
  app.post('/api/canvas/import', { bodyLimit: 16 * 1024 * 1024 }, async (req, reply) => {
    let createdWorkspaceId: string | null = null
    const createdAgentIds: string[] = []
    const createdMcpServerIds: string[] = []
    try {
      const { bundle, name } = ImportBodySchema.parse(req.body)
      const userId = req.user?.id

      const warnings: string[] = []
      if (bundle.version > CANVAS_EXPORT_VERSION) {
        warnings.push(
          `Bundle was exported by a newer version (v${bundle.version}); some data may not import correctly.`,
        )
      }

      // ── 1. Resolve skills (reuse by name, else best-effort install) ──────────
      const skillIdMap = new Map<string, string>() // original skill id → new skill id
      const skillNameToId = new Map<string, string>()
      let skillsReused = 0
      let skillsInstalled = 0
      const skillsSkipped: string[] = []

      for (const skill of bundle.skills) {
        const existing = await prisma.skill.findUnique({ where: { name: skill.name } })
        if (existing) {
          skillIdMap.set(skill.id, existing.id)
          skillNameToId.set(skill.name, existing.id)
          skillsReused++
          continue
        }

        let installedId: string | null = null
        try {
          if (skill.source === 'marketplace') {
            const catalogEntry = SKILL_CATALOG.find((c) => c.name === skill.name)
            if (catalogEntry) {
              const res = await installSkill({ name: skill.name, source: 'marketplace', catalogEntry })
              if (res.success && res.skill) installedId = res.skill.id
            }
          } else if (skill.source === 'git' && skill.gitUrl && isSafeGitUrl(skill.gitUrl)) {
            // gitUrl comes from an untrusted bundle — only http(s)/git/ssh URLs
            // ever reach `git clone` (no `ext::`/`fd::` remote-helper RCE).
            const res = await installSkill({ name: skill.name, source: 'git', gitUrl: skill.gitUrl })
            if (res.success && res.skill) installedId = res.skill.id
          }
        } catch {
          installedId = null
        }

        if (installedId) {
          skillIdMap.set(skill.id, installedId)
          skillNameToId.set(skill.name, installedId)
          skillsInstalled++
        } else {
          skillsSkipped.push(skill.name)
          warnings.push(
            `Skill "${skill.name}" (${skill.source}) could not be installed automatically — install it manually and re-attach it.`,
          )
        }
      }

      // ── 2. Resolve MCP servers (reuse by name, else create without env) ──────
      const mcpNameToId = new Map<string, string>()
      let mcpServersCreated = 0
      let mcpServersReused = 0

      for (const server of bundle.mcpServers) {
        const existing = await prisma.mcpServer.findUnique({ where: { name: server.name } })
        if (existing) {
          mcpNameToId.set(server.name, existing.id)
          mcpServersReused++
          // Name is globally unique, so we can't recreate the bundle's variant —
          // surface the mismatch instead of silently running a different command.
          if (mcpDefinitionsDiffer(existing, server)) {
            warnings.push(
              `MCP server "${server.name}" already exists with a different command; the existing one was used.`,
            )
          }
          continue
        }
        try {
          const created = await prisma.mcpServer.create({
            data: {
              name: server.name,
              description: server.description ?? null,
              type: server.type,
              command: server.command ?? null,
              args: server.args,
              url: server.url ?? null,
            },
          })
          mcpNameToId.set(server.name, created.id)
          createdMcpServerIds.push(created.id)
          mcpServersCreated++
        } catch {
          warnings.push(`MCP server "${server.name}" could not be created.`)
        }
      }

      // ── 3. Create the workspace ──────────────────────────────────────────────
      const workspaceName = (name ?? bundle.workspace.name ?? 'Imported canvas').trim() || 'Imported canvas'
      const workspace = await prisma.workspace.create({
        data: {
          name: workspaceName,
          contextDocument: bundle.workspace.contextDocument ?? null,
          planDocument: bundle.workspace.planDocument ?? null,
          userId,
        },
      })
      createdWorkspaceId = workspace.id

      // ── 4. Create agents and re-link skills / MCP / policies ─────────────────
      const agentIdMap = new Map<string, string>() // original node id → new agent id

      for (const agent of bundle.agents) {
        const created = await prisma.agent.create({
          data: {
            name: agent.name,
            persona: agent.persona,
            description: agent.description ?? null,
            purpose: agent.purpose ?? null,
            avatar: agent.avatar ?? null,
            model: agent.model ?? null,
            scope: agent.scope,
            allowedTools: agent.allowedTools,
            permissionMode: agent.permissionMode,
            memoryEnabled: agent.memoryEnabled,
            isFacilitator: agent.isFacilitator,
            userId,
          },
        })
        agentIdMap.set(agent.nodeId, created.id)
        createdAgentIds.push(created.id)

        for (const skillName of agent.skills) {
          const skillId = skillNameToId.get(skillName)
          if (!skillId) continue
          await prisma.agentSkill.upsert({
            where: { agentId_skillId: { agentId: created.id, skillId } },
            create: { agentId: created.id, skillId },
            update: {},
          })
        }

        for (const mcpName of agent.mcpServers) {
          const mcpServerId = mcpNameToId.get(mcpName)
          if (!mcpServerId) continue
          await prisma.agentMcpServer.upsert({
            where: { agentId_mcpServerId: { agentId: created.id, mcpServerId } },
            create: { agentId: created.id, mcpServerId },
            update: {},
          })
        }

        for (const policy of agent.policies) {
          await prisma.policy.create({
            data: {
              name: policy.name,
              level: policy.level,
              rules: policy.rules as Prisma.InputJsonValue,
              agentId: created.id,
            },
          })
        }
      }

      // ── 5. Remap node / edge ids onto the freshly-created entities ───────────
      const nodes = bundle.nodes.map((raw) => {
        const node: JsonRecord = { ...raw }
        if (isAgentNode(node)) {
          const newId = agentIdMap.get(node['id'] as string)
          if (newId) node['id'] = newId
        }
        if (node['data'] && typeof node['data'] === 'object') {
          const data: JsonRecord = { ...(node['data'] as JsonRecord) }
          if (node['type'] === 'skill' && typeof data['skillId'] === 'string') {
            const remapped = skillIdMap.get(data['skillId'] as string)
            if (remapped) data['skillId'] = remapped
            else delete data['skillId']
          }
          if (node['type'] === 'agent') {
            data['status'] = 'idle'
            delete data['chainState']
            delete data['skipped']
            delete data['hasSchedule']
          }
          node['data'] = data
        }
        return node
      })

      const edges = bundle.edges.map((raw) => {
        const edge: JsonRecord = { ...raw }
        if (typeof edge['source'] === 'string') {
          edge['source'] = agentIdMap.get(edge['source'] as string) ?? edge['source']
        }
        if (typeof edge['target'] === 'string') {
          edge['target'] = agentIdMap.get(edge['target'] as string) ?? edge['target']
        }
        return edge
      })

      // ── 6. Persist the layout ────────────────────────────────────────────────
      await prisma.canvasLayout.create({
        data: {
          workspaceId: workspace.id,
          name: 'default',
          viewport: (bundle.viewport ?? { x: 0, y: 0, zoom: 1 }) as Prisma.InputJsonValue,
          nodes: nodes as unknown as Prisma.InputJsonValue,
          edges: edges as unknown as Prisma.InputJsonValue,
        },
      })

      const report: CanvasImportReport = {
        workspaceId: workspace.id,
        workspaceName,
        agentsCreated: createdAgentIds.length,
        skillsReused,
        skillsInstalled,
        skillsSkipped,
        mcpServersCreated,
        mcpServersReused,
        warnings,
      }

      sendSuccess(reply, report, 201)
    } catch (error) {
      // Roll back partial imports so a failure never leaves orphaned rows. MCP
      // servers created in this run aren't owned by the workspace/agents, so they
      // must be deleted explicitly (skills are deduped-by-name and reusable).
      if (createdAgentIds.length > 0) {
        await prisma.agent.deleteMany({ where: { id: { in: createdAgentIds } } }).catch(() => undefined)
      }
      if (createdWorkspaceId) {
        await prisma.workspace.delete({ where: { id: createdWorkspaceId } }).catch(() => undefined)
      }
      if (createdMcpServerIds.length > 0) {
        await prisma.mcpServer
          .deleteMany({ where: { id: { in: createdMcpServerIds } } })
          .catch(() => undefined)
      }
      sendError(reply, error)
    }
  })
}
