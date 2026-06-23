import { spawn } from 'child_process'
import type { GitStatusResult, GitFileEntry, GitLogEntry, GitBranchEntry, GitPushResult } from '@rondoflow/shared'
import { ValidationError } from './errors'

// ─── Core helper ────────────────────────────────────────────────────────────

function runGit(args: string[], cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('git', args, {
      cwd: cwd ?? process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const stdout: Buffer[] = []
    const stderr: Buffer[] = []

    proc.stdout.on('data', (chunk: Buffer) => stdout.push(chunk))
    proc.stderr.on('data', (chunk: Buffer) => stderr.push(chunk))

    proc.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        reject(new ValidationError('Git is not installed or not found in PATH'))
      } else {
        reject(err)
      }
    })

    proc.on('close', (code) => {
      const out = Buffer.concat(stdout).toString('utf-8')
      if (code === 0) {
        resolve(out)
      } else {
        const errMsg = Buffer.concat(stderr).toString('utf-8').trim()
        reject(new Error(errMsg || `git ${args[0]} exited with code ${code}`))
      }
    })
  })
}

// ─── Path validation ────────────────────────────────────────────────────────

function validatePaths(paths: string[]): void {
  for (const p of paths) {
    if (p.includes('..') || p.startsWith('/') || /^[A-Za-z]:/.test(p)) {
      throw new ValidationError(`Invalid path: "${p}"`)
    }
  }
}

// ─── Status ─────────────────────────────────────────────────────────────────

export async function getStatus(cwd?: string): Promise<GitStatusResult> {
  const output = await runGit(['status', '--porcelain=v2', '--branch'], cwd)
  const lines = output.split('\n').map((l) => l.replace(/\r$/, '')).filter(Boolean)

  let branch = 'HEAD'
  let ahead = 0
  let behind = 0
  const files: GitFileEntry[] = []

  for (const line of lines) {
    if (line.startsWith('# branch.head ')) {
      branch = line.slice('# branch.head '.length)
    } else if (line.startsWith('# branch.ab ')) {
      const match = line.match(/\+(\d+) -(\d+)/)
      if (match) {
        ahead = parseInt(match[1], 10)
        behind = parseInt(match[2], 10)
      }
    } else if (line.startsWith('1 ') || line.startsWith('2 ')) {
      // Changed entry: "1 XY sub mH mI mW hH hP path" or "2 XY sub mH mI mW hH hP X### origPath\tpath"
      const parts = line.split(' ')
      const xy = parts[1]
      const indexStatus = xy[0]
      const workTreeStatus = xy[1]

      // For renamed files (type 2), path is after tab
      let filePath: string
      if (line.startsWith('2 ')) {
        const tabIdx = line.indexOf('\t')
        filePath = tabIdx >= 0 ? line.slice(tabIdx + 1) : parts[parts.length - 1]
      } else {
        filePath = parts[parts.length - 1]
      }

      // Staged changes
      if (indexStatus !== '.') {
        files.push({
          path: filePath,
          status: mapStatusChar(indexStatus),
          staged: true,
        })
      }

      // Unstaged changes
      if (workTreeStatus !== '.') {
        files.push({
          path: filePath,
          status: mapStatusChar(workTreeStatus),
          staged: false,
        })
      }
    } else if (line.startsWith('? ')) {
      // Untracked: "? path"
      files.push({
        path: line.slice(2),
        status: 'untracked',
        staged: false,
      })
    }
  }

  return { branch, ahead, behind, files }
}

function mapStatusChar(ch: string): GitFileEntry['status'] {
  switch (ch) {
    case 'M': return 'modified'
    case 'A': return 'added'
    case 'D': return 'deleted'
    case 'R': return 'renamed'
    default: return 'modified'
  }
}

// ─── Log ────────────────────────────────────────────────────────────────────

const LOG_SEP = '---GIT-LOG-SEP---'
const LOG_FORMAT = `%H${LOG_SEP}%h${LOG_SEP}%an${LOG_SEP}%aI${LOG_SEP}%s`

export async function getLog(limit = 30, cwd?: string): Promise<GitLogEntry[]> {
  const output = await runGit(['log', `--format=${LOG_FORMAT}`, `-n`, String(limit)], cwd)
  const lines = output.split('\n').map((l) => l.replace(/\r$/, '')).filter(Boolean)

  return lines.map((line) => {
    const [hash, shortHash, author, date, ...messageParts] = line.split(LOG_SEP)
    return {
      hash: hash ?? '',
      shortHash: shortHash ?? '',
      author: author ?? '',
      date: date ?? '',
      message: messageParts.join(LOG_SEP),
    }
  })
}

// ─── Branches ───────────────────────────────────────────────────────────────

export async function getBranches(cwd?: string): Promise<GitBranchEntry[]> {
  const output = await runGit(['branch', '--list', '--no-color'], cwd)
  const lines = output.split('\n').map((l) => l.replace(/\r$/, '')).filter(Boolean)

  return lines.map((line) => ({
    name: line.replace(/^\*?\s+/, '').trim(),
    current: line.startsWith('*'),
  }))
}

// ─── Stage / Unstage ────────────────────────────────────────────────────────

export async function stageFiles(paths: string[], cwd?: string): Promise<void> {
  validatePaths(paths)
  await runGit(['add', '--', ...paths], cwd)
}

export async function unstageFiles(paths: string[], cwd?: string): Promise<void> {
  validatePaths(paths)
  await runGit(['restore', '--staged', '--', ...paths], cwd)
}

// ─── Commit ─────────────────────────────────────────────────────────────────

export async function commit(message: string, cwd?: string): Promise<string> {
  const output = await runGit(['commit', '-m', message], cwd)
  const match = output.match(/\[[\w/.-]+ ([a-f0-9]+)\]/)
  return match?.[1] ?? ''
}

// ─── Push ───────────────────────────────────────────────────────────────────

export async function push(cwd?: string): Promise<GitPushResult> {
  try {
    const output = await runGit(['push'], cwd)
    return { success: true, message: output.trim() || 'Pushed successfully' }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Push failed',
    }
  }
}

// ─── Checkout / Switch Branch ────────────────────────────────────────────────

export async function checkoutBranch(branch: string, cwd?: string): Promise<void> {
  // Validate branch name — no special chars that could be abused
  if (!/^[\w./-]+$/.test(branch)) {
    throw new ValidationError(`Invalid branch name: "${branch}"`)
  }
  await runGit(['switch', branch], cwd)
}

export async function createBranch(name: string, startPoint?: string, cwd?: string): Promise<void> {
  if (!/^[\w./-]+$/.test(name)) {
    throw new ValidationError(`Invalid branch name: "${name}"`)
  }
  const args = ['switch', '-c', name]
  if (startPoint) {
    if (!/^[\w./-]+$/.test(startPoint)) {
      throw new ValidationError(`Invalid start point: "${startPoint}"`)
    }
    args.push(startPoint)
  }
  await runGit(args, cwd)
}

// ─── Remote URL ─────────────────────────────────────────────────────────────

export async function getRemoteUrl(cwd?: string): Promise<string | null> {
  try {
    const output = await runGit(['config', '--get', 'remote.origin.url'], cwd)
    return output.trim() || null
  } catch {
    return null
  }
}

// ─── Diff ───────────────────────────────────────────────────────────────────

export async function getDiff(file?: string, cwd?: string): Promise<string> {
  const args = ['diff']
  if (file) {
    validatePaths([file])
    args.push('--', file)
  }
  return runGit(args, cwd)
}
