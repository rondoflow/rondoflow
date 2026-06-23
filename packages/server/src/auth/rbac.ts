import type { FastifyRequest } from 'fastify'
import { type Capability, type UserRole, can, hasMinRole } from '@rondoflow/shared'
import { ForbiddenError } from '../lib/errors'

// Role helpers re-export the shared single-source-of-truth logic so server code
// has one import surface. The canonical capability matrix lives in
// @rondoflow/shared (CAPABILITY_MIN_ROLE).
export { can, hasMinRole, normalizeRole } from '@rondoflow/shared'
export type { Capability, UserRole } from '@rondoflow/shared'

/** Effective role of the request's user, fail-closed to viewer. */
export function roleOf(req: FastifyRequest): UserRole {
  return req.user?.role ?? 'viewer'
}

/**
 * preHandler factory: rejects (403) when the caller's role is below `min`.
 * Throwing flows through the global error handler → standard error envelope.
 */
export function requireRole(min: UserRole) {
  return async (req: FastifyRequest): Promise<void> => {
    if (!hasMinRole(roleOf(req), min)) throw new ForbiddenError()
  }
}

/** preHandler factory keyed by capability (read/write/run/manage*). */
export function requireCapability(capability: Capability) {
  return async (req: FastifyRequest): Promise<void> => {
    if (!can(roleOf(req), capability)) throw new ForbiddenError()
  }
}
