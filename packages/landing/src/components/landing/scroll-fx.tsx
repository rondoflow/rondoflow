'use client'

import { useEffect } from 'react'

// One mounted-once enhancer:
//  1. Scroll reveal - fades [data-reveal] elements in as they enter (only when
//     <html> has `.reveal-ready`, set by the no-FOUC script when motion is OK).
//  2. Scroll-spy - marks the [data-nav] link whose section is in view with
//     aria-current="true" (styled in globals.css).
export function ScrollFx() {
  useEffect(() => {
    const cleanups: Array<() => void> = []

    const revealEls = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (
      document.documentElement.classList.contains('reveal-ready') &&
      'IntersectionObserver' in window
    ) {
      const ro = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add('is-in')
              ro.unobserve(e.target)
            }
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
      )
      revealEls.forEach((el) => ro.observe(el))
      cleanups.push(() => ro.disconnect())
    } else {
      revealEls.forEach((el) => el.classList.add('is-in'))
    }

    const navLinks = Array.from(document.querySelectorAll<HTMLElement>('[data-nav]'))
    const byId = new Map<string, HTMLElement>()
    for (const link of navLinks) {
      const id = (link.getAttribute('href') || '').split('#')[1]
      if (id) byId.set(id, link)
    }
    const sections = Array.from(byId.keys())
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if ('IntersectionObserver' in window && sections.length) {
      const so = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              navLinks.forEach((l) => l.setAttribute('aria-current', 'false'))
              byId.get(e.target.id)?.setAttribute('aria-current', 'true')
            }
          }
        },
        { rootMargin: '-45% 0px -50% 0px' },
      )
      sections.forEach((s) => so.observe(s))
      cleanups.push(() => so.disconnect())
    }

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return null
}
