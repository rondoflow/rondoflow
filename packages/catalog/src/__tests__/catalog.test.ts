import { describe, it, expect } from 'vitest'
import { loadCatalog } from '../loader'
import {
  AGENT_TEMPLATES,
  FACILITATOR_PRESETS,
  SKILL_CATALOG,
  WORKSPACE_PRESETS,
  CANVAS_TEMPLATES,
} from '../generated/catalog.data'

// Loading validates every manifest against its Zod schema (loader throws on a
// bad item), so a successful load is itself the validation assertion.
const loaded = loadCatalog()

describe('content validates + non-empty', () => {
  it('loads every group', () => {
    expect(loaded.agentTemplates.length).toBeGreaterThan(0)
    expect(loaded.facilitatorPresets.length).toBeGreaterThan(0)
    expect(loaded.skillCatalog.length).toBeGreaterThan(0)
    expect(loaded.workspacePresets.length).toBeGreaterThan(0)
    expect(loaded.canvasTemplates.length).toBeGreaterThan(0)
  })
})

describe('generated data is in sync with content/', () => {
  // Guards against editing `content/` without re-running `npm run catalog:build`.
  it('agent templates', () => expect(AGENT_TEMPLATES).toEqual(loaded.agentTemplates))
  it('facilitator presets', () => expect(FACILITATOR_PRESETS).toEqual(loaded.facilitatorPresets))
  it('skill catalog', () => expect(SKILL_CATALOG).toEqual(loaded.skillCatalog))
  it('workspace presets', () => expect(WORKSPACE_PRESETS).toEqual(loaded.workspacePresets))
  it('canvas templates', () => expect(CANVAS_TEMPLATES).toEqual(loaded.canvasTemplates))
})

describe('ids are unique within each group', () => {
  const groups = {
    agents: AGENT_TEMPLATES,
    facilitators: FACILITATOR_PRESETS,
    skills: SKILL_CATALOG,
    workspaces: WORKSPACE_PRESETS,
    'canvas-templates': CANVAS_TEMPLATES,
  }
  for (const [name, items] of Object.entries(groups)) {
    it(name, () => {
      const ids = items.map((i) => i.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  }
})

describe('facilitator seedIds are stable (DB upsert idempotency)', () => {
  // These ids key the global facilitator agents in the seed; changing them
  // would orphan the existing seeded rows. Locked to the original 8.
  it('matches the known seedIds', () => {
    const byId = Object.fromEntries(FACILITATOR_PRESETS.map((f) => [f.id, f.seedId]))
    expect(byId).toMatchObject({
      'socratic-facilitator': 'f0000000-0000-0000-0000-000000000001',
      'devils-advocate-facilitator': 'f0000000-0000-0000-0000-000000000002',
      'consensus-builder-facilitator': 'f0000000-0000-0000-0000-000000000003',
      'brainstorm-catalyst-facilitator': 'f0000000-0000-0000-0000-000000000004',
      'rigorous-critic-facilitator': 'f0000000-0000-0000-0000-000000000005',
      'neutral-synthesizer-facilitator': 'f0000000-0000-0000-0000-000000000006',
      'decisive-chair-facilitator': 'f0000000-0000-0000-0000-000000000007',
      'inclusive-moderator-facilitator': 'f0000000-0000-0000-0000-000000000008',
    })
    expect(new Set(FACILITATOR_PRESETS.map((f) => f.seedId)).size).toBe(FACILITATOR_PRESETS.length)
  })
})

describe('canvas template edges reference declared node keys', () => {
  for (const tpl of CANVAS_TEMPLATES) {
    it(tpl.id, () => {
      const keys = new Set(tpl.nodes.map((n) => n.key))
      for (const edge of tpl.edges) {
        expect(keys.has(edge.source)).toBe(true)
        expect(keys.has(edge.target)).toBe(true)
      }
    })
  }
})

describe('workspace preset edges reference declared agent keys', () => {
  for (const preset of WORKSPACE_PRESETS) {
    it(preset.id, () => {
      const keys = new Set(preset.agents.map((a) => a.key))
      for (const edge of preset.edges) {
        expect(keys.has(edge.from)).toBe(true)
        expect(keys.has(edge.to)).toBe(true)
      }
    })
  }
})
