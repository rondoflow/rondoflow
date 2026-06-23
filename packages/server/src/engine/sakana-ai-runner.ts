import { interpolate } from './http-request-runner'

export interface SakanaAiStepConfig {
  readonly name: string
  readonly apiUrl: string
  readonly model: string
  readonly prompt: string
  readonly systemPrompt?: string
  readonly temperature: number
  readonly maxTokens: number
  readonly outputFormat: 'text' | 'json'
}

export interface SakanaAiResult {
  readonly output: string
}

const DEFAULT_API_URL = 'https://api.sakana.ai/v1/chat/completions'
const DEFAULT_MODEL = 'sakana-chat'
const DEFAULT_TIMEOUT_SEC = 30
const MAX_RESPONSE_BYTES = 2_000_000

function extractText(response: unknown): string {
  if (!response || typeof response !== 'object') return ''
  const r = response as Record<string, unknown>
  if (typeof r.output_text === 'string') return r.output_text
  const choices = Array.isArray(r.choices) ? r.choices : []
  if (choices.length === 0) return ''
  const first = choices[0] as Record<string, unknown>
  if (typeof first.text === 'string') return first.text
  const message = first.message
  if (!message || typeof message !== 'object') return ''
  const content = (message as Record<string, unknown>).content
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .map((part) => {
      if (typeof part === 'string') return part
      if (!part || typeof part !== 'object') return ''
      const p = part as Record<string, unknown>
      if (typeof p.text === 'string') return p.text
      if (typeof p.content === 'string') return p.content
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

export async function performSakanaAiCompletion(
  cfg: SakanaAiStepConfig,
  input: string,
): Promise<SakanaAiResult> {
  const apiKey = process.env.SAKANA_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('SAKANA_API_KEY is not set. Add it to the server environment to run Sakana AI nodes.')
  }

  const prompt = interpolate(cfg.prompt ?? '{{input}}', input).trim()
  if (!prompt) {
    throw new Error('Sakana AI node has no prompt — set a prompt or wire an input into it.')
  }

  const rawApiUrl = (cfg.apiUrl || DEFAULT_API_URL).trim()
  let url: URL
  try {
    url = new URL(rawApiUrl)
  } catch {
    throw new Error(`Invalid Sakana API URL: "${rawApiUrl || '(empty)'}"`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Unsupported Sakana API URL protocol "${url.protocol}" — only http/https are allowed.`)
  }

  const model = (cfg.model || DEFAULT_MODEL).trim() || DEFAULT_MODEL
  const temperature = Math.max(0, Math.min(2, Number.isFinite(cfg.temperature) ? cfg.temperature : 0.7))
  const maxTokens = Math.max(1, Math.min(8192, Number.isFinite(cfg.maxTokens) ? cfg.maxTokens : 1024))

  const messages = [
    ...(cfg.systemPrompt?.trim() ? [{ role: 'system', content: interpolate(cfg.systemPrompt, input) }] : []),
    { role: 'user', content: prompt },
  ]

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_SEC * 1000)
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + apiKey,
        'x-api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`Sakana AI request timed out after ${DEFAULT_TIMEOUT_SEC}s.`)
    }
    throw new Error(`Sakana AI request failed: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    clearTimeout(timer)
  }

  const raw = await res.text()
  const body = raw.length > MAX_RESPONSE_BYTES ? raw.slice(0, MAX_RESPONSE_BYTES) : raw

  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    throw new Error('Sakana AI returned a non-JSON response.')
  }

  if (!res.ok) {
    const snippet = JSON.stringify(parsed).slice(0, 500)
    throw new Error(`Sakana AI returned HTTP ${res.status} ${res.statusText}${snippet ? `: ${snippet}` : ''}`)
  }

  if (cfg.outputFormat === 'json') {
    return { output: JSON.stringify(parsed, null, 2) }
  }

  const text = extractText(parsed).trim()
  if (!text) {
    throw new Error('Sakana AI response did not contain completion text.')
  }
  return { output: text }
}
