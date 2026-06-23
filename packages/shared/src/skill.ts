export type SkillSource = 'marketplace' | 'git' | 'custom'

export interface Skill {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly source: SkillSource
  readonly gitUrl: string | null
  readonly path: string
  readonly version: string | null
  readonly author: string | null
  readonly category: string | null
  readonly icon: string | null
  readonly mcpConfig: McpSkillConfig | null
  readonly installedAt: string
}

export interface McpSkillConfig {
  readonly type: 'stdio'
  readonly command: string
  readonly args: readonly string[]
  readonly env?: Readonly<Record<string, string>>
}

export interface AgentSkill {
  readonly agentId: string
  readonly skillId: string
  readonly priority: number
  readonly enabled: boolean
}

export interface InstallSkillInput {
  readonly name: string
  readonly description: string
  readonly source: SkillSource
  readonly gitUrl?: string
  readonly category?: string
}
