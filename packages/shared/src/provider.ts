// Agent providers — the modular backend an agent runs on.
//
// Every agent has a `provider`. The default 'claude-code' provider spawns the
// Claude Code CLI (the original behavior). The 'openai' provider talks to the
// OpenAI Responses API directly and carries its own per-agent `providerConfig`
// (chat model + tool toggles). The 'codex' provider spawns OpenAI's Codex CLI —
// a full coding agent (files, shell, MCP) like Claude Code, configured through
// the same `providerConfig` shape. New providers slot in here + a runner factory
// on the server, without touching the chain/process execution wiring.

export type AgentProviderId = 'claude-code' | 'openai' | 'perplexity' | 'codex'

export const AGENT_PROVIDER_IDS = ['claude-code', 'openai', 'perplexity', 'codex'] as const

export const DEFAULT_AGENT_PROVIDER: AgentProviderId = 'claude-code'

// Providers that run via an external HTTP API (not the Claude Code CLI) and
// therefore share the same per-agent config shape (model + tool toggles).
export const API_PROVIDERS: readonly AgentProviderId[] = ['openai', 'perplexity']

export function isApiProvider(provider: AgentProviderId | undefined): boolean {
  return provider === 'openai' || provider === 'perplexity'
}

// Providers whose agents carry a per-agent `providerConfig` (model + tool
// toggles) instead of a Claude model tier: the API providers plus Codex.
export const CONFIGURABLE_PROVIDERS: readonly AgentProviderId[] = ['openai', 'perplexity', 'codex']

export function hasProviderConfig(provider: AgentProviderId | string | null | undefined): boolean {
  return provider === 'openai' || provider === 'perplexity' || provider === 'codex'
}

// Narrow an untrusted stored/serialized provider string; unknown → Claude Code.
export function toAgentProviderId(raw: string | null | undefined): AgentProviderId {
  return (AGENT_PROVIDER_IDS as readonly string[]).includes(raw ?? '')
    ? (raw as AgentProviderId)
    : DEFAULT_AGENT_PROVIDER
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

export interface OpenAIModelOption {
  readonly id: string
  readonly label: string
  readonly description?: string
}

// Curated chat models offered in the agent editor. The stored value is the raw
// model id sent to the Responses API, so the list can grow without code changes
// elsewhere.
// GPT-6 family as of Nov 2026 (developers.openai.com pricing + deprecations).
// gpt-5 / gpt-5-mini / gpt-5-nano shut down on Dec 11, 2026; the drawer still
// shows an agent's stored id when it isn't in this list.
export const OPENAI_MODELS: readonly OpenAIModelOption[] = [
  { id: 'gpt-6-astra', label: 'GPT-6 Astra', description: 'Most capable, for complex reasoning and research' },
  { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol', description: 'Near-Astra quality at lower cost' },
  { id: 'gpt-6.1-terra', label: 'GPT-6.1 Terra', description: 'Balanced speed and quality' },
  { id: 'gpt-6-luna', label: 'GPT-6 Luna', description: 'Fastest, most cost-efficient' },
] as const

export const OPENAI_DEFAULT_MODEL = 'gpt-6.1-terra'

// Deep-research models. OpenAI shut down its dedicated deep-research models
// (o3/o4-mini-deep-research) on Jul 23, 2026, so deep research now runs a
// frontier model with web search forced on and high reasoning effort.
// Default = faster.
export const OPENAI_DEEP_RESEARCH_MODELS: readonly OpenAIModelOption[] = [
  { id: 'gpt-6.1-sol', label: 'Deep Research (fast)' },
  { id: 'gpt-6-astra', label: 'Deep Research (thorough)' },
] as const

export const DEFAULT_OPENAI_DEEP_RESEARCH_MODEL = 'gpt-6.1-sol'

// Retired deep-research model ids, ignored if still stored as an override.
export const RETIRED_OPENAI_DEEP_RESEARCH_MODELS: readonly string[] = [
  'o3-deep-research',
  'o3-deep-research-2025-06-26',
  'o4-mini-deep-research',
  'o4-mini-deep-research-2025-06-26',
]

// Per-agent config for an API-backed provider, stored in Agent.providerConfig
// (Json column). Shared by every API provider (OpenAI, Perplexity, …): a model
// id plus tool toggles. `webSearch` is ignored by providers whose model always
// searches (e.g. Perplexity). `deepResearch` auto-switches the request to
// the provider's deep-research model.
export interface ProviderConfig {
  readonly model: string // chat model id (ignored when deepResearch is on)
  readonly webSearch: boolean
  readonly deepResearch: boolean
  readonly deepResearchModel?: string // optional explicit deep-research override
  // Codex only, resolved by the server at spawn time from the agent's permission
  // mode + policies (see codexSandboxForPermissionMode). Never persisted.
  readonly sandbox?: CodexSandboxMode
}

/** @deprecated Use the provider-neutral {@link ProviderConfig}. */
export type OpenAIProviderConfig = ProviderConfig

export const DEFAULT_OPENAI_PROVIDER_CONFIG: ProviderConfig = {
  model: OPENAI_DEFAULT_MODEL,
  webSearch: false,
  deepResearch: false,
}

// ── Perplexity ───────────────────────────────────────────────────────────────
// Perplexity's Agent API (POST https://api.perplexity.ai/v1/agent) replaced
// Sonar Chat Completions, whose support ended on Sep 27, 2026. A request names
// an `effort` level instead of a Sonar model; the level picks the underlying
// model, step budget and tools, and every level searches the web, so there is
// no web-search toggle. For Perplexity agents `providerConfig.model` holds the
// effort level, and `deepResearch` switches to the `high` level.

export const PERPLEXITY_MODELS: readonly OpenAIModelOption[] = [
  { id: 'fast', label: 'Fast', description: 'One quick search: facts, definitions, short summaries' },
  { id: 'low', label: 'Low', description: 'Everyday research with light multi-step lookups' },
  { id: 'medium', label: 'Medium', description: 'Multi-hop research across many sources' },
] as const

export const PERPLEXITY_DEFAULT_MODEL = 'fast'

export const PERPLEXITY_DEEP_RESEARCH_MODEL = 'high'

export const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai'

// Every effort level the Agent API accepts (a level may be pinned as
// `name@latest` or `name@<version>`).
const PERPLEXITY_EFFORT_LEVELS: ReadonlySet<string> = new Set([
  'fast',
  'low',
  'medium',
  'high',
  'xhigh',
  'ultra',
])

// Sonar model ids stored on agents created before the Agent API, mapped as in
// Perplexity's migration guide. sonar-reasoning (retired earlier) follows its
// Pro sibling.
const SONAR_MODEL_EFFORT: Readonly<Record<string, string>> = {
  sonar: 'fast',
  'sonar-pro': 'fast',
  'sonar-reasoning': 'low',
  'sonar-reasoning-pro': 'low',
  'sonar-deep-research': 'high',
}

/** The Agent API effort level for a stored Perplexity model value. */
export function perplexityEffort(value: string | null | undefined): string {
  if (!value) return PERPLEXITY_DEFAULT_MODEL
  if (PERPLEXITY_EFFORT_LEVELS.has(value.split('@')[0] ?? '')) return value
  return SONAR_MODEL_EFFORT[value] ?? PERPLEXITY_DEFAULT_MODEL
}

export const DEFAULT_PERPLEXITY_PROVIDER_CONFIG: ProviderConfig = {
  model: PERPLEXITY_DEFAULT_MODEL,
  webSearch: true, // every effort level searches; kept true for shape consistency
  deepResearch: false,
}

// ── Codex CLI ────────────────────────────────────────────────────────────────
// OpenAI's Codex CLI (`codex exec --json`) is an agentic coding CLI, the
// counterpart of Claude Code: it reads/edits files, runs shell commands inside
// an OS sandbox, and speaks MCP. Per-tool allowlists don't exist — access is
// governed by the sandbox mode, which the server derives from the agent's
// permission mode. `webSearch` toggles Codex's built-in web search tool;
// `deepResearch` does not apply and is always false.

export type CodexSandboxMode = 'read-only' | 'workspace-write' | 'danger-full-access'

// Current Codex models (OpenAI Codex models page, Nov 2026), default first.
// The last two are previous generations the CLI still serves. GPT-6.1 Terra
// needs codex-cli 0.159.0 or later.
export const CODEX_MODELS: readonly OpenAIModelOption[] = [
  { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol', description: 'Near-Astra performance at lower cost, for long-running tasks' },
  { id: 'gpt-6-astra', label: 'GPT-6 Astra', description: 'Most capable, for complex work across code, apps and research' },
  { id: 'gpt-6.1-terra', label: 'GPT-6.1 Terra', description: 'Fast and efficient: writing, visual understanding, computer use' },
  { id: 'gpt-6-luna', label: 'GPT-6 Luna', description: 'Most efficient, for focused high-volume tasks' },
  { id: 'gpt-6-sol', label: 'GPT-6 Sol', description: 'Previous generation' },
  { id: 'gpt-5.6-sol', label: 'GPT-5.6 Sol', description: 'Older generation' },
] as const

export const CODEX_DEFAULT_MODEL = 'gpt-6.1-sol'

export const DEFAULT_CODEX_PROVIDER_CONFIG: ProviderConfig = {
  model: CODEX_DEFAULT_MODEL,
  webSearch: false,
  deepResearch: false,
}

const SANDBOX_STRICTNESS: Record<CodexSandboxMode, number> = {
  'read-only': 0,
  'workspace-write': 1,
  'danger-full-access': 2,
}

/**
 * Map a Claude-style permission mode onto a Codex sandbox. Codex never prompts
 * (approval policy is always "never" headless), so the sandbox is the only
 * guard: plan → read-only, full access (bypassPermissions) → no sandbox, and
 * everything else → workspace-write (edit files in the working folder).
 */
export function codexSandboxForPermissionMode(mode: string | null | undefined): CodexSandboxMode {
  if (mode === 'plan') return 'read-only'
  if (mode === 'bypassPermissions' || mode === 'full') return 'danger-full-access'
  return 'workspace-write'
}

/** The more restrictive of two sandbox modes (policy: most restrictive wins). */
export function stricterCodexSandbox(a: CodexSandboxMode, b: CodexSandboxMode): CodexSandboxMode {
  return SANDBOX_STRICTNESS[a] <= SANDBOX_STRICTNESS[b] ? a : b
}

// Resolve the default provider config for any configurable provider.
export function defaultProviderConfig(provider: AgentProviderId): ProviderConfig | null {
  if (provider === 'openai') return DEFAULT_OPENAI_PROVIDER_CONFIG
  if (provider === 'perplexity') return DEFAULT_PERPLEXITY_PROVIDER_CONFIG
  if (provider === 'codex') return DEFAULT_CODEX_PROVIDER_CONFIG
  return null
}

// Model catalog for a configurable provider (UI dropdowns + runtime).
export function providerModels(provider: AgentProviderId): readonly OpenAIModelOption[] {
  if (provider === 'perplexity') return PERPLEXITY_MODELS
  if (provider === 'codex') return CODEX_MODELS
  return OPENAI_MODELS
}
