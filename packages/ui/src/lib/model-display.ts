// Shared display helpers for Claude model identifiers, used by the analytics
// and cost dashboards. Matching is by model family (substring) so colors and
// labels hold across versions: "claude-opus-4-8", "opus", "claude-3-opus" all
// resolve to the Opus tier.

const FAMILY_COLORS: ReadonlyArray<readonly [string, string]> = [
  ['opus', '#a78bfa'], // purple
  ['sonnet', '#60a5fa'], // blue
  ['haiku', '#34d399'], // emerald
]

const UNKNOWN_COLOR = '#94a3b8' // slate

export function getModelColor(model: string): string {
  const m = model.toLowerCase()
  for (const [family, color] of FAMILY_COLORS) {
    if (m.includes(family)) return color
  }
  return UNKNOWN_COLOR
}

export function formatModelLabel(model: string): string {
  if (model === 'unknown' || model.length === 0) return 'unknown'
  return model.replace(/^claude-/, '')
}
