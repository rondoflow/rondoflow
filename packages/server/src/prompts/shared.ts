// Shared prompt fragments and helpers used across the engine prompt modules.
// Centralizing the repeated boilerplate (JSON-only instructions, the language
// policy, output truncation) keeps a single source of truth — change a rule
// here and every prompt that composes it stays in sync.

// ---------------------------------------------------------------------------
// JSON-only response boilerplate
// ---------------------------------------------------------------------------

/**
 * Canonical instruction that opens a system prompt's "Response Format" section.
 * Used by every JSON-emitting analysis prompt (planner, director, advisor,
 * workflow generator) so the wording stays identical across them.
 */
export const JSON_OBJECT_ONLY_INSTRUCTION =
  'You MUST respond with ONLY a JSON object (no markdown, no code fences):'

/** Trailing reminder appended to a user message that expects a JSON reply. */
export const RESPOND_JSON_ONLY = 'Respond with JSON only.'

// ---------------------------------------------------------------------------
// Language policy (shared by the Director; available to any multi-turn prompt)
// ---------------------------------------------------------------------------

/**
 * System-prompt rule requiring the model to mirror the language of the upstream
 * agent output across every JSON field it emits.
 */
export const LANGUAGE_RULE =
  'CRITICAL LANGUAGE RULE: You MUST respond in the SAME LANGUAGE as the previous agent\'s output. If the agent wrote in Portuguese, respond in Portuguese. If in English, respond in English. This applies to ALL fields: "reasoning", "message", and "learning". The "message" field is especially important — it will be sent to the next agent, and you MUST include an instruction telling the next agent to also respond in that same language. Example: if the workflow is in Portuguese, start the message with "Responda em português." before the rest of the instructions.'

/** User-message reminder to detect and echo the upstream output's language. */
export const LANGUAGE_ECHO_INSTRUCTION =
  'IMPORTANT: Detect the language of the output above. Your "message" MUST start with an instruction telling the next agent to respond in that same language (e.g., "Responda em português." or "Respond in English."). All your JSON fields (reasoning, message, learning) must also be in that language.'

// ---------------------------------------------------------------------------
// Output truncation
// ---------------------------------------------------------------------------

/**
 * Cap `text` at `max` characters, appending `marker` when it overflows. Replaces
 * the ad-hoc `text.length > N ? text.slice(0, N) + '...' : text` repeated across
 * prompt builders — pass the call site's exact marker to preserve its wording.
 */
export function truncate(text: string, max: number, marker = '...'): string {
  return text.length > max ? text.slice(0, max) + marker : text
}
