import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock fs/promises before importing the module under test so that the
// validator never touches the real filesystem.
// ---------------------------------------------------------------------------
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  access: vi.fn(),
}))

import { validateSkillDirectory } from '../validator'
import { readFile, access } from 'fs/promises'

const mockAccess = vi.mocked(access)
const mockReadFile = vi.mocked(readFile)

// ---------------------------------------------------------------------------
// Default SKILL.md content with valid frontmatter
// ---------------------------------------------------------------------------
const VALID_SKILL_MD = `---
name: my-skill
description: Does something useful
category: utilities
author: Jane
version: 1.0.0
---

# My Skill

Here is the skill content.
`

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupAccessForSkillMd(succeeds = true): void {
  if (succeeds) {
    mockAccess.mockResolvedValueOnce(undefined as never)
  } else {
    // All three candidates (SKILL.md, skill.md, README.md) fail
    mockAccess.mockRejectedValueOnce(new Error('ENOENT'))
    mockAccess.mockRejectedValueOnce(new Error('ENOENT'))
    mockAccess.mockRejectedValueOnce(new Error('ENOENT'))
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('validateSkillDirectory — path traversal', () => {
  it('rejects paths containing ".."', async () => {
    const result = await validateSkillDirectory('/skills/../etc/passwd')
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/\.\./)
  })

  it('rejects a pure ".." path', async () => {
    const result = await validateSkillDirectory('..')
    expect(result.valid).toBe(false)
  })
})

describe('validateSkillDirectory — missing SKILL.md', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns valid=false when no SKILL.md, skill.md, or README.md exists', async () => {
    setupAccessForSkillMd(false)

    const result = await validateSkillDirectory('/skills/my-skill')
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/SKILL\.md/)
  })
})

describe('validateSkillDirectory — valid directory with SKILL.md', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // access succeeds for SKILL.md
    mockAccess.mockResolvedValueOnce(undefined as never)
    // rondoflow.json does not exist
    mockReadFile.mockImplementation(async (path) => {
      const p = String(path)
      if (p.endsWith('SKILL.md')) return VALID_SKILL_MD as never
      throw new Error('ENOENT')
    })
  })

  it('returns valid=true for a well-formed skill directory', async () => {
    const result = await validateSkillDirectory('/skills/my-skill')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('parses name from frontmatter', async () => {
    const result = await validateSkillDirectory('/skills/my-skill')
    expect(result.metadata?.name).toBe('my-skill')
  })

  it('parses description from frontmatter', async () => {
    const result = await validateSkillDirectory('/skills/my-skill')
    expect(result.metadata?.description).toBe('Does something useful')
  })

  it('parses optional fields from frontmatter', async () => {
    const result = await validateSkillDirectory('/skills/my-skill')
    expect(result.metadata?.category).toBe('utilities')
    expect(result.metadata?.author).toBe('Jane')
    expect(result.metadata?.version).toBe('1.0.0')
  })
})

describe('validateSkillDirectory — invalid skill name', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAccess.mockResolvedValueOnce(undefined as never)
  })

  it('rejects a name containing special characters', async () => {
    const badNameMd = VALID_SKILL_MD.replace('name: my-skill', 'name: my skill!')
    mockReadFile.mockImplementation(async (path) => {
      if (String(path).endsWith('SKILL.md')) return badNameMd as never
      throw new Error('ENOENT')
    })

    const result = await validateSkillDirectory('/skills/bad-skill')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('invalid'))).toBe(true)
  })

  it('accepts names with letters, digits, hyphens, and underscores', async () => {
    const mdContent = VALID_SKILL_MD.replace('name: my-skill', 'name: My_Skill-42')
    mockReadFile.mockImplementation(async (path) => {
      if (String(path).endsWith('SKILL.md')) return mdContent as never
      throw new Error('ENOENT')
    })

    const result = await validateSkillDirectory('/skills/ok-skill')
    expect(result.valid).toBe(true)
  })
})

describe('validateSkillDirectory — missing required fields', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAccess.mockResolvedValueOnce(undefined as never)
  })

  it('returns error when name is missing', async () => {
    const noName = `---\ndescription: A skill\n---\n# Content`
    mockReadFile.mockImplementation(async (path) => {
      if (String(path).endsWith('SKILL.md')) return noName as never
      throw new Error('ENOENT')
    })

    const result = await validateSkillDirectory('/skills/no-name')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('name'))).toBe(true)
  })

  it('returns error when description is missing', async () => {
    const noDesc = `---\nname: some-skill\n---\n# Content`
    mockReadFile.mockImplementation(async (path) => {
      if (String(path).endsWith('SKILL.md')) return noDesc as never
      throw new Error('ENOENT')
    })

    const result = await validateSkillDirectory('/skills/no-desc')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('description'))).toBe(true)
  })
})

describe('validateSkillDirectory — rondoflow.json merges with frontmatter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAccess.mockResolvedValueOnce(undefined as never)
  })

  it('rondoflow.json values override frontmatter values', async () => {
    const rondoflowJson = JSON.stringify({
      name: 'overridden-name',
      description: 'Overridden description',
    })

    mockReadFile.mockImplementation(async (path) => {
      const p = String(path)
      if (p.endsWith('SKILL.md')) return VALID_SKILL_MD as never
      if (p.endsWith('rondoflow.json')) return rondoflowJson as never
      throw new Error('ENOENT')
    })

    const result = await validateSkillDirectory('/skills/merged-skill')
    expect(result.valid).toBe(true)
    expect(result.metadata?.name).toBe('overridden-name')
    expect(result.metadata?.description).toBe('Overridden description')
  })

  it('frontmatter values are preserved when rondoflow.json is absent', async () => {
    mockReadFile.mockImplementation(async (path) => {
      if (String(path).endsWith('SKILL.md')) return VALID_SKILL_MD as never
      throw new Error('ENOENT')
    })

    const result = await validateSkillDirectory('/skills/no-json')
    expect(result.metadata?.name).toBe('my-skill')
  })

  it('includes mcpConfig from rondoflow.json when present and valid', async () => {
    const rondoflowJson = JSON.stringify({
      name: 'mcp-skill',
      description: 'Has MCP config',
      mcpConfig: {
        type: 'stdio',
        command: 'npx',
        args: ['my-mcp-server'],
      },
    })

    mockReadFile.mockImplementation(async (path) => {
      const p = String(path)
      if (p.endsWith('SKILL.md')) return VALID_SKILL_MD as never
      if (p.endsWith('rondoflow.json')) return rondoflowJson as never
      throw new Error('ENOENT')
    })

    const result = await validateSkillDirectory('/skills/mcp-skill')
    expect(result.valid).toBe(true)
    expect(result.metadata?.mcpConfig).toBeDefined()
    expect(result.metadata?.mcpConfig?.command).toBe('npx')
    expect(result.metadata?.mcpConfig?.args).toEqual(['my-mcp-server'])
  })
})

describe('validateSkillDirectory — SKILL.md without frontmatter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAccess.mockResolvedValueOnce(undefined as never)
  })

  it('still validates against rondoflow.json when SKILL.md has no frontmatter', async () => {
    const noFrontmatter = '# Just content, no frontmatter here.'
    const rondoflowJson = JSON.stringify({ name: 'from-json', description: 'From JSON only' })

    mockReadFile.mockImplementation(async (path) => {
      const p = String(path)
      if (p.endsWith('SKILL.md')) return noFrontmatter as never
      if (p.endsWith('rondoflow.json')) return rondoflowJson as never
      throw new Error('ENOENT')
    })

    const result = await validateSkillDirectory('/skills/json-only')
    expect(result.valid).toBe(true)
    expect(result.metadata?.name).toBe('from-json')
  })
})
