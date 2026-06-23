'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Bot, CheckCircle, XCircle, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ApprovalData {
  readonly id: string
  readonly agentId: string
  readonly agentName: string
  readonly command: string
  readonly description: string
  readonly toolName: string
}

export interface ApprovalDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly approval: ApprovalData | null
  readonly onApprove: (id: string, editedCommand?: string) => void
  readonly onReject: (id: string) => void
}

// ─── Constants ─────────────────────────────────────────────────────────────

const TIMEOUT_SECONDS = 300 // 5 minutes

// ─── Risk detection ────────────────────────────────────────────────────────

type RiskLevel = 'high' | 'medium' | 'low'

interface RiskInfo {
  readonly level: RiskLevel
}

const HIGH_RISK_PATTERNS = [
  /\brm\s+-rf?\b/i,
  /\bdrop\s+table\b/i,
  /\btruncate\b/i,
  /\bformat\b/i,
  /\bchmod\s+777\b/i,
  /\bsudo\b/i,
  /\beval\b/i,
  />[>\s]*\/dev\/(sd|hd|nvme)/i,
]

const MEDIUM_RISK_PATTERNS = [
  /\bgit\s+push\b/i,
  /\bgit\s+force\b/i,
  /\bdeploy\b/i,
  /\bpublish\b/i,
  /\bnpm\s+publish\b/i,
  /\bwrite\b/i,
  /\bdelete\b/i,
]

function assessRisk(command: string): RiskInfo {
  for (const pattern of HIGH_RISK_PATTERNS) {
    if (pattern.test(command)) {
      return { level: 'high' }
    }
  }

  for (const pattern of MEDIUM_RISK_PATTERNS) {
    if (pattern.test(command)) {
      return { level: 'medium' }
    }
  }

  return { level: 'low' }
}

// ─── Risk badge ────────────────────────────────────────────────────────────

function RiskBadge({ risk }: { readonly risk: RiskInfo }) {
  const { t } = useTranslation('admin')
  const label = t(`approval.risk.${risk.level}.label`)
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
        risk.level === 'high' && 'border-red-500/40 bg-red-500/10 text-red-400',
        risk.level === 'medium' && 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
        risk.level === 'low' && 'border-green-500/40 bg-green-500/10 text-green-400',
      )}
      role="status"
      aria-label={t('approval.risk.levelAria', { label })}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          risk.level === 'high' && 'bg-red-400',
          risk.level === 'medium' && 'bg-yellow-400',
          risk.level === 'low' && 'bg-green-400',
        )}
        aria-hidden
      />
      {label}
    </div>
  )
}

// ─── Countdown timer ───────────────────────────────────────────────────────

function CountdownBar({
  totalSeconds,
  onExpire,
}: {
  readonly totalSeconds: number
  readonly onExpire: () => void
}) {
  const { t } = useTranslation('admin')
  const [remaining, setRemaining] = useState(totalSeconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    setRemaining(totalSeconds)

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [totalSeconds])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const progressPct = (remaining / totalSeconds) * 100
  const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="space-y-1" aria-label={t('approval.countdown.autoDismissAria', { time: timeLabel })}>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{t('approval.countdown.label')}</span>
        <span>
          {timeLabel}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-yellow-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPct}%` }}
          aria-hidden
        />
      </div>
    </div>
  )
}

// ─── ApprovalDialog ────────────────────────────────────────────────────────

export function ApprovalDialog({
  open,
  onOpenChange,
  approval,
  onApprove,
  onReject,
}: ApprovalDialogProps) {
  const { t } = useTranslation('admin')
  const [isEditing, setIsEditing] = useState(false)
  const [editedCommand, setEditedCommand] = useState('')
  const approveButtonRef = useRef<HTMLButtonElement>(null)

  // Reset edit state when a new approval is shown
  useEffect(() => {
    if (open && approval) {
      setIsEditing(false)
      setEditedCommand(approval.command)
    }
  }, [open, approval])

  // Focus the approve button when dialog opens for keyboard navigation
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        approveButtonRef.current?.focus()
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [open])

  const handleApprove = useCallback(() => {
    if (!approval) return
    const command = isEditing ? editedCommand.trim() : undefined
    onApprove(approval.id, command || undefined)
    setIsEditing(false)
  }, [approval, isEditing, editedCommand, onApprove])

  const handleReject = useCallback(() => {
    if (!approval) return
    onReject(approval.id)
    setIsEditing(false)
  }, [approval, onReject])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      // Only intercept Enter/Escape when not focused on textarea
      if (e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleApprove()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        handleReject()
      }
    },
    [handleApprove, handleReject],
  )

  const handleExpire = useCallback(() => {
    if (!approval) return
    onReject(approval.id)
  }, [approval, onReject])

  if (!approval) return null

  const risk = assessRisk(approval.command)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[500px] gap-0 p-0"
        onKeyDown={handleKeyDown}
        aria-describedby="approval-description"
      >
        {/* Header */}
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="h-5 w-5 shrink-0 text-yellow-500"
              aria-hidden
            />
            <DialogTitle className="text-base">{t('approval.title')}</DialogTitle>
          </div>
          <DialogDescription id="approval-description" className="mt-1 text-xs">
            {t('approval.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-4 px-6 py-4">
          {/* Agent info */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10"
              aria-hidden
            >
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{approval.agentName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="text-[10px] py-0">
                  {approval.toolName}
                </Badge>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-yellow-500"
                  aria-label={t('approval.waiting')}
                />
                <span className="text-[10px] text-muted-foreground">{t('approval.waiting')}</span>
              </div>
            </div>
            <div className="ml-auto shrink-0">
              <RiskBadge risk={risk} />
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('approval.intent')}
            </p>
            <p className="text-sm text-foreground">{approval.description}</p>
          </div>

          {/* Risk reason */}
          {risk.level !== 'low' && (
            <div
              className={cn(
                'rounded-md border px-3 py-2 text-xs',
                risk.level === 'high' && 'border-red-500/30 bg-red-500/5 text-red-400',
                risk.level === 'medium' && 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
              )}
              role="alert"
            >
              {t(`approval.risk.${risk.level}.reason`)}
            </div>
          )}

          {/* Command display */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('approval.command')}
              </p>
              <button
                type="button"
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsEditing((prev) => !prev)}
                aria-pressed={isEditing}
                aria-label={isEditing ? t('approval.cancelEdit') : t('approval.editToggleAria')}
              >
                <Edit2 className="h-3 w-3" aria-hidden />
                {isEditing ? t('approval.cancelEdit') : t('approval.edit')}
              </button>
            </div>

            {isEditing ? (
              <Textarea
                value={editedCommand}
                onChange={(e) => setEditedCommand(e.target.value)}
                className="font-mono text-xs resize-none min-h-[80px]"
                aria-label={t('approval.editCommandAria')}
                autoFocus
                spellCheck={false}
              />
            ) : (
              <pre
                className={cn(
                  'overflow-x-auto whitespace-pre-wrap break-all rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-xs text-foreground',
                  risk.level === 'high' && 'border-red-500/30',
                  risk.level === 'medium' && 'border-yellow-500/30',
                )}
                aria-label={t('approval.commandAria')}
              >
                {approval.command}
              </pre>
            )}
          </div>

          {/* Countdown */}
          <CountdownBar totalSeconds={TIMEOUT_SECONDS} onExpire={handleExpire} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <p className="mr-auto text-[10px] text-muted-foreground">
            {t('approval.shortcuts')}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={handleReject}
            aria-label={t('approval.rejectAria')}
          >
            <XCircle className="h-3.5 w-3.5" aria-hidden />
            {t('approval.reject')}
          </Button>
          <Button
            ref={approveButtonRef}
            size="sm"
            className="gap-1.5 bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500"
            onClick={handleApprove}
            aria-label={isEditing ? t('approval.approveEditAria') : t('approval.approveAria')}
          >
            <CheckCircle className="h-3.5 w-3.5" aria-hidden />
            {isEditing ? t('approval.approveEdit') : t('approval.approve')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
