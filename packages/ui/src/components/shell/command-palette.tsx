'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Bot,
  Maximize,
  Trash2,
  ZoomIn,
  ZoomOut,
  Puzzle,
  Shield,
  UserRoundCog,
  MessageSquare,
  Activity,
  ScrollText,
  Brain,
  History,
  BarChart3,
  Clock,
  Undo2,
  Redo2,
  Keyboard,
  Search,
  LayoutTemplate,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Static command metadata; i18n keys are resolved at render time. */
interface CommandDef {
  readonly id: string
  readonly categoryKey: string
  readonly labelKey: string
  readonly descriptionKey: string
  readonly icon: React.ElementType
  readonly shortcut?: string
}

/** A command with its display strings resolved for the active language. */
interface CommandItem {
  readonly id: string
  readonly categoryKey: string
  readonly category: string
  readonly label: string
  readonly description: string
  readonly icon: React.ElementType
  readonly shortcut?: string
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommand: (commandId: string) => void
}

// ─── Command registry ─────────────────────────────────────────────────────────

const COMMANDS: readonly CommandDef[] = [
  // Assistants
  {
    id: 'assistant:create',
    categoryKey: 'category.assistants',
    labelKey: 'command.assistantCreate.label',
    descriptionKey: 'command.assistantCreate.description',
    icon: Plus,
  },
  {
    id: 'assistant:list',
    categoryKey: 'category.assistants',
    labelKey: 'command.assistantList.label',
    descriptionKey: 'command.assistantList.description',
    icon: Bot,
  },

  // Canvas
  {
    id: 'canvas:fit',
    categoryKey: 'category.canvas',
    labelKey: 'command.canvasFit.label',
    descriptionKey: 'command.canvasFit.description',
    icon: Maximize,
  },
  {
    id: 'canvas:clear',
    categoryKey: 'category.canvas',
    labelKey: 'command.canvasClear.label',
    descriptionKey: 'command.canvasClear.description',
    icon: Trash2,
  },
  {
    id: 'canvas:zoom-in',
    categoryKey: 'category.canvas',
    labelKey: 'command.canvasZoomIn.label',
    descriptionKey: 'command.canvasZoomIn.description',
    icon: ZoomIn,
  },
  {
    id: 'canvas:zoom-out',
    categoryKey: 'category.canvas',
    labelKey: 'command.canvasZoomOut.label',
    descriptionKey: 'command.canvasZoomOut.description',
    icon: ZoomOut,
  },

  // Navigation
  {
    id: 'nav:assistants',
    categoryKey: 'category.navigation',
    labelKey: 'command.navAssistants.label',
    descriptionKey: 'command.navAssistants.description',
    icon: Bot,
    shortcut: 'N',
  },
  {
    id: 'nav:facilitators',
    categoryKey: 'category.navigation',
    labelKey: 'command.navFacilitators.label',
    descriptionKey: 'command.navFacilitators.description',
    icon: UserRoundCog,
  },
  {
    id: 'nav:discussions',
    categoryKey: 'category.navigation',
    labelKey: 'command.navDiscussions.label',
    descriptionKey: 'command.navDiscussions.description',
    icon: MessageSquare,
  },
  {
    id: 'nav:activity',
    categoryKey: 'category.navigation',
    labelKey: 'command.navActivity.label',
    descriptionKey: 'command.navActivity.description',
    icon: Activity,
  },
  {
    id: 'nav:audit',
    categoryKey: 'category.navigation',
    labelKey: 'command.navAudit.label',
    descriptionKey: 'command.navAudit.description',
    icon: ScrollText,
  },
  {
    id: 'nav:history',
    categoryKey: 'category.navigation',
    labelKey: 'command.navHistory.label',
    descriptionKey: 'command.navHistory.description',
    icon: History,
  },
  {
    id: 'nav:analytics',
    categoryKey: 'category.navigation',
    labelKey: 'command.navAnalytics.label',
    descriptionKey: 'command.navAnalytics.description',
    icon: BarChart3,
  },
  {
    id: 'nav:skills',
    categoryKey: 'category.navigation',
    labelKey: 'command.navSkills.label',
    descriptionKey: 'command.navSkills.description',
    icon: Puzzle,
    shortcut: 'S',
  },
  {
    id: 'nav:memory',
    categoryKey: 'category.navigation',
    labelKey: 'command.navMemory.label',
    descriptionKey: 'command.navMemory.description',
    icon: Brain,
    shortcut: 'M',
  },
  {
    id: 'nav:schedules',
    categoryKey: 'category.navigation',
    labelKey: 'command.navSchedules.label',
    descriptionKey: 'command.navSchedules.description',
    icon: Clock,
  },
  {
    id: 'nav:safety',
    categoryKey: 'category.navigation',
    labelKey: 'command.navSafety.label',
    descriptionKey: 'command.navSafety.description',
    icon: Shield,
  },

  // Actions
  {
    id: 'action:undo',
    categoryKey: 'category.actions',
    labelKey: 'command.actionUndo.label',
    descriptionKey: 'command.actionUndo.description',
    icon: Undo2,
    shortcut: 'Ctrl+Z',
  },
  {
    id: 'action:redo',
    categoryKey: 'category.actions',
    labelKey: 'command.actionRedo.label',
    descriptionKey: 'command.actionRedo.description',
    icon: Redo2,
    shortcut: 'Ctrl+Shift+Z',
  },
  {
    id: 'action:shortcuts',
    categoryKey: 'category.actions',
    labelKey: 'command.actionShortcuts.label',
    descriptionKey: 'command.actionShortcuts.description',
    icon: Keyboard,
    shortcut: '?',
  },

  // Templates
  {
    id: 'template:code-review',
    categoryKey: 'category.templates',
    labelKey: 'command.templateCodeReview.label',
    descriptionKey: 'command.templateCodeReview.description',
    icon: LayoutTemplate,
  },
  {
    id: 'template:content-writing',
    categoryKey: 'category.templates',
    labelKey: 'command.templateContentWriting.label',
    descriptionKey: 'command.templateContentWriting.description',
    icon: LayoutTemplate,
  },
  {
    id: 'template:research',
    categoryKey: 'category.templates',
    labelKey: 'command.templateResearch.label',
    descriptionKey: 'command.templateResearch.description',
    icon: LayoutTemplate,
  },
  {
    id: 'template:brainstorm',
    categoryKey: 'category.templates',
    labelKey: 'command.templateBrainstorm.label',
    descriptionKey: 'command.templateBrainstorm.description',
    icon: LayoutTemplate,
  },
]

// ─── Category order ───────────────────────────────────────────────────────────
// Ordered by stable category key (display label resolved per-language).

const CATEGORY_ORDER = [
  'category.assistants',
  'category.canvas',
  'category.navigation',
  'category.actions',
  'category.templates',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function filterCommands(commands: readonly CommandItem[], query: string): readonly CommandItem[] {
  if (!query.trim()) return commands

  const normalized = query.toLowerCase()

  return commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(normalized) ||
      cmd.description.toLowerCase().includes(normalized) ||
      cmd.category.toLowerCase().includes(normalized),
  )
}

function groupByCategory(
  commands: readonly CommandItem[],
): Array<{ categoryKey: string; category: string; items: CommandItem[] }> {
  const map = new Map<string, CommandItem[]>()

  for (const cmd of commands) {
    const existing = map.get(cmd.categoryKey)
    if (existing) {
      existing.push(cmd)
    } else {
      map.set(cmd.categoryKey, [cmd])
    }
  }

  return CATEGORY_ORDER
    .filter((cat) => map.has(cat))
    .map((cat) => ({
      categoryKey: cat,
      // Resolved display label comes from any item in the group.
      category: map.get(cat)?.[0]?.category ?? cat,
      items: map.get(cat) ?? [],
    }))
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-[2px]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ─── Shortcut badge ───────────────────────────────────────────────────────────

function ShortcutBadge({ shortcut }: { shortcut: string }) {
  const parts = shortcut.split('+')

  return (
    <span className="flex items-center gap-0.5">
      {parts.map((part, i) => (
        <kbd
          key={i}
          className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
        >
          {part}
        </kbd>
      ))}
    </span>
  )
}

// ─── Command item row ─────────────────────────────────────────────────────────

interface CommandRowProps {
  item: CommandItem
  isSelected: boolean
  query: string
  onSelect: () => void
  onHover: () => void
}

function CommandRow({ item, isSelected, query, onSelect, onHover }: CommandRowProps) {
  const Icon = item.icon

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
        isSelected
          ? 'bg-accent text-accent-foreground'
          : 'text-foreground hover:bg-accent/50',
      )}
      onClick={onSelect}
      onMouseEnter={onHover}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
          isSelected
            ? 'border-accent-foreground/20 bg-background/50'
            : 'border-border bg-muted/50',
        )}
        aria-hidden
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      <span className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <span className="truncate text-sm font-medium leading-none">
          {highlightMatch(item.label, query)}
        </span>
        <span className="truncate text-xs text-muted-foreground leading-none">
          {item.description}
        </span>
      </span>

      {item.shortcut && <ShortcutBadge shortcut={item.shortcut} />}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CommandPalette({ open, onOpenChange, onCommand }: CommandPaletteProps) {
  const { t } = useTranslation('shell')
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Resolve each command's display strings for the active language. Filtering and
  // highlighting then operate on translated text so search matches what's shown.
  const resolvedCommands = useMemo<readonly CommandItem[]>(
    () =>
      COMMANDS.map((cmd) => ({
        id: cmd.id,
        categoryKey: cmd.categoryKey,
        category: t(cmd.categoryKey),
        label: t(cmd.labelKey),
        description: t(cmd.descriptionKey),
        icon: cmd.icon,
        shortcut: cmd.shortcut,
      })),
    [t],
  )

  const filtered = filterCommands(resolvedCommands, query)
  const groups = groupByCategory(filtered)

  // Flat ordered list for keyboard navigation
  const flatItems = groups.flatMap((g) => g.items)

  const resetState = useCallback(() => {
    setQuery('')
    setSelectedIndex(0)
  }, [])

  // Reset when opening
  useEffect(() => {
    if (open) {
      resetState()
      // Focus input after animation frame so the dialog is rendered
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open, resetState])

  // Keep selected item in view
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const selectedEl = list.querySelector('[aria-selected="true"]') as HTMLElement | null
    selectedEl?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleSelect = useCallback(
    (id: string) => {
      onCommand(id)
      onOpenChange(false)
    },
    [onCommand, onOpenChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1))
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        }
        case 'Enter': {
          e.preventDefault()
          const item = flatItems[selectedIndex]
          if (item) handleSelect(item.id)
          break
        }
        case 'Escape': {
          onOpenChange(false)
          break
        }
      }
    },
    [flatItems, selectedIndex, handleSelect, onOpenChange],
  )

  // Reset selection when query changes
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(0)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[500px] gap-0 overflow-hidden p-0"
        aria-label={t('palette.ariaLabel')}
        onKeyDown={handleKeyDown}
        // Prevent default close on Escape so we handle it ourselves
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          onOpenChange(false)
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls="command-list"
            placeholder={t('palette.placeholder')}
            value={query}
            onChange={handleQueryChange}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="command-list"
          role="listbox"
          aria-label={t('palette.listLabel')}
          className="max-h-[380px] overflow-y-auto p-2"
        >
          {flatItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Search className="h-8 w-8 text-muted-foreground/40" aria-hidden />
              <p className="text-sm text-muted-foreground">{t('palette.empty', { query })}</p>
            </div>
          ) : (
            <>
              {groups.map((group, groupIndex) => {
                // Offset into the flat list to compute selectedIndex per item
                const offset = groups
                  .slice(0, groupIndex)
                  .reduce((acc, g) => acc + g.items.length, 0)

                return (
                  <div key={group.categoryKey}>
                    {groupIndex > 0 && <Separator className="my-1.5" />}

                    <p className="mb-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.category}
                    </p>

                    {group.items.map((item, itemIndex) => {
                      const flatIndex = offset + itemIndex

                      return (
                        <CommandRow
                          key={item.id}
                          item={item}
                          isSelected={flatIndex === selectedIndex}
                          query={query}
                          onSelect={() => handleSelect(item.id)}
                          onHover={() => setSelectedIndex(flatIndex)}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t px-4 py-2">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">↑</kbd>
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">↓</kbd>
              {t('palette.navigate')}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5">↵</kbd>
              {t('palette.select')}
            </span>
          </div>
          {filtered.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {t('palette.results', { count: filtered.length })}
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
