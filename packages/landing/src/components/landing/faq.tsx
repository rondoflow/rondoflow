import { ChevronDown } from 'lucide-react'
import { FAQ } from '@/lib/faq'
import { SectionHeading } from './section-heading'

export function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6" data-reveal>
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />

        <div className="mt-12 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-line bg-paper px-5 py-4 shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink">
                {item.q}
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-faint transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
