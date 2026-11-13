import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  INSTRUCTIONS_ARG_THRESHOLD,
  buildCodexArgs,
  buildCodexEnv,
  buildCodexPrompt,
  codexToolCall,
  codexToolOutput,
  estimateCodexCostUsd,
  mcpConfigArgs,
  resolveCodexSandbox,
  tomlString,
} from '../codex-protocol'
import type { SpawnOptions } from '../spawner'

function opts(over: Partial<SpawnOptions> = {}): SpawnOptions {
  return {
    agentId: 'agent-1',
    sessionId: 'session-1',
    message: 'fix the bug',
    systemPrompt: 'You are a careful engineer.',
    provider: 'codex',
    providerConfig: { model: 'gpt-6.1-sol', webSearch: false, deepResearch: false },
    ...over,
  }
}

// Value following a `--config` flag whose override starts with `key=`.
function configValue(args: readonly string[], key: string): string | undefined {
  for (let i = 0; i < args.length - 1; i++) {
    if (args[i] === '--config' && args[i + 1]!.startsWith(`${key}=`)) {
      return args[i + 1]!.slice(key.length + 1)
    }
  }
  return undefined
}

describe('buildCodexArgs', () => {
  it('runs exec in JSON mode, never asks for approval, and reads the prompt from stdin', () => {
    const args = buildCodexArgs(opts(), null)
    expect(args.slice(0, 3)).toEqual(['exec', '--json', '--skip-git-repo-check'])
    expect(args[args.indexOf('--model') + 1]).toBe('gpt-6.1-sol')
    expect(configValue(args, 'approval_policy')).toBe('"never"')
    expect(configValue(args, 'web_search')).toBe('"disabled"')
    expect(args[args.length - 1]).toBe('-')
    expect(args).not.toContain('resume')
  })

  it('enables live web search when the toggle is on', () => {
    const args = buildCodexArgs(
      opts({ providerConfig: { model: 'gpt-6.1-sol', webSearch: true, deepResearch: false } }),
      null,
    )
    expect(configValue(args, 'web_search')).toBe('"live"')
  })

  it('falls back to the default model when providerConfig has none', () => {
    const args = buildCodexArgs(opts({ providerConfig: undefined }), null)
    expect(args[args.indexOf('--model') + 1]).toBe('gpt-6.1-sol')
  })

  it('forwards cwd and every add-dir', () => {
    const args = buildCodexArgs(opts({ cwd: '/work/repo', addDirs: ['/a', '/b'] }), null)
    expect(args[args.indexOf('--cd') + 1]).toBe('/work/repo')
    expect(args.filter((_, i) => args[i - 1] === '--add-dir')).toEqual(['/a', '/b'])
  })

  it('places exec options before `resume <thread>` and the stdin marker last', () => {
    const args = buildCodexArgs(opts({ cwd: '/w' }), 'thread-123')
    const resumeAt = args.indexOf('resume')
    expect(args[resumeAt + 1]).toBe('thread-123')
    expect(args.indexOf('--cd')).toBeLessThan(resumeAt)
    expect(args.indexOf('--sandbox')).toBeLessThan(resumeAt)
    expect(args.slice(resumeAt)).toEqual(['resume', 'thread-123', '-'])
  })

  it('passes persona + skills as developer_instructions', () => {
    const args = buildCodexArgs(opts({ appendSystemPrompt: '## Skill: x\nDo X.' }), null)
    const value = configValue(args, 'developer_instructions')
    expect(JSON.parse(value!)).toBe('You are a careful engineer.\n\n## Skill: x\nDo X.')
  })

  it('keeps oversized instructions out of argv (E2BIG guard) and puts them in the first prompt', () => {
    const huge = 'x'.repeat(INSTRUCTIONS_ARG_THRESHOLD + 1)
    const o = opts({ systemPrompt: huge })
    expect(configValue(buildCodexArgs(o, null), 'developer_instructions')).toBeUndefined()
    expect(buildCodexPrompt(o, 'task', true)).toContain(huge)
    expect(buildCodexPrompt(o, 'task', true).endsWith('task')).toBe(true)
    // Resumed turns rely on the thread history instead of repeating them.
    expect(buildCodexPrompt(o, 'follow-up', false)).toBe('follow-up')
  })
})

describe('resolveCodexSandbox', () => {
  it('maps permission modes onto sandboxes', () => {
    expect(resolveCodexSandbox(opts({ permissionMode: 'plan' }))).toBe('read-only')
    expect(resolveCodexSandbox(opts({ permissionMode: 'default' }))).toBe('workspace-write')
    expect(resolveCodexSandbox(opts({ permissionMode: 'acceptEdits' }))).toBe('workspace-write')
    expect(resolveCodexSandbox(opts({ permissionMode: 'bypassPermissions' }))).toBe('danger-full-access')
  })

  it("never lets a headless run's bypassPermissions widen the agent's own sandbox", () => {
    const o = opts({
      permissionMode: 'bypassPermissions',
      providerConfig: { model: 'm', webSearch: false, deepResearch: false, sandbox: 'workspace-write' },
    })
    expect(resolveCodexSandbox(o)).toBe('workspace-write')
  })

  it('takes the stricter run mode when the run is more restrictive than the agent', () => {
    const o = opts({
      permissionMode: 'plan',
      providerConfig: { model: 'm', webSearch: false, deepResearch: false, sandbox: 'danger-full-access' },
    })
    expect(resolveCodexSandbox(o)).toBe('read-only')
  })
})

describe('tomlString', () => {
  it('produces a TOML basic string for quotes, newlines and backslashes', () => {
    expect(tomlString('say "hi"\n\\path')).toBe('"say \\"hi\\"\\n\\\\path"')
  })

  it('escapes DEL and replaces lone surrogates (both invalid raw in TOML)', () => {
    expect(tomlString('a\u007fb')).toBe('"a\\u007fb"')
    expect(tomlString('a\uD800b')).toBe('"a�b"')
  })
})

describe('mcpConfigArgs', () => {
  it('translates stdio and http servers into mcp_servers overrides and skips SSE', () => {
    const { args, skipped } = mcpConfigArgs({
      conflicts: [],
      mcpServers: {
        files: { type: 'stdio', command: 'npx', args: ['-y', 'srv'], env: { TOKEN: 't' } },
        'remote api': { type: 'http', url: 'https://x.test/mcp', headers: { Authorization: 'Bearer z' } },
        legacy: { type: 'sse', url: 'https://y.test/sse' },
      },
    })
    expect(configValue(args, 'mcp_servers.files.command')).toBe('"npx"')
    expect(configValue(args, 'mcp_servers.files.args')).toBe('["-y", "srv"]')
    expect(configValue(args, 'mcp_servers.files.env')).toBe('{ "TOKEN" = "t" }')
    expect(configValue(args, 'mcp_servers.remote_api.url')).toBe('"https://x.test/mcp"')
    expect(configValue(args, 'mcp_servers.remote_api.http_headers')).toBe('{ "Authorization" = "Bearer z" }')
    expect(skipped).toEqual(['legacy'])
  })
})

describe('buildCodexEnv', () => {
  const saved = { ...process.env }
  beforeEach(() => {
    delete process.env['CODEX_API_KEY']
    delete process.env['OPENAI_API_KEY']
    process.env['DATABASE_URL'] = 'postgres://secret'
  })
  afterEach(() => {
    process.env = { ...saved }
  })

  it('forwards the OpenAI key as CODEX_API_KEY and never forwards server or Claude secrets', () => {
    const env = buildCodexEnv({
      OPENAI_API_KEY: 'sk-openai',
      ANTHROPIC_API_KEY: 'sk-ant',
      CLAUDE_CODE_OAUTH_TOKEN: 'oauth',
      DATABASE_URL: 'postgres://leak',
      MY_VAR: 'ok',
    })
    expect(env['CODEX_API_KEY']).toBe('sk-openai')
    expect(env['OPENAI_API_KEY']).toBeUndefined()
    expect(env['ANTHROPIC_API_KEY']).toBeUndefined()
    expect(env['CLAUDE_CODE_OAUTH_TOKEN']).toBeUndefined()
    expect(env['DATABASE_URL']).toBeUndefined()
    expect(env['MY_VAR']).toBe('ok')
  })

  it('falls back to the server env key, and forwards none when unset (codex login fallback)', () => {
    process.env['OPENAI_API_KEY'] = 'sk-server'
    expect(buildCodexEnv({})['CODEX_API_KEY']).toBe('sk-server')
    delete process.env['OPENAI_API_KEY']
    expect(buildCodexEnv({})['CODEX_API_KEY']).toBeUndefined()
  })
})

describe('codex item mapping', () => {
  it('maps a shell command to a shell tool call with exit code and output', () => {
    const item = {
      id: 'item_1',
      type: 'command_execution',
      command: 'ls',
      aggregated_output: 'a\nb',
      exit_code: 0,
      status: 'completed',
    }
    expect(codexToolCall(item)).toEqual({ toolName: 'shell', input: { command: 'ls' } })
    expect(codexToolOutput(item)).toEqual({ status: 'completed', exitCode: 0, output: 'a\nb' })
  })

  it('names MCP tools like Claude Code (mcp__server__tool) and surfaces errors', () => {
    const item = {
      id: 'i',
      type: 'mcp_tool_call',
      server: 'gh',
      tool: 'search',
      arguments: { q: 'x' },
      error: { message: 'boom' },
      status: 'failed',
    }
    expect(codexToolCall(item)).toEqual({ toolName: 'mcp__gh__search', input: { q: 'x' } })
    expect(codexToolOutput(item)).toEqual({ status: 'failed', error: 'boom' })
  })

  it('ignores non-tool items', () => {
    expect(codexToolCall({ id: 'r', type: 'reasoning', text: '…' })).toBeNull()
    expect(codexToolCall({ id: 'm', type: 'agent_message', text: 'hi' })).toBeNull()
  })

  it('truncates very large command output', () => {
    const out = codexToolOutput({
      id: 'i',
      type: 'command_execution',
      command: 'cat big',
      aggregated_output: 'z'.repeat(50_000),
      status: 'completed',
    }) as { output: string }
    expect(out.output.length).toBeLessThan(21_000)
    expect(out.output).toContain('truncated')
  })
})

describe('estimateCodexCostUsd', () => {
  it('bills cached input at the discounted rate', () => {
    const full = estimateCodexCostUsd({ input_tokens: 1_000_000, cached_input_tokens: 0, output_tokens: 0 })
    const cached = estimateCodexCostUsd({ input_tokens: 1_000_000, cached_input_tokens: 1_000_000, output_tokens: 0 })
    expect(cached).toBeLessThan(full)
    expect(estimateCodexCostUsd({})).toBe(0)
  })
})
