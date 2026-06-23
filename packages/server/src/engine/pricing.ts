// Model-aware token pricing for cost estimation.
//
// Used as a fallback when the Claude Code CLI does not report an authoritative
// `total_cost_usd` for a turn. When the CLI does provide it (the `result`
// event), that value wins — it already accounts for cache reads/writes, which a
// per-token estimate cannot.
//
// Rates are USD per million tokens, matched by model family substring so they
// hold across versions (e.g. "claude-opus-4-8", "opus", "claude-3-opus" all
// resolve to the Opus tier). The per-token conversion (÷ 1_000_000) is applied
// in estimateCostUsd, not in the constants below.

interface Rate {
  readonly input: number
  readonly output: number
}

// Per-million-token list prices (input / output).
const PRICING_PER_MTOK: Record<'opus' | 'sonnet' | 'haiku', Rate> = {
  opus: { input: 5, output: 25 },
  sonnet: { input: 3, output: 15 },
  haiku: { input: 1, output: 5 },
}

// Unknown models fall back to Sonnet-tier rates (the previous hardcoded default).
const DEFAULT_TIER: keyof typeof PRICING_PER_MTOK = 'sonnet'

function resolveTier(model: string | undefined): keyof typeof PRICING_PER_MTOK {
  const m = (model ?? '').toLowerCase()
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
