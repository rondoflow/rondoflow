import {
  AGENT_TEMPLATES,
  CANVAS_TEMPLATES,
  FACILITATOR_PRESETS,
  SKILL_CATALOG,
  WORKSPACE_PRESETS,
} from '@rondoflow/catalog'

const STATS = [
  { n: AGENT_TEMPLATES.length, label: 'Agents' },
  { n: WORKSPACE_PRESETS.length, label: 'Workspaces' },
  { n: FACILITATOR_PRESETS.length, label: 'Facilitators' },
  { n: SKILL_CATALOG.length, label: 'Skills' },
  { n: CANVAS_TEMPLATES.length, label: 'Templates' },
]

const TOTAL = STATS.reduce((sum, s) => sum + s.n, 0)

export function Proof() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-center font-mono text-xs uppercase tracking-[0.18em] text-faint">
          Batteries included - {TOTAL} ready-to-use building blocks
        </p>
        <dl className="mt-7 grid grid-cols-2 gap-6 text-center sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="text-3xl font-bold tracking-tight text-ink">{stat.n}</dt>
              <dd className="mt-1 text-xs uppercase tracking-wide text-muted">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
