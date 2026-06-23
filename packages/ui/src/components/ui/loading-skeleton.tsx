import { cn } from '@/lib/utils'

// ─── Base Shimmer ──────────────────────────────────────────────────────────

function Shimmer({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden
    />
  )
}

// ─── Agent Node Skeleton ───────────────────────────────────────────────────
// Matches the ~140px wide agent node card used in the canvas.

export function AgentNodeSkeleton() {
  return (
    <div
      className="w-[140px] rounded-xl border border-border bg-card p-3 shadow-sm"
      aria-label="Loading agent"
      aria-busy
    >
      {/* Avatar + status row */}
      <div className="mb-2.5 flex items-center gap-2">
        <Shimmer className="h-8 w-8 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Shimmer className="h-2.5 w-full" />
          <Shimmer className="h-2 w-2/3" />
        </div>
      </div>
      {/* Model badge */}
      <Shimmer className="h-4 w-16 rounded-full" />
    </div>
  )
}

// ─── Skill Card Skeleton ───────────────────────────────────────────────────
// Matches the marketplace SkillCard layout.

export function SkillCardSkeleton() {
  return (
    <div
      className="w-full rounded-lg border bg-card p-4"
      aria-label="Loading skill"
      aria-busy
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Shimmer className="h-10 w-10 shrink-0 rounded-lg" />

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Shimmer className="h-3 w-28" />
            <Shimmer className="h-4 w-16 rounded-full" />
          </div>
          <Shimmer className="h-2.5 w-full" />
          <Shimmer className="h-2.5 w-3/4" />
          <div className="flex items-center justify-between pt-1">
            <Shimmer className="h-2.5 w-24" />
            <Shimmer className="h-6 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Chat Message Skeleton ─────────────────────────────────────────────────
// Matches the AgentChat message bubble layout.

interface ChatMessageSkeletonProps {
  readonly align?: 'left' | 'right'
}

export function ChatMessageSkeleton({ align = 'left' }: ChatMessageSkeletonProps) {
  const isRight = align === 'right'

  return (
    <div
      className={cn('flex gap-2', isRight && 'flex-row-reverse')}
      aria-label="Loading message"
      aria-busy
    >
      {/* Avatar */}
      <Shimmer className="h-7 w-7 shrink-0 rounded-full" />

      {/* Bubble */}
      <div
        className={cn(
          'flex max-w-[75%] flex-col gap-1.5',
          isRight && 'items-end',
        )}
      >
        <Shimmer className="h-2.5 w-20" />
        <div
          className={cn(
            'space-y-1.5 rounded-xl px-3 py-2.5',
            isRight ? 'rounded-tr-sm bg-primary/10' : 'rounded-tl-sm bg-muted',
          )}
        >
          <Shimmer className="h-2.5 w-48" />
          <Shimmer className="h-2.5 w-36" />
          <Shimmer className="h-2.5 w-44" />
        </div>
      </div>
    </div>
  )
}

// ─── Session Card Skeleton ─────────────────────────────────────────────────
// Matches the SessionHistory card row layout.

export function SessionCardSkeleton() {
  return (
    <div
      className="rounded-lg border bg-card p-3"
      aria-label="Loading session"
      aria-busy
    >
      <div className="flex items-start gap-3">
        {/* Left: date block */}
        <div className="flex flex-col gap-1.5">
          <Shimmer className="h-2.5 w-16" />
          <Shimmer className="h-2 w-12" />
        </div>

        {/* Middle: metadata */}
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Shimmer className="h-2.5 w-20" />
            <Shimmer className="h-4 w-12 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Shimmer className="h-2 w-16" />
            <Shimmer className="h-2 w-12" />
            <Shimmer className="h-2 w-14" />
          </div>
        </div>

        {/* Right: chevron */}
        <Shimmer className="h-4 w-4 rounded" />
      </div>
    </div>
  )
}

// ─── Panel Skeleton ────────────────────────────────────────────────────────
// Generic panel loading state — used when a full sheet/panel is loading.

export function PanelSkeleton() {
  return (
    <div
      className="flex h-full flex-col gap-0"
      aria-label="Loading panel"
      aria-busy
    >
      {/* Header */}
      <div className="border-b px-5 py-4">
        <Shimmer className="mb-2 h-4 w-40" />
        <Shimmer className="h-3 w-64" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b px-5 py-3">
        <Shimmer className="h-6 w-16 rounded-full" />
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-14 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 px-5 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkillCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
