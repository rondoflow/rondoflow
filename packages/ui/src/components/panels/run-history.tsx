'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  GitBranch,
  Clock,
  Hash,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Square,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SessionCardSkeleton } from '@/components/ui/loading-skeleton'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { apiGet, apiGetWithMeta } from '@/lib/api'
import { formatDateTime, formatNumber } from '@/lib/format'
import { WorkflowLogView } from '@/components/panels/workflow-chat'
import type { WorkflowLogEntry } from '@/components/panels/workflow-chat'
import { runToLogEntries, type RunSummary, type RunDetail } from '@/lib/run-history'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface RunHistoryProps {
  /** Triggers the list fetch when the panel becomes visible. */
  readonly open: boolean
  /** When set, only runs from this workspace are listed. */
  readonly workspaceId?: string | null
  /** Push the selected run back into the main workflow execution log. */
  readonly onRestore?: (run: RunDetail) => void
}

// ─── Status badge ────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { labelKey: string; className: string; Icon: typeof CheckCircle2 }> = {
  running: { labelKey: 'run.status.running', className: 'border-primary/30 text-primary', Icon: Loader2 },
  completed: { labelKey: 'run.status.completed', className: 'border-green-500/30 text-green-500', Icon: CheckCircle2 },
  failed: { labelKey: 'run.status.failed', className: 'border-destructive/30 text-destructive', Icon: AlertCircle },
  stopped: { labelKey: 'run.status.stopped', className: 'border-amber-500/30 text-amber-400', Icon: Square },
}

function StatusBadge({ status }: { readonly status: string }) {
  const { t } = useTranslation('analytics')
  const meta = STATUS_META[status]
  const Icon = meta?.Icon ?? GitBranch
  const className = meta?.className ?? 'border-border text-muted-foreground'
  return (
    <Badge variant="outline" className={cn('gap-1 text-[10px] px-1.5 py-0', className)}>
      <Icon className={cn('h-2.5 w-2.5', status === 'running' && 'animate-spin')} aria-hidden />
      {meta ? t(meta.labelKey) : status}
    </Badge>
  )
}

function formatWhen(iso: string, locale: string): string {
  return formatDateTime(iso, locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** How many runs to fetch per page (matches the server's accepted range). */
const PAGE_SIZE = 50

// ─── Component ─────────────────────────────────────────────────────────────

export function RunHistory({ open, workspaceId, onRestore }: RunHistoryProps) {
  const { t, i18n } = useTranslation('analytics')
  const [runs, setRuns] = useState<RunSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [detail, setDetail] = useState<RunDetail | null>(null)
  const [detailLog, setDetailLog] = useState<WorkflowLogEntry[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  // Fetch the first page whenever the panel opens (or the workspace changes).
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setPage(1)
    const params = new URLSearchParams({ page: '1', limit: String(PAGE_SIZE) })
    if (workspaceId) params.set('workspaceId', workspaceId)
    apiGetWithMeta<RunSummary[], { total: number }>(`/api/runs?${params.toString()}`)
      .then(({ data, meta }) => { if (!cancelled) { setRuns(data); setTotal(meta?.total ?? data.length) } })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : t('run.list.loadError')) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [open, workspaceId, t])

  // Append the next page; a failure surfaces as a toast and keeps the list intact.
  const loadMore = useCallback(async () => {
    const next = page + 1
    setLoadingMore(true)
    try {
      const params = new URLSearchParams({ page: String(next), limit: String(PAGE_SIZE) })
      if (workspaceId) params.set('workspaceId', workspaceId)
      const { data, meta } = await apiGetWithMeta<RunSummary[], { total: number }>(`/api/runs?${params.toString()}`)
      setRuns((prev) => [...prev, ...data])
      setTotal((prev) => meta?.total ?? prev)
      setPage(next)
    } catch (e: unknown) {
      toast({ description: e instanceof Error ? e.message : t('run.list.loadError'), variant: 'error' })
    } finally {
      setLoadingMore(false)
    }
  }, [page, workspaceId, t])

  // Reset to the list view each time the panel is reopened.
  useEffect(() => {
    if (!open) { setDetail(null); setDetailLog([]) }
  }, [open])

  const handleSelect = useCallback(async (chainId: string) => {
    setDetailLoading(true)
    try {
      const run = await apiGet<RunDetail>(`/api/runs/${chainId}`)
      setDetail(run)
      setDetailLog(runToLogEntries(run))
    } catch (e: unknown) {
      setDetail(null)
      setDetailLog([])
      toast({ description: e instanceof Error ? e.message : t('run.detail.loadError'), variant: 'error' })
    } finally {
      setDetailLoading(false)
    }
  }, [t])

  // ── Detail view ──
  if (detail) {
    return (
      <div className="flex h-full flex-col bg-background">
        <header className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 shrink-0 p-0"
              onClick={() => { setDetail(null); setDetailLog([]) }}
              aria-label={t('run.detail.back')}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{detail.initialMessage || t('run.detail.fallbackTitle')}</p>
              <span className="text-[10px] text-muted-foreground">{formatWhen(detail.createdAt, i18n.language)}</span>
            </div>
            <StatusBadge status={detail.status} />
            {onRestore && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-[10px] text-muted-foreground"
                onClick={() => onRestore(detail)}
                title={t('run.detail.openTooltip')}
              >
                <ExternalLink className="h-3 w-3" aria-hidden />
                {t('run.detail.open')}
              </Button>
            )}
          </div>
        </header>
        <WorkflowLogView
          log={detailLog}
          autoScroll={false}
          emptyTitle={t('run.detail.emptyTitle')}
          emptyHint={t('run.detail.emptyHint')}
        />
      </div>
    )
  }

  // ── List view ──
  return (
    <div className="flex h-full flex-col bg-background">
      <header className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t('run.list.title')}</p>
            <span className="text-[10px] text-muted-foreground">
              {loading ? t('common:status.loading') : t('run.list.count', { count: runs.length })}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {detailLoading && (
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> {t('run.list.loadingRun')}
          </div>
        )}

        {loading ? (
          <ul className="flex flex-col gap-1.5" aria-busy>
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <SessionCardSkeleton />
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
            <p className="text-sm font-medium">{t('run.list.errorTitle')}</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        ) : runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <GitBranch className="h-6 w-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm font-medium">{t('run.list.emptyTitle')}</p>
            <p className="text-xs text-muted-foreground">{t('run.list.emptyHint')}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {runs.map((run) => (
              <li key={run.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(run.chainId)}
                  className="group flex w-full items-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{run.initialMessage || t('run.detail.fallbackTitle')}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" aria-hidden /> {formatWhen(run.createdAt, i18n.language)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="h-2.5 w-2.5" aria-hidden /> {t('run.list.steps', { done: run.stepCount, total: run.totalSteps })}
                      </span>
                      {(run.tokensIn + run.tokensOut) > 0 && (
                        <span>{t('run.list.tokens', { amount: formatNumber(run.tokensIn + run.tokensOut, i18n.language) })}</span>
                      )}
                      {run.costUsd > 0 && <span>{t('run.list.cost', { amount: run.costUsd.toFixed(4) })}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge status={run.status} />
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </div>
                </button>
              </li>
            ))}
            {runs.length < total && (
              <li>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-8 w-full gap-1.5 text-xs text-muted-foreground"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                  {loadingMore ? t('common:status.loading') : t('run.list.loadMore', { remaining: total - runs.length })}
                </Button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
