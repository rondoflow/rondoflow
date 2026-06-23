import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { CatalogBrowser } from '@/components/landing/catalog-browser'
import { CATALOG_GROUPS, CATALOG_TOTAL } from '@/lib/catalog-data'
import { CATALOG_ISSUE_URL } from '@/lib/site'

const CATALOG_TITLE = 'Catalog - agents, skills, workspaces & more'
const CATALOG_DESC = `Browse all ${CATALOG_TOTAL} building blocks that ship with RondoFlow: pre-built agents, reusable skills, multi-agent workspaces, discussion facilitators, and canvas templates. Search and page through the full catalog.`

export const metadata: Metadata = {
  title: { absolute: CATALOG_TITLE },
  description: CATALOG_DESC,
  alternates: { canonical: '/catalog/' },
  openGraph: {
    type: 'website',
    url: '/catalog/',
    title: CATALOG_TITLE,
    description: CATALOG_DESC,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'RondoFlow catalog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: CATALOG_TITLE,
    description: CATALOG_DESC,
    images: ['/og.png'],
  },
}

export default function CatalogPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-line">
          <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
          <div
            className="canvas-grid pointer-events-none absolute inset-0 opacity-60"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl px-6 pb-12 pt-20 text-center sm:pt-24">
            <nav
              aria-label="Breadcrumb"
              className="mb-4 flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-faint"
            >
              <Link href="/" className="transition-colors hover:text-ink">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-accent-ink">Catalog</span>
            </nav>
            <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              The RondoFlow catalog
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted">
              {CATALOG_TOTAL} ready-to-use building blocks ship in the box - agents, skills,
              workspaces, facilitators, and canvas templates. Search, filter by category, and page
              through them all.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <CatalogBrowser groups={CATALOG_GROUPS} />
          </div>
        </section>

        <section className="border-t border-line bg-surface/60 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-line bg-paper/70 px-6 py-5 text-center sm:flex-row sm:text-left">
              <div>
                <h2 className="text-base font-semibold text-ink">Missing something?</h2>
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
      </main>
      <SiteFooter />
    </>
  )
}
