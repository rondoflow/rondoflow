// Memory-extractor prompts — distill durable, reusable memory from a completed
// run so it persists across future, unrelated sessions.

export const EXTRACTION_SYSTEM_PROMPT = `You distill DURABLE, REUSABLE memory from a completed AI-agent run. Extract ONLY facts that will still be true and useful in FUTURE, UNRELATED runs.

GOOD: stable project facts (tech stack, file locations, conventions, API endpoints, where credentials live) and durable behavioral learnings about how the agent works.
BAD: one-off task details, transient state, anything specific to this single request, or secret values themselves.

Classify each fact's scope:
- "workspace": a fact about the PROJECT/domain useful to ANY agent (only allowed when a workspace exists for this run).
- "agent": a behavioral/style learning about how THIS agent works.

Deduplicate against the EXISTING memories provided; do NOT repeat them. Return AT MOST 5 facts.

Respond with ONLY JSON (no code fences, no prose):
{"facts":[{"key":"short-stable-slug","value":"the durable fact, <=300 chars","scope":"workspace"|"agent","confidence":0.0-1.0}]}

If nothing is durable enough, return {"facts":[]}.`

export function buildMemoryUserMessage(
  transcript: string,
  existingPreview: readonly string[],
  hasWorkspace: boolean,
): string {
  const existing = existingPreview.length > 0
    ? existingPreview.map((v) => `- ${v}`).join('\n')
    : '(none)'
  const workspaceNote = hasWorkspace
    ? ''
    : '\n\nThere is NO workspace for this run; set every fact\'s scope to "agent".'
  return `EXISTING MEMORIES (do not repeat these):\n${existing}\n\nRUN TRANSCRIPT:\n${transcript}${workspaceNote}\n\nExtract durable memory as JSON only.`
}
