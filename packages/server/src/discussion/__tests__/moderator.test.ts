import { describe, it, expect, vi, beforeEach } from 'vitest'

// Shared mock state, hoisted so the vi.mock factories below can reference it.
const h = vi.hoisted(() => ({
  openingCalls: 0,
  evalCalls: 0,
  turnAgents: [] as string[],
  pause: null as null | (() => void),
}))

vi.mock('../../lib/prisma', () => ({
  prisma: {
    agentSession: { create: vi.fn(async () => ({ id: 'sess-1' })), update: vi.fn(async () => ({})) },
    discussionTable: { update: vi.fn(async () => ({})) },
    message: { create: vi.fn(async () => ({})) },
  },
}))

// Replace the real TurnRouter (which spawns Claude processes) with a scripted
// stand-in. The moderator's opening / evaluation / synthesis prompts are real,
// so we route on their stable marker text.
vi.mock('../turn-router', () => ({
  TurnRouter: class {
    async executeModeratorTurn(_moderator: unknown, prompt: string) {
      if (prompt.includes('Open the discussion by selecting the first participant')) {
        h.openingCalls += 1
        return { raw: '', parsed: { decision: 'continue', nextParticipantId: 'p1', question: 'Q1', reasoning: 'open' } }
      }
      if (prompt.includes('## Your Decision')) {
        h.evalCalls += 1
        // First evaluation → keep going (pick p2); second → wrap up.
        if (h.evalCalls === 1) {
          return { raw: '', parsed: { decision: 'continue', nextParticipantId: 'p2', question: 'Q2', reasoning: 'more' } }
        }
        return { raw: '', parsed: { decision: 'synthesize', synthesis: 'FINAL SYNTHESIS', reasoning: 'done' } }
      }
      return { raw: 'FINAL SYNTHESIS', parsed: undefined }
    }

    async executeTurn(agent: { id: string; name: string }) {
      h.turnAgents.push(agent.id)
      // Request a pause right after the first participant speaks, exercising the
      // post-turn window that previously discarded the pending turn.
      if (agent.id === 'p1' && h.pause) h.pause()
      return {
        agentId: agent.id,
        agentName: agent.name,
        response: `resp-${agent.id}`,
        tokenUsage: { inputTokens: 1, outputTokens: 1, estimatedCostUsd: 0 },
        durationMs: 1,
      }
    }
  },
}))

// eslint-disable-next-line import/first
import { ModeratorEngine } from '../moderator'
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
  h.openingCalls = 0
  h.evalCalls = 0
  h.turnAgents = []
  h.pause = null
})

describe('ModeratorEngine constructor', () => {
  it('rejects a non-positive maxRounds', () => {
    expect(
      () =>
        new ModeratorEngine('t', 'topic', 'brainstorm', mkAgent('m', 'Mod'), [{ agent: mkAgent('p1', 'P1'), role: 'participant' }], 0),
    ).toThrow(/positive integer/)
  })

  it('accepts a positive maxRounds', () => {
    expect(
      () =>
        new ModeratorEngine('t', 'topic', 'brainstorm', mkAgent('m', 'Mod'), [{ agent: mkAgent('p1', 'P1'), role: 'participant' }], 3),
    ).not.toThrow()
  })
})

describe('ModeratorEngine pause/resume', () => {
  it('resumes the next turn instead of restarting from the opening', async () => {
    const participants = [
      { agent: mkAgent('p1', 'P1'), role: 'participant' as const },
      { agent: mkAgent('p2', 'P2'), role: 'participant' as const },
    ]
    const engine = new ModeratorEngine('t', 'topic', 'brainstorm', mkAgent('m', 'Mod'), participants, 5)

    let concluded: string | null = null
    engine.on('concluded', (s: string) => {
      concluded = s
    })

    // Pause right after p1's turn (the previously-buggy post-turn window).
    h.pause = () => engine.pause()

    await engine.start()

    // Paused with p1 having spoken once and the opening run exactly once.
    expect(engine.currentState).toBe('paused')
    expect(h.turnAgents).toEqual(['p1'])
    expect(h.openingCalls).toBe(1)

    await engine.resume()

    // The opening was NOT re-run (the bug), p2 actually spoke, and we concluded.
    expect(h.openingCalls).toBe(1)
    expect(h.turnAgents).toEqual(['p1', 'p2'])
    expect(concluded).toBe('FINAL SYNTHESIS')
    expect(engine.currentState).toBe('concluded')
  })
})
