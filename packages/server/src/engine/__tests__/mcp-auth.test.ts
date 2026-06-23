import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'

// Encryption derives its key from BETTER_AUTH_SECRET — set one before any
// encrypt/decrypt call (getKey reads process.env lazily).
beforeAll(() => {
  process.env['BETTER_AUTH_SECRET'] =
    process.env['BETTER_AUTH_SECRET'] ?? 'test-secret-for-mcp-auth-spec-0123456789'
})

import {
  buildStoredAuth,
  decryptStoredAuth,
  redactStoredAuth,
  resolveAuthHeaders,
  parseStoredAuth,
  __clearTokenCache,
  type StoredMcpAuth,
} from '../mcp-auth'
import { ValidationError } from '../../lib/errors'

describe('buildStoredAuth', () => {
  it('returns null for none / undefined', () => {
    expect(buildStoredAuth(undefined, null)).toBeNull()
    expect(buildStoredAuth({ type: 'none' }, null)).toBeNull()
  })

  it('encrypts a bearer token (ciphertext != plaintext, round-trips)', () => {
    const stored = buildStoredAuth({ type: 'bearer', token: 'secret-token' }, null)
    expect(stored?.type).toBe('bearer')
    expect(stored?.type === 'bearer' && stored.token).not.toBe('secret-token')
    expect(decryptStoredAuth(stored)).toEqual({ type: 'bearer', token: 'secret-token' })
  })

  it('encrypts a custom header value, keeps the header name', () => {
    const stored = buildStoredAuth(
      { type: 'header', headerName: 'X-API-Key', headerValue: 'k123' },
      null,
    )
    expect(stored?.type === 'header' && stored.headerName).toBe('X-API-Key')
    expect(stored?.type === 'header' && stored.headerValue).not.toBe('k123')
    expect(decryptStoredAuth(stored)).toEqual({
      type: 'header',
      headerName: 'X-API-Key',
      headerValue: 'k123',
    })
  })

  it('encrypts the oauth2 client secret, keeps tokenUrl/clientId/scope', () => {
    const stored = buildStoredAuth(
      {
        type: 'oauth2_client_credentials',
        tokenUrl: 'https://idp.example.com/token',
        clientId: 'cid',
        clientSecret: 'csecret',
        scope: 'read write',
      },
      null,
    )
    expect(stored?.type).toBe('oauth2_client_credentials')
    expect(stored?.type === 'oauth2_client_credentials' && stored.clientSecret).not.toBe('csecret')
    expect(decryptStoredAuth(stored)).toEqual({
      type: 'oauth2_client_credentials',
      tokenUrl: 'https://idp.example.com/token',
      clientId: 'cid',
      clientSecret: 'csecret',
      scope: 'read write',
    })
  })

  it('preserves the existing secret when the new secret is blank (edit)', () => {
    const existing = buildStoredAuth({ type: 'bearer', token: 'keep-me' }, null)
    const updated = buildStoredAuth({ type: 'bearer', token: '' }, existing)
    expect(updated).toEqual(existing)
    expect(decryptStoredAuth(updated)).toEqual({ type: 'bearer', token: 'keep-me' })
  })

  it('throws ValidationError when a required secret is missing on create', () => {
    expect(() => buildStoredAuth({ type: 'bearer', token: '' }, null)).toThrow(ValidationError)
    expect(() =>
      buildStoredAuth(
        { type: 'oauth2_client_credentials', tokenUrl: 'https://x/t', clientId: 'c' },
        null,
      ),
    ).toThrow(ValidationError)
    expect(() =>
      buildStoredAuth({ type: 'header', headerName: '', headerValue: 'v' }, null),
    ).toThrow(ValidationError)
  })
})

describe('redactStoredAuth', () => {
  it('strips secrets and sets presence flags', () => {
    const bearer = buildStoredAuth({ type: 'bearer', token: 't' }, null)
    expect(redactStoredAuth(bearer)).toEqual({ type: 'bearer', tokenSet: true })

    const oauth = buildStoredAuth(
      {
        type: 'oauth2_client_credentials',
        tokenUrl: 'https://idp/t',
        clientId: 'cid',
        clientSecret: 'SUPERSECRET',
        scope: 'a',
      },
      null,
    )
    const redacted = redactStoredAuth(oauth)
    expect(redacted).toEqual({
      type: 'oauth2_client_credentials',
      tokenUrl: 'https://idp/t',
      clientId: 'cid',
      scope: 'a',
      clientSecretSet: true,
    })
    // No secret leaks through (neither plaintext nor ciphertext)
    expect(JSON.stringify(redacted)).not.toContain('SUPERSECRET')
    expect(JSON.stringify(redacted)).not.toContain(
      oauth?.type === 'oauth2_client_credentials' ? oauth.clientSecret : '',
    )
  })

  it('returns null for null/none', () => {
    expect(redactStoredAuth(null)).toBeNull()
  })
})

describe('parseStoredAuth', () => {
  it('maps none / junk to null and keeps valid shapes', () => {
    expect(parseStoredAuth(null)).toBeNull()
    expect(parseStoredAuth({ type: 'none' })).toBeNull()
    expect(parseStoredAuth({ nope: true })).toBeNull()
    expect(parseStoredAuth('garbage')).toBeNull()
    expect(parseStoredAuth({ type: 'bearer', token: 'x' })).toEqual({ type: 'bearer', token: 'x' })
  })
})

describe('resolveAuthHeaders', () => {
  beforeEach(() => __clearTokenCache())
  afterEach(() => vi.unstubAllGlobals())

  it('handles none / bearer / header', async () => {
    expect(await resolveAuthHeaders(null)).toEqual({})
    expect(await resolveAuthHeaders({ type: 'bearer', token: 'abc' })).toEqual({
      Authorization: 'Bearer abc',
    })
    expect(
      await resolveAuthHeaders({ type: 'header', headerName: 'X-Key', headerValue: 'v' }),
    ).toEqual({ 'X-Key': 'v' })
  })

  it('exchanges oauth2 client-credentials for a bearer token and caches it', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'AT-123', expires_in: 3600 }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const auth = {
      type: 'oauth2_client_credentials' as const,
      tokenUrl: 'https://idp.example.com/token',
      clientId: 'cid',
      clientSecret: 'csecret',
      scope: 'read',
    }

    expect(await resolveAuthHeaders(auth)).toEqual({ Authorization: 'Bearer AT-123' })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Verify the request shape: POST, basic auth, form-encoded grant
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://idp.example.com/token')
    expect(init.method).toBe('POST')
    const headers = init.headers as Record<string, string>
    expect(headers['Authorization']).toBe(`Basic ${Buffer.from('cid:csecret').toString('base64')}`)
    expect(String(init.body)).toContain('grant_type=client_credentials')
    expect(String(init.body)).toContain('scope=read')

    // Second call is served from cache — no extra fetch
    expect(await resolveAuthHeaders(auth)).toEqual({ Authorization: 'Bearer AT-123' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('re-fetches a token when the client secret is rotated', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'AT', expires_in: 3600 }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const base = {
      type: 'oauth2_client_credentials' as const,
      tokenUrl: 'https://idp.example.com/token',
      clientId: 'cid',
      scope: 'read',
    }
    await resolveAuthHeaders({ ...base, clientSecret: 'old' })
    await resolveAuthHeaders({ ...base, clientSecret: 'old' }) // cached
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await resolveAuthHeaders({ ...base, clientSecret: 'new' }) // rotated → refetch
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws when the oauth2 token endpoint fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => 'denied' }),
    )
    await expect(
      resolveAuthHeaders({
        type: 'oauth2_client_credentials',
        tokenUrl: 'https://idp.example.com/token',
        clientId: 'cid',
        clientSecret: 'csecret',
      }),
    ).rejects.toThrow(/401/)
  })
})

// Type-only export is exercised so unused-import lint stays quiet.
const _typecheck: StoredMcpAuth | null = null
void _typecheck
