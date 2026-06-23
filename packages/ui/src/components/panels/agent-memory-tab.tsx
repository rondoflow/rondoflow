'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Save, Loader2, Brain, Pin, PinOff } from 'lucide-react'
import type { Agent } from '@rondoflow/shared'
import { Button } from '@/components/ui/button'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'

// ─── Types ──────────────────────────────────────────────────────────────────

type MemorySource = 'manual' | 'auto' | 'director'

interface Memory {
  readonly id: string
  readonly key: string
  readonly value: string
  readonly source?: MemorySource
  readonly pinned?: boolean
  readonly updatedAt?: string
}

interface AgentMemoryTabProps {
  readonly agentId: string
  readonly memoryEnabled?: boolean
  readonly onSave?: (updates: Partial<Agent>) => void
}

const SOURCE_STYLES: Record<MemorySource, string> = {
  manual: 'bg-primary/15 text-primary',
  auto: 'bg-purple-500/15 text-purple-400',
  director: 'bg-amber-500/15 text-amber-400',
}

const SOURCE_LABEL_KEY: Record<MemorySource, 'memory.source.manual' | 'memory.source.auto' | 'memory.source.director'> = {
  manual: 'memory.source.manual',
  auto: 'memory.source.auto',
  director: 'memory.source.director',
}

function SourceBadge({ source = 'manual' }: { readonly source?: MemorySource }) {
  const { t } = useTranslation('agentDrawer')
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${SOURCE_STYLES[source]}`}>
      {t(SOURCE_LABEL_KEY[source])}
    </span>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AgentMemoryTab({ agentId, memoryEnabled, onSave }: AgentMemoryTabProps) {
  const { t } = useTranslation('agentDrawer')
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const fetchMemories = useCallback(async () => {
    try {
      const data = await apiGet<Memory[]>(`/api/agents/${agentId}/memories`)
      setMemories(data)
    } catch {
      // best effort
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    void fetchMemories()
  }, [fetchMemories])

  const handleAdd = useCallback(async () => {
    if (!newKey.trim() || !newValue.trim()) return
    try {
      const memory = await apiPost<Memory>(`/api/agents/${agentId}/memories`, {
        key: newKey.trim(),
        value: newValue.trim(),
      })
      setMemories((prev) => [...prev.filter((m) => m.id !== memory.id), memory])
      setNewKey('')
      setNewValue('')
    } catch {
      // best effort
    }
  }, [agentId, newKey, newValue])

  const handleSave = useCallback(
    async (memoryId: string) => {
      if (!editValue.trim()) return
      try {
        const updated = await apiPatch<Memory>(`/api/agents/${agentId}/memories/${memoryId}`, {
          value: editValue.trim(),
        })
        setMemories((prev) => prev.map((m) => (m.id === memoryId ? updated : m)))
        setEditingId(null)
      } catch {
        // best effort
      }
    },
    [agentId, editValue],
  )

  const handlePin = useCallback(
    async (mem: Memory) => {
      try {
        const updated = await apiPatch<Memory>(`/api/agents/${agentId}/memories/${mem.id}/pin`, {
          pinned: !mem.pinned,
        })
        setMemories((prev) => prev.map((m) => (m.id === mem.id ? updated : m)))
      } catch {
        // best effort
      }
    },
    [agentId],
  )

  const handleDelete = useCallback(
    async (memoryId: string) => {
      try {
        await apiDelete(`/api/agents/${agentId}/memories/${memoryId}`)
        setMemories((prev) => prev.filter((m) => m.id !== memoryId))
      } catch {
        // best effort
      }
    },
    [agentId],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Brain className="h-4 w-4 text-purple-400" />
          {t('memory.title')}
        </div>
        {onSave && (
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={memoryEnabled ?? false}
              onChange={(e) => onSave({ memoryEnabled: e.target.checked })}
              className="h-3.5 w-3.5 accent-primary"
            />
            {t('memory.rememberAcrossSessions')}
          </label>
        )}
      </div>

      {!memoryEnabled && onSave && (
        <p className="rounded-md border border-dashed border-border/60 px-2 py-1.5 text-[10px] text-muted-foreground">
          {t('memory.disabledNote')}
        </p>
      )}

      {/* Memory entries */}
      <div className="flex flex-col gap-2">
        {memories.map((mem) => {
          const editable = !mem.source || mem.source === 'manual'
          return (
            <div key={mem.id} className="rounded-md border border-border p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <SourceBadge source={mem.source} />
                  <span className="truncate text-xs font-mono font-medium text-primary">{mem.key}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => void handlePin(mem)}
                    aria-label={mem.pinned ? t('memory.unpin') : t('memory.pin')}
                  >
                    {mem.pinned ? (
                      <Pin className="h-3 w-3 text-amber-400" />
                    ) : (
                      <PinOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                  {editable &&
                    (editingId === mem.id ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => void handleSave(mem.id)}
                        aria-label={t('common:action.save')}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setEditingId(mem.id)
                          setEditValue(mem.value)
                        }}
                        aria-label={t('common:action.edit')}
                      >
                        <Save className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => void handleDelete(mem.id)}
                    aria-label={t('common:action.delete')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {editable && editingId === mem.id ? (
                <textarea
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs"
                  rows={2}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                />
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{mem.value}</p>
              )}
              {!editable && (
                <span className="mt-1 block text-[10px] text-muted-foreground/60">{t('memory.autoCaptured')}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Add new */}
      <div className="rounded-md border border-dashed border-border p-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('memory.keyPlaceholder')}
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex h-7 w-1/3 rounded border border-border bg-background px-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <input
            type="text"
            placeholder={t('memory.valuePlaceholder')}
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
            aria-label={t('memory.addMemoryAria')}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
