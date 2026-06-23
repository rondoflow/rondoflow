'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Table2, Plus, Trash2, Link2 } from 'lucide-react'
import {
  STRUCTURED_FORMAT_LABELS,
  type StructuredFormat,
  type ColumnSpec,
  type ColumnType,
} from '@rondoflow/shared'
import type { StructurerNodeData } from '@/lib/canvas-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StructurerNodeDrawerProps {
  readonly data: StructurerNodeData
  /** Agent nodes currently on the canvas (id + display name). */
  readonly agents: ReadonlyArray<{ readonly id: string; readonly name: string }>
  readonly onChange: (patch: Partial<StructurerNodeData>) => void
}

const COLUMN_TYPES: readonly ColumnType[] = ['string', 'number', 'boolean', 'date']

function newColumn(): ColumnSpec {
  return { key: '', label: '', type: 'string' }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function StructurerNodeDrawer({ data, agents, onChange }: StructurerNodeDrawerProps) {
  const { t } = useTranslation('panelsMisc')
  const schema = useMemo(() => data.schema ?? [], [data.schema])

  const isAll = data.agentSelection === 'all'
  const connectedAgents = useMemo<ReadonlyArray<{ id: string; name: string }>>(() => {
    if (data.agentSelection === 'all') return []
    const byId = new Map(agents.map((a) => [a.id, a.name]))
    return data.agentSelection.map((id) => ({ id, name: byId.get(id) ?? t('structurerNode.unknownAgent') }))
  }, [data.agentSelection, agents, t])

  const updateSchema = (next: ColumnSpec[]) => onChange({ schema: next })
  const patchColumn = (i: number, patch: Partial<ColumnSpec>) =>
    updateSchema(schema.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  const removeColumn = (i: number) => updateSchema(schema.filter((_, idx) => idx !== i))
  const addColumn = () => updateSchema([...schema, newColumn()])

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
            <Table2 className="h-5 w-5 text-sky-500" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-sky-400">{t('structurerNode.title')}</p>
            <p className="text-xs text-muted-foreground">{t('structurerNode.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Name */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('structurerNode.name.label')}</label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('structurerNode.name.placeholder')}
            className="h-8 text-xs"
          />
        </section>

        {/* Source agents — connection-driven (read-only) */}
        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-sky-400" aria-hidden />
            <label className="text-sm font-medium">{t('structurerNode.sourceFrom')}</label>
          </div>
          <p className="mb-2 text-[11px] text-muted-foreground">{t('structurerNode.sourceHint')}</p>
          {isAll ? (
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{t('structurerNode.allAgents')}</p>
          ) : connectedAgents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">{t('structurerNode.noAgents')}</p>
          ) : (
            <div className="space-y-1">
              {connectedAgents.map((agent) => (
                <div key={agent.id} className="flex w-full items-center gap-2 rounded-md border border-sky-500/30 bg-sky-500/5 px-2.5 py-1.5 text-xs">
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-hidden />
                  <span className="truncate">{agent.name}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Format */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('structurerNode.format.label')}</label>
          <select
            value={data.format}
            onChange={(e) => onChange({ format: e.target.value as StructuredFormat })}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
            aria-label={t('structurerNode.format.selectLabel')}
          >
            {(Object.entries(STRUCTURED_FORMAT_LABELS) as [StructuredFormat, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </section>

        {/* Extraction mode */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('structurerNode.mode.label')}</label>
          <div className="flex items-center gap-1.5">
            {(['parse', 'ai'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ extractionMode: m })}
                className={cn(
                  'flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
                  data.extractionMode === m
                    ? 'border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-300'
                    : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                {m === 'parse' ? t('structurerNode.mode.parse') : t('structurerNode.mode.ai')}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {data.extractionMode === 'ai' ? t('structurerNode.mode.aiHint') : t('structurerNode.mode.parseHint')}
          </p>
        </section>

        {/* AI instructions (ai mode only) */}
        {data.extractionMode === 'ai' && (
          <section>
            <label className="mb-1.5 block text-sm font-medium">{t('structurerNode.instructions.label')}</label>
            <Textarea
              value={data.instructions ?? ''}
              onChange={(e) => onChange({ instructions: e.target.value })}
              placeholder={t('structurerNode.instructions.placeholder')}
              className="min-h-[64px] text-xs"
            />
          </section>
        )}

        {/* Schema columns */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('structurerNode.schema.heading')}</label>
            <span className="text-[11px] text-muted-foreground">{t('structurerNode.schema.total', { count: schema.length })}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{t('structurerNode.schema.hint')}</p>

          {schema.map((c, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                <Input
                  value={c.key}
                  onChange={(e) => patchColumn(i, { key: e.target.value })}
                  placeholder={t('structurerNode.schema.keyPlaceholder')}
                  className="h-7 flex-1 font-mono text-xs"
                  aria-label={t('structurerNode.schema.keyAria', { index: i + 1 })}
                />
                <button
                  type="button"
                  onClick={() => removeColumn(i)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                  aria-label={t('structurerNode.schema.remove', { index: i + 1 })}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={c.label}
                  onChange={(e) => patchColumn(i, { label: e.target.value })}
                  placeholder={t('structurerNode.schema.labelPlaceholder')}
                  className="h-7 flex-1 text-xs"
                  aria-label={t('structurerNode.schema.labelAria', { index: i + 1 })}
                />
                <select
                  value={c.type}
                  onChange={(e) => patchColumn(i, { type: e.target.value as ColumnType })}
                  className="h-7 rounded-md border border-border bg-background px-1.5 text-xs"
                  aria-label={t('structurerNode.schema.typeAria', { index: i + 1 })}
                >
                  {COLUMN_TYPES.map((ct) => (
                    <option key={ct} value={ct}>{t(`structurerNode.schema.type.${ct}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11px]" onClick={addColumn}>
            <Plus className="h-3 w-3" aria-hidden />
            {t('structurerNode.schema.add')}
          </Button>

          {schema.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
              {t('structurerNode.schema.empty')}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
