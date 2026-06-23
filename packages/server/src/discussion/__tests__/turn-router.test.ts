import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventEmitter } from 'events'

// Capture every spawn() options object so we can assert how discussion turns
// drive the Claude CLI. The spawner is replaced with an EventEmitter stub that
// records its options and then emits a normal completion, so executeTurn /
// executeModeratorTurn resolve without launching a real process.
const h = vi.hoisted(() => ({
  spawnCalls: [] as Array<Record<string, unknown>>,
  // Tunable per-test return values for the mocked config / policy resolvers.
  configPermissionMode: 'default',
  policyPermissionMode: 'dontAsk',
}))

vi.mock('../../engine/spawner', () => ({
  ClaudeCodeSpawner: class extends EventEmitter {
    spawn(options: Record<string, unknown>) {
      h.spawnCalls.push(options)
      // Emit a complete (non-partial) text block then completion on the next
      // microtask, mirroring the real event ordering spawnAndCollect listens for.
      queueMicrotask(() => {
        this.emit('text', { content: 'ok', partial: false })
        this.emit('usage', { inputTokens: 1, outputTokens: 1, estimatedCostUsd: 0 })
        this.emit('completion', { exitCode: 0 })
      })
    }
    kill() {}
  },
}))

vi.mock('../../engine/prompt-builder', () => ({
  buildSpawnConfig: vi.fn(async () => ({
    systemPrompt: 'persona',
    appendSystemPrompt: undefined,
    allowedTools: ['WebFetch', 'Read'],
    model: 'claude-sonnet-4-5',
    permissionMode: h.configPermissionMode,
    maxBudgetUsd: undefined,
    env: {},
  })),
}))

vi.mock('../../engine/policy-resolver', () => ({
  resolvePolicy: vi.fn(async () => ({
    blockedCommands: [],
    requireApproval: [],
    maxTimeout: 300_000,
    maxFileSize: 10_485_760,
    maxBudgetUsd: 100,
    permissionMode: h.policyPermissionMode,
    sources: [],
  })),
}))

// eslint-disable-next-line import/first
import { TurnRouter } from '../turn-router'
// eslint-disable-next-line import/first
import type { AgentRecord } from '../moderator'

const mkAgent = (id: string, name: string): AgentRecord => ({
  id,
  name,
  persona: 'p',
  model: null,
  allowedTools: [],
  purpose: null,
  memoryEnabled: false,
  status: 'idle',
})

beforeEach(() => {
  h.spawnCalls = []
  h.configPermissionMode = 'default'
  h.policyPermissionMode = 'dontAsk'
})

describe('TurnRouter.executeTurn', () => {
  it('spawns participant turns with bypassPermissions so headless web tools are not denied', async () => {
    const router = new TurnRouter()
    await router.executeTurn(mkAgent('p1', 'P1'), 'Fetch these two product pages', '')

    expect(h.spawnCalls).toHaveLength(1)
    // The regression: discussions are headless, so a prompting mode (default)
    // would auto-deny WebFetch and the agent would stall asking for permission.
    expect(h.spawnCalls[0]?.['permissionMode']).toBe('bypassPermissions')
    expect(h.spawnCalls[0]?.['allowedTools']).toEqual(['WebFetch', 'Read'])
  })

  it('uses bypassPermissions even when policy would otherwise resolve to default', async () => {
    // A policy forcing 'default' must not re-introduce the headless-deny problem.
    h.policyPermissionMode = 'default'
    const router = new TurnRouter()
    await router.executeTurn(mkAgent('p1', 'P1'), 'question', 'some context')

    expect(h.spawnCalls[0]?.['permissionMode']).toBe('bypassPermissions')
  })
})

describe('TurnRouter.executeModeratorTurn', () => {
  it('keeps the moderator in a non-bypass mode and grants it no tools', async () => {
    const router = new TurnRouter()
    await router.executeModeratorTurn(mkAgent('m', 'Mod'), 'decide', '')

    expect(h.spawnCalls).toHaveLength(1)
    // The moderator only emits JSON — it needs no tools, so it stays in the
    // resolved (prompting) mode rather than bypassPermissions.
    expect(h.spawnCalls[0]?.['permissionMode']).not.toBe('bypassPermissions')
    expect(h.spawnCalls[0]?.['allowedTools']).toEqual([])
  })
})
