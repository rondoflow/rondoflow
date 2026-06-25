// RunRegistry — a single owner-scoped index of every in-flight run, regardless
// of kind (interactive agent, loop, chain, discussion) or transport (socket vs
// HTTP). Modeled on discussion/registry.ts's shared-map pattern, but unified so
// that disconnect teardown ("stop everything user U owns") and shutdown teardown
// ("stop everything") have one place to look — instead of sweeping the half-dozen
// per-kind maps scattered across the socket handlers, each of which tracks a
// different key and none of which (until now) recorded the owning user for a
// chain.
//
// Each run-start handler registers a RunHandle carrying the owner userId and two
// closures: stop() (idempotent — kills the spawner(s)) and an optional finalize()
// (writes the terminal DB status so a torn-down run isn't stuck at 'running').
// Handlers deregister at every terminal point they already clean up their own map.

import { TIMEOUTS } from '@rondoflow/shared'

export type RunKind = 'agent' | 'loop' | 'chain' | 'discussion' | 'pipeline'

export interface RunHandle {
  readonly kind: RunKind
  /** agentId for agent/loop, chainId for chain, tableId for discussion. */
  readonly key: string
  /** Owning user, or null for runs with no socket owner (never torn down on disconnect). */
  readonly userId: string | null
  /** Stop the run. MUST be idempotent — teardown may race normal completion. */
  stop(): void
  /** Best-effort terminal DB write (status + transcript). Called once during teardown. */
  finalize?: (reason: string) => Promise<void> | void
}

const runs = new Map<string, RunHandle>()

function mapKey(kind: RunKind, key: string): string {
  return `${kind}:${key}`
}

/** Register an in-flight run. Re-registering the same kind+key overwrites (a
 * restarted agent reuses its id), so the map never accumulates duplicates. */
export function registerRun(handle: RunHandle): void {
  runs.set(mapKey(handle.kind, handle.key), handle)
}

export function deregisterRun(kind: RunKind, key: string): void {
  runs.delete(mapKey(kind, key))
}

/** All in-flight runs owned by a given user (empty if userId is falsy). */
export function runsForUser(userId: string | null | undefined): RunHandle[] {
  if (!userId) return []
  const out: RunHandle[] = []
  for (const handle of runs.values()) {
    if (handle.userId === userId) out.push(handle)
  }
  return out
}

export function allRuns(): RunHandle[] {
  return [...runs.values()]
}

export function activeRunCount(): number {
  return runs.size
}

/**
 * Tear down the given runs: stop() each synchronously (and deregister it), then
 * await all finalize() writes under a bounded timeout so a slow/dead DB can't
 * stall shutdown past `finalizeTimeoutMs`. Never throws — every step is
 * best-effort, mirroring the fire-and-forget DB writes the handlers already use.
 */
export async function teardownRuns(
  handles: readonly RunHandle[],
  reason: string,
  opts: { finalizeTimeoutMs?: number } = {},
): Promise<void> {
  if (handles.length === 0) return
  const finalizeTimeoutMs = opts.finalizeTimeoutMs ?? TIMEOUTS.RUN_FINALIZE_MS

  console.warn(`[run-registry] tearing down ${handles.length} run(s) — reason: ${reason}`)

  const finalizers: Promise<void>[] = []
  for (const handle of handles) {
    try {
      handle.stop()
    } catch {
      // stop() is idempotent/best-effort — a throw here must not block the rest.
    }
    deregisterRun(handle.kind, handle.key)
    if (handle.finalize) {
      finalizers.push(
        Promise.resolve()
          .then(() => handle.finalize!(reason))
          .catch(() => {
            /* best-effort terminal write */
          }),
      )
    }
  }

  if (finalizers.length === 0) return

  // Bound the wait so shutdown can proceed to process.exit even if a write hangs.
  await Promise.race([
    Promise.allSettled(finalizers).then(() => undefined),
    new Promise<void>((resolve) => {
      const t = setTimeout(resolve, finalizeTimeoutMs)
      t.unref?.()
    }),
  ])
}
