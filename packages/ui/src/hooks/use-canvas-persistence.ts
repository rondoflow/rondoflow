'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api'
import { toast } from '@/components/ui/toast'
import i18n from '@/lib/i18n'

interface CanvasLayout {
  id: string
  viewport: { x: number; y: number; zoom: number }
  nodes: Node[]
  edges: Edge[]
}

export interface PersistWorkspace {
  id: string
  name: string
}

interface UseCanvasPersistenceReturn {
  workspaces: PersistWorkspace[]
  activeWorkspaceId: string
  loaded: boolean
  saving: boolean
  loadCanvas: () => Promise<{ nodes: Node[]; edges: Edge[] } | null>
  saveCanvas: (nodes: Node[], edges: Edge[]) => void
  /** Save immediately (flushing any pending debounced save). Returns success. */
  saveNow: (nodes: Node[], edges: Edge[]) => Promise<boolean>
  switchWorkspace: (id: string) => Promise<{ nodes: Node[]; edges: Edge[] } | null>
  /** Re-fetch the workspace list from the server (e.g. after an import). */
  refreshWorkspaces: () => Promise<PersistWorkspace[]>
  createWorkspace: (name: string, workingDirectory?: string) => Promise<string>
  renameWorkspace: (id: string, name: string) => Promise<void>
  deleteWorkspace: (id: string) => Promise<void>
}

const DEBOUNCE_MS = 2000

export function useCanvasPersistence(): UseCanvasPersistenceReturn {
  const [workspaces, setWorkspaces] = useState<PersistWorkspace[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const activeIdRef = useRef('')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Tracks whether an autosave-failure toast is already showing, so a server
  // outage doesn't spam one toast per debounced save. Reset on the next success.
  const autosaveFailedRef = useRef(false)
  const saveCanvasRef = useRef<(nodes: Node[], edges: Edge[]) => void>(() => {})

  // Fetch workspaces from API
  const fetchWorkspaces = useCallback(async (): Promise<PersistWorkspace[]> => {
    try {
      const list = await apiGet<PersistWorkspace[]>('/api/workspaces')
      setWorkspaces(list)
      return list
    } catch {
      return []
    }
  }, [])

  // Ensure at least one workspace exists
  const ensureWorkspace = useCallback(async (): Promise<string> => {
    if (activeIdRef.current) return activeIdRef.current

    const list = await fetchWorkspaces()
    if (list.length > 0) {
      activeIdRef.current = list[0].id
      setActiveWorkspaceId(list[0].id)
      return list[0].id
    }

    try {
      const created = await apiPost<PersistWorkspace>('/api/workspaces', { name: i18n.t('app:workspace.defaultName') })
      activeIdRef.current = created.id
      setActiveWorkspaceId(created.id)
      setWorkspaces([created])
      return created.id
    } catch {
      return ''
    }
  }, [fetchWorkspaces])

  // Load canvas for a specific workspace
  const loadCanvasForWorkspace = useCallback(async (wsId: string): Promise<{ nodes: Node[]; edges: Edge[] } | null> => {
    if (!wsId) return null
    try {
      const layout = await apiGet<CanvasLayout | null>(`/api/workspaces/${wsId}/canvas`)
      if (layout?.nodes?.length) {
        return { nodes: layout.nodes, edges: layout.edges ?? [] }
      }
      return null
    } catch {
      return null
    }
  }, [])

  // Load canvas for the active workspace
  const loadCanvas = useCallback(async (): Promise<{ nodes: Node[]; edges: Edge[] } | null> => {
    const wsId = await ensureWorkspace()
    setLoaded(true)
    return loadCanvasForWorkspace(wsId)
  }, [ensureWorkspace, loadCanvasForWorkspace])

  // Persist canvas to the server. Returns whether the save succeeded.
  // Both callers (saveCanvas, saveNow) refuse to persist an empty node set so
  // a stray save can never wipe a saved workflow.
  const doSave = useCallback(async (nodes: Node[], edges: Edge[]): Promise<boolean> => {
    const wsId = activeIdRef.current
    if (!wsId) return false

    setSaving(true)
    try {
      await apiPut(`/api/workspaces/${wsId}/canvas`, {
        name: 'default',
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          // Branch routes carry their handle ids — preserve them so Condition
          // node wiring survives save/load.
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          type: e.type,
          data: e.data,
        })),
      })
      autosaveFailedRef.current = false
      return true
    } catch {
      // silent retry next time
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  const saveCanvas = useCallback((nodes: Node[], edges: Edge[]) => {
    if (nodes.length === 0) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      void doSave(nodes, edges).then((ok) => {
        if (ok) {
          autosaveFailedRef.current = false
          return
        }
        // Autosave no longer fails silently — surface it once with a one-tap
        // retry so canvas edits can't be silently lost on reload.
        if (autosaveFailedRef.current) return
        autosaveFailedRef.current = true
        toast({
          variant: 'error',
          description: i18n.t('app:toast.autosaveFailed'),
          duration: 8000,
          action: {
            label: i18n.t('common:retry'),
            onClick: () => {
              autosaveFailedRef.current = false
              saveCanvasRef.current(nodes, edges)
            },
          },
        })
      })
    }, DEBOUNCE_MS)
  }, [doSave])
  saveCanvasRef.current = saveCanvas

  // Immediate save — flush any pending debounce and persist now. Refuses to
  // persist an empty canvas so an accidental save can't wipe a saved workflow.
  const saveNow = useCallback(async (nodes: Node[], edges: Edge[]): Promise<boolean> => {
    if (nodes.length === 0) return false
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    return doSave(nodes, edges)
  }, [doSave])

  // Switch to a different workspace
  const switchWorkspace = useCallback(async (id: string): Promise<{ nodes: Node[]; edges: Edge[] } | null> => {
    // Save current workspace first (flush)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    activeIdRef.current = id
    setActiveWorkspaceId(id)
    return loadCanvasForWorkspace(id)
  }, [loadCanvasForWorkspace])

  // Re-fetch the workspace list (e.g. after an import created a new one)
  const refreshWorkspaces = useCallback(async (): Promise<PersistWorkspace[]> => {
    return fetchWorkspaces()
  }, [fetchWorkspaces])

  // Create a new workspace
  const createWorkspace = useCallback(async (name: string, workingDirectory?: string): Promise<string> => {
    try {
      const created = await apiPost<PersistWorkspace>('/api/workspaces', { name, workingDirectory })
      setWorkspaces((prev) => [...prev, created])
      activeIdRef.current = created.id
      setActiveWorkspaceId(created.id)
      return created.id
    } catch {
      return ''
    }
  }, [])

  // Rename a workspace
  const renameWorkspace = useCallback(async (id: string, name: string): Promise<void> => {
    try {
      await apiPatch(`/api/workspaces/${id}`, { name })
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? { ...w, name } : w)),
      )
    } catch {
      // silent
    }
  }, [])

  // Delete a workspace
  const deleteWorkspace = useCallback(async (id: string): Promise<void> => {
    try {
      await apiDelete(`/api/workspaces/${id}`)
      setWorkspaces((prev) => {
        const remaining = prev.filter((w) => w.id !== id)
        // If we deleted the active workspace, switch to another
        if (activeIdRef.current === id && remaining.length > 0) {
          activeIdRef.current = remaining[0].id
          setActiveWorkspaceId(remaining[0].id)
        }
        return remaining
      })
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  return {
    workspaces,
    activeWorkspaceId,
    loaded,
    saving,
    loadCanvas,
    saveCanvas,
    saveNow,
    switchWorkspace,
    refreshWorkspaces,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
  }
}
