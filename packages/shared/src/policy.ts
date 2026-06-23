export type PolicyLevel = 'global' | 'agent' | 'session'

export interface PolicyRules {
  readonly blockedCommands?: readonly string[]
  readonly requireApproval?: readonly string[] | boolean
  readonly maxTimeout?: number
  readonly maxFileSize?: number
  readonly maxBudgetUsd?: number
  readonly permissionMode?: 'default' | 'plan' | 'acceptEdits' | 'dontAsk'
}

export interface Policy {
  readonly id: string
  readonly name: string
  readonly level: PolicyLevel
  readonly rules: PolicyRules
  readonly agentId: string | null
  readonly sessionId: string | null
  readonly createdAt: string
}

export interface CreatePolicyInput {
  readonly name: string
  readonly level: PolicyLevel
  readonly rules: PolicyRules
  readonly agentId?: string
  readonly sessionId?: string
}

export interface ResolvedPolicy {
  readonly blockedCommands: readonly string[]
  readonly requireApproval: readonly string[] | boolean
  readonly maxTimeout: number
  readonly maxFileSize: number
  readonly maxBudgetUsd: number
  readonly permissionMode: string
  readonly sources: readonly Policy[]
}
