'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, Bot, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { apiGet } from '@/lib/api'
import { formatDate, formatTime as formatTimeIntl } from '@/lib/format'
import type { TFunction } from 'i18next'
import { ScopeToggle, type ActivityScope } from './scope-toggle'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ActivityEvent {
  readonly id: string
  readonly type: string
  readonly title: string
  readonly detail?: string
  readonly agentId?: string
  readonly workspaceId?: string
  readonly createdAt: string
}

interface ActivityFeedProps {
  readonly workspaceId?: string | null
}

// ─── Event icon ─────────────────────────────────────────────────────────────

const EVENT_ICONS: Record<string, React.ElementType> = {
  agent_started: Bot,
  agent_completed: CheckCircle2,
  agent_error: AlertCircle,
}

function EventIcon({ type }: { readonly type: string }) {
  const Icon = EVENT_ICONS[type] ?? Activity
  return <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
}

// ─── Date grouping ──────────────────────────────────────────────────────────

function formatGroupDate(dateStr: string, t: TFunction<'analytics'>, locale: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return t('activity.group.today')
  if (date.toDateString() === yesterday.toDateString()) return t('activity.group.yesterday')
  return formatDate(date, locale, { month: 'short', day: 'numeric' })
}

function formatTime(dateStr: string, locale: string): string {
  return formatTimeIntl(dateStr, locale, { hour: '2-digit', minute: '2-digit' })
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ActivityFeed({ workspaceId }: ActivityFeedProps) {
  const { t, i18n } = useTranslation('analytics')
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  // Most activity (assistant create/delete, user management, approvals) carries
  // no workspace, so default to the team-wide view; the toggle narrows to the
  // current workspace when one is open.
  const [scope, setScope] = useState<ActivityScope>('global')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (scope === 'workspace' && workspaceId) params.set('workspaceId', workspaceId)

      const data = await apiGet<ActivityEvent[]>(`/api/activity?${params}`)
      setEvents(data)
    } catch {
      // Best effort
    } finally {
      setLoading(false)
    }
  }, [workspaceId, scope])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  // Group by date
  const grouped = new Map<string, ActivityEvent[]>()
  for (const event of events) {
    const key = formatGroupDate(event.createdAt, t, i18n.language)
    const group = grouped.get(key) ?? []
    group.push(event)
    grouped.set(key, group)
  }

  let body: React.ReactNode
  if (loading) {
    body = (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  } else if (events.length === 0) {
    body = (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Activity className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{t('activity.empty.title')}</p>
        <p className="text-xs text-muted-foreground/70">
          {t('activity.empty.hint')}
        </p>
      </div>
    )
  } else {
    body = (
      <div className="flex flex-col gap-4 p-4">
        {Array.from(grouped.entries()).map(([date, group]) => (
          <div key={date}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {date}
            </p>
            <div className="flex flex-col gap-1">
              {group.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                >
                  <EventIcon type={event.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs">{event.title}</p>
                    {event.detail && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {event.detail}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatTime(event.createdAt, i18n.language)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {workspaceId && (
        <div className="flex items-center justify-end border-b border-border px-3 py-2">
          <ScopeToggle value={scope} onChange={setScope} />
        </div>
      )}
      {body}
    </>
  )
}
