import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sendSuccess, sendError, NotFoundError } from '../lib/errors'
import { prisma } from '../lib/prisma'
import * as git from '../lib/git'

const PathsSchema = z.object({
  paths: z.array(z.string().min(1)).min(1),
})

const CommitSchema = z.object({
  message: z.string().min(1).max(1000),
})

const LogQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(30),
  workspaceId: z.string().uuid().optional(),
})

const DiffQuerySchema = z.object({
  file: z.string().optional(),
  workspaceId: z.string().uuid().optional(),
})

const WorkspaceQuerySchema = z.object({
  workspaceId: z.string().uuid().optional(),
})

const PathsWithWorkspaceSchema = z.object({
  paths: z.array(z.string().min(1)).min(1),
  workspaceId: z.string().uuid().optional(),
})

const CommitWithWorkspaceSchema = z.object({
  message: z.string().min(1).max(1000),
  workspaceId: z.string().uuid().optional(),
})

const PushSchema = z.object({
  workspaceId: z.string().uuid().optional(),
})

async function resolveGitCwd(
  workspaceId: string | undefined,
): Promise<string | undefined> {
  if (!workspaceId) return undefined
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { workingDirectory: true },
  })
  // Shared team pool — any authenticated user may operate on any workspace's
  // repository. Write/run gating (commit/push) is enforced by the role middleware.
  if (!ws) throw new NotFoundError('Workspace', workspaceId)
  return ws.workingDirectory ?? undefined
}

export async function gitRoutes(app: FastifyInstance) {
  app.get('/api/git/status', async (req, reply) => {
    try {
      const { workspaceId } = WorkspaceQuerySchema.parse(req.query)
      const cwd = await resolveGitCwd(workspaceId)
      const status = await git.getStatus(cwd)
      sendSuccess(reply, status)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get('/api/git/log', async (req, reply) => {
    try {
      const { limit, workspaceId } = LogQuerySchema.parse(req.query)
      const cwd = await resolveGitCwd(workspaceId)
      const log = await git.getLog(limit, cwd)
      sendSuccess(reply, log)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get('/api/git/branches', async (req, reply) => {
    try {
      const { workspaceId } = WorkspaceQuerySchema.parse(req.query)
      const cwd = await resolveGitCwd(workspaceId)
      const branches = await git.getBranches(cwd)
      sendSuccess(reply, branches)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.get('/api/git/diff', async (req, reply) => {
    try {
      const { file, workspaceId } = DiffQuerySchema.parse(req.query)
      const cwd = await resolveGitCwd(workspaceId)
      const diff = await git.getDiff(file, cwd)
      sendSuccess(reply, diff)
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/git/stage', async (req, reply) => {
    try {
      const { paths, workspaceId } = PathsWithWorkspaceSchema.parse(req.body)
      const cwd = await resolveGitCwd(workspaceId)
      await git.stageFiles(paths, cwd)
      sendSuccess(reply, { staged: paths })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/git/unstage', async (req, reply) => {
    try {
      const { paths, workspaceId } = PathsWithWorkspaceSchema.parse(req.body)
      const cwd = await resolveGitCwd(workspaceId)
      await git.unstageFiles(paths, cwd)
      sendSuccess(reply, { unstaged: paths })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/git/commit', async (req, reply) => {
    try {
      const { message, workspaceId } = CommitWithWorkspaceSchema.parse(req.body)
      const cwd = await resolveGitCwd(workspaceId)
      const hash = await git.commit(message, cwd)
      sendSuccess(reply, { hash, message })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Checkout / switch branch
  app.post('/api/git/checkout', async (req, reply) => {
    try {
      const { branch, workspaceId } = z.object({
        branch: z.string().min(1).max(200),
        workspaceId: z.string().uuid().optional(),
      }).parse(req.body)
      const cwd = await resolveGitCwd(workspaceId)
      await git.checkoutBranch(branch, cwd)
      const status = await git.getStatus(cwd)
      sendSuccess(reply, status)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Create and switch to a new branch
  app.post('/api/git/branch', async (req, reply) => {
    try {
      const { name, startPoint, workspaceId } = z.object({
        name: z.string().min(1).max(200),
        startPoint: z.string().max(200).optional(),
        workspaceId: z.string().uuid().optional(),
      }).parse(req.body)
      const cwd = await resolveGitCwd(workspaceId)
      await git.createBranch(name, startPoint, cwd)
      const status = await git.getStatus(cwd)
      sendSuccess(reply, status, 201)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Get remote origin URL
  app.get('/api/git/remote', async (req, reply) => {
    try {
      const { workspaceId } = WorkspaceQuerySchema.parse(req.query)
      const cwd = await resolveGitCwd(workspaceId)
      const url = await git.getRemoteUrl(cwd)
      sendSuccess(reply, { url })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.post('/api/git/push', async (req, reply) => {
    try {
      const { workspaceId } = PushSchema.parse(req.body)
      const cwd = await resolveGitCwd(workspaceId)
      const result = await git.push(cwd)
      sendSuccess(reply, result)
    } catch (error) {
      sendError(reply, error)
    }
  })
}
