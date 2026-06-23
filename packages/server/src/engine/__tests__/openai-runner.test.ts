import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock the openai SDK before importing the runner. The mock client's
// responses.stream() yields whatever events the current test queued, records
// the request body, and can throw to simulate an aborted/failed stream.
// ---------------------------------------------------------------------------
const mockState = vi.hoisted(() => ({
  events: [] as Array<Record<string, unknown>>,
  throwError: null as Error | null,
  lastBody: null as Record<string, unknown> | null,
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
    responses = {
      stream: (body: Record<string, unknown>) => {
        mockState.lastBody = body
        return {
          async *[Symbol.asyncIterator]() {
            if (mockState.throwError) throw mockState.throwError
            for (const event of mockState.events) yield event
          },
        }
      },
    }
    constructor(_opts: unknown) {}
  }
  return { default: MockOpenAI, APIUserAbortError }
})

import { OpenAIRunner } from '../openai-runner'
import type { SpawnOptions } from '../spawner'

interface Settled {
  texts: string[]
  usage: { inputTokens: number; outputTokens: number; estimatedCostUsd: number } | undefined
  completed: boolean
  error: Error | undefined
  toolUses: number
  toolResults: number
}

function baseOptions(overrides: Partial<SpawnOptions> = {}): SpawnOptions {
  return {
    agentId: 'agent-1',
    sessionId: 'session-1',
    message: 'Find me something.',
    systemPrompt: 'You are a researcher.',
    provider: 'openai',
    providerConfig: { model: 'gpt-4o', webSearch: false, deepResearch: false },
    env: { OPENAI_API_KEY: 'sk-test-123' },
    ...overrides,
  }
}

function runAndWait(runner: OpenAIRunner, opts: SpawnOptions): Promise<Settled> {
  return new Promise<Settled>((resolve) => {
    const result: Settled = {
      texts: [],
      usage: undefined,
      completed: false,
      error: undefined,
      toolUses: 0,
      toolResults: 0,
    }
    runner.on('text', (d) => result.texts.push(d.content))
    runner.on('usage', (u) => {
      result.usage = u
    })
    runner.on('tool_use', () => {
      result.toolUses += 1
    })
    runner.on('tool_result', () => {
      result.toolResults += 1
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
  mockState.lastBody = null
})

describe('OpenAIRunner', () => {
  it('maps text deltas to partial text and emits usage + completion', async () => {
    mockState.events = [
      { type: 'response.output_text.delta', delta: 'Hello ' },
      { type: 'response.output_text.delta', delta: 'world' },
      {
        type: 'response.completed',
        response: { id: 'resp-1', usage: { input_tokens: 100, output_tokens: 50 } },
      },
    ]

    const result = await runAndWait(new OpenAIRunner(), baseOptions())

    expect(result.texts).toEqual(['Hello ', 'world'])
    expect(result.usage).toMatchObject({ inputTokens: 100, outputTokens: 50 })
    expect(result.usage!.estimatedCostUsd).toBeGreaterThan(0)
    expect(result.completed).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('maps web search lifecycle to tool_use / tool_result', async () => {
    mockState.events = [
      { type: 'response.web_search_call.in_progress', item_id: 'ws-1' },
      { type: 'response.web_search_call.completed', item_id: 'ws-1' },
      { type: 'response.completed', response: { id: 'resp-1' } },
    ]

    const result = await runAndWait(new OpenAIRunner(), baseOptions())

    expect(result.toolUses).toBeGreaterThanOrEqual(1)
    expect(result.toolResults).toBeGreaterThanOrEqual(1)
    expect(result.completed).toBe(true)
  })

  it('adds the web_search tool when webSearch is enabled', async () => {
    mockState.events = [{ type: 'response.completed', response: { id: 'resp-1' } }]

    await runAndWait(
      new OpenAIRunner(),
      baseOptions({ providerConfig: { model: 'gpt-4o', webSearch: true, deepResearch: false } }),
    )

    expect(mockState.lastBody?.['model']).toBe('gpt-4o')
    expect(mockState.lastBody?.['tools']).toEqual([{ type: 'web_search' }])
  })

  it('deep research forces a deep-research model and web_search_preview', async () => {
    mockState.events = [{ type: 'response.completed', response: { id: 'resp-1' } }]

    await runAndWait(
      new OpenAIRunner(),
      baseOptions({ providerConfig: { model: 'gpt-4o', webSearch: false, deepResearch: true } }),
    )

    expect(String(mockState.lastBody?.['model'])).toContain('deep-research')
    expect(mockState.lastBody?.['tools']).toEqual([{ type: 'web_search_preview' }])
  })

  it('emits an error when OPENAI_API_KEY is missing', async () => {
    const result = await runAndWait(new OpenAIRunner(), baseOptions({ env: {} }))

    expect(result.error).toBeDefined()
    expect(result.error!.message).toContain('OPENAI_API_KEY')
    expect(result.completed).toBe(false)
  })

  it('throws synchronously on an empty prompt', () => {
    const runner = new OpenAIRunner()
    expect(() => runner.spawn(baseOptions({ message: '   ' }))).toThrow(/prompt is empty/)
  })

  it('surfaces API stream errors via the error event', async () => {
    mockState.events = [
      { type: 'error', message: 'rate limit exceeded' },
    ]

    const result = await runAndWait(new OpenAIRunner(), baseOptions())

    expect(result.error).toBeDefined()
    expect(result.error!.message).toContain('rate limit exceeded')
    expect(result.completed).toBe(false)
  })

  it('stays silent when the stream is aborted by kill()', async () => {
    mockState.throwError = Object.assign(new Error('aborted'), { name: 'APIUserAbortError' })

    const runner = new OpenAIRunner()
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
