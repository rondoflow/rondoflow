'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet, apiPost, apiPatch } from '@/lib/api'
import { Search, Check, Box, Tag, Loader2, UserPlus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getCategoryColor, deriveCategories } from '@/lib/skill-categories'
import { SkillDetail } from './skill-detail'
import { SkillForm, type SkillFormValues } from './skill-form'
import { ImportTab } from './skill-import-tab'
import type { Skill } from '@rondoflow/shared'

// ---------------------------------------------------------------------------
// Catalog data — fetched live from the server's built-in skill catalog
// (GET /api/skills/catalog). This is the single source of truth for what can
// be installed; a hardcoded mock list here would drift from the catalog and
// every install would fail with "not found in the built-in catalog".
// ---------------------------------------------------------------------------

/** Shape returned by GET /api/skills/catalog (skillMdContent is stripped). */
interface CatalogEntry {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: string | null
  readonly author: string | null
  readonly version: string | null
  readonly icon: string | null
}

/** Turn a catalog slug like "code-review" into a friendly label "Code Review". */
function humanizeName(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Map a catalog entry to the {@link Skill} display shape used by the cards.
 * `id` is set to the catalog `name` (the slug) because that is the identity the
 * install endpoint matches on and how we detect whether a skill is installed.
 * Catalog `icon` values are lucide icon names (not emojis), so they are dropped
 * here and the cards fall back to the generic Box icon.
 */
function catalogToSkill(entry: CatalogEntry): Skill {
  return {
    id: entry.name,
    name: humanizeName(entry.name),
    description: entry.description,
    source: 'marketplace',
    gitUrl: null,
    path: '',
    version: entry.version,
    author: entry.author,
    category: entry.category,
    icon: null,
    mcpConfig: null,
    installedAt: '',
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Filter sentinel meaning "no category filter". */
const ALL_CATEGORIES = 'All'

export interface SkillMarketplaceProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  /**
   * When set, the marketplace was opened to add skills to a specific assistant.
   * Installing a skill then also attaches it to this agent.
   */
  readonly agentId?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a known category string to its localized label. Catalog categories are
 * free-form domain content (e.g. "AI & Agents") that we don't translate, so
 * anything outside this small UI set falls back to the raw value.
 */
const CATEGORY_KEYS: Record<string, string> = {
  All: 'marketplace.category.all',
  Development: 'marketplace.category.development',
  Writing: 'marketplace.category.writing',
  Analysis: 'marketplace.category.analysis',
  Research: 'marketplace.category.research',
}

function categoryLabel(t: (key: string) => string, category: string): string {
  const key = CATEGORY_KEYS[category]
  return key ? t(key) : category
}

function matchesSearch(skill: Skill, query: string): boolean {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  return (
    skill.name.toLowerCase().includes(q) ||
    skill.description.toLowerCase().includes(q) ||
    (skill.category?.toLowerCase().includes(q) ?? false)
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SkillCardProps {
  readonly skill: Skill
  /**
   * Attach-to-agent mode: the card shows an "Add" action that attaches the skill
   * to the open assistant. Outside attach mode there is no action — every skill
   * is already installed and active, so the card is just a link to the detail view.
   */
  readonly attachMode: boolean
  readonly onInstall: (skillId: string) => Promise<void>
  readonly onClick: () => void
}

function SkillCard({ skill, attachMode, onInstall, onClick }: SkillCardProps) {
  const { t } = useTranslation('resources')
  const [busy, setBusy] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disabled = busy
  const showDone = justAdded

  async function handleActionClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (disabled) return
    setBusy(true)
    setError(null)
    try {
      await onInstall(skill.id)
      setJustAdded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('marketplace.card.installFailed'))
    } finally {
      setBusy(false)
    }
  }

  function actionLabel() {
    if (busy) return t('marketplace.card.adding')
    if (showDone) return t('marketplace.card.added')
    return t('marketplace.card.add')
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className={cn(
        'w-full cursor-pointer rounded-lg border bg-card p-4 text-left transition-colors',
        'hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      aria-label={t('marketplace.card.viewDetailsAria', { name: skill.name })}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted"
          aria-hidden
        >
          {skill.icon ? (
            <span className="text-xl">{skill.icon}</span>
          ) : (
            <Box className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold leading-none">{skill.name}</span>
            {skill.category && (
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                  getCategoryColor(skill.category),
                )}
              >
                <Tag className="h-2 w-2" />
                {categoryLabel(t, skill.category)}
              </span>
            )}
          </div>

          <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {skill.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
              {skill.author && <span>{skill.author}</span>}
              {skill.version && (
                <>
                  <span aria-hidden>·</span>
                  <span>{t('marketplace.card.version', { version: skill.version })}</span>
                </>
              )}
            </div>

            {attachMode && (
              <button
                type="button"
                onClick={handleActionClick}
                disabled={disabled}
                aria-label={t('marketplace.card.actionAria', { action: actionLabel(), name: skill.name })}
                className={cn(
                  'flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                  showDone
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90',
                  busy && 'opacity-70',
                )}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {actionLabel()}
                  </>
                ) : showDone ? (
                  <>
                    <Check className="h-3 w-3" />
                    {actionLabel()}
                  </>
                ) : (
                  actionLabel()
                )}
              </button>
            )}
          </div>

          {error && (
            <p className="mt-2 text-[11px] text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Browse Tab
// ---------------------------------------------------------------------------

interface CategoryChipProps {
  readonly label: string
  readonly count: number
  readonly active: boolean
  readonly onClick: () => void
  readonly ariaLabel: string
}

function CategoryChip({ label, count, active, onClick, ariaLabel }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <span>{label}</span>
      <span className={cn('tabular-nums', active ? 'text-primary-foreground/70' : 'text-muted-foreground/60')}>
        {count}
      </span>
    </button>
  )
}

interface BrowseTabProps {
  readonly skills: readonly Skill[]
  readonly loading: boolean
  readonly attachMode: boolean
  readonly onInstall: (skillId: string) => Promise<void>
  readonly onViewDetail: (skill: Skill) => void
}

function BrowseTab({ skills, loading, attachMode, onInstall, onViewDetail }: BrowseTabProps) {
  const { t } = useTranslation('resources')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES)

  // Filter chips are derived from the skills actually present — most-frequent
  // first — so the list always reflects the real catalog (the old hardcoded
  // ['Development', 'Writing', 'Analysis', 'Research'] matched almost nothing).
  const categories = useMemo(() => deriveCategories(skills), [skills])

  const filtered = useMemo(() => {
    return skills.filter((skill) => {
      const categoryMatch =
        activeCategory === ALL_CATEGORIES || skill.category === activeCategory
      return categoryMatch && matchesSearch(skill, search)
    })
  }, [skills, search, activeCategory])

  return (
    <div className="flex flex-col gap-3 py-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('marketplace.browse.searchPlaceholder')}
          className="pl-8 text-sm"
          aria-label={t('marketplace.browse.searchAria')}
        />
      </div>

      {/* Category chips — quick filter, derived from the loaded skills */}
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label={t('marketplace.browse.filterLabel')}
      >
        <CategoryChip
          label={categoryLabel(t, ALL_CATEGORIES)}
          count={skills.length}
          active={activeCategory === ALL_CATEGORIES}
          onClick={() => setActiveCategory(ALL_CATEGORIES)}
          ariaLabel={t('marketplace.browse.chipAria', {
            category: categoryLabel(t, ALL_CATEGORIES),
            count: skills.length,
          })}
        />
        {categories.map(({ name, count }) => (
          <CategoryChip
            key={name}
            label={categoryLabel(t, name)}
            count={count}
            active={activeCategory === name}
            onClick={() => setActiveCategory(name)}
            ariaLabel={t('marketplace.browse.chipAria', { category: categoryLabel(t, name), count })}
          />
        ))}
      </div>

      {/* Skill list */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('marketplace.browse.loading')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {skills.length === 0
              ? t('marketplace.browse.emptyCatalog')
              : t('marketplace.browse.emptyMatch', { query: search })}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-label={t('marketplace.browse.listLabel')}>
          {filtered.map((skill) => (
            <div key={skill.id} role="listitem">
              <SkillCard
                skill={skill}
                attachMode={attachMode}
                onInstall={onInstall}
                onClick={() => onViewDetail(skill)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SkillMarketplace({ open, onOpenChange, agentId }: SkillMarketplaceProps) {
  const { t } = useTranslation('resources')
  const [activeTab, setActiveTab] = useState('browse')
  const [catalogSkills, setCatalogSkills] = useState<readonly Skill[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  // The skill currently being edited, with its fetched SKILL.md body. Only
  // user-owned skills (source !== 'marketplace') are editable; built-in catalog
  // skills are read-only shipped content.
  const [editingSkill, setEditingSkill] = useState<{ skill: Skill; content: string } | null>(null)

  const attachMode = Boolean(agentId)
  // Ids of skills that live in the DB (custom/imported/git). The browse list
  // mixes these with catalog slugs, so handleInstall needs to tell them apart:
  // a DB id attaches directly, a catalog slug installs-then-attaches.
  const dbSkillIds = useRef<Set<string>>(new Set())

  // Distinct categories present in the catalog, offered as autocomplete in the
  // create/edit forms so authored skills reuse the existing taxonomy.
  const categorySuggestions = useMemo(
    () => deriveCategories(catalogSkills).map((c) => c.name),
    [catalogSkills],
  )

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true)
    try {
      // The built-in catalog is keyed by slug; user-authored/imported skills
      // live only in the DB (source !== 'marketplace') and have no catalog
      // entry, so we merge them in here — otherwise a freshly created custom
      // skill would never show up in browse.
      const [entries, installed] = await Promise.all([
        apiGet<CatalogEntry[]>('/api/skills/catalog'),
        apiGet<Skill[]>('/api/skills').catch(() => [] as Skill[]),
      ])
      const catalogSkillList = entries.map(catalogToSkill)
      const catalogNames = new Set(catalogSkillList.map((s) => s.id))
      const customSkills = installed.filter(
        (s) => s.source !== 'marketplace' && !catalogNames.has(s.name),
      )
      dbSkillIds.current = new Set(customSkills.map((s) => s.id))
      setCatalogSkills([...customSkills, ...catalogSkillList])
    } catch {
      dbSkillIds.current = new Set()
      setCatalogSkills([])
    } finally {
      setCatalogLoading(false)
    }
  }, [])

  // Load (and refresh) the catalog whenever the panel opens. Every catalog skill
  // is auto-installed on the server, so the catalog is the full list of skills.
  useEffect(() => {
    if (!open) {
      // Drop any open editor so reopening starts from the browse list.
      setEditingSkill(null)
      return
    }
    void loadCatalog()
  }, [open, loadCatalog])

  // Attach a freshly installed/created skill to the open assistant. Only attaches
  // when not already attached — re-posting would run the attach endpoint's upsert
  // *update* branch and reset the user's priority/enabled (set via the agent
  // drawer) back to the schema defaults. New attachments get max+1 priority so
  // they land at the bottom of the order, not the top.
  const attachToAgent = useCallback(
    async (skillDbId: string) => {
      if (!agentId) return
      try {
        const agent = await apiGet<{
          skills?: ReadonlyArray<{ skillId: string; priority: number }>
        }>(`/api/agents/${agentId}`)
        const existing = agent.skills ?? []
        if (!existing.some((s) => s.skillId === skillDbId)) {
          const nextPriority = existing.reduce((max, s) => Math.max(max, s.priority), 0) + 1
          await apiPost(`/api/agents/${agentId}/skills/${skillDbId}`, {
            priority: nextPriority,
            enabled: true,
          })
        }
      } catch {
        // Best-effort attach; the install/create itself already succeeded.
      }
    },
    [agentId],
  )

  const handleInstall = useCallback(async (idOrSlug: string) => {
    // Custom/imported skills already exist in the DB and the card carries their
    // real id — attach it directly (re-running the catalog install would fail,
    // since they have no catalog entry).
    if (dbSkillIds.current.has(idOrSlug)) {
      await attachToAgent(idOrSlug)
      return
    }
    // Catalog skill: it is already installed server-side; the idempotent install
    // upsert resolves the catalog slug to the real DB id we need to attach.
    const installed = await apiPost<Skill>('/api/skills/install', {
      name: idOrSlug,
      source: 'marketplace',
    })
    if (installed?.id) await attachToAgent(installed.id)
  }, [attachToAgent])

  const handleCreate = useCallback(async (input: SkillFormValues) => {
    const created = await apiPost<Skill>('/api/skills/install/custom', {
      name: input.name,
      description: input.description,
      category: input.category || undefined,
      content: input.content,
    })
    if (created?.id) await attachToAgent(created.id)
    // Refresh so the freshly created custom skill shows up in browse, then
    // surface it by switching back to the browse tab.
    await loadCatalog()
    setActiveTab('browse')
  }, [attachToAgent, loadCatalog])

  // Open the editor for a user-owned skill: fetch its current SKILL.md body so
  // the form is pre-filled with the real instructions, then switch to the form.
  const handleEditClick = useCallback(async (skill: Skill) => {
    const { content } = await apiGet<{ content: string }>(`/api/skills/${skill.id}/content`)
    setEditingSkill({ skill, content })
  }, [])

  const handleUpdate = useCallback(
    async (input: SkillFormValues) => {
      if (!editingSkill) return
      const updated = await apiPatch<Skill>(`/api/skills/${editingSkill.skill.id}`, {
        description: input.description,
        category: input.category || null,
        content: input.content,
      })
      // Keep the form's pre-filled state in sync with what was saved, and refresh
      // browse so the (possibly re-categorised) skill reflects the edit.
      setEditingSkill({ skill: updated, content: input.content })
      await loadCatalog()
    },
    [editingSkill, loadCatalog],
  )

  const handleBackFromEdit = useCallback(() => {
    // Editing is reached from the detail view; returning drops both so the user
    // lands back on the (refreshed) browse list rather than a stale detail.
    setEditingSkill(null)
    setSelectedSkill(null)
  }, [])

  const handleImportSuccess = useCallback(async () => {
    await loadCatalog()
    setActiveTab('browse')
  }, [loadCatalog])

  const handleViewDetail = useCallback((skill: Skill) => {
    setSelectedSkill(skill)
  }, [])

  const handleBackFromDetail = useCallback(() => {
    setSelectedSkill(null)
  }, [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0"
        aria-label={t('marketplace.ariaLabel')}
      >
        {editingSkill ? (
          <SkillForm
            mode="edit"
            initial={{
              name: editingSkill.skill.name,
              description: editingSkill.skill.description,
              category: editingSkill.skill.category ?? '',
              content: editingSkill.content,
            }}
            categorySuggestions={categorySuggestions}
            onSubmit={handleUpdate}
            onCancel={handleBackFromEdit}
          />
        ) : selectedSkill ? (
          <SkillDetail
            skill={selectedSkill}
            attachMode={attachMode}
            editable={selectedSkill.source !== 'marketplace'}
            onEdit={() => handleEditClick(selectedSkill)}
            onBack={handleBackFromDetail}
            onInstall={handleInstall}
          />
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="text-base font-semibold">{t('marketplace.title')}</SheetTitle>
              <SheetDescription className="sr-only">
                {t('marketplace.description')}
              </SheetDescription>
            </SheetHeader>

            {attachMode && (
              <div className="flex items-center gap-2 border-b bg-primary/5 px-5 py-2.5 text-xs text-muted-foreground">
                <UserPlus className="h-3.5 w-3.5 shrink-0 text-primary" />
                {t('marketplace.attachNotice')}
              </div>
            )}

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TabsList className="mx-5 mt-3 w-auto justify-start rounded-none border-b bg-transparent p-0">
                {(['browse', 'create', 'import'] as const).map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={cn(
                      'rounded-none border-b-2 border-transparent px-3 py-2 text-xs font-medium capitalize',
                      'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                    )}
                  >
                    {t(`marketplace.tab.${tab}`)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
                <TabsContent value="browse" className="mt-0">
                  <BrowseTab
                    skills={catalogSkills}
                    loading={catalogLoading}
                    attachMode={attachMode}
                    onInstall={handleInstall}
                    onViewDetail={handleViewDetail}
                  />
                </TabsContent>

                <TabsContent value="create" className="mt-0">
                  <SkillForm
                    mode="create"
                    categorySuggestions={categorySuggestions}
                    onSubmit={handleCreate}
                  />
                </TabsContent>

                <TabsContent value="import" className="mt-0">
                  <ImportTab onImportSuccess={handleImportSuccess} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
