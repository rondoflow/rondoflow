import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  performDuckDuckGoSearch,
  type DuckDuckGoSearchStepConfig,
} from '../duckduckgo-search-runner'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const baseCfg: DuckDuckGoSearchStepConfig = {
  name: 'D',
  query: '{{input}}',
  maxResults: 3,
  region: 'us-en',
  safeSearch: 'moderate',
  timeLimit: '',
  outputFormat: 'text',
}

/** One result block matching the live `html.duckduckgo.com/html/` markup. */
function resultBlock(realUrl: string, title: string, snippet: string): string {
  const redirect = `//duckduckgo.com/l/?uddg=${encodeURIComponent(realUrl)}&amp;rut=deadbeef`
  return `
    <div class="result results_links results_links_deep web-result">
      <div class="result__body">
        <h2 class="result__title">
          <a rel="nofollow" class="result__a" href="${redirect}">${title}</a>
        </h2>
        <a class="result__snippet" href="${redirect}">${snippet}</a>
        <div class="result__extras">
          <a class="result__url" href="${redirect}">example.com</a>
        </div>
      </div>
    </div>`
}

function sampleHtml(): string {
  return `<html><body>
    ${resultBlock('https://claude.com/', 'Claude', 'Meet <b>Claude</b>, an AI assistant &amp; more.')}
    ${resultBlock('https://anthropic.com/', 'Anthropic', 'AI safety &amp; research company.')}
    ${resultBlock('https://example.org/page', 'Example', 'A third result snippet.')}
  </body></html>`
}

function mockResponse(
  body: string,
  init: { status?: number; statusText?: string } = {},
): Response {
  const status = init.status ?? 200
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init.statusText ?? 'OK',
    headers: new Headers(),
    text: async () => body,
  } as unknown as Response
}

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
  vi.useRealTimers()
})

// ─── performDuckDuckGoSearch ───────────────────────────────────────────────────

describe('performDuckDuckGoSearch', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => mockResponse(sampleHtml())) as unknown as typeof fetch
  })

  it('parses titles, decoded URLs and snippets from the HTML response', async () => {
    const res = await performDuckDuckGoSearch(baseCfg, 'claude')
    expect(res.count).toBe(3)
    expect(res.results[0]).toEqual({
      title: 'Claude',
      url: 'https://claude.com/',
      snippet: 'Meet Claude, an AI assistant & more.',
    })
    expect(res.results[1]!.url).toBe('https://anthropic.com/')
  })

  it('decodes numeric HTML entities (hex + decimal) in titles and snippets', async () => {
    const html = `<html><body>${resultBlock(
      'https://x.test/',
      'Newsroom &#92; Anthropic',   // &#92; = backslash
      'Tab&#x09;and &#39;quote&#39; &amp; amp.',
    )}</body></html>`
    globalThis.fetch = vi.fn(async () => mockResponse(html)) as unknown as typeof fetch
    const res = await performDuckDuckGoSearch(baseCfg, 'x')
    expect(res.results[0]!.title).toBe('Newsroom \\ Anthropic')
    expect(res.results[0]!.snippet).toBe("Tab and 'quote' & amp.")
  })

  it('respects maxResults', async () => {
    const res = await performDuckDuckGoSearch({ ...baseCfg, maxResults: 2 }, 'x')
    expect(res.count).toBe(2)
    expect(res.results).toHaveLength(2)
  })

  it('interpolates {{input}} into the query and sets region/safesearch params', async () => {
    const fetchMock = vi.fn(async (_url: string | URL) => mockResponse(sampleHtml()))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    await performDuckDuckGoSearch(
      { ...baseCfg, query: 'news about {{input}}', region: 'uk-en', safeSearch: 'strict', timeLimit: 'w' },
      'claude',
    )
    const url = new URL(String(fetchMock.mock.calls[0]![0]))
    expect(url.origin + url.pathname).toBe('https://html.duckduckgo.com/html/')
    expect(url.searchParams.get('q')).toBe('news about claude')
    expect(url.searchParams.get('kl')).toBe('uk-en')
    expect(url.searchParams.get('kp')).toBe('1') // strict
    expect(url.searchParams.get('df')).toBe('w')
  })

  it('omits the time-limit param when set to any time', async () => {
    const fetchMock = vi.fn(async (_url: string | URL) => mockResponse(sampleHtml()))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    await performDuckDuckGoSearch({ ...baseCfg, timeLimit: '' }, 'x')
    const url = new URL(String(fetchMock.mock.calls[0]![0]))
    expect(url.searchParams.has('df')).toBe(false)
  })

  it('renders a numbered text list by default', async () => {
    const res = await performDuckDuckGoSearch(baseCfg, 'claude')
    expect(res.output).toMatch(/^1\. Claude\nhttps:\/\/claude\.com\//)
    expect(res.output).toContain('2. Anthropic')
  })

  it('renders a JSON array of records in json mode', async () => {
    const res = await performDuckDuckGoSearch({ ...baseCfg, outputFormat: 'json' }, 'claude')
    const parsed = JSON.parse(res.output)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed[0]).toEqual({
      title: 'Claude',
      url: 'https://claude.com/',
      snippet: 'Meet Claude, an AI assistant & more.',
    })
  })

  it('returns zero results gracefully when the page has no result markup', async () => {
    globalThis.fetch = vi.fn(async () => mockResponse('<html><body>No results.</body></html>')) as unknown as typeof fetch
    const res = await performDuckDuckGoSearch(baseCfg, 'asdfqwerzxcv')
    expect(res.count).toBe(0)
    expect(res.output).toContain('No DuckDuckGo results')
  })

  it('throws when result markup is present but unparseable (DDG changed its HTML)', async () => {
    globalThis.fetch = vi.fn(async () => mockResponse('<a class="result__a">broken markup')) as unknown as typeof fetch
    await expect(performDuckDuckGoSearch(baseCfg, 'x')).rejects.toThrow(/could not be parsed/)
  })

  it('throws on an empty query', async () => {
    await expect(performDuckDuckGoSearch({ ...baseCfg, query: '{{input}}' }, '   ')).rejects.toThrow(/no query/i)
  })

  it('throws on a non-2xx status', async () => {
    globalThis.fetch = vi.fn(async () => mockResponse('nope', { status: 503, statusText: 'Unavailable' })) as unknown as typeof fetch
    await expect(performDuckDuckGoSearch(baseCfg, 'x')).rejects.toThrow(/HTTP 503/)
  })

  it('throws a timeout error when the request is aborted', async () => {
    vi.useFakeTimers()
    globalThis.fetch = vi.fn(
      (_url: unknown, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        }),
    ) as unknown as typeof fetch

    const promise = performDuckDuckGoSearch(baseCfg, 'x')
    const assertion = expect(promise).rejects.toThrow(/timed out/)
    await vi.advanceTimersByTimeAsync(20_000)
    await assertion
  })
})
