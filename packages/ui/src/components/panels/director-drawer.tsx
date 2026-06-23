'use client'

import { useTranslation } from 'react-i18next'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

// ─── Types ──────────────────────────────────────────────────────────────────

export type DirectorRigor = 1 | 2 | 3 | 4 | 5

export interface DirectorDrawerProps {
  readonly enabled: boolean
  readonly rigor: DirectorRigor
  readonly customInstructions: string
  readonly onToggle: (enabled: boolean) => void
  readonly onRigorChange: (rigor: DirectorRigor) => void
  readonly onCustomInstructionsChange: (instructions: string) => void
}

// ─── Rigor levels ───────────────────────────────────────────────────────────

const RIGOR_LEVELS: readonly { readonly value: DirectorRigor; readonly labelKey: string; readonly descriptionKey: string; readonly color: string }[] = [
  { value: 1, labelKey: 'director.rigor.level.relaxed.label', descriptionKey: 'director.rigor.level.relaxed.description', color: 'bg-green-500' },
  { value: 2, labelKey: 'director.rigor.level.lenient.label', descriptionKey: 'director.rigor.level.lenient.description', color: 'bg-emerald-500' },
  { value: 3, labelKey: 'director.rigor.level.balanced.label', descriptionKey: 'director.rigor.level.balanced.description', color: 'bg-amber-500' },
  { value: 4, labelKey: 'director.rigor.level.strict.label', descriptionKey: 'director.rigor.level.strict.description', color: 'bg-orange-500' },
  { value: 5, labelKey: 'director.rigor.level.demanding.label', descriptionKey: 'director.rigor.level.demanding.description', color: 'bg-red-500' },
]

// ─── Component ──────────────────────────────────────────────────────────────

export function DirectorDrawer({
  enabled,
  rigor,
  customInstructions,
  onToggle,
  onRigorChange,
  onCustomInstructionsChange,
}: DirectorDrawerProps) {
  const { t } = useTranslation('panelsMisc')
  const currentLevel = RIGOR_LEVELS.find((l) => l.value === rigor) ?? RIGOR_LEVELS[2]!

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
            enabled ? 'bg-purple-500/20' : 'bg-muted',
          )}>
            <Bot className={cn(
              'h-5 w-5',
              enabled ? 'text-purple-400' : 'text-muted-foreground',
            )} aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-purple-300">{t('director.title')}</p>
            <p className="text-xs text-muted-foreground">{t('director.subtitle')}</p>
          </div>
          {/* Toggle */}
          <button
            type="button"
            onClick={() => onToggle(!enabled)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              enabled ? 'bg-purple-500' : 'bg-muted-foreground/30',
            )}
            role="switch"
            aria-checked={enabled}
            aria-label={t('director.toggleLabel')}
          >
            <span className={cn(
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200',
              enabled ? 'translate-x-5' : 'translate-x-0',
            )} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Rigor slider */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">{t('director.rigor.label')}</label>
            <Badge variant="outline" className={cn(
              'text-[10px] px-2 py-0.5',
              enabled ? 'border-purple-500/30 text-purple-400' : 'text-muted-foreground',
            )}>
              {t(currentLevel.labelKey)}
            </Badge>
          </div>

          {/* Level dots */}
          <div className="flex items-center gap-1 mb-3">
            {RIGOR_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => onRigorChange(level.value)}
                className={cn(
                  'flex-1 h-2 rounded-full transition-all cursor-pointer',
                  level.value <= rigor ? level.color : 'bg-muted',
                  level.value <= rigor && 'opacity-90',
                )}
                aria-label={t('director.rigor.setLabel', { level: t(level.labelKey) })}
                title={t(level.labelKey)}
              />
            ))}
          </div>

          {/* Slider */}
          <input
            type="range"
            min={1}
            max={5}
            value={rigor}
            onChange={(e) => onRigorChange(Number(e.target.value) as DirectorRigor)}
            className="w-full accent-purple-500"
            aria-label={t('director.rigor.sliderLabel')}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{t('director.rigor.minLabel')}</span>
            <span className="text-[10px] text-muted-foreground">{t('director.rigor.maxLabel')}</span>
          </div>

          {/* Description */}
          <p className="mt-2 text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
            {t(currentLevel.descriptionKey)}
          </p>
        </section>

        {/* Custom instructions */}
        <section>
          <label className="text-sm font-medium block mb-2">{t('director.customInstructions.label')}</label>
          <p className="text-[11px] text-muted-foreground mb-2">
            {t('director.customInstructions.help')}
          </p>
          <Textarea
            value={customInstructions}
            onChange={(e) => onCustomInstructionsChange(e.target.value)}
            placeholder={t('director.customInstructions.placeholder')}
            className="min-h-[100px] max-h-[200px] resize-y text-xs"
            rows={4}
          />
        </section>

        {/* How it works */}
        <section>
          <p className="text-sm font-medium mb-2">{t('director.howItWorks.title')}</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
              <span>{t('director.howItWorks.evaluates')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
              <span>{t('director.howItWorks.contextualizes')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
              <span>{t('director.howItWorks.redirects')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
              <span>{t('director.howItWorks.concludes')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
              <span>{t('director.howItWorks.learns')}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
