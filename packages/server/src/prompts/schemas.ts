// JSON-schema objects passed to the spawned CLI for structured output.
// Co-located here so prompt schemas live in one place, mirroring the prompt
// text in the sibling builder modules.

/**
 * Structured-output schema for the discussion moderator's decisions.
 * The moderator must either continue (name the next participant + question)
 * or synthesize a final conclusion.
 */
export const MODERATOR_DECISION_SCHEMA: object = {
  type: 'object',
  required: ['decision', 'reasoning'],
  additionalProperties: false,
  properties: {
    decision: {
      type: 'string',
      enum: ['continue', 'synthesize'],
      description: 'Whether to continue with another participant turn or produce a final synthesis.',
    },
    nextParticipantId: {
      type: 'string',
      description: 'The agentId of the next participant to speak. Required when decision is "continue".',
    },
    question: {
      type: 'string',
      description: 'The question or prompt to send to the next participant. Required when decision is "continue".',
    },
    synthesis: {
      type: 'string',
      description: 'The final synthesis conclusion. Required when decision is "synthesize".',
    },
    reasoning: {
      type: 'string',
      description: 'Brief explanation of why this decision was made.',
    },
  },
}
