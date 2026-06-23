import { Blocks, CalendarClock, Cpu, Network, ShieldCheck, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeading } from './section-heading'

type Feature = { icon: LucideIcon; tint: string; title: string; body: string }

const FEATURES: readonly Feature[] = [
  {
    icon: Workflow,
    tint: 'bg-ink/5 text-ink',
    title: 'Visual canvas',
    body: 'Drag agents, skills, and guardrails onto a board and connect them. The graph you draw is the workflow that runs.',
  },
  {
    icon: Network,
    tint: 'bg-node-agent/10 text-node-agent',
    title: 'Multi-agent workflows',
    body: 'Branch work across agents in parallel, add conditions, and merge results. RondoFlow runs the DAG and shows each step live.',
  },
  {
    icon: Blocks,
    tint: 'bg-node-skill/10 text-node-skill',
    title: 'Reusable skills',
    body: 'Attach instruction sets to any agent. Write your own or pull ready-made ones from the shipped catalog.',
  },
  {
    icon: ShieldCheck,
    tint: 'bg-node-wait/10 text-node-wait',
    title: 'Guardrails & policies',
    body: 'Set tool permissions and safety policies per agent. When rules overlap, the most restrictive one always wins.',
  },
  {
    icon: CalendarClock,
    tint: 'bg-node-agent/10 text-node-agent',
    title: 'Scheduled runs',
    body: 'Put any workflow on a cron schedule and let it run on its own - reports, reviews, and research while you are away.',
  },
  {
    icon: Cpu,
    tint: 'bg-ink/5 text-ink',
    title: 'Local-first',
    body: 'Everything runs on your machine against the Claude Code CLI. Your code, prompts, and keys never leave it.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6" data-reveal>
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to wire agents together"
          description="A focused toolkit for building, securing, and running multi-agent workflows - without leaving your machine."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group bg-paper p-7 transition-colors hover:bg-surface/60"
              >
                <span
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.tint}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
