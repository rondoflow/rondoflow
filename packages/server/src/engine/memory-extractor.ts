// Automatic cross-session memory extraction. After a completed run we run ONE
// lightweight Haiku pass to distill a small set of durable, deduplicated facts
// and persist them as `source: 'auto'` memories. Entirely best-effort and off
// the critical path — it must never throw into the caller.

import { randomUUID } from 'crypto'
import { ANTHROPIC, type TokenUsage } from '@rondoflow/shared'
import { prisma } from '../lib/prisma'
import { ClaudeCodeSpawner } from './spawner'
import { upsertMemory, dedupeAgainstExisting, type ExtractedFact } from './memory-store'
import { EXTRACTION_SYSTEM_PROMPT, buildMemoryUserMessage } from '../prompts/memory-extractor'

const MODEL = ANTHROPIC.UTILITY_MODEL
const MAX_FACTS = 5
const TRANSCRIPT_CAP = 12_000
const MIN_TRANSCRIPT = 200

interface RunInput {
  readonly agentIds: readonly string[]
  readonly workspaceId?: string
  readonly transcript: string
  readonly costSessionId: string
}

/** Extract memory from a completed single-agent session run. */
export async function extractMemoriesForSession(p: {
  agentId: string
  sessionId: string
  workspaceId?: string
}): Promise<void> {
  try {
    const msgs = await prisma.message.findMany({
      where: { sessionId: p.sessionId, role: { in: ['user', 'assistant'] } },
      orderBy: { timestamp: 'asc' },
      select: { role: true, content: true },
    })
    const transcript = msgs.map((m) => `${m.role}: ${m.content}`).join('\n').slice(0, TRANSCRIPT_CAP)
    await runAndStore({
      agentIds: [p.agentId],
      workspaceId: p.workspaceId,
      transcript,
      costSessionId: `memory-extract:${p.sessionId}`,
    })
  } catch {
    // Best-effort — never surface extraction failures to the run.
  }
}

/** Extract memory from a completed multi-step chain run. */
export async function extractMemoriesForChain(p: {
  agentIds: readonly string[]
  workspaceId?: string
  outputs: Map<number, string>
}): Promise<void> {
  try {
    const transcript = [...p.outputs.values()].join('\n\n---\n\n').slice(0, TRANSCRIPT_CAP)
    await runAndStore({
      agentIds: p.agentIds,
      workspaceId: p.workspaceId,
      transcript,
      costSessionId: `memory-extract:chain:${randomUUID().slice(0, 8)}`,
    })
  } catch {
    // Best-effort.
  }
}

async function runAndStore(input: RunInput): Promise<void> {
  if (input.transcript.length < MIN_TRANSCRIPT) return

  const existing = await loadExistingMemories(input.agentIds, input.workspaceId)
  const { text, usage } = await runExtractionLLM(input.transcript, existing.map((e) => e.value).slice(0, 20), Boolean(input.workspaceId))

  // With no workspace target, every fact must be agent-scoped.
  const facts = parseFacts(text)
    .slice(0, MAX_FACTS)
    .map((f) => (input.workspaceId ? f : { ...f, scope: 'agent' as const }))
  const kept = dedupeAgainstExisting(existing, facts)

  const targetAgentId = input.agentIds[0]
  const agentMemoryEnabled = await isAgentMemoryEnabled(targetAgentId)

  for (const fact of kept) {
    if (fact.scope === 'workspace' && input.workspaceId) {
      await upsertMemory({ workspaceId: input.workspaceId, scope: 'workspace', source: 'auto', key: slugKey(fact.key), value: fact.value })
    } else if (targetAgentId && agentMemoryEnabled) {
      await upsertMemory({ agentId: targetAgentId, scope: 'agent', source: 'auto', key: slugKey(fact.key), value: fact.value })
    }
  }

  await recordExtractionCost(input.costSessionId, targetAgentId, input.workspaceId, usage)
}

async function isAgentMemoryEnabled(agentId?: string): Promise<boolean> {
  if (!agentId) return false
  const agent = await prisma.agent.findUnique({ where: { id: agentId }, select: { memoryEnabled: true } })
  return agent?.memoryEnabled ?? false
}

async function loadExistingMemories(
  agentIds: readonly string[],
  workspaceId?: string,
): Promise<{ value: string }[]> {
  const or: Array<{ agentId?: { in: string[] }; workspaceId?: string }> = []
  if (agentIds.length > 0) or.push({ agentId: { in: [...agentIds] } })
  if (workspaceId) or.push({ workspaceId })
  if (or.length === 0) return []
  return prisma.memory.findMany({ where: { OR: or }, select: { value: true }, take: 100 })
}

function runExtractionLLM(
  transcript: string,
  existingPreview: readonly string[],
  hasWorkspace: boolean,
): Promise<{ text: string; usage?: TokenUsage }> {
  return new Promise((resolve, reject) => {
    const spawner = new ClaudeCodeSpawner()
    let output = ''
    let usage: TokenUsage | undefined

    spawner.on('text', (data: { content: string; partial: boolean }) => {
      output = data.partial ? output + data.content : data.content
    })
    spawner.on('usage', (u: TokenUsage) => { usage = u })
    spawner.on('completion', () => resolve({ text: output, usage }))
    spawner.on('error', (err: Error) => reject(err))

    try {
      spawner.spawn({
        agentId: `memory-extract-${randomUUID().slice(0, 8)}`,
        sessionId: randomUUID(),
        message: buildMemoryUserMessage(transcript, existingPreview, hasWorkspace),
        systemPrompt: EXTRACTION_SYSTEM_PROMPT,
        model: MODEL,
        permissionMode: 'default',
        maxBudgetUsd: 0.03,
      })
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)))
    }
  })
}

export function parseFacts(raw: string): ExtractedFact[] {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return []
  try {
    const parsed = JSON.parse(match[0]) as { facts?: unknown }
    if (!Array.isArray(parsed.facts)) return []
    return parsed.facts
      .filter((f: unknown): f is Record<string, unknown> => typeof f === 'object' && f !== null)
      .map((f) => ({
        key: typeof f.key === 'string' ? f.key : '',
        value: typeof f.value === 'string' ? f.value : '',
        scope: f.scope === 'workspace' ? ('workspace' as const) : ('agent' as const),
        confidence: typeof f.confidence === 'number' ? f.confidence : undefined,
      }))
      .filter((f) => f.key && f.value && (f.confidence === undefined || f.confidence >= 0.6))
  } catch {
    return []
  }
}

export function slugKey(key: string): string {
  const slug = key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  return `auto:${slug || 'fact'}`
}

async function recordExtractionCost(
  sessionId: string,
  agentId: string | undefined,
  workspaceId: string | undefined,
  usage: TokenUsage | undefined,
): Promise<void> {
  if (!usage) return
  if (usage.inputTokens <= 0 && usage.outputTokens <= 0 && usage.estimatedCostUsd <= 0) return
  try {
    await prisma.sessionUsage.create({
      data: {
        sessionId,
        agentId: agentId ?? null,
        workspaceId: workspaceId ?? null,
        model: MODEL,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        costUsd: usage.estimatedCostUsd,
      },
    })
  } catch {
    // Best-effort — cost recording never fails extraction.
  }
}

