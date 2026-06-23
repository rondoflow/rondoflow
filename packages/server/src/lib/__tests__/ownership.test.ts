import { describe, it, expect } from 'vitest'
import type { UserRole } from '@rondoflow/shared'
import { isOwnerOrAdmin } from '../ownership'

function user(id: string, role: UserRole) {
  return { id, role }
}

describe('isOwnerOrAdmin', () => {
  it('returns false when there is no user', () => {
    expect(isOwnerOrAdmin('owner-1', undefined)).toBe(false)
    expect(isOwnerOrAdmin(null, undefined)).toBe(false)
  })

  it('returns true for admins regardless of ownerId', () => {
    const admin = user('admin-1', 'admin')
    expect(isOwnerOrAdmin('someone-else', admin)).toBe(true)
    expect(isOwnerOrAdmin(null, admin)).toBe(true)
    expect(isOwnerOrAdmin(undefined, admin)).toBe(true)
    expect(isOwnerOrAdmin('admin-1', admin)).toBe(true)
  })

  it('returns true for the owner even when not an admin', () => {
    expect(isOwnerOrAdmin('u1', user('u1', 'editor'))).toBe(true)
    expect(isOwnerOrAdmin('u1', user('u1', 'viewer'))).toBe(true)
  })

  it('returns false for a non-owner non-admin', () => {
    expect(isOwnerOrAdmin('owner', user('intruder', 'editor'))).toBe(false)
    expect(isOwnerOrAdmin('owner', user('intruder', 'viewer'))).toBe(false)
  })

  it('returns false when ownerId is null/undefined for a non-admin', () => {
    expect(isOwnerOrAdmin(null, user('u1', 'editor'))).toBe(false)
    expect(isOwnerOrAdmin(undefined, user('u1', 'viewer'))).toBe(false)
  })

  it('matches owner identity by strict equality', () => {
    // Documents the `===` behavior, including the empty-string edge.
    expect(isOwnerOrAdmin('', user('', 'viewer'))).toBe(true)
    expect(isOwnerOrAdmin('1', user('1', 'viewer'))).toBe(true)
  })
})
