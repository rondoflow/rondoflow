import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EventEmitter } from 'events'
import { existsSync, readFileSync } from 'fs'

// ---------------------------------------------------------------------------
// Mock child_process so no real `claude` CLI is launched. The mock records the
// most-recently-spawned child on a hoisted handle so tests can drive its stdout
// and assert how it was killed. (ClaudeCodeSpawner imports `spawn` directly.)
// ---------------------------------------------------------------------------
const h = vi.hoisted(() => ({
  child: null as null | {
    pid: number
    stdout: EventEmitter & { setEncoding: (e: string) => void }
    stderr: EventEmitter & { setEncoding: (e: string) => void }
    stdin: { write: (s: string) => void }
    kill: (signal?: string) => boolean
    killCalls: string[]
  },
  spawnCommands: [] as string[],
  spawnOptions: [] as unknown[],
  spawnArgs: [] as string[][],
}))

vi.mock('child_process', () => {
  const { EventEmitter } = require('events')

  function makeStream(): EventEmitter & { setEncoding: (e: string) => void } {
    const s = new EventEmitter() as EventEmitter & { setEncoding: (e: string) => void }
    s.setEncoding = () => {}
    return s
  }

  const spawn = (command: string, _args?: unknown, _opts?: unknown) => {
    h.spawnCommands.push(command)
    h.spawnOptions.push(_opts)
    h.spawnArgs.push((_args as string[]) ?? [])
    // taskkill (the win32 kill path) is also routed through spawn — return a bare
    // child for it without overwriting the tracked agent process.
    if (command === 'taskkill') {
      return Object.assign(new EventEmitter(), { pid: 1, kill: () => true })
    }
    const child = Object.assign(new EventEmitter(), {
      pid: 12345,
      stdout: makeStream(),
      stderr: makeStream(),
      stdin: { write: () => {} },
      killCalls: [] as string[],
      kill(signal?: string): boolean {
        this.killCalls.push(signal ?? 'SIGTERM')
        return true
      },
    })
    h.child = child as unknown as typeof h.child
    return child
  }

  return { spawn, ChildProcess: EventEmitter }
})

import { ClaudeCodeSpawner } from '../spawner'
import type { SpawnOptions } from '../spawner'

// Minimal valid spawn options; individual tests override the timeout fields.
function opts(over: Partial<SpawnOptions> = {}): SpawnOptions {
  return {
    agentId: 'agent-1',
    sessionId: 'session-1',
    message: 'do a thing',
    systemPrompt: 'Be helpful.',
    ...over,
  }
}

// Collect emitted `error` events. An EventEmitter throws on an unhandled 'error',
// so a listener is always attached before driving the run.
function makeSpawner(): { spawner: ClaudeCodeSpawner; errors: Error[] } {
  const spawner = new ClaudeCodeSpawner()
  const errors: Error[] = []
  spawner.on('error', (e: Error) => errors.push(e))
  return { spawner, errors }
}

let killSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  vi.useFakeTimers()
  h.child = null
  h.spawnCommands = []
  h.spawnOptions = []
  h.spawnArgs = []
  // Intercept the Unix process-group kill so no real signal is sent.
  killSpy = vi.spyOn(process, 'kill').mockReturnValue(true as never)
})

afterEach(() => {
  killSpy.mockRestore()
  vi.useRealTimers()
})

const isUnix = process.platform !== 'win32'

describe('ClaudeCodeSpawner timeouts', () => {
  it('idle timeout fires after the inactivity window and kills the process tree', () => {
    const { spawner, errors } = makeSpawner()
    spawner.spawn(opts({ idleTimeoutMs: 1000 }))

    expect(errors).toHaveLength(0)
    vi.advanceTimersByTime(1000)

    expect(errors).toHaveLength(1)
    // Message contract relied on by classifyError → TIMEOUT_ERROR (error-types.test.ts).
    expect(errors[0]?.message).toMatch(/timed out \(inactivity\) after 1000ms/)
    expect(spawner.isRunning).toBe(false)
    if (isUnix) {
      // Negative pid → kill the whole process group.
      expect(killSpy).toHaveBeenCalledWith(-12345, 'SIGKILL')
    }
  })

  it('stdout activity resets the idle timer so a live run is not reaped early', () => {
    const { spawner, errors } = makeSpawner()
    spawner.spawn(opts({ idleTimeoutMs: 1000 }))

    vi.advanceTimersByTime(600)
    // A stdout line proves the run is alive and re-arms the inactivity clock.
    h.child?.stdout.emit('data', 'still working\n')

    vi.advanceTimersByTime(600) // 1200ms total, but only 600ms since activity
    expect(errors).toHaveLength(0)

    vi.advanceTimersByTime(400) // now 1000ms of silence since the last line
    expect(errors).toHaveLength(1)
    expect(errors[0]?.message).toMatch(/timed out \(inactivity\) after 1000ms/)
  })

  it('wall-clock cap fires regardless of ongoing activity', () => {
    const { spawner, errors } = makeSpawner()
    // Large idle timeout so only the wall-clock cap can fire.
    spawner.spawn(opts({ idleTimeoutMs: 100_000, maxWallClockMs: 2000 }))

    // Keep streaming output every 500ms — resets the idle timer but never the wall timer.
    for (let elapsed = 500; elapsed <= 2000; elapsed += 500) {
      vi.advanceTimersByTime(500)
      if (elapsed < 2000) {
        h.child?.stdout.emit('data', `tick ${elapsed}\n`)
        expect(errors).toHaveLength(0)
      }
    }

    expect(errors).toHaveLength(1)
    expect(errors[0]?.message).toMatch(/timed out \(wall-clock\) after 2000ms/)
    expect(spawner.isRunning).toBe(false)
  })
})

describe('ClaudeCodeSpawner kill()', () => {
  it('is idempotent — a second call is a no-op', () => {
    const { spawner } = makeSpawner()
    spawner.spawn(opts({ idleTimeoutMs: 1000 }))

    spawner.kill()
    expect(spawner.isRunning).toBe(false)
    const callsAfterFirst = isUnix ? killSpy.mock.calls.length : h.child?.killCalls.length

    spawner.kill()
    if (isUnix) {
      expect(killSpy.mock.calls.length).toBe(callsAfterFirst)
    } else {
      expect(h.child?.killCalls.length).toBe(callsAfterFirst)
    }
  })

  it('clears the idle timer so no timeout fires after the run is killed', () => {
    const { spawner, errors } = makeSpawner()
    spawner.spawn(opts({ idleTimeoutMs: 1000 }))

    spawner.kill()
    vi.advanceTimersByTime(5000)
    expect(errors).toHaveLength(0)
  })
})

describe('ClaudeCodeSpawner normal completion', () => {
  it('clears timers on a clean close — advancing past the idle window emits no timeout', () => {
    const { spawner, errors } = makeSpawner()
    spawner.spawn(opts({ idleTimeoutMs: 1000 }))

    // Drive a clean shutdown: stdout drains, then the process exits 0.
    h.child?.stdout.emit('close')
    h.child?.emit('close', 0)

    // A genuinely empty-but-clean run completes (rather than erroring).
    expect(errors).toHaveLength(0)
    expect(spawner.isRunning).toBe(false)

    vi.advanceTimersByTime(5000)
    expect(errors).toHaveLength(0)
  })
})

describe('ClaudeCodeSpawner env forwarding', () => {
  it('forwards Claude telemetry env and derives OTEL values from root .env sources', () => {
    const previous = {
      CLAUDE_CODE_ENABLE_TELEMETRY: process.env.CLAUDE_CODE_ENABLE_TELEMETRY,
      OTEL_METRICS_EXPORTER: process.env.OTEL_METRICS_EXPORTER,
      OTEL_LOGS_EXPORTER: process.env.OTEL_LOGS_EXPORTER,
      OTEL_EXPORTER_OTLP_PROTOCOL: process.env.OTEL_EXPORTER_OTLP_PROTOCOL,
      OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS,
      OTEL_RESOURCE_ATTRIBUTES: process.env.OTEL_RESOURCE_ATTRIBUTES,
      OTEL_METRIC_EXPORT_INTERVAL: process.env.OTEL_METRIC_EXPORT_INTERVAL,
      OTEL_LOGS_EXPORT_INTERVAL: process.env.OTEL_LOGS_EXPORT_INTERVAL,
      OTEL_ENDPOINT: process.env.OTEL_ENDPOINT,
      AUTH_TOKEN: process.env.AUTH_TOKEN,
      USER_EMAIL: process.env.USER_EMAIL,
    }

    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = '1'
    process.env.OTEL_METRICS_EXPORTER = 'otlp'
    process.env.OTEL_LOGS_EXPORTER = 'otlp'
    process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/protobuf'
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = ''
    process.env.OTEL_EXPORTER_OTLP_HEADERS = ''
    process.env.OTEL_RESOURCE_ATTRIBUTES = ''
    process.env.OTEL_ENDPOINT = 'https://otel.example/v1/traces'
    process.env.AUTH_TOKEN = 'secret-token'
    process.env.USER_EMAIL = 'user@example.com'
    process.env.OTEL_METRIC_EXPORT_INTERVAL = '60000'
    process.env.OTEL_LOGS_EXPORT_INTERVAL = '5000'

    try {
      const { spawner } = makeSpawner()
      spawner.spawn(opts())

      const spawnOptions = h.spawnOptions.at(-1) as { env?: Record<string, string> } | undefined
      expect(spawnOptions?.env).toMatchObject({
        CLAUDE_CODE_ENABLE_TELEMETRY: '1',
        OTEL_METRICS_EXPORTER: 'otlp',
        OTEL_LOGS_EXPORTER: 'otlp',
        OTEL_EXPORTER_OTLP_PROTOCOL: 'http/protobuf',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'https://otel.example/v1/traces',
        OTEL_EXPORTER_OTLP_HEADERS: 'Authorization=Bearer%20secret-token',
        OTEL_RESOURCE_ATTRIBUTES: 'user.email=user@example.com,service.name=claude-code',
        OTEL_METRIC_EXPORT_INTERVAL: '60000',
        OTEL_LOGS_EXPORT_INTERVAL: '5000',
      })
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) {
          delete process.env[key]
        } else {
          process.env[key] = value
        }
      }
    }
  })
})

describe('ClaudeCodeSpawner large-prompt argv handling (E2BIG guard)', () => {
  // The CLI receives a prompt arg as `<flag> <value>`; find that value.
  const valueAfter = (args: string[], flag: string): string | undefined =>
    args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined

  // Comfortably over PROMPT_ARG_FILE_THRESHOLD (32 KiB) so it diverts to a file.
  const bigPrompt = 'S'.repeat(40 * 1024)

  it('writes a large system prompt to a temp file and passes --system-prompt-file', () => {
    const { spawner } = makeSpawner()
    spawner.spawn(opts({ systemPrompt: bigPrompt }))

    const args = h.spawnArgs.at(-1)!
    // The huge value must NOT appear inline on argv — that is what triggers E2BIG.
    expect(args).not.toContain('--system-prompt')
    expect(args).not.toContain(bigPrompt)
    expect(args).toContain('--system-prompt-file')

    const file = valueAfter(args, '--system-prompt-file')!
    expect(existsSync(file)).toBe(true)
    expect(readFileSync(file, 'utf8')).toBe(bigPrompt)

    spawner.kill()
    expect(existsSync(file)).toBe(false)
  })

  it('keeps a small system prompt inline as --system-prompt (no temp file)', () => {
    const { spawner } = makeSpawner()
    spawner.spawn(opts({ systemPrompt: 'Be helpful.' }))

    const args = h.spawnArgs.at(-1)!
    expect(args).not.toContain('--system-prompt-file')
    expect(valueAfter(args, '--system-prompt')).toBe('Be helpful.')
  })

  it('diverts a large appendSystemPrompt to --append-system-prompt-file', () => {
    const bigAppend = 'A'.repeat(40 * 1024)
    const { spawner } = makeSpawner()
    spawner.spawn(opts({ appendSystemPrompt: bigAppend }))

    const args = h.spawnArgs.at(-1)!
    expect(args).not.toContain('--append-system-prompt')
    expect(args).not.toContain(bigAppend)
    expect(args).toContain('--append-system-prompt-file')
    expect(readFileSync(valueAfter(args, '--append-system-prompt-file')!, 'utf8')).toBe(bigAppend)

    spawner.kill()
  })

  it('removes the temp file when the run completes normally', () => {
    const { spawner } = makeSpawner()
    spawner.spawn(opts({ systemPrompt: bigPrompt }))
    const file = valueAfter(h.spawnArgs.at(-1)!, '--system-prompt-file')!
    expect(existsSync(file)).toBe(true)

    // Drive a clean process exit through the stdout-close → process-close path.
    h.child!.stdout.emit('close')
    h.child!.emit('close', 0)

    expect(existsSync(file)).toBe(false)
  })
})
