'use client'

import { createContext, useContext } from 'react'

// ─── Canvas element actions ──────────────────────────────────────────────────
// Lets deeply-nested (memoized) node and edge components trigger edit/delete on
// themselves without threading callbacks through their `data`. The canvas
// provides the implementation; nodes/edges consume it via `useCanvasActions()`.

export interface CanvasActions {
  /** Open the relevant editor/panel for a node (same as double-click). */
  readonly requestEdit: (nodeId: string, nodeType: string) => void
  /** Remove a node (and its connected edges) from the canvas. */
  readonly requestDeleteNode: (nodeId: string) => void
  /** Remove a single edge from the canvas. */
  readonly requestDeleteEdge: (edgeId: string) => void
  /**
   * Merge a partial `data` patch into a node. Produces a fresh node + array
   * reference so the change propagates to the parent and gets persisted —
   * use this instead of mutating `node.data` in place (which is invisible to
   * React's reference-equality change detection).
   */
  readonly requestUpdateNodeData: (nodeId: string, data: Record<string, unknown>) => void
  /**
   * Open the saved-output log preview on a specific file. `directory` may be
   * null/undefined to fall back to the workspace working dir.
   */
  readonly requestViewOutput: (directory: string | null | undefined, name: string) => void
}

const NOOP_ACTIONS: CanvasActions = {
  requestEdit: () => {},
  requestDeleteNode: () => {},
  requestDeleteEdge: () => {},
  requestUpdateNodeData: () => {},
  requestViewOutput: () => {},
}

const CanvasActionsContext = createContext<CanvasActions>(NOOP_ACTIONS)

export const CanvasActionsProvider = CanvasActionsContext.Provider

export function useCanvasActions(): CanvasActions {
  return useContext(CanvasActionsContext)
}
