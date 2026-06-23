// A host directory bind-mounted into the server container and exposed to agents.

export interface ExternalFolder {
  readonly id: string
  readonly name: string
  readonly description: string | null
  /** In-container path (resolves under EXTERNAL_FOLDERS_CONTAINER_ROOT). */
  readonly containerPath: string
  /** Advisory flag for the UI — the real read/write boundary is the docker mount mode. */
  readonly readOnly: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

/** A directory discovered by scanning the mount root (GET /external-folders/available). */
export interface AvailableFolder {
  readonly name: string
  readonly containerPath: string
}

export interface AvailableFoldersResult {
  readonly rootExists: boolean
  readonly root: string
  readonly candidates: readonly AvailableFolder[]
}

/** Per-agent attachment row (mirrors AgentSkill). */
export interface AgentExternalFolder {
  readonly externalFolderId: string
  readonly priority: number
  readonly enabled: boolean
  readonly externalFolder?: Pick<ExternalFolder, 'name' | 'containerPath' | 'readOnly'>
}

export interface CreateExternalFolderInput {
  readonly name: string
  readonly containerPath: string
  readonly description?: string
  readonly readOnly?: boolean
}
