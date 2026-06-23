import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock the Claude spawner so generate() never launches the real CLI. The fake
// is a tiny EventEmitter whose spawn() replays a canned response configured per
// test via the hoisted handle `h` — mirroring the real lifecycle: one final
// text block (partial=false) followed by 'completion', or an 'error' event.
// ---------------------------------------------------------------------------
const h = vi.hoisted(() => ({
  text: null as string | null, // final result text; null => emit no text at all
  errorMessage: null as string | null, // when set, emit 'error' instead of completing
}))

vi.mock('../spawner', () => {
  const { EventEmitter } = require('events')
  class ClaudeCodeSpawner extends EventEmitter {
    spawn(): void {
      queueMicrotask(() => {
        if (h.errorMessage) {
          this.emit('error', new Error(h.errorMessage))
          return
        }
        if (h.text !== null) {
          this.emit('text', { content: h.text, partial: false })
        }
        this.emit('completion', { exitCode: 0 })
      })
    }
    kill(): void {}
  }
  return { ClaudeCodeSpawner }
})

import { WorkflowGenerator } from '../workflow-generator'

const gen = () => new WorkflowGenerator()
const respond = (obj: unknown): void => {
  h.text = typeof obj === 'string' ? obj : JSON.stringify(obj)
}
const agent = (over: Record<string, unknown> = {}) => ({
  tempId: 'a0',
  name: 'Agent',
  description: 'does a thing',
  persona: 'an experienced specialist',
  purpose: 'general',
  model: 'sonnet',
  suggestedSkills: [],
  ...over,
})

beforeEach(() => {
  h.text = null
  h.errorMessage = null
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('WorkflowGenerator.generate — happy path', () => {
  it('parses a multi-agent workflow with edges, skills and layout', async () => {
    respond({
      name: 'Blog Pipeline',
      agents: [
        agent({ tempId: 'a0', name: 'Researcher', purpose: 'research', suggestedSkills: ['data-analysis'] }),
        agent({ tempId: 'a1', name: 'Writer', purpose: 'writing' }),
      ],
      edges: [{ from: 'a0', to: 'a1' }],
      directorEnabled: false,
    })

    const wf = await gen().generate('write a blog post')

    expect(wf.name).toBe('Blog Pipeline')
    expect(wf.agents).toHaveLength(2)
    expect(wf.agents[0]!.purpose).toBe('research')
    expect(wf.agents[0]!.suggestedSkills).toEqual(['data-analysis'])
    expect(wf.edges).toHaveLength(1)
    expect(wf.edges[0]).toMatchObject({ from: 'a0', to: 'a1' })
    expect(wf.directorEnabled).toBe(false)
    // layout: first agent anchored, downstream agent shifted right
    expect(wf.agents[0]!.position).toEqual({ x: 100, y: 300 })
    expect(wf.agents[1]!.position.x).toBeGreaterThan(wf.agents[0]!.position.x)
  })

  it('extracts JSON wrapped in markdown fences and surrounding prose', async () => {
    h.text = 'Here is your workflow:\n```json\n' +
      JSON.stringify({ name: 'X', agents: [agent({ name: 'Solo' })], edges: [] }) +
      '\n```\nHope that helps!'

    const wf = await gen().generate('do something useful')

    expect(wf.name).toBe('X')
    expect(wf.agents).toHaveLength(1)
    expect(wf.agents[0]!.name).toBe('Solo')
  })
})

describe('WorkflowGenerator.generate — normalization & validation', () => {
  it('caps the workflow at 5 agents', async () => {
    respond({
      name: 'Many',
      agents: Array.from({ length: 8 }, (_, i) => agent({ tempId: `a${i}`, name: `A${i}` })),
      edges: [],
    })

    const wf = await gen().generate('lots of agents please')

    expect(wf.agents).toHaveLength(5)
  })

  it('falls back to general/sonnet for unknown purpose and model', async () => {
    respond({ name: 'X', agents: [agent({ purpose: 'banana', model: 'gpt-4' })], edges: [] })

    const wf = await gen().generate('a valid task description')

    expect(wf.agents[0]!.purpose).toBe('general')
    expect(wf.agents[0]!.model).toBe('sonnet')
  })

  it('keeps catalog skills and drops unknown skill ids', async () => {
    respond({
      name: 'X',
      agents: [agent({ suggestedSkills: ['code-review', 'not-a-real-skill', 'writing-assistant'] })],
      edges: [],
    })

    const wf = await gen().generate('a valid task description')

    expect(wf.agents[0]!.suggestedSkills).toEqual(['code-review', 'writing-assistant'])
  })

  it('drops agents without a name (and keeps the named ones)', async () => {
    respond({
      name: 'X',
      agents: [agent({ tempId: 'a0', name: 'Named' }), agent({ tempId: 'a1', name: undefined })],
      edges: [],
    })

    const wf = await gen().generate('a valid task description')

    expect(wf.agents).toHaveLength(1)
    expect(wf.agents[0]!.tempId).toBe('a0')
  })

  it('drops edges with unknown endpoints and self-loops', async () => {
    respond({
      name: 'X',
      agents: [agent({ tempId: 'a0', name: 'A' }), agent({ tempId: 'a1', name: 'B' })],
      edges: [
        { from: 'a0', to: 'a1' }, // valid
        { from: 'a0', to: 'ghost' }, // unknown target
        { from: 'a1', to: 'a1' }, // self-loop
      ],
    })

    const wf = await gen().generate('a valid task description')

    expect(wf.edges).toHaveLength(1)
    expect(wf.edges[0]).toMatchObject({ from: 'a0', to: 'a1' })
  })

  it('defaults directorEnabled to true for 3+ agents when omitted', async () => {
    respond({
      name: 'X',
      agents: ['a0', 'a1', 'a2'].map((id) => agent({ tempId: id, name: id })),
      edges: [],
    })

    const wf = await gen().generate('a valid task description')

    expect(wf.directorEnabled).toBe(true)
  })

  it('defaults directorEnabled to false for a single agent when omitted', async () => {
    respond({ name: 'X', agents: [agent()], edges: [] })

    const wf = await gen().generate('a valid task description')

    expect(wf.directorEnabled).toBe(false)
  })
})

describe('WorkflowGenerator.generate — layout', () => {
  it('places parallel roots in the same column and their successor downstream', async () => {
    respond({
      name: 'Fan-in',
      agents: ['a0', 'a1', 'a2'].map((id) => agent({ tempId: id, name: id })),
      edges: [
        { from: 'a0', to: 'a2' },
        { from: 'a1', to: 'a2' },
      ],
    })

    const wf = await gen().generate('a valid task description')
    const pos = Object.fromEntries(wf.agents.map((a) => [a.tempId, a.position]))

    expect(pos['a0']!.x).toBe(pos['a1']!.x) // both roots → layer 0
    expect(pos['a0']!.y).not.toBe(pos['a1']!.y) // stacked vertically
    expect(pos['a2']!.x).toBeGreaterThan(pos['a0']!.x) // successor → layer 1
  })
})

describe('WorkflowGenerator.generate — fallback & errors', () => {
  it('returns a single-agent fallback when the JSON is malformed', async () => {
    h.text = '{ this is definitely not valid json '

    const wf = await gen().generate('summarize my meeting notes')

    expect(wf.agents).toHaveLength(1)
    expect(wf.agents[0]!.purpose).toBe('general')
    expect(wf.agents[0]!.model).toBe('sonnet')
    expect(wf.directorEnabled).toBe(false)
    expect(wf.name).toContain('summarize')
    expect(wf.agents[0]!.position).toEqual({ x: 100, y: 300 }) // layout still applied
  })

  it('returns a fallback when the output contains no JSON at all', async () => {
    h.text = 'I cannot help with that request.'

    const wf = await gen().generate('a perfectly reasonable task')

    expect(wf.agents).toHaveLength(1)
    expect(wf.agents[0]!.name).toBeTruthy()
  })

  it('returns a fallback when parsed JSON has zero valid agents', async () => {
    respond({ name: 'X', agents: [{ purpose: 'general' }], edges: [] }) // no name → invalid

    const wf = await gen().generate('a perfectly reasonable task')

    expect(wf.agents).toHaveLength(1)
    expect(wf.agents[0]!.purpose).toBe('general')
  })

  it('throws when the CLI produces empty output', async () => {
    h.text = '   '

    await expect(gen().generate('a valid task description')).rejects.toThrow(/empty output/i)
  })

  it('rejects when the spawner emits an error', async () => {
    h.errorMessage = 'authentication failed'

    await expect(gen().generate('a valid task description')).rejects.toThrow('authentication failed')
  })
})
