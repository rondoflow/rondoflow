'use client'

import { useCallback, useRef } from 'react'
import type { Node, Edge } from '@xyflow/react'

// ─── Types ────────────────────────────────────────────────────────────────

export interface CanvasSnapshot {
  readonly nodes: readonly Node[]
  readonly edges: readonly Edge[]
}

export interface UseUndoRedoParams {
  nodes: Node[]
  edges: Edge[]
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
}

export interface UseUndoRedoReturn {
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  takeSnapshot: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────

const MAX_HISTORY = 50

// ─── Hook ─────────────────────────────────────────────────────────────────

/**
 * Implements the command pattern for canvas undo/redo.
 *
 * Call `takeSnapshot()` before any mutation (drag, connect, delete, etc.).
 * `undo()` restores the previous snapshot; `redo()` re-applies a reverted one.
 *
 * Both stacks are stored in refs so pushing/popping never triggers a render.
 * `canUndo` / `canRedo` are derived synchronously from the ref lengths via
 * a lightweight boolean ref that updates alongside every mutation.
 */
export function useUndoRedo({
  nodes,
  edges,
  setNodes,
  setEdges,
}: UseUndoRedoParams): UseUndoRedoReturn {
  // Using refs to avoid re-renders on every snapshot push
  const undoStack = useRef<CanvasSnapshot[]>([])
  const redoStack = useRef<CanvasSnapshot[]>([])

  // Refs for synchronous boolean checks (avoids stale closure issues)
  const canUndoRef = useRef(false)
  const canRedoRef = useRef(false)

  // Capture current live state as an immutable snapshot
  const captureCurrentSnapshot = useCallback(
    (): CanvasSnapshot => ({
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
    }),
    [nodes, edges],
  )

  const takeSnapshot = useCallback(() => {
    const snapshot = captureCurrentSnapshot()

    undoStack.current = [
      ...undoStack.current.slice(-(MAX_HISTORY - 1)),
      snapshot,
    ]
    // Any new action invalidates the redo history
    redoStack.current = []

    canUndoRef.current = undoStack.current.length > 0
    canRedoRef.current = false
  }, [captureCurrentSnapshot])

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return

    const current = captureCurrentSnapshot()
    const previous = undoStack.current[undoStack.current.length - 1]

    undoStack.current = undoStack.current.slice(0, -1)
    redoStack.current = [...redoStack.current, current]

    canUndoRef.current = undoStack.current.length > 0
    canRedoRef.current = true

    setNodes([...previous.nodes] as Node[])
    setEdges([...previous.edges] as Edge[])
  }, [captureCurrentSnapshot, setNodes, setEdges])

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return

    const current = captureCurrentSnapshot()
    const next = redoStack.current[redoStack.current.length - 1]

    redoStack.current = redoStack.current.slice(0, -1)
    undoStack.current = [...undoStack.current, current]

    canUndoRef.current = true
    canRedoRef.current = redoStack.current.length > 0

    setNodes([...next.nodes] as Node[])
    setEdges([...next.edges] as Edge[])
  }, [captureCurrentSnapshot, setNodes, setEdges])

  return {
    undo,
    redo,
    // Derive from live stack lengths for the initial render; refs are current
    // because this runs in render scope
    get canUndo() {
      return undoStack.current.length > 0
    },
    get canRedo() {
      return redoStack.current.length > 0
    },
    takeSnapshot,
  }
}
