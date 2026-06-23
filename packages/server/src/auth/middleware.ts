import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import type { UserRole } from '@rondoflow/shared'
import { getAuth } from './auth'
import { fromNodeHeaders } from 'better-auth/node'
import { can, normalizeRole } from './rbac'
import { ForbiddenError } from '../lib/errors'

// Paths that don't require authentication
const PUBLIC_PATHS = new Set([
  '/api/health',
  // Login page reads this pre-auth to decide which social buttons to show.
  // Returns booleans only (no credential values) — see routes/settings.ts. This
  // entry is load-bearing: the /api/auth prefix below is scoped to Better Auth's
  // own sub-routes and does NOT match this sibling path.
  '/api/auth-providers',
])

// Better Auth owns every route UNDER its basePath. The trailing slash is
// deliberate: a bare-prefix match ('/api/auth') would also whitelist sibling
// routes like '/api/authz' or '/api/auth-providers', silently skipping the
// session + role gates. Anything outside '/api/auth/' must be opted into via
// PUBLIC_PATHS explicitly.
const PUBLIC_PREFIXES = [
  '/api/auth/',
]

function isPublicPath(path: string): boolean {
  if (PUBLIC_PATHS.has(path)) return true
  // Better Auth's basePath itself (exact '/api/auth', no sub-path) is public.
  if (path === '/api/auth') return true
  return PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))
}

// Strip query string before matching paths.
function pathOf(url: string): string {
  const q = url.indexOf('?')
  return q === -1 ? url : url.slice(0, q)
}

// Admin-only path prefixes (user management + global credential config). Gated
// regardless of HTTP method — even the GET reveals/edits sensitive global state.
const ADMIN_PREFIXES = ['/api/users', '/api/settings/credentials']

// Run/execute control endpoints — require the `run` capability (editor+).
const RUN_PATH_RE = /\/(start|stop|pause|resume|run-now|execute)(\/|$)/

// Read-only verbs. GETs that actually mutate or spend compute must be added to
// ELEVATED_GET so they are gated as writes/runs rather than reads.
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const ELEVATED_GET: readonly RegExp[] = []

// Extend Fastify request with user info
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      name: string
      image?: string | null
      role: UserRole
    }
  }
}

export async function registerAuthMiddleware(app: FastifyInstance): Promise<void> {
  // 1) Authenticate: attach the session user (incl. role) to the request.
  app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    if (isPublicPath(pathOf(request.url))) return

    try {
      const session = await getAuth().api.getSession({
        headers: fromNodeHeaders(request.headers),
      })

      if (!session) {
        reply.code(401).send({
          success: false,
          error: 'Authentication required',
        })
        return
      }

      const sessionUser = session.user as typeof session.user & {
        role?: string | null
        banned?: boolean | null
      }

      if (sessionUser.banned) {
        reply.code(403).send({
          success: false,
          error: 'Your account has been deactivated',
        })
        return
      }

      request.user = {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        image: sessionUser.image,
        role: normalizeRole(sessionUser.role),
      }
    } catch {
      reply.code(401).send({
        success: false,
        error: 'Invalid session',
      })
    }
  })

  // 2) Authorize: default-deny role gate keyed off HTTP method + path. Runs
  // after (1) so request.user.role is populated. Fail-safe — a newly added
  // mutating route is protected automatically; reads stay open to viewers.
  app.addHook('preHandler', async (request: FastifyRequest) => {
    const path = pathOf(request.url)
    if (isPublicPath(path)) return
    // Auth hook already 401'd unauthenticated requests; nothing to gate.
    if (!request.user) return

    const role = request.user.role

    // Admin-only surfaces, any method.
    if (ADMIN_PREFIXES.some((p) => path.startsWith(p))) {
      if (!can(role, 'manageUsers')) throw new ForbiddenError()
      return
    }

    // Reads are open to everyone authenticated (except elevated GETs).
    const method = request.method.toUpperCase()
    if (READ_METHODS.has(method) && !ELEVATED_GET.some((re) => re.test(path))) {
      return
    }

    // Run/execute control — needs `run`.
    if (RUN_PATH_RE.test(path)) {
      if (!can(role, 'run')) throw new ForbiddenError()
      return
    }

    // Any remaining mutating verb — needs `write`.
    if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
      if (!can(role, 'write')) throw new ForbiddenError()
    }
  })
}
