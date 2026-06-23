import { Lock } from 'lucide-react'

// A light browser chrome wrapper - traffic-light dots + an address bar - so the
// content inside reads clearly as "the app, running in a browser". Reused by the
// hero (around the live flow canvas) and the screenshots section.
export function BrowserFrame({
  url = 'localhost:3000',
  children,
  className = '',
  contentClassName = '',
}: {
  url?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-line bg-surface shadow-lift ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-node-error/70" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-node-wait/70" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-node-skill/70" aria-hidden="true" />
        <span className="ml-3 inline-flex items-center gap-1.5 rounded-md bg-paper px-3 py-1 font-mono text-[0.7rem] text-faint">
          <Lock className="h-3 w-3" aria-hidden="true" />
          {url}
        </span>
      </div>
      <div className={`relative ${contentClassName}`}>{children}</div>
    </div>
  )
}
