'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Play,
  Square,
  Loader2,
  MessageSquare,
  Bot,
  Lightbulb,
  ArrowRight,
  ClipboardList,
  FolderOpen,
  Save,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WorkflowStep {
  readonly index: number
  readonly total: number
  readonly agentName: string
}

export interface WorkflowToolbarProps {
  readonly hasChain: boolean
  /** Whether the user's role permits running (editor+). Hides Run/Stop/Director/
   * Planner/Advisor for viewers. Defaults to true. */
  readonly canRun?: boolean
  readonly isRunning: boolean
  readonly currentStep?: WorkflowStep | null
  // Run/Stop — Run opens the off-canvas Execution Log so the user enters the
  // task there; actual execution is triggered from inside that panel.
  readonly onOpenRunPanel: () => void
  readonly onStop: () => void
  // Chat
  readonly chatOpen: boolean
  readonly onToggleChat: () => void
  // Director
  readonly directorEnabled: boolean
  readonly directorStatus: 'idle' | 'thinking' | 'decided'
  readonly directorLastAction: 'continue' | 'redirect' | 'conclude' | null
  readonly directorLastTargetAgent: string | null
  readonly onDirectorToggle: () => void
  // Advisor
  readonly advisorVisible: boolean
  readonly advisorRunning: boolean
  readonly onAdvisorClick: () => void
  // Planner
  readonly plannerEnabled: boolean
  readonly plannerStatus: 'idle' | 'planning' | 'done'
  readonly onPlannerToggle: () => void
  // Workspace shortcuts (rendered left of Save; visible whenever a canvas is open)
  readonly onAssistantsClick?: () => void
  readonly onPlanClick?: () => void
  readonly onResourcesClick?: () => void
  // Canvas save (rendered on the right; visible whenever a canvas is open)
  readonly canSave?: boolean
  readonly canvasDirty?: boolean
  readonly canvasSaving?: boolean
  readonly canvasSaveFlash?: boolean
  readonly onSaveCanvas?: () => void
}

// ─── Director action badge styles ────────────────────────────────────────────

const ACTION_STYLES: Record<string, { labelKey: string; color: string }> = {
  continue: { labelKey: 'toolbar.director.action.continue', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  redirect: { labelKey: 'toolbar.director.action.redirect', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  conclude: { labelKey: 'toolbar.director.action.conclude', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
}

// ─── Component ──────────────────────────────────────────────────────────────

export function WorkflowToolbar({
  hasChain,
  canRun = true,
  isRunning,
  currentStep,
  onOpenRunPanel,
  onStop,
  chatOpen,
  onToggleChat,
  directorEnabled,
  directorStatus,
  directorLastAction,
  directorLastTargetAgent,
  onDirectorToggle,
  advisorVisible,
  advisorRunning,
  onAdvisorClick,
  plannerEnabled,
  plannerStatus,
  onPlannerToggle,
  onAssistantsClick,
  onPlanClick,
  onResourcesClick,
  canSave = false,
  canvasDirty = false,
  canvasSaving = false,
  canvasSaveFlash = false,
  onSaveCanvas,
}: WorkflowToolbarProps) {
  const { t } = useTranslation('canvas')

  // The run-progress sub-bar hangs below the toolbar and is linked to the Chat
  // toggle by a thin connector. We measure the toolbar's width (so the sub-bar
  // can size itself to 70% of it) and the chat button's horizontal centre (so
  // the connector can originate from that icon).
  const barRef = useRef<HTMLDivElement>(null)
  const chatBtnRef = useRef<HTMLButtonElement>(null)
  const [geom, setGeom] = useState<{ width: number; chatX: number }>({ width: 0, chatX: 0 })

  const measure = useCallback(() => {
    const bar = barRef.current
    if (!bar) return
    const barRect = bar.getBoundingClientRect()
    const width = barRect.width
    const chat = chatBtnRef.current
    const chatX = chat
      ? (() => {
          const r = chat.getBoundingClientRect()
          return r.left + r.width / 2 - barRect.left
        })()
      : width / 2
    setGeom((prev) =>
      Math.abs(prev.width - width) < 0.5 && Math.abs(prev.chatX - chatX) < 0.5
        ? prev
        : { width, chatX },
    )
  }, [])

  useEffect(() => {
    if (!isRunning || !hasChain) return
    measure()
    const bar = barRef.current
    if (!bar || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => measure())
    observer.observe(bar)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [isRunning, hasChain, measure])

  if (!hasChain && !canSave) return null

  const isThinking = directorEnabled && directorStatus === 'thinking'
  const hasDecision = directorEnabled && directorStatus === 'decided' && directorLastAction
  const actionStyle = directorLastAction ? ACTION_STYLES[directorLastAction] : null

  // Connector geometry (toolbar bottom → sub-bar top) in SVG coordinates. The
  // line drops from under the Chat icon and lands within the centred 70% sub-bar.
  const CONNECTOR_H = 16
  const originX = Math.max(4, Math.min(geom.chatX, geom.width - 4))
  const landLo = geom.width * 0.15 + 18
  const landHi = geom.width * 0.85 - 18
  const landingX = landHi <= landLo ? geom.width / 2 : Math.max(landLo, Math.min(originX, landHi))
  const connectorPath = `M ${originX} 0 C ${originX} ${CONNECTOR_H * 0.55}, ${landingX} ${CONNECTOR_H * 0.45}, ${landingX} ${CONNECTOR_H}`

  return (
    <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 flex-col items-center">
    <div
      ref={barRef}
      className="flex items-center gap-1.5 rounded-xl border border-border bg-card/95 px-2 py-1.5 shadow-lg backdrop-blur-sm"
    >

      {hasChain && canRun && (
        <>
      {/* ── Run / Stop ── */}
      {isRunning ? (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 gap-1.5 rounded-lg px-2.5 text-xs"
          onClick={onStop}
          aria-label={t('toolbar.stop.ariaLabel')}
        >
          <Square className="h-3 w-3 fill-current" aria-hidden />
          {t('toolbar.stop.label')}
        </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] text-xs">
            <p className="font-semibold text-foreground">{t('toolbar.stop.tooltipTitle')}</p>
            <p className="mt-1 text-muted-foreground">
              {t('toolbar.stop.tooltipBody')}
            </p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              className="h-7 gap-1.5 rounded-lg bg-green-600 px-2.5 text-xs text-white hover:bg-green-700"
              onClick={() => onOpenRunPanel()}
              aria-label={t('toolbar.run.ariaLabel')}
            >
              <Play className="h-3 w-3 fill-current" aria-hidden />
              {t('toolbar.run.label')}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] text-xs">
            <p className="font-semibold text-foreground">{t('toolbar.run.tooltipTitle')}</p>
            <p className="mt-1 text-muted-foreground">
              {t('toolbar.run.tooltipBody')}
            </p>
          </TooltipContent>
        </Tooltip>
      )}

      <Separator orientation="vertical" className="h-5" />

      {/* ── Director Badge ── */}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
      <button
        type="button"
        onClick={onDirectorToggle}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors',
          directorEnabled
            ? 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25'
            : 'text-muted-foreground hover:bg-muted',
        )}
      >
        {isThinking ? (
          <Loader2 className="h-3 w-3 animate-spin text-purple-400" aria-hidden />
        ) : (
          <Bot className={cn(
            'h-3 w-3',
            directorEnabled ? 'text-purple-400' : 'text-muted-foreground',
          )} aria-hidden />
        )}
        <span className="hidden sm:inline">
          {isThinking ? t('toolbar.director.evaluating') : t('toolbar.director.label')}
        </span>
        {directorEnabled && (
          <span className={cn(
            'h-1.5 w-1.5 rounded-full',
            isThinking ? 'animate-pulse bg-purple-400' : 'bg-green-400',
          )} />
        )}
        {/* Inline decision */}
        {hasDecision && actionStyle && (
          <>
            <span className={cn(
              'rounded border px-1 py-0 text-[9px] font-semibold',
              actionStyle.color,
            )}>
              {t(actionStyle.labelKey)}
            </span>
            {directorLastTargetAgent && (
              <>
                <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50" aria-hidden />
                <span className="max-w-[70px] truncate text-[10px] text-foreground/70">
                  {directorLastTargetAgent}
                </span>
              </>
            )}
          </>
        )}
      </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[260px] text-xs">
          <p className="font-semibold text-foreground">{t('toolbar.director.tooltipTitle')}</p>
          <p className="mt-1 text-muted-foreground">
            {t('toolbar.director.tooltipBodyBefore')}<em className="not-italic text-foreground/90">{t('toolbar.director.tooltipBodyWhileRuns')}</em>{t('toolbar.director.tooltipBodyMid')}<span className="text-foreground">{t('toolbar.director.tooltipBodyContinue')}</span>{t('toolbar.director.tooltipBodyToNext')}<span className="text-foreground">{t('toolbar.director.tooltipBodyRedirect')}</span>{t('toolbar.director.tooltipBodyRedirectNote')}<span className="text-foreground">{t('toolbar.director.tooltipBodyConclude')}</span>{t('toolbar.director.tooltipBodyEarly')}
          </p>
          <p className="mt-1.5 text-[10px] text-muted-foreground/80">
            {directorEnabled ? t('toolbar.director.toggleOn') : t('toolbar.director.toggleOff')}
          </p>
        </TooltipContent>
      </Tooltip>

      {/* ── Planner Badge ── */}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
      <button
        type="button"
        onClick={onPlannerToggle}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors',
          plannerEnabled
            ? 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25'
            : 'text-muted-foreground hover:bg-muted',
        )}
      >
        {plannerStatus === 'planning' ? (
          <Loader2 className="h-3 w-3 animate-spin text-cyan-400" aria-hidden />
        ) : (
          <ClipboardList className={cn(
            'h-3 w-3',
            plannerEnabled ? 'text-cyan-400' : 'text-muted-foreground',
          )} aria-hidden />
        )}
        <span className="hidden sm:inline">
          {plannerStatus === 'planning' ? t('toolbar.planner.planning') : t('toolbar.planner.label')}
        </span>
        {plannerEnabled && (
          <span className={cn(
            'h-1.5 w-1.5 rounded-full',
            plannerStatus === 'planning' ? 'animate-pulse bg-cyan-400' : 'bg-green-400',
          )} />
        )}
      </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[260px] text-xs">
          <p className="font-semibold text-foreground">{t('toolbar.planner.tooltipTitle')}</p>
          <p className="mt-1 text-muted-foreground">
            {t('toolbar.planner.tooltipBody')}
          </p>
          <p className="mt-1.5 text-[10px] text-muted-foreground/80">
            {plannerEnabled ? t('toolbar.planner.toggleOn') : t('toolbar.planner.toggleOff')}
          </p>
        </TooltipContent>
      </Tooltip>

      {/* ── Advisor Button ── */}
      {advisorVisible && (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onAdvisorClick}
          disabled={advisorRunning}
          className={cn(
            'flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors',
            advisorRunning
              ? 'bg-amber-500/15 text-amber-400'
              : 'text-muted-foreground hover:bg-muted hover:text-amber-400',
          )}
        >
          {advisorRunning ? (
            <Loader2 className="h-3 w-3 animate-spin text-amber-400" aria-hidden />
          ) : (
            <Lightbulb className="h-3 w-3" aria-hidden />
          )}
          <span className="hidden sm:inline">{t('toolbar.advisor.label')}</span>
        </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] text-xs">
            <p className="font-semibold text-foreground">{t('toolbar.advisor.tooltipTitle')}</p>
            <p className="mt-1 text-muted-foreground">
              {t('toolbar.advisor.tooltipBody')}
            </p>
            <p className="mt-1.5 text-[10px] text-muted-foreground/80">
              {advisorRunning ? t('toolbar.advisor.analyzing') : t('toolbar.advisor.clickToAnalyze')}
            </p>
          </TooltipContent>
        </Tooltip>
      )}

      <Separator orientation="vertical" className="h-5" />

      {/* ── Chat Toggle ── */}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
      <Button
        ref={chatBtnRef}
        size="sm"
        variant="ghost"
        className={cn(
          'relative h-7 w-7 rounded-lg p-0',
          (chatOpen || isRunning) && 'bg-primary/10 text-primary',
        )}
        onClick={onToggleChat}
        aria-label={chatOpen ? t('toolbar.chat.close') : t('toolbar.chat.open')}
      >
        <MessageSquare className="h-3.5 w-3.5" aria-hidden />
        {isRunning && (
          <span
            className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse"
            aria-hidden
          />
        )}
      </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[260px] text-xs">
          <p className="font-semibold text-foreground">{t('toolbar.chat.tooltipTitle')}</p>
          <p className="mt-1 text-muted-foreground">
            {t('toolbar.chat.tooltipBody')}
          </p>
          <p className="mt-1.5 text-[10px] text-muted-foreground/80">
            {chatOpen ? t('toolbar.chat.toggleOpen') : t('toolbar.chat.toggleClosed')}
          </p>
        </TooltipContent>
      </Tooltip>
        </>
      )}

      {/* ── Plan · Resources · Save (right side) ── */}
      {canSave && (
        <>
          {hasChain && <Separator orientation="vertical" className="h-5" />}

          {/* Assistants — relocated here from the top bar */}
          {onAssistantsClick && (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 rounded-lg p-0 text-muted-foreground"
                  onClick={onAssistantsClick}
                  aria-label={t('toolbar.assistants.label')}
                >
                  <Bot className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px] text-xs">
                <p className="font-semibold text-foreground">{t('toolbar.assistants.tooltipTitle')}</p>
                <p className="mt-1 text-muted-foreground">
                  {t('toolbar.assistants.tooltipBody')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Plan */}
          {onPlanClick && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 rounded-lg p-0 text-muted-foreground"
              onClick={onPlanClick}
              aria-label={t('toolbar.plan.label')}
              title={t('toolbar.plan.label')}
            >
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
            </Button>
          )}

          {/* Resources */}
          {onResourcesClick && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 rounded-lg p-0 text-muted-foreground"
              onClick={onResourcesClick}
              aria-label={t('toolbar.resources.label')}
              title={t('toolbar.resources.label')}
            >
              <FolderOpen className="h-3.5 w-3.5" aria-hidden />
            </Button>
          )}

          {/* Save */}
          {onSaveCanvas && (
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              'h-7 gap-1.5 rounded-lg px-2.5 text-xs',
              canvasDirty && !canvasSaving && !canvasSaveFlash
                ? 'bg-primary/15 text-primary hover:bg-primary/25'
                : 'text-muted-foreground',
            )}
            onClick={onSaveCanvas}
            disabled={canvasSaving}
            aria-label={t('toolbar.save.ariaLabel')}
            title={canvasSaving ? t('toolbar.save.titleSaving') : canvasDirty ? t('toolbar.save.titleDirty') : t('toolbar.save.titleSaved')}
          >
            {canvasSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : canvasSaveFlash ? (
              <Check className="h-3.5 w-3.5 text-green-500" aria-hidden />
            ) : (
              <Save className="h-3.5 w-3.5" aria-hidden />
            )}
            {canvasSaving ? t('toolbar.save.saving') : canvasSaveFlash ? t('toolbar.save.saved') : t('toolbar.save.label')}
            {canvasDirty && !canvasSaving && !canvasSaveFlash && (
              <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" aria-hidden />
            )}
          </Button>
          )}
        </>
      )}
    </div>

      {/* ── Run-progress sub-bar — hangs below the toolbar, linked to Chat ── */}
      {hasChain && isRunning && (
        <div className="flex w-full flex-col items-center">
          {/* Connector dropping from the Chat icon down to the sub-bar */}
          {geom.width > 0 ? (
            <svg
              width={geom.width}
              height={CONNECTOR_H}
              viewBox={`0 0 ${geom.width} ${CONNECTOR_H}`}
              className="pointer-events-none overflow-visible"
              aria-hidden
            >
              <path
                d={connectorPath}
                fill="none"
                strokeWidth={1.5}
                strokeLinecap="round"
                className="stroke-[hsl(var(--primary))] opacity-70"
              />
              <circle cx={originX} cy={1} r={2.5} className="fill-[hsl(var(--primary))]" />
            </svg>
          ) : (
            <div style={{ height: CONNECTOR_H }} aria-hidden />
          )}

          <div className="flex w-[70%] items-center justify-center gap-2 rounded-lg border border-primary/30 bg-card/95 px-3 py-1.5 text-xs shadow-lg backdrop-blur-sm">
            <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary" aria-hidden />
            {currentStep ? (
              <>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {currentStep.index}/{currentStep.total}
                </span>
                <span className="min-w-0 truncate font-medium text-foreground">
                  {currentStep.agentName}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">{t('toolbar.progress.running')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
