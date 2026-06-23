'use client'

import { useState } from 'react'
import { CatalogCard } from './catalog-card'
import type { CatalogGroupData } from '@/lib/catalog-data'

export type CatalogGroup = CatalogGroupData & {
  /** Real number of items in this group (may exceed items.length when previewed). */
  total: number
}

export function CatalogTabs({ groups }: { groups: CatalogGroup[] }) {
  const [active, setActive] = useState(groups[0]?.key ?? '')
  const current = groups.find((g) => g.key === active) ?? groups[0]

  return (
    <div>
      <div
        role="tablist"
        aria-label="Catalog categories"
        className="flex flex-wrap justify-center gap-2"
      >
        {groups.map((group) => {
          const selected = group.key === current.key
          return (
            <button
              key={group.key}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(group.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-paper text-muted hover:border-ink/30 hover:text-ink'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: selected ? '#fff' : group.accent }}
                aria-hidden="true"
              />
              {group.label}
              <span className={selected ? 'text-paper/70' : 'text-faint'}>{group.total}</span>
            </button>
          )
        })}
      </div>

      <p className="mt-6 text-center text-sm text-muted">{current.blurb}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {current.items.map((item) => (
          <CatalogCard key={item.id} item={item} accent={current.accent} />
        ))}
      </div>

      {current.total > current.items.length ? (
        <p className="mt-6 text-center text-xs text-faint">
          Showing {current.items.length} of {current.total} - browse the full catalog below.
        </p>
      ) : null}
    </div>
  )
}
