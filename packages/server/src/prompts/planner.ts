// Planner prompts — pre-execution analysis that reviews a workflow and suggests
// changes to agents, skills, models, and execution order before running.

import { formatSkillsForPrompt } from '../engine/skill-selection'
import { JSON_OBJECT_ONLY_INSTRUCTION, RESPOND_JSON_ONLY } from './shared'
import type { PlannerContext } from '../engine/planner'

export function buildPlannerSystemPrompt(context: PlannerContext): string {
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
${JSON_OBJECT_ONLY_INSTRUCTION}
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

export function buildPlannerUserMessage(context: PlannerContext): string {
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

  prompt += `\n\nAnalyze this workflow and suggest improvements. ${RESPOND_JSON_ONLY}`
  return prompt
}
