import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { prisma } from '../lib/prisma'
import { recommendModel } from '@rondoflow/shared'
import { SKILL_CATALOG } from '@rondoflow/catalog'
import {
  DEFAULT_OPENAI_PROVIDER_CONFIG,
  DEFAULT_OPENAI_DEEP_RESEARCH_MODEL,
  DEFAULT_PERPLEXITY_PROVIDER_CONFIG,
  PERPLEXITY_DEEP_RESEARCH_MODEL,
  CLAUDE_MODELS,
  isApiProvider,
} from '@rondoflow/shared'
import type {
  AgentPurpose,
  ModelTier,
  AgentProviderId,
  ProviderConfig,
} from '@rondoflow/shared'
import { buildMcpConfig } from './mcp-config-builder'
import type { MergedMcpConfig } from './mcp-config-builder'
import { buildWorkspaceContext } from '../resources/resource-injector'

// Map ModelTier to the actual Claude model identifier used by the CLI
const MODEL_IDS: Record<ModelTier, string> = CLAUDE_MODELS

// Default tool allowlist when the agent has no explicit configuration
const DEFAULT_TOOLS: readonly string[] = [
  'Read',
  'Write',
  'Edit',
  'Bash',
  'Glob',
  'Grep',
  'LS',
  'WebFetch',
  'WebSearch',
  'TodoWrite',
  'TodoRead',
]

// Tools that are ALWAYS granted to every agent, no matter how its allowlist is
// configured. These read-only / research capabilities are treated as a safe
// baseline every agent should have, so they are merged into the resolved
// allowlist below — even when an agent narrows itself to a smaller set (e.g. a
// reviewer limited to Read/Grep/Glob still gets WebSearch and WebFetch).
export const ALWAYS_ALLOWED_TOOLS: readonly string[] = ['Read', 'WebSearch', 'WebFetch']

export interface BuildResult {
  readonly provider: AgentProviderId
  readonly providerConfig?: ProviderConfig
  readonly systemPrompt: string
  readonly appendSystemPrompt?: string
  readonly allowedTools: readonly string[]
  readonly model: string
  readonly permissionMode: string
  readonly maxBudgetUsd?: number
  readonly env: Record<string, string>
  readonly mcpConfig?: MergedMcpConfig
  readonly addDirs?: string[]
  readonly cwd?: string
}

export async function buildSpawnConfig(agentId: string, workspaceId?: string): Promise<BuildResult> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      skills: {
        where: { enabled: true },
        orderBy: { priority: 'asc' },
        include: { skill: true },
      },
      policies: true,
      memories: true,
      externalFolders: {
        where: { enabled: true },
        orderBy: [{ priority: 'asc' }, { externalFolderId: 'asc' }],
        include: { externalFolder: true },
      },
    },
  })

  if (!agent) {
    throw new Error(
      `Agent '${agentId}' not found in database. ` +
      'The agent may have been created while the server was offline. ' +
      'Try running the workflow again — it will auto-sync agents to the database.',
    )
  }

  // ------------------------------------------------------------------
  // 1. System prompt: persona + memories
  // ------------------------------------------------------------------
  const memorySections: string[] = []
  if (agent.memoryEnabled && agent.memories.length > 0) {
    memorySections.push('\n\n## Agent Memory\n')
    for (const mem of agent.memories) {
      memorySections.push(`- **${mem.key}**: ${mem.value}`)
    }
  }

  // Workspace-shared memory is always injected when workspace-scoped rows exist —
  // independent of agent.memoryEnabled, which gates only the agent's own tier.
  if (workspaceId) {
    const wsMemory = await buildWorkspaceMemorySection(workspaceId)
    if (wsMemory) memorySections.push(wsMemory)
  }

  const systemPrompt = [agent.persona, ...memorySections].join('')

  // ------------------------------------------------------------------
  // 2. Append prompt: enabled skills' SKILL.md content
  // ------------------------------------------------------------------
  const skillContents: string[] = []
  for (const agentSkill of agent.skills) {
    const skillContent = await loadSkillContent(agentSkill.skill.path, agentSkill.skill.name)
    if (skillContent !== null) {
      skillContents.push(`\n\n## Skill: ${agentSkill.skill.name}\n${skillContent}`)
    }
  }

  const appendSystemPrompt =
    skillContents.length > 0 ? skillContents.join('\n') : undefined

  // ------------------------------------------------------------------
  // 2b. Provider branch — API providers (OpenAI, Perplexity) run via an HTTP
  // API, not the CLI. They reuse persona + skills as the system prompt but skip
  // every Claude-CLI concern below (model mapping, allowedTools, MCP, external
  // folders, Claude credentials). The tools (web search / deep research) live
  // in providerConfig and are resolved at run time by the runner.
  // ------------------------------------------------------------------
  const provider = ((agent as { provider?: string }).provider ?? 'claude-code') as AgentProviderId

  if (isApiProvider(provider)) {
    const defaults =
      provider === 'perplexity' ? DEFAULT_PERPLEXITY_PROVIDER_CONFIG : DEFAULT_OPENAI_PROVIDER_CONFIG
    const deepResearchModel =
      provider === 'perplexity' ? PERPLEXITY_DEEP_RESEARCH_MODEL : DEFAULT_OPENAI_DEEP_RESEARCH_MODEL
    const apiKeyEnvVar = provider === 'perplexity' ? 'PERPLEXITY_API_KEY' : 'OPENAI_API_KEY'

    const stored = ((agent as { providerConfig?: unknown }).providerConfig ??
      {}) as Partial<ProviderConfig>
    const providerConfig: ProviderConfig = {
      model: stored.model ?? defaults.model,
      webSearch: stored.webSearch ?? defaults.webSearch,
      deepResearch: stored.deepResearch ?? defaults.deepResearch,
      ...(stored.deepResearchModel ? { deepResearchModel: stored.deepResearchModel } : {}),
    }
    // Resolved model is for usage labelling — the runner re-resolves it too.
    const modelId = providerConfig.deepResearch
      ? providerConfig.deepResearchModel ?? deepResearchModel
      : providerConfig.model

    const apiEnv: Record<string, string> = {}
    const apiKey = process.env[apiKeyEnvVar]
    if (apiKey) apiEnv[apiKeyEnvVar] = apiKey

    return {
      provider,
      providerConfig,
      systemPrompt,
      appendSystemPrompt,
      allowedTools: [],
      model: modelId,
      permissionMode: 'default',
      env: apiEnv,
    }
  }

  // ------------------------------------------------------------------
  // 3. Allowed tools
  // ------------------------------------------------------------------
  // Resolve the agent's configured allowlist (or the default set when it has
  // none), then guarantee the always-on baseline is present — appended so the
  // agent's own tools keep their order and no tool is duplicated.
  const configuredTools =
    agent.allowedTools.length > 0 ? [...agent.allowedTools] : [...DEFAULT_TOOLS]
  const allowedTools: string[] = [
    ...configuredTools,
    ...ALWAYS_ALLOWED_TOOLS.filter((tool) => !configuredTools.includes(tool)),
  ]

  // ------------------------------------------------------------------
  // 4. Model resolution
  // ------------------------------------------------------------------
  let modelId: string
  if (agent.model) {
    modelId = MODEL_IDS[agent.model as ModelTier] ?? agent.model
  } else if (agent.purpose) {
    const rec = recommendModel(agent.purpose as AgentPurpose)
    modelId = MODEL_IDS[rec.tier]
  } else {
    modelId = MODEL_IDS.sonnet
  }

  // ------------------------------------------------------------------
  // 5. Policy resolution — merge global + agent-level policies
  // ------------------------------------------------------------------
  const globalPolicies = await prisma.policy.findMany({
    where: { level: 'global' },
  })

  const allPolicies = [...globalPolicies, ...agent.policies]

  // Map AgentMode to CLI permission mode strings
  const AGENT_MODE_TO_PERMISSION: Record<string, string> = {
    plan: 'plan',
    default: 'default',
    edit: 'acceptEdits',
    // Full access — write files AND run git/bash without approval prompts.
    full: 'bypassPermissions',
  }

  // Start with the agent's own permissionMode setting
  let permissionMode = AGENT_MODE_TO_PERMISSION[agent.permissionMode] ?? 'default'
  let maxBudgetUsd: number | undefined

  for (const policy of allPolicies) {
    const rules = policy.rules as {
      permissionMode?: string
      maxBudgetUsd?: number
    }

    if (rules.permissionMode) {
      // Agent-level policy overrides global
      if (policy.level === 'agent' || policy.agentId === agentId) {
        permissionMode = rules.permissionMode
      } else if (permissionMode === 'default') {
        permissionMode = rules.permissionMode
      }
    }

    if (rules.maxBudgetUsd !== undefined) {
      if (maxBudgetUsd === undefined || rules.maxBudgetUsd < maxBudgetUsd) {
        // Take the most restrictive budget limit
        maxBudgetUsd = rules.maxBudgetUsd
      }
    }
  }

  // ------------------------------------------------------------------
  // 6. Isolated env vars — forward whichever Claude credential is configured.
  // The spawner resolves precedence (setup-token over API key) so only one
  // credential ultimately reaches the CLI.
  // ------------------------------------------------------------------
  const env: Record<string, string> = {}
  const oauthToken = process.env['CLAUDE_CODE_OAUTH_TOKEN']
  if (oauthToken) {
    env['CLAUDE_CODE_OAUTH_TOKEN'] = oauthToken
  }
  const anthropicKey = process.env['ANTHROPIC_API_KEY']
  if (anthropicKey) {
    env['ANTHROPIC_API_KEY'] = anthropicKey
  }

  // ------------------------------------------------------------------
  // 7. MCP config — merge skill + external server configs
  // ------------------------------------------------------------------
  const mcpConfig = await buildMcpConfig(agentId)

  if (mcpConfig.conflicts.length > 0) {
    for (const conflict of mcpConfig.conflicts) {
      console.warn(
        `[prompt-builder] MCP conflict detected for agent ${agentId}: ` +
          `server "${conflict.name}" defined by multiple sources: ${conflict.sources.join(', ')}`,
      )
    }
  }

  // If no MCP servers were found, omit the field entirely to keep SpawnOptions clean
  const hasMcpServers = Object.keys(mcpConfig.mcpServers).length > 0

  // ------------------------------------------------------------------
  // 8. Workspace context — inject resources if a workspaceId is provided
  // ------------------------------------------------------------------
  let addDirs: string[] | undefined
  let mergedAppendPrompt: string | undefined = appendSystemPrompt
  let cwd: string | undefined

  if (workspaceId) {
    try {
      const wsContext = await buildWorkspaceContext(workspaceId)

      if (wsContext.addDirs.length > 0) {
        addDirs = wsContext.addDirs
      }

      if (wsContext.appendPromptSections.length > 0) {
        const wsSection = wsContext.appendPromptSections.join('\n\n')
        mergedAppendPrompt = mergedAppendPrompt
          ? `${mergedAppendPrompt}\n\n${wsSection}`
          : wsSection
      }

      // Merge workspace env vars (agent env takes precedence)
      for (const [k, v] of Object.entries(wsContext.env)) {
        if (!(k in env)) {
          env[k] = v
        }
      }

      if (wsContext.cwd) {
        cwd = wsContext.cwd
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(
        `[prompt-builder] Failed to build workspace context for ${workspaceId}: ${message}`,
      )
      // Non-fatal — continue without workspace context
    }
  }

  // ------------------------------------------------------------------
  // 9. External folders — attached to the AGENT, independent of workspace.
  // Always added to addDirs so the agent can read/write/git over them. The
  // primary (first-by-priority) folder becomes cwd so git and relative
  // commands operate inside it — an agent's external folder takes precedence
  // over workspace.workingDirectory. Missing paths (a mount removed after
  // registration) are dropped here rather than crashing the run.
  // ------------------------------------------------------------------
  const folderPaths = (agent.externalFolders ?? [])
    .map((af) => af.externalFolder.containerPath)
    .filter((p) => existsSync(p))

  if (folderPaths.length > 0) {
    addDirs = [...new Set([...(addDirs ?? []), ...folderPaths])]
    cwd = folderPaths[0]
  }

  return {
    provider,
    systemPrompt,
    appendSystemPrompt: mergedAppendPrompt,
    allowedTools,
    model: modelId,
    permissionMode,
    maxBudgetUsd,
    env,
    ...(hasMcpServers ? { mcpConfig } : {}),
    ...(addDirs && addDirs.length > 0 ? { addDirs } : {}),
    ...(cwd ? { cwd } : {}),
  }
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/**
 * Renders the "## Workspace Memory" system-prompt section from workspace-scoped
 * memory rows. Best-effort — returns '' on any error so it never fails a spawn.
 */
async function buildWorkspaceMemorySection(workspaceId: string): Promise<string> {
  try {
    const rows = await prisma.memory.findMany({
      where: { workspaceId, scope: 'workspace' },
      orderBy: [{ pinned: 'desc' }, { importance: 'desc' }, { updatedAt: 'desc' }],
      take: 30,
    })
    if (rows.length === 0) return ''
    return ['\n\n## Workspace Memory\n', ...rows.map((m) => `- **${m.key}**: ${m.value}`)].join('')
  } catch {
    return ''
  }
}

async function loadSkillContent(skillPath: string, skillName?: string): Promise<string | null> {
  // Prefer the on-disk copy first — custom/git/imported skills live only on
  // disk (SKILL.md, then skill.md, then README.md).
  const candidates = [
    join(skillPath, 'SKILL.md'),
    join(skillPath, 'skill.md'),
    join(skillPath, 'README.md'),
  ]

  for (const candidate of candidates) {
    try {
      const content = await readFile(candidate, 'utf8')
      return content
    } catch {
      // File not found — try next
    }
  }

  // Fall back to the in-memory catalog by name. Catalog skills install lazily,
  // so the disk copy may not exist yet (never attached on this machine, or
  // ~/.rondoflow was cleared) — the catalog is the source of truth for them.
  if (skillName) {
    const entry = SKILL_CATALOG.find((s) => s.name === skillName)
    if (entry) return entry.skillMdContent
  }

  return null
}
