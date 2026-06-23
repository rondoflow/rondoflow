'use client'

import { useTranslation } from 'react-i18next'
import { Sparkles, Layers, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type WorkMode = 'quick' | 'full'

export interface StepWorkModeProps {
  readonly value: WorkMode | null
  readonly onChange: (mode: WorkMode) => void
  readonly onContinue: () => void
  readonly onBack: () => void
}

const MODES = [
  {
    id: 'quick' as const,
    icon: Sparkles,
    titleKey: 'workMode.quick.title',
    descriptionKey: 'workMode.quick.description',
  },
  {
    id: 'full' as const,
    icon: Layers,
    titleKey: 'workMode.full.title',
    descriptionKey: 'workMode.full.description',
  },
]

export function StepWorkMode({ value, onChange, onContinue, onBack }: StepWorkModeProps) {
  const { t } = useTranslation('onboarding')
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('workMode.heading')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('workMode.description')}
        </p>
      </div>

      <div className="flex w-full max-w-lg gap-4">
        {MODES.map((mode) => {
          const selected = value === mode.id
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all',
                selected
                  ? 'border-primary bg-accent/10'
                  : 'border-border hover:border-border/80',
              )}
            >
              {selected && (
                <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" aria-hidden />
              )}
              <mode.icon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-semibold">{t(mode.titleKey)}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(mode.descriptionKey)}</p>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          {t('common:action.back')}
        </Button>
        <Button onClick={onContinue} disabled={!value}>
          {t('action.continue')}
        </Button>
      </div>
    </div>
  )
}
