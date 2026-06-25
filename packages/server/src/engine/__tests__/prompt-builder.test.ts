import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock Prisma before importing the module under test
// ---------------------------------------------------------------------------
vi.mock('../../lib/prisma', () => ({
  prisma: {
    agent: {
      findUnique: vi.fn(),
    },
    policy: {
      findMany: vi.fn(),
    },
    memory: {
      findMany: vi.fn(),
    },
  },
}))

// Mock mcp-config-builder so we don't hit Prisma through it
vi.mock('../mcp-config-builder', () => ({
  buildMcpConfig: vi.fn().mockResolvedValue({ mcpServers: {}, conflicts: [] }),
}))

// Mock workspace context injection so a workspaceId doesn't hit Prisma/fs
vi.mock('../../resources/resource-injector', () => ({
  buildWorkspaceContext: vi.fn().mockResolvedValue({
    addDirs: [],
    appendPromptSections: [],
    env: {},
    cwd: undefined,
  }),
}))

// Mock fs/promises so we never touch the real filesystem
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}))

import { buildSpawnConfig } from '../prompt-builder'
import { prisma } from '../../lib/prisma'
import { readFile } from 'fs/promises'

const mockFindUnique = vi.mocked(prisma.agent.findUnique)
const mockPolicyFindMany = vi.mocked(prisma.policy.findMany)
const mockMemoryFindMany = vi.mocked(prisma.memory.findMany)
const mockReadFile = vi.mocked(readFile)

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeAgent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'agent-1',
    name: 'Test Agent',
    persona: 'You are a helpful assistant.',
    purpose: null,
    model: null,
    memoryEnabled: false,
    allowedTools: [],
    memories: [],
    skills: [],
    policies: [],
    ...overrides,
  }
}

function makeSkillAttachment(name: string, path: string, content: string) {
  return {
    priority: 1,
    skill: { id: `skill-${name}`, name, path, mcpConfig: null },
    _content: content, // used in test setup only
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildSpawnConfig — agent not found', () => {
  it('throws an error when agent does not exist', async () => {
    mockFindUnique.mockResolvedValueOnce(null as never)
    mockPolicyFindMany.mockResolvedValueOnce([] as never)

    await expect(buildSpawnConfig('missing-agent')).rejects.toThrow("Agent 'missing-agent' not found")
  })
})

describe('buildSpawnConfig — system prompt construction', () => {
  beforeEach(() => {
    mockPolicyFindMany.mockResolvedValue([] as never)
    mockReadFile.mockRejectedValue(new Error('ENOENT'))
  })

  it('system prompt equals persona when no memories', async () => {
    const agent = makeAgent({ persona: 'I am a coder.' })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.systemPrompt).toBe('I am a coder.')
  })

  it('appends memories to system prompt when memoryEnabled=true', async () => {
    const agent = makeAgent({
      persona: 'Base persona.',
      memoryEnabled: true,
      memories: [
        { key: 'language', value: 'TypeScript' },
        { key: 'style', value: 'functional' },
      ],
    })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.systemPrompt).toContain('Base persona.')
    expect(result.systemPrompt).toContain('Agent Memory')
    expect(result.systemPrompt).toContain('language')
    expect(result.systemPrompt).toContain('TypeScript')
    expect(result.systemPrompt).toContain('style')
    expect(result.systemPrompt).toContain('functional')
  })

  it('does not add memory section when memoryEnabled=false', async () => {
    const agent = makeAgent({
      memoryEnabled: false,
      memories: [{ key: 'hidden', value: 'should not appear' }],
    })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.systemPrompt).not.toContain('Agent Memory')
    expect(result.systemPrompt).not.toContain('hidden')
  })
})

describe('buildSpawnConfig — workspace memory injection', () => {
  beforeEach(() => {
    mockPolicyFindMany.mockResolvedValue([] as never)
    mockReadFile.mockRejectedValue(new Error('ENOENT'))
    mockMemoryFindMany.mockReset()
  })

  it('injects "## Workspace Memory" from workspace-scoped rows when a workspaceId is given', async () => {
    mockFindUnique.mockResolvedValueOnce(makeAgent({ persona: 'Base.' }) as never)
    mockMemoryFindMany.mockResolvedValueOnce([
      { key: 'stack', value: 'Next.js + Fastify' },
      { key: 'db', value: 'Postgres 16' },
    ] as never)

    const result = await buildSpawnConfig('agent-1', 'ws-1')
    expect(result.systemPrompt).toContain('Workspace Memory')
    expect(result.systemPrompt).toContain('stack')
    expect(result.systemPrompt).toContain('Postgres 16')
    // The workspace query must be scoped to scope: 'workspace'
    const whereArg = (mockMemoryFindMany.mock.calls[0]![0] as { where: Record<string, unknown> }).where
    expect(whereArg).toMatchObject({ workspaceId: 'ws-1', scope: 'workspace' })
  })

  it('adds no workspace section when there are no workspace rows', async () => {
    mockFindUnique.mockResolvedValueOnce(makeAgent({ persona: 'Base.' }) as never)
    mockMemoryFindMany.mockResolvedValueOnce([] as never)

    const result = await buildSpawnConfig('agent-1', 'ws-1')
    expect(result.systemPrompt).toBe('Base.')
    expect(result.systemPrompt).not.toContain('Workspace Memory')
  })

  it('does not query workspace memory when no workspaceId is provided', async () => {
    mockFindUnique.mockResolvedValueOnce(makeAgent({ persona: 'Base.' }) as never)

    await buildSpawnConfig('agent-1')
    expect(mockMemoryFindMany).not.toHaveBeenCalled()
  })
})

describe('buildSpawnConfig — skill content in appendSystemPrompt', () => {
  beforeEach(() => {
    mockPolicyFindMany.mockResolvedValue([] as never)
  })

  it('appendSystemPrompt is undefined when no skills', async () => {
    mockFindUnique.mockResolvedValueOnce(makeAgent({ skills: [] }) as never)
    mockReadFile.mockRejectedValue(new Error('ENOENT'))

    const result = await buildSpawnConfig('agent-1')
    expect(result.appendSystemPrompt).toBeUndefined()
  })

  it('includes skill content in appendSystemPrompt when skill SKILL.md is readable', async () => {
    const skillContent = '# My Skill\nDo things well.'
    const skillAttachment = {
      priority: 1,
      skill: { id: 'skill-1', name: 'my-skill', path: '/skills/my-skill', mcpConfig: null },
    }
    const agent = makeAgent({ skills: [skillAttachment] })
    mockFindUnique.mockResolvedValueOnce(agent as never)
    // First readFile call succeeds with skill content
    mockReadFile.mockResolvedValueOnce(skillContent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.appendSystemPrompt).toBeDefined()
    expect(result.appendSystemPrompt).toContain('my-skill')
    expect(result.appendSystemPrompt).toContain(skillContent)
  })

  it('omits appendSystemPrompt when skill file is not readable', async () => {
    const skillAttachment = {
      priority: 1,
      skill: { id: 'skill-1', name: 'bad-skill', path: '/skills/bad', mcpConfig: null },
    }
    const agent = makeAgent({ skills: [skillAttachment] })
    mockFindUnique.mockResolvedValueOnce(agent as never)
    // All three candidate paths (SKILL.md, skill.md, README.md) fail
    mockReadFile
      .mockRejectedValueOnce(new Error('ENOENT'))
      .mockRejectedValueOnce(new Error('ENOENT'))
      .mockRejectedValueOnce(new Error('ENOENT'))

    const result = await buildSpawnConfig('agent-1')
    expect(result.appendSystemPrompt).toBeUndefined()
  })
})

describe('buildSpawnConfig — model resolution', () => {
  beforeEach(() => {
    mockPolicyFindMany.mockResolvedValue([] as never)
    mockReadFile.mockRejectedValue(new Error('ENOENT'))
  })

  it('uses the explicit model from agent when set', async () => {
    const agent = makeAgent({ model: 'opus' })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.model).toBe('claude-opus-4-8')
  })

  it('uses purpose-based recommendation when model is null', async () => {
    const agent = makeAgent({ model: null, purpose: 'analysis' })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    // analysis → opus
    expect(result.model).toBe('claude-opus-4-8')
  })

  it('defaults to sonnet when both model and purpose are null', async () => {
    const agent = makeAgent({ model: null, purpose: null })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.model).toBe('claude-sonnet-4-6')
  })

  it('uses haiku model when purpose=chat', async () => {
    const agent = makeAgent({ model: null, purpose: 'chat' })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.model).toBe('claude-haiku-4-5')
  })
})

describe('buildSpawnConfig — allowed tools', () => {
  beforeEach(() => {
    mockPolicyFindMany.mockResolvedValue([] as never)
    mockReadFile.mockRejectedValue(new Error('ENOENT'))
  })

  it('returns default tools when agent.allowedTools is empty', async () => {
    const agent = makeAgent({ allowedTools: [] })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.allowedTools).toContain('Read')
    expect(result.allowedTools).toContain('Bash')
    expect(result.allowedTools.length).toBeGreaterThan(0)
  })

  it('uses agent allowedTools when explicitly set, with the always-on baseline appended', async () => {
    const agent = makeAgent({ allowedTools: ['Read', 'Write'] })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    // The agent's own tools keep their order; WebSearch/WebFetch are appended.
    // Read is already present, so it is not duplicated.
    expect(result.allowedTools).toEqual(['Read', 'Write', 'WebSearch', 'WebFetch'])
  })

  it('always grants Read, WebSearch and WebFetch even when the agent omits them', async () => {
    const agent = makeAgent({ allowedTools: ['Grep', 'Glob'] })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.allowedTools).toContain('Read')
    expect(result.allowedTools).toContain('WebSearch')
    expect(result.allowedTools).toContain('WebFetch')
    // The configured tools are preserved, baseline appended, no duplicates.
    expect(result.allowedTools).toEqual(['Grep', 'Glob', 'Read', 'WebSearch', 'WebFetch'])
  })

  it('does not duplicate baseline tools the agent already lists', async () => {
    const agent = makeAgent({ allowedTools: ['WebFetch', 'Read', 'WebSearch'] })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.allowedTools).toEqual(['WebFetch', 'Read', 'WebSearch'])
  })
})

describe('buildSpawnConfig — policy merge applied to config', () => {
  beforeEach(() => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'))
  })

  it('applies permissionMode from a global policy', async () => {
    const agent = makeAgent()
    mockFindUnique.mockResolvedValueOnce(agent as never)
    mockPolicyFindMany.mockResolvedValueOnce([
      { level: 'global', agentId: null, rules: { permissionMode: 'plan' } },
    ] as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.permissionMode).toBe('plan')
  })

  it('applies most-restrictive maxBudgetUsd from policies', async () => {
    const agent = makeAgent({
      policies: [{ level: 'agent', agentId: 'agent-1', rules: { maxBudgetUsd: 20 } }],
    })
    mockFindUnique.mockResolvedValueOnce(agent as never)
    mockPolicyFindMany.mockResolvedValueOnce([
      { level: 'global', agentId: null, rules: { maxBudgetUsd: 50 } },
    ] as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.maxBudgetUsd).toBe(20)
  })

  it('maxBudgetUsd is undefined when no policy sets it', async () => {
    const agent = makeAgent()
    mockFindUnique.mockResolvedValueOnce(agent as never)
    mockPolicyFindMany.mockResolvedValueOnce([] as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.maxBudgetUsd).toBeUndefined()
  })
})

describe('buildSpawnConfig — OpenAI provider', () => {
  const ORIGINAL_KEY = process.env['OPENAI_API_KEY']

  beforeEach(() => {
    mockPolicyFindMany.mockResolvedValue([] as never)
    mockReadFile.mockRejectedValue(new Error('ENOENT'))
    process.env['OPENAI_API_KEY'] = 'sk-test-123'
  })

  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env['OPENAI_API_KEY']
    else process.env['OPENAI_API_KEY'] = ORIGINAL_KEY
  })

  it('returns provider "openai" with persona as system prompt and no Claude tools', async () => {
    const agent = makeAgent({
      provider: 'openai',
      persona: 'You are a researcher.',
      providerConfig: { model: 'gpt-4o', webSearch: true, deepResearch: false },
    })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.provider).toBe('openai')
    expect(result.systemPrompt).toBe('You are a researcher.')
    expect(result.model).toBe('gpt-4o')
    expect(result.allowedTools).toEqual([])
    expect(result.providerConfig).toEqual({ model: 'gpt-4o', webSearch: true, deepResearch: false })
  })

  it('forwards OPENAI_API_KEY in env (and not Claude credentials)', async () => {
    const agent = makeAgent({
      provider: 'openai',
      providerConfig: { model: 'gpt-4.1-mini', webSearch: false, deepResearch: false },
    })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.env['OPENAI_API_KEY']).toBe('sk-test-123')
    expect(result.env['ANTHROPIC_API_KEY']).toBeUndefined()
    expect(result.env['CLAUDE_CODE_OAUTH_TOKEN']).toBeUndefined()
  })

  it('deep research auto-switches the resolved model to a deep-research model', async () => {
    const agent = makeAgent({
      provider: 'openai',
      providerConfig: { model: 'gpt-4o', webSearch: false, deepResearch: true },
    })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.model).toContain('deep-research')
    expect(result.providerConfig?.deepResearch).toBe(true)
  })

  it('falls back to defaults when providerConfig is missing', async () => {
    const agent = makeAgent({ provider: 'openai', providerConfig: null })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.providerConfig?.model).toBeTruthy()
    expect(result.providerConfig?.webSearch).toBe(false)
    expect(result.providerConfig?.deepResearch).toBe(false)
  })

  it('does not build MCP config or addDirs for OpenAI agents', async () => {
    const agent = makeAgent({
      provider: 'openai',
      providerConfig: { model: 'gpt-4o', webSearch: false, deepResearch: false },
    })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.mcpConfig).toBeUndefined()
    expect(result.addDirs).toBeUndefined()
  })
})

describe('buildSpawnConfig — Perplexity provider', () => {
  const ORIGINAL_KEY = process.env['PERPLEXITY_API_KEY']

  beforeEach(() => {
    mockPolicyFindMany.mockResolvedValue([] as never)
    mockReadFile.mockRejectedValue(new Error('ENOENT'))
    process.env['PERPLEXITY_API_KEY'] = 'pplx-test-123'
  })

  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env['PERPLEXITY_API_KEY']
    else process.env['PERPLEXITY_API_KEY'] = ORIGINAL_KEY
  })

  it('returns provider "perplexity" with the selected sonar model and no Claude tools', async () => {
    const agent = makeAgent({
      provider: 'perplexity',
      persona: 'You research things.',
      providerConfig: { model: 'sonar-pro', webSearch: true, deepResearch: false },
    })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.provider).toBe('perplexity')
    expect(result.systemPrompt).toBe('You research things.')
    expect(result.model).toBe('sonar-pro')
    expect(result.allowedTools).toEqual([])
  })

  it('forwards PERPLEXITY_API_KEY in env (and not Claude/OpenAI credentials)', async () => {
    const agent = makeAgent({
      provider: 'perplexity',
      providerConfig: { model: 'sonar', webSearch: true, deepResearch: false },
    })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.env['PERPLEXITY_API_KEY']).toBe('pplx-test-123')
    expect(result.env['OPENAI_API_KEY']).toBeUndefined()
    expect(result.env['ANTHROPIC_API_KEY']).toBeUndefined()
  })

  it('deep research auto-switches to the sonar-deep-research model', async () => {
    const agent = makeAgent({
      provider: 'perplexity',
      providerConfig: { model: 'sonar', webSearch: true, deepResearch: true },
    })
    mockFindUnique.mockResolvedValueOnce(agent as never)

    const result = await buildSpawnConfig('agent-1')
    expect(result.model).toBe('sonar-deep-research')
    expect(result.providerConfig?.deepResearch).toBe(true)
  })
})
