'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SearchableSelectOption {
  readonly value: string
  readonly label: string
  /** Optional secondary line rendered under the label (e.g. id, description). */
  readonly description?: string
}

export interface SearchableSelectProps {
  readonly options: readonly SearchableSelectOption[]
  readonly value: string
  readonly onChange: (value: string) => void
  /** Trigger text shown when nothing is selected. */
  readonly placeholder?: string
  readonly searchPlaceholder?: string
  /** Shown when no option matches the query (or the list is empty). */
  readonly emptyText?: string
  readonly loading?: boolean
  readonly disabled?: boolean
  readonly icon?: React.ElementType
  readonly ariaLabel?: string
  readonly className?: string
  /**
   * Cap how many matches are rendered at once. Above this the list is truncated
   * (and `overflowHint` is shown) so a huge catalog — e.g. thousands of skills —
   * doesn't mount thousands of DOM nodes. Omit for no cap.
   */
  readonly maxResults?: number
  /** Footer shown when results are truncated by `maxResults`. */
  readonly overflowHint?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A searchable single-select combobox. Renders its panel inline (not in a
 * portal) so it works inside a Radix Dialog without focus-trap conflicts. The
 * panel is absolutely positioned; the parent must not clip overflow.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  loading = false,
  disabled = false,
  icon: Icon,
  ariaLabel,
  className,
  maxResults,
  overflowHint,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description?.toLowerCase().includes(q) ?? false),
    )
  }, [options, query])

  // Only render up to `maxResults` matches so huge catalogs stay light; the rest
  // are reachable by narrowing the query.
  const visible = useMemo(
    () => (maxResults != null && filtered.length > maxResults ? filtered.slice(0, maxResults) : filtered),
    [filtered, maxResults],
  )
  const truncated = visible.length < filtered.length

  // Close when a pointer goes down outside the combobox.
  useEffect(() => {
    if (!open) return
    const handler = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [open])

  // Reset query + focus the search input each time the panel opens.
  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const raf = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [open])

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]') as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, visible.length])

  const commit = useCallback(
    (val: string) => {
      onChange(val)
      setOpen(false)
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((i) => Math.min(i + 1, visible.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter': {
          e.preventDefault()
          const opt = visible[activeIndex]
          if (opt) commit(opt.value)
          break
        }
        case 'Escape':
          // Close only the dropdown — don't let the parent Dialog close too.
          e.preventDefault()
          e.stopPropagation()
          setOpen(false)
          break
      }
    },
    [visible, activeIndex, commit],
  )

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled || loading}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />}
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div ref={listRef} id={listboxId} role="listbox" className="max-h-56 overflow-y-auto p-1">
            {visible.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">{emptyText}</p>
            ) : (
              <>
              {visible.map((opt, idx) => {
                const isSelected = opt.value === value
                const isActive = idx === activeIndex
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-active={isActive}
                    onClick={() => commit(opt.value)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors',
                      isActive ? 'bg-accent text-accent-foreground' : 'text-foreground',
                    )}
                  >
                    <Check
                      className={cn('h-3.5 w-3.5 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                      aria-hidden
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="truncate text-xs text-muted-foreground">
                          {opt.description}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
              {truncated && overflowHint && (
                <p className="px-3 py-2 text-center text-[11px] text-muted-foreground">
                  {overflowHint}
                </p>
              )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
