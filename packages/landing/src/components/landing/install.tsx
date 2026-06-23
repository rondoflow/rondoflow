import { Boxes, KeyRound, Terminal } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { CopyButton } from './copy-button'

type Step = { n: string; title: string; note: React.ReactNode; lines: string[] }

const STEPS: readonly Step[] = [
  {
    n: '01',
    title: 'Clone the repo',
    note: 'Grab the source and step inside.',
    lines: ['git clone https://github.com/rondoflow/rondoflow.git', 'cd rondoflow'],
  },
  {
    n: '02',
    title: 'Set it up',
    note: 'One command installs dependencies, writes your .env, starts Postgres, then migrates and seeds the database.',
    lines: ['npm run setup'],
  },
  {
    n: '03',
    title: 'Start it',
    note: (
      <>
        Launches everything. Open <span className="font-mono text-ink">http://localhost:3000</span>{' '}
        and sign in.
      </>
    ),
    lines: ['npm run dev'],
  },
]

const PREREQS = [
  { icon: Terminal, label: 'Node.js 20+' },
  { icon: Boxes, label: 'Docker' },
  { icon: KeyRound, label: 'A Claude credential' },
]

export function Install() {
  return (
    <section id="install" className="border-y border-line bg-surface/60 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          eyebrow="Install"
          title="Up and running in 3 steps"
          description="RondoFlow runs locally. You need Node, Docker, and a Claude credential - either an Anthropic API key or a Claude Code OAuth token."
        />

        <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
          {PREREQS.map((req) => {
            const Icon = req.icon
            return (
              <li
                key={req.label}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm text-muted"
              >
                <Icon className="h-4 w-4 text-faint" strokeWidth={1.75} aria-hidden="true" />
                {req.label}
              </li>
            )
          })}
        </ul>

        <ol className="mt-12 space-y-5">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="rounded-2xl border border-line bg-paper p-5 shadow-card sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="mt-0.5 font-mono text-sm font-semibold text-accent-ink">
                  {step.n}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.note}</p>
                  <CommandBlock lines={step.lines} />
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-2xl border border-dashed border-line bg-paper/60 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-node-agent/10 text-node-agent">
              <Boxes className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-ink">Prefer plain Docker?</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Copy the example env, fill in your secrets, and bring the whole stack up in
                containers instead.
              </p>
              <CommandBlock lines={['cp .env.example .env', 'docker compose up']} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CommandBlock({ lines }: { lines: string[] }) {
  return (
    <div className="relative mt-4 rounded-xl border border-line bg-surface2 p-4 pr-14 font-mono text-sm">
      <div className="absolute right-3 top-3">
        <CopyButton text={lines.join('\n')} />
      </div>
      <pre className="overflow-x-auto">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="block whitespace-pre text-ink">
              <span className="select-none text-faint">$ </span>
              {line}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
