// Policy enforcement: checks a tool_use event against a resolved policy.
// This module is pure (no I/O) and fully testable in isolation.

import type { ResolvedPolicy } from '@rondoflow/shared'

export interface CheckResult {
  readonly allowed: boolean
  readonly requiresApproval: boolean
  readonly reason?: string
  readonly matchedRule?: string
}

/**
 * Evaluate a tool invocation against a resolved policy.
 *
 * Evaluation order:
 *   1. Extract the effective command string (Bash → `command` arg; others → toolName)
 *   2. Check blockedCommands — if matched, block immediately
 *   3. Check requireApproval — if matched, allow but flag for human review
 */
export function checkToolUse(
  toolName: string,
  toolInput: unknown,
  resolvedPolicy: ResolvedPolicy,
): CheckResult {
  const commandStr = extractCommand(toolName, toolInput)

  // --- Blocked commands check ---
  const blockedMatch = findMatch(commandStr, toolName, resolvedPolicy.blockedCommands)
  if (blockedMatch !== null) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: `Command blocked by policy: "${blockedMatch}"`,
      matchedRule: blockedMatch,
    }
  }

  // --- Require-approval check ---
  const approvalRequired = checkApprovalRequired(commandStr, toolName, resolvedPolicy.requireApproval)
  if (approvalRequired !== null) {
    return {
      allowed: true,
      requiresApproval: true,
      reason: `Command requires human approval: "${approvalRequired}"`,
      matchedRule: approvalRequired,
    }
  }

  return { allowed: true, requiresApproval: false }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Extract a representative command string from the tool invocation.
 * For the Bash tool the meaningful string is the `command` input field.
 * For all other tools we fall back to the tool name itself so that
 * patterns like "Write" or "WebFetch" can be matched.
 */
function extractCommand(toolName: string, toolInput: unknown): string {
  if (
    toolName === 'Bash' &&
    toolInput !== null &&
    typeof toolInput === 'object' &&
    'command' in toolInput &&
    typeof (toolInput as Record<string, unknown>)['command'] === 'string'
  ) {
    return (toolInput as Record<string, string>)['command']
  }
  return toolName
}

/**
 * Check whether a command matches any pattern in the blocked list.
 * Returns the matched pattern string, or null if no match.
 *
 * Matching strategy:
 *   - Exact equality (case-sensitive)
 *   - The pattern appears anywhere in the command string (includes)
 *   - The command starts with the pattern (startsWith)
 */
function findMatch(
  commandStr: string,
  toolName: string,
  patterns: readonly string[],
): string | null {
  for (const pattern of patterns) {
    if (matchesPattern(commandStr, pattern) || matchesPattern(toolName, pattern)) {
      return pattern
    }
  }
  return null
}

function matchesPattern(subject: string, pattern: string): boolean {
  return (
    subject === pattern ||
    subject.includes(pattern) ||
    subject.startsWith(pattern)
  )
}

/**
 * Evaluate requireApproval against the command.
 * Returns the matched pattern (or 'all') when approval is needed, null otherwise.
 */
function checkApprovalRequired(
  commandStr: string,
  toolName: string,
  requireApproval: readonly string[] | boolean,
): string | null {
  if (requireApproval === true) {
    return 'all'
  }

  if (requireApproval === false || requireApproval.length === 0) {
    return null
  }

  return findMatch(commandStr, toolName, requireApproval)
}
