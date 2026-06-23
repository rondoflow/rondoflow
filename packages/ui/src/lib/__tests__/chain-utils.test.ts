import { describe, it, expect } from 'vitest'
import type { Node, Edge } from '@xyflow/react'
import type { ConditionBranchSpec } from '@rondoflow/shared'
import { resolveLogicalEdges, buildChainDefinition } from '../chain-utils'

// ─── Builders (minimal shapes the chain-utils functions read) ────────────────

function agent(id: string, extra: Record<string, unknown> = {}): Node {
  return { id, type: 'agent', position: { x: 0, y: 0 }, data: { name: id, status: 'idle', ...extra } } as unknown as Node
}
function condition(id: string, branches: ConditionBranchSpec[]): Node {
  return { id, type: 'condition', position: { x: 0, y: 0 }, data: { name: id, branches } } as unknown as Node
}
function output(id: string): Node {
  return { id, type: 'output', position: { x: 0, y: 0 }, data: { name: id } } as unknown as Node
}
function structurer(id: string, extra: Record<string, unknown> = {}): Node {
  return { id, type: 'structurer', position: { x: 0, y: 0 }, data: { name: id, agentSelection: [], format: 'table', schema: [], extractionMode: 'parse', ...extra } } as unknown as Node
}
function dbSave(id: string): Node {
  return { id, type: 'db-save', position: { x: 0, y: 0 }, data: { name: id } } as unknown as Node
}
function httpRequest(id: string, extra: Record<string, unknown> = {}): Node {
  return { id, type: 'http-request', position: { x: 0, y: 0 }, data: { name: id, method: 'GET', url: '', headers: [], queryParams: [], bodyMode: 'json', timeoutSec: 30, responseMode: 'body', ...extra } } as unknown as Node
}
function duckduckgoSearch(id: string, extra: Record<string, unknown> = {}): Node {
  return { id, type: 'duckduckgo-search', position: { x: 0, y: 0 }, data: { name: id, query: '{{input}}', maxResults: 3, region: 'us-en', safeSearch: 'moderate', timeLimit: '', outputFormat: 'text', ...extra } } as unknown as Node
}
function sakanaAi(id: string, extra: Record<string, unknown> = {}): Node {
  return { id, type: 'sakana-ai', position: { x: 0, y: 0 }, data: { name: id, apiUrl: 'https://api.sakana.ai/v1/chat/completions', model: 'sakana-chat', prompt: '{{input}}', temperature: 0.7, maxTokens: 1024, outputFormat: 'text', ...extra } } as unknown as Node
}
function edge(source: string, target: string, sourceHandle?: string): Edge {
  return { id: `${source}-${target}-${sourceHandle ?? ''}`, source, target, ...(sourceHandle ? { sourceHandle } : {}) } as unknown as Edge
}

describe('resolveLogicalEdges', () => {
  it('passes plain agent→agent edges through unconditionally', () => {
    const nodes = [agent('A'), agent('B')]
    const edges = [edge('A', 'B')]
    expect(resolveLogicalEdges(nodes, edges)).toEqual([{ from: 'A', to: 'B' }])
  })

  it('compiles a Condition node into grouped conditional edges', () => {
    const branches: ConditionBranchSpec[] = [
      { id: 'b-yes', label: 'Approved', kind: 'contains', pattern: 'approved' },
      { id: 'b-no', label: 'Rejected', kind: 'regex', pattern: '^DENY$' },
      { id: 'b-else', label: 'Else', kind: 'contains', pattern: '', isElse: true },
    ]
    const nodes = [agent('A'), condition('C', branches), agent('Yes'), agent('No'), agent('Other')]
    const edges = [
      edge('A', 'C'),
      edge('C', 'Yes', 'b-yes'),
      edge('C', 'No', 'b-no'),
      edge('C', 'Other', 'b-else'),
    ]
    const logical = resolveLogicalEdges(nodes, edges)
    expect(logical).toContainEqual({ from: 'A', to: 'Yes', group: 'C', order: 0, condition: 'approved' })
    // regex kind passes through verbatim
    expect(logical).toContainEqual({ from: 'A', to: 'No', group: 'C', order: 1, condition: '^DENY$' })
    // else branch carries no condition
    expect(logical).toContainEqual({ from: 'A', to: 'Other', group: 'C', order: 2, condition: undefined })
  })

  it('escapes and ORs multi-keyword "contains" patterns', () => {
    const branches: ConditionBranchSpec[] = [
      { id: 'b', label: 'Multi', kind: 'contains', pattern: 'approve|lgtm' },
      { id: 'b2', label: 'Dotted', kind: 'contains', pattern: 'v1.2' },
    ]
    const nodes = [agent('A'), condition('C', branches), agent('X'), agent('Y')]
    const edges = [edge('A', 'C'), edge('C', 'X', 'b'), edge('C', 'Y', 'b2')]
    const logical = resolveLogicalEdges(nodes, edges)
    expect(logical.find((e) => e.to === 'X')?.condition).toBe('(?:approve|lgtm)')
    expect(logical.find((e) => e.to === 'Y')?.condition).toBe('v1\\.2')
  })

  it('ignores edges to/from non-agent, non-condition nodes', () => {
    const nodes = [agent('A'), output('O')]
    const edges = [edge('A', 'O')]
    expect(resolveLogicalEdges(nodes, edges)).toEqual([])
  })

  it('drops a condition node with no upstream agent', () => {
    const branches: ConditionBranchSpec[] = [{ id: 'b', label: 'x', kind: 'contains', pattern: 'x' }]
    const nodes = [condition('C', branches), agent('X')]
    const edges = [edge('C', 'X', 'b')]
    expect(resolveLogicalEdges(nodes, edges)).toEqual([])
  })
})

describe('buildChainDefinition', () => {
  it('builds a linear chain A→B→C with correct indices', () => {
    const nodes = [agent('A'), agent('B'), agent('C')]
    const edges = [edge('A', 'B'), edge('B', 'C')]
    const { steps, edges: defEdges, indexByNodeId } = buildChainDefinition(nodes, edges)
    expect(steps.map((s) => s.agentId)).toEqual(['A', 'B', 'C'])
    expect(indexByNodeId.get('A')).toBe(0)
    expect(defEdges).toContainEqual({ from: 0, to: 1 })
    expect(defEdges).toContainEqual({ from: 1, to: 2 })
  })

  it('preserves the DAG through a Condition node (branch target is not a root)', () => {
    const branches: ConditionBranchSpec[] = [
      { id: 'b', label: 'Approved', kind: 'contains', pattern: 'approved' },
    ]
    const nodes = [agent('A'), condition('C', branches), agent('B')]
    const edges = [edge('A', 'C'), edge('C', 'B', 'b')]
    const { steps, edges: defEdges, indexByNodeId } = buildChainDefinition(nodes, edges)
    // B must come after A in topological order.
    expect(steps.map((s) => s.agentId)).toEqual(['A', 'B'])
    expect(defEdges).toContainEqual({
      from: indexByNodeId.get('A'),
      to: indexByNodeId.get('B'),
      condition: 'approved',
      group: 'C',
      order: 0,
    })
  })

  it('omits skipped agent nodes and edges referencing them', () => {
    const nodes = [agent('A'), agent('B', { skipped: true }), agent('C')]
    const edges = [edge('A', 'B'), edge('A', 'C')]
    const { steps, edges: defEdges, indexByNodeId } = buildChainDefinition(nodes, edges)
    expect(steps.map((s) => s.agentId).sort()).toEqual(['A', 'C'])
    expect(indexByNodeId.has('B')).toBe(false)
    // No edge should reference the dropped node.
    expect(defEdges).toContainEqual({ from: indexByNodeId.get('A'), to: indexByNodeId.get('C') })
    expect(defEdges).toHaveLength(1)
  })

  it('maps a diamond A→B,A→C,B→D,C→D to valid indices', () => {
    const nodes = [agent('A'), agent('B'), agent('C'), agent('D')]
    const edges = [edge('A', 'B'), edge('A', 'C'), edge('B', 'D'), edge('C', 'D')]
    const { steps, edges: defEdges } = buildChainDefinition(nodes, edges)
    expect(steps).toHaveLength(4)
    // Every edge endpoint is a valid step index.
    for (const e of defEdges) {
      expect(e.from).toBeGreaterThanOrEqual(0)
      expect(e.from).toBeLessThan(steps.length)
      expect(e.to).toBeGreaterThanOrEqual(0)
      expect(e.to).toBeLessThan(steps.length)
    }
    expect(defEdges).toHaveLength(4)
  })

  it('includes structurer + db-save as ordered non-agent steps with nodeType/config', () => {
    const nodes = [
      agent('A'),
      structurer('S', { format: 'json-array', extractionMode: 'ai', instructions: 'extract people' }),
      dbSave('D'),
    ]
    const edges = [edge('A', 'S'), edge('S', 'D')]
    const { steps, edges: defEdges, indexByNodeId } = buildChainDefinition(nodes, edges)

    // 3 ordered steps: agent → structurer → db-save.
    expect(steps.map((s) => s.agentId)).toEqual(['A', 'S', 'D'])
    expect(steps[0].nodeType).toBeUndefined()
    expect(steps[1].nodeType).toBe('structurer')
    expect(steps[2].nodeType).toBe('db-save')

    // Structurer config travels in nodeConfig (used by the executor).
    expect(steps[1].nodeConfig).toMatchObject({
      format: 'json-array',
      extractionMode: 'ai',
      instructions: 'extract people',
    })
    expect(steps[1].name).toBe('S')

    // 2 unconditional edges wiring the chain.
    expect(defEdges).toContainEqual({ from: indexByNodeId.get('A'), to: indexByNodeId.get('S') })
    expect(defEdges).toContainEqual({ from: indexByNodeId.get('S'), to: indexByNodeId.get('D') })
    expect(defEdges).toHaveLength(2)
  })

  it('includes an http-request node as a non-agent step with its request config', () => {
    const nodes = [
      agent('A'),
      httpRequest('H', {
        method: 'POST',
        url: 'https://api.example.com/{{input}}',
        headers: [{ key: 'Authorization', value: 'Bearer x' }],
        queryParams: [{ key: 'q', value: '{{input}}' }],
        body: '{"v":"{{input}}"}',
        bodyMode: 'json',
      }),
      agent('B'),
    ]
    const edges = [edge('A', 'H'), edge('H', 'B')]
    const { steps, edges: defEdges, indexByNodeId } = buildChainDefinition(nodes, edges)

    // 3 ordered steps: agent → http-request → agent.
    expect(steps.map((s) => s.agentId)).toEqual(['A', 'H', 'B'])
    expect(steps[0].nodeType).toBeUndefined()
    expect(steps[1].nodeType).toBe('http-request')
    expect(steps[2].nodeType).toBeUndefined()

    // Request config travels in nodeConfig (consumed by the executor).
    expect(steps[1].nodeConfig).toMatchObject({
      method: 'POST',
      url: 'https://api.example.com/{{input}}',
      headers: [{ key: 'Authorization', value: 'Bearer x' }],
      queryParams: [{ key: 'q', value: '{{input}}' }],
      body: '{"v":"{{input}}"}',
      bodyMode: 'json',
      timeoutSec: 30,
      responseMode: 'body',
    })
    expect(steps[1].name).toBe('H')

    expect(defEdges).toContainEqual({ from: indexByNodeId.get('A'), to: indexByNodeId.get('H') })
    expect(defEdges).toContainEqual({ from: indexByNodeId.get('H'), to: indexByNodeId.get('B') })
  })

  it('includes a duckduckgo-search node as a non-agent step with its search config', () => {
    const nodes = [
      agent('A'),
      duckduckgoSearch('D', {
        query: 'news about {{input}}',
        maxResults: 5,
        region: 'uk-en',
        safeSearch: 'strict',
        timeLimit: 'w',
        outputFormat: 'json',
      }),
      agent('B'),
    ]
    const edges = [edge('A', 'D'), edge('D', 'B')]
    const { steps, edges: defEdges, indexByNodeId } = buildChainDefinition(nodes, edges)

    // 3 ordered steps: agent → duckduckgo-search → agent.
    expect(steps.map((s) => s.agentId)).toEqual(['A', 'D', 'B'])
    expect(steps[1].nodeType).toBe('duckduckgo-search')

    // Search config travels in nodeConfig (consumed by the executor).
    expect(steps[1].nodeConfig).toMatchObject({
      query: 'news about {{input}}',
      maxResults: 5,
      region: 'uk-en',
      safeSearch: 'strict',
      timeLimit: 'w',
      outputFormat: 'json',
    })
    expect(steps[1].name).toBe('D')

    expect(defEdges).toContainEqual({ from: indexByNodeId.get('A'), to: indexByNodeId.get('D') })
    expect(defEdges).toContainEqual({ from: indexByNodeId.get('D'), to: indexByNodeId.get('B') })
  })

  it('includes a sakana-ai node as a non-agent step with its completion config', () => {
    const nodes = [
      agent('A'),
      sakanaAi('S', {
        model: 'sakana-mini',
        prompt: 'Summarize {{input}}',
        temperature: 0.3,
        maxTokens: 512,
        outputFormat: 'json',
      }),
      agent('B'),
    ]
    const edges = [edge('A', 'S'), edge('S', 'B')]
    const { steps, edges: defEdges, indexByNodeId } = buildChainDefinition(nodes, edges)

    expect(steps.map((s) => s.agentId)).toEqual(['A', 'S', 'B'])
    expect(steps[1].nodeType).toBe('sakana-ai')
    expect(steps[1].nodeConfig).toMatchObject({
      model: 'sakana-mini',
      prompt: 'Summarize {{input}}',
      temperature: 0.3,
      maxTokens: 512,
      outputFormat: 'json',
    })
    expect(defEdges).toContainEqual({ from: indexByNodeId.get('A'), to: indexByNodeId.get('S') })
    expect(defEdges).toContainEqual({ from: indexByNodeId.get('S'), to: indexByNodeId.get('B') })
  })
})
