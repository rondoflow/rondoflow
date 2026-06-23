'use client'

import { MessageSquare, Plus, Calendar, UserRoundCog } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { DiscussionTable } from '@rondoflow/shared'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DiscussionsListProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly discussions: readonly DiscussionTable[]
  readonly onSelectDiscussion: (discussion: DiscussionTable) => void
  readonly onNewDiscussion: () => void
  readonly onOpenFacilitators: () => void
}

// ─── Status badge styles ───────────────────────────────────────────────────

const STATUS_LABEL_KEY: Record<DiscussionTable['status'], string> = {
  draft: 'list.status.draft',
  active: 'list.status.active',
  concluded: 'list.status.concluded',
}

const STATUS_CLASS: Record<DiscussionTable['status'], string> = {
  draft: 'text-muted-foreground',
  active: 'border-green-500/40 bg-green-500/10 text-green-400',
  concluded: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
}

// ─── Discussion row ────────────────────────────────────────────────────────

function DiscussionRow({
  discussion,
  onSelect,
}: {
  readonly discussion: DiscussionTable
  readonly onSelect: () => void
}) {
  const { t, i18n } = useTranslation('discussions')
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left',
        'transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      aria-label={t('list.openLabel', { name: discussion.name })}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{discussion.name}</p>
          <div
            className={cn(
              'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium',
              STATUS_CLASS[discussion.status],
            )}
          >
            {t(STATUS_LABEL_KEY[discussion.status])}
          </div>
        </div>

        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground" title={discussion.topic}>
          {discussion.topic}
        </p>

        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3" aria-hidden />
          <span>{formatDate(discussion.createdAt, i18n.language)}</span>
        </div>
      </div>
    </button>
  )
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ onNewDiscussion }: { readonly onNewDiscussion: () => void }) {
  const { t } = useTranslation('discussions')
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-7 w-7 text-muted-foreground" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{t('list.empty.title')}</p>
        <p className="text-xs text-muted-foreground">
          {t('list.empty.hint')}
        </p>
      </div>
      <Button size="sm" className="gap-1.5 text-xs" onClick={onNewDiscussion}>
        <Plus className="h-3.5 w-3.5" aria-hidden />
        {t('list.newDiscussion')}
      </Button>
    </div>
  )
}

// ─── DiscussionsList ───────────────────────────────────────────────────────

export function DiscussionsList({
  open,
  onOpenChange,
  discussions,
  onSelectDiscussion,
  onNewDiscussion,
  onOpenFacilitators,
}: DiscussionsListProps) {
  const { t } = useTranslation('discussions')
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0"
        aria-label={t('list.panelLabel')}
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">{t('list.title')}</SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={onOpenFacilitators}
                aria-label={t('list.facilitatorsLabel')}
              >
                <UserRoundCog className="h-3.5 w-3.5" aria-hidden />
                {t('list.facilitators')}
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={onNewDiscussion}
                aria-label={t('list.newDiscussionLabel')}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                {t('list.newDiscussion')}
              </Button>
            </div>
          </div>
          <SheetDescription className="sr-only">
            {t('list.description')}
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <div
          className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
          role="list"
          aria-label={t('list.listLabel')}
        >
          {discussions.length === 0 ? (
            <EmptyState onNewDiscussion={onNewDiscussion} />
          ) : (
            discussions.map((discussion) => (
              <div key={discussion.id} role="listitem">
                <DiscussionRow
                  discussion={discussion}
                  // Selecting only delegates to the parent. Do NOT also call
                  // onOpenChange(false) here: the parent switches the active panel
                  // to the discussion detail, and because panels are mutually
                  // exclusive (use-panel.ts) that already closes this list. Calling
                  // onOpenChange(false) in the same tick fires closePanel(), which
                  // writes the panel atom *after* the open and clobbers it back to
                  // 'none' — so the detail panel never appears.
                  onSelect={() => onSelectDiscussion(discussion)}
                />
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
