'use client'

import { memo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { NodeProps } from '@xyflow/react'
import { NodeActions } from './node-actions'
import { useCanvasActions } from '../canvas-actions'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StickyNoteNodeData extends Record<string, unknown> {
  text?: string
  color?: string
}

// ─── Colors ─────────────────────────────────────────────────────────────────

const NOTE_COLORS: Record<string, { bg: string; border: string }> = {
  yellow: { bg: 'bg-[rgba(254,249,195,0.18)]', border: 'border-[rgba(253,224,71,0.26)]' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-500/20', border: 'border-blue-300 dark:border-blue-500/40' },
  green: { bg: 'bg-green-100 dark:bg-green-500/20', border: 'border-green-300 dark:border-green-500/40' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-500/20', border: 'border-pink-300 dark:border-pink-500/40' },
}

// ─── Component ──────────────────────────────────────────────────────────────

function StickyNoteNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as StickyNoteNodeData
  const colorKey = (data.color ?? 'yellow') as string
  const colors = NOTE_COLORS[colorKey] ?? NOTE_COLORS.yellow

  const { requestUpdateNodeData } = useCanvasActions()

  const [text, setText] = useState(data.text ?? '')
  const [editing, setEditing] = useState(!data.text)

  const handleBlur = useCallback(() => {
    setEditing(false)
    // Persist through React Flow's controlled state (a fresh node reference) so
    // the change propagates to the parent and is saved — not an in-place mutation.
    requestUpdateNodeData(props.id, { text })
  }, [text, props.id, requestUpdateNodeData])

  return (
    <div
      className={`w-[180px] rounded-2xl border ${colors.border} ${colors.bg} p-3 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18)]`}
      onDoubleClick={() => setEditing(true)}
    >
      <NodeActions nodeId={props.id} nodeType="note" selected={props.selected} editable={false} />
      {editing ? (
        <textarea
          className="w-full bg-transparent text-xs outline-none resize-none placeholder:text-muted-foreground"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder={t('node.stickyNote.placeholder')}
          autoFocus
        />
      ) : (
        <p className="min-h-[60px] whitespace-pre-wrap text-xs text-foreground">
          {text || t('node.stickyNote.empty')}
        </p>
      )}
    </div>
  )
}

export const StickyNoteNode = memo(StickyNoteNodeComponent)
StickyNoteNode.displayName = 'StickyNoteNode'
