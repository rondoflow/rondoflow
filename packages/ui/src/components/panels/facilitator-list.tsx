'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserRoundCog, Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { FACILITATOR_PRESETS, type FacilitatorPreset } from '@rondoflow/catalog'

// Deterministic ids of the predefined (seeded, global) facilitators. Used to
// flag them as "Built-in" and to hide the delete action — they are shared and
// cannot be removed by an individual user.
const BUILTIN_FACILITATOR_IDS = new Set(FACILITATOR_PRESETS.map((p) => p.seedId))

interface Facilitator {
  readonly id: string
  readonly name: string
  readonly description?: string | null
  readonly model?: string | null
  readonly avatar?: string | null
}

interface CreateFacilitatorFormProps {
  readonly onCreated: (f: Facilitator) => void
  readonly onCancel: () => void
}

function CreateFacilitatorForm({ onCreated, onCancel }: CreateFacilitatorFormProps) {
  const { t } = useTranslation('discussions')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('sonnet')
  const [persona, setPersona] = useState('')
  const [presetId, setPresetId] = useState('')
  const [saving, setSaving] = useState(false)

  function applyPreset(preset: FacilitatorPreset) {
    // Toggle off: clicking the active preset clears the preset-derived fields.
    if (presetId === preset.id) {
      setPresetId('')
      setPersona('')
      return
    }
    setPresetId(preset.id)
    setName(preset.name)
    setDescription(preset.description)
    setModel(preset.model)
    setPersona(preset.persona)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const created = await apiPost<Facilitator>('/api/agents', {
        name: name.trim(),
        description: description.trim() || undefined,
        persona: persona.trim() || t('facilitators.defaultPersona', { name: name.trim() }),
        purpose: 'general',
        model,
        isFacilitator: true,
        scope: [],
        allowedTools: [],
      })
      onCreated(created)
    } catch {
      // Error handled by caller
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border p-3">
      {/* Preset picker — start from a curated facilitation style. */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{t('facilitators.presetLabel')}</span>
        <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
          {FACILITATOR_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.id}
              onClick={() => applyPreset(preset)}
              aria-pressed={presetId === preset.id}
              className={cn(
                'flex flex-col items-start gap-0.5 rounded-md border px-2.5 py-1.5 text-left transition-colors',
                presetId === preset.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-accent',
              )}
            >
              <span className="flex w-full items-center gap-1.5">
                <span className="text-xs font-medium">{preset.name}</span>
                <Badge variant="outline" className="text-[9px] shrink-0">
                  {preset.model}
                </Badge>
              </span>
              <span className="text-[11px] text-muted-foreground line-clamp-2">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        placeholder={t('facilitators.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        autoFocus
      />
      <input
        type="text"
        placeholder={t('facilitators.descPlaceholder')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <Textarea
        placeholder={t('facilitators.personaPlaceholder')}
        value={persona}
        onChange={(e) => setPersona(e.target.value)}
        className="min-h-[80px] resize-none text-sm"
      />
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="opus">{t('facilitators.model.opus')}</option>
        <option value="sonnet">{t('facilitators.model.sonnet')}</option>
        <option value="haiku">{t('facilitators.model.haiku')}</option>
      </select>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          {t('common:action.cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={saving || !name.trim()}>
          {saving ? t('facilitators.creating') : t('common:action.create')}
        </Button>
      </div>
    </form>
  )
}

export interface FacilitatorListProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSelect: (facilitator: Facilitator) => void
}

export function FacilitatorList({ open, onOpenChange, onSelect }: FacilitatorListProps) {
  const { t } = useTranslation('discussions')
  const [facilitators, setFacilitators] = useState<Facilitator[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadFacilitators = useCallback(async () => {
    setLoading(true)
    try {
      const agents = await apiGet<Facilitator[]>('/api/agents?facilitator=true')
      setFacilitators(agents)
    } catch {
      // keep existing
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadFacilitators()
    }
  }, [open, loadFacilitators])

  const handleCreated = (f: Facilitator) => {
    setFacilitators((prev) => [f, ...prev])
    setShowCreate(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/agents/${id}`)
      setFacilitators((prev) => prev.filter((f) => f.id !== id))
    } catch {
      // silent
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader className="flex flex-row items-center justify-between pr-6">
          <SheetTitle className="flex items-center gap-2">
            <UserRoundCog className="h-5 w-5" />
            {t('facilitators.title')}
            <Badge variant="secondary" className="text-xs">
              {facilitators.length}
            </Badge>
          </SheetTitle>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            {t('facilitators.newButton')}
          </Button>
        </SheetHeader>

        <Separator className="my-3" />

        {showCreate && (
          <>
            <CreateFacilitatorForm
              onCreated={handleCreated}
              onCancel={() => setShowCreate(false)}
            />
            <Separator className="my-3" />
          </>
        )}

        {loading && facilitators.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            {t('facilitators.loading')}
          </div>
        ) : facilitators.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <UserRoundCog className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('facilitators.empty.title')}</p>
            <p className="text-xs text-muted-foreground">
              {t('facilitators.empty.hint')}
            </p>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              {t('facilitators.empty.createFirst')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto">
            {facilitators.map((f) => (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent cursor-pointer"
                onClick={() => onSelect(f)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(f) }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {f.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{f.name}</span>
                    {f.model && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {f.model}
                      </Badge>
                    )}
                    {BUILTIN_FACILITATOR_IDS.has(f.id) && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {t('facilitators.builtin')}
                      </Badge>
                    )}
                  </div>
                  {f.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {f.description}
                    </p>
                  )}
                </div>
                {!BUILTIN_FACILITATOR_IDS.has(f.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(f.id)
                    }}
                    aria-label={t('facilitators.deleteLabel', { name: f.name })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
