'use client'

import { useTranslation } from 'react-i18next'
import { Webhook, Plus, Trash2 } from 'lucide-react'
import type { HttpRequestNodeData, HttpKeyValue } from '@/lib/canvas-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HttpRequestNodeDrawerProps {
  readonly data: HttpRequestNodeData
  readonly onChange: (patch: Partial<HttpRequestNodeData>) => void
}

const METHODS: ReadonlyArray<HttpRequestNodeData['method']> = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const BODY_METHODS: ReadonlySet<string> = new Set(['POST', 'PUT', 'PATCH'])
const BODY_MODES: ReadonlyArray<HttpRequestNodeData['bodyMode']> = ['json', 'form', 'raw']

// ─── Key/value row editor (headers + query params) ───────────────────────────
// Rows are an ordered array (index-keyed), so empty/duplicate keys never
// collapse while typing — mirrors the Structurer drawer's schema-column editor.

interface KeyValueRowsProps {
  readonly heading: string
  readonly rows: readonly HttpKeyValue[]
  readonly keyPlaceholder: string
  readonly valuePlaceholder: string
  readonly addLabel: string
  readonly emptyLabel: string
  readonly removeLabel: (index: number) => string
  readonly onChange: (next: HttpKeyValue[]) => void
}

function KeyValueRows({
  heading,
  rows,
  keyPlaceholder,
  valuePlaceholder,
  addLabel,
  emptyLabel,
  removeLabel,
  onChange,
}: KeyValueRowsProps) {
  const patch = (i: number, p: Partial<HttpKeyValue>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...p } : r)))
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i))
  const add = () => onChange([...rows, { key: '', value: '' }])

  return (
    <section className="space-y-2">
      <label className="text-sm font-medium">{heading}</label>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={row.key}
            onChange={(e) => patch(i, { key: e.target.value })}
            placeholder={keyPlaceholder}
            className="h-7 flex-1 font-mono text-xs"
          />
          <Input
            value={row.value}
            onChange={(e) => patch(i, { value: e.target.value })}
            placeholder={valuePlaceholder}
            className="h-7 flex-1 text-xs"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
            aria-label={removeLabel(i + 1)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11px]" onClick={add}>
        <Plus className="h-3 w-3" aria-hidden />
        {addLabel}
      </Button>
      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
          {emptyLabel}
        </p>
      )}
    </section>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function HttpRequestNodeDrawer({ data, onChange }: HttpRequestNodeDrawerProps) {
  const { t } = useTranslation('panelsMisc')
  const showBody = BODY_METHODS.has(data.method)

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20">
            <Webhook className="h-5 w-5 text-teal-500" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-teal-400">{t('httpRequestNode.title')}</p>
            <p className="text-xs text-muted-foreground">{t('httpRequestNode.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Name */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('httpRequestNode.name.label')}</label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('httpRequestNode.name.placeholder')}
            className="h-8 text-xs"
          />
        </section>

        {/* Method + URL */}
        <section className="space-y-2">
          <label className="block text-sm font-medium">{t('httpRequestNode.request.label')}</label>
          <div className="flex items-center gap-2">
            <select
              value={data.method}
              onChange={(e) => onChange({ method: e.target.value as HttpRequestNodeData['method'] })}
              className="h-8 rounded-md border border-border bg-background px-2 font-mono text-xs"
              aria-label={t('httpRequestNode.request.methodLabel')}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <Input
              value={data.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder={t('httpRequestNode.request.urlPlaceholder')}
              className="h-8 flex-1 text-xs"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">{t('httpRequestNode.request.hint', { token: '{{input}}' })}</p>
        </section>

        {/* Query params */}
        <KeyValueRows
          heading={t('httpRequestNode.query.heading')}
          rows={data.queryParams}
          keyPlaceholder={t('httpRequestNode.query.keyPlaceholder')}
          valuePlaceholder={t('httpRequestNode.query.valuePlaceholder')}
          addLabel={t('httpRequestNode.query.add')}
          emptyLabel={t('httpRequestNode.query.empty')}
          removeLabel={(index) => t('httpRequestNode.query.remove', { index })}
          onChange={(next) => onChange({ queryParams: next })}
        />

        {/* Headers */}
        <KeyValueRows
          heading={t('httpRequestNode.headers.heading')}
          rows={data.headers}
          keyPlaceholder={t('httpRequestNode.headers.keyPlaceholder')}
          valuePlaceholder={t('httpRequestNode.headers.valuePlaceholder')}
          addLabel={t('httpRequestNode.headers.add')}
          emptyLabel={t('httpRequestNode.headers.empty')}
          removeLabel={(index) => t('httpRequestNode.headers.remove', { index })}
          onChange={(next) => onChange({ headers: next })}
        />

        {/* Body (POST/PUT/PATCH only) */}
        {showBody && (
          <section className="space-y-2">
            <label className="block text-sm font-medium">{t('httpRequestNode.body.label')}</label>
            <div className="flex items-center gap-1.5">
              {BODY_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange({ bodyMode: m })}
                  className={cn(
                    'flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
                    data.bodyMode === m
                      ? 'border-teal-500/50 bg-teal-500/10 text-teal-600 dark:text-teal-300'
                      : 'border-border text-muted-foreground hover:bg-muted',
                  )}
                >
                  {t(`httpRequestNode.body.mode.${m}`)}
                </button>
              ))}
            </div>
            <Textarea
              value={data.body ?? ''}
              onChange={(e) => onChange({ body: e.target.value })}
              placeholder={t('httpRequestNode.body.placeholder')}
              className="min-h-[80px] font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">{t('httpRequestNode.body.hint', { token: '{{input}}' })}</p>
          </section>
        )}

        {/* Timeout */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('httpRequestNode.timeout.label')}</label>
          <Input
            type="number"
            min={1}
            max={300}
            value={data.timeoutSec}
            onChange={(e) => onChange({ timeoutSec: Math.max(1, Math.min(300, Number(e.target.value) || 1)) })}
            className="h-8 w-28 text-xs"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">{t('httpRequestNode.timeout.hint')}</p>
        </section>

        {/* Response mode */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('httpRequestNode.response.label')}</label>
          <div className="flex items-center gap-1.5">
            {(['body', 'full'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ responseMode: m })}
                className={cn(
                  'flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
                  data.responseMode === m
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-600 dark:text-teal-300'
                    : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                {t(`httpRequestNode.response.${m}`)}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{t('httpRequestNode.response.hint')}</p>
        </section>
      </div>
    </div>
  )
}
