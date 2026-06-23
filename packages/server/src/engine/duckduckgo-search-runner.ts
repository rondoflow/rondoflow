// DuckDuckGoSearchRunner — the execution path of a DuckDuckGo Search node.
// Interpolates `{{input}}`/`{{output}}` tokens (the upstream step's output) into
// the query, hits DuckDuckGo's HTML endpoint, parses the organic web results, and
// returns them downstream as readable text or JSON records. A network failure,
// non-2xx status, or timeout REJECTS so the chain executor errors the node and
// skips its dependents (the node's "fail the step" contract). Mirrors
// http-request-runner.ts in shape — it reuses `interpolate` from there so the
// `{{input}}`/`{{output}}` token semantics stay identical across both runners.

import { interpolate } from './http-request-runner'

export type DuckDuckGoSafeSearch = 'strict' | 'moderate' | 'off'
/** Recency filter: day / week / month / year, or '' for any time. */
export type DuckDuckGoTimeLimit = '' | 'd' | 'w' | 'm' | 'y'
/** Downstream shape: a readable numbered list, or a JSON array of records. */
export type DuckDuckGoOutputFormat = 'text' | 'json'

/** Config carried on a duckduckgo-search ChainStep (from the canvas node). */
export interface DuckDuckGoSearchStepConfig {
  readonly name: string
  /** Search query; supports `{{input}}` tokens from the upstream output. */
  readonly query: string
  /** Maximum number of results to return. */
  readonly maxResults: number
  /** Region/locale, e.g. "us-en", "uk-en". Empty ⇒ default region. */
  readonly region: string
  readonly safeSearch: DuckDuckGoSafeSearch
  readonly timeLimit: DuckDuckGoTimeLimit
  readonly outputFormat: DuckDuckGoOutputFormat
}

export interface DuckDuckGoSearchResultItem {
  readonly title: string
  readonly url: string
  readonly snippet: string
}

export interface DuckDuckGoSearchResult {
  readonly count: number
  readonly results: readonly DuckDuckGoSearchResultItem[]
  /** What flows downstream: a numbered text list, or a JSON array of records. */
  readonly output: string
}

const ENDPOINT = 'https://html.duckduckgo.com/html/'
const DEFAULT_MAX_RESULTS = 3
// Never return / buffer an unbounded set into downstream context.
const MAX_RESULTS_CAP = 25
const TIMEOUT_SEC = 20
const MAX_RESPONSE_BYTES = 2_000_000
// The HTML endpoint serves an empty/blocked page to obvious bots — present a
// realistic browser UA so organic results come back.
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
// DuckDuckGo's safe-search URL param (`kp`): strict=1, moderate=-1, off=-2.
const SAFE_SEARCH_PARAM: Record<DuckDuckGoSafeSearch, string> = {
  strict: '1',
  moderate: '-1',
  off: '-2',
}

// Pairs each result's title link with the snippet that follows it in the same
// block (the snippet always trails its title), so titles/URLs/snippets never
// misalign. Tolerant of attribute order — it keys off the `result__*` classes.
const RESULT_RE =
  /class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi

/** Map a Unicode code point to its character, dropping anything out of range. */
function fromCodePoint(cp: number): string {
  try {
    return Number.isFinite(cp) && cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ''
  } catch {
    return ''
  }
}

/** Decode the HTML entities that appear in DDG titles/snippets/hrefs: numeric
 *  (hex + decimal, e.g. `&#92;`, `&#x27;`) and the common named ones. `&amp;` is
 *  decoded last so it never double-decodes an already-resolved entity. */
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/** Strip tags, decode entities, and collapse whitespace into clean display text. */
function cleanText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim()
}

/**
 * DuckDuckGo wraps every result link in a redirect
 * (`//duckduckgo.com/l/?uddg=<encoded-url>&rut=…`). Pull out and decode the real
 * destination; fall back to the href as-is (protocol-relative hrefs get https:).
 */
function resolveResultUrl(href: string): string {
  const decoded = decodeEntities(href.trim())
  const m = decoded.match(/[?&]uddg=([^&]+)/)
  if (m) {
    try {
      return decodeURIComponent(m[1]!)
    } catch {
      return m[1]!
    }
  }
  return decoded.startsWith('//') ? `https:${decoded}` : decoded
}

/** Parse up to `max` organic results out of the DuckDuckGo HTML response. */
function parseResults(html: string, max: number): DuckDuckGoSearchResultItem[] {
  const out: DuckDuckGoSearchResultItem[] = []
  for (const m of html.matchAll(RESULT_RE)) {
    const url = resolveResultUrl(m[1]!)
    const title = cleanText(m[2]!)
    if (!url || !title) continue
    out.push({ title, url, snippet: cleanText(m[3]!) })
    if (out.length >= max) break
  }
  return out
}

/** Render results as a numbered, LLM-friendly text list. */
function formatText(query: string, results: readonly DuckDuckGoSearchResultItem[]): string {
  if (results.length === 0) return `No DuckDuckGo results for "${query}".`
  return results
    .map((r, i) => `${i + 1}. ${r.title}\n${r.url}${r.snippet ? `\n${r.snippet}` : ''}`)
    .join('\n\n')
}

/** Build the DuckDuckGo HTML-endpoint URL for the query + the node's options. */
function buildSearchUrl(cfg: DuckDuckGoSearchStepConfig, query: string): URL {
  const url = new URL(ENDPOINT)
  url.searchParams.set('q', query)
  const region = (cfg.region || '').trim()
  if (region) url.searchParams.set('kl', region)
  url.searchParams.set('kp', SAFE_SEARCH_PARAM[cfg.safeSearch] ?? SAFE_SEARCH_PARAM.moderate)
  if (cfg.timeLimit) url.searchParams.set('df', cfg.timeLimit)
  return url
}

/**
 * Run the DuckDuckGo search described by `cfg`, interpolating `{{input}}` with the
 * combined upstream output. Resolves with the parsed results + downstream output;
 * rejects on an empty query, network error, non-2xx status, or timeout.
 */
export async function performDuckDuckGoSearch(
  cfg: DuckDuckGoSearchStepConfig,
  input: string,
): Promise<DuckDuckGoSearchResult> {
  const query = interpolate(cfg.query ?? '{{input}}', input).trim()
  if (!query) {
    throw new Error('DuckDuckGo Search has no query — set a query or wire an input into it.')
  }

  const max = Math.min(MAX_RESULTS_CAP, Math.max(1, cfg.maxResults || DEFAULT_MAX_RESULTS))
  const url = buildSearchUrl(cfg, query)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_SEC * 1000)

  let res: Response
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { 'user-agent': USER_AGENT, accept: 'text/html' },
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`DuckDuckGo search for "${query}" timed out after ${TIMEOUT_SEC}s.`)
    }
    throw new Error(
      `DuckDuckGo search for "${query}" failed: ${err instanceof Error ? err.message : String(err)}`,
    )
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    throw new Error(`DuckDuckGo returned HTTP ${res.status} ${res.statusText} for "${query}".`)
  }

  const raw = await res.text()
  const html = raw.length > MAX_RESPONSE_BYTES ? raw.slice(0, MAX_RESPONSE_BYTES) : raw
  const results = parseResults(html, max)

  // Distinguish "genuinely no hits" (no result markup at all) from a parse
  // failure (markup present but nothing extracted ⇒ DuckDuckGo changed its HTML).
  if (results.length === 0 && /result__a/.test(html)) {
    throw new Error(
      'DuckDuckGo returned results but they could not be parsed (the result markup may have changed).',
    )
  }

  const output =
    cfg.outputFormat === 'json' ? JSON.stringify(results, null, 2) : formatText(query, results)
  return { count: results.length, results, output }
}
