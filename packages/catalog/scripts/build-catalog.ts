// Codegen: read + validate `content/`, then emit `src/generated/catalog.data.ts`
// with the validated data inlined. The generated file uses `import type` only,
// so the consumer entry point (`index.ts`) can re-export the data WITHOUT ever
// pulling Zod or the Node-only loader into the UI bundle.
//
// Run with: npm run catalog:build  (from repo root, or within this package).
// The output file is committed; the `generated-in-sync` test guards drift.

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCatalog } from '../src/loader'

const here = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(here, '..', 'src', 'generated')
const OUT_FILE = join(OUT_DIR, 'catalog.data.ts')

function constBlock(name: string, type: string, data: unknown): string {
  return `export const ${name}: readonly ${type}[] = ${JSON.stringify(data, null, 2)}\n`
}

function main(): void {
  const catalog = loadCatalog()

  const header = `// ⚠️ AUTO-GENERATED — DO NOT EDIT BY HAND.
// Regenerate with: npm run catalog:build
// Source of truth: packages/catalog/content/**
/* eslint-disable */

import type {
  AgentTemplate,
  FacilitatorPreset,
  CatalogSkill,
  WorkspacePreset,
  CanvasTemplate,
} from '../schema'
`

  const body = [
    constBlock('AGENT_TEMPLATES', 'AgentTemplate', catalog.agentTemplates),
    constBlock('FACILITATOR_PRESETS', 'FacilitatorPreset', catalog.facilitatorPresets),
    constBlock('SKILL_CATALOG', 'CatalogSkill', catalog.skillCatalog),
    constBlock('WORKSPACE_PRESETS', 'WorkspacePreset', catalog.workspacePresets),
    constBlock('CANVAS_TEMPLATES', 'CanvasTemplate', catalog.canvasTemplates),
  ].join('\n')

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT_FILE, `${header}\n${body}`, 'utf8')

  console.log(
    `catalog:build → ${OUT_FILE}\n` +
      `  agents=${catalog.agentTemplates.length}` +
      ` facilitators=${catalog.facilitatorPresets.length}` +
      ` skills=${catalog.skillCatalog.length}` +
      ` workspaces=${catalog.workspacePresets.length}` +
      ` canvas=${catalog.canvasTemplates.length}`,
  )
}

main()
