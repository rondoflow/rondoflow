import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock the openai SDK. PerplexityRunner posts to Perplexity's Agent API through
// the OpenAI client's generic post('/agent', { body, stream: true }).
// ---------------------------------------------------------------------------
const mockState = vi.hoisted(() => ({
  events: [] as Array<Record<string, unknown>>,
  throwError: null as Error | null,
  lastPath: null as string | null,
  lastBody: null as Record<string, unknown> | null,
  lastClientOpts: null as Record<string, unknown> | null,
}))

vi.mock('openai', () => {
  class APIUserAbortError extends Error {
    constructor(message?: string) {
      super(message)
      this.name = 'APIUserAbortError'
    }
  }
  class MockOpenAI {
    static APIUserAbortError = APIUserAbortError
    post(path: string, opts: { body: Record<string, unknown> }) {
      mockState.lastPath = path
      mockState.lastBody = opts.body
      return Promise.resolve({
        async *[Symbol.asyncIterator]() {
          if (mockState.throwError) throw mockState.throwError
          for (const event of mockState.events) yield event
        },
      })
    }
    constructor(opts: Record<string, unknown>) {
      mockState.lastClientOpts = opts
    }
  }
  return { default: MockOpenAI, APIUserAbortError }
})

import { PerplexityRunner } from '../perplexity-runner'
import type { SpawnOptions } from '../spawner'

interface Settled {
  texts: string[]
  usage: { inputTokens: number; outputTokens: number; estimatedCostUsd: number } | undefined
  completed: boolean
  error: Error | undefined
  toolUses: number
  toolResults: number
  lastToolResult: unknown
}

function baseOptions(overrides: Partial<SpawnOptions> = {}): SpawnOptions {
  return {
    agentId: 'agent-1',
    sessionId: 'session-1',
    message: 'What happened today?',
    systemPrompt: 'You are a researcher.',
    provider: 'perplexity',
    providerConfig: { model: 'fast', webSearch: true, deepResearch: false },
    env: { PERPLEXITY_API_KEY: 'pplx-test-123' },
    ...overrides,
  }
}

function delta(text: string): Record<string, unknown> {
  return { type: 'response.output_text.delta', delta: text }
}

function completed(usage: Record<string, unknown>): Record<string, unknown> {
  return { type: 'response.completed', response: { id: 'resp-1', usage } }
}

function runAndWait(runner: PerplexityRunner, opts: SpawnOptions): Promise<Settled> {
  return new Promise<Settled>((resolve) => {
    const result: Settled = {
      texts: [],
      usage: undefined,
      completed: false,
      error: undefined,
      toolUses: 0,
      toolResults: 0,
      lastToolResult: undefined,
    }
    runner.on('text', (d) => result.texts.push(d.content))
    runner.on('usage', (u) => {
      result.usage = u
    })
    runner.on('tool_use', () => {
      result.toolUses += 1
    })
    runner.on('tool_result', (t) => {
      result.toolResults += 1
      result.lastToolResult = t.output
    })
    runner.on('completion', () => {
      result.completed = true
      resolve(result)
    })
    runner.on('error', (e) => {
      result.error = e
      resolve(result)
    })
    runner.spawn(opts)
  })
}

beforeEach(() => {
  mockState.events = []
  mockState.throwError = null
  mockState.lastPath = null
  mockState.lastBody = null
  mockState.lastClientOpts = null
})

describe('PerplexityRunner', () => {
  it('streams text deltas and emits search tool activity, usage and completion', async () => {
    mockState.events = [
      { type: 'response.reasoning.search_queries', queries: ['news today'] },
      {
        type: 'response.reasoning.search_results',
        results: [{ id: 1, title: 'A', url: 'https://example.com/a', snippet: 'long text' }],
      },
      delta('The '),
      delta('answer.'),
      completed({ input_tokens: 80, output_tokens: 20, cost: { total_cost: 0.0042 } }),
    ]

    const result = await runAndWait(new PerplexityRunner(), baseOptions())

    expect(result.texts).toEqual(['The ', 'answer.'])
    expect(result.toolUses).toBe(1)
    expect(result.toolResults).toBe(1)
    expect(result.lastToolResult).toEqual({ results: [{ title: 'A', url: 'https://example.com/a' }] })
    // The API's own cost (includes tool calls) wins over the token estimate.
    expect(result.usage).toEqual({ inputTokens: 80, outputTokens: 20, estimatedCostUsd: 0.0042 })
    expect(result.completed).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('estimates cost from tokens when the response has no cost block', async () => {
    mockState.events = [delta('hi'), completed({ input_tokens: 1_000_000, output_tokens: 1_000_000 })]

    const result = await runAndWait(new PerplexityRunner(), baseOptions())

    expect(result.usage!.estimatedCostUsd).toBeCloseTo(0.6, 10) // fast → gpt-6-luna: 0.1 + 0.5
  })

  it('posts to the Agent API with the effort level, instructions and transcript', async () => {
    mockState.events = [delta('hi')]

    await runAndWait(
      new PerplexityRunner(),
      baseOptions({ providerConfig: { model: 'medium', webSearch: true, deepResearch: false } }),
    )

    expect(mockState.lastClientOpts?.['baseURL']).toBe('https://api.perplexity.ai/v1')
    expect(mockState.lastPath).toBe('/agent')
    expect(mockState.lastBody).toMatchObject({
      effort: 'medium',
      instructions: 'You are a researcher.',
      input: [{ type: 'message', role: 'user', content: 'What happened today?' }],
      stream: true,
    })
    expect(mockState.lastBody).not.toHaveProperty('model')
  })

  it('maps a legacy Sonar model id to its effort level', async () => {
    mockState.events = [delta('hi')]

    await runAndWait(
      new PerplexityRunner(),
      baseOptions({ providerConfig: { model: 'sonar-reasoning-pro', webSearch: true, deepResearch: false } }),
    )

    expect(mockState.lastBody?.['effort']).toBe('low')
  })

  it('deep research uses the high effort level', async () => {
    mockState.events = [delta('report')]

    await runAndWait(
      new PerplexityRunner(),
      baseOptions({ providerConfig: { model: 'fast', webSearch: true, deepResearch: true } }),
    )

    expect(mockState.lastBody?.['effort']).toBe('high')
  })

  it('reports a failed response as an error', async () => {
    mockState.events = [delta('par'), { type: 'response.failed', error: { message: 'quota exceeded' } }]

    const result = await runAndWait(new PerplexityRunner(), baseOptions())

    expect(result.error?.message).toContain('quota exceeded')
    expect(result.completed).toBe(false)
  })

  it('emits an error when PERPLEXITY_API_KEY is missing', async () => {
    const result = await runAndWait(new PerplexityRunner(), baseOptions({ env: {} }))

    expect(result.error).toBeDefined()
    expect(result.error!.message).toContain('PERPLEXITY_API_KEY')
    expect(result.completed).toBe(false)
  })

  it('throws synchronously on an empty prompt', () => {
    const runner = new PerplexityRunner()
    expect(() => runner.spawn(baseOptions({ message: '   ' }))).toThrow(/prompt is empty/)
  })

  it('stays silent when the stream is aborted by kill()', async () => {
    mockState.throwError = Object.assign(new Error('aborted'), { name: 'APIUserAbortError' })

    const runner = new PerplexityRunner()
    const onError = vi.fn()
    const onCompletion = vi.fn()
    runner.on('error', onError)
    runner.on('completion', onCompletion)
    runner.spawn(baseOptions())

    await new Promise((r) => setTimeout(r, 20))

    expect(onError).not.toHaveBeenCalled()
    expect(onCompletion).not.toHaveBeenCalled()
    expect(runner.isRunning).toBe(false)
  })
})
