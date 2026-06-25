// Advisor prompts — post-run analysis that evaluates a completed workflow and
// suggests improvements to agents, skills, step order, and output quality.

import { JSON_OBJECT_ONLY_INSTRUCTION, RESPOND_JSON_ONLY, truncate } from './shared'
import type { AdvisorContext } from '../engine/advisor'

export function buildAdvisorSystemPrompt(context: AdvisorContext): string {
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
${JSON_OBJECT_ONLY_INSTRUCTION}
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

export function buildAdvisorUserMessage(context: AdvisorContext): string {
  const agentList = context.agents
    .map((a) => `- **${a.name}** (${a.agentId}): ${a.persona.slice(0, 200)}`)
    .join('\n')

  const stepsBlock = context.stepResults
    .map((s) => {
      const outputPreview = truncate(s.output, 1500, '\n[... truncated ...]')
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

Analyze this workflow run and provide suggestions. ${RESPOND_JSON_ONLY}`
}
