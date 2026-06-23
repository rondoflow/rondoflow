'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowUp,
  Folder,
  FolderOpen,
  GitBranch,
  Home,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { apiGet } from '@/lib/api'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

interface BrowseResult {
  readonly current: string
  readonly parent: string | null
  readonly dirs: readonly string[]
  readonly hasGit: boolean
  readonly sep: string
}

export interface FolderPickerProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly initialPath?: string | null
  readonly onSelect: (path: string) => void
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FolderPicker({ open, onOpenChange, initialPath, onSelect }: FolderPickerProps) {
  const { t } = useTranslation('onboarding')
  const [current, setCurrent] = useState('')
  const [parent, setParent] = useState<string | null>(null)
  const [dirs, setDirs] = useState<readonly string[]>([])
  const [hasGit, setHasGit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualPath, setManualPath] = useState('')

  const browse = useCallback(async (path?: string) => {
    setLoading(true)
    setError(null)
    try {
      const query = path ? `?path=${encodeURIComponent(path)}` : ''
      const result = await apiGet<BrowseResult>(`/api/fs/browse${query}`)
      setCurrent(result.current)
      setParent(result.parent)
      setDirs(result.dirs)
      setHasGit(result.hasGit)
      setManualPath(result.current)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('folderPicker.error.browse'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (open) {
      void browse(initialPath || undefined)
    }
  }, [open, initialPath, browse])

  function handleSelect() {
    onSelect(current)
    onOpenChange(false)
  }

  function handleManualGo() {
    const trimmed = manualPath.trim()
    if (trimmed) {
      void browse(trimmed)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0 sm:max-w-[500px]">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-3">
          <DialogTitle className="text-sm">{t('folderPicker.title')}</DialogTitle>
        </DialogHeader>

        {/* Path input */}
        <div className="shrink-0 border-b border-border px-4 py-2">
          <div className="flex gap-1.5">
            <Input
              value={manualPath}
              onChange={(e) => setManualPath(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleManualGo()
              }}
              placeholder={t('folderPicker.pathPlaceholder')}
              className="h-8 flex-1 font-mono text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 shrink-0 px-3 text-xs"
              onClick={handleManualGo}
              disabled={loading}
            >
              {t('action.go')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 shrink-0 p-0"
              onClick={() => void browse()}
              disabled={loading}
              aria-label={t('folderPicker.homeAriaLabel')}
              title={t('folderPicker.home')}
            >
              <Home className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Current folder info */}
        <div className="shrink-0 flex items-center gap-2 border-b border-border px-4 py-2">
          <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="flex-1 truncate font-mono text-xs text-foreground">{current}</span>
          {hasGit && (
            <span className="flex items-center gap-1 rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] text-orange-400">
              <GitBranch className="h-2.5 w-2.5" />
              {t('folderPicker.git')}
            </span>
          )}
          {parent && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 shrink-0 p-0"
              onClick={() => void browse(parent)}
              disabled={loading}
              aria-label={t('folderPicker.upAriaLabel')}
              title={t('folderPicker.up')}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="shrink-0 px-4 py-2 text-xs text-destructive">{error}</div>
        )}

        {/* Directory listing */}
        <div className="flex-1 overflow-y-auto px-2 py-2" style={{ minHeight: 200, maxHeight: 350 }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : dirs.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              {t('folderPicker.empty')}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {dirs.map((dir) => (
                <button
                  key={dir}
                  type="button"
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs',
                    'transition-colors hover:bg-muted',
                  )}
                  onDoubleClick={() => void browse(current + (current.endsWith('/') || current.endsWith('\\') ? '' : '/') + dir)}
                  onClick={() => {
                    const sep = current.includes('\\') ? '\\' : '/'
                    const newPath = current.endsWith(sep) ? current + dir : current + sep + dir
                    setManualPath(newPath)
                  }}
                >
                  <Folder className="h-3.5 w-3.5 shrink-0 text-amber-400/70" />
                  <span className="truncate">{dir}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-4 py-3">
          <p className="flex-1 text-[10px] text-muted-foreground">
            {t('folderPicker.footerHint')}
          </p>
          <Button
            size="sm"
            onClick={handleSelect}
            disabled={!current}
          >
            {t('folderPicker.select')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
