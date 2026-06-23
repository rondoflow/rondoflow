'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BadgeCheck,
  Download,
  FilePlus2,
  FolderOpen,
  GitPullRequest,
  Info,
  Layers,
  MessageSquareText,
  PenLine,
  Pencil,
  Plus,
  Recycle,
  ScanSearch,
  Search,
  Swords,
  Tag,
  Telescope,
  TrendingUp,
  Upload,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FolderPicker } from '@/components/shared/folder-picker'
import { WorkspaceInfoDialog } from '@/components/shell/workspace-info-dialog'
import { WORKSPACE_PRESETS } from '@rondoflow/catalog'
import { BrowseMenu } from '@/components/shell/browse-menu'
import { TopBarLinks } from '@/components/shell/top-bar-links'
import { TopBarFavorites } from '@/components/shell/top-bar-favorites'
import { TierIndicator } from '@/components/shell/tier-indicator'
import { UserAvatar } from '@/components/shell/user-avatar'
import type { BrowseActions, FavoriteAgent } from '@/components/shell/nav-items'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Workspace {
  readonly id: string
  readonly name: string
}

export interface WorkspaceTabsProps {
  readonly workspaces: readonly Workspace[]
  readonly activeId: string
  readonly onSelect: (id: string) => void
  readonly onCreateWorkspace: (name: string, workingDirectory?: string, presetId?: string) => void
  readonly onRenameWorkspace?: (id: string, name: string) => void
  readonly onDeleteWorkspace?: (id: string) => void
  /** Export the active workspace's canvas as a shareable bundle file. */
  readonly onExportCanvas?: () => void
  /** Import a previously-exported bundle file as a new workspace. */
  readonly onImportCanvas?: (file: File) => void
  // ── Relocated left-sidebar controls (rendered in the brand + account clusters) ──
  readonly favorites?: readonly FavoriteAgent[]
  readonly onSelectFavorite?: (agentId: string) => void
  /** Click handlers for the Browse menu's browse panels. */
  readonly browse?: BrowseActions
  readonly onCommandPalette?: () => void
  readonly onSettingsClick?: () => void
  /** Open the admin Users panel (admin-only; UserAvatar hides it otherwise). */
  readonly onUsersClick?: () => void
  /** Restart the first-run onboarding from the user menu. */
  readonly onRestartOnboarding?: () => void
}

// ─── Preset icons ────────────────────────────────────────────────────────────

const PRESET_ICON_MAP: Record<string, LucideIcon> = {
  PenLine,
  Tag,
  Layers,
  ScanSearch,
  GitPullRequest,
  Recycle,
  Telescope,
  BadgeCheck,
  Swords,
  MessageSquareText,
  TrendingUp,
}

function resolvePresetIcon(name: string): LucideIcon {
  return PRESET_ICON_MAP[name] ?? Workflow
}

// ─── WorkspaceTabs ───────────────────────────────────────────────────────────

/**
 * VSCode-style workspace tab strip rendered at the top of the canvas area.
 * Each workspace is a tab: click to switch, double-click (or the pencil) to
 * rename inline, hover × to delete (confirmed; disabled on the last workspace).
 * The trailing "+" opens a dialog to create a new workspace. Replaces the old
 * dropdown switcher that lived in the sidebar.
 */
export function WorkspaceTabs({
  workspaces,
  activeId,
  onSelect,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
  onExportCanvas,
  onImportCanvas,
  favorites = [],
  onSelectFavorite,
  browse,
  onCommandPalette,
  onSettingsClick,
  onUsersClick,
  onRestartOnboarding,
}: WorkspaceTabsProps) {
  const { t } = useTranslation('shell')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null)
  const [infoTargetId, setInfoTargetId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFolder, setNewFolder] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [folderPickerOpen, setFolderPickerOpen] = useState(false)

  const renameInputRef = useRef<HTMLInputElement>(null)
  const activeTabRef = useRef<HTMLDivElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const isLastWorkspace = workspaces.length <= 1

  // Keep the active tab scrolled into view when it changes (overflow case).
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [activeId])

  // Focus + select the rename input when entering rename mode.
  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [renamingId])

  // ── Select ──
  function handleSelect(id: string) {
    if (renamingId) return
    onSelect(id)
  }

  // Roving-tabindex keyboard model for the tablist: arrows/Home/End move focus
  // (manual activation — Enter/Space switches, so arrowing doesn't trigger a
  // workspace reload on every keypress).
  function handleTabKeyDown(e: React.KeyboardEvent<HTMLDivElement>, index: number, id: string) {
    if (renamingId) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(id)
      return
    }
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const tabEls = Array.from(
      e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [],
    )
    if (tabEls.length === 0) return
    let next = index
    if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabEls.length - 1
    else if (e.key === 'ArrowRight') next = (index + 1) % tabEls.length
    else next = (index - 1 + tabEls.length) % tabEls.length
    tabEls[next]?.focus()
  }

  // ── Rename ──
  function handleStartRename(workspace: Workspace) {
    if (!onRenameWorkspace) return
    setRenamingId(workspace.id)
    setRenameValue(workspace.name)
  }

  function handleConfirmRename() {
    const trimmed = renameValue.trim()
    const id = renamingId
    setRenamingId(null)
    setRenameValue('')
    if (!trimmed || !id) return
    onRenameWorkspace?.(id, trimmed)
  }

  function handleCancelRename() {
    setRenamingId(null)
    setRenameValue('')
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirmRename()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelRename()
    }
  }

  // ── Delete ──
  function handleConfirmDelete() {
    if (!deleteTarget) return
    onDeleteWorkspace?.(deleteTarget.id)
    setDeleteTarget(null)
  }

  // ── Create ──
  function handleOpenCreate() {
    setNewName('')
    setNewFolder('')
    setSelectedPresetId(null)
    setCreateOpen(true)
    // Radix focuses the first focusable element (the name input) on open.
  }

  // Pick a predefined flow. Auto-fills the name unless the user already typed
  // their own (anything that isn't a leftover auto-filled preset name).
  function handleSelectPreset(id: string) {
    setSelectedPresetId(id)
    const preset = WORKSPACE_PRESETS.find((p) => p.id === id)
    if (!preset) return
    setNewName((cur) => {
      const trimmed = cur.trim()
      if (!trimmed || WORKSPACE_PRESETS.some((p) => p.name === trimmed)) return preset.name
      return cur
    })
  }

  // Pick the blank option. Symmetrically clears the name if it still holds an
  // auto-filled preset name (so switching preset → Blank doesn't leave a
  // misleading pre-filled name), but keeps a name the user actually typed.
  function handleSelectBlank() {
    setSelectedPresetId(null)
    setNewName((cur) => (WORKSPACE_PRESETS.some((p) => p.name === cur.trim()) ? '' : cur))
  }

  // Ordered option ids for the "Start from" radiogroup (Blank first, then each
  // preset) — drives the roving-tabindex keyboard model below.
  const presetOptionIds: ReadonlyArray<string | null> = [null, ...WORKSPACE_PRESETS.map((p) => p.id)]

  function selectPresetOption(id: string | null) {
    if (id === null) handleSelectBlank()
    else handleSelectPreset(id)
  }

  // Roving-tabindex keyboard model for the radiogroup: arrows/Home/End move
  // focus AND select (native radio semantics), mirroring the workspace tablist.
  function handlePresetKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const radios = Array.from(
      e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="radio"]') ?? [],
    )
    if (radios.length === 0) return
    let next = index
    if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = radios.length - 1
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % radios.length
    else next = (index - 1 + radios.length) % radios.length
    selectPresetOption(presetOptionIds[next] ?? null)
    radios[next]?.focus()
  }

  function handleConfirmCreate() {
    const trimmedName = newName.trim()
    const trimmedFolder = newFolder.trim()
    if (!trimmedName || !trimmedFolder) return
    onCreateWorkspace(trimmedName, trimmedFolder, selectedPresetId ?? undefined)
    setCreateOpen(false)
    setNewName('')
    setNewFolder('')
    setSelectedPresetId(null)
  }

  function handleFolderSelected(path: string) {
    setNewFolder(path)
    if (!newName.trim()) {
      // Auto-fill the name from the folder's basename (tolerate trailing slashes).
      const segs = path.replace(/\\/g, '/').split('/').filter(Boolean)
      setNewName(segs[segs.length - 1] || '')
    }
  }

  return (
    <div
      role="tablist"
      aria-label={t('tabs.ariaLabel')}
      className="flex h-9 shrink-0 items-stretch border-b border-border bg-card"
    >
      {/* Brand + Browse + Favorites cluster (replaces the old left sidebar header) */}
      <div className="flex shrink-0 items-center gap-1.5 border-r border-border/60 px-2">
        <Workflow className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="hidden text-xs font-semibold sm:inline">RondoFlow</span>
        {browse && <BrowseMenu actions={browse} />}
        {browse && <TopBarLinks actions={browse} />}
        {onSelectFavorite && (
          <TopBarFavorites favorites={favorites} onSelect={onSelectFavorite} />
        )}
      </div>

      {/* Scrollable tab region */}
      <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
        {workspaces.map((workspace, index) => {
          const active = workspace.id === activeId
          const renaming = renamingId === workspace.id

          return (
            <div
              key={workspace.id}
              ref={active ? activeTabRef : undefined}
              role="tab"
              aria-selected={active}
              tabIndex={renaming ? -1 : active ? 0 : -1}
              title={workspace.name}
              onClick={() => handleSelect(workspace.id)}
              onDoubleClick={() => handleStartRename(workspace)}
              onKeyDown={(e) => handleTabKeyDown(e, index, workspace.id)}
              className={cn(
                'group relative flex h-full max-w-[200px] shrink-0 cursor-pointer select-none items-center gap-1.5 border-r border-border/60 px-3 text-xs outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring',
                active
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />

              {renaming ? (
                <Input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  onBlur={handleConfirmRename}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  className="h-5 w-28 px-1 py-0 text-xs"
                  aria-label={t('tabs.renameInput')}
                />
              ) : (
                <span className="truncate">{workspace.name}</span>
              )}

              {!renaming && (
                <div className="ml-0.5 flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    className="flex h-4 w-4 items-center justify-center rounded opacity-0 outline-none transition-opacity hover:bg-muted focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-ring group-hover:opacity-100 group-focus-within:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setInfoTargetId(workspace.id)
                    }}
                    aria-label={t('tabs.info', { name: workspace.name })}
                  >
                    <Info className="h-3 w-3 text-muted-foreground" aria-hidden />
                  </button>
                  {onRenameWorkspace && (
                    <button
                      type="button"
                      className="flex h-4 w-4 items-center justify-center rounded opacity-0 outline-none transition-opacity hover:bg-muted focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-ring group-hover:opacity-100 group-focus-within:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartRename(workspace)
                      }}
                      aria-label={t('tabs.rename', { name: workspace.name })}
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" aria-hidden />
                    </button>
                  )}
                  {onDeleteWorkspace && (
                    <button
                      type="button"
                      disabled={isLastWorkspace}
                      title={isLastWorkspace ? t('tabs.deleteLastDisabled') : undefined}
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded opacity-0 outline-none transition-opacity focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-ring group-hover:opacity-100 group-focus-within:opacity-100',
                        isLastWorkspace
                          ? 'cursor-not-allowed'
                          : 'hover:bg-destructive/20',
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isLastWorkspace) setDeleteTarget(workspace)
                      }}
                      aria-label={t('tabs.delete', { name: workspace.name })}
                    >
                      <X
                        className={cn(
                          'h-3 w-3',
                          isLastWorkspace ? 'text-muted-foreground/40' : 'text-destructive',
                        )}
                        aria-hidden
                      />
                    </button>
                  )}
                </div>
              )}

              {active && (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                  aria-hidden
                />
              )}
            </div>
          )
        })}

        {/* New workspace */}
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-full shrink-0 rounded-none border-l border-border/60 px-2.5 text-muted-foreground hover:text-foreground"
              onClick={handleOpenCreate}
              aria-label={t('tabs.create')}
            >
              <Plus className="h-4 w-4" aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {t('tabs.new')}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Export current canvas as a shareable bundle */}
      {onExportCanvas && (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-full shrink-0 rounded-none border-l border-border/60 px-2.5 text-muted-foreground hover:text-foreground"
              onClick={onExportCanvas}
              aria-label={t('tabs.export')}
            >
              <Download className="h-4 w-4" aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {t('tabs.exportTooltip')}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Import a bundle as a new workspace */}
      {onImportCanvas && (
        <>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-full shrink-0 rounded-none border-l border-border/60 px-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => importInputRef.current?.click()}
                aria-label={t('tabs.import')}
              >
                <Upload className="h-4 w-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {t('tabs.importTooltip')}
            </TooltipContent>
          </Tooltip>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              // Reset the value so selecting the same file again re-fires onChange.
              e.target.value = ''
              if (file) onImportCanvas(file)
            }}
          />
        </>
      )}

      

      {/* Account cluster — tier indicator + search + user menu (far right) */}
      <div className="flex shrink-0 items-center gap-1 border-l border-border/60 px-2">
        <TierIndicator onSettingsClick={onSettingsClick} />
        {onCommandPalette && (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                onClick={onCommandPalette}
                aria-label={t('search.label')}
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden text-xs md:inline">{t('search.label')}</span>
                <kbd className="hidden rounded border bg-muted px-1 text-[10px] md:inline">Ctrl+K</kbd>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {t('search.tooltip')}
            </TooltipContent>
          </Tooltip>
        )}
        <UserAvatar compact menuSide="top" onSettingsClick={onSettingsClick} onUsersClick={onUsersClick} browse={browse} onRestartOnboarding={onRestartOnboarding} />
      </div>

      {/* Create dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          // While the folder picker is open on top, ignore close requests so an
          // Escape / outside-click in the picker can't also dismiss this dialog
          // and discard the name the user already typed.
          if (!open && folderPickerOpen) return
          setCreateOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('createDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('createDialog.description')}
            </DialogDescription>
          </DialogHeader>

          {/* Start-from picker: blank + predefined SEO flows */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">{t('createDialog.startFrom')}</span>
            <div
              role="radiogroup"
              aria-label={t('createDialog.templateGroup')}
              className="grid max-h-[42vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2"
            >
              {/* Blank */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedPresetId === null}
                tabIndex={selectedPresetId === null ? 0 : -1}
                onClick={handleSelectBlank}
                onKeyDown={(e) => handlePresetKeyDown(e, 0)}
                className={cn(
                  'flex items-start gap-2.5 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring',
                  selectedPresetId === null
                    ? 'border-primary/60 bg-primary/5'
                    : 'border-border hover:border-border/80 hover:bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
                    selectedPresetId === null
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border bg-muted/50 text-muted-foreground',
                  )}
                  aria-hidden
                >
                  <FilePlus2 className="h-4 w-4" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-semibold leading-none">{t('createDialog.blankTitle')}</span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {t('createDialog.blankDescription')}
                  </span>
                </span>
              </button>

              {/* Predefined flows */}
              {WORKSPACE_PRESETS.map((preset, presetIndex) => {
                const Icon = resolvePresetIcon(preset.icon)
                const selected = selectedPresetId === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => handleSelectPreset(preset.id)}
                    onKeyDown={(e) => handlePresetKeyDown(e, presetIndex + 1)}
                    className={cn(
                      'flex items-start gap-2.5 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring',
                      selected
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-border hover:border-border/80 hover:bg-muted/40',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
                        selected
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : 'border-border bg-muted/50 text-muted-foreground',
                      )}
                      aria-hidden
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold leading-none">{preset.name}</span>
                        <Badge variant="outline" className="px-1 py-0 text-[9px] font-medium">
                          {preset.category}
                        </Badge>
                        <Badge variant="secondary" className="px-1 py-0 text-[9px] font-medium">
                          {t('createDialog.agentCount', { count: preset.agents.length })}
                        </Badge>
                      </span>
                      <span className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                        {preset.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 py-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleConfirmCreate()
                }
              }}
              placeholder={t('createDialog.namePlaceholder')}
              className="h-9 text-sm"
              aria-label={t('createDialog.nameLabel')}
            />
            <button
              type="button"
              aria-label={t('createDialog.selectFolder')}
              className="flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setFolderPickerOpen(true)}
            >
              <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
              <span className="truncate font-mono text-xs">
                {newFolder || t('createDialog.selectFolderPlaceholder')}
              </span>
            </button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              {t('common:action.cancel')}
            </Button>
            <Button
              onClick={handleConfirmCreate}
              disabled={!newName.trim() || !newFolder.trim()}
            >
              {selectedPresetId ? t('createDialog.submitFromFlow') : t('createDialog.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FolderPicker
        open={folderPickerOpen}
        onOpenChange={setFolderPickerOpen}
        onSelect={handleFolderSelected}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description', { name: deleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:action.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common:action.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Read-only workspace info / stats */}
      <WorkspaceInfoDialog workspaceId={infoTargetId} onClose={() => setInfoTargetId(null)} />
    </div>
  )
}
