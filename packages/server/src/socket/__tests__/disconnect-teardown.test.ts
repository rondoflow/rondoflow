import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// handlers.ts instantiates a PrismaClient transitively (../lib/prisma). Stub it
// so the test stays hermetic — these cases never touch the DB.
vi.mock('../../lib/prisma', () => ({ prisma: {} }))

import { scheduleUserTeardown, cancelUserTeardown } from '../handlers'
import { registerRun, deregisterRun, allRuns, activeRunCount } from '../../engine/run-registry'

// The grace window is read once at module load from RONDOFLOW_TEARDOWN_GRACE_MS;
// the default (60s) is what the suite drives. Kept as a named constant so the
// intent is clear if the default ever changes.
const GRACE_MS = 60_000

// Minimal fake of the bits of the Socket.IO server that scheduleUserTeardown reads:
// io.sockets.adapter.rooms is a Map<roomName, Set<socketId>>.
function makeIo(roomSizes: Record<string, number> = {}) {
  const rooms = new Map<string, Set<string>>()
  for (const [room, size] of Object.entries(roomSizes)) {
    rooms.set(room, new Set(Array.from({ length: size }, (_, i) => `sock-${i}`)))
  }
  return { sockets: { adapter: { rooms } } } as never
}

function clearRegistry(): void {
  for (const h of allRuns()) deregisterRun(h.kind, h.key)
}

beforeEach(() => {
  vi.useFakeTimers()
  clearRegistry()
})

afterEach(() => {
  // Drop any pending teardown timer so it can't fire into the next test.
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('disconnect teardown', () => {
  it('tears down a user\'s runs once their last socket is gone, after the grace window', async () => {
    const stop = vi.fn()
    const finalize = vi.fn(async () => {})
    registerRun({ kind: 'chain', key: 'c1', userId: 'u1', stop, finalize })

    // Last socket gone: no `user:u1` room remains.
    scheduleUserTeardown(makeIo(), 'u1')
    expect(stop).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(GRACE_MS)

    expect(stop).toHaveBeenCalledTimes(1)
    expect(finalize).toHaveBeenCalledWith('disconnect')
    expect(activeRunCount()).toBe(0)
  })

  it('does not tear down when the user still has another open tab', async () => {
    const stop = vi.fn()
    registerRun({ kind: 'chain', key: 'c1', userId: 'u1', stop })

    // A surviving socket keeps the `user:u1` room non-empty.
    scheduleUserTeardown(makeIo({ 'user:u1': 1 }), 'u1')
    await vi.advanceTimersByTimeAsync(GRACE_MS)

    expect(stop).not.toHaveBeenCalled()
    expect(activeRunCount()).toBe(1)
  })

  it('a reconnect during the grace window cancels the teardown', async () => {
    const stop = vi.fn()
    registerRun({ kind: 'chain', key: 'c1', userId: 'u1', stop })

    scheduleUserTeardown(makeIo(), 'u1')
    // User reconnects before the grace window elapses.
    cancelUserTeardown('u1')
    await vi.advanceTimersByTimeAsync(GRACE_MS)

    expect(stop).not.toHaveBeenCalled()
    expect(activeRunCount()).toBe(1)
  })

  it('leaves anonymous (userId: null) runs untouched while tearing down the user\'s own', async () => {
    const userStop = vi.fn()
    const anonStop = vi.fn()
    registerRun({ kind: 'chain', key: 'owned', userId: 'u1', stop: userStop })
    registerRun({ kind: 'chain', key: 'anon', userId: null, stop: anonStop })

    scheduleUserTeardown(makeIo(), 'u1')
    await vi.advanceTimersByTimeAsync(GRACE_MS)

    expect(userStop).toHaveBeenCalledTimes(1)
    expect(anonStop).not.toHaveBeenCalled()
    // The anonymous run survives a per-user disconnect teardown.
    expect(activeRunCount()).toBe(1)
    expect(allRuns()[0]?.key).toBe('anon')
  })
})
