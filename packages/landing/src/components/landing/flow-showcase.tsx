'use client'

import {
  Bot,
  ClipboardList,
  FileOutput,
  Lightbulb,
  PenLine,
  Puzzle,
  Rocket,
  RotateCcw,
  Telescope,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { AppNode, OrchestratorNode } from './flow-nodes'

// Palette mirrors the app: ink chain edges, node-status accents, and the real
// toolbar colors for the three orchestrators (Planner cyan, Director purple,
// Advisor amber).
const INK = '#161616'
const MUTED = '#5b6168'
const C = {
  start: '#10b981',
  agentDone: '#22c55e',
  agentRun: '#3b82f6',
  skill: '#3b82f6',
  output: '#14b8a6',
  planner: '#06b6d4',
  director: '#a855f7',
  advisor: '#f59e0b',
}

const VB_W = 1240
const VB_H = 790

type Orient = 'h' | 'v'
type Pos = { x: number; y: number }

const POS: Record<string, Pos> = {
  planner: { x: 0.12, y: 0.14 },
  director: { x: 0.46, y: 0.115 },
  advisor: { x: 0.86, y: 0.14 },
  task: { x: 0.07, y: 0.54 },
  research: { x: 0.33, y: 0.54 },
  synth: { x: 0.61, y: 0.54 },
  result: { x: 0.88, y: 0.54 },
  analysis: { x: 0.33, y: 0.88 },
}

type Edge = {
  id: string
  from: string
  to: string
  kind: 'flow' | 'assoc' | 'orch'
  orient: Orient
  color: string
  glow?: boolean
}

const EDGES: readonly Edge[] = [
  { id: 't-r', from: 'task', to: 'research', kind: 'flow', orient: 'h', color: INK },
  { id: 'r-s', from: 'research', to: 'synth', kind: 'flow', orient: 'h', color: INK, glow: true },
  { id: 's-o', from: 'synth', to: 'result', kind: 'flow', orient: 'h', color: INK },
  { id: 'sk-r', from: 'analysis', to: 'research', kind: 'assoc', orient: 'v', color: MUTED },
  { id: 'pl-r', from: 'planner', to: 'research', kind: 'orch', orient: 'v', color: C.planner },
  { id: 'di-r', from: 'director', to: 'research', kind: 'orch', orient: 'v', color: C.director },
  { id: 'di-s', from: 'director', to: 'synth', kind: 'orch', orient: 'v', color: C.director },
  { id: 'o-ad', from: 'result', to: 'advisor', kind: 'orch', orient: 'v', color: C.advisor },
]

const EDGE_CLASS: Record<Edge['kind'], string> = {
  flow: 'fx-edge fx-flow',
  assoc: 'fx-edge fx-assoc',
  orch: 'fx-edge fx-orch',
}

/** Cubic bezier between node centers; control handles oriented along the run direction. */
function edgePath(from: Pos, to: Pos, orient: Orient): string {
  const sx = from.x * VB_W
  const sy = from.y * VB_H
  const ex = to.x * VB_W
  const ey = to.y * VB_H
  if (orient === 'h') {
    const dx = Math.max(60, Math.abs(ex - sx) * 0.5)
    return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${ex - dx} ${ey}, ${ex} ${ey}`
  }
  const dy = Math.max(48, Math.abs(ey - sy) * 0.5)
  return `M ${sx} ${sy} C ${sx} ${sy + dy}, ${ex} ${ey - dy}, ${ex} ${ey}`
}

// ── Node instances (shared by desktop diagram + mobile stack) ────────────────
const NODE = {
  planner: (
    <OrchestratorNode
      accent={C.planner}
      icon={ClipboardList}
      title="Planner"
      phase="Before"
      desc="Reviews the agents and how they're wired before you hit Run, then suggests changes up front."
    />
  ),
  director: (
    <OrchestratorNode
      accent={C.director}
      icon={Bot}
      title="Director"
      phase="During"
      desc="After each step, decides whether to continue, redirect that step, or conclude the run early."
    />
  ),
  advisor: (
    <OrchestratorNode
      accent={C.advisor}
      icon={Lightbulb}
      title="Advisor"
      phase="After"
      desc="Scores the finished run and recommends better personas, skills, and step ordering for next time."
    />
  ),
  task: (
    <AppNode
      accent={C.start}
      icon={Rocket}
      title="Task"
      subtitle="Your prompt or trigger"
      hasInput={false}
      runState="done"
      width={178}
    />
  ),
  research: (
    <AppNode
      accent={C.agentDone}
      icon={Telescope}
      title="Researcher"
      field={{ label: 'Instructions', value: 'Search the web and gather sources on the topic.' }}
      model="Opus"
      mode={{ label: 'Plan', dot: 'bg-[#60a5fa]', text: 'text-[#60a5fa]' }}
      outputLabel="Output"
      runState="done"
      width={236}
    />
  ),
  synth: (
    <AppNode
      accent={C.agentRun}
      icon={PenLine}
      title="Synthesizer"
      field={{ label: 'Instructions', value: 'Merge the findings into one cited brief.' }}
      model="Sonnet"
      mode={{ label: 'Edit', dot: 'bg-[#22c55e]', text: 'text-[#22c55e]' }}
      outputLabel="Output"
      runState="running"
      width={236}
    />
  ),
  analysis: (
    <AppNode
      accent={C.skill}
      icon={Puzzle}
      title="Data Analysis"
      subtitle="Reusable skill"
      field={{ label: 'Skill', value: 'data-analysis' }}
      outputLabel="Skill"
      width={216}
    />
  ),
  result: (
    <AppNode
      accent={C.output}
      icon={FileOutput}
      title="Result"
      subtitle="Combined run output"
      outputLabel="Markdown"
      width={202}
    />
  ),
} as const

const LEGEND = [
  { color: C.planner, label: 'Planner', when: 'before' },
  { color: C.director, label: 'Director', when: 'during' },
  { color: C.advisor, label: 'Advisor', when: 'after' },
] as const

/** The flow diagram itself (wide on lg+, vertical on mobile) - no section
 *  chrome, so it can be dropped inside the hero's browser frame. */
export function FlowCanvas() {
  return (
    <>
      <FlowDiagram />
      <MobileFlow />
    </>
  )
}

/** Planner / Director / Advisor key for the flow, shown beneath the canvas. */
export function FlowLegend({ className = '' }: { className?: string }) {
  return (
    <ul
      className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted ${className}`}
    >
      {LEGEND.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="font-semibold text-ink">{item.label}</span>
          <span className="text-faint">{item.when}</span>
        </li>
      ))}
    </ul>
  )
}

/** Keeps a dragged node's center inside the diagram (fractional coords). */
const clampFrac = (v: number) => Math.min(0.97, Math.max(0.03, v))

type DragState = { id: string; offX: number; offY: number }

/** Wide orchestration diagram for lg+ screens. Cards sit above an SVG edge layer
 *  sharing the diagram's coordinate space, so edges and nodes stay aligned as it scales.
 *  Nodes are draggable (pointer-based, like the real canvas) - edges and the flowing
 *  pulses recompute live from the dragged positions. */
function FlowDiagram() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [pos, setPos] = useState<Record<string, Pos>>(POS)
  const [dragId, setDragId] = useState<string | null>(null)
  const [moved, setMoved] = useState(false)

  // Pointer fraction (0..1) within the diagram, from a pointer event.
  const frac = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return null
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }
  }

  const onPointerDown = (id: string) => (e: React.PointerEvent<HTMLDivElement>) => {
    const f = frac(e)
    if (!f) return
    e.preventDefault()
    dragRef.current = { id, offX: f.x - pos[id].x, offY: f.y - pos[id].y }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragId(id)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const f = frac(e)
    if (!drag || !f) return
    setPos((prev) => ({
      ...prev,
      [drag.id]: { x: clampFrac(f.x - drag.offX), y: clampFrac(f.y - drag.offY) },
    }))
    setMoved(true)
  }

  const endDrag = () => {
    dragRef.current = null
    setDragId(null)
  }

  const reset = () => {
    setPos(POS)
    setMoved(false)
  }

  return (
    <div
      ref={containerRef}
      className="relative hidden w-full lg:block"
      style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
      role="img"
      aria-label="Run lifecycle: the Planner tunes the agents before the run; a Task flows through a Researcher agent (assisted by a Data Analysis skill) into a Synthesizer agent and then the Result; the Director steers each agent step during the run; the Advisor reviews the Result afterward."
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {EDGES.map((edge, i) => {
          const d = edgePath(pos[edge.from], pos[edge.to], edge.orient)
          const pid = `edge-${edge.id}`
          const dur = edge.kind === 'flow' ? '1.5s' : edge.kind === 'orch' ? '2.3s' : '2.6s'
          return (
            <g key={edge.id}>
              {edge.glow ? (
                <path
                  className="fx-edge fx-glow"
                  d={d}
                  style={{ color: C.agentRun, stroke: C.agentRun }}
                />
              ) : null}
              <path
                id={pid}
                className={EDGE_CLASS[edge.kind]}
                d={d}
                style={{ stroke: edge.color }}
              />
              {/* Pulse that rides the wire - the "flow flowing" effect. */}
              <circle
                className="flow-dot"
                r={edge.kind === 'flow' ? 4 : 3}
                style={{ color: edge.color, fill: edge.color }}
              >
                <animateMotion
                  dur={dur}
                  begin={`-${(i * 0.5).toFixed(2)}s`}
                  repeatCount="indefinite"
                >
                  <mpath href={`#${pid}`} />
                </animateMotion>
              </circle>
            </g>
          )
        })}
      </svg>

      {Object.entries(pos).map(([id, p]) => {
        const active = dragId === id
        return (
          <div
            key={id}
            onPointerDown={onPointerDown(id)}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={`absolute touch-none select-none ${
              active ? 'z-30 cursor-grabbing' : 'z-10 cursor-grab'
            }`}
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${active ? 1.03 : 1})`,
              transition: active ? 'none' : 'transform 0.15s ease',
            }}
          >
            {NODE[id as keyof typeof NODE]}
          </div>
        )
      })}

      {moved ? (
        <button
          type="button"
          onClick={reset}
          className="absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/80 px-2.5 py-1 text-xs font-semibold text-muted backdrop-blur transition-colors hover:border-ink/30 hover:text-ink"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset layout
        </button>
      ) : null}
    </div>
  )
}

function Connector({ accent = '#9aa1a9' }: { accent?: string }) {
  return (
    <span
      className="flow-rail mx-auto block h-7 w-1 rounded-full"
      style={{ color: accent }}
      aria-hidden="true"
    />
  )
}

function PhaseLabel({
  n,
  color,
  children,
}: {
  n: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.16em]">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {n}
      </span>
      <span className="text-faint">{children}</span>
    </div>
  )
}

/** Vertical lifecycle for < lg: Before → During (the chain) → After. */
function MobileFlow() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-8 lg:hidden">
      <PhaseLabel n="1" color={C.planner}>
        Before the run
      </PhaseLabel>
      {NODE.planner}
      <Connector accent={C.planner} />

      <PhaseLabel n="2" color={C.director}>
        During the run
      </PhaseLabel>
      {NODE.director}
      <Connector accent={C.director} />
      {NODE.task}
      <Connector />
      {NODE.research}
      <Connector accent={C.skill} />
      {NODE.analysis}
      <Connector />
      {NODE.synth}
      <Connector />
      {NODE.result}
      <Connector accent={C.advisor} />

      <PhaseLabel n="3" color={C.advisor}>
        After the run
      </PhaseLabel>
      {NODE.advisor}
    </div>
  )
}
