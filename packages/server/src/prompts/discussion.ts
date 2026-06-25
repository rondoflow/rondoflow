// Discussion prompt templates for the ModeratorEngine.
// Each function is pure — it builds a string from its arguments with no side effects.

import type { DiscussionFormat, ParticipantRole } from '@rondoflow/shared'
import { MODERATOR_DECISION_SCHEMA } from './schemas'

// Re-export so existing `from '../discussion/prompts'` consumers keep one import site.
export { MODERATOR_DECISION_SCHEMA }

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ParticipantInfo {
  readonly agentId: string
  readonly agentName: string
  readonly role: ParticipantRole
}

// ---------------------------------------------------------------------------
// Format descriptions used in prompts
// ---------------------------------------------------------------------------

const FORMAT_DESCRIPTIONS: Record<DiscussionFormat, string> = {
  brainstorm: 'open ideation — encourage creative, divergent thinking and novel ideas',
  review: 'structured critique — provide balanced evaluation, identify strengths and weaknesses',
  deliberation: 'evidence-based reasoning — weigh arguments systematically and converge on a well-reasoned position',
}

const ROLE_INSTRUCTIONS: Record<ParticipantRole, string> = {
  participant: 'Contribute your perspective clearly and build on what others have said.',
  observer: 'Share observations and insights without advocacy. Stay analytical and neutral.',
  devil_advocate: 'Challenge prevailing views, surface hidden assumptions, and stress-test arguments rigorously.',
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

/**
 * Opening prompt sent to the moderator agent.
 * The moderator must reply with a structured JSON object matching MODERATOR_DECISION_SCHEMA
 * indicating which participant goes first and what question to ask them.
 */
export function buildOpeningPrompt(
  topic: string,
  format: DiscussionFormat,
  participants: ParticipantInfo[],
): string {
  const participantList = participants
    .map((p) => `- ID: ${p.agentId} | Name: ${p.agentName} | Role: ${p.role}`)
    .join('\n')

  return `You are the moderator of a structured discussion. Your job is to guide participants through a productive conversation and ultimately synthesize their contributions into a clear conclusion.

## Discussion Topic
${topic}

## Format
${format} — ${FORMAT_DESCRIPTIONS[format]}

## Participants
${participantList}

## Your Task
Open the discussion by selecting the first participant to speak and crafting a clear, focused opening question or prompt for them.

Respond with a JSON object using this exact structure:
{
  "decision": "continue",
  "nextParticipantId": "<agentId of first participant>",
  "question": "<your opening question or prompt for that participant>",
  "reasoning": "<why you chose this participant and question>"
}

Be direct. Do not add commentary outside the JSON object.`
}

/**
 * Prompt sent to a participant agent for their turn.
 * The participant responds in plain text — no structured output required.
 */
export function buildParticipantPrompt(
  topic: string,
  role: ParticipantRole,
  question: string,
  context: string,
): string {
  const roleInstruction = ROLE_INSTRUCTIONS[role]
  const contextSection = context.trim().length > 0
    ? `\n## Discussion So Far\n${context}\n`
    : ''

  return `You are participating in a structured discussion on the following topic:

## Topic
${topic}

## Your Role
${role} — ${roleInstruction}
${contextSection}
## Your Prompt
${question}

Respond thoughtfully and concisely. Stay on topic. Your response will be shared with all other participants and the moderator.`
}

/**
 * Prompt sent to the moderator after each participant turn.
 * The moderator must decide: continue (name next participant + question) or synthesize.
 */
export function buildEvaluationPrompt(
  topic: string,
  context: string,
  roundNumber: number,
  maxRounds: number,
): string {
  const roundsRemaining = maxRounds - roundNumber
  const urgency = roundsRemaining <= 1
    ? 'This is the final round — you MUST synthesize now.'
    : `${roundsRemaining} round(s) remaining.`

  return `You are the moderator of a structured discussion on:

## Topic
${topic}

## Discussion Transcript So Far
${context}

## Your Decision
Round ${roundNumber} of ${maxRounds} is complete. ${urgency}

Evaluate the discussion so far and decide:
- **continue**: if important perspectives are missing or the discussion needs more depth and rounds remain
- **synthesize**: if sufficient ground has been covered or no rounds remain

${roundsRemaining <= 1 ? 'You must choose "synthesize".' : ''}

Respond with a JSON object:
{
  "decision": "continue" | "synthesize",
  "nextParticipantId": "<agentId — required if continue>",
  "question": "<question for next participant — required if continue>",
  "synthesis": "<final conclusion — required if synthesize>",
  "reasoning": "<brief explanation of your decision>"
}

Be direct. Do not add commentary outside the JSON object.`
}

/**
 * Prompt sent to the moderator to generate the final synthesis.
 * Used as a fallback when a previous synthesis attempt returned no content.
 */
export function buildSynthesisPrompt(
  topic: string,
  context: string,
  format: DiscussionFormat,
): string {
  return `You are the moderator concluding a structured discussion.

## Topic
${topic}

## Format
${format} — ${FORMAT_DESCRIPTIONS[format]}

## Full Discussion Transcript
${context}

## Your Task
Write a comprehensive synthesis of the discussion. Your synthesis should:
- Summarize the key perspectives and arguments raised
- Identify points of agreement and disagreement
- Draw clear conclusions or recommendations where possible
- Be written in clear, plain prose suitable for sharing with stakeholders

Write the synthesis directly. No JSON. No preamble.`
}
