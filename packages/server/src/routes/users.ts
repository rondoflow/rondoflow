import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { fromNodeHeaders } from 'better-auth/node'
import { normalizeRole, type UserRole } from '@rondoflow/shared'
import { getAuth } from '../auth/auth'
import { requireRole } from '../auth/rbac'
import { sendSuccess, sendError, ForbiddenError, ValidationError } from '../lib/errors'
import { recordActivity } from '../services/activity'

// Admin-only user management. These routes wrap the Better Auth admin plugin
// (auth.api.*) so the rest of the app sees the project's {success,data,error}
// envelope, the calls run behind our auth + role middleware, and admin actions
// are recorded to the audit log. The acting admin's session cookies are
// forwarded so Better Auth's own admin check authorizes the underlying call.
//
// The global role middleware already gates every /api/users* path as admin; the
// per-route requireRole('admin') below is belt-and-braces.

const RoleSchema = z.enum(['admin', 'editor', 'viewer'])

// Exported for unit testing — these are the pure validation/normalization seams.
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  password: z.string().min(8).max(128),
  role: RoleSchema.default('viewer'),
})

export const SetRoleSchema = z.object({
  role: RoleSchema,
})

const DeactivateSchema = z.object({
  banReason: z.string().max(500).optional(),
})

export const ListQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
})

// The admin plugin types its `role` argument as the built-in roles
// ('admin' | 'user') because we don't register a custom access-control role set.
// At runtime it accepts any string (role validation is skipped when no custom
// roles are configured — verified in better-auth 1.5.5), and our Postgres enum
// constrains it to admin/editor/viewer. Cast our UserRole through this gap.
function asAuthRole(role: UserRole): 'admin' {
  return role as unknown as 'admin'
}

interface UserResult {
  readonly user?: Record<string, unknown>
}

interface AdminUserRow {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly image: string | null
  readonly role: UserRole
  readonly banned: boolean
  readonly createdAt: string
}

// Map a Better Auth user object to the safe, role-normalized shape the UI uses.
// Exported for unit testing.
export function toRow(u: Record<string, unknown>): AdminUserRow {
  const createdAt = u['createdAt']
  return {
    id: String(u['id']),
    email: String(u['email'] ?? ''),
    name: String(u['name'] ?? ''),
    image: (u['image'] as string | null) ?? null,
    role: normalizeRole(u['role']),
    banned: Boolean(u['banned']),
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt ?? ''),
  }
}

export async function userRoutes(app: FastifyInstance) {
  const adminOnly = { preHandler: requireRole('admin') }

  // List all users in the shared workspace.
  app.get('/api/users', adminOnly, async (req, reply) => {
    try {
      const query = ListQuerySchema.parse(req.query)
      const result = (await getAuth().api.listUsers({
        query: {
          limit: query.limit,
          offset: query.offset,
          ...(query.search ? { searchField: 'email' as const, searchOperator: 'contains' as const, searchValue: query.search } : {}),
        },
        headers: fromNodeHeaders(req.headers),
      })) as { users?: unknown[]; total?: number }
      const users = (result.users ?? []).map((u) => toRow(u as Record<string, unknown>))
      sendSuccess(reply, { users, total: result.total ?? users.length })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Invite/create a user with an initial role.
  app.post('/api/users', adminOnly, async (req, reply) => {
    try {
      const body = CreateUserSchema.parse(req.body)
      const result = (await getAuth().api.createUser({
        body: { email: body.email, name: body.name, password: body.password, role: asAuthRole(body.role) },
        headers: fromNodeHeaders(req.headers),
      })) as unknown as UserResult
      void recordActivity({
        userId: req.user?.id,
        type: 'user_invited',
        title: `Invited ${body.email} as ${body.role}`,
      })
      sendSuccess(reply, result.user ? toRow(result.user) : null, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Change a user's role.
  app.patch<{ Params: { id: string } }>('/api/users/:id/role', adminOnly, async (req, reply) => {
    try {
      const { role } = SetRoleSchema.parse(req.body)
      const targetId = req.params.id
      // Prevent an admin from demoting themselves into a lockout.
      if (targetId === req.user?.id && role !== 'admin') {
        throw new ValidationError('You cannot change your own admin role')
      }
      const result = (await getAuth().api.setRole({
        body: { userId: targetId, role: asAuthRole(role) },
        headers: fromNodeHeaders(req.headers),
      })) as unknown as UserResult
      void recordActivity({
        userId: req.user?.id,
        type: 'user_role_changed',
        title: `Changed role to ${role}`,
        detail: `User ${targetId}`,
      })
      sendSuccess(reply, result.user ? toRow(result.user) : null)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Deactivate (ban) a user — rejects their sessions while preserving history.
  app.post<{ Params: { id: string } }>('/api/users/:id/deactivate', adminOnly, async (req, reply) => {
    try {
      const body = DeactivateSchema.parse(req.body ?? {})
      const targetId = req.params.id
      if (targetId === req.user?.id) throw new ForbiddenError('You cannot deactivate your own account')
      await getAuth().api.banUser({
        body: { userId: targetId, ...(body.banReason ? { banReason: body.banReason } : {}) },
        headers: fromNodeHeaders(req.headers),
      })
      void recordActivity({
        userId: req.user?.id,
        type: 'user_deactivated',
        title: `Deactivated user ${targetId}`,
        detail: body.banReason,
      })
      sendSuccess(reply, { deactivated: true })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Reactivate (unban) a user.
  app.post<{ Params: { id: string } }>('/api/users/:id/reactivate', adminOnly, async (req, reply) => {
    try {
      const targetId = req.params.id
      await getAuth().api.unbanUser({
        body: { userId: targetId },
        headers: fromNodeHeaders(req.headers),
      })
      void recordActivity({
        userId: req.user?.id,
        type: 'user_reactivated',
        title: `Reactivated user ${targetId}`,
      })
      sendSuccess(reply, { reactivated: true })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Permanently remove a user.
  app.delete<{ Params: { id: string } }>('/api/users/:id', adminOnly, async (req, reply) => {
    try {
      const targetId = req.params.id
      if (targetId === req.user?.id) throw new ForbiddenError('You cannot delete your own account')
      await getAuth().api.removeUser({
        body: { userId: targetId },
        headers: fromNodeHeaders(req.headers),
      })
      void recordActivity({
        userId: req.user?.id,
        type: 'user_deleted',
        title: `Deleted user ${targetId}`,
      })
      sendSuccess(reply, { deleted: true })
    } catch (error) {
      sendError(reply, error)
    }
  })
}
