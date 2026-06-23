// WorkflowAdvisor — post-run analysis that evaluates a completed workflow
// and suggests improvements to agents, skills, step order, and output quality.

import { ClaudeCodeSpawner } from './spawner'
import { randomUUID } from 'crypto'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AdvisorSuggestion {
  readonly id: string
  readonly category: 'agent_improvement' | 'skill_recommendation' | 'step_order' | 'output_quality'
  readonly title: string
  readonly description: string
  readonly actionType?: 'apply_skill' | 'update_persona' | null
  readonly actionPayload?: {
    readonly agentId?: string
    readonly agentName?: string
    readonly skillName?: string
    readonly newPersona?: string
  }
  readonly severity: 'info' | 'warning' | 'suggestion'
}

export interface AdvisorResult {
  readonly overallAssessment: string
  readonly objectiveMet: boolean
  readonly suggestions: readonly AdvisorSuggestion[]
}

export interface AdvisorContext {
  readonly initialMessage: string
  readonly agents: readonly {
    readonly name: string
    readonly persona: string
    readonly agentId: string
  }[]
  readonly stepResults: readonly {
    readonly stepIndex: number
    readonly agentName: string
    readonly agentId: string
    readonly output: string
    readonly tokensIn: number
    readonly tokensOut: number
    readonly status: string
  }[]
  readonly availableSkills: readonly {
    readonly name: string
    readonly description: string
    readonly category: string
  }[]
}

// ─── WorkflowAdvisor Class ──────────────────────────────────────────────────

export class WorkflowAdvisor {
  async analyze(context: AdvisorContext, model: string): Promise<AdvisorResult> {
    const systemPrompt = buildAdvisorSystemPrompt(context)
    const userMessage = buildAdvisorUserMessage(context)

    const spawner = new ClaudeCodeSpawner()
    const output = await this.spawnAndCollect(spawner, systemPrompt, userMessage, model)
    return parseAdvisorResponse(output)
  }

  private spawnAndCollect(
    spawner: ClaudeCodeSpawner,
    systemPrompt: string,
    message: string,
    model: string,
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

      spawner.on('completion', () => {
        resolve(output)
      })

      spawner.on('error', (err: Error) => {
        reject(new Error(`Advisor analysis failed: ${err.message}`))
      })

      try {
        spawner.spawn({
          agentId: `advisor-${randomUUID().slice(0, 8)}`,
          sessionId: randomUUID(),
          message,
          systemPrompt,
          model,
          // NOT 'default'/'plan': a prompting mode makes the headless CLI auto-deny
          // any tool the model attempts (no allowedTools are granted) and the model
          // then STALLS asking for permission, burning the full 90s wall-clock.
          // The Advisor emits JSON only and grants no tools, so bypassPermissions
          // never runs anything — it just removes the stall-causing permission gate.
          permissionMode: 'bypassPermissions',
          maxBudgetUsd: 0.10,
          // Bounded JSON-only call — cap absolute runtime so a hung CLI can't
          // stall post-run analysis (a timeout rejects → fallbackResult).
          maxWallClockMs: 90_000,
        })
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }
}

// ─── Prompt Construction ────────────────────────────────────────────────────

function buildAdvisorSystemPrompt(context: AdvisorContext): string {
  const skillsList = context.availableSkills
    .map((s) => `  - **${s.name}** (${s.category}): ${s.description}`)
    .join('\n')

  return `You are a Workflow Advisor — an expert at analyzing completed multi-agent workflows and suggesting concrete improvements.

## Your Job
Analyze the completed workflow run below and provide actionable suggestions to improve future runs.

## Suggestion Categories
1. **agent_improvement** — Persona or configuration changes for an agent
2. **skill_recommendation** — Skills from the catalog that would help an agent
3. **step_order** — Reordering, adding, or removing workflow steps
4. **output_quality** — Gaps between the objective and the actual output

## Available Skills (recommend ONLY from this list)
${skillsList}

## Rules
- Be specific and actionable — don't suggest vague improvements
- For skill recommendations, use the EXACT skill name from the list above
- For persona updates, provide the complete new persona text
- Always include the agentId and agentName in actionPayload so the UI can apply changes
- Assess whether the workflow objective was met
- Limit to 5 most impactful suggestions

## Response Format
You MUST respond with ONLY a JSON object (no markdown, no code fences):
{
  "overallAssessment": "<1-2 sentence summary of how the workflow performed>",
  "objectiveMet": true | false,
  "suggestions": [
    {
      "id": "<unique-id>",
      "category": "agent_improvement" | "skill_recommendation" | "step_order" | "output_quality",
      "title": "<short title>",
      "description": "<detailed explanation>",
      "actionType": "apply_skill" | "update_persona" | null,
      "actionPayload": {
        "agentId": "<agent-id>",
        "agentName": "<agent-name>",
        "skillName": "<exact-catalog-skill-name>",
        "newPersona": "<complete-new-persona-text>"
      },
      "severity": "info" | "warning" | "suggestion"
    }
  ]
}`
}

function buildAdvisorUserMessage(context: AdvisorContext): string {
  const agentList = context.agents
    .map((a) => `- **${a.name}** (${a.agentId}): ${a.persona.slice(0, 200)}`)
    .join('\n')

  const stepsBlock = context.stepResults
    .map((s) => {
      const outputPreview = s.output.length > 1500
        ? s.output.slice(0, 1500) + '\n[... truncated ...]'
        : s.output
      return `### Step ${s.stepIndex}: ${s.agentName} (${s.agentId})
Status: ${s.status} | Tokens: ${s.tokensIn + s.tokensOut} | In: ${s.tokensIn} | Out: ${s.tokensOut}

${outputPreview}`
    })
    .join('\n\n')

  return `## Workflow Objective
"${context.initialMessage}"

## Agents
${agentList}

## Step Results
${stepsBlock}

Analyze this workflow run and provide suggestions. Respond with JSON only.`
}

// ─── Response Parsing ───────────────────────────────────────────────────────

function parseAdvisorResponse(raw: string): AdvisorResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return fallbackResult()
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>

    const overallAssessment = typeof parsed.overallAssessment === 'string'
      ? parsed.overallAssessment
      : 'Could not generate assessment.'
    const objectiveMet = typeof parsed.objectiveMet === 'boolean'
      ? parsed.objectiveMet
      : false

    const rawSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    const suggestions: AdvisorSuggestion[] = rawSuggestions
      .slice(0, 10)
      .map((s: unknown) => parseSuggestion(s))
      .filter((s): s is AdvisorSuggestion => s !== null)

    return { overallAssessment, objectiveMet, suggestions }
  } catch {
    return fallbackResult()
  }
}

function parseSuggestion(raw: unknown): AdvisorSuggestion | null {
  if (typeof raw !== 'object' || raw === null) return null
  const s = raw as Record<string, unknown>

  const category = validateCategory(s.category)
  if (!category) return null

  const title = typeof s.title === 'string' ? s.title : ''
  const description = typeof s.description === 'string' ? s.description : ''
  if (!title) return null

  const actionType = s.actionType === 'apply_skill' || s.actionType === 'update_persona'
    ? s.actionType
    : null

  const payload = typeof s.actionPayload === 'object' && s.actionPayload !== null
    ? s.actionPayload as Record<string, unknown>
    : null

  const severity = s.severity === 'info' || s.severity === 'warning' || s.severity === 'suggestion'
    ? s.severity
    : 'suggestion'

  return {
    id: typeof s.id === 'string' ? s.id : randomUUID().slice(0, 8),
    category,
    title,
    description,
    actionType,
    actionPayload: payload
      ? {
          agentId: typeof payload.agentId === 'string' ? payload.agentId : undefined,
          agentName: typeof payload.agentName === 'string' ? payload.agentName : undefined,
          skillName: typeof payload.skillName === 'string' ? payload.skillName : undefined,
          newPersona: typeof payload.newPersona === 'string' ? payload.newPersona : undefined,
        }
      : undefined,
    severity,
  }
}

type AdvisorCategory = AdvisorSuggestion['category']

function validateCategory(value: unknown): AdvisorCategory | null {
  const valid = new Set<AdvisorCategory>([
    'agent_improvement',
    'skill_recommendation',
    'step_order',
    'output_quality',
  ])
  return typeof value === 'string' && valid.has(value as AdvisorCategory)
    ? (value as AdvisorCategory)
    : null
}

function fallbackResult(): AdvisorResult {
  return {
    overallAssessment: 'Advisor could not parse the analysis response.',
    objectiveMet: false,
    suggestions: [],
  }
}
