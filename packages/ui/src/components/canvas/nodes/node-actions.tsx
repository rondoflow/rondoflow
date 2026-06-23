'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeToolbar, Position } from '@xyflow/react'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanvasActions } from '../canvas-actions'

// ─── Per-node action toolbar ─────────────────────────────────────────────────
// Floats above a node offering Edit and Delete. Rendered via React Flow's
// NodeToolbar so it tracks the node's position and zoom. Shown when the node is
// selected OR hovered — hover makes the edit/delete affordance discoverable
// without a click first (previously it only appeared on selection).

interface NodeActionsProps {
  readonly nodeId: string
  readonly nodeType: string
  readonly selected?: boolean
  /** Hide the Edit button for node types that have no dedicated editor. */
  readonly editable?: boolean
  /** Hide the Delete button for node types that cannot be removed (e.g. Start). */
  readonly deletable?: boolean
}

export function NodeActions({ nodeId, nodeType, selected, editable = true, deletable = true }: NodeActionsProps) {
  const { t } = useTranslation('canvas')
  const { requestEdit, requestDeleteNode } = useCanvasActions()
  const [hovered, setHovered] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track hover on the node's DOM wrapper (React Flow tags it with data-id).
  // A short close delay bridges the gap between the card and the floating
  // toolbar so moving the cursor up to a button doesn't dismiss it. If the
  // wrapper isn't found the component still works — it just falls back to the
  // selection-only behaviour.
  useEffect(() => {
    const el = document.querySelector(`.react-flow__node[data-id="${CSS.escape(nodeId)}"]`)
    if (!el) return
    const show = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      setHovered(true)
    }
    const hide = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setHovered(false), 140)
    }
    el.addEventListener('mouseenter', show)
    el.addEventListener('mouseleave', hide)
    return () => {
      el.removeEventListener('mouseenter', show)
      el.removeEventListener('mouseleave', hide)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [nodeId])

  // Nothing to offer — don't render an empty floating toolbar.
  if (!editable && !deletable) return null

  const keepOpen = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setHovered(true)
  }
  const scheduleClose = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setHovered(false), 140)
  }

  return (
    <NodeToolbar
      nodeId={nodeId}
      isVisible={selected || hovered}
      position={Position.Top}
      align="end"
      offset={8}
    >
      <div
        className="flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5 shadow-md"
        onMouseEnter={keepOpen}
        onMouseLeave={scheduleClose}
      >
        {editable && (
          <button
            type="button"
            onClick={() => requestEdit(nodeId, nodeType)}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-muted-foreground',
              'transition-colors hover:bg-muted hover:text-foreground',
            )}
            aria-label={t('node.actions.edit')}
            title={t('node.actions.edit')}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
        {deletable && (
          <button
            type="button"
            onClick={() => requestDeleteNode(nodeId)}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-muted-foreground',
              'transition-colors hover:bg-destructive/15 hover:text-destructive',
            )}
            aria-label={t('node.actions.delete')}
            title={t('node.actions.delete')}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
    </NodeToolbar>
  )
}
