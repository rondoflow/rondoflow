import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { performSakanaAiCompletion, type SakanaAiStepConfig } from '../sakana-ai-runner'

const baseCfg: SakanaAiStepConfig = {
  name: 'Sakana',
  apiUrl: 'https://api.sakana.ai/v1/chat/completions',
  model: 'sakana-chat',
  prompt: 'Summarize {{input}}',
  temperature: 0.7,
  maxTokens: 256,
  outputFormat: 'text',
}

function mockResponse(body: unknown, init: { status?: number; statusText?: string } = {}): Response {
  const status = init.status ?? 200
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init.statusText ?? 'OK',
    text: async () => JSON.stringify(body),
  } as unknown as Response
}

const realFetch = globalThis.fetch
const realKey = process.env.SAKANA_API_KEY

beforeEach(() => {
  process.env.SAKANA_API_KEY = 'test-key'
  globalThis.fetch = vi.fn(async () =>
    mockResponse({
      choices: [{ message: { content: 'hello world' } }],
    })) as unknown as typeof fetch
})

afterEach(() => {
  globalThis.fetch = realFetch
  process.env.SAKANA_API_KEY = realKey
})

describe('performSakanaAiCompletion', () => {
  it('interpolates input and returns completion text', async () => {
    const fetchMock = vi.fn(async (_url: string | URL, _init: RequestInit) => mockResponse({ choices: [{ message: { content: 'done' } }] }))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    const res = await performSakanaAiCompletion(baseCfg, 'this text')
    expect(res.output).toBe('done')
    const [, init] = fetchMock.mock.calls[0]!
    const payload = JSON.parse(String(init?.body))
    expect(payload.messages[0].content).toBe('Summarize this text')
  })

  it('returns full json when outputFormat is json', async () => {
    const res = await performSakanaAiCompletion({ ...baseCfg, outputFormat: 'json' }, 'x')
    const parsed = JSON.parse(res.output)
    expect(parsed.choices[0].message.content).toBe('hello world')
  })

  it('throws when API key is missing', async () => {
    process.env.SAKANA_API_KEY = ''
    await expect(performSakanaAiCompletion(baseCfg, 'x')).rejects.toThrow(/SAKANA_API_KEY/i)
  })

  it('throws on non-2xx responses', async () => {
    globalThis.fetch = vi.fn(async () => mockResponse({ error: 'boom' }, { status: 401, statusText: 'Unauthorized' })) as unknown as typeof fetch
    await expect(performSakanaAiCompletion(baseCfg, 'x')).rejects.toThrow(/HTTP 401/)
  })
})
