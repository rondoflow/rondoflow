'use client'

import { useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────

export interface ShortcutCallbacks {
  onUndo: () => void
  onRedo: () => void
  onDelete: () => void
  onSelectAll: () => void
  onCommandPalette: () => void
  onCreateAgent: () => void
  onToggleMarketplace: () => void
  onToggleShortcuts: () => void
  onEscape: () => void
  onQuickRun?: () => void
  onDuplicate?: () => void
  onFindNode?: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Returns true when keyboard focus is inside an editable element.
 * Shortcuts should be suppressed in that case to avoid interfering with typing.
 */
function isEditableFocused(): boolean {
  const el = document.activeElement
  if (!el) return false

  const tag = el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if ((el as HTMLElement).isContentEditable) return true

  return false
}

// ─── Hook ─────────────────────────────────────────────────────────────────

/**
 * Registers a global `keydown` listener and dispatches to the provided
 * callbacks.  Cleans up automatically on unmount.
 *
 * Shortcuts that only make sense outside inputs (N, S, ?) are silently
 * ignored when focus is inside an editable element.
 */
export function useKeyboardShortcuts(callbacks: ShortcutCallbacks): void {
  useEffect(() => {
    const {
      onUndo,
      onRedo,
      onDelete,
      onSelectAll,
      onCommandPalette,
      onQuickRun,
      onCreateAgent,
      onToggleMarketplace,
      onToggleShortcuts,
      onEscape,
      onDuplicate,
      onFindNode,
    } = callbacks

    function handleKeyDown(event: KeyboardEvent): void {
      const ctrl = event.ctrlKey || event.metaKey
      const shift = event.shiftKey
      const key = event.key

      // ── Ctrl combinations ──────────────────────────────────────────────
      if (ctrl) {
        switch (key) {
          case 'z':
            event.preventDefault()
            if (shift) {
              onRedo()
            } else {
              onUndo()
            }
            return

          case 'y':
            event.preventDefault()
            onRedo()
            return

          case 'a':
            event.preventDefault()
            onSelectAll()
            return

          case 'k':
            event.preventDefault()
            onCommandPalette()
            return

          case 'r':
          case 'R':
            if (shift && onQuickRun) {
              event.preventDefault()
              onQuickRun()
            }
            return

          case 'd':
          case 'D':
            if (onDuplicate) {
              event.preventDefault()
              onDuplicate()
            }
            return

          case 'f':
          case 'F':
            if (onFindNode) {
              event.preventDefault()
              onFindNode()
            }
            return

          default:
            return
        }
      }

      // ── Single-key shortcuts (blocked when typing) ─────────────────────
      switch (key) {
        case 'Delete':
        case 'Backspace':
          // Allow Backspace inside inputs; only intercept Delete globally
          if (key === 'Backspace' && isEditableFocused()) return
          onDelete()
          return

        case 'Escape':
          onEscape()
          return

        default:
          break
      }

      // The remaining shortcuts are intentionally blocked inside inputs
      if (isEditableFocused()) return

      switch (key) {
        case 'n':
        case 'N':
          event.preventDefault()
          onCreateAgent()
          return

        case 's':
        case 'S':
          event.preventDefault()
          onToggleMarketplace()
          return

        case '?':
          event.preventDefault()
          onToggleShortcuts()
          return

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    callbacks.onUndo,
    callbacks.onRedo,
    callbacks.onDelete,
    callbacks.onSelectAll,
    callbacks.onCommandPalette,
    callbacks.onCreateAgent,
    callbacks.onToggleMarketplace,
    callbacks.onToggleShortcuts,
    callbacks.onEscape,
    callbacks.onQuickRun,
    callbacks.onDuplicate,
    callbacks.onFindNode,
  ])
}
