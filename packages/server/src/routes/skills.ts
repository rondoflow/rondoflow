import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError, NotFoundError, ValidationError } from '../lib/errors'
import { SKILL_CATALOG } from '@rondoflow/catalog'
import {
  installSkill,
  installCustomSkill,
  uninstallSkill,
  updateSkill,
  getSkillContent,
} from '../skills/installer'
import { detectSkillConflicts } from '../skills/conflict-detector'

const CreateSkillSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  source: z.enum(['marketplace', 'git']),
  gitUrl: z.string().optional(),
  path: z.string().min(1),
  version: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
  mcpConfig: z.record(z.unknown()).optional(),
})

const AttachSkillSchema = z.object({
  priority: z.number().int().default(0),
  enabled: z.boolean().default(true),
})

const InstallSkillSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, {
    message: 'Skill name may only contain letters, digits, hyphens, and underscores',
  }),
  source: z.enum(['marketplace', 'git']),
  gitUrl: z.string().url().optional(),
})

const InstallGitSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, {
    message: 'Skill name may only contain letters, digits, hyphens, and underscores',
  }),
  gitUrl: z.string().url(),
})

const InstallCustomSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, {
    message: 'Skill name may only contain letters, digits, hyphens, and underscores',
  }),
  description: z.string().min(1).max(500),
  category: z.string().max(100).optional(),
  content: z.string().min(1).max(50000),
})

// Edit an installed skill. Every field is optional, but at least one must be
// present. `name` is intentionally absent — it is the immutable unique key and
// directory name. `category` accepts null/'' to clear it.
const UpdateSkillSchema = z
  .object({
    description: z.string().min(1).max(500).optional(),
    category: z.string().max(100).nullable().optional(),
    content: z.string().min(1).max(50000).optional(),
  })
  .refine(
    (b) => b.description !== undefined || b.category !== undefined || b.content !== undefined,
    { message: 'At least one of description, category, or content must be provided' },
  )

export async function skillRoutes(app: FastifyInstance) {
  // -------------------------------------------------------------------------
  // Existing CRUD routes
  // -------------------------------------------------------------------------

  app.get('/api/skills', async (_req, reply) => {
    try {
      const skills = await prisma.skill.findMany({
        orderBy: { installedAt: 'desc' },
      })
      sendSuccess(reply, skills)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get<{ Params: { id: string } }>('/api/skills/:id', async (req, reply) => {
    try {
      const skill = await prisma.skill.findUnique({
        where: { id: req.params.id },
        include: { agents: { include: { agent: true } } },
      })
      if (!skill) throw new NotFoundError('Skill', req.params.id)
      sendSuccess(reply, skill)
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * GET /api/skills/:id/content
   * Returns the editable SKILL.md body (frontmatter stripped) for the editor.
   */
  app.get<{ Params: { id: string } }>('/api/skills/:id/content', async (req, reply) => {
    try {
      const result = await getSkillContent(req.params.id)
      if (!result) throw new NotFoundError('Skill', req.params.id)
      sendSuccess(reply, result)
    } catch (error) {
      sendError(reply, error)
    }
  })

  /**
   * PATCH /api/skills/:id
   * Body: { description?, category?, content? }
   *
   * Edits a user-owned skill (custom/git) in place. Built-in catalog skills are
   * read-only and rejected. Re-writes SKILL.md and re-syncs the DB row.
   */
  app.patch<{ Params: { id: string } }>('/api/skills/:id', async (req, reply) => {
    try {
      const body = UpdateSkillSchema.parse(req.body)

      const existing = await prisma.skill.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('Skill', req.params.id)
      if (existing.source === 'marketplace') {
        throw new ValidationError('Built-in catalog skills cannot be edited')
      }

      const result = await updateSkill({ id: req.params.id, ...body })
      if (!result.success) {
        throw new ValidationError(result.error ?? 'Skill update failed')
      }

      sendSuccess(reply, result.skill)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/skills', async (req, reply) => {
    try {
      const body = CreateSkillSchema.parse(req.body)
      const skill = await prisma.skill.create({ data: { ...body, mcpConfig: body.mcpConfig as any } })
      sendSuccess(reply, skill, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.delete<{ Params: { id: string } }>('/api/skills/:id', async (req, reply) => {
    try {
      const existing = await prisma.skill.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('Skill', req.params.id)
      await prisma.skill.delete({ where: { id: req.params.id } })
      sendSuccess(reply, { deleted: true })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post<{ Params: { agentId: string; skillId: string } }>(
    '/api/agents/:agentId/skills/:skillId',
    async (req, reply) => {
      try {
        const { agentId, skillId } = req.params
        const body = AttachSkillSchema.parse(req.body ?? {})

        const agent = await prisma.agent.findUnique({ where: { id: agentId } })
        if (!agent) throw new NotFoundError('Agent', agentId)

        const skill = await prisma.skill.findUnique({ where: { id: skillId } })
        if (!skill) throw new NotFoundError('Skill', skillId)

        const agentSkill = await prisma.agentSkill.upsert({
          where: { agentId_skillId: { agentId, skillId } },
          create: { agentId, skillId, ...body },
          update: body,
          include: { skill: true },
        })
        sendSuccess(reply, agentSkill, 201)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  app.delete<{ Params: { agentId: string; skillId: string } }>(
    '/api/agents/:agentId/skills/:skillId',
    async (req, reply) => {
      try {
        const { agentId, skillId } = req.params

        const existing = await prisma.agentSkill.findUnique({
          where: { agentId_skillId: { agentId, skillId } },
        })
        if (!existing) {
          throw new NotFoundError(`AgentSkill(agent=${agentId}, skill=${skillId})`, '')
        }

        await prisma.agentSkill.delete({
          where: { agentId_skillId: { agentId, skillId } },
        })
        sendSuccess(reply, { deleted: true })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // -------------------------------------------------------------------------
  // Catalog
  // -------------------------------------------------------------------------

  /**
   * GET /api/skills/catalog
   * Returns the list of built-in marketplace skills.
   */
  app.get('/api/skills/catalog', async (_req, reply) => {
    try {
      // Strip skillMdContent from the listing response — it can be large and
      // is only needed when the client explicitly installs the skill.
      const catalog = SKILL_CATALOG.map(({ skillMdContent: _omit, ...rest }) => rest)
      sendSuccess(reply, catalog)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // -------------------------------------------------------------------------
  // Install from catalog or git (unified endpoint)
  // -------------------------------------------------------------------------

  /**
   * POST /api/skills/install
   * Body: { name, source: 'marketplace' | 'git', gitUrl? }
   *
   * For marketplace source the name must match a catalog entry.
   * For git source a gitUrl is required.
   */
  app.post('/api/skills/install', async (req, reply) => {
    try {
      const body = InstallSkillSchema.parse(req.body)

      let catalogEntry = undefined
      if (body.source === 'marketplace') {
        catalogEntry = SKILL_CATALOG.find((s) => s.name === body.name)
        if (!catalogEntry) {
          throw new ValidationError(
            `Skill "${body.name}" not found in the built-in catalog. ` +
              `Available skills: ${SKILL_CATALOG.map((s) => s.name).join(', ')}`,
          )
        }
      }

      if (body.source === 'git' && !body.gitUrl) {
        throw new ValidationError('gitUrl is required when source is "git"')
      }

      const result = await installSkill({
        name: body.name,
        source: body.source,
        gitUrl: body.gitUrl,
        catalogEntry,
      })

      if (!result.success) {
        throw new ValidationError(result.error ?? 'Install failed')
      }

      sendSuccess(reply, result.skill, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // -------------------------------------------------------------------------
  // Install from git (dedicated endpoint)
  // -------------------------------------------------------------------------

  /**
   * POST /api/skills/install/git
   * Body: { name, gitUrl }
   *
   * Clones only SKILL.md and rondoflow.json from the repository (no code execution).
   */
  app.post('/api/skills/install/git', async (req, reply) => {
    try {
      const body = InstallGitSchema.parse(req.body)

      const result = await installSkill({
        name: body.name,
        source: 'git',
        gitUrl: body.gitUrl,
      })

      if (!result.success) {
        throw new ValidationError(result.error ?? 'Git install failed')
      }

      sendSuccess(reply, result.skill, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // -------------------------------------------------------------------------
  // Create a custom (user-authored) skill
  // -------------------------------------------------------------------------

  /**
   * POST /api/skills/install/custom
   * Body: { name, description, category?, content }
   *
   * Writes a SKILL.md (with generated frontmatter) to ~/.rondoflow/skills/<name>
   * and registers it. `content` is the skill's instructions/body.
   */
  app.post('/api/skills/install/custom', async (req, reply) => {
    try {
      const body = InstallCustomSchema.parse(req.body)

      const result = await installCustomSkill({
        name: body.name,
        description: body.description,
        category: body.category,
        content: body.content,
      })

      if (!result.success) {
        throw new ValidationError(result.error ?? 'Custom skill creation failed')
      }

      sendSuccess(reply, result.skill, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // -------------------------------------------------------------------------
  // Conflict detection
  // -------------------------------------------------------------------------

  /**
   * GET /api/agents/:agentId/skills/conflicts
   * Returns heuristic conflict warnings for the enabled skills on an agent.
   */
  app.get<{ Params: { agentId: string } }>(
    '/api/agents/:agentId/skills/conflicts',
    async (req, reply) => {
      try {
        const { agentId } = req.params

        const agent = await prisma.agent.findUnique({ where: { id: agentId } })
        if (!agent) throw new NotFoundError('Agent', agentId)

        const result = await detectSkillConflicts(agentId)
        sendSuccess(reply, result)
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // -------------------------------------------------------------------------
  // Uninstall (extended delete — removes from filesystem too)
  // -------------------------------------------------------------------------

  /**
   * DELETE /api/skills/:id/uninstall
   * Removes the skill record and its directory from ~/.rondoflow/skills/.
   */
  app.delete<{ Params: { id: string } }>('/api/skills/:id/uninstall', async (req, reply) => {
    try {
      const existing = await prisma.skill.findUnique({ where: { id: req.params.id } })
      if (!existing) throw new NotFoundError('Skill', req.params.id)

      await uninstallSkill(req.params.id)
      sendSuccess(reply, { deleted: true })
    } catch (error) {
      sendError(reply, error)
    }
  })
}
