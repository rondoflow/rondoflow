// Planner — pre-execution analysis agent that reviews a workflow and suggests
// changes to agents, skills, models, and execution order before running.

import { ClaudeCodeSpawner } from './spawner'
import { SKILL_CATALOG } from '@rondoflow/catalog'
import { formatSkillsForPrompt } from './skill-selection'
import { randomUUID } from 'crypto'
import { CLAUDE_MODELS, type ModelTier, type GeneratedAgent } from '@rondoflow/shared'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PlannerAgent {
  readonly agentId: string
  readonly name: string
  readonly persona: string
  readonly model: string
  readonly skills: readonly string[]
}

export interface PlannerContext {
  readonly initialMessage: string
  readonly agents: readonly PlannerAgent[]
  readonly edges: readonly { from: string; to: string }[]
  readonly customInstructions?: string
}

export interface AgentChange {
  readonly agentId: string
  readonly agentName: string
  readonly changes: {
    readonly persona?: string
    readonly model?: ModelTier
    readonly addSkills?: readonly string[]
    readonly removeSkills?: readonly string[]
  }
  readonly reason: string
}

export interface EdgeChange {
  readonly action: 'add' | 'remove'
  readonly from: string
  readonly to: string
  readonly reason: string
}

export interface PlannerResult {
  readonly analysis: string
  readonly agentChanges: readonly AgentChange[]
  readonly edgeChanges: readonly EdgeChange[]
  readonly addAgents: readonly GeneratedAgent[]
  readonly removeAgents: readonly string[]
  readonly approved: boolean
}

// ─── Planner Class ──────────────────────────────────────────────────────────

export class Planner {
  async analyze(context: PlannerContext): Promise<PlannerResult> {
    const systemPrompt = buildPlannerSystemPrompt(context)
    const userMessage = buildPlannerUserMessage(context)

    const spawner = new ClaudeCodeSpawner()
    const output = await this.spawnAndCollect(spawner, systemPrompt, userMessage)
    return parsePlannerResponse(output)
  }

  private spawnAndCollect(
    spawner: ClaudeCodeSpawner,
    systemPrompt: string,
    message: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let output = ''

      spawner.on('text', (data: { content: string; partial: boolean }) => {
        if (data.partial) {
          output += data.content
        } else {
          output = data.content
        }
      })

      spawner.on('completion', () => resolve(output))

      spawner.on('error', (err: Error) => {
        reject(new Error(`Planner analysis failed: ${err.message}`))
      })

      try {
        spawner.spawn({
          agentId: `planner-${randomUUID().slice(0, 8)}`,
          sessionId: randomUUID(),
          message,
          systemPrompt,
          model: CLAUDE_MODELS.sonnet,
          // NOT 'default'/'plan': a prompting mode makes the headless CLI auto-deny
          // any tool the model attempts (no allowedTools are granted) and the model
          // then STALLS asking for permission, burning the full 90s wall-clock.
          // The Planner emits JSON only and grants no tools, so bypassPermissions
          // never runs anything — it just removes the stall-causing permission gate.
          permissionMode: 'bypassPermissions',
          maxBudgetUsd: 0.10,
          // Bounded JSON-only call — cap absolute runtime so a hung CLI can't
          // stall pre-execution analysis (a timeout rejects → fallbackResult).
          maxWallClockMs: 90_000,
        })
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }
}

// ─── Prompt Construction ────────────────────────────────────────────────────

function buildPlannerSystemPrompt(context: PlannerContext): string {
  // Filter the catalog to skills relevant to THIS workflow (task + personas)
  // rather than injecting all of it — see skill-selection.ts.
  const query = [
    context.initialMessage,
    context.customInstructions ?? '',
    ...context.agents.map((a) => `${a.name} ${a.persona}`),
  ].join(' ')
  const skillsList = formatSkillsForPrompt(query)

  return `You are a Workflow Planner — an expert at analyzing multi-agent workflows and optimizing them before execution.

## Your Job
Review the workflow below and suggest improvements to maximize the chances of a successful execution. Analyze:
1. Whether each agent's persona is well-suited for the task
2. Whether the model tier (opus/sonnet/haiku) is appropriate for each agent's role
3. Whether the execution order makes sense
4. Whether any agents should have skills added or removed
5. Whether the workflow needs additional agents or can be simplified

## Available Skills
${skillsList}

## Rules
- Be specific — explain WHY each change improves the workflow
- Only suggest changes that meaningfully improve execution quality
- If the workflow is already well-configured, set "approved": true with no changes
- For model recommendations: opus for deep analysis/review, sonnet for coding/writing, haiku for simple tasks
- For skill suggestions, use EXACT skill IDs from the list above
- Limit to the most impactful suggestions (max 5 agent changes)

## Response Format
Respond with ONLY a JSON object (no markdown, no code fences):
{
  "analysis": "<1-3 sentence summary of the workflow assessment>",
  "agentChanges": [
    {
      "agentId": "<agent-id>",
      "agentName": "<agent-name>",
      "changes": {
        "persona": "<new persona text, only if changing>",
        "model": "<opus|sonnet|haiku, only if changing>",
        "addSkills": ["<skill-id>"],
        "removeSkills": ["<skill-id>"]
      },
      "reason": "<why this change helps>"
    }
  ],
  "edgeChanges": [],
  "addAgents": [],
  "removeAgents": [],
  "approved": true | false
}`
}

function buildPlannerUserMessage(context: PlannerContext): string {
  const agentList = context.agents
    .map((a) => {
      const skillsStr = a.skills.length > 0 ? ` | Skills: ${a.skills.join(', ')}` : ''
      return `- **${a.name}** (${a.agentId}) [model: ${a.model}${skillsStr}]\n  Persona: ${a.persona.slice(0, 300)}`
    })
    .join('\n')

  const edgeList = context.edges
    .map((e) => {
      const fromAgent = context.agents.find((a) => a.agentId === e.from)
      const toAgent = context.agents.find((a) => a.agentId === e.to)
      return `  ${fromAgent?.name ?? e.from} → ${toAgent?.name ?? e.to}`
    })
    .join('\n')

  let prompt = `## Task
"${context.initialMessage}"

## Agents
${agentList}

## Execution Order
${edgeList}`

  if (context.customInstructions) {
    prompt += `\n\n## Additional Instructions\n${context.customInstructions}`
  }

  prompt += '\n\nAnalyze this workflow and suggest improvements. Respond with JSON only.'
  return prompt
}

// ─── Response Parsing ───────────────────────────────────────────────────────

function parsePlannerResponse(raw: string): PlannerResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return fallbackResult()
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>

    const analysis = typeof parsed.analysis === 'string'
      ? parsed.analysis
      : 'Planner could not generate analysis.'

    const approved = typeof parsed.approved === 'boolean'
      ? parsed.approved
      : true

    const rawChanges = Array.isArray(parsed.agentChanges) ? parsed.agentChanges : []
    const agentChanges: AgentChange[] = rawChanges
      .slice(0, 5)
      .map((c: unknown) => parseAgentChange(c))
      .filter((c): c is AgentChange => c !== null)

    const rawEdgeChanges = Array.isArray(parsed.edgeChanges) ? parsed.edgeChanges : []
    const edgeChanges: EdgeChange[] = rawEdgeChanges
      .slice(0, 3)
      .map((e: unknown) => parseEdgeChange(e))
      .filter((e): e is EdgeChange => e !== null)

    return {
      analysis,
      agentChanges,
      edgeChanges,
      addAgents: [],
      removeAgents: [],
      approved,
    }
  } catch {
    return fallbackResult()
  }
}

function parseAgentChange(raw: unknown): AgentChange | null {
  if (typeof raw !== 'object' || raw === null) return null
  const c = raw as Record<string, unknown>

  const agentId = typeof c.agentId === 'string' ? c.agentId : null
  const agentName = typeof c.agentName === 'string' ? c.agentName : null
  const reason = typeof c.reason === 'string' ? c.reason : ''
  if (!agentId || !agentName) return null

  const rawChanges = typeof c.changes === 'object' && c.changes !== null
    ? c.changes as Record<string, unknown>
    : {}

  const validModels = new Set<ModelTier>(['opus', 'sonnet', 'haiku'])
  const validSkillIds = new Set(SKILL_CATALOG.map((s) => s.id))

  const changes: AgentChange['changes'] = {
    persona: typeof rawChanges.persona === 'string' ? rawChanges.persona : undefined,
    model: typeof rawChanges.model === 'string' && validModels.has(rawChanges.model as ModelTier)
      ? rawChanges.model as ModelTier
      : undefined,
    addSkills: Array.isArray(rawChanges.addSkills)
      ? rawChanges.addSkills.filter((s): s is string => typeof s === 'string' && validSkillIds.has(s))
      : undefined,
    removeSkills: Array.isArray(rawChanges.removeSkills)
      ? rawChanges.removeSkills.filter((s): s is string => typeof s === 'string')
      : undefined,
  }

  // Only return if there's at least one actual change
  if (!changes.persona && !changes.model && !changes.addSkills?.length && !changes.removeSkills?.length) {
    return null
  }

  return { agentId, agentName, changes, reason }
}

function parseEdgeChange(raw: unknown): EdgeChange | null {
  if (typeof raw !== 'object' || raw === null) return null
  const e = raw as Record<string, unknown>

  const action = e.action === 'add' || e.action === 'remove' ? e.action : null
  const from = typeof e.from === 'string' ? e.from : null
  const to = typeof e.to === 'string' ? e.to : null
  const reason = typeof e.reason === 'string' ? e.reason : ''

  if (!action || !from || !to) return null
  return { action, from, to, reason }
}

function fallbackResult(): PlannerResult {
  return {
    analysis: 'Planner could not analyze the workflow.',
    agentChanges: [],
    edgeChanges: [],
    addAgents: [],
    removeAgents: [],
    approved: true,
  }
}
