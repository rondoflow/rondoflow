// Single shared write path for all memory upserts — Director learnings,
// automatic extraction, and any future server-side writer. Keeps tagging
// (scope/source) and value-capping consistent in one place.

import type { MemoryScope, MemorySource } from '@rondoflow/shared'
import { prisma } from '../lib/prisma'

export const MAX_VALUE_LEN = 2000

export interface UpsertMemoryInput {
  readonly agentId?: string
  readonly workspaceId?: string
  readonly scope: MemoryScope
  readonly source: MemorySource
  readonly key: string
  readonly value: string
}

/**
 * Upsert a memory row on the correct compound unique key for its scope.
 * Best-effort: never throws (a failed memory write must not fail the run).
 */
export async function upsertMemory(input: UpsertMemoryInput): Promise<void> {
  const value = input.value.slice(0, MAX_VALUE_LEN)
  try {
    if (input.scope === 'workspace') {
      if (!input.workspaceId) return
      await prisma.memory.upsert({
        where: { workspaceId_key: { workspaceId: input.workspaceId, key: input.key } },
        create: { workspaceId: input.workspaceId, scope: 'workspace', source: input.source, key: input.key, value },
        update: { value, source: input.source },
      })
    } else {
      if (!input.agentId) return
      await prisma.memory.upsert({
        where: { agentId_key: { agentId: input.agentId, key: input.key } },
        create: { agentId: input.agentId, scope: 'agent', source: input.source, key: input.key, value },
        update: { value, source: input.source },
      })
    }
  } catch {
    // Best-effort — never fail the run for a memory write.
  }
}

export interface ExtractedFact {
  readonly key: string
  readonly value: string
  readonly scope: MemoryScope
  readonly confidence?: number
}

/** Normalize a value into a word-set for cheap similarity comparison. */
function wordSet(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean),
  )
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0
  let inter = 0
  for (const w of a) if (b.has(w)) inter++
  const union = new Set([...a, ...b]).size
  return union === 0 ? 0 : inter / union
}

/**
 * Drops candidate facts that are near-duplicates of existing memories (or of an
 * already-kept candidate). Uses normalized-value Jaccard similarity > 0.8.
 */
export function dedupeAgainstExisting(
  existing: readonly { value: string }[],
  candidates: readonly ExtractedFact[],
): ExtractedFact[] {
  const existingSets = existing.map((e) => wordSet(e.value))
  const kept: ExtractedFact[] = []
  for (const cand of candidates) {
    const cs = wordSet(cand.value)
    const dup =
      existingSets.some((es) => jaccard(cs, es) > 0.8) ||
      kept.some((k) => jaccard(cs, wordSet(k.value)) > 0.8)
    if (!dup) kept.push(cand)
  }
  return kept
}
