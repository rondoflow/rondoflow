import type { Node, Edge } from '@xyflow/react'
import type { WorkflowOutputSpec, WorkflowEmailSpec, ConditionBranchSpec } from '@rondoflow/shared'
import type { AgentNodeData, OutputNodeData, EmailNodeData, ConditionNodeData, StructurerNodeData, DbSaveNodeData, HttpRequestNodeData, DuckDuckGoSearchNodeData, SakanaAiNodeData, ApifyActorNodeData } from '@/lib/canvas-utils'

// ─── Types ──────────────────────────────────────────────────────────────────

/** Step kinds that execute server-side as ChainSteps. Agent steps run a Claude
 *  agent; structurer/db-save/http-request/duckduckgo-search are non-agent steps
 *  dispatched in the executor. */
export type StepNodeType = 'agent' | 'structurer' | 'db-save' | 'http-request' | 'duckduckgo-search' | 'sakana-ai' | 'apify-actor'

export interface ChainStep {
  readonly nodeId: string
  readonly agentName: string
  readonly model?: string
  /** Step kind. Absent ⇒ 'agent'. */
  readonly nodeType?: StepNodeType
  /** Settings for non-agent steps (structurer/db-save node config). */
  readonly nodeConfig?: Record<string, unknown>
}

interface GraphNode {
  id: string
  deps: string[]
}

/**
 * A dependency between two agent nodes, with Condition nodes resolved away.
 * `from`/`to` are agent node ids. A logical edge produced by a Condition-node
 * branch carries the compiled `condition` regex plus a `group` (the condition
 * node id) and `order` (branch index) so the executor can route exclusively.
 */
export interface LogicalEdge {
  readonly from: string
  readonly to: string
  readonly condition?: string
  readonly group?: string
  readonly order?: number
}

/** Numeric chain definition + the maps needed to correlate it with the canvas. */
export interface ChainDefinitionResult {
  readonly steps: ReadonlyArray<{ readonly agentId: string; readonly nodeType?: StepNodeType; readonly name?: string; readonly nodeConfig?: Record<string, unknown> }>
  readonly edges: ReadonlyArray<{ readonly from: number; readonly to: number; readonly condition?: string; readonly group?: string; readonly order?: number }>
  readonly indexByNodeId: ReadonlyMap<string, number>
  readonly chain: ChainStep[]
}

// ─── Topological sort ───────────────────────────────────────────────────────

function topoSort(graphNodes: GraphNode[]): string[] | null {
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

// ─── Condition-node resolution ───────────────────────────────────────────────

/** Escape regex metacharacters so a literal keyword can be used as a pattern. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Compile a "contains" pattern: split on `|`/`,` into keywords, escape each, and
 * OR them together. So `approved|lgtm` matches a verdict containing either word,
 * while regex metacharacters inside a keyword are treated literally.
 */
function compileContains(pattern: string): string | undefined {
  const tokens = pattern.split(/[|,]/).map((t) => t.trim()).filter(Boolean)
  if (tokens.length === 0) return undefined
  const escaped = tokens.map(escapeRegex)
  return escaped.length === 1 ? escaped[0]! : `(?:${escaped.join('|')})`
}

/** The runtime regex source for a branch, or undefined for the else/empty branch. */
function compileBranchCondition(branch: ConditionBranchSpec): string | undefined {
  if (branch.isElse) return undefined
  const pattern = branch.pattern.trim()
  if (!pattern) return undefined
  return branch.kind === 'regex' ? pattern : compileContains(pattern)
}

/** Node ids that execute as ChainSteps: non-skipped agents + structurer/db-save/http-request/duckduckgo-search. */
function executableNodeIds(nodes: readonly Node[]): Set<string> {
  return new Set(
    nodes
      .filter(
        (n) =>
          (n.type === 'agent' && !(n.data as AgentNodeData).skipped) ||
          n.type === 'structurer' ||
          n.type === 'db-save' ||
          n.type === 'http-request' ||
          n.type === 'duckduckgo-search' ||
          n.type === 'sakana-ai' ||
          n.type === 'apify-actor',
      )
      .map((n) => n.id),
  )
}

/**
 * Flatten the canvas into step→step dependencies, resolving Condition nodes:
 * `agentA → [condition] → agentB` becomes a logical edge `A → B` carrying the
 * branch's compiled condition, the condition-node id (group) and branch order.
 * Plain edges between executable steps (agent→agent, agent→structurer,
 * structurer→db-save, agent↔http-request, agent↔duckduckgo-search,
 * agent↔sakana-ai) become
 * unconditional logical edges.
 * Edges touching non-executable / non-condition nodes (skill, policy, mcp,
 * output, email) are ignored.
 */
export function resolveLogicalEdges(nodes: readonly Node[], edges: readonly Edge[]): LogicalEdge[] {
  const agentIds = new Set(
    nodes.filter((n) => n.type === 'agent' && !(n.data as AgentNodeData).skipped).map((n) => n.id),
  )
  const execIds = executableNodeIds(nodes)
  const conditionData = new Map<string, ConditionNodeData>()
  for (const n of nodes) {
    if (n.type === 'condition') conditionData.set(n.id, n.data as ConditionNodeData)
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
      if (!inputAgent) continue // condition node has no upstream agent to gate on
      const branches = conditionData.get(e.source)!.branches
      const branchIndex = branches.findIndex((b) => b.id === e.sourceHandle)
      if (branchIndex < 0) continue // edge not tied to a known branch handle
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

// ─── Exports ────────────────────────────────────────────────────────────────

/** Executable-step dependency lists (Condition nodes resolved), for topo sorting.
 *  Includes non-skipped agents plus structurer/db-save nodes. */
function agentGraph(nodes: readonly Node[], edges: readonly Edge[]): { execNodes: Node[]; graphNodes: GraphNode[] } {
  const execIds = executableNodeIds(nodes)
  const execNodes = nodes.filter((n) => execIds.has(n.id))
  const logical = resolveLogicalEdges(nodes, edges)
  const graphNodes: GraphNode[] = execNodes.map((n) => ({
    id: n.id,
    deps: [...new Set(logical.filter((le) => le.to === n.id).map((le) => le.from))],
  }))
  return { execNodes, graphNodes }
}

/** Returns true if the agent graph (Condition nodes resolved) has a cycle */
export function hasCycle(nodes: readonly Node[], edges: readonly Edge[]): boolean {
  return topoSort(agentGraph(nodes, edges).graphNodes) === null
}

/** Settings carried to the server for a Structurer step. */
function structurerConfig(d: StructurerNodeData): Record<string, unknown> {
  return {
    name: d.name,
    format: d.format,
    schema: d.schema,
    extractionMode: d.extractionMode,
    ...(d.instructions ? { instructions: d.instructions } : {}),
    ...(d.model ? { model: d.model } : {}),
  }
}

/** Settings carried to the server for an HTTP Request step. */
function httpRequestConfig(d: HttpRequestNodeData): Record<string, unknown> {
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

/** Settings carried to the server for a DuckDuckGo Search step. */
function duckduckgoSearchConfig(d: DuckDuckGoSearchNodeData): Record<string, unknown> {
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

/** Settings carried to the server for a Sakana AI step. */
function sakanaAiConfig(d: SakanaAiNodeData): Record<string, unknown> {
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

/** Settings carried to the server for an Apify Actor step. */
function apifyActorConfig(d: ApifyActorNodeData): Record<string, unknown> {
  return {
    name: d.name,
    actorId: d.actorId,
    input: d.input ?? '',
    timeoutSec: d.timeoutSec,
    maxItems: d.maxItems,
    outputFormat: d.outputFormat,
  }
}

/** Builds an ordered chain of executable steps (agents + structurer/db-save). */
export function buildChain(nodes: readonly Node[], edges: readonly Edge[]): ChainStep[] {
  const { execNodes, graphNodes } = agentGraph(nodes, edges)
  const order = topoSort(graphNodes)
  const ids = order ?? execNodes.map((n) => n.id)
  return ids.map((id) => {
    const node = execNodes.find((n) => n.id === id)!
    if (node.type === 'structurer') {
      const d = node.data as StructurerNodeData
      return { nodeId: id, agentName: d.name, nodeType: 'structurer', nodeConfig: structurerConfig(d) }
    }
    if (node.type === 'db-save') {
      const d = node.data as DbSaveNodeData
      return { nodeId: id, agentName: d.name, nodeType: 'db-save', nodeConfig: { name: d.name, ...(d.label ? { label: d.label } : {}) } }
    }
    if (node.type === 'http-request') {
      const d = node.data as HttpRequestNodeData
      return { nodeId: id, agentName: d.name, nodeType: 'http-request', nodeConfig: httpRequestConfig(d) }
    }
    if (node.type === 'duckduckgo-search') {
      const d = node.data as DuckDuckGoSearchNodeData
      return { nodeId: id, agentName: d.name, nodeType: 'duckduckgo-search', nodeConfig: duckduckgoSearchConfig(d) }
    }
    if (node.type === 'sakana-ai') {
      const d = node.data as SakanaAiNodeData
      return { nodeId: id, agentName: d.name, nodeType: 'sakana-ai', nodeConfig: sakanaAiConfig(d) }
    }
    if (node.type === 'apify-actor') {
      const d = node.data as ApifyActorNodeData
      return { nodeId: id, agentName: d.name, nodeType: 'apify-actor', nodeConfig: apifyActorConfig(d) }
    }
    const data = node.data as AgentNodeData
    return { nodeId: id, agentName: data.name, model: data.model, nodeType: 'agent' }
  })
}

/**
 * Builds the numeric chain definition sent to the server: agent steps in
 * topological order plus the real edges (branching preserved, Condition nodes
 * compiled into grouped conditional edges). Replaces the old linearised payload.
 */
export function buildChainDefinition(nodes: readonly Node[], edges: readonly Edge[]): ChainDefinitionResult {
  const chain = buildChain(nodes, edges)
  const indexByNodeId = new Map<string, number>()
  chain.forEach((s, i) => indexByNodeId.set(s.nodeId, i))

  const steps = chain.map((s) => ({
    agentId: s.nodeId,
    ...(s.nodeType && s.nodeType !== 'agent'
      ? { nodeType: s.nodeType, name: s.agentName, nodeConfig: s.nodeConfig }
      : {}),
  }))
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

  return { steps, edges: defEdges, indexByNodeId, chain }
}

/** Returns true if there is at least 1 non-skipped agent node on the canvas */
export function hasAgentChain(nodes: readonly Node[]): boolean {
  return nodes.some((n) => n.type === 'agent' && !(n.data as AgentNodeData).skipped)
}

/**
 * Non-blocking author-time checks for Condition-node workflows. Returns
 * human-readable warnings to surface before a run (dangling conditions, missing
 * default branch, empty patterns). Both execution modes honour branches now:
 * the DAG path runs them in parallel; Director mode walks them sequentially.
 */
export function lintConditionWorkflow(
  nodes: readonly Node[],
  edges: readonly Edge[],
): string[] {
  const conditionNodes = nodes.filter((n) => n.type === 'condition')
  if (conditionNodes.length === 0) return []

  const warnings: string[] = []

  const agentIds = new Set(
    nodes.filter((n) => n.type === 'agent' && !(n.data as AgentNodeData).skipped).map((n) => n.id),
  )
  for (const c of conditionNodes) {
    const data = c.data as ConditionNodeData
    const name = data.name || 'Condition'
    const agentInputs = edges.filter((e) => e.target === c.id && agentIds.has(e.source))
    if (agentInputs.length === 0) {
      warnings.push(`Condition “${name}” has no assistant feeding into it — its branches won’t run.`)
    } else if (agentInputs.length > 1) {
      warnings.push(`Condition “${name}” has ${agentInputs.length} assistants feeding in — only the first is used.`)
    }
    const branches = data.branches ?? []
    for (const b of branches) {
      if (!b.isElse && !b.pattern.trim()) {
        warnings.push(`Condition “${name}” branch “${b.label || 'unnamed'}” has no pattern — it will never match.`)
      }
    }
    if (branches.length > 0 && !branches.some((b) => b.isElse)) {
      warnings.push(`Condition “${name}” has no default branch — if nothing matches, the flow stops on that path.`)
    }
  }
  return warnings
}

/**
 * Resolve canvas Output node(s) into name-based specs persisted in a saved
 * workflow, so the scheduler can honour them for headless/cron runs. Agent node
 * ids are mapped to agent NAMES (the only identity the scheduler shares); ids
 * with no matching agent are dropped.
 */
export function buildWorkflowOutputs(nodes: readonly Node[]): WorkflowOutputSpec[] {
  const agentNameById = new Map<string, string>()
  for (const n of nodes) {
    if (n.type === 'agent') agentNameById.set(n.id, (n.data as AgentNodeData).name)
  }

  return nodes
    .filter((n) => n.type === 'output')
    .map((n) => {
      const data = n.data as OutputNodeData
      const agentSelection: 'all' | string[] =
        data.agentSelection === 'all'
          ? 'all'
          : data.agentSelection
              .map((id) => agentNameById.get(id))
              .filter((name): name is string => Boolean(name))
      return {
        agentSelection,
        format: data.format,
        ...(data.destinationDir ? { destinationDir: data.destinationDir } : {}),
        ...(data.title ? { title: data.title } : {}),
      } satisfies WorkflowOutputSpec
    })
}

/**
 * Resolve canvas Email node(s) into name-based specs persisted in a saved
 * workflow, so the scheduler can send the report on headless/cron runs. Only
 * ENABLED nodes are included (a disabled node never sends, interactive or cron).
 * Agent node ids are mapped to agent NAMES; ids with no matching agent are dropped.
 */
export function buildWorkflowEmails(nodes: readonly Node[]): WorkflowEmailSpec[] {
  const agentNameById = new Map<string, string>()
  for (const n of nodes) {
    if (n.type === 'agent') agentNameById.set(n.id, (n.data as AgentNodeData).name)
  }

  return nodes
    .filter((n) => n.type === 'email' && (n.data as EmailNodeData).enabled)
    .map((n) => {
      const data = n.data as EmailNodeData
      const agentSelection: 'all' | string[] =
        data.agentSelection === 'all'
          ? 'all'
          : data.agentSelection
              .map((id) => agentNameById.get(id))
              .filter((name): name is string => Boolean(name))
      return {
        agentSelection,
        recipients: data.recipients,
        ...(data.subject ? { subject: data.subject } : {}),
        ...(data.title ? { title: data.title } : {}),
      } satisfies WorkflowEmailSpec
    })
}
