// Client-side role capabilities. Mirrors the server's authorization (which is
// the real security boundary) so the UI can hide/disable affordances a user's
// role can't use. Capability logic is single-sourced from @rondoflow/shared.

import { type UserRole, DEFAULT_USER_ROLE, can, normalizeRole } from '@rondoflow/shared'

export type { UserRole }
export { normalizeRole }

/** Least-privileged role — used until the session resolves, so we fail closed. */
export const DEFAULT_ROLE: UserRole = DEFAULT_USER_ROLE

export interface RoleCapabilities {
  /** create/update/delete agents, canvas, workspaces, resources, etc. */
  readonly canEdit: boolean
  /** run/stop workflows, director/planner/advisor, discussions, loops. */
  readonly canRun: boolean
  /** open and use the admin Users panel. */
  readonly canManageUsers: boolean
  /** read-only role — no edit or run affordances. */
  readonly isViewer: boolean
}

export function capabilitiesFor(role: UserRole): RoleCapabilities {
  return {
    canEdit: can(role, 'write'),
    canRun: can(role, 'run'),
    canManageUsers: can(role, 'manageUsers'),
    isViewer: role === 'viewer',
  }
}
