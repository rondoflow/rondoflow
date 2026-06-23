// Structured-output formatting — shared by the UI, the chain executor (server)
// and (later) the scheduler so a Structurer node produces identical datasets in
// every path. Pure, dependency-free: text-in / structured-data-out.
//
// A Structurer node turns one-or-more agents' free text into a StructuredDataset
// (a schema + rows). The deterministic path here extracts JSON (fenced or
// balanced) and markdown tables already present in the output; the AI path
// (engine/structured-extractor.ts) is a separate module that prompts Claude and
// feeds its rows back through buildStructuredDataset's projection.

import type { RunStep } from './output-format'

export type StructuredFormat = 'json-object' | 'json-array' | 'table'

export const STRUCTURED_FORMAT_LABELS: Record<StructuredFormat, string> = {
  'json-object': 'JSON object',
  'json-array': 'JSON array',
  table: 'Table (rows)',
}

export type ColumnType = 'string' | 'number' | 'boolean' | 'date'

/** One declared field/column of a Structurer node's target schema. */
export interface ColumnSpec {
  readonly key: string
  readonly label: string
  readonly type: ColumnType
  readonly required?: boolean
}

/** The serializable payload a Structurer node emits and a Save-to-DB node persists. */
export interface StructuredDataset {
  readonly name: string
  readonly format: StructuredFormat
  readonly schema: readonly ColumnSpec[]
  /** json-object ⇒ at most one row. */
  readonly rows: ReadonlyArray<Record<string, unknown>>
  readonly sourceAgentIds: readonly string[]
  readonly generatedAt: string
}

export interface BuildStructuredOptions {
  readonly name: string
  readonly format: StructuredFormat
  readonly schema?: readonly ColumnSpec[]
  readonly sourceAgentIds?: readonly string[]
  /** ISO timestamp; defaults to now. Accepted so tests/headless runs can pin it. */
  readonly generatedAt?: string
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Deterministically build a dataset from agents' raw output. For each step we
 * extract the first JSON object/array (preferring fenced ```json blocks), and
 * fall back to a markdown table. Rows are projected onto the declared schema
 * (when one is given) with light per-type coercion. Never throws — unparseable
 * output simply contributes no rows.
 */
export function buildStructuredDataset(
  steps: readonly RunStep[],
  opts: BuildStructuredOptions,
): StructuredDataset {
  return wrapDataset(steps.flatMap((s) => extractRows(s.output)), opts)
}

/**
 * Wrap already-extracted rows (e.g. from the AI extractor) into a dataset,
 * applying the same schema projection and json-object truncation as the
 * deterministic path.
 */
export function wrapDataset(
  rawRows: ReadonlyArray<Record<string, unknown>>,
  opts: BuildStructuredOptions,
): StructuredDataset {
  const schema = opts.schema ?? []
  let rows = schema.length > 0 ? rawRows.map((r) => projectRow(r, schema)) : [...rawRows]
  if (opts.format === 'json-object') rows = rows.slice(0, 1)
  return {
    name: opts.name,
    format: opts.format,
    schema,
    rows,
    sourceAgentIds: opts.sourceAgentIds ?? [],
    generatedAt: opts.generatedAt ?? new Date().toISOString(),
  }
}

/** Serialize a dataset to the envelope string a Structurer step emits. */
export function serializeDataset(dataset: StructuredDataset): string {
  return JSON.stringify(dataset)
}

/**
 * Tolerantly parse a Structurer step's output back into a dataset. Accepts a
 * clean serialized envelope or a dataset embedded in surrounding text. Returns
 * null when no dataset-shaped object can be recovered.
 */
export function parseDataset(text: string): StructuredDataset | null {
  const value = tryParse(text.trim()) ?? extractJsonValue(text)
  if (!isRecord(value)) return null
  if (!Array.isArray((value as Record<string, unknown>).rows)) return null
  const v = value as Record<string, unknown>
  return {
    name: typeof v.name === 'string' ? v.name : 'dataset',
    format: isStructuredFormat(v.format) ? v.format : 'table',
    schema: Array.isArray(v.schema) ? (v.schema as ColumnSpec[]).filter(isColumnSpec) : [],
    rows: (v.rows as unknown[]).filter(isRecord),
    sourceAgentIds: Array.isArray(v.sourceAgentIds)
      ? (v.sourceAgentIds as unknown[]).filter((x): x is string => typeof x === 'string')
      : [],
    generatedAt: typeof v.generatedAt === 'string' ? v.generatedAt : new Date().toISOString(),
  }
}

/** Serialize a dataset's rows to CSV (schema columns, else the union of row keys). */
export function toCsv(dataset: StructuredDataset): string {
  const columns =
    dataset.schema.length > 0
      ? dataset.schema.map((c) => c.key)
      : [...new Set(dataset.rows.flatMap((r) => Object.keys(r)))]
  const header = columns.map(csvCell).join(',')
  const body = dataset.rows.map((row) => columns.map((c) => csvCell(row[c])).join(',')).join('\n')
  return body ? `${header}\n${body}` : header
}

// ─── Extraction helpers ─────────────────────────────────────────────────────────

/** Extract row objects from one agent output: JSON first, then markdown table. */
export function extractRows(output: string): Array<Record<string, unknown>> {
  const value = extractJsonValue(output)
  if (Array.isArray(value)) return value.filter(isRecord)
  if (isRecord(value)) return [value]
  return parseMarkdownTable(output)
}

/** Pull the first JSON object/array value out of free text (fenced blocks win). */
export function extractJsonValue(text: string): unknown {
  for (const block of fencedBlocks(text)) {
    const v = tryParse(block.trim())
    if (v !== undefined) return v
  }
  const obj = extractBalanced(text, '{')
  if (obj) {
    const v = tryParse(obj)
    if (v !== undefined) return v
  }
  const arr = extractBalanced(text, '[')
  if (arr) {
    const v = tryParse(arr)
    if (v !== undefined) return v
  }
  return undefined
}

/** Parse the first markdown table in the text into row objects. */
export function parseMarkdownTable(text: string): Array<Record<string, unknown>> {
  const lines = text.split('\n')
  for (let i = 0; i < lines.length - 1; i++) {
    if (!lines[i]!.includes('|')) continue
    const sep = lines[i + 1]!
    // separator row: only pipes / dashes / colons / spaces, and at least one dash
    if (!/^[\s|:\-]+$/.test(sep) || !sep.includes('-')) continue
    const cols = splitRow(lines[i]!)
    if (cols.length === 0) continue
    const rows: Array<Record<string, unknown>> = []
    for (let j = i + 2; j < lines.length; j++) {
      if (!lines[j]!.includes('|')) break
      const cells = splitRow(lines[j]!)
      const row: Record<string, unknown> = {}
      cols.forEach((c, k) => {
        row[c] = cells[k] ?? ''
      })
      rows.push(row)
    }
    if (rows.length > 0) return rows
  }
  return []
}

// ─── Internals ──────────────────────────────────────────────────────────────────

function fencedBlocks(text: string): string[] {
  const blocks: string[] = []
  const re = /```(?:json|json5)?\s*\n([\s\S]*?)```/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) blocks.push(m[1]!)
  return blocks
}

/** Return the first balanced `{…}` or `[…]` substring (string-literal aware). */
function extractBalanced(text: string, open: '{' | '['): string | null {
  const close = open === '{' ? '}' : ']'
  const start = text.indexOf(open)
  if (start < 0) return null
  let depth = 0
  let inStr = false
  let esc = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]!
    if (inStr) {
      if (esc) esc = false
      else if (ch === '\\') esc = true
      else if (ch === '"') inStr = false
      continue
    }
    if (ch === '"') inStr = true
    else if (ch === open) depth++
    else if (ch === close) {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

function tryParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

function projectRow(
  row: Record<string, unknown>,
  schema: readonly ColumnSpec[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const col of schema) out[col.key] = coerceValue(row[col.key], col.type)
  return out
}

function coerceValue(value: unknown, type: ColumnType): unknown {
  if (value === null || value === undefined) return null
  switch (type) {
    case 'number': {
      const n = typeof value === 'number' ? value : Number(String(value).replace(/[\s,]+/g, ''))
      return Number.isFinite(n) ? n : null
    }
    case 'boolean': {
      if (typeof value === 'boolean') return value
      const s = String(value).trim().toLowerCase()
      return s === 'true' || s === 'yes' || s === '1'
    }
    case 'date':
    case 'string':
    default:
      return typeof value === 'string' ? value : typeof value === 'object' ? JSON.stringify(value) : String(value)
  }
}

function csvCell(value: unknown): string {
  const s =
    value === null || value === undefined
      ? ''
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isStructuredFormat(v: unknown): v is StructuredFormat {
  return v === 'json-object' || v === 'json-array' || v === 'table'
}

function isColumnSpec(v: unknown): v is ColumnSpec {
  return isRecord(v) && typeof v.key === 'string' && typeof v.label === 'string'
}
