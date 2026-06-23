'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'
import { X } from 'lucide-react'
import { useCanvasActions } from '../canvas-actions'

export interface rondoflowEdgeData extends Record<string, unknown> {
  edgeType?: 'association' | 'flow' | 'conditional'
  isActive?: boolean
  /** Branch label shown on the edge (set for Condition-node branch routes). */
  branchLabel?: string
}

// EdgeProps uses Record<string,unknown> for data; we cast to our typed interface.
function RondoflowEdgeComponent(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
    selected,
  } = props

  const { t } = useTranslation('canvas')
  const { requestDeleteEdge } = useCanvasActions()

  // Smooth bezier curves between the round ports (matches the flow-builder look).
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const typedData = data as rondoflowEdgeData | undefined
  const edgeType = typedData?.edgeType ?? 'flow'
  const isActive = typedData?.isActive ?? false
  const branchLabel = typedData?.branchLabel

  // Wide invisible hit area so the edge is easy to click/select — mirrors React
  // Flow's BaseEdge interaction path. The parent `.react-flow__edge` uses
  // `pointer-events: visibleStroke`, so this 20px transparent stroke is clickable.
  const hitArea = (
    <path
      d={edgePath}
      fill="none"
      strokeOpacity={0}
      strokeWidth={20}
      className="react-flow__edge-interaction"
    />
  )

  // Delete control — shown at the edge midpoint while the edge is selected.
  const deleteButton = selected ? (
    <EdgeLabelRenderer>
      <button
        type="button"
        className="nodrag nopan absolute flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:bg-destructive hover:text-destructive-foreground"
        style={{
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          pointerEvents: 'all',
        }}
        onClick={(event) => {
          event.stopPropagation()
          requestDeleteEdge(id)
        }}
        aria-label={t('edge.delete')}
        title={t('edge.delete')}
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </EdgeLabelRenderer>
  ) : null

  // Branch label chip — shown at the edge midpoint for conditional/branch edges.
  // Pointer-events disabled so it never blocks selecting / double-clicking.
  const branchChip = branchLabel ? (
    <EdgeLabelRenderer>
      <div
        className="nodrag nopan absolute max-w-[150px] truncate rounded-full border border-amber-500/40 bg-card px-2 py-0.5 text-[10px] font-medium text-amber-600 shadow-sm dark:text-amber-300"
        style={{
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 14}px)`,
          pointerEvents: 'none',
        }}
        title={branchLabel}
      >
        {branchLabel}
      </div>
    </EdgeLabelRenderer>
  ) : null

  // Association edges (skill/policy/mcp → agent): subtle dashed bezier.
  if (edgeType === 'association') {
    return (
      <>
        {hitArea}
        <path
          id={id}
          d={edgePath}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          strokeOpacity={selected ? 0.9 : 0.45}
          strokeLinecap="round"
          markerEnd={markerEnd}
        />
        {deleteButton}
      </>
    )
  }

  // Active flow edge (agent executing): solid coloured curve with a soft glow.
  if (isActive) {
    return (
      <>
        {hitArea}
        {/* Glow */}
        <path
          d={edgePath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={7}
          strokeOpacity={0.16}
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 6px hsl(var(--primary)))',
            animation: 'edgepulse 2s ease-in-out infinite',
          }}
        />
        {/* Main animated dash overlay for a sense of motion */}
        <path
          id={id}
          d={edgePath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          strokeOpacity={1}
          strokeLinecap="round"
          strokeDasharray="8 5"
          markerEnd={markerEnd}
          style={{ animation: 'dashdraw 0.5s linear infinite' }}
        />
        {branchChip}
        {deleteButton}
      </>
    )
  }

  // Conditional / branch edge (from a Condition node): amber dotted curve with
  // its branch label, so routes read distinctly from plain flow edges.
  if (edgeType === 'conditional') {
    return (
      <>
        {hitArea}
        <path
          id={id}
          d={edgePath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={selected ? 2.5 : 1.75}
          strokeOpacity={selected ? 0.95 : 0.7}
          strokeDasharray="2 4"
          strokeLinecap="round"
          markerEnd={markerEnd}
        />
        {branchChip}
        {deleteButton}
      </>
    )
  }

  // Idle flow edge — solid, smooth, neutral curve (matches the reference design).
  return (
    <>
      {hitArea}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth={selected ? 2.5 : 1.75}
        strokeOpacity={selected ? 0.85 : 0.45}
        strokeLinecap="round"
        markerEnd={markerEnd}
      />
      {deleteButton}
    </>
  )
}

export const rondoflowEdge = memo(RondoflowEdgeComponent)
rondoflowEdge.displayName = 'rondoflowEdge'
