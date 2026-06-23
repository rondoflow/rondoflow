'use client'

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, MessageSquare, AlertTriangle } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DiscussionTimeline } from './discussion-timeline'
import { DiscussionControls } from './discussion-controls'
import { useDiscussion } from '@/hooks/use-discussion'
import type { DiscussionTable } from '@rondoflow/shared'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DiscussionPanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly discussion: DiscussionTable | null
}

// ─── Status badge styles ───────────────────────────────────────────────────

const STATUS_COLORS = {
  draft: 'border-border bg-muted/50 text-muted-foreground',
  active: 'border-green-500/40 bg-green-500/10 text-green-400',
  concluded: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
} as const

// ─── DiscussionPanel ───────────────────────────────────────────────────────

export function DiscussionPanel({ open, onOpenChange, discussion }: DiscussionPanelProps) {
  const { t } = useTranslation('discussions')
  const { status, currentRound, conclusion, error, start, pause, resume } = useDiscussion(
    discussion?.id ?? null,
  )

  const effectiveStatus = discussion
    ? currentRound > 0 || status !== 'draft'
      ? status
      : discussion.status
    : 'draft'

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleExport = useCallback(() => {
    if (!discussion) return
    const text = [
      t('panel.exportTitle', { name: discussion.name }),
      `\n${t('panel.exportTopic', { topic: discussion.topic })}`,
      conclusion ? `\n${t('panel.exportConclusion')}\n\n${conclusion}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `discussion-${discussion.id}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [discussion, conclusion, t])

  const handleStop = useCallback(() => {
    // Stop is handled via server-side — emitting pause is the closest
    // available signal until a stop event is added to the protocol.
    if (discussion) {
      pause()
    }
  }, [discussion, pause])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0"
        aria-label={discussion ? t('panel.label', { name: discussion.name }) : t('panel.labelEmpty')}
      >
        {/* Accessible title/description for screen readers — the visible header
            below is custom markup, so Radix needs an explicit Dialog title. */}
        <SheetTitle className="sr-only">
          {discussion ? t('panel.label', { name: discussion.name }) : t('panel.labelEmpty')}
        </SheetTitle>
        <SheetDescription className="sr-only">
          {discussion
            ? t('panel.description', { topic: discussion.topic })
            : t('panel.descriptionEmpty')}
        </SheetDescription>

        {discussion ? (
          <>
            {/* Header */}
            <header className="flex shrink-0 items-start gap-3 border-b border-border px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">
                  {discussion.name}
                </p>
                <p
                  className="mt-0.5 line-clamp-1 text-xs text-muted-foreground"
                  title={discussion.topic}
                >
                  {discussion.topic}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                    STATUS_COLORS[effectiveStatus],
                  )}
                  role="status"
                >
                  {effectiveStatus === 'active'
                    ? t('panel.status.active')
                    : effectiveStatus === 'concluded'
                    ? t('panel.status.concluded')
                    : t('panel.status.draft')}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleClose}
                  aria-label={t('panel.closeLabel')}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </header>

            {/* Controls bar */}
            <DiscussionControls
              status={effectiveStatus}
              currentRound={currentRound}
              maxRounds={discussion.maxRounds}
              onStart={start}
              onPause={pause}
              onResume={resume}
              onStop={handleStop}
              onExport={handleExport}
            />

            {/* Error banner */}
            {error && (
              <div
                className="flex shrink-0 items-start gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="break-words">{error}</span>
              </div>
            )}

            {/* Timeline */}
            <DiscussionTimeline
              tableId={discussion.id}
              topic={discussion.topic}
              status={effectiveStatus}
              conclusion={conclusion ?? discussion.conclusion ?? undefined}
              currentRound={currentRound}
              maxRounds={discussion.maxRounds}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-6 w-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm font-medium">{t('panel.empty.title')}</p>
            <p className="text-xs text-muted-foreground">
              {t('panel.empty.hint')}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
