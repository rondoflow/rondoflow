// Agent providers — the modular backend an agent runs on.
//
// Every agent has a `provider`. The default 'claude-code' provider spawns the
// Claude Code CLI (the original behavior). The 'openai' provider talks to the
// OpenAI Responses API directly and carries its own per-agent `providerConfig`
// (chat model + tool toggles). New providers slot in here + a runner factory on
// the server, without touching the chain/process execution wiring.

export type AgentProviderId = 'claude-code' | 'openai' | 'perplexity'

export const AGENT_PROVIDER_IDS = ['claude-code', 'openai', 'perplexity'] as const

export const DEFAULT_AGENT_PROVIDER: AgentProviderId = 'claude-code'

// Providers that run via an external HTTP API (not the Claude Code CLI) and
// therefore share the same per-agent config shape (model + tool toggles).
export const API_PROVIDERS: readonly AgentProviderId[] = ['openai', 'perplexity']

export function isApiProvider(provider: AgentProviderId | undefined): boolean {
  return provider === 'openai' || provider === 'perplexity'
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
export const OPENAI_MODELS: readonly OpenAIModelOption[] = [
  { id: 'gpt-5.1', label: 'GPT-5.1', description: 'Most capable general model' },
  { id: 'gpt-5', label: 'GPT-5', description: 'Flagship reasoning model' },
  { id: 'gpt-5-mini', label: 'GPT-5 mini', description: 'Balanced speed and quality' },
  { id: 'gpt-5-nano', label: 'GPT-5 nano', description: 'Fastest, most cost-efficient' },
] as const

export const OPENAI_DEFAULT_MODEL = 'gpt-5-mini'

// Deep-research models. When `deepResearch` is toggled on, the request is
// auto-switched to one of these and web search is forced on. Default = faster.
export const OPENAI_DEEP_RESEARCH_MODELS: readonly OpenAIModelOption[] = [
  { id: 'o4-mini-deep-research-2025-06-26', label: 'Deep Research (fast)' },
  { id: 'o3-deep-research-2025-06-26', label: 'Deep Research (thorough)' },
] as const

export const DEFAULT_OPENAI_DEEP_RESEARCH_MODEL = 'o4-mini-deep-research-2025-06-26'

// Per-agent config for an API-backed provider, stored in Agent.providerConfig
// (Json column). Shared by every API provider (OpenAI, Perplexity, …): a model
// id plus tool toggles. `webSearch` is ignored by providers whose model always
// searches (e.g. Perplexity Sonar). `deepResearch` auto-switches the request to
// the provider's deep-research model.
export interface ProviderConfig {
  readonly model: string // chat model id (ignored when deepResearch is on)
  readonly webSearch: boolean
  readonly deepResearch: boolean
  readonly deepResearchModel?: string // optional explicit deep-research override
}

/** @deprecated Use the provider-neutral {@link ProviderConfig}. */
export type OpenAIProviderConfig = ProviderConfig

export const DEFAULT_OPENAI_PROVIDER_CONFIG: ProviderConfig = {
  model: OPENAI_DEFAULT_MODEL,
  webSearch: false,
  deepResearch: false,
}

// ── Perplexity ───────────────────────────────────────────────────────────────
// Perplexity's Sonar API is OpenAI-compatible (chat completions) at
// https://api.perplexity.ai. Every Sonar model searches the web natively, so
// there is no separate web-search toggle — `deepResearch` switches to the
// dedicated deep-research model.

export const PERPLEXITY_MODELS: readonly OpenAIModelOption[] = [
  { id: 'sonar', label: 'Sonar', description: 'Fast, cost-effective search' },
  { id: 'sonar-pro', label: 'Sonar Pro', description: 'Production-quality multi-source synthesis' },
  { id: 'sonar-reasoning', label: 'Sonar Reasoning', description: 'Chain-of-thought reasoning' },
  { id: 'sonar-reasoning-pro', label: 'Sonar Reasoning Pro', description: 'Advanced analytical reasoning' },
] as const

export const PERPLEXITY_DEFAULT_MODEL = 'sonar'

export const PERPLEXITY_DEEP_RESEARCH_MODEL = 'sonar-deep-research'

export const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai'

export const DEFAULT_PERPLEXITY_PROVIDER_CONFIG: ProviderConfig = {
  model: PERPLEXITY_DEFAULT_MODEL,
  webSearch: true, // Sonar models always search; kept true for shape consistency
  deepResearch: false,
}

// Resolve the default provider config for any API provider.
export function defaultProviderConfig(provider: AgentProviderId): ProviderConfig | null {
  if (provider === 'openai') return DEFAULT_OPENAI_PROVIDER_CONFIG
  if (provider === 'perplexity') return DEFAULT_PERPLEXITY_PROVIDER_CONFIG
  return null
}

// Model catalog + deep-research model for an API provider (UI dropdowns + runtime).
export function providerModels(provider: AgentProviderId): readonly OpenAIModelOption[] {
  return provider === 'perplexity' ? PERPLEXITY_MODELS : OPENAI_MODELS
}
