'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet, apiPatch } from '@/lib/api'
import {
  FolderOpen,
  GitBranch,
  RefreshCw,
  X,
  Loader2,
  ArrowUp,
  ArrowDown,
  Pencil,
  Check,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useGit } from '@/hooks/use-git'
import { GitStatusTab } from '@/components/panels/git-status-tab'
import { GitLogTab } from '@/components/panels/git-log-tab'
import { GitBranchesTab } from '@/components/panels/git-branches-tab'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GitPanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly workspaceId?: string | null
}

type GitTabId = 'status' | 'log' | 'branches'

const TABS: { id: GitTabId; labelKey: string }[] = [
  { id: 'status', labelKey: 'tab.status' },
  { id: 'log', labelKey: 'tab.log' },
  { id: 'branches', labelKey: 'tab.branches' },
]

// ─── Component ──────────────────────────────────────────────────────────────

export function GitPanel({ open, onOpenChange, workspaceId }: GitPanelProps) {
  const { t } = useTranslation('git')
  const [activeTab, setActiveTab] = useState<GitTabId>('status')
  const [commitMsg, setCommitMsg] = useState('')
  const [committing, setCommitting] = useState(false)
  const [pushing, setPushing] = useState(false)

  const [targetDir, setTargetDir] = useState<string | null>(null)
  const [editingDir, setEditingDir] = useState(false)
  const [dirInput, setDirInput] = useState('')
  const [savingDir, setSavingDir] = useState(false)

  useEffect(() => {
    if (!open || !workspaceId) {
      setTargetDir(null)
      return
    }
    apiGet<Array<{ id: string; workingDirectory?: string | null }>>('/api/workspaces')
      .then((ws) => {
        const match = ws.find((w) => w.id === workspaceId)
        setTargetDir(match?.workingDirectory ?? null)
      })
      .catch(() => {})
  }, [open, workspaceId])

  async function handleSaveDir() {
    if (!workspaceId || !dirInput.trim()) return
    setSavingDir(true)
    try {
      await apiPatch(`/api/workspaces/${workspaceId}`, { workingDirectory: dirInput.trim() })
      setTargetDir(dirInput.trim())
      setEditingDir(false)
      // Refresh git data for the new directory
      void Promise.all([refreshStatus(), refreshLog(), refreshBranches()])
    } catch {
      // keep editing
    } finally {
      setSavingDir(false)
    }
  }

  const {
    status, log, branches, remoteUrl,
    loading, error,
    refreshStatus, refreshLog, refreshBranches,
    stageFiles, unstageFiles, commit, push, checkoutBranch,
  } = useGit(open, workspaceId)

  const stagedCount = status?.files.filter((f) => f.staged).length ?? 0
  const canCommit = commitMsg.trim().length > 0 && stagedCount > 0 && !committing

  async function handleCommit() {
    if (!canCommit) return
    setCommitting(true)
    try {
      await commit(commitMsg.trim())
      setCommitMsg('')
    } finally {
      setCommitting(false)
    }
  }

  async function handlePush() {
    setPushing(true)
    try {
      await push()
    } finally {
      setPushing(false)
    }
  }

  function handleRefresh() {
    void Promise.all([refreshStatus(), refreshLog(), refreshBranches()])
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
      >
        <SheetTitle className="sr-only">{t('title')}</SheetTitle>

        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-orange-400" aria-hidden />
            <span className="text-sm font-semibold">{t('title')}</span>
            {status && (
              <Badge variant="outline" className="gap-1 font-mono text-[10px]">
                {status.branch}
              </Badge>
            )}
            {status && status.ahead > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-400">
                <ArrowUp className="h-2.5 w-2.5" aria-hidden />
                {status.ahead}
              </span>
            )}
            {status && status.behind > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-yellow-400">
                <ArrowDown className="h-2.5 w-2.5" aria-hidden />
                {status.behind}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={handleRefresh}
              disabled={loading}
              aria-label={t('action.refresh')}
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5', loading && 'animate-spin')}
                aria-hidden
              />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onOpenChange(false)}
              aria-label={t('action.close')}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        </header>

        {/* Repository info */}
        <div className="shrink-0 border-b border-border px-4 py-2">
          {editingDir ? (
            <form
              className="flex items-center gap-1.5"
              onSubmit={(e) => { e.preventDefault(); void handleSaveDir() }}
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
              <input
                type="text"
                value={dirInput}
                onChange={(e) => setDirInput(e.target.value)}
                placeholder={t('repo.pathPlaceholder')}
                className="flex-1 rounded border bg-background px-2 py-0.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditingDir(false)
                  }
                }}
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                disabled={savingDir || !dirInput.trim()}
                aria-label={t('action.saveDirectory')}
              >
                {savingDir ? (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                ) : (
                  <Check className="h-3 w-3 text-green-400" aria-hidden />
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setEditingDir(false)}
                aria-label={t('action.cancelEditing')}
              >
                <X className="h-3 w-3" aria-hidden />
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
              <span className="flex-1 truncate font-mono font-medium">
                {targetDir || t('repo.none')}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 shrink-0 p-0"
                onClick={() => {
                  setDirInput(targetDir || '')
                  setEditingDir(true)
                }}
                aria-label={t('action.changeDirectory')}
              >
                <Pencil className="h-3 w-3" aria-hidden />
              </Button>
            </div>
          )}
          {remoteUrl && !editingDir && (
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              {remoteUrl.replace(/\.git$/, '').replace(/^https?:\/\//, '').replace(/^git@/, '')}
            </p>
          )}
          {!targetDir && !editingDir && (
            <p className="mt-1 text-[10px] text-muted-foreground/60">
              {t('repo.hint')}
            </p>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="shrink-0 border-b border-destructive/40 bg-destructive/10 px-4 py-2">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex shrink-0 border-b border-border" role="tablist" aria-label={t('branches.tabs')}>
          {TABS.map((tab) => {
            const count =
              tab.id === 'status'
                ? status?.files.length ?? 0
                : tab.id === 'log'
                ? log.length
                : branches.length

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-orange-400 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {t(tab.labelKey)}
                {count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                      activeTab === tab.id
                        ? 'bg-orange-400/20 text-orange-400'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-4 py-4" role="tabpanel">
          {loading && !status ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {activeTab === 'status' && (
                <GitStatusTab
                  files={status?.files ?? []}
                  onStage={(paths) => void stageFiles(paths)}
                  onUnstage={(paths) => void unstageFiles(paths)}
                />
              )}
              {activeTab === 'log' && <GitLogTab entries={log} />}
              {activeTab === 'branches' && (
                <GitBranchesTab
                  branches={branches}
                  onCheckout={checkoutBranch}
                  workspaceId={workspaceId}
                  onBranchCreated={handleRefresh}
                />
              )}
            </>
          )}
        </div>

        <Separator />

        {/* Commit footer */}
        <div className="shrink-0 px-4 py-3">
          <Textarea
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            placeholder={t('commit.placeholder')}
            className="mb-2 min-h-[48px] max-h-[100px] resize-none font-mono text-xs"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                void handleCommit()
              }
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1 text-xs"
              disabled={!canCommit}
              onClick={() => void handleCommit()}
            >
              {committing ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" aria-hidden />
              ) : null}
              {stagedCount > 0 ? t('commit.submitCount', { count: stagedCount }) : t('commit.submit')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={pushing}
              onClick={() => void handlePush()}
            >
              {pushing ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" aria-hidden />
              ) : (
                <ArrowUp className="mr-1 h-3 w-3" aria-hidden />
              )}
              {t('push.label')}
              {status && status.ahead > 0 && (
                <Badge variant="secondary" className="ml-1.5 px-1 py-0 text-[9px]">
                  {status.ahead}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
