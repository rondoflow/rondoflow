// LoopEngine — drives iterative agent execution until a LoopCriteria is satisfied.
// Each iteration spawns a fresh process (no shared context window) to avoid
// context-window degradation over many iterations.

import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { spawnSync } from 'child_process'
import { prisma } from '../lib/prisma'
import { buildSpawnConfig } from './prompt-builder'
import { ClaudeCodeSpawner } from './spawner'
import type { LoopCriteria } from '@rondoflow/shared'

export interface LoopState {
  readonly agentId: string
  readonly sessionId: string
  readonly iteration: number
  readonly maxIterations: number
  readonly criteria: LoopCriteria
  readonly status: 'running' | 'paused' | 'completed' | 'failed'
  readonly progressLog: readonly string[]
}

type LoopStatus = 'running' | 'paused' | 'completed' | 'failed'

export interface LoopEngineEvents {
  iteration: (data: { iteration: number; maxIterations: number; output: string }) => void
  progress: (data: { iteration: number; learning: string }) => void
  completed: (data: { totalIterations: number; finalOutput: string }) => void
  failed: (data: { iteration: number; error: string }) => void
  manual_approval_required: (data: { iteration: number; output: string; loopId: string }) => void
}

export declare interface LoopEngine {
  on<K extends keyof LoopEngineEvents>(event: K, listener: LoopEngineEvents[K]): this
  emit<K extends keyof LoopEngineEvents>(event: K, ...args: Parameters<LoopEngineEvents[K]>): boolean
}

export class LoopEngine extends EventEmitter {
  private readonly agentId: string
  private status: LoopStatus = 'running'
  private iteration = 0
  private maxIterations = 10
  private criteria: LoopCriteria = { type: 'max_iterations', value: '' }
  private progressLog: string[] = []
  private currentSpawner: ClaudeCodeSpawner | null = null
  private resumeCallback: (() => void) | null = null
  private stopped = false
  // Keyed by loopId for manual approvals
  private pendingManualResolvers = new Map<string, (approved: boolean) => void>()

  constructor(agentId: string) {
    super()
    this.agentId = agentId
  }

  async start(message: string): Promise<void> {
    const agent = await prisma.agent.findUnique({
      where: { id: this.agentId },
      select: {
        loopEnabled: true,
        loopCriteria: true,
        maxIterations: true,
      },
    })

    if (!agent) {
      throw new Error(`Agent '${this.agentId}' not found`)
    }

    if (!agent.loopEnabled) {
      throw new Error(`Agent '${this.agentId}' does not have loopEnabled=true`)
    }

    this.maxIterations = agent.maxIterations ?? 10

    const rawCriteria = agent.loopCriteria as { type?: string; value?: string } | null
    if (
      rawCriteria &&
      typeof rawCriteria.type === 'string' &&
      typeof rawCriteria.value === 'string'
    ) {
      this.criteria = rawCriteria as LoopCriteria
    } else {
      this.criteria = { type: 'max_iterations', value: '' }
    }

    this.stopped = false
    this.status = 'running'
    this.progressLog = []
    this.iteration = 0

    await this.runLoop(message)
  }

  pause(): void {
    if (this.status === 'running') {
      this.status = 'paused'
    }
  }

  resume(): void {
    if (this.status === 'paused') {
      this.status = 'running'
      if (this.resumeCallback) {
        const cb = this.resumeCallback
        this.resumeCallback = null
        cb()
      }
    }
  }

  stop(): void {
    this.stopped = true
    this.status = 'failed'
    this.currentSpawner?.kill()
    this.currentSpawner = null
    // Reject any pending manual approvals
    for (const [loopId, resolver] of this.pendingManualResolvers) {
      resolver(false)
      this.pendingManualResolvers.delete(loopId)
    }
    if (this.resumeCallback) {
      this.resumeCallback = null
    }
  }

  // Called externally when a human approves/rejects a manual iteration
  resolveManualApproval(loopId: string, approved: boolean): void {
    const resolver = this.pendingManualResolvers.get(loopId)
    if (resolver) {
      this.pendingManualResolvers.delete(loopId)
      resolver(approved)
    }
  }

  getState(): LoopState {
    return {
      agentId: this.agentId,
      sessionId: '',
      iteration: this.iteration,
      maxIterations: this.maxIterations,
      criteria: this.criteria,
      status: this.status,
      progressLog: [...this.progressLog],
    }
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private async runLoop(originalMessage: string): Promise<void> {
    while (!this.stopped && this.iteration < this.maxIterations) {
      // Honor pause state before starting an iteration
      await this.waitIfPaused()
      if (this.stopped) break

      this.iteration++
      const iterationMessage = this.buildIterationMessage(originalMessage, this.iteration)

      let output: string
      try {
        output = await this.runIteration(iterationMessage)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        this.status = 'failed'
        this.emit('failed', { iteration: this.iteration, error: errorMsg })
        return
      }

      if (this.stopped) break

      this.emit('iteration', {
        iteration: this.iteration,
        maxIterations: this.maxIterations,
        output,
      })

      // Extract a short learning from this iteration's output
      const learning = this.extractLearning(output, this.iteration)
      this.progressLog = [...this.progressLog, learning]
      this.emit('progress', { iteration: this.iteration, learning })

      // Check termination criteria
      const criteriaResult = await this.evaluateCriteria(output)
      if (criteriaResult === 'approved') {
        this.status = 'completed'
        this.emit('completed', {
          totalIterations: this.iteration,
          finalOutput: output,
        })
        return
      }

      if (criteriaResult === 'rejected') {
        // Manual approval rejected — stop
        this.status = 'failed'
        this.emit('failed', {
          iteration: this.iteration,
          error: 'Manual approval was rejected by user',
        })
        return
      }
      // criteriaResult === 'continue' — loop again
    }

    if (!this.stopped && this.status !== 'completed' && this.status !== 'failed') {
      // Exhausted all iterations without meeting criteria
      this.status = 'completed'
      this.emit('completed', {
        totalIterations: this.iteration,
        finalOutput: this.progressLog[this.progressLog.length - 1] ?? '',
      })
    }
  }

  private async runIteration(message: string): Promise<string> {
    const config = await buildSpawnConfig(this.agentId)
    const sessionId = randomUUID()
    const spawner = new ClaudeCodeSpawner()
    this.currentSpawner = spawner

    return new Promise<string>((resolve, reject) => {
      let fullOutput = ''

      spawner.on('text', (data: { content: string; partial: boolean }) => {
        if (!data.partial) {
          fullOutput += data.content
        }
      })

      spawner.on('completion', () => {
        this.currentSpawner = null
        resolve(fullOutput)
      })

      spawner.on('error', (err: Error) => {
        this.currentSpawner = null
        reject(new Error(`Iteration ${this.iteration} failed: ${err.message}`))
      })

      try {
        spawner.spawn({
          agentId: this.agentId,
          sessionId,
          message,
          systemPrompt: config.systemPrompt,
          appendSystemPrompt: config.appendSystemPrompt,
          allowedTools: config.allowedTools,
          model: config.model,
          // Loop iterations run headless — the only human gate is the optional
          // per-iteration approval between runs (see "Manual approval was
          // rejected" above), never the CLI's in-run tool prompt. In a prompting
          // mode the CLI auto-denies any tool not pre-approved via --allowedTools,
          // stalling the iteration with "I need your permission…". Run with
          // bypassPermissions so tools execute — matching discussions
          // (turn-router), chain runs (chain-executor) and routes/loops.ts. Spend
          // stays bounded by maxBudgetUsd.
          permissionMode: 'bypassPermissions',
          maxBudgetUsd: config.maxBudgetUsd,
          env: config.env,
        })
      } catch (err) {
        this.currentSpawner = null
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }

  private buildIterationMessage(originalMessage: string, iteration: number): string {
    if (iteration === 1) {
      return originalMessage
    }

    const progressSummary =
      this.progressLog.length > 0
        ? `\n\n## Progress Log (previous ${this.progressLog.length} iteration(s))\n${this.progressLog.map((l, i) => `- Iteration ${i + 1}: ${l}`).join('\n')}`
        : ''

    return [
      originalMessage,
      progressSummary,
      `\n\n## Iteration ${iteration} of ${this.maxIterations}`,
      'This is a retry. Review the progress log above and improve on previous attempts.',
    ].join('')
  }

  private async evaluateCriteria(
    output: string,
  ): Promise<'approved' | 'rejected' | 'continue'> {
    switch (this.criteria.type) {
      case 'max_iterations':
        // Always continue — the loop bound handles termination
        return 'continue'

      case 'regex': {
        try {
          const pattern = new RegExp(this.criteria.value, 'i')
          return pattern.test(output) ? 'approved' : 'continue'
        } catch {
          // Invalid regex — treat as always continue
          return 'continue'
        }
      }

      case 'test_pass': {
        const passed = await this.runTestCommand(this.criteria.value)
        return passed ? 'approved' : 'continue'
      }

      case 'manual': {
        return this.requestManualApproval(output)
      }

      default:
        return 'continue'
    }
  }

  private async runTestCommand(command: string): Promise<boolean> {
    try {
      // [SECURITY] Never use execSync (shell: true). Split command into args and spawn directly.
      const parts = command.trim().split(/\s+/)
      const [cmd, ...args] = parts
      if (!cmd) return false
      const result = spawnSync(cmd, args, { stdio: 'ignore', timeout: 60_000 })
      return result.status === 0
    } catch {
      return false
    }
  }

  private async requestManualApproval(output: string): Promise<'approved' | 'rejected'> {
    const loopId = randomUUID()

    this.emit('manual_approval_required', {
      iteration: this.iteration,
      output,
      loopId,
    })

    return new Promise<'approved' | 'rejected'>((resolve) => {
      this.pendingManualResolvers.set(loopId, (approved) => {
        resolve(approved ? 'approved' : 'rejected')
      })
    })
  }

  private extractLearning(output: string, iteration: number): string {
    // Take the first 300 characters of output as the learning summary
    const summary = output.slice(0, 300).replace(/\n+/g, ' ').trim()
    return summary.length > 0
      ? summary
      : `Iteration ${iteration} produced no output`
  }

  private waitIfPaused(): Promise<void> {
    if (this.status !== 'paused') {
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      this.resumeCallback = resolve
    })
  }
}
