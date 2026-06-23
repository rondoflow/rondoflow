'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FolderOpen,
  Plus,
  Trash2,
  RefreshCw,
  Lock,
  X,
  Check,
  Loader2,
  UserPlus,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiGet, apiPost } from '@/lib/api'
import { useExternalFolders } from '@/hooks/use-external-folders'

export interface ExternalFoldersPanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  /** When set, the panel is in attach mode — registering/picking attaches to this agent. */
  readonly agentId?: string
}

function suggestName(containerPath: string): string {
  const parts = containerPath.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? containerPath
}

export function ExternalFoldersPanel({ open, onOpenChange, agentId }: ExternalFoldersPanelProps) {
  const { t } = useTranslation('resources')
  const {
    folders,
    available,
    rootExists,
    loading,
    error,
    refresh,
    refreshAvailable,
    createFolder,
    deleteFolder,
  } = useExternalFolders()

  const attachMode = Boolean(agentId)

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [containerPath, setContainerPath] = useState('')
  const [description, setDescription] = useState('')
  const [readOnly, setReadOnly] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [attachedIds, setAttachedIds] = useState<Set<string>>(new Set())

  // Load the agent's currently-attached folders (attach mode only).
  const loadAttached = useCallback(async () => {
    if (!agentId) return
    try {
      const agent = await apiGet<{
        externalFolders?: ReadonlyArray<{ externalFolderId: string }>
      }>(`/api/agents/${agentId}`)
      setAttachedIds(new Set((agent.externalFolders ?? []).map((f) => f.externalFolderId)))
    } catch {
      setAttachedIds(new Set())
    }
  }, [agentId])

  // On open: refresh registry, scan mounts, and (attach mode) load attachments.
  useEffect(() => {
    if (!open) return
    void refresh()
    void refreshAvailable()
    void loadAttached()
  }, [open, refresh, refreshAvailable, loadAttached])

  function resetForm() {
    setName('')
    setContainerPath('')
    setDescription('')
    setReadOnly(false)
    setFormError(null)
    setAdding(false)
  }

  function pickAvailable(path: string) {
    if (!path) return
    setContainerPath(path)
    if (!name) setName(suggestName(path))
  }

  const attachToAgent = useCallback(
    async (folderId: string) => {
      if (!agentId || attachedIds.has(folderId)) return
      try {
        const agent = await apiGet<{
          externalFolders?: ReadonlyArray<{ externalFolderId: string; priority: number }>
        }>(`/api/agents/${agentId}`)
        const existing = agent.externalFolders ?? []
        if (existing.some((f) => f.externalFolderId === folderId)) {
          setAttachedIds((prev) => new Set(prev).add(folderId))
          return
        }
        const nextPriority = existing.reduce((max, f) => Math.max(max, f.priority), 0) + 1
        await apiPost(`/api/agents/${agentId}/external-folders/${folderId}`, {
          priority: nextPriority,
          enabled: true,
        })
        setAttachedIds((prev) => new Set(prev).add(folderId))
      } catch {
        // Best-effort — keep the registry usable even if attach fails.
      }
    },
    [agentId, attachedIds],
  )

  async function handleAdd() {
    setFormError(null)
    if (!name.trim() || !containerPath.trim()) {
      setFormError(t('externalFolders.error.required'))
      return
    }
    setSubmitting(true)
    try {
      const created = await createFolder({
        name: name.trim(),
        containerPath: containerPath.trim(),
        description: description.trim() || undefined,
        readOnly,
      })
      if (agentId) await attachToAgent(created.id)
      resetForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('externalFolders.error.registerFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // Directories that are mounted but not yet registered.
  const registeredPaths = new Set(folders.map((f) => f.containerPath))
  const unregistered = available.filter((a) => !registeredPaths.has(a.containerPath))
  const showEmptyState = !loading && folders.length === 0 && available.length === 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0" aria-label={t('externalFolders.ariaLabel')}>
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">{t('externalFolders.title')}</SheetTitle>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-muted-foreground"
              onClick={() => {
                void refresh()
                void refreshAvailable()
              }}
              aria-label={t('externalFolders.refresh')}
              title={t('externalFolders.refresh')}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <SheetDescription className="sr-only">
            {t('externalFolders.description')}
          </SheetDescription>
        </SheetHeader>

        {attachMode && (
          <div className="flex items-center gap-2 border-b bg-primary/5 px-5 py-2.5 text-xs text-muted-foreground">
            <UserPlus className="h-3.5 w-3.5 shrink-0 text-primary" />
            {t('externalFolders.attachNotice')}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {showEmptyState ? (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FolderOpen className="h-4 w-4" /> {t('externalFolders.empty.title')}
              </div>
              <p>
                {t('externalFolders.empty.intro')}
              </p>
              <ol className="ml-4 list-decimal space-y-1">
                <li>
                  {t('externalFolders.empty.step1Prefix')}{' '}
                  <code className="rounded bg-muted px-1">EXTERNAL_FOLDERS_HOST_PATH</code>{' '}
                  {t('externalFolders.empty.step1Mid')}{' '}
                  <code className="rounded bg-muted px-1">.env</code>{' '}
                  {t('externalFolders.empty.step1Suffix')}{' '}
                  <code className="rounded bg-muted px-1">/external</code>{' '}
                  {t('externalFolders.empty.step1End')}{' '}
                  <code className="rounded bg-muted px-1">docker-compose.yml</code>
                  {t('externalFolders.empty.step1Tail')}
                </li>
                <li>{t('externalFolders.empty.step2')}</li>
                <li>{t('externalFolders.empty.step3')}</li>
              </ol>
              {!rootExists && (
                <p className="text-amber-400">
                  {t('externalFolders.empty.rootMissing')}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {folders.map((folder) => {
                const attached = attachedIds.has(folder.id)
                return (
                  <div
                    key={folder.id}
                    className="flex items-start gap-2 rounded-lg border border-border bg-card p-3"
                  >
                    <FolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{folder.name}</span>
                        {folder.readOnly && (
                          <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">
                            <Lock className="h-2.5 w-2.5" /> {t('externalFolders.readOnlyBadge')}
                          </span>
                        )}
                      </div>
                      <span className="truncate font-mono text-[10px] text-muted-foreground">
                        {folder.containerPath}
                      </span>
                      {folder.description && (
                        <span className="truncate text-[11px] text-muted-foreground">
                          {folder.description}
                        </span>
                      )}
                    </div>
                    {attachMode ? (
                      <Button
                        size="sm"
                        variant={attached ? 'ghost' : 'secondary'}
                        className="h-7 shrink-0 px-2 text-xs"
                        disabled={attached}
                        onClick={() => void attachToAgent(folder.id)}
                      >
                        {attached ? (
                          <>
                            <Check className="mr-1 h-3 w-3" /> {t('externalFolders.added')}
                          </>
                        ) : (
                          <>
                            <Plus className="mr-1 h-3 w-3" /> {t('externalFolders.attach')}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => void deleteFolder(folder.id)}
                        aria-label={t('externalFolders.deleteAria', { name: folder.name })}
                        title={t('externalFolders.delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                )
              })}

              {/* Register-new */}
              {adding ? (
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
                  {unregistered.length > 0 && (
                    <select
                      className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                      value=""
                      onChange={(e) => pickAvailable(e.target.value)}
                    >
                      <option value="">{t('externalFolders.pickPlaceholder')}</option>
                      {unregistered.map((a) => (
                        <option key={a.containerPath} value={a.containerPath}>
                          {a.name} — {a.containerPath}
                        </option>
                      ))}
                    </select>
                  )}
                  <Input
                    value={containerPath}
                    onChange={(e) => setContainerPath(e.target.value)}
                    placeholder={t('externalFolders.placeholder.containerPath')}
                    className="font-mono text-xs"
                    aria-label={t('externalFolders.aria.containerPath')}
                  />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('externalFolders.placeholder.name')}
                    className="text-xs"
                    aria-label={t('externalFolders.aria.name')}
                  />
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('externalFolders.placeholder.description')}
                    className="text-xs"
                    aria-label={t('externalFolders.aria.description')}
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={readOnly}
                      onChange={(e) => setReadOnly(e.target.checked)}
                    />
                    {t('externalFolders.readOnlyLabelPrefix')} <code className="rounded bg-muted px-1">:ro</code>{t('externalFolders.readOnlyLabelSuffix')}
                  </label>
                  {formError && <p className="text-[11px] text-destructive">{formError}</p>}
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={resetForm}>
                      <X className="mr-1 h-3 w-3" /> {t('common:action.cancel')}
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={submitting}
                      onClick={() => void handleAdd()}
                    >
                      {submitting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}
                      {t('externalFolders.register')}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 justify-start gap-1.5 text-xs"
                  onClick={() => {
                    setAdding(true)
                    void refreshAvailable()
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> {t('externalFolders.registerFolder')}
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
