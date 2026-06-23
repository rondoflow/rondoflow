'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Loader2,
  Check,
  Bot,
  Sparkles,
  ArrowUpDown,
  FileWarning,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AdvisorSuggestion {
  readonly id: string
  readonly category: string
  readonly title: string
  readonly description: string
  readonly actionType?: string | null
  readonly actionPayload?: {
    readonly agentId?: string
    readonly agentName?: string
    readonly skillName?: string
    readonly newPersona?: string
  }
  readonly severity: string
}

export interface AdvisorResultData {
  readonly overallAssessment: string
  readonly objectiveMet: boolean
  readonly suggestions: readonly AdvisorSuggestion[]
}

export interface AdvisorCardProps {
  readonly result: AdvisorResultData
  readonly onApplySkill: (agentId: string, skillName: string) => Promise<void>
  readonly onUpdatePersona: (agentId: string, newPersona: string) => Promise<void>
}

// ─── Category helpers ───────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { labelKey: string; color: string; icon: typeof Bot }> = {
  agent_improvement: { labelKey: 'advisor.category.agent', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', icon: Bot },
  skill_recommendation: { labelKey: 'advisor.category.skill', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10', icon: Sparkles },
  step_order: { labelKey: 'advisor.category.order', color: 'text-teal-400 border-teal-500/30 bg-teal-500/10', icon: ArrowUpDown },
  output_quality: { labelKey: 'advisor.category.quality', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', icon: FileWarning },
}

// ─── Suggestion Row ─────────────────────────────────────────────────────────

function SuggestionRow({
  suggestion,
  onApplySkill,
  onUpdatePersona,
}: {
  readonly suggestion: AdvisorSuggestion
  readonly onApplySkill: (agentId: string, skillName: string) => Promise<void>
  readonly onUpdatePersona: (agentId: string, newPersona: string) => Promise<void>
}) {
  const { t } = useTranslation('panelsMisc')
  const [actionState, setActionState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const config = CATEGORY_CONFIG[suggestion.category] ?? CATEGORY_CONFIG.output_quality!
  const CategoryIcon = config.icon

  async function handleAction() {
    const payload = suggestion.actionPayload
    if (!payload?.agentId) return

    setActionState('loading')
    try {
      if (suggestion.actionType === 'apply_skill' && payload.skillName) {
        await onApplySkill(payload.agentId, payload.skillName)
      } else if (suggestion.actionType === 'update_persona' && payload.newPersona) {
        await onUpdatePersona(payload.agentId, payload.newPersona)
      }
      setActionState('done')
    } catch {
      setActionState('error')
      setTimeout(() => setActionState('idle'), 3000)
    }
  }

  const actionLabel = suggestion.actionType === 'apply_skill'
    ? t('advisor.action.applySkill', { skill: suggestion.actionPayload?.skillName })
    : suggestion.actionType === 'update_persona'
      ? t('advisor.action.updatePersona')
      : null

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-card/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <CategoryIcon className={cn('h-3 w-3 shrink-0', config.color.split(' ')[0])} aria-hidden />
        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', config.color)}>
          {t(config.labelKey)}
        </Badge>
        <span className="text-xs font-medium text-foreground">{suggestion.title}</span>
        {suggestion.actionPayload?.agentName && (
          <span className="text-[10px] text-muted-foreground">
            ({suggestion.actionPayload.agentName})
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{suggestion.description}</p>
      {actionLabel && suggestion.actionPayload?.agentId && (
        <div className="flex items-center gap-2 pt-0.5">
          <Button
            size="sm"
            variant="outline"
            className="h-6 gap-1 px-2 text-[10px]"
            disabled={actionState === 'loading' || actionState === 'done'}
            onClick={handleAction}
          >
            {actionState === 'loading' && <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden />}
            {actionState === 'done' && <Check className="h-2.5 w-2.5 text-green-500" aria-hidden />}
            {actionState === 'error' && <XCircle className="h-2.5 w-2.5 text-destructive" aria-hidden />}
            {actionState === 'done' ? t('advisor.action.applied') : actionState === 'error' ? t('advisor.action.failed') : actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Main Card ──────────────────────────────────────────────────────────────

export function AdvisorCard({ result, onApplySkill, onUpdatePersona }: AdvisorCardProps) {
  const { t } = useTranslation('panelsMisc')
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden" role="listitem">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-amber-500/20 px-3 py-2">
        <Lightbulb className="h-4 w-4 text-amber-400" aria-hidden />
        <span className="text-xs font-semibold text-amber-400">{t('advisor.title')}</span>
        <div className="flex-1" />
        {result.objectiveMet ? (
          <Badge variant="outline" className="gap-1 text-[10px] border-green-500/30 text-green-400 bg-green-500/10">
            <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />
            {t('advisor.objectiveMet')}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-[10px] border-red-500/30 text-red-400 bg-red-500/10">
            <XCircle className="h-2.5 w-2.5" aria-hidden />
            {t('advisor.objectiveNotMet')}
          </Badge>
        )}
      </div>

      {/* Assessment */}
      <div className="px-3 py-2">
        <p className="text-xs text-muted-foreground">{result.overallAssessment}</p>
      </div>

      {/* Suggestions */}
      {result.suggestions.length > 0 ? (
        <div className="flex flex-col gap-2 px-3 pb-3">
          {result.suggestions.map((suggestion) => (
            <SuggestionRow
              key={suggestion.id}
              suggestion={suggestion}
              onApplySkill={onApplySkill}
              onUpdatePersona={onUpdatePersona}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 pb-3 text-xs text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{t('advisor.allGood')}</span>
        </div>
      )}
    </div>
  )
}
