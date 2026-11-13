// Model-aware token pricing for cost estimation.
//
// Used as a fallback when the Claude Code CLI does not report an authoritative
// `total_cost_usd` for a turn. When the CLI does provide it (the `result`
// event), that value wins — it already accounts for cache reads/writes, which a
// per-token estimate cannot.
//
// Claude rates are USD per million tokens, matched by model family substring
// (e.g. "claude-opus-5-5", "opus" both resolve to the Opus tier). They are the
// current generation's list prices (Nov 2026: Fable 5.2, Opus 5.5, Sonnet 5.5,
// Haiku 5.5); older versions of a family are estimated at the same rate. The
// per-token conversion (÷ 1_000_000) is applied in estimateCostUsd, not in the
// constants below.

interface Rate {
  readonly input: number
  readonly output: number
}

type ClaudeTier = 'fable' | 'opus' | 'sonnet' | 'haiku'

// Per-million-token list prices (input / output). Haiku 5.5 is $0.10 / $0.50
// for prompts up to 100K tokens ($0.50 / $2.50 beyond); the short-prompt rate
// is used here.
const PRICING_PER_MTOK: Record<ClaudeTier, Rate> = {
  fable: { input: 8, output: 40 },
  opus: { input: 4, output: 20 },
  sonnet: { input: 2, output: 10 },
  haiku: { input: 0.1, output: 0.5 },
}

// Unknown models fall back to Sonnet-tier rates (the previous hardcoded default).
const DEFAULT_TIER: ClaudeTier = 'sonnet'

function resolveTier(model: string | undefined): ClaudeTier {
  const m = (model ?? '').toLowerCase()
  // Mythos is the verified-organization counterpart of Fable, priced the same.
  if (m.includes('fable') || m.includes('mythos')) return 'fable'
  if (m.includes('opus')) return 'opus'
  if (m.includes('haiku')) return 'haiku'
  if (m.includes('sonnet')) return 'sonnet'
  return DEFAULT_TIER
}

/**
 * Estimate the USD cost of a turn from its input/output token counts and the
 * model used. Prefer the CLI's reported `total_cost_usd` when available.
 */
export function estimateCostUsd(
  model: string | undefined,
  inputTokens: number,
  outputTokens: number,
): number {
  const rate = PRICING_PER_MTOK[resolveTier(model)]
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000
}

// ── OpenAI (Responses API runner + Codex CLI) ────────────────────────────────

export interface OpenAIRate extends Rate {
  readonly cachedInput: number
}

// Standard-tier list prices per 1M tokens (developers.openai.com pricing, Nov
// 2026; short-context rates). Used only to estimate cost — neither the
// Responses API nor Codex reports dollars, and a ChatGPT-plan Codex login
// isn't billed per token.
export const OPENAI_PRICING_PER_MTOK: Readonly<Record<string, OpenAIRate>> = {
  'gpt-6-astra': { input: 10, cachedInput: 1, output: 50 },
  'gpt-6.1-sol': { input: 2, cachedInput: 0.1, output: 10 },
  'gpt-6.1-terra': { input: 1, cachedInput: 0.05, output: 5 },
  'gpt-6-luna': { input: 0.1, cachedInput: 0.01, output: 0.5 },
  'gpt-6-sol': { input: 2, cachedInput: 0.2, output: 10 },
  'gpt-5.6-sol': { input: 4, cachedInput: 0.4, output: 20 },
  'gpt-5.1': { input: 1.25, cachedInput: 0.125, output: 10 },
  'gpt-5': { input: 1.25, cachedInput: 0.125, output: 10 },
  'gpt-5-mini': { input: 0.25, cachedInput: 0.025, output: 2 },
  'gpt-5-nano': { input: 0.05, cachedInput: 0.005, output: 0.4 },
  'gpt-4.1': { input: 2, cachedInput: 0.5, output: 8 },
  'gpt-4.1-mini': { input: 0.4, cachedInput: 0.1, output: 1.6 },
  'gpt-4o': { input: 2.5, cachedInput: 1.25, output: 10 },
}

// Unknown OpenAI models are estimated at the default Codex / mid-tier rate.
export const OPENAI_FALLBACK_RATE: OpenAIRate = OPENAI_PRICING_PER_MTOK['gpt-6.1-sol']!

export function openaiRate(model: string | undefined): OpenAIRate {
  return (model && OPENAI_PRICING_PER_MTOK[model]) || OPENAI_FALLBACK_RATE
}
