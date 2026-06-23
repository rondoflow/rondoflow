'use client'

import { useEffect, useRef, useState } from 'react'
import type { AgentStatus, TokenUsage } from '@rondoflow/shared'
import { getSocket } from '@/lib/socket'

interface UseAgentStatusReturn {
  readonly sessionTokens: number
  readonly activeAgentIds: ReadonlySet<string>
  /** Increment session token count from external sources (e.g. chain:step_usage) */
  readonly addTokens: (tokens: number) => void
}

/**
 * Listens for agent:status and agent:done socket events at the page level.
 * - Updates node data status when agents start/stop
 * - Accumulates total session token usage for the bottom bar
 * - Tracks which agents are currently active (for edge animation)
 *
 * Listeners are re-attached on socket reconnect to ensure no events are missed.
 */
export function useAgentStatus(
  onNodeStatusChange: (agentId: string, status: AgentStatus) => void,
): UseAgentStatusReturn {
  const [sessionTokens, setSessionTokens] = useState(0)
  const [activeAgentIds, setActiveAgentIds] = useState<ReadonlySet<string>>(new Set())
  const callbackRef = useRef(onNodeStatusChange)
  const deactivateTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  callbackRef.current = onNodeStatusChange

  useEffect(() => {
    const socket = getSocket()

    const handleStatus = (data: { agentId: string; status: string }) => {
      callbackRef.current(data.agentId, data.status as AgentStatus)

      if (data.status === 'running') {
        // Clear any pending deactivation timer
        const timer = deactivateTimers.current.get(data.agentId)
        if (timer) {
          clearTimeout(timer)
          deactivateTimers.current.delete(data.agentId)
        }
        setActiveAgentIds((prev) => {
          const next = new Set(prev)
          next.add(data.agentId)
          return next
        })
      }
    }

    const handleDone = (data: { agentId: string; sessionId: string; usage: TokenUsage }) => {
      const total = (data.usage?.inputTokens ?? 0) + (data.usage?.outputTokens ?? 0)
      if (total > 0) {
        setSessionTokens((prev) => prev + total)
      }
      callbackRef.current(data.agentId, 'idle')

      // Deactivate after a delay for visual trail effect
      const timer = setTimeout(() => {
        setActiveAgentIds((prev) => {
          const next = new Set(prev)
          next.delete(data.agentId)
          return next
        })
        deactivateTimers.current.delete(data.agentId)
      }, 1500)
      deactivateTimers.current.set(data.agentId, timer)
    }

    // Attach listeners — works even if socket isn't connected yet.
    // Socket.IO queues listeners and fires them once connected.
    socket.on('agent:status', handleStatus)
    socket.on('agent:done', handleDone)

    // Re-attach on reconnect to handle cases where the server
    // restarts and the socket reconnects with a new session.
    const handleReconnect = () => {
      socket.off('agent:status', handleStatus)
      socket.off('agent:done', handleDone)
      socket.on('agent:status', handleStatus)
      socket.on('agent:done', handleDone)
    }
    socket.io.on('reconnect', handleReconnect)

    const timers = deactivateTimers.current
    return () => {
      socket.off('agent:status', handleStatus)
      socket.off('agent:done', handleDone)
      socket.io.off('reconnect', handleReconnect)
      for (const timer of timers.values()) {
        clearTimeout(timer)
      }
    }
  }, [])

  const addTokens = (tokens: number) => {
    if (tokens > 0) {
      setSessionTokens((prev) => prev + tokens)
    }
  }

  return { sessionTokens, activeAgentIds, addTokens }
}
