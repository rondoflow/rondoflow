'use client'

import { useTranslation } from 'react-i18next'
import { Database, Link2, Table } from 'lucide-react'
import type { DbSaveNodeData } from '@/lib/canvas-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DbSaveNodeDrawerProps {
  readonly data: DbSaveNodeData
  /** Name of the upstream Structurer node feeding this one, if wired. */
  readonly upstreamName?: string | null
  readonly onChange: (patch: Partial<DbSaveNodeData>) => void
  /** Open the saved-datasets panel. */
  readonly onViewDatasets: () => void
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DbSaveNodeDrawer({ data, upstreamName, onChange, onViewDatasets }: DbSaveNodeDrawerProps) {
  const { t } = useTranslation('panelsMisc')

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
            <Database className="h-5 w-5 text-indigo-500" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-indigo-400">{t('dbSaveNode.title')}</p>
            <p className="text-xs text-muted-foreground">{t('dbSaveNode.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Name */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('dbSaveNode.name.label')}</label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('dbSaveNode.name.placeholder')}
            className="h-8 text-xs"
          />
        </section>

        {/* Dataset label */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('dbSaveNode.datasetLabel.label')}</label>
          <Input
            value={data.label ?? ''}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder={t('dbSaveNode.datasetLabel.placeholder')}
            className="h-8 text-xs"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">{t('dbSaveNode.datasetLabel.hint')}</p>
        </section>

        {/* Upstream structurer — connection-driven (read-only) */}
        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-indigo-400" aria-hidden />
            <label className="text-sm font-medium">{t('dbSaveNode.savingFrom')}</label>
          </div>
          {upstreamName ? (
            <div className="flex w-full items-center gap-2 rounded-md border border-indigo-500/30 bg-indigo-500/5 px-2.5 py-1.5 text-xs">
              <Table className="h-3.5 w-3.5 shrink-0 text-indigo-400" aria-hidden />
              <span className="truncate">{upstreamName}</span>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
              {t('dbSaveNode.noUpstream')}
            </p>
          )}
        </section>

        {/* Last saved */}
        {typeof data.savedRowCount === 'number' && (
          <section className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {t('dbSaveNode.lastSaved', { count: data.savedRowCount })}
          </section>
        )}

        {/* View saved datasets */}
        <Button variant="outline" className="w-full gap-1.5" onClick={onViewDatasets}>
          <Database className="h-4 w-4" aria-hidden />
          {t('dbSaveNode.viewDatasets')}
        </Button>
      </div>
    </div>
  )
}
