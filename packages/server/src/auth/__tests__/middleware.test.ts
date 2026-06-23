import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FastifyInstance } from 'fastify'
import type { UserRole } from '@rondoflow/shared'
import { ForbiddenError } from '../../lib/errors'

// Control Better Auth's getSession per-test; bypass real auth construction.
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }))
vi.mock('../auth', () => ({ getAuth: () => ({ api: { getSession } }) }))
vi.mock('better-auth/node', () => ({ fromNodeHeaders: (h: unknown) => h }))

import { registerAuthMiddleware } from '../middleware'

type Hook = (req: Record<string, unknown>, reply: unknown) => Promise<void>

function makeReply() {
  return {
    statusCode: undefined as number | undefined,
    body: undefined as unknown,
    code(c: number) {
      this.statusCode = c
      return this
    },
    send(p: unknown) {
      this.body = p
      return this
    },
  }
}

// Capture the two preHandler hooks registered by the middleware.
async function setupHooks() {
  const hooks: Hook[] = []
  const app = { addHook: (_name: string, fn: Hook) => hooks.push(fn) } as unknown as FastifyInstance
  await registerAuthMiddleware(app)
  return { authHook: hooks[0], authzHook: hooks[1] }
}

beforeEach(() => {
  getSession.mockReset()
})

describe('auth hook — authentication', () => {
  it('skips public paths without calling getSession', async () => {
    const { authHook } = await setupHooks()
    const req: Record<string, unknown> = { url: '/api/health', method: 'GET', headers: {} }
    const reply = makeReply()
    await authHook(req, reply)
    expect(getSession).not.toHaveBeenCalled()
    expect(reply.statusCode).toBeUndefined()
    expect(req.user).toBeUndefined()
  })

  it('skips the /api/auth/* prefix', async () => {
    const { authHook } = await setupHooks()
    const req: Record<string, unknown> = { url: '/api/auth/sign-in', method: 'POST', headers: {} }
    await authHook(req, makeReply())
    expect(getSession).not.toHaveBeenCalled()
  })

  it('treats /api/auth-providers as public (with or without a query string)', async () => {
    const { authHook } = await setupHooks()
    await authHook({ url: '/api/auth-providers', method: 'GET', headers: {} }, makeReply())
    await authHook({ url: '/api/auth-providers?x=1', method: 'GET', headers: {} }, makeReply())
    expect(getSession).not.toHaveBeenCalled()
  })

  it('does NOT treat an /api/auth-prefixed sibling (e.g. /api/authz) as public', async () => {
    // The public prefix is segment-bounded ('/api/auth/'), so a sibling route
    // that merely starts with the literal 'auth' is still authenticated.
    getSession.mockResolvedValue(null)
    const { authHook } = await setupHooks()
    const reply = makeReply()
    await authHook({ url: '/api/authz', method: 'GET', headers: {} }, reply)
    expect(getSession).toHaveBeenCalled()
    expect(reply.statusCode).toBe(401)
  })

  it('401s when there is no session', async () => {
    getSession.mockResolvedValue(null)
    const { authHook } = await setupHooks()
    const reply = makeReply()
    await authHook({ url: '/api/agents', method: 'GET', headers: {} }, reply)
    expect(reply.statusCode).toBe(401)
    expect(reply.body).toEqual({ success: false, error: 'Authentication required' })
  })

  it('403s a banned user', async () => {
    getSession.mockResolvedValue({
      user: { id: 'u', email: 'e', name: 'n', role: 'admin', banned: true },
    })
    const { authHook } = await setupHooks()
    const reply = makeReply()
    const req: Record<string, unknown> = { url: '/api/agents', method: 'GET', headers: {} }
    await authHook(req, reply)
    expect(reply.statusCode).toBe(403)
    expect(reply.body).toEqual({ success: false, error: 'Your account has been deactivated' })
    expect(req.user).toBeUndefined()
  })

  it('attaches a normalized user on a valid session', async () => {
    getSession.mockResolvedValue({
      user: { id: 'u1', email: 'e@x.com', name: 'Ed', image: null, role: 'admin,editor' },
    })
    const { authHook } = await setupHooks()
    const req: Record<string, unknown> = { url: '/api/agents', method: 'GET', headers: {} }
    await authHook(req, makeReply())
    expect(req.user).toEqual({
      id: 'u1',
      email: 'e@x.com',
      name: 'Ed',
      image: null,
      role: 'admin', // highest of the comma-separated set
    })
  })

  it.each([
    [null, 'viewer'],
    [undefined, 'viewer'],
    ['editor', 'editor'],
  ])('normalizes session role %p → %s', async (sessionRole, expected) => {
    getSession.mockResolvedValue({
      user: { id: 'u', email: 'e', name: 'n', role: sessionRole },
    })
    const { authHook } = await setupHooks()
    const req: Record<string, unknown> = { url: '/api/agents', method: 'GET', headers: {} }
    await authHook(req, makeReply())
    expect((req.user as { role: UserRole }).role).toBe(expected)
  })

  it('401s with "Invalid session" when getSession throws', async () => {
    getSession.mockRejectedValue(new Error('network'))
    const { authHook } = await setupHooks()
    const reply = makeReply()
    await authHook({ url: '/api/agents', method: 'GET', headers: {} }, reply)
    expect(reply.statusCode).toBe(401)
    expect(reply.body).toEqual({ success: false, error: 'Invalid session' })
  })
})

describe('authz hook — role gate (path × method × role)', () => {
  async function authorize(url: string, method: string, role?: UserRole) {
    const { authzHook } = await setupHooks()
    const req: Record<string, unknown> = { url, method, headers: {} }
    if (role) req.user = { id: 'u', email: 'e', name: 'n', role }
    return authzHook(req, makeReply())
  }

  it.each<[string, string, UserRole | undefined, boolean]>([
    // Admin-only surfaces — gated on ANY method, even GET.
    ['/api/users', 'GET', 'viewer', true],
    ['/api/users', 'GET', 'editor', true],
    ['/api/users', 'GET', 'admin', false],
    ['/api/users/123/role', 'PATCH', 'admin', false],
    ['/api/settings/credentials', 'GET', 'editor', true],
    ['/api/settings/credentials', 'GET', 'admin', false],
    // Admin-prefix precedence beats the run-path regex AND the read-method allowance.
    ['/api/users/x/start', 'GET', 'viewer', true],
    // Reads are open to authenticated viewers (query string is stripped first).
    ['/api/agents', 'GET', 'viewer', false],
    ['/api/agents?search=foo', 'GET', 'viewer', false],
    ['/api/agents', 'HEAD', 'viewer', false],
    ['/api/agents', 'OPTIONS', 'viewer', false],
    // Run/execute control — needs `run` (editor+).
    ['/api/runs/abc/start', 'POST', 'viewer', true],
    ['/api/runs/abc/start', 'POST', 'editor', false],
    ['/api/runs/abc/start?force=1', 'POST', 'viewer', true],
    ['/api/runs/execute', 'POST', 'viewer', true],
    ['/api/scheduler/run-now', 'POST', 'viewer', true],
    // Other mutations — need `write` (editor+).
    ['/api/agents', 'POST', 'viewer', true],
    ['/api/agents', 'POST', 'editor', false],
    ['/api/agents/1', 'DELETE', 'viewer', true],
    ['/api/agents/1', 'PUT', 'editor', false],
    ['/api/agents/1', 'PATCH', 'editor', false],
    // Public path never gated even with a mutating verb.
    ['/api/health', 'POST', 'viewer', false],
    ['/api/auth-providers', 'POST', 'viewer', false],
    // No user → early return (the auth hook already 401'd unauthenticated requests).
    ['/api/agents', 'POST', undefined, false],
  ])('%s %s as %s → throws=%s', async (url, method, role, shouldThrow) => {
    if (shouldThrow) {
      await expect(authorize(url, method, role)).rejects.toBeInstanceOf(ForbiddenError)
    } else {
      await expect(authorize(url, method, role)).resolves.toBeUndefined()
    }
  })
})
