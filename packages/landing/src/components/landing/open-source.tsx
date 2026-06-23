import { ArrowUpRight, Github, GitFork, Scale } from 'lucide-react'
import { SITE } from '@/lib/site'

export function OpenSource() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="canvas-grid relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 text-center sm:px-12">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-ink">
            Open source
          </p>
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Yours to read, run, and reshape
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted">
            RondoFlow is MIT-licensed and built in the open. Fork it, file an issue, or send a pull
            request - the whole platform, including this page, lives in one repository.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={SITE.github}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              Star on GitHub
            </a>
            <a
              href={SITE.docs}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-6 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
            >
              Read the docs
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-faint">
            <li className="inline-flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" aria-hidden="true" /> MIT license
            </li>
            <li className="inline-flex items-center gap-1.5">
              <GitFork className="h-3.5 w-3.5" aria-hidden="true" /> Contributions welcome
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-node-skill" aria-hidden="true" />
              {SITE.repo}
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
