import { prisma } from '../lib/prisma'
import type { McpSkillConfig } from '@rondoflow/shared'

export interface SkillConflict {
  skillA: string
  skillB: string
  type: 'contradictory_instructions' | 'duplicate_tools' | 'scope_overlap'
  description: string
}

export interface ConflictResult {
  hasConflicts: boolean
  conflicts: SkillConflict[]
}

interface SkillRecord {
  id: string
  name: string
  category: string | null
  mcpConfig: unknown
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function detectSkillConflicts(agentId: string): Promise<ConflictResult> {
  const agentSkills = await prisma.agentSkill.findMany({
    where: { agentId, enabled: true },
    include: { skill: true },
    orderBy: { priority: 'asc' },
  })

  if (agentSkills.length < 2) {
    return { hasConflicts: false, conflicts: [] }
  }

  const skills: SkillRecord[] = agentSkills.map(
    (row: { skill: { id: string; name: string; category: string | null; mcpConfig: unknown } }) => ({
      id: row.skill.id,
      name: row.skill.name,
      category: row.skill.category,
      mcpConfig: row.skill.mcpConfig,
    }),
  )

  const conflicts: SkillConflict[] = []

  // Check each pair
  for (let i = 0; i < skills.length; i++) {
    for (let j = i + 1; j < skills.length; j++) {
      const a = skills[i] as SkillRecord
      const b = skills[j] as SkillRecord

      // Heuristic 1: same category may produce overlapping/contradictory instructions
      if (a.category && b.category && a.category === b.category) {
        conflicts.push({
          skillA: a.name,
          skillB: b.name,
          type: 'scope_overlap',
          description:
            `Both "${a.name}" and "${b.name}" belong to the "${a.category}" category. ` +
            'Their instructions may overlap or contradict each other.',
        })
      }

      // Heuristic 2: two MCP skills sharing the same server command are duplicates
      const mcpA = a.mcpConfig as McpSkillConfig | null
      const mcpB = b.mcpConfig as McpSkillConfig | null

      if (mcpA && mcpB && mcpA.command === mcpB.command) {
        conflicts.push({
          skillA: a.name,
          skillB: b.name,
          type: 'duplicate_tools',
          description:
            `Both "${a.name}" and "${b.name}" register the same MCP server command ` +
            `"${mcpA.command}". Only one MCP server instance can be registered per command.`,
        })
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  }
}
