import { mkdir, cp, writeFile, readFile, rm, access } from 'fs/promises'
import { join } from 'path'
import { homedir, tmpdir } from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
import { prisma } from '../lib/prisma'
import { validateSkillDirectory, findSkillMd } from './validator'
import { type CatalogSkill } from '@rondoflow/catalog'
import type { Skill } from '@rondoflow/shared'

const execAsync = promisify(exec)

export interface InstallOptions {
  name: string
  source: 'marketplace' | 'git'
  gitUrl?: string
  catalogEntry?: CatalogSkill
}

export interface InstallResult {
  success: boolean
  skill?: Skill
  error?: string
}

// ---------------------------------------------------------------------------
// Directory helpers
// ---------------------------------------------------------------------------

export function getSkillsDirectory(): string {
  return join(homedir(), '.rondoflow', 'skills')
}

export async function ensureSkillsDirectory(): Promise<void> {
  const dir = getSkillsDirectory()
  await mkdir(dir, { recursive: true })
}

// ---------------------------------------------------------------------------
// Install
// ---------------------------------------------------------------------------

export async function installSkill(options: InstallOptions): Promise<InstallResult> {
  const { name, source } = options

  // [G21] Validate name before any filesystem operations
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return {
      success: false,
      error: `Invalid skill name "${name}" — only letters, digits, hyphens, and underscores are allowed`,
    }
  }

  if (source === 'marketplace') {
    return installMarketplaceSkill(name, options.catalogEntry)
  }

  if (source === 'git') {
    if (!options.gitUrl) {
      return { success: false, error: 'gitUrl is required for git source' }
    }
    return installGitSkill(name, options.gitUrl)
  }

  return { success: false, error: `Unknown source: ${source}` }
}

// ---------------------------------------------------------------------------
// Uninstall
// ---------------------------------------------------------------------------

export async function uninstallSkill(skillId: string): Promise<void> {
  const skill = await prisma.skill.findUnique({ where: { id: skillId } })
  if (!skill) {
    throw new Error(`Skill with id '${skillId}' not found`)
  }

  // Remove from DB first so it can't be referenced after filesystem removal
  await prisma.skill.delete({ where: { id: skillId } })

  // Best-effort removal of the skill directory
  try {
    await rm(skill.path, { recursive: true, force: true })
  } catch {
    // Log but don't re-throw — DB record is the source of truth
  }
}

// ---------------------------------------------------------------------------
// Marketplace install
// ---------------------------------------------------------------------------

async function installMarketplaceSkill(
  name: string,
  catalogEntry?: CatalogSkill,
): Promise<InstallResult> {
  if (!catalogEntry) {
    return { success: false, error: `No catalog entry provided for skill "${name}"` }
  }

  const skillDir = join(getSkillsDirectory(), name)

  try {
    // If already installed on disk, just ensure the DB record exists
    if (await pathExists(skillDir)) {
      const skill = await upsertSkillRecord({
        name: catalogEntry.name,
        description: catalogEntry.description,
        source: 'marketplace',
        path: skillDir,
        version: catalogEntry.version,
        author: catalogEntry.author,
        category: catalogEntry.category,
        icon: catalogEntry.icon,
        mcpConfig: catalogEntry.mcpConfig ?? null,
      })
      return { success: true, skill: toSkillDto(skill) }
    }

    await mkdir(skillDir, { recursive: true })
    await writeFile(join(skillDir, 'SKILL.md'), catalogEntry.skillMdContent, 'utf8')

    const validation = await validateSkillDirectory(skillDir)
    if (!validation.valid) {
      await rm(skillDir, { recursive: true, force: true })
      return { success: false, error: `Validation failed: ${validation.errors.join('; ')}` }
    }

    const skill = await upsertSkillRecord({
      name: catalogEntry.name,
      description: catalogEntry.description,
      source: 'marketplace',
      path: skillDir,
      version: catalogEntry.version,
      author: catalogEntry.author,
      category: catalogEntry.category,
      icon: catalogEntry.icon,
      mcpConfig: catalogEntry.mcpConfig ?? null,
    })

    return { success: true, skill: toSkillDto(skill) }
  } catch (err) {
    // Clean up partial install
    await rm(skillDir, { recursive: true, force: true }).catch(() => undefined)
    return { success: false, error: errorMessage(err) }
  }
}

// ---------------------------------------------------------------------------
// Custom install — user-authored skill written to ~/.rondoflow/skills/<name>
// ---------------------------------------------------------------------------

export interface CustomInstallOptions {
  name: string
  description: string
  category?: string
  /** The skill instructions (SKILL.md body); frontmatter is generated for them. */
  content: string
}

export async function installCustomSkill(options: CustomInstallOptions): Promise<InstallResult> {
  const { name, description, category, content } = options

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return {
      success: false,
      error: `Invalid skill name "${name}" — only letters, digits, hyphens, and underscores are allowed`,
    }
  }

  // Normalise frontmatter values to a single, quote-safe line. Reject inputs
  // that collapse to nothing — they would pass the route's min(1) check but then
  // produce empty frontmatter the validator rejects with a confusing error.
  const safeDescription = oneLineFrontmatterValue(description)
  if (!safeDescription) {
    return { success: false, error: 'Description must contain visible text' }
  }
  if (!content.trim()) {
    return { success: false, error: 'Instructions must not be empty' }
  }
  const safeCategory = category ? oneLineFrontmatterValue(category) : ''

  // Guard the source of truth (Skill.name is unique) — not just the filesystem.
  // Otherwise a custom skill could silently overwrite a marketplace/git row of
  // the same name whose directory happens to be absent, leaving a stale source.
  const existingRecord = await prisma.skill.findUnique({ where: { name } })
  if (existingRecord) {
    return { success: false, error: `A skill named "${name}" already exists` }
  }

  const skillDir = join(getSkillsDirectory(), name)
  if (await pathExists(skillDir)) {
    return { success: false, error: `Skill "${name}" is already installed` }
  }

  try {
    await mkdir(skillDir, { recursive: true })
    await writeFile(
      join(skillDir, 'SKILL.md'),
      buildSkillMd({
        name,
        description: safeDescription,
        category: safeCategory || undefined,
        content,
      }),
      'utf8',
    )

    const validation = await validateSkillDirectory(skillDir)
    if (!validation.valid) {
      await rm(skillDir, { recursive: true, force: true })
      return { success: false, error: `Validation failed: ${validation.errors.join('; ')}` }
    }

    // Source the DB record from the parsed metadata so it matches the on-disk
    // SKILL.md exactly (mirrors the git install path).
    const meta = validation.metadata!
    const skill = await upsertSkillRecord({
      name,
      description: meta.description,
      source: 'custom',
      path: skillDir,
      version: meta.version ?? '1.0.0',
      author: meta.author ?? 'custom',
      category: meta.category ?? null,
      icon: null,
      mcpConfig: null,
    })

    return { success: true, skill: toSkillDto(skill) }
  } catch (err) {
    await rm(skillDir, { recursive: true, force: true }).catch(() => undefined)
    return { success: false, error: errorMessage(err) }
  }
}

/**
 * Collapses a value to a single line and replaces double quotes with single
 * quotes so it can be safely wrapped in double quotes in the frontmatter (the
 * minimal YAML parser strips one surrounding quote pair). Returns '' when the
 * value is only whitespace.
 */
function oneLineFrontmatterValue(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').replace(/"/g, "'").trim()
}

/**
 * Assembles a valid SKILL.md from user input. `description`/`category` must be
 * pre-sanitised by {@link oneLineFrontmatterValue}; wrapping them in double
 * quotes makes the minimal YAML parser round-trip them back to the exact value
 * (and never to an empty string). The user's instructions follow as the body.
 * `author`/`version` default to the custom-skill markers but can be supplied to
 * preserve an existing skill's frontmatter when re-writing it on edit.
 */
function buildSkillMd(meta: {
  name: string
  description: string
  category?: string
  content: string
  author?: string
  version?: string
}): string {
  const author = oneLineFrontmatterValue(meta.author ?? '') || 'custom'
  const version = oneLineFrontmatterValue(meta.version ?? '') || '1.0.0'
  const lines = ['---', `name: ${meta.name}`, `description: "${meta.description}"`]
  if (meta.category) lines.push(`category: "${meta.category}"`)
  lines.push(`author: "${author}"`, `version: "${version}"`, '---', '', meta.content.trim(), '')
  return lines.join('\n')
}

/**
 * Strips a leading YAML frontmatter block, returning just the SKILL.md body —
 * the editable instructions. Mirrors {@link parseFrontmatter}'s delimiter match
 * in the validator so reading-for-edit and re-writing round-trip cleanly.
 */
function stripFrontmatter(md: string): string {
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').replace(/^\n+/, '')
}

// ---------------------------------------------------------------------------
// Read + update an installed skill's instructions (for the editor)
// ---------------------------------------------------------------------------

/**
 * Returns the editable SKILL.md body (frontmatter stripped) for an installed
 * skill, or `null` when the skill does not exist. A skill whose file is missing
 * yields an empty body rather than an error so the editor can still open.
 */
export async function getSkillContent(skillId: string): Promise<{ content: string } | null> {
  const skill = await prisma.skill.findUnique({ where: { id: skillId } })
  if (!skill) return null

  const mdPath = await findSkillMd(skill.path)
  if (!mdPath) return { content: '' }

  const raw = await readFile(mdPath, 'utf8').catch(() => '')
  return { content: stripFrontmatter(raw) }
}

export interface UpdateSkillOptions {
  id: string
  description?: string
  /** `''`/`null` clears the category; omitted leaves it unchanged. */
  category?: string | null
  content?: string
}

/**
 * Edits a user-owned skill (source 'custom' or 'git') in place: re-writes its
 * SKILL.md preserving the immutable name plus author/version, re-validates, and
 * syncs the DB row from the parsed metadata. Built-in marketplace skills are
 * read-only shipped content and are rejected. On validation failure the prior
 * SKILL.md is restored so a bad edit never corrupts an installed skill.
 */
export async function updateSkill(options: UpdateSkillOptions): Promise<InstallResult> {
  const existing = await prisma.skill.findUnique({ where: { id: options.id } })
  if (!existing) return { success: false, error: `Skill with id '${options.id}' not found` }
  if (existing.source === 'marketplace') {
    return { success: false, error: 'Built-in catalog skills cannot be edited' }
  }

  const description =
    options.description !== undefined
      ? oneLineFrontmatterValue(options.description)
      : existing.description
  if (!description) {
    return { success: false, error: 'Description must contain visible text' }
  }

  const category =
    options.category !== undefined
      ? options.category
        ? oneLineFrontmatterValue(options.category)
        : ''
      : existing.category ?? ''

  const mdPath = (await findSkillMd(existing.path)) ?? join(existing.path, 'SKILL.md')
  const originalMd = await readFile(mdPath, 'utf8').catch(() => null)

  const content = options.content !== undefined ? options.content : stripFrontmatter(originalMd ?? '')
  if (!content.trim()) {
    return { success: false, error: 'Instructions must not be empty' }
  }

  try {
    await mkdir(existing.path, { recursive: true })
    await writeFile(
      mdPath,
      buildSkillMd({
        name: existing.name,
        description,
        category: category || undefined,
        content,
        author: existing.author ?? undefined,
        version: existing.version ?? undefined,
      }),
      'utf8',
    )

    const validation = await validateSkillDirectory(existing.path)
    if (!validation.valid) {
      // Restore the prior SKILL.md so a rejected edit leaves the skill intact.
      if (originalMd !== null) await writeFile(mdPath, originalMd, 'utf8').catch(() => undefined)
      return { success: false, error: `Validation failed: ${validation.errors.join('; ')}` }
    }

    const meta = validation.metadata!
    const updated = await prisma.skill.update({
      where: { id: existing.id },
      data: {
        description: meta.description,
        category: meta.category ?? null,
      },
    })

    return { success: true, skill: toSkillDto(updated) }
  } catch (err) {
    if (originalMd !== null) await writeFile(mdPath, originalMd, 'utf8').catch(() => undefined)
    return { success: false, error: errorMessage(err) }
  }
}

// ---------------------------------------------------------------------------
// Git install  [G21]
// ---------------------------------------------------------------------------

async function installGitSkill(name: string, gitUrl: string): Promise<InstallResult> {
  const tempDir = join(tmpdir(), `rondoflow-skill-${name}-${Date.now()}`)
  const finalDir = join(getSkillsDirectory(), name)

  if (await pathExists(finalDir)) {
    return { success: false, error: `Skill "${name}" is already installed` }
  }

  try {
    await mkdir(tempDir, { recursive: true })

    // [G21] Security: no-checkout prevents executing hook scripts from the repo,
    // disabling hooksPath provides an additional guarantee against hook execution.
    await execAsync(
      `git clone --depth 1 --no-checkout --config core.hooksPath=/dev/null ${shellEscape(gitUrl)} ${shellEscape(tempDir)}`,
    )

    // Only check out the two safe files we actually need
    await execAsync(
      `git -C ${shellEscape(tempDir)} checkout HEAD -- SKILL.md rondoflow.json`,
    ).catch(() => {
      // rondoflow.json is optional — ignore if not present
    })

    // If SKILL.md was not checked out, try skill.md
    if (!(await pathExists(join(tempDir, 'SKILL.md')))) {
      await execAsync(
        `git -C ${shellEscape(tempDir)} checkout HEAD -- skill.md`,
      ).catch(() => undefined)
    }

    const validation = await validateSkillDirectory(tempDir)
    if (!validation.valid) {
      await rm(tempDir, { recursive: true, force: true })
      return { success: false, error: `Validation failed: ${validation.errors.join('; ')}` }
    }

    // Move validated content to final location
    await mkdir(finalDir, { recursive: true })
    await cp(tempDir, finalDir, { recursive: true })
    await rm(tempDir, { recursive: true, force: true })

    const meta = validation.metadata!

    const skill = await upsertSkillRecord({
      name: meta.name,
      description: meta.description,
      source: 'git',
      gitUrl,
      path: finalDir,
      version: meta.version ?? null,
      author: meta.author ?? null,
      category: meta.category ?? null,
      icon: meta.icon ?? null,
      mcpConfig: meta.mcpConfig ?? null,
    })

    return { success: true, skill: toSkillDto(skill) }
  } catch (err) {
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined)
    await rm(finalDir, { recursive: true, force: true }).catch(() => undefined)
    return { success: false, error: errorMessage(err) }
  }
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

interface SkillCreateData {
  name: string
  description: string
  source: 'marketplace' | 'git' | 'custom'
  gitUrl?: string
  path: string
  version?: string | null
  author?: string | null
  category?: string | null
  icon?: string | null
  mcpConfig?: object | null
}

async function upsertSkillRecord(data: SkillCreateData) {
  return prisma.skill.upsert({
    where: { name: data.name },
    create: {
      name: data.name,
      description: data.description,
      source: data.source,
      gitUrl: data.gitUrl ?? null,
      path: data.path,
      version: data.version ?? null,
      author: data.author ?? null,
      category: data.category ?? null,
      icon: data.icon ?? null,
      mcpConfig: data.mcpConfig ?? undefined,
    },
    update: {
      description: data.description,
      path: data.path,
      version: data.version ?? null,
      author: data.author ?? null,
      category: data.category ?? null,
      icon: data.icon ?? null,
      mcpConfig: data.mcpConfig ?? undefined,
    },
  })
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

/**
 * Minimal shell argument escaping — wraps the value in single quotes and
 * escapes any single quotes within the value. Only used for git command args.
 */
function shellEscape(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function toSkillDto(record: {
  id: string
  name: string
  description: string
  source: string
  gitUrl: string | null
  path: string
  version: string | null
  author: string | null
  category: string | null
  icon: string | null
  mcpConfig: unknown
  installedAt: Date
}): Skill {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    source: record.source as 'marketplace' | 'git' | 'custom',
    gitUrl: record.gitUrl,
    path: record.path,
    version: record.version,
    author: record.author,
    category: record.category,
    icon: record.icon,
    mcpConfig: record.mcpConfig as import('@rondoflow/shared').McpSkillConfig | null,
    installedAt: record.installedAt.toISOString(),
  }
}
