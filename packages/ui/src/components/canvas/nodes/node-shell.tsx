'use client'

import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Handle, Position } from '@xyflow/react'
import { Play, Eye, EyeOff, Maximize2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NodeBranch } from '@/lib/canvas-utils'

// ─── Shared node card shell ──────────────────────────────────────────────────
// Flow-builder (Langflow-style) card: a clean white/dark rounded card with a
// header row (icon chip + title + run button), an optional gray description
// line, a body of labelled field rows, and a footer that carries the output
// label and its source handle. All node types share this for visual
// consistency. Connection ports (handles) are round, accent-coloured dots.

/** Shared round-port handle class. Fill + ring colours are set inline so the
 *  port picks up each node's accent and reads as a solid coloured dot. */
const HANDLE_CLASS =
  'rf-port !h-3.5 !w-3.5 !rounded-full !border-2 !shadow-sm transition-transform hover:!scale-125'

/** Consistent "input field" box styling for body field rows. */
export const nodeBoxClass =
  'rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground'

// ─── Labelled field row ──────────────────────────────────────────────────────

/** A labelled body row: a small bold label (with an optional hollow port dot)
 *  above an input-styled box. Mirrors the field rows in the reference design. */
export function NodeField({
  label,
  port = false,
  accent,
  children,
}: {
  label: ReactNode
  /** Show the small hollow connection indicator after the label. */
  port?: boolean
  accent?: string
  children?: ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <span className="truncate">{label}</span>
        {port && (
          <span
            className="h-2 w-2 shrink-0 rounded-full border-[1.5px]"
            style={{ borderColor: accent ?? 'hsl(var(--muted-foreground))' }}
            aria-hidden
          />
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Card shell ──────────────────────────────────────────────────────────────

interface NodeShellProps {
  /** Solid hex accent (e.g. '#8b5cf6') used to tint ports, the icon and ring. */
  accent: string
  /** Icon element shown inside the chip. */
  icon: ReactNode
  /** Header title. */
  title: ReactNode
  /** Optional gray description line under the title. */
  description?: ReactNode
  /** Optional right-aligned header slot. Overrides the default run button. */
  headerRight?: ReactNode
  /** Show the default run (play) button when no headerRight is provided. */
  runnable?: boolean
  /** Render the run button as a spinner (e.g. while executing). */
  running?: boolean
  /** Card body — labelled field rows, badges, etc. */
  children?: ReactNode
  /** Single labelled output rendered in the footer with its source handle. */
  output?: { label: ReactNode } | null
  /** Labelled outgoing branches — each renders a footer row with its handle. */
  branches?: ReadonlyArray<NodeBranch>
  /** Render a left-edge target (input) handle. */
  hasInput?: boolean
  /** Fixed card width in px. Falls back to min-width when omitted. */
  width?: number
  minWidth?: number
  selected?: boolean
  className?: string
  /** Render the icon chip's own background (pass false for avatar images). */
  chip?: boolean
  /** When true, shows EyeOff and applies a skipped visual style. */
  skipped?: boolean
  /** Called when the user clicks the eye toggle in the output footer. */
  onSkipToggle?: () => void
  role?: string
  'aria-label'?: string
  tabIndex?: number
}

export function NodeShell({
  accent,
  icon,
  title,
  description,
  headerRight,
  runnable = true,
  running = false,
  children,
  output,
  branches,
  hasInput = false,
  width,
  minWidth = 240,
  selected,
  className,
  chip = true,
  skipped = false,
  onSkipToggle,
  role = 'button',
  tabIndex = 0,
  ...rest
}: NodeShellProps) {
  const { t } = useTranslation('canvas')
  const hasBranches = Boolean(branches && branches.length > 0)
  const portStyle = { backgroundColor: accent, borderColor: 'hsl(var(--card))' }

  return (
    <div
      className={cn(
        'relative rounded-2xl border border-border bg-card text-card-foreground shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18)] transition-all duration-300',
        // Subtle hover cue so the card reads as interactive (double-click / actions).
        'hover:border-foreground/25',
        selected && 'ring-2 ring-offset-2 ring-offset-background',
        className,
      )}
      style={{
        width,
        minWidth: width ? undefined : minWidth,
        ...(selected ? { ['--tw-ring-color' as string]: accent } : {}),
      }}
      role={role}
      tabIndex={tabIndex}
      {...rest}
    >
      {/* Left target (input) port */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className={HANDLE_CLASS}
          style={portStyle}
          title={t('node.shell.inputTitle')}
          aria-label={t('node.shell.inputAria')}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 pb-1 pt-3">
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            chip && 'bg-muted',
          )}
          style={chip ? { color: accent } : undefined}
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">
          {title}
        </div>
        {headerRight ??
          (runnable && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/70">
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Play className="h-3.5 w-3.5" aria-hidden />
              )}
            </div>
          ))}
      </div>

      {/* Description */}
      {description && (
        <p className="px-3.5 pb-2 pt-0.5 text-xs leading-snug text-muted-foreground">
          {description}
        </p>
      )}

      {/* Body */}
      {children && <div className="space-y-2.5 px-3.5 pb-3 pt-1">{children}</div>}

      {/* Branch outputs — each its own footer row + source handle */}
      {hasBranches &&
        branches!.map((branch) => (
          <div
            key={branch.id}
            className="relative flex items-center justify-end gap-1.5 border-t border-border px-3.5 py-2 text-xs font-medium text-foreground"
          >
            <span className="truncate">{branch.label}</span>
            <Maximize2 className="h-3 w-3 text-muted-foreground/60" aria-hidden />
            <Handle
              type="source"
              id={branch.id}
              position={Position.Right}
              className={HANDLE_CLASS}
              style={portStyle}
              title={t('node.shell.branchOutputTitle', { label: branch.label })}
              aria-label={t('node.shell.branchOutputAria', { label: branch.label })}
            />
          </div>
        ))}

      {/* Single output footer */}
      {!hasBranches && output && (
        <div className="relative flex items-center justify-between border-t border-border px-3.5 py-2">
        <button
            type="button"
            className={cn(
              'nodrag flex h-6 w-6 items-center justify-center rounded-md transition-colors',
              skipped
                ? 'text-amber-500 hover:text-amber-400'
                : 'text-muted-foreground/60 hover:bg-muted hover:text-foreground',
            )}
            aria-label={skipped ? t('node.shell.enableStep') : t('node.shell.skipStep')}
            title={skipped ? t('node.shell.enableStep') : t('node.shell.skipStep')}
            onClick={(e) => { e.stopPropagation(); onSkipToggle?.() }}
          >
            {skipped ? (
              <EyeOff className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Eye className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <span className="truncate">{output.label}</span>
            <Maximize2 className="h-3 w-3 text-muted-foreground/60" aria-hidden />
          </div>
          <Handle
            type="source"
            position={Position.Right}
            className={HANDLE_CLASS}
            style={portStyle}
            title={t('node.shell.outputTitle')}
            aria-label={t('node.shell.outputAria')}
          />
        </div>
      )}
    </div>
  )
}
