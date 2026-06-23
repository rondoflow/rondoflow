// HttpRequestRunner — the execution path of an HTTP Request node. Interpolates
// `{{input}}`/`{{output}}` tokens (the upstream step's output) into the URL,
// query params, headers and body, issues the request with a timeout, and returns
// the response. A non-2xx status, network failure, or timeout REJECTS so the
// chain executor errors the node and skips its dependents (the node's
// "fail the step" contract). Mirrors structured-extractor.ts in shape.

/** One header / query-param row carried from the canvas node. */
export interface HttpKeyValue {
  readonly key: string
  readonly value: string
}

/** Config carried on an http-request ChainStep (from the canvas node). */
export interface HttpRequestStepConfig {
  readonly name: string
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly url: string
  readonly headers: readonly HttpKeyValue[]
  readonly queryParams: readonly HttpKeyValue[]
  readonly bodyMode: 'json' | 'form' | 'raw'
  readonly timeoutSec: number
  readonly responseMode: 'body' | 'full'
  readonly body?: string
}

export interface HttpRequestResult {
  readonly status: number
  /** What flows downstream: the response body, or a JSON envelope in 'full' mode. */
  readonly output: string
}

// Never buffer an unbounded response into memory / downstream context. Mirrors
// the 2 MB philosophy of MAX_DATASET_BYTES in chain-executor.
const MAX_RESPONSE_BYTES = 2_000_000
const DEFAULT_TIMEOUT_SEC = 30
const MAX_TIMEOUT_SEC = 300

/** Replace `{{input}}` / `{{output}}` tokens with the upstream output text. */
export function interpolate(template: string, input: string): string {
  return template.replace(/\{\{\s*(?:input|output)\s*\}\}/gi, input)
}

/** Default Content-Type for a body mode; 'raw' lets the user's headers decide. */
function defaultContentType(mode: HttpRequestStepConfig['bodyMode']): string | null {
  if (mode === 'json') return 'application/json'
  if (mode === 'form') return 'application/x-www-form-urlencoded'
  return null
}

/** Build the request URL (with interpolated, non-empty query params appended). */
function buildUrl(cfg: HttpRequestStepConfig, input: string): URL {
  const raw = interpolate(cfg.url, input).trim()
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new Error(`Invalid URL: "${raw || '(empty)'}"`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Unsupported URL protocol "${url.protocol}" — only http/https are allowed.`)
  }
  for (const { key, value } of cfg.queryParams ?? []) {
    if (key.trim()) url.searchParams.append(key, interpolate(value, input))
  }
  return url
}

/** Assemble headers from the configured rows, applying the body-mode default. */
function buildHeaders(cfg: HttpRequestStepConfig, input: string, hasBody: boolean): Headers {
  const headers = new Headers()
  for (const { key, value } of cfg.headers ?? []) {
    if (key.trim()) headers.set(key, interpolate(value, input))
  }
  const ct = defaultContentType(cfg.bodyMode)
  if (hasBody && ct && !headers.has('content-type')) headers.set('content-type', ct)
  return headers
}

/**
 * Perform the HTTP request described by `cfg`, interpolating `{{input}}` with the
 * combined upstream output. Resolves with the status + downstream output; rejects
 * on a non-2xx status, network error, or timeout.
 */
export async function performHttpRequest(
  cfg: HttpRequestStepConfig,
  input: string,
): Promise<HttpRequestResult> {
  const method = cfg.method ?? 'GET'
  const sendsBody = method !== 'GET' && method !== 'DELETE'
  const bodyText = sendsBody && cfg.body ? interpolate(cfg.body, input) : undefined

  const url = buildUrl(cfg, input)
  const headers = buildHeaders(cfg, input, bodyText !== undefined)

  const timeoutMs =
    Math.min(MAX_TIMEOUT_SEC, Math.max(1, cfg.timeoutSec || DEFAULT_TIMEOUT_SEC)) * 1000
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      ...(bodyText !== undefined ? { body: bodyText } : {}),
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`Request to ${url.href} timed out after ${timeoutMs / 1000}s.`)
    }
    throw new Error(`Request to ${url.href} failed: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    clearTimeout(timer)
  }

  const raw = await res.text()
  const body = raw.length > MAX_RESPONSE_BYTES ? raw.slice(0, MAX_RESPONSE_BYTES) : raw

  if (!res.ok) {
    const snippet = body.slice(0, 500)
    throw new Error(`HTTP ${res.status} ${res.statusText} from ${url.href}${snippet ? `: ${snippet}` : ''}`)
  }

  if (cfg.responseMode === 'full') {
    const responseHeaders: Record<string, string> = {}
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })
    return { status: res.status, output: JSON.stringify({ status: res.status, headers: responseHeaders, body }) }
  }
  return { status: res.status, output: body }
}
