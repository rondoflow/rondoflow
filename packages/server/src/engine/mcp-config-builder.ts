import { prisma } from '../lib/prisma'
import type { McpSkillConfig, McpTransport } from '@rondoflow/shared'
import { isRemoteMcpTransport } from '@rondoflow/shared'
import { decryptStoredAuth, parseStoredAuth, resolveAuthHeaders } from './mcp-auth'

/** A single MCP server entry, in the shape the Claude Code CLI's `--mcp-config`
 *  expects: `stdio` servers run a command, `http`/`sse` servers hit a URL. */
export type McpServerConfig =
  | {
      readonly type: 'stdio'
      readonly command: string
      readonly args: readonly string[]
      readonly env?: Readonly<Record<string, string>>
    }
  | {
      readonly type: 'http' | 'sse'
      readonly url: string
      readonly headers?: Readonly<Record<string, string>>
    }

export interface MergedMcpConfig {
  readonly mcpServers: Readonly<Record<string, McpServerConfig>>
  readonly conflicts: ReadonlyArray<{ readonly name: string; readonly sources: readonly string[] }>
}

// Signature key used to detect duplicate server definitions across different sources.
function serverSignature(config: McpServerConfig): string {
  return config.type === 'stdio'
    ? `stdio::${config.command}::${config.args.join(' ')}`
    : `${config.type}::${config.url}`
}

export async function buildMcpConfig(agentId: string): Promise<MergedMcpConfig> {
  // ------------------------------------------------------------------
  // 1. Load enabled skills that have an mcpConfig for this agent
  // ------------------------------------------------------------------
  const agentSkills = await prisma.agentSkill.findMany({
    where: { agentId, enabled: true },
    include: { skill: true },
    orderBy: { priority: 'asc' },
  })

  // ------------------------------------------------------------------
  // 2. Load externally assigned MCP servers for this agent
  // ------------------------------------------------------------------
  const agentMcpServers = await prisma.agentMcpServer.findMany({
    where: { agentId },
    include: { mcpServer: true },
  })

  // ------------------------------------------------------------------
  // 3. Build the merged map, tracking signature -> sources for conflict
  //    detection.
  // ------------------------------------------------------------------
  const mcpServers: Record<string, McpServerConfig> = {}

  // signature -> list of logical names that produced it
  const signatureToSources: Map<string, string[]> = new Map()

  function registerEntry(logicalName: string, config: McpServerConfig): void {
    const sig = serverSignature(config)
    const existing = signatureToSources.get(sig)
    if (existing) {
      existing.push(logicalName)
    } else {
      signatureToSources.set(sig, [logicalName])
    }
    mcpServers[logicalName] = config
  }

  // Skill-sourced MCP servers — namespaced as `{skillName}/{serverName}`
  for (const agentSkill of agentSkills) {
    const rawConfig = agentSkill.skill.mcpConfig
    if (!rawConfig) continue

    // mcpConfig on a Skill is stored as a single McpSkillConfig object
    // OR as a map of serverName -> McpSkillConfig. Support both shapes.
    if (isSkillConfigMap(rawConfig)) {
      for (const [serverName, cfg] of Object.entries(rawConfig)) {
        const skillCfg = cfg as McpSkillConfig
        const logicalName = `${agentSkill.skill.name}/${serverName}`
        registerEntry(logicalName, {
          type: 'stdio',
          command: skillCfg.command,
          args: skillCfg.args ?? [],
          ...(skillCfg.env ? { env: skillCfg.env } : {}),
        })
      }
    } else {
      // Single-server config stored directly on the skill
      const skillCfg = rawConfig as unknown as McpSkillConfig
      const logicalName = `${agentSkill.skill.name}/default`
      registerEntry(logicalName, {
        type: 'stdio',
        command: skillCfg.command,
        args: skillCfg.args ?? [],
        ...(skillCfg.env ? { env: skillCfg.env } : {}),
      })
    }
  }

  // External MCP servers — keep their plain registered name
  for (const assignment of agentMcpServers) {
    const srv = assignment.mcpServer
    const transport = (srv.type as McpTransport) ?? 'stdio'

    if (isRemoteMcpTransport(transport)) {
      // http/sse: resolve auth into request headers (OAuth2 does a cached token
      // exchange). A failing token exchange shouldn't kill unrelated servers —
      // log and skip this one.
      try {
        const headers = await resolveAuthHeaders(decryptStoredAuth(parseStoredAuth(srv.auth)))
        registerEntry(srv.name, {
          type: transport,
          url: srv.url ?? '',
          ...(Object.keys(headers).length > 0 ? { headers } : {}),
        })
      } catch (error) {
        console.warn(`[mcp] skipping server "${srv.name}" — auth resolution failed:`, error)
      }
      continue
    }

    const rawEnv = srv.env as Record<string, string> | null | undefined
    registerEntry(srv.name, {
      type: 'stdio',
      command: srv.command ?? '',
      args: srv.args,
      ...(rawEnv && Object.keys(rawEnv).length > 0 ? { env: rawEnv } : {}),
    })
  }

  // ------------------------------------------------------------------
  // 4. Build conflict list: signatures that appear more than once
  // ------------------------------------------------------------------
  const conflicts: Array<{ name: string; sources: string[] }> = []
  for (const [, sources] of signatureToSources) {
    if (sources.length > 1) {
      // Human-readable label for the duplicated definition.
      const proto = mcpServers[sources[0]!]!
      conflicts.push({
        name:
          proto.type === 'stdio'
            ? `${proto.command} ${proto.args.join(' ')}`.trim()
            : `${proto.type} ${proto.url}`,
        sources,
      })
    }
  }

  return { mcpServers, conflicts }
}

// ------------------------------------------------------------------
// Type guards
// ------------------------------------------------------------------

function isSkillConfigMap(raw: unknown): raw is Record<string, McpSkillConfig> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return false
  // A map-shaped config will NOT have a top-level `command` property;
  // a single McpSkillConfig will.
  return !('command' in raw)
}
