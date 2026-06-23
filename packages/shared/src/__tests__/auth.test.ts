import { describe, it, expect } from 'vitest'
import {
  hasMinRole,
  can,
  normalizeRole,
  DEFAULT_USER_ROLE,
  USER_ROLE_RANK,
  CAPABILITY_MIN_ROLE,
  type UserRole,
  type Capability,
} from '../auth'

// These tests pin the RBAC policy itself (the rank table + capability matrix),
// not just current call results — an accidental edit that widens privilege
// should turn this file red.

describe('role ranking + capability matrix (policy guards)', () => {
  it('ranks viewer < editor < admin', () => {
    expect(USER_ROLE_RANK).toEqual({ viewer: 0, editor: 1, admin: 2 })
    expect(USER_ROLE_RANK.viewer).toBeLessThan(USER_ROLE_RANK.editor)
    expect(USER_ROLE_RANK.editor).toBeLessThan(USER_ROLE_RANK.admin)
  })

  it('maps each capability to its minimum role', () => {
    expect(CAPABILITY_MIN_ROLE).toEqual({
      read: 'viewer',
      write: 'editor',
      run: 'editor',
      manageUsers: 'admin',
      manageGlobalSettings: 'admin',
    })
  })

  it('defaults to the least-privileged role', () => {
    expect(DEFAULT_USER_ROLE).toBe('viewer')
  })
})

describe('hasMinRole', () => {
  it.each<[UserRole, UserRole, boolean]>([
    ['viewer', 'viewer', true],
    ['viewer', 'editor', false],
    ['viewer', 'admin', false],
    ['editor', 'viewer', true],
    ['editor', 'editor', true],
    ['editor', 'admin', false],
    ['admin', 'viewer', true],
    ['admin', 'editor', true],
    ['admin', 'admin', true],
  ])('hasMinRole(%s, %s) === %s', (role, min, expected) => {
    expect(hasMinRole(role, min)).toBe(expected)
  })
})

describe('can — full role × capability matrix', () => {
  it.each<[UserRole, Capability, boolean]>([
    ['viewer', 'read', true],
    ['viewer', 'write', false],
    ['viewer', 'run', false],
    ['viewer', 'manageUsers', false],
    ['viewer', 'manageGlobalSettings', false],
    ['editor', 'read', true],
    ['editor', 'write', true],
    ['editor', 'run', true],
    ['editor', 'manageUsers', false],
    ['editor', 'manageGlobalSettings', false],
    ['admin', 'read', true],
    ['admin', 'write', true],
    ['admin', 'run', true],
    ['admin', 'manageUsers', true],
    ['admin', 'manageGlobalSettings', true],
  ])('can(%s, %s) === %s', (role, capability, expected) => {
    expect(can(role, capability)).toBe(expected)
  })

  it('viewer can only read', () => {
    const caps: Capability[] = ['read', 'write', 'run', 'manageUsers', 'manageGlobalSettings']
    expect(caps.filter((c) => can('viewer', c))).toEqual(['read'])
  })

  it('editor cannot manage users or global settings', () => {
    expect(can('editor', 'manageUsers')).toBe(false)
    expect(can('editor', 'manageGlobalSettings')).toBe(false)
  })
})

describe('normalizeRole — fail-closed parsing', () => {
  it('passes known single roles through', () => {
    expect(normalizeRole('admin')).toBe('admin')
    expect(normalizeRole('editor')).toBe('editor')
    expect(normalizeRole('viewer')).toBe('viewer')
  })

  it.each([null, undefined, '', 42, {}, [], true, NaN])(
    'falls closed to viewer for non-string / empty value %p',
    (raw) => {
      expect(normalizeRole(raw)).toBe('viewer')
    },
  )

  it.each(['superadmin', 'root', 'ADMIN', 'Editor', 'guest'])(
    'falls closed to viewer for unknown token %p (matching is case-sensitive)',
    (raw) => {
      expect(normalizeRole(raw)).toBe('viewer')
    },
  )

  it('takes the highest privilege from a comma-separated list (order-independent)', () => {
    expect(normalizeRole('admin,editor')).toBe('admin')
    expect(normalizeRole('editor,admin')).toBe('admin')
    expect(normalizeRole('viewer,admin')).toBe('admin')
    expect(normalizeRole('editor,viewer')).toBe('editor')
    expect(normalizeRole('viewer,editor')).toBe('editor')
  })

  it('trims surrounding whitespace on each token', () => {
    expect(normalizeRole(' admin ')).toBe('admin')
    expect(normalizeRole('admin, editor')).toBe('admin')
    expect(normalizeRole(' editor , viewer ')).toBe('editor')
  })

  it('ignores unknown tokens but honors known ones in a mixed list', () => {
    expect(normalizeRole('root,editor')).toBe('editor')
    expect(normalizeRole('foo,bar')).toBe('viewer')
    expect(normalizeRole('root,admin,baz')).toBe('admin')
  })
})
