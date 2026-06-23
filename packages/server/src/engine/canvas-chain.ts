// Server-side port of the canvas → ChainDefinition logic in
// packages/ui/src/lib/chain-utils.ts. It operates on the plain JSON nodes/edges
// persisted in CanvasLayout, so the scheduler can run a workspace's canvas
// headlessly (no React Flow types, no browser). Keep the graph/condition rules
// in sync with chain-utils.ts.

import type { ChainDefinition, ChainStep } from './chain-executor'
import type {
  WorkflowOutputSpec,
  WorkflowEmailSpec,
  ConditionBranchSpec,
} from '@rondoflow/shared'

// ─── Minimal structural node/edge shapes (subset of React Flow's) ─────────────

interface CanvasNode {
  readonly id: string
  readonly type?: string
  readonly data?: Record<string, unknown>
}

interface CanvasEdge {
  readonly source: string
  readonly target: string
  readonly sourceHandle?: string | null
}

interface GraphNode {
  readonly id: string
  readonly deps: readonly string[]
}

interface LogicalEdge {
  readonly from: string
  readonly to: string
  readonly condition?: string
  readonly group?: string
  readonly order?: number
}

/** Result of compiling a workspace canvas for a headless chain run. */
export interface CanvasChain {
  readonly definition: ChainDefinition
  /** Display name per step index — used to honour Output/Email node specs. */
  readonly nameByIndex: readonly string[]
  readonly outputs: readonly WorkflowOutputSpec[]
  readonly emails: readonly WorkflowEmailSpec[]
}

// ─── Topological sort ─────────────────────────────────────────────────────────

function topoSort(graphNodes: readonly GraphNode[]): string[] | null {
  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()

  for (const n of graphNodes) {
    if (!inDegree.has(n.id)) inDegree.set(n.id, 0)
    if (!adj.has(n.id)) adj.set(n.id, [])
  }

  for (const n of graphNodes) {
    for (const dep of n.deps) {
      adj.set(dep, [...(adj.get(dep) ?? []), n.id])
      inDegree.set(n.id, (inDegree.get(n.id) ?? 0) + 1)
    }
  }

  const queue: string[] = []
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id)
  })

  const sorted: string[] = []
  while (queue.length > 0) {
    const node = queue.shift()!
    sorted.push(node)
    for (const neighbour of adj.get(node) ?? []) {
      const deg = (inDegree.get(neighbour) ?? 1) - 1
      inDegree.set(neighbour, deg)
      if (deg === 0) queue.push(neighbour)
    }
  }

  if (sorted.length !== graphNodes.length) return null
  return sorted
}

// ─── Condition-node resolution ────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function compileContains(pattern: string): string | undefined {
  const tokens = pattern.split(/[|,]/).map((t) => t.trim()).filter(Boolean)
  if (tokens.length === 0) return undefined
  const escaped = tokens.map(escapeRegex)
  return escaped.length === 1 ? escaped[0]! : `(?:${escaped.join('|')})`
}

function compileBranchCondition(branch: ConditionBranchSpec): string | undefined {
  if (branch.isElse) return undefined
  const pattern = branch.pattern.trim()
  if (!pattern) return undefined
  return branch.kind === 'regex' ? pattern : compileContains(pattern)
}

// ─── Graph helpers ──────────────────────────────────────────────────────────

function isAgent(n: CanvasNode): boolean {
  return n.type === 'agent' && !(n.data?.skipped === true)
}

/** Node ids that execute as ChainSteps: non-skipped agents + transform nodes. */
function executableNodeIds(nodes: readonly CanvasNode[]): Set<string> {
  return new Set(
    nodes
      .filter(
        (n) =>
          isAgent(n) ||
          n.type === 'structurer' ||
          n.type === 'db-save' ||
          n.type === 'http-request' ||
          n.type === 'duckduckgo-search' ||
          n.type === 'sakana-ai',
      )
      .map((n) => n.id),
  )
}

function resolveLogicalEdges(
  nodes: readonly CanvasNode[],
  edges: readonly CanvasEdge[],
): LogicalEdge[] {
  const agentIds = new Set(nodes.filter(isAgent).map((n) => n.id))
  const execIds = executableNodeIds(nodes)
  const conditionData = new Map<string, { branches: ConditionBranchSpec[] }>()
  for (const n of nodes) {
    if (n.type === 'condition') {
      conditionData.set(n.id, {
        branches: (n.data?.branches as ConditionBranchSpec[]) ?? [],
      })
    }
  }

  // Each Condition node gates on exactly one upstream agent (its first agent input).
  const inputAgentByCondition = new Map<string, string>()
  for (const e of edges) {
    if (conditionData.has(e.target) && agentIds.has(e.source) && !inputAgentByCondition.has(e.target)) {
      inputAgentByCondition.set(e.target, e.source)
    }
  }

  const logical: LogicalEdge[] = []
  for (const e of edges) {
    if (execIds.has(e.source) && execIds.has(e.target)) {
      logical.push({ from: e.source, to: e.target })
      continue
    }
    if (conditionData.has(e.source) && agentIds.has(e.target)) {
      const inputAgent = inputAgentByCondition.get(e.source)
      if (!inputAgent) continue
      const branches = conditionData.get(e.source)!.branches
      const branchIndex = branches.findIndex((b) => b.id === e.sourceHandle)
      if (branchIndex < 0) continue
      logical.push({
        from: inputAgent,
        to: e.target,
        group: e.source,
        order: branchIndex,
        condition: compileBranchCondition(branches[branchIndex]!),
      })
    }
  }
  return logical
}

function agentGraph(
  nodes: readonly CanvasNode[],
  edges: readonly CanvasEdge[],
): { execNodes: CanvasNode[]; graphNodes: GraphNode[] } {
  const execIds = executableNodeIds(nodes)
  const execNodes = nodes.filter((n) => execIds.has(n.id))
  const logical = resolveLogicalEdges(nodes, edges)
  const graphNodes: GraphNode[] = execNodes.map((n) => ({
    id: n.id,
    deps: [...new Set(logical.filter((le) => le.to === n.id).map((le) => le.from))],
  }))
  return { execNodes, graphNodes }
}

function structurerConfig(d: Record<string, unknown>): Record<string, unknown> {
  return {
    name: d.name,
    format: d.format,
    schema: d.schema,
    extractionMode: d.extractionMode,
    ...(d.instructions ? { instructions: d.instructions } : {}),
    ...(d.model ? { model: d.model } : {}),
  }
}

function httpRequestConfig(d: Record<string, unknown>): Record<string, unknown> {
  return {
    name: d.name,
    method: d.method,
    url: d.url,
    headers: d.headers ?? [],
    queryParams: d.queryParams ?? [],
    bodyMode: d.bodyMode,
    timeoutSec: d.timeoutSec,
    responseMode: d.responseMode,
    ...(d.body ? { body: d.body } : {}),
  }
}

function duckduckgoSearchConfig(d: Record<string, unknown>): Record<string, unknown> {
  return {
    name: d.name,
    query: d.query,
    maxResults: d.maxResults,
    region: d.region,
    safeSearch: d.safeSearch,
    timeLimit: d.timeLimit,
    outputFormat: d.outputFormat,
  }
}

function sakanaAiConfig(d: Record<string, unknown>): Record<string, unknown> {
  return {
    name: d.name,
    apiUrl: d.apiUrl,
    model: d.model,
    prompt: d.prompt,
    temperature: d.temperature,
    maxTokens: d.maxTokens,
    outputFormat: d.outputFormat,
    ...(d.systemPrompt ? { systemPrompt: d.systemPrompt } : {}),
  }
}

interface BuiltStep {
  readonly nodeId: string
  readonly name: string
  readonly step: ChainStep
}

function buildSteps(
  nodes: readonly CanvasNode[],
  edges: readonly CanvasEdge[],
): BuiltStep[] {
  const { execNodes, graphNodes } = agentGraph(nodes, edges)
  const order = topoSort(graphNodes)
  const ids = order ?? execNodes.map((n) => n.id)
  return ids.map((id) => {
    const node = execNodes.find((n) => n.id === id)!
    const d = node.data ?? {}
    const name = (d.name as string) ?? id
    if (node.type === 'structurer') {
      return { nodeId: id, name, step: { agentId: id, nodeType: 'structurer', name, nodeConfig: structurerConfig(d) } }
    }
    if (node.type === 'db-save') {
      return {
        nodeId: id,
        name,
        step: { agentId: id, nodeType: 'db-save', name, nodeConfig: { name, ...(d.label ? { label: d.label } : {}) } },
      }
    }
    if (node.type === 'http-request') {
      return { nodeId: id, name, step: { agentId: id, nodeType: 'http-request', name, nodeConfig: httpRequestConfig(d) } }
    }
    if (node.type === 'duckduckgo-search') {
      return { nodeId: id, name, step: { agentId: id, nodeType: 'duckduckgo-search', name, nodeConfig: duckduckgoSearchConfig(d) } }
    }
    if (node.type === 'sakana-ai') {
      return { nodeId: id, name, step: { agentId: id, nodeType: 'sakana-ai', name, nodeConfig: sakanaAiConfig(d) } }
    }
    return { nodeId: id, name, step: { agentId: id } }
  })
}

// ─── Output / Email node specs (name-based, for headless runs) ────────────────

function agentNameById(nodes: readonly CanvasNode[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const n of nodes) {
    if (n.type === 'agent') map.set(n.id, (n.data?.name as string) ?? n.id)
  }
  return map
}

function resolveSelection(
  selection: unknown,
  names: Map<string, string>,
): 'all' | string[] {
  if (selection === 'all') return 'all'
  if (!Array.isArray(selection)) return []
  return selection
    .map((id) => names.get(id as string))
    .filter((name): name is string => Boolean(name))
}

function buildOutputs(nodes: readonly CanvasNode[]): WorkflowOutputSpec[] {
  const names = agentNameById(nodes)
  return nodes
    .filter((n) => n.type === 'output')
    .map((n) => {
      const d = n.data ?? {}
      return {
        agentSelection: resolveSelection(d.agentSelection, names),
        format: d.format,
        ...(d.destinationDir ? { destinationDir: d.destinationDir } : {}),
        ...(d.title ? { title: d.title } : {}),
      } as WorkflowOutputSpec
    })
}

function buildEmails(nodes: readonly CanvasNode[]): WorkflowEmailSpec[] {
  const names = agentNameById(nodes)
  return nodes
    .filter((n) => n.type === 'email' && n.data?.enabled === true)
    .map((n) => {
      const d = n.data ?? {}
      return {
        agentSelection: resolveSelection(d.agentSelection, names),
        recipients: d.recipients,
        ...(d.subject ? { subject: d.subject } : {}),
        ...(d.title ? { title: d.title } : {}),
      } as WorkflowEmailSpec
    })
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** True if the canvas has at least one runnable (non-skipped) agent node. */
export function hasRunnableAgent(nodes: readonly CanvasNode[]): boolean {
  return nodes.some(isAgent)
}

/**
 * Compile a workspace's stored canvas (nodes/edges JSON) into a ChainDefinition
 * plus the Output/Email specs to honour after the run. Agent steps in
 * topological order; Condition nodes compiled into grouped conditional edges.
 */
export function buildCanvasChain(
  rawNodes: unknown,
  rawEdges: unknown,
): CanvasChain {
  const nodes = (Array.isArray(rawNodes) ? rawNodes : []) as CanvasNode[]
  const edges = (Array.isArray(rawEdges) ? rawEdges : []) as CanvasEdge[]

  const built = buildSteps(nodes, edges)
  const indexByNodeId = new Map<string, number>()
  built.forEach((b, i) => indexByNodeId.set(b.nodeId, i))

  const defEdges = resolveLogicalEdges(nodes, edges)
    .map((le) => {
      const from = indexByNodeId.get(le.from)
      const to = indexByNodeId.get(le.to)
      if (from === undefined || to === undefined) return null
      return {
        from,
        to,
        ...(le.condition ? { condition: le.condition } : {}),
        ...(le.group !== undefined ? { group: le.group, order: le.order } : {}),
      }
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)

  return {
    definition: { steps: built.map((b) => b.step), edges: defEdges },
    nameByIndex: built.map((b) => b.name),
    outputs: buildOutputs(nodes),
    emails: buildEmails(nodes),
  }
}
