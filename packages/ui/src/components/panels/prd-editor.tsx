'use client'

import { useState, useId } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  AlertCircle,
  DollarSign,
  PlayCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StoryStatus = 'pending' | 'in_progress' | 'passed' | 'failed'

export interface Story {
  readonly id: string
  readonly title: string
  readonly acceptanceCriteria: string
  readonly status: StoryStatus
  readonly priority: number
}

export interface PrdData {
  readonly title: string
  readonly stories: readonly Story[]
}

export interface PrdEditorProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly initial?: PrdData
  readonly estimatedCostPerStory?: number
  readonly onStartPipeline: (prd: PrdData) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  StoryStatus,
  { labelKey: string; badgeClass: string }
> = {
  pending: {
    labelKey: 'prd.status.pending',
    badgeClass: 'border-muted-foreground/30 bg-muted text-muted-foreground',
  },
  in_progress: {
    labelKey: 'prd.status.inProgress',
    badgeClass: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  passed: {
    labelKey: 'prd.status.passed',
    badgeClass: 'border-green-500/30 bg-green-500/10 text-green-400',
  },
  failed: {
    labelKey: 'prd.status.failed',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
}

const STATUS_CYCLE: Record<StoryStatus, StoryStatus> = {
  pending: 'in_progress',
  in_progress: 'passed',
  passed: 'failed',
  failed: 'pending',
}

function blankStory(priority: number): Story {
  return {
    id: crypto.randomUUID(),
    title: '',
    acceptanceCriteria: '',
    status: 'pending',
    priority,
  }
}

function blankPrd(): PrdData {
  return {
    title: '',
    stories: [blankStory(1)],
  }
}

// ---------------------------------------------------------------------------
// Story row
// ---------------------------------------------------------------------------

interface StoryRowProps {
  readonly story: Story
  readonly isDragging: boolean
  readonly onUpdate: (updated: Story) => void
  readonly onRemove: () => void
  readonly onDragStart: () => void
  readonly onDragOver: (e: React.DragEvent) => void
  readonly onDragEnd: () => void
}

function StoryRow({
  story,
  isDragging,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}: StoryRowProps) {
  const { t } = useTranslation('panelsMisc')
  const [expanded, setExpanded] = useState(false)
  const titleId = useId()
  const acId = useId()

  const cfg = STATUS_CONFIG[story.status]
  const statusLabel = t(cfg.labelKey)

  function cycleStatus() {
    onUpdate({ ...story, status: STATUS_CYCLE[story.status] })
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-3 transition-opacity',
        isDragging && 'opacity-40',
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        {/* Priority badge */}
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
          aria-label={t('prd.stories.priorityLabel', { priority: story.priority })}
        >
          {story.priority}
        </span>

        {/* Drag handle */}
        <GripVertical
          className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/40 active:cursor-grabbing"
          aria-hidden
        />

        {/* Title input */}
        <Input
          id={titleId}
          value={story.title}
          onChange={(e) => onUpdate({ ...story, title: e.target.value })}
          placeholder={t('prd.stories.rowTitlePlaceholder')}
          className="h-7 flex-1 text-sm"
          aria-label={t('prd.stories.rowTitleLabel')}
        />

        {/* Status badge — clickable to cycle */}
        <button
          type="button"
          onClick={cycleStatus}
          aria-label={t('prd.stories.statusButtonLabel', { status: statusLabel })}
          className={cn(
            'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80',
            cfg.badgeClass,
          )}
        >
          {statusLabel}
        </button>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          aria-label={expanded ? t('prd.stories.collapse') : t('prd.stories.expand')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-150',
              expanded && 'rotate-180',
            )}
          />
        </button>

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('prd.stories.remove')}
          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded: acceptance criteria */}
      {expanded && (
        <div className="flex flex-col gap-1.5 pl-9">
          <label
            htmlFor={acId}
            className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {t('prd.stories.acceptanceLabel')}
          </label>
          <Textarea
            id={acId}
            value={story.acceptanceCriteria}
            onChange={(e) =>
              onUpdate({ ...story, acceptanceCriteria: e.target.value })
            }
            placeholder={t('prd.stories.acceptancePlaceholder')}
            className="resize-none text-xs"
            rows={3}
          />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

interface StoryProgressProps {
  readonly stories: readonly Story[]
}

function StoryProgress({ stories }: StoryProgressProps) {
  const { t } = useTranslation('panelsMisc')
  if (stories.length === 0) return null

  const passed = stories.filter((s) => s.status === 'passed').length
  const failed = stories.filter((s) => s.status === 'failed').length
  const inProgress = stories.filter((s) => s.status === 'in_progress').length
  const total = stories.length

  const passedPct = (passed / total) * 100
  const failedPct = (failed / total) * 100
  const inProgressPct = (inProgress / total) * 100

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {t('prd.progress.passed', { passed, total })}
        </span>
        {failed > 0 && (
          <span className="text-destructive">{t('prd.progress.failed', { count: failed })}</span>
        )}
      </div>
      <div
        className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={passed}
        aria-valuemax={total}
        aria-label={t('prd.progress.barLabel', { passed, total })}
      >
        <div
          className="bg-green-500 transition-all duration-300"
          style={{ width: `${passedPct}%` }}
        />
        <div
          className="bg-blue-500 transition-all duration-300"
          style={{ width: `${inProgressPct}%` }}
        />
        <div
          className="bg-destructive transition-all duration-300"
          style={{ width: `${failedPct}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PrdEditor({
  open,
  onOpenChange,
  initial,
  estimatedCostPerStory = 0.02,
  onStartPipeline,
}: PrdEditorProps) {
  const { t } = useTranslation('panelsMisc')
  const [prd, setPrd] = useState<PrdData>(initial ?? blankPrd())
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Reset when dialog opens
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setPrd(initial ?? blankPrd())
      setValidationError(null)
    }
  }

  function updateTitle(title: string) {
    setPrd((prev) => ({ ...prev, title }))
  }

  function updateStory(id: string, updated: Story) {
    setPrd((prev) => ({
      ...prev,
      stories: prev.stories.map((s) => (s.id === id ? updated : s)),
    }))
  }

  function addStory() {
    setPrd((prev) => ({
      ...prev,
      stories: [...prev.stories, blankStory(prev.stories.length + 1)],
    }))
    setValidationError(null)
  }

  function removeStory(id: string) {
    setPrd((prev) => ({
      ...prev,
      stories: prev.stories
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, priority: i + 1 })),
    }))
  }

  // Drag to reorder
  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, overIndex: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === overIndex) return

    const reordered = [...prd.stories]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(overIndex, 0, moved)

    const withPriority = reordered.map((s, i) => ({ ...s, priority: i + 1 }))
    setPrd((prev) => ({ ...prev, stories: withPriority }))
    setDragIndex(overIndex)
  }

  function handleDragEnd() {
    setDragIndex(null)
  }

  function handleStartPipeline() {
    if (prd.stories.length === 0) {
      setValidationError(t('prd.validation.noStories'))
      return
    }
    const emptyTitles = prd.stories.filter((s) => !s.title.trim())
    if (emptyTitles.length > 0) {
      setValidationError(t('prd.validation.emptyTitles', { count: emptyTitles.length }))
      return
    }
    setValidationError(null)
    onStartPipeline(prd)
    onOpenChange(false)
  }

  const estimatedCost = prd.stories.length * estimatedCostPerStory

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="px-6 pb-3 pt-5">
          <DialogTitle>{t('prd.dialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4">
          {/* PRD title */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="prd-title"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              {t('prd.field.titleLabel')}
            </label>
            <Input
              id="prd-title"
              value={prd.title}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder={t('prd.field.titlePlaceholder')}
              className="text-sm"
              maxLength={120}
            />
          </div>

          <Separator />

          {/* Stories */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('prd.stories.heading', { count: prd.stories.length })}
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs"
                onClick={addStory}
              >
                <Plus className="h-3.5 w-3.5" />
                {t('prd.stories.add')}
              </Button>
            </div>

            {prd.stories.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-8 text-center">
                <p className="text-sm text-muted-foreground">{t('prd.stories.empty')}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={addStory}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('prd.stories.addFirst')}
                </Button>
              </div>
            ) : (
              <div
                className="flex flex-col gap-2"
                role="list"
                aria-label={t('prd.stories.listLabel')}
              >
                {prd.stories.map((story, index) => (
                  <div key={story.id} role="listitem">
                    <StoryRow
                      story={story}
                      isDragging={dragIndex === index}
                      onUpdate={(updated) => updateStory(story.id, updated)}
                      onRemove={() => removeStory(story.id)}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Progress */}
            <StoryProgress stories={prd.stories} />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t px-6 py-4">
          {/* Validation error */}
          {validationError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
              <p className="text-xs text-destructive">{validationError}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            {/* Cost estimate */}
            <div className="mr-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span>
                {t('prd.cost.label')}{' '}
                <span className="font-medium text-foreground">
                  {t('prd.cost.value', { amount: estimatedCost.toFixed(3) })}
                </span>
              </span>
            </div>

            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common:action.cancel')}
            </Button>
            <Button
              onClick={handleStartPipeline}
              className="gap-2"
              disabled={prd.stories.length === 0}
            >
              <PlayCircle className="h-4 w-4" />
              {t('prd.start')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
