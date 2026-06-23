import { describe, it, expect } from 'vitest'
import type { FastifyRequest } from 'fastify'
import {
  can as sharedCan,
  hasMinRole as sharedHasMinRole,
  normalizeRole as sharedNormalizeRole,
  type UserRole,
} from '@rondoflow/shared'
import { roleOf, requireRole, requireCapability, can, hasMinRole, normalizeRole } from '../rbac'
import { ForbiddenError } from '../../lib/errors'

// A request carries only the augmented `user` shape the auth middleware sets.
function req(role?: UserRole): FastifyRequest {
  return {
    user: role ? { id: 'u1', email: 'u@example.com', name: 'User', role } : undefined,
  } as unknown as FastifyRequest
}

describe('rbac re-exports the shared single source of truth', () => {
  it('re-exports the identical capability helpers', () => {
    expect(can).toBe(sharedCan)
    expect(hasMinRole).toBe(sharedHasMinRole)
    expect(normalizeRole).toBe(sharedNormalizeRole)
  })
})

describe('roleOf', () => {
  it('returns the user role when present', () => {
    expect(roleOf(req('admin'))).toBe('admin')
    expect(roleOf(req('editor'))).toBe('editor')
  })

  it('fails closed to viewer when there is no user', () => {
    expect(roleOf(req())).toBe('viewer')
  })
})

describe('requireRole', () => {
  it('resolves when the caller meets the minimum role', async () => {
    await expect(requireRole('admin')(req('admin'))).resolves.toBeUndefined()
    await expect(requireRole('editor')(req('editor'))).resolves.toBeUndefined()
    await expect(requireRole('editor')(req('admin'))).resolves.toBeUndefined()
  })

  it('rejects with ForbiddenError below the minimum role', async () => {
    await expect(requireRole('admin')(req('viewer'))).rejects.toBeInstanceOf(ForbiddenError)
    await expect(requireRole('admin')(req('editor'))).rejects.toBeInstanceOf(ForbiddenError)
    await expect(requireRole('editor')(req('viewer'))).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('treats a request with no user as viewer (rejects elevated requirements)', async () => {
    await expect(requireRole('admin')(req())).rejects.toBeInstanceOf(ForbiddenError)
    await expect(requireRole('viewer')(req())).resolves.toBeUndefined()
  })

  it('throws a 403-coded ForbiddenError', async () => {
    await expect(requireRole('admin')(req('viewer'))).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    })
  })
})

describe('requireCapability', () => {
  it('lets editors write and run but not manage users', async () => {
    await expect(requireCapability('write')(req('editor'))).resolves.toBeUndefined()
    await expect(requireCapability('run')(req('editor'))).resolves.toBeUndefined()
    await expect(requireCapability('manageUsers')(req('editor'))).rejects.toBeInstanceOf(
      ForbiddenError,
    )
  })

  it('rejects viewers for any non-read capability', async () => {
    await expect(requireCapability('read')(req('viewer'))).resolves.toBeUndefined()
    await expect(requireCapability('write')(req('viewer'))).rejects.toBeInstanceOf(ForbiddenError)
    await expect(requireCapability('run')(req('viewer'))).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('lets admins do everything', async () => {
    await expect(requireCapability('manageUsers')(req('admin'))).resolves.toBeUndefined()
    await expect(requireCapability('manageGlobalSettings')(req('admin'))).resolves.toBeUndefined()
  })

  it('treats a request with no user as viewer', async () => {
    await expect(requireCapability('write')(req())).rejects.toBeInstanceOf(ForbiddenError)
  })
})
