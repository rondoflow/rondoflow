'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TokenUsage, AgentMode } from '@rondoflow/shared'
import { getSocket } from '@/lib/socket'
import i18n from '@/lib/i18n'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ChatMessage {
  readonly id: string
  readonly role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  readonly toolUse?: {
    readonly toolName: string
    readonly input: unknown
    output?: unknown
  }
  readonly timestamp: Date
  partial?: boolean
}

export interface AgentChatError {
  readonly type: string
  readonly message: string
  readonly userMessage: string
  readonly retryable: boolean
}

export interface UseAgentStreamReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  tokenUsage: TokenUsage | null
  error: AgentChatError | null
  mode: AgentMode
  sendMessage: (message: string) => void
  stopAgent: () => void
  clearMessages: () => void
  setMode: (mode: AgentMode) => void
}

// ─── Error classification ──────────────────────────────────────────────────

function classifyError(type: string, rawMessage: string): AgentChatError {
  const retryableTypes = new Set(['timeout', 'rate_limit', 'network', 'overloaded'])
  const retryable = retryableTypes.has(type)

  const USER_MESSAGES: Record<string, string> = {
    timeout: i18n.t('app:agentStream.error.timeout'),
    rate_limit: i18n.t('app:agentStream.error.rateLimit'),
    network: i18n.t('app:agentStream.error.network'),
    overloaded: i18n.t('app:agentStream.error.overloaded'),
    auth: i18n.t('app:agentStream.error.auth'),
    context_length: i18n.t('app:agentStream.error.contextLength'),
    PROCESS_ERROR: i18n.t('app:agentStream.error.processError'),
    APPROVAL_TIMEOUT: i18n.t('app:agentStream.error.approvalTimeout'),
  }

  return {
    type,
    message: rawMessage,
    userMessage: USER_MESSAGES[type] ?? (rawMessage || i18n.t('app:agentStream.error.unexpected')),
    retryable,
  }
}

// ─── Session-level message cache ──────────────────────────────────────────
// Survives component unmount/remount so closing and reopening the chat
// panel preserves the conversation for the duration of the browser session.

interface CachedSession {
  messages: ChatMessage[]
  tokenUsage: TokenUsage | null
  updatedAt: number
}

const messageCache = new Map<string, CachedSession>()

// Evict entries older than 30 minutes to avoid unbounded growth
const CACHE_TTL_MS = 30 * 60 * 1000

/**
 * Inject messages into the agent stream cache so the agent chat panel
 * can display them (e.g. workflow step history).
 */
export function injectMessagesIntoCache(agentId: string, messages: ChatMessage[], tokenUsage?: TokenUsage | null): void {
  messageCache.set(agentId, { messages, tokenUsage: tokenUsage ?? null, updatedAt: Date.now() })
}

function pruneCache() {
  const now = Date.now()
  for (const [key, entry] of messageCache) {
    if (now - entry.updatedAt > CACHE_TTL_MS) {
      messageCache.delete(key)
    }
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAgentStream(
  agentId: string | null,
  workspaceId?: string | null,
): UseAgentStreamReturn {
  const [messages, setMessagesRaw] = useState<ChatMessage[]>(
    () => (agentId ? messageCache.get(agentId)?.messages : undefined) ?? [],
  )
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(
    () => (agentId ? messageCache.get(agentId)?.tokenUsage : undefined) ?? null,
  )
  const [error, setError] = useState<AgentChatError | null>(null)
  const [mode, setModeState] = useState<AgentMode>('default')

  // Wrapper that syncs messages to the module-level cache
  const setMessages: typeof setMessagesRaw = useCallback(
    (action) => {
      setMessagesRaw((prev) => {
        const next = typeof action === 'function' ? action(prev) : action
        if (agentIdRef.current) {
          messageCache.set(agentIdRef.current, {
            messages: next,
            tokenUsage: null, // updated separately
            updatedAt: Date.now(),
          })
        }
        return next
      })
    },
    [],
  )

  const streamingMessageIdRef = useRef<string | null>(null)
  const listenersAttachedRef = useRef(false)
  const agentIdRef = useRef(agentId)
  const workspaceIdRef = useRef(workspaceId)

  // Keep refs in sync and restore cache when switching agents
  useEffect(() => {
    agentIdRef.current = agentId
    // Reset listeners when agent changes so they reattach for the new agent
    listenersAttachedRef.current = false

    // Restore cached messages for the new agent
    const cached = agentId ? messageCache.get(agentId) : undefined
    setMessagesRaw(cached?.messages ?? [])
    setTokenUsage(cached?.tokenUsage ?? null)
    setError(null)
    setIsStreaming(false)

    pruneCache()
  }, [agentId])

  useEffect(() => {
    workspaceIdRef.current = workspaceId
  }, [workspaceId])

  // Attach socket listeners — called once when first message is sent
  const ensureListeners = useCallback(() => {
    if (listenersAttachedRef.current) return
    listenersAttachedRef.current = true

    const socket = getSocket()

    socket.on('agent:text', (data) => {
      if (data.agentId !== agentIdRef.current) return

      if (data.partial) {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === 'assistant' && last.partial) {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + data.content },
            ]
          }
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: data.content,
              timestamp: new Date(),
              partial: true,
            },
          ]
        })
        setIsStreaming(true)
      } else {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === 'assistant' && last.partial) {
            return [
              ...prev.slice(0, -1),
              { ...last, content: data.content || last.content, partial: false },
            ]
          }
          if (data.content) {
            return [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.content,
                timestamp: new Date(),
                partial: false,
              },
            ]
          }
          return prev
        })
      }
    })

    socket.on('agent:tool_use', (data) => {
      if (data.agentId !== agentIdRef.current) return
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'tool',
          content: '',
          toolUse: { toolName: data.toolName, input: data.input },
          timestamp: new Date(),
        },
      ])
    })

    socket.on('agent:tool_result', (data) => {
      if (data.agentId !== agentIdRef.current) return
      setMessages((prev) => {
        const idx = [...prev].reverse().findIndex(
          (m) => m.role === 'tool' && m.toolUse?.toolName === data.toolName,
        )
        if (idx === -1) return prev
        const realIdx = prev.length - 1 - idx
        return [
          ...prev.slice(0, realIdx),
          { ...prev[realIdx], toolUse: { ...prev[realIdx].toolUse!, output: data.output } },
          ...prev.slice(realIdx + 1),
        ]
      })
    })

    socket.on('agent:error', (data) => {
      if (data.agentId !== agentIdRef.current) return
      setIsStreaming(false)
      streamingMessageIdRef.current = null
      setError(classifyError(data.type, data.error))
    })

    socket.on('agent:done', (data) => {
      if (data.agentId !== agentIdRef.current) return
      setIsStreaming(false)
      streamingMessageIdRef.current = null
      setTokenUsage(data.usage)
      // Sync token usage to cache
      if (agentIdRef.current) {
        const cached = messageCache.get(agentIdRef.current)
        if (cached) {
          messageCache.set(agentIdRef.current, { ...cached, tokenUsage: data.usage, updatedAt: Date.now() })
        }
      }
      // Finalize any dangling partial message
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.partial) {
          return [...prev.slice(0, -1), { ...last, partial: false }]
        }
        return prev
      })
    })

    socket.on('agent:mode_changed', (data) => {
      if (data.agentId !== agentIdRef.current) return
      setModeState(data.mode)
    })
  }, [setMessages])

  const sendMessage = useCallback(
    (message: string) => {
      if (!agentId || !message.trim()) return

      const trimmed = message.trim()

      setError(null)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'user',
          content: trimmed,
          timestamp: new Date(),
        },
      ])

      const sock = getSocket()

      // Ensure listeners are attached BEFORE sending
      ensureListeners()

      if (!sock.connected) {
        sock.connect()

        const connectTimeout = setTimeout(() => {
          if (!sock.connected) {
            setIsStreaming(false)
            setError({
              type: 'network',
              message: i18n.t('app:agentStream.error.cannotReachServerRaw'),
              userMessage: i18n.t('app:agentStream.error.cannotReachServer'),
              retryable: true,
            })
          }
        }, 5000)

        sock.once('connect', () => {
          clearTimeout(connectTimeout)
          setIsStreaming(true)
          sock.emit('agent:start', {
            agentId,
            message: trimmed,
            workspaceId: workspaceIdRef.current ?? undefined,
          })
        })
        return
      }

      if (isStreaming) {
        sock.emit('agent:message', { agentId, message: trimmed })
      } else {
        setIsStreaming(true)
        sock.emit('agent:start', {
          agentId,
          message: trimmed,
          workspaceId: workspaceIdRef.current ?? undefined,
        })
      }
    },
    [agentId, isStreaming, ensureListeners, setMessages],
  )

  const stopAgent = useCallback(() => {
    if (!agentId) return
    getSocket().emit('agent:stop', { agentId })
    setIsStreaming(false)
    streamingMessageIdRef.current = null
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (last?.partial) {
        return [...prev.slice(0, -1), { ...last, partial: false }]
      }
      return prev
    })
  }, [agentId, setMessages])

  const clearMessages = useCallback(() => {
    setMessagesRaw([])
    setTokenUsage(null)
    setError(null)
    setIsStreaming(false)
    streamingMessageIdRef.current = null
    if (agentIdRef.current) {
      messageCache.delete(agentIdRef.current)
    }
  }, [])

  const setMode = useCallback(
    (newMode: AgentMode) => {
      if (!agentId) return
      const sock = getSocket()
      ensureListeners()
      if (sock.connected) {
        sock.emit('agent:set_mode', { agentId, mode: newMode })
      }
    },
    [agentId, ensureListeners],
  )

  return { messages, isStreaming, tokenUsage, error, mode, sendMessage, stopAgent, clearMessages, setMode }
}
