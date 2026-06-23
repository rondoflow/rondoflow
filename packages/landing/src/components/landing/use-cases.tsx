import { ArrowRight } from 'lucide-react'
import { findWorkspacePreset } from '@rondoflow/catalog'
import { CatalogIcon } from '@/lib/icons'
import { SectionHeading } from './section-heading'

// Three shipped workspace presets, framed as outcomes. Pulled from the catalog
// so names, icons, and agent counts stay in sync.
const CASES = ['pr-review-crew', 'deep-research-brief', 'seo-product-descriptions']
  .map((id) => findWorkspacePreset(id))
  .filter((p): p is NonNullable<typeof p> => Boolean(p))

export function UseCases() {
  return (
    <section id="use-cases" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6" data-reveal>
        <SectionHeading
          eyebrow="What you can build"
          title="Drop in a crew and go"
          description="Each of these is a shipped workspace preset - a wired multi-agent pipeline you can add to the canvas and run as-is, then tweak."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {CASES.map((preset) => (
            <a
              key={preset.id}
              href="#catalog"
              className="group flex flex-col rounded-2xl border border-line bg-paper p-6 shadow-card transition-colors hover:border-ink/20 hover:bg-surface/50"
            >
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-node-agent/10 text-node-agent">
                <CatalogIcon name={preset.icon} className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-ink">{preset.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{preset.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <span className="font-mono text-xs text-faint">{preset.agents.length} agents</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-ink">
                  See in catalog
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
