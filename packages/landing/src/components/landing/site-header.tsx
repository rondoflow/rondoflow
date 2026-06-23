import Link from 'next/link'
import { ArrowUpRight, Github, Star, Workflow } from 'lucide-react'
import { SITE } from '@/lib/site'
import { MobileNav } from './mobile-nav'
import { ThemeToggle } from './theme-toggle'

const NAV = [
  { href: '/#how', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/#install', label: 'Install' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/compare', label: 'Compare' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="rf-logo text-[1.05rem] text-ink" aria-label="RondoFlow home">
          <span className="rf-logo-mark">
            <Workflow className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <span>RondoFlow</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-nav
              className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={SITE.docs}
            className="hidden items-center gap-1 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-ink sm:inline-flex"
          >
            Docs
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <ThemeToggle className="hidden sm:inline-flex" />
          <a
            href={SITE.github}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/30"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Star on GitHub</span>
            <span className="sm:hidden">GitHub</span>
            <Star className="h-3.5 w-3.5 text-node-wait" aria-hidden="true" fill="currentColor" />
          </a>
          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  )
}
