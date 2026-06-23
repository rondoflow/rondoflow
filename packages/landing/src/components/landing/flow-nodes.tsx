// Faithful, static replicas of RondoFlow's canvas nodes (the app's NodeShell):
// rounded-2xl card, icon-chip header, a field box, a model badge, an output
// footer, and the round port handles - plus the active/done run states. Used by
// the flow showcase so the marketing diagram matches the real canvas 1:1.
import type { LucideIcon } from 'lucide-react'
import { Check, Eye, Loader2, Maximize2, Play } from 'lucide-react'

export type RunState = 'idle' | 'running' | 'done'

export type AppNodeProps = {
  accent: string
  icon: LucideIcon
  title: string
  subtitle?: string
  field?: { label: string; value: string }
  model?: string
  mode?: { label: string; dot: string; text: string }
  outputLabel?: string
  hasInput?: boolean
  runState?: RunState
  width?: number
}

// Round port handle, matching the app's `rf-port` (h-3.5 w-3.5, 2px card-colored border).
function Port({ side, accent }: { side: 'left' | 'right'; accent: string }) {
  const pos = side === 'left' ? '-left-[7px]' : '-right-[7px]'
  return (
    <span
      aria-hidden="true"
      className={`absolute ${pos} top-1/2 z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 shadow-sm`}
      style={{ backgroundColor: accent, borderColor: '#ffffff' }}
    />
  )
}

const STATE_RING: Record<RunState, string> = {
  idle: 'border-line',
  running: 'border-line ring-2 ring-[rgba(96,165,250,0.7)] shadow-[0_0_24px_rgba(96,165,250,0.35)]',
  done: 'border-[rgba(34,197,94,0.55)]',
}

export function AppNode({
  accent,
  icon: Icon,
  title,
  subtitle,
  field,
  model,
  mode,
  outputLabel,
  hasInput = true,
  runState = 'idle',
  width = 230,
}: AppNodeProps) {
  return (
    <div
      className={`relative rounded-2xl border bg-paper text-ink shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18)] ${STATE_RING[runState]}`}
      style={{ width }}
    >
      {hasInput ? <Port side="left" accent={accent} /> : null}

      <div className="flex items-center gap-2.5 px-3.5 pb-1 pt-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface2"
          style={{ color: accent }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">{title}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
          {runState === 'running' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#3b82f6]" aria-hidden="true" />
          ) : runState === 'done' ? (
            <Check className="h-3.5 w-3.5 text-[#22c55e]" aria-hidden="true" />
          ) : (
            <Play className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
          )}
        </span>
      </div>

      {subtitle ? (
        <p className="px-3.5 pb-2 pt-0.5 text-xs leading-snug text-muted">{subtitle}</p>
      ) : null}

      {field ? (
        <div className="space-y-1 px-3.5 pb-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink">
            <span className="truncate">{field.label}</span>
            <span
              className="h-2 w-2 shrink-0 rounded-full border-[1.5px]"
              style={{ borderColor: accent }}
              aria-hidden="true"
            />
          </div>
          <div className="rounded-lg border border-line bg-surface/70 px-2.5 py-1.5 text-xs leading-relaxed text-muted">
            <span className="line-clamp-2">{field.value}</span>
          </div>
          {model || mode ? (
            <div className="flex items-center gap-1.5 pt-0.5">
              {model ? (
                <span className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] leading-none text-muted">
                  {model}
                </span>
              ) : null}
              {mode ? (
                <span className="inline-flex items-center gap-1 text-[10px]">
                  <span className={`h-1.5 w-1.5 rounded-full ${mode.dot}`} aria-hidden="true" />
                  <span className={mode.text}>{mode.label}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {outputLabel ? (
        <div className="relative flex items-center justify-between border-t border-line px-3.5 py-2">
          <Eye className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink">
            <span className="truncate">{outputLabel}</span>
            <Maximize2 className="h-3 w-3 text-faint" aria-hidden="true" />
          </div>
          <Port side="right" accent={accent} />
        </div>
      ) : (
        <Port side="right" accent={accent} />
      )}
    </div>
  )
}

// The Planner / Director / Advisor orchestrators. Same card aesthetic as a node,
// but dashed (they steer the run rather than carry data) and tagged with the
// lifecycle phase they act in.
export function OrchestratorNode({
  accent,
  icon: Icon,
  title,
  phase,
  desc,
  width = 244,
}: {
  accent: string
  icon: LucideIcon
  title: string
  phase: string
  desc: string
  width?: number
}) {
  return (
    <div
      className="rounded-2xl border border-dashed bg-paper shadow-[0_8px_24px_-8px_rgba(15,23,42,0.14)]"
      style={{ width, borderColor: `${accent}66` }}
    >
      <div className="flex items-center gap-2.5 px-3.5 pb-1.5 pt-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight text-ink">
          {title}
        </span>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          {phase}
        </span>
      </div>
      <p className="px-3.5 pb-3 pt-0.5 text-xs leading-snug text-muted">{desc}</p>
    </div>
  )
}
