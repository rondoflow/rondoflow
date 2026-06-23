// User authentication & authorization types shared between the server and UI.
//
// NOTE: `UserRole` is the GLOBAL role a user holds across the whole shared
// workspace. It is intentionally distinct from the agent-security domain
// ("Policy" / "Permission" / "permissionMode") and from the UI complexity
// "tier" gating — do not conflate them.

/**
 * Which social sign-in providers the server has configured, keyed off the
 * presence of each provider's OAuth client ID (mirrors the `enabled` gate in
 * the server's Better Auth config). The login page reads this to decide which
 * provider buttons to render — a provider with no client ID is hidden.
 */
export interface SocialAuthProviders {
  readonly github: boolean
  readonly google: boolean
}

/** Global capability role. Ordered viewer < editor < admin. */
export type UserRole = 'admin' | 'editor' | 'viewer'

/** Least-privileged role — used as a fail-closed default when role is unknown. */
export const DEFAULT_USER_ROLE: UserRole = 'viewer'

/** Privilege ranking; higher means more capabilities. */
export const USER_ROLE_RANK: Record<UserRole, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
}

/**
 * Action classes gated by role. `read` is open to everyone authenticated;
 * `write`/`run` require editor; user/settings management require admin.
 */
export type Capability =
  | 'read'
  | 'write'
  | 'run'
  | 'manageUsers'
  | 'manageGlobalSettings'

/** Minimum role required for each capability. */
export const CAPABILITY_MIN_ROLE: Record<Capability, UserRole> = {
  read: 'viewer',
  write: 'editor',
  run: 'editor',
  manageUsers: 'admin',
  manageGlobalSettings: 'admin',
}

/** True when `role` meets or exceeds `min`. */
export function hasMinRole(role: UserRole, min: UserRole): boolean {
  return USER_ROLE_RANK[role] >= USER_ROLE_RANK[min]
}

/** True when `role` is permitted to perform `capability`. */
export function can(role: UserRole, capability: Capability): boolean {
  return hasMinRole(role, CAPABILITY_MIN_ROLE[capability])
}

/**
 * Collapse a raw role value into a known `UserRole`. Better Auth's admin plugin
 * stores roles as a (possibly comma-separated, possibly null) string; we take
 * the highest privilege present and fail closed to `viewer` for anything else.
 */
export function normalizeRole(raw: unknown): UserRole {
  if (typeof raw !== 'string' || raw.length === 0) return DEFAULT_USER_ROLE
  const roles = raw.split(',').map((r) => r.trim())
  if (roles.includes('admin')) return 'admin'
  if (roles.includes('editor')) return 'editor'
  if (roles.includes('viewer')) return 'viewer'
  return DEFAULT_USER_ROLE
}
