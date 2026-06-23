'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getSocket } from '@/lib/socket'

export interface UseSocketReturn {
  connected: boolean
  connecting: boolean
  error: string | null
  connect: () => void
}

/**
 * Socket connection hook.
 * Auto-connects on mount. Tracks connection state and errors.
 * Reconnects automatically if disconnected.
 */
export function useSocket(): UseSocketReturn {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  const listenersAttachedRef = useRef(false)

  const attachListeners = useCallback(() => {
    if (listenersAttachedRef.current) return
    listenersAttachedRef.current = true

    const socket = getSocket()

    socket.on('connect', () => {
      if (!mountedRef.current) return
      setConnected(true)
      setConnecting(false)
      setError(null)
    })

    socket.on('disconnect', () => {
      if (!mountedRef.current) return
      setConnected(false)
      setConnecting(false)
    })

    socket.on('connect_error', (err) => {
      if (!mountedRef.current) return
      setConnected(false)
      setConnecting(false)
      const msg = err?.message ?? 'Cannot reach server'
      setError(msg.includes('xhr poll error') ? 'Server not running on port 3001' : msg)
    })
  }, [])

  const connect = useCallback(() => {
    const socket = getSocket()
    if (socket.connected) {
      setConnected(true)
      return
    }
    attachListeners()
    setConnecting(true)
    setError(null)
    socket.connect()
  }, [attachListeners])

  // Auto-connect on mount
  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
    }
  }, [connect])

  return { connected, connecting, error, connect }
}
