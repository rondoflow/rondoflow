import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { performHttpRequest, interpolate, type HttpRequestStepConfig } from '../http-request-runner'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const baseCfg: HttpRequestStepConfig = {
  name: 'H',
  method: 'GET',
  url: 'https://api.example.com/x',
  headers: [],
  queryParams: [],
  bodyMode: 'json',
  timeoutSec: 30,
  responseMode: 'body',
}

function mockResponse(
  body: string,
  init: { status?: number; statusText?: string; headers?: Record<string, string> } = {},
): Response {
  const status = init.status ?? 200
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init.statusText ?? 'OK',
    headers: new Headers(init.headers ?? {}),
    text: async () => body,
  } as unknown as Response
}

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
  vi.useRealTimers()
})

// ─── interpolate ───────────────────────────────────────────────────────────

describe('interpolate', () => {
  it('replaces {{input}} and {{output}} (case/space-insensitive)', () => {
    expect(interpolate('a {{input}} b {{ OUTPUT }} c', 'X')).toBe('a X b X c')
  })
  it('leaves text without tokens untouched', () => {
    expect(interpolate('no tokens here', 'X')).toBe('no tokens here')
  })
})

// ─── performHttpRequest ──────────────────────────────────────────────────────

describe('performHttpRequest', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => mockResponse('hello world')) as unknown as typeof fetch
  })

  it('returns the response body on a 2xx GET', async () => {
    const res = await performHttpRequest(baseCfg, '')
    expect(res.status).toBe(200)
    expect(res.output).toBe('hello world')
  })

  it('interpolates {{input}} into the URL and appends query params', async () => {
    const fetchMock = vi.fn(async (_url: string | URL, _init: RequestInit) => mockResponse('ok'))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    await performHttpRequest(
      { ...baseCfg, url: 'https://api.example.com/{{input}}', queryParams: [{ key: 'q', value: '{{input}}' }] },
      '42',
    )
    const calledUrl = String(fetchMock.mock.calls[0]![0])
    expect(calledUrl).toBe('https://api.example.com/42?q=42')
  })

  it('sets a JSON Content-Type for a POST body in json mode', async () => {
    const fetchMock = vi.fn(async (_url: string | URL, _init: RequestInit) => mockResponse('ok'))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    await performHttpRequest({ ...baseCfg, method: 'POST', body: '{"a":1}', bodyMode: 'json' }, '')
    const init = fetchMock.mock.calls[0]![1]
    expect((init.headers as Headers).get('content-type')).toBe('application/json')
    expect(init.body).toBe('{"a":1}')
  })

  it('sets a form Content-Type in form mode', async () => {
    const fetchMock = vi.fn(async (_url: string | URL, _init: RequestInit) => mockResponse('ok'))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    await performHttpRequest({ ...baseCfg, method: 'POST', body: 'a=1', bodyMode: 'form' }, '')
    const init = fetchMock.mock.calls[0]![1]
    expect((init.headers as Headers).get('content-type')).toBe('application/x-www-form-urlencoded')
  })

  it('does not send a body for GET', async () => {
    const fetchMock = vi.fn(async (_url: string | URL, _init: RequestInit) => mockResponse('ok'))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    await performHttpRequest({ ...baseCfg, method: 'GET', body: 'ignored' }, '')
    expect(fetchMock.mock.calls[0]![1].body).toBeUndefined()
  })

  it('throws on a non-2xx status', async () => {
    globalThis.fetch = vi.fn(async () => mockResponse('nope', { status: 404, statusText: 'Not Found' })) as unknown as typeof fetch
    await expect(performHttpRequest(baseCfg, '')).rejects.toThrow(/HTTP 404/)
  })

  it('throws on an unsupported protocol', async () => {
    await expect(performHttpRequest({ ...baseCfg, url: 'file:///etc/passwd' }, '')).rejects.toThrow(/protocol/)
  })

  it('throws on an invalid URL', async () => {
    await expect(performHttpRequest({ ...baseCfg, url: 'not a url' }, '')).rejects.toThrow(/Invalid URL/)
  })

  it('returns a status+headers+body envelope in full mode', async () => {
    globalThis.fetch = vi.fn(async () => mockResponse('payload', { headers: { 'x-test': '1' } })) as unknown as typeof fetch
    const res = await performHttpRequest({ ...baseCfg, responseMode: 'full' }, '')
    const env = JSON.parse(res.output)
    expect(env).toMatchObject({ status: 200, body: 'payload' })
    expect(env.headers['x-test']).toBe('1')
  })

  it('throws a timeout error when the request is aborted', async () => {
    vi.useFakeTimers()
    globalThis.fetch = vi.fn(
      (_url: unknown, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        }),
    ) as unknown as typeof fetch

    const promise = performHttpRequest({ ...baseCfg, timeoutSec: 1 }, '')
    const assertion = expect(promise).rejects.toThrow(/timed out/)
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
  })
})
