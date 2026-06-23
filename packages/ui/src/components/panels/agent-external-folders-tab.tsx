'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GripVertical, Trash2, Plus, FolderOpen, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FolderRow {
  readonly externalFolderId: string
  readonly name: string
  readonly containerPath: string
  readonly readOnly: boolean
  readonly priority: number
  readonly enabled: boolean
}

export interface AgentExternalFoldersTabProps {
  readonly agentId: string
  readonly folders: readonly FolderRow[]
  readonly onToggle: (folderId: string, enabled: boolean) => void
  readonly onRemove: (folderId: string) => void
  readonly onReorder: (folders: ReadonlyArray<{ externalFolderId: string; priority: number }>) => void
  readonly onOpenManager: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AgentExternalFoldersTab({
  agentId: _agentId,
  folders,
  onToggle,
  onRemove,
  onReorder,
  onOpenManager,
}: AgentExternalFoldersTabProps) {
  const { t } = useTranslation('agentDrawer')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [localFolders, setLocalFolders] = useState<readonly FolderRow[]>(folders)

  // Sync local state when props change (unless mid-drag)
  if (folders !== localFolders && dragIndex === null) {
    setLocalFolders(folders)
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, overIndex: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === overIndex) return

    const reordered = [...localFolders]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(overIndex, 0, moved)

    const withPriority: FolderRow[] = reordered.map((f, i) => ({ ...f, priority: i + 1 }))
    setLocalFolders(withPriority)
    setDragIndex(overIndex)
  }

  function handleDragEnd() {
    setDragIndex(null)
    onReorder(
      localFolders.map((f) => ({ externalFolderId: f.externalFolderId, priority: f.priority })),
    )
  }

  if (localFolders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FolderOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{t('folders.emptyTitle')}</p>
          <p className="text-xs text-muted-foreground">
            {t('folders.emptyDescription')}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onOpenManager} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {t('folders.attachFolder')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-1" role="list" aria-label={t('folders.listAria')}>
        {localFolders.map((folder, index) => (
          <div
            key={folder.externalFolderId}
            role="listitem"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'flex items-center gap-2 rounded-lg border bg-card p-3 transition-opacity',
              dragIndex === index && 'opacity-50',
            )}
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
              aria-label={t('folders.priorityAria', { priority: folder.priority })}
            >
              {folder.priority}
            </span>

            <GripVertical
              className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50 active:cursor-grabbing"
              aria-hidden
            />

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted" aria-hidden>
              <FolderOpen className="h-4 w-4 text-blue-400" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium leading-none">{folder.name}</p>
                {folder.readOnly && (
                  <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1 py-0.5 text-[9px] text-amber-400">
                    <Lock className="h-2 w-2" /> {t('folders.readOnly')}
                  </span>
                )}
              </div>
              <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                {folder.containerPath}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={folder.enabled}
              aria-label={
                folder.enabled
                  ? t('folders.disableAria', { name: folder.name })
                  : t('folders.enableAria', { name: folder.name })
              }
              onClick={() => onToggle(folder.externalFolderId, !folder.enabled)}
              className={cn(
                'relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                folder.enabled ? 'bg-primary' : 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                  folder.enabled ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>

            <button
              type="button"
              onClick={() => onRemove(folder.externalFolderId)}
              aria-label={t('folders.removeAria', { name: folder.name })}
              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onOpenManager}
        className="self-start gap-1.5"
        aria-label={t('folders.attachFolderAria')}
      >
        <Plus className="h-3.5 w-3.5" />
        {t('folders.attachFolder')}
      </Button>
    </div>
  )
}
