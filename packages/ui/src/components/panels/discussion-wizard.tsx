'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bot, ChevronRight, ChevronLeft, HelpCircle, Plus, Trash2, UserRoundCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { apiGet, apiPost } from '@/lib/api'
import { recommendDiscussionModels } from '@rondoflow/shared'
import type { DiscussionFormat, ParticipantRole, CreateDiscussionInput } from '@rondoflow/shared'

// ─── Props ─────────────────────────────────────────────────────────────────

export interface DiscussionAgent {
  readonly id: string
  readonly name: string
  readonly avatar?: string
  readonly model?: string
}

export interface DiscussionWizardProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly agents: readonly DiscussionAgent[]
  readonly onCreate: (config: CreateDiscussionInput) => void
}

// ─── Internal state ────────────────────────────────────────────────────────

interface ParticipantEntry {
  readonly agentId: string
  readonly role: ParticipantRole
}

interface WizardState {
  readonly topic: string
  readonly format: DiscussionFormat
  readonly facilitatorId: string
  readonly participants: readonly ParticipantEntry[]
  readonly roundMode: 'auto' | 'fixed'
  readonly fixedRounds: number
}

const INITIAL_STATE: WizardState = {
  topic: '',
  format: 'brainstorm',
  facilitatorId: '',
  participants: [],
  roundMode: 'auto',
  fixedRounds: 3,
}

// ─── Constants ─────────────────────────────────────────────────────────────

const FORMAT_OPTIONS: Array<{ value: DiscussionFormat; labelKey: string; descriptionKey: string }> = [
  {
    value: 'brainstorm',
    labelKey: 'format.brainstorm.label',
    descriptionKey: 'format.brainstorm.description',
  },
  {
    value: 'review',
    labelKey: 'format.review.label',
    descriptionKey: 'format.review.description',
  },
  {
    value: 'deliberation',
    labelKey: 'format.deliberation.label',
    descriptionKey: 'format.deliberation.description',
  },
]

const ROLE_OPTIONS: Array<{ value: ParticipantRole; labelKey: string; tooltipKey: string }> = [
  {
    value: 'participant',
    labelKey: 'role.participant.label',
    tooltipKey: 'role.participant.tooltip',
  },
  {
    value: 'observer',
    labelKey: 'role.observer.label',
    tooltipKey: 'role.observer.tooltip',
  },
  {
    value: 'devil_advocate',
    labelKey: 'role.devilAdvocate.label',
    tooltipKey: 'role.devilAdvocate.tooltip',
  },
]

// ─── Validation ────────────────────────────────────────────────────────────

interface ValidationResult {
  readonly valid: boolean
  readonly errors: readonly string[]
}

function validateStep(step: number, state: WizardState): ValidationResult {
  const errors: string[] = []

  if (step === 1) {
    if (!state.topic.trim()) errors.push('validation.topicRequired')
  }

  if (step === 2) {
    if (!state.facilitatorId) errors.push('validation.facilitatorRequired')
    if (state.participants.length === 0)
      errors.push('validation.participantRequired')
  }

  return { valid: errors.length === 0, errors }
}

// ─── Step indicator ────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { readonly current: number; readonly total: number }) {
  const { t } = useTranslation('discussions')
  return (
    <div className="flex items-center gap-2" aria-label={t('wizard.stepIndicator', { current, total })}>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className={cn(
            'h-1.5 rounded-full transition-all',
            n === current
              ? 'w-6 bg-primary'
              : n < current
              ? 'w-3 bg-primary/60'
              : 'w-3 bg-muted',
          )}
          aria-hidden
        />
      ))}
      <span className="text-[11px] text-muted-foreground">
        {current} / {total}
      </span>
    </div>
  )
}

// ─── Step 1: Topic ─────────────────────────────────────────────────────────

function StepTopic({
  state,
  onChange,
}: {
  readonly state: WizardState
  readonly onChange: (patch: Partial<WizardState>) => void
}) {
  const { t } = useTranslation('discussions')
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="discussion-topic" className="text-sm font-medium">
          {t('wizard.topic.label')}
        </label>
        <Textarea
          id="discussion-topic"
          value={state.topic}
          onChange={(e) => onChange({ topic: e.target.value })}
          placeholder={t('wizard.topic.placeholder')}
          className="min-h-[96px] resize-none text-sm"
          aria-required
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          {t('wizard.topic.hint')}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t('wizard.topic.styleLabel')}</span>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label={t('wizard.topic.styleLabel')}>
          {FORMAT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                state.format === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <input
                type="radio"
                name="discussion-format"
                value={opt.value}
                checked={state.format === opt.value}
                onChange={() => onChange({ format: opt.value })}
                className="mt-0.5 accent-primary"
                aria-label={t(opt.labelKey)}
              />
              <div>
                <p className="text-sm font-medium leading-tight">{t(opt.labelKey)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t(opt.descriptionKey)}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Team ──────────────────────────────────────────────────────────

function StepTeam({
  state,
  agents,
  onChange,
}: {
  readonly state: WizardState
  readonly agents: readonly DiscussionAgent[]
  readonly onChange: (patch: Partial<WizardState>) => void
}) {
  const { t } = useTranslation('discussions')
  const [facilitators, setFacilitators] = useState<DiscussionAgent[]>([])
  const [showCreateFacilitator, setShowCreateFacilitator] = useState(false)
  const [newFacName, setNewFacName] = useState('')
  const [newFacDesc, setNewFacDesc] = useState('')
  const [creatingFac, setCreatingFac] = useState(false)

  useEffect(() => {
    apiGet<DiscussionAgent[]>('/api/agents?facilitator=true')
      .then(setFacilitators)
      .catch(() => {})
  }, [])

  async function handleCreateFacilitator(e: React.FormEvent) {
    e.preventDefault()
    if (!newFacName.trim()) return
    setCreatingFac(true)
    try {
      const created = await apiPost<DiscussionAgent>('/api/agents', {
        name: newFacName.trim(),
        description: newFacDesc.trim() || undefined,
        persona: `You are ${newFacName.trim()}, a skilled discussion facilitator. You guide discussions, ensure all participants are heard, synthesize viewpoints, and keep conversations productive and focused.`,
        purpose: 'general',
        model: 'sonnet',
        isFacilitator: true,
        scope: [],
        allowedTools: [],
      })
      setFacilitators((prev) => [...prev, created])
      onChange({ facilitatorId: created.id })
      setShowCreateFacilitator(false)
      setNewFacName('')
      setNewFacDesc('')
    } catch {
      // silent
    } finally {
      setCreatingFac(false)
    }
  }

  function handleFacilitatorChange(agentId: string) {
    // Remove the facilitator from participants list to avoid duplicates
    const filteredParticipants = state.participants.filter((p) => p.agentId !== agentId)
    onChange({ facilitatorId: agentId, participants: filteredParticipants })
  }

  function handleAddParticipant() {
    // Pick the first available agent not already in participants or facilitator
    const usedIds = new Set([
      state.facilitatorId,
      ...state.participants.map((p) => p.agentId),
    ])
    const available = agents.find((a) => !usedIds.has(a.id))
    if (!available) return

    onChange({
      participants: [
        ...state.participants,
        { agentId: available.id, role: 'participant' },
      ],
    })
  }

  function handleRemoveParticipant(index: number) {
    onChange({
      participants: state.participants.filter((_, i) => i !== index),
    })
  }

  function handleParticipantAgentChange(index: number, agentId: string) {
    onChange({
      participants: state.participants.map((p, i) =>
        i === index ? { ...p, agentId } : p,
      ),
    })
  }

  function handleParticipantRoleChange(index: number, role: ParticipantRole) {
    onChange({
      participants: state.participants.map((p, i) =>
        i === index ? { ...p, role } : p,
      ),
    })
  }

  const usedAgentIds = new Set([
    state.facilitatorId,
    ...state.participants.map((p) => p.agentId),
  ])

  const canAddMore = agents.some((a) => !usedAgentIds.has(a.id))

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-medium text-muted-foreground">{t('wizard.team.heading')}</p>

      {/* Facilitator */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="facilitator-select" className="text-sm font-medium">
          {t('wizard.team.facilitatorLabel')}
        </label>
        <p className="text-xs text-muted-foreground">
          {t('wizard.team.facilitatorHint')}
        </p>
        <div className="flex gap-2">
          <select
            id="facilitator-select"
            value={state.facilitatorId}
            onChange={(e) => handleFacilitatorChange(e.target.value)}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            aria-required
          >
            <option value="">{t('wizard.team.selectPlaceholder')}</option>
            {facilitators.length > 0 && (
              <optgroup label={t('wizard.team.groupFacilitators')}>
                {facilitators.map((agent) => (
                  <option
                    key={agent.id}
                    value={agent.id}
                    disabled={state.participants.some((p) => p.agentId === agent.id)}
                  >
                    {agent.name}
                    {agent.model ? ` (${agent.model})` : ''}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label={t('wizard.team.groupAllAssistants')}>
              {agents.filter((a) => !facilitators.some((f) => f.id === a.id)).map((agent) => (
                <option
                  key={agent.id}
                  value={agent.id}
                  disabled={state.participants.some((p) => p.agentId === agent.id)}
                >
                  {agent.name}
                  {agent.model ? ` (${agent.model})` : ''}
                </option>
              ))}
            </optgroup>
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1 text-xs"
            onClick={() => setShowCreateFacilitator(!showCreateFacilitator)}
          >
            <UserRoundCog className="h-3.5 w-3.5" />
            {t('wizard.team.newButton')}
          </Button>
        </div>

        {/* Inline facilitator creation form */}
        {showCreateFacilitator && (
          <form onSubmit={handleCreateFacilitator} className="mt-2 flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
            <input
              type="text"
              placeholder={t('wizard.team.createNamePlaceholder')}
              value={newFacName}
              onChange={(e) => setNewFacName(e.target.value)}
              className="h-8 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <input
              type="text"
              placeholder={t('wizard.team.createDescPlaceholder')}
              value={newFacDesc}
              onChange={(e) => setNewFacDesc(e.target.value)}
              className="h-8 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setShowCreateFacilitator(false)}
                disabled={creatingFac}
              >
                {t('common:action.cancel')}
              </Button>
              <Button type="submit" size="sm" className="text-xs" disabled={creatingFac || !newFacName.trim()}>
                {creatingFac ? t('wizard.team.creating') : t('wizard.team.createSubmit')}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Participants */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t('wizard.team.participantsLabel')}</span>
          <Badge variant="secondary" className="text-[10px]">
            {state.participants.length}
          </Badge>
        </div>

        {state.participants.length === 0 && (
          <p className="rounded-md border border-dashed border-border px-3 py-2.5 text-center text-xs text-muted-foreground">
            {t('wizard.team.participantsEmpty')}
          </p>
        )}

        <div className="flex flex-col gap-2" role="list" aria-label={t('wizard.team.participantsLabel')}>
          {state.participants.map((participant, index) => {
            return (
              <div
                key={index}
                role="listitem"
                className="flex items-center gap-2 rounded-md border border-border bg-card p-2"
              >
                {/* Agent avatar stub */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" aria-hidden />
                </div>

                {/* Agent selector */}
                <select
                  value={participant.agentId}
                  onChange={(e) => handleParticipantAgentChange(index, e.target.value)}
                  className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  aria-label={t('wizard.team.participantAgentLabel', { index: index + 1 })}
                >
                  {agents.map((agent) => (
                    <option
                      key={agent.id}
                      value={agent.id}
                      disabled={
                        usedAgentIds.has(agent.id) && agent.id !== participant.agentId
                      }
                    >
                      {agent.name}
                    </option>
                  ))}
                </select>

                {/* Role selector with tooltip */}
                <div className="flex items-center gap-1">
                  <select
                    value={participant.role}
                    onChange={(e) =>
                      handleParticipantRoleChange(index, e.target.value as ParticipantRole)
                    }
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label={t('wizard.team.participantRoleLabel', { index: index + 1 })}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.labelKey)}
                      </option>
                    ))}
                  </select>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                        aria-label={t('wizard.team.roleDescriptionLabel')}
                      >
                        <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs">
                      {(() => {
                        const tooltipKey = ROLE_OPTIONS.find((r) => r.value === participant.role)?.tooltipKey
                        return tooltipKey ? t(tooltipKey) : null
                      })()}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Remove */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveParticipant(index)}
                  aria-label={t('wizard.team.removeParticipant', { index: index + 1 })}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            )
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 gap-1.5 text-xs"
          onClick={handleAddParticipant}
          disabled={!canAddMore}
          aria-label={t('wizard.team.addParticipant')}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {t('wizard.team.addParticipant')}
        </Button>
      </div>
    </div>
  )
}

// ─── Step 3: Settings ──────────────────────────────────────────────────────

function StepSettings({
  state,
  onChange,
}: {
  readonly state: WizardState
  readonly agents: readonly DiscussionAgent[]
  readonly onChange: (patch: Partial<WizardState>) => void
}) {
  const { t } = useTranslation('discussions')
  const participantCount = state.participants.length
  const rounds = state.roundMode === 'fixed' ? state.fixedRounds : 4 // midpoint estimate for 'auto'

  const { estimatedTotalCost } = recommendDiscussionModels(participantCount)

  const costMin = (estimatedTotalCost.min * rounds).toFixed(2)
  const costMax = (estimatedTotalCost.max * rounds).toFixed(2)

  // Rough time: ~30s per turn, participantCount turns per round + 1 moderator
  const turnsPerRound = participantCount + 1
  const totalTurns = turnsPerRound * rounds
  const estimatedSeconds = totalTurns * 30
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60)

  return (
    <div className="flex flex-col gap-5">
      {/* Rounds */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t('wizard.settings.roundsLabel')}</span>

        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
            state.roundMode === 'auto'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-muted/50',
          )}
        >
          <input
            type="radio"
            name="round-mode"
            value="auto"
            checked={state.roundMode === 'auto'}
            onChange={() => onChange({ roundMode: 'auto' })}
            className="mt-0.5 accent-primary"
          />
          <div>
            <p className="text-sm font-medium">{t('wizard.settings.autoLabel')}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('wizard.settings.autoHint')}
            </p>
          </div>
        </label>

        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
            state.roundMode === 'fixed'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-muted/50',
          )}
        >
          <input
            type="radio"
            name="round-mode"
            value="fixed"
            checked={state.roundMode === 'fixed'}
            onChange={() => onChange({ roundMode: 'fixed' })}
            className="mt-0.5 accent-primary"
          />
          <div className="flex flex-1 items-center gap-3">
            <div>
              <p className="text-sm font-medium">{t('wizard.settings.fixedLabel')}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('wizard.settings.fixedHint')}
              </p>
            </div>
            {state.roundMode === 'fixed' && (
              <input
                type="number"
                min={1}
                max={20}
                value={state.fixedRounds}
                onChange={(e) =>
                  onChange({ fixedRounds: Math.max(1, Math.min(20, Number(e.target.value))) })
                }
                className="ml-auto w-16 rounded-md border border-border bg-background px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={t('wizard.settings.roundsInputLabel')}
              />
            )}
          </div>
        </label>
      </div>

      {/* Estimates */}
      {participantCount > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('wizard.settings.estimatesTitle')}
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('wizard.settings.estimatedCost')}</span>
              <span className="font-medium tabular-nums">
                {t('wizard.settings.costRange', { min: costMin, max: costMax })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('wizard.settings.estimatedTime')}</span>
              <span className="font-medium tabular-nums">{t('wizard.settings.timeValue', { minutes: estimatedMinutes })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('wizard.settings.participants')}</span>
              <span className="font-medium tabular-nums">{participantCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('wizard.settings.rounds')}</span>
              <span className="font-medium tabular-nums">
                {state.roundMode === 'auto' ? t('wizard.settings.auto') : state.fixedRounds}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">
            {t('wizard.settings.estimatesNote')}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Validation errors ─────────────────────────────────────────────────────

function ValidationErrors({ errors }: { readonly errors: readonly string[] }) {
  const { t } = useTranslation('discussions')
  if (errors.length === 0) return null
  return (
    <ul className="flex flex-col gap-1" role="alert" aria-live="assertive">
      {errors.map((err) => (
        <li key={err} className="text-xs text-destructive">
          {t(err)}
        </li>
      ))}
    </ul>
  )
}

// ─── DiscussionWizard ──────────────────────────────────────────────────────

export function DiscussionWizard({
  open,
  onOpenChange,
  agents,
  onCreate,
}: DiscussionWizardProps) {
  const { t } = useTranslation('discussions')
  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [validationErrors, setValidationErrors] = useState<readonly string[]>([])

  const TOTAL_STEPS = 3

  function handleChange(patch: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...patch }))
    // Clear validation errors on change
    setValidationErrors([])
  }

  function handleNext() {
    const result = validateStep(step, state)
    if (!result.valid) {
      setValidationErrors(result.errors)
      return
    }
    setValidationErrors([])
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }

  function handleBack() {
    setValidationErrors([])
    setStep((prev) => Math.max(prev - 1, 1))
  }

  function handleCreate() {
    const result = validateStep(step, state)
    if (!result.valid) {
      setValidationErrors(result.errors)
      return
    }

    const config: CreateDiscussionInput = {
      name: state.topic.slice(0, 60),
      topic: state.topic,
      format: state.format,
      moderatorId: state.facilitatorId,
      maxRounds: state.roundMode === 'fixed' ? state.fixedRounds : undefined,
      participants: state.participants,
    }

    onCreate(config)
    handleClose()
  }

  function handleClose() {
    onOpenChange(false)
    // Defer reset to allow animation to complete
    setTimeout(() => {
      setStep(1)
      setState(INITIAL_STATE)
      setValidationErrors([])
    }, 300)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) handleClose()
    else onOpenChange(true)
  }

  const STEP_TITLES: Record<number, string> = {
    1: t('wizard.title.topic'),
    2: t('wizard.title.team'),
    3: t('wizard.title.settings'),
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] max-w-[520px] flex-col gap-0 p-0"
        aria-describedby="wizard-description"
      >
        {/* Header */}
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">{STEP_TITLES[step]}</DialogTitle>
            <StepIndicator current={step} total={TOTAL_STEPS} />
          </div>
          <DialogDescription id="wizard-description" className="sr-only">
            {t('wizard.description', { total: TOTAL_STEPS })}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && <StepTopic state={state} onChange={handleChange} />}
          {step === 2 && (
            <StepTeam state={state} agents={agents} onChange={handleChange} />
          )}
          {step === 3 && (
            <StepSettings state={state} agents={agents} onChange={handleChange} />
          )}
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="border-t border-border px-6 py-3">
            <ValidationErrors errors={validationErrors} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleBack}
            disabled={step === 1}
            aria-label={t('wizard.footer.backLabel')}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            {t('wizard.footer.back')}
          </Button>

          {step < TOTAL_STEPS ? (
            <Button
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleNext}
              aria-label={t('wizard.footer.nextLabel')}
            >
              {t('wizard.footer.next')}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 bg-green-600 text-xs text-white hover:bg-green-700 focus-visible:ring-green-500"
              onClick={handleCreate}
              aria-label={t('wizard.footer.startLabel')}
            >
              {t('wizard.footer.start')}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
