'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MessageSquare,
  Calendar,
  Hash,
  Clock,
  DollarSign,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatDate as formatDateIntl } from '@/lib/format'

// ─── Types ─────────────────────────────────────────────────────────────────

interface SessionRecord {
  readonly id: string
  readonly startedAt: Date
  readonly endedAt: Date | null
  readonly messageCount: number
  readonly durationSeconds: number | null
  readonly status: 'active' | 'ended' | 'error'
  readonly estimatedCostUsd: number | null
}

export interface SessionHistoryProps {
  readonly agentId: string
  readonly onSelectSession: (sessionId: string) => void
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(date: Date, locale: string): string {
  return formatDateIntl(date, locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
}

function formatCost(usd: number): string {
  if (usd < 0.001) return '<$0.001'
  return `$${usd.toFixed(3)}`
}

// ─── Status badge ──────────────────────────────────────────────────────────

const SESSION_STATUS_VARIANT: Record<
  SessionRecord['status'],
  'default' | 'secondary' | 'destructive'
> = {
  active: 'default',
  ended: 'secondary',
  error: 'destructive',
}

const SESSION_STATUS_LABEL_KEY: Record<SessionRecord['status'], string> = {
  active: 'session.status.active',
  ended: 'session.status.ended',
  error: 'session.status.error',
}

// ─── Date range filter ─────────────────────────────────────────────────────

interface DateRangeFilter {
  readonly from: string
  readonly to: string
}

function DateRangeFilter({
  value,
  onChange,
  onClear,
}: {
  readonly value: DateRangeFilter
  readonly onChange: (next: DateRangeFilter) => void
  readonly onClear: () => void
}) {
  const { t } = useTranslation('analytics')
  const hasFilter = value.from !== '' || value.to !== ''

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <Input
        type="date"
        value={value.from}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
        className="h-7 w-36 text-xs"
        aria-label={t('session.filter.fromDate')}
      />
      <span className="text-xs text-muted-foreground">{t('session.filter.to')}</span>
      <Input
        type="date"
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        className="h-7 w-36 text-xs"
        aria-label={t('session.filter.toDate')}
      />
      {hasFilter && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={onClear}
          aria-label={t('session.filter.clear')}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </Button>
      )}
    </div>
  )
}

// ─── Session card ──────────────────────────────────────────────────────────

function SessionCard({
  session,
  onSelect,
}: {
  readonly session: SessionRecord
  readonly onSelect: () => void
}) {
  const { t, i18n } = useTranslation('analytics')
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left',
        'transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      aria-label={t('session.card.ariaLabel', { date: formatDate(session.startedAt, i18n.language), count: session.messageCount })}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">
            {t('session.card.prefix')}{' '}
            <span className="font-mono text-muted-foreground">{session.id.slice(0, 8)}</span>
          </p>
          <Badge
            variant={SESSION_STATUS_VARIANT[session.status]}
            className="shrink-0 text-[10px]"
          >
            {t(SESSION_STATUS_LABEL_KEY[session.status])}
          </Badge>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden />
            {formatDate(session.startedAt, i18n.language)}
          </span>
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" aria-hidden />
            {t('session.card.messages', { count: session.messageCount })}
          </span>
          {session.durationSeconds !== null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {formatDuration(session.durationSeconds)}
            </span>
          )}
          {session.estimatedCostUsd !== null && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" aria-hidden />
              {formatCost(session.estimatedCostUsd)}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  )
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { readonly filtered: boolean }) {
  const { t } = useTranslation('analytics')
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          {filtered ? t('session.empty.filteredTitle') : t('session.empty.title')}
        </p>
        <p className="text-xs text-muted-foreground">
          {filtered ? t('session.empty.filteredHint') : t('session.empty.hint')}
        </p>
      </div>
    </div>
  )
}

// ─── SessionHistory ─────────────────────────────────────────────────────────

export function SessionHistory({ agentId: _agentId, onSelectSession }: SessionHistoryProps) {
  const { t } = useTranslation('analytics')
  // In production this would be fetched from the API; we start with an empty list.
  const sessions = useMemo<SessionRecord[]>(() => [], [])

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({ from: '', to: '' })

  const hasFilter = dateFilter.from !== '' || dateFilter.to !== ''

  const filtered = useMemo<SessionRecord[]>(() => {
    if (!hasFilter) return sessions

    const fromDate = dateFilter.from ? new Date(dateFilter.from + 'T00:00:00') : null
    const toDate = dateFilter.to ? new Date(dateFilter.to + 'T23:59:59') : null

    return sessions.filter((s) => {
      if (fromDate && s.startedAt < fromDate) return false
      if (toDate && s.startedAt > toDate) return false
      return true
    })
  }, [sessions, dateFilter, hasFilter])

  function clearFilter() {
    setDateFilter({ from: '', to: '' })
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{t('session.title')}</h2>
        <span className="text-xs text-muted-foreground">
          {t('session.count', { count: sessions.length })}
        </span>
      </header>

      {/* Date range filter */}
      {sessions.length > 0 && (
        <div className="shrink-0 border-b border-border px-4 py-2">
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} onClear={clearFilter} />
        </div>
      )}

      {/* Session list */}
      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
        role="list"
        aria-label={t('session.listAria')}
      >
        {filtered.length === 0 ? (
          <EmptyState filtered={hasFilter} />
        ) : (
          filtered.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onSelect={() => onSelectSession(session.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
