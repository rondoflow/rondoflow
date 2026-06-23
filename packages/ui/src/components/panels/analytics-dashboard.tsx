'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bot,
  MessageSquare,
  Clock,
  Puzzle,
  DollarSign,
  Coins,
  Activity,
  Loader2,
  BarChart3,
} from 'lucide-react'
import { apiGet } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { getModelColor, formatModelLabel } from '@/lib/model-display'
import type { TFunction } from 'i18next'

// ─── Types ──────────────────────────────────────────────────────────────────

interface DayPoint {
  readonly date: string
  readonly costUsd: number
  readonly inputTokens: number
  readonly outputTokens: number
  readonly sessions: number
}

interface WorkspacePoint {
  readonly workspaceId: string | null
  readonly name: string
  readonly inputTokens: number
  readonly outputTokens: number
  readonly costUsd: number
  readonly sessions: number
}

interface CostData {
  readonly period: { days: number; since: string }
  readonly total: {
    costUsd: number
    inputTokens: number
    outputTokens: number
    sessions: number
  }
  readonly byModel: Record<
    string,
    { inputTokens: number; outputTokens: number; costUsd: number; count: number }
  >
  readonly byDay?: readonly DayPoint[]
  readonly byWorkspace?: readonly WorkspacePoint[]
}

type Metric = 'cost' | 'tokens'

interface Counts {
  readonly agents: number
  readonly runningAgents: number
  readonly discussions: number
  readonly schedules: number
  readonly activeSchedules: number
  readonly skills: number
}

const PERIODS: readonly number[] = [7, 30, 90]

// Per-workspace bar palette (model colors come from @/lib/model-display).
const WORKSPACE_COLORS: readonly string[] = ['#60a5fa', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#22d3ee']

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  readonly icon: React.ElementType
  readonly label: string
  readonly value: string | number
  readonly accent?: string
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <Icon className={`h-4 w-4 ${accent ?? 'text-muted-foreground'}`} aria-hidden />
      <p className="mt-1.5 text-xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

// ─── CSS bar ──────────────────────────────────────────────────────────────────

function MetricBar({
  label,
  value,
  maxValue,
  color,
  display,
}: {
  readonly label: string
  readonly value: number
  readonly maxValue: number
  readonly color: string
  readonly display: string
}) {
  const pct = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 truncate text-right text-[10px] text-muted-foreground">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-[10px] text-muted-foreground">{display}</span>
    </div>
  )
}

// ─── Time-series chart (CSS bars) ─────────────────────────────────────────────

function formatDay(date: string, locale: string): string {
  // date is 'YYYY-MM-DD' — render as e.g. "Jun 1" without timezone drift.
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1))
  return formatDate(dt, locale, { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

function TimeSeriesChart({
  points,
  metric,
  color,
  t,
  locale,
}: {
  readonly points: readonly DayPoint[]
  readonly metric: Metric
  readonly color: string
  readonly t: TFunction<'analytics'>
  readonly locale: string
}) {
  const valueOf = (p: DayPoint) =>
    metric === 'cost' ? p.costUsd : p.inputTokens + p.outputTokens
  const format = (v: number) =>
    metric === 'cost'
      ? t('dashboard.chart.costValue', { amount: v.toFixed(4) })
      : t('dashboard.chart.tokensValue', { amount: (v / 1000).toFixed(1) })

  const max = Math.max(...points.map(valueOf), 0)
  const metricLabel = metric === 'cost' ? t('dashboard.metric.cost') : t('dashboard.metric.tokens')

  // Every day is zero for this metric — bars would all be invisible, so show a note.
  if (max === 0) {
    return (
      <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-border/60">
        <p className="text-[11px] text-muted-foreground">
          {t('dashboard.chart.noneRecorded', { metric: metricLabel.toLowerCase() })}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div
        className="flex h-28 items-end gap-px"
        role="img"
        aria-label={t('dashboard.chart.ariaPerDay', { label: metricLabel, count: points.length })}
      >
        {points.map((p) => {
          const v = valueOf(p)
          const pct = (v / max) * 100
          return (
            <div
              key={p.date}
              aria-hidden
              className="min-w-px flex-1 rounded-sm transition-all hover:opacity-80"
              style={{
                height: `${v > 0 ? Math.max(pct, 3) : 0}%`,
                backgroundColor: color,
              }}
              title={t('dashboard.chart.barTitle', { day: formatDay(p.date, locale), value: format(v) })}
            />
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
        <span>{formatDay(points[0].date, locale)}</span>
        <span>{formatDay(points[points.length - 1].date, locale)}</span>
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const { t, i18n } = useTranslation('analytics')
  const [days, setDays] = useState(30)
  const [metric, setMetric] = useState<Metric>('cost')
  const [cost, setCost] = useState<CostData | null>(null)
  const [counts, setCounts] = useState<Counts | null>(null)
  const [loading, setLoading] = useState(true)

  // Entity counts are period-independent — fetch once on mount.
  useEffect(() => {
    let cancelled = false
    async function loadCounts() {
      const safe = async <T,>(path: string): Promise<T[]> => {
        try {
          return (await apiGet<T[]>(path)) ?? []
        } catch {
          return []
        }
      }
      const [agents, discussions, schedules, skills] = await Promise.all([
        safe<{ status?: string }>('/api/agents'),
        safe<unknown>('/api/discussions'),
        safe<{ enabled?: boolean }>('/api/schedules'),
        safe<unknown>('/api/skills'),
      ])
      if (cancelled) return
      setCounts({
        agents: agents.length,
        runningAgents: agents.filter((a) => a.status === 'running').length,
        discussions: discussions.length,
        schedules: schedules.length,
        activeSchedules: schedules.filter((s) => s.enabled).length,
        skills: skills.length,
      })
    }
    void loadCounts()
    return () => {
      cancelled = true
    }
  }, [])

  // Cost/usage depends on the selected period.
  const loadCost = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiGet<CostData>(`/api/analytics/cost?days=${days}`)
      setCost(result)
    } catch {
      setCost(null)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    void loadCost()
  }, [loadCost])

  const totalTokens = cost ? cost.total.inputTokens + cost.total.outputTokens : 0
  const modelEntries = cost ? Object.entries(cost.byModel) : []
  const maxCost = modelEntries.length > 0 ? Math.max(...modelEntries.map(([, v]) => v.costUsd)) : 0
  const workspaceEntries = cost?.byWorkspace ?? []
  const maxWorkspaceCost =
    workspaceEntries.length > 0 ? Math.max(...workspaceEntries.map((w) => w.costUsd)) : 0

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Period selector */}
      <div className="flex items-center gap-1.5">
        <span className="mr-auto text-[10px] uppercase tracking-wider text-muted-foreground">
          {t('dashboard.overview')}
        </span>
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setDays(p)}
            className={`rounded-full border px-2.5 py-0.5 text-[10px] transition-colors ${
              days === p
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {t('dashboard.periodDays', { count: p })}
          </button>
        ))}
      </div>

      {/* Entity counts */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Bot}
          label={counts ? t('dashboard.card.assistantsRunning', { count: counts.runningAgents }) : t('dashboard.card.assistants')}
          value={counts?.agents ?? '—'}
          accent="text-blue-400"
        />
        <StatCard
          icon={MessageSquare}
          label={t('dashboard.card.discussions')}
          value={counts?.discussions ?? '—'}
          accent="text-purple-400"
        />
        <StatCard
          icon={Clock}
          label={counts ? t('dashboard.card.schedulesActive', { count: counts.activeSchedules }) : t('dashboard.card.schedules')}
          value={counts?.schedules ?? '—'}
          accent="text-amber-400"
        />
        <StatCard
          icon={Puzzle}
          label={t('dashboard.card.skills')}
          value={counts?.skills ?? '—'}
          accent="text-emerald-400"
        />
      </div>

      {/* Usage summary */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          {t('dashboard.usage.heading', { count: days })}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !cost || cost.total.sessions === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t('dashboard.usage.empty.title')}</p>
            <p className="text-xs text-muted-foreground/70">
              {t('dashboard.usage.empty.hint')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon={DollarSign}
                label={t('dashboard.card.totalCost')}
                value={`$${cost.total.costUsd.toFixed(2)}`}
                accent="text-green-400"
              />
              <StatCard
                icon={Activity}
                label={t('dashboard.card.sessions')}
                value={cost.total.sessions}
              />
              <StatCard
                icon={Coins}
                label={t('dashboard.card.tokens')}
                value={`${(totalTokens / 1000).toFixed(1)}k`}
              />
            </div>

            {/* Time-series chart: cost / tokens per day */}
            {cost.byDay && cost.byDay.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium">
                    {t('dashboard.chart.title', {
                      metric: metric === 'cost' ? t('dashboard.metric.cost') : t('dashboard.metric.tokens'),
                    })}
                    <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                      {metric === 'cost'
                        ? t('dashboard.chart.totalCost', { amount: cost.total.costUsd.toFixed(2) })
                        : t('dashboard.chart.totalTokens', { amount: (totalTokens / 1000).toFixed(1) })}
                    </span>
                  </p>
                  <div className="flex items-center gap-1">
                    {(['cost', 'tokens'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMetric(m)}
                        className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
                          metric === m
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {m === 'cost' ? t('dashboard.metric.cost') : t('dashboard.metric.tokens')}
                      </button>
                    ))}
                  </div>
                </div>
                <TimeSeriesChart
                  points={cost.byDay}
                  metric={metric}
                  color={metric === 'cost' ? '#34d399' : '#60a5fa'}
                  t={t}
                  locale={i18n.language}
                />
              </div>
            )}

            {/* Cost by model */}
            {modelEntries.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium">{t('dashboard.costByModel')}</p>
                <div className="flex flex-col gap-2">
                  {modelEntries.map(([model, stats]) => (
                    <MetricBar
                      key={model}
                      label={formatModelLabel(model)}
                      value={stats.costUsd}
                      maxValue={maxCost}
                      color={getModelColor(model)}
                      display={`$${stats.costUsd.toFixed(4)}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Token split */}
            <div>
              <p className="mb-2 text-xs font-medium">{t('dashboard.tokenSplit')}</p>
              <div className="flex flex-col gap-2">
                <MetricBar
                  label={t('dashboard.tokenInput')}
                  value={cost.total.inputTokens}
                  maxValue={totalTokens}
                  color="#60a5fa"
                  display={`${(cost.total.inputTokens / 1000).toFixed(1)}k`}
                />
                <MetricBar
                  label={t('dashboard.tokenOutput')}
                  value={cost.total.outputTokens}
                  maxValue={totalTokens}
                  color="#34d399"
                  display={`${(cost.total.outputTokens / 1000).toFixed(1)}k`}
                />
              </div>
            </div>

            {/* Cost by workspace */}
            {workspaceEntries.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium">{t('dashboard.costByWorkspace')}</p>
                <div className="flex flex-col gap-2">
                  {workspaceEntries.map((ws, i) => (
                    <MetricBar
                      key={ws.workspaceId ?? `none-${i}`}
                      label={ws.name}
                      value={ws.costUsd}
                      maxValue={maxWorkspaceCost}
                      color={WORKSPACE_COLORS[i % WORKSPACE_COLORS.length]}
                      display={`$${ws.costUsd.toFixed(4)}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
