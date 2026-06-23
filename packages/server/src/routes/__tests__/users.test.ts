import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FastifyInstance } from 'fastify'

// Mock the Better Auth admin API, the audit recorder, header adapter, and the
// per-route role guard. The global middleware + rbac factories are tested
// separately, so here we isolate the route handlers' own logic.
const { api, recordActivity } = vi.hoisted(() => ({
  api: {
    listUsers: vi.fn(),
    createUser: vi.fn(),
    setRole: vi.fn(),
    banUser: vi.fn(),
    unbanUser: vi.fn(),
    removeUser: vi.fn(),
  },
  recordActivity: vi.fn(),
}))
vi.mock('../../auth/auth', () => ({ getAuth: () => ({ api }) }))
vi.mock('../../auth/rbac', () => ({ requireRole: () => async () => {} }))
vi.mock('../../services/activity', () => ({ recordActivity }))
vi.mock('better-auth/node', () => ({ fromNodeHeaders: (h: unknown) => h }))

import { userRoutes, toRow, CreateUserSchema, SetRoleSchema, ListQuerySchema } from '../users'

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── Part A: pure normalization + validation ────────────────────────────────

describe('toRow', () => {
  it('maps a full Better Auth user object', () => {
    expect(
      toRow({
        id: '1',
        email: 'a@b.com',
        name: 'Alice',
        image: 'img.png',
        role: 'admin',
        banned: true,
        createdAt: new Date('2020-01-01T00:00:00Z'),
      }),
    ).toEqual({
      id: '1',
      email: 'a@b.com',
      name: 'Alice',
      image: 'img.png',
      role: 'admin',
      banned: true,
      createdAt: '2020-01-01T00:00:00.000Z',
    })
  })

  it('fills safe defaults for missing fields', () => {
    expect(toRow({ id: 5 })).toEqual({
      id: '5',
      email: '',
      name: '',
      image: null,
      role: 'viewer',
      banned: false,
      createdAt: '',
    })
  })

  it('normalizes the role and coerces banned', () => {
    expect(toRow({ id: '1', role: 'admin,viewer' }).role).toBe('admin')
    expect(toRow({ id: '1', role: 'root' }).role).toBe('viewer')
    expect(toRow({ id: '1', banned: 1 }).banned).toBe(true)
    expect(toRow({ id: '1', banned: 0 }).banned).toBe(false)
  })

  it('serializes createdAt: Date → ISO, string → passthrough, missing → empty', () => {
    expect(toRow({ id: '1', createdAt: new Date('2021-05-05T00:00:00Z') }).createdAt).toBe(
      '2021-05-05T00:00:00.000Z',
    )
    expect(toRow({ id: '1', createdAt: '2021-05-05' }).createdAt).toBe('2021-05-05')
    expect(toRow({ id: '1' }).createdAt).toBe('')
  })
})

describe('CreateUserSchema', () => {
  const valid = { email: 'a@b.com', name: 'Alice', password: 'longenough' }

  it('accepts valid input and defaults role to viewer', () => {
    expect(CreateUserSchema.parse(valid)).toEqual({ ...valid, role: 'viewer' })
  })

  it('keeps an explicit role', () => {
    expect(CreateUserSchema.parse({ ...valid, role: 'editor' }).role).toBe('editor')
  })

  it.each([
    ['bad email', { ...valid, email: 'not-an-email' }],
    ['empty name', { ...valid, name: '' }],
    ['too-long name', { ...valid, name: 'x'.repeat(201) }],
    ['short password', { ...valid, password: '1234567' }],
    ['long password', { ...valid, password: 'x'.repeat(129) }],
    ['invalid role', { ...valid, role: 'root' }],
  ])('rejects %s', (_label, input) => {
    expect(CreateUserSchema.safeParse(input).success).toBe(false)
  })

  it('accepts an 8-char password (lower boundary)', () => {
    expect(CreateUserSchema.safeParse({ ...valid, password: '12345678' }).success).toBe(true)
  })
})

describe('SetRoleSchema', () => {
  it.each(['admin', 'editor', 'viewer'])('accepts %s', (role) => {
    expect(SetRoleSchema.parse({ role }).role).toBe(role)
  })
  it.each([{ role: 'root' }, {}])('rejects %p', (input) => {
    expect(SetRoleSchema.safeParse(input).success).toBe(false)
  })
})

describe('ListQuerySchema', () => {
  it('applies defaults', () => {
    expect(ListQuerySchema.parse({})).toEqual({ limit: 100, offset: 0 })
  })
  it('coerces numeric strings', () => {
    expect(ListQuerySchema.parse({ limit: '50', offset: '10' })).toMatchObject({
      limit: 50,
      offset: 10,
    })
  })
  it('enforces limit bounds (1..200) and non-negative offset', () => {
    expect(ListQuerySchema.safeParse({ limit: 0 }).success).toBe(false)
    expect(ListQuerySchema.safeParse({ limit: 201 }).success).toBe(false)
    expect(ListQuerySchema.safeParse({ limit: 200 }).success).toBe(true)
    expect(ListQuerySchema.safeParse({ offset: -1 }).success).toBe(false)
  })
  it('trims search and rejects whitespace-only', () => {
    expect(ListQuerySchema.parse({ search: ' foo ' }).search).toBe('foo')
    expect(ListQuerySchema.safeParse({ search: '   ' }).success).toBe(false)
    expect(ListQuerySchema.parse({}).search).toBeUndefined()
  })
})

// ─── Part B: route handlers ─────────────────────────────────────────────────

type Handler = (req: Record<string, unknown>, reply: unknown) => Promise<void>

function makeReply() {
  return {
    statusCode: undefined as number | undefined,
    body: undefined as unknown,
    status(c: number) {
      this.statusCode = c
      return this
    },
    send(p: unknown) {
      this.body = p
      return this
    },
    log: { error: vi.fn() },
  }
}

async function getRoutes(): Promise<Record<string, Handler>> {
  const routes: Record<string, Handler> = {}
  const reg = (method: string) => (path: string, _opts: unknown, handler: Handler) => {
    routes[`${method} ${path}`] = handler
  }
  const app = {
    get: reg('GET'),
    post: reg('POST'),
    patch: reg('PATCH'),
    delete: reg('DELETE'),
  } as unknown as FastifyInstance
  await userRoutes(app)
  return routes
}

describe('GET /api/users', () => {
  it('maps users through toRow and returns the total', async () => {
    api.listUsers.mockResolvedValue({
      users: [{ id: '1', email: 'a@b', name: 'A', role: 'admin' }],
      total: 7,
    })
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['GET /api/users']({ query: {}, headers: {} }, reply)
    expect(api.listUsers).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.objectContaining({ limit: 100, offset: 0 }) }),
    )
    expect(reply.body).toEqual({
      success: true,
      data: { users: [toRow({ id: '1', email: 'a@b', name: 'A', role: 'admin' })], total: 7 },
    })
  })

  it('falls back to users.length when total is absent', async () => {
    api.listUsers.mockResolvedValue({ users: [{ id: '1' }, { id: '2' }] })
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['GET /api/users']({ query: {}, headers: {} }, reply)
    expect((reply.body as { data: { total: number } }).data.total).toBe(2)
  })
})

describe('POST /api/users', () => {
  it('creates a user, records the invite, and returns 201', async () => {
    api.createUser.mockResolvedValue({
      user: { id: 'new', email: 'n@x', name: 'N', role: 'editor' },
    })
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['POST /api/users'](
      {
        body: { email: 'n@x.com', name: 'N', password: 'longenough', role: 'editor' },
        headers: {},
        user: { id: 'admin1' },
      },
      reply,
    )
    expect(api.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ email: 'n@x.com', role: 'editor' }),
      }),
    )
    expect(recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'admin1', type: 'user_invited' }),
    )
    expect(reply.statusCode).toBe(201)
    expect((reply.body as { data: { id: string } }).data.id).toBe('new')
  })

  it('returns null data when the auth API yields no user', async () => {
    api.createUser.mockResolvedValue({})
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['POST /api/users'](
      {
        body: { email: 'n@x.com', name: 'N', password: 'longenough' },
        headers: {},
        user: { id: 'a' },
      },
      reply,
    )
    expect(reply.statusCode).toBe(201)
    expect((reply.body as { data: unknown }).data).toBeNull()
  })
})

describe('PATCH /api/users/:id/role — self-demotion guard', () => {
  it('rejects an admin demoting themselves and does not call setRole', async () => {
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['PATCH /api/users/:id/role'](
      { params: { id: 'me' }, body: { role: 'viewer' }, user: { id: 'me' }, headers: {} },
      reply,
    )
    expect(reply.statusCode).toBe(400)
    expect((reply.body as { error: string }).error).toBe('You cannot change your own admin role')
    expect(api.setRole).not.toHaveBeenCalled()
  })

  it('allows keeping your own admin role', async () => {
    api.setRole.mockResolvedValue({ user: { id: 'me', role: 'admin' } })
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['PATCH /api/users/:id/role'](
      { params: { id: 'me' }, body: { role: 'admin' }, user: { id: 'me' }, headers: {} },
      reply,
    )
    expect(api.setRole).toHaveBeenCalledOnce()
  })

  it('changes another user’s role and records it', async () => {
    api.setRole.mockResolvedValue({ user: { id: 'other', role: 'editor' } })
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['PATCH /api/users/:id/role'](
      { params: { id: 'other' }, body: { role: 'editor' }, user: { id: 'me' }, headers: {} },
      reply,
    )
    expect(api.setRole).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ userId: 'other', role: 'editor' }),
      }),
    )
    expect(recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'user_role_changed' }),
    )
  })
})

describe('POST /api/users/:id/deactivate — self guard', () => {
  it('rejects deactivating yourself (403) and does not ban', async () => {
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['POST /api/users/:id/deactivate'](
      { params: { id: 'me' }, body: {}, user: { id: 'me' }, headers: {} },
      reply,
    )
    expect(reply.statusCode).toBe(403)
    expect(api.banUser).not.toHaveBeenCalled()
  })

  it('bans another user with the reason and records it', async () => {
    api.banUser.mockResolvedValue({})
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['POST /api/users/:id/deactivate'](
      { params: { id: 'other' }, body: { banReason: 'spam' }, user: { id: 'me' }, headers: {} },
      reply,
    )
    expect(api.banUser).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ userId: 'other', banReason: 'spam' }),
      }),
    )
    expect(recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'user_deactivated' }),
    )
    expect(reply.body).toEqual({ success: true, data: { deactivated: true } })
  })

  it('omits banReason when not provided', async () => {
    api.banUser.mockResolvedValue({})
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['POST /api/users/:id/deactivate'](
      { params: { id: 'other' }, body: {}, user: { id: 'me' }, headers: {} },
      reply,
    )
    const call = api.banUser.mock.calls[0][0] as { body: Record<string, unknown> }
    expect(call.body).not.toHaveProperty('banReason')
  })
})

describe('POST /api/users/:id/reactivate', () => {
  it('unbans the user and records it', async () => {
    api.unbanUser.mockResolvedValue({})
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['POST /api/users/:id/reactivate'](
      { params: { id: 'other' }, user: { id: 'me' }, headers: {} },
      reply,
    )
    expect(api.unbanUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ userId: 'other' }) }),
    )
    expect(recordActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'user_reactivated' }),
    )
    expect(reply.body).toEqual({ success: true, data: { reactivated: true } })
  })
})

describe('DELETE /api/users/:id — self guard', () => {
  it('rejects deleting yourself (403) and does not remove', async () => {
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['DELETE /api/users/:id'](
      { params: { id: 'me' }, user: { id: 'me' }, headers: {} },
      reply,
    )
    expect(reply.statusCode).toBe(403)
    expect(api.removeUser).not.toHaveBeenCalled()
  })

  it('removes another user and records it', async () => {
    api.removeUser.mockResolvedValue({})
    const routes = await getRoutes()
    const reply = makeReply()
    await routes['DELETE /api/users/:id'](
      { params: { id: 'other' }, user: { id: 'me' }, headers: {} },
      reply,
    )
    expect(api.removeUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ userId: 'other' }) }),
    )
    expect(recordActivity).toHaveBeenCalledWith(expect.objectContaining({ type: 'user_deleted' }))
    expect(reply.body).toEqual({ success: true, data: { deleted: true } })
  })
})
