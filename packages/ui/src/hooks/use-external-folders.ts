'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import type {
  ExternalFolder,
  AvailableFolder,
  AvailableFoldersResult,
  CreateExternalFolderInput,
} from '@rondoflow/shared'

export interface UseExternalFoldersReturn {
  folders: ExternalFolder[]
  available: AvailableFolder[]
  /** Whether the in-container mount root exists (false → nothing mounted yet). */
  rootExists: boolean
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  refreshAvailable: () => Promise<void>
  createFolder: (input: CreateExternalFolderInput) => Promise<ExternalFolder>
  updateFolder: (id: string, input: Partial<CreateExternalFolderInput>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
}

/**
 * Manages the GLOBAL external-folders registry (mirrors useResources, but not
 * workspace-scoped). `available` is fetched lazily via refreshAvailable() since
 * it scans the container filesystem.
 */
export function useExternalFolders(): UseExternalFoldersReturn {
  const { t } = useTranslation('resources')
  const [folders, setFolders] = useState<ExternalFolder[]>([])
  const [available, setAvailable] = useState<AvailableFolder[]>([])
  const [rootExists, setRootExists] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<ExternalFolder[]>('/api/external-folders')
      setFolders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadFolders'))
    } finally {
      setLoading(false)
    }
  }, [t])

  const refreshAvailable = useCallback(async () => {
    try {
      const result = await apiGet<AvailableFoldersResult>('/api/external-folders/available')
      setAvailable([...result.candidates])
      setRootExists(result.rootExists)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.scanFolders'))
    }
  }, [t])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createFolder = useCallback(async (input: CreateExternalFolderInput): Promise<ExternalFolder> => {
    setError(null)
    try {
      const created = await apiPost<ExternalFolder>('/api/external-folders', input)
      setFolders((prev) => [created, ...prev])
      return created
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.registerFolder'))
      throw err
    }
  }, [t])

  const updateFolder = useCallback(
    async (id: string, input: Partial<CreateExternalFolderInput>) => {
      setError(null)
      try {
        const updated = await apiPatch<ExternalFolder>(`/api/external-folders/${id}`, input)
        setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)))
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.updateFolder'))
        throw err
      }
    },
    [t],
  )

  const deleteFolder = useCallback(async (id: string) => {
    setError(null)
    try {
      await apiDelete(`/api/external-folders/${id}`)
      setFolders((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.deleteFolder'))
      throw err
    }
  }, [t])

  return {
    folders,
    available,
    rootExists,
    loading,
    error,
    refresh,
    refreshAvailable,
    createFolder,
    updateFolder,
    deleteFolder,
  }
}
