'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, LayoutTemplate, Bot, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkflowPreviewPanel } from '@/components/canvas/workflow-preview-panel'

export type FirstAction = 'describe' | 'template' | 'create' | 'skip'

export interface FirstActionPayload {
  readonly description?: string
  readonly templateId?: string
}

export interface StepFirstActionProps {
  readonly onAction: (action: FirstAction, payload?: FirstActionPayload) => void
  readonly onBack: () => void
}

// Suggestion chips — each fills the task input (and the live preview) on click.
const SUGGESTION_KEYS = ['research', 'review', 'data'] as const

export function StepFirstAction({ onAction, onBack }: StepFirstActionProps) {
  const { t } = useTranslation(['onboarding', 'common'])
  const [task, setTask] = useState('')

  const trimmed = task.trim()

  function submitTask() {
    if (trimmed) onAction('describe', { description: trimmed })
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-8">
      {/* ── Left: control ── */}
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-2xl font-bold leading-tight tracking-tight">
            {t('firstAction.heading')}
            <br />
            <span className="text-muted-foreground">{t('firstAction.headingAccent')}</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t('firstAction.description')}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitTask()
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
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder={t('firstAction.taskPlaceholder')}
                className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t('firstAction.taskAriaLabel')}
                autoFocus
              />
            </div>
            <Button type="submit" className="h-11 gap-1.5 px-5" disabled={!trimmed}>
              {t('action.go')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </form>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTION_KEYS.map((key) => {
            const label = t(`firstAction.suggest.${key}`)
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTask(label)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-accent hover:text-foreground"
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t('firstAction.divider')}
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Secondary actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onAction('template')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <LayoutTemplate className="h-4 w-4 text-muted-foreground" aria-hidden />
            {t('firstAction.template.title')}
          </button>
          <button
            type="button"
            onClick={() => onAction('create')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Bot className="h-4 w-4 text-muted-foreground" aria-hidden />
            {t('firstAction.create.title')}
          </button>
        </div>

        <div className="mt-auto flex gap-3 pt-1">
          <Button variant="ghost" size="sm" onClick={onBack}>
            {t('common:action.back')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAction('skip')}>
            {t('action.skip')}
          </Button>
        </div>
      </div>

      {/* ── Right: canvas (gallery ⇄ live preview) ── */}
      <WorkflowPreviewPanel
        task={trimmed}
        onPickTemplate={(templateId) => onAction('template', { templateId })}
        className="md:min-h-[440px]"
      />
    </div>
  )
}
