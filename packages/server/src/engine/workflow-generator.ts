// WorkflowGenerator — analyzes a natural language task description and generates
// a complete multi-agent workflow with agents, edges, skills, and layout.

import { randomUUID } from 'crypto'
import { ClaudeCodeSpawner } from './spawner'
import { SKILL_CATALOG } from '@rondoflow/catalog'
import { buildGeneratorSystemPrompt, buildGeneratorUserMessage } from '../prompts/workflow-generator'
import type {
  GeneratedWorkflow,
  GeneratedWorkflowWithLayout,
  GeneratedAgent,
  GeneratedAgentWithPosition,
  GeneratedEdge,
  AgentPurpose,
  ModelTier,
} from '@rondoflow/shared'

// ─── Valid values for validation ────────────────────────────────────────────

const VALID_PURPOSES = new Set<AgentPurpose>([
  'writing', 'coding', 'analysis', 'chat', 'review',
  'research', 'creative', 'data', 'general',
])

const VALID_MODELS = new Set<ModelTier>(['opus', 'sonnet', 'haiku'])

const VALID_SKILL_IDS = new Set(SKILL_CATALOG.map((s) => s.id))

// ─── WorkflowGenerator Class ────────────────────────────────────────────────

const GENERATION_TIMEOUT_MS = 90_000

export class WorkflowGenerator {
  async generate(description: string): Promise<GeneratedWorkflowWithLayout> {
    const systemPrompt = buildGeneratorSystemPrompt(description, [...VALID_PURPOSES].join(', '))
    const userMessage = buildGeneratorUserMessage(description)

    const raw = await this.runClaude(systemPrompt, userMessage)

    console.log('[WorkflowGenerator] response length:', raw.length)

    if (!raw.trim()) {
      // Reaching here means a clean exit with no result text — surface it
      // rather than silently degrading to a one-agent fallback.
      throw new Error('Claude CLI returned empty output for workflow generation')
    }

    const workflow = parseGeneratorResponse(raw, description)
    return applyLayout(workflow)
  }

  /**
   * Run a single one-shot Claude generation and resolve with its final text.
   *
   * Uses ClaudeCodeSpawner (stream-json) instead of a raw `claude --print`
   * exec so the generator shares the spawner's failure handling: an auth/quota
   * error (which the CLI reports as `is_error:true` while still printing
   * subtype "success", and may even print as plain stdout on a clean exit) is
   * surfaced as a thrown error here — and therefore a 5xx from the route —
   * instead of being parsed as a degenerate "successful" fallback workflow.
   */
  private runClaude(systemPrompt: string, message: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const spawner = new ClaudeCodeSpawner()
      const chunks: string[] = []
      let settled = false

      const settle = (fn: () => void): void => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        fn()
      }

      const timer = setTimeout(() => {
        settle(() => {
          spawner.kill()
          reject(new Error(`Workflow generation timed out after ${GENERATION_TIMEOUT_MS}ms`))
        })
      }, GENERATION_TIMEOUT_MS)

      // Collect only complete (non-partial) blocks: the final result text
      // arrives once with partial=false.
      spawner.on('text', (data: { content: string; partial: boolean }) => {
        if (!data.partial) chunks.push(data.content)
      })
      spawner.on('completion', () => settle(() => resolve(chunks.join('\n').trim())))
      spawner.on('error', (err: Error) => settle(() => reject(err)))

      try {
        spawner.spawn({
          agentId: 'workflow-generator',
          sessionId: randomUUID(),
          message,
          systemPrompt,
          // The generator only emits JSON text — it needs no tools, so no
          // allowlist and the spawner's default permission mode are fine.
          model: 'sonnet',
          // env extras empty: the spawner forwards the resolved Claude
          // credential (setup-token over API key) from process.env itself.
          env: {},
        })
      } catch (err) {
        settle(() => reject(err instanceof Error ? err : new Error(String(err))))
      }
    })
  }
}

// ─── JSON Extraction ────────────────────────────────────────────────────────

function extractJson(raw: string): string | null {
  if (!raw) return null
  // Strip markdown code fences
  const stripped = raw.replace(/```(?:json)?\s*/g, '').replace(/```/g, '')

  // Find first { and match balanced braces
  const start = stripped.indexOf('{')
  if (start === -1) return null

  let depth = 0
  for (let i = start; i < stripped.length; i++) {
    if (stripped[i] === '{') depth++
    else if (stripped[i] === '}') depth--
    if (depth === 0) {
      return stripped.slice(start, i + 1)
    }
  }
  return null
}

// ─── Response Parsing ───────────────────────────────────────────────────────

function parseGeneratorResponse(raw: string, description: string): GeneratedWorkflow {
  const jsonStr = extractJson(raw)
  if (!jsonStr) {
    console.warn('[WorkflowGenerator] no JSON found in output. Raw (first 500 chars):', raw.slice(0, 500))
    return fallbackWorkflow(description)
  }

  try {
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>

    const name = typeof parsed.name === 'string' && parsed.name.length > 0
      ? parsed.name
      : 'Generated Workflow'

    const rawAgents = Array.isArray(parsed.agents) ? parsed.agents : []
    const agents: GeneratedAgent[] = rawAgents
      .slice(0, 5)
      .map((a: unknown, i: number) => parseAgent(a, i))
      .filter((a): a is GeneratedAgent => a !== null)

    if (agents.length === 0) {
      console.warn('[WorkflowGenerator] parsed JSON but no valid agents found')
      return fallbackWorkflow(description)
    }

    const agentIds = new Set(agents.map((a) => a.tempId))

    const rawEdges = Array.isArray(parsed.edges) ? parsed.edges : []
    const edges: GeneratedEdge[] = rawEdges
      .map((e: unknown) => parseEdge(e, agentIds))
      .filter((e): e is GeneratedEdge => e !== null)

    const directorEnabled = typeof parsed.directorEnabled === 'boolean'
      ? parsed.directorEnabled
      : agents.length >= 3

    console.log('[WorkflowGenerator] parsed workflow:', name, `(${agents.length} agents, ${edges.length} edges)`)
    return { name, agents, edges, directorEnabled }
  } catch (err) {
    console.error('[WorkflowGenerator] JSON parse error:', err instanceof Error ? err.message : err)
    return fallbackWorkflow(description)
  }
}

function parseAgent(raw: unknown, index: number): GeneratedAgent | null {
  if (typeof raw !== 'object' || raw === null) return null
  const a = raw as Record<string, unknown>

  const name = typeof a.name === 'string' && a.name.length > 0
    ? a.name
    : null
  if (!name) return null

  const tempId = typeof a.tempId === 'string' ? a.tempId : `agent-${index}`
  const description = typeof a.description === 'string' ? a.description : name
  const persona = typeof a.persona === 'string' && a.persona.length > 0
    ? a.persona
    : `You are ${name}. ${description}`

  const purpose: AgentPurpose = typeof a.purpose === 'string' && VALID_PURPOSES.has(a.purpose as AgentPurpose)
    ? a.purpose as AgentPurpose
    : 'general'

  const model: ModelTier = typeof a.model === 'string' && VALID_MODELS.has(a.model as ModelTier)
    ? a.model as ModelTier
    : 'sonnet'

  const rawSkills = Array.isArray(a.suggestedSkills) ? a.suggestedSkills : []
  const suggestedSkills = rawSkills
    .filter((s): s is string => typeof s === 'string' && VALID_SKILL_IDS.has(s))

  return { tempId, name, description, persona, purpose, model, suggestedSkills }
}

function parseEdge(raw: unknown, validIds: Set<string>): GeneratedEdge | null {
  if (typeof raw !== 'object' || raw === null) return null
  const e = raw as Record<string, unknown>

  const from = typeof e.from === 'string' ? e.from : null
  const to = typeof e.to === 'string' ? e.to : null

  if (!from || !to || !validIds.has(from) || !validIds.has(to)) return null
  if (from === to) return null

  const condition = typeof e.condition === 'string' && e.condition.length > 0
    ? e.condition
    : undefined

  return { from, to, condition }
}

function fallbackWorkflow(description: string): GeneratedWorkflow {
  const name = description.length > 30 ? description.slice(0, 30) + '...' : description
  return {
    name,
    agents: [{
      tempId: 'agent-0',
      name: name,
      description,
      persona: `You are a helpful assistant. The user described the task as: "${description}". Follow these instructions carefully.`,
      purpose: 'general',
      model: 'sonnet',
      suggestedSkills: [],
    }],
    edges: [],
    directorEnabled: false,
  }
}

// ─── Layout Algorithm ───────────────────────────────────────────────────────

function applyLayout(workflow: GeneratedWorkflow): GeneratedWorkflowWithLayout {
  const { agents, edges } = workflow

  if (agents.length === 0) {
    return { ...workflow, agents: [] }
  }

  // Build adjacency for topological layering
  const successors = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  for (const agent of agents) {
    successors.set(agent.tempId, [])
    inDegree.set(agent.tempId, 0)
  }

  for (const edge of edges) {
    successors.get(edge.from)?.push(edge.to)
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1)
  }

  // Kahn's algorithm for topological layers
  const layers: string[][] = []
  let queue = agents
    .map((a) => a.tempId)
    .filter((id) => (inDegree.get(id) ?? 0) === 0)

  while (queue.length > 0) {
    layers.push([...queue])
    const nextQueue: string[] = []

    for (const id of queue) {
      for (const succ of successors.get(id) ?? []) {
        const newDeg = (inDegree.get(succ) ?? 1) - 1
        inDegree.set(succ, newDeg)
        if (newDeg === 0) {
          nextQueue.push(succ)
        }
      }
    }

    queue = nextQueue
  }

  // Assign any remaining agents (cycles or disconnected) to last layer
  const layered = new Set(layers.flat())
  const remaining = agents.filter((a) => !layered.has(a.tempId)).map((a) => a.tempId)
  if (remaining.length > 0) {
    layers.push(remaining)
  }

  // Position: left-to-right, 350px per layer, 200px vertical gap
  const positionMap = new Map<string, { x: number; y: number }>()
  const startX = 100
  const layerGap = 350
  const nodeGap = 200
  const centerY = 300

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx]!
    const x = startX + layerIdx * layerGap
    const totalHeight = (layer.length - 1) * nodeGap
    const startY = centerY - totalHeight / 2

    for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
      positionMap.set(layer[nodeIdx]!, { x, y: startY + nodeIdx * nodeGap })
    }
  }

  const agentsWithPosition: GeneratedAgentWithPosition[] = agents.map((agent) => ({
    ...agent,
    position: positionMap.get(agent.tempId) ?? { x: startX, y: centerY },
  }))

  return { ...workflow, agents: agentsWithPosition }
}
