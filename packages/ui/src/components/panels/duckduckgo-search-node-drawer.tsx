'use client'

import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import type { DuckDuckGoSearchNodeData } from '@/lib/canvas-utils'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DuckDuckGoSearchNodeDrawerProps {
  readonly data: DuckDuckGoSearchNodeData
  readonly onChange: (patch: Partial<DuckDuckGoSearchNodeData>) => void
}

const SAFE_SEARCH: ReadonlyArray<DuckDuckGoSearchNodeData['safeSearch']> = ['strict', 'moderate', 'off']
const TIME_LIMITS: ReadonlyArray<DuckDuckGoSearchNodeData['timeLimit']> = ['', 'd', 'w', 'm', 'y']
const OUTPUT_FORMATS: ReadonlyArray<DuckDuckGoSearchNodeData['outputFormat']> = ['text', 'json']

// Shared segmented-button style (DuckDuckGo orange accent, mirrors the HTTP node).
function segmentClass(active: boolean): string {
  return cn(
    'flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
    active
      ? 'border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-300'
      : 'border-border text-muted-foreground hover:bg-muted',
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DuckDuckGoSearchNodeDrawer({ data, onChange }: DuckDuckGoSearchNodeDrawerProps) {
  const { t } = useTranslation('panelsMisc')

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
            <Search className="h-5 w-5 text-orange-500" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-orange-400">{t('duckduckgoSearchNode.title')}</p>
            <p className="text-xs text-muted-foreground">{t('duckduckgoSearchNode.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Name */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('duckduckgoSearchNode.name.label')}</label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('duckduckgoSearchNode.name.placeholder')}
            className="h-8 text-xs"
          />
        </section>

        {/* Query */}
        <section className="space-y-2">
          <label className="block text-sm font-medium">{t('duckduckgoSearchNode.query.label')}</label>
          <Input
            value={data.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder={t('duckduckgoSearchNode.query.placeholder')}
            className="h-8 text-xs"
          />
          <p className="text-[11px] text-muted-foreground">{t('duckduckgoSearchNode.query.hint', { token: '{{input}}' })}</p>
        </section>

        {/* Max results + Region */}
        <section className="flex gap-3">
          <div className="w-28">
            <label className="mb-1.5 block text-sm font-medium">{t('duckduckgoSearchNode.maxResults.label')}</label>
            <Input
              type="number"
              min={1}
              max={25}
              value={data.maxResults}
              onChange={(e) => onChange({ maxResults: Math.max(1, Math.min(25, Number(e.target.value) || 1)) })}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium">{t('duckduckgoSearchNode.region.label')}</label>
            <Input
              value={data.region}
              onChange={(e) => onChange({ region: e.target.value.trim() })}
              placeholder={t('duckduckgoSearchNode.region.placeholder')}
              className="h-8 text-xs"
            />
          </div>
        </section>
        <p className="-mt-4 text-[11px] text-muted-foreground">{t('duckduckgoSearchNode.region.hint')}</p>

        {/* SafeSearch */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('duckduckgoSearchNode.safeSearch.label')}</label>
          <div className="flex items-center gap-1.5">
            {SAFE_SEARCH.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ safeSearch: s })}
                className={segmentClass(data.safeSearch === s)}
              >
                {t(`duckduckgoSearchNode.safeSearch.${s}`)}
              </button>
            ))}
          </div>
        </section>

        {/* Time limit */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('duckduckgoSearchNode.timeLimit.label')}</label>
          <select
            value={data.timeLimit}
            onChange={(e) => onChange({ timeLimit: e.target.value as DuckDuckGoSearchNodeData['timeLimit'] })}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
            aria-label={t('duckduckgoSearchNode.timeLimit.label')}
          >
            {TIME_LIMITS.map((tl) => (
              <option key={tl || 'any'} value={tl}>{t(`duckduckgoSearchNode.timeLimit.${tl || 'any'}`)}</option>
            ))}
          </select>
        </section>

        {/* Output format */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('duckduckgoSearchNode.output.label')}</label>
          <div className="flex items-center gap-1.5">
            {OUTPUT_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onChange({ outputFormat: f })}
                className={segmentClass(data.outputFormat === f)}
              >
                {t(`duckduckgoSearchNode.output.${f}`)}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{t('duckduckgoSearchNode.output.hint')}</p>
        </section>
      </div>
    </div>
  )
}
