'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity, AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, Download, Info, Loader2, Search, ScrollText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { apiGetWithMeta, apiGetBlob } from '@/lib/api'
import { formatDateTime } from '@/lib/format'
import type { TFunction } from 'i18next'
import {
  describeAuditType,
  type ActivityEvent,
  type ActivityPageMeta,
  type ActivityTypeCount,
  type AuditSeverity,
} from '@rondoflow/shared'
import { ScopeToggle, type ActivityScope } from './scope-toggle'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50

const TIME_RANGES = [
  { value: 1, labelKey: 'audit.range.last24h' },
  { value: 7, labelKey: 'audit.range.last7d' },
  { value: 30, labelKey: 'audit.range.last30d' },
  { value: 0, labelKey: 'audit.range.allTime' },
] as const

const SEVERITY_STYLE: Record<AuditSeverity, string> = {
  info: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  error: 'border-red-500/20 bg-red-500/10 text-red-400',
}

const SEVERITY_ICON: Record<AuditSeverity, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface AuditLogDashboardProps {
  readonly workspaceId?: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string, locale: string): string {
  return formatDateTime(iso, locale, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AuditLogDashboard({ workspaceId }: AuditLogDashboardProps) {
  const { t, i18n } = useTranslation('analytics')
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [meta, setMeta] = useState<ActivityPageMeta>({ total: 0, page: 1, limit: PAGE_SIZE })
  const [typeCounts, setTypeCounts] = useState<ActivityTypeCount[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const search = useDebounced(searchInput, 300)
  const [typeFilter, setTypeFilter] = useState('')
  const [rangeDays, setRangeDays] = useState<number>(7)
  // The audit log is team-wide; most events carry no workspace, so default to
  // the global view and let the toggle narrow to the current workspace.
  const [scope, setScope] = useState<ActivityScope>('global')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Only scope by workspace when the user explicitly asked for it (and one is open).
  const scopedWorkspaceId = scope === 'workspace' ? workspaceId : null

  // Build the shared filter params (without pagination).
  const filterParams = useMemo(() => {
    const params = new URLSearchParams()
    if (scopedWorkspaceId) params.set('workspaceId', scopedWorkspaceId)
    if (typeFilter) params.set('type', typeFilter)
    if (search.trim()) params.set('search', search.trim())
    if (rangeDays > 0) {
      params.set('from', new Date(Date.now() - rangeDays * 86_400_000).toISOString())
    }
    return params
  }, [scopedWorkspaceId, typeFilter, search, rangeDays])

  // A workspace/scope switch changes the whole filter universe — start from page 1.
  useEffect(() => { setPage(1) }, [scopedWorkspaceId])

  // Fetch the current page. A per-effect `ignore` flag drops stale responses so
  // an earlier-but-slower request can never overwrite a later one. `reloadKey`
  // lets the Retry button re-run the same query.
  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams(filterParams)
    params.set('page', String(page))
    params.set('limit', String(PAGE_SIZE))
    apiGetWithMeta<ActivityEvent[], ActivityPageMeta>(`/api/activity?${params}`)
      .then(({ data, meta: m }) => {
        if (ignore) return
        setEvents(data)
        if (m) setMeta(m)
      })
      .catch((e) => {
        if (ignore) return
        setError(e instanceof Error ? e.message : t('audit.loadError'))
        setEvents([])
      })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [filterParams, page, reloadKey, t])

  // Type counts power the filter dropdown — scoped only by workspace so the
  // option set stays stable as the user narrows other filters.
  useEffect(() => {
    const params = new URLSearchParams()
    if (scopedWorkspaceId) params.set('workspaceId', scopedWorkspaceId)
    apiGetWithMeta<ActivityTypeCount[]>(`/api/activity/types?${params}`)
      .then(({ data }) => setTypeCounts(data))
      .catch(() => setTypeCounts([]))
  }, [scopedWorkspaceId])

  // If the selected type vanishes from the (refetched) option set, clear it so
  // the controlled <select> never holds an unrepresented value.
  useEffect(() => {
    if (typeFilter && typeCounts.length > 0 && !typeCounts.some((tc) => tc.type === typeFilter)) {
      setTypeFilter('')
      setPage(1)
    }
  }, [typeCounts, typeFilter])

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const blob = await apiGetBlob(`/api/activity/export?${filterParams}`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'audit-log.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      // best-effort — surfaced via the disabled spinner state only
    } finally {
      setExporting(false)
    }
  }, [filterParams])

  const totalPages = Math.max(1, Math.ceil(meta.total / PAGE_SIZE))

  return (
    <div className="flex h-full flex-col">
      {/* Filter bar */}
      <div className="flex flex-col gap-2 border-b border-border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
              placeholder={t('audit.search.placeholder')}
              aria-label={t('audit.search.ariaLabel')}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <FilterSelect
            label={t('audit.filter.eventType')}
            value={typeFilter}
            onChange={(v) => { setTypeFilter(v); setPage(1) }}
            options={[
              { value: '', label: t('audit.filter.allTypes') },
              ...typeCounts.map((tc) => ({
                value: tc.type,
                label: t('audit.filter.typeOption', { label: describeAuditType(tc.type).label, count: tc.count }),
              })),
            ]}
          />

          <FilterSelect
            label={t('audit.filter.timeRange')}
            value={String(rangeDays)}
            onChange={(v) => { setRangeDays(Number(v)); setPage(1) }}
            options={TIME_RANGES.map((r) => ({ value: String(r.value), label: t(r.labelKey) }))}
          />

          {workspaceId && (
            <ScopeToggle value={scope} onChange={(v) => { setScope(v); setPage(1) }} />
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={handleExport}
            disabled={exporting || meta.total === 0}
          >
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {t('audit.exportCsv')}
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {loading ? t('common:status.loading') : t('audit.count', { count: meta.total })}
          {!loading && search.trim() && t('audit.matchingFilters')}
        </p>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-red-400" aria-hidden />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)}>{t('common:action.retry')}</Button>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <ScrollText className="h-8 w-8 text-muted-foreground/50" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('audit.emptyFiltered')}</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">{t('audit.column.time')}</th>
                <th className="px-3 py-2 font-medium">{t('audit.column.type')}</th>
                <th className="px-3 py-2 font-medium">{t('audit.column.event')}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <AuditRow
                  key={event.id}
                  event={event}
                  expanded={expandedId === event.id}
                  onToggle={() => setExpandedId((id) => (id === event.id ? null : event.id))}
                  t={t}
                  locale={i18n.language}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && meta.total > 0 && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <span className="text-[11px] text-muted-foreground">
            {t('audit.pagination.pageOf', { page: meta.page, total: totalPages })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm" className="h-7 w-7 p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
              aria-label={t('audit.pagination.previous')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" size="sm" className="h-7 w-7 p-0"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={meta.page >= totalPages}
              aria-label={t('audit.pagination.next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function AuditRow({
  event,
  expanded,
  onToggle,
  t,
  locale,
}: {
  readonly event: ActivityEvent
  readonly expanded: boolean
  readonly onToggle: () => void
  readonly t: TFunction<'analytics'>
  readonly locale: string
}) {
  const descriptor = describeAuditType(event.type)
  const Icon = SEVERITY_ICON[descriptor.severity] ?? Activity
  const hasMetadata = !!event.metadata && Object.keys(event.metadata).length > 0

  return (
    <>
      <tr
        className="cursor-pointer border-b border-border/50 align-top transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
      >
        <td className="whitespace-nowrap px-3 py-2 text-[11px] text-muted-foreground">
          {formatTimestamp(event.createdAt, locale)}
        </td>
        <td className="px-3 py-2">
          <Badge
            variant="outline"
            className={cn('gap-1 whitespace-nowrap text-[10px] font-medium', SEVERITY_STYLE[descriptor.severity])}
          >
            <Icon className="h-3 w-3" aria-hidden />
            {descriptor.label}
          </Badge>
        </td>
        <td className="px-3 py-2">
          <div className="flex items-start gap-1.5">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{event.title}</p>
              {event.detail && (
                <p className={cn('text-[11px] text-muted-foreground', !expanded && 'line-clamp-1')}>
                  {event.detail}
                </p>
              )}
            </div>
            {(hasMetadata || event.detail) && (
              <ChevronDown
                className={cn(
                  'mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
                  expanded && 'rotate-180',
                )}
                aria-hidden
              />
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border/50 bg-muted/20">
          <td colSpan={3} className="px-3 py-2">
            <dl className="flex flex-col gap-1 text-[11px]">
              <DetailRow label={t('audit.detail.category')} value={descriptor.category} />
              <DetailRow label={t('audit.detail.eventId')} value={event.id} mono />
              {event.agentId && <DetailRow label={t('audit.detail.assistantId')} value={event.agentId} mono />}
              {event.workspaceId && <DetailRow label={t('audit.detail.workspaceId')} value={event.workspaceId} mono />}
            </dl>
            {hasMetadata && (
              <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-background/60 p-2 text-[10px] text-muted-foreground">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

function DetailRow({ label, value, mono }: { readonly label: string; readonly value: string; readonly mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn('min-w-0 break-all text-foreground', mono && 'font-mono')}>{value}</dd>
    </div>
  )
}

// ─── Filter select ─────────────────────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly options: readonly { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={cn(
          'h-8 appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 text-xs',
          'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </div>
  )
}
