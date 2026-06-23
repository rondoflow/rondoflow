'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Markdown } from '@/components/shared/markdown'
import { apiGet } from '@/lib/api'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

interface OutputFile {
  readonly name: string
  readonly path: string
  readonly size: number
  readonly modifiedAt: string
}

interface OutputFileContent extends OutputFile {
  readonly content: string
}

export interface OutputLogPreviewProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  /** Directory to scan for saved workflow outputs. */
  readonly directory?: string | null
  /** When provided, auto-open this file's preview when the panel opens. */
  readonly initialName?: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTimestamp(iso: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return formatDateTime(iso, locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Lowercased extension (without dot), e.g. 'md' | 'html' | 'txt'. */
function extOf(name: string): string {
  return name.slice(name.lastIndexOf('.') + 1).toLowerCase()
}

const DOWNLOAD_MIME: Record<string, string> = {
  md: 'text/markdown',
  html: 'text/html',
  txt: 'text/plain',
}

// ─── Component ─────────────────────────────────────────────────────────────

export function OutputLogPreview({
  open,
  onOpenChange,
  directory,
  initialName,
}: OutputLogPreviewProps) {
  const { t, i18n } = useTranslation('panelsMisc')
  const [outputs, setOutputs] = useState<readonly OutputFile[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const [selected, setSelected] = useState<OutputFileContent | null>(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const dir = directory || '.'

  const loadList = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const data = await apiGet<{ outputs: OutputFile[] }>(
        `/api/fs/outputs?directory=${encodeURIComponent(dir)}`,
      )
      setOutputs(data.outputs)
    } catch (err) {
      setListError(err instanceof Error ? err.message : t('output.log.error.loadList'))
      setOutputs([])
    } finally {
      setListLoading(false)
    }
  }, [dir, t])

  const openFile = useCallback(
    async (name: string) => {
      setContentLoading(true)
      setContentError(null)
      setCopied(false)
      try {
        const data = await apiGet<OutputFileContent>(
          `/api/fs/read?directory=${encodeURIComponent(dir)}&name=${encodeURIComponent(name)}`,
        )
        setSelected(data)
      } catch (err) {
        setContentError(err instanceof Error ? err.message : t('output.log.error.readFile'))
        setSelected(null)
      } finally {
        setContentLoading(false)
      }
    },
    [dir, t],
  )

  // Reload the list when the panel opens or the directory changes — kept
  // separate from the auto-open below so a directory change never re-jumps
  // the user back to the initial file.
  useEffect(() => {
    if (!open) return
    void loadList()
  }, [open, loadList])

  // Auto-open the initial file (e.g. the one just saved) once per open. Keyed
  // only on [open, initialName] so navigating away or switching directory does
  // not force the preview back onto it.
  useEffect(() => {
    if (!open) return
    if (initialName) {
      void openFile(initialName)
    } else {
      setSelected(null)
      setContentError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialName])

  const handleCopy = useCallback(async () => {
    if (!selected) return
    try {
      await navigator.clipboard.writeText(selected.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }, [selected])

  const handleDownload = useCallback(() => {
    if (!selected) return
    const mime = DOWNLOAD_MIME[extOf(selected.name)] ?? 'text/plain'
    const blob = new Blob([selected.content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = selected.name
    a.click()
    URL.revokeObjectURL(url)
  }, [selected])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0"
        aria-label={t('output.log.panelLabel')}
      >
        <SheetTitle className="sr-only">{t('output.log.title')}</SheetTitle>

        {/* Header */}
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          {selected || contentLoading || contentError ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-muted-foreground"
              onClick={() => {
                setSelected(null)
                setContentError(null)
              }}
              aria-label={t('output.log.back')}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <FileText className="h-4 w-4" aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {selected ? selected.name : t('output.log.title')}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {selected
                ? t('output.log.metaSeparator', {
                    time: formatTimestamp(selected.modifiedAt, i18n.language),
                    size: formatBytes(selected.size),
                  })
                : t('output.log.summary', { count: outputs.length, dir })}
            </p>
          </div>
          {selected ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
                onClick={handleCopy}
                aria-label={t('output.log.copyLabel')}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                )}
                {copied ? t('output.log.copied') : t('output.log.copy')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
                onClick={handleDownload}
                aria-label={t('output.log.downloadLabel')}
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                {t('output.log.download')}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-muted-foreground"
              onClick={() => void loadList()}
              disabled={listLoading}
              aria-label={t('output.log.refreshLabel')}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', listLoading && 'animate-spin')} aria-hidden />
            </Button>
          )}
        </header>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto"
          aria-live="polite"
          aria-busy={listLoading || contentLoading}
        >
          {/* ── Detail view ── */}
          {selected || contentLoading || contentError ? (
            <div className="px-4 py-4">
              {contentLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t('common:status.loading')}
                </div>
              ) : contentError ? (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {contentError}
                </div>
              ) : selected ? (
                extOf(selected.name) === 'md' ? (
                  <Markdown content={selected.content} />
                ) : (
                  // Show .txt / .html as source — never inject untrusted agent
                  // HTML into the app DOM.
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                    {selected.content}
                  </pre>
                )
              ) : null}
            </div>
          ) : (
            /* ── List view ── */
            <div className="px-4 py-3">
              {listLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t('output.log.loadingOutputs')}
                </div>
              ) : listError ? (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {listError}
                </div>
              ) : outputs.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title={t('output.log.empty.title')}
                  description={t('output.log.empty.description')}
                />
              ) : (
                <ul className="flex flex-col gap-1.5" role="list">
                  {outputs.map((file) => (
                    <li key={file.path}>
                      <button
                        type="button"
                        onClick={() => void openFile(file.name)}
                        className="flex w-full items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-green-500" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{file.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {t('output.log.metaSeparator', {
                              time: formatTimestamp(file.modifiedAt, i18n.language),
                              size: formatBytes(file.size),
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
