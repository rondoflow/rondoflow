'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Folder, Check, Loader2, X, Clock, AlertCircle, Trash, Shield } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FleetPanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly workspaceId?: string | null
}

type FleetTabId = 'worktrees' | 'runs' | 'schedules'

const TABS: { id: FleetTabId; labelKey: string }[] = [
  { id: 'worktrees', labelKey: 'fleet.tab.worktrees' },
  { id: 'runs', labelKey: 'fleet.tab.runs' },
  { id: 'schedules', labelKey: 'fleet.tab.schedules' },
]

// ─── Component ──────────────────────────────────────────────────────────────

export function FleetPanel({ open, onOpenChange, workspaceId }: FleetPanelProps) {
  const { t } = useTranslation('fleet')
  const [activeTab, setActiveTab] = useState<FleetTabId>('worktrees')
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch worktrees via API endpoint (we'll create this)
  const { data: worktrees = [], isLoading: loadingWorktrees, refetch: refetchWorktrees } = useQuery({
    queryKey: ['worktrees', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      try {
        // Call API to get worktree info
        const res = await fetch(`/api/fleet/worktrees?workspaceId=${workspaceId}`, {
          credentials: 'include',
        })
        if (!res.ok) return []
        return res.json()
      } catch {
        return []
      }
    },
    enabled: !!workspaceId,
    refetchInterval: 3000,
  })

  // Fetch running runs via API endpoint
  const { data: runningRuns = [], isLoading: loadingRuns, refetch: refetchRuns } = useQuery({
    queryKey: ['fleet-runs', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      try {
        const res = await fetch(`/api/fleet/runs?workspaceId=${workspaceId}`, {
          credentials: 'include',
        })
        if (!res.ok) return []
        return res.json()
      } catch {
        return []
      }
    },
    refetchInterval: 3000,
  })

  // Fetch scheduled tasks
  const { data: schedules = [], isLoading: loadingSchedules, refetch: refetchSchedules } = useQuery({
    queryKey: ['fleet-schedules', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      try {
        const res = await fetch(`/api/fleet/schedules?workspaceId=${workspaceId}`, {
          credentials: 'include',
        })
        if (!res.ok) return []
        return res.json()
      } catch {
        return []
      }
    },
    refetchInterval: 3000,
  })

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
            <Folder className="h-4 w-4 text-orange-400" aria-hidden />
            <span className="text-sm font-semibold">{t('title')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setRefreshKey(prev => prev + 1)}
              aria-label={t('action.refresh')}
            >
              <Loader2
                className={cn('h-3.5 w-3.5', prev => `animate-spin-${prev}`, { ensureUnique: true })}
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

        {/* Overview stats */}
        <div className="shrink-0 border-b border-border px-4 py-2">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs text-muted-foreground">{t('overview.totalWorktrees', { count: worktrees.length })}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">{t('overview.activeRuns', { count: runningRuns.length })}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">{t('overview.scheduledTasks', { count: schedules.length })}</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex shrink-0 border-b border-border" role="tablist" aria-label={t('tabs')}>
          {TABS.map((tab) => {
            const count =
              tab.id === 'worktrees'
                ? worktrees.length
                : tab.id === 'runs'
                ? runningRuns.length
                : schedules.length

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
          {/* Worktrees Tab */}
          {activeTab === 'worktrees' && (
            <div className={cn(
              'space-y-4',
              loadingWorktrees && 'h-64'
            )}>
              {loadingWorktrees ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">{t('loading')}</span>
                </div>
              ) : worktrees.length === 0 ? (
                <div className="text-muted-foreground/60">
                  <span>{t('fleet.noWorktrees')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {worktrees.map((wt) => (
                    <div
                      key={wt.id}
                      className="border rounded-lg p-3 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <Folder className="h-4 w-4 text-orange-400 shrink-0 flex-s-0 mt-0.5" aria-hidden />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{wt.name ?? wt.id}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {wt.cwd || t('fleet.noCwd')}
                          </p>
                          {wt.agentId && (
                            <Badge variant="outline" className="gap-1 text-[9px]">
                              {t('fleet.agent', { agent: wt.agentId })}
                            </Badge>
                          )}
                          {wt.chainId && (
                            <span className="text-[9px] text-muted-foreground ml-1">
                              {t('fleet.chain', { chain: wt.chainId })}
                            </span>
                          )}
                        </div>
                        {/* Status badge */}
                        <div className="ml-auto flex items-center gap-1">
                          {wt.status === 'running' && (
                            <Badge variant="primary" className="text-[8px]">
                              {t('running')}
                            </Badge>
                          )}
                          {wt.status === 'error' && (
                            <Badge variant="destructive" className="text-[8px]">
                              {t('error')}
                            </Badge>
                          )}
                          {wt.status === 'pending' && (
                            <Badge variant="secondary" className="text-[8px]">
                              {t('pending')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {/* Buttons */}
                      <div className="mt-2 flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          title={t('action.details')}
                          aria-label={t('action.details')}
                        >
                          <span className="self-center" aria-hidden>
                            {/* details icon */}
                          </span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          title={t('action.kill')}
                          aria-label={t('action.kill')}
                        >
                          <Trash className="h-3.5 w-3.5 text-destructive" aria-hidden />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          title={t('action.pr')}
                          aria-label={t('action.pr')}
                        >
                          {/* PR link */}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Runs Tab */}
          {activeTab === 'runs' && (
            <div className={cn(
              'space-y-4',
              loadingRuns && 'h-64'
            )}>
              {loadingRuns ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">{t('loading')}</span>
                </div>
              ) : runningRuns.length === 0 ? (
                <div className="text-muted-foreground/60">
                  <span>{t('fleet.noRuns')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {runningRuns.map((run) => (
                    <div
                      key={run.id}
                      className="border rounded-lg p-3 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className="h-4 w-4 rounded-full bg-orange-400 text-white flex-s-0 mt-0.5 flex-shrink-0" aria-hidden />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{run.agentId || run.chainId || t('fleet.unknown')}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {run.cwd || t('fleet.noCwd')}
                          </p>
                          {run.pid && (
                            <span className="text-[9px] text-muted-foreground ml-1">
                              PID: {run.pid}
                            </span>
                          )}
                        </div>
                        {/* Status badge */}
                        <div className="ml-auto flex items-center gap-1">
                          {run.status === 'running' && (
                            <Badge variant="primary" className="text-[8px]">
                              {t('running')}
                            </Badge>
                          )}
                          {run.status === 'error' && (
                            <Badge variant="destructive" className="text-[8px]">
                              {t('error')}
                            </Badge>
                          )}
                          {run.status === 'completed' && (
                            <Badge variant="success" className="text-[8px]">
                              {t('completed')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {/* Buttons */}
                      <div className="mt-2 flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          title={t('action.details')}
                          aria-label={t('action.details')}
                        >
                          {/* details icon */}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          title={t('action.kill')}
                          aria-label={t('action.kill')}
                        >
                          <Trash className="h-3.5 w-3.5 text-destructive" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <div className="space-y-4">
              {schedules.length === 0 ? (
                <div className="text-muted-foreground/60">
                  <span>{t('fleet.noSchedules')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="border rounded-lg p-3 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className="h-4 w-4 rounded bg-blue-500 text-white flex-s-0 mt-0.5 flex-shrink-0" aria-hidden />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{schedule.name || schedule.id}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t('cron', { cron: schedule.schedule })}