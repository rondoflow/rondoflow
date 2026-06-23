import { Check, Minus } from 'lucide-react'
import { ROWS, TOOLS, type Cell } from '@/lib/comparison'

function CellContent({ cell }: { cell: Cell }) {
  if (cell.kind === 'text') {
    return <span className="text-xs leading-snug text-ink">{cell.text}</span>
  }
  if (cell.kind === 'yes') {
    return (
      <span className="flex flex-col items-center gap-1">
        <Check className="h-4 w-4 text-node-skill" strokeWidth={2.5} aria-label="Yes" />
        {cell.note ? (
          <span className="text-[11px] leading-tight text-faint">{cell.note}</span>
        ) : null}
      </span>
    )
  }
  if (cell.kind === 'partial') {
    return (
      <span className="flex flex-col items-center gap-1">
        <Minus className="h-4 w-4 text-node-wait" strokeWidth={2.5} aria-label="Partial" />
        {cell.note ? (
          <span className="text-[11px] leading-tight text-faint">{cell.note}</span>
        ) : null}
      </span>
    )
  }
  return (
    <span className="flex flex-col items-center gap-1">
      <span className="h-0.5 w-3 rounded-full bg-faint/50" aria-label="No" />
      {cell.note ? <span className="text-[11px] leading-tight text-faint">{cell.note}</span> : null}
    </span>
  )
}

export function ComparisonMatrix() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-paper shadow-card">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            <th className="sticky left-0 z-10 bg-paper px-4 py-4" scope="col">
              <span className="sr-only">Capability</span>
            </th>
            {TOOLS.map((tool, i) => {
              const isUs = i === 0
              return (
                <th
                  key={tool}
                  scope="col"
                  className={`px-4 py-4 text-center align-bottom ${isUs ? 'bg-ink' : ''}`}
                >
                  <span className={`text-sm font-semibold ${isUs ? 'text-paper' : 'text-muted'}`}>
                    {tool}
                  </span>
                  {isUs ? (
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-wide text-paper/60">
                      You are here
                    </span>
                  ) : null}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-line/70 last:border-0">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-paper px-4 py-3 text-sm font-medium text-ink"
              >
                {row.label}
              </th>
              {row.cells.map((cell, i) => {
                const isUs = i === 0
                return (
                  <td
                    key={i}
                    className={`px-4 py-3 text-center align-middle ${
                      isUs ? 'bg-accent/[0.05]' : ''
                    }`}
                  >
                    <CellContent cell={cell} />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
