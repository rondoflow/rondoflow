'use client'

import { useCallback, useEffect, useState } from 'react'
import { Play, X } from 'lucide-react'
import { SITE } from '@/lib/site'

// "Watch the demo" button + lightbox player for the hero. Renders nothing until
// SITE.demoVideo points at a real file, so the site stays clean before a
// recording exists. Closes on backdrop click or Escape and locks body scroll
// while open.
export function HeroVideo() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close])

  if (!SITE.demoVideo) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-6 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
      >
        <Play className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
        Watch the demo
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={SITE.demoTitle}
          onClick={close}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-line bg-ink shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close demo video"
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink/70 text-paper transition-colors hover:bg-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <video
              className="aspect-video w-full"
              src={SITE.demoVideo}
              poster={SITE.demoPoster}
              controls
              autoPlay
              playsInline
            >
              <track kind="captions" />
            </video>
          </div>
        </div>
      )}
    </>
  )
}
