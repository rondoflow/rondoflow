// MCP (Model Context Protocol) server definitions shared between the UI and the
// server. A server is either a local `stdio` process (command/args/env) or a
// remote endpoint reached over `http`/`sse` (url + auth). Auth secrets never
// leave the server in plaintext — the API returns the redacted shape below.

export type McpTransport = 'stdio' | 'http' | 'sse'

export const MCP_TRANSPORTS: readonly McpTransport[] = ['stdio', 'http', 'sse']

/** `http`/`sse` servers are reached over the network via a URL + auth. */
export function isRemoteMcpTransport(type: McpTransport): type is 'http' | 'sse' {
  return type === 'http' || type === 'sse'
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export type McpAuthType = 'none' | 'bearer' | 'header' | 'oauth2_client_credentials'

export const MCP_AUTH_TYPES: readonly McpAuthType[] = [
  'none',
  'bearer',
  'header',
  'oauth2_client_credentials',
]

export interface McpAuthNone {
  readonly type: 'none'
}

/** Static bearer token → `Authorization: Bearer <token>`. */
export interface McpAuthBearer {
  readonly type: 'bearer'
  readonly token: string
}

/** Arbitrary single header, e.g. `X-API-Key: <value>`. */
export interface McpAuthHeader {
  readonly type: 'header'
  readonly headerName: string
  readonly headerValue: string
}

/**
 * OAuth2 client-credentials grant (machine-to-machine). The server exchanges
 * the client id/secret at `tokenUrl` for an access token at run time and injects
 * it as `Authorization: Bearer <accessToken>`. This is the only OAuth flow that
 * works for a headless, non-interactive spawned CLI — the interactive browser
 * flow cannot run there.
 */
export interface McpAuthOAuth2ClientCredentials {
  readonly type: 'oauth2_client_credentials'
  readonly tokenUrl: string
  readonly clientId: string
  readonly clientSecret: string
  readonly scope?: string
}

/** Full auth with secrets — used at rest (encrypted) and at run time. */
export type McpAuth = McpAuthNone | McpAuthBearer | McpAuthHeader | McpAuthOAuth2ClientCredentials

/**
 * Auth as returned to the client: secret values are stripped and replaced with
 * presence flags so the edit form can show "secret is set — leave blank to
 * keep" without ever shipping the secret to the browser.
 */
export interface McpAuthRedacted {
  readonly type: McpAuthType
  readonly headerName?: string
  readonly tokenUrl?: string
  readonly clientId?: string
  readonly scope?: string
  readonly tokenSet?: boolean
  readonly headerValueSet?: boolean
  readonly clientSecretSet?: boolean
}

/**
 * Writable secret-bearing auth used on create/update. On update, a blank/omitted
 * secret field means "keep the stored value".
 */
export interface McpAuthInput {
  readonly type: McpAuthType
  readonly token?: string
  readonly headerName?: string
  readonly headerValue?: string
  readonly tokenUrl?: string
  readonly clientId?: string
  readonly clientSecret?: string
  readonly scope?: string
}

// ---------------------------------------------------------------------------
// Server shapes
// ---------------------------------------------------------------------------

/** Persisted MCP server as returned by the API (auth secrets redacted). */
export interface McpServerData {
  readonly id: string
  readonly name: string
  readonly description?: string | null
  readonly type: McpTransport
  readonly command?: string | null
  readonly args: readonly string[]
  readonly env?: Readonly<Record<string, string>> | null
  readonly url?: string | null
  readonly auth?: McpAuthRedacted | null
  readonly createdAt?: string
}

/** Payload accepted by the create/update endpoints (carries raw secrets). */
export interface McpServerInput {
  readonly name: string
  readonly description?: string
  readonly type: McpTransport
  readonly command?: string
  readonly args?: readonly string[]
  readonly env?: Readonly<Record<string, string>>
  readonly url?: string
  readonly auth?: McpAuthInput
}
