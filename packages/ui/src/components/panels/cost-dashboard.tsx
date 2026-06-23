'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DollarSign, Loader2, BarChart3 } from 'lucide-react'
import { apiGet } from '@/lib/api'
import { getModelColor, formatModelLabel } from '@/lib/model-display'

// ─── Types ──────────────────────────────────────────────────────────────────

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
}

// ─── CSS bar chart ──────────────────────────────────────────────────────────

function CostBar({
  label,
  value,
  maxValue,
  color,
}: {
  readonly label: string
  readonly value: number
  readonly maxValue: number
  readonly color: string
}) {
  const pct = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 0

  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-right text-[10px] text-muted-foreground">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-muted h-3">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-16 shrink-0 text-[10px] text-muted-foreground">${value.toFixed(4)}</span>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CostDashboard() {
  const { t } = useTranslation('analytics')
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const result = await apiGet<CostData>('/api/analytics/cost?days=30')
      setData(result)
    } catch {
      // best effort
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data || data.total.sessions === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{t('cost.empty.title')}</p>
        <p className="text-xs text-muted-foreground/70">
          {t('cost.empty.hint')}
        </p>
      </div>
    )
  }

  const modelEntries = Object.entries(data.byModel)
  const maxCost = Math.max(...modelEntries.map(([, v]) => v.costUsd))

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border p-3 text-center">
          <DollarSign className="mx-auto h-4 w-4 text-green-400" />
          <p className="mt-1 text-lg font-bold">${data.total.costUsd.toFixed(4)}</p>
          <p className="text-[10px] text-muted-foreground">{t('cost.totalCost')}</p>
        </div>
        <div className="rounded-lg border border-border p-3 text-center">
          <p className="mt-1 text-lg font-bold">{data.total.sessions}</p>
          <p className="text-[10px] text-muted-foreground">{t('cost.sessions')}</p>
        </div>
        <div className="rounded-lg border border-border p-3 text-center">
          <p className="mt-1 text-lg font-bold">
            {((data.total.inputTokens + data.total.outputTokens) / 1000).toFixed(1)}k
          </p>
          <p className="text-[10px] text-muted-foreground">{t('cost.tokens')}</p>
        </div>
      </div>

      {/* Breakdown by model */}
      <div>
        <p className="mb-2 text-xs font-medium">{t('cost.byModel', { count: data.period.days })}</p>
        <div className="flex flex-col gap-2">
          {modelEntries.map(([model, stats]) => (
            <CostBar
              key={model}
              label={formatModelLabel(model)}
              value={stats.costUsd}
              maxValue={maxCost}
              color={getModelColor(model)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
