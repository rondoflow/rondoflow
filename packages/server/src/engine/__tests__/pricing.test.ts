import { describe, it, expect } from 'vitest'
import { estimateCostUsd } from '../pricing'

describe('estimateCostUsd — tier resolution', () => {
  it('matches model family by substring, case-insensitively', () => {
    // 1M input + 1M output makes the per-MTok rates fall out directly.
    expect(estimateCostUsd('claude-opus-4-8', 1_000_000, 1_000_000)).toBe(30) // 5 + 25
    expect(estimateCostUsd('Claude-OPUS', 1_000_000, 1_000_000)).toBe(30)
    expect(estimateCostUsd('claude-3-5-sonnet', 1_000_000, 1_000_000)).toBe(18) // 3 + 15
    expect(estimateCostUsd('claude-haiku-4-5', 1_000_000, 1_000_000)).toBe(6) // 1 + 5
  })

  it('falls back to the sonnet tier for unknown/empty/undefined models', () => {
    expect(estimateCostUsd('gpt-4', 1_000_000, 1_000_000)).toBe(18)
    expect(estimateCostUsd('', 1_000_000, 1_000_000)).toBe(18)
    expect(estimateCostUsd(undefined, 1_000_000, 1_000_000)).toBe(18)
  })

  it('checks opus before sonnet (precedence)', () => {
    expect(estimateCostUsd('opus-sonnet', 1_000_000, 0)).toBe(5)
  })
})

describe('estimateCostUsd — math', () => {
  it('is zero for zero tokens', () => {
    expect(estimateCostUsd('opus', 0, 0)).toBe(0)
  })

  it('scales linearly per million tokens', () => {
    // opus: (500k * 5 + 200k * 25) / 1e6 = (2.5M + 5M) / 1e6 = 7.5
    expect(estimateCostUsd('opus', 500_000, 200_000)).toBeCloseTo(7.5, 10)
  })

  it('weights output tokens more than input', () => {
    const inputOnly = estimateCostUsd('sonnet', 1_000_000, 0)
    const outputOnly = estimateCostUsd('sonnet', 0, 1_000_000)
    expect(outputOnly).toBeGreaterThan(inputOnly)
  })
})
