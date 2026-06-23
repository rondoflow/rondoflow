// Result of a live Claude API connectivity + auth probe.
// Produced by the server's testClaudeConnection() and consumed by the canvas
// Start node (manual "Test" button) and the pre-run gate.

export type ClaudeAuthMethod = 'setup-token' | 'api-key'

export type ClaudeConnectionFailureReason =
  | 'no_credential' // no ANTHROPIC_API_KEY / CLAUDE_CODE_OAUTH_TOKEN configured
  | 'auth' // 401 — credential invalid or expired
  | 'forbidden' // 403 — credential lacks access
  | 'http' // other non-2xx status
  | 'network' // request failed or timed out before a response

export interface ClaudeConnectionResult {
  /** Whether the probe reached the Claude API and authenticated successfully. */
  readonly ok: boolean
  /** Which credential was used for the probe (null when none was configured). */
  readonly method: ClaudeAuthMethod | null
  /** Round-trip latency of the probe in milliseconds, when a request was made. */
  readonly latencyMs?: number
  /** HTTP status returned by the Claude API, when a request was made. */
  readonly status?: number
  /** Number of models returned by the probe, on success. */
  readonly modelCount?: number
  /** Human-readable summary suitable for display (success or failure). */
  readonly message: string
  /** Machine-readable failure reason — absent on success. */
  readonly reason?: ClaudeConnectionFailureReason
}
