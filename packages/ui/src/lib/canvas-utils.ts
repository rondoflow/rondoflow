'use client'

import type { Node, Edge, XYPosition } from '@xyflow/react'
import type { AgentStatus, AgentMode, AgentProviderId, OpenAIProviderConfig, OutputFormat, ConditionBranchSpec, ColumnSpec, StructuredFormat } from '@rondoflow/shared'

// ─── Node data types ───────────────────────────────────────────────────────
// React Flow v12 requires data to extend Record<string, unknown>

export type ChainNodeState = 'pending' | 'active' | 'completed' | 'error' | 'skipped' | undefined

/** Fixed id of the canvas Start node — one per canvas, non-deletable. */
export const START_NODE_ID = '__start__'

/** Connection-test status shown on the Start node. */
export type StartConnectionStatus = 'idle' | 'testing' | 'success' | 'error'

export interface StartNodeData extends Record<string, unknown> {
  /** Result of the most recent Claude API connection test. */
  status?: StartConnectionStatus
  /** Human-readable summary of the last test (success or failure). */
  message?: string
  /** ISO timestamp of the last test. */
  testedAt?: string
}

/** A single labelled outgoing branch row rendered at the bottom of a node card. */
export interface NodeBranch {
  id: string
  label: string
}

export interface AgentNodeData extends Record<string, unknown> {
  name: string
  description?: string
  /** Rich message body shown in the card; supports `{{variable}}` tokens.
   *  Falls back to `description` when omitted. */
  message?: string
  avatar?: string
  status: AgentStatus
  model?: string
  purpose?: string
  permissionMode?: AgentMode
  /** Which backend runs this agent. Undefined ⇒ treated as 'claude-code'. */
  provider?: AgentProviderId
  /** OpenAI-specific config (model + tool toggles); only set when provider is 'openai'. */
  providerConfig?: OpenAIProviderConfig | null
  /** Visual state during chain execution */
  chainState?: ChainNodeState
  /** When true this step is excluded from workflow execution */
  skipped?: boolean
  /** Whether this agent has an active scheduled task */
  hasSchedule?: boolean
  /** Labelled outgoing branches (e.g. conditions); each gets its own handle. */
  branches?: ReadonlyArray<NodeBranch>
}

export interface SkillNodeData extends Record<string, unknown> {
  name: string
  icon?: string
  category?: string
  /** DB id of the installed skill assigned to this node, if any. */
  skillId?: string
}

export interface PolicyNodeData extends Record<string, unknown> {
  name: string
  level: 'global' | 'agent' | 'session'
}

export interface StickyNoteNodeData extends Record<string, unknown> {
  text?: string
  color?: string
}

export interface ResourceNodeData extends Record<string, unknown> {
  label?: string
  fileCount?: number
  linkCount?: number
  noteCount?: number
  variableCount?: number
}

export interface OutputNodeData extends Record<string, unknown> {
  name: string
  /** 'all' = every agent in the run; otherwise an explicit list of agent NODE ids. */
  agentSelection: 'all' | readonly string[]
  /** Output document format. */
  format: OutputFormat
  /** Destination directory; falls back to the workspace working dir at save time. */
  destinationDir?: string
  /** Optional document title used in formatted markdown/html headers. */
  title?: string
  /** Filename this node wrote on its most recent run (set by processOutputNodes). */
  savedOutputName?: string
  /** Directory the saved file was written to — needed to re-open it. */
  savedOutputDir?: string
}

export interface EmailNodeData extends Record<string, unknown> {
  name: string
  /** Opt-in send toggle. OFF by default so building a workflow never emails. */
  enabled: boolean
  /** 'all' = every agent in the run; otherwise explicit agent NODE ids (connection-driven). */
  agentSelection: 'all' | readonly string[]
  /** Comma-separated recipient emails the user types (parsed/validated at send time). */
  recipients: string
  /** Custom email subject; falls back to a default when blank. */
  subject?: string
  /** Optional title used in the HTML document header. */
  title?: string
  /** Status of the most recent send attempt (display-only; mirrors savedOutputName). */
  lastSentStatus?: 'sent' | 'error'
  /** Human-readable detail of the last send (recipients reached, or the error). */
  lastSentDetail?: string
  /** ISO timestamp of the last send attempt. */
  lastSentAt?: string
}

/**
 * A Condition node routes an upstream agent to one of several downstream agents
 * based on the agent's output. Each branch is a labelled source handle (its
 * `id` is the React Flow `sourceHandle` of the outgoing edge). The node spawns
 * no agent — it is compiled into grouped conditional edges before a run.
 */
export interface ConditionNodeData extends Record<string, unknown> {
  name: string
  branches: ReadonlyArray<ConditionBranchSpec>
  /** Visual state during chain execution (mirrors agent nodes). */
  chainState?: ChainNodeState
}

/**
 * A Structurer node converts the output of its upstream agent(s) into a
 * StructuredDataset (schema + rows). It is a real execution step on the server:
 * `'parse'` mode deterministically extracts JSON/markdown-table content; `'ai'`
 * mode runs a bounded Claude extraction pass. Its single output feeds a
 * Save-to-DB node.
 */
export interface StructurerNodeData extends Record<string, unknown> {
  name: string
  /** 'all' = every agent in the run; otherwise agent NODE ids (connection-driven). */
  agentSelection: 'all' | readonly string[]
  /** Target shape: single object, array of rows, or a table. */
  format: StructuredFormat
  /** Declared columns/fields; empty = infer / free-form. */
  schema: readonly ColumnSpec[]
  /** 'parse' = deterministic; 'ai' = Claude extraction pass. */
  extractionMode: 'parse' | 'ai'
  /** Extra prompt guidance, used only in AI mode. */
  instructions?: string
  /** Model id for the AI extraction pass. */
  model?: string
  /** Visual state during chain execution (mirrors agent nodes). */
  chainState?: ChainNodeState
  /** Row count of the most recent run (display-only; mirrors savedOutputName). */
  lastRowCount?: number
  /** Error from the most recent run, if any. */
  lastError?: string
}

/**
 * A Save-to-DB node persists the upstream Structurer's dataset to the database.
 * It is a pure sink: only a Structurer feeds in, and it never originates an edge.
 */
export interface DbSaveNodeData extends Record<string, unknown> {
  name: string
  /** Optional dataset label override (falls back to the dataset/name). */
  label?: string
  /** Visual state during chain execution (mirrors agent nodes). */
  chainState?: ChainNodeState
  /** Id of the dataset saved on the most recent run (display-only). */
  savedDatasetId?: string
  /** Row count saved on the most recent run. */
  savedRowCount?: number
}

/**
 * An HTTP Request node performs an external HTTP call mid-workflow. It is a real
 * execution step on the server (like the Structurer): it takes its upstream
 * step(s)' output as input, interpolates `{{input}}`/`{{output}}` tokens into the
 * URL / query params / headers / body, issues the request, and emits the response
 * body downstream. A non-2xx / network / timeout failure errors the node and
 * skips its dependents. Input is purely edge-driven (no `agentSelection`).
 */
/** One header / query-param row. Stored as an ordered list (not a Record) so the
 *  drawer's row editor is stable while typing (empty/duplicate keys never collapse). */
export interface HttpKeyValue {
  key: string
  value: string
}

export interface HttpRequestNodeData extends Record<string, unknown> {
  name: string
  /** HTTP verb. Mirrors FlowHunt (GET/POST/PUT/PATCH) plus DELETE. */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Target URL; supports `{{input}}` tokens from the upstream output. */
  url: string
  /** Custom request headers (ordered); values support `{{input}}` tokens. */
  headers: readonly HttpKeyValue[]
  /** Key-value pairs appended to the URL as the query string (ordered); support tokens. */
  queryParams: readonly HttpKeyValue[]
  /** Request body for POST/PUT/PATCH; supports `{{input}}` tokens. */
  body?: string
  /** How the body is encoded: JSON, x-www-form-urlencoded, or sent verbatim. */
  bodyMode: 'json' | 'form' | 'raw'
  /** Seconds before the request is aborted. */
  timeoutSec: number
  /** 'body' = response body flows downstream; 'full' = a JSON {status,headers,body} envelope. */
  responseMode: 'body' | 'full'
  /** Visual state during chain execution (mirrors agent nodes). */
  chainState?: ChainNodeState
  /** HTTP status of the most recent run (display-only). */
  lastStatus?: number
  /** Error from the most recent run, if any. */
  lastError?: string
  /** ISO timestamp of the last request. */
  lastRequestAt?: string
}

/**
 * A DuckDuckGo Search node runs a live web search mid-workflow. Like the HTTP
 * Request node it is a real, non-agent execution step on the server: it takes its
 * upstream step(s)' output as input, interpolates `{{input}}`/`{{output}}` tokens
 * into the query, hits DuckDuckGo, and emits the results (as readable text or JSON
 * records) downstream. A network / parse failure errors the node and skips its
 * dependents. Input is purely edge-driven (no `agentSelection`).
 */
export interface DuckDuckGoSearchNodeData extends Record<string, unknown> {
  name: string
  /** Search query; supports `{{input}}` tokens from the upstream output. */
  query: string
  /** Maximum number of results to return. Mirrors FlowHunt's Max Results. */
  maxResults: number
  /** Region/locale, e.g. "us-en", "uk-en". Empty ⇒ default region. */
  region: string
  /** SafeSearch filter level. */
  safeSearch: 'strict' | 'moderate' | 'off'
  /** Recency filter: day / week / month / year, or '' for any time. */
  timeLimit: '' | 'd' | 'w' | 'm' | 'y'
  /** Downstream shape: a readable numbered list, or a JSON array of records. */
  outputFormat: 'text' | 'json'
  /** Visual state during chain execution (mirrors agent nodes). */
  chainState?: ChainNodeState
  /** Result count of the most recent run (display-only). */
  lastResultCount?: number
  /** Error from the most recent run, if any. */
  lastError?: string
  /** ISO timestamp of the last search. */
  lastSearchAt?: string
}

/**
 * A Sakana AI node performs a chat-completions call against Sakana AI mid-workflow.
 * It is a non-agent execution step: it interpolates `{{input}}`/`{{output}}` into
 * the user prompt, sends the request with the server-side `SAKANA_API_KEY`, then
 * emits either the model text or the raw JSON response downstream.
 */
export interface SakanaAiNodeData extends Record<string, unknown> {
  name: string
  /** API endpoint. Defaults to Sakana AI's chat-completions URL. */
  apiUrl: string
  /** Model id to run. */
  model: string
  /** System prompt prepended to the request, optional. */
  systemPrompt?: string
  /** User prompt; supports `{{input}}` tokens. */
  prompt: string
  /** Sampling temperature. */
  temperature: number
  /** Max completion tokens. */
  maxTokens: number
  /** Downstream shape: extracted text, or full JSON response. */
  outputFormat: 'text' | 'json'
  /** Visual state during chain execution (mirrors agent nodes). */
  chainState?: ChainNodeState
  /** Error from the most recent run, if any. */
  lastError?: string
  /** ISO timestamp of the most recent request. */
  lastRequestAt?: string
}

/** Curated Sakana AI model presets shown in the node drawer. */
export const SAKANA_AI_MODEL_PRESETS: readonly string[] = ['sakana-chat', 'sakana-mini']

// ─── Typed node aliases ────────────────────────────────────────────────────

export type AgentFlowNode = Node<AgentNodeData, 'agent'>
export type SkillFlowNode = Node<SkillNodeData, 'skill'>
export type PolicyFlowNode = Node<PolicyNodeData, 'policy'>
export type StickyNoteFlowNode = Node<StickyNoteNodeData, 'note'>
export type ResourceFlowNode = Node<ResourceNodeData, 'resource'>
export type OutputFlowNode = Node<OutputNodeData, 'output'>
export type EmailFlowNode = Node<EmailNodeData, 'email'>
export type ConditionFlowNode = Node<ConditionNodeData, 'condition'>
export type StructurerFlowNode = Node<StructurerNodeData, 'structurer'>
export type DbSaveFlowNode = Node<DbSaveNodeData, 'db-save'>
export type HttpRequestFlowNode = Node<HttpRequestNodeData, 'http-request'>
export type DuckDuckGoSearchFlowNode = Node<DuckDuckGoSearchNodeData, 'duckduckgo-search'>
export type SakanaAiFlowNode = Node<SakanaAiNodeData, 'sakana-ai'>
export type StartFlowNode = Node<StartNodeData, 'start'>

/** Default branch set seeded when a Condition node is dropped onto the canvas. */
export function defaultConditionBranches(): ConditionBranchSpec[] {
  return [
    { id: crypto.randomUUID(), label: 'Approved', kind: 'contains', pattern: 'approved|approve|lgtm' },
    { id: crypto.randomUUID(), label: 'Rejected', kind: 'contains', pattern: 'rejected|reject|denied|blocked' },
    { id: crypto.randomUUID(), label: 'Else', kind: 'contains', pattern: '', isElse: true },
  ]
}

// ─── Node factories ────────────────────────────────────────────────────────

export function createAgentNode(position: XYPosition, data: AgentNodeData): AgentFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'agent',
    position,
    data,
  }
}

export function createSkillNode(position: XYPosition, data: SkillNodeData): SkillFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'skill',
    position,
    data,
  }
}

export function createPolicyNode(position: XYPosition, data: PolicyNodeData): PolicyFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'policy',
    position,
    data,
  }
}

export function createStickyNoteNode(
  position: XYPosition,
  data: StickyNoteNodeData = {},
): StickyNoteFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'note',
    position,
    data,
  }
}

export function createResourceNode(
  position: XYPosition,
  data: ResourceNodeData = {},
): ResourceFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'resource',
    position,
    data,
  }
}

export function createOutputNode(position: XYPosition, data: OutputNodeData): OutputFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'output',
    position,
    data,
  }
}

export function createEmailNode(position: XYPosition, data: EmailNodeData): EmailFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'email',
    position,
    data,
  }
}

export function createStructurerNode(position: XYPosition, data: StructurerNodeData): StructurerFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'structurer',
    position,
    data,
  }
}

export function createDbSaveNode(position: XYPosition, data: DbSaveNodeData): DbSaveFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'db-save',
    position,
    data,
  }
}

export function createHttpRequestNode(position: XYPosition, data: HttpRequestNodeData): HttpRequestFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'http-request',
    position,
    data,
  }
}

export function createDuckDuckGoSearchNode(position: XYPosition, data: DuckDuckGoSearchNodeData): DuckDuckGoSearchFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'duckduckgo-search',
    position,
    data,
  }
}

export function createSakanaAiNode(position: XYPosition, data: SakanaAiNodeData): SakanaAiFlowNode {
  return {
    id: crypto.randomUUID(),
    type: 'sakana-ai',
    position,
    data,
  }
}

/** Default data seeded when a Structurer node is dropped onto the canvas. */
export function defaultStructurerData(name: string): StructurerNodeData {
  return { name, agentSelection: [], format: 'table', schema: [], extractionMode: 'parse' }
}

/** Default data seeded when an HTTP Request node is dropped onto the canvas. */
export function defaultHttpRequestData(name: string): HttpRequestNodeData {
  return {
    name,
    method: 'GET',
    url: '',
    headers: [],
    queryParams: [],
    bodyMode: 'json',
    timeoutSec: 30,
    responseMode: 'body',
  }
}

/** Default data seeded when a DuckDuckGo Search node is dropped onto the canvas.
 *  `query` defaults to `{{input}}` so the upstream output IS the search query;
 *  the other defaults mirror FlowHunt's DuckDuckGoSearch component (3 results,
 *  us-en, moderate SafeSearch). Time limit defaults to "any time" so a fresh node
 *  never silently filters out relevant-but-older results. */
export function defaultDuckDuckGoSearchData(name: string): DuckDuckGoSearchNodeData {
  return {
    name,
    query: '{{input}}',
    maxResults: 3,
    region: 'us-en',
    safeSearch: 'moderate',
    timeLimit: '',
    outputFormat: 'text',
  }
}

/** Default data seeded when a Sakana AI node is dropped onto the canvas. */
export function defaultSakanaAiData(name: string): SakanaAiNodeData {
  return {
    name,
    apiUrl: 'https://api.sakana.ai/v1/chat/completions',
    model: SAKANA_AI_MODEL_PRESETS[0] ?? 'sakana-chat',
    prompt: '{{input}}',
    temperature: 0.7,
    maxTokens: 1024,
    outputFormat: 'text',
  }
}

// Recipient parsing lives in @rondoflow/shared so the UI and the headless
// scheduler use one implementation. Re-exported here for the Email node card,
// its drawer, and the run-time send path that already import from canvas-utils.
export { parseRecipients } from '@rondoflow/shared'

// ─── Start node (fixed entry point) ─────────────────────────────────────────

const START_NODE_POSITION: XYPosition = { x: 80, y: 200 }

/** The Start node: a non-deletable, fixed-id node present in every canvas. */
export function createStartNode(position: XYPosition = START_NODE_POSITION): StartFlowNode {
  return {
    id: START_NODE_ID,
    type: 'start',
    position,
    data: { status: 'idle' },
    deletable: false,
  }
}

/**
 * Guarantees the canvas holds exactly one non-deletable Start node — the fixed
 * entry point. Returns the SAME array reference when a correct Start node
 * already exists (so React state and persistence don't churn); otherwise
 * prepends a fresh one, or normalises an existing one. Persisted layouts drop
 * the `deletable` flag, so this re-applies it on every load.
 */
export function ensureStartNode(nodes: readonly Node[]): Node[] {
  const idx = nodes.findIndex((n) => n.type === 'start' || n.id === START_NODE_ID)
  if (idx === -1) {
    return [createStartNode(), ...nodes]
  }
  const existing = nodes[idx]
  if (existing.id === START_NODE_ID && existing.type === 'start' && existing.deletable === false) {
    return nodes as Node[]
  }
  const next = [...nodes]
  next[idx] = { ...existing, id: START_NODE_ID, type: 'start', deletable: false }
  return next
}

/**
 * Ensure the Start node feeds the workflow's entry agent(s). An entry agent is
 * an `agent` node with no incoming flow edge — the root(s) of the DAG. Templates,
 * generated workflows and presets ship only agent→agent edges, so this adds the
 * missing Start→entry flow edge(s). If the graph has agents but no clear root
 * (e.g. a cycle), the first agent is used so Start is never left dangling.
 * Existing Start edges are preserved and never duplicated.
 */
export function ensureStartEdges(nodes: readonly Node[], edges: readonly Edge[]): Edge[] {
  const agents = nodes.filter((n) => n.type === 'agent')
  if (agents.length === 0) return edges as Edge[]

  const isFlowEdge = (e: Edge) =>
    (e.data as { edgeType?: string } | undefined)?.edgeType === 'flow'
  const hasIncomingFlow = new Set(edges.filter(isFlowEdge).map((e) => e.target))
  const alreadyFromStart = new Set(
    edges.filter((e) => e.source === START_NODE_ID).map((e) => e.target),
  )

  let entries = agents.filter((a) => !hasIncomingFlow.has(a.id))
  if (entries.length === 0) entries = [agents[0]] // cyclic graph — fall back to first

  const startEdges: Edge[] = entries
    .filter((a) => !alreadyFromStart.has(a.id))
    .map((a) => ({
      id: crypto.randomUUID(),
      source: START_NODE_ID,
      target: a.id,
      type: 'rondoflow',
      data: { edgeType: 'flow' },
    }))

  return startEdges.length > 0 ? [...startEdges, ...edges] : (edges as Edge[])
}

/** Returns a new nodes array with the Start node's connection status updated. */
export function withStartNodeStatus(
  nodes: readonly Node[],
  status: StartConnectionStatus,
  message?: string,
): Node[] {
  return nodes.map((n) =>
    n.type === 'start' || n.id === START_NODE_ID
      ? { ...n, data: { ...n.data, status, message, testedAt: new Date().toISOString() } }
      : n,
  )
}

// ─── Connection validation ─────────────────────────────────────────────────

export interface ConnectionLike {
  source: string | null
  target: string | null
  sourceHandle?: string | null
  targetHandle?: string | null
}

/**
 * Pass-through transform node types (HTTP Request, DuckDuckGo Search, Sakana AI). They share
 * one wiring rule: an assistant — or another transform — feeds them, and their
 * output feeds an assistant or another transform.
 */
const TRANSFORM_NODE_TYPES: ReadonlySet<string> = new Set(['http-request', 'duckduckgo-search', 'sakana-ai'])

function isTransformNode(type?: string): boolean {
  return type !== undefined && TRANSFORM_NODE_TYPES.has(type)
}

/**
 * Type-aware connection rules expressed as a human-readable reason. Returns a
 * short explanation string when the connection is INVALID, or `null` when it is
 * allowed. Shared by `isValidConnection` (drag feedback + drop gating) and the
 * `onConnect` guard, which surfaces the reason to the user as a toast.
 *
 * Rules:
 *  • Start is the entry point: nothing connects INTO it, and it may only feed agents.
 *  • Output is a pure sink: it never originates an edge, and only agents feed into it.
 *  • Skill / policy / MCP nodes attach to agents only.
 */
export function connectionError(
  connection: ConnectionLike,
  nodes: readonly Node[] = [],
): string | null {
  const { source, target } = connection
  // Incomplete drag — not an error to report, just not yet connectable.
  if (!source || !target) return null
  if (source === target) return 'A node can’t connect to itself.'

  const sourceNode = nodes.find((n) => n.id === source)
  const targetNode = nodes.find((n) => n.id === target)

  // Nothing may connect into the Start node — it is the flow's fixed entry point.
  if (targetNode?.type === 'start' || target === START_NODE_ID) {
    return 'The Start node is the entry point — nothing connects into it.'
  }
  // The Start node only feeds agents (the first steps of the run).
  if (
    (sourceNode?.type === 'start' || source === START_NODE_ID) &&
    targetNode?.type !== 'agent'
  ) {
    return 'The Start node can only connect to an assistant.'
  }
  // Output nodes are pure sinks: they never originate an edge…
  if (sourceNode?.type === 'output') {
    return 'Output nodes are endpoints — they don’t connect onward.'
  }
  // …and only agent outputs may feed into them.
  if (targetNode?.type === 'output' && sourceNode?.type !== 'agent') {
    return 'Only an assistant’s output can feed into an Output node.'
  }
  // Email nodes are pure sinks too: they never originate an edge…
  if (sourceNode?.type === 'email') {
    return 'Email nodes are endpoints — they don’t connect onward.'
  }
  // …and only agent outputs may feed into them.
  if (targetNode?.type === 'email' && sourceNode?.type !== 'agent') {
    return 'Only an assistant’s output can feed into an Email node.'
  }
  // A Condition node gates one assistant's output: only an assistant feeds in…
  if (targetNode?.type === 'condition' && sourceNode?.type !== 'agent') {
    return 'Only an assistant can feed into a Condition node.'
  }
  // …and each branch routes to an assistant.
  if (sourceNode?.type === 'condition' && targetNode?.type !== 'agent') {
    return 'A Condition branch can only connect to an assistant.'
  }
  // A Structurer consumes one-or-more assistants' output…
  if (targetNode?.type === 'structurer' && sourceNode?.type !== 'agent') {
    return 'Only an assistant’s output can feed into a Structurer node.'
  }
  // …and its single output feeds a Save-to-DB node.
  if (sourceNode?.type === 'structurer' && targetNode?.type !== 'db-save') {
    return 'A Structurer node only connects to a Save-to-DB node.'
  }
  // Save-to-DB nodes are pure sinks: they never originate an edge…
  if (sourceNode?.type === 'db-save') {
    return 'Save-to-DB nodes are endpoints — they don’t connect onward.'
  }
  // …and only a Structurer’s output may feed into them.
  if (targetNode?.type === 'db-save' && sourceNode?.type !== 'structurer') {
    return 'Only a Structurer’s output can feed into a Save-to-DB node.'
  }
  // Transform nodes (HTTP Request, DuckDuckGo Search, Sakana AI) are pass-through steps: an
  // assistant (or another transform) feeds them, and their output feeds an
  // assistant (or another transform). They don't wire to/from skills, sinks,
  // conditions, etc.
  if (
    isTransformNode(targetNode?.type) &&
    sourceNode?.type !== 'agent' &&
    !isTransformNode(sourceNode?.type)
  ) {
    return 'Only an assistant (or another HTTP Request / DuckDuckGo Search / Sakana AI node) can feed into this node.'
  }
  if (
    isTransformNode(sourceNode?.type) &&
    targetNode?.type !== 'agent' &&
    !isTransformNode(targetNode?.type)
  ) {
    return 'This node can only connect to an assistant (or another HTTP Request / DuckDuckGo Search / Sakana AI node).'
  }
  // Skill / policy / MCP nodes attach to agents only.
  if (
    sourceNode?.type === 'skill' ||
    sourceNode?.type === 'policy' ||
    sourceNode?.type === 'mcp'
  ) {
    if (targetNode?.type !== 'agent') {
      const kind =
        sourceNode.type === 'skill'
          ? 'Skills'
          : sourceNode.type === 'policy'
            ? 'Safety rules'
            : 'Connections'
      return `${kind} attach to assistants only.`
    }
  }

  return null
}

/**
 * Boolean form of {@link connectionError}, used by React Flow's live
 * `isValidConnection` prop. Keeps the original structural semantics: an
 * incomplete connection (missing endpoint) is not valid.
 */
export function isValidConnection(
  connection: ConnectionLike,
  nodes: readonly Node[] = [],
): boolean {
  const { source, target } = connection
  if (!source || !target) return false
  return connectionError(connection, nodes) === null
}

// ─── Sink-node connection sync (Output + Email) ──────────────────────────────

function sameAgentSelection(current: 'all' | readonly string[], next: readonly string[]): boolean {
  // 'all' is never edge-derived, so an existing 'all' always needs rewriting.
  if (current === 'all') return false
  if (current.length !== next.length) return false
  for (let i = 0; i < current.length; i++) {
    if (current[i] !== next[i]) return false
  }
  return true
}

/**
 * Connections are the source of truth for what an Output or Email node consumes:
 * each sink node's `agentSelection` is recomputed as the list of agent node ids
 * wired directly into it (`agent → output|email`), in canvas order. A sink node
 * with no incoming agent edge resolves to an empty selection (consumes nothing).
 *
 * Returns the SAME array reference when nothing changed, so callers can feed the
 * result straight into `setNodes` without triggering a re-render / persistence
 * churn unless a wire was actually added or removed.
 */
export function syncOutputSelections(nodes: readonly Node[], edges: readonly Edge[]): Node[] {
  if (!nodes.some((n) => n.type === 'output' || n.type === 'email')) return nodes as Node[]

  let changed = false
  const next = nodes.map((n) => {
    if (n.type !== 'output' && n.type !== 'email') return n
    const connected = nodes
      .filter((a) => a.type === 'agent' && edges.some((e) => e.source === a.id && e.target === n.id))
      .map((a) => a.id)
    const current = (n.data as OutputNodeData | EmailNodeData).agentSelection
    if (sameAgentSelection(current, connected)) return n
    changed = true
    return { ...n, data: { ...n.data, agentSelection: connected } }
  })

  return changed ? next : (nodes as Node[])
}

/**
 * Normalizes a freshly-loaded canvas: guarantees the fixed Start node and brings
 * every Output/Email node's connection-driven `agentSelection` in step with the
 * edges. Run this at load time (before computing the clean baseline) so the
 * synced result is what the canvas mounts with — the runtime sync effect then
 * becomes a no-op and there is no spurious "unsaved changes" / auto-save on load.
 * Legacy sink nodes persisted with the old `'all'` value are migrated here to the
 * connection-derived selection ([] when nothing is wired in).
 */
export function normalizeLoadedCanvas(nodes: readonly Node[], edges: readonly Edge[]): Node[] {
  return syncStructurerSelections(syncOutputSelections(ensureStartNode(nodes), edges), edges)
}

/**
 * Connection-derived `agentSelection` for Structurer nodes, mirroring
 * {@link syncOutputSelections}: each Structurer's selection is the list of agent
 * node ids wired directly into it (`agent → structurer`). Returns the SAME array
 * reference when nothing changed to avoid re-render / persistence churn.
 */
export function syncStructurerSelections(nodes: readonly Node[], edges: readonly Edge[]): Node[] {
  if (!nodes.some((n) => n.type === 'structurer')) return nodes as Node[]

  let changed = false
  const next = nodes.map((n) => {
    if (n.type !== 'structurer') return n
    const connected = nodes
      .filter((a) => a.type === 'agent' && edges.some((e) => e.source === a.id && e.target === n.id))
      .map((a) => a.id)
    const current = (n.data as StructurerNodeData).agentSelection
    if (sameAgentSelection(current, connected)) return n
    changed = true
    return { ...n, data: { ...n.data, agentSelection: connected } }
  })

  return changed ? next : (nodes as Node[])
}

// ─── Status helpers ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: 'hsl(var(--status-idle))',
  running: 'hsl(var(--status-running))',
  waiting_approval: 'hsl(var(--status-waiting))',
  error: 'hsl(var(--status-error))',
}

export function getStatusColor(status: AgentStatus): string {
  return STATUS_COLORS[status]
}

/**
 * Solid hex equivalents of the status colors — used for node header tints
 * and icon chips where translucent rgba/hex-alpha is needed (CSS vars can't
 * be alpha-composited inline).
 */
const STATUS_HEX: Record<AgentStatus, string> = {
  idle: '#22c55e',
  running: '#3b82f6',
  waiting_approval: '#eab308',
  error: '#ef4444',
}

export function getStatusHex(status: AgentStatus): string {
  return STATUS_HEX[status]
}

const STATUS_ICONS: Record<AgentStatus, string> = {
  idle: 'circle',
  running: 'loader-2',
  waiting_approval: 'clock',
  error: 'alert-circle',
}

export function getStatusIcon(status: AgentStatus): string {
  return STATUS_ICONS[status]
}

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: 'Idle',
  running: 'Running',
  waiting_approval: 'Waiting for approval',
  error: 'Error',
}

export function getStatusLabel(status: AgentStatus): string {
  return STATUS_LABELS[status]
}

// ─── Drag-and-drop helpers ─────────────────────────────────────────────────

export const DRAG_TYPES = {
  AGENT: 'application/rondoflow-agent',
  SKILL: 'application/rondoflow-skill',
  POLICY: 'application/rondoflow-policy',
  MCP: 'application/rondoflow-mcp',
  RESOURCE: 'application/rondoflow-resource',
  NOTE: 'application/rondoflow-note',
  OUTPUT: 'application/rondoflow-output',
  EMAIL: 'application/rondoflow-email',
  CONDITION: 'application/rondoflow-condition',
  STRUCTURER: 'application/rondoflow-structurer',
  DB_SAVE: 'application/rondoflow-db-save',
  HTTP_REQUEST: 'application/rondoflow-http-request',
  DUCKDUCKGO_SEARCH: 'application/rondoflow-duckduckgo-search',
  SAKANA_AI: 'application/rondoflow-sakana-ai',
} as const

export type DragType = (typeof DRAG_TYPES)[keyof typeof DRAG_TYPES]
