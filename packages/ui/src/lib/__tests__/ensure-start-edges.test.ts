import { describe, it, expect } from 'vitest'
import type { Node, Edge } from '@xyflow/react'
import { ensureStartEdges, createStartNode, START_NODE_ID } from '../canvas-utils'

// Minimal node/edge factories — ensureStartEdges only reads id/type and the
// edge source/target plus data.edgeType, so we keep the shapes tiny.
function agent(id: string): Node {
  return { id, type: 'agent', position: { x: 0, y: 0 }, data: {} }
}
function flow(source: string, target: string): Edge {
  return { id: `${source}->${target}`, source, target, type: 'rondoflow', data: { edgeType: 'flow' } }
}
const startEdgesOf = (edges: readonly Edge[]) => edges.filter((e) => e.source === START_NODE_ID)

describe('ensureStartEdges', () => {
  it('connects Start to the single root of a linear template', () => {
    const nodes = [createStartNode(), agent('a'), agent('b'), agent('c')]
    const edges = [flow('a', 'b'), flow('b', 'c')]
    const result = ensureStartEdges(nodes, edges)
    const added = startEdgesOf(result)
    expect(added).toHaveLength(1)
    expect(added[0].target).toBe('a')
    // Original edges are preserved.
    expect(result).toHaveLength(3)
  })

  it('connects Start to every root when the template has multiple entry points', () => {
    const nodes = [createStartNode(), agent('a'), agent('b'), agent('c')]
    const edges = [flow('a', 'c'), flow('b', 'c')] // a and b are both roots
    const targets = startEdgesOf(ensureStartEdges(nodes, edges)).map((e) => e.target).sort()
    expect(targets).toEqual(['a', 'b'])
  })

  it('does not duplicate an existing Start edge', () => {
    const nodes = [createStartNode(), agent('a'), agent('b')]
    const edges = [flow(START_NODE_ID, 'a'), flow('a', 'b')]
    const result = ensureStartEdges(nodes, edges)
    expect(startEdgesOf(result)).toHaveLength(1)
    expect(result).toHaveLength(2) // unchanged
  })

  it('falls back to the first agent when the graph has no root (cycle)', () => {
    const nodes = [createStartNode(), agent('a'), agent('b')]
    const edges = [flow('a', 'b'), flow('b', 'a')]
    const added = startEdgesOf(ensureStartEdges(nodes, edges))
    expect(added).toHaveLength(1)
    expect(added[0].target).toBe('a')
  })

  it('returns edges unchanged when there are no agents', () => {
    const nodes = [createStartNode()]
    const edges: Edge[] = []
    expect(ensureStartEdges(nodes, edges)).toBe(edges)
  })
})
