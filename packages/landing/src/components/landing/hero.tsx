import { ArrowRight, Github, Lock } from 'lucide-react'
import { SITE } from '@/lib/site'
import { BrowserFrame } from './browser-frame'
import { FlowCanvas, FlowLegend } from './flow-showcase'
import { HeroVideo } from './hero-video'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="canvas-grid pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper/70 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-node-skill" aria-hidden="true" />
            Open source · Local-first
          </p>

          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Orchestrate Claude Code agents <span className="gradient-text">on a canvas.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
            Drag agents onto a board and wire them into a workflow. A Planner tunes it before the
            run, a Director steers each step, and an Advisor reviews the result - all on your own
            machine.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#install"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            >
              Install in 3 steps
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            <a
              href={SITE.github}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-6 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              View on GitHub
            </a>
            {/*
            <HeroVideo />
            */}
          </div>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-faint">
            <li className="inline-flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
              Open source
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Runs locally
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-node-agent" aria-hidden="true" />
              Super easy to use
            </li>
          </ul>
        </div>

        {/* The live workflow, framed as the app in a browser. Doubles as "how it works". */}
        <div id="how" className="relative mx-auto mt-16 max-w-6xl scroll-mt-24">
          <FlowCanvas />
          <FlowLegend className="mt-8" />
        </div>
      </div>
    </section>
  )
}
