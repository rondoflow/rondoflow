import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock Prisma + mcp-auth before importing the module under test
// ---------------------------------------------------------------------------
vi.mock('../../lib/prisma', () => ({
  prisma: {
    agentSkill: { findMany: vi.fn() },
    agentMcpServer: { findMany: vi.fn() },
  },
}))

// Keep auth handling deterministic + crypto-free: identity parse/decrypt and a
// simple bearer→header resolver.
vi.mock('../mcp-auth', () => ({
  parseStoredAuth: (x: unknown) => x ?? null,
  decryptStoredAuth: (x: unknown) => x,
  resolveAuthHeaders: vi.fn(async (auth: { type?: string; token?: string } | null) =>
    auth?.type === 'bearer' ? { Authorization: `Bearer ${auth.token}` } : {},
  ),
}))

import { buildMcpConfig } from '../mcp-config-builder'
import { prisma } from '../../lib/prisma'

const mockSkillFindMany = vi.mocked(prisma.agentSkill.findMany)
const mockMcpFindMany = vi.mocked(prisma.agentMcpServer.findMany)

function mcpAssignment(server: Record<string, unknown>) {
  return { agentId: 'a1', mcpServerId: server['id'], mcpServer: server }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSkillFindMany.mockResolvedValue([] as never)
})

describe('buildMcpConfig — transport handling', () => {
  it('emits a stdio server as command/args/env', async () => {
    mockMcpFindMany.mockResolvedValue([
      mcpAssignment({
        id: 's1',
        name: 'fs',
        type: 'stdio',
        command: 'npx',
        args: ['-y', 'server-fs'],
        env: { TOKEN: 'x' },
        url: null,
        auth: null,
      }),
    ] as never)

    const { mcpServers } = await buildMcpConfig('a1')
    expect(mcpServers['fs']).toEqual({
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'server-fs'],
      env: { TOKEN: 'x' },
    })
  })

  it('emits an http server as url + resolved auth headers', async () => {
    mockMcpFindMany.mockResolvedValue([
      mcpAssignment({
        id: 's2',
        name: 'remote',
        type: 'http',
        command: null,
        args: [],
        env: null,
        url: 'https://api.example.com/mcp',
        auth: { type: 'bearer', token: 'TKN' },
      }),
    ] as never)

    const { mcpServers } = await buildMcpConfig('a1')
    expect(mcpServers['remote']).toEqual({
      type: 'http',
      url: 'https://api.example.com/mcp',
      headers: { Authorization: 'Bearer TKN' },
    })
  })

  it('omits headers for an unauthenticated remote server', async () => {
    mockMcpFindMany.mockResolvedValue([
      mcpAssignment({
        id: 's3',
        name: 'public',
        type: 'sse',
        command: null,
        args: [],
        env: null,
        url: 'https://public.example.com/sse',
        auth: null,
      }),
    ] as never)

    const { mcpServers } = await buildMcpConfig('a1')
    expect(mcpServers['public']).toEqual({
      type: 'sse',
      url: 'https://public.example.com/sse',
    })
  })

  it('skips a remote server whose auth resolution throws (keeps others)', async () => {
    const { resolveAuthHeaders } = await import('../mcp-auth')
    vi.mocked(resolveAuthHeaders).mockRejectedValueOnce(new Error('token endpoint down'))

    mockMcpFindMany.mockResolvedValue([
      mcpAssignment({
        id: 's4',
        name: 'broken',
        type: 'http',
        command: null,
        args: [],
        env: null,
        url: 'https://broken.example.com/mcp',
        auth: { type: 'oauth2_client_credentials' },
      }),
      mcpAssignment({
        id: 's5',
        name: 'ok',
        type: 'stdio',
        command: 'node',
        args: ['x.js'],
        env: null,
        url: null,
        auth: null,
      }),
    ] as never)

    const { mcpServers } = await buildMcpConfig('a1')
    expect(mcpServers['broken']).toBeUndefined()
    expect(mcpServers['ok']).toEqual({ type: 'stdio', command: 'node', args: ['x.js'] })
  })
})
