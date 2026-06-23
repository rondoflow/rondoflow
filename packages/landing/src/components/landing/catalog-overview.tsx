import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { CATALOG_ISSUE_URL } from '@/lib/site'
import { CATALOG_GROUPS, CATALOG_TOTAL } from '@/lib/catalog-data'
import { CatalogTabs, type CatalogGroup } from './catalog-tabs'

// Ship only a preview of each group to the client component - the homepage
// doesn't need all (now thousands of) cards in its serialized payload or DOM.
// The real totals still render on the tabs; the full, paginated catalog lives
// on the dedicated /catalog page.
const PREVIEW_LIMIT = 12
const PREVIEW_GROUPS: CatalogGroup[] = CATALOG_GROUPS.map((g) => ({
  ...g,
  total: g.items.length,
  items: g.items.slice(0, PREVIEW_LIMIT),
}))

export function CatalogOverview() {
  return (
    <section id="catalog" className="border-y border-line bg-surface/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Catalog"
          title="Start with what ships in the box"
          description={`${CATALOG_TOTAL} ready-to-use building blocks come bundled - agents, workspaces, skills, facilitators, and canvas templates. Use them as-is, remix them, or build your own.`}
        />
        <div className="mt-12">
          <CatalogTabs groups={PREVIEW_GROUPS} />
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/catalog"
            className="group inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          >
            Browse the full catalog
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-line bg-paper/70 px-6 py-5 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-base font-semibold text-ink">Missing something?</h3>
            <p className="mt-0.5 text-sm text-muted">
              The catalog is open and community-extensible - suggest a new agent, skill, or
              workspace and we’ll review it.
            </p>
          </div>
          <a
            href={CATALOG_ISSUE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Suggest a catalog item
          </a>
        </div>
      </div>
    </section>
  )
}
