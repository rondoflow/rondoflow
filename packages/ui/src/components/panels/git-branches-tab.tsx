'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, GitBranch, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { apiPost } from '@/lib/api'
import type { GitBranchEntry } from '@rondoflow/shared'

interface GitBranchesTabProps {
  readonly branches: readonly GitBranchEntry[]
  readonly onCheckout?: (branch: string) => Promise<void>
  readonly workspaceId?: string | null
  readonly onBranchCreated?: () => void
}

export function GitBranchesTab({ branches, onCheckout, workspaceId, onBranchCreated }: GitBranchesTabProps) {
  const { t } = useTranslation('git')
  const [switching, setSwitching] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleClick(branch: GitBranchEntry) {
    if (branch.current || !onCheckout || switching) return
    setSwitching(branch.name)
    try {
      await onCheckout(branch.name)
    } finally {
      setSwitching(null)
    }
  }

  async function handleCreateBranch(e: React.FormEvent) {
    e.preventDefault()
    const name = newBranchName.trim()
    if (!name) return

    // Validate branch name client-side
    if (!/^[\w./-]+$/.test(name)) {
      setCreateError(t('branches.invalidName'))
      return
    }

    setCreating(true)
    setCreateError(null)
    try {
      await apiPost('/api/git/branch', {
        name,
        workspaceId: workspaceId ?? undefined,
      })
      setNewBranchName('')
      setShowCreate(false)
      onBranchCreated?.()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : t('branches.createFailed'))
    } finally {
      setCreating(false)
    }
  }

  const currentBranch = branches.find((b) => b.current)

  return (
    <div className="flex flex-col gap-2">
      {/* Create branch button / form */}
      {showCreate ? (
        <form onSubmit={handleCreateBranch} className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GitBranch className="h-3 w-3" aria-hidden />
            <span>{t('branches.newBranchFrom')} <span className="font-mono font-medium text-foreground">{currentBranch?.name ?? 'HEAD'}</span></span>
          </div>
          <input
            type="text"
            value={newBranchName}
            onChange={(e) => { setNewBranchName(e.target.value); setCreateError(null) }}
            placeholder={t('branches.namePlaceholder')}
            className="h-8 rounded-md border bg-background px-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Escape') setShowCreate(false) }}
          />
          {createError && (
            <p className="text-[10px] text-destructive">{createError}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => { setShowCreate(false); setCreateError(null) }}
              disabled={creating}
            >
              {t('common:action.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-7 text-xs"
              disabled={creating || !newBranchName.trim()}
            >
              {creating ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden />
              ) : null}
              {t('branches.createSwitch')}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {t('branches.newBranch')}
        </Button>
      )}

      {/* Branch list */}
      {branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <GitBranch className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('branches.empty')}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-0.5" role="list" aria-label={t('branches.list')}>
          {branches.map((branch) => (
            <li key={branch.name}>
              <button
                type="button"
                disabled={branch.current || switching !== null}
                onClick={() => handleClick(branch)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                  branch.current
                    ? 'bg-primary/5 cursor-default'
                    : 'hover:bg-muted/50 cursor-pointer',
                  switching === branch.name && 'opacity-70',
                )}
              >
                {switching === branch.name ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" aria-label={t('branches.switching')} />
                ) : branch.current ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-label={t('branches.currentBranch')} />
                ) : (
                  <GitBranch className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span
                  className={cn(
                    'truncate font-mono text-xs',
                    branch.current && 'font-medium text-primary',
                  )}
                >
                  {branch.name}
                </span>
                {!branch.current && !switching && (
                  <span className="ml-auto text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('branches.switch')}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
