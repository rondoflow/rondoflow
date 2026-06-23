import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock the openai SDK. PerplexityRunner uses the OpenAI client pointed at the
// Perplexity base URL via chat.completions.create({ stream: true }).
// ---------------------------------------------------------------------------
const mockState = vi.hoisted(() => ({
  chunks: [] as Array<Record<string, unknown>>,
  throwError: null as Error | null,
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
    chat = {
      completions: {
        create: (body: Record<string, unknown>) => {
          mockState.lastBody = body
          return Promise.resolve({
            async *[Symbol.asyncIterator]() {
              if (mockState.throwError) throw mockState.throwError
              for (const chunk of mockState.chunks) yield chunk
            },
          })
        },
      },
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
    providerConfig: { model: 'sonar', webSearch: true, deepResearch: false },
    env: { PERPLEXITY_API_KEY: 'pplx-test-123' },
    ...overrides,
  }
}

function chunk(content?: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { choices: [{ delta: content !== undefined ? { content } : {} }], ...extra }
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
  mockState.chunks = []
  mockState.throwError = null
  mockState.lastBody = null
  mockState.lastClientOpts = null
})

describe('PerplexityRunner', () => {
  it('streams text deltas and emits usage + completion + search tool activity', async () => {
    mockState.chunks = [
      chunk('The '),
      chunk('answer.'),
      chunk(undefined, { usage: { prompt_tokens: 80, completion_tokens: 20 } }),
    ]

    const result = await runAndWait(new PerplexityRunner(), baseOptions())

    expect(result.texts).toEqual(['The ', 'answer.'])
    expect(result.usage).toMatchObject({ inputTokens: 80, outputTokens: 20 })
    expect(result.usage!.estimatedCostUsd).toBeGreaterThan(0)
    expect(result.toolUses).toBeGreaterThanOrEqual(1)
    expect(result.toolResults).toBeGreaterThanOrEqual(1)
    expect(result.completed).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('targets the Perplexity base URL with the selected sonar model', async () => {
    mockState.chunks = [chunk('hi')]

    await runAndWait(
      new PerplexityRunner(),
      baseOptions({ providerConfig: { model: 'sonar-pro', webSearch: true, deepResearch: false } }),
    )

    expect(mockState.lastClientOpts?.['baseURL']).toBe('https://api.perplexity.ai')
    expect(mockState.lastBody?.['model']).toBe('sonar-pro')
  })

  it('deep research uses the sonar-deep-research model', async () => {
    mockState.chunks = [chunk('report')]

    await runAndWait(
      new PerplexityRunner(),
      baseOptions({ providerConfig: { model: 'sonar', webSearch: true, deepResearch: true } }),
    )

    expect(mockState.lastBody?.['model']).toBe('sonar-deep-research')
  })

  it('surfaces citations in the search tool_result', async () => {
    mockState.chunks = [
      chunk('answer', { citations: ['https://example.com/a', 'https://example.com/b'] }),
    ]

    const result = await runAndWait(new PerplexityRunner(), baseOptions())

    expect(result.lastToolResult).toMatchObject({
      citations: ['https://example.com/a', 'https://example.com/b'],
    })
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
