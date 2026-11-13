// Codex CLI protocol — pure helpers behind CodexSpawner.
//
// Everything here is side-effect free so it can be unit-tested without a
// process: argv construction for `codex exec --json`, TOML encoding for `-c`
// config overrides, MCP server translation, child-env/credential resolution,
// and the mapping of Codex JSONL thread items onto the spawner's tool events.
//
// Verified against codex-cli 0.166 (`codex exec --help`, the TS SDK's
// CodexExec argv builder, and a live run's JSONL output).

import {
  DEFAULT_CODEX_PROVIDER_CONFIG,
  codexSandboxForPermissionMode,
  stricterCodexSandbox,
  type CodexSandboxMode,
  type ProviderConfig,
} from '@rondoflow/shared'
import type { SpawnOptions } from './spawner'
import type { MergedMcpConfig } from './mcp-config-builder'
import { baseChildEnv, filterChildExtras } from './cli-process'
import { openaiRate } from './pricing'

// Instructions (persona + skills + workspace context) up to this size are sent
// as `-c developer_instructions=…`. Larger ones are prepended to the stdin
// prompt instead, so argv can never exceed ARG_MAX ("spawn E2BIG").
export const INSTRUCTIONS_ARG_THRESHOLD = 32 * 1024

// Cap on a shell command's captured output forwarded in a tool_result event.
const TOOL_OUTPUT_MAX_CHARS = 20_000

// Codex exec authenticates with CODEX_API_KEY. RondoFlow stores the OpenAI key
// as OPENAI_API_KEY (Settings → Credentials) and forwards it under that name.
// With neither set, Codex falls back to its own stored login (`codex login`,
// e.g. a ChatGPT plan) under CODEX_HOME / ~/.codex.
const CODEX_AUTH_KEYS = ['CODEX_API_KEY', 'OPENAI_API_KEY'] as const
// Credentials of other providers are never handed to the Codex process.
const FOREIGN_AUTH_KEYS = ['CLAUDE_CODE_OAUTH_TOKEN', 'ANTHROPIC_API_KEY', 'PERPLEXITY_API_KEY'] as const

// ── Credentials + environment ────────────────────────────────────────────────

function firstNonEmpty(...values: ReadonlyArray<string | undefined>): string | undefined {
  return values.find((v) => v !== undefined && v.trim().length > 0)
}

/** The single Codex API key to forward (extras win over the server env). */
export function resolveCodexAuth(extra: Record<string, string | undefined> = {}): Record<string, string> {
  const key = firstNonEmpty(
    extra['CODEX_API_KEY'],
    extra['OPENAI_API_KEY'],
    process.env['CODEX_API_KEY'],
    process.env['OPENAI_API_KEY'],
  )
  return key ? { CODEX_API_KEY: key } : {}
}

/** Allowlisted child env for a Codex run [G20]. */
export function buildCodexEnv(extra: Record<string, string> = {}): Record<string, string> {
  const codexHome = process.env['CODEX_HOME']
  return {
    ...baseChildEnv(),
    // Where `codex login` stored its credentials, when relocated from ~/.codex.
    ...(codexHome ? { CODEX_HOME: codexHome } : {}),
    ...filterChildExtras(extra, [...CODEX_AUTH_KEYS, ...FOREIGN_AUTH_KEYS]),
    ...resolveCodexAuth(extra),
  }
}

// ── TOML encoding for `-c key=value` ─────────────────────────────────────────

const LONE_SURROGATE_RE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g

/**
 * Encode a string as a TOML basic string. JSON's escapes (\" \\ \n \t \uXXXX)
 * are all valid TOML, so JSON.stringify does the heavy lifting; TOML also
 * forbids a raw DEL and lone surrogates, which are fixed up here.
 */
export function tomlString(value: string): string {
  return JSON.stringify(value.replace(LONE_SURROGATE_RE, '�')).replace(/\u007f/g, '\\u007f')
}

function tomlStringArray(values: readonly string[]): string {
  return `[${values.map(tomlString).join(', ')}]`
}

function tomlInlineTable(record: Readonly<Record<string, string>>): string {
  const entries = Object.entries(record).map(([k, v]) => `${tomlString(k)} = ${tomlString(v)}`)
  return `{ ${entries.join(', ')} }`
}

// Config paths are dotted, so a server name becomes one bare-key segment.
function tomlKeySegment(name: string): string {
  const safe = name.replace(/[^A-Za-z0-9_-]/g, '_')
  return safe.length > 0 ? safe : 'server'
}

// ── Configuration resolution ─────────────────────────────────────────────────

export function resolveCodexConfig(stored: Partial<ProviderConfig> | undefined): ProviderConfig {
  return {
    model: stored?.model && stored.model.trim().length > 0 ? stored.model : DEFAULT_CODEX_PROVIDER_CONFIG.model,
    webSearch: stored?.webSearch ?? DEFAULT_CODEX_PROVIDER_CONFIG.webSearch,
    deepResearch: false,
    ...(stored?.sandbox ? { sandbox: stored.sandbox } : {}),
  }
}

/**
 * The sandbox for this run: the stricter of the agent's own resolved sandbox
 * (providerConfig.sandbox, from its permission mode + policies) and the run's
 * permission mode. A headless workflow forces `bypassPermissions` — that must
 * not silently lift a sandboxed Codex agent to full access.
 */
export function resolveCodexSandbox(options: SpawnOptions): CodexSandboxMode {
  const fromRun = codexSandboxForPermissionMode(options.permissionMode)
  const fromAgent = options.providerConfig?.sandbox
  return fromAgent ? stricterCodexSandbox(fromAgent, fromRun) : fromRun
}

/** Persona + skills (+ workspace context), the Codex "developer instructions". */
export function composeInstructions(options: SpawnOptions): string {
  return [options.systemPrompt, options.appendSystemPrompt]
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .join('\n\n')
}

// ── MCP ──────────────────────────────────────────────────────────────────────

/**
 * Codex has no `--mcp-config`; servers are declared as `mcp_servers.<name>.*`
 * config overrides. stdio → command/args/env, http → url/http_headers. Codex
 * has no SSE transport, so SSE servers are skipped (reported via `skipped`).
 */
export function mcpConfigArgs(mcp: MergedMcpConfig | undefined): { args: string[]; skipped: string[] } {
  const args: string[] = []
  const skipped: string[] = []
  for (const [name, server] of Object.entries(mcp?.mcpServers ?? {})) {
    const key = `mcp_servers.${tomlKeySegment(name)}`
    if (server.type === 'stdio') {
      args.push('--config', `${key}.command=${tomlString(server.command)}`)
      args.push('--config', `${key}.args=${tomlStringArray(server.args)}`)
      if (server.env && Object.keys(server.env).length > 0) {
        args.push('--config', `${key}.env=${tomlInlineTable(server.env)}`)
      }
    } else if (server.type === 'http') {
      args.push('--config', `${key}.url=${tomlString(server.url)}`)
      if (server.headers && Object.keys(server.headers).length > 0) {
        args.push('--config', `${key}.http_headers=${tomlInlineTable(server.headers)}`)
      }
    } else {
      skipped.push(name)
    }
  }
  return { args, skipped }
}

// ── argv + stdin prompt ──────────────────────────────────────────────────────

/**
 * argv for one `codex exec` turn. All exec-level options precede the optional
 * `resume <threadId>` subcommand (as the official SDK orders them); the prompt
 * is always read from stdin (`-`) so its size never touches argv.
 */
export function buildCodexArgs(options: SpawnOptions, threadId: string | null): string[] {
  const config = resolveCodexConfig(options.providerConfig)
  const args: string[] = ['exec', '--json', '--skip-git-repo-check']

  args.push('--model', config.model)
  args.push('--sandbox', resolveCodexSandbox(options))
  if (options.cwd) args.push('--cd', options.cwd)
  for (const dir of options.addDirs ?? []) args.push('--add-dir', dir)

  // Headless: nobody can answer an approval prompt, so never ask. The sandbox
  // above is what bounds the agent.
  args.push('--config', 'approval_policy="never"')
  args.push('--config', `web_search=${tomlString(config.webSearch ? 'live' : 'disabled')}`)

  const instructions = composeInstructions(options)
  if (instructions.length > 0 && instructions.length <= INSTRUCTIONS_ARG_THRESHOLD) {
    args.push('--config', `developer_instructions=${tomlString(instructions)}`)
  }

  args.push(...mcpConfigArgs(options.mcpConfig).args)

  if (threadId) args.push('resume', threadId)
  args.push('-')
  return args
}

/**
 * The stdin prompt for a turn. Oversized instructions (see
 * INSTRUCTIONS_ARG_THRESHOLD) ride along in the first turn's prompt; the thread
 * history carries them into resumed turns.
 */
export function buildCodexPrompt(options: SpawnOptions, message: string, firstTurn: boolean): string {
  const instructions = composeInstructions(options)
  if (!firstTurn || instructions.length <= INSTRUCTIONS_ARG_THRESHOLD) return message
  return `<instructions>\n${instructions}\n</instructions>\n\n${message}`
}

// ── JSONL thread items → tool events ─────────────────────────────────────────

export interface CodexItem {
  readonly id?: string
  readonly type?: string
  readonly [key: string]: unknown
}

export interface CodexToolCall {
  readonly toolName: string
  readonly input: unknown
}

// Tool names Codex items surface as. The policy checker maps these onto
// Claude Code's equivalents (Bash / Write / Edit) so one policy covers both.
export const CODEX_SHELL_TOOL = 'shell'
export const CODEX_PATCH_TOOL = 'apply_patch'

/** The tool call an item represents, or null for non-tool items. */
export function codexToolCall(item: CodexItem): CodexToolCall | null {
  switch (item.type) {
    case 'command_execution':
      return { toolName: CODEX_SHELL_TOOL, input: { command: item['command'] } }
    case 'file_change':
      return { toolName: CODEX_PATCH_TOOL, input: { changes: item['changes'] ?? [] } }
    case 'mcp_tool_call':
      return {
        toolName: `mcp__${String(item['server'] ?? 'unknown')}__${String(item['tool'] ?? 'unknown')}`,
        input: item['arguments'] ?? {},
      }
    case 'web_search':
      return { toolName: 'web_search', input: { query: item['query'] } }
    default:
      return null
  }
}

function truncateOutput(value: unknown): unknown {
  if (typeof value !== 'string' || value.length <= TOOL_OUTPUT_MAX_CHARS) return value
  return `${value.slice(0, TOOL_OUTPUT_MAX_CHARS)}\n…(truncated, ${value.length} chars total)`
}

/** The tool_result payload for a completed tool item. */
export function codexToolOutput(item: CodexItem): unknown {
  switch (item.type) {
    case 'command_execution':
      return {
        status: item['status'],
        exitCode: item['exit_code'] ?? null,
        output: truncateOutput(item['aggregated_output'] ?? ''),
      }
    case 'file_change':
      return { status: item['status'], changes: item['changes'] ?? [] }
    case 'mcp_tool_call': {
      const error = item['error'] as { message?: string } | undefined
      if (error) return { status: item['status'], error: error.message ?? 'MCP tool call failed' }
      const result = item['result'] as { content?: unknown } | undefined
      return { status: item['status'], result: result?.content ?? result ?? null }
    }
    case 'web_search':
      return { query: item['query'] }
    default:
      return {}
  }
}

// ── Usage → cost ─────────────────────────────────────────────────────────────

export interface CodexUsage {
  readonly input_tokens?: number
  readonly cached_input_tokens?: number
  readonly output_tokens?: number
}

// List-price estimate for cost tracking only, at the run's model rate. Codex
// reports tokens, not dollars, and a ChatGPT-plan login isn't billed per token.
// OpenAI counts cached tokens inside input_tokens, billed at a discount.
export function estimateCodexCostUsd(usage: CodexUsage, model?: string): number {
  const rate = openaiRate(model)
  const input = usage.input_tokens ?? 0
  const cached = Math.min(usage.cached_input_tokens ?? 0, input)
  const output = usage.output_tokens ?? 0
  return ((input - cached) * rate.input + cached * rate.cachedInput + output * rate.output) / 1_000_000
}
