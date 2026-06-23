'use client'

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { createElement } from 'react'
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getSession,
  signInWithGithub as authGithub,
  signInWithGoogle as authGoogle,
} from '@/lib/auth'
import { normalizeRole, type UserRole } from '@/lib/roles'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly image?: string | null
  readonly role: UserRole
}

interface AuthState {
  readonly user: AuthUser | null
  readonly loading: boolean
  readonly error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check session on mount
  useEffect(() => {
    getSession()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const u = res?.data?.user
        if (u) {
          setUser({ id: u.id, email: u.email, name: u.name, image: u.image ?? null, role: normalizeRole(u.role) })
        }
      })
      .catch(() => {
        // No session — stay unauthenticated
      })
      .finally(() => setLoading(false))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await authSignIn(email, password)
      if (res.error) {
        setError(res.error.message ?? 'Sign in failed')
        return
      }
      const u = res.data?.user
      if (u) {
        setUser({ id: u.id, email: u.email, name: u.name, image: u.image ?? null, role: normalizeRole(u.role) })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setError(null)
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await authSignUp(email, password, name)
      if (res.error) {
        setError(res.error.message ?? 'Sign up failed')
        return
      }
      const u = res.data?.user
      if (u) {
        setUser({ id: u.id, email: u.email, name: u.name, image: u.image ?? null, role: normalizeRole(u.role) })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await authSignOut()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed')
    }
  }, [])

  const signInWithGithub = useCallback(async () => {
    setError(null)
    try {
      await authGithub()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub sign in failed')
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setError(null)
    try {
      await authGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed')
    }
  }, [])

  return createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        signInWithGithub,
        signInWithGoogle,
      },
    },
    children,
  )
}
