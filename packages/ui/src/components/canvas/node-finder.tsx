'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, SearchX } from 'lucide-react'
import type { Node } from '@xyflow/react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

export interface NodeFinderProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly nodes: readonly Node[]
  /** Called with the chosen node id — the canvas centers on and selects it. */
  readonly onPick: (id: string) => void
}

interface FinderItem {
  readonly id: string
  readonly label: string
  readonly type: string
}

function nodeLabel(node: Node, fallback: string): string {
  const data = node.data as Record<string, unknown> | undefined
  const name = typeof data?.name === 'string' ? data.name : undefined
  const label = typeof data?.label === 'string' ? data.label : undefined
  return (name || label || '').trim() || fallback
}

export function NodeFinder({ open, onClose, nodes, onPick }: NodeFinderProps) {
  const { t } = useTranslation('canvas')
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  const items = useMemo<FinderItem[]>(
    () =>
      nodes
        .filter((n) => n.type !== 'start')
        .map((n) => ({ id: n.id, label: nodeLabel(n, t('finder.untitled')), type: n.type ?? 'node' })),
    [nodes, t],
  )

  const filtered = useMemo<FinderItem[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (it) => it.label.toLowerCase().includes(q) || it.type.toLowerCase().includes(q),
    )
  }, [items, query])

  // Reset query + selection each time the finder opens.
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  // Keep the active index in range as the filtered set shrinks.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)))
  }, [filtered.length])

  // Keep the highlighted row scrolled into view during keyboard navigation.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[activeIndex]
      if (item) onPick(item.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">{t('finder.title')}</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('finder.placeholder')}
            aria-label={t('finder.title')}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={t('finder.empty')}
            description={t('finder.emptyHint')}
            className="py-8"
          />
        ) : (
          <ul ref={listRef} className="max-h-72 overflow-y-auto p-1.5" role="listbox" aria-label={t('finder.title')}>
            {filtered.map((item, index) => (
              <li key={item.id} role="option" aria-selected={index === activeIndex} data-index={index}>
                <button
                  type="button"
                  onClick={() => onPick(item.id)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                    index === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/60',
                  )}
                >
                  <span className="truncate">{item.label}</span>
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {item.type}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
