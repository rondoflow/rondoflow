import type { TokenUsage } from '@rondoflow/shared'
import type { WorkflowLogEntry } from '@/components/panels/workflow-chat'
import type { ChainStep } from '@/lib/chain-utils'

// ─── API shapes (mirror packages/server/src/routes/runs.ts) ──────────────────

export interface RunSummary {
  readonly id: string
  readonly chainId: string
  readonly workspaceId: string | null
  readonly status: string
  readonly initialMessage: string
  readonly totalSteps: number
  readonly stepCount: number
  readonly tokensIn: number
  readonly tokensOut: number
  readonly costUsd: number
  readonly createdAt: string
  readonly completedAt: string | null
}

export interface RunDetailStep {
  readonly stepIndex: number
  readonly agentId: string
  readonly agentName: string | null
  readonly model: string | null
  readonly output: string
  readonly tokensIn: number
  readonly tokensOut: number
  readonly costUsd: number
  readonly status: string
  readonly startedAt: string
  readonly completedAt: string | null
}

export interface RunDetailEvent {
  readonly seq: number
  readonly type: string
  readonly stepIndex: number | null
  readonly agentId: string | null
  readonly agentName: string | null
  readonly payload: Record<string, unknown> | null
  readonly createdAt: string
}

export interface RunDetail {
  readonly id: string
  readonly chainId: string
  readonly workspaceId: string | null
  readonly status: string
  readonly initialMessage: string
  readonly totalSteps: number
  readonly createdAt: string
  readonly completedAt: string | null
  readonly steps: readonly RunDetailStep[]
  readonly events: readonly RunDetailEvent[]
}

// ─── Reconstruction ──────────────────────────────────────────────────────────

function agentNameFor(run: RunDetail, stepIndex: number | null | undefined, fallbackName?: string | null): string {
  if (fallbackName) return fallbackName
  if (stepIndex === null || stepIndex === undefined) return ''
  const step = run.steps.find((s) => s.stepIndex === stepIndex)
  return step?.agentName ?? `Agent ${stepIndex + 1}`
}

/**
 * Rebuild the `ChainStep[]` lookup the live socket handlers index by stepIndex,
 * so a reattached running run resolves agent names correctly. The array may be
 * sparse (skipped steps have no row); callers already guard with `steps[i]?.`.
 */
export function runToSteps(run: RunDetail): ChainStep[] {
  const maxIndex = run.steps.reduce((max, s) => Math.max(max, s.stepIndex), run.totalSteps - 1)
  const steps: ChainStep[] = new Array(Math.max(maxIndex + 1, 0))
  for (const s of run.steps) {
    steps[s.stepIndex] = {
      nodeId: s.agentId,
      agentName: s.agentName ?? `Agent ${s.stepIndex + 1}`,
      model: s.model ?? undefined,
    }
  }
  return steps
}

/**
 * Fallback reconstruction from per-step results only, for legacy runs that have
 * no event transcript. Produces a step_start + step_complete (or error) per step.
 */
function stepsToLogEntries(run: RunDetail): WorkflowLogEntry[] {
  const entries: WorkflowLogEntry[] = []
  for (const s of run.steps) {
    const agentName = s.agentName ?? `Agent ${s.stepIndex + 1}`
    entries.push({
      id: `${run.chainId}-step-${s.stepIndex}-start`,
      type: 'step_start',
      content: '',
      agentName,
      stepIndex: s.stepIndex,
      completed: s.status === 'completed',
      timestamp: new Date(s.startedAt),
    })
    if (s.status === 'failed') {
      entries.push({
        id: `${run.chainId}-step-${s.stepIndex}-err`,
        type: 'error',
        content: `${agentName}: step failed`,
        timestamp: new Date(s.completedAt ?? s.startedAt),
      })
    } else {
      entries.push({
        id: `${run.chainId}-step-${s.stepIndex}-done`,
        type: 'step_complete',
        content: s.output,
        agentName,
        stepIndex: s.stepIndex,
        usage: (s.tokensIn > 0 || s.tokensOut > 0)
          ? { inputTokens: s.tokensIn, outputTokens: s.tokensOut, estimatedCostUsd: s.costUsd }
          : undefined,
        timestamp: new Date(s.completedAt ?? s.startedAt),
      })
    }
  }
  if (run.status === 'completed' || run.status === 'stopped') {
    const totalIn = run.steps.reduce((n, s) => n + s.tokensIn, 0)
    const totalOut = run.steps.reduce((n, s) => n + s.tokensOut, 0)
    const totalCost = run.steps.reduce((n, s) => n + s.costUsd, 0)
    entries.push({
      id: `${run.chainId}-complete`,
      type: 'chain_complete',
      content: run.status === 'stopped' ? 'Workflow stopped' : `Completed ${run.steps.length} steps`,
      usage: totalIn > 0 ? { inputTokens: totalIn, outputTokens: totalOut, estimatedCostUsd: totalCost } : undefined,
      timestamp: new Date(run.completedAt ?? run.createdAt),
    })
  }
  return entries
}

/**
 * Reconstruct the execution log (the exact `WorkflowLogEntry[]` the live
 * WorkflowChat renders) from a persisted run. Streamed text deltas are not
 * stored; a completed step shows its final output via the `step_complete`
 * entry, which matches what the live log collapses to once a step finishes.
 */
export function runToLogEntries(run: RunDetail): WorkflowLogEntry[] {
  const entries: WorkflowLogEntry[] = []

  // Initial user message (persisted on the run itself, not as an event).
  if (run.initialMessage) {
    entries.push({
      id: `${run.chainId}-user`,
      type: 'user',
      content: run.initialMessage,
      timestamp: new Date(run.createdAt),
    })
  }

  // Runs recorded before the transcript existed have no events — fall back to the
  // per-step results so their final outputs still show (coarse, but not empty).
  if (run.events.length === 0) {
    entries.push(...stepsToLogEntries(run))
    return entries
  }

  const completedSteps = new Set(
    run.events.filter((e) => e.type === 'step_complete').map((e) => e.stepIndex),
  )

  let totalIn = 0
  let totalOut = 0
  let totalCost = 0
  let sawUsage = false

  for (const e of run.events) {
    const id = `${run.chainId}-evt-${e.seq}`
    const ts = new Date(e.createdAt)
    const p = e.payload ?? {}

    switch (e.type) {
      case 'step_start':
        entries.push({
          id,
          type: 'step_start',
          content: '',
          agentName: agentNameFor(run, e.stepIndex, e.agentName),
          stepIndex: e.stepIndex ?? undefined,
          cwd: typeof p.cwd === 'string' ? p.cwd : undefined,
          completed: e.stepIndex !== null && completedSteps.has(e.stepIndex),
          timestamp: ts,
        })
        break

      case 'step_tool_use': {
        const toolId = typeof p.id === 'string' ? p.id : id
        entries.push({
          id: toolId,
          type: 'step_tool_use',
          content: typeof p.toolName === 'string' ? p.toolName : 'tool',
          agentName: agentNameFor(run, e.stepIndex, e.agentName),
          stepIndex: e.stepIndex ?? undefined,
          toolUse: { toolName: String(p.toolName ?? 'tool'), input: p.input, id: toolId },
          timestamp: ts,
        })
        break
      }

      case 'step_tool_result': {
        // Merge the output into the matching tool_use entry (rendered there).
        const toolUseId = typeof p.toolUseId === 'string' ? p.toolUseId : undefined
        const idx = entries.findIndex(
          (x) => x.type === 'step_tool_use' && x.toolUse?.id === toolUseId,
        )
        if (idx >= 0) {
          const existing = entries[idx]!
          entries[idx] = { ...existing, toolUse: { ...existing.toolUse!, output: p.output } }
        }
        break
      }

      case 'step_complete': {
        const usage = p.usage as TokenUsage | undefined
        if (usage) {
          totalIn += usage.inputTokens ?? 0
          totalOut += usage.outputTokens ?? 0
          totalCost += usage.estimatedCostUsd ?? 0
          sawUsage = true
        }
        entries.push({
          id,
          type: 'step_complete',
          content: typeof p.output === 'string' ? p.output : '',
          agentName: agentNameFor(run, e.stepIndex, e.agentName),
          stepIndex: e.stepIndex ?? undefined,
          usage,
          timestamp: ts,
        })
        break
      }

      case 'chain_complete':
        entries.push({
          id,
          type: 'chain_complete',
          content: p.stopped
            ? 'Workflow stopped'
            : `Completed ${typeof p.totalSteps === 'number' ? p.totalSteps : run.totalSteps} steps`,
          usage: sawUsage
            ? { inputTokens: totalIn, outputTokens: totalOut, estimatedCostUsd: totalCost }
            : undefined,
          timestamp: ts,
        })
        break

      case 'error':
        entries.push({
          id,
          type: 'error',
          content: e.stepIndex !== null && e.stepIndex !== undefined
            ? `${agentNameFor(run, e.stepIndex, e.agentName)}: ${String(p.error ?? 'Error')}`
            : String(p.error ?? 'Error'),
          timestamp: ts,
        })
        break

      case 'director_decision':
        entries.push({
          id,
          type: 'director_decision',
          content: String(p.reasoning ?? p.message ?? ''),
          directorAction: (p.action as 'continue' | 'redirect' | 'conclude' | undefined) ?? 'continue',
          timestamp: ts,
        })
        break

      case 'director_redirect_request':
        entries.push({
          id,
          type: 'director_redirect_request',
          content: String(p.reasoning ?? ''),
          requestId: typeof p.requestId === 'string' ? p.requestId : undefined,
          timestamp: ts,
        })
        break

      default:
        break
    }
  }

  return entries
}
