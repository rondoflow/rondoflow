import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Github, Workflow } from 'lucide-react'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: '404 - Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="canvas-grid pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />

      <div className="relative">
        <Link
          href="/"
          className="rf-logo mx-auto mb-8 w-fit text-lg text-ink"
          aria-label="RondoFlow home"
        >
          <span className="rf-logo-mark">
            <Workflow className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <span>RondoFlow</span>
        </Link>

        <p className="font-mono text-sm uppercase tracking-[0.18em] text-accent-ink">Error 404</p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          This page wandered off the canvas
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-muted">
          The page you’re looking for doesn’t exist or has moved. Let’s get you back on track.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          >
            Back to home
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
            GitHub
          </a>
        </div>
      </div>
    </main>
  )
}
