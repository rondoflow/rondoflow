// Persistent cross-session memory — shared types.
// A Memory row is EITHER agent-scoped (agentId set, workspaceId null) OR
// workspace-scoped (workspaceId set, agentId null).

export type MemoryScope = 'agent' | 'workspace'

export type MemorySource = 'manual' | 'auto' | 'director'

export interface Memory {
  readonly id: string
  readonly agentId: string | null
  readonly workspaceId: string | null
  readonly scope: MemoryScope
  readonly source: MemorySource
  readonly key: string
  readonly value: string
  readonly pinned: boolean
  readonly importance: number
  readonly createdAt: string
  readonly updatedAt: string
}

export interface CreateMemoryInput {
  readonly key: string
  readonly value: string
  readonly source?: MemorySource
  readonly pinned?: boolean
  readonly importance?: number
}

export interface UpdateMemoryInput {
  readonly value?: string
  readonly pinned?: boolean
  readonly importance?: number
  readonly source?: MemorySource
}
