'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Clock,
  Play,
  Pause,
  Trash2,
  Plus,
  Loader2,
  Zap,
  Bot,
  Workflow,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import { formatDateTime } from '@/lib/format'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScheduledTask {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly type: 'workflow' | 'agent'
  readonly targetId: string
  readonly message: string
  readonly schedule: string
  readonly timezone: string
  readonly enabled: boolean
  readonly directorEnabled: boolean
  readonly lastRunAt: string | null
  readonly nextRunAt: string | null
  readonly lastStatus: string | null
  readonly createdAt: string
}

// ─── Schedule presets ───────────────────────────────────────────────────────

const PRESETS: readonly { labelKey: string; cron: string }[] = [
  { labelKey: 'preset.everyHour', cron: '0 * * * *' },
  { labelKey: 'preset.every2Hours', cron: '0 */2 * * *' },
  { labelKey: 'preset.everyDay9am', cron: '0 9 * * *' },
  { labelKey: 'preset.weekdays9am', cron: '0 9 * * 1-5' },
  { labelKey: 'preset.everyMonday9am', cron: '0 9 * * 1' },
]

// ─── Props ──────────────────────────────────────────────────────────────────

export interface SchedulesPanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SchedulesPanel({ open, onOpenChange }: SchedulesPanelProps) {
  const { t, i18n } = useTranslation('scheduling')
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  // Fetch tasks when panel opens
  useEffect(() => {
    if (!open) return
    setLoading(true)
    apiGet<ScheduledTask[]>('/api/schedules')
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [open])

  const handleToggle = useCallback(async (task: ScheduledTask) => {
    try {
      const updated = await apiPatch<ScheduledTask>(`/api/schedules/${task.id}`, {
        enabled: !task.enabled,
      })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    } catch { /* best-effort */ }
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiDelete(`/api/schedules/${id}`)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch { /* best-effort */ }
  }, [])

  const handleRunNow = useCallback(async (id: string) => {
    try {
      await apiPost(`/api/schedules/${id}/run-now`, {})
      // Refresh to get updated lastRunAt
      const updated = await apiGet<ScheduledTask[]>('/api/schedules')
      setTasks(updated)
    } catch { /* best-effort */ }
  }, [])

  const handleCreated = useCallback((task: ScheduledTask) => {
    setTasks((prev) => [task, ...prev])
    setCreateOpen(false)
  }, [])

  const formatDate = (date: string | null) => {
    if (!date) return t('task.noValue')
    return formatDateTime(date, i18n.language, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusColor = (status: string | null) => {
    if (status === 'success') return 'text-green-400'
    if (status === 'error') return 'text-red-400'
    if (status === 'running') return 'text-blue-400'
    return 'text-muted-foreground'
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" aria-hidden />
            {t('panel.title')}
          </SheetTitle>

          <div className="mt-4 flex flex-col gap-3">
            <Button size="sm" className="gap-1.5 self-start" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {t('panel.newSchedule')}
            </Button>

            <Separator />

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && tasks.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t('panel.empty')}
              </p>
            )}

            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border bg-card p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {task.type === 'agent' ? (
                        <Bot className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      ) : (
                        <Workflow className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      )}
                      <span className="text-sm font-medium">{task.name}</span>
                      <Badge
                        variant={task.enabled ? 'default' : 'secondary'}
                        className="text-[9px]"
                      >
                        {task.enabled ? t('task.active') : t('task.paused')}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      <code className="rounded bg-muted px-1">{task.schedule}</code>
                      {' '}({task.timezone})
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleRunNow(task.id)}
                      aria-label={t('task.action.runNow')}
                      title={t('task.action.runNow')}
                    >
                      <Zap className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleToggle(task)}
                      aria-label={task.enabled ? t('task.action.pause') : t('task.action.resume')}
                      title={task.enabled ? t('task.action.pause') : t('task.action.resume')}
                    >
                      {task.enabled ? (
                        <Pause className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <Play className="h-3.5 w-3.5" aria-hidden />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(task.id)}
                      aria-label={t('task.action.delete')}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </div>
                </div>

                <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
                  <span>
                    {t('task.last', { value: formatDate(task.lastRunAt) })}
                    {task.lastStatus && (
                      <span className={` ml-1 ${statusColor(task.lastStatus)}`}>
                        {t('task.lastStatus', { status: task.lastStatus })}
                      </span>
                    )}
                  </span>
                  <span>{t('task.next', { value: formatDate(task.nextRunAt) })}</span>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <CreateScheduleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </>
  )
}

// ─── Create Schedule Dialog ─────────────────────────────────────────────────

interface CreateScheduleDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onCreated: (task: ScheduledTask) => void
}

interface AgentOption {
  readonly id: string
  readonly name: string
}

interface WorkspaceOption {
  readonly id: string
  readonly name: string
  readonly workingDirectory?: string | null
}

function CreateScheduleDialog({ open, onOpenChange, onCreated }: CreateScheduleDialogProps) {
  const { t } = useTranslation('scheduling')
  const [name, setName] = useState('')
  const [type, setType] = useState<'agent' | 'workflow'>('agent')
  const [targetId, setTargetId] = useState('')
  const [message, setMessage] = useState('')
  const [schedule, setSchedule] = useState('0 9 * * *')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [saving, setSaving] = useState(false)

  // Selectable targets — agents and saved workflows — fetched when the dialog opens.
  const [agents, setAgents] = useState<readonly SearchableSelectOption[]>([])
  const [workflows, setWorkflows] = useState<readonly SearchableSelectOption[]>([])
  const [loadingTargets, setLoadingTargets] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoadingTargets(true)
    Promise.all([
      apiGet<AgentOption[]>('/api/agents').catch(() => [] as AgentOption[]),
      // Workflow targets are workspaces — the scheduler runs the workspace's
      // latest canvas as a chain.
      apiGet<WorkspaceOption[]>('/api/workspaces').catch(() => [] as WorkspaceOption[]),
    ])
      .then(([agentList, workspaceList]) => {
        setAgents(
          agentList.map((a) => ({ value: a.id, label: a.name || a.id, description: a.id })),
        )
        setWorkflows(
          workspaceList.map((w) => ({
            value: w.id,
            label: w.name || w.id,
            description: w.workingDirectory || undefined,
          })),
        )
      })
      .finally(() => setLoadingTargets(false))
  }, [open])

  // Switching target type invalidates any previously chosen id.
  const handleTypeChange = (next: 'agent' | 'workflow') => {
    setType(next)
    setTargetId('')
  }

  const handleSubmit = async () => {
    if (!name.trim() || !targetId.trim()) return
    setSaving(true)
    try {
      const task = await apiPost<ScheduledTask>('/api/schedules', {
        name: name.trim(),
        type,
        targetId: targetId.trim(),
        message: message.trim(),
        schedule,
        timezone,
      })
      onCreated(task)
      // Reset form
      setName('')
      setTargetId('')
      setMessage('')
      setSchedule('0 9 * * *')
    } catch { /* best-effort */ }
    finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            placeholder={t('dialog.placeholder.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              variant={type === 'agent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeChange('agent')}
              className="flex-1 gap-1"
            >
              <Bot className="h-3.5 w-3.5" aria-hidden />
              {t('dialog.type.agent')}
            </Button>
            <Button
              variant={type === 'workflow' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeChange('workflow')}
              className="flex-1 gap-1"
            >
              <Workflow className="h-3.5 w-3.5" aria-hidden />
              {t('dialog.type.workflow')}
            </Button>
          </div>

          <SearchableSelect
            options={type === 'agent' ? agents : workflows}
            value={targetId}
            onChange={setTargetId}
            loading={loadingTargets}
            icon={type === 'agent' ? Bot : Workflow}
            placeholder={type === 'agent' ? t('dialog.select.agent') : t('dialog.select.workflow')}
            searchPlaceholder={t('dialog.select.searchPlaceholder')}
            emptyText={type === 'agent' ? t('dialog.select.emptyAgent') : t('dialog.select.emptyWorkflow')}
            ariaLabel={type === 'agent' ? t('dialog.select.agent') : t('dialog.select.workflow')}
          />

          <Textarea
            placeholder={t('dialog.placeholder.message')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[60px]"
          />

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t('dialog.scheduleLabel')}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.cron}
                  type="button"
                  onClick={() => setSchedule(preset.cron)}
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] transition-colors ${
                    schedule === preset.cron
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {t(preset.labelKey)}
                </button>
              ))}
            </div>
            <Input
              placeholder={t('dialog.placeholder.cron')}
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <Input
            placeholder={t('dialog.placeholder.timezone')}
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="text-xs"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:action.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !name.trim() || !targetId.trim()}
          >
            {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden /> : null}
            {t('dialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
