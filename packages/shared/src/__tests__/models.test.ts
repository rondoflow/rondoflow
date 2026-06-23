import { describe, it, expect } from 'vitest'
import {
  recommendModel,
  recommendDiscussionModels,
  MODEL_TIERS,
  type AgentPurpose,
  type ModelTier,
} from '../models'

describe('recommendModel', () => {
  it.each<[AgentPurpose, ModelTier]>([
    ['writing', 'sonnet'],
    ['coding', 'sonnet'],
    ['analysis', 'opus'],
    ['chat', 'haiku'],
    ['review', 'opus'],
    ['research', 'sonnet'],
    ['creative', 'sonnet'],
    ['data', 'sonnet'],
    ['general', 'sonnet'],
  ])('recommends %s → %s tier', (purpose, tier) => {
    const rec = recommendModel(purpose)
    expect(rec.tier).toBe(tier)
    expect(rec.label).toBe(MODEL_TIERS[tier].label)
    expect(rec.estimatedCostPerMessage).toBe(MODEL_TIERS[tier].estimatedCostPerMessage)
    expect(rec.reason).toBeTruthy()
  })
})

describe('recommendDiscussionModels', () => {
  it('uses sonnet moderator + haiku participants', () => {
    const r = recommendDiscussionModels(3)
    expect(r.moderator.tier).toBe('sonnet')
    expect(r.participant.tier).toBe('haiku')
    expect(r.moderator.reason).toBeTruthy()
    expect(r.participant.reason).toBeTruthy()
  })

  it('computes the 3–5 round cost range for n participants', () => {
    const r = recommendDiscussionModels(3)
    // (0.02 + 0.005*3) * {3,5} = 0.035 * {3,5}
    expect(r.estimatedTotalCost.min).toBeCloseTo(0.105, 10)
    expect(r.estimatedTotalCost.max).toBeCloseTo(0.175, 10)
  })

  it('counts only the moderator when there are no participants', () => {
    const r = recommendDiscussionModels(0)
    expect(r.estimatedTotalCost.min).toBeCloseTo(0.06, 10) // 0.02 * 3
    expect(r.estimatedTotalCost.max).toBeCloseTo(0.1, 10) // 0.02 * 5
  })

  it('scales participant cost with the count', () => {
    const small = recommendDiscussionModels(2).estimatedTotalCost.min
    const large = recommendDiscussionModels(10).estimatedTotalCost.min
    expect(large).toBeGreaterThan(small)
  })
})
