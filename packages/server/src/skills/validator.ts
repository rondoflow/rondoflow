import { readFile, access } from 'fs/promises'
import { join } from 'path'
import type { McpSkillConfig } from '@rondoflow/shared'

export interface SkillMetadata {
  name: string
  description: string
  category?: string
  author?: string
  version?: string
  icon?: string
  mcpConfig?: McpSkillConfig
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  metadata?: SkillMetadata
}

const VALID_NAME_RE = /^[a-zA-Z0-9_-]+$/

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function validateSkillDirectory(dirPath: string): Promise<ValidationResult> {
  const errors: string[] = []

  // [G21] Prevent path traversal
  if (dirPath.includes('..')) {
    return { valid: false, errors: ['Path must not contain ".."'] }
  }

  // Locate SKILL.md (or fallbacks)
  const skillMdPath = await findSkillMd(dirPath)
  if (!skillMdPath) {
    return {
      valid: false,
      errors: ['No SKILL.md, skill.md, or README.md found in skill directory'],
    }
  }

  let skillMdContent: string
  try {
    skillMdContent = await readFile(skillMdPath, 'utf8')
  } catch (err) {
    return {
      valid: false,
      errors: [`Failed to read ${skillMdPath}: ${errorMessage(err)}`],
    }
  }

  // Parse frontmatter metadata from SKILL.md
  const frontmatterMeta = parseFrontmatter(skillMdContent)

  // Parse optional rondoflow.json
  const rondoflowJson = await loadrondoflowJson(dirPath)

  // Merge: rondoflow.json values take precedence over frontmatter
  const merged: Partial<SkillMetadata> = { ...frontmatterMeta, ...rondoflowJson }

  // Validate skill name
  if (merged.name) {
    if (!VALID_NAME_RE.test(merged.name)) {
      errors.push(
        `Skill name "${merged.name}" is invalid — only letters, digits, hyphens, and underscores are allowed`,
      )
    }
  } else {
    errors.push('Skill name is required (set in SKILL.md frontmatter or rondoflow.json)')
  }

  // description is required
  if (!merged.description) {
    errors.push('Skill description is required (set in SKILL.md frontmatter or rondoflow.json)')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: [],
    metadata: merged as SkillMetadata,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function findSkillMd(dirPath: string): Promise<string | null> {
  const candidates = [
    join(dirPath, 'SKILL.md'),
    join(dirPath, 'skill.md'),
    join(dirPath, 'README.md'),
  ]

  for (const candidate of candidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // not found — try next
    }
  }

  return null
}

function parseFrontmatter(content: string): Partial<SkillMetadata> {
  // Match YAML front matter between --- delimiters
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) {
    return {}
  }

  return parseYamlSubset(match[1])
}

/**
 * Parses a minimal YAML subset — simple key: value pairs only.
 * No external YAML library dependency required for this use case.
 */
function parseYamlSubset(yaml: string): Partial<SkillMetadata> {
  const result: Record<string, unknown> = {}

  for (const line of yaml.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue

    const key = trimmed.slice(0, colonIdx).trim()
    let value = trimmed.slice(colonIdx + 1).trim()

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (value) {
      result[key] = value
    }
  }

  return {
    name: typeof result['name'] === 'string' ? result['name'] : undefined,
    description: typeof result['description'] === 'string' ? result['description'] : undefined,
    category: typeof result['category'] === 'string' ? result['category'] : undefined,
    author: typeof result['author'] === 'string' ? result['author'] : undefined,
    version: typeof result['version'] === 'string' ? result['version'] : undefined,
    icon: typeof result['icon'] === 'string' ? result['icon'] : undefined,
  }
}

async function loadrondoflowJson(dirPath: string): Promise<Partial<SkillMetadata>> {
  const rondoflowPath = join(dirPath, 'rondoflow.json')

  try {
    const raw = await readFile(rondoflowPath, 'utf8')
    const parsed: unknown = JSON.parse(raw)

    if (typeof parsed !== 'object' || parsed === null) {
      return {}
    }

    const obj = parsed as Record<string, unknown>

    const result: Partial<SkillMetadata> = {}

    if (typeof obj['name'] === 'string') result.name = obj['name']
    if (typeof obj['description'] === 'string') result.description = obj['description']
    if (typeof obj['category'] === 'string') result.category = obj['category']
    if (typeof obj['author'] === 'string') result.author = obj['author']
    if (typeof obj['version'] === 'string') result.version = obj['version']
    if (typeof obj['icon'] === 'string') result.icon = obj['icon']

    // mcpConfig: validate shape matches McpSkillConfig
    if (obj['mcpConfig'] && typeof obj['mcpConfig'] === 'object') {
      const mcp = obj['mcpConfig'] as Record<string, unknown>
      if (
        mcp['type'] === 'stdio' &&
        typeof mcp['command'] === 'string' &&
        Array.isArray(mcp['args']) &&
        (mcp['args'] as unknown[]).every((a) => typeof a === 'string')
      ) {
        result.mcpConfig = {
          type: 'stdio',
          command: mcp['command'] as string,
          args: mcp['args'] as string[],
          env:
            typeof mcp['env'] === 'object' && mcp['env'] !== null
              ? (mcp['env'] as Record<string, string>)
              : undefined,
        }
      }
    }

    return result
  } catch {
    // rondoflow.json is optional — silently ignore missing or invalid
    return {}
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
