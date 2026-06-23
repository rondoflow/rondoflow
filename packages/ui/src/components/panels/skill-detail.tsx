'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, Star, User, Tag, Box, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { getCategoryColor } from '@/lib/skill-categories'
import type { Skill } from '@rondoflow/shared'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SkillDetailProps {
  readonly skill: Skill
  readonly installedOnCount?: number
  /**
   * Attach-to-agent mode: the footer shows an action that adds the skill to the
   * assistant. Outside attach mode every skill is already installed and active,
   * so the detail view is read-only (no install/uninstall action).
   */
  readonly attachMode?: boolean
  /** When true, the header shows an Edit action (user-owned skills only). */
  readonly editable?: boolean
  /** Invoked when Edit is pressed; may be async (fetches the skill body). */
  readonly onEdit?: () => void | Promise<void>
  readonly onBack: () => void
  readonly onInstall: (skillId: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SkillDetail({
  skill,
  installedOnCount = 0,
  attachMode = false,
  editable = false,
  onEdit,
  onBack,
  onInstall,
}: SkillDetailProps) {
  const { t } = useTranslation('resources')
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleInstall() {
    setLoading(true)
    setError(null)
    try {
      await onInstall(skill.id)
      setAdded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('detail.installFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit() {
    if (!onEdit) return
    setEditLoading(true)
    setError(null)
    try {
      // Resolves once the parent has the skill body and swaps to the editor; a
      // failure here keeps the detail view and surfaces the error inline.
      await onEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('detail.editFailed'))
      setEditLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Back button + (for user-owned skills) Edit */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          aria-label={t('detail.backAria')}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('detail.back')}
        </Button>
        {editable && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleEdit()}
            disabled={editLoading}
            className="gap-1.5 text-xs"
            aria-label={t('detail.editAria', { name: skill.name })}
          >
            {editLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Pencil className="h-3.5 w-3.5" />
            )}
            {t('detail.edit')}
          </Button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Hero */}
        <div className="mb-5 flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-muted text-2xl"
            aria-hidden
          >
            {skill.icon ?? <Box className="h-7 w-7 text-muted-foreground" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold leading-tight">{skill.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {skill.category && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                    getCategoryColor(skill.category),
                  )}
                >
                  <Tag className="h-2.5 w-2.5" />
                  {skill.category}
                </span>
              )}
              {skill.version && (
                <Badge variant="outline" className="text-[10px]">
                  {t('detail.version', { version: skill.version })}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {skill.author && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {skill.author}
            </span>
          )}
          {installedOnCount > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              {t('detail.installedOn', { count: installedOnCount })}
            </span>
          )}
        </div>

        <Separator className="mb-4" />

        {/* Description */}
        <div className="mb-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('detail.descriptionHeading')}
          </h3>
          <p className="text-sm leading-relaxed text-foreground">{skill.description}</p>
        </div>

        {/* What this skill does */}
        <div className="mb-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('detail.whatItDoesHeading')}
          </h3>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              {t('detail.whatItDoesBody')}
            </p>
            {skill.gitUrl && (
              <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
                {t('detail.sourcePrefix', { url: skill.gitUrl })}
              </p>
            )}
          </div>
        </div>

        {/* Source info */}
        {skill.source === 'git' && skill.gitUrl && (
          <div className="mb-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('detail.sourceHeading')}
            </h3>
            <div className="rounded-md border bg-card px-3 py-2">
              <p className="break-all font-mono text-xs text-muted-foreground">{skill.gitUrl}</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Sticky footer — attach action only; skills are always installed/active */}
      {attachMode && (
        <div className="border-t px-5 py-4">
          <Button
            size="sm"
            onClick={handleInstall}
            disabled={loading}
            className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Check className="h-4 w-4" />
            {loading ? t('detail.adding') : added ? t('detail.addedToAssistant') : t('detail.addToAssistant')}
          </Button>
        </div>
      )}
    </div>
  )
}
