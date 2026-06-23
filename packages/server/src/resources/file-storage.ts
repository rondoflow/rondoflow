import { appendFile, mkdir, readFile, rm, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { randomUUID } from 'crypto'
import { LIMITS } from '@rondoflow/shared'

export const MAX_FILE_SIZE = LIMITS.MAX_FILE_SIZE_BYTES

// UUID regex used to validate workspace IDs before constructing paths
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Returns the directory where files for a given workspace are stored.
 *
 * If the workspace has a workingDirectory configured, files go into
 * {workingDirectory}/.rondoflow/resources/ — inside the project folder.
 *
 * Otherwise, falls back to ~/.rondoflow/workspaces/{workspaceId}/files/
 */
export function getWorkspaceFilesDir(workspaceId: string, workingDirectory?: string | null): string {
  validateWorkspaceId(workspaceId)

  if (workingDirectory) {
    return join(workingDirectory, '.rondoflow', 'resources')
  }

  return join(homedir(), '.rondoflow', 'workspaces', workspaceId, 'files')
}

/**
 * Ensures the workspace files directory exists, creating it recursively if needed.
 * If the directory is inside a project folder, also adds .rondoflow/ to .gitignore.
 */
export async function ensureWorkspaceDir(workspaceId: string, workingDirectory?: string | null): Promise<void> {
  const dir = getWorkspaceFilesDir(workspaceId, workingDirectory)
  await mkdir(dir, { recursive: true })

  // If storing inside a project, add .rondoflow/ to .gitignore
  if (workingDirectory) {
    await ensureGitignoreEntry(workingDirectory)
  }
}

export interface SavedFile {
  readonly storedName: string
  readonly filePath: string
  readonly fileSize: number
}

/**
 * Persists a file buffer to disk under a UUID-prefixed name.
 * Rejects filenames that contain path-traversal sequences.
 */
export async function saveFile(
  workspaceId: string,
  originalName: string,
  buffer: Buffer,
  workingDirectory?: string | null,
): Promise<SavedFile> {
  validateWorkspaceId(workspaceId)
  validateFileName(originalName)

  if (buffer.byteLength > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)} MB`)
  }

  await ensureWorkspaceDir(workspaceId, workingDirectory)

  const ext = extractExtension(originalName)
  const storedName = `${randomUUID()}${ext}`
  const filePath = join(getWorkspaceFilesDir(workspaceId, workingDirectory), storedName)

  await writeFile(filePath, buffer)

  return { storedName, filePath, fileSize: buffer.byteLength }
}

/**
 * Removes a previously stored file from disk.
 * The storedName must be a plain filename (no directory separators).
 */
export async function deleteFile(workspaceId: string, storedName: string, workingDirectory?: string | null): Promise<void> {
  validateWorkspaceId(workspaceId)
  validateFileName(storedName)

  const filePath = join(getWorkspaceFilesDir(workspaceId, workingDirectory), storedName)
  await rm(filePath, { force: true })
}

// ------------------------------------------------------------------
// Private helpers
// ------------------------------------------------------------------

function validateWorkspaceId(workspaceId: string): void {
  if (!UUID_REGEX.test(workspaceId)) {
    throw new Error(`Invalid workspace ID: "${workspaceId}"`)
  }
}

function validateFileName(name: string): void {
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error(`Rejected filename with path-traversal characters: "${name}"`)
  }
}

function extractExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex <= 0 || dotIndex === filename.length - 1) return ''
  const ext = filename.slice(dotIndex)
  return /^\.[a-zA-Z0-9]{1,10}$/.test(ext) ? ext : ''
}

async function ensureGitignoreEntry(workingDirectory: string): Promise<void> {
  const gitignorePath = join(workingDirectory, '.gitignore')
  try {
    if (existsSync(gitignorePath)) {
      const content = await readFile(gitignorePath, 'utf8')
      if (!content.includes('.rondoflow')) {
        await appendFile(gitignorePath, '\n# rondoflow workspace resources\n.rondoflow/\n')
      }
    } else if (existsSync(join(workingDirectory, '.git'))) {
      // Only create .gitignore if it's a git repo
      await writeFile(gitignorePath, '# rondoflow workspace resources\n.rondoflow/\n')
    }
  } catch {
    // Non-fatal — best effort
  }
}
