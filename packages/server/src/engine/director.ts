// Director — intelligent workflow orchestrator that contextualizes messages
// between chain steps, evaluates output quality, and can redirect or conclude.

import { ANTHROPIC } from '@rondoflow/shared'
import { ClaudeCodeSpawner } from './spawner'
import { prisma } from '../lib/prisma'
import { randomUUID } from 'crypto'
import { upsertMemory } from './memory-store'
import {
  getDirectorBudget, DEFAULT_DIRECTOR_BUDGET_USD,
  getDirectorTimeout, DEFAULT_DIRECTOR_TIMEOUT_SEC,
} from '../services/settings'
import { buildDirectorSystemPrompt, buildDirectorUserMessage } from '../prompts/director'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DirectorAgent {
  readonly name: string
  readonly persona: string
}

export interface DirectorExecutionEntry {
  readonly stepIndex: number
  readonly agentName: string
  readonly output: string
  readonly wasRetry: boolean
}

export interface DirectorContext {
  readonly initialMessage: string
  readonly agents: readonly DirectorAgent[]
  readonly executionHistory: readonly DirectorExecutionEntry[]
  readonly currentStepOutput: string
  readonly completedStepIndex: number
  readonly totalSteps: number
  readonly memories: readonly string[]
  readonly rigor?: number
  readonly customInstructions?: string
  // Agent name(s) the workflow's branch conditions select as the next step,
  // computed from the current output. Empty ⇒ this path terminates here. Set
  // only when the chain has conditional/branch edges (otherwise undefined).
  readonly nextAgents?: readonly string[]
  // True when the chain contains Condition branches. Toggles branch-aware prompt
  // guidance: the Director is the quality gate, but the conditions — not the
  // Director — choose the path.
  readonly branchingActive?: boolean
}

export type DirectorAction = 'continue' | 'redirect' | 'conclude'

export interface DirectorAgentSuggestion {
  readonly agentName: string
  readonly changeType: 'persona' | 'model'
  readonly suggestion: string
  readonly reason: string
}

export interface DirectorDecision {
  readonly action: DirectorAction
  readonly targetStepIndex: number
  readonly message: string
  readonly reasoning: string
  readonly learning: string | null
  /** Continuous planner: optional mid-run suggestions for agent changes */
  readonly agentSuggestions?: readonly DirectorAgentSuggestion[]
}

// ─── Director Class ──────────────────────────────────────────────────────────

export class Director {
  async evaluate(context: DirectorContext): Promise<DirectorDecision> {
    const systemPrompt = buildDirectorSystemPrompt(context)
    const userMessage = buildDirectorUserMessage(context)

    // Per-evaluation spend cap, configurable in Settings (defaults to a few
    // cents). Read here so a long workflow with a large prompt can be given more
    // headroom without a code change. A read failure degrades to the default.
    let maxBudgetUsd: number
    try {
      maxBudgetUsd = await getDirectorBudget()
    } catch {
      maxBudgetUsd = DEFAULT_DIRECTOR_BUDGET_USD
    }

    // Per-evaluation wall-clock cap, also configurable in Settings (defaults to
    // 90s). Long workflows with large step histories can need more than the
    // default to finish — raising it here avoids the "timed out (wall-clock)"
    // fallback without a code change. A read failure degrades to the default.
    let timeoutSec: number
    try {
      timeoutSec = await getDirectorTimeout()
    } catch {
      timeoutSec = DEFAULT_DIRECTOR_TIMEOUT_SEC
    }

    let output: string
    try {
      const spawner = new ClaudeCodeSpawner()
      output = await this.spawnAndCollect(spawner, systemPrompt, userMessage, maxBudgetUsd, timeoutSec)
    } catch (err) {
      // The Director is advisory: a failed evaluation must NEVER abort the chain.
      // Degrade to the default decision instead of throwing, but record WHY —
      // both in the server log and in the decision's `reasoning`, which is
      // surfaced verbatim in the UI (chain:director_decision) and saved run
      // history. This is the spawn/timeout/CLI failure path (see spawnAndCollect);
      // an unparseable response is handled separately by parseDirectorResponse.
      const reason = err instanceof Error ? err.message : String(err)
      console.error('[Director] evaluation failed:', reason)
      return fallbackDecision(context, reason)
    }

    return parseDirectorResponse(output, context)
  }

  async loadMemories(agentIds: readonly string[]): Promise<readonly string[]> {
    if (agentIds.length === 0) return []
    try {
      const memories = await prisma.memory.findMany({
        where: {
          key: { startsWith: 'director:learning:' },
          agentId: { in: [...agentIds] },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      })
      return memories.map((m) => m.value)
    } catch (err) {
      // Best-effort: a DB error here just means the Director runs without prior
      // learnings. Log it so a silent memory-load failure stays diagnosable
      // instead of looking like "the agent never learned anything".
      console.warn('[Director] failed to load learnings:', err instanceof Error ? err.message : err)
      return []
    }
  }

  async saveMemory(agentId: string, learning: string): Promise<void> {
    // Timestamp key keeps each learning distinct; upsertMemory tags scope/source
    // consistently with the auto-extractor and caps the value length.
    await upsertMemory({
      agentId,
      scope: 'agent',
      source: 'director',
      key: `director:learning:${Date.now()}`,
      value: learning,
    })
  }

  private spawnAndCollect(
    spawner: ClaudeCodeSpawner,
    systemPrompt: string,
    message: string,
    maxBudgetUsd: number,
    timeoutSec: number,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let output = ''

      spawner.on('text', (data: { content: string; partial: boolean }) => {
        if (data.partial) {
          output += data.content
        } else {
          output = data.content
        }
      })

      spawner.on('completion', () => {
        resolve(output)
      })

      spawner.on('error', (err: Error) => {
        // Pass the raw spawner message through unwrapped. evaluate()'s catch
        // routes this into fallbackDecision, which prepends the single
        // "Director evaluation failed:" prefix — wrapping here too produced the
        // doubled "Director evaluation failed: Director evaluation failed: …".
        reject(err)
      })

      try {
        spawner.spawn({
          agentId: `director-${randomUUID().slice(0, 8)}`,
          sessionId: randomUUID(),
          message,
          systemPrompt,
          model: ANTHROPIC.UTILITY_MODEL,
          // NOT 'default'/'plan': in a prompting mode the headless CLI auto-denies
          // any tool the model attempts (none are pre-approved here — no
          // allowedTools) and the model then STALLS replying "I need your
          // permission…". That reply keeps streaming text, so the idle timer never
          // fires and the run burns the full 90s wall-clock before being reaped —
          // exactly the "timed out (wall-clock) after 90000ms" failure. Mirrors the
          // loop-engine / prd-pipeline headless fix. The Director emits JSON only
          // and grants no tools, so bypassPermissions never actually runs anything;
          // it just removes the permission gate that caused the stall.
          permissionMode: 'bypassPermissions',
          maxBudgetUsd,
          // Bounded JSON-only call — cap absolute runtime so a hung CLI can't
          // wedge the chain. A timeout rejects here; the chain falls back to its
          // default decision (see parseDirectorResponse / fallbackDecision).
          // Configurable in Settings (DIRECTOR_MAX_WALL_CLOCK_SEC) so long
          // workflows can be given more headroom than the 90s default.
          maxWallClockMs: timeoutSec * 1000,
        })
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }
}

// ─── Response Parsing ───────────────────────────────────────────────────────

function parseDirectorResponse(raw: string, context: DirectorContext): DirectorDecision {
  // Try to extract JSON from the response (handle code fences, extra text)
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return fallbackDecision(context)
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>

    const action = validateAction(parsed.action)
    const targetStepIndex = typeof parsed.targetStepIndex === 'number'
      ? parsed.targetStepIndex
      : action === 'redirect'
        ? context.completedStepIndex
        : context.completedStepIndex + 1
    const message = typeof parsed.message === 'string' ? parsed.message : ''
    const reasoning = typeof parsed.reasoning === 'string' ? parsed.reasoning : 'No reasoning provided.'
    const learning = typeof parsed.learning === 'string' ? parsed.learning : null

    // Parse optional agent suggestions (continuous planner)
    const rawSuggestions = Array.isArray(parsed.agentSuggestions) ? parsed.agentSuggestions : []
    const agentSuggestions: DirectorAgentSuggestion[] = rawSuggestions
      .slice(0, 3)
      .filter((s: unknown): s is Record<string, unknown> => typeof s === 'object' && s !== null)
      .map((s) => ({
        agentName: typeof s.agentName === 'string' ? s.agentName : '',
        changeType: (s.changeType === 'persona' || s.changeType === 'model' ? s.changeType : 'persona') as 'persona' | 'model',
        suggestion: typeof s.suggestion === 'string' ? s.suggestion : '',
        reason: typeof s.reason === 'string' ? s.reason : '',
      }))
      .filter((s) => s.agentName && s.suggestion)

    return {
      action, targetStepIndex, message, reasoning, learning,
      agentSuggestions: agentSuggestions.length > 0 ? agentSuggestions : undefined,
    }
  } catch {
    return fallbackDecision(context)
  }
}

function validateAction(value: unknown): DirectorAction {
  if (value === 'continue' || value === 'redirect' || value === 'conclude') {
    return value
  }
  return 'continue'
}

function fallbackDecision(context: DirectorContext, errorReason?: string): DirectorDecision {
  const nextStep = context.completedStepIndex + 1
  const isLast = nextStep >= context.totalSteps

  // When the failure cause is known (spawn/timeout/CLI error) surface it verbatim
  // so the user can see exactly WHY the Director was skipped for this step;
  // otherwise the run produced an unparseable response.
  const reasoning = errorReason
    ? `Director evaluation failed: ${errorReason}. Continuing with default behavior — this step's output was passed on unreviewed.`
    : 'Director could not parse the evaluation response. Proceeding with default behavior.'

  return {
    action: isLast ? 'conclude' : 'continue',
    targetStepIndex: nextStep,
    message: isLast
      ? 'Workflow completed.'
      : context.currentStepOutput,
    reasoning,
    learning: null,
  }
}
