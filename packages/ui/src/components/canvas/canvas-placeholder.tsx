'use client'

import { useState } from 'react'
import { ArrowRight, LayoutTemplate, Loader2, Plus, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { WorkflowPreviewPanel } from '@/components/canvas/workflow-preview-panel'

export interface CanvasPlaceholderProps {
  readonly onCreateAssistant?: () => void
  readonly onStartDiscussion?: () => void
  readonly onUseTemplate?: () => void
  readonly onPickTemplate?: (templateId: string) => void
  readonly onExploreSkills?: () => void
  readonly onDescribe?: (description: string) => void
  readonly onGoToWorkspace?: () => void
  readonly hasExistingCanvas?: boolean
  readonly isGenerating?: boolean
}

// Suggestion chips reuse the onboarding strings so the two welcome surfaces stay
// in sync.
const SUGGESTION_KEYS = ['research', 'review', 'data'] as const

export function CanvasPlaceholder({
  onCreateAssistant,
  onUseTemplate,
  onPickTemplate,
  onDescribe,
  onGoToWorkspace,
  hasExistingCanvas,
  isGenerating = false,
}: CanvasPlaceholderProps) {
  const { t } = useTranslation(['canvas', 'onboarding'])
  const [description, setDescription] = useState('')
  const trimmed = description.trim()

  return (
    <div className="grid h-full bg-background md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ── Left: control ── */}
      <div className="flex flex-col justify-center gap-6 overflow-y-auto px-6 py-10 md:px-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('placeholder.title')} <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {t('placeholder.intro')}
          </p>
        </div>

        {/* Primary: describe a task → generate a workspace of agents */}
        {onDescribe && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (trimmed && !isGenerating) onDescribe(trimmed)
            }}
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Sparkles
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('placeholder.describePlaceholder')}
                  className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  aria-label={t('placeholder.describeAriaLabel')}
                  disabled={isGenerating}
                />
              </div>
              <Button type="submit" className="h-11 gap-1.5 px-5" disabled={isGenerating || !trimmed}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t('placeholder.generating')}
                  </>
                ) : (
                  <>
                    {t('placeholder.describeButton')}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Suggestion chips */}
        {onDescribe && !isGenerating && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_KEYS.map((key) => {
              const label = t(`onboarding:firstAction.suggest.${key}`)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDescription(label)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-accent hover:text-foreground"
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {/* Divider between the AI path and the manual CTAs */}
        {onDescribe && (
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t('placeholder.or')}
            <span className="h-px flex-1 bg-border" />
          </div>
        )}

        {/* Secondary CTAs */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onUseTemplate}
            disabled={isGenerating}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            <LayoutTemplate className="h-4 w-4 text-muted-foreground" aria-hidden />
            {t('placeholder.useTemplate')}
          </button>
          <button
            type="button"
            onClick={onCreateAssistant}
            disabled={isGenerating}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            <Plus className="h-4 w-4 text-muted-foreground" aria-hidden />
            {t('placeholder.createAssistant')}
          </button>
        </div>

        {/* Continue to workspace */}
        {hasExistingCanvas && onGoToWorkspace && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 self-start text-muted-foreground hover:text-foreground"
            onClick={onGoToWorkspace}
            disabled={isGenerating}
          >
            {t('placeholder.continueToWorkspace')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* ── Right: canvas (gallery ⇄ live preview) ── */}
      <div className="hidden border-l border-border p-6 md:block">
        <WorkflowPreviewPanel
          task={trimmed}
          onPickTemplate={onPickTemplate ?? (() => onUseTemplate?.())}
          className="h-full"
        />
      </div>
    </div>
  )
}
