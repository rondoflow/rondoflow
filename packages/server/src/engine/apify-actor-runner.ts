// ApifyActorRunner — the execution path of an Apify Actor node. It runs ANY
// public or private Apify actor via the run-sync-get-dataset-items endpoint:
// it interpolates `{{input}}`/`{{output}}` tokens (the upstream step's output)
// into the actor input JSON, starts a synchronous run authenticated with the
// server-side `APIFY_TOKEN`, waits for it to finish, and returns the actor's
// default dataset items downstream. A bad actor id, invalid input JSON, non-2xx
// status, run failure, or timeout REJECTS so the chain executor errors the node
// and skips its dependents (the node's "fail the step" contract). Mirrors
// sakana-ai-runner.ts in shape — it reuses `interpolate` from
// http-request-runner so the token semantics stay identical across runners.

import { TIMEOUTS } from '@rondoflow/shared'
import { interpolate } from './http-request-runner'

/** Config carried on an apify-actor ChainStep (from the canvas node). */
export interface ApifyActorStepConfig {
  readonly name: string
  /** Actor id or `username/actorName` (e.g. "apify/web-scraper"). */
  readonly actorId: string
  /** Actor input as a JSON object string; supports `{{input}}` tokens. Empty ⇒ {}. */
  readonly input: string
  /** Run timeout in SECONDS (clamped to Apify's 300s sync ceiling). */
  readonly timeoutSec: number
  /** Cap on dataset items returned (0 / unset ⇒ no explicit cap). */
  readonly maxItems: number
  /** Downstream shape: a readable numbered list, or the raw JSON dataset. */
  readonly outputFormat: 'text' | 'json'
}

export interface ApifyActorResult {
  /** Number of dataset items returned. */
  readonly count: number
  /** What flows downstream: a numbered text list, or the JSON items array. */
  readonly output: string
}

const API_BASE = 'https://api.apify.com/v2/acts'
const DEFAULT_TIMEOUT_SEC = TIMEOUTS.APIFY_ACTOR_DEFAULT_SEC
const MAX_TIMEOUT_SEC = TIMEOUTS.APIFY_ACTOR_MAX_SEC
// Never buffer an unbounded dataset into memory / downstream context.
const MAX_RESPONSE_BYTES = 2_000_000

/** Turn the user-facing actor reference into the API path segment: the
 *  `username/actorName` form uses a tilde in the URL (`username~actorName`). */
function actorPathSegment(actorId: string): string {
  return encodeURIComponent(actorId.trim().replace(/\//g, '~'))
}

/** Render dataset items as a numbered, LLM-friendly text list. */
function formatText(items: readonly unknown[]): string {
  if (items.length === 0) return 'Apify actor returned no dataset items.'
  return items
    .map((it, i) => `${i + 1}. ${typeof it === 'string' ? it : JSON.stringify(it)}`)
    .join('\n\n')
}

/**
 * Run the Apify actor described by `cfg`, interpolating `{{input}}` with the
 * combined upstream output. Resolves with the dataset items + downstream output;
 * rejects on a missing token, bad actor id, invalid input JSON, non-2xx status,
 * or timeout.
 */
export async function performApifyActorRun(
  cfg: ApifyActorStepConfig,
  input: string,
): Promise<ApifyActorResult> {
  const token = process.env.APIFY_TOKEN?.trim()
  if (!token) {
    throw new Error('APIFY_TOKEN is not set. Add it to the server environment to run Apify Actor nodes.')
  }

  const actorId = (cfg.actorId || '').trim()
  if (!actorId) {
    throw new Error('Apify Actor node has no actor id — set one (e.g. "apify/web-scraper").')
  }

  // Interpolate tokens into the input, then validate it parses as a JSON object.
  const rawInput = interpolate(cfg.input ?? '', input).trim()
  let actorInput: unknown = {}
  if (rawInput) {
    try {
      actorInput = JSON.parse(rawInput)
    } catch {
      throw new Error('Apify Actor input is not valid JSON. Provide a JSON object (e.g. {"startUrls": [...]}).')
    }
  }

  const runTimeoutSec = Math.min(MAX_TIMEOUT_SEC, Math.max(1, cfg.timeoutSec || DEFAULT_TIMEOUT_SEC))
  const url = new URL(`${API_BASE}/${actorPathSegment(actorId)}/run-sync-get-dataset-items`)
  url.searchParams.set('timeout', String(runTimeoutSec))
  const maxItems = Math.max(0, Math.floor(cfg.maxItems || 0))
  if (maxItems > 0) url.searchParams.set('maxItems', String(maxItems))

  // Give the HTTP client a little headroom over the actor run timeout so the
  // server-side wait wins and surfaces a real Apify error rather than aborting.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), (runTimeoutSec + 5) * 1000)

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(actorInput),
      signal: controller.signal,
    })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`Apify actor "${actorId}" timed out after ${runTimeoutSec}s.`)
    }
    throw new Error(`Apify actor "${actorId}" request failed: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    clearTimeout(timer)
  }

  const raw = await res.text()
  const body = raw.length > MAX_RESPONSE_BYTES ? raw.slice(0, MAX_RESPONSE_BYTES) : raw

  if (!res.ok) {
    const snippet = body.slice(0, 500)
    throw new Error(`Apify returned HTTP ${res.status} ${res.statusText} for "${actorId}"${snippet ? `: ${snippet}` : ''}`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    throw new Error(`Apify actor "${actorId}" returned a non-JSON response.`)
  }

  // run-sync-get-dataset-items returns the dataset items as a JSON array.
  const items = Array.isArray(parsed) ? parsed : [parsed]
  const output =
    cfg.outputFormat === 'json' ? JSON.stringify(items, null, 2) : formatText(items)
  return { count: items.length, output }
}
