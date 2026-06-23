'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getSocket, isSocketCreated } from '@/lib/socket'

// ─── Types ─────────────────────────────────────────────────────────────────

export type NotificationLevel = 'info' | 'action_required' | 'critical' | 'error'

export interface rondoflowNotification {
  readonly id: string
  readonly level: NotificationLevel
  readonly title: string
  readonly description?: string
  readonly agentId?: string
  readonly agentName?: string
  readonly command?: string
  readonly actions?: readonly string[]
  readonly createdAt: Date
  readonly acknowledged: boolean
}

export interface UseNotificationsReturn {
  readonly notifications: readonly rondoflowNotification[]
  readonly unreadCount: number
  readonly addNotification: (n: Omit<rondoflowNotification, 'id' | 'createdAt' | 'acknowledged'>) => void
  readonly acknowledge: (id: string) => void
  readonly acknowledgeAll: () => void
  readonly removeNotification: (id: string) => void
  readonly clearAll: () => void
}

// ─── Browser notification helper ──────────────────────────────────────────

function sendBrowserNotification(title: string, body?: string): void {
  if (typeof window === 'undefined') return
  if (document.visibilityState === 'visible') return
  if (Notification.permission !== 'granted') return

  try {
    new Notification(title, { body, icon: '/favicon.ico' })
  } catch {
    // Silently ignore — browser may block notifications in some contexts
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useNotifications(): UseNotificationsReturn {
  const { t } = useTranslation('notifications')
  const [notifications, setNotifications] = useState<readonly rondoflowNotification[]>([])
  const permissionRequestedRef = useRef(false)

  // Keep the latest translator in a ref so the socket effect (attached once)
  // always uses the current language without re-subscribing on language change.
  const tRef = useRef(t)
  tRef.current = t

  // Request browser Notification API permission once on mount
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      permissionRequestedRef.current ||
      !('Notification' in window)
    ) {
      return
    }

    permissionRequestedRef.current = true

    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {
        // Permission denied — browser notifications unavailable
      })
    }
  }, [])

  const addNotification = useCallback(
    (n: Omit<rondoflowNotification, 'id' | 'createdAt' | 'acknowledged'>) => {
      const newNotification: rondoflowNotification = {
        ...n,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        acknowledged: false,
      }

      setNotifications((prev) => [newNotification, ...prev])

      if (n.level === 'action_required' || n.level === 'critical') {
        sendBrowserNotification(n.title, n.description)
      }
    },
    [],
  )

  const acknowledge = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, acknowledged: true } : n)),
    )
  }, [])

  const acknowledgeAll = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, acknowledged: true })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // ── Socket event listeners (only when socket exists) ──────────────────

  useEffect(() => {
    // Don't create the socket just to listen — wait until it's created by user action
    if (!isSocketCreated()) return
    function handleNotification(data: {
      id: string
      level: NotificationLevel
      title: string
      agentId?: string
      actions?: string[]
    }) {
      const newNotification: rondoflowNotification = {
        id: data.id,
        level: data.level,
        title: data.title,
        agentId: data.agentId,
        actions: data.actions,
        createdAt: new Date(),
        acknowledged: false,
      }

      setNotifications((prev) => [newNotification, ...prev])

      if (data.level === 'action_required' || data.level === 'critical') {
        sendBrowserNotification(data.title)
      }
    }

    function handleApproval(data: {
      agentId: string
      sessionId: string
      command: string
      description: string
    }) {
      const tt = tRef.current
      const approvalTitle = tt('event.approvalRequired.title')
      const newNotification: rondoflowNotification = {
        id: crypto.randomUUID(),
        level: 'action_required',
        title: approvalTitle,
        description: data.description,
        agentId: data.agentId,
        command: data.command,
        actions: [tt('approval.approve'), tt('approval.reject')],
        createdAt: new Date(),
        acknowledged: false,
      }

      setNotifications((prev) => [newNotification, ...prev])
      sendBrowserNotification(approvalTitle, data.description)
    }

    function handleAgentError(data: {
      agentId: string
      sessionId: string
      error: string
      type: string
    }) {
      const newNotification: rondoflowNotification = {
        id: crypto.randomUUID(),
        level: 'error',
        title: tRef.current('event.agentError.title'),
        description: data.error,
        agentId: data.agentId,
        createdAt: new Date(),
        acknowledged: false,
      }

      setNotifications((prev) => [newNotification, ...prev])
    }

    function handleAgentDone(data: { agentId: string; sessionId: string }) {
      const newNotification: rondoflowNotification = {
        id: crypto.randomUUID(),
        level: 'info',
        title: tRef.current('event.agentDone.title'),
        description: tRef.current('event.agentDone.description', { id: data.agentId }),
        agentId: data.agentId,
        createdAt: new Date(),
        acknowledged: false,
      }

      setNotifications((prev) => [newNotification, ...prev])
    }

    const sock = getSocket()
    sock.on('notification', handleNotification)
    sock.on('agent:approval', handleApproval)
    sock.on('agent:error', handleAgentError)
    sock.on('agent:done', handleAgentDone)

    return () => {
      sock.off('notification', handleNotification)
      sock.off('agent:approval', handleApproval)
      sock.off('agent:error', handleAgentError)
      sock.off('agent:done', handleAgentDone)
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.acknowledged).length

  return {
    notifications,
    unreadCount,
    addNotification,
    acknowledge,
    acknowledgeAll,
    removeNotification,
    clearAll,
  }
}
