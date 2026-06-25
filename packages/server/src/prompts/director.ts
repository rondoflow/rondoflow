// Director prompts — the intelligent workflow orchestrator that evaluates each
// step's output and decides whether to continue, redirect, or conclude.

import {
  JSON_OBJECT_ONLY_INSTRUCTION,
  RESPOND_JSON_ONLY,
  LANGUAGE_RULE,
  LANGUAGE_ECHO_INSTRUCTION,
  truncate,
} from './shared'
import type { DirectorContext } from '../engine/director'

// Cap how many prior steps are embedded in the Director's system prompt. The full
// history grows unbounded in long/looping workflows; the Director's decision only
// needs recent context, and an oversized prompt wastes tokens and slows the call.
// Keep the most recent N steps (oldest dropped first).
export const MAX_DIRECTOR_HISTORY_ENTRIES = 30

export function buildDirectorSystemPrompt(context: DirectorContext): string {
  const agentList = context.agents
    .map((a, i) => `  ${i}. **${a.name}**: ${a.persona || 'General-purpose agent'}`)
    .join('\n')

  const omittedCount = Math.max(0, context.executionHistory.length - MAX_DIRECTOR_HISTORY_ENTRIES)
  const recentHistory = context.executionHistory.slice(-MAX_DIRECTOR_HISTORY_ENTRIES)
  const historyBlock = recentHistory.length > 0
    ? (omittedCount > 0
        ? `_(${omittedCount} earlier step${omittedCount === 1 ? '' : 's'} omitted — showing the most recent ${MAX_DIRECTOR_HISTORY_ENTRIES}.)_\n\n`
        : '') +
      recentHistory
        .map((e) => {
          const retryLabel = e.wasRetry ? ' (RETRY)' : ''
          const outputPreview = truncate(e.output, 800)
          return `### Step ${e.stepIndex}${retryLabel}: ${e.agentName}\n${outputPreview}`
        })
        .join('\n\n')
    : '(No steps executed yet)'

  const memoriesBlock = context.memories.length > 0
    ? context.memories.map((m) => `- ${m}`).join('\n')
    : '(No learnings from previous runs)'

  return `You are the Director — an intelligent workflow orchestrator. Your job is to evaluate agent output and decide the next action.

${LANGUAGE_RULE}

## Your Responsibilities
1. Evaluate if the current step's output is sufficient and high quality
2. Contextualize instructions for the next agent so it understands what to do
3. Decide whether to continue, redirect (retry), or conclude the workflow early

## Workflow Objective
"${context.initialMessage}"

## Agents in this Workflow
${agentList}

## Execution History
${historyBlock}

## Learnings from Previous Runs
${memoriesBlock}

## Critical Rules

### About the "message" field
- The "message" field is passed DIRECTLY as the sole input to the next agent.
- The next agent will ONLY see this message — it has NO other context.
- You MUST include the relevant output/work from the current step inside the message.
- Format: Start with brief context and instructions, then include the FULL output from the previous step.
- Example for continue: "The Code Writer produced the following code. Review it for security issues and error handling:\n\n[full code output from previous step]"
- Example for redirect: "Your previous output was missing error handling. Please redo the task with proper try-catch blocks. Original request:\n\n[original objective]"
- NEVER send a message that is just instructions without the actual work output — the next agent needs the data to work with.

### Criticism level: ${context.rigor ?? 3}/5
${buildRigorInstructions(context.rigor ?? 3)}

### Decision logic
- If output is good enough, use action "continue" and pass a contextualized message WITH the output to the next agent
- If output is missing something critical, use action "redirect" to retry the same step with better instructions
- If the workflow objective has been fully achieved before all steps run, use action "conclude"
- Always explain your reasoning so the user understands your decision
- If you notice a recurring pattern (e.g., an agent always forgets something), record it as a learning
${context.branchingActive ? `
### Branching workflow (IMPORTANT)
This workflow contains Condition branches. The NEXT step is chosen AUTOMATICALLY by matching each branch's pattern against this step's output — you do NOT pick the path.
- "continue" → proceed along the branch the conditions select; write your "message" for the next agent named in the Status section of the task
- "redirect" → retry the CURRENT step only (never try to jump to a different step — the graph owns forward routing)
- "conclude" → stop the whole workflow early
` : ''}
### About truncated outputs
- Agent outputs may be cut off due to token limits — this is NORMAL behavior, NOT an error
- If an output appears truncated (ends mid-sentence, has "[... truncated ...]"), do NOT redirect
- Treat truncated output as complete work — the agent did its best within its token budget
- Pass the truncated output as-is to the next agent — it can still work with partial results
- Only redirect if the output is fundamentally wrong or missing critical parts, NOT because it was cut short

${context.customInstructions ? `## Custom Instructions from User\n${context.customInstructions}\n` : ''}## Agent Improvement Suggestions (Continuous Planner)
If you notice an agent would benefit from a persona tweak or model change for future steps, include "agentSuggestions". This is OPTIONAL — only include when you have a concrete improvement. Examples:
- Agent persona is too vague for the task → suggest a more specific persona
- Agent uses haiku but the task needs deeper reasoning → suggest model upgrade to sonnet/opus

## Response Format
${JSON_OBJECT_ONLY_INSTRUCTION}
{
  "action": "continue" | "redirect" | "conclude",
  "targetStepIndex": <number — next step index for continue, same step for redirect>,
  "message": "<contextualized message for the next/retried agent>",
  "reasoning": "<explanation of your decision for the user>",
  "learning": "<pattern observed, or null if none>",
  "agentSuggestions": [
    { "agentName": "<name>", "changeType": "persona" | "model", "suggestion": "<new value>", "reason": "<why>" }
  ]
}`
}

export function buildRigorInstructions(rigor: number): string {
  switch (rigor) {
    case 1:
      return 'You are in RELAXED mode. Almost always continue. Only redirect for critical errors that would make the output unusable. Accept partial or imperfect work.'
    case 2:
      return 'You are in LENIENT mode. Accept most outputs. Only redirect when something clearly important is missing. Be forgiving of minor issues.'
    case 3:
      return 'You are in BALANCED mode (default). Evaluate fairly. Suggest redirects when meaningful improvements are needed, but not for minor issues. Prefer continuing over redirecting.'
    case 4:
      return 'You are in STRICT mode. Hold agents to higher standards. Redirect when output is incomplete, lacks important details, or misses key requirements. Still prefer continue for minor issues.'
    case 5:
      return 'You are in DEMANDING mode. Expect comprehensive, production-ready output. Redirect for any significant gap in quality, completeness, or correctness. Only continue when output fully meets expectations.'
    default:
      return 'You are in BALANCED mode (default). Evaluate fairly and prefer continuing over redirecting.'
  }
}

export function buildDirectorUserMessage(context: DirectorContext): string {
  const outputPreview = truncate(
    context.currentStepOutput,
    6000,
    '\n\n[... output truncated for context window ...]',
  )

  const currentAgent = context.agents[context.completedStepIndex]
  const nextStepIndex = context.completedStepIndex + 1
  const isLastStep = nextStepIndex >= context.totalSteps
  const nextAgent = !isLastStep ? context.agents[nextStepIndex] : null

  // The next agent is whatever the graph enabled (passed in as nextAgents). The
  // Director walks the DAG topologically, so the linear index+1 wording is only
  // correct when nextAgents is absent (legacy/non-DAG callers). When present, it
  // is authoritative for ANY graph shape — branches, fan-out, fan-in, or linear.
  const nextLine = context.nextAgents !== undefined
    ? (context.nextAgents.length > 0
        ? `Next agent(s)${context.branchingActive ? ", auto-selected by this workflow's branch conditions" : ''}: ${context.nextAgents.join(', ')}.${context.branchingActive ? ' You do NOT choose the path.' : ''} Use "continue" to proceed, "redirect" to retry THIS step, or "conclude" to stop early.`
        : `No further step follows this one${context.branchingActive ? ' (no branch matched)' : ''} — this path ends here. Use "conclude" to finish, or "redirect" to retry THIS step with better instructions.`)
    : (isLastStep
        ? 'This was the LAST step. Decide: conclude with summary, or redirect if needed.'
        : `Next step would be: ${nextStepIndex} (${nextAgent?.name ?? 'unknown'})`)

  return `Step ${context.completedStepIndex} (${currentAgent?.name ?? 'unknown'}) just completed.

## Output
${outputPreview}

## Status
- Completed step: ${context.completedStepIndex} of ${context.totalSteps - 1} (0-indexed)
- ${nextLine}

Evaluate the output and decide what to do next.
IMPORTANT: Your "message" field must include the full output above — the next agent receives ONLY your message as input.
${LANGUAGE_ECHO_INSTRUCTION}
${RESPOND_JSON_ONLY}`
}
