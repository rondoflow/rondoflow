// ChainExecutor — executes a directed acyclic graph (DAG) of agent steps.
// Validates for cycles before execution, runs independent branches in parallel,
// and passes predecessor output as input to each successive step.

import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { buildSpawnConfig } from './prompt-builder'
import { createAgentRunner } from './agent-runner'
import type { AgentRunner } from './agent-runner'
import type { SpawnOptions } from './spawner'
import type { TokenUsage, ChainApprovalMode, RunStep } from '@rondoflow/shared'
import { buildStructuredDataset, wrapDataset, serializeDataset, parseDataset } from '@rondoflow/shared'
import { extractStructuredRows } from './structured-extractor'
import type { StructurerStepConfig, DbSaveStepConfig } from './structured-extractor'
import { performHttpRequest } from './http-request-runner'
import type { HttpRequestStepConfig } from './http-request-runner'
import { performDuckDuckGoSearch } from './duckduckgo-search-runner'
import type { DuckDuckGoSearchStepConfig } from './duckduckgo-search-runner'
import { performSakanaAiCompletion } from './sakana-ai-runner'
import type { SakanaAiStepConfig } from './sakana-ai-runner'
import { performApifyActorRun } from './apify-actor-runner'
import type { ApifyActorStepConfig } from './apify-actor-runner'
import { Director } from './director'
import type { DirectorDecision, DirectorAgent, DirectorExecutionEntry } from './director'

// Caps for a Save-to-DB node, mirroring the 50k-char philosophy on
// ChainStepResult.output: never let a runaway agent persist an unbounded set.
const MAX_DATASET_ROWS = 5000
const MAX_DATASET_BYTES = 2_000_000

export interface ChainStep {
  readonly agentId: string
  /** Step kind. Absent ⇒ 'agent'. Non-agent steps (structurer/db-save/http-request/duckduckgo-search/sakana-ai/apify-actor)
   *  carry a canvas node id in `agentId` and are not backed by an Agent row. */
  readonly nodeType?: 'agent' | 'structurer' | 'db-save' | 'http-request' | 'duckduckgo-search' | 'sakana-ai' | 'apify-actor'
  /** Display name for non-agent steps (no Agent lookup possible). */
  readonly name?: string
  /** Spawn overrides for agent steps. */
  readonly config?: Partial<SpawnOptions>
  /** Settings for non-agent steps (structurer/db-save/http-request/duckduckgo-search/sakana-ai/apify-actor node config). */
  readonly nodeConfig?: Record<string, unknown>
  readonly conditions?: ReadonlyArray<{ pattern: string; targetStepIndex: number }>
}

export interface ChainEdge {
  readonly from: number
  readonly to: number
  // Case-insensitive regex matched against the predecessor's last non-empty
  // output line. Absent/empty ⇒ unconditional edge (always enables the target).
  readonly condition?: string
  // Condition-node id grouping mutually-exclusive sibling branches from the same
  // predecessor. Within a group only the lowest-`order` matching edge enables its
  // target; if none match, the else edge (no `condition`) wins.
  readonly group?: string
  readonly order?: number
}

export interface ChainDefinition {
  readonly steps: readonly ChainStep[]
  readonly edges: readonly ChainEdge[]
}

export interface ChainExecuteOptions {
  readonly cwd?: string
  readonly workspaceId?: string
  /** Chain id correlator, stored on datasets a Save-to-DB step persists. */
  readonly chainId?: string
  readonly director?: boolean
  readonly directorRigor?: number
  readonly directorCustomInstructions?: string
  // Whole-run permission handling. 'perStep' pauses before each agent step and
  // waits for the user to approve it (tools then run freely within the step).
  readonly approvalMode?: ChainApprovalMode
  // Overrides the per-agent CLI permission mode for every step in this run.
  // The socket layer sets this to 'bypassPermissions' so tools (e.g. WebSearch)
  // are never denied non-interactively — the human gate, if any, is per-step.
  readonly permissionMode?: string
}

export interface ChainExecutorEvents {
  step_start: (data: { stepIndex: number; agentId: string; cwd?: string }) => void
  step_text: (data: { stepIndex: number; agentId: string; content: string; partial: boolean }) => void
  step_tool_use: (data: { stepIndex: number; agentId: string; toolName: string; input: unknown; id: string }) => void
  step_tool_result: (data: { stepIndex: number; agentId: string; toolName: string; output: unknown; toolUseId: string }) => void
  step_usage: (data: { stepIndex: number; agentId: string; model?: string; usage: TokenUsage }) => void
  step_complete: (data: { stepIndex: number; agentId: string; output: string }) => void
  step_skipped: (data: { stepIndex: number; agentId: string; reason: 'condition_not_met' | 'cascade' | 'error_cascade' }) => void
  step_director: (data: { decision: DirectorDecision; stepIndex: number }) => void
  step_director_thinking: (data: { stepIndex: number }) => void
  step_director_redirect_request: (data: { decision: DirectorDecision; stepIndex: number; requestId: string }) => void
  step_approval_request: (data: { stepIndex: number; agentId: string; requestId: string }) => void
  chain_stopped: (data: { reason: string }) => void
  chain_complete: (data: { outputs: Map<number, string> }) => void
  error: (data: { stepIndex: number; error: string }) => void
}

export declare interface ChainExecutor {
  on<K extends keyof ChainExecutorEvents>(event: K, listener: ChainExecutorEvents[K]): this
  emit<K extends keyof ChainExecutorEvents>(event: K, ...args: Parameters<ChainExecutorEvents[K]>): boolean
}

export class ChainExecutor extends EventEmitter {
  private stopped = false
  private activeSpawners: AgentRunner[] = []
  private executionCwd?: string
  private executionWorkspaceId?: string
  private executionChainId?: string
  private approvalMode: ChainApprovalMode = 'auto'
  private permissionModeOverride?: string
  private pendingRedirectResolvers = new Map<string, (approved: boolean) => void>()
  private pendingStepApprovals = new Map<string, (approved: boolean) => void>()
  // Agent metadata loaded once for Director context
  private agentMetadata = new Map<string, DirectorAgent>()

  /** Resolve a pending Director redirect request (called from socket handler) */
  resolveRedirect(requestId: string, approved: boolean): void {
    const resolver = this.pendingRedirectResolvers.get(requestId)
    if (resolver) {
      this.pendingRedirectResolvers.delete(requestId)
      resolver(approved)
    }
  }

  /** Resolve a pending per-step approval request (called from socket handler) */
  resolveStepApproval(requestId: string, approved: boolean): void {
    const resolver = this.pendingStepApprovals.get(requestId)
    if (resolver) {
      this.pendingStepApprovals.delete(requestId)
      resolver(approved)
    }
  }

  async execute(chain: ChainDefinition, initialMessage: string, options?: ChainExecuteOptions): Promise<void> {
    this.stopped = false
    this.activeSpawners = []
    this.executionCwd = options?.cwd
    this.executionWorkspaceId = options?.workspaceId
    this.executionChainId = options?.chainId
    this.approvalMode = options?.approvalMode ?? 'auto'
    this.permissionModeOverride = options?.permissionMode

    validateNoCycles(chain)

    // Route to Director-driven execution if enabled
    if (options?.director) {
      return this.executeDirector(chain, initialMessage, options)
    }

    const outputs = new Map<number, string>()
    const stepCount = chain.steps.length

    if (stepCount === 0) {
      this.emit('chain_complete', { outputs })
      return
    }

    // Build adjacency lists
    const predecessors = buildPredecessorMap(chain)

    // Topological order via Kahn's algorithm
    const topoOrder = topologicalSort(stepCount, predecessors)

    // Process in topological layers to allow parallel execution.
    // `skipped` includes errored steps so the readiness check treats them as
    // resolved; `errored` is the subset that threw, used only to label why a
    // descendant was skipped. Skips cascade naturally across layers: a node with
    // no enabling predecessor is itself marked skipped when it becomes ready.
    const completed = new Set<number>()
    const skipped = new Set<number>()
    const errored = new Set<number>()

    let remaining = [...topoOrder]

    while (remaining.length > 0 && !this.stopped) {
      // Find all steps whose predecessors are completed (or skipped)
      const ready = remaining.filter((idx) => {
        const preds = predecessors.get(idx) ?? []
        return preds.every((p) => completed.has(p) || skipped.has(p))
      })

      if (ready.length === 0) break

      remaining = remaining.filter((idx) => !ready.includes(idx))

      // Determine which ready steps should actually run. A step runs if it is a
      // root, or if at least one resolved predecessor *enables* it (an
      // unconditional edge, or the winning edge of a conditional/branch group).
      const toRun = ready.filter((idx) => {
        const preds = predecessors.get(idx) ?? []
        if (preds.length === 0) return true // root node — always run
        for (const predIdx of preds) {
          if (skipped.has(predIdx)) continue
          if (this.predEnables(chain, predIdx, idx, outputs.get(predIdx) ?? '')) {
            return true
          }
        }
        return false
      })

      // Ready steps that won't run are skipped now; this also cascades to their
      // descendants in later layers (a skipped predecessor never enables them).
      for (const idx of ready) {
        if (toRun.includes(idx)) continue
        const preds = predecessors.get(idx) ?? []
        const reason: 'condition_not_met' | 'cascade' | 'error_cascade' =
          preds.some((p) => errored.has(p))
            ? 'error_cascade'
            : preds.length > 0 && preds.every((p) => skipped.has(p))
              ? 'cascade'
              : 'condition_not_met'
        this.markSkipped(chain, idx, skipped, reason)
      }

      if (toRun.length === 0) continue

      // Execute ready steps in parallel
      const results = await Promise.allSettled(
        toRun.map((stepIndex) =>
          this.runStep(chain, chain.steps[stepIndex]!, stepIndex, predecessors, outputs, initialMessage),
        ),
      )

      for (let i = 0; i < results.length; i++) {
        const stepIndex = toRun[i]!
        const result = results[i]!

        if (result.status === 'fulfilled') {
          outputs.set(stepIndex, result.value)
          completed.add(stepIndex)
        } else {
          const errorMsg = result.reason instanceof Error
            ? result.reason.message
            : String(result.reason)
          this.emit('error', { stepIndex, error: errorMsg })
          // Mark this step as errored/resolved so independent branches continue
          // and its descendants cascade-skip (labelled 'error_cascade').
          skipped.add(stepIndex)
          errored.add(stepIndex)
        }
      }
    }

    if (!this.stopped) {
      this.emit('chain_complete', { outputs })
    }
  }

  /**
   * Whether a completed predecessor `predIdx` enables step `idx` to run, given
   * the predecessor's output. Unconditional ungrouped edges always enable;
   * ungrouped conditional edges enable when their pattern matches the
   * predecessor's verdict (last non-empty line); grouped edges (Condition-node
   * branches) are mutually exclusive — only the group's winning edge enables.
   */
  private predEnables(chain: ChainDefinition, predIdx: number, idx: number, predOutput: string): boolean {
    const edgesFromPred = chain.edges.filter((e) => e.from === predIdx)
    const edgesToIdx = edgesFromPred.filter((e) => e.to === idx)
    if (edgesToIdx.length === 0) return false

    const verdict = verdictText(predOutput)

    // Ungrouped edges are evaluated independently.
    for (const e of edgesToIdx) {
      if (e.group !== undefined) continue
      if (!e.condition || e.condition.length === 0) return true // unconditional
      if (matchCondition(e.condition, verdict)) return true
    }

    // Grouped edges: the target runs only if it is the winner of its group.
    const groups = new Set(
      edgesToIdx.filter((e) => e.group !== undefined).map((e) => e.group!),
    )
    for (const g of groups) {
      const winner = resolveGroupWinner(edgesFromPred, g, verdict)
      if (winner && winner.to === idx) return true
    }
    return false
  }

  /** Mark a step skipped (once) and notify listeners. */
  private markSkipped(
    chain: ChainDefinition,
    idx: number,
    skipped: Set<number>,
    reason: 'condition_not_met' | 'cascade' | 'error_cascade',
  ): void {
    if (skipped.has(idx)) return
    skipped.add(idx)
    this.emit('step_skipped', { stepIndex: idx, agentId: chain.steps[idx]!.agentId, reason })
  }

  // ------------------------------------------------------------------
  // Director-driven execution
  // ------------------------------------------------------------------

  private async executeDirector(
    chain: ChainDefinition,
    initialMessage: string,
    options: ChainExecuteOptions,
  ): Promise<void> {
    const outputs = new Map<number, string>()
    const completed = new Set<number>()
    const skipped = new Set<number>()
    const errored = new Set<number>()
    const director = new Director()
    const agentIds = chain.steps.map((s) => s.agentId)

    // Load agent metadata for Director context
    await this.loadAgentMetadata(chain)

    const memories = await director.loadMemories(agentIds)

    const executionHistory: DirectorExecutionEntry[] = []
    const agents: DirectorAgent[] = chain.steps.map((step) => {
      const meta = this.agentMetadata.get(step.agentId)
      return meta ?? { name: step.agentId, persona: '' }
    })

    // The Director walks the graph one node at a time (it cannot parallelise),
    // but it now honours the same conditional/branch edges as the DAG path: the
    // next node is whichever successor the predecessor's output *enables*, not a
    // blind index+1. Non-taken branches are skipped (and cascade) exactly as in
    // DAG mode, so the canvas greys them out instead of silently ignoring them.
    const predecessors = buildPredecessorMap(chain)
    const topoOrder = topologicalSort(chain.steps.length, predecessors)
    const branchingActive = chain.edges.some(
      (e) => (e.condition !== undefined && e.condition.length > 0) || e.group !== undefined,
    )

    const MAX_RETRIES_PER_STEP = 2
    const retryCount = new Map<number, number>()
    // Contextualised messages the Director crafts for the *next* agent, routed to
    // the specific successor(s) the branch conditions selected (fan-in keeps all).
    // `retryInput` holds redo instructions for a step being retried (consumed once).
    const routedMessages = new Map<number, string[]>()
    const retryInput = new Map<number, string>()

    let remaining = [...topoOrder]
    let concluded = false

    while (remaining.length > 0 && !this.stopped && !concluded) {
      // Next node: the first in topological order whose predecessors are all
      // resolved (completed or skipped). Guarantees a fan-in node runs only once.
      const idx = remaining.find((i) =>
        (predecessors.get(i) ?? []).every((p) => completed.has(p) || skipped.has(p)),
      )
      if (idx === undefined) break
      remaining = remaining.filter((r) => r !== idx)

      const step = chain.steps[idx]!
      const preds = predecessors.get(idx) ?? []
      const isRoot = preds.length === 0

      // Does a resolved predecessor actually enable this node? Skipped/errored
      // predecessors never enable; conditions and group exclusivity are honoured
      // via predEnables — the very logic the DAG path uses to gate steps.
      const isEnabled =
        isRoot ||
        preds.some((p) => !skipped.has(p) && this.predEnables(chain, p, idx, outputs.get(p) ?? ''))
      if (!isEnabled) {
        const reason: 'condition_not_met' | 'cascade' | 'error_cascade' =
          preds.some((p) => errored.has(p))
            ? 'error_cascade'
            : preds.length > 0 && preds.every((p) => skipped.has(p))
              ? 'cascade'
              : 'condition_not_met'
        this.markSkipped(chain, idx, skipped, reason)
        continue
      }

      const message = this.directorInputMessage(
        idx, isRoot, preds, retryInput, routedMessages, outputs, initialMessage,
      )

      // Run the step
      let output: string
      try {
        output = await this.runSingleStep(step, idx, message)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        this.emit('error', { stepIndex: idx, error: errorMsg })
        // Mark errored so dependents cascade-skip while independent branches go on.
        skipped.add(idx)
        errored.add(idx)
        continue
      }
      if (this.stopped) break

      outputs.set(idx, output)
      completed.add(idx)
      executionHistory.push({
        stepIndex: idx,
        agentName: agents[idx]?.name ?? step.agentId,
        output,
        wasRetry: (retryCount.get(idx) ?? 0) > 0,
      })

      // Which successors the branch conditions select next (computed from the
      // output, before the Director evaluates, so its message can name them).
      const nextSteps = this.enabledSuccessors(chain, idx, output)
      const nextAgents = nextSteps.map((s) => agents[s]?.name ?? chain.steps[s]!.agentId)

      // Director evaluates the output (quality gate + optional early conclude).
      this.emit('step_director_thinking', { stepIndex: idx })

      let decision: DirectorDecision
      try {
        decision = await director.evaluate({
          initialMessage,
          agents,
          executionHistory,
          currentStepOutput: output,
          completedStepIndex: idx,
          totalSteps: chain.steps.length,
          memories,
          rigor: options.directorRigor,
          customInstructions: options.directorCustomInstructions,
          nextAgents,
          branchingActive,
        })
      } catch (err) {
        // Defensive net: director.evaluate() already degrades spawn/timeout/CLI
        // failures to a fallback decision internally (it no longer throws for
        // those), so reaching here means an UNEXPECTED throw. Log the real cause
        // and continue (the branch graph decides what runs next) rather than
        // aborting the chain — and surface that cause in `reasoning` (rendered
        // verbatim in the UI) instead of a generic "failed" message.
        const reason = err instanceof Error ? err.message : String(err)
        console.error('[ChainExecutor] director evaluation failed:', reason)
        decision = {
          action: 'continue',
          targetStepIndex: idx,
          message: output,
          reasoning: `Director evaluation failed: ${reason}. Continuing with default behavior.`,
          learning: null,
        }
      }

      this.emit('step_director', { decision, stepIndex: idx })

      // Save learning if present — attach to the first agent in the chain.
      // Fire-and-forget, but catch so a DB write failure surfaces as a logged
      // warning rather than an unhandled promise rejection that could crash the
      // process.
      if (decision.learning && agentIds[0]) {
        void director.saveMemory(agentIds[0], decision.learning).catch((err: unknown) => {
          console.warn('[ChainExecutor] failed to save director learning:', err instanceof Error ? err.message : err)
        })
      }

      // Redirect = retry THIS step. The branch graph (not the Director) owns
      // forward routing, so a divergent targetStepIndex is intentionally ignored:
      // the Director cannot jump across the DAG and re-run resolved ancestors.
      if (decision.action === 'redirect') {
        const retries = retryCount.get(idx) ?? 0
        const retry = await this.resolveDirectorRedirect(idx, retries, MAX_RETRIES_PER_STEP, decision)
        if (retry) {
          retryCount.set(idx, retries + 1)
          completed.delete(idx)
          outputs.delete(idx)
          retryInput.set(idx, ensureMessageHasContent(decision.message, output))
          remaining.unshift(idx)
          continue
        }
        // declined / max retries exceeded — fall through and advance
      }

      if (decision.action === 'conclude') {
        concluded = true
        break
      }

      // Continue: hand the contextualised message to whichever branch(es) the
      // conditions enabled, so the selected next agent receives it as its input.
      const contextual = ensureMessageHasContent(decision.message, output)
      for (const succ of nextSteps) {
        const arr = routedMessages.get(succ) ?? []
        arr.push(contextual)
        routedMessages.set(succ, arr)
      }
    }

    if (!this.stopped) {
      this.emit('chain_complete', { outputs })
    }
  }

  /**
   * The successors of `fromIdx` that its `output` enables, honouring conditional
   * edges and Condition-node group exclusivity (only a group's winning branch is
   * returned). Mirrors the DAG path's predEnables so Director-mode routing and
   * DAG-mode gating always agree on which branch is taken.
   */
  private enabledSuccessors(chain: ChainDefinition, fromIdx: number, output: string): number[] {
    const targets = [...new Set(chain.edges.filter((e) => e.from === fromIdx).map((e) => e.to))]
    return targets.filter((to) => this.predEnables(chain, fromIdx, to, output))
  }

  /**
   * Whether a redirected step should actually be retried. The first redirect on a
   * step is auto-approved; the second asks the user; beyond `max` it is forced to
   * continue (emitting a synthetic decision so the UI reflects the override).
   */
  private async resolveDirectorRedirect(
    idx: number,
    retries: number,
    max: number,
    decision: DirectorDecision,
  ): Promise<boolean> {
    if (retries >= max) {
      this.emit('step_director', {
        decision: { ...decision, action: 'continue' as const, reasoning: `Max retries (${max}) exceeded for this step. Continuing.` },
        stepIndex: idx,
      })
      return false
    }
    if (retries === 0) return true // first redirect — auto-approve, no user prompt
    const requestId = randomUUID()
    this.emit('step_director_redirect_request', { decision, stepIndex: idx, requestId })
    return this.waitForRedirectApproval(requestId)
  }

  /**
   * The input message for a Director step: the redo instructions if it's a retry,
   * the workflow objective if it's a root, otherwise the contextualised message(s)
   * the enabling predecessor(s) routed here (fan-in concatenates). Falls back to
   * raw predecessor outputs if a step is enabled but nothing was routed.
   */
  private directorInputMessage(
    idx: number,
    isRoot: boolean,
    preds: readonly number[],
    retryInput: Map<number, string>,
    routedMessages: Map<number, string[]>,
    outputs: Map<number, string>,
    initialMessage: string,
  ): string {
    const retry = retryInput.get(idx)
    if (retry !== undefined) {
      retryInput.delete(idx)
      return retry
    }
    if (isRoot) return initialMessage
    const msgs = routedMessages.get(idx) ?? []
    if (msgs.length === 1) return msgs[0]!
    if (msgs.length > 1) {
      return msgs.map((m, i) => `## Contextualized input ${i + 1}\n${m}`).join('\n\n')
    }
    const outs = preds.filter((p) => outputs.has(p)).map((p) => outputs.get(p)!)
    if (outs.length === 0) return initialMessage
    if (outs.length === 1) return outs[0]!
    return outs.map((o, i) => `## Input from step ${preds[i]}\n${o}`).join('\n\n')
  }

  private async loadAgentMetadata(chain: ChainDefinition): Promise<void> {
    const { prisma: db } = await import('../lib/prisma')
    const agentIds = chain.steps.map((s) => s.agentId)

    try {
      const agents = await db.agent.findMany({
        where: { id: { in: agentIds } },
        select: { id: true, name: true, persona: true },
      })

      for (const agent of agents) {
        this.agentMetadata.set(agent.id, {
          name: agent.name,
          persona: agent.persona ?? '',
        })
      }
    } catch {
      // Best-effort — names will fall back to IDs
    }
  }

  /** Run a single step without DAG logic (used by Director loop) */
  private async runSingleStep(
    step: ChainStep,
    stepIndex: number,
    message: string,
  ): Promise<string> {
    const approved = await this.awaitStepApproval(stepIndex, step.agentId)
    if (!approved) {
      if (!this.stopped) {
        this.emit('chain_stopped', { reason: `Step ${stepIndex + 1} was not approved` })
        this.stop()
      }
      return ''
    }

    const config = await buildSpawnConfig(step.agentId, this.executionWorkspaceId)
    const sessionId = randomUUID()
    // The agent's external folder (resolved into config.cwd by buildSpawnConfig)
    // takes precedence over the workspace working directory — see prompt-builder.
    // executionCwd is only a fallback for when workspace-context resolution failed
    // upstream; otherwise it equals config.cwd for the same workspace anyway.
    const cwd = config.cwd ?? this.executionCwd

    this.emit('step_start', { stepIndex, agentId: step.agentId, cwd })

    const spawner = createAgentRunner(config.provider)
    this.activeSpawners.push(spawner)

    return new Promise<string>((resolve, reject) => {
      let fullOutput = ''

      spawner.on('text', (data: { content: string; partial: boolean }) => {
        if (data.partial) {
          fullOutput += data.content
        } else {
          fullOutput = data.content
        }
        this.emit('step_text', { stepIndex, agentId: step.agentId, content: data.content, partial: data.partial })
      })

      spawner.on('tool_use', (data: { toolName: string; input: unknown; id: string }) => {
        this.emit('step_tool_use', { stepIndex, agentId: step.agentId, toolName: data.toolName, input: data.input, id: data.id })
      })

      spawner.on('tool_result', (data: { toolName: string; output: unknown; toolUseId: string }) => {
        this.emit('step_tool_result', { stepIndex, agentId: step.agentId, toolName: data.toolName, output: data.output, toolUseId: data.toolUseId })
      })

      spawner.on('usage', (data: TokenUsage) => {
        this.emit('step_usage', { stepIndex, agentId: step.agentId, model: config.model, usage: data })
      })

      spawner.on('completion', () => {
        this.activeSpawners = this.activeSpawners.filter((s) => s !== spawner)
        this.emit('step_complete', { stepIndex, agentId: step.agentId, output: fullOutput })
        resolve(fullOutput)
      })

      spawner.on('error', (err: Error) => {
        this.activeSpawners = this.activeSpawners.filter((s) => s !== spawner)
        reject(new Error(`Step ${stepIndex} (agent ${step.agentId}) failed: ${err.message}`))
      })

      try {
        spawner.spawn({
          agentId: step.agentId,
          sessionId,
          message,
          systemPrompt: config.systemPrompt,
          appendSystemPrompt: config.appendSystemPrompt,
          allowedTools: config.allowedTools,
          model: config.model,
          permissionMode: this.permissionModeOverride ?? config.permissionMode,
          maxBudgetUsd: config.maxBudgetUsd,
          env: config.env,
          cwd,
          provider: config.provider,
          ...(config.providerConfig ? { providerConfig: config.providerConfig } : {}),
          // Expose attached external folders (and workspace dirs) to the step.
          ...(config.addDirs && config.addDirs.length > 0 ? { addDirs: config.addDirs } : {}),
          ...step.config,
        })
      } catch (err) {
        this.activeSpawners = this.activeSpawners.filter((s) => s !== spawner)
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }

  private waitForRedirectApproval(requestId: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.pendingRedirectResolvers.set(requestId, resolve)

      // Auto-decline after 2 minutes if no response
      setTimeout(() => {
        if (this.pendingRedirectResolvers.has(requestId)) {
          this.pendingRedirectResolvers.delete(requestId)
          resolve(false)
        }
      }, 120_000)
    })
  }

  /**
   * Gate a step on human approval when approvalMode is 'perStep'. Emits a
   * `step_approval_request` and resolves true once the user approves, or false
   * if the run is stopped (stop() releases all pending approvals) or the
   * request times out. In 'auto' mode this resolves true immediately.
   */
  private awaitStepApproval(stepIndex: number, agentId: string): Promise<boolean> {
    if (this.approvalMode !== 'perStep') return Promise.resolve(true)
    if (this.stopped) return Promise.resolve(false)

    const requestId = randomUUID()
    this.emit('step_approval_request', { stepIndex, agentId, requestId })

    return new Promise<boolean>((resolve) => {
      this.pendingStepApprovals.set(requestId, resolve)

      // Auto-stop after 15 minutes if the user never responds, so an abandoned
      // run doesn't leave a process (and this promise) dangling forever.
      setTimeout(() => {
        if (this.pendingStepApprovals.has(requestId)) {
          this.pendingStepApprovals.delete(requestId)
          resolve(false)
        }
      }, 15 * 60_000)
    })
  }

  stop(): void {
    this.stopped = true
    for (const spawner of this.activeSpawners) {
      spawner.kill()
    }
    this.activeSpawners = []
    // Release any awaiting per-step approvals so their steps unwind cleanly
    // instead of leaving dangling promises on an abandoned executor.
    for (const [id, resolve] of this.pendingStepApprovals) {
      this.pendingStepApprovals.delete(id)
      resolve(false)
    }
    // Likewise release any pending Director redirect approval: in the single-
    // cursor Director loop the whole chain is parked on this await, so without
    // this the run would ignore Stop until the 120s redirect timeout fired.
    for (const [id, resolve] of this.pendingRedirectResolvers) {
      this.pendingRedirectResolvers.delete(id)
      resolve(false)
    }
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private async runStep(
    chain: ChainDefinition,
    step: ChainStep,
    stepIndex: number,
    predecessors: Map<number, number[]>,
    outputs: Map<number, string>,
    initialMessage: string,
  ): Promise<string> {
    // Non-agent steps (structurer/db-save/http-request/duckduckgo-search/sakana-ai/apify-actor) run no
    // Claude agent, take no per-step approval, and are dispatched before any spawn
    // config is resolved.
    if (
      step.nodeType === 'structurer' ||
      step.nodeType === 'db-save' ||
      step.nodeType === 'http-request' ||
      step.nodeType === 'duckduckgo-search' ||
      step.nodeType === 'sakana-ai' ||
      step.nodeType === 'apify-actor'
    ) {
      return this.runNonAgentStep(chain, step, stepIndex, predecessors, outputs)
    }

    const approved = await this.awaitStepApproval(stepIndex, step.agentId)
    if (!approved) {
      if (!this.stopped) {
        this.emit('chain_stopped', { reason: `Step ${stepIndex + 1} was not approved` })
        this.stop()
      }
      return ''
    }

    const message = this.buildStepMessage(stepIndex, predecessors, outputs, initialMessage)
    const config = await buildSpawnConfig(step.agentId, this.executionWorkspaceId)
    const sessionId = randomUUID()
    // The agent's external folder (resolved into config.cwd by buildSpawnConfig)
    // takes precedence over the workspace working directory — see prompt-builder.
    // executionCwd is only a fallback for when workspace-context resolution failed
    // upstream; otherwise it equals config.cwd for the same workspace anyway.
    const cwd = config.cwd ?? this.executionCwd

    this.emit('step_start', { stepIndex, agentId: step.agentId, cwd })

    const spawner = createAgentRunner(config.provider)
    this.activeSpawners.push(spawner)

    return new Promise<string>((resolve, reject) => {
      let fullOutput = ''

      spawner.on('text', (data: { content: string; partial: boolean }) => {
        if (data.partial) {
          fullOutput += data.content
        } else {
          fullOutput = data.content
        }
        this.emit('step_text', { stepIndex, agentId: step.agentId, content: data.content, partial: data.partial })
      })

      spawner.on('tool_use', (data: { toolName: string; input: unknown; id: string }) => {
        this.emit('step_tool_use', { stepIndex, agentId: step.agentId, toolName: data.toolName, input: data.input, id: data.id })
      })

      spawner.on('tool_result', (data: { toolName: string; output: unknown; toolUseId: string }) => {
        this.emit('step_tool_result', { stepIndex, agentId: step.agentId, toolName: data.toolName, output: data.output, toolUseId: data.toolUseId })
      })

      spawner.on('usage', (data: TokenUsage) => {
        this.emit('step_usage', { stepIndex, agentId: step.agentId, model: config.model, usage: data })
      })

      spawner.on('completion', () => {
        this.activeSpawners = this.activeSpawners.filter((s) => s !== spawner)
        // A DAG step that finishes with no usable output must NOT be reported as
        // a success: buildStepMessage would feed an empty string to every
        // downstream node, silently poisoning the rest of the workflow. Reject
        // so execute()'s settled-loop emits an error and skips dependents
        // instead. (The Director path in runSingleStep deliberately does NOT do
        // this — it lets the Director redirect/retry on empty output; genuine
        // CLI failures still surface there via the spawner 'error' event.)
        if (fullOutput.trim().length === 0) {
          reject(new Error(
            `Step ${stepIndex + 1} (agent ${step.agentId}) completed with no output. ` +
            'The agent ran but produced nothing — usually a tool failure (e.g. WebFetch ' +
            'unavailable or blocked), a credential/auth problem, or a hit budget/turn limit.',
          ))
          return
        }
        this.emit('step_complete', { stepIndex, agentId: step.agentId, output: fullOutput })
        resolve(fullOutput)
      })

      spawner.on('error', (err: Error) => {
        this.activeSpawners = this.activeSpawners.filter((s) => s !== spawner)
        reject(new Error(`Step ${stepIndex} (agent ${step.agentId}) failed: ${err.message}`))
      })

      try {
        spawner.spawn({
          agentId: step.agentId,
          sessionId,
          message,
          systemPrompt: config.systemPrompt,
          appendSystemPrompt: config.appendSystemPrompt,
          allowedTools: config.allowedTools,
          model: config.model,
          permissionMode: this.permissionModeOverride ?? config.permissionMode,
          maxBudgetUsd: config.maxBudgetUsd,
          env: config.env,
          cwd,
          provider: config.provider,
          ...(config.providerConfig ? { providerConfig: config.providerConfig } : {}),
          // Expose attached external folders (and workspace dirs) to the step.
          ...(config.addDirs && config.addDirs.length > 0 ? { addDirs: config.addDirs } : {}),
          ...step.config,
        })
      } catch (err) {
        this.activeSpawners = this.activeSpawners.filter((s) => s !== spawner)
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }

  private buildStepMessage(
    stepIndex: number,
    predecessors: Map<number, number[]>,
    outputs: Map<number, string>,
    initialMessage: string,
  ): string {
    const preds = predecessors.get(stepIndex) ?? []

    if (preds.length === 0) {
      return initialMessage
    }

    const predOutputs = preds
      .filter((p) => outputs.has(p))
      .map((p) => outputs.get(p)!)

    if (predOutputs.length === 1) {
      return predOutputs[0]!
    }

    // Fan-in: concatenate all predecessor outputs
    return predOutputs
      .map((out, i) => `## Input from step ${preds[i]}\n${out}`)
      .join('\n\n')
  }

  // ------------------------------------------------------------------
  // Non-agent steps: Structurer (extract) and Save-to-DB (persist)
  // ------------------------------------------------------------------

  /** Dispatch + lifecycle for a non-agent step. Emits step_start/step_complete
   *  like an agent step so the UI/persistence path is unchanged. */
  private async runNonAgentStep(
    chain: ChainDefinition,
    step: ChainStep,
    stepIndex: number,
    predecessors: Map<number, number[]>,
    outputs: Map<number, string>,
  ): Promise<string> {
    this.emit('step_start', { stepIndex, agentId: step.agentId })
    const output =
      step.nodeType === 'structurer'
        ? await this.runStructurerStep(chain, step, stepIndex, predecessors, outputs)
        : step.nodeType === 'http-request'
          ? await this.runHttpRequestStep(chain, step, stepIndex, predecessors, outputs)
          : step.nodeType === 'duckduckgo-search'
            ? await this.runDuckDuckGoSearchStep(chain, step, stepIndex, predecessors, outputs)
            : step.nodeType === 'sakana-ai'
              ? await this.runSakanaAiStep(chain, step, stepIndex, predecessors, outputs)
            : step.nodeType === 'apify-actor'
              ? await this.runApifyActorStep(chain, step, stepIndex, predecessors, outputs)
            : await this.runDbSaveStep(chain, step, stepIndex, predecessors, outputs)
    this.emit('step_complete', { stepIndex, agentId: step.agentId, output })
    return output
  }

  /** Predecessor outputs as RunStep[] (agentName = upstream node id). */
  private predecessorSteps(
    chain: ChainDefinition,
    stepIndex: number,
    predecessors: Map<number, number[]>,
    outputs: Map<number, string>,
  ): { steps: RunStep[]; sourceAgentIds: string[] } {
    const preds = (predecessors.get(stepIndex) ?? []).filter((p) => outputs.has(p))
    const steps = preds.map((p) => ({
      agentName: chain.steps[p]?.agentId ?? `step-${p}`,
      output: outputs.get(p)!,
    }))
    return { steps, sourceAgentIds: preds.map((p) => chain.steps[p]?.agentId ?? `step-${p}`) }
  }

  /** Turn upstream agent output(s) into a serialized StructuredDataset envelope.
   *  Never rejects on empty extraction — an empty dataset is a valid result. */
  private async runStructurerStep(
    chain: ChainDefinition,
    step: ChainStep,
    stepIndex: number,
    predecessors: Map<number, number[]>,
    outputs: Map<number, string>,
  ): Promise<string> {
    const cfg = (step.nodeConfig ?? {}) as unknown as StructurerStepConfig
    const format = cfg.format ?? 'table'
    const schema = cfg.schema ?? []
    const { steps, sourceAgentIds } = this.predecessorSteps(chain, stepIndex, predecessors, outputs)
    const name = cfg.name || step.name || 'Dataset'

    let dataset
    if (cfg.extractionMode === 'ai') {
      const text = steps.map((s) => s.output).join('\n\n')
      const rows = await extractStructuredRows({
        text,
        schema,
        format,
        instructions: cfg.instructions,
        model: cfg.model || 'haiku',
      })
      dataset = wrapDataset(rows, { name, format, schema, sourceAgentIds })
    } else {
      dataset = buildStructuredDataset(steps, { name, format, schema, sourceAgentIds })
    }

    this.emit('step_text', {
      stepIndex,
      agentId: step.agentId,
      content: `Structured ${dataset.rows.length} row(s) as ${format}.`,
      partial: false,
    })
    return serializeDataset(dataset)
  }

  /** Issue the node's HTTP request, interpolating `{{input}}` with the combined
   *  upstream output, and return the response body so it flows downstream. Rejects
   *  on a non-2xx status / network error / timeout so the node errors and its
   *  dependents are skipped (the node's "fail the step" contract). */
  private async runHttpRequestStep(
    chain: ChainDefinition,
    step: ChainStep,
    stepIndex: number,
    predecessors: Map<number, number[]>,
    outputs: Map<number, string>,
  ): Promise<string> {
    const cfg = (step.nodeConfig ?? {}) as unknown as HttpRequestStepConfig
    const { steps } = this.predecessorSteps(chain, stepIndex, predecessors, outputs)
    const input = steps.map((s) => s.output).join('\n\n')

    const { status, output } = await performHttpRequest(cfg, input)

    this.emit('step_text', {
      stepIndex,
      agentId: step.agentId,
      content: `${cfg.method ?? 'GET'} ${cfg.url} → ${status}`,
      partial: false,
    })
    return output
  }

  /** Run the node's DuckDuckGo search, using the combined upstream output as the
   *  `{{input}}` for the query, and return the results so they flow downstream.
   *  Rejects on an empty query / network error / non-2xx / timeout so the node
   *  errors and its dependents are skipped (the node's "fail the step" contract). */
  private async runDuckDuckGoSearchStep(
    chain: ChainDefinition,
    step: ChainStep,
    stepIndex: number,
    predecessors: Map<number, number[]>,
    outputs: Map<number, string>,
  ): Promise<string> {
    const cfg = (step.nodeConfig ?? {}) as unknown as DuckDuckGoSearchStepConfig
    const { steps } = this.predecessorSteps(chain, stepIndex, predecessors, outputs)
    const input = steps.map((s) => s.output).join('\n\n')

    const { count, output } = await performDuckDuckGoSearch(cfg, input)

    this.emit('step_text', {
      stepIndex,
      agentId: step.agentId,
      content: `DuckDuckGo search → ${count} result(s)`,
      partial: false,
    })
    return output
  }

  /** Run the node's Sakana AI completion and return its downstream output. */
  private async runSakanaAiStep(
    chain: ChainDefinition,
    step: ChainStep,
    stepIndex: number,
    predecessors: Map<number, number[]>,
    outputs: Map<number, string>,
  ): Promise<string> {
    const cfg = (step.nodeConfig ?? {}) as unknown as SakanaAiStepConfig
    const { steps } = this.predecessorSteps(chain, stepIndex, predecessors, outputs)
    const input = steps.map((s) => s.output).join('\n\n')

    const { output } = await performSakanaAiCompletion(cfg, input)

    this.emit('step_text', {
      stepIndex,
      agentId: step.agentId,
      content: `Sakana AI completion (${cfg.model})`,
      partial: false,
    })
    return output
  }

  /** Run the node's Apify actor and return its dataset as downstream output. */
  private async runApifyActorStep(
    chain: ChainDefinition,
    step: ChainStep,
    stepIndex: number,
    predecessors: Map<number, number[]>,
    outputs: Map<number, string>,
  ): Promise<string> {
    const cfg = (step.nodeConfig ?? {}) as unknown as ApifyActorStepConfig
    const { steps } = this.predecessorSteps(chain, stepIndex, predecessors, outputs)
    const input = steps.map((s) => s.output).join('\n\n')

    const { count, output } = await performApifyActorRun(cfg, input)

    this.emit('step_text', {
      stepIndex,
      agentId: step.agentId,
      content: `Apify actor ${cfg.actorId} returned ${count} item(s)`,
      partial: false,
    })
    return output
  }

  /** Persist the upstream Structurer's dataset to the DB. No-ops (with a message)
   *  when nothing structured feeds in; throws only on a genuine write failure. */
  private async runDbSaveStep(
    chain: ChainDefinition,
    step: ChainStep,
    stepIndex: number,
    predecessors: Map<number, number[]>,
    outputs: Map<number, string>,
  ): Promise<string> {
    const cfg = (step.nodeConfig ?? {}) as unknown as DbSaveStepConfig
    const preds = (predecessors.get(stepIndex) ?? []).filter((p) => outputs.has(p))
    const dataset = preds.map((p) => parseDataset(outputs.get(p)!)).find((d) => d !== null)

    if (!dataset) {
      return 'Nothing to save — no structured dataset feeds into this node.'
    }

    // Cap rows + total bytes so a runaway agent can't insert an unbounded set.
    let rows = dataset.rows.slice(0, MAX_DATASET_ROWS)
    while (rows.length > 0 && JSON.stringify(rows).length > MAX_DATASET_BYTES) {
      rows = rows.slice(0, Math.floor(rows.length / 2))
    }

    const { prisma: db } = await import('../lib/prisma')
    const saved = await db.structuredDataset.create({
      data: {
        workspaceId: this.executionWorkspaceId ?? null,
        chainRunId: this.executionChainId ?? null,
        nodeId: step.agentId,
        name: cfg.label || cfg.name || dataset.name,
        format: dataset.format,
        schema: dataset.schema as unknown as object,
        rowCount: rows.length,
        sourceAgentIds: [...dataset.sourceAgentIds],
        rows: {
          create: rows.map((data, idx) => ({ idx, data: data as unknown as object })),
        },
      },
      select: { id: true },
    })

    try {
      const { recordActivity } = await import('../services/activity')
      await recordActivity({
        workspaceId: this.executionWorkspaceId,
        type: 'dataset_saved',
        title: cfg.label || cfg.name || dataset.name,
        detail: `${rows.length} row(s)`,
        metadata: { datasetId: saved.id, format: dataset.format },
      })
    } catch {
      // Best-effort audit — never fail the save on an activity write.
    }

    return `Saved ${rows.length} row(s) to dataset ${saved.id}.`
  }
}

// ------------------------------------------------------------------
// Graph utilities
// ------------------------------------------------------------------

function buildPredecessorMap(chain: ChainDefinition): Map<number, number[]> {
  const map = new Map<number, number[]>()
  for (let i = 0; i < chain.steps.length; i++) {
    map.set(i, [])
  }
  for (const edge of chain.edges) {
    const preds = map.get(edge.to) ?? []
    preds.push(edge.from)
    map.set(edge.to, preds)
  }
  return map
}

// ------------------------------------------------------------------
// Conditional / branching edge helpers
// ------------------------------------------------------------------

/** The text a condition is matched against: the predecessor's last non-empty line. */
function verdictText(output: string): string {
  const lines = output.split('\n').map((l) => l.trim()).filter(Boolean)
  return lines.length ? lines[lines.length - 1]! : ''
}

/** Case-insensitive regex test; an invalid pattern never matches. */
function matchCondition(condition: string, verdict: string): boolean {
  try {
    return new RegExp(condition, 'i').test(verdict)
  } catch {
    return false
  }
}

/**
 * The single winning edge of a Condition-node group for a given predecessor:
 * the lowest-`order` conditional edge whose pattern matches, or the group's else
 * edge (the one with no condition) as fallback. Returns null if nothing matches
 * and there is no else edge.
 */
function resolveGroupWinner(
  edgesFromPred: readonly ChainEdge[],
  group: string,
  verdict: string,
): ChainEdge | null {
  const groupEdges = edgesFromPred.filter((e) => e.group === group)
  const conditional = groupEdges
    .filter((e) => e.condition !== undefined && e.condition.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  for (const e of conditional) {
    if (matchCondition(e.condition!, verdict)) return e
  }
  return groupEdges.find((e) => !e.condition || e.condition.length === 0) ?? null
}

function topologicalSort(stepCount: number, predecessors: Map<number, number[]>): number[] {
  const inDegree = new Array<number>(stepCount).fill(0)
  for (let i = 0; i < stepCount; i++) {
    inDegree[i] = (predecessors.get(i) ?? []).length
  }

  const queue: number[] = []
  for (let i = 0; i < stepCount; i++) {
    if (inDegree[i] === 0) queue.push(i)
  }

  const order: number[] = []
  const successors = new Map<number, number[]>()
  for (let i = 0; i < stepCount; i++) {
    successors.set(i, [])
  }
  for (let i = 0; i < stepCount; i++) {
    for (const pred of predecessors.get(i) ?? []) {
      successors.get(pred)!.push(i)
    }
  }

  while (queue.length > 0) {
    const node = queue.shift()!
    order.push(node)
    for (const succ of successors.get(node) ?? []) {
      inDegree[succ]!--
      if (inDegree[succ] === 0) queue.push(succ)
    }
  }

  return order
}

export function validateNoCycles(chain: ChainDefinition): void {
  const stepCount = chain.steps.length
  const predecessors = buildPredecessorMap(chain)
  const order = topologicalSort(stepCount, predecessors)

  if (order.length !== stepCount) {
    throw new Error(
      `Chain contains a cycle. Only ${order.length} of ${stepCount} steps could be ordered. ` +
        'Ensure all edges form a DAG (directed acyclic graph).',
    )
  }
}

/**
 * Ensures the Director's message includes the actual step output.
 * If the message is too short or empty, falls back to the raw output.
 */
function ensureMessageHasContent(message: string, stepOutput: string): string {
  if (!message || message.length < 50) {
    return stepOutput
  }
  return message
}
