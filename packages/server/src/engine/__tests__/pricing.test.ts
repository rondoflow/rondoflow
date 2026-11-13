import { describe, it, expect } from 'vitest'
import { estimateCostUsd, openaiRate, OPENAI_FALLBACK_RATE } from '../pricing'

describe('estimateCostUsd — tier resolution', () => {
  it('matches model family by substring, case-insensitively', () => {
    // 1M input + 1M output makes the per-MTok rates fall out directly.
    expect(estimateCostUsd('claude-opus-5-5', 1_000_000, 1_000_000)).toBe(24) // 4 + 20
    expect(estimateCostUsd('Claude-OPUS', 1_000_000, 1_000_000)).toBe(24)
    expect(estimateCostUsd('claude-sonnet-5-5', 1_000_000, 1_000_000)).toBe(12) // 2 + 10
    expect(estimateCostUsd('claude-haiku-5-5', 1_000_000, 1_000_000)).toBeCloseTo(0.6, 10) // 0.1 + 0.5
    expect(estimateCostUsd('claude-fable-5-2', 1_000_000, 1_000_000)).toBe(48) // 8 + 40
    expect(estimateCostUsd('claude-mythos-5-2', 1_000_000, 1_000_000)).toBe(48)
  })

  it('falls back to the sonnet tier for unknown/empty/undefined models', () => {
    expect(estimateCostUsd('gpt-4', 1_000_000, 1_000_000)).toBe(12)
    expect(estimateCostUsd('', 1_000_000, 1_000_000)).toBe(12)
    expect(estimateCostUsd(undefined, 1_000_000, 1_000_000)).toBe(12)
  })

  it('checks opus before sonnet (precedence)', () => {
    expect(estimateCostUsd('opus-sonnet', 1_000_000, 0)).toBe(4)
  })
})

describe('estimateCostUsd — math', () => {
  it('is zero for zero tokens', () => {
    expect(estimateCostUsd('opus', 0, 0)).toBe(0)
  })

  it('scales linearly per million tokens', () => {
    // opus: (500k * 4 + 200k * 20) / 1e6 = (2M + 4M) / 1e6 = 6
    expect(estimateCostUsd('opus', 500_000, 200_000)).toBeCloseTo(6, 10)
  })

  it('weights output tokens more than input', () => {
    const inputOnly = estimateCostUsd('sonnet', 1_000_000, 0)
    const outputOnly = estimateCostUsd('sonnet', 0, 1_000_000)
    expect(outputOnly).toBeGreaterThan(inputOnly)
  })
})

describe('openaiRate', () => {
  it('returns the list price for a known model', () => {
    expect(openaiRate('gpt-6-astra')).toEqual({ input: 10, cachedInput: 1, output: 50 })
    expect(openaiRate('gpt-6-luna')).toEqual({ input: 0.1, cachedInput: 0.01, output: 0.5 })
  })

  it('falls back to the GPT-6.1 Sol rate for unknown or missing models', () => {
    expect(openaiRate('gpt-99')).toBe(OPENAI_FALLBACK_RATE)
    expect(openaiRate(undefined)).toBe(OPENAI_FALLBACK_RATE)
    expect(OPENAI_FALLBACK_RATE).toEqual({ input: 2, cachedInput: 0.1, output: 10 })
  })
})
