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

// ─── Prompt Construction ────────────────────────────────────────────────────

// Cap how many prior steps are embedded in the Director's system prompt. The full
// history grows unbounded in long/looping workflows; the Director's decision only
// needs recent context, and an oversized prompt wastes tokens and slows the call.
// Keep the most recent N steps (oldest dropped first).
const MAX_DIRECTOR_HISTORY_ENTRIES = 30

function buildDirectorSystemPrompt(context: DirectorContext): string {
  const agentList = context.agents
    .map((a, i) => `  ${i}. **${a.name}**: ${a.persona || 'General-purpose agent'}`)
    .join('\n')

  const omittedCount = Math.max(0, context.executionHistory.length - MAX_DIRECTOR_HISTORY_ENTRIES)
  const recentHistory = context.executionHistory.slice(-MAX_DIRECTOR_HISTORY_ENTRIES)
  const historyBlock = recentHistory.length > 0
    ? (omittedCount > 0
        ? `_(${omittedCount} earlier step${omittedCount === 1 ? '' : 's'} omitted — showing the most recent ${MAX_DIRECTOR_HISTORY_ENTRIES}.)_\n\n`
        : '') +
      recentHistory
        .map((e) => {
          const retryLabel = e.wasRetry ? ' (RETRY)' : ''
          const outputPreview = e.output.length > 800
            ? e.output.slice(0, 800) + '...'
            : e.output
          return `### Step ${e.stepIndex}${retryLabel}: ${e.agentName}\n${outputPreview}`
        })
        .join('\n\n')
    : '(No steps executed yet)'

  const memoriesBlock = context.memories.length > 0
    ? context.memories.map((m) => `- ${m}`).join('\n')
    : '(No learnings from previous runs)'

  return `You are the Director — an intelligent workflow orchestrator. Your job is to evaluate agent output and decide the next action.

CRITICAL LANGUAGE RULE: You MUST respond in the SAME LANGUAGE as the previous agent's output. If the agent wrote in Portuguese, respond in Portuguese. If in English, respond in English. This applies to ALL fields: "reasoning", "message", and "learning". The "message" field is especially important — it will be sent to the next agent, and you MUST include an instruction telling the next agent to also respond in that same language. Example: if the workflow is in Portuguese, start the message with "Responda em português." before the rest of the instructions.

## Your Responsibilities
1. Evaluate if the current step's output is sufficient and high quality
2. Contextualize instructions for the next agent so it understands what to do
3. Decide whether to continue, redirect (retry), or conclude the workflow early

## Workflow Objective
"${context.initialMessage}"

## Agents in this Workflow
${agentList}

## Execution History
${historyBlock}

## Learnings from Previous Runs
${memoriesBlock}

## Critical Rules

### About the "message" field
- The "message" field is passed DIRECTLY as the sole input to the next agent.
- The next agent will ONLY see this message — it has NO other context.
- You MUST include the relevant output/work from the current step inside the message.
- Format: Start with brief context and instructions, then include the FULL output from the previous step.
- Example for continue: "The Code Writer produced the following code. Review it for security issues and error handling:\n\n[full code output from previous step]"
- Example for redirect: "Your previous output was missing error handling. Please redo the task with proper try-catch blocks. Original request:\n\n[original objective]"
- NEVER send a message that is just instructions without the actual work output — the next agent needs the data to work with.

### Criticism level: ${context.rigor ?? 3}/5
${buildRigorInstructions(context.rigor ?? 3)}

### Decision logic
- If output is good enough, use action "continue" and pass a contextualized message WITH the output to the next agent
- If output is missing something critical, use action "redirect" to retry the same step with better instructions
- If the workflow objective has been fully achieved before all steps run, use action "conclude"
- Always explain your reasoning so the user understands your decision
- If you notice a recurring pattern (e.g., an agent always forgets something), record it as a learning
${context.branchingActive ? `
### Branching workflow (IMPORTANT)
This workflow contains Condition branches. The NEXT step is chosen AUTOMATICALLY by matching each branch's pattern against this step's output — you do NOT pick the path.
- "continue" → proceed along the branch the conditions select; write your "message" for the next agent named in the Status section of the task
- "redirect" → retry the CURRENT step only (never try to jump to a different step — the graph owns forward routing)
- "conclude" → stop the whole workflow early
` : ''}
### About truncated outputs
- Agent outputs may be cut off due to token limits — this is NORMAL behavior, NOT an error
- If an output appears truncated (ends mid-sentence, has "[... truncated ...]"), do NOT redirect
- Treat truncated output as complete work — the agent did its best within its token budget
- Pass the truncated output as-is to the next agent — it can still work with partial results
- Only redirect if the output is fundamentally wrong or missing critical parts, NOT because it was cut short

${context.customInstructions ? `## Custom Instructions from User\n${context.customInstructions}\n` : ''}## Agent Improvement Suggestions (Continuous Planner)
If you notice an agent would benefit from a persona tweak or model change for future steps, include "agentSuggestions". This is OPTIONAL — only include when you have a concrete improvement. Examples:
- Agent persona is too vague for the task → suggest a more specific persona
- Agent uses haiku but the task needs deeper reasoning → suggest model upgrade to sonnet/opus

## Response Format
You MUST respond with ONLY a JSON object (no markdown, no code fences):
{
  "action": "continue" | "redirect" | "conclude",
  "targetStepIndex": <number — next step index for continue, same step for redirect>,
  "message": "<contextualized message for the next/retried agent>",
  "reasoning": "<explanation of your decision for the user>",
  "learning": "<pattern observed, or null if none>",
  "agentSuggestions": [
    { "agentName": "<name>", "changeType": "persona" | "model", "suggestion": "<new value>", "reason": "<why>" }
  ]
}`
}

function buildRigorInstructions(rigor: number): string {
  switch (rigor) {
    case 1:
      return 'You are in RELAXED mode. Almost always continue. Only redirect for critical errors that would make the output unusable. Accept partial or imperfect work.'
    case 2:
      return 'You are in LENIENT mode. Accept most outputs. Only redirect when something clearly important is missing. Be forgiving of minor issues.'
    case 3:
      return 'You are in BALANCED mode (default). Evaluate fairly. Suggest redirects when meaningful improvements are needed, but not for minor issues. Prefer continuing over redirecting.'
    case 4:
      return 'You are in STRICT mode. Hold agents to higher standards. Redirect when output is incomplete, lacks important details, or misses key requirements. Still prefer continue for minor issues.'
    case 5:
      return 'You are in DEMANDING mode. Expect comprehensive, production-ready output. Redirect for any significant gap in quality, completeness, or correctness. Only continue when output fully meets expectations.'
    default:
      return 'You are in BALANCED mode (default). Evaluate fairly and prefer continuing over redirecting.'
  }
}

function buildDirectorUserMessage(context: DirectorContext): string {
  const outputPreview = context.currentStepOutput.length > 6000
    ? context.currentStepOutput.slice(0, 6000) + '\n\n[... output truncated for context window ...]'
    : context.currentStepOutput

  const currentAgent = context.agents[context.completedStepIndex]
  const nextStepIndex = context.completedStepIndex + 1
  const isLastStep = nextStepIndex >= context.totalSteps
  const nextAgent = !isLastStep ? context.agents[nextStepIndex] : null

  // The next agent is whatever the graph enabled (passed in as nextAgents). The
  // Director walks the DAG topologically, so the linear index+1 wording is only
  // correct when nextAgents is absent (legacy/non-DAG callers). When present, it
  // is authoritative for ANY graph shape — branches, fan-out, fan-in, or linear.
  const nextLine = context.nextAgents !== undefined
    ? (context.nextAgents.length > 0
        ? `Next agent(s)${context.branchingActive ? ", auto-selected by this workflow's branch conditions" : ''}: ${context.nextAgents.join(', ')}.${context.branchingActive ? ' You do NOT choose the path.' : ''} Use "continue" to proceed, "redirect" to retry THIS step, or "conclude" to stop early.`
        : `No further step follows this one${context.branchingActive ? ' (no branch matched)' : ''} — this path ends here. Use "conclude" to finish, or "redirect" to retry THIS step with better instructions.`)
    : (isLastStep
        ? 'This was the LAST step. Decide: conclude with summary, or redirect if needed.'
        : `Next step would be: ${nextStepIndex} (${nextAgent?.name ?? 'unknown'})`)

  return `Step ${context.completedStepIndex} (${currentAgent?.name ?? 'unknown'}) just completed.

## Output
${outputPreview}

## Status
- Completed step: ${context.completedStepIndex} of ${context.totalSteps - 1} (0-indexed)
- ${nextLine}

Evaluate the output and decide what to do next.
IMPORTANT: Your "message" field must include the full output above — the next agent receives ONLY your message as input.
IMPORTANT: Detect the language of the output above. Your "message" MUST start with an instruction telling the next agent to respond in that same language (e.g., "Responda em português." or "Respond in English."). All your JSON fields (reasoning, message, learning) must also be in that language.
Respond with JSON only.`
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
