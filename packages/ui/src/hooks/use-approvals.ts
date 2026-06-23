'use client'

import { useCallback, useEffect, useState } from 'react'
import { getSocket, isSocketCreated } from '@/lib/socket'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PendingApproval {
  readonly id: string
  readonly agentId: string
  readonly agentName: string
  readonly command: string
  readonly description: string
  readonly toolName: string
  readonly queuedAt: Date
}

export interface UseApprovalsReturn {
  readonly pendingApprovals: readonly PendingApproval[]
  readonly pendingCount: number
  readonly currentApproval: PendingApproval | null
  readonly showApprovalDialog: boolean
  readonly approve: (id: string, editedCommand?: string) => void
  readonly reject: (id: string) => void
  readonly dismissDialog: () => void
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useApprovals(): UseApprovalsReturn {
  const [pendingApprovals, setPendingApprovals] = useState<readonly PendingApproval[]>([])
  const [currentApproval, setCurrentApproval] = useState<PendingApproval | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)

  // When the current approval closes, promote the next one from the queue
  const promoteNext = useCallback((remaining: readonly PendingApproval[]) => {
    if (remaining.length > 0) {
      setCurrentApproval(remaining[0])
      setShowApprovalDialog(true)
    } else {
      setCurrentApproval(null)
      setShowApprovalDialog(false)
    }
  }, [])

  useEffect(() => {
    function handleApproval(data: {
      agentId: string
      sessionId: string
      command: string
      description: string
    }) {
      const approval: PendingApproval = {
        id: crypto.randomUUID(),
        agentId: data.agentId,
        // Agent name will be resolved in page.tsx where agent data is available;
        // fall back to agentId for now
        agentName: data.agentId,
        command: data.command,
        description: data.description,
        toolName: 'shell',
        queuedAt: new Date(),
      }

      setPendingApprovals((prev) => {
        const updated = [...prev, approval]

        // If no dialog is currently open, show this approval immediately
        setShowApprovalDialog((currentlyShowing) => {
          if (!currentlyShowing) {
            setCurrentApproval(approval)
            return true
          }
          return currentlyShowing
        })

        return updated
      })
    }

    if (!isSocketCreated()) return

    const socket = getSocket()
    socket.on('agent:approval', handleApproval)

    return () => {
      socket.off('agent:approval', handleApproval)
    }
  }, [])

  const approve = useCallback(
    (id: string, editedCommand?: string) => {
      const approval = pendingApprovals.find((a) => a.id === id) ?? currentApproval

      if (!approval) return

      getSocket().emit('approval:respond', {
        agentId: approval.agentId,
        approved: true,
        editedCommand,
      })

      setPendingApprovals((prev) => {
        const remaining = prev.filter((a) => a.id !== id)
        promoteNext(remaining)
        return remaining
      })
    },
    [pendingApprovals, currentApproval, promoteNext],
  )

  const reject = useCallback(
    (id: string) => {
      const approval = pendingApprovals.find((a) => a.id === id) ?? currentApproval

      if (!approval) return

      getSocket().emit('approval:respond', {
        agentId: approval.agentId,
        approved: false,
      })

      setPendingApprovals((prev) => {
        const remaining = prev.filter((a) => a.id !== id)
        promoteNext(remaining)
        return remaining
      })
    },
    [pendingApprovals, currentApproval, promoteNext],
  )

  const dismissDialog = useCallback(() => {
    setShowApprovalDialog(false)
    setCurrentApproval(null)
  }, [])

  return {
    pendingApprovals,
    pendingCount: pendingApprovals.length,
    currentApproval,
    showApprovalDialog,
    approve,
    reject,
    dismissDialog,
  }
}
