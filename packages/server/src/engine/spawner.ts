import { spawn, ChildProcess } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { EventEmitter } from 'events'
import type { TokenUsage, AgentProviderId, OpenAIProviderConfig } from '@rondoflow/shared'
import type { MergedMcpConfig } from './mcp-config-builder'
import { estimateCostUsd } from './pricing'

export interface SpawnOptions {
  readonly agentId: string
  readonly sessionId: string
  readonly message: string
  readonly systemPrompt: string
  readonly appendSystemPrompt?: string
  readonly allowedTools?: readonly string[]
  readonly model?: string
  readonly permissionMode?: string
  readonly maxBudgetUsd?: number
  readonly env?: Record<string, string>
  readonly mcpConfig?: MergedMcpConfig
  readonly addDirs?: string[]
  readonly cwd?: string
  readonly verbose?: boolean
  // Inactivity (idle) timeout in ms: if the run streams NO event for this long,
  // it is killed and an `error` (containing "timed out") is emitted. Safe for
  // long-lived interactive agents because it resets on every stream event. 0 or
  // undefined falls back to the RONDOFLOW_SPAWN_IDLE_TIMEOUT_MS default; pass a
  // negative value to disable entirely.
  readonly idleTimeoutMs?: number
  // Absolute wall-clock cap in ms: the run is killed this long after spawn
  // regardless of activity. Off (0/undefined) by default — interactive agents are
  // long-lived; one-shot generators (Director/Planner/Advisor/Scheduler) set it.
  readonly maxWallClockMs?: number
  // Which backend runs this agent. Omitted/`'claude-code'` → ClaudeCodeSpawner
  // (this class), which ignores the two fields below. `'openai'` → OpenAIRunner,
  // which reads providerConfig and ignores the Claude-CLI-specific fields above.
  readonly provider?: AgentProviderId
  readonly providerConfig?: OpenAIProviderConfig
}

export interface StreamEvent {
  readonly type: string
  readonly [key: string]: unknown
}

export interface SpawnerEvents {
  text: (data: { content: string; partial: boolean }) => void
  tool_use: (data: { toolName: string; input: unknown; id: string }) => void
  tool_result: (data: { toolName: string; output: unknown; toolUseId: string }) => void
  completion: (data: { exitCode: number }) => void
  usage: (data: TokenUsage) => void
  error: (err: Error) => void
}

// Resolve the claude CLI command name cross-platform.
// On Windows the CLI binary is `claude.cmd`; on Unix it is `claude`.
function resolveClaudeCommand(): string {
  // claude is installed as claude.exe on Windows (not .cmd)
  return 'claude'
}

// Claude authentication env vars, in precedence order. Exactly one is forwarded
// to the child by resolveClaudeAuth: a setup-token from `claude setup-token`
// (which bills against the user's Claude subscription) wins over an API key.
const CLAUDE_AUTH_KEYS = ['CLAUDE_CODE_OAUTH_TOKEN', 'ANTHROPIC_API_KEY'] as const

const CLAUDE_TELEMETRY_KEYS = [
  'CLAUDE_CODE_ENABLE_TELEMETRY',
  'OTEL_METRICS_EXPORTER',
  'OTEL_LOGS_EXPORTER',
  'OTEL_EXPORTER_OTLP_PROTOCOL',
  'OTEL_EXPORTER_OTLP_ENDPOINT',
  'OTEL_EXPORTER_OTLP_HEADERS',
  'OTEL_RESOURCE_ATTRIBUTES',
  'OTEL_METRIC_EXPORT_INTERVAL',
  'OTEL_LOGS_EXPORT_INTERVAL',
] as const

// Server secrets that must never reach a spawned child, even if a caller (e.g. a
// workspace "variable" resource) supplies them via the env extras. Compared
// case-insensitively. The two Claude auth keys are handled separately by
// resolveClaudeAuth, so they are intentionally not listed here.
const BLOCKED_CHILD_ENV_KEYS = new Set<string>([
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'RONDOFLOW_SECRET', // see resources/encryption.ts — derives the credential-encryption key
])

// Spawn-time debug tracing. Off by default; set RONDOFLOW_DEBUG_SPAWN=1 (or
// =true) to log the full CLI lifecycle — resolved command + args, which Claude
// credential was forwarded (masked), every stdout line and parsed stream-json
// event, stderr, and the exit code. This is the switch to flip when an agent
// "produces empty output": it makes the otherwise-silent failure path visible.
const SPAWN_DEBUG =
  process.env['RONDOFLOW_DEBUG_SPAWN'] === '1' ||
  process.env['RONDOFLOW_DEBUG_SPAWN'] === 'true'

// Read a non-negative millisecond env var, falling back to `fallback` on an
// unset/empty/NaN/negative value. Used for the spawn-timeout defaults below.
function readMsEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw.trim() === '') return fallback
  const n = parseInt(raw, 10)
  return Number.isNaN(n) || n < 0 ? fallback : n
}

// Default inactivity timeout applied to EVERY spawned run unless the caller
// overrides idleTimeoutMs. A run that streams no event for this long is killed
// and surfaced as a TIMEOUT_ERROR. Generous (5 min) so a single long-running
// tool that emits nothing meanwhile isn't false-killed, while a genuinely stuck
// process (a never-resolving permission prompt, a hung network call) is reaped.
// Set RONDOFLOW_SPAWN_IDLE_TIMEOUT_MS=0 to disable globally.
export const DEFAULT_IDLE_TIMEOUT_MS = readMsEnv('RONDOFLOW_SPAWN_IDLE_TIMEOUT_MS', 300_000)

// Default absolute wall-clock cap. Off (0) by default because interactive agents
// are long-lived; one-shot generators pass their own maxWallClockMs.
export const DEFAULT_MAX_WALLCLOCK_MS = readMsEnv('RONDOFLOW_SPAWN_MAX_MS', 0)

// A prompt value longer than this (chars) is passed to the CLI via a temp file
// (`--system-prompt-file` / `--append-system-prompt-file`) instead of inline on
// argv. The system/append prompts are the largest and most variable arguments —
// the Director embeds the full execution history in its system prompt, and merged
// agent/skill/memory append-prompts grow unbounded — so a big one can push the
// total argument list past the OS ARG_MAX limit, making spawn() fail with the
// kernel error "spawn E2BIG". 32 KiB leaves vast headroom under ARG_MAX (~1 MiB)
// while keeping ordinary small prompts inline so the common path writes no file.
const PROMPT_ARG_FILE_THRESHOLD = 32 * 1024
// Monotonic suffix so concurrent spawns never collide on a temp-file name. The
// pid+counter pair is unique within this server process without needing Date.now.
let promptFileCounter = 0

function truncateForLog(value: string, max = 200): string {
  return value.length > max ? `${value.slice(0, max)}…(${value.length} chars)` : value
}

// Mask a credential for logs: keep a short identifying prefix (so an API key vs
// an OAuth setup-token is distinguishable) and hide the rest.
function maskSecret(value: string): string {
  if (value.length <= 10) return `***(${value.length} chars)`
  return `${value.slice(0, 10)}…***(${value.length} chars)`
}

function readFirstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined && value.trim().length > 0)
}

function resolveClaudeTelemetry(extra: Record<string, string> = {}): Record<string, string> {
  const env: Record<string, string> = {}

  for (const key of CLAUDE_TELEMETRY_KEYS) {
    const value = extra[key] ?? process.env[key]
    if (value !== undefined && value.trim().length > 0) {
      env[key] = value
    }
  }

  if (env['OTEL_EXPORTER_OTLP_ENDPOINT'] === undefined) {
    const endpoint = readFirstNonEmpty(
      extra['OTEL_EXPORTER_OTLP_ENDPOINT'],
      process.env['OTEL_EXPORTER_OTLP_ENDPOINT'],
      extra['OTEL_ENDPOINT'],
      process.env['OTEL_ENDPOINT'],
    )
    if (endpoint) {
      env['OTEL_EXPORTER_OTLP_ENDPOINT'] = endpoint
    }
  }

  if (env['OTEL_EXPORTER_OTLP_HEADERS'] === undefined) {
    const authToken = readFirstNonEmpty(extra['AUTH_TOKEN'], process.env['AUTH_TOKEN'])
    if (authToken) {
      env['OTEL_EXPORTER_OTLP_HEADERS'] = `Authorization=Bearer%20${authToken}`
    }
  }

  if (env['OTEL_RESOURCE_ATTRIBUTES'] === undefined) {
    const userEmail = readFirstNonEmpty(extra['USER_EMAIL'], process.env['USER_EMAIL'])
    if (userEmail) {
      env['OTEL_RESOURCE_ATTRIBUTES'] = `user.email=${userEmail},service.name=claude-code`
    }
  }

  return env
}

// The CLI ALWAYS writes this warning to stderr because we spawn with a piped
// stdin but usually send nothing on it. It is noise, NOT a failure — but it
// must be stripped before judging whether the rest of stderr is benign, or a
// real fatal error printed alongside it (e.g. "Error: Input must be provided …"
// when the prompt is empty) gets mis-classified as benign and hidden.
const STDIN_WARNING_RE = /Warning: no stdin data received[^\n]*\n?/g

/**
 * Resolves the single Claude credential to forward to the CLI, honoring
 * precedence: a configured setup-token (CLAUDE_CODE_OAUTH_TOKEN) wins over an
 * API key, so an ambient ANTHROPIC_API_KEY can't silently override the token the
 * user chose. Returns an env fragment with exactly one (or zero) auth keys.
 * Values in `extra` take priority over process.env for either key.
 *
 * Shared so every Claude-invoking path (the spawner and WorkflowGenerator's
 * direct execFile) applies identical "only the winner is forwarded" semantics.
 */
export function resolveClaudeAuth(
  extra: Record<string, string | undefined> = {},
): Record<string, string> {
  const oauthToken = extra['CLAUDE_CODE_OAUTH_TOKEN'] ?? process.env['CLAUDE_CODE_OAUTH_TOKEN']
  if (oauthToken && oauthToken.length > 0) return { CLAUDE_CODE_OAUTH_TOKEN: oauthToken }

  const apiKey = extra['ANTHROPIC_API_KEY'] ?? process.env['ANTHROPIC_API_KEY']
  if (apiKey && apiKey.length > 0) return { ANTHROPIC_API_KEY: apiKey }

  return {}
}

// Build the allowed-env object passed to the child process.
// Only forward a safe, minimal set of variables [G20].
function buildChildEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const allowed: Array<keyof NodeJS.ProcessEnv> = [
    'PATH',
    'HOME',
    'USERPROFILE',
    'LANG',
    'TERM',
    'APPDATA',        // needed by npm/node on Windows
    'LOCALAPPDATA',   // needed by npm/node on Windows
    'TEMP',
    'TMP',
    'SystemRoot',     // needed on Windows for system tools
    'ComSpec',        // cmd.exe path on Windows
  ]

  const env: NodeJS.ProcessEnv = {}
  for (const key of allowed) {
    const val = process.env[key as string]
    if (val !== undefined) {
      env[key as string] = val
    }
  }

  // Raise the per-response output-token ceiling so long agent results aren't cut
  // off with "Although the output was truncated due to token limits". Claude Code
  // clamps this to each model's true maximum (e.g. Opus 128k, Sonnet/Haiku 64k),
  // so a high default is safe across models. Operators can override it via the
  // root .env (CLAUDE_CODE_MAX_OUTPUT_TOKENS) or a workspace "variable" resource;
  // both are applied below — process.env here, extras in the loop that follows.
  env['CLAUDE_CODE_MAX_OUTPUT_TOKENS'] =
    process.env['CLAUDE_CODE_MAX_OUTPUT_TOKENS'] ?? '128000'

  // Merge caller-supplied extras. Server secrets are never forwarded, and the
  // Claude auth keys are resolved separately below so their precedence can't be
  // bypassed by an extra value.
  for (const [k, v] of Object.entries(extra)) {
    const upper = k.toUpperCase()
    if (BLOCKED_CHILD_ENV_KEYS.has(upper)) continue
    if ((CLAUDE_AUTH_KEYS as readonly string[]).includes(upper)) continue
    env[k] = v
  }

  // Forward exactly the winning Claude credential (setup-token over API key).
  Object.assign(env, resolveClaudeAuth(extra))

  // Forward Claude Code telemetry settings from the root .env.
  Object.assign(env, resolveClaudeTelemetry(extra))

  return env
}

export class ClaudeCodeSpawner extends EventEmitter {
  private _process: ChildProcess | null = null
  private _stderrBuffer = ''
  // Model for this run — used to price usage when the CLI doesn't report cost.
  private _model: string | undefined
  // When the CLI's terminal `result` event reports a failure (is_error, or an
  // error subtype like error_max_turns / error_during_execution) we record it
  // here. The CLI still exits 0 in that case, so without this the run would be
  // reported as a successful completion with empty output. tryComplete() turns
  // a recorded error into an `error` event instead.
  private _resultError: string | null = null
  // Agent id for the current run — only used to label debug logs.
  private _agentId = ''
  // Total length of text actually emitted to consumers this run. Lets
  // tryComplete detect — and loudly diagnose — a run that finished without
  // producing any output (the "empty output" symptom) instead of silently
  // resolving with nothing.
  private _emittedTextLen = 0
  // Stdout lines that were NOT valid stream-json. With --output-format
  // stream-json every line should parse as JSON; anything else is a wrapper
  // banner, an auth/credit/quota message, or a crash the CLI printed as plain
  // text. These were previously dropped on the floor, hiding the real reason a
  // run came back empty. Captured here so tryComplete can surface them.
  private _nonJsonOutput: string[] = []
  // Per-run diagnostics, logged on EVERY failed/empty run (not gated behind
  // RONDOFLOW_DEBUG_SPAWN) so the reason is explainable straight from the
  // server log without re-running. _eventCounts tallies stream-json event types
  // seen; promptLen/permissionMode capture the inputs most likely to be at
  // fault (e.g. an empty prompt).
  private _eventCounts = new Map<string, number>()
  private _messageLen = 0
  private _permissionMode = ''
  // Spawn-timeout state. _idleTimer fires after _idleTimeoutMs of no stream
  // activity (reset on every stdout line / sendMessage); _wallTimer fires at the
  // absolute cap. _timedOut guards against a post-kill `close` event re-emitting
  // a second completion/error after onTimeout has already settled the run.
  private _idleTimer: ReturnType<typeof setTimeout> | null = null
  private _wallTimer: ReturnType<typeof setTimeout> | null = null
  private _idleTimeoutMs = 0
  private _timedOut = false
  // Temp files holding prompt values too large to pass inline on argv (see
  // PROMPT_ARG_FILE_THRESHOLD). Written in buildArgs, removed on teardown.
  private _promptFiles: string[] = []

  spawn(options: SpawnOptions): void {
    if (this._process !== null) {
      throw new Error(`Spawner for agent ${options.agentId} already has a running process`)
    }

    // Clear any temp prompt files left by a prior run on a reused instance before
    // buildArgs writes this run's (normally already empty — teardown removes them).
    this.removePromptFiles()
    this._model = options.model
    this._resultError = null
    this._agentId = options.agentId
    this._emittedTextLen = 0
    this._nonJsonOutput = []
    this._eventCounts = new Map()
    this._messageLen = options.message?.length ?? 0
    this._permissionMode = options.permissionMode ?? 'dontAsk'
    this._timedOut = false
    // undefined → global default; <= 0 → disabled; > 0 → that value.
    this._idleTimeoutMs = options.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS

    // The Claude CLI requires a non-empty prompt operand. With --print an empty
    // prompt makes it exit 1 with "Error: Input must be provided …" and emit NO
    // stream-json at all — which previously surfaced only as a mysterious empty
    // output. Fail fast with the real reason instead of launching a process that
    // cannot succeed. An empty prompt almost always means an upstream step
    // produced no text to forward, or the initial task message was blank.
    if (!options.message || options.message.trim().length === 0) {
      throw new Error(
        `Cannot spawn agent ${options.agentId}: the prompt is empty. ` +
          'An upstream step produced no text to pass on, or the initial task message was blank.',
      )
    }

    const args = this.buildArgs(options)
    const env = buildChildEnv(options.env)
    const command = resolveClaudeCommand()

    // The CLI refuses `--dangerously-skip-permissions` (what bypassPermissions
    // maps to) when running as root/sudo "for security reasons", UNLESS the
    // environment is marked sandboxed via IS_SANDBOX=1. Server deployments
    // commonly run as root inside a container, so without this EVERY headless
    // agent (chains, discussions, loops, the PRD pipeline — all of which use
    // bypassPermissions) exits 1 with "cannot be used with root/sudo
    // privileges" and produces no output. buildChildEnv's allowlist never
    // forwards IS_SANDBOX, so set it explicitly for exactly this case.
    const runningAsRoot = typeof process.getuid === 'function' && process.getuid() === 0
    const wantsBypass = (options.permissionMode ?? 'dontAsk') === 'bypassPermissions'
    if (runningAsRoot && wantsBypass && env['IS_SANDBOX'] !== '1') {
      env['IS_SANDBOX'] = '1'
      this.dbg('running as root with bypassPermissions → set IS_SANDBOX=1 to satisfy the CLI root check')
    }

    if (SPAWN_DEBUG) {
      const authKey = CLAUDE_AUTH_KEYS.find((k) => env[k])
      this.dbg(
        `spawn ${command} model=${options.model ?? '(cli default)'} ` +
          `permissionMode=${options.permissionMode ?? 'dontAsk'} cwd=${options.cwd ?? process.cwd()}`,
      )
      this.dbg(
        'credential:',
        authKey
          ? `${authKey}=${maskSecret(env[authKey] as string)}`
          : 'NONE forwarded — the CLI will fall back to stored credentials (~/.claude). ' +
              'A clean container has none, so every run 401s with empty output.',
      )
      this.dbg('args:', this.describeArgs(args))
    }

    // [G8] Never use shell: true — spawn directly with args array
    this._process = spawn(command, args, {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      // On Unix create a new process group so we can kill the whole tree
      ...(process.platform !== 'win32' && { detached: true }),
      ...(options.cwd ? { cwd: options.cwd } : {}),
    })

    this._process.stdout?.setEncoding('utf8')
    this._process.stderr?.setEncoding('utf8')

    // Arm spawn timeouts. The idle timer resets on every stdout line (see
    // handleLine); the wall-clock timer is an absolute cap that never resets.
    // Both are cleared on completion/error/kill. .unref() so a pending timer
    // never holds the Node process open during shutdown.
    this.resetIdleTimer()
    const wallClockMs = options.maxWallClockMs ?? DEFAULT_MAX_WALLCLOCK_MS
    if (wallClockMs > 0) {
      this._wallTimer = setTimeout(() => this.onTimeout('wall-clock', wallClockMs), wallClockMs)
      this._wallTimer.unref?.()
    }

    let stdoutBuffer = ''

    this._process.stdout?.on('data', (chunk: string) => {
      stdoutBuffer += chunk
      const lines = stdoutBuffer.split('\n')
      // Keep the last (potentially incomplete) line in the buffer
      stdoutBuffer = lines.pop() ?? ''
      for (const raw of lines) {
        // Strip \r for Windows line endings
        const line = raw.replace(/\r$/, '').trim()
        if (line.length === 0) continue
        this.handleLine(line)
      }
    })

    this._process.stderr?.on('data', (chunk: string) => {
      this._stderrBuffer += chunk
    })

    this._process.on('error', (err) => {
      this.clearTimers()
      this.removePromptFiles()
      this.emit('error', err)
      this._process = null
    })

    // Track when stdout is fully drained before emitting completion.
    // On Windows, process 'close' can fire before all stdout data events
    // are processed, causing output to be lost.
    let stdoutClosed = false
    let processExitCode: number | null = null

    const tryComplete = () => {
      if (!stdoutClosed || processExitCode === null) return
      // A timeout already killed the process and emitted its error; the ensuing
      // stdout 'close' / process 'close' must not emit a second terminal event.
      if (this._timedOut) return

      // Flush any remaining buffered stdout
      if (stdoutBuffer.trim().length > 0) {
        this.handleLine(stdoutBuffer.replace(/\r$/, '').trim())
      }
      // Clear AFTER the flush — handleLine above re-arms the idle timer.
      this.clearTimers()

      const exitCode = processExitCode
      const stderrContent = this._stderrBuffer.trim()
      // Strip the always-present stdin warning and judge benignness by what
      // REMAINS — so a real fatal error printed alongside the warning (e.g.
      // "Error: Input must be provided …") is not hidden. See STDIN_WARNING_RE.
      const residualStderr = stderrContent.replace(STDIN_WARNING_RE, '').trim()
      const isBenignStderr = residualStderr.length === 0
      const nonJson = this._nonJsonOutput.join('\n').trim()
      const diag = this.diagnostics(exitCode, residualStderr, nonJson)

      this.dbg('complete', diag)

      if (exitCode !== 0 && !isBenignStderr) {
        console.warn(`${this.logLabel()} run FAILED — ${diag}`)
        this.emit('error', new Error(`Claude exited with code ${exitCode}: ${residualStderr}`))
      } else if (this._resultError) {
        // CLI exited cleanly (exit 0) but its result event reported a failure.
        // Surface it as an error rather than completing with empty/partial output.
        console.warn(`${this.logLabel()} run reported an error — ${diag}`)
        this.emit('error', new Error(this._resultError))
      } else if (this._emittedTextLen === 0) {
        // The run finished without emitting ANY text and without a recorded
        // result error — this is the "empty output" symptom. Anything the CLI
        // wrote that the stream-json parser dropped (a plain-text auth/quota
        // error, a crash banner) lives in nonJson/residualStderr; surface it so
        // the failure is diagnosable instead of a silent empty success.
        const clues = [
          nonJson && `stdout(non-json): ${truncateForLog(nonJson, 500)}`,
          residualStderr && `stderr: ${truncateForLog(residualStderr, 500)}`,
        ]
          .filter(Boolean)
          .join(' | ')

        console.warn(
          `${this.logLabel()} run completed with EMPTY output — ${diag}` +
            (clues
              ? ''
              : ' (no stderr/non-JSON clue captured — the CLI returned a successful but empty ' +
                'result; set RONDOFLOW_DEBUG_SPAWN=1 for the full per-event trace)'),
        )

        if (clues) {
          // There IS a captured failure signal — report it rather than a silent
          // empty completion.
          this.emit('error', new Error(`Claude produced no output — ${clues}`))
        } else {
          // Genuinely empty but otherwise-clean run: preserve the existing
          // completion semantics so callers (Director retry, loop iterations)
          // decide what an empty result means.
          this.emit('completion', { exitCode })
        }
      } else {
        this.emit('completion', { exitCode })
      }
      this.removePromptFiles()
      this._process = null
    }

    this._process.stdout?.on('close', () => {
      stdoutClosed = true
      tryComplete()
    })

    this._process.on('close', (code) => {
      processExitCode = code ?? 0
      tryComplete()
    })
  }

  // Send a follow-up message via stdin (stream-json continuation)
  sendMessage(message: string): void {
    if (!this._process?.stdin) {
      throw new Error('No running process to send a message to')
    }
    const payload = JSON.stringify({ type: 'user', message }) + '\n'
    this._process.stdin.write(payload)
    // A follow-up message is activity — restart the inactivity clock so an
    // interactive agent isn't reaped mid-conversation.
    this.resetIdleTimer()
  }

  kill(): void {
    this.clearTimers()
    this.removePromptFiles()
    if (!this._process) return
    const pid = this._process.pid

    if (pid === undefined) {
      this._process.kill('SIGKILL')
      this._process = null
      return
    }

    // [G13] Platform-specific process tree kill
    if (process.platform === 'win32') {
      // taskkill /T kills the entire process tree; /F forces it
      spawn('taskkill', ['/T', '/F', '/PID', String(pid)], { stdio: 'ignore' })
    } else {
      // Use negative PID to kill the entire process group (requires detached: true)
      try {
        process.kill(-pid, 'SIGKILL')
      } catch {
        // Fall back to killing the direct process if group kill fails
        this._process.kill('SIGKILL')
      }
    }
    this._process = null
  }

  get isRunning(): boolean {
    return this._process !== null
  }

  get pid(): number | null {
    return this._process?.pid ?? null
  }

  // ------------------------------------------------------------------
  // Spawn-timeout helpers
  // ------------------------------------------------------------------

  // (Re)arm the inactivity timer. Called after spawn and on every stream event
  // / follow-up message, so it only fires after a true silence of _idleTimeoutMs.
  // No-op when the idle timeout is disabled (<= 0).
  private resetIdleTimer(): void {
    if (this._idleTimeoutMs <= 0) return
    if (this._idleTimer) clearTimeout(this._idleTimer)
    this._idleTimer = setTimeout(() => this.onTimeout('inactivity', this._idleTimeoutMs), this._idleTimeoutMs)
    this._idleTimer.unref?.()
  }

  private clearTimers(): void {
    if (this._idleTimer) {
      clearTimeout(this._idleTimer)
      this._idleTimer = null
    }
    if (this._wallTimer) {
      clearTimeout(this._wallTimer)
      this._wallTimer = null
    }
  }

  // Kill the run and surface it as an error. The message MUST contain "timed
  // out" so classifyError (error-types.ts) maps it to TIMEOUT_ERROR, which every
  // spawner.on('error') handler already uses to tear the run down.
  private onTimeout(kind: 'inactivity' | 'wall-clock', ms: number): void {
    if (this._process === null || this._timedOut) return
    this._timedOut = true
    this.clearTimers()
    console.warn(`${this.logLabel()} run TIMED OUT (${kind}) after ${ms}ms — killing process tree`)
    this.kill() // sets _process = null and clears timers again (idempotent)
    this.emit('error', new Error(`Agent ${this._agentId} timed out (${kind}) after ${ms}ms`))
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private buildArgs(options: SpawnOptions): string[] {
    const args: string[] = [
      '--print',
      // The CLI rejects `--print --output-format stream-json` unless --verbose is
      // also present ("--output-format=stream-json requires --verbose"). Since we
      // always use stream-json, --verbose is mandatory — not optional. Omitting it
      // makes every spawned agent exit 1 with no output. The `verbose` option is
      // kept for API compatibility but is now always on for stream-json.
      '--verbose',
      '--output-format', 'stream-json',
      '--permission-mode', options.permissionMode ?? 'dontAsk',
      // Inline when small, or `--system-prompt-file <tempfile>` when large enough
      // to risk E2BIG (see promptArgs / PROMPT_ARG_FILE_THRESHOLD).
      ...this.promptArgs('--system-prompt', 'sysprompt', options.systemPrompt),
      '--session-id', options.sessionId,
      '--name', `rondoflow-${options.agentId}`,
      '--no-session-persistence',
    ]

    if (options.model) {
      args.push('--model', options.model)
    }

    if (options.appendSystemPrompt) {
      args.push(...this.promptArgs('--append-system-prompt', 'appendprompt', options.appendSystemPrompt))
    }

    // Forward the resolved tool allowlist so an agent's configured tools (e.g.
    // WebFetch) are actually granted, instead of silently falling back to the
    // CLI's built-in default set. `--allowedTools` is VARIADIC in the CLI
    // (`--allowedTools <tools...>`): it keeps consuming following args until the
    // next `-`-prefixed flag, so we pass the list as a single comma-joined
    // token. The trailing `--` separator (added below, before the prompt)
    // guarantees the variadic can never swallow the message positional — the
    // failure mode that previously made every spawn exit 1 with "Input must be
    // provided … when using --print" and was misdiagnosed as a piped-stdin bug.
    if (options.allowedTools && options.allowedTools.length > 0) {
      args.push('--allowedTools', options.allowedTools.join(','))
    }

    if (options.maxBudgetUsd !== undefined) {
      args.push('--max-budget-usd', String(options.maxBudgetUsd))
    }

    if (options.mcpConfig && Object.keys(options.mcpConfig.mcpServers).length > 0) {
      // Serialize only the mcpServers map — conflicts are internal metadata
      const serialized = JSON.stringify({ mcpServers: options.mcpConfig.mcpServers })
      args.push('--mcp-config', serialized)
    }

    if (options.addDirs?.length) {
      for (const dir of options.addDirs) {
        args.push('--add-dir', dir)
      }
    }

    // End-of-options separator — MUST come immediately before the prompt.
    // Both --allowedTools and --add-dir are variadic (`<tools...>` /
    // `<directories...>`) and would otherwise consume the trailing prompt as one
    // of their values, leaving the CLI with no prompt (exit 1). `--` stops
    // option parsing so the message is always treated as the prompt operand,
    // regardless of which variadic flags precede it. Verified against Claude
    // CLI 2.1.x.
    args.push('--')

    // The initial message is the final positional argument
    args.push(options.message)

    return args
  }

  // Build the CLI args for a (possibly large) prompt value. Small values stay
  // inline as `<flag> <value>`; large ones are written to a temp file and passed
  // as `<flag>-file <path>` so they never enter argv and cannot trigger E2BIG.
  // Falls back to inline if the temp file can't be written (no worse than before).
  private promptArgs(flag: string, label: string, value: string): string[] {
    if (value.length <= PROMPT_ARG_FILE_THRESHOLD) {
      return [flag, value]
    }
    const file = this.writePromptFile(label, value)
    return file ? [`${flag}-file`, file] : [flag, value]
  }

  // Persist a prompt value to a temp file in os.tmpdir(), tracking it for cleanup.
  // Returns the path, or null if the write fails (caller then passes it inline).
  private writePromptFile(label: string, content: string): string | null {
    const file = join(tmpdir(), `rondoflow-${label}-${process.pid}-${++promptFileCounter}.txt`)
    try {
      writeFileSync(file, content, 'utf8')
      this._promptFiles.push(file)
      return file
    } catch (err) {
      // A transient FS failure shouldn't become a hard spawn failure — fall back
      // to the inline arg. It may still E2BIG on a huge value, but that matches
      // the pre-existing behavior rather than introducing a new failure mode.
      console.warn(
        `${this.logLabel()} could not write ${label} temp file (${file}) — passing inline:`,
        err instanceof Error ? err.message : err,
      )
      return null
    }
  }

  // Remove any temp prompt files written for this run. Idempotent and best-effort:
  // called from every teardown path (completion, error, timeout, kill), so a
  // double call is harmless and a stray file left in os.tmpdir() never masks the
  // run's real outcome.
  private removePromptFiles(): void {
    if (this._promptFiles.length === 0) return
    const files = this._promptFiles
    this._promptFiles = []
    for (const file of files) {
      try {
        unlinkSync(file)
      } catch {
        // OS reaps tmpdir eventually; nothing actionable here.
      }
    }
  }

  // Emit a text block to consumers while tracking how much output the run has
  // produced (see _emittedTextLen / tryComplete).
  private emitText(content: string, partial: boolean): void {
    this._emittedTextLen += content.length
    this.dbg(`emit text partial=${partial} len=${content.length}`)
    this.emit('text', { content, partial })
  }

  // Gated debug logger. No-op unless RONDOFLOW_DEBUG_SPAWN is set.
  private dbg(...args: unknown[]): void {
    if (!SPAWN_DEBUG) return
    console.error(this.logLabel(), ...args)
  }

  private logLabel(): string {
    return `[spawner${this._agentId ? ':' + this._agentId : ''}]`
  }

  // Compact, always-on diagnostic line for failed/empty runs: the inputs and
  // the stream-json events actually seen, so the cause is explainable from the
  // server log alone. Example:
  //   exit=1 model=claude-sonnet-4-5 permissionMode=bypassPermissions promptLen=0
  //   emittedTextLen=0 events={} stderr="Error: Input must be provided …"
  private diagnostics(exitCode: number, residualStderr: string, nonJson: string): string {
    const events =
      [...this._eventCounts.entries()].map(([t, n]) => `${t}:${n}`).join(',') || '(none)'
    return (
      `exit=${exitCode} model=${this._model ?? '(default)'} ` +
      `permissionMode=${this._permissionMode} promptLen=${this._messageLen} ` +
      `emittedTextLen=${this._emittedTextLen} events={${events}}` +
      (residualStderr ? ` stderr="${truncateForLog(residualStderr, 300)}"` : '') +
      (nonJson ? ` nonJson="${truncateForLog(nonJson, 300)}"` : '')
    )
  }

  // Render args for logging: long values (system prompt, skills, prompt) are
  // truncated, and the value following --mcp-config is redacted because it can
  // embed server credentials.
  private describeArgs(args: readonly string[]): string {
    const out: string[] = []
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]!
      if (args[i - 1] === '--mcp-config') {
        out.push('<redacted-mcp-config>')
        continue
      }
      out.push(arg.length > 80 ? truncateForLog(arg, 80) : arg)
    }
    return out.join(' ')
  }

  private handleLine(line: string): void {
    // Any stdout line — parsed event, lifecycle ping, or non-JSON banner — proves
    // the run is alive, so reset the inactivity clock before doing anything else.
    this.resetIdleTimer()

    let event: StreamEvent
    try {
      event = JSON.parse(line) as StreamEvent
    } catch {
      // Not stream-json. On a healthy run this never happens, so don't discard
      // it: it's usually the actual reason a run fails (an auth/credit/quota
      // message, a wrapper banner, a crash). Capture it for tryComplete to
      // surface, and log it when tracing.
      this._nonJsonOutput.push(line)
      this.dbg('non-JSON stdout:', truncateForLog(line))
      return
    }

    // Tally every event type seen — cheap, and surfaced in diagnostics() so an
    // empty/failed run shows whether a `result` ever arrived, how many
    // assistant turns ran, etc.
    if (typeof event.type === 'string') {
      this._eventCounts.set(event.type, (this._eventCounts.get(event.type) ?? 0) + 1)
    }

    if (SPAWN_DEBUG) {
      if (event.type === 'result') {
        const r = event as Record<string, unknown>
        const resultLen = typeof r['result'] === 'string' ? (r['result'] as string).length : 0
        this.dbg(
          `event: result subtype=${String(r['subtype'])} is_error=${String(r['is_error'])} ` +
            `api_error_status=${String(r['api_error_status'])} result_len=${resultLen}`,
        )
      } else {
        this.dbg('event:', event.type)
      }
    }

    this.dispatchEvent(event)
  }

  private dispatchEvent(event: StreamEvent): void {
    switch (event.type) {
      // ── Claude Code CLI stream-json format ──────────────────────────

      case 'assistant': {
        // {"type":"assistant","message":{"content":[{"type":"text","text":"..."}],"usage":{...}}}
        const msg = event.message as {
          content?: Array<{ type: string; text?: string; name?: string; input?: unknown; id?: string }>
          usage?: { input_tokens?: number; output_tokens?: number }
          stop_reason?: string | null
        } | undefined

        if (!msg?.content) break

        for (const block of msg.content) {
          if (block.type === 'text' && typeof block.text === 'string') {
            const isPartial = msg.stop_reason === null
            this.emitText(block.text, isPartial)
          }
          if (block.type === 'tool_use' && block.name) {
            this.emit('tool_use', {
              toolName: block.name,
              input: block.input ?? {},
              id: block.id ?? '',
            })
          }
          if (block.type === 'tool_result') {
            this.emit('tool_result', {
              toolName: (block as any).tool_name ?? 'unknown',
              output: (block as any).output ?? {},
              toolUseId: (block as any).tool_use_id ?? '',
            })
          }
        }

        // Emit usage if present
        if (msg.usage) {
          const inputTokens = msg.usage.input_tokens ?? 0
          const outputTokens = msg.usage.output_tokens ?? 0
          const estimatedCostUsd = estimateCostUsd(this._model, inputTokens, outputTokens)
          this.emit('usage', { inputTokens, outputTokens, estimatedCostUsd })
        }
        break
      }

      case 'result': {
        // {"type":"result","subtype":"success","is_error":false,"result":"Hello","total_cost_usd":0.15,"usage":{...}}
        // On failure the CLI still exits 0 but sets is_error=true and/or an error
        // subtype (error_max_turns, error_during_execution, …) and usually omits
        // the result text. Record that so completion surfaces a real error
        // instead of a silent empty "success".
        // The CLI sets is_error=true for failures while STILL reporting
        // subtype="success" (e.g. a 401 comes back as
        // subtype:"success", is_error:true, api_error_status:401), so is_error
        // is the authoritative failure signal — not the subtype.
        const subtype = typeof event.subtype === 'string' ? event.subtype : undefined
        const apiErrorStatus = event['api_error_status']
        const isError = event.is_error === true || (subtype !== undefined && subtype !== 'success')
        const resultContent = event.result as string | undefined

        if (isError) {
          const detail = resultContent && resultContent.length > 0 ? `: ${resultContent}` : ''
          const code =
            apiErrorStatus !== undefined && apiErrorStatus !== null
              ? ` (API error ${String(apiErrorStatus)})`
              : subtype && subtype !== 'success'
                ? ` (${subtype})`
                : ''
          this._resultError = `Claude run failed${code}${detail}`
        } else if (resultContent && resultContent.length > 0) {
          this.emitText(resultContent, false)
        }

        // Extract usage from the result event
        const resultUsage = event.usage as {
          input_tokens?: number
          output_tokens?: number
        } | undefined
        if (resultUsage) {
          const inputTokens = resultUsage.input_tokens ?? 0
          const outputTokens = resultUsage.output_tokens ?? 0
          const totalCost = (event.total_cost_usd as number | undefined) ?? estimateCostUsd(this._model, inputTokens, outputTokens)
          this.emit('usage', { inputTokens, outputTokens, estimatedCostUsd: totalCost })
        }
        break
      }

      case 'rate_limit_event':
        // Rate limit info — log but don't surface to user
        break

      case 'system':
      case 'init':
      case 'ping':
        // Lifecycle events — no action needed
        break

      default:
        // Unknown event types are silently ignored
        break
    }
  }
}
