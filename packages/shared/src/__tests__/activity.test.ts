import { describe, it, expect } from 'vitest'
import { describeAuditType, AUDIT_EVENT_TYPES } from '../activity'

describe('describeAuditType — known event types', () => {
  it('returns the registry descriptor for a known type', () => {
    expect(describeAuditType('agent_started')).toEqual({
      type: 'agent_started',
      label: 'Assistant started',
      category: 'Execution',
      severity: 'info',
    })
  })

  it('resolves every registered type to its own descriptor', () => {
    for (const [key, descriptor] of Object.entries(AUDIT_EVENT_TYPES)) {
      expect(describeAuditType(key)).toBe(descriptor)
      expect(descriptor.type).toBe(key)
    }
  })
})

describe('describeAuditType — user-management events', () => {
  it.each<[string, string, 'info' | 'warning' | 'success']>([
    ['user_invited', 'User invited', 'info'],
    ['user_role_changed', 'User role changed', 'info'],
    ['user_deactivated', 'User deactivated', 'warning'],
    ['user_reactivated', 'User reactivated', 'success'],
    ['user_deleted', 'User deleted', 'warning'],
  ])('%s → category "User Management", label %p, severity %s', (type, label, severity) => {
    const d = describeAuditType(type)
    expect(d.category).toBe('User Management')
    expect(d.label).toBe(label)
    expect(d.severity).toBe(severity)
  })

  it('flags destructive user actions at warning severity', () => {
    expect(describeAuditType('user_deactivated').severity).toBe('warning')
    expect(describeAuditType('user_deleted').severity).toBe('warning')
  })
})

describe('describeAuditType — humanizing fallback for unknown types', () => {
  it('title-cases and de-underscores unknown types', () => {
    expect(describeAuditType('something_happened')).toEqual({
      type: 'something_happened',
      label: 'Something Happened',
      category: 'Other',
      severity: 'info',
    })
  })

  it.each([
    ['login', 'Login'],
    ['foo-bar', 'Foo Bar'],
    ['a_b-c', 'A B C'],
    ['', ''],
  ])('humanizes %p → %p', (type, label) => {
    expect(describeAuditType(type).label).toBe(label)
  })
})
