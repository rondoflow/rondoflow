import { CheckCircle2, Loader2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentStatus } from '@rondoflow/shared'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface StatusBadgeProps {
  readonly status: AgentStatus
  readonly size?: 'sm' | 'md'
}

// ─── Status config ─────────────────────────────────────────────────────────

interface StatusConfig {
  readonly label: string
  readonly dot: string
  readonly text: string
  readonly bg: string
  readonly Icon: React.ElementType
  readonly iconClass: string
}

const STATUS_CONFIG: Record<AgentStatus, StatusConfig> = {
  idle: {
    label: 'Ready',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    Icon: CheckCircle2,
    iconClass: '',
  },
  running: {
    label: 'Running',
    dot: 'bg-blue-400',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    Icon: Loader2,
    iconClass: 'animate-spin',
  },
  waiting_approval: {
    label: 'Awaiting Approval',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    Icon: Clock,
    iconClass: '',
  },
  error: {
    label: 'Error',
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    Icon: XCircle,
    iconClass: '',
  },
}

const SIZE_CLASSES = {
  sm: {
    wrapper: 'gap-1.5 px-2 py-0.5 text-[10px]',
    dot: 'h-1.5 w-1.5',
    icon: 'h-3 w-3',
  },
  md: {
    wrapper: 'gap-2 px-2.5 py-1 text-xs',
    dot: 'h-2 w-2',
    icon: 'h-3.5 w-3.5',
  },
}

// ─── Component ─────────────────────────────────────────────────────────────

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle
  const sizes = SIZE_CLASSES[size]

  const ariaLabel = `Status: ${config.label}`

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.bg,
        config.text,
        sizes.wrapper,
      )}
      aria-label={ariaLabel}
      role="status"
    >
      {/* Animated dot */}
      <span
        className={cn('shrink-0 rounded-full', config.dot, sizes.dot)}
        aria-hidden
      />

      {/* Icon — provides semantic meaning beyond color alone (G22) */}
      <config.Icon
        className={cn('shrink-0', sizes.icon, config.iconClass)}
        aria-hidden
      />

      {/* Text label */}
      <span>{config.label}</span>
    </span>
  )
}
