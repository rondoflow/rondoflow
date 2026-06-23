'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bot, Search,
  Code2, Server, Container, GitPullRequest, Bug, BarChart3, Brain, TrendingUp,
  ListOrdered, Globe, Sparkles, KeyRound, PenLine, Lightbulb, Megaphone, BookOpen,
  SpellCheck, Share2, Microscope, Languages, LineChart, LayoutGrid,
  Network, Cpu, FileCode, DraftingCompass, Building2, Cloud, FileCheck, Boxes, Gauge,
  Rocket, Siren, ScrollText, Wrench, AppWindow, Component, Layers, Binary, Waypoints,
  Flame, Recycle, Smartphone, Triangle, Zap, Database, ClipboardList, Wand, Braces,
  ClipboardCheck, Atom, ShieldCheck, FlaskConical, FileType, Palette, Compass,
  type LucideIcon,
} from 'lucide-react'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select'
import { cn } from '@/lib/utils'
import {
  AGENT_TEMPLATES,
  AGENT_TEMPLATE_CATEGORIES,
  filterAgentTemplates,
  type AgentTemplate,
} from '@rondoflow/catalog'
import { MODEL_TIERS } from '@rondoflow/shared'

// ---------------------------------------------------------------------------
// Template icon map — lucide names referenced by AGENT_TEMPLATES
// ---------------------------------------------------------------------------

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  Code2, Server, Container, GitPullRequest, Bug, BarChart3, Brain, TrendingUp,
  ListOrdered, Globe, Sparkles, KeyRound, PenLine, Lightbulb, Megaphone, BookOpen,
  SpellCheck, Share2, Microscope, Languages, LineChart,
  Network, Cpu, FileCode, DraftingCompass, Building2, Cloud, FileCheck, Boxes, Gauge,
  Rocket, Siren, ScrollText, Wrench, AppWindow, Component, Layers, Binary, Waypoints,
  Flame, Recycle, Smartphone, Triangle, Zap, Database, ClipboardList, Wand, Braces,
  ClipboardCheck, Atom, ShieldCheck, FlaskConical, FileType, Palette, Compass,
}

function resolveTemplateIcon(name: string): LucideIcon {
  return TEMPLATE_ICONS[name] ?? Bot
}

// ---------------------------------------------------------------------------
// Template card
// ---------------------------------------------------------------------------

function TemplateCard({
  template,
  onSelect,
}: {
  readonly template: AgentTemplate
  readonly onSelect: () => void
}) {
  const { t } = useTranslation('agentDrawer')
  const Icon = resolveTemplateIcon(template.icon)
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex flex-col gap-2 rounded-lg border bg-card p-3 text-left transition-all',
        'hover:border-primary/50 hover:bg-accent/30 hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
      aria-label={t('template.useTemplateAria', { name: template.name })}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{template.name}</span>
      </div>
      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {template.description}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
        <Badge variant="secondary" className="text-[10px] capitalize">{template.purpose}</Badge>
        <Badge variant="outline" className="text-[10px]">{MODEL_TIERS[template.model].label}</Badge>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Gallery — grouped, searchable grid of pre-configured assistants
// ---------------------------------------------------------------------------

export interface AgentTemplateGalleryProps {
  readonly onClose: () => void
  readonly onPick: (template: AgentTemplate) => void
  readonly onDescribe: () => void
  readonly onManual: () => void
}

export function AgentTemplateGallery({
  onClose,
  onPick,
  onDescribe,
  onManual,
}: AgentTemplateGalleryProps) {
  const { t } = useTranslation('agentDrawer')
  const [query, setQuery] = useState('')

  const templateOptions = useMemo<SearchableSelectOption[]>(
    () =>
      AGENT_TEMPLATES.map((tpl) => ({
        value: tpl.id,
        label: tpl.name,
        description: tpl.description,
      })),
    [],
  )

  const grouped = useMemo(() => {
    const matches = filterAgentTemplates(AGENT_TEMPLATES, query)
    return AGENT_TEMPLATE_CATEGORIES
      .map((category) => ({
        category,
        templates: matches.filter((t) => t.category === category),
      }))
      .filter((group) => group.templates.length > 0)
  }, [query])

  const hasResults = grouped.length > 0

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" aria-hidden />
          {t('template.title')}
        </DialogTitle>
        <DialogDescription>
          {t('template.description')}
        </DialogDescription>
      </DialogHeader>

      {/* Quick pick — jump straight to a template by name/description */}
      <SearchableSelect
        options={templateOptions}
        value=""
        onChange={(id) => {
          const tpl = AGENT_TEMPLATES.find((tpl) => tpl.id === id)
          if (tpl) onPick(tpl)
        }}
        placeholder={t('template.quickPickPlaceholder')}
        searchPlaceholder={t('template.quickPickSearch')}
        emptyText={t('template.quickPickEmpty')}
        icon={LayoutGrid}
        ariaLabel={t('template.quickPickPlaceholder')}
      />

      {/* Or browse the full grid */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('template.searchPlaceholder')}
          aria-label={t('template.searchAria')}
          className="pl-8 text-sm"
          autoFocus
        />
      </div>

      {/* Grouped grid */}
      <div className="flex max-h-[52vh] flex-col gap-4 overflow-y-auto pr-1">
        {hasResults ? (
          grouped.map((group) => (
            <div key={group.category} className="flex flex-col gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {group.category}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {group.templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => onPick(template)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('template.noMatch', { query })}</p>
          </div>
        )}
      </div>

      <DialogFooter className="flex items-center justify-between sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDescribe}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('template.describeWithAi')}
          </button>
          <button
            type="button"
            onClick={onManual}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('template.startFromScratch')}
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          {t('common:action.cancel')}
        </Button>
      </DialogFooter>
    </>
  )
}
