import { FastifyInstance } from 'fastify'
import { readdir, stat, lstat, writeFile, mkdir, readFile } from 'fs/promises'
import { join, dirname, resolve, sep, basename } from 'path'
import { homedir } from 'os'
import { z } from 'zod'
import { sendSuccess, sendError, ValidationError } from '../lib/errors'

/** Saved workflow outputs follow this naming scheme (see UI: handleSaveWorkflowOutput
 *  and Output nodes). Output nodes may emit markdown, HTML, or plain text. */
const WORKFLOW_OUTPUT_RE = /^workflow-output-.*\.(md|html|txt)$/
/** Cap previewable file size to avoid loading huge files into memory / the browser. */
const MAX_READ_BYTES = 5 * 1024 * 1024
/** Cap how many output files we stat per listing request (newest-first by name). */
const MAX_OUTPUTS = 500

/** Reject names that could escape the target directory. */
function isUnsafeName(name: string): boolean {
  return name.includes('..') || name.includes('/') || name.includes('\\')
}

const BrowseSchema = z.object({
  path: z.string().optional(),
})

export async function filesystemRoutes(app: FastifyInstance) {
  app.get('/api/fs/browse', async (req, reply) => {
    try {
      const { path: rawPath } = BrowseSchema.parse(req.query)
      const targetPath = resolve(rawPath || homedir())

      // Validate path exists and is a directory
      const stats = await stat(targetPath)
      if (!stats.isDirectory()) {
        return sendError(reply, new ValidationError(`Not a directory: ${targetPath}`))
      }

      const entries = await readdir(targetPath, { withFileTypes: true })

      const dirs = entries
        .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

      // Check if it looks like a git repo
      const hasGit = entries.some((e) => e.name === '.git' && e.isDirectory())

      const parent = dirname(targetPath)

      sendSuccess(reply, {
        current: targetPath,
        parent: parent !== targetPath ? parent : null,
        dirs,
        hasGit,
        sep,
      })
    } catch (error) {
      sendError(reply, error)
    }
  })

  const SaveFileSchema = z.object({
    directory: z.string().min(1),
    filename: z.string().min(1).max(255),
    content: z.string(),
  })

  app.post('/api/fs/save', async (req, reply) => {
    try {
      const { directory, filename, content } = SaveFileSchema.parse(req.body)

      // Prevent path traversal
      if (isUnsafeName(filename)) {
        return sendError(reply, new ValidationError('Invalid filename'))
      }

      const targetDir = resolve(directory)
      const targetPath = join(targetDir, filename)

      // Ensure the resolved path is within the target directory
      if (!targetPath.startsWith(targetDir + sep)) {
        return sendError(reply, new ValidationError('Path traversal detected'))
      }

      // Ensure directory exists
      await mkdir(targetDir, { recursive: true })

      await writeFile(targetPath, content, 'utf-8')

      sendSuccess(reply, { path: targetPath })
    } catch (error) {
      sendError(reply, error)
    }
  })

  const OutputsSchema = z.object({
    directory: z.string().optional(),
  })

  // List saved workflow-output markdown files in a directory, newest first.
  app.get('/api/fs/outputs', async (req, reply) => {
    try {
      const { directory } = OutputsSchema.parse(req.query)
      const targetDir = resolve(directory || homedir())

      const stats = await stat(targetDir)
      if (!stats.isDirectory()) {
        return sendError(reply, new ValidationError(`Not a directory: ${targetDir}`))
      }

      const entries = await readdir(targetDir, { withFileTypes: true })
      // The filename embeds an ISO timestamp, so a lexicographic name sort is
      // chronological — sort then cap before stat() to bound syscall fan-out.
      const matches = entries
        .filter((e) => e.isFile() && WORKFLOW_OUTPUT_RE.test(e.name))
        .map((e) => e.name)
        .sort((a, b) => b.localeCompare(a))
      const truncated = matches.length > MAX_OUTPUTS
      const capped = matches.slice(0, MAX_OUTPUTS)

      const outputs = await Promise.all(
        capped.map(async (name) => {
          const fullPath = join(targetDir, name)
          const fileStats = await stat(fullPath)
          return {
            name,
            path: fullPath,
            size: fileStats.size,
            modifiedAt: fileStats.mtime.toISOString(),
          }
        }),
      )

      // Newest first (ISO timestamps sort lexicographically by time).
      outputs.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))

      sendSuccess(reply, { directory: targetDir, outputs, truncated })
    } catch (error) {
      sendError(reply, error)
    }
  })

  const ReadFileSchema = z.object({
    directory: z.string().min(1),
    name: z.string().min(1).max(255),
  })

  // Read a single saved workflow-output file's text content for previewing.
  // Scoped to the workflow-output naming convention and confined to `directory`
  // so this cannot be used to read arbitrary files on the host.
  app.get('/api/fs/read', async (req, reply) => {
    try {
      const { directory, name } = ReadFileSchema.parse(req.query)

      if (isUnsafeName(name) || !WORKFLOW_OUTPUT_RE.test(name)) {
        return sendError(reply, new ValidationError('Invalid output file name'))
      }

      const targetDir = resolve(directory)
      const targetPath = join(targetDir, name)
      if (!targetPath.startsWith(targetDir + sep)) {
        return sendError(reply, new ValidationError('Path traversal detected'))
      }

      // lstat (not stat) so a symlink planted in the directory cannot redirect
      // the read to a file outside it.
      // Generic message (don't leak fs errno / absolute path probing details).
      let stats
      try {
        stats = await lstat(targetPath)
      } catch {
        return sendError(reply, new ValidationError('Output file not found or not accessible'))
      }
      if (!stats.isFile()) {
        return sendError(reply, new ValidationError('Not a regular file'))
      }
      if (stats.size > MAX_READ_BYTES) {
        return sendError(reply, new ValidationError('File too large to preview'))
      }

      const content = await readFile(targetPath, 'utf-8')

      sendSuccess(reply, {
        name: basename(targetPath),
        path: targetPath,
        content,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      })
    } catch (error) {
      sendError(reply, error)
    }
  })
}
