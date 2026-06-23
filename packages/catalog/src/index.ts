// @rondoflow/catalog — the single home for all shipped content catalogs
// (agent templates, facilitator presets, skills, workspace presets, canvas
// templates). The source of truth is the `content/` tree of JSON manifests +
// Markdown; `npm run catalog:build` validates it and regenerates the inlined
// data this entry point re-exports.
//
// This module is import-safe everywhere (browser included): it pulls in neither
// Zod nor the Node-only loader — only plain data and pure helpers.

// ─── Types (erased at runtime) ──────────────────────────────────────────────
export type {
  AgentTemplate,
  AgentTemplateCategory,
  FacilitatorPreset,
  CatalogSkill,
  WorkspacePreset,
  PresetAgent,
  PresetEdge,
  CanvasTemplate,
  CanvasNodeSpec,
  CanvasEdgeSpec,
} from './schema'

// ─── Static values ──────────────────────────────────────────────────────────
export { AGENT_TEMPLATE_CATEGORIES } from './constants'
export {
  AGENT_TEMPLATES,
  FACILITATOR_PRESETS,
  SKILL_CATALOG,
  WORKSPACE_PRESETS,
  CANVAS_TEMPLATES,
} from './generated/catalog.data'

// ─── Helpers ──────────────────────────────────────────────────────────────────
import type { AgentTemplate, FacilitatorPreset, WorkspacePreset } from './schema'
import { FACILITATOR_PRESETS, WORKSPACE_PRESETS } from './generated/catalog.data'

/** Look up a workspace preset by its stable `id`. */
export function findWorkspacePreset(id: string): WorkspacePreset | undefined {
  return WORKSPACE_PRESETS.find((p) => p.id === id)
}

/** Filter agent templates by a free-text query across name, description, category, and tags. */
export function filterAgentTemplates(
  templates: readonly AgentTemplate[],
  query: string,
): readonly AgentTemplate[] {
  const q = query.trim().toLowerCase()
  if (!q) return templates
  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)),
  )
}

/** Look up a facilitator preset by its stable `id`. */
export function findFacilitatorPreset(id: string): FacilitatorPreset | undefined {
  return FACILITATOR_PRESETS.find((p) => p.id === id)
}

/** Filter facilitator presets by a free-text query across name, description, and tags. */
export function filterFacilitatorPresets(
  presets: readonly FacilitatorPreset[],
  query: string,
): readonly FacilitatorPreset[] {
  const q = query.trim().toLowerCase()
  if (!q) return presets
  return presets.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q)),
  )
}
