'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Coins,
  Database,
  FileText,
  FolderOpen,
  Hash,
  Layers,
  Loader2,
  Play,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { apiGet } from '@/lib/api'
import { formatDateTime, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface WorkspaceInfo {
  readonly id: string
  readonly name: string
  readonly workingDirectory: string | null
  readonly createdAt: string
  readonly updatedAt: string
  readonly hasContextDocument: boolean
  readonly hasPlanDocument: boolean
  readonly canvas: {
    readonly layoutCount: number
    readonly nodeCount: number
    readonly edgeCount: number
    readonly lastUpdated: string | null
  }
  readonly resources: {
    readonly total: number
    readonly byType: Readonly<Record<string, number>>
  }
  readonly memories: { readonly count: number }
  readonly runs: {
    readonly total: number
    readonly completed: number
    readonly failed: number
    readonly running: number
    readonly stopped: number
    readonly byStatus: Readonly<Record<string, number>>
    readonly totalSteps: number
    readonly firstRunAt: string | null
    readonly lastRunAt: string | null
    readonly avgDurationMs: number
    readonly totalDurationMs: number
    readonly maxDurationMs: number
  }
  readonly usage: {
    readonly costUsd: number
    readonly inputTokens: number
    readonly outputTokens: number
    readonly sessions: number
  }
  readonly activity: {
    readonly total: number
    readonly lastAt: string | null
    readonly lastTitle: string | null
  }
}

export interface WorkspaceInfoDialogProps {
  /** The workspace to show info for; null closes the dialog. */
  readonly workspaceId: string | null
  readonly onClose: () => void
}

// ─── Formatting ──────────────────────────────────────────────────────────────

function formatDurationMs(ms: number): string {
  if (ms <= 0) return '0s'
  const totalSec = Math.round(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatCost(usd: number): string {
  if (usd === 0) return '$0.00'
  if (usd < 0.01) return '<$0.01'
  return `$${usd.toFixed(2)}`
}

// ─── Small presentational pieces ─────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  readonly icon: LucideIcon
  readonly label: string
  readonly value: string | number
  readonly hint?: string
  readonly tone?: 'default' | 'success' | 'danger' | 'active'
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            tone === 'success' && 'text-green-400',
            tone === 'danger' && 'text-destructive',
            tone === 'active' && 'text-primary',
          )}
          aria-hidden
        />
        {label}
      </div>
      <div className="text-lg font-semibold leading-none">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  )
}

function Section({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { readonly label: string; readonly value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium">{value}</span>
    </div>
  )
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

/**
 * Read-only modal showing a workspace's configuration and run statistics
 * (path, run counts, failures, durations, token cost, canvas/resource sizes).
 * Fetches `/api/workspaces/:id/info` whenever a workspaceId is supplied.
 */
export function WorkspaceInfoDialog({ workspaceId, onClose }: WorkspaceInfoDialogProps) {
  const { t, i18n } = useTranslation('shell')
  const [info, setInfo] = useState<WorkspaceInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!workspaceId) return
    let cancelled = false
    setInfo(null)
    setError(null)
    setLoading(true)
    apiGet<WorkspaceInfo>(`/api/workspaces/${workspaceId}/info`)
      .then((data) => {
        if (!cancelled) setInfo(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [workspaceId])

  const locale = i18n.language

  return (
    <Dialog open={!!workspaceId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
            <span className="truncate">{info?.name ?? t('info.title')}</span>
          </DialogTitle>
          <DialogDescription>{t('info.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[calc(85vh-7rem)] flex-col gap-5 overflow-y-auto py-4 pr-1">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t('info.loading')}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              {error}
            </div>
          )}

          {info && !loading && (
            <>
              {/* Run stats — the headline numbers */}
              <Section title={t('info.section.runs')}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatCard icon={Workflow} label={t('info.stat.totalRuns')} value={formatNumber(info.runs.total, locale)} />
                  <StatCard icon={CheckCircle2} tone="success" label={t('info.stat.completed')} value={formatNumber(info.runs.completed, locale)} />
                  <StatCard icon={AlertCircle} tone="danger" label={t('info.stat.failed')} value={formatNumber(info.runs.failed, locale)} />
                  <StatCard icon={Play} tone="active" label={t('info.stat.running')} value={formatNumber(info.runs.running, locale)} />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatCard icon={Clock} label={t('info.stat.avgDuration')} value={formatDurationMs(info.runs.avgDurationMs)} />
                  <StatCard icon={Clock} label={t('info.stat.maxDuration')} value={formatDurationMs(info.runs.maxDurationMs)} />
                  <StatCard icon={Clock} label={t('info.stat.totalDuration')} value={formatDurationMs(info.runs.totalDurationMs)} />
                  <StatCard icon={Hash} label={t('info.stat.totalSteps')} value={formatNumber(info.runs.totalSteps, locale)} />
                </div>
                <div className="rounded-lg border border-border">
                  <div className="flex flex-col px-3 py-1">
                    <Row label={t('info.field.lastRun')} value={info.runs.lastRunAt ? formatDateTime(info.runs.lastRunAt, locale) : '—'} />
                    <Row label={t('info.field.firstRun')} value={info.runs.firstRunAt ? formatDateTime(info.runs.firstRunAt, locale) : '—'} />
                    {info.runs.stopped > 0 && (
                      <Row label={t('info.field.stopped')} value={formatNumber(info.runs.stopped, locale)} />
                    )}
                  </div>
                </div>
              </Section>

              {/* Token usage / cost */}
              <Section title={t('info.section.usage')}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatCard icon={Coins} label={t('info.stat.cost')} value={formatCost(info.usage.costUsd)} />
                  <StatCard icon={Activity} label={t('info.stat.sessions')} value={formatNumber(info.usage.sessions, locale)} />
                  <StatCard icon={Hash} label={t('info.stat.inputTokens')} value={formatNumber(info.usage.inputTokens, locale)} />
                  <StatCard icon={Hash} label={t('info.stat.outputTokens')} value={formatNumber(info.usage.outputTokens, locale)} />
                </div>
              </Section>

              {/* Configuration */}
              <Section title={t('info.section.config')}>
                <div className="rounded-lg border border-border px-3 py-1">
                  <Row
                    label={t('info.field.workingDirectory')}
                    value={
                      info.workingDirectory ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{info.workingDirectory}</code>
                      ) : (
                        <span className="text-muted-foreground">{t('info.field.notSet')}</span>
                      )
                    }
                  />
                  <Row label={t('info.field.created')} value={formatDateTime(info.createdAt, locale)} />
                  <Row label={t('info.field.updated')} value={formatDateTime(info.updatedAt, locale)} />
                  <Row
                    label={t('info.field.documents')}
                    value={
                      <span className="flex flex-wrap justify-end gap-1">
                        {info.hasContextDocument && <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[10px]"><FileText className="h-3 w-3" aria-hidden />{t('info.field.contextDoc')}</Badge>}
                        {info.hasPlanDocument && <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[10px]"><FileText className="h-3 w-3" aria-hidden />{t('info.field.planDoc')}</Badge>}
                        {!info.hasContextDocument && !info.hasPlanDocument && <span className="text-muted-foreground">{t('info.field.none')}</span>}
                      </span>
                    }
                  />
                  <Row label={t('info.field.workspaceId')} value={<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{info.id}</code>} />
                </div>
              </Section>

              {/* Canvas + content */}
              <Section title={t('info.section.content')}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatCard icon={Workflow} label={t('info.stat.nodes')} value={formatNumber(info.canvas.nodeCount, locale)} />
                  <StatCard icon={Workflow} label={t('info.stat.edges')} value={formatNumber(info.canvas.edgeCount, locale)} />
                  <StatCard icon={Database} label={t('info.stat.resources')} value={formatNumber(info.resources.total, locale)} />
                  <StatCard icon={Layers} label={t('info.stat.memories')} value={formatNumber(info.memories.count, locale)} />
                </div>
                {Object.keys(info.resources.byType).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(info.resources.byType).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="px-1.5 py-0 text-[10px] font-medium">
                        {type}: {formatNumber(count, locale)}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="rounded-lg border border-border px-3 py-1">
                  <Row label={t('info.field.canvasLayouts')} value={formatNumber(info.canvas.layoutCount, locale)} />
                  {info.canvas.lastUpdated && (
                    <Row label={t('info.field.canvasUpdated')} value={formatDateTime(info.canvas.lastUpdated, locale)} />
                  )}
                  <Row label={t('info.field.activityEvents')} value={formatNumber(info.activity.total, locale)} />
                  {info.activity.lastAt && (
                    <Row
                      label={t('info.field.lastActivity')}
                      value={
                        <span className="flex flex-col items-end">
                          <span>{formatDateTime(info.activity.lastAt, locale)}</span>
                          {info.activity.lastTitle && (
                            <span className="text-[11px] text-muted-foreground">{info.activity.lastTitle}</span>
                          )}
                        </span>
                      }
                    />
                  )}
                </div>
              </Section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
