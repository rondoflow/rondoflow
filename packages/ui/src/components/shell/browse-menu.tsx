'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { useComplexity } from '@/hooks/use-complexity'
import {
  BROWSE_ITEMS,
  GROUP_ORDER,
  isTierVisible,
  type BrowseActions,
  type BrowseGroup,
} from '@/components/shell/nav-items'

interface BrowseMenuProps {
  readonly actions: BrowseActions
}

// Maps the structural group identifier to its i18n key in the `shell` namespace.
const GROUP_LABEL_KEY: Record<BrowseGroup, string> = {
  People: 'browse.group.people',
  'Run data': 'browse.group.runData',
  System: 'browse.group.system',
}

/**
 * Single "Browse" dropdown that replaces the old left-sidebar nav list. Holds
 * all browse panels grouped (People / Run data / System), tier-gated via
 * useComplexity. One labeled trigger keeps a constant width on any viewport.
 */
export function BrowseMenu({ actions }: BrowseMenuProps) {
  const { t } = useTranslation('shell')
  const { tier } = useComplexity()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Radix focuses the first menu item on open; steal focus back to the search box.
  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  const q = query.trim().toLowerCase()
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: BROWSE_ITEMS.filter(
      (item) =>
        item.group === group &&
        isTierVisible(tier, item.minTier) &&
        (!q || t(item.labelKey).toLowerCase().includes(q)),
    ),
  })).filter((g) => g.items.length > 0)

  return (
    <DropdownMenu open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery('') }}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          aria-label={t('browse.trigger')}
        >
          <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <div className="flex items-center gap-2 border-b border-border px-2 py-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // Keep typing local — let only Escape bubble so Radix can close the menu.
            onKeyDown={(e) => { if (e.key !== 'Escape') e.stopPropagation() }}
            placeholder={t('browse.searchPlaceholder')}
            aria-label={t('browse.searchPlaceholder')}
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        {grouped.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">{t('browse.empty')}</p>
        ) : (
          grouped.map(({ group, items }, groupIndex) => (
            <Fragment key={group}>
              {groupIndex > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t(GROUP_LABEL_KEY[group])}
              </DropdownMenuLabel>
              {items.map((item) => (
                <DropdownMenuItem
                  key={item.action}
                  className="gap-2 text-xs"
                  onSelect={() => actions[item.action]?.()}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{t(item.labelKey)}</span>
                  {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
                </DropdownMenuItem>
              ))}
            </Fragment>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
