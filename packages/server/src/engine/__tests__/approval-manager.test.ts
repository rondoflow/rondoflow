import { describe, it, expect, beforeEach } from 'vitest'
import { ApprovalManager } from '../approval-manager'
import type { PendingApproval } from '../approval-manager'

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeApprovalData(
  overrides: Partial<Omit<PendingApproval, 'id' | 'createdAt'>> = {},
): Omit<PendingApproval, 'id' | 'createdAt'> {
  return {
    agentId: 'agent-1',
    sessionId: 'session-1',
    command: 'git push origin main',
    description: 'Push to remote repository',
    toolName: 'Bash',
    toolInput: { command: 'git push origin main' },
    timeoutMs: 5 * 60 * 1_000,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ApprovalManager — requestApproval', () => {
  let manager: ApprovalManager

  beforeEach(() => {
    manager = new ApprovalManager()
  })

  it('returns a non-empty string id', () => {
    const id = manager.requestApproval(makeApprovalData())
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('stores the approval so getPending finds it', () => {
    const id = manager.requestApproval(makeApprovalData())
    const pending = manager.getPending()
    expect(pending.map((p) => p.id)).toContain(id)
  })

  it('generates a unique id per call', () => {
    const id1 = manager.requestApproval(makeApprovalData())
    const id2 = manager.requestApproval(makeApprovalData())
    expect(id1).not.toBe(id2)
  })

  it('uses DEFAULT_TIMEOUT_MS (5 min) when timeoutMs is 0 or negative', () => {
    const id = manager.requestApproval(makeApprovalData({ timeoutMs: 0 }))
    const approval = manager.getPending().find((p) => p.id === id)!
    expect(approval.timeoutMs).toBe(5 * 60 * 1_000)
  })

  it('preserves a positive timeoutMs as-is', () => {
    const id = manager.requestApproval(makeApprovalData({ timeoutMs: 10_000 }))
    const approval = manager.getPending().find((p) => p.id === id)!
    expect(approval.timeoutMs).toBe(10_000)
  })
})

describe('ApprovalManager — approve', () => {
  let manager: ApprovalManager

  beforeEach(() => {
    manager = new ApprovalManager()
  })

  it('returns the approval record and removes it from pending', () => {
    const id = manager.requestApproval(makeApprovalData())
    const approval = manager.approve(id)
    expect(approval).not.toBeNull()
    expect(approval!.id).toBe(id)
    expect(manager.getPending()).toHaveLength(0)
  })

  it('returns null for a non-existent approval id', () => {
    const result = manager.approve('does-not-exist')
    expect(result).toBeNull()
  })

  it('can only approve once — second call returns null', () => {
    const id = manager.requestApproval(makeApprovalData())
    manager.approve(id)
    expect(manager.approve(id)).toBeNull()
  })
})

describe('ApprovalManager — reject', () => {
  let manager: ApprovalManager

  beforeEach(() => {
    manager = new ApprovalManager()
  })

  it('returns the approval record and removes it from pending', () => {
    const id = manager.requestApproval(makeApprovalData())
    const approval = manager.reject(id)
    expect(approval).not.toBeNull()
    expect(approval!.id).toBe(id)
    expect(manager.getPending()).toHaveLength(0)
  })

  it('returns null for a non-existent approval id', () => {
    expect(manager.reject('ghost-id')).toBeNull()
  })
})

describe('ApprovalManager — getPending', () => {
  let manager: ApprovalManager

  beforeEach(() => {
    manager = new ApprovalManager()
  })

  it('returns all pending approvals when no filter given', () => {
    manager.requestApproval(makeApprovalData({ agentId: 'agent-1' }))
    manager.requestApproval(makeApprovalData({ agentId: 'agent-2' }))
    expect(manager.getPending()).toHaveLength(2)
  })

  it('filters by agentId when provided', () => {
    manager.requestApproval(makeApprovalData({ agentId: 'agent-1' }))
    manager.requestApproval(makeApprovalData({ agentId: 'agent-2' }))
    const result = manager.getPending('agent-1')
    expect(result).toHaveLength(1)
    expect(result[0]!.agentId).toBe('agent-1')
  })

  it('returns empty array when agentId has no pending approvals', () => {
    manager.requestApproval(makeApprovalData({ agentId: 'agent-1' }))
    expect(manager.getPending('agent-99')).toHaveLength(0)
  })

  it('returns empty array when nothing has been registered', () => {
    expect(manager.getPending()).toHaveLength(0)
  })
})

describe('ApprovalManager — getPendingCount', () => {
  let manager: ApprovalManager

  beforeEach(() => {
    manager = new ApprovalManager()
  })

  it('returns 0 when empty', () => {
    expect(manager.getPendingCount()).toBe(0)
  })

  it('increments on each requestApproval call', () => {
    manager.requestApproval(makeApprovalData())
    expect(manager.getPendingCount()).toBe(1)
    manager.requestApproval(makeApprovalData())
    expect(manager.getPendingCount()).toBe(2)
  })

  it('decrements after approve', () => {
    const id = manager.requestApproval(makeApprovalData())
    manager.approve(id)
    expect(manager.getPendingCount()).toBe(0)
  })

  it('decrements after reject', () => {
    const id = manager.requestApproval(makeApprovalData())
    manager.reject(id)
    expect(manager.getPendingCount()).toBe(0)
  })
})

describe('ApprovalManager — cleanupExpired', () => {
  let manager: ApprovalManager

  beforeEach(() => {
    manager = new ApprovalManager()
  })

  it('removes entries whose timeout has passed', () => {
    // Register an approval with a very short timeout
    manager.requestApproval(makeApprovalData({ timeoutMs: 1 }))

    // Wait 2 ms then cleanup
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const expired = manager.cleanupExpired()
        expect(expired).toHaveLength(1)
        expect(manager.getPendingCount()).toBe(0)
        resolve()
      }, 5)
    })
  })

  it('does not remove entries whose timeout has not yet passed', () => {
    manager.requestApproval(makeApprovalData({ timeoutMs: 60_000 }))
    const expired = manager.cleanupExpired()
    expect(expired).toHaveLength(0)
    expect(manager.getPendingCount()).toBe(1)
  })

  it('returns an empty array when there is nothing to clean up', () => {
    expect(manager.cleanupExpired()).toHaveLength(0)
  })

  it('only removes expired entries, leaving fresh ones intact', () => {
    manager.requestApproval(makeApprovalData({ timeoutMs: 1 }))
    const freshId = manager.requestApproval(makeApprovalData({ timeoutMs: 60_000 }))

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const expired = manager.cleanupExpired()
        expect(expired).toHaveLength(1)
        expect(manager.getPending().map((p) => p.id)).toContain(freshId)
        resolve()
      }, 5)
    })
  })
})
