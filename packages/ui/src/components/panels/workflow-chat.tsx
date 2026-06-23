'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bot,
  Check,
  FileText,
  FolderOpen,
  GitBranch,
  Download,
  ExternalLink,
  Loader2,
  Play,
  Send,
  Square,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Zap,
  ListChecks,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatTime, formatNumber } from '@/lib/format'
import { Markdown } from '@/components/shared/markdown'
import { ModeToggle } from '@/components/panels/mode-toggle'
import { ToolCard, type ToolCardData } from '@/components/shared/tool-card'
import { AdvisorCard, type AdvisorResultData } from '@/components/panels/advisor-card'
import type { AgentMode, ChainApprovalMode, TokenUsage } from '@rondoflow/shared'
import type { ChainStep } from '@/lib/chain-utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WorkflowLogEntry {
  readonly id: string
  readonly type:
    | 'user'
    | 'step_start'
    | 'step_text'
    | 'step_tool_use'
    | 'step_tool_result'
    | 'step_complete'
    | 'chain_complete'
    | 'error'
    | 'system'
    | 'director_thinking'
    | 'director_decision'
    | 'director_redirect_request'
    | 'director_redirect_approved'
    | 'director_redirect_declined'
    | 'step_approval_request'
    | 'advisor_analyzing'
    | 'advisor_result'
  readonly content: string
  readonly agentName?: string
  readonly stepIndex?: number
  readonly timestamp: Date
  readonly partial?: boolean
  readonly completed?: boolean
  readonly toolUse?: ToolCardData
  readonly cwd?: string
  readonly usage?: TokenUsage
  readonly directorAction?: 'continue' | 'redirect' | 'conclude'
  readonly requestId?: string
  readonly advisorResult?: AdvisorResultData
  /** Filename of the auto-saved output for a completed run (enables "Open result"). */
  readonly savedOutputName?: string
  /** True while a completed run's output is being auto-saved (shows a spinner). */
  readonly savingOutput?: boolean
}

export interface WorkflowChatProps {
  readonly steps: readonly ChainStep[]
  readonly isRunning: boolean
  readonly log: readonly WorkflowLogEntry[]
  readonly mode: AgentMode
  readonly approvalMode: ChainApprovalMode
  readonly onApprovalModeChange: (mode: ChainApprovalMode) => void
  readonly onStepApprovalRespond?: (requestId: string, approved: boolean) => void
  readonly hasWorkspace: boolean
  readonly directorEnabled: boolean
  readonly workingDirectory?: string | null
  readonly onWorkingDirectoryChange?: (dir: string | null) => void
  readonly onSendMessage: (message: string) => void
  readonly onRun: (message: string) => void
  readonly onStop: () => void
  readonly onModeChange: (mode: AgentMode) => void
  readonly onClearLog: () => void
  readonly onStepClick?: (stepIndex: number) => void
  readonly onDirectorToggle: (enabled: boolean) => void
  readonly onDirectorRedirectRespond?: (requestId: string, approved: boolean) => void
  readonly hasCompletedRun: boolean
  readonly advisorRunning: boolean
  readonly advisorModel: string
  readonly onAdvisorRequest: (model: string) => void
  readonly onAdvisorModelChange: (model: string) => void
  readonly onApplySkill: (agentId: string, skillName: string) => Promise<void>
  readonly onUpdatePersona: (agentId: string, newPersona: string) => Promise<void>
  readonly onSaveOutput?: (content: string) => void
  readonly onViewOutputs?: (name?: string | null) => void
}

// ─── Log entry component ────────────────────────────────────────────────────

export function LogEntry({
  entry,
  onStepClick,
  onDirectorRedirectRespond,
  onStepApprovalRespond,
  onApplySkill,
  onUpdatePersona,
  onSaveOutput,
  onViewOutputs,
}: {
  readonly entry: WorkflowLogEntry
  readonly onStepClick?: (stepIndex: number) => void
  readonly onDirectorRedirectRespond?: (requestId: string, approved: boolean) => void
  readonly onStepApprovalRespond?: (requestId: string, approved: boolean) => void
  readonly onApplySkill?: (agentId: string, skillName: string) => Promise<void>
  readonly onUpdatePersona?: (agentId: string, newPersona: string) => Promise<void>
  readonly onSaveOutput?: (content: string) => void
  readonly onViewOutputs?: (name?: string | null) => void
}) {
  const { t, i18n } = useTranslation('discussions')
  if (entry.type === 'user') {
    return (
      <div className="flex justify-end" role="listitem">
        <div className="max-w-[80%] rounded-lg rounded-br-sm bg-muted px-3 py-2 text-sm">
          <p className="whitespace-pre-wrap break-words">{entry.content}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {formatTime(entry.timestamp, i18n.language)}
          </p>
        </div>
      </div>
    )
  }

  if (entry.type === 'step_start') {
    return (
      <div role="listitem">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {entry.completed ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" aria-hidden />
          ) : (
            <Loader2 className="h-3 w-3 animate-spin text-primary" aria-hidden />
          )}
          <span>
            {t('chat.step', { index: (entry.stepIndex ?? 0) + 1 })}{entry.completed ? '' : t('chat.stepRunning')}
            <span className="font-medium text-foreground">{entry.agentName}</span>
          </span>
        </div>
        {entry.cwd && (
          <div className="ml-5 mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <FolderOpen className="h-2.5 w-2.5" aria-hidden />
            <span className="font-mono">{entry.cwd}</span>
          </div>
        )}
      </div>
    )
  }

  if (entry.type === 'step_text') {
    return (
      <div className="ml-5" role="listitem">
        <div className="whitespace-pre-wrap break-words rounded bg-card border border-border px-2.5 py-1.5 text-xs text-foreground">
          {entry.content}
          {entry.partial && (
            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-primary" aria-label={t('chat.streamingLabel')} />
          )}
        </div>
      </div>
    )
  }

  if (entry.type === 'step_tool_use') {
    return (
      <div className="ml-5" role="listitem">
        {entry.toolUse && <ToolCard tool={entry.toolUse} />}
      </div>
    )
  }

  // step_tool_result is handled by updating the tool_use entry, not rendered separately

  if (entry.type === 'step_complete') {
    const clickable = onStepClick && entry.stepIndex !== undefined
    return (
      <div
        className={cn('flex items-start gap-2', clickable && 'cursor-pointer rounded-md px-1 -mx-1 hover:bg-muted/50 transition-colors')}
        role="listitem"
        onClick={clickable ? () => onStepClick(entry.stepIndex!) : undefined}
        title={clickable ? t('chat.viewConversationTitle') : undefined}
      >
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium">
              {t('chat.agentCompleted', { name: entry.agentName })}
            </p>
            {entry.usage && (
              <span className="text-[10px] text-muted-foreground">
                {t('chat.tokens', { count: entry.usage.inputTokens + entry.usage.outputTokens })}
                {entry.usage.estimatedCostUsd !== undefined && (
                  <> &middot; ${entry.usage.estimatedCostUsd.toFixed(4)}</>
                )}
              </span>
            )}
          </div>
          {entry.content && (
            <div
              className="mt-0.5 max-h-96 overflow-y-auto rounded bg-card border border-border px-2 py-1.5"
              // Clicking the box still opens the full conversation (the row's
              // handler), but a click on a rendered markdown link should only
              // open that link — not also navigate away — so swallow it here.
              onClick={
                clickable
                  ? (e) => {
                      if ((e.target as HTMLElement).closest('a')) e.stopPropagation()
                    }
                  : undefined
              }
            >
              <Markdown content={entry.content} className="text-xs text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (entry.type === 'chain_complete') {
    return (
      <div
        className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-3"
        role="listitem"
      >
        {/* Status line — centered completion summary */}
        <div className="flex items-center justify-center gap-2 text-xs text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="font-medium">{t('chat.workflowCompleted')}</span>
          {entry.usage && (
            <span className="text-green-400/70">
              {t('chat.tokensSuffix', { count: entry.usage.inputTokens + entry.usage.outputTokens, formattedCount: formatNumber(entry.usage.inputTokens + entry.usage.outputTokens, i18n.language) })}
              {entry.usage.estimatedCostUsd !== undefined && entry.usage.estimatedCostUsd > 0 && (
                <> &middot; ${entry.usage.estimatedCostUsd.toFixed(4)}</>
              )}
            </span>
          )}
        </div>

        {/* CTA row — buttons on their own centered line */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {onViewOutputs && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-green-500/40 px-3.5 text-xs font-medium text-green-500 hover:border-green-500/60 hover:bg-green-500/10 hover:text-green-400"
              onClick={() => onViewOutputs()}
              aria-label={t('chat.outputsLabel')}
              title={t('chat.outputsTitle')}
            >
              <FileText className="h-3.5 w-3.5" aria-hidden />
              {t('chat.outputs')}
            </Button>
          )}
          {entry.savingOutput ? (
            <span
              className="flex items-center gap-1.5 px-3 text-xs text-green-400/70"
              aria-live="polite"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              {t('chat.savingOutput')}
            </span>
          ) : entry.savedOutputName && onViewOutputs ? (
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-green-600 px-3.5 text-xs font-semibold text-white hover:bg-green-700"
              onClick={() => onViewOutputs(entry.savedOutputName)}
              aria-label={t('chat.openResultLabel')}
              title={t('chat.openResultTitle')}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              {t('chat.openResult')}
            </Button>
          ) : onSaveOutput ? (
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-green-600 px-3.5 text-xs font-semibold text-white hover:bg-green-700"
              onClick={() => onSaveOutput(entry.content)}
              aria-label={t('chat.saveLabel')}
              title={t('chat.saveTitle')}
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              {t('common:action.save')}
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  if (entry.type === 'error') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive" role="listitem">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{entry.content}</span>
      </div>
    )
  }

  if (entry.type === 'director_thinking') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-purple-500/10 px-3 py-2 text-xs text-purple-400" role="listitem">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        <span className="font-medium">{t('chat.directorEvaluating')}</span>
      </div>
    )
  }

  if (entry.type === 'director_decision') {
    const actionIcon = entry.directorAction === 'conclude'
      ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" aria-hidden />
      : entry.directorAction === 'redirect'
        ? <AlertCircle className="h-3.5 w-3.5 text-amber-400" aria-hidden />
        : <Bot className="h-3.5 w-3.5 text-purple-400" aria-hidden />

    return (
      <div className="rounded-md border border-purple-500/20 bg-purple-500/5 px-3 py-2" role="listitem">
        <div className="flex items-center gap-2 text-xs font-medium text-purple-400">
          {actionIcon}
          <span>{t('chat.director')}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-400">
            {entry.directorAction}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
      </div>
    )
  }

  if (entry.type === 'director_redirect_request') {
    return (
      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5" role="listitem">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden />
          <span>{t('chat.directorSuggestsRedirect')}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
        {entry.requestId && onDirectorRedirectRespond && (
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 px-3 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
              onClick={() => onDirectorRedirectRespond(entry.requestId!, true)}
            >
              {t('chat.approveRedirect')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-3 text-xs text-muted-foreground"
              onClick={() => onDirectorRedirectRespond(entry.requestId!, false)}
            >
              {t('chat.continueForward')}
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (entry.type === 'step_approval_request') {
    const pending = !!entry.requestId && !!onStepApprovalRespond
    return (
      <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2.5" role="listitem">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <ListChecks className="h-3.5 w-3.5" aria-hidden />
          <span>
            {t('chat.approveStep', { index: (entry.stepIndex ?? 0) + 1 })}
            {entry.agentName ? <> — <span className="text-foreground">{entry.agentName}</span></> : null}?
          </span>
        </div>
        {pending ? (
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 gap-1.5 px-3 text-xs bg-green-600 hover:bg-green-700"
              onClick={() => onStepApprovalRespond!(entry.requestId!, true)}
            >
              <Check className="h-3 w-3" aria-hidden />
              {t('chat.approveAndRun')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-3 text-xs text-destructive hover:bg-destructive/10"
              onClick={() => onStepApprovalRespond!(entry.requestId!, false)}
            >
              {t('chat.stopFlow')}
            </Button>
          </div>
        ) : (
          <p className="mt-1 text-[11px] text-muted-foreground">{t('chat.resolved')}</p>
        )}
      </div>
    )
  }

  if (entry.type === 'director_redirect_approved') {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-400" role="listitem">
        <Check className="h-3 w-3" aria-hidden />
        <span>{t('chat.redirectApproved', { name: entry.agentName })}</span>
      </div>
    )
  }

  if (entry.type === 'director_redirect_declined') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground" role="listitem">
        <span>{t('chat.redirectDeclined')}</span>
      </div>
    )
  }

  if (entry.type === 'advisor_analyzing') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-400" role="listitem">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        <span className="font-medium">{t('chat.advisorAnalyzing')}</span>
      </div>
    )
  }

  if (entry.type === 'advisor_result' && entry.advisorResult) {
    return (
      <AdvisorCard
        result={entry.advisorResult}
        onApplySkill={onApplySkill ?? (async () => {})}
        onUpdatePersona={onUpdatePersona ?? (async () => {})}
      />
    )
  }

  // system
  return (
    <div className="text-center text-[10px] text-muted-foreground" role="listitem">
      {entry.content}
    </div>
  )
}

// ─── Log view (reusable) ─────────────────────────────────────────────────────

export interface WorkflowLogViewProps {
  readonly log: readonly WorkflowLogEntry[]
  readonly autoScroll?: boolean
  /**
   * When true, a persistent "working" indicator is shown at the bottom of the log
   * so the user can tell the run is alive even during the quiet gaps between
   * events (an agent thinking before it emits any text, the handoff between
   * steps, etc.). Omit for static historical logs.
   */
  readonly isRunning?: boolean
  readonly emptyTitle?: string
  readonly emptyHint?: string
  readonly onStepClick?: (stepIndex: number) => void
  readonly onDirectorRedirectRespond?: (requestId: string, approved: boolean) => void
  readonly onStepApprovalRespond?: (requestId: string, approved: boolean) => void
  readonly onApplySkill?: (agentId: string, skillName: string) => Promise<void>
  readonly onUpdatePersona?: (agentId: string, newPersona: string) => Promise<void>
  readonly onSaveOutput?: (content: string) => void
  readonly onViewOutputs?: (name?: string | null) => void
}

/**
 * Scrollable render of an execution log. Shared by the live WorkflowChat and the
 * read-only historical run viewer so both look identical. Pass `autoScroll` to
 * follow new entries (live runs); omit it for static historical logs.
 */
export function WorkflowLogView({
  log,
  autoScroll = true,
  isRunning = false,
  emptyTitle,
  emptyHint,
  onStepClick,
  onDirectorRedirectRespond,
  onStepApprovalRespond,
  onApplySkill,
  onUpdatePersona,
  onSaveOutput,
  onViewOutputs,
}: WorkflowLogViewProps) {
  const { t } = useTranslation('discussions')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Show the standing "working" indicator while the run is live, except when the
  // run is parked on the user: the last entry being an unresolved approval or
  // redirect request means we're waiting for a human, not actively processing.
  const lastEntry = log.length > 0 ? log[log.length - 1] : undefined
  const awaitingUser =
    (lastEntry?.type === 'step_approval_request' || lastEntry?.type === 'director_redirect_request') &&
    !!lastEntry.requestId
  const showWorking = isRunning && !awaitingUser

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length, autoScroll, showWorking])

  return (
    <div
      className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      role="list"
      aria-label={t('chat.logLabel')}
      aria-live="polite"
    >
      {log.length === 0 && !showWorking ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <GitBranch className="h-6 w-6 text-muted-foreground" aria-hidden />
          </div>
          <p className="text-sm font-medium">{emptyTitle ?? t('chat.emptyTitle')}</p>
          <p className="text-xs text-muted-foreground">{emptyHint ?? t('chat.emptyHint')}</p>
        </div>
      ) : (
        <>
          {log.map((entry) => (
            <LogEntry
              key={entry.id}
              entry={entry}
              onStepClick={onStepClick}
              onDirectorRedirectRespond={onDirectorRedirectRespond}
              onStepApprovalRespond={onStepApprovalRespond}
              onApplySkill={onApplySkill}
              onUpdatePersona={onUpdatePersona}
              onSaveOutput={onSaveOutput}
              onViewOutputs={onViewOutputs}
            />
          ))}
          {showWorking && (
            <div
              className="flex items-center gap-2 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden />
              <span className="inline-flex items-center gap-1">
                {t('chat.working')}
                <span className="flex gap-0.5" aria-hidden>
                  <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-primary" />
                </span>
              </span>
            </div>
          )}
          <div ref={bottomRef} aria-hidden />
        </>
      )}
    </div>
  )
}

// ─── Approval-mode toggle ─────────────────────────────────────────────────────

/**
 * Compact segmented control choosing how the whole run handles tool permissions:
 *  - Auto: every step runs its tools without prompting.
 *  - Step: pause and confirm before each agent step runs.
 * Both let tools (e.g. WebSearch) execute — Auto vs Step only differ on whether
 * the run pauses for a human at each step boundary.
 */
function ApprovalModeToggle({
  mode,
  onChange,
  disabled,
}: {
  readonly mode: ChainApprovalMode
  readonly onChange: (mode: ChainApprovalMode) => void
  readonly disabled?: boolean
}) {
  const { t } = useTranslation('discussions')
  const options: ReadonlyArray<{ value: ChainApprovalMode; label: string; Icon: typeof Zap; title: string }> = [
    { value: 'auto', label: t('chat.approvalMode.auto'), Icon: Zap, title: t('chat.approvalMode.autoTitle') },
    { value: 'perStep', label: t('chat.approvalMode.step'), Icon: ListChecks, title: t('chat.approvalMode.stepTitle') },
  ]
  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-border p-0.5"
      role="group"
      aria-label={t('chat.approvalMode.groupLabel')}
    >
      {options.map(({ value, label, Icon, title }) => (
        <button
          key={value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value)}
          title={title}
          aria-pressed={mode === value}
          className={cn(
            'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors',
            mode === value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <Icon className="h-3 w-3" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function WorkflowChat({
  steps,
  isRunning,
  log,
  mode,
  approvalMode,
  onApprovalModeChange,
  onStepApprovalRespond,
  onSendMessage,
  onRun,
  onStop,
  onModeChange,
  onClearLog,
  onStepClick,
  onDirectorRedirectRespond,
  onApplySkill,
  onUpdatePersona,
  onSaveOutput,
  onViewOutputs,
}: WorkflowChatProps) {
  const { t } = useTranslation('discussions')
  const [value, setValue] = useState('')
  // Bridges the gap between clicking Run and the run actually starting (the
  // pre-run connection test takes a moment): shows a spinner so the click
  // registers immediately instead of the button looking inert.
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = value.trim().length > 0

  // Clear the submitting spinner once the run is live, or after a safety window
  // if it never starts (e.g. the chain was rejected before launch).
  useEffect(() => {
    if (!submitting) return
    if (isRunning) {
      setSubmitting(false)
      return
    }
    const t = setTimeout(() => setSubmitting(false), 10000)
    return () => clearTimeout(t)
  }, [submitting, isRunning])

  // Per-step status for the chain overview, derived from the log: a step is
  // `completed` once a `step_complete` arrives, `active` once it has started but
  // not yet completed (while the chain runs), otherwise `pending`.
  const stepStatuses = useMemo<readonly ('pending' | 'active' | 'completed')[]>(() => {
    const started = new Set<number>()
    const completed = new Set<number>()
    for (const entry of log) {
      if (entry.stepIndex === undefined) continue
      if (entry.type === 'step_start') started.add(entry.stepIndex)
      if (entry.type === 'step_complete') completed.add(entry.stepIndex)
    }
    return steps.map((_, i) => {
      if (completed.has(i)) return 'completed'
      if (isRunning && started.has(i)) return 'active'
      return 'pending'
    })
  }, [log, steps, isRunning])

  // When the Execution Log opens (this panel mounts), guide the user straight to
  // the composer so they can describe the task. Deferred so it wins over the
  // Sheet's own open-focus, which would otherwise land on a header button.
  useEffect(() => {
    const id = setTimeout(() => textareaRef.current?.focus(), 60)
    return () => clearTimeout(id)
  }, [])

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed) return

    if (isRunning) {
      onSendMessage(trimmed)
    } else {
      setSubmitting(true)
      onRun(trimmed)
    }
    setValue('')
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-3">
        {/* Title + status */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-500">
            <GitBranch className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t('chat.executionLog')}</p>
            <span className="text-[10px] text-muted-foreground">
              {t('chat.stepsCount', { count: steps.length })} {isRunning ? t('chat.runningSuffix') : ''}
            </span>
          </div>
          <ApprovalModeToggle mode={approvalMode} onChange={onApprovalModeChange} disabled={isRunning} />
          <ModeToggle mode={mode} onChange={onModeChange} disabled={isRunning} />
          {onViewOutputs && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-muted-foreground"
              onClick={() => onViewOutputs()}
              aria-label={t('chat.viewOutputs')}
              title={t('chat.viewOutputs')}
            >
              <FileText className="h-3 w-3" aria-hidden />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground"
            onClick={onClearLog}
            aria-label={t('chat.clearLog')}
          >
            <Trash2 className="h-3 w-3" aria-hidden />
          </Button>
        </div>

        {/* Chain steps overview */}
        {steps.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {steps.map((step, i) => {
              const status = stepStatuses[i]
              return (
                <div key={step.nodeId} className="flex items-center gap-1">
                  <span
                    className={cn(
                      'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors',
                      status === 'active' &&
                        'bg-primary/15 text-primary ring-1 ring-inset ring-primary/40',
                      status === 'completed' && 'bg-green-500/10 text-green-600 dark:text-green-400',
                      status === 'pending' &&
                        (isRunning ? 'bg-muted text-muted-foreground/60' : 'bg-muted'),
                    )}
                    aria-current={status === 'active' ? 'step' : undefined}
                  >
                    {status === 'active' && (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden />
                    )}
                    {status === 'completed' && (
                      <Check className="h-2.5 w-2.5" aria-hidden />
                    )}
                    {step.agentName}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="text-[10px] text-muted-foreground">&rarr;</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </header>

      {/* Log */}
      <WorkflowLogView
        log={log}
        isRunning={isRunning}
        onStepClick={onStepClick}
        onDirectorRedirectRespond={onDirectorRedirectRespond}
        onStepApprovalRespond={onStepApprovalRespond}
        onApplySkill={onApplySkill}
        onUpdatePersona={onUpdatePersona}
        onSaveOutput={onSaveOutput}
        onViewOutputs={onViewOutputs}
      />

      {/* Input area */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRunning
                ? t('chat.inputPlaceholderRunning')
                : t('chat.inputPlaceholderIdle')
            }
            className="min-h-[60px] max-h-[160px] resize-none text-sm"
            rows={2}
            aria-label={t('chat.inputLabel')}
          />
          <div className="flex shrink-0 flex-col gap-1.5">
            {isRunning ? (
              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0"
                onClick={onStop}
                aria-label={t('chat.stopWorkflow')}
              >
                <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                onClick={handleSend}
                disabled={!canSend || submitting}
                isLoading={submitting}
                aria-label={
                  submitting ? t('chat.startingWorkflow') : canSend ? t('chat.runWorkflow') : t('chat.typeMessageFirst')
                }
              >
                {!submitting &&
                  (canSend ? (
                    <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
                  ) : (
                    <Send className="h-3.5 w-3.5" aria-hidden />
                  ))}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
