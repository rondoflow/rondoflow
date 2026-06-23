'use client'

import { useCallback, useEffect, useState } from 'react'
import { getSocket, isSocketCreated } from '@/lib/socket'
import { apiGet } from '@/lib/api'

interface PrereqResult {
  readonly name: string
  readonly passed: boolean
  readonly message: string
  readonly fix?: string
  readonly critical: boolean
}

interface PrerequisitesReport {
  readonly allPassed: boolean
  readonly critical: boolean
  readonly results: readonly PrereqResult[]
  readonly failures: readonly PrereqResult[]
}

export interface UsePrerequisitesReturn {
  /** Whether the Claude Code CLI is installed. */
  readonly cliInstalled: boolean
  /** Whether we're still waiting for the initial check. */
  readonly loading: boolean
  /** Re-check prerequisites by calling the health API. */
  readonly recheck: () => Promise<void>
}

export function usePrerequisites(): UsePrerequisitesReturn {
  const [cliInstalled, setCliInstalled] = useState(true) // optimistic default
  const [loading, setLoading] = useState(true)

  // Listen for the socket 'prerequisites' event on connect
  useEffect(() => {
    if (!isSocketCreated()) {
      setLoading(false)
      return
    }

    const socket = getSocket()

    function handlePrereqs(report: PrerequisitesReport) {
      const cli = report.results.find((r) => r.name === 'Claude Code CLI')
      setCliInstalled(cli?.passed ?? true)
      setLoading(false)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('prerequisites' as any, handlePrereqs)
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.off('prerequisites' as any, handlePrereqs)
    }
  }, [])

  const recheck = useCallback(async () => {
    setLoading(true)
    try {
      const health = await apiGet<{
        status: string
        prerequisites: PrerequisitesReport
      }>('/api/health')
      const cli = health.prerequisites.results.find((r) => r.name === 'Claude Code CLI')
      setCliInstalled(cli?.passed ?? true)
    } catch {
      // If health check fails, keep current state
    } finally {
      setLoading(false)
    }
  }, [])

  return { cliInstalled, loading, recheck }
}
