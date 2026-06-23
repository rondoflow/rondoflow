import { realpath, stat, readdir } from 'fs/promises'
import { realpathSync } from 'fs'
import { isAbsolute, sep, join, basename } from 'path'
import { ValidationError } from './errors'

/**
 * External folders are host directories bind-mounted into the server container
 * (see docker-compose.yml). Every registered folder must resolve UNDER this
 * in-container root, which both confines what can be exposed to agents and
 * proves the bind mount actually succeeded.
 */
export function getExternalFoldersRoot(): string {
  return process.env['EXTERNAL_FOLDERS_CONTAINER_ROOT']?.trim() || '/external'
}

export interface AvailableFolder {
  readonly name: string
  readonly containerPath: string
}

export interface AvailableFoldersResult {
  readonly rootExists: boolean
  readonly root: string
  readonly candidates: readonly AvailableFolder[]
}

/**
 * Resolves the canonical real path of the external folders root.
 * Throws a ValidationError if the root is not mounted (ENOENT).
 */
async function resolveRoot(): Promise<string> {
  const root = getExternalFoldersRoot()
  try {
    return realpathSync(root)
  } catch {
    throw new ValidationError(
      `External folders root "${root}" is not mounted in the container. ` +
        'Add a bind mount to docker-compose.yml (and the matching path in .env), then restart the server.',
    )
  }
}

/**
 * Validates a user-supplied container path and returns its canonical resolved
 * path. The path must be absolute, contain no traversal sequences, exist, be a
 * directory, and resolve (after following symlinks) under the external folders
 * root. Throws ValidationError otherwise.
 */
export async function validateContainerPath(input: string): Promise<string> {
  const trimmed = input?.trim()
  if (!trimmed) {
    throw new ValidationError('containerPath is required')
  }
  if (!isAbsolute(trimmed)) {
    throw new ValidationError(`containerPath must be an absolute path: "${trimmed}"`)
  }
  // Defense in depth — reject traversal before resolution.
  if (trimmed.split(/[/\\]/).includes('..')) {
    throw new ValidationError(`containerPath must not contain ".." segments: "${trimmed}"`)
  }

  const root = await resolveRoot()

  let resolved: string
  try {
    resolved = await realpath(trimmed)
  } catch {
    throw new ValidationError(
      `Path does not exist in the container: "${trimmed}". Did you add the bind mount and restart the server?`,
    )
  }

  // Containment check on the REAL paths — rejects a symlink inside the root
  // that points elsewhere (e.g. /external/link -> /etc).
  if (resolved !== root && !resolved.startsWith(root + sep)) {
    throw new ValidationError(
      `Path "${trimmed}" resolves outside the external folders root "${root}".`,
    )
  }

  const st = await stat(resolved)
  if (!st.isDirectory()) {
    throw new ValidationError(`Path is not a directory: "${trimmed}"`)
  }

  return resolved
}

/**
 * Scans the external folders root for immediate subdirectories so the UI can
 * show what is actually mounted. Never throws — returns rootExists: false when
 * the root is missing.
 */
export async function listAvailableFolders(): Promise<AvailableFoldersResult> {
  const configured = getExternalFoldersRoot()
  let root: string
  try {
    root = realpathSync(configured)
  } catch {
    return { rootExists: false, root: configured, candidates: [] }
  }

  const candidates: AvailableFolder[] = []
  try {
    const entries = await readdir(root, { withFileTypes: true })
    for (const entry of entries) {
      const containerPath = join(root, entry.name)
      if (entry.isDirectory()) {
        candidates.push({ name: entry.name, containerPath })
        continue
      }
      // Follow symlinks, but only keep ones that resolve to a directory under the root.
      if (entry.isSymbolicLink()) {
        try {
          const resolved = await realpath(containerPath)
          if (resolved !== root && !resolved.startsWith(root + sep)) continue
          const st = await stat(resolved)
          if (st.isDirectory()) candidates.push({ name: entry.name, containerPath })
        } catch {
          // Broken symlink — skip.
        }
      }
    }
  } catch {
    return { rootExists: false, root, candidates: [] }
  }

  candidates.sort((a, b) => a.name.localeCompare(b.name))
  return { rootExists: true, root, candidates }
}

/** Suggests a display name from a container path (its last segment). */
export function suggestFolderName(containerPath: string): string {
  return basename(containerPath) || containerPath
}
