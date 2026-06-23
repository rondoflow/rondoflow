'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { CatalogCard } from './catalog-card'
import type { CatalogGroupData } from '@/lib/catalog-data'

const PAGE_SIZE = 24

// Builds a compact page list with `…` gaps: always first + last, plus a window
// around the current page. Gaps are encoded as the string 'gap'.
function pageWindow(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('gap')
    out.push(p)
    prev = p
  }
  return out
}

export function CatalogBrowser({ groups }: { groups: CatalogGroupData[] }) {
  const [activeKey, setActiveKey] = useState(groups[0]?.key ?? '')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const group = groups.find((g) => g.key === activeKey) ?? groups[0]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return group.items
    return group.items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.badge?.toLowerCase().includes(q) ?? false),
    )
  }, [group, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // Reset to the first page whenever the group or search changes so users never
  // land on an out-of-range page.
  useEffect(() => {
    setPage(1)
  }, [activeKey, query])

  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  const rangeStart = filtered.length === 0 ? 0 : start + 1
  const rangeEnd = Math.min(start + PAGE_SIZE, filtered.length)

  return (
    <div>
      {/* Group tabs */}
      <div
        role="tablist"
        aria-label="Catalog categories"
        className="flex flex-wrap justify-center gap-2"
      >
        {groups.map((g) => {
          const selected = g.key === group.key
          return (
            <button
              key={g.key}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActiveKey(g.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-paper text-muted hover:border-ink/30 hover:text-ink'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: selected ? '#fff' : g.accent }}
                aria-hidden="true"
              />
              {g.label}
              <span className={selected ? 'text-paper/70' : 'text-faint'}>{g.items.length}</span>
            </button>
          )
        })}
      </div>

      <p className="mt-6 text-center text-sm text-muted">{group.blurb}</p>

      {/* Search */}
      <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2.5 focus-within:border-ink/40">
        <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${group.label.toLowerCase()}…`}
          aria-label={`Search ${group.label}`}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="shrink-0 text-faint transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* Result count */}
      <p className="mt-4 text-center text-xs text-faint" aria-live="polite">
        {filtered.length === 0
          ? 'No matches - try a different search.'
          : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length}`}
      </p>

      {/* Cards */}
      {visible.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <CatalogCard key={item.id} item={item} accent={group.accent} />
          ))}
        </div>
      ) : null}

      {/* Pagination */}
      {totalPages > 1 ? (
        <nav
          aria-label="Catalog pagination"
          className="mt-10 flex items-center justify-center gap-1.5"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            aria-label="Previous page"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-paper px-3 text-sm font-medium text-ink transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {pageWindow(safePage, totalPages).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} className="px-1.5 text-sm text-faint" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === safePage ? 'page' : undefined}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-colors ${
                  p === safePage
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line bg-paper text-muted hover:border-ink/30 hover:text-ink'
                }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            aria-label="Next page"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-paper px-3 text-sm font-medium text-ink transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  )
}
