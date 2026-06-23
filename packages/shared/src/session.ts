export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'

export interface Session {
  readonly id: string
  readonly agentId: string | null
  readonly tableId: string | null
  readonly startedAt: string
  readonly endedAt: string | null
}

export interface Message {
  readonly id: string
  readonly sessionId: string
  readonly role: MessageRole
  readonly content: string
  readonly toolUse: ToolUseData | null
  readonly rawEvent: unknown | null
  readonly tokenCount: number | null
  readonly timestamp: string
}

export interface ToolUseData {
  readonly toolName: string
  readonly input: unknown
  readonly output: unknown
}

export interface SessionWithMessages extends Session {
  readonly messages: readonly Message[]
}

export interface TokenUsage {
  readonly inputTokens: number
  readonly outputTokens: number
  readonly estimatedCostUsd: number
}
