// Zod schemas + inferred types for every content catalog. These are the single
// validation seam: the build-time codegen (`scripts/build-catalog.ts`), the
// catalog tests, and any future marketplace "install" path all validate raw
// content against these schemas.
//
// IMPORTANT: this module imports Zod. Never re-export a *value* from here through
// `index.ts` — only `export type`. Values (the validated data) flow through
// `src/generated/catalog.data.ts`, which uses `import type` only, so Zod never
// reaches the UI bundle.

import { z } from 'zod'
import type { AgentPurpose, ModelTier, DiscussionFormat, AgentProviderId } from '@rondoflow/shared'
import { AGENT_TEMPLATE_CATEGORIES } from './constants'
export type { AgentTemplateCategory } from './constants'

// ─── Enums (kept ⊆ the canonical shared unions via `satisfies`) ─────────────────
// The `satisfies` checks fail to compile if a value here is not a valid member
// of the corresponding `@rondoflow/shared` union, catching drift at build time.

const AGENT_PURPOSES = [
  'writing',
  'coding',
  'analysis',
  'chat',
  'review',
  'research',
  'creative',
  'data',
  'general',
] as const satisfies readonly AgentPurpose[]

const MODEL_TIERS = ['opus', 'sonnet', 'haiku'] as const satisfies readonly ModelTier[]

const DISCUSSION_FORMATS = [
  'brainstorm',
  'review',
  'deliberation',
] as const satisfies readonly DiscussionFormat[]

const AGENT_PROVIDERS = [
  'claude-code',
  'openai',
  'perplexity',
] as const satisfies readonly AgentProviderId[]

const purposeSchema = z.enum(AGENT_PURPOSES)
const modelSchema = z.enum(MODEL_TIERS)
const discussionFormatSchema = z.enum(DISCUSSION_FORMATS)
const providerSchema = z.enum(AGENT_PROVIDERS)
const categorySchema = z.enum(AGENT_TEMPLATE_CATEGORIES)

/** Optional curated display order; lower sorts first. */
const orderSchema = z.number().int().nonnegative().default(0)

const providerConfigSchema = z.object({
  model: z.string(),
  webSearch: z.boolean(),
  deepResearch: z.boolean(),
  deepResearchModel: z.string().optional(),
})

const mcpSkillConfigSchema = z.object({
  type: z.literal('stdio'),
  command: z.string(),
  args: z.array(z.string()),
  env: z.record(z.string(), z.string()).optional(),
})

// ─── Agent templates ────────────────────────────────────────────────────────

export const agentTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  /** lucide-react icon name; resolved by the gallery's icon map. */
  icon: z.string(),
  category: categorySchema,
  purpose: purposeSchema,
  model: modelSchema,
  /** System prompt injected verbatim as the agent's persona. */
  persona: z.string(),
  scope: z.array(z.string()),
  allowedTools: z.array(z.string()),
  tags: z.array(z.string()),
  order: orderSchema,
})
export type AgentTemplate = z.infer<typeof agentTemplateSchema>

// ─── Facilitator presets ──────────────────────────────────────────────────────

export const facilitatorPresetSchema = z.object({
  id: z.string().min(1),
  /**
   * Deterministic, UUID-shaped id used for idempotent DB upserts in the seed.
   * Validated by shape (8-4-4-4-12 hex), not RFC version/variant bits — the
   * seed ids are synthetic (e.g. `f0000000-…-0001`), not real v4 UUIDs.
   */
  seedId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  name: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  model: modelSchema,
  recommendedFormats: z.array(discussionFormatSchema),
  persona: z.string(),
  tags: z.array(z.string()),
  order: orderSchema,
})
export type FacilitatorPreset = z.infer<typeof facilitatorPresetSchema>

// ─── Skill catalog ──────────────────────────────────────────────────────────

export const catalogSkillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  category: z.string(),
  author: z.string(),
  version: z.string(),
  icon: z.string(),
  /** Full SKILL.md content (frontmatter + body) injected into agent personas. */
  skillMdContent: z.string(),
  mcpConfig: mcpSkillConfigSchema.optional(),
  order: orderSchema,
})
export type CatalogSkill = z.infer<typeof catalogSkillSchema>

// ─── Workspace presets (multi-agent pipelines) ──────────────────────────────

const presetAgentSchema = z.object({
  /** Stable kebab-case id, unique within the preset; referenced by edges. */
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  persona: z.string(),
  purpose: purposeSchema,
  model: modelSchema,
  provider: providerSchema.optional(),
  providerConfig: providerConfigSchema.optional(),
  column: z.number().int(),
  row: z.number().int(),
})
export type PresetAgent = z.infer<typeof presetAgentSchema>

const presetEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
})
export type PresetEdge = z.infer<typeof presetEdgeSchema>

export const workspacePresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  category: z.string(),
  agents: z.array(presetAgentSchema),
  edges: z.array(presetEdgeSchema),
  order: orderSchema,
})
export type WorkspacePreset = z.infer<typeof workspacePresetSchema>

// ─── Canvas templates (declarative node/edge layouts) ───────────────────────
// Replaces the old imperative `load()` functions. The UI materializes these
// into React Flow nodes via `materializeCanvasTemplate`.

const canvasNodeSpecSchema = z.object({
  /** Local id, unique within the template; referenced by edges. */
  key: z.string().min(1),
  type: z.enum(['agent', 'skill']),
  position: z.object({ x: z.number(), y: z.number() }),
  name: z.string().min(1),
  description: z.string().optional(),
  model: modelSchema.optional(),
  purpose: purposeSchema.optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
})
export type CanvasNodeSpec = z.infer<typeof canvasNodeSpecSchema>

const canvasEdgeSpecSchema = z.object({
  source: z.string(),
  target: z.string(),
  edgeType: z.enum(['flow', 'association']),
})
export type CanvasEdgeSpec = z.infer<typeof canvasEdgeSpecSchema>

export const canvasTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  nodes: z.array(canvasNodeSpecSchema),
  edges: z.array(canvasEdgeSpecSchema),
  order: orderSchema,
})
export type CanvasTemplate = z.infer<typeof canvasTemplateSchema>
