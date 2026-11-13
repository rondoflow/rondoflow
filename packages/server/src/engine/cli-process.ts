// Shared plumbing for CLI-backed agent runners (Claude Code, Codex).
//
// Both runners spawn a local agent CLI as a child process with a minimal,
// allowlisted environment, stream JSONL from its stdout, and must be able to
// kill the whole process tree (the agent's own shell commands included). The
// pieces that are identical across CLIs live here so each runner only owns its
// argv, credential forwarding and event mapping.

import { spawn, type ChildProcess } from 'child_process'

// Spawn-time debug tracing. Off by default; set RONDOFLOW_DEBUG_SPAWN=1 (or
// =true) to log the full CLI lifecycle — resolved command + args, which
// credential was forwarded (masked), every stdout line and parsed event,
// stderr, and the exit code. This is the switch to flip when an agent
// "produces empty output": it makes the otherwise-silent failure path visible.
export const SPAWN_DEBUG =
  process.env['RONDOFLOW_DEBUG_SPAWN'] === '1' ||
  process.env['RONDOFLOW_DEBUG_SPAWN'] === 'true'

export function truncateForLog(value: string, max = 200): string {
  return value.length > max ? `${value.slice(0, max)}…(${value.length} chars)` : value
}

// Mask a credential for logs: keep a short identifying prefix (so e.g. an API
// key vs an OAuth setup-token is distinguishable) and hide the rest.
export function maskSecret(value: string): string {
  if (value.length <= 10) return `***(${value.length} chars)`
  return `${value.slice(0, 10)}…***(${value.length} chars)`
}

// Server secrets that must never reach a spawned child, even if a caller (e.g. a
// workspace "variable" resource) supplies them via the env extras. Compared
// case-insensitively.
export const BLOCKED_CHILD_ENV_KEYS: ReadonlySet<string> = new Set<string>([
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'RONDOFLOW_SECRET', // see resources/encryption.ts — derives the credential-encryption key
])

// The only process.env variables forwarded to a child by default [G20].
const BASE_CHILD_ENV_KEYS: readonly string[] = [
  'PATH',
  'HOME',
  'USERPROFILE',
  'LANG',
  'TERM',
  'APPDATA', // needed by npm/node on Windows
  'LOCALAPPDATA', // needed by npm/node on Windows
  'TEMP',
  'TMP',
  'SystemRoot', // needed on Windows for system tools
  'ComSpec', // cmd.exe path on Windows
]

/** The allowlisted subset of the server's own environment. */
export function baseChildEnv(): Record<string, string> {
  const env: Record<string, string> = {}
  for (const key of BASE_CHILD_ENV_KEYS) {
    const val = process.env[key]
    if (val !== undefined) env[key] = val
  }
  return env
}

/**
 * Caller-supplied env extras minus server secrets and `excludeKeys` (e.g. a
 * runner's own credential keys, which it forwards separately so precedence
 * can't be bypassed by an extra value). Keys compare case-insensitively.
 */
export function filterChildExtras(
  extra: Record<string, string>,
  excludeKeys: readonly string[] = [],
): Record<string, string> {
  const excluded = new Set(excludeKeys.map((k) => k.toUpperCase()))
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(extra)) {
    const upper = k.toUpperCase()
    if (BLOCKED_CHILD_ENV_KEYS.has(upper) || excluded.has(upper)) continue
    out[k] = v
  }
  return out
}

/**
 * [G13] Kill a spawned CLI and everything it started. On Unix the child must
 * have been spawned with `detached: true` so it leads its own process group;
 * a negative pid then signals the whole group. Windows uses `taskkill /T`.
 */
export function killProcessTree(child: ChildProcess): void {
  const pid = child.pid
  if (pid === undefined) {
    child.kill('SIGKILL')
    return
  }
  if (process.platform === 'win32') {
    // taskkill /T kills the entire process tree; /F forces it
    spawn('taskkill', ['/T', '/F', '/PID', String(pid)], { stdio: 'ignore' })
    return
  }
  try {
    process.kill(-pid, 'SIGKILL')
  } catch {
    // Fall back to killing the direct process if group kill fails
    child.kill('SIGKILL')
  }
}
