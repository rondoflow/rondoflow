'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet, apiPost } from '@/lib/api'
import type { GitStatusResult, GitLogEntry, GitBranchEntry, GitPushResult } from '@rondoflow/shared'
import { INTERVALS } from '@rondoflow/shared'

export interface UseGitReturn {
  status: GitStatusResult | null
  log: GitLogEntry[]
  branches: GitBranchEntry[]
  remoteUrl: string | null
  loading: boolean
  error: string | null
  refreshStatus: () => Promise<void>
  refreshLog: () => Promise<void>
  refreshBranches: () => Promise<void>
  stageFiles: (paths: string[]) => Promise<void>
  unstageFiles: (paths: string[]) => Promise<void>
  commit: (message: string) => Promise<void>
  push: () => Promise<GitPushResult>
  checkoutBranch: (branch: string) => Promise<void>
}

function wsQuery(workspaceId?: string | null): string {
  return workspaceId ? `?workspaceId=${workspaceId}` : ''
}

export function useGit(active: boolean, workspaceId?: string | null): UseGitReturn {
  const { t } = useTranslation('git')
  const [status, setStatus] = useState<GitStatusResult | null>(null)
  const [log, setLog] = useState<GitLogEntry[]>([])
  const [branches, setBranches] = useState<GitBranchEntry[]>([])
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshStatus = useCallback(async () => {
    try {
      const data = await apiGet<GitStatusResult>(`/api/git/status${wsQuery(workspaceId)}`)
      setStatus(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.statusFailed'))
    }
  }, [workspaceId, t])

  const refreshLog = useCallback(async () => {
    try {
      const qs = workspaceId ? `?limit=30&workspaceId=${workspaceId}` : '?limit=30'
      const data = await apiGet<GitLogEntry[]>(`/api/git/log${qs}`)
      setLog(data)
    } catch {
      // best effort
    }
  }, [workspaceId])

  const refreshBranches = useCallback(async () => {
    try {
      const data = await apiGet<GitBranchEntry[]>(`/api/git/branches${wsQuery(workspaceId)}`)
      setBranches(data)
    } catch {
      // best effort
    }
  }, [workspaceId])

  // Initial load + auto-refresh
  useEffect(() => {
    if (!active) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    setLoading(true)
    Promise.all([
      refreshStatus(),
      refreshLog(),
      refreshBranches(),
      apiGet<{ url: string | null }>(`/api/git/remote${wsQuery(workspaceId)}`)
        .then((data) => setRemoteUrl(data.url))
        .catch(() => setRemoteUrl(null)),
    ]).finally(() => setLoading(false))

    intervalRef.current = setInterval(() => {
      void refreshStatus()
    }, INTERVALS.GIT_STATUS_POLL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [active, workspaceId, refreshStatus, refreshLog, refreshBranches])

  const stageFiles = useCallback(async (paths: string[]) => {
    setError(null)
    try {
      await apiPost('/api/git/stage', { paths, workspaceId: workspaceId ?? undefined })
      await refreshStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.stageFailed'))
    }
  }, [workspaceId, refreshStatus, t])

  const unstageFiles = useCallback(async (paths: string[]) => {
    setError(null)
    try {
      await apiPost('/api/git/unstage', { paths, workspaceId: workspaceId ?? undefined })
      await refreshStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.unstageFailed'))
    }
  }, [workspaceId, refreshStatus, t])

  const commit = useCallback(async (message: string) => {
    setError(null)
    try {
      await apiPost('/api/git/commit', { message, workspaceId: workspaceId ?? undefined })
      await Promise.all([refreshStatus(), refreshLog()])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.commitFailed'))
    }
  }, [workspaceId, refreshStatus, refreshLog, t])

  const push = useCallback(async (): Promise<GitPushResult> => {
    setError(null)
    try {
      const result = await apiPost<GitPushResult>('/api/git/push', { workspaceId: workspaceId ?? undefined })
      if (!result.success) {
        setError(result.message)
      }
      await refreshStatus()
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('error.pushFailed')
      setError(msg)
      return { success: false, message: msg }
    }
  }, [workspaceId, refreshStatus, t])

  const checkoutBranch = useCallback(async (branch: string) => {
    setError(null)
    try {
      await apiPost('/api/git/checkout', { branch, workspaceId: workspaceId ?? undefined })
      await Promise.all([refreshStatus(), refreshBranches(), refreshLog()])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.checkoutFailed'))
    }
  }, [workspaceId, refreshStatus, refreshBranches, refreshLog, t])

  return {
    status, log, branches, remoteUrl, loading, error,
    refreshStatus, refreshLog, refreshBranches,
    stageFiles, unstageFiles, commit, push, checkoutBranch,
  }
}
