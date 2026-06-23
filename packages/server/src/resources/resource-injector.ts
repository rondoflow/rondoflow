import { relative, isAbsolute } from 'path'
import { prisma } from '../lib/prisma'
import { getWorkspaceFilesDir } from './file-storage'
import { decrypt } from './encryption'

export interface WorkspaceContext {
  readonly addDirs: string[]
  readonly appendPromptSections: string[]
  readonly env: Record<string, string>
  readonly cwd?: string
}

/**
 * Builds the workspace context that is merged into a spawn config before
 * launching an agent.  Each resource type contributes differently:
 *
 * - file      → files directory added to addDirs, manifest appended to prompt
 * - url       → reference URLs appended to prompt
 * - note      → note content appended to prompt
 * - variable  → injected into env (secrets are decrypted first)
 */
export async function buildWorkspaceContext(workspaceId: string): Promise<WorkspaceContext> {
  const [workspace, resources] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { contextDocument: true, workingDirectory: true } }),
    prisma.workspaceResource.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const addDirs: string[] = []
  const appendPromptSections: string[] = []
  const env: Record<string, string> = {}

  // Workspace context document — prepended before all resources
  if (workspace?.contextDocument) {
    appendPromptSections.push(
      `## Workspace Context\n${workspace.contextDocument}`,
    )
  }

  const fileResources = resources.filter((r) => r.type === 'file')
  const urlResources = resources.filter((r) => r.type === 'url')
  const noteResources = resources.filter((r) => r.type === 'note')
  const variableResources = resources.filter((r) => r.type === 'variable')

  // Files — make uploaded files reachable and discoverable by the agent.
  // The agent must always be told the files exist AND where to read them.
  if (fileResources.length > 0) {
    const workingDirectory = workspace?.workingDirectory ?? null
    const filesDir = getWorkspaceFilesDir(workspaceId, workingDirectory)

    // When files live in legacy storage (outside the project), the agent's cwd is
    // the project root and cannot reach them — grant access via addDirs.
    // When files live inside workingDirectory (under .rondoflow/resources/) the
    // agent already has access through its cwd, so addDirs is unnecessary.
    if (!workingDirectory) {
      addDirs.push(filesDir)
    }

    const manifestEntries = fileResources.map((r) => {
      const sizeLabel = r.fileSize !== null ? formatBytes(r.fileSize) : 'unknown size'
      const path = resolveReadablePath(r.filePath, filesDir, r.name, workingDirectory)
      return `- ${r.name} (${sizeLabel}) → ${path}`
    })
    appendPromptSections.push(
      `## Workspace Files\nThe following files are available. Read them from the paths shown when relevant to the task:\n${manifestEntries.join('\n')}`,
    )
  }

  // URLs
  if (urlResources.length > 0) {
    const urlLines = urlResources.map((r) => {
      const desc = r.description ? ` — ${r.description}` : ''
      return `- ${r.name}${desc}: ${r.url ?? ''}`
    })
    appendPromptSections.push(
      `## Workspace Reference URLs\n${urlLines.join('\n')}`,
    )
  }

  // Notes
  if (noteResources.length > 0) {
    const noteParts = noteResources.map((r) => {
      const header = r.description ? `### ${r.name}\n_${r.description}_\n` : `### ${r.name}\n`
      return `${header}${r.content ?? ''}`
    })
    appendPromptSections.push(
      `## Workspace Notes\n${noteParts.join('\n\n')}`,
    )
  }

  // Variables
  for (const resource of variableResources) {
    if (!resource.varKey) continue

    let value: string
    if (resource.isSecret && resource.varValue) {
      try {
        value = decrypt(resource.varValue)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(
          `[resource-injector] Failed to decrypt secret variable "${resource.varKey}" ` +
          `for workspace ${workspaceId}: ${message}`,
        )
        continue
      }
    } else {
      value = resource.varValue ?? ''
    }

    env[resource.varKey] = value
  }

  return {
    addDirs,
    appendPromptSections,
    env,
    ...(workspace?.workingDirectory ? { cwd: workspace.workingDirectory } : {}),
  }
}

// ------------------------------------------------------------------
// Private helpers
// ------------------------------------------------------------------

/**
 * Returns the path the agent should use to read a file resource.
 *
 * When files live inside the project (workingDirectory set), the agent runs with
 * cwd = workingDirectory, so a path relative to it (e.g. .rondoflow/resources/uuid.ext)
 * is the most ergonomic reference. Otherwise the stored absolute path is used.
 * Falls back to the files directory + name when no stored path is available.
 */
function resolveReadablePath(
  filePath: string | null,
  filesDir: string,
  name: string,
  workingDirectory: string | null,
): string {
  const absolute = filePath ?? `${filesDir}/${name}`

  if (workingDirectory && isAbsolute(absolute)) {
    const rel = relative(workingDirectory, absolute)
    // Only use the relative form when it stays inside the working directory
    if (rel && !rel.startsWith('..') && !isAbsolute(rel)) {
      return `./${rel}`
    }
  }

  return absolute
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
