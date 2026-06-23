import { describe, it, expect } from 'vitest'
import {
  buildStructuredDataset,
  wrapDataset,
  parseDataset,
  serializeDataset,
  toCsv,
  extractRows,
  parseMarkdownTable,
  type ColumnSpec,
} from '../structured-format'
import type { RunStep } from '../output-format'

const GEN = '2026-06-16T00:00:00.000Z'

describe('buildStructuredDataset — deterministic parse', () => {
  it('extracts a fenced JSON array of objects', () => {
    const steps: RunStep[] = [
      { agentName: 'A', output: 'Here you go:\n```json\n[{"name":"Ada","age":36},{"name":"Bob","age":40}]\n```\nDone.' },
    ]
    const ds = buildStructuredDataset(steps, { name: 'people', format: 'table', generatedAt: GEN })
    expect(ds.rows).toEqual([{ name: 'Ada', age: 36 }, { name: 'Bob', age: 40 }])
  })

  it('extracts a balanced JSON object from surrounding prose', () => {
    const steps: RunStep[] = [{ agentName: 'A', output: 'Result: {"ok": true, "n": 3} trailing text' }]
    const ds = buildStructuredDataset(steps, { name: 'r', format: 'json-object', generatedAt: GEN })
    expect(ds.rows).toEqual([{ ok: true, n: 3 }])
  })

  it('truncates to one row for json-object format', () => {
    const steps: RunStep[] = [{ agentName: 'A', output: '[{"a":1},{"a":2}]' }]
    const ds = buildStructuredDataset(steps, { name: 'r', format: 'json-object', generatedAt: GEN })
    expect(ds.rows).toHaveLength(1)
  })

  it('falls back to a markdown table when no JSON is present', () => {
    const steps: RunStep[] = [
      { agentName: 'A', output: '| name | age |\n| --- | --- |\n| Ada | 36 |\n| Bob | 40 |' },
    ]
    const ds = buildStructuredDataset(steps, { name: 't', format: 'table', generatedAt: GEN })
    expect(ds.rows).toEqual([{ name: 'Ada', age: '36' }, { name: 'Bob', age: '40' }])
  })

  it('returns zero rows (never throws) on unparseable prose', () => {
    const steps: RunStep[] = [{ agentName: 'A', output: 'just some prose, nothing structured' }]
    const ds = buildStructuredDataset(steps, { name: 'x', format: 'table', generatedAt: GEN })
    expect(ds.rows).toEqual([])
  })

  it('projects rows onto a declared schema with type coercion', () => {
    const schema: ColumnSpec[] = [
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'active', label: 'Active', type: 'boolean' },
    ]
    const steps: RunStep[] = [{ agentName: 'A', output: '[{"name":"Ada","age":"36","active":"yes","extra":"drop"}]' }]
    const ds = buildStructuredDataset(steps, { name: 'p', format: 'table', schema, generatedAt: GEN })
    expect(ds.rows).toEqual([{ name: 'Ada', age: 36, active: true }])
  })
})

describe('serialize / parse round-trip', () => {
  it('parseDataset recovers a serialized envelope', () => {
    const ds = wrapDataset([{ a: 1 }], { name: 'd', format: 'table', generatedAt: GEN })
    expect(parseDataset(serializeDataset(ds))).toEqual(ds)
  })

  it('parseDataset returns null for non-dataset text', () => {
    expect(parseDataset('not a dataset')).toBeNull()
  })
})

describe('toCsv', () => {
  it('emits header + escaped rows using the schema columns', () => {
    const ds = wrapDataset(
      [{ name: 'Ada, A', note: 'say "hi"' }],
      { name: 'c', format: 'table', schema: [
        { key: 'name', label: 'Name', type: 'string' },
        { key: 'note', label: 'Note', type: 'string' },
      ], generatedAt: GEN },
    )
    expect(toCsv(ds)).toBe('name,note\n"Ada, A","say ""hi"""')
  })
})

describe('helpers', () => {
  it('extractRows reads an inline object', () => {
    expect(extractRows('{"x":1}')).toEqual([{ x: 1 }])
  })
  it('parseMarkdownTable ignores text without a separator row', () => {
    expect(parseMarkdownTable('| a | b |\nno separator here')).toEqual([])
  })
})
