'use client'

import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Lightweight ephemeral toast ─────────────────────────────────────────────
// A tiny imperative toast store (sonner-style) with no external dependency.
// Call `toast({ description })` from anywhere; a single <Toaster /> mounted in
// the root layout renders the active toasts bottom-center and auto-dismisses
// them. Used for transient, NON-persistent feedback (invalid connection, "node
// deleted — undo") — distinct from the persistent notification bell.

export type ToastVariant = 'default' | 'error' | 'success'

export interface ToastAction {
  readonly label: string
  readonly onClick: () => void
}

export interface ToastOptions {
  readonly description: string
  readonly title?: string
  readonly variant?: ToastVariant
  /** Auto-dismiss delay in ms. 0 keeps it until dismissed. Default 4000. */
  readonly duration?: number
  /** Optional single action button (e.g. Undo). */
  readonly action?: ToastAction
}

interface ToastItem extends ToastOptions {
  readonly id: string
}

// Module-level singleton store — shared across every importer.
let toasts: readonly ToastItem[] = []
const listeners = new Set<() => void>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function emit() {
  listeners.forEach((l) => l())
}

function clearTimer(id: string) {
  const t = timers.get(id)
  if (t) {
    clearTimeout(t)
    timers.delete(id)
  }
}

export function dismissToast(id: string) {
  clearTimer(id)
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function toast(options: ToastOptions): string {
  const id = crypto.randomUUID()
  const item: ToastItem = { duration: 4000, variant: 'default', ...options, id }
  toasts = [...toasts, item]
  emit()
  if (item.duration && item.duration > 0) {
    timers.set(id, setTimeout(() => dismissToast(id), item.duration))
  }
  return id
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot() {
  return toasts
}

const EMPTY: readonly ToastItem[] = []
function getServerSnapshot() {
  return EMPTY
}

// ─── Per-variant presentation ────────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, string> = {
  default: 'border-border',
  error: 'border-destructive/50',
  success: 'border-green-500/50',
}

const VARIANT_ICON: Record<ToastVariant, typeof Info> = {
  default: Info,
  error: AlertTriangle,
  success: CheckCircle2,
}

const VARIANT_ICON_COLOR: Record<ToastVariant, string> = {
  default: 'text-muted-foreground',
  error: 'text-destructive',
  success: 'text-green-500',
}

// ─── Toaster (mount once in the root layout) ─────────────────────────────────

export function Toaster() {
  // Aliased: the toast items below are mapped with `t` as the element name.
  const { t: translate } = useTranslation('common')
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (items.length === 0) return null

  return (
    <div
      // Sits above the bottom bar (h-7) and the canvas palette; pointer-events
      // are re-enabled per-toast so the canvas underneath stays interactive.
      className="pointer-events-none fixed inset-x-0 bottom-12 z-[60] flex flex-col items-center gap-2 px-4"
      role="region"
      aria-label={translate('label.notifications')}
    >
      {items.map((t) => {
        const Icon = VARIANT_ICON[t.variant ?? 'default']
        return (
          <div
            key={t.id}
            role="status"
            aria-live={t.variant === 'error' ? 'assertive' : 'polite'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border bg-card px-3.5 py-2.5 text-sm shadow-lg',
              'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2',
              VARIANT_STYLES[t.variant ?? 'default'],
            )}
          >
            <Icon
              className={cn('mt-0.5 h-4 w-4 shrink-0', VARIANT_ICON_COLOR[t.variant ?? 'default'])}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              {t.title && <p className="font-medium leading-tight text-foreground">{t.title}</p>}
              <p className={cn('leading-snug text-muted-foreground', t.title && 'mt-0.5')}>
                {t.description}
              </p>
            </div>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.onClick()
                  dismissToast(t.id)
                }}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={translate('action.dismiss')}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}
