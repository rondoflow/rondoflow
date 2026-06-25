// StructuredExtractor — the AI path of a Structurer node. Prompts Claude to
// coerce upstream agent prose into JSON rows conforming to a declared schema,
// then defensively parses the response (regex-extract + JSON.parse + per-field
// coercion, graceful fallback to []). Mirrors advisor.ts: a bounded, JSON-only,
// bypassPermissions one-shot — NO Zod on the model output (codebase convention).

import { ClaudeCodeSpawner } from './spawner'
import { randomUUID } from 'crypto'
import type { ColumnSpec, StructuredFormat } from '@rondoflow/shared'
import { buildExtractorSystemPrompt, buildExtractorUserMessage } from '../prompts/structured-extractor'

/** Config carried on a structurer ChainStep (from the canvas node). */
export interface StructurerStepConfig {
  readonly name: string
  readonly format: StructuredFormat
  readonly schema: readonly ColumnSpec[]
  readonly extractionMode: 'parse' | 'ai'
  readonly instructions?: string
  readonly model?: string
}

/** Config carried on a db-save ChainStep (from the canvas node). */
export interface DbSaveStepConfig {
  readonly name: string
  readonly label?: string
}

export interface ExtractOptions {
  readonly text: string
  readonly schema: readonly ColumnSpec[]
  readonly format: StructuredFormat
  readonly instructions?: string
  readonly model: string
}

/**
 * Run an AI extraction pass. Returns row objects (always an array; json-object
 * format is truncated to one row downstream by wrapDataset). Never throws — a
 * hung CLI, empty output, or malformed JSON resolves to [].
 */
export async function extractStructuredRows(
  opts: ExtractOptions,
): Promise<Array<Record<string, unknown>>> {
  const spawner = new ClaudeCodeSpawner()
  let raw: string
  try {
    raw = await spawnAndCollect(spawner, buildExtractorSystemPrompt(opts), buildExtractorUserMessage(opts), opts.model)
  } catch {
    return []
  }
  return parseRows(raw)
}

function spawnAndCollect(
  spawner: ClaudeCodeSpawner,
  systemPrompt: string,
  message: string,
  model: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let output = ''
    spawner.on('text', (data: { content: string; partial: boolean }) => {
      if (data.partial) output += data.content
      else output = data.content
    })
    spawner.on('completion', () => resolve(output))
    spawner.on('error', (err: Error) => reject(new Error(`Structured extraction failed: ${err.message}`)))
    try {
      spawner.spawn({
        agentId: `structurer-${randomUUID().slice(0, 8)}`,
        sessionId: randomUUID(),
        message,
        systemPrompt,
        model,
        // JSON-only, grants no tools — bypassPermissions removes the stall-causing
        // permission gate (same rationale as the Advisor). Bounded wall-clock so a
        // hung CLI can't stall the run; a timeout rejects → [] fallback.
        permissionMode: 'bypassPermissions',
        maxBudgetUsd: 0.1,
        maxWallClockMs: 90_000,
      })
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)))
    }
  })
}

/** Defensive parse: pull the first JSON array/object and normalize to rows. */
function parseRows(raw: string): Array<Record<string, unknown>> {
  const match = raw.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
  if (!match) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(match[0])
  } catch {
    return []
  }
  if (Array.isArray(parsed)) return parsed.filter(isRecord)
  if (isRecord(parsed)) {
    // A bare object: treat a `rows`/`data`/`items` array specially, else one row.
    for (const key of ['rows', 'data', 'items', 'records']) {
      const v = parsed[key]
      if (Array.isArray(v)) return v.filter(isRecord)
    }
    return [parsed]
  }
  return []
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
