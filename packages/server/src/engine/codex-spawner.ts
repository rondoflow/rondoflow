// CodexSpawner — runs an agent on OpenAI's Codex CLI (`codex exec --json`).
//
// Codex is the counterpart of Claude Code: a local coding agent that reads and
// edits files, runs shell commands inside an OS sandbox, and speaks MCP. This
// runner maps its JSONL thread events onto the spawner event contract
// (text/tool_use/tool_result/usage/completion/error), so the chain executor and
// process manager drive it exactly like ClaudeCodeSpawner.
//
// One `codex exec` process runs one turn and exits. The thread id from the
// `thread.started` event lets a follow-up message continue the conversation via
// `codex exec resume <id>` in a fresh process. Argv/env/event mapping helpers
// live in codex-protocol.ts; shared process plumbing in cli-process.ts.

import { spawn, type ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import type { SpawnOptions } from './spawner'
import { DEFAULT_IDLE_TIMEOUT_MS, DEFAULT_MAX_WALLCLOCK_MS } from './spawner'
import type { AgentRunner } from './agent-runner'
import { SPAWN_DEBUG, killProcessTree, maskSecret, truncateForLog } from './cli-process'
import {
  buildCodexArgs,
  buildCodexEnv,
  buildCodexPrompt,
  codexToolCall,
  codexToolOutput,
  estimateCodexCostUsd,
  mcpConfigArgs,
  resolveCodexSandbox,
  type CodexItem,
  type CodexUsage,
} from './codex-protocol'

const CODEX_COMMAND = 'codex'

export const CODEX_NOT_FOUND_MESSAGE =
  'Codex CLI not found in PATH. Install it with `npm install -g @openai/codex`, ' +
  'then run `codex login` or set OPENAI_API_KEY in Settings → Credentials.'

// Keep only the tail of stderr — Codex logs reconnect attempts there, and only
// the last lines matter for a failure message.
const STDERR_TAIL_CHARS = 16 * 1024

interface CodexEvent {
  readonly type?: string
  readonly thread_id?: string
  readonly item?: CodexItem
  readonly usage?: CodexUsage
  readonly error?: { readonly message?: string }
  readonly message?: string
}

export class CodexSpawner extends EventEmitter implements AgentRunner {
  private _process: ChildProcess | null = null
  private _options: SpawnOptions | null = null
  private _threadId: string | null = null
  // Incremented per launched turn; stale events from a previous turn's process
  // (e.g. a late `close` after kill) are ignored by comparing against it.
  private _turnSeq = 0
  // ── Per-turn state (reset in resetTurnState) ──
  private _settled = false
  private _killed = false
  private _stdoutBuffer = ''
  private _stderr = ''
  private _nonJson: string[] = []
  private _turnError: string | null = null
  private _lastStreamError: string | null = null
  private _emittedTextLen = 0
  private _startedToolIds = new Set<string>()
  private _eventCounts = new Map<string, number>()
  // ── Spawn timeouts (same semantics as ClaudeCodeSpawner) ──
  private _idleTimer: ReturnType<typeof setTimeout> | null = null
  private _wallTimer: ReturnType<typeof setTimeout> | null = null
  private _idleTimeoutMs = 0

  get isRunning(): boolean {
    return this._process !== null
  }

  get pid(): number | null {
    return this._process?.pid ?? null
  }

  spawn(options: SpawnOptions): void {
    if (this._process !== null) {
      throw new Error(`Codex runner for agent ${options.agentId} already has a running process`)
    }
    if (!options.message || options.message.trim().length === 0) {
      throw new Error(
        `Cannot spawn agent ${options.agentId}: the prompt is empty. ` +
          'An upstream step produced no text to pass on, or the initial task message was blank.',
      )
    }
    this._options = options
    this._threadId = null
    this.launch(options.message)
  }

  // Codex can't take input mid-turn, so a follow-up resumes the thread once the
  // current turn has finished.
  sendMessage(message: string): void {
    if (!this._options) throw new Error('No Codex run to send a follow-up message to')
    if (this._process) {
      throw new Error('Codex is still working on the current turn. Send the follow-up once it finishes.')
    }
    if (!this._threadId) {
      throw new Error('The previous Codex turn never started a thread, so it cannot be resumed')
    }
    if (!message || message.trim().length === 0) return
    this.launch(message)
  }

  // A deliberate stop settles as a completion once the process closes (the
  // same observable outcome as ClaudeCodeSpawner), so awaiting callers unwind.
  kill(): void {
    this.clearTimers()
    if (!this._process) return
    this._killed = true
    killProcessTree(this._process)
    this._process = null
  }

  // ------------------------------------------------------------------
  // Turn lifecycle
  // ------------------------------------------------------------------

  private launch(message: string): void {
    const options = this._options!
    const firstTurn = this._threadId === null
    const args = buildCodexArgs(options, this._threadId)
    const env = buildCodexEnv(options.env)
    const turn = ++this._turnSeq
    this.resetTurnState()
    this.traceLaunch(options, args, env)

    const { skipped } = mcpConfigArgs(options.mcpConfig)
    if (skipped.length > 0) {
      console.warn(`${this.logLabel()} skipping SSE MCP servers (unsupported by Codex): ${skipped.join(', ')}`)
    }

    // [G8] Never use shell: true — spawn directly with an args array
    const child = spawn(CODEX_COMMAND, args, {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      // On Unix lead a new process group so kill() also reaps Codex's commands
      ...(process.platform !== 'win32' && { detached: true }),
      ...(options.cwd ? { cwd: options.cwd } : {}),
    })
    this._process = child
    this.armTimers(options)
    this.wireProcess(child, turn)

    // The prompt goes over stdin (argv `-`), so its size never touches ARG_MAX.
    // EPIPE (Codex exited before reading) is reported by the close handler.
    child.stdin?.on('error', () => undefined)
    child.stdin?.end(buildCodexPrompt(options, message, firstTurn))
  }

  private wireProcess(child: ChildProcess, turn: number): void {
    const current = (): boolean => turn === this._turnSeq
    child.stdout?.setEncoding('utf8')
    child.stderr?.setEncoding('utf8')
    child.stdout?.on('data', (chunk: string) => {
      if (current()) this.onStdout(chunk)
    })
    child.stderr?.on('data', (chunk: string) => {
      if (current()) this._stderr = (this._stderr + chunk).slice(-STDERR_TAIL_CHARS)
    })
    child.on('error', (err) => {
      if (current()) this.onSpawnError(err)
    })

    // Emit the terminal event only once stdout is drained AND the process has
    // exited — on Windows 'close' can fire before the last stdout data.
    let stdoutClosed = false
    let exitCode: number | null = null
    const tryFinish = (): void => {
      if (stdoutClosed && exitCode !== null && current()) this.finish(exitCode)
    }
    child.stdout?.on('close', () => {
      stdoutClosed = true
      tryFinish()
    })
    child.on('close', (code, signal) => {
      exitCode = code ?? (signal ? 128 : 0)
      tryFinish()
    })
  }

  private finish(exitCode: number): void {
    if (this._settled) return
    this._settled = true
    if (this._stdoutBuffer.trim().length > 0) this.handleLine(this._stdoutBuffer.trim())
    this._stdoutBuffer = ''
    // Clear AFTER the flush — handleLine above re-arms the idle timer.
    this.clearTimers()
    this._process = null

    const failure = this._killed ? null : this.failureReason(exitCode)
    if (failure) {
      console.warn(`${this.logLabel()} run FAILED — ${this.diagnostics(exitCode)}`)
      this.emit('error', new Error(failure))
      return
    }
    if (this._emittedTextLen === 0 && !this._killed) {
      console.warn(`${this.logLabel()} run completed with EMPTY output — ${this.diagnostics(exitCode)}`)
    }
    this.emit('completion', { exitCode: this._killed ? 0 : exitCode })
  }

  private failureReason(exitCode: number): string | null {
    if (this._turnError) return `Codex run failed: ${this._turnError}`
    if (exitCode === 0) return null
    const detail =
      this._lastStreamError ?? (this._stderr.trim() || this._nonJson.join('\n').trim() || null)
    return `Codex exited with code ${exitCode}${detail ? `: ${truncateForLog(detail, 500)}` : ''}`
  }

  private onSpawnError(err: Error): void {
    if (this._settled) return
    this._settled = true
    this.clearTimers()
    this._process = null
    const notFound = (err as NodeJS.ErrnoException).code === 'ENOENT'
    this.emit('error', new Error(notFound ? CODEX_NOT_FOUND_MESSAGE : `Failed to start Codex CLI: ${err.message}`))
  }

  private resetTurnState(): void {
    this._settled = false
    this._killed = false
    this._stdoutBuffer = ''
    this._stderr = ''
    this._nonJson = []
    this._turnError = null
    this._lastStreamError = null
    this._emittedTextLen = 0
    this._startedToolIds = new Set()
    this._eventCounts = new Map()
  }

  // ------------------------------------------------------------------
  // Timeouts
  // ------------------------------------------------------------------

  private armTimers(options: SpawnOptions): void {
    // undefined → global default; <= 0 → disabled; > 0 → that value.
    this._idleTimeoutMs = options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS
    this.resetIdleTimer()
    const wallClockMs = options.maxWallClockMs ?? DEFAULT_MAX_WALLCLOCK_MS
    if (wallClockMs > 0) {
      this._wallTimer = setTimeout(() => this.onTimeout('wall-clock', wallClockMs), wallClockMs)
      this._wallTimer.unref?.()
    }
  }

  private resetIdleTimer(): void {
    if (this._idleTimeoutMs <= 0) return
    if (this._idleTimer) clearTimeout(this._idleTimer)
    this._idleTimer = setTimeout(() => this.onTimeout('inactivity', this._idleTimeoutMs), this._idleTimeoutMs)
    this._idleTimer.unref?.()
  }

  private clearTimers(): void {
    if (this._idleTimer) clearTimeout(this._idleTimer)
    if (this._wallTimer) clearTimeout(this._wallTimer)
    this._idleTimer = null
    this._wallTimer = null
  }

  // The message MUST contain "timed out" so classifyError (error-types.ts) maps
  // it to TIMEOUT_ERROR, which every runner.on('error') handler tears down on.
  private onTimeout(kind: 'inactivity' | 'wall-clock', ms: number): void {
    if (this._settled || this._process === null) return
    this._settled = true
    this.clearTimers()
    console.warn(`${this.logLabel()} run TIMED OUT (${kind}) after ${ms}ms — killing process tree`)
    killProcessTree(this._process)
    this._process = null
    this.emit('error', new Error(`Agent ${this._options?.agentId ?? ''} timed out (${kind}) after ${ms}ms`))
  }

  // ------------------------------------------------------------------
  // JSONL event handling
  // ------------------------------------------------------------------

  private onStdout(chunk: string): void {
    this._stdoutBuffer += chunk
    const lines = this._stdoutBuffer.split('\n')
    // Keep the last (potentially incomplete) line in the buffer
    this._stdoutBuffer = lines.pop() ?? ''
    for (const raw of lines) {
      const line = raw.replace(/\r$/, '').trim()
      if (line.length > 0) this.handleLine(line)
    }
  }

  private handleLine(line: string): void {
    // Any stdout line proves the run is alive.
    this.resetIdleTimer()
    let event: CodexEvent
    try {
      event = JSON.parse(line) as CodexEvent
    } catch {
      // With --json every line should parse; anything else is usually the real
      // reason a run fails, so keep it for the failure message.
      this._nonJson.push(line)
      this.dbg('non-JSON stdout:', truncateForLog(line))
      return
    }
    if (typeof event.type === 'string') {
      this._eventCounts.set(event.type, (this._eventCounts.get(event.type) ?? 0) + 1)
    }
    this.dbg('event:', event.type)
    this.dispatchEvent(event)
  }

  private dispatchEvent(event: CodexEvent): void {
    switch (event.type) {
      case 'thread.started':
        if (event.thread_id) this._threadId = event.thread_id
        break
      case 'item.started':
        if (event.item) this.onItemStarted(event.item)
        break
      case 'item.completed':
        if (event.item) this.onItemCompleted(event.item)
        break
      case 'turn.completed':
        if (event.usage) this.emitUsage(event.usage)
        break
      case 'turn.failed':
        this._turnError = event.error?.message ?? 'the turn failed without an error message'
        break
      case 'error':
        // Includes transient "Reconnecting… n/5" notices. The turn's outcome is
        // decided by turn.failed / the exit code; keep the last one as detail.
        if (event.message) this._lastStreamError = event.message
        break
      default:
        // turn.started, item.updated (to-do list progress) — nothing to surface
        break
    }
  }

  private onItemStarted(item: CodexItem): void {
    const call = codexToolCall(item)
    if (!call) return
    const id = this.toolId(item)
    this._startedToolIds.add(id)
    this.emit('tool_use', { toolName: call.toolName, input: call.input, id })
  }

  private onItemCompleted(item: CodexItem): void {
    if (item.type === 'agent_message') {
      const text = item['text']
      // Each agent message is a complete block; the last one is the final
      // answer (chain-executor keeps the latest non-partial text).
      if (typeof text === 'string' && text.length > 0) this.emitText(text)
      return
    }
    if (item.type === 'error') {
      // Non-fatal notices (unknown model metadata, transport fallback, …).
      console.warn(`${this.logLabel()} Codex notice: ${truncateForLog(String(item['message'] ?? ''), 300)}`)
      return
    }
    const call = codexToolCall(item)
    if (!call) return
    const id = this.toolId(item)
    // file_change items arrive only as item.completed — emit their tool_use too.
    if (!this._startedToolIds.has(id)) {
      this.emit('tool_use', { toolName: call.toolName, input: call.input, id })
    }
    this.emit('tool_result', { toolName: call.toolName, output: codexToolOutput(item), toolUseId: id })
  }

  private emitText(content: string): void {
    this._emittedTextLen += content.length
    this.emit('text', { content, partial: false })
  }

  private emitUsage(usage: CodexUsage): void {
    this.emit('usage', {
      inputTokens: usage.input_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0,
      estimatedCostUsd: estimateCodexCostUsd(usage),
    })
  }

  // Codex item ids (item_0, item_1, …) restart every turn; scope them per turn
  // so tool_use/tool_result pairs never collide across resumed turns.
  private toolId(item: CodexItem): string {
    return `codex-${this._turnSeq}-${item.id ?? 'item'}`
  }

  // ------------------------------------------------------------------
  // Diagnostics
  // ------------------------------------------------------------------

  private dbg(...args: unknown[]): void {
    if (!SPAWN_DEBUG) return
    console.error(this.logLabel(), ...args)
  }

  private logLabel(): string {
    const id = this._options?.agentId
    return `[codex${id ? ':' + id : ''}]`
  }

  private diagnostics(exitCode: number): string {
    const events = [...this._eventCounts.entries()].map(([t, n]) => `${t}:${n}`).join(',') || '(none)'
    const options = this._options
    return (
      `exit=${exitCode} model=${options?.providerConfig?.model ?? '(default)'} ` +
      `sandbox=${options ? resolveCodexSandbox(options) : '?'} thread=${this._threadId ?? '(none)'} ` +
      `emittedTextLen=${this._emittedTextLen} events={${events}}` +
      (this._lastStreamError ? ` lastError="${truncateForLog(this._lastStreamError, 300)}"` : '') +
      (this._stderr.trim() ? ` stderr="${truncateForLog(this._stderr.trim().slice(-600), 300)}"` : '')
    )
  }

  private traceLaunch(options: SpawnOptions, args: readonly string[], env: Record<string, string>): void {
    if (!SPAWN_DEBUG) return
    const apiKey = env['CODEX_API_KEY']
    this.dbg(`spawn ${CODEX_COMMAND} cwd=${options.cwd ?? process.cwd()} resume=${this._threadId ?? 'no'}`)
    this.dbg(
      'credential:',
      apiKey
        ? `CODEX_API_KEY=${maskSecret(apiKey)}`
        : 'NONE forwarded — Codex falls back to its stored `codex login` (CODEX_HOME or ~/.codex)',
    )
    this.dbg('args:', describeCodexArgs(args))
  }
}

// Render args for logging: long values are truncated, and MCP env/header
// overrides are redacted because they can embed server credentials.
export function describeCodexArgs(args: readonly string[]): string {
  return args
    .map((arg) => {
      if (/^mcp_servers\.[^=]+\.(env|http_headers)=/.test(arg)) {
        return `${arg.slice(0, arg.indexOf('=') + 1)}<redacted>`
      }
      return arg.length > 80 ? truncateForLog(arg, 80) : arg
    })
    .join(' ')
}
