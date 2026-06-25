import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { performApifyActorRun, type ApifyActorStepConfig } from '../apify-actor-runner'

const baseCfg: ApifyActorStepConfig = {
  name: 'Apify',
  actorId: 'apify/web-scraper',
  input: '{"query": "{{input}}"}',
  timeoutSec: 60,
  maxItems: 10,
  outputFormat: 'text',
}

function mockResponse(body: unknown, init: { status?: number; statusText?: string } = {}): Response {
  const status = init.status ?? 200
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init.statusText ?? 'OK',
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response
}

const realFetch = globalThis.fetch
const realToken = process.env.APIFY_TOKEN

beforeEach(() => {
  process.env.APIFY_TOKEN = 'test-token'
  globalThis.fetch = vi.fn(async () => mockResponse([{ title: 'a' }, { title: 'b' }])) as unknown as typeof fetch
})

afterEach(() => {
  globalThis.fetch = realFetch
  process.env.APIFY_TOKEN = realToken
})

describe('performApifyActorRun', () => {
  it('interpolates input, calls the run-sync endpoint with ~ actor path, returns items', async () => {
    const fetchMock = vi.fn(async () => mockResponse([{ title: 'a' }, { title: 'b' }]))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const res = await performApifyActorRun(baseCfg, 'hello')
    expect(res.count).toBe(2)
    expect(res.output).toContain('1.')
    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toContain('/acts/apify~web-scraper/run-sync-get-dataset-items')
    expect(String(url)).toContain('maxItems=10')
    const payload = JSON.parse(String(init?.body))
    expect(payload.query).toBe('hello')
    expect((init?.headers as Record<string, string>).authorization).toBe('Bearer test-token')
  })

  it('returns the raw JSON array when outputFormat is json', async () => {
    const res = await performApifyActorRun({ ...baseCfg, outputFormat: 'json' }, 'x')
    const parsed = JSON.parse(res.output)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(2)
  })

  it('throws when APIFY_TOKEN is missing', async () => {
    process.env.APIFY_TOKEN = ''
    await expect(performApifyActorRun(baseCfg, 'x')).rejects.toThrow(/APIFY_TOKEN/i)
  })

  it('throws when the actor id is empty', async () => {
    await expect(performApifyActorRun({ ...baseCfg, actorId: '' }, 'x')).rejects.toThrow(/actor id/i)
  })

  it('throws when the input is not valid JSON', async () => {
    await expect(performApifyActorRun({ ...baseCfg, input: '{not json' }, 'x')).rejects.toThrow(/valid JSON/i)
  })

  it('throws on non-2xx responses', async () => {
    globalThis.fetch = vi.fn(async () => mockResponse({ error: 'boom' }, { status: 404, statusText: 'Not Found' })) as unknown as typeof fetch
    await expect(performApifyActorRun(baseCfg, 'x')).rejects.toThrow(/HTTP 404/)
  })
})
