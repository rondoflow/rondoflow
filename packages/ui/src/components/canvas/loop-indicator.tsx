'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getSocket, isSocketCreated } from '@/lib/socket'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoopState {
  readonly iteration: number
  readonly maxIterations: number
}

export interface LoopIndicatorProps {
  readonly agentId: string
  readonly size?: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STROKE_WIDTH = 3
const PADDING = 6 // gap between card edge and ring

function buildArcPath(
  cx: number,
  cy: number,
  r: number,
  progress: number, // 0-1
): { circumference: number; dashOffset: number } {
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - progress)
  return { circumference, dashOffset }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * LoopIndicator is an SVG overlay rendered *around* an agent node on the canvas.
 *
 * It subscribes to `agent:loop_iteration` socket events for the given agentId.
 * The component is absolutely positioned around the node card; the parent node
 * wrapper must have `position: relative` and its dimensions supplied via the
 * `size` prop.
 *
 * Usage within AgentNode (or a wrapper):
 *   <LoopIndicator agentId={id} size={220} />
 */
export function LoopIndicator({ agentId, size = 220 }: LoopIndicatorProps) {
  const { t } = useTranslation('canvas')
  const [loopState, setLoopState] = useState<LoopState | null>(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    function handleLoopIteration(data: {
      agentId: string
      iteration: number
      maxIterations: number
    }) {
      if (data.agentId !== agentId) return
      setLoopState({ iteration: data.iteration, maxIterations: data.maxIterations })
      // Trigger pulse on each new iteration
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 600)
      return () => clearTimeout(t)
    }

    if (!isSocketCreated()) return
    const sock = getSocket()
    sock.on('agent:loop_iteration', handleLoopIteration)
    return () => {
      sock.off('agent:loop_iteration', handleLoopIteration)
    }
  }, [agentId])

  if (!loopState) return null

  const { iteration, maxIterations } = loopState
  const progress = maxIterations > 0 ? Math.min(iteration / maxIterations, 1) : 0

  // SVG dimensions — add padding on all sides
  const svgSize = size + PADDING * 2
  const cx = svgSize / 2
  const cy = svgSize / 2
  // Radius fits just outside the node card
  const r = size / 2 + PADDING / 2

  const { circumference, dashOffset } = buildArcPath(cx, cy, r, progress)

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        top: -PADDING,
        left: -PADDING,
        width: svgSize,
        height: svgSize,
      }}
      aria-label={t('loop.progress', { iteration, max: maxIterations })}
      role="img"
    >
      {/* SVG ring */}
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        fill="none"
        overflow="visible"
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="hsl(var(--border))"
          strokeWidth={STROKE_WIDTH}
          opacity={0.4}
        />

        {/* Progress arc — starts from top (rotate -90deg) */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="hsl(271 91% 65%)" /* purple-ish accent */
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="transition-[stroke-dashoffset] duration-500 ease-in-out"
        />

        {/* Pulse ring — briefly expands on each iteration */}
        {pulse && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="hsl(271 91% 65%)"
            strokeWidth={1}
            opacity={0.5}
            className="animate-ping"
          />
        )}
      </svg>

      {/* Iteration badge — top-right corner of the ring */}
      <div
        className="absolute flex items-center justify-center rounded-full bg-purple-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-md"
        style={{
          top: PADDING + r - r * Math.sin(Math.PI / 4) - 10,
          right: PADDING + r - r * Math.cos(Math.PI / 4) - 18,
          minWidth: 32,
        }}
        aria-hidden
      >
        {iteration}/{maxIterations}
      </div>
    </div>
  )
}
