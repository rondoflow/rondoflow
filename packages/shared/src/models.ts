// Model recommendation system

export type ModelTier = 'opus' | 'sonnet' | 'haiku'

export interface ModelRecommendation {
  readonly tier: ModelTier
  readonly label: string
  readonly description: string
  readonly estimatedCostPerMessage: number
  readonly estimatedResponseTime: string
  readonly reason: string
}

export const MODEL_TIERS: Record<ModelTier, Omit<ModelRecommendation, 'reason'>> = {
  opus: {
    tier: 'opus',
    label: 'Deep Thinker',
    description: 'For complex analysis and deep reasoning',
    estimatedCostPerMessage: 0.08,
    estimatedResponseTime: '~15 sec',
  },
  sonnet: {
    tier: 'sonnet',
    label: 'All-Rounder',
    description: 'Best balance of speed and quality',
    estimatedCostPerMessage: 0.02,
    estimatedResponseTime: '~5 sec',
  },
  haiku: {
    tier: 'haiku',
    label: 'Quick Helper',
    description: 'Fast and affordable for simple tasks',
    estimatedCostPerMessage: 0.005,
    estimatedResponseTime: '~2 sec',
  },
} as const

export type AgentPurpose =
  | 'writing'
  | 'coding'
  | 'analysis'
  | 'chat'
  | 'review'
  | 'research'
  | 'creative'
  | 'data'
  | 'general'

export function recommendModel(purpose: AgentPurpose): ModelRecommendation {
  const recommendations: Record<AgentPurpose, { tier: ModelTier; reason: string }> = {
    writing: { tier: 'sonnet', reason: 'Writing tasks need good quality without deep analysis' },
    coding: { tier: 'sonnet', reason: 'Best coding model with balanced cost' },
    analysis: { tier: 'opus', reason: 'Deep analysis requires thorough reasoning' },
    chat: { tier: 'haiku', reason: 'Simple conversations prioritize speed' },
    review: { tier: 'opus', reason: 'Code review needs deep reasoning to catch issues' },
    research: { tier: 'sonnet', reason: 'Research needs good quality across many queries' },
    creative: { tier: 'sonnet', reason: 'Creative tasks need quality but not deep analysis' },
    data: { tier: 'sonnet', reason: 'Data tasks need accuracy with reasonable speed' },
    general: { tier: 'sonnet', reason: 'Best default for most tasks' },
  }

  const rec = recommendations[purpose]
  return {
    ...MODEL_TIERS[rec.tier],
    reason: rec.reason,
  }
}

export function recommendDiscussionModels(participantCount: number): {
  readonly moderator: ModelRecommendation
  readonly participant: ModelRecommendation
  readonly estimatedTotalCost: { min: number; max: number }
} {
  const moderator: ModelRecommendation = {
    ...MODEL_TIERS.sonnet,
    reason: 'Moderator needs synthesis ability but not deep analysis',
  }
  const participant: ModelRecommendation = {
    ...MODEL_TIERS.haiku,
    reason: 'Participants spawn frequently — speed and cost matter',
  }

  const minRounds = 3
  const maxRounds = 5
  const moderatorCost = moderator.estimatedCostPerMessage
  const participantCost = participant.estimatedCostPerMessage * participantCount

  return {
    moderator,
    participant,
    estimatedTotalCost: {
      min: (moderatorCost + participantCost) * minRounds,
      max: (moderatorCost + participantCost) * maxRounds,
    },
  }
}
