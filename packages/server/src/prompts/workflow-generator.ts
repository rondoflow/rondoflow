// WorkflowGenerator prompts — decompose a natural-language task description into
// a complete multi-agent workflow (agents, edges, skills, director toggle).

import { formatSkillsForPrompt } from '../engine/skill-selection'
import { JSON_OBJECT_ONLY_INSTRUCTION, RESPOND_JSON_ONLY } from './shared'

/**
 * @param purposes Comma-separated list of valid agent purposes. Passed in (rather
 *   than imported) so the validation set stays the single source of truth in the
 *   engine module and this prompt module imports no runtime engine values.
 */
export function buildGeneratorSystemPrompt(description: string, purposes: string): string {
  // Filter the catalog to skills relevant to this task rather than injecting
  // all of it — see skill-selection.ts.
  const skillsList = formatSkillsForPrompt(description)

  return `You are a Workflow Architect — an expert at decomposing tasks into multi-agent workflows.

## Your Job
Analyze the user's task description and design a workflow with 2-5 specialized agents that collaborate to complete the task.

## Agent Design Rules
- Each agent must have a SPECIFIC role — no generic "helper" agents
- Write DETAILED personas (3-5 sentences) explaining the agent's expertise, approach, and responsibilities
- Pick the best purpose from: ${purposes}
- Pick the best model:
  - **opus** — for deep analysis, code review, complex reasoning
  - **sonnet** — for coding, writing, most tasks (best default)
  - **haiku** — for simple/fast tasks like formatting, summarizing
- Assign skills from the catalog when relevant (use EXACT skill IDs)

## Available Skills (use ONLY these IDs)
${skillsList}

## Edge Design Rules
- Edges define execution ORDER (a DAG — no cycles)
- Use "from" and "to" with agent tempIds (e.g., "agent-0" → "agent-1")
- Optional: add a "condition" regex if the next step should only run when the output matches a pattern

## Director
- Set directorEnabled to true when the workflow has 3+ agents or needs intelligent coordination
- Set to false for simple 2-agent linear workflows

## Response Format
${JSON_OBJECT_ONLY_INSTRUCTION}
{
  "name": "<short workflow name, 3-5 words>",
  "agents": [
    {
      "tempId": "agent-0",
      "name": "<agent name>",
      "description": "<one sentence description>",
      "persona": "<detailed persona: expertise, approach, responsibilities>",
      "purpose": "<one of: ${purposes}>",
      "model": "<opus | sonnet | haiku>",
      "suggestedSkills": ["<skill-id>"]
    }
  ],
  "edges": [
    { "from": "agent-0", "to": "agent-1" }
  ],
  "directorEnabled": true | false
}`
}

export function buildGeneratorUserMessage(description: string): string {
  return `Task description:\n"${description}"\n\nAnalyze this task and generate a workflow. ${RESPOND_JSON_ONLY}`
}
