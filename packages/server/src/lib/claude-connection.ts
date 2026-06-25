import { ANTHROPIC, TIMEOUTS, type ClaudeConnectionResult } from '@rondoflow/shared'
import { resolveClaudeAuth } from '../engine/spawner'

// Live connectivity + auth probe against the Claude API. Uses the GET
// /v1/models endpoint — a cheap, zero-token-cost request that exercises the
// exact credential the spawner forwards to the CLI (setup-token wins over an
// API key, via resolveClaudeAuth). A 200 proves the network is reachable and
// the credential authenticates; 401/403 pinpoint a bad credential.
//
// Auth shape per the Claude API (see the claude-api skill):
//   • API key            → `x-api-key: <key>`
//   • setup-token (OAuth) → `authorization: Bearer <token>` + `anthropic-beta: oauth-2025-04-20`
// Both also send `anthropic-version`.

const TIMEOUT_MS = TIMEOUTS.CLAUDE_CONNECTION_PROBE_MS

export async function testClaudeConnection(): Promise<ClaudeConnectionResult> {
  const auth = resolveClaudeAuth()
  const oauthToken = auth['CLAUDE_CODE_OAUTH_TOKEN']
  const apiKey = auth['ANTHROPIC_API_KEY']

  if (!oauthToken && !apiKey) {
    return {
      ok: false,
      method: null,
      reason: 'no_credential',
      message:
        'No Claude credential configured. Set ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN (Settings → Credentials).',
    }
  }

  const method = oauthToken ? 'setup-token' : 'api-key'
  const headers: Record<string, string> = { 'anthropic-version': ANTHROPIC.API_VERSION }
  if (oauthToken) {
    headers['authorization'] = `Bearer ${oauthToken}`
    headers['anthropic-beta'] = ANTHROPIC.OAUTH_BETA
  } else {
    headers['x-api-key'] = apiKey as string
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const startedAt = Date.now()

  try {
    const res = await fetch(ANTHROPIC.MODELS_URL, { method: 'GET', headers, signal: controller.signal })
    const latencyMs = Date.now() - startedAt

    if (res.ok) {
      let modelCount: number | undefined
      try {
        const body = (await res.json()) as { data?: unknown[] }
        modelCount = Array.isArray(body.data) ? body.data.length : undefined
      } catch {
        // A 200 is sufficient — a body that doesn't parse doesn't change success.
      }
      return {
        ok: true,
        method,
        latencyMs,
        status: res.status,
        modelCount,
        message: `Connected to the Claude API (${method}, ${latencyMs} ms).`,
      }
    }

    const detail = await readErrorMessage(res)
    if (res.status === 401) {
      return {
        ok: false,
        method,
        latencyMs,
        status: res.status,
        reason: 'auth',
        message: `Authentication failed (401) — the ${method} appears invalid or expired.${detail ? ` ${detail}` : ''}`,
      }
    }
    if (res.status === 403) {
      return {
        ok: false,
        method,
        latencyMs,
        status: res.status,
        reason: 'forbidden',
        message: `Permission denied (403) — the ${method} lacks access.${detail ? ` ${detail}` : ''}`,
      }
    }
    return {
      ok: false,
      method,
      latencyMs,
      status: res.status,
      reason: 'http',
      message: `Claude API returned HTTP ${res.status}.${detail ? ` ${detail}` : ''}`,
    }
  } catch (err) {
    const latencyMs = Date.now() - startedAt
    const aborted = err instanceof Error && err.name === 'AbortError'
    return {
      ok: false,
      method,
      latencyMs,
      reason: 'network',
      message: aborted
        ? `Could not reach the Claude API — request timed out after ${TIMEOUT_MS / 1000}s.`
        : `Could not reach the Claude API: ${err instanceof Error ? err.message : 'network error'}.`,
    }
  } finally {
    clearTimeout(timer)
  }
}

async function readErrorMessage(res: Response): Promise<string | null> {
  try {
    const body = (await res.json()) as { error?: { message?: string } }
    return body.error?.message ?? null
  } catch {
    return null
  }
}
