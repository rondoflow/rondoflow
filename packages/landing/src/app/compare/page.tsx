import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, Github, Minus } from 'lucide-react'
import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { SectionHeading } from '@/components/landing/section-heading'
import { ComparisonMatrix } from '@/components/landing/comparison-matrix'
import { CompareJsonLd } from '@/components/landing/compare-json-ld'
import { CHOOSE, COMPETITORS } from '@/lib/comparison'
import { SITE } from '@/lib/site'

const COMPARE_TITLE = 'RondoFlow vs Langflow, Flowise, Hiveflow.ai & Relay.app'
const COMPARE_DESC =
  'An honest comparison of RondoFlow with Langflow, Flowise, Hiveflow.ai, and Relay.app - open source vs proprietary, local-first vs cloud, and where each one fits.'

export const metadata: Metadata = {
  title: { absolute: COMPARE_TITLE },
  description: COMPARE_DESC,
  alternates: { canonical: '/compare/' },
  openGraph: {
    type: 'article',
    url: '/compare/',
    title: COMPARE_TITLE,
    description: COMPARE_DESC,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'RondoFlow comparison' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: COMPARE_TITLE,
    description: COMPARE_DESC,
    images: ['/og.png'],
  },
}

export default function ComparePage() {
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
              <span className="text-accent-ink">Compare</span>
            </nav>
            <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              How RondoFlow compares
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted">
              Langflow, Flowise, Hiveflow.ai, and Relay.app all let you wire AI into a visual flow.
              They solve overlapping but different problems - here is where RondoFlow fits, stated
              fairly.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Legend />
            <div className="mt-6">
              <ComparisonMatrix />
            </div>
            <p className="mt-4 text-center text-xs text-faint">
              Compiled from public sources, June 2026. These tools evolve quickly - check each
              project for the latest.
            </p>
          </div>
        </section>

        <section className="border-t border-line bg-surface/60 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="The others, fairly"
              title="What each tool is great at"
              description="RondoFlow is purpose-built for one thing: orchestrating Claude Code agents on your machine. These are excellent at theirs."
            />
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {COMPETITORS.map((tool) => (
                <article
                  key={tool.name}
                  className="flex flex-col rounded-2xl border border-line bg-paper p-6 shadow-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-ink">{tool.name}</h3>
                    <a
                      href={tool.url}
                      className="inline-flex items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-ink"
                    >
                      Visit
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{tool.oneLiner}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Chip>{tool.license}</Chip>
                    <Chip>{tool.hosting}</Chip>
                  </div>
                  <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
                    <div>
                      <dt className="font-mono text-[11px] uppercase tracking-wide text-faint">
                        Best for
                      </dt>
                      <dd className="mt-0.5 text-muted">{tool.bestFor}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[11px] uppercase tracking-wide text-faint">
                        vs RondoFlow
                      </dt>
                      <dd className="mt-0.5 text-muted">{tool.vs}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <SectionHeading
              eyebrow="Which should you pick?"
              title="Choose by what you’re actually building"
              align="center"
            />
            <ul className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
              {CHOOSE.map((item) => {
                const isUs = item.pick === 'RondoFlow'
                return (
                  <li
                    key={item.need}
                    className={`flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
                      isUs ? 'bg-accent/[0.05]' : ''
                    }`}
                  >
                    <span className="text-sm text-muted">{item.need}</span>
                    <span
                      className={`shrink-0 text-sm font-semibold ${isUs ? 'text-accent-ink' : 'text-ink'}`}
                    >
                      → {item.pick}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <section className="border-t border-line py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Run agents on your own machine
            </h2>
            <p className="mx-auto mt-3 max-w-md text-pretty text-base leading-relaxed text-muted">
              Open source, local-first, and free to run. Install RondoFlow in three steps.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/#install"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
              >
                Install in 3 steps
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <a
                href={SITE.github}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-6 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                View on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <CompareJsonLd />
    </>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-muted">
      {children}
    </span>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
      <span className="inline-flex items-center gap-1.5">
        <Check className="h-4 w-4 text-node-skill" strokeWidth={2.5} aria-hidden="true" /> Yes
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Minus className="h-4 w-4 text-node-wait" strokeWidth={2.5} aria-hidden="true" /> Partial /
        limited
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-0.5 w-3 rounded-full bg-faint/50" aria-hidden="true" /> No / not the
        focus
      </span>
    </div>
  )
}
