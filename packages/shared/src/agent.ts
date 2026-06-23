import type { ModelTier, AgentPurpose } from './models'
import type { AgentProviderId, OpenAIProviderConfig } from './provider'

export type AgentStatus = 'idle' | 'running' | 'waiting_approval' | 'error'

// 'full' maps to the CLI's bypassPermissions mode — required for an agent to
// write files and run git/bash non-interactively (e.g. over an external folder).
export type AgentMode = 'plan' | 'default' | 'edit' | 'full'

export interface Agent {
  readonly id: string
  readonly name: string
  readonly avatar: string | null
  readonly description: string | null
  readonly persona: string
  readonly purpose: AgentPurpose | null
  readonly scope: readonly string[]
  readonly allowedTools: readonly string[]
  readonly memoryEnabled: boolean
  // The Claude model the agent runs on. Usually a {@link ModelTier} preset
  // ('opus' | 'sonnet' | 'haiku'), but a full model id (e.g. 'claude-opus-4-8')
  // is also allowed and forwarded verbatim to the CLI's --model flag.
  readonly model: ModelTier | string | null
  readonly provider: AgentProviderId
  readonly providerConfig: OpenAIProviderConfig | null
  readonly status: AgentStatus
  readonly permissionMode: AgentMode
  readonly loopEnabled: boolean
  readonly loopCriteria: LoopCriteria | null
  readonly maxIterations: number
  readonly teamEnabled: boolean
  readonly isFavorite: boolean
  readonly canvasX: number
  readonly canvasY: number
  readonly createdAt: string
  readonly updatedAt: string
}

export interface LoopCriteria {
  readonly type: 'regex' | 'test_pass' | 'manual' | 'max_iterations'
  readonly value: string
}

export interface CreateAgentInput {
  readonly name: string
  readonly persona: string
  readonly description?: string
  readonly avatar?: string
  readonly purpose?: AgentPurpose
  readonly scope?: readonly string[]
  readonly allowedTools?: readonly string[]
  readonly memoryEnabled?: boolean
  readonly model?: ModelTier
  readonly provider?: AgentProviderId
  readonly providerConfig?: OpenAIProviderConfig
  readonly permissionMode?: AgentMode
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  readonly status?: AgentStatus
  readonly permissionMode?: AgentMode
  readonly canvasX?: number
  readonly canvasY?: number
  readonly loopEnabled?: boolean
  readonly loopCriteria?: LoopCriteria
  readonly maxIterations?: number
  readonly teamEnabled?: boolean
  readonly isFavorite?: boolean
}
