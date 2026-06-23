'use client'

import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  Info,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Bell,
  CheckCheck,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { rondoflowNotification, NotificationLevel } from '@/hooks/use-notifications'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NotificationPanelProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly notifications: readonly rondoflowNotification[]
  readonly unreadCount: number
  readonly onAcknowledge: (id: string) => void
  readonly onAcknowledgeAll: () => void
  readonly onRemove: (id: string) => void
  readonly onReviewApproval?: (notification: rondoflowNotification) => void
  /** Whether the panel opens below ('bottom', default) or above ('top') its trigger. */
  readonly placement?: 'top' | 'bottom'
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const LEVEL_ICON: Record<NotificationLevel, typeof Info> = {
  info: Info,
  action_required: AlertTriangle,
  critical: AlertCircle,
  error: XCircle,
}

const LEVEL_COLOR: Record<NotificationLevel, string> = {
  info: 'text-blue-400',
  action_required: 'text-yellow-400',
  critical: 'text-red-500',
  error: 'text-red-400',
}

const LEVEL_BG: Record<NotificationLevel, string> = {
  info: 'bg-blue-500/10',
  action_required: 'bg-yellow-500/10',
  critical: 'bg-red-500/10',
  error: 'bg-red-500/10',
}

function formatTimeAgo(date: Date, t: TFunction<'notifications'>): string {
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return t('time.justNow')

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return t('time.minutesAgo', { count: diffMin })

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return t('time.hoursAgo', { count: diffHr })

  const diffDay = Math.floor(diffHr / 24)
  return t('time.daysAgo', { count: diffDay })
}

// ─── Notification card ─────────────────────────────────────────────────────

interface NotificationCardProps {
  readonly notification: rondoflowNotification
  readonly onAcknowledge: (id: string) => void
  readonly onRemove: (id: string) => void
  readonly onReview?: (notification: rondoflowNotification) => void
}

function NotificationCard({
  notification,
  onAcknowledge,
  onRemove,
  onReview,
}: NotificationCardProps) {
  const { t } = useTranslation('notifications')
  const Icon = LEVEL_ICON[notification.level]
  const iconColor = LEVEL_COLOR[notification.level]
  const iconBg = LEVEL_BG[notification.level]

  function handleClick() {
    if (!notification.acknowledged) {
      onAcknowledge(notification.id)
    }
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    onRemove(notification.id)
  }

  function handleReview(e: React.MouseEvent) {
    e.stopPropagation()
    onAcknowledge(notification.id)
    onReview?.(notification)
  }

  return (
    <div
      className={cn(
        'group relative flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-muted/40',
        !notification.acknowledged && 'bg-muted/20',
      )}
      onClick={handleClick}
      role="listitem"
      aria-label={`${notification.title}${notification.acknowledged ? '' : t('unread.suffix')}`}
    >
      {/* Unread indicator */}
      {!notification.acknowledged && (
        <span
          className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary"
          aria-hidden
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          iconBg,
        )}
        aria-hidden
      >
        <Icon className={cn('h-3.5 w-3.5', iconColor)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn('text-xs font-semibold leading-tight', !notification.acknowledged && 'text-foreground')}>
          {notification.title}
        </p>

        {notification.description && (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {notification.description}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-2">
          {notification.agentName && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] leading-none">
              {notification.agentName}
            </Badge>
          )}
          <time
            dateTime={notification.createdAt.toISOString()}
            className="text-[10px] text-muted-foreground"
          >
            {formatTimeAgo(notification.createdAt, t)}
          </time>
        </div>

        {/* Action buttons */}
        {notification.level === 'action_required' && onReview && (
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-6 gap-1 px-2 text-[10px] border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-400"
              onClick={handleReview}
              aria-label={t('action.reviewLabel')}
            >
              <AlertTriangle className="h-3 w-3" aria-hidden />
              {t('action.review')}
            </Button>
          </div>
        )}
      </div>

      {/* Remove button (visible on hover) */}
      <button
        type="button"
        className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus:opacity-100"
        onClick={handleRemove}
        aria-label={t('action.dismissLabel', { title: notification.title })}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

// ─── NotificationPanel ─────────────────────────────────────────────────────

export function NotificationPanel({
  open,
  onClose,
  notifications,
  unreadCount,
  onAcknowledge,
  onAcknowledgeAll,
  onRemove,
  onReviewApproval,
  placement = 'bottom',
}: NotificationPanelProps) {
  const { t } = useTranslation('notifications')
  const panelRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    },
    [onClose],
  )

  if (!open) return null

  return (
    <>
      {/* Invisible backdrop to capture outside clicks */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'absolute right-0 z-50 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-xl',
          placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
        role="region"
        aria-label={t('panel.regionLabel')}
        aria-live="polite"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="text-sm font-semibold">{t('panel.title')}</span>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="flex h-4 min-w-[16px] items-center justify-center px-1 text-[10px]"
                aria-label={t('unread.count', { count: unreadCount })}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={onAcknowledgeAll}
              aria-label={t('action.markAllReadLabel')}
            >
              <CheckCheck className="h-3 w-3" aria-hidden />
              {t('action.markAllRead')}
            </Button>
          )}
        </div>

        <Separator />

        {/* Notification list */}
        <div
          className="max-h-[400px] overflow-y-auto"
          role="list"
          aria-label={t('panel.listLabel')}
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40" aria-hidden />
              <p className="text-xs text-muted-foreground">{t('empty.title')}</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification.id}>
                <NotificationCard
                  notification={notification}
                  onAcknowledge={onAcknowledge}
                  onRemove={onRemove}
                  onReview={
                    notification.level === 'action_required' ? onReviewApproval : undefined
                  }
                />
                {index < notifications.length - 1 && (
                  <Separator className="opacity-50" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
