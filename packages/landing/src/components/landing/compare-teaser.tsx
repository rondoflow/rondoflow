import Link from 'next/link'
import { ArrowRight, Check, Minus } from 'lucide-react'
import { ROWS, TOOLS, type Cell } from '@/lib/comparison'
import { SectionHeading } from './section-heading'

// A short preview of the full /compare matrix - RondoFlow's headline
// differentiators only - that links through to the complete comparison.
const PICK = [
  'Open source',
  'Runs coding agents (your files + shell)',
  'Per-agent security policies',
  'Plan · steer · review the run',
]
const TEASER_ROWS = PICK.map((label) => ROWS.find((r) => r.label === label)).filter(
  (r): r is NonNullable<typeof r> => Boolean(r),
)

function Mark({ cell }: { cell: Cell }) {
  if (cell.kind === 'text') return <span className="text-xs text-ink">{cell.text}</span>
  if (cell.kind === 'yes')
    return <Check className="mx-auto h-4 w-4 text-node-skill" strokeWidth={2.5} aria-label="Yes" />
  if (cell.kind === 'partial')
    return (
      <Minus className="mx-auto h-4 w-4 text-node-wait" strokeWidth={2.5} aria-label="Partial" />
    )
  return <span className="mx-auto block h-0.5 w-3 rounded-full bg-faint/50" aria-label="No" />
}

export function CompareTeaser() {
  return (
    <section className="border-t border-line bg-surface/60 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6" data-reveal>
        <SectionHeading
          eyebrow="Compare"
          title="How RondoFlow stacks up"
          description="The short version against Langflow, Flowise, Hiveflow.ai, and Relay.app - see the full 15-point breakdown on the comparison page."
        />

        <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-paper shadow-card">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-3" />
                {TOOLS.map((tool, i) => (
                  <th
                    key={tool}
                    className={`px-3 py-3 text-center text-sm font-semibold ${
                      i === 0 ? 'bg-ink text-paper' : 'text-muted'
                    }`}
                  >
                    {tool}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEASER_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-line/70 last:border-0">
                  <th scope="row" className="px-4 py-3 text-sm font-medium text-ink">
                    {row.label}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-3 py-3 text-center ${i === 0 ? 'bg-accent/[0.05]' : ''}`}
                    >
                      <Mark cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/compare"
            className="group inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
          >
            See the full comparison
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
