'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Database, Download, Loader2, RefreshCw, Table2 } from 'lucide-react'
import { toCsv, type ColumnSpec, type StructuredFormat } from '@rondoflow/shared'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { apiGet } from '@/lib/api'
import { formatDateTime } from '@/lib/format'

// ─── Types ─────────────────────────────────────────────────────────────────

interface DatasetSummary {
  readonly id: string
  readonly workspaceId: string | null
  readonly chainRunId: string | null
  readonly nodeId: string
  readonly name: string
  readonly format: StructuredFormat
  readonly rowCount: number
  readonly sourceAgentIds: readonly string[]
  readonly createdAt: string
}

interface DatasetDetail extends DatasetSummary {
  readonly schema: readonly ColumnSpec[]
  readonly rows: ReadonlyArray<{ readonly idx: number; readonly data: Record<string, unknown> }>
}

export interface SavedDatasetsPanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  /** Narrow the list to one workspace. */
  readonly workspaceId?: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

// ─── Component ─────────────────────────────────────────────────────────────

export function SavedDatasetsPanel({ open, onOpenChange, workspaceId }: SavedDatasetsPanelProps) {
  const { t, i18n } = useTranslation('panelsMisc')
  const [datasets, setDatasets] = useState<readonly DatasetSummary[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [selected, setSelected] = useState<DatasetDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const q = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ''
      const data = await apiGet<DatasetSummary[]>(`/api/datasets${q}`)
      setDatasets(data)
    } catch (err) {
      setListError(err instanceof Error ? err.message : t('datasets.error.loadList'))
      setDatasets([])
    } finally {
      setListLoading(false)
    }
  }, [workspaceId, t])

  const openDataset = useCallback(
    async (id: string) => {
      setDetailLoading(true)
      setDetailError(null)
      try {
        const data = await apiGet<DatasetDetail>(`/api/datasets/${encodeURIComponent(id)}?limit=500`)
        setSelected(data)
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : t('datasets.error.loadDetail'))
        setSelected(null)
      } finally {
        setDetailLoading(false)
      }
    },
    [t],
  )

  useEffect(() => {
    if (!open) return
    setSelected(null)
    setDetailError(null)
    void loadList()
  }, [open, loadList])

  const handleDownloadCsv = useCallback(() => {
    if (!selected) return
    const csv = toCsv({
      name: selected.name,
      format: selected.format,
      schema: selected.schema,
      rows: selected.rows.map((r) => r.data),
      sourceAgentIds: selected.sourceAgentIds,
      generatedAt: selected.createdAt,
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selected.name || 'dataset'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [selected])

  const columns: readonly string[] = selected
    ? selected.schema.length > 0
      ? selected.schema.map((c) => c.key)
      : [...new Set(selected.rows.flatMap((r) => Object.keys(r.data)))]
    : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[640px] max-w-[90vw] flex-col gap-0 p-0" aria-label={t('datasets.panelLabel')}>
        <SheetTitle className="sr-only">{t('datasets.title')}</SheetTitle>

        {/* Header */}
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          {selected || detailLoading || detailError ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-muted-foreground"
              onClick={() => {
                setSelected(null)
                setDetailError(null)
              }}
              aria-label={t('datasets.back')}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
              <Database className="h-4 w-4" aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{selected ? selected.name : t('datasets.title')}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {selected
                ? t('datasets.rowCount', { count: selected.rowCount })
                : t('datasets.summary', { count: datasets.length })}
            </p>
          </div>
          {selected ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
              onClick={handleDownloadCsv}
              aria-label={t('datasets.downloadCsv')}
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              {t('datasets.csv')}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-muted-foreground"
              onClick={() => void loadList()}
              disabled={listLoading}
              aria-label={t('datasets.refresh')}
            >
              <RefreshCw className={listLoading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} aria-hidden />
            </Button>
          )}
        </header>

        {/* Body */}
        <div className="flex-1 overflow-auto" aria-live="polite" aria-busy={listLoading || detailLoading}>
          {selected || detailLoading || detailError ? (
            <div className="px-4 py-4">
              {detailLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t('common:status.loading')}
                </div>
              ) : detailError ? (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{detailError}</div>
              ) : selected && selected.rows.length > 0 ? (
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        {columns.map((c) => (
                          <th key={c} className="border-b border-border px-2.5 py-1.5 text-left font-medium">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.rows.map((row) => (
                        <tr key={row.idx} className="border-b border-border/60 last:border-0">
                          {columns.map((c) => (
                            <td key={c} className="px-2.5 py-1.5 align-top text-muted-foreground">{cellText(row.data[c])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={Table2} title={t('datasets.emptyRows.title')} description={t('datasets.emptyRows.description')} />
              )}
            </div>
          ) : (
            <div className="px-4 py-3">
              {listLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t('common:status.loading')}
                </div>
              ) : listError ? (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{listError}</div>
              ) : datasets.length === 0 ? (
                <EmptyState icon={Database} title={t('datasets.empty.title')} description={t('datasets.empty.description')} />
              ) : (
                <ul className="flex flex-col gap-1.5" role="list">
                  {datasets.map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => void openDataset(d.id)}
                        className="flex w-full items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
                      >
                        <Table2 className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{d.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {t('datasets.listMeta', {
                              rows: d.rowCount,
                              format: d.format,
                              time: formatDateTime(d.createdAt, i18n.language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                            })}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
