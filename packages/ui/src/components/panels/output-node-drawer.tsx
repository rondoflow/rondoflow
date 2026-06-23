'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileOutput, FolderOpen, Link2 } from 'lucide-react'
import { OUTPUT_FORMAT_LABELS, type OutputFormat } from '@rondoflow/shared'
import type { OutputNodeData } from '@/lib/canvas-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FolderPicker } from '@/components/shared/folder-picker'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OutputNodeDrawerProps {
  readonly data: OutputNodeData
  /** Agent nodes currently on the canvas (id + display name). */
  readonly agents: ReadonlyArray<{ readonly id: string; readonly name: string }>
  /** Workspace working dir used as the default destination. */
  readonly defaultDir?: string | null
  readonly onChange: (patch: Partial<OutputNodeData>) => void
}

// ─── Component ──────────────────────────────────────────────────────────────

export function OutputNodeDrawer({ data, agents, defaultDir, onChange }: OutputNodeDrawerProps) {
  const { t } = useTranslation('panelsMisc')
  const [pickerOpen, setPickerOpen] = useState(false)

  // Selection is connection-driven (read-only here): the canvas keeps
  // `agentSelection` in lockstep with the agent→output edges wired into this
  // node. We only resolve those ids to names for display. 'all' is a legacy
  // value still honoured at run time.
  const isAll = data.agentSelection === 'all'
  const connectedAgents = useMemo<ReadonlyArray<{ id: string; name: string }>>(() => {
    if (data.agentSelection === 'all') return []
    const byId = new Map(agents.map((a) => [a.id, a.name]))
    return data.agentSelection.map((id) => ({ id, name: byId.get(id) ?? t('outputNode.unknownAgent') }))
  }, [data.agentSelection, agents, t])

  const destinationLabel = data.destinationDir || defaultDir || '.'

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20">
            <FileOutput className="h-5 w-5 text-teal-400" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-teal-300">{t('outputNode.title')}</p>
            <p className="text-xs text-muted-foreground">{t('outputNode.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Name + Title */}
        <section className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('outputNode.name.label')}</label>
            <Input
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={t('outputNode.name.placeholder')}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('outputNode.docTitle.label')}</label>
            <Input
              value={data.title ?? ''}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder={t('outputNode.docTitle.placeholder')}
              className="h-8 text-xs"
            />
          </div>
        </section>

        {/* Agent selection — driven by canvas connections (read-only) */}
        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-teal-400" aria-hidden />
            <label className="text-sm font-medium">{t('outputNode.savingFrom')}</label>
          </div>
          <p className="mb-2 text-[11px] text-muted-foreground">
            {t('outputNode.savingHint')}
          </p>

          {isAll ? (
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              {t('outputNode.allAgents')}
            </p>
          ) : connectedAgents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
              {t('outputNode.noAgents')}
            </p>
          ) : (
            <div className="space-y-1">
              {connectedAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex w-full items-center gap-2 rounded-md border border-teal-500/30 bg-teal-500/5 px-2.5 py-1.5 text-xs"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-teal-400" aria-hidden />
                  <span className="truncate">{agent.name}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Format */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('outputNode.format.label')}</label>
          <select
            value={data.format}
            onChange={(e) => onChange({ format: e.target.value as OutputFormat })}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
            aria-label={t('outputNode.format.selectLabel')}
          >
            {(Object.entries(OUTPUT_FORMAT_LABELS) as [OutputFormat, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </section>

        {/* Destination */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('outputNode.destination.label')}</label>
          <div className="flex gap-1.5">
            <Input
              value={destinationLabel}
              readOnly
              className="h-8 flex-1 font-mono text-xs"
              title={destinationLabel}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 shrink-0 gap-1 px-2.5 text-xs"
              onClick={() => setPickerOpen(true)}
            >
              <FolderOpen className="h-3.5 w-3.5" aria-hidden />
              {t('outputNode.destination.browse')}
            </Button>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              {data.destinationDir ? t('outputNode.destination.custom') : t('outputNode.destination.default')}
            </p>
            {data.destinationDir && (
              <button
                type="button"
                onClick={() => onChange({ destinationDir: undefined })}
                className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
              >
                {t('outputNode.destination.reset')}
              </button>
            )}
          </div>
        </section>
      </div>

      <FolderPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        initialPath={data.destinationDir || defaultDir}
        onSelect={(path) => onChange({ destinationDir: path })}
      />
    </div>
  )
}
