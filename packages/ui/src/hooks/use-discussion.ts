'use client'

import { useCallback, useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { apiGet } from '@/lib/api'
import type { DiscussionStatus } from '@rondoflow/shared'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DiscussionTurn {
  readonly id: string
  readonly agentName: string
  readonly role: string
  readonly content: string
  readonly timestamp: Date
  readonly type: 'participant' | 'moderator_decision' | 'conclusion'
}

export interface UseDiscussionReturn {
  readonly turns: readonly DiscussionTurn[]
  readonly status: DiscussionStatus
  readonly currentRound: number
  readonly conclusion: string | null
  readonly error: string | null
  readonly isRunning: boolean
  readonly start: () => void
  readonly pause: () => void
  readonly resume: () => void
}

// ─── Transcript parsing ──────────────────────────────────────────────────────
// Historical discussion messages are persisted as plain strings tagged by the
// engine (see ModeratorEngine.persist* helpers). Reconstruct timeline turns from
// them so a concluded/in-progress discussion opened from the list shows its flow.

interface TranscriptMessage {
  readonly id: string
  readonly role: string
  readonly content: string
  readonly timestamp: string
}

interface TranscriptResponse {
  readonly tableId: string
  readonly topic: string
  readonly status: DiscussionStatus
  readonly conclusion: string | null
  readonly session: {
    readonly id: string
    readonly startedAt: string
    readonly endedAt: string | null
    readonly messages: readonly TranscriptMessage[]
  } | null
}

function parseTranscript(messages: readonly TranscriptMessage[]): DiscussionTurn[] {
  const turns: DiscussionTurn[] = []
  for (const m of messages) {
    const content = m.content ?? ''
    const timestamp = new Date(m.timestamp)

    if (content.startsWith('[MODERATOR]')) {
      const body = content.slice('[MODERATOR]'.length).trim()
      if (body.startsWith('[SYNTHESIS]')) {
        turns.push({
          id: m.id,
          agentName: 'Moderator',
          role: 'moderator',
          content: body.slice('[SYNTHESIS]'.length).trim(),
          timestamp,
          type: 'conclusion',
        })
      } else {
        // e.g. "[MODERATOR EVALUATION - Round 1] Decision: continue. <reasoning>"
        turns.push({
          id: m.id,
          agentName: 'Moderator',
          role: 'moderator',
          content: body.replace(/^\[[^\]]*\]\s*/, ''),
          timestamp,
          type: 'moderator_decision',
        })
      }
      continue
    }

    // Participant message: "[<name>] Q: <question>\n\nA: <response>"
    const match = content.match(/^\[([^\]]+)\]\s*Q:\s*([\s\S]*?)\n\nA:\s*([\s\S]*)$/)
    if (match) {
      turns.push({
        id: m.id,
        agentName: match[1].trim(),
        role: 'participant',
        content: match[3].trim(),
        timestamp,
        type: 'participant',
      })
    } else {
      turns.push({ id: m.id, agentName: 'Participant', role: 'participant', content, timestamp, type: 'participant' })
    }
  }
  return turns
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useDiscussion(tableId: string | null): UseDiscussionReturn {
  const [turns, setTurns] = useState<readonly DiscussionTurn[]>([])
  const [status, setStatus] = useState<DiscussionStatus>('draft')
  const [currentRound, setCurrentRound] = useState(0)
  const [conclusion, setConclusion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Reset state when tableId changes
  useEffect(() => {
    setTurns([])
    setStatus('draft')
    setCurrentRound(0)
    setConclusion(null)
    setError(null)
  }, [tableId])

  // Load historical transcript so a concluded / in-progress discussion shows its
  // flow even when there are no live socket events to replay.
  useEffect(() => {
    if (!tableId) return
    let cancelled = false

    apiGet<TranscriptResponse>(`/api/discussions/${tableId}/transcript`)
      .then((data) => {
        if (cancelled) return
        if (data.status) setStatus(data.status)
        // The engine stores a "[checkpoint:...]" marker in `conclusion` while
        // running — ignore it; only surface a real synthesis.
        if (data.conclusion && !data.conclusion.startsWith('[checkpoint:')) {
          setConclusion(data.conclusion)
        }
        const messages = data.session?.messages ?? []
        if (messages.length > 0) {
          const parsed = parseTranscript(messages)
          // Only seed if nothing has streamed in live yet.
          setTurns((prev) => (prev.length === 0 ? parsed : prev))
          const participantTurns = parsed.filter((t) => t.type === 'participant').length
          setCurrentRound((prev) => (prev === 0 ? participantTurns : prev))
        }
      })
      .catch(() => {
        // No transcript yet (draft discussion) — leave the empty state.
      })

    return () => {
      cancelled = true
    }
  }, [tableId])

  useEffect(() => {
    if (!tableId) return

    function handleTurn(data: {
      tableId: string
      agentName: string
      role: string
      content: string
    }) {
      if (data.tableId !== tableId) return

      const turn: DiscussionTurn = {
        id: crypto.randomUUID(),
        agentName: data.agentName,
        role: data.role,
        content: data.content,
        timestamp: new Date(),
        type: 'participant',
      }

      setTurns((prev) => [...prev, turn])
      setStatus('active')
      // Increment round when the first participant speaks in a new round.
      // The server sends role='moderator' for moderator decisions; only
      // count participant turns to approximate round tracking client-side.
      if (data.role !== 'moderator') {
        setCurrentRound((prev) => prev + 1)
      }
    }

    function handleModerator(data: {
      tableId: string
      decision: string
      reasoning: string
    }) {
      if (data.tableId !== tableId) return

      const turn: DiscussionTurn = {
        id: crypto.randomUUID(),
        agentName: 'Moderator',
        role: 'moderator',
        content: `${data.decision}: ${data.reasoning}`,
        timestamp: new Date(),
        type: 'moderator_decision',
      }

      setTurns((prev) => [...prev, turn])
    }

    function handleConcluded(data: { tableId: string; conclusion: string }) {
      if (data.tableId !== tableId) return

      const turn: DiscussionTurn = {
        id: crypto.randomUUID(),
        agentName: 'Moderator',
        role: 'moderator',
        content: data.conclusion,
        timestamp: new Date(),
        type: 'conclusion',
      }

      setTurns((prev) => [...prev, turn])
      setConclusion(data.conclusion)
      setStatus('concluded')
    }

    // The server reports discussion failures (e.g. table not found, engine crash)
    // via the generic agent:error channel, keyed by the discussion id.
    function handleError(data: { agentId: string; error: string }) {
      if (data.agentId !== tableId) return
      setError(data.error)
      // A discussion that never produced a turn is still effectively a draft —
      // revert so the user can fix the setup and press Start again.
      setStatus((prev) => (prev === 'active' ? 'draft' : prev))
    }

    const socket = getSocket()
    socket.on('discussion:turn', handleTurn)
    socket.on('discussion:moderator', handleModerator)
    socket.on('discussion:concluded', handleConcluded)
    socket.on('agent:error', handleError)

    return () => {
      socket.off('discussion:turn', handleTurn)
      socket.off('discussion:moderator', handleModerator)
      socket.off('discussion:concluded', handleConcluded)
      socket.off('agent:error', handleError)
    }
  }, [tableId])

  const start = useCallback(() => {
    if (!tableId) return
    setError(null)
    getSocket().emit('discussion:start', { tableId })
    setStatus('active')
  }, [tableId])

  const pause = useCallback(() => {
    if (!tableId) return
    getSocket().emit('discussion:pause', { tableId })
  }, [tableId])

  const resume = useCallback(() => {
    if (!tableId) return
    getSocket().emit('discussion:resume', { tableId })
  }, [tableId])

  const isRunning = status === 'active'

  return {
    turns,
    status,
    currentRound,
    conclusion,
    error,
    isRunning,
    start,
    pause,
    resume,
  }
}
