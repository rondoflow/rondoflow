import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock the Prisma singleton BEFORE importing the module under test.
// ---------------------------------------------------------------------------
vi.mock('../../lib/prisma', () => ({
  prisma: {
    policy: {
      findMany: vi.fn(),
    },
  },
}))

import { resolvePolicy } from '../policy-resolver'
import { prisma } from '../../lib/prisma'

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

let idCounter = 0

function makePolicy(
  level: 'global' | 'agent' | 'session',
  rules: Record<string, unknown>,
  agentId: string | null = null,
  sessionId: string | null = null,
) {
  return {
    id: `policy-${++idCounter}`,
    name: `Test Policy ${idCounter}`,
    level,
    rules,
    agentId,
    sessionId,
    createdAt: new Date().toISOString(),
  }
}

// Typed alias so tests can read clearly
const mockFindMany = vi.mocked(prisma.policy.findMany)

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('resolvePolicy — empty policies', () => {
  beforeEach(() => {
    mockFindMany.mockResolvedValue([])
  })

  it('returns defaults when no policies exist', async () => {
    const result = await resolvePolicy('agent-1')
    expect(result.maxTimeout).toBe(300_000)
    expect(result.maxFileSize).toBe(10_485_760)
    expect(result.maxBudgetUsd).toBe(100)
    expect(result.permissionMode).toBe('dontAsk')
    expect(result.blockedCommands).toEqual([])
    expect(result.requireApproval).toEqual([])
    expect(result.sources).toHaveLength(0)
  })
})

describe('resolvePolicy — global-only policy', () => {
  it('applies global policy values', async () => {
    const globalPolicy = makePolicy('global', {
      maxTimeout: 60_000,
      maxBudgetUsd: 50,
      blockedCommands: ['curl'],
      permissionMode: 'acceptEdits',
    })

    // findMany: first call = global, second = agent, third = session (if any)
    mockFindMany
      .mockResolvedValueOnce([globalPolicy] as never)
      .mockResolvedValueOnce([] as never)

    const result = await resolvePolicy('agent-1')
    expect(result.maxTimeout).toBe(60_000)
    expect(result.maxBudgetUsd).toBe(50)
    expect(result.blockedCommands).toContain('curl')
    expect(result.permissionMode).toBe('acceptEdits')
    expect(result.sources).toHaveLength(1)
  })
})

describe('resolvePolicy — global + agent merge (most-restrictive-wins)', () => {
  it('takes the minimum of numeric limits across layers', async () => {
    const global = makePolicy('global', { maxTimeout: 120_000, maxBudgetUsd: 80 })
    const agent = makePolicy('agent', { maxTimeout: 60_000, maxBudgetUsd: 200 }, 'agent-1')

    mockFindMany
      .mockResolvedValueOnce([global] as never)
      .mockResolvedValueOnce([agent] as never)

    const result = await resolvePolicy('agent-1')
    expect(result.maxTimeout).toBe(60_000)      // agent is more restrictive
    expect(result.maxBudgetUsd).toBe(80)         // global is more restrictive
  })

  it('unions blockedCommands across layers', async () => {
    const global = makePolicy('global', { blockedCommands: ['rm -rf /'] })
    const agent = makePolicy('agent', { blockedCommands: ['curl'] }, 'agent-1')

    mockFindMany
      .mockResolvedValueOnce([global] as never)
      .mockResolvedValueOnce([agent] as never)

    const result = await resolvePolicy('agent-1')
    expect(result.blockedCommands).toContain('rm -rf /')
    expect(result.blockedCommands).toContain('curl')
  })

  it('unions requireApproval pattern lists across layers', async () => {
    const global = makePolicy('global', { requireApproval: ['git push'] })
    const agent = makePolicy('agent', { requireApproval: ['npm publish'] }, 'agent-1')

    mockFindMany
      .mockResolvedValueOnce([global] as never)
      .mockResolvedValueOnce([agent] as never)

    const result = await resolvePolicy('agent-1')
    expect(Array.isArray(result.requireApproval)).toBe(true)
    const patterns = result.requireApproval as string[]
    expect(patterns).toContain('git push')
    expect(patterns).toContain('npm publish')
  })

  it('escalates requireApproval to true when any policy sets it to boolean true', async () => {
    const global = makePolicy('global', { requireApproval: ['git push'] })
    const agent = makePolicy('agent', { requireApproval: true }, 'agent-1')

    mockFindMany
      .mockResolvedValueOnce([global] as never)
      .mockResolvedValueOnce([agent] as never)

    const result = await resolvePolicy('agent-1')
    expect(result.requireApproval).toBe(true)
  })
})

describe('resolvePolicy — permission mode ranking', () => {
  const cases: Array<[string, string, string]> = [
    ['dontAsk', 'acceptEdits', 'acceptEdits'],
    ['acceptEdits', 'plan', 'plan'],
    ['plan', 'default', 'default'],
    ['default', 'dontAsk', 'default'],   // default cannot be relaxed
  ]

  it.each(cases)(
    'merging "%s" + "%s" yields "%s"',
    async (globalMode, agentMode, expected) => {
      const global = makePolicy('global', { permissionMode: globalMode })
      const agent = makePolicy('agent', { permissionMode: agentMode }, 'agent-1')

      mockFindMany
        .mockResolvedValueOnce([global] as never)
        .mockResolvedValueOnce([agent] as never)

      const result = await resolvePolicy('agent-1')
      expect(result.permissionMode).toBe(expected)
    },
  )
})

describe('resolvePolicy — session layer cannot relax global restrictions', () => {
  it('session does not relax global blockedCommands', async () => {
    const global = makePolicy('global', { blockedCommands: ['curl'] })
    const session = makePolicy('session', { blockedCommands: [] }, null, 'session-1')

    // Three findMany calls: global, agent, session
    mockFindMany
      .mockResolvedValueOnce([global] as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([session] as never)

    const result = await resolvePolicy('agent-1', 'session-1')
    expect(result.blockedCommands).toContain('curl')
  })

  it('session can add additional blockedCommands on top of global', async () => {
    const global = makePolicy('global', { blockedCommands: ['rm -rf /'] })
    const session = makePolicy('session', { blockedCommands: ['curl'] }, null, 'session-1')

    mockFindMany
      .mockResolvedValueOnce([global] as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([session] as never)

    const result = await resolvePolicy('agent-1', 'session-1')
    expect(result.blockedCommands).toContain('rm -rf /')
    expect(result.blockedCommands).toContain('curl')
  })

  it('session tightens numeric limit further', async () => {
    const global = makePolicy('global', { maxBudgetUsd: 50 })
    const session = makePolicy('session', { maxBudgetUsd: 10 }, null, 'session-1')

    mockFindMany
      .mockResolvedValueOnce([global] as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([session] as never)

    const result = await resolvePolicy('agent-1', 'session-1')
    expect(result.maxBudgetUsd).toBe(10)
  })
})

describe('resolvePolicy — multiple global policies', () => {
  it('merges multiple global policies before applying agent policy', async () => {
    const g1 = makePolicy('global', { maxTimeout: 120_000, blockedCommands: ['curl'] })
    const g2 = makePolicy('global', { maxTimeout: 90_000, blockedCommands: ['wget'] })

    mockFindMany
      .mockResolvedValueOnce([g1, g2] as never)
      .mockResolvedValueOnce([] as never)

    const result = await resolvePolicy('agent-1')
    expect(result.maxTimeout).toBe(90_000)
    expect(result.blockedCommands).toContain('curl')
    expect(result.blockedCommands).toContain('wget')
    expect(result.sources).toHaveLength(2)
  })
})
