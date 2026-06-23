import type { UserRole } from '@rondoflow/shared'

/**
 * Shared team workspace model: all authenticated users see and operate on one
 * shared pool of resources. Access is gated by ROLE (see auth/rbac.ts and the
 * global role middleware), not by per-user ownership. `userId` columns are
 * retained on resources for attribution/audit only.
 *
 * This helper exists for the few places that may want an owner-or-admin rule
 * (e.g. a future "only the creator or an admin may delete" toggle). It is NOT
 * used for the default read/write/delete paths, which are role-gated.
 */
export function isOwnerOrAdmin(
  ownerId: string | null | undefined,
  user: { id: string; role: UserRole } | undefined,
): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return ownerId != null && ownerId === user.id
}
