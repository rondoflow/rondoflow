import { CatalogIcon } from '@/lib/icons'
import type { CatalogCardItem } from '@/lib/catalog-data'

// Single catalog entry as a card. Shared by the homepage preview tabs and the
// full `/catalog` browser so the two render identically.
export function CatalogCard({ item, accent }: { item: CatalogCardItem; accent: string }) {
  return (
    <article className="flex gap-3 rounded-xl border border-line bg-paper p-4 transition-colors hover:border-ink/20 hover:bg-surface/50">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        <CatalogIcon name={item.icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-ink">{item.name}</h3>
          {item.badge ? (
            <span className="shrink-0 rounded-full bg-surface2 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide text-faint">
              {item.badge}
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{item.description}</p>
      </div>
    </article>
  )
}
