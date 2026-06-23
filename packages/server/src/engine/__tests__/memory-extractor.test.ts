import { describe, it, expect, vi } from 'vitest'

// The extractor module imports prisma + spawner at load time; mock them so the
// pure helpers (parseFacts, slugKey) can be imported without side effects.
vi.mock('../../lib/prisma', () => ({ prisma: {} }))
vi.mock('../spawner', () => ({ ClaudeCodeSpawner: class {} }))

import { parseFacts, slugKey } from '../memory-extractor'

describe('parseFacts', () => {
  it('parses a clean JSON facts array', () => {
    const raw = '{"facts":[{"key":"db","value":"Postgres 16","scope":"workspace","confidence":0.9}]}'
    const facts = parseFacts(raw)
    expect(facts).toHaveLength(1)
    expect(facts[0]).toMatchObject({ key: 'db', value: 'Postgres 16', scope: 'workspace' })
  })

  it('strips surrounding prose / code fences', () => {
    const raw = 'Here you go:\n```json\n{"facts":[{"key":"x","value":"y","scope":"agent"}]}\n```\nDone.'
    const facts = parseFacts(raw)
    expect(facts).toHaveLength(1)
    expect(facts[0]!.scope).toBe('agent')
  })

  it('drops facts below the confidence threshold', () => {
    const raw = '{"facts":[{"key":"a","value":"v","scope":"agent","confidence":0.5},{"key":"b","value":"v2","scope":"agent","confidence":0.8}]}'
    const facts = parseFacts(raw)
    expect(facts.map((f) => f.key)).toEqual(['b'])
  })

  it('keeps facts with no confidence field', () => {
    const raw = '{"facts":[{"key":"a","value":"v","scope":"agent"}]}'
    expect(parseFacts(raw)).toHaveLength(1)
  })

  it('defaults an unknown scope to agent', () => {
    const raw = '{"facts":[{"key":"a","value":"v","scope":"nonsense"}]}'
    expect(parseFacts(raw)[0]!.scope).toBe('agent')
  })

  it('drops facts missing key or value', () => {
    const raw = '{"facts":[{"key":"","value":"v","scope":"agent"},{"key":"a","value":"","scope":"agent"}]}'
    expect(parseFacts(raw)).toHaveLength(0)
  })

  it('returns [] on non-JSON or missing facts array', () => {
    expect(parseFacts('no json here')).toEqual([])
    expect(parseFacts('{"notFacts": 1}')).toEqual([])
  })
})

describe('slugKey', () => {
  it('produces a stable auto: slug from a key', () => {
    expect(slugKey('Project Tech Stack')).toBe('auto:project-tech-stack')
  })

  it('collapses non-alphanumerics and trims dashes', () => {
    expect(slugKey('  API__base/url!! ')).toBe('auto:api-base-url')
  })

  it('falls back to auto:fact for empty slugs', () => {
    expect(slugKey('!!!')).toBe('auto:fact')
  })

  it('is stable across calls (so re-discovered facts upsert-merge)', () => {
    expect(slugKey('DB engine')).toBe(slugKey('db engine'))
  })
})
