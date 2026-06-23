export type ResourceType = 'file' | 'url' | 'note' | 'variable'

export interface WorkspaceResource {
  readonly id: string
  readonly workspaceId: string
  readonly type: ResourceType
  readonly name: string
  readonly description: string | null
  readonly filePath: string | null
  readonly fileSize: number | null
  readonly mimeType: string | null
  readonly url: string | null
  readonly content: string | null
  readonly varKey: string | null
  // varValue is intentionally excluded — secret values are never sent to the frontend
  readonly isSecret: boolean
  readonly createdAt: string
  readonly updatedAt: string
}
