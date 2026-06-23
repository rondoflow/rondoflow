'use client'

import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ZoomIn, ZoomOut, Maximize, Bell, BookOpen, Undo2, Redo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NotificationPanel } from '@/components/shell/notification-panel'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { rondoflowNotification } from '@/hooks/use-notifications'

// ─── Props ──────────────────────────────────────────────────────────────────

export interface BottomBarProps {
  readonly connected?: boolean
  readonly connecting?: boolean
  readonly socketError?: string | null
  readonly runningAgentCount?: number
  readonly sessionTokens?: number
  readonly zoomLevel?: number
  readonly onZoomIn?: () => void
  readonly onZoomOut?: () => void
  readonly onFitView?: () => void
  // Undo / redo — surfaced as visible buttons (previously keyboard-only)
  readonly onUndo?: () => void
  readonly onRedo?: () => void
  readonly canUndo?: boolean
  readonly canRedo?: boolean
  // Notifications (moved here from the former top bar)
  readonly notifications?: readonly rondoflowNotification[]
  readonly unreadCount?: number
  readonly onAcknowledge?: (id: string) => void
  readonly onAcknowledgeAll?: () => void
  readonly onRemoveNotification?: (id: string) => void
  readonly onReviewApproval?: (notification: rondoflowNotification) => void
}

// ─── Cost estimation (rough, based on Sonnet pricing) ───────────────────────

function estimateCost(tokens: number): string {
  // Approximate: $3/MTok input + $15/MTok output, assume 40/60 split
  const cost = tokens * 0.000006 + tokens * 0.000009
  if (cost < 0.01) return '<$0.01'
  return `$${cost.toFixed(2)}`
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BottomBar({
  connected = false,
  connecting = false,
  socketError = null,
  runningAgentCount = 0,
  sessionTokens = 0,
  zoomLevel = 100,
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  notifications = [],
  unreadCount = 0,
  onAcknowledge,
  onAcknowledgeAll,
  onRemoveNotification,
  onReviewApproval,
}: BottomBarProps) {
  const { t, i18n } = useTranslation('shell')
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const bellButtonRef = useRef<HTMLButtonElement>(null)

  function toggleNotificationPanel() {
    setNotificationPanelOpen((prev) => !prev)
  }

  function closeNotificationPanel() {
    setNotificationPanelOpen(false)
  }

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t bg-card px-4 text-[11px] text-muted-foreground">
      {/* Left: Single connection indicator */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            connecting
              ? 'animate-pulse bg-amber-400'
              : connected
                ? 'bg-green-400'
                : 'bg-red-400',
          )}
        />
        <span>
          {connecting
            ? t('common:status.connecting')
            : connected
              ? t('common:status.connected')
              : socketError
                ? t('common:status.error')
                : t('common:status.offline')}
        </span>
      </div>

      {/* Center: Workflow context */}
      <div className="flex items-center gap-3">
        {runningAgentCount > 0 && (
          <span>{t('bottomBar.running', { count: runningAgentCount })}</span>
        )}
        {sessionTokens > 0 && (
          <>
            {runningAgentCount > 0 && <span className="text-muted-foreground/40">|</span>}
            <span>
              {t('bottomBar.tokens', {
                tokens: formatNumber(sessionTokens, i18n.language),
                cost: estimateCost(sessionTokens),
              })}
            </span>
          </>
        )}
        {runningAgentCount === 0 && sessionTokens === 0 && (
          <span>{t('bottomBar.ready')}</span>
        )}
      </div>

      {/* Right: Docs + Notifications + Zoom controls */}
      <div className="flex items-center gap-1">
        {/* Docs link — served behind the UI app at /docs */}
        <a
          href="/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <BookOpen className="h-3 w-3" aria-hidden />
          <span>{t('bottomBar.documentation')}</span>
        </a>

        <span className="mx-0.5 h-3 w-px bg-border" aria-hidden />

        {/* Notification bell — opens upward, sits before the zoom controls */}
        <div className="relative">
          <Button
            ref={bellButtonRef}
            variant="ghost"
            size="sm"
            className="relative h-5 w-5 p-0"
            aria-label={
              unreadCount > 0
                ? t('bottomBar.notificationsUnread', { count: unreadCount })
                : t('bottomBar.notifications')
            }
            aria-expanded={notificationPanelOpen}
            aria-haspopup="true"
            onClick={toggleNotificationPanel}
          >
            <Bell className="h-3 w-3" aria-hidden />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 flex h-3.5 min-w-[14px] items-center justify-center p-0 text-[9px] leading-none"
                aria-hidden
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>

          <NotificationPanel
            open={notificationPanelOpen}
            onClose={closeNotificationPanel}
            placement="top"
            notifications={notifications}
            unreadCount={unreadCount}
            onAcknowledge={onAcknowledge ?? (() => undefined)}
            onAcknowledgeAll={onAcknowledgeAll ?? (() => undefined)}
            onRemove={onRemoveNotification ?? (() => undefined)}
            onReviewApproval={onReviewApproval}
          />
        </div>

        <span className="mx-0.5 h-3 w-px bg-border" aria-hidden />

        {/* Undo / Redo — visible affordance for the Ctrl+Z / Ctrl+Shift+Z shortcuts */}
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          aria-label={t('bottomBar.undo')}
          title={t('bottomBar.undoTooltip')}
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 className="h-3 w-3" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          aria-label={t('bottomBar.redo')}
          title={t('bottomBar.redoTooltip')}
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 className="h-3 w-3" aria-hidden />
        </Button>

        <span className="mx-0.5 h-3 w-px bg-border" aria-hidden />

        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" aria-label={t('bottomBar.zoomOut')} onClick={onZoomOut}>
          <ZoomOut className="h-3 w-3" aria-hidden />
        </Button>
        <span className="w-9 text-center">{zoomLevel}%</span>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" aria-label={t('bottomBar.zoomIn')} onClick={onZoomIn}>
          <ZoomIn className="h-3 w-3" aria-hidden />
        </Button>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" aria-label={t('bottomBar.fitView')} onClick={onFitView}>
          <Maximize className="h-3 w-3" aria-hidden />
        </Button>
      </div>
    </footer>
  )
}
