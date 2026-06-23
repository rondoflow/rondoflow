import { spawn } from 'child_process'
import { prisma } from '../lib/prisma'
import { createAgentRunner } from './agent-runner'
import type { AgentRunner } from './agent-runner'
import type { SpawnOptions } from './spawner'
import type { TokenUsage } from '@rondoflow/shared'

const MAX_CONCURRENT = parseInt(process.env['MAX_CONCURRENT_AGENTS'] ?? '5', 10)
const MAX_QUEUE = 20
const WATCHDOG_INTERVAL_MS = 10_000

export interface RunningProcess {
  readonly spawner: AgentRunner
  readonly agentId: string
  readonly sessionId: string
  readonly startedAt: Date
  readonly pid: number | null
}

interface QueuedRequest {
  readonly options: SpawnOptions
  readonly resolve: (sessionId: string) => void
  readonly reject: (err: Error) => void
}

type AgentEventCallback = (agentId: string, sessionId: string, data: unknown) => void

export interface ProcessManagerCallbacks {
  onText?: AgentEventCallback
  onToolUse?: AgentEventCallback
  onToolResult?: AgentEventCallback
  onCompletion?: (agentId: string, sessionId: string, exitCode: number, usage: TokenUsage | null) => void
  onError?: (agentId: string, sessionId: string, err: Error) => void
}

export class ProcessManager {
  private readonly processes = new Map<string, RunningProcess>()
  private readonly queue: QueuedRequest[] = []
  private readonly maxConcurrent: number
  private watchdogTimer: ReturnType<typeof setInterval> | null = null
  private callbacks: ProcessManagerCallbacks = {}

  constructor(maxConcurrent = MAX_CONCURRENT) {
    this.maxConcurrent = maxConcurrent
    this.startWatchdog()
  }

  setCallbacks(callbacks: ProcessManagerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  async startAgent(options: SpawnOptions): Promise<string> {
    if (this.processes.has(options.agentId)) {
      // Agent is already running — stop it first
      this.stopAgent(options.agentId)
    }

    if (this.processes.size >= this.maxConcurrent) {
      if (this.queue.length >= MAX_QUEUE) {
        throw new Error(
          `RESOURCE_ERROR: queue full — max concurrent (${this.maxConcurrent}) and queue (${MAX_QUEUE}) reached`,
        )
      }

      return new Promise<string>((resolve, reject) => {
        this.queue.push({ options, resolve, reject })
      })
    }

    return this.doStart(options)
  }

  stopAgent(agentId: string): void {
    const entry = this.processes.get(agentId)
    if (!entry) return

    entry.spawner.kill()
    this.processes.delete(agentId)
    this.drainQueue()
  }

  stopAll(): void {
    for (const [agentId] of this.processes) {
      this.stopAgent(agentId)
    }
    // Reject all queued requests
    for (const req of this.queue.splice(0)) {
      req.reject(new Error('Server shutting down'))
    }
    if (this.watchdogTimer !== null) {
      clearInterval(this.watchdogTimer)
      this.watchdogTimer = null
    }
  }

  sendMessage(agentId: string, message: string): void {
    const entry = this.processes.get(agentId)
    if (!entry) {
      throw new Error(`No running process for agent ${agentId}`)
    }
    entry.spawner.sendMessage(message)
  }

  getRunningCount(): number {
    return this.processes.size
  }

  getQueuedCount(): number {
    return this.queue.length
  }

  getProcessInfo(agentId: string): RunningProcess | undefined {
    return this.processes.get(agentId)
  }

  isAgentRunning(agentId: string): boolean {
    return this.processes.has(agentId)
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private async doStart(options: SpawnOptions): Promise<string> {
    const spawner = createAgentRunner(options.provider)
    let pendingUsage: TokenUsage | null = null

    const entry: RunningProcess = {
      spawner,
      agentId: options.agentId,
      sessionId: options.sessionId,
      startedAt: new Date(),
      pid: null,
    }

    // Store with placeholder; pid updates after spawn
    this.processes.set(options.agentId, entry)

    // Wire spawner events to callbacks
    spawner.on('text', (data: { content: string; partial: boolean }) => {
      this.callbacks.onText?.(options.agentId, options.sessionId, data)
    })

    spawner.on('tool_use', (data: unknown) => {
      this.callbacks.onToolUse?.(options.agentId, options.sessionId, data)
    })

    spawner.on('tool_result', (data: unknown) => {
      this.callbacks.onToolResult?.(options.agentId, options.sessionId, data)
    })

    spawner.on('usage', (usage: TokenUsage) => {
      pendingUsage = usage
    })

    spawner.on('completion', (data: { exitCode: number }) => {
      this.processes.delete(options.agentId)
      this.callbacks.onCompletion?.(options.agentId, options.sessionId, data.exitCode, pendingUsage)
      this.drainQueue()
    })

    spawner.on('error', (err: Error) => {
      this.processes.delete(options.agentId)
      void this.markAgentError(options.agentId)
      this.callbacks.onError?.(options.agentId, options.sessionId, err)
      this.drainQueue()
    })

    try {
      spawner.spawn(options)

      // Update the stored entry with the actual pid
      const withPid: RunningProcess = {
        spawner,
        agentId: options.agentId,
        sessionId: options.sessionId,
        startedAt: entry.startedAt,
        pid: spawner.pid,
      }
      this.processes.set(options.agentId, withPid)
    } catch (err) {
      this.processes.delete(options.agentId)
      this.drainQueue()
      throw err
    }

    return options.sessionId
  }

  private drainQueue(): void {
    if (this.queue.length === 0) return
    if (this.processes.size >= this.maxConcurrent) return

    const next = this.queue.shift()
    if (!next) return

    this.doStart(next.options).then(next.resolve).catch(next.reject)
  }

  // [G15] Crash recovery watchdog — checks tracked PIDs every 10s
  private startWatchdog(): void {
    this.watchdogTimer = setInterval(() => {
      void this.runWatchdog()
    }, WATCHDOG_INTERVAL_MS)

    // Unref so the timer does not prevent process exit
    this.watchdogTimer.unref?.()
  }

  private async runWatchdog(): Promise<void> {
    const dead: string[] = []

    for (const [agentId, entry] of this.processes) {
      if (!entry.spawner.isRunning) {
        dead.push(agentId)
        continue
      }

      // If we have a pid, check OS-level liveness
      if (entry.pid !== null && !isPidAlive(entry.pid)) {
        dead.push(agentId)
      }
    }

    for (const agentId of dead) {
      this.processes.delete(agentId)
      await this.markAgentError(agentId)
      this.drainQueue()
    }
  }

  private async markAgentError(agentId: string): Promise<void> {
    try {
      await prisma.agent.update({
        where: { id: agentId },
        data: { status: 'error' },
      })
    } catch {
      // Non-fatal — best effort status update
    }
  }
}

// Check whether a process with the given pid is alive using a zero-signal test.
function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    // On Windows, process.kill is not available for signal 0 in older Node versions.
    // Fall back to tasklist check.
    if (process.platform === 'win32') {
      return isWindowsPidAlive(pid)
    }
    return false
  }
}

function isWindowsPidAlive(pid: number): boolean {
  try {
    const result = require('child_process').spawnSync('tasklist', ['/FI', `PID eq ${pid}`, '/NH', '/FO', 'CSV'], {
      encoding: 'utf8',
      timeout: 2000,
    })
    return typeof result.stdout === 'string' && result.stdout.includes(String(pid))
  } catch {
    return false
  }
}

// Suppress the unused import warning — spawn is re-exported for platform kill in spawner
void spawn
