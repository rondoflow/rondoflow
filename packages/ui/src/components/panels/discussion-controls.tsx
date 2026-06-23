'use client'

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Play,
  Pause,
  Square,
  Download,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { DiscussionStatus } from '@rondoflow/shared'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DiscussionControlsProps {
  readonly status: DiscussionStatus
  readonly currentRound: number
  readonly maxRounds: number
  readonly onStart: () => void
  readonly onPause: () => void
  readonly onResume: () => void
  readonly onStop: () => void
  readonly onExport: () => void
}

// ─── Status badge config ───────────────────────────────────────────────────

const STATUS_LABEL_KEY: Record<DiscussionStatus, string> = {
  draft: 'controls.status.draft',
  active: 'controls.status.active',
  concluded: 'controls.status.concluded',
}

const STATUS_COLORS: Record<DiscussionStatus, string> = {
  draft: 'border-border bg-muted/50 text-muted-foreground',
  active: 'border-green-500/40 bg-green-500/10 text-green-400',
  concluded: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
}

// ─── Stop confirmation dialog ──────────────────────────────────────────────

interface StopConfirmDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

function StopConfirmDialog({ open, onOpenChange, onConfirm }: StopConfirmDialogProps) {
  const { t } = useTranslation('discussions')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px]">
        <DialogHeader>
          <DialogTitle>{t('controls.stopDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('controls.stopDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {t('common:action.cancel')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="gap-1.5"
          >
            <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
            {t('controls.stopDialog.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── DiscussionControls ────────────────────────────────────────────────────

export function DiscussionControls({
  status,
  currentRound,
  maxRounds,
  onStart,
  onPause,
  onResume,
  onStop,
  onExport,
}: DiscussionControlsProps) {
  const { t } = useTranslation('discussions')
  const [stopDialogOpen, setStopDialogOpen] = useState(false)

  const handleStopConfirm = useCallback(() => {
    onStop()
  }, [onStop])

  const isDraft = status === 'draft'
  const isActive = status === 'active'
  const isConcluded = status === 'concluded'

  return (
    <div
      className="flex items-center gap-2 border-b border-border bg-card px-4 py-2"
      role="toolbar"
      aria-label={t('controls.toolbarLabel')}
    >
      {/* Round indicator */}
      <span className="mr-1 shrink-0 text-xs text-muted-foreground">
        {isConcluded ? (
          t('controls.round.concluded')
        ) : maxRounds > 0 ? (
          t('controls.round.of', { current: currentRound, max: maxRounds })
        ) : currentRound > 0 ? (
          t('controls.round.current', { current: currentRound })
        ) : (
          t('controls.round.notStarted')
        )}
      </span>

      {/* Status badge */}
      <div
        className={cn(
          'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium',
          STATUS_COLORS[status],
        )}
        role="status"
        aria-label={t('controls.statusLabel', { status: t(STATUS_LABEL_KEY[status]) })}
      >
        {isActive && (
          <Loader2 className="mr-1 inline-block h-2.5 w-2.5 animate-spin" aria-hidden />
        )}
        {t(STATUS_LABEL_KEY[status])}
      </div>

      <div className="flex-1" />

      {/* Action buttons */}
      {isDraft && (
        <Button
          size="sm"
          className="h-7 gap-1.5 bg-green-600 px-3 text-xs text-white hover:bg-green-700 focus-visible:ring-green-500"
          onClick={onStart}
          aria-label={t('controls.startLabel')}
        >
          <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
          {t('controls.start')}
        </Button>
      )}

      {isActive && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 px-3 text-xs"
            onClick={onPause}
            aria-label={t('controls.pauseLabel')}
          >
            <Pause className="h-3.5 w-3.5" aria-hidden />
            {t('controls.pause')}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 border-red-500/40 px-3 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => setStopDialogOpen(true)}
            aria-label={t('controls.stopLabel')}
          >
            <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
            {t('controls.stop')}
          </Button>
        </>
      )}

      {/* Paused state — status would still be 'active' from server perspective;
          resume is shown whenever start was pressed but we track this via status */}
      {status === 'draft' ? null : !isDraft && !isConcluded && !isActive ? (
        <Button
          size="sm"
          className="h-7 gap-1.5 px-3 text-xs"
          onClick={onResume}
          aria-label={t('controls.resumeLabel')}
        >
          <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
          {t('controls.resume')}
        </Button>
      ) : null}

      {isConcluded && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 px-3 text-xs"
          onClick={onExport}
          aria-label={t('controls.exportLabel')}
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {t('controls.export')}
        </Button>
      )}

      <StopConfirmDialog
        open={stopDialogOpen}
        onOpenChange={setStopDialogOpen}
        onConfirm={handleStopConfirm}
      />
    </div>
  )
}
