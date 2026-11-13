import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EventEmitter } from 'events'

// ---------------------------------------------------------------------------
// Mock child_process so no real `codex` CLI is launched. Each spawned child is
// recorded so tests can feed JSONL on stdout, inspect what was written to
// stdin, and finish the process.
// ---------------------------------------------------------------------------
type MockChild = EventEmitter & {
  pid: number
  stdout: EventEmitter & { setEncoding: (e: string) => void }
  stderr: EventEmitter & { setEncoding: (e: string) => void }
  stdin: EventEmitter & { end: (s?: string) => void; written: string[] }
  kill: (signal?: string) => boolean
}

const h = vi.hoisted(() => ({
  children: [] as MockChild[],
  commands: [] as string[],
  args: [] as string[][],
  options: [] as Array<Record<string, unknown>>,
}))

vi.mock('child_process', () => {
  const { EventEmitter } = require('events')
  function makeStream() {
    const s = new EventEmitter()
    s.setEncoding = () => {}
    return s
  }
  const spawn = (command: string, args: string[], opts: Record<string, unknown>) => {
    h.commands.push(command)
    h.args.push(args)
    h.options.push(opts)
    const stdin = Object.assign(new EventEmitter(), {
      written: [] as string[],
      end(s?: string) {
        if (s !== undefined) this.written.push(s)
      },
    })
    const child = Object.assign(new EventEmitter(), {
      pid: 4242,
      stdout: makeStream(),
      stderr: makeStream(),
      stdin,
      kill: () => true,
    })
    h.children.push(child as MockChild)
    return child
  }
  return { spawn, ChildProcess: EventEmitter }
})

import { CodexSpawner, CODEX_NOT_FOUND_MESSAGE, describeCodexArgs } from '../codex-spawner'
import type { SpawnOptions } from '../spawner'

function opts(over: Partial<SpawnOptions> = {}): SpawnOptions {
  return {
    agentId: 'agent-1',
    sessionId: 'session-1',
    message: 'fix the failing test',
    systemPrompt: 'You are a careful engineer.',
    provider: 'codex',
    providerConfig: { model: 'gpt-6.1-sol', webSearch: false, deepResearch: false },
    ...over,
  }
}

interface Recorded {
  runner: CodexSpawner
  texts: string[]
  toolUses: Array<{ toolName: string; input: unknown; id: string }>
  toolResults: Array<{ toolName: string; output: unknown; toolUseId: string }>
  usage: Array<{ inputTokens: number; outputTokens: number; estimatedCostUsd: number }>
  completions: number[]
  errors: Error[]
}

function makeRunner(): Recorded {
  const runner = new CodexSpawner()
  const r: Recorded = { runner, texts: [], toolUses: [], toolResults: [], usage: [], completions: [], errors: [] }
  runner.on('text', (d) => r.texts.push(d.content))
  runner.on('tool_use', (d) => r.toolUses.push(d))
  runner.on('tool_result', (d) => r.toolResults.push(d))
  runner.on('usage', (d) => r.usage.push(d))
  runner.on('completion', (d) => r.completions.push(d.exitCode))
  runner.on('error', (e) => r.errors.push(e))
  return r
}

function child(): MockChild {
  return h.children[h.children.length - 1]!
}

function feed(...events: unknown[]): void {
  child().stdout.emit('data', events.map((e) => JSON.stringify(e)).join('\n') + '\n')
}

function exit(code: number): void {
  child().stdout.emit('close')
  child().emit('close', code, null)
}

let killSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  vi.useFakeTimers()
  h.children = []
  h.commands = []
  h.args = []
  h.options = []
  killSpy = vi.spyOn(process, 'kill').mockReturnValue(true as never)
})

afterEach(() => {
  killSpy.mockRestore()
  vi.useRealTimers()
})

describe('CodexSpawner spawn', () => {
  it('spawns `codex exec --json` without a shell and writes the prompt to stdin', () => {
    const { runner } = makeRunner()
    runner.spawn(opts({ cwd: '/work' }))

    expect(h.commands).toEqual(['codex'])
    expect(h.args[0]!.slice(0, 2)).toEqual(['exec', '--json'])
    expect(h.options[0]!['shell']).toBeUndefined()
    expect(h.options[0]!['cwd']).toBe('/work')
    expect(child().stdin.written).toEqual(['fix the failing test'])
    expect(runner.isRunning).toBe(true)
    expect(runner.pid).toBe(4242)
  })

  it('fails fast on an empty prompt', () => {
    const { runner } = makeRunner()
    expect(() => runner.spawn(opts({ message: '   ' }))).toThrow(/prompt is empty/)
    expect(h.commands).toHaveLength(0)
  })
})

describe('CodexSpawner event mapping', () => {
  it('maps a full turn onto text, tool and usage events, then completes', () => {
    const r = makeRunner()
    r.runner.spawn(opts())
    feed(
      { type: 'thread.started', thread_id: 'thread-1' },
      { type: 'turn.started' },
      { type: 'item.started', item: { id: 'item_0', type: 'command_execution', command: 'npm test', status: 'in_progress', aggregated_output: '' } },
      { type: 'item.completed', item: { id: 'item_0', type: 'command_execution', command: 'npm test', status: 'completed', exit_code: 1, aggregated_output: 'FAIL' } },
      { type: 'item.completed', item: { id: 'item_1', type: 'file_change', status: 'completed', changes: [{ path: 'a.ts', kind: 'update' }] } },
      { type: 'item.completed', item: { id: 'item_2', type: 'agent_message', text: 'Fixed it.' } },
      { type: 'turn.completed', usage: { input_tokens: 1000, cached_input_tokens: 200, output_tokens: 50, reasoning_output_tokens: 10 } },
    )
    exit(0)

    expect(r.texts).toEqual(['Fixed it.'])
    expect(r.toolUses.map((t) => t.toolName)).toEqual(['shell', 'apply_patch'])
    expect(r.toolResults.map((t) => t.toolUseId)).toEqual(r.toolUses.map((t) => t.id))
    expect(r.toolResults[0]!.output).toMatchObject({ exitCode: 1, output: 'FAIL' })
    expect(r.usage).toHaveLength(1)
    expect(r.usage[0]).toMatchObject({ inputTokens: 1000, outputTokens: 50 })
    expect(r.usage[0]!.estimatedCostUsd).toBeGreaterThan(0)
    expect(r.completions).toEqual([0])
    expect(r.errors).toHaveLength(0)
    expect(r.runner.isRunning).toBe(false)
  })

  it('handles JSONL split across chunks', () => {
    const r = makeRunner()
    r.runner.spawn(opts())
    const line = JSON.stringify({ type: 'item.completed', item: { id: 'm', type: 'agent_message', text: 'hello' } })
    child().stdout.emit('data', line.slice(0, 10))
    child().stdout.emit('data', line.slice(10) + '\n')
    exit(0)
    expect(r.texts).toEqual(['hello'])
  })

  it('surfaces turn.failed as an error, ignoring transient reconnect notices', () => {
    const r = makeRunner()
    r.runner.spawn(opts())
    feed(
      { type: 'thread.started', thread_id: 't' },
      { type: 'error', message: 'Reconnecting... 2/5 (401 Unauthorized)' },
      { type: 'turn.failed', error: { message: 'unexpected status 401 Unauthorized' } },
    )
    exit(1)
    expect(r.completions).toHaveLength(0)
    expect(r.errors).toHaveLength(1)
    expect(r.errors[0]!.message).toBe('Codex run failed: unexpected status 401 Unauthorized')
  })

  it('reports a non-zero exit with the last stream error when no turn.failed arrived', () => {
    const r = makeRunner()
    r.runner.spawn(opts())
    feed({ type: 'error', message: 'model not supported' })
    child().stderr.emit('data', 'some log noise\n')
    exit(2)
    expect(r.errors[0]!.message).toBe('Codex exited with code 2: model not supported')
  })

  it('treats non-fatal error items as notices, not failures', () => {
    const r = makeRunner()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    r.runner.spawn(opts())
    feed(
      { type: 'item.completed', item: { id: 'item_0', type: 'error', message: 'Model metadata not found' } },
      { type: 'item.completed', item: { id: 'item_1', type: 'agent_message', text: 'done' } },
    )
    exit(0)
    warn.mockRestore()
    expect(r.errors).toHaveLength(0)
    expect(r.completions).toEqual([0])
  })
})

describe('CodexSpawner process failures', () => {
  it('explains how to install Codex when the binary is missing', () => {
    const r = makeRunner()
    r.runner.spawn(opts())
    child().emit('error', Object.assign(new Error('spawn codex ENOENT'), { code: 'ENOENT' }))
    exit(-2)
    expect(r.errors).toHaveLength(1)
    expect(r.errors[0]!.message).toBe(CODEX_NOT_FOUND_MESSAGE)
    expect(r.completions).toHaveLength(0)
  })

  it('times out after the inactivity window and kills the process group', () => {
    const r = makeRunner()
    r.runner.spawn(opts({ idleTimeoutMs: 1000 }))
    vi.advanceTimersByTime(999)
    feed({ type: 'turn.started' }) // activity resets the idle clock
    vi.advanceTimersByTime(999)
    expect(r.errors).toHaveLength(0)
    vi.advanceTimersByTime(2)
    expect(r.errors).toHaveLength(1)
    expect(r.errors[0]!.message).toMatch(/timed out \(inactivity\)/)
    if (process.platform !== 'win32') expect(killSpy).toHaveBeenCalledWith(-4242, 'SIGKILL')
    // The post-kill close must not emit a second terminal event.
    exit(137)
    expect(r.errors).toHaveLength(1)
    expect(r.completions).toHaveLength(0)
  })

  it('settles a deliberate kill as a completion once the process closes', () => {
    const r = makeRunner()
    r.runner.spawn(opts())
    r.runner.kill()
    expect(r.runner.isRunning).toBe(false)
    child().stdout.emit('close')
    child().emit('close', null, 'SIGKILL')
    expect(r.errors).toHaveLength(0)
    expect(r.completions).toEqual([0])
  })
})

describe('CodexSpawner follow-up messages', () => {
  it('resumes the thread in a new process after the turn finishes', () => {
    const r = makeRunner()
    r.runner.spawn(opts())
    feed({ type: 'thread.started', thread_id: 'thread-9' })
    exit(0)

    r.runner.sendMessage('now add a test')
    expect(h.args).toHaveLength(2)
    const args = h.args[1]!
    expect(args.slice(args.indexOf('resume'))).toEqual(['resume', 'thread-9', '-'])
    expect(child().stdin.written).toEqual(['now add a test'])
  })

  it('rejects a follow-up while a turn is still running', () => {
    const { runner } = makeRunner()
    runner.spawn(opts())
    feed({ type: 'thread.started', thread_id: 't' })
    expect(() => runner.sendMessage('more')).toThrow(/still working/)
  })

  it('scopes tool ids per turn so resumed turns never collide', () => {
    const r = makeRunner()
    r.runner.spawn(opts())
    feed(
      { type: 'thread.started', thread_id: 't' },
      { type: 'item.completed', item: { id: 'item_0', type: 'web_search', query: 'a' } },
    )
    exit(0)
    r.runner.sendMessage('again')
    feed({ type: 'item.completed', item: { id: 'item_0', type: 'web_search', query: 'b' } })
    exit(0)
    const ids = r.toolUses.map((t) => t.id)
    expect(new Set(ids).size).toBe(2)
  })
})

describe('describeCodexArgs', () => {
  it('redacts MCP env and header overrides', () => {
    const out = describeCodexArgs([
      '--config',
      'mcp_servers.gh.env={ "TOKEN" = "secret" }',
      '--config',
      'mcp_servers.api.http_headers={ "Authorization" = "Bearer s" }',
    ])
    expect(out).not.toContain('secret')
    expect(out).not.toContain('Bearer s')
    expect(out).toContain('mcp_servers.gh.env=<redacted>')
  })
})
