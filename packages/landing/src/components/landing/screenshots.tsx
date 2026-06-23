import { Moon, Sun } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { BrowserFrame } from './browser-frame'

export function Screenshots() {
  return (
    <section id="screenshots" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Screenshots"
          title="The real canvas"
          description="Agents, skills, and guardrails as nodes; live status as a run executes; results streaming back - in a local-first app you own, in whichever theme you like."
        />

        <div className="mx-auto mt-12 max-w-5xl">
          <BrowserFrame contentClassName="bg-surface">
            <div className="relative overflow-hidden">
              {/* Light theme (base). WebP with PNG fallback; lazy (below the fold). */}
              <picture>
                <source srcSet="/hero.webp" type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero.png"
                  width={1957}
                  height={1277}
                  loading="lazy"
                  decoding="async"
                  alt="The RondoFlow canvas: agent and skill nodes connected by edges into a workflow, with a run toolbar and a results panel."
                  className="block h-auto w-full"
                />
              </picture>
              {/* Dark theme - same image, dark-mode filter, masked to one half of a 30° split. */}
              <picture>
                <source srcSet="/hero.webp" type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero.png"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="screenshot-dark pointer-events-none absolute inset-0 h-full w-full"
                />
              </picture>
              {/* Divider line along the same 30° axis. */}
              <span
                className="screenshot-split pointer-events-none absolute inset-0"
                aria-hidden="true"
              />
              {/* Theme cues - Sun on the light half, Moon on the dark half. */}
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/90 px-2.5 py-1 text-xs font-medium text-ink shadow-sm backdrop-blur">
                <Sun className="h-3.5 w-3.5 text-node-wait" aria-hidden="true" />
                Light
              </span>
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/90 px-2.5 py-1 text-xs font-medium text-paper shadow-sm backdrop-blur">
                <Moon className="h-3.5 w-3.5 text-node-agent" aria-hidden="true" />
                Dark
              </span>
            </div>
          </BrowserFrame>
        </div>
      </div>
    </section>
  )
}
