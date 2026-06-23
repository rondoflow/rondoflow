import { GitBranch, Layers, ShieldCheck, Clock, ArrowRight } from 'lucide-react'
import { SectionHeading } from './section-heading'

// The single biggest objection: "why not just use Claude Code in my terminal?"
// This section answers it head-on with a side-by-side contrast - one terminal
// session vs an orchestrated canvas - then names what orchestration adds.

const GAINS = [
  {
    icon: Layers,
    title: 'Many agents, in parallel',
    body: 'Run a whole crew at once - reviewers, researchers, writers - instead of one session, one turn at a time.',
  },
  {
    icon: GitBranch,
    title: 'Wired into a workflow',
    body: "Outputs flow agent-to-agent on a visual DAG with branches and conditions, so a run is repeatable - not a chat you'd have to redo.",
  },
  {
    icon: ShieldCheck,
    title: 'Per-agent guardrails',
    body: 'Each agent gets its own security policy - allowed tools, paths, and permissions - instead of one blanket trust level for the terminal.',
  },
  {
    icon: Clock,
    title: 'Plan, steer, schedule',
    body: 'Planner, Director, and Advisor plan, steer, and review each run; the Scheduler reruns it on a cron - none of which a bare terminal gives you.',
  },
]

export function VersusTerminal() {
  return (
    <section id="why-canvas" className="border-t border-line bg-surface/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6" data-reveal>
        <SectionHeading
          eyebrow="Why a canvas"
          title="Claude Code is one agent. RondoFlow runs the orchestra."
          description="Claude Code in the terminal is a single agent taking one turn at a time. RondoFlow keeps that power and adds the layer above it: many agents, wired together, with guardrails and AI that plans and reviews each run."
        />

        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-2">
          {/* Terminal: a single agent */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-node-error/70" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-node-wait/70" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-node-skill/70" aria-hidden="true" />
              <span className="ml-2 font-mono text-xs text-faint">claude - terminal</span>
            </div>
            <pre className="flex-1 overflow-x-auto px-5 py-5 font-mono text-xs leading-relaxed text-muted">
              <span className="text-accent-ink">$ </span>claude &quot;review this PR&quot;{'\n'}
              <span className="text-faint">{'>'} reading files...</span>
              {'\n'}
              <span className="text-faint">{'>'} one agent, one session</span>
              {'\n'}
              <span className="text-faint">{'>'} you drive every turn by hand</span>
              {'\n\n'}
              <span className="text-ink">done. now do it all again</span>
              {'\n'}
              <span className="text-ink">for the next task...</span>
            </pre>
            <p className="border-t border-line px-5 py-3.5 text-xs font-medium text-faint">
              One agent. One terminal. Manual, every time.
            </p>
          </div>

          {/* Canvas: an orchestrated crew */}
          <div className="canvas-grid flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="font-mono text-xs text-accent-ink">RondoFlow - canvas</span>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3 px-5 py-6">
              <div className="flex items-center gap-3">
                <Node dot="bg-node-agent" label="Planner" />
                <Wire />
                <div className="flex flex-col gap-2">
                  <Node dot="bg-node-skill" label="Reviewer" small />
                  <Node dot="bg-node-skill" label="Researcher" small />
                  <Node dot="bg-node-skill" label="Writer" small />
                </div>
                <Wire />
                <Node dot="bg-node-agent" label="Advisor" />
              </div>
              <p className="mt-2 font-mono text-[11px] text-faint">
                3 agents running in parallel - wired, policed, repeatable
              </p>
            </div>
            <p className="border-t border-line px-5 py-3.5 text-xs font-medium text-accent-ink">
              A crew on one canvas. Wired, guarded, and rerunnable.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GAINS.map((gain) => (
            <div
              key={gain.title}
              className="rounded-2xl border border-line bg-paper p-5 shadow-card"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-node-agent/10 text-node-agent">
                <gain.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold text-ink">{gain.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{gain.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/compare"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-accent-ink"
          >
            See how RondoFlow compares, point by point
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  )
}

function Node({ dot, label, small }: { dot: string; label: string; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper font-mono text-xs text-ink shadow-card ${
        small ? 'px-2.5 py-1.5' : 'px-3 py-2'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  )
}

function Wire() {
  return <span className="h-px w-5 flex-none bg-faint/50 sm:w-7" aria-hidden="true" />
}
