'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Github, Menu, X } from 'lucide-react'
import { SITE } from '@/lib/site'
import { ThemeToggle } from './theme-toggle'

type Item = { href: string; label: string }

export function MobileNav({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-paper text-ink transition-colors hover:border-ink/30"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 top-16 z-30 cursor-default bg-ink/10"
          />
          <nav
            aria-label="Mobile"
            className="absolute left-0 right-0 top-full z-40 border-b border-line bg-paper/95 px-6 py-4 shadow-lift backdrop-blur"
          >
            <ul className="flex flex-col gap-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-line pt-2">
                <a
                  href={SITE.docs}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
                >
                  Docs
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={SITE.github}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  GitHub
                </a>
              </li>
              <li className="mt-1 flex items-center justify-between border-t border-line px-3 pt-3">
                <span className="text-sm font-medium text-ink">Theme</span>
                <ThemeToggle />
              </li>
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  )
}
