// Auth handling for remote (http/sse) MCP servers.
//
// Secrets (bearer token, custom-header value, OAuth2 client secret) are stored
// AES-GCM-encrypted at rest and never returned to the client in plaintext — the
// API surfaces the `McpAuthRedacted` shape (presence flags only). At run time
// `resolveAuthHeaders` turns a decrypted auth config into the request headers
// the Claude Code CLI forwards to the server; OAuth2 performs a cached
// client-credentials token exchange.

import { createHash } from 'crypto'
import { encrypt, decrypt } from '../resources/encryption'
import { ValidationError } from '../lib/errors'
import type {
  McpAuth,
  McpAuthInput,
  McpAuthRedacted,
  McpAuthOAuth2ClientCredentials,
} from '@rondoflow/shared'

/**
 * Auth as stored in the DB: structurally identical to `McpAuth` but every secret
 * field (token / headerValue / clientSecret) holds ciphertext, not plaintext.
 */
export type StoredMcpAuth = McpAuth

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

// ---------------------------------------------------------------------------
// Persistence: parse / build / decrypt / redact
// ---------------------------------------------------------------------------

/** Narrow an opaque JSON value (Prisma `Json`) to a stored auth, or null. */
export function parseStoredAuth(raw: unknown): StoredMcpAuth | null {
  if (!raw || typeof raw !== 'object') return null
  const type = (raw as { type?: unknown }).type
  if (
    type === 'none' ||
    type === 'bearer' ||
    type === 'header' ||
    type === 'oauth2_client_credentials'
  ) {
    return type === 'none' ? null : (raw as StoredMcpAuth)
  }
  return null
}

/**
 * Turn a writable auth payload into the encrypted shape to persist, applying
 * "a blank secret means keep the existing one" against `existing` (the
 * previously stored, still-encrypted auth). Throws `ValidationError` when a
 * required field is missing with nothing to preserve.
 */
export function buildStoredAuth(
  input: McpAuthInput | undefined | null,
  existing: StoredMcpAuth | null,
): StoredMcpAuth | null {
  if (!input || input.type === 'none') return null

  const prior = existing && existing.type === input.type ? existing : null

  switch (input.type) {
    case 'bearer': {
      const token = str(input.token)
      const stored = token ? encrypt(token) : prior?.type === 'bearer' ? prior.token : ''
      if (!stored) throw new ValidationError('Bearer token is required')
      return { type: 'bearer', token: stored }
    }
    case 'header': {
      const headerName = str(input.headerName)
      if (!headerName) throw new ValidationError('Header name is required')
      const value = str(input.headerValue)
      const stored = value ? encrypt(value) : prior?.type === 'header' ? prior.headerValue : ''
      if (!stored) throw new ValidationError('Header value is required')
      return { type: 'header', headerName, headerValue: stored }
    }
    case 'oauth2_client_credentials': {
      const tokenUrl = str(input.tokenUrl)
      const clientId = str(input.clientId)
      if (!tokenUrl) throw new ValidationError('OAuth2 token URL is required')
      if (!clientId) throw new ValidationError('OAuth2 client ID is required')
      const secret = str(input.clientSecret)
      const stored = secret
        ? encrypt(secret)
        : prior?.type === 'oauth2_client_credentials'
          ? prior.clientSecret
          : ''
      if (!stored) throw new ValidationError('OAuth2 client secret is required')
      const scope = str(input.scope)
      return {
        type: 'oauth2_client_credentials',
        tokenUrl,
        clientId,
        clientSecret: stored,
        ...(scope ? { scope } : {}),
      }
    }
  }
}

/** Decrypt secret fields for run-time use. */
export function decryptStoredAuth(stored: StoredMcpAuth | null): McpAuth | null {
  if (!stored) return null
  switch (stored.type) {
    case 'none':
      return null
    case 'bearer':
      return { type: 'bearer', token: decrypt(stored.token) }
    case 'header':
      return {
        type: 'header',
        headerName: stored.headerName,
        headerValue: decrypt(stored.headerValue),
      }
    case 'oauth2_client_credentials':
      return { ...stored, clientSecret: decrypt(stored.clientSecret) }
  }
}

/** Strip secrets, keeping only non-secret fields + presence flags for the UI. */
export function redactStoredAuth(stored: StoredMcpAuth | null): McpAuthRedacted | null {
  if (!stored) return null
  switch (stored.type) {
    case 'none':
      return null
    case 'bearer':
      return { type: 'bearer', tokenSet: true }
    case 'header':
      return { type: 'header', headerName: stored.headerName, headerValueSet: true }
    case 'oauth2_client_credentials':
      return {
        type: 'oauth2_client_credentials',
        tokenUrl: stored.tokenUrl,
        clientId: stored.clientId,
        ...(stored.scope ? { scope: stored.scope } : {}),
        clientSecretSet: true,
      }
  }
}

// ---------------------------------------------------------------------------
// Run time: resolve request headers
// ---------------------------------------------------------------------------

/** Build the HTTP headers a decrypted auth config produces for a remote server. */
export async function resolveAuthHeaders(auth: McpAuth | null): Promise<Record<string, string>> {
  if (!auth) return {}
  switch (auth.type) {
    case 'none':
      return {}
    case 'bearer':
      return { Authorization: `Bearer ${auth.token}` }
    case 'header':
      return { [auth.headerName]: auth.headerValue }
    case 'oauth2_client_credentials':
      return { Authorization: `Bearer ${await fetchClientCredentialsToken(auth)}` }
  }
}

// ---------------------------------------------------------------------------
// OAuth2 client-credentials token exchange (cached per process)
// ---------------------------------------------------------------------------

interface CachedToken {
  readonly accessToken: string
  readonly expiresAt: number
}

const tokenCache = new Map<string, CachedToken>()

async function fetchClientCredentialsToken(auth: McpAuthOAuth2ClientCredentials): Promise<string> {
  // Include a digest of the secret so rotating the client secret invalidates the
  // cached token immediately instead of waiting for it to expire.
  const secretHash = createHash('sha256').update(auth.clientSecret).digest('hex').slice(0, 16)
  const key = `${auth.tokenUrl}::${auth.clientId}::${auth.scope ?? ''}::${secretHash}`
  const now = Date.now()
  const cached = tokenCache.get(key)
  // Refresh 60s before expiry to avoid using a token that dies mid-request.
  if (cached && cached.expiresAt > now + 60_000) return cached.accessToken

  const body = new URLSearchParams({ grant_type: 'client_credentials' })
  if (auth.scope) body.set('scope', auth.scope)
  const basic = Buffer.from(`${auth.clientId}:${auth.clientSecret}`).toString('base64')

  const res = await fetch(auth.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: `Basic ${basic}`,
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(
      `OAuth2 token request to ${auth.tokenUrl} failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`,
    )
  }

  const json = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) throw new Error('OAuth2 token response missing access_token')

  const ttlSec = typeof json.expires_in === 'number' && json.expires_in > 0 ? json.expires_in : 3600
  tokenCache.set(key, { accessToken: json.access_token, expiresAt: now + ttlSec * 1000 })
  return json.access_token
}

/** Test seam — clears the in-process OAuth2 token cache. */
export function __clearTokenCache(): void {
  tokenCache.clear()
}
