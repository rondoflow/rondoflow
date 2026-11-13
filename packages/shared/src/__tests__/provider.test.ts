import { describe, it, expect } from 'vitest'
import {
  perplexityEffort,
  PERPLEXITY_DEFAULT_MODEL,
  PERPLEXITY_MODELS,
  OPENAI_MODELS,
  OPENAI_DEFAULT_MODEL,
  CODEX_MODELS,
  CODEX_DEFAULT_MODEL,
  defaultProviderConfig,
} from '../provider'

describe('perplexityEffort', () => {
  it('passes Agent API effort levels through, including pinned versions', () => {
    expect(perplexityEffort('fast')).toBe('fast')
    expect(perplexityEffort('high')).toBe('high')
    expect(perplexityEffort('ultra')).toBe('ultra')
    expect(perplexityEffort('fast@2026-10-16.0')).toBe('fast@2026-10-16.0')
  })

  it('maps legacy Sonar model ids as in the migration guide', () => {
    expect(perplexityEffort('sonar')).toBe('fast')
    expect(perplexityEffort('sonar-pro')).toBe('fast')
    expect(perplexityEffort('sonar-reasoning')).toBe('low')
    expect(perplexityEffort('sonar-reasoning-pro')).toBe('low')
    expect(perplexityEffort('sonar-deep-research')).toBe('high')
  })

  it('falls back to the default level for empty or unknown values', () => {
    expect(perplexityEffort(undefined)).toBe(PERPLEXITY_DEFAULT_MODEL)
    expect(perplexityEffort('')).toBe(PERPLEXITY_DEFAULT_MODEL)
    expect(perplexityEffort('something-else')).toBe(PERPLEXITY_DEFAULT_MODEL)
  })
})

describe('provider model catalogs', () => {
  it('lists each provider default among its selectable models', () => {
    expect(OPENAI_MODELS.map((m) => m.id)).toContain(OPENAI_DEFAULT_MODEL)
    expect(PERPLEXITY_MODELS.map((m) => m.id)).toContain(PERPLEXITY_DEFAULT_MODEL)
    expect(CODEX_MODELS.map((m) => m.id)).toContain(CODEX_DEFAULT_MODEL)
  })

  it('uses those defaults in the default provider configs', () => {
    expect(defaultProviderConfig('openai')?.model).toBe(OPENAI_DEFAULT_MODEL)
    expect(defaultProviderConfig('perplexity')?.model).toBe(PERPLEXITY_DEFAULT_MODEL)
    expect(defaultProviderConfig('codex')?.model).toBe(CODEX_DEFAULT_MODEL)
    expect(defaultProviderConfig('claude-code')).toBeNull()
  })
})
