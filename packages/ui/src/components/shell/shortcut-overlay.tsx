'use client'

import { Trans, useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ─── Types ────────────────────────────────────────────────────────────────

interface ShortcutRow {
  /** i18n key (shell namespace) for the shortcut's description. */
  descriptionKey: string
  keys: string[]
}

interface ShortcutCategory {
  /** i18n key (shell namespace) for the category title. */
  titleKey: string
  shortcuts: ShortcutRow[]
}

interface ShortcutOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Shortcut definitions ─────────────────────────────────────────────────

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    titleKey: 'shortcuts.category.canvas',
    shortcuts: [
      { descriptionKey: 'shortcuts.panCanvas', keys: ['Space', 'Drag'] },
      { descriptionKey: 'shortcuts.zoomIn', keys: ['Ctrl', '+'] },
      { descriptionKey: 'shortcuts.zoomOut', keys: ['Ctrl', '-'] },
      { descriptionKey: 'shortcuts.fitView', keys: ['Ctrl', 'Shift', 'F'] },
      { descriptionKey: 'shortcuts.selectAll', keys: ['Ctrl', 'A'] },
    ],
  },
  {
    titleKey: 'shortcuts.category.nodes',
    shortcuts: [
      { descriptionKey: 'shortcuts.newAgent', keys: ['N'] },
      { descriptionKey: 'shortcuts.duplicate', keys: ['Ctrl', 'D'] },
      { descriptionKey: 'shortcuts.deleteSelected', keys: ['Del'] },
      { descriptionKey: 'shortcuts.deleteSelected', keys: ['Backspace'] },
    ],
  },
  {
    titleKey: 'shortcuts.category.navigation',
    shortcuts: [
      { descriptionKey: 'shortcuts.commandPalette', keys: ['Ctrl', 'K'] },
      { descriptionKey: 'shortcuts.findNode', keys: ['Ctrl', 'F'] },
      { descriptionKey: 'shortcuts.toggleSkills', keys: ['S'] },
      { descriptionKey: 'shortcuts.shortcutHelp', keys: ['?'] },
      { descriptionKey: 'shortcuts.closeDeselect', keys: ['Esc'] },
    ],
  },
  {
    titleKey: 'shortcuts.category.editing',
    shortcuts: [
      { descriptionKey: 'shortcuts.undo', keys: ['Ctrl', 'Z'] },
      { descriptionKey: 'shortcuts.redo', keys: ['Ctrl', 'Shift', 'Z'] },
      { descriptionKey: 'shortcuts.redoAlt', keys: ['Ctrl', 'Y'] },
    ],
  },
]

// ─── Sub-components ────────────────────────────────────────────────────────

function KeyBadge({ label }: { label: string }) {
  return (
    <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground shadow-sm">
      {label}
    </kbd>
  )
}

function ShortcutEntry({ descriptionKey, keys }: ShortcutRow) {
  const { t } = useTranslation('shell')
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-foreground">{t(descriptionKey)}</span>
      <div className="flex items-center gap-1 shrink-0">
        {keys.map((k, i) => (
          <KeyBadge key={i} label={k} />
        ))}
      </div>
    </div>
  )
}

function CategorySection({ titleKey, shortcuts }: ShortcutCategory) {
  const { t } = useTranslation('shell')
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t(titleKey)}
      </h3>
      <div className="divide-y divide-border/40">
        {shortcuts.map((s) => (
          <ShortcutEntry key={s.descriptionKey + s.keys.join()} {...s} />
        ))}
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────

export function ShortcutOverlay({ open, onOpenChange }: ShortcutOverlayProps) {
  const { t } = useTranslation('shell')
  const leftColumn = SHORTCUT_CATEGORIES.slice(0, 2)
  const rightColumn = SHORTCUT_CATEGORIES.slice(2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-6">
        <DialogHeader>
          <DialogTitle className="text-base">{t('shortcuts.title')}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col gap-6">
            {leftColumn.map((cat) => (
              <CategorySection key={cat.titleKey} {...cat} />
            ))}
          </div>
          <div className="flex flex-col gap-6">
            {rightColumn.map((cat) => (
              <CategorySection key={cat.titleKey} {...cat} />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-xs text-muted-foreground">
            <Trans
              i18nKey="shortcuts.footer"
              t={t}
              components={[<KeyBadge key="0" label="?" />, <KeyBadge key="1" label="Esc" />]}
            />
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
