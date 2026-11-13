// OpenAIRunner — runs an agent against the OpenAI Responses API.
//
// Maps the Responses streaming events onto the spawner event contract so the
// chain executor and process manager drive it identically. Tools are driven by
// the agent's providerConfig: `webSearch` adds the web_search tool;
// `deepResearch` switches to a deep-research model (a frontier GPT-6 model —
// OpenAI retired its dedicated deep-research models) with web search forced on
// and high reasoning effort.
// Lifecycle (key resolution, abort, completion) lives in StreamingApiRunner.

import OpenAI from 'openai'
import type { TokenUsage, ProviderConfig } from '@rondoflow/shared'
import {
  DEFAULT_OPENAI_PROVIDER_CONFIG,
  DEFAULT_OPENAI_DEEP_RESEARCH_MODEL,
  RETIRED_OPENAI_DEEP_RESEARCH_MODELS,
} from '@rondoflow/shared'
import type { SpawnOptions } from './spawner'
import { StreamingApiRunner } from './streaming-runner'
import { OPENAI_FALLBACK_RATE, OPENAI_PRICING_PER_MTOK } from './pricing'

// Deep-research runs are agentic and can take many minutes; give them a wide
// client timeout. Regular chat completes far sooner but we keep a generous cap.
const DEEP_RESEARCH_TIMEOUT_MS = 30 * 60_000
const DEFAULT_TIMEOUT_MS = 10 * 60_000


export class OpenAIRunner extends StreamingApiRunner {
  protected readonly apiKeyEnvVar = 'OPENAI_API_KEY'
  protected readonly missingKeyMessage =
    'OPENAI_API_KEY is not configured. Add it in Settings → Credentials (OpenAI access).'

  // Threaded across turns so sendMessage() continues the same conversation.
  private lastResponseId: string | null = null

  private resolveModelAndTools(cfg: ProviderConfig): {
    model: string
    tools: Array<{ type: string }>
  } {
    if (cfg.deepResearch) {
      // A stored override naming a retired deep-research model would 404.
      const override =
        cfg.deepResearchModel && !RETIRED_OPENAI_DEEP_RESEARCH_MODELS.includes(cfg.deepResearchModel)
          ? cfg.deepResearchModel
          : undefined
      return {
        model: override ?? DEFAULT_OPENAI_DEEP_RESEARCH_MODEL,
        tools: [{ type: 'web_search' }],
      }
    }
    const tools: Array<{ type: string }> = []
    if (cfg.webSearch) tools.push({ type: 'web_search' })
    return { model: cfg.model || DEFAULT_OPENAI_PROVIDER_CONFIG.model, tools }
  }

  protected async runStream(
    options: SpawnOptions,
    apiKey: string,
    message: string,
    signal: AbortSignal | undefined,
  ): Promise<void> {
    const cfg: ProviderConfig = options.providerConfig ?? DEFAULT_OPENAI_PROVIDER_CONFIG
    const { model, tools } = this.resolveModelAndTools(cfg)

    const instructions =
      [options.systemPrompt, options.appendSystemPrompt].filter(Boolean).join('\n\n') || null

    const client = new OpenAI({
      apiKey,
      maxRetries: 1,
      timeout: cfg.deepResearch ? DEEP_RESEARCH_TIMEOUT_MS : DEFAULT_TIMEOUT_MS,
    })

    const body: Record<string, unknown> = {
      model,
      instructions,
      input: message,
      ...(tools.length > 0 ? { tools } : {}),
      // Deep research reasons harder and surfaces progress via reasoning summaries.
      ...(cfg.deepResearch ? { reasoning: { effort: 'high', summary: 'auto' } } : {}),
      ...(this.lastResponseId ? { previous_response_id: this.lastResponseId } : {}),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = client.responses.stream(body as any, { signal })

    for await (const event of stream as AsyncIterable<{ type: string; [k: string]: unknown }>) {
      switch (event.type) {
        case 'response.output_text.delta': {
          const delta = String(event['delta'] ?? '')
          if (delta) this.emit('text', { content: delta, partial: true })
          break
        }
        case 'response.web_search_call.in_progress':
        case 'response.web_search_call.searching':
          this.emit('tool_use', {
            toolName: 'web_search',
            input: {},
            id: String(event['item_id'] ?? ''),
          })
          break
        case 'response.web_search_call.completed':
          this.emit('tool_result', {
            toolName: 'web_search',
            output: { status: 'completed' },
            toolUseId: String(event['item_id'] ?? ''),
          })
          break
        case 'response.completed': {
          const response = event['response'] as
            | { id?: string; usage?: { input_tokens?: number; output_tokens?: number } }
            | undefined
          if (response?.id) this.lastResponseId = response.id
          if (response?.usage) {
            const inputTokens = response.usage.input_tokens ?? 0
            const outputTokens = response.usage.output_tokens ?? 0
            this.emit('usage', {
              inputTokens,
              outputTokens,
              estimatedCostUsd: StreamingApiRunner.estimateCost(
                OPENAI_PRICING_PER_MTOK,
                OPENAI_FALLBACK_RATE,
                model,
                inputTokens,
                outputTokens,
              ),
            } satisfies TokenUsage)
          }
          break
        }
        case 'response.failed':
        case 'error': {
          const response = event['response'] as { error?: { message?: string } } | undefined
          const errorMessage =
            response?.error?.message ??
            (event['message'] as string | undefined) ??
            'OpenAI stream reported an error'
          this.failOnce(new Error(errorMessage))
          return
        }
        default:
          break
      }
    }
  }
}
