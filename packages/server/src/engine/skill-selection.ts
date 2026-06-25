// Skill selection — ranks the shipped skill catalog by relevance to a task and
// renders a compact list for prompt injection. The Planner and WorkflowGenerator
// both dump available skills into their system prompts; injecting the FULL catalog
// scales linearly (~25 tokens/skill → 50K+ tokens at thousands of skills) into
// every plan/generate call. We instead inject only the most relevant subset.

import { SKILL_CATALOG, type CatalogSkill } from '@rondoflow/catalog'
import { SKILL_SELECTION } from '@rondoflow/shared'

// Cap on skills rendered into a prompt. Below this the whole catalog is shown
// (no point filtering); above it we keep the top-N by relevance to the task.
export const MAX_SKILLS_IN_PROMPT = SKILL_SELECTION.MAX_SKILLS_IN_PROMPT

// Common words that carry no signal for matching a task to a skill.
const STOP_WORDS = new Set<string>(SKILL_SELECTION.STOP_WORDS)

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t))
}

// Term-overlap score: matches on id/name/category weigh more than description.
function scoreSkill(skill: CatalogSkill, queryTerms: ReadonlySet<string>): number {
  let score = 0
  for (const term of new Set(tokenize(`${skill.id} ${skill.name} ${skill.category}`))) {
    if (queryTerms.has(term)) score += 3
  }
  for (const term of new Set(tokenize(skill.description))) {
    if (queryTerms.has(term)) score += 1
  }
  return score
}

/**
 * Return the skills most relevant to `query`, capped at `limit`. When the
 * catalog already fits under the cap, returns it untouched. When no skill
 * matches the query, falls back to curated catalog order (the first N), so the
 * caller never gets an empty list.
 */
export function selectRelevantSkills(
  query: string,
  limit = MAX_SKILLS_IN_PROMPT,
): readonly CatalogSkill[] {
  if (SKILL_CATALOG.length <= limit) return SKILL_CATALOG

  const queryTerms = new Set(tokenize(query))
  return SKILL_CATALOG
    .map((skill, index) => ({ skill, index, score: scoreSkill(skill, queryTerms) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((r) => r.skill)
}

/**
 * Render the relevant skills as a bullet list for a system prompt. When the
 * catalog is truncated, appends a line noting how many were omitted so the
 * model knows the list is a relevance-filtered subset, not the whole catalog.
 */
export function formatSkillsForPrompt(
  query: string,
  limit = MAX_SKILLS_IN_PROMPT,
): string {
  const selected = selectRelevantSkills(query, limit)
  const lines = selected.map(
    (s) => `  - **${s.id}** (${s.category}): ${s.description}`,
  )

  const omitted = SKILL_CATALOG.length - selected.length
  if (omitted > 0) {
    lines.push(
      `  …and ${omitted} more skill(s) not shown — these are the ${selected.length} most relevant to this task.`,
    )
  }

  return lines.join('\n')
}
