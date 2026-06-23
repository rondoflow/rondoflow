import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    memory: {
      upsert: vi.fn(),
    },
  },
}))

import { upsertMemory, dedupeAgainstExisting, MAX_VALUE_LEN } from '../memory-store'
import { prisma } from '../../lib/prisma'

const mockUpsert = vi.mocked(prisma.memory.upsert)

describe('upsertMemory — scope routing', () => {
  beforeEach(() => {
    mockUpsert.mockReset()
    mockUpsert.mockResolvedValue({} as never)
  })

  it('routes agent-scoped writes to the agentId_key compound', async () => {
    await upsertMemory({ agentId: 'a1', scope: 'agent', source: 'auto', key: 'k', value: 'v' })
    const arg = mockUpsert.mock.calls[0]![0] as { where: Record<string, unknown> }
    expect(arg.where).toEqual({ agentId_key: { agentId: 'a1', key: 'k' } })
  })

  it('routes workspace-scoped writes to the workspaceId_key compound', async () => {
    await upsertMemory({ workspaceId: 'w1', scope: 'workspace', source: 'manual', key: 'k', value: 'v' })
    const arg = mockUpsert.mock.calls[0]![0] as { where: Record<string, unknown> }
    expect(arg.where).toEqual({ workspaceId_key: { workspaceId: 'w1', key: 'k' } })
  })

  it('no-ops when the required scope id is missing', async () => {
    await upsertMemory({ scope: 'workspace', source: 'auto', key: 'k', value: 'v' })
    await upsertMemory({ scope: 'agent', source: 'auto', key: 'k', value: 'v' })
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('slices the value to MAX_VALUE_LEN', async () => {
    const long = 'x'.repeat(MAX_VALUE_LEN + 500)
    await upsertMemory({ agentId: 'a1', scope: 'agent', source: 'auto', key: 'k', value: long })
    const arg = mockUpsert.mock.calls[0]![0] as { create: { value: string } }
    expect(arg.create.value).toHaveLength(MAX_VALUE_LEN)
  })

  it('never throws when the DB write fails', async () => {
    mockUpsert.mockRejectedValueOnce(new Error('db down'))
    await expect(
      upsertMemory({ agentId: 'a1', scope: 'agent', source: 'auto', key: 'k', value: 'v' }),
    ).resolves.toBeUndefined()
  })
})

describe('dedupeAgainstExisting', () => {
  it('drops candidates that closely match existing memories', () => {
    const existing = [{ value: 'The database is Postgres 16' }]
    const candidates = [
      { key: 'db', value: 'The database is Postgres 16', scope: 'workspace' as const },
      { key: 'auth', value: 'Auth uses Better Auth with OAuth providers', scope: 'workspace' as const },
    ]
    const kept = dedupeAgainstExisting(existing, candidates)
    expect(kept).toHaveLength(1)
    expect(kept[0]!.key).toBe('auth')
  })

  it('drops near-duplicate candidates within the same batch', () => {
    const candidates = [
      { key: 'a', value: 'The API base url is http://localhost:3001', scope: 'agent' as const },
      { key: 'b', value: 'The API base url is http://localhost:3001', scope: 'agent' as const },
    ]
    const kept = dedupeAgainstExisting([], candidates)
    expect(kept).toHaveLength(1)
  })

  it('keeps all distinct candidates', () => {
    const candidates = [
      { key: 'a', value: 'Frontend is Next.js 14', scope: 'workspace' as const },
      { key: 'b', value: 'Backend is Fastify with Socket.IO', scope: 'workspace' as const },
    ]
    expect(dedupeAgainstExisting([], candidates)).toHaveLength(2)
  })
})
