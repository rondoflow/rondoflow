// StreamingApiRunner — shared lifecycle for API-backed agent runners.
//
// API providers (OpenAI, Perplexity, …) all share the same wiring: resolve the
// API key from the forwarded env, stream one request, map the stream onto the
// spawner event contract (text/tool_use/tool_result/usage/completion/error),
// and abort cleanly on kill(). Subclasses implement only `runStream` (the
// provider-specific HTTP call + event mapping) and declare their key env var.
// This keeps each provider class small and makes adding the next one trivial.

import { EventEmitter } from 'events'
import OpenAI from 'openai'
import type { SpawnOptions } from './spawner'
import { DEFAULT_IDLE_TIMEOUT_MS, DEFAULT_MAX_WALLCLOCK_MS } from './spawner'
import type { AgentRunner } from './agent-runner'

export abstract class StreamingApiRunner extends EventEmitter implements AgentRunner {
  protected abortController: AbortController | null = null
  protected runningFlag = false
  protected settled = false
  // Saved so sendMessage() can re-issue with the same system prompt/config.
  protected options: SpawnOptions | null = null
  // Spawn-timeout state, mirroring ClaudeCodeSpawner. The idle timer resets on
  // every streamed event (via the emit() override below); the wall-clock timer
  // is an absolute cap. On fire we abort the request and surface a TIMEOUT_ERROR.
  private idleTimer: ReturnType<typeof setTimeout> | null = null
  private wallTimer: ReturnType<typeof setTimeout> | null = null
  private idleTimeoutMs = 0

  /** Env var holding this provider's API key, e.g. 'OPENAI_API_KEY'. */
  protected abstract readonly apiKeyEnvVar: string
  /** Shown as the error when the key is unset. */
  protected abstract readonly missingKeyMessage: string

  /**
   * Run one streamed request. Implementations emit `text`/`tool_use`/
   * `tool_result`/`usage` as data arrives. They should NOT emit `completion`
   * (the base does so when this resolves) and should let abort errors throw —
   * the base swallows them. To surface an in-stream API error, call
   * `this.failOnce(err)` and return.
   */
  protected abstract runStream(
    options: SpawnOptions,
    apiKey: string,
    message: string,
    signal: AbortSignal | undefined,
  ): Promise<void>

  get isRunning(): boolean {
    return this.runningFlag
  }

  // No OS process backs an API run; the watchdog skips the pid liveness check
  // when this is null and relies on isRunning instead.
  get pid(): number | null {
    return null
  }

  spawn(options: SpawnOptions): void {
    if (this.runningFlag) {
      throw new Error(`Runner for agent ${options.agentId} already has a running request`)
    }
    // Mirror ClaudeCodeSpawner's fail-fast on an empty prompt — chain-executor's
    // runStep catches this synchronous throw and rejects the step cleanly.
    if (!options.message || options.message.trim().length === 0) {
      throw new Error(
        `Cannot run agent ${options.agentId}: the prompt is empty. ` +
          'An upstream step produced no text to pass on, or the initial task message was blank.',
      )
    }
    this.options = options
    this.settled = false
    this.start(options.message)
  }

  sendMessage(message: string): void {
    if (!this.options) {
      throw new Error('No active run to send a follow-up message to')
    }
    if (!message || message.trim().length === 0) return
    this.settled = false
    this.start(message)
  }

  kill(): void {
    this.clearTimers()
    this.abortController?.abort()
    this.abortController = null
    this.runningFlag = false
  }

  // Reset the inactivity clock on every streamed event so a long but healthy
  // response isn't reaped. EventEmitter calls emit() for every event we surface,
  // making this the single chokepoint — subclasses need no extra wiring.
  override emit(event: string | symbol, ...args: unknown[]): boolean {
    if (event === 'text' || event === 'tool_use' || event === 'tool_result' || event === 'usage') {
      this.resetIdleTimer()
    }
    return super.emit(event, ...args)
  }

  // ------------------------------------------------------------------
  // Internals
  // ------------------------------------------------------------------

  private resetIdleTimer(): void {
    if (this.idleTimeoutMs <= 0) return
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = setTimeout(() => this.onTimeout('inactivity', this.idleTimeoutMs), this.idleTimeoutMs)
    this.idleTimer.unref?.()
  }

  private clearTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
      this.idleTimer = null
    }
    if (this.wallTimer) {
      clearTimeout(this.wallTimer)
      this.wallTimer = null
    }
  }

  // Abort the in-flight request and surface a TIMEOUT_ERROR. The aborted
  // execute() catches the resulting AbortError and returns without emitting, so
  // failOnce (guarded by `settled`) is the only terminal event.
  private onTimeout(kind: 'inactivity' | 'wall-clock', ms: number): void {
    if (this.settled) return
    this.clearTimers()
    this.abortController?.abort()
    this.failOnce(new Error(`Agent ${this.options?.agentId ?? ''} timed out (${kind}) after ${ms}ms`))
  }

  private start(message: string): void {
    const options = this.options!
    const apiKey = options.env?.[this.apiKeyEnvVar] ?? process.env[this.apiKeyEnvVar]
    if (!apiKey) {
      // Defer so listeners wired after spawn() (in either run path) still catch it.
      queueMicrotask(() => this.failOnce(new Error(this.missingKeyMessage)))
      return
    }
    this.runningFlag = true
    this.abortController = new AbortController()
    // Arm spawn timeouts (same semantics as ClaudeCodeSpawner).
    this.idleTimeoutMs = options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS
    this.resetIdleTimer()
    const wallClockMs = options.maxWallClockMs ?? DEFAULT_MAX_WALLCLOCK_MS
    if (wallClockMs > 0) {
      this.wallTimer = setTimeout(() => this.onTimeout('wall-clock', wallClockMs), wallClockMs)
      this.wallTimer.unref?.()
    }
    void this.execute(options, apiKey, message)
  }

  private async execute(options: SpawnOptions, apiKey: string, message: string): Promise<void> {
    try {
      await this.runStream(options, apiKey, message, this.abortController?.signal)
      this.completeOnce()
    } catch (err) {
      // kill() aborts the stream — that is intentional, not a failure.
      if (this.isAbort(err)) {
        this.runningFlag = false
        return
      }
      const msg = err instanceof Error ? err.message : String(err)
      this.failOnce(new Error(`${this.constructor.name} request failed: ${msg}`))
    }
  }

  protected isAbort(err: unknown): boolean {
    if (err instanceof OpenAI.APIUserAbortError) return true
    const name = (err as { name?: string } | null)?.name
    return name === 'AbortError' || name === 'APIUserAbortError'
  }

  protected completeOnce(): void {
    if (this.settled) return
    this.settled = true
    this.runningFlag = false
    this.clearTimers()
    this.emit('completion', { exitCode: 0 })
  }

  protected failOnce(err: Error): void {
    if (this.settled) return
    this.settled = true
    this.runningFlag = false
    this.clearTimers()
    this.emit('error', err)
  }

  /** Coarse cost estimate (USD) from a per-1M-token rate table. */
  protected static estimateCost(
    rates: Record<string, { input: number; output: number }>,
    fallback: { input: number; output: number },
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const rate = rates[model] ?? fallback
    return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000
  }
}
