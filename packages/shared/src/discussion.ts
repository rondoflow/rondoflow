export type DiscussionFormat = 'brainstorm' | 'review' | 'deliberation'
export type DiscussionStatus = 'draft' | 'active' | 'concluded'
export type ParticipantRole = 'participant' | 'observer' | 'devil_advocate'

export interface DiscussionTable {
  readonly id: string
  readonly name: string
  readonly topic: string
  readonly format: DiscussionFormat
  readonly moderatorId: string
  readonly status: DiscussionStatus
  readonly conclusion: string | null
  readonly maxRounds: number
  readonly createdAt: string
  readonly updatedAt: string
}

export interface TableParticipant {
  readonly tableId: string
  readonly agentId: string
  readonly role: ParticipantRole
}

export interface CreateDiscussionInput {
  readonly name: string
  readonly topic: string
  readonly format: DiscussionFormat
  readonly moderatorId: string
  readonly maxRounds?: number
  readonly participants: readonly { agentId: string; role: ParticipantRole }[]
}
