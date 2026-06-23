import Link from 'next/link'
import { Workflow } from 'lucide-react'
import { SITE } from '@/lib/site'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/#how' },
      { label: 'Features', href: '/#features' },
      { label: 'Capabilities', href: '/#capabilities' },
      { label: 'Install', href: '/#install' },
      { label: 'Screenshots', href: '/#screenshots' },
      { label: 'Catalog', href: '/catalog' },
      { label: 'Compare', href: '/compare' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: SITE.docs },
      { label: 'GitHub', href: SITE.github },
      { label: 'Changelog', href: SITE.changelog },
      { label: 'License (MIT)', href: SITE.license },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discussions', href: SITE.discussions },
      { label: 'Report a bug', href: SITE.issues },
      { label: 'Roadmap', href: SITE.roadmap },
      { label: 'Contributing', href: SITE.contributing },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-3">
          <span className="rf-logo text-base text-ink">
            <span className="rf-logo-mark">
              <Workflow className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </span>
            <span>RondoFlow</span>
          </span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            A local-first, open-source canvas for orchestrating Claude Code agents.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-faint">
              {column.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-faint sm:flex-row">
          <p>MIT © RondoFlow contributors</p>
          <p className="font-mono">Built on Claude Code · Not affiliated with Anthropic</p>
        </div>
      </div>
    </footer>
  )
}

// Internal routes go through next/link; external resources stay plain anchors.
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className = 'text-sm text-muted transition-colors hover:text-ink'
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
