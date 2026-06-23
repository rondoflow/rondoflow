// Node-only catalog loader. Reads the `content/` tree, merges sidecar Markdown
// files into their manifests, validates each item against the Zod schemas, and
// returns sorted, typed arrays.
//
// This module touches the filesystem and imports Zod, so it must NEVER be
// imported by `index.ts` (the consumer entry point). It is used by the codegen
// script, the tests, and any future marketplace install path.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import {
  agentTemplateSchema,
  facilitatorPresetSchema,
  catalogSkillSchema,
  workspacePresetSchema,
  canvasTemplateSchema,
  type AgentTemplate,
  type FacilitatorPreset,
  type CatalogSkill,
  type WorkspacePreset,
  type CanvasTemplate,
} from './schema'

const CONTENT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content')

/** Sorted list of immediate child directory names under `content/<group>`. */
function listItemDirs(group: string): readonly string[] {
  const groupDir = join(CONTENT_ROOT, group)
  if (!existsSync(groupDir)) return []
  return readdirSync(groupDir)
    .filter((entry) => statSync(join(groupDir, entry)).isDirectory())
    .sort()
}

function readManifest(group: string, id: string): Record<string, unknown> {
  const file = join(CONTENT_ROOT, group, id, 'manifest.json')
  return JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
}

/**
 * Read a sidecar Markdown file.
 *
 * - `trailingNewline: false` (personas) → strip all trailing whitespace. A
 *   persona is injected as a system-prompt string; a trailing newline is noise.
 * - `trailingNewline: true` (SKILL.md) → normalize to exactly one trailing
 *   newline. The skill installer writes this back out as a `SKILL.md` file, so
 *   the conventional single terminating newline is preserved.
 */
function readSidecar(
  group: string,
  id: string,
  file: string,
  trailingNewline: boolean,
): string | undefined {
  const path = join(CONTENT_ROOT, group, id, file)
  if (!existsSync(path)) return undefined
  const raw = readFileSync(path, 'utf8')
  return trailingNewline ? `${raw.replace(/\s+$/, '')}\n` : raw.replace(/\s+$/, '')
}

/** Validate every item and report which directory failed, then sort. */
function loadGroup<T extends { id: string; order: number }>(
  group: string,
  schema: z.ZodType<T>,
  hydrate: (manifest: Record<string, unknown>, id: string) => Record<string, unknown>,
): readonly T[] {
  const items = listItemDirs(group).map((id) => {
    const raw = hydrate(readManifest(group, id), id)
    const result = schema.safeParse(raw)
    if (!result.success) {
      throw new Error(`Invalid catalog item "${group}/${id}": ${z.prettifyError(result.error)}`)
    }
    return result.data
  })
  return [...items].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
}

export function loadAgentTemplates(): readonly AgentTemplate[] {
  return loadGroup('agents', agentTemplateSchema, (m, id) => ({
    ...m,
    persona: readSidecar('agents', id, 'persona.md', false) ?? m.persona,
  }))
}

export function loadFacilitatorPresets(): readonly FacilitatorPreset[] {
  return loadGroup('facilitators', facilitatorPresetSchema, (m, id) => ({
    ...m,
    persona: readSidecar('facilitators', id, 'persona.md', false) ?? m.persona,
  }))
}

export function loadSkillCatalog(): readonly CatalogSkill[] {
  return loadGroup('skills', catalogSkillSchema, (m, id) => ({
    ...m,
    skillMdContent: readSidecar('skills', id, 'SKILL.md', true) ?? m.skillMdContent,
  }))
}

export function loadWorkspacePresets(): readonly WorkspacePreset[] {
  return loadGroup('workspaces', workspacePresetSchema, (m) => m)
}

export function loadCanvasTemplates(): readonly CanvasTemplate[] {
  return loadGroup('canvas-templates', canvasTemplateSchema, (m) => m)
}

export interface LoadedCatalog {
  readonly agentTemplates: readonly AgentTemplate[]
  readonly facilitatorPresets: readonly FacilitatorPreset[]
  readonly skillCatalog: readonly CatalogSkill[]
  readonly workspacePresets: readonly WorkspacePreset[]
  readonly canvasTemplates: readonly CanvasTemplate[]
}

/** Load and validate the entire catalog from `content/`. */
export function loadCatalog(): LoadedCatalog {
  return {
    agentTemplates: loadAgentTemplates(),
    facilitatorPresets: loadFacilitatorPresets(),
    skillCatalog: loadSkillCatalog(),
    workspacePresets: loadWorkspacePresets(),
    canvasTemplates: loadCanvasTemplates(),
  }
}
