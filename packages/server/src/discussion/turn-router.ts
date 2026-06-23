// TurnRouter — orchestrates single-turn spawns within a discussion.
// Each call to executeTurn or executeModeratorTurn spawns a fresh Claude Code
// process, collects all output, and returns when the process exits.
// No long-lived sessions are maintained between turns.

import { randomUUID } from 'crypto'
import { ClaudeCodeSpawner } from '../engine/spawner'
import { buildSpawnConfig } from '../engine/prompt-builder'
import { resolvePolicy } from '../engine/policy-resolver'
import type { AgentRecord } from './moderator'
import type { TokenUsage } from '@rondoflow/shared'
import type { ModeratorDecision } from './moderator'

const DEFAULT_TURN_TIMEOUT_MS = 2 * 60 * 1_000   // 2 minutes per turn
const MODERATOR_TURN_TIMEOUT_MS = 90 * 1_000      // 1.5 minutes for moderation decisions

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface TurnResult {
  readonly agentId: string
  readonly agentName: string
  readonly response: string
  readonly tokenUsage: TokenUsage
  readonly durationMs: number
}

export interface ModeratorTurnResult {
  readonly raw: string
  readonly parsed?: ModeratorDecision
}

// ---------------------------------------------------------------------------
// TurnRouter class
// ---------------------------------------------------------------------------

export class TurnRouter {
  // The spawner for the turn currently in flight, so abort() (called from
  // ModeratorEngine.stop on teardown) can kill its child process tree. Set while
  // a turn runs, cleared when it settles.
  private activeSpawner: ClaudeCodeSpawner | null = null
  private aborted = false

  /** Kill the in-flight turn (if any) and refuse to start further turns. */
  abort(): void {
    this.aborted = true
    this.activeSpawner?.kill()
    this.activeSpawner = null
  }

  /**
   * Execute a single participant turn.
   * Spawns the agent process, waits for completion, and returns the collected response.
   * If the process exceeds timeoutMs it is killed and an error is thrown.
   */
  async executeTurn(
    agent: AgentRecord,
    prompt: string,
    context: string,
    timeoutMs: number = DEFAULT_TURN_TIMEOUT_MS,
  ): Promise<TurnResult> {
    if (this.aborted) throw new Error('Discussion stopped')
    const startedAt = Date.now()

    const config = await buildSpawnConfig(agent.id)
    const policy = await resolvePolicy(agent.id)

    // Discussions are fully headless — there is no human in the loop to answer
    // the CLI's permission prompt. In a prompting mode (default/plan) the CLI
    // auto-denies any tool call that isn't pre-approved via --allowedTools
    // (verified on CLI 2.1.170: a WebFetch call is denied when only Read is
    // allow-listed). So a participant whose configured tools don't cover what a
    // turn needs — it must read a URL but has no WebFetch, or wants WebSearch,
    // which isn't even in DEFAULT_TOOLS — just replies "I need your permission
    // to fetch the web pages" and stalls. Running with bypassPermissions lets
    // tool calls execute without that dead-end gate (it overrides the allow-list
    // too), matching the same fix on chain runs (chain-executor / socket
    // handlers) and automated loops (routes/loops.ts). Spend stays bounded by
    // maxBudgetUsd.
    const permissionMode = 'bypassPermissions'
    const maxBudgetUsd = Math.min(
      config.maxBudgetUsd ?? policy.maxBudgetUsd,
      policy.maxBudgetUsd,
    )

    // Build a single message combining context + prompt into the user turn
    const fullMessage = context.trim().length > 0
      ? `${context}\n\n---\n\n${prompt}`
      : prompt

    // The Claude CLI requires --session-id to be a valid UUID (it exits 1 with
    // "Invalid session ID. Must be a valid UUID." otherwise). Sessions aren't
    // persisted across turns (--no-session-persistence), so a fresh UUID per turn
    // is all we need — the descriptive id was rejected by the CLI.
    const sessionId = randomUUID()

    const response = await spawnAndCollect(
      {
        agentId: agent.id,
        sessionId,
        message: fullMessage,
        systemPrompt: config.systemPrompt,
        appendSystemPrompt: config.appendSystemPrompt,
        allowedTools: config.allowedTools,
        model: config.model,
        permissionMode,
        maxBudgetUsd,
        env: config.env,
      },
      timeoutMs,
      (s) => { this.activeSpawner = s },
    )

    const durationMs = Date.now() - startedAt

    return {
      agentId: agent.id,
      agentName: agent.name,
      response: response.text,
      tokenUsage: response.tokenUsage,
      durationMs,
    }
  }

  /**
   * Execute a moderator turn that expects structured JSON output.
   * Attempts to parse the response as a ModeratorDecision; falls back gracefully.
   */
  async executeModeratorTurn(
    moderator: AgentRecord,
    prompt: string,
    context: string,
    _jsonSchema?: object,
  ): Promise<ModeratorTurnResult> {
    if (this.aborted) throw new Error('Discussion stopped')
    const config = await buildSpawnConfig(moderator.id)
    const policy = await resolvePolicy(moderator.id)

    const permissionMode = mergePermissionModes(config.permissionMode, policy.permissionMode)
    const maxBudgetUsd = Math.min(
      config.maxBudgetUsd ?? policy.maxBudgetUsd,
      policy.maxBudgetUsd,
    )

    // Moderator gets the full context as system context and the evaluation prompt
    // as the user message.
    const fullMessage = context.trim().length > 0
      ? `${context}\n\n---\n\n${prompt}`
      : prompt

    // See executeTurn: the CLI demands a valid UUID for --session-id.
    const sessionId = randomUUID()

    const response = await spawnAndCollect(
      {
        agentId: moderator.id,
        sessionId,
        message: fullMessage,
        systemPrompt: config.systemPrompt,
        appendSystemPrompt: config.appendSystemPrompt,
        allowedTools: [],   // Moderator evaluation turns require no tools
        model: config.model,
        permissionMode,
        maxBudgetUsd,
        env: config.env,
      },
      MODERATOR_TURN_TIMEOUT_MS,
      (s) => { this.activeSpawner = s },
    )

    const raw = response.text.trim()
    const parsed = tryParseDecision(raw)

    return { raw, parsed }
  }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

interface CollectResult {
  readonly text: string
  readonly tokenUsage: TokenUsage
}

interface SpawnCollectOptions {
  readonly agentId: string
  readonly sessionId: string
  readonly message: string
  readonly systemPrompt: string
  readonly appendSystemPrompt?: string
  readonly allowedTools: readonly string[]
  readonly model: string
  readonly permissionMode: string
  readonly maxBudgetUsd?: number
  readonly env: Record<string, string>
}

/**
 * Spawn a Claude Code process, collect all text output, and resolve when done.
 * Rejects on error or timeout.
 */
function spawnAndCollect(
  options: SpawnCollectOptions,
  timeoutMs: number,
  register?: (spawner: ClaudeCodeSpawner | null) => void,
): Promise<CollectResult> {
  return new Promise<CollectResult>((resolve, reject) => {
    const spawner = new ClaudeCodeSpawner()
    register?.(spawner)
    const textChunks: string[] = []
    let tokenUsage: TokenUsage = { inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 }
    let settled = false

    const settle = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      register?.(null)
      fn()
    }

    const timer = setTimeout(() => {
      settle(() => {
        spawner.kill()
        reject(new Error(`Agent ${options.agentId} timed out after ${timeoutMs}ms`))
      })
    }, timeoutMs)

    spawner.on('text', (data: { content: string; partial: boolean }) => {
      // Collect only complete (non-partial) blocks to avoid duplicate content.
      // Partial events are incremental deltas; the final non-partial event contains
      // the full accumulated text for that block.
      if (!data.partial) {
        textChunks.push(data.content)
      }
    })

    spawner.on('usage', (usage: TokenUsage) => {
      tokenUsage = usage
    })

    spawner.on('completion', () => {
      settle(() => resolve({ text: textChunks.join('\n').trim(), tokenUsage }))
    })

    spawner.on('error', (err: Error) => {
      settle(() => reject(err))
    })

    try {
      spawner.spawn({
        agentId: options.agentId,
        sessionId: options.sessionId,
        message: options.message,
        systemPrompt: options.systemPrompt,
        appendSystemPrompt: options.appendSystemPrompt,
        allowedTools: options.allowedTools,
        model: options.model,
        permissionMode: options.permissionMode,
        maxBudgetUsd: options.maxBudgetUsd,
        env: options.env,
      })
    } catch (err) {
      settle(() => reject(err))
    }
  })
}

/**
 * Try to extract a ModeratorDecision from a raw response string.
 * The model may wrap JSON in markdown fences — strip them before parsing.
 */
function tryParseDecision(raw: string): ModeratorDecision | undefined {
  // Strip markdown code fences if present
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  // Find the first '{' and last '}' to extract the JSON object
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return undefined

  const candidate = stripped.slice(start, end + 1)

  try {
    const parsed = JSON.parse(candidate) as Record<string, unknown>

    if (parsed['decision'] !== 'continue' && parsed['decision'] !== 'synthesize') {
      return undefined
    }

    return {
      decision: parsed['decision'] as 'continue' | 'synthesize',
      nextParticipantId: typeof parsed['nextParticipantId'] === 'string'
        ? parsed['nextParticipantId']
        : undefined,
      question: typeof parsed['question'] === 'string'
        ? parsed['question']
        : undefined,
      synthesis: typeof parsed['synthesis'] === 'string'
        ? parsed['synthesis']
        : undefined,
      reasoning: typeof parsed['reasoning'] === 'string'
        ? parsed['reasoning']
        : '',
    }
  } catch {
    return undefined
  }
}

/**
 * Merge two permission-mode strings, returning the more restrictive one.
 * Restrictiveness ranking (most → least): default > plan > acceptEdits > dontAsk
 */
function mergePermissionModes(a: string, b: string): string {
  const rank: Record<string, number> = {
    default: 3,
    plan: 2,
    acceptEdits: 1,
    dontAsk: 0,
  }
  return (rank[a] ?? 0) >= (rank[b] ?? 0) ? a : b
}
