'use client'

import { useTranslation } from 'react-i18next'
import { Brain, Zap, Rabbit, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MODEL_TIERS, type ModelTier } from '@rondoflow/shared'

export interface ModelSelectorProps {
  readonly value: ModelTier | null
  readonly recommended: ModelTier
  readonly reason: string
  readonly onChange: (tier: ModelTier) => void
}

const TIER_ICONS: Record<ModelTier, React.ElementType> = {
  opus: Brain,
  sonnet: Zap,
  haiku: Rabbit,
}

const TIER_ORDER: readonly ModelTier[] = ['opus', 'sonnet', 'haiku']

export function ModelSelector({ value, recommended, reason, onChange }: ModelSelectorProps) {
  const { t } = useTranslation('agentDrawer')
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label={t('model.selectionAria')}>
      {TIER_ORDER.map((tier) => {
        const config = MODEL_TIERS[tier]
        const Icon = TIER_ICONS[tier]
        const isSelected = value === tier
        const isRecommended = recommended === tier

        return (
          <button
            key={tier}
            role="radio"
            aria-checked={isSelected}
            type="button"
            onClick={() => onChange(tier)}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
              'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card',
            )}
          >
            {/* Radio indicator */}
            <div
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                isSelected ? 'border-primary' : 'border-muted-foreground/50',
              )}
            >
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{config.label}</span>
                {isRecommended && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {t('model.recommended')}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {config.description}
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{t('model.costPerMessage', { cost: config.estimatedCostPerMessage.toFixed(3) })}</span>
                <span>{config.estimatedResponseTime}</span>
              </div>
            </div>

            {/* Why this? tooltip — only shown on recommended */}
            {isRecommended && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t('model.whyRecommended')}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[200px] text-xs">
                  {reason}
                </TooltipContent>
              </Tooltip>
            )}
          </button>
        )
      })}
    </div>
  )
}
