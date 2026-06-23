import { io, type Socket } from 'socket.io-client'
import { NETWORK, SOCKET, type ClientToServerEvents, type ServerToClientEvents } from '@rondoflow/shared'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? NETWORK.DEFAULT_SOCKET_URL

type rondoflowSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let _socket: rondoflowSocket | null = null
let _created = false

/**
 * Returns the socket singleton, creating it lazily on first call.
 * The socket is created with `autoConnect: false` — it will NOT
 * connect until `.connect()` is explicitly called.
 * Session cookie is sent automatically via withCredentials.
 */
export function getSocket(): rondoflowSocket {
  if (!_socket) {
    _socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: SOCKET.RECONNECTION_ATTEMPTS,
      reconnectionDelay: SOCKET.RECONNECTION_DELAY_MS,
      reconnectionDelayMax: SOCKET.RECONNECTION_DELAY_MAX_MS,
      timeout: SOCKET.CONNECTION_TIMEOUT_MS,
      withCredentials: true,
    })
    _created = true
  }
  return _socket
}

/**
 * Returns the socket ONLY if it was already created AND is connected.
 * Returns null otherwise. Use this in hooks that want to attach listeners
 * without triggering socket creation or connection.
 */
export function getSocketIfConnected(): rondoflowSocket | null {
  if (_socket && _socket.connected) return _socket
  return null
}

/**
 * Returns true if the socket has been created (even if not connected).
 */
export function isSocketCreated(): boolean {
  return _created
}
