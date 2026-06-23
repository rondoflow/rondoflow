'use client'

import { useTranslation } from 'react-i18next'
import { useComplexity } from '@/hooks/use-complexity'

// Number of features still hidden at each tier (used for the upgrade CTA copy).
// Interface complexity is currently pinned to 'full', so this renders nothing
// today — kept structurally so tier-gating works if re-enabled.
const TIER_HIDDEN_COUNT: Record<string, number> = {
  simple: 8,
  standard: 1,
}

interface TierIndicatorProps {
  readonly onSettingsClick?: () => void
}

/**
 * Compact "Simple/Standard mode — N more features available" pill. Lifted out of
 * the old left sidebar into the top-bar account cluster. Hidden at the full tier.
 */
export function TierIndicator({ onSettingsClick }: TierIndicatorProps) {
  const { t } = useTranslation('shell')
  const { tier } = useComplexity()
  if (tier === 'full') return null

  const hidden = TIER_HIDDEN_COUNT[tier] ?? 0
  if (hidden === 0) return null

  return (
    <button
      type="button"
      onClick={onSettingsClick}
      className="rounded-md border border-dashed border-border/50 px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
    >
      {tier === 'simple'
        ? t('tier.simpleMode', { count: hidden })
        : t('tier.standardMode', { count: hidden })}
    </button>
  )
}
