import {
  AGENT_TEMPLATES,
  CANVAS_TEMPLATES,
  FACILITATOR_PRESETS,
  SKILL_CATALOG,
  WORKSPACE_PRESETS,
} from '@rondoflow/catalog'

// Display-only card shape. The catalog carries heavy fields (personas, full
// SKILL.md, edge specs) we deliberately drop here so they never reach the
// client bundle - only what the cards render and what search matches on crosses
// the boundary.
export type CatalogCardItem = {
  id: string
  name: string
  description: string
  icon: string
  badge?: string
}

export type CatalogGroupData = {
  key: string
  label: string
  /** Accent color used for the tab dot and the card icon tint. */
  accent: string
  blurb: string
  items: CatalogCardItem[]
}

// One entry per catalog group, built once on the server. Both the homepage
// overview (a capped preview) and the full `/catalog` browser read from here so
// the two never drift.
export const CATALOG_GROUPS: CatalogGroupData[] = [
  {
    key: 'agents',
    label: 'Agents',
    accent: '#3c83f5',
    blurb: 'Pre-built specialists - frontend, data, SEO, research, and more.',
    items: AGENT_TEMPLATES.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      badge: a.category,
    })),
  },
  {
    key: 'workspaces',
    label: 'Workspaces',
    accent: '#1b5fd1',
    blurb: 'Ready-made multi-agent pipelines you can drop onto the canvas.',
    items: WORKSPACE_PRESETS.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      icon: w.icon,
      badge: `${w.agents.length} agents`,
    })),
  },
  {
    key: 'skills',
    label: 'Skills',
    accent: '#21c45d',
    blurb: 'Reusable instruction sets to attach to any agent.',
    items: SKILL_CATALOG.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      badge: s.category,
    })),
  },
  {
    key: 'facilitators',
    label: 'Facilitators',
    accent: '#e7af08',
    blurb: 'Personalities that steer multi-agent discussions and reviews.',
    items: FACILITATOR_PRESETS.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      icon: f.icon,
      badge: f.recommendedFormats[0],
    })),
  },
  {
    key: 'templates',
    label: 'Canvas templates',
    accent: '#161616',
    blurb: 'Starter graphs that wire agents and skills together for you.',
    items: CANVAS_TEMPLATES.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      icon: c.icon,
      badge: `${c.nodes.length} nodes`,
    })),
  },
]

/** Total number of catalog items across every group. */
export const CATALOG_TOTAL = CATALOG_GROUPS.reduce((sum, g) => sum + g.items.length, 0)
