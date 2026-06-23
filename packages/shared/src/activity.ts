// Audit / activity event types shared between the server and UI.

export interface ActivityEvent {
  readonly id: string
  readonly userId: string | null
  readonly workspaceId: string | null
  readonly agentId: string | null
  readonly type: string
  readonly title: string
  readonly detail: string | null
  readonly metadata: Record<string, unknown> | null
  readonly createdAt: string
}

/** Paginated audit-log response envelope meta. */
export interface ActivityPageMeta {
  readonly total: number
  readonly page: number
  readonly limit: number
}

/** Count of events for a given type — powers the dashboard's type filter. */
export interface ActivityTypeCount {
  readonly type: string
  readonly count: number
}

export type AuditSeverity = 'info' | 'success' | 'warning' | 'error'

export interface AuditTypeDescriptor {
  readonly type: string
  readonly label: string
  readonly category: string
  readonly severity: AuditSeverity
}

/**
 * Registry of known audit event types. Unknown types are still rendered via
 * {@link describeAuditType}'s humanising fallback, so this is a display hint —
 * not an allow-list. User-facing labels use the "Assistant" terminology.
 */
export const AUDIT_EVENT_TYPES: Record<string, AuditTypeDescriptor> = {
  agent_started: { type: 'agent_started', label: 'Assistant started', category: 'Execution', severity: 'info' },
  agent_completed: { type: 'agent_completed', label: 'Assistant completed', category: 'Execution', severity: 'success' },
  agent_error: { type: 'agent_error', label: 'Assistant error', category: 'Execution', severity: 'error' },
  agent_created: { type: 'agent_created', label: 'Assistant created', category: 'Configuration', severity: 'info' },
  agent_deleted: { type: 'agent_deleted', label: 'Assistant deleted', category: 'Configuration', severity: 'warning' },
  approval_granted: { type: 'approval_granted', label: 'Approval granted', category: 'Approvals', severity: 'success' },
  approval_denied: { type: 'approval_denied', label: 'Approval denied', category: 'Approvals', severity: 'warning' },
  user_invited: { type: 'user_invited', label: 'User invited', category: 'User Management', severity: 'info' },
  user_role_changed: { type: 'user_role_changed', label: 'User role changed', category: 'User Management', severity: 'info' },
  user_deactivated: { type: 'user_deactivated', label: 'User deactivated', category: 'User Management', severity: 'warning' },
  user_reactivated: { type: 'user_reactivated', label: 'User reactivated', category: 'User Management', severity: 'success' },
  user_deleted: { type: 'user_deleted', label: 'User deleted', category: 'User Management', severity: 'warning' },
}

/** Resolve a display descriptor for any event type, humanising unknown ones. */
export function describeAuditType(type: string): AuditTypeDescriptor {
  const known = AUDIT_EVENT_TYPES[type]
  if (known) return known
  const label = type
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return { type, label, category: 'Other', severity: 'info' }
}
