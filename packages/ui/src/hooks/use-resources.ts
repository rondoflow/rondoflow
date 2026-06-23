'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet, apiPost, apiPatch, apiDelete, apiUpload } from '@/lib/api'
import { NETWORK, type WorkspaceResource as SharedResource } from '@rondoflow/shared'

// ─── Types ─────────────────────────────────────────────────────────────────

export type ResourceKind = 'file' | 'link' | 'note' | 'variable'

export interface WorkspaceResource {
  readonly id: string
  readonly workspaceId: string
  readonly kind: ResourceKind
  readonly name: string
  readonly value: string
  readonly mimeType?: string
  readonly size?: number
  readonly secret?: boolean
  readonly description?: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface CreateResourceInput {
  readonly kind: ResourceKind
  readonly name: string
  readonly value: string
  readonly mimeType?: string
  readonly size?: number
  readonly secret?: boolean
  readonly description?: string
}

export interface UseResourcesReturn {
  resources: WorkspaceResource[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  uploadFile: (file: File) => Promise<void>
  createResource: (input: CreateResourceInput) => Promise<void>
  updateResource: (id: string, input: Partial<CreateResourceInput>) => Promise<void>
  deleteResource: (id: string) => Promise<void>
}

// ─── Mapping helpers ──────────────────────────────────────────────────────

/** Map backend ResourceType → frontend ResourceKind */
function typeToKind(type: string): ResourceKind {
  if (type === 'url') return 'link'
  return type as ResourceKind
}

/** Map backend SharedResource → frontend WorkspaceResource */
function fromApi(r: SharedResource): WorkspaceResource {
  let value = ''
  if (r.type === 'file') {
    // Build a download URL for file resources
    value = `${process.env.NEXT_PUBLIC_API_URL ?? NETWORK.DEFAULT_API_URL}/api/workspaces/${r.workspaceId}/resources/${r.id}/download`
  } else if (r.type === 'url') {
    value = r.url ?? ''
  } else if (r.type === 'note') {
    value = r.content ?? ''
  } else if (r.type === 'variable') {
    value = r.varKey ?? ''
  }

  return {
    id: r.id,
    workspaceId: r.workspaceId,
    kind: typeToKind(r.type),
    name: r.name,
    value,
    mimeType: r.mimeType ?? undefined,
    size: r.fileSize ?? undefined,
    secret: r.isSecret || undefined,
    description: r.description ?? undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/** Map frontend CreateResourceInput → backend POST body */
function toApiBody(input: CreateResourceInput): Record<string, unknown> {
  const backendType = input.kind === 'link' ? 'url' : input.kind
  const body: Record<string, unknown> = {
    type: backendType,
    name: input.name,
    description: input.description,
  }

  if (input.kind === 'link') {
    body.url = input.value
  } else if (input.kind === 'note') {
    body.content = input.value
  } else if (input.kind === 'variable') {
    body.varKey = input.name
    body.varValue = input.value
    body.isSecret = input.secret ?? false
  }

  return body
}

/** Map frontend partial update → backend PATCH body */
function toApiUpdateBody(input: Partial<CreateResourceInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (input.name !== undefined) body.name = input.name
  if (input.description !== undefined) body.description = input.description
  if (input.value !== undefined) {
    // For notes, map value → content; for variables, map value → varValue
    // The caller doesn't know the resource type, so we send all possible fields
    // and the backend ignores fields that don't apply
    body.content = input.value
    body.varValue = input.value
    body.url = input.value
  }
  if (input.secret !== undefined) body.isSecret = input.secret
  return body
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useResources(workspaceId: string | null): UseResourcesReturn {
  const { t } = useTranslation('resources')
  const [resources, setResources] = useState<WorkspaceResource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<SharedResource[]>(
        `/api/workspaces/${workspaceId}/resources`,
      )
      setResources(data.map(fromApi))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadResources'))
    } finally {
      setLoading(false)
    }
  }, [workspaceId, t])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const uploadFile = useCallback(
    async (file: File) => {
      if (!workspaceId) return
      setError(null)
      try {
        const created = await apiUpload<SharedResource>(
          `/api/workspaces/${workspaceId}/resources/upload`,
          file,
          { workspaceId },
        )
        setResources((prev) => [...prev, fromApi(created)])
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.uploadFailed'))
        throw err
      }
    },
    [workspaceId, t],
  )

  const createResource = useCallback(
    async (input: CreateResourceInput) => {
      if (!workspaceId) return
      setError(null)
      try {
        const created = await apiPost<SharedResource>(
          `/api/workspaces/${workspaceId}/resources`,
          toApiBody(input),
        )
        setResources((prev) => [...prev, fromApi(created)])
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.createResource'))
        throw err
      }
    },
    [workspaceId, t],
  )

  const updateResource = useCallback(
    async (id: string, input: Partial<CreateResourceInput>) => {
      if (!workspaceId) return
      setError(null)
      try {
        const updated = await apiPatch<SharedResource>(
          `/api/workspaces/${workspaceId}/resources/${id}`,
          toApiUpdateBody(input),
        )
        setResources((prev) =>
          prev.map((r) => (r.id === id ? fromApi(updated) : r)),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.updateResource'))
        throw err
      }
    },
    [workspaceId, t],
  )

  const deleteResource = useCallback(
    async (id: string) => {
      if (!workspaceId) return
      setError(null)
      try {
        await apiDelete(`/api/workspaces/${workspaceId}/resources/${id}`)
        setResources((prev) => prev.filter((r) => r.id !== id))
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.deleteResource'))
        throw err
      }
    },
    [workspaceId, t],
  )

  return {
    resources,
    loading,
    error,
    refresh,
    uploadFile,
    createResource,
    updateResource,
    deleteResource,
  }
}
