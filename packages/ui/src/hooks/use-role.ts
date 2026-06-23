'use client'

import { useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  capabilitiesFor,
  DEFAULT_ROLE,
  type RoleCapabilities,
  type UserRole,
} from '@/lib/roles'

export interface UseRoleReturn extends RoleCapabilities {
  readonly role: UserRole
}

/**
 * The current user's global role and derived capabilities. Reads from the
 * already-mounted AuthProvider, so no extra provider is needed. Defaults to the
 * least-privileged role until the session resolves (AuthGuard blocks the app
 * behind `loading`, so there is no flash of editable UI).
 */
export function useRole(): UseRoleReturn {
  const { user } = useAuth()
  const role = user?.role ?? DEFAULT_ROLE
  return useMemo(() => ({ role, ...capabilitiesFor(role) }), [role])
}
