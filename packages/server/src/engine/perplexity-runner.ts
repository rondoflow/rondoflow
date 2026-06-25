// PerplexityRunner — runs an agent against Perplexity's Sonar API.
//
// Perplexity is OpenAI-compatible (chat completions) at PERPLEXITY_BASE_URL, so
// it reuses the official `openai` SDK with a different baseURL + key. Every
// Sonar model searches the web natively, so there is no web-search toggle —
// `deepResearch` switches to the dedicated deep-research model. Multi-turn chat
// is threaded through a message history (Perplexity has no response-id
// continuation). Lifecycle lives in StreamingApiRunner.

import OpenAI from 'openai'
import type { TokenUsage, ProviderConfig } from '@rondoflow/shared'
import {
  DEFAULT_PERPLEXITY_PROVIDER_CONFIG,
  PERPLEXITY_DEEP_RESEARCH_MODEL,
  PERPLEXITY_DEFAULT_MODEL,
  PERPLEXITY_BASE_URL,
  TIMEOUTS,
} from '@rondoflow/shared'
import type { SpawnOptions } from './spawner'
import { StreamingApiRunner } from './streaming-runner'

// Deep-research runs can take minutes; give them a wide client timeout.
const DEEP_RESEARCH_TIMEOUT_MS = TIMEOUTS.PERPLEXITY_DEEP_RESEARCH_MS
const DEFAULT_TIMEOUT_MS = TIMEOUTS.PERPLEXITY_DEFAULT_MS

// Coarse per-model pricing (USD per 1M tokens) for the `usage` estimate.
const PERPLEXITY_PRICING_PER_MTOK: Record<string, { input: number; output: number }> = {
  sonar: { input: 1, output: 1 },
  'sonar-pro': { input: 3, output: 15 },
  'sonar-reasoning': { input: 1, output: 5 },
  'sonar-reasoning-pro': { input: 2, output: 8 },
  'sonar-deep-research': { input: 2, output: 8 },
}
const FALLBACK_PRICING = { input: 1, output: 1 }

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class PerplexityRunner extends StreamingApiRunner {
  protected readonly apiKeyEnvVar = 'PERPLEXITY_API_KEY'
  protected readonly missingKeyMessage =
    'PERPLEXITY_API_KEY is not configured. Add it in Settings → Credentials (Perplexity access).'

  // Conversation history threaded across turns for multi-turn chat.
  private readonly history: ChatMessage[] = []

  protected async runStream(
    options: SpawnOptions,
    apiKey: string,
    message: string,
    signal: AbortSignal | undefined,
  ): Promise<void> {
    const cfg: ProviderConfig = options.providerConfig ?? DEFAULT_PERPLEXITY_PROVIDER_CONFIG
    const model = cfg.deepResearch
      ? cfg.deepResearchModel ?? PERPLEXITY_DEEP_RESEARCH_MODEL
      : cfg.model || PERPLEXITY_DEFAULT_MODEL

    // Seed the system prompt once, then append this turn's user message.
    if (this.history.length === 0) {
      const system = [options.systemPrompt, options.appendSystemPrompt].filter(Boolean).join('\n\n')
      if (system) this.history.push({ role: 'system', content: system })
    }
    this.history.push({ role: 'user', content: message })

    const client = new OpenAI({
      apiKey,
      baseURL: PERPLEXITY_BASE_URL,
      maxRetries: 1,
      timeout: cfg.deepResearch ? DEEP_RESEARCH_TIMEOUT_MS : DEFAULT_TIMEOUT_MS,
    })

    // Sonar models always search — surface that as a tool activity so the UI
    // renders search the same way it does for other providers.
    const searchId = `pplx-search-${this.history.length}`
    this.emit('tool_use', { toolName: 'web_search', input: {}, id: searchId })

    const stream = await client.chat.completions.create(
      {
        model,
        messages: this.history,
        stream: true,
        // Ask for a usage block on the terminal chunk (OpenAI-compatible).
        stream_options: { include_usage: true },
      },
      { signal },
    )

    let assistant = ''
    let usage: { prompt_tokens?: number; completion_tokens?: number } | undefined
    let citations: unknown

    for await (const chunk of stream as AsyncIterable<Record<string, unknown>>) {
      const choices = chunk['choices'] as Array<{ delta?: { content?: string } }> | undefined
      const delta = choices?.[0]?.delta?.content
      if (delta) {
        assistant += delta
        this.emit('text', { content: delta, partial: true })
      }
      if (chunk['usage']) usage = chunk['usage'] as typeof usage
      // Perplexity attaches the sources it searched as `citations` / `search_results`.
      if (chunk['citations']) citations = chunk['citations']
      else if (chunk['search_results']) citations = chunk['search_results']
    }

    this.history.push({ role: 'assistant', content: assistant })

    this.emit('tool_result', {
      toolName: 'web_search',
      output: citations ? { citations } : { status: 'completed' },
      toolUseId: searchId,
    })

    if (usage) {
      const inputTokens = usage.prompt_tokens ?? 0
      const outputTokens = usage.completion_tokens ?? 0
      this.emit('usage', {
        inputTokens,
        outputTokens,
        estimatedCostUsd: StreamingApiRunner.estimateCost(
          PERPLEXITY_PRICING_PER_MTOK,
          FALLBACK_PRICING,
          model,
          inputTokens,
          outputTokens,
        ),
      } satisfies TokenUsage)
    }
  }
}
