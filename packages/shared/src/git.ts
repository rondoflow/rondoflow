export interface GitFileEntry {
  readonly path: string
  readonly status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked'
  readonly staged: boolean
}

export interface GitStatusResult {
  readonly branch: string
  readonly ahead: number
  readonly behind: number
  readonly files: readonly GitFileEntry[]
}

export interface GitLogEntry {
  readonly hash: string
  readonly shortHash: string
  readonly author: string
  readonly date: string
  readonly message: string
}

export interface GitBranchEntry {
  readonly name: string
  readonly current: boolean
}

export interface GitPushResult {
  readonly success: boolean
  readonly message: string
}
