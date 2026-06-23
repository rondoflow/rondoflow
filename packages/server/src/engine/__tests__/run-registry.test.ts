import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  registerRun,
  deregisterRun,
  runsForUser,
  allRuns,
  activeRunCount,
  teardownRuns,
  type RunHandle,
} from '../run-registry'

// The registry is module-level singleton state, so clear it between tests by
// deregistering everything still present.
function clearRegistry(): void {
  for (const h of allRuns()) deregisterRun(h.kind, h.key)
}

function makeHandle(over: Partial<RunHandle> & Pick<RunHandle, 'kind' | 'key' | 'userId'>): RunHandle {
  return {
    stop: () => {},
    ...over,
  }
}

describe('run-registry', () => {
  beforeEach(() => clearRegistry())

  it('registers and counts runs, and overwrites on same kind+key', () => {
    registerRun(makeHandle({ kind: 'chain', key: 'c1', userId: 'u1' }))
    registerRun(makeHandle({ kind: 'loop', key: 'l1', userId: 'u1' }))
    expect(activeRunCount()).toBe(2)

    // Re-registering the same kind+key must not duplicate.
    registerRun(makeHandle({ kind: 'chain', key: 'c1', userId: 'u1' }))
    expect(activeRunCount()).toBe(2)
  })

  it('deregisterRun removes only the matching kind+key', () => {
    registerRun(makeHandle({ kind: 'chain', key: 'x', userId: 'u1' }))
    registerRun(makeHandle({ kind: 'loop', key: 'x', userId: 'u1' })) // same key, different kind
    deregisterRun('chain', 'x')
    expect(activeRunCount()).toBe(1)
    expect(allRuns()[0]?.kind).toBe('loop')
  })

  it('runsForUser returns only that user\'s runs', () => {
    registerRun(makeHandle({ kind: 'chain', key: 'c1', userId: 'u1' }))
    registerRun(makeHandle({ kind: 'agent', key: 'a1', userId: 'u2' }))
    registerRun(makeHandle({ kind: 'loop', key: 'l1', userId: 'u1' }))

    const u1 = runsForUser('u1')
    expect(u1.map((h) => h.key).sort()).toEqual(['c1', 'l1'])
    expect(runsForUser('u2').map((h) => h.key)).toEqual(['a1'])
  })

  it('runsForUser ignores null/empty userId (never matches anonymous runs)', () => {
    registerRun(makeHandle({ kind: 'chain', key: 'anon', userId: null }))
    expect(runsForUser(null)).toEqual([])
    expect(runsForUser(undefined)).toEqual([])
    expect(runsForUser('')).toEqual([])
    // An anonymous run is still visible to allRuns (so shutdown tears it down).
    expect(allRuns()).toHaveLength(1)
  })

  it('teardownRuns stops, finalizes, and deregisters each handle', async () => {
    const stop = vi.fn()
    const finalize = vi.fn(async () => {})
    registerRun(makeHandle({ kind: 'chain', key: 'c1', userId: 'u1', stop, finalize }))

    await teardownRuns(runsForUser('u1'), 'disconnect')

    expect(stop).toHaveBeenCalledTimes(1)
    expect(finalize).toHaveBeenCalledTimes(1)
    expect(finalize).toHaveBeenCalledWith('disconnect')
    expect(activeRunCount()).toBe(0)
  })

  it('teardownRuns does not let a throwing stop() block the rest', async () => {
    const good = vi.fn()
    registerRun(makeHandle({ kind: 'chain', key: 'bad', userId: 'u1', stop: () => { throw new Error('boom') } }))
    registerRun(makeHandle({ kind: 'loop', key: 'good', userId: 'u1', stop: good }))

    await expect(teardownRuns(allRuns(), 'shutdown')).resolves.toBeUndefined()
    expect(good).toHaveBeenCalledTimes(1)
    expect(activeRunCount()).toBe(0)
  })

  it('teardownRuns resolves within the finalize timeout even if finalize hangs', async () => {
    registerRun(
      makeHandle({
        kind: 'chain',
        key: 'hang',
        userId: 'u1',
        stop: () => {},
        finalize: () => new Promise<void>(() => {}), // never resolves
      }),
    )
    // Bounded: must resolve despite the hung finalize.
    await expect(teardownRuns(allRuns(), 'shutdown', { finalizeTimeoutMs: 20 })).resolves.toBeUndefined()
    expect(activeRunCount()).toBe(0)
  })

  it('teardownRuns is a no-op for an empty list', async () => {
    await expect(teardownRuns([], 'shutdown')).resolves.toBeUndefined()
  })
})
