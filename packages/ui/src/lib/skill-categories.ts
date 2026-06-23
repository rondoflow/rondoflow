// Centralized skill-category presentation helpers, shared by the skill
// marketplace, the skill detail view, and the agent skills tab (which each used
// to keep their own divergent `CATEGORY_COLORS` copy).
//
// Catalog categories are free-form strings (e.g. "AI & Agents",
// "Finance & Crypto"), so beyond the curated map every unknown category gets a
// deterministic color from a fixed palette — stable across renders and visually
// distinct — instead of all collapsing to the neutral gray.

export interface CategoryCount {
  readonly name: string
  readonly count: number
}

/** Curated colors for the catalog's actual top-level categories (+ legacy short labels). */
const CURATED_COLORS: Record<string, string> = {
  'AI & Agents': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  'Finance & Crypto': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Community: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  'Reasoning & Thinking': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  'Data & Analytics': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  Media: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  Productivity: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Development: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Communication: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'DevOps & Infra': 'bg-slate-500/15 text-slate-300 border-slate-500/20',
  'Content & Writing': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'Web & Scraping': 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  Marketing: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Integrations: 'bg-lime-500/15 text-lime-400 border-lime-500/20',
  // Legacy short labels still used by some user-authored skills.
  Writing: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Analysis: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Research: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  Data: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
}

// Each entry is a complete, literal class string so Tailwind's JIT scanner picks
// them up (no dynamic class construction).
const FALLBACK_PALETTE: readonly string[] = [
  'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'bg-teal-500/15 text-teal-400 border-teal-500/20',
  'bg-rose-500/15 text-rose-400 border-rose-500/20',
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'bg-sky-500/15 text-sky-400 border-sky-500/20',
  'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20',
  'bg-lime-500/15 text-lime-400 border-lime-500/20',
]

const NEUTRAL = 'bg-muted text-muted-foreground border-border'

/** Small, stable string hash (djb2-ish) for picking a palette slot. */
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Badge classes for a category — curated, else a deterministic palette color, else neutral. */
export function getCategoryColor(category: string | null | undefined): string {
  if (!category) return NEUTRAL
  return CURATED_COLORS[category] ?? FALLBACK_PALETTE[hashString(category) % FALLBACK_PALETTE.length]
}

/**
 * Tally the distinct categories present across a set of skills, most-frequent
 * first (ties broken alphabetically). Drives the browse filter chips and the
 * editor's category suggestions, so the list always reflects the real installed
 * catalog instead of a hardcoded, drift-prone set. Null/blank categories are
 * skipped.
 */
export function deriveCategories(
  skills: ReadonlyArray<{ readonly category: string | null }>,
): readonly CategoryCount[] {
  const counts = new Map<string, number>()
  for (const skill of skills) {
    const category = skill.category?.trim()
    if (!category) continue
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
