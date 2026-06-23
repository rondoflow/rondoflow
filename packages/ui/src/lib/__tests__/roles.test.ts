import { describe, it, expect } from 'vitest'
import { capabilitiesFor, DEFAULT_ROLE, normalizeRole } from '../roles'

describe('capabilitiesFor', () => {
  it('viewer has no edit/run/manage affordances', () => {
    expect(capabilitiesFor('viewer')).toEqual({
      canEdit: false,
      canRun: false,
      canManageUsers: false,
      isViewer: true,
    })
  })

  it('editor can edit and run but not manage users', () => {
    expect(capabilitiesFor('editor')).toEqual({
      canEdit: true,
      canRun: true,
      canManageUsers: false,
      isViewer: false,
    })
  })

  it('admin can do everything', () => {
    expect(capabilitiesFor('admin')).toEqual({
      canEdit: true,
      canRun: true,
      canManageUsers: true,
      isViewer: false,
    })
  })
})

describe('roles module surface', () => {
  it('fails closed to viewer by default', () => {
    expect(DEFAULT_ROLE).toBe('viewer')
  })

  it('re-exports the shared normalizeRole', () => {
    expect(normalizeRole('admin,viewer')).toBe('admin')
    expect(normalizeRole('bogus')).toBe('viewer')
  })
})
