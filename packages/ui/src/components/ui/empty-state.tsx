import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  readonly icon: React.ElementType
  readonly title: string
  readonly description: string
  readonly action?: {
    readonly label: string
    readonly onClick: () => void
  }
  readonly className?: string
}

// ─── Component ─────────────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 text-center',
        className,
      )}
      role="status"
    >
      {/* Icon container */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full bg-muted"
        aria-hidden
      >
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="max-w-[280px] text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Optional action */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'mt-1 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground',
            'transition-colors hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
