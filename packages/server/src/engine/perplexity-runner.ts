// PerplexityRunner — runs an agent on Perplexity's Agent API (POST /v1/agent).
//
// Perplexity ended Sonar Chat Completions support on Sep 27, 2026; the Agent
// API replaces it. A request names an `effort` level (fast / low / medium /
// high, …) that picks the underlying model, step budget and tools, and every
// level searches the web. The agent's providerConfig.model holds the effort
// level (legacy Sonar model ids are mapped by perplexityEffort), and
// `deepResearch` switches to the `high` level.
//
// The API is Responses-style (SSE `response.*` events). It is called through
// the openai SDK's generic post() so Perplexity's own events (search queries /
// results) reach us unparsed. Multi-turn chat replays the transcript as input
// items. Lifecycle lives in StreamingApiRunner.

import OpenAI from 'openai'
import type { TokenUsage, ProviderConfig } from '@rondoflow/shared'
import {
  DEFAULT_PERPLEXITY_PROVIDER_CONFIG,
  PERPLEXITY_DEEP_RESEARCH_MODEL,
  PERPLEXITY_BASE_URL,
  TIMEOUTS,
  perplexityEffort,
} from '@rondoflow/shared'
import type { SpawnOptions } from './spawner'
import { StreamingApiRunner } from './streaming-runner'

// Deep-research runs can take minutes; give them a wide client timeout.
const DEEP_RESEARCH_TIMEOUT_MS = TIMEOUTS.PERPLEXITY_DEEP_RESEARCH_MS
const DEFAULT_TIMEOUT_MS = TIMEOUTS.PERPLEXITY_DEFAULT_MS

// Fallback cost estimate (USD per 1M tokens) at each level's underlying model,
// used only when the response carries no `usage.cost` (which also counts tool
// calls and is preferred).
const EFFORT_PRICING_PER_MTOK: Record<string, { input: number; output: number }> = {
  fast: { input: 0.1, output: 0.5 }, // openai/gpt-6-luna
  low: { input: 0.1, output: 0.5 }, // openai/gpt-6-luna
  medium: { input: 0.1, output: 0.5 }, // openai/gpt-6-luna
  high: { input: 1, output: 5 }, // openai/gpt-6.1-terra
}
const FALLBACK_PRICING = { input: 1, output: 5 }

// Search results forwarded in a tool_result are trimmed to these fields.
const MAX_FORWARDED_RESULTS = 20

interface InputMessage {
  readonly type: 'message'
  readonly role: 'user' | 'assistant'
  readonly content: string
}

interface AgentUsage {
  readonly input_tokens?: number
  readonly output_tokens?: number
  readonly cost?: { readonly total_cost?: number }
}

type AgentEvent = { readonly type: string; readonly [key: string]: unknown }

// Perplexity's reasoning events that announce a tool step, and their results.
const TOOL_EVENTS: Readonly<Record<string, { toolName: string; phase: 'use' | 'result' }>> = {
  'response.reasoning.search_queries': { toolName: 'web_search', phase: 'use' },
  'response.reasoning.search_results': { toolName: 'web_search', phase: 'result' },
  'response.reasoning.fetch_url_queries': { toolName: 'fetch_url', phase: 'use' },
  'response.reasoning.fetch_url_results': { toolName: 'fetch_url', phase: 'result' },
}

export class PerplexityRunner extends StreamingApiRunner {
  protected readonly apiKeyEnvVar = 'PERPLEXITY_API_KEY'
  protected readonly missingKeyMessage =
    'PERPLEXITY_API_KEY is not configured. Add it in Settings → Credentials (Perplexity access).'

  // Conversation transcript replayed on each turn for multi-turn chat.
  private readonly history: InputMessage[] = []
  private toolSeq = 0

  protected async runStream(
    options: SpawnOptions,
    apiKey: string,
    message: string,
    signal: AbortSignal | undefined,
  ): Promise<void> {
    const cfg: ProviderConfig = options.providerConfig ?? DEFAULT_PERPLEXITY_PROVIDER_CONFIG
    const effort = cfg.deepResearch
      ? perplexityEffort(cfg.deepResearchModel ?? PERPLEXITY_DEEP_RESEARCH_MODEL)
      : perplexityEffort(cfg.model)
    const instructions = [options.systemPrompt, options.appendSystemPrompt].filter(Boolean).join('\n\n')

    this.history.push({ type: 'message', role: 'user', content: message })

    const client = new OpenAI({
      apiKey,
      baseURL: `${PERPLEXITY_BASE_URL}/v1`,
      maxRetries: 1,
      timeout: cfg.deepResearch ? DEEP_RESEARCH_TIMEOUT_MS : DEFAULT_TIMEOUT_MS,
    })

    const stream = await client.post<AsyncIterable<AgentEvent>>('/agent', {
      body: {
        effort,
        ...(instructions ? { instructions } : {}),
        input: [...this.history],
        stream: true,
      },
      stream: true,
      signal,
    })

    let assistant = ''
    let usage: AgentUsage | undefined
    const pendingTools: Array<{ id: string; toolName: string }> = []

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        const delta = String(event['delta'] ?? '')
        if (delta) {
          assistant += delta
          this.emit('text', { content: delta, partial: true })
        }
      } else if (event.type in TOOL_EVENTS) {
        this.onToolEvent(event, pendingTools)
      } else if (event.type === 'response.completed') {
        usage = (event['response'] as { usage?: AgentUsage } | undefined)?.usage
      } else if (event.type === 'response.failed' || event.type === 'error') {
        const error = event['error'] as { message?: string } | undefined
        throw new Error(`Perplexity run failed: ${error?.message ?? 'no error message'}`)
      }
    }

    // Close any tool step whose results never arrived.
    for (const tool of pendingTools) {
      this.emit('tool_result', { toolName: tool.toolName, output: { status: 'completed' }, toolUseId: tool.id })
    }

    this.history.push({ type: 'message', role: 'assistant', content: assistant })
    if (usage) this.emitUsage(effort, usage)
  }

  private onToolEvent(event: AgentEvent, pending: Array<{ id: string; toolName: string }>): void {
    const { toolName, phase } = TOOL_EVENTS[event.type]!
    if (phase === 'use') {
      const id = `pplx-${toolName}-${++this.toolSeq}`
      pending.push({ id, toolName })
      const input = toolName === 'web_search' ? { queries: event['queries'] } : { urls: event['urls'] }
      this.emit('tool_use', { toolName, input, id })
      return
    }
    const index = pending.findIndex((t) => t.toolName === toolName)
    const tool = index >= 0 ? pending.splice(index, 1)[0]! : { id: `pplx-${toolName}-${++this.toolSeq}`, toolName }
    this.emit('tool_result', { toolName, output: summarizeResults(event), toolUseId: tool.id })
  }

  private emitUsage(effort: string, usage: AgentUsage): void {
    const inputTokens = usage.input_tokens ?? 0
    const outputTokens = usage.output_tokens ?? 0
    const reportedCost = usage.cost?.total_cost
    this.emit('usage', {
      inputTokens,
      outputTokens,
      estimatedCostUsd:
        typeof reportedCost === 'number'
          ? reportedCost
          : StreamingApiRunner.estimateCost(
              EFFORT_PRICING_PER_MTOK,
              FALLBACK_PRICING,
              effort.split('@')[0] ?? effort,
              inputTokens,
              outputTokens,
            ),
    } satisfies TokenUsage)
  }
}

// Keep a tool_result small: titles + URLs of the sources, not their full text.
function summarizeResults(event: AgentEvent): unknown {
  const results = event['results'] ?? event['contents']
  if (!Array.isArray(results)) return { status: 'completed' }
  return {
    results: results.slice(0, MAX_FORWARDED_RESULTS).map((r: Record<string, unknown>) => ({
      ...(r['title'] !== undefined ? { title: r['title'] } : {}),
      ...(r['url'] !== undefined ? { url: r['url'] } : {}),
    })),
  }
}
