import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EventEmitter } from 'events'

// ---------------------------------------------------------------------------
// Mock prompt-builder and spawner before importing the executor
// ---------------------------------------------------------------------------
vi.mock('../prompt-builder', () => ({
  buildSpawnConfig: vi.fn(),
}))

// Hoisted so the (hoisted) vi.mock factory below can read it. Tests mutate
// `stepOutput` to simulate an agent that completes with empty output.
const mockSpawn = vi.hoisted(() => ({ stepOutput: 'step output' as string }))

vi.mock('../spawner', () => {
  const { EventEmitter } = require('events')

  class MockClaudeCodeSpawner extends EventEmitter {
    public spawnCalled = false
    public killCalled = false

    spawn(_opts: unknown): void {
      this.spawnCalled = true
      // Immediately emit a non-partial text block then completion
      setImmediate(() => {
        this.emit('text', { content: mockSpawn.stepOutput, partial: false })
        this.emit('completion', { exitCode: 0 })
      })
    }

    kill(): void {
      this.killCalled = true
    }
  }

  return { ClaudeCodeSpawner: MockClaudeCodeSpawner }
})

// ---------------------------------------------------------------------------
// Mock the Director so director-mode tests exercise the EXECUTOR's branch
// traversal deterministically (no LLM, no DB). `decisions` is a queue consumed
// one-per-evaluate; an empty queue defaults to "continue", so the branch graph
// — not the Director — drives which node runs next.
// ---------------------------------------------------------------------------
const mockDirector = vi.hoisted(() => ({
  decisions: [] as Array<{ action: 'continue' | 'redirect' | 'conclude'; message?: string; targetStepIndex?: number }>,
  evalCount: 0,
}))

vi.mock('../director', () => {
  class Director {
    async loadMemories(): Promise<string[]> {
      return []
    }
    async saveMemory(): Promise<void> {
      /* noop */
    }
    async evaluate(): Promise<unknown> {
      mockDirector.evalCount++
      const next = mockDirector.decisions.shift()
      return {
        action: next?.action ?? 'continue',
        targetStepIndex: next?.targetStepIndex ?? 0,
        message: next?.message ?? 'Proceed with the next step using the prior output.',
        reasoning: 'mock decision',
        learning: null,
      }
    }
  }
  return { Director }
})

// loadAgentMetadata imports prisma; stub it so director-mode tests stay hermetic
// (the empty object makes db.agent undefined → caught → metadata falls back to ids).
vi.mock('../lib/prisma', () => ({ prisma: {} }))

import { ChainExecutor, validateNoCycles } from '../chain-executor'
import { buildSpawnConfig } from '../prompt-builder'
import type { ChainDefinition } from '../chain-executor'

const mockBuildSpawnConfig = vi.mocked(buildSpawnConfig)

// ---------------------------------------------------------------------------
// Default spawn config returned by the mock
// ---------------------------------------------------------------------------
const DEFAULT_CONFIG = {
  provider: 'claude-code',
  systemPrompt: 'Be helpful.',
  appendSystemPrompt: undefined,
  allowedTools: ['Read', 'Bash'],
  model: 'claude-sonnet-4-5',
  permissionMode: 'dontAsk',
  maxBudgetUsd: undefined,
  env: {},
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function linearChain(agentIds: string[]): ChainDefinition {
  const steps = agentIds.map((agentId) => ({ agentId }))
  const edges = agentIds
    .slice(0, -1)
    .map((_, i) => ({ from: i, to: i + 1 }))
  return { steps, edges }
}

function singleStep(agentId = 'agent-1'): ChainDefinition {
  return { steps: [{ agentId }], edges: [] }
}

// ---------------------------------------------------------------------------
// validateNoCycles — unit tests (pure graph logic, no mocks needed)
// ---------------------------------------------------------------------------

describe('validateNoCycles', () => {
  it('accepts an empty chain', () => {
    expect(() => validateNoCycles({ steps: [], edges: [] })).not.toThrow()
  })

  it('accepts a linear chain A→B→C', () => {
    expect(() => validateNoCycles(linearChain(['A', 'B', 'C']))).not.toThrow()
  })

  it('accepts a diamond chain A→B, A→C, B→D, C→D', () => {
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }, { agentId: 'C' }, { agentId: 'D' }],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
      ],
    }
    expect(() => validateNoCycles(chain)).not.toThrow()
  })

  it('throws for a direct cycle A→B, B→A', () => {
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }],
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 0 },
      ],
    }
    expect(() => validateNoCycles(chain)).toThrow(/cycle/)
  })

  it('throws for a three-step cycle A→B→C→A', () => {
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }, { agentId: 'C' }],
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 0 },
      ],
    }
    expect(() => validateNoCycles(chain)).toThrow(/cycle/)
  })
})

// ---------------------------------------------------------------------------
// ChainExecutor — integration tests (using mocked spawner + prompt-builder)
// ---------------------------------------------------------------------------

describe('ChainExecutor — empty chain', () => {
  it('emits chain_complete immediately', async () => {
    const executor = new ChainExecutor()
    const events: unknown[] = []
    executor.on('chain_complete', (data) => events.push(data))

    await executor.execute({ steps: [], edges: [] }, 'hello')
    expect(events).toHaveLength(1)
    expect((events[0] as { outputs: Map<number, string> }).outputs.size).toBe(0)
  })
})

describe('ChainExecutor — linear chain', () => {
  beforeEach(() => {
    mockBuildSpawnConfig.mockResolvedValue(DEFAULT_CONFIG as never)
  })

  it('executes all steps and emits chain_complete', async () => {
    const chain = linearChain(['agent-A', 'agent-B', 'agent-C'])
    const executor = new ChainExecutor()

    const stepStarts: number[] = []
    const stepCompletes: number[] = []
    let chainCompleteData: { outputs: Map<number, string> } | null = null

    executor.on('step_start', ({ stepIndex }) => stepStarts.push(stepIndex))
    executor.on('step_complete', ({ stepIndex }) => stepCompletes.push(stepIndex))
    executor.on('chain_complete', (data) => { chainCompleteData = data })

    await executor.execute(chain, 'start message')

    expect(stepStarts).toHaveLength(3)
    expect(stepCompletes).toHaveLength(3)
    expect(chainCompleteData).not.toBeNull()
    expect(chainCompleteData!.outputs.size).toBe(3)
  })

  it('calls buildSpawnConfig for each agent', async () => {
    const chain = linearChain(['agent-A', 'agent-B'])
    const executor = new ChainExecutor()
    await executor.execute(chain, 'msg')

    // ChainExecutor forwards its workspaceId (undefined here) as the 2nd arg.
    expect(mockBuildSpawnConfig).toHaveBeenCalledWith('agent-A', undefined)
    expect(mockBuildSpawnConfig).toHaveBeenCalledWith('agent-B', undefined)
  })
})

describe('ChainExecutor — cycle detection at execute time', () => {
  it('throws before any step runs when chain has a cycle', async () => {
    const cyclicChain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }],
      edges: [{ from: 0, to: 1 }, { from: 1, to: 0 }],
    }

    const executor = new ChainExecutor()
    await expect(executor.execute(cyclicChain, 'hello')).rejects.toThrow(/cycle/)
  })
})

describe('ChainExecutor — parallel branches', () => {
  beforeEach(() => {
    mockBuildSpawnConfig.mockResolvedValue(DEFAULT_CONFIG as never)
  })

  it('executes independent branches after root step', async () => {
    // A → B, A → C  (B and C are independent)
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }, { agentId: 'C' }],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
      ],
    }

    const executor = new ChainExecutor()
    const completes: number[] = []
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))

    await executor.execute(chain, 'go')

    // All three steps should complete
    expect(completes).toHaveLength(3)
    expect(completes).toContain(0)
    expect(completes).toContain(1)
    expect(completes).toContain(2)
  })
})

describe('ChainExecutor — fan-in (multiple predecessors)', () => {
  beforeEach(() => {
    mockBuildSpawnConfig.mockResolvedValue(DEFAULT_CONFIG as never)
  })

  it('step D receives concatenated output from B and C', async () => {
    // A→B, A→C, B→D, C→D
    const chain: ChainDefinition = {
      steps: [
        { agentId: 'A' },
        { agentId: 'B' },
        { agentId: 'C' },
        { agentId: 'D' },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
      ],
    }

    const executor = new ChainExecutor()
    let chainCompleteData: { outputs: Map<number, string> } | null = null
    executor.on('chain_complete', (data) => { chainCompleteData = data })

    await executor.execute(chain, 'start')

    // All four steps should produce output
    expect(chainCompleteData!.outputs.size).toBe(4)
    expect(chainCompleteData!.outputs.has(3)).toBe(true)
  })
})

describe('ChainExecutor — step failure isolation', () => {
  it('emits error event when buildSpawnConfig rejects for a step', async () => {
    // Make the first agentId fail at the config-build stage (before spawn)
    mockBuildSpawnConfig.mockImplementation(async (agentId: string) => {
      if (agentId === 'agent-fail') {
        throw new Error('config build failed for agent-fail')
      }
      return DEFAULT_CONFIG as never
    })

    // Two independent root nodes: step 0 and step 1 (no edges)
    const chain: ChainDefinition = {
      steps: [{ agentId: 'agent-fail' }, { agentId: 'agent-ok' }],
      edges: [],
    }

    const executor = new ChainExecutor()
    const errors: unknown[] = []
    executor.on('error', (data) => errors.push(data))

    await executor.execute(chain, 'go')

    expect(errors).toHaveLength(1)
    expect((errors[0] as { error: string }).error).toContain('agent-fail')

    // Reset mock back to default for other tests
    mockBuildSpawnConfig.mockResolvedValue(DEFAULT_CONFIG as never)
  })
})

describe('ChainExecutor — empty output guardrail', () => {
  beforeEach(() => {
    mockBuildSpawnConfig.mockResolvedValue(DEFAULT_CONFIG as never)
  })

  afterEach(() => {
    // Restore default so other suites get non-empty step output.
    mockSpawn.stepOutput = 'step output'
  })

  it('fails a step (and skips dependents) when it completes with empty output', async () => {
    // Simulate an agent that runs but produces nothing (e.g. a blocked tool).
    mockSpawn.stepOutput = '   '

    const chain = linearChain(['agent-empty', 'agent-downstream'])
    const executor = new ChainExecutor()
    const errors: Array<{ stepIndex: number; error: string }> = []
    const stepCompletes: number[] = []
    executor.on('error', (d) => errors.push(d as { stepIndex: number; error: string }))
    executor.on('step_complete', ({ stepIndex }) => stepCompletes.push(stepIndex))

    await executor.execute(chain, 'go')

    // The empty step must surface an error rather than a success...
    expect(errors).toHaveLength(1)
    expect(errors[0]!.stepIndex).toBe(0)
    expect(errors[0]!.error).toMatch(/no output/i)
    // ...and neither it nor its dependent may be reported complete (no empty cascade).
    expect(stepCompletes).not.toContain(0)
    expect(stepCompletes).not.toContain(1)
  })
})

describe('ChainExecutor — conditional / branching edges', () => {
  beforeEach(() => {
    mockBuildSpawnConfig.mockResolvedValue(DEFAULT_CONFIG as never)
  })
  afterEach(() => {
    mockSpawn.stepOutput = 'step output'
  })

  // A is the predecessor; B/C/D are branch targets. All agents emit the same
  // output, but only the predecessor's output gates the branches.
  function branchChain(): ChainDefinition {
    return {
      steps: [{ agentId: 'A' }, { agentId: 'B' }, { agentId: 'C' }],
      edges: [
        { from: 0, to: 1, condition: 'approved', group: 'cond', order: 0 },
        { from: 0, to: 2, condition: 'rejected', group: 'cond', order: 1 },
      ],
    }
  }

  it('runs the matching branch and skips the non-matching one', async () => {
    mockSpawn.stepOutput = 'Looks good — approved'
    const executor = new ChainExecutor()
    const completes: number[] = []
    const skips: Array<{ stepIndex: number; reason: string }> = []
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    executor.on('step_skipped', (d) => skips.push(d as { stepIndex: number; reason: string }))

    await executor.execute(branchChain(), 'go')

    expect(completes).toContain(0)
    expect(completes).toContain(1) // approved branch
    expect(completes).not.toContain(2)
    expect(skips).toHaveLength(1)
    expect(skips[0]).toMatchObject({ stepIndex: 2, reason: 'condition_not_met' })
  })

  it('is case-insensitive', async () => {
    mockSpawn.stepOutput = 'APPROVED'
    const executor = new ChainExecutor()
    const completes: number[] = []
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    await executor.execute(branchChain(), 'go')
    expect(completes).toContain(1)
    expect(completes).not.toContain(2)
  })

  it('matches against the last non-empty line only', async () => {
    // "approved" appears earlier but the verdict line is "rejected".
    mockSpawn.stepOutput = 'I nearly approved this.\n\nDECISION: rejected'
    const executor = new ChainExecutor()
    const completes: number[] = []
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    await executor.execute(branchChain(), 'go')
    expect(completes).not.toContain(1) // approved must NOT match a non-final line
    expect(completes).toContain(2) // rejected (the last line) wins
  })

  it('runs the else branch (no condition) when nothing matches', async () => {
    mockSpawn.stepOutput = 'undecided'
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }, { agentId: 'C' }, { agentId: 'D' }],
      edges: [
        { from: 0, to: 1, condition: 'approved', group: 'cond', order: 0 },
        { from: 0, to: 2, condition: 'rejected', group: 'cond', order: 1 },
        { from: 0, to: 3, group: 'cond', order: 2 }, // else
      ],
    }
    const executor = new ChainExecutor()
    const completes: number[] = []
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    await executor.execute(chain, 'go')
    expect(completes).toContain(3) // else
    expect(completes).not.toContain(1)
    expect(completes).not.toContain(2)
  })

  it('is exclusive within a group: only the first matching branch runs', async () => {
    // Both branches would match "go", but order 0 wins and order 1 is skipped.
    mockSpawn.stepOutput = 'go'
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'X' }, { agentId: 'Y' }],
      edges: [
        { from: 0, to: 1, condition: 'go', group: 'cond', order: 0 },
        { from: 0, to: 2, condition: 'go', group: 'cond', order: 1 },
      ],
    }
    const executor = new ChainExecutor()
    const completes: number[] = []
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    await executor.execute(chain, 'go')
    expect(completes).toContain(1)
    expect(completes).not.toContain(2)
  })

  it('an unconditional predecessor edge always enables the target', async () => {
    mockSpawn.stepOutput = 'whatever'
    // A→D is conditional and fails; B→D is unconditional → D runs anyway.
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }, { agentId: 'D' }],
      edges: [
        { from: 0, to: 2, condition: 'never-matches' },
        { from: 1, to: 2 },
      ],
    }
    const executor = new ChainExecutor()
    const completes: number[] = []
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    await executor.execute(chain, 'go')
    expect(completes).toContain(2)
  })

  it('treats an invalid regex as non-matching and does not throw', async () => {
    mockSpawn.stepOutput = 'anything'
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }],
      edges: [{ from: 0, to: 1, condition: '[' }],
    }
    const executor = new ChainExecutor()
    const completes: number[] = []
    const skips: number[] = []
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    executor.on('step_skipped', ({ stepIndex }) => skips.push(stepIndex))
    await expect(executor.execute(chain, 'go')).resolves.toBeUndefined()
    expect(completes).not.toContain(1)
    expect(skips).toContain(1)
  })

  it('cascade-skips descendants, emitting one event each', async () => {
    mockSpawn.stepOutput = 'unmatched'
    // A→B fails (B skipped: condition_not_met); B→C cascades (skipped: cascade).
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }, { agentId: 'C' }],
      edges: [
        { from: 0, to: 1, condition: 'approved', group: 'cond', order: 0 },
        { from: 1, to: 2 },
      ],
    }
    const executor = new ChainExecutor()
    const skips: Array<{ stepIndex: number; reason: string }> = []
    executor.on('step_skipped', (d) => skips.push(d as { stepIndex: number; reason: string }))
    await executor.execute(chain, 'go')
    expect(skips.filter((s) => s.stepIndex === 1)).toHaveLength(1)
    expect(skips.filter((s) => s.stepIndex === 2)).toHaveLength(1)
    expect(skips.find((s) => s.stepIndex === 1)?.reason).toBe('condition_not_met')
    expect(skips.find((s) => s.stepIndex === 2)?.reason).toBe('cascade')
  })
})

describe('ChainExecutor — Director mode honours branches', () => {
  beforeEach(() => {
    mockBuildSpawnConfig.mockResolvedValue(DEFAULT_CONFIG as never)
    mockDirector.decisions = []
    mockDirector.evalCount = 0
  })
  afterEach(() => {
    mockSpawn.stepOutput = 'step output'
    mockDirector.decisions = []
  })

  // A → B (if "approved") | C (if "rejected"), compiled as a mutually-exclusive
  // Condition-node group — exactly what the UI emits for a Condition node.
  function branchChain(): ChainDefinition {
    return {
      steps: [{ agentId: 'A' }, { agentId: 'B' }, { agentId: 'C' }],
      edges: [
        { from: 0, to: 1, condition: 'approved', group: 'cond', order: 0 },
        { from: 0, to: 2, condition: 'rejected', group: 'cond', order: 1 },
      ],
    }
  }

  it('runs all steps of a linear chain in order', async () => {
    const completes: number[] = []
    let completeData: { outputs: Map<number, string> } | null = null
    const executor = new ChainExecutor()
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    executor.on('chain_complete', (d) => { completeData = d })

    await executor.execute(linearChain(['A', 'B', 'C']), 'go', { director: true })

    expect(completes).toEqual([0, 1, 2])
    expect(completeData!.outputs.size).toBe(3)
  })

  it('takes the matching branch and skips the non-matching one', async () => {
    mockSpawn.stepOutput = 'Looks good — approved'
    const completes: number[] = []
    const skips: Array<{ stepIndex: number; reason: string }> = []
    const executor = new ChainExecutor()
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    executor.on('step_skipped', (d) => skips.push(d as { stepIndex: number; reason: string }))

    await executor.execute(branchChain(), 'go', { director: true })

    expect(completes).toContain(0)
    expect(completes).toContain(1) // approved branch
    expect(completes).not.toContain(2) // rejected branch never runs
    expect(skips).toHaveLength(1)
    expect(skips[0]).toMatchObject({ stepIndex: 2, reason: 'condition_not_met' })
  })

  it('falls through to the else branch when nothing matches', async () => {
    mockSpawn.stepOutput = 'undecided'
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }, { agentId: 'C' }, { agentId: 'D' }],
      edges: [
        { from: 0, to: 1, condition: 'approved', group: 'cond', order: 0 },
        { from: 0, to: 2, condition: 'rejected', group: 'cond', order: 1 },
        { from: 0, to: 3, group: 'cond', order: 2 }, // else
      ],
    }
    const completes: number[] = []
    const executor = new ChainExecutor()
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))

    await executor.execute(chain, 'go', { director: true })

    expect(completes).toContain(0)
    expect(completes).toContain(3) // else
    expect(completes).not.toContain(1)
    expect(completes).not.toContain(2)
  })

  it('retries the same step on redirect, then advances along the branch', async () => {
    mockSpawn.stepOutput = 'approved'
    // First evaluate (after A's first run) redirects; the queue then drains to
    // the default "continue", so A re-runs once and the chain proceeds.
    mockDirector.decisions = [{ action: 'redirect', message: 'Please redo step A with more detail.' }]
    const starts: number[] = []
    const executor = new ChainExecutor()
    executor.on('step_start', ({ stepIndex }) => starts.push(stepIndex))

    await executor.execute(branchChain(), 'go', { director: true })

    // A (index 0) starts twice (original + one auto-approved retry); B once.
    expect(starts.filter((i) => i === 0)).toHaveLength(2)
    expect(starts.filter((i) => i === 1)).toHaveLength(1)
    expect(starts).not.toContain(2)
  })

  it('walks a non-linear DAG (diamond) in topo order, running the fan-in node once', async () => {
    // A→B, A→C, B→D, C→D — no conditions (branchingActive false), the path the
    // linear index++ loop used to mishandle. D must run exactly once.
    const chain: ChainDefinition = {
      steps: [{ agentId: 'A' }, { agentId: 'B' }, { agentId: 'C' }, { agentId: 'D' }],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 },
      ],
    }
    const completes: number[] = []
    let completeData: { outputs: Map<number, string> } | null = null
    const executor = new ChainExecutor()
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    executor.on('chain_complete', (d) => { completeData = d })

    await executor.execute(chain, 'go', { director: true })

    expect(completes.filter((i) => i === 3)).toHaveLength(1) // fan-in node runs once
    expect([...completes].sort()).toEqual([0, 1, 2, 3])
    expect(completeData!.outputs.size).toBe(4)
  })

  it('concludes early without running later steps', async () => {
    mockDirector.decisions = [{ action: 'conclude' }]
    const completes: number[] = []
    let completeData: { outputs: Map<number, string> } | null = null
    const executor = new ChainExecutor()
    executor.on('step_complete', ({ stepIndex }) => completes.push(stepIndex))
    executor.on('chain_complete', (d) => { completeData = d })

    await executor.execute(linearChain(['A', 'B', 'C']), 'go', { director: true })

    expect(completes).toEqual([0]) // only the first step ran
    expect(completeData!.outputs.size).toBe(1)
  })
})

describe('ChainExecutor — stop', () => {
  it('stops the executor without throwing', async () => {
    const executor = new ChainExecutor()
    // stop() before any execution — should be a no-op
    expect(() => executor.stop()).not.toThrow()
  })
})
