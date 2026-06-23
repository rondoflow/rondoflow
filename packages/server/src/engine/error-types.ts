// Agent error taxonomy [G18]

export type AgentErrorType =
  | 'PROCESS_ERROR'    // spawn failed, exit code non-zero
  | 'STREAM_ERROR'     // malformed JSON, unexpected EOF
  | 'API_ERROR'        // Claude API errors (rate limit, auth, overload)
  | 'POLICY_ERROR'     // blocked by policy
  | 'TIMEOUT_ERROR'    // exceeded time limit
  | 'APPROVAL_TIMEOUT' // user didn't respond to approval
  | 'RESOURCE_ERROR'   // max concurrent reached, queue full

export interface AgentError {
  readonly type: AgentErrorType
  readonly message: string
  readonly userMessage: string
  readonly agentId: string
  readonly sessionId?: string
  readonly retryable: boolean
}

const USER_MESSAGES: Record<AgentErrorType, string> = {
  PROCESS_ERROR: 'The agent process failed to start or crashed unexpectedly.',
  STREAM_ERROR: 'An error occurred reading the agent response stream.',
  API_ERROR: 'The Claude API returned an error. This may be a temporary issue — please try again.',
  POLICY_ERROR: 'This action is not permitted by the current policy configuration.',
  TIMEOUT_ERROR: 'The agent took too long to respond and was stopped.',
  APPROVAL_TIMEOUT: 'The approval request expired because no response was received.',
  RESOURCE_ERROR: 'The system is at capacity. Too many agents are running — please wait and try again.',
}

const RETRYABLE: Record<AgentErrorType, boolean> = {
  PROCESS_ERROR: false,
  STREAM_ERROR: true,
  API_ERROR: true,
  POLICY_ERROR: false,
  TIMEOUT_ERROR: true,
  APPROVAL_TIMEOUT: true,
  RESOURCE_ERROR: true,
}

export function getUserMessage(type: AgentErrorType): string {
  return USER_MESSAGES[type]
}

export function classifyError(error: unknown, agentId: string, sessionId?: string): AgentError {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()

  let type: AgentErrorType

  if (lower.includes('rate limit') || lower.includes('429') || lower.includes('overloaded')) {
    type = 'API_ERROR'
  } else if (lower.includes('unauthorized') || lower.includes('401') || lower.includes('api key')) {
    type = 'API_ERROR'
  } else if (lower.includes('policy') || lower.includes('blocked') || lower.includes('not permitted')) {
    type = 'POLICY_ERROR'
  } else if (lower.includes('timeout') || lower.includes('timed out')) {
    // Load-bearing: the spawn-timeout path (spawner.ts / streaming-runner.ts)
    // emits an Error whose message contains "timed out" specifically so it
    // classifies here as TIMEOUT_ERROR — every spawner.on('error') handler then
    // tears the run down without any timeout-specific branching.
    type = 'TIMEOUT_ERROR'
  } else if (lower.includes('queue full') || lower.includes('max concurrent') || lower.includes('capacity')) {
    type = 'RESOURCE_ERROR'
  } else if (lower.includes('json') || lower.includes('parse') || lower.includes('unexpected end')) {
    type = 'STREAM_ERROR'
  } else if (lower.includes('spawn') || lower.includes('enoent') || lower.includes('exit code')) {
    type = 'PROCESS_ERROR'
  } else {
    type = 'PROCESS_ERROR'
  }

  return {
    type,
    message,
    userMessage: getUserMessage(type),
    agentId,
    sessionId,
    retryable: RETRYABLE[type],
  }
}
