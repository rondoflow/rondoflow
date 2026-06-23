'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Brain, Loader2, Plus, Trash2, Save, Pin, PinOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import { formatDate } from '@/lib/format'

// ─── Types ──────────────────────────────────────────────────────────────────

type MemorySource = 'manual' | 'auto' | 'director'

interface WorkspaceMemory {
  readonly id: string
  readonly key: string
  readonly value: string
  readonly source?: MemorySource
  readonly pinned?: boolean
  readonly updatedAt?: string
}

interface MemoryPanelProps {
  readonly workspaceId: string | null
}

const SOURCE_STYLES: Record<MemorySource, string> = {
  manual: 'bg-primary/15 text-primary',
  auto: 'bg-purple-500/15 text-purple-400',
  director: 'bg-amber-500/15 text-amber-400',
}

function SourceBadge({ source = 'manual' }: { readonly source?: MemorySource }) {
  const { t } = useTranslation('resources')
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${SOURCE_STYLES[source]}`}>
      {t(`memory.source.${source}`)}
    </span>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MemoryPanel({ workspaceId }: MemoryPanelProps) {
  const { t } = useTranslation('resources')
  const [memories, setMemories] = useState<WorkspaceMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const base = workspaceId ? `/api/workspaces/${workspaceId}/memories` : null

  const fetchMemories = useCallback(async () => {
    if (!base) {
      setLoading(false)
      return
    }
    try {
      const data = await apiGet<WorkspaceMemory[]>(base)
      setMemories(data)
    } catch {
      // best effort
    } finally {
      setLoading(false)
    }
  }, [base])

  useEffect(() => {
    void fetchMemories()
  }, [fetchMemories])

  const handleAdd = useCallback(async () => {
    if (!base || !newKey.trim() || !newValue.trim()) return
    try {
      const mem = await apiPost<WorkspaceMemory>(base, { key: newKey.trim(), value: newValue.trim() })
      setMemories((prev) => [mem, ...prev.filter((m) => m.id !== mem.id)])
      setNewKey('')
      setNewValue('')
    } catch {
      // best effort
    }
  }, [base, newKey, newValue])

  const handleSave = useCallback(
    async (id: string) => {
      if (!base || !editValue.trim()) return
      try {
        const updated = await apiPatch<WorkspaceMemory>(`${base}/${id}`, { value: editValue.trim() })
        setMemories((prev) => prev.map((m) => (m.id === id ? updated : m)))
        setEditingId(null)
      } catch {
        // best effort
      }
    },
    [base, editValue],
  )

  const handlePin = useCallback(
    async (mem: WorkspaceMemory) => {
      if (!base) return
      try {
        const updated = await apiPatch<WorkspaceMemory>(`${base}/${mem.id}/pin`, { pinned: !mem.pinned })
        setMemories((prev) => prev.map((m) => (m.id === mem.id ? updated : m)))
      } catch {
        // best effort
      }
    },
    [base],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!base) return
      try {
        await apiDelete(`${base}/${id}`)
        setMemories((prev) => prev.filter((m) => m.id !== id))
      } catch {
        // best effort
      }
    },
    [base],
  )

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        {t('memory.selectWorkspace')}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Brain className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('memory.empty')}</p>
          <p className="text-xs text-muted-foreground/70">
            {t('memory.emptyHint')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {memories.map((mem) => (
            <MemoryEntry
              key={mem.id}
              memory={mem}
              editing={editingId === mem.id}
              editValue={editValue}
              onEditValueChange={setEditValue}
              onStartEdit={() => {
                setEditingId(mem.id)
                setEditValue(mem.value)
              }}
              onSave={() => void handleSave(mem.id)}
              onPin={() => void handlePin(mem)}
              onDelete={() => void handleDelete(mem.id)}
            />
          ))}
        </div>
      )}

      {/* Add new (manual workspace memory) */}
      <div className="rounded-md border border-dashed border-border p-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('memory.placeholder.key')}
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex h-7 w-1/3 rounded border border-border bg-background px-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <input
            type="text"
            placeholder={t('memory.placeholder.value')}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex h-7 flex-1 rounded border border-border bg-background px-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            disabled={!newKey.trim() || !newValue.trim()}
            onClick={() => void handleAdd()}
            aria-label={t('memory.addAria')}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Memory Entry (row) ───────────────────────────────────────────────────────

interface MemoryEntryProps {
  readonly memory: WorkspaceMemory
  readonly editing: boolean
  readonly editValue: string
  readonly onEditValueChange: (value: string) => void
  readonly onStartEdit: () => void
  readonly onSave: () => void
  readonly onPin: () => void
  readonly onDelete: () => void
}

function MemoryEntry({
  memory,
  editing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onSave,
  onPin,
  onDelete,
}: MemoryEntryProps) {
  const { t, i18n } = useTranslation('resources')
  const editable = !memory.source || memory.source === 'manual'

  return (
    <div className="rounded-md border border-border p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <SourceBadge source={memory.source} />
          <span className="truncate font-mono text-xs font-medium text-primary">{memory.key}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={onPin}
            aria-label={memory.pinned ? t('memory.unpin') : t('memory.pin')}
          >
            {memory.pinned ? (
              <Pin className="h-3 w-3 text-amber-400" />
            ) : (
              <PinOff className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
          {editable &&
            (editing ? (
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onSave} aria-label={t('common:action.save')}>
                <Save className="h-3 w-3" />
              </Button>
            ) : (
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onStartEdit} aria-label={t('common:action.edit')}>
                <Save className="h-3 w-3 text-muted-foreground" />
              </Button>
            ))}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-destructive"
            onClick={onDelete}
            aria-label={t('common:action.delete')}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {editable && editing ? (
        <textarea
          className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs"
          rows={2}
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          autoFocus
        />
      ) : (
        <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{memory.value}</p>
      )}
      <div className="mt-1 flex items-center justify-between">
        {!editable && <span className="text-[10px] text-muted-foreground/60">{t('memory.readOnly')}</span>}
        <span className="ml-auto text-[10px] text-muted-foreground/60">
          {memory.updatedAt
            ? formatDate(memory.updatedAt, i18n.language, { month: 'short', day: 'numeric' })
            : ''}
        </span>
      </div>
    </div>
  )
}
