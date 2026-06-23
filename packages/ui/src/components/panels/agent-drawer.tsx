'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { useComplexity } from '@/hooks/use-complexity'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import { formatDate } from '@/lib/format'
import {
  Bot,
  Plus,
  Trash2,
  ChevronDown,
  FolderOpen,
  MessageSquare,
  Calendar,
  Hash,
  Loader2,
  Check,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ModelSelector } from './model-selector'
import { AgentSkillsTab } from './agent-skills-tab'
import { type SearchableSelectOption } from '@/components/ui/searchable-select'
import { AgentExternalFoldersTab } from './agent-external-folders-tab'
import { AgentMcpTab, type AgentMcpAssignment } from './agent-mcp-tab'
import { LoopConfig, type LoopConfigValue } from './loop-config'
import { AgentMemoryTab } from './agent-memory-tab'
import type { McpServer } from './mcp-management'
import {
  type Agent,
  type AgentMode,
  type AgentPurpose,
  type ModelTier,
  type AgentProviderId,
  type ProviderConfig,
  recommendModel,
  OPENAI_DEFAULT_MODEL,
  PERPLEXITY_DEFAULT_MODEL,
  providerModels,
  defaultProviderConfig,
  isApiProvider,
} from '@rondoflow/shared'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentDrawerProps {
  readonly agent: Agent | null
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (updates: Partial<Agent>) => void
  readonly onOpenMarketplace?: () => void
  readonly onOpenExternalFolders?: () => void
  readonly mcpServers?: readonly McpServer[]
  readonly mcpAssignments?: readonly AgentMcpAssignment[]
  readonly onMcpToggle?: (agentId: string, serverId: string, assigned: boolean) => void
  readonly onOpenMcpManagement?: () => void
}

type SafetyLevel = 'cautious' | 'balanced' | 'autonomous'

// Mirrors the backend AgentMode values the drawer lets the user choose.
type PermissionMode = Extract<AgentMode, 'default' | 'edit' | 'full'>

interface ConversationRow {
  readonly id: string
  readonly startedAt: string
  readonly messageCount: number
  readonly status: 'active' | 'ended'
}

/**
 * The full set of agent-record fields the drawer edits in one form. Skills,
 * MCP servers, external folders and individual memories live on separate
 * endpoints (and save immediately), so they are NOT part of this draft — but
 * everything that round-trips through PATCH /api/agents/:id is, so the single
 * Save button can persist them all at once.
 */
interface AgentDraft {
  readonly name: string
  readonly description: string
  readonly persona: string
  readonly purpose: AgentPurpose
  // Claude-code model: a tier preset (opus/sonnet/haiku) OR a free-form custom
  // model id that overrides the tier when non-empty.
  readonly modelTier: ModelTier | null
  readonly customModel: string
  // API-provider (OpenAI/Perplexity) config.
  readonly apiModel: string
  readonly webSearch: boolean
  readonly deepResearch: boolean
  // Safety
  readonly allowedTools: readonly string[]
  readonly scope: readonly string[]
  // Advanced
  readonly permissionMode: PermissionMode
  readonly teamEnabled: boolean
  readonly loopEnabled: boolean
  readonly loopCriteria: Agent['loopCriteria']
  readonly maxIterations: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PURPOSE_OPTIONS: readonly { value: AgentPurpose; labelKey: string }[] = [
  { value: 'general', labelKey: 'purpose.general' },
  { value: 'writing', labelKey: 'purpose.writing' },
  { value: 'coding', labelKey: 'purpose.coding' },
  { value: 'analysis', labelKey: 'purpose.analysis' },
  { value: 'chat', labelKey: 'purpose.chat' },
  { value: 'review', labelKey: 'purpose.review' },
  { value: 'research', labelKey: 'purpose.research' },
  { value: 'creative', labelKey: 'purpose.creative' },
  { value: 'data', labelKey: 'purpose.data' },
]

// Real Claude Code tool names. These are forwarded verbatim to the CLI's
// --allowedTools, so they MUST match the actual tool identifiers — an earlier
// version used friendly placeholders ('read_files', 'browse_web') that the CLI
// silently ignored, so toggling them changed nothing the agent could use.
const TOOL_OPTIONS: readonly { name: string; labelKey: string }[] = [
  { name: 'Read', labelKey: 'tool.read' },
  { name: 'Write', labelKey: 'tool.write' },
  { name: 'Edit', labelKey: 'tool.edit' },
  { name: 'Bash', labelKey: 'tool.bash' },
  { name: 'Glob', labelKey: 'tool.glob' },
  { name: 'Grep', labelKey: 'tool.grep' },
  { name: 'LS', labelKey: 'tool.ls' },
  { name: 'WebFetch', labelKey: 'tool.webFetch' },
  { name: 'WebSearch', labelKey: 'tool.webSearch' },
  { name: 'TodoWrite', labelKey: 'tool.todoWrite' },
]

const PERMISSION_MODE_OPTIONS: readonly {
  value: PermissionMode
  labelKey: string
  descriptionKey: string
}[] = [
  { value: 'default', labelKey: 'permissionMode.default.label', descriptionKey: 'permissionMode.default.description' },
  { value: 'edit', labelKey: 'permissionMode.edit.label', descriptionKey: 'permissionMode.edit.description' },
  {
    value: 'full',
    labelKey: 'permissionMode.full.label',
    descriptionKey: 'permissionMode.full.description',
  },
]

const STATUS_LABEL_KEY: Record<Agent['status'], 'status.idle' | 'status.running' | 'status.waiting' | 'status.error'> = {
  idle: 'status.idle',
  running: 'status.running',
  waiting_approval: 'status.waiting',
  error: 'status.error',
}

const STATUS_VARIANT: Record<Agent['status'], 'default' | 'secondary' | 'destructive' | 'outline'> =
  {
    idle: 'secondary',
    running: 'default',
    waiting_approval: 'outline',
    error: 'destructive',
  }

const MODEL_TIER_SET = new Set<ModelTier>(['opus', 'sonnet', 'haiku'])
const AGENT_MODES = new Set<AgentMode>(['plan', 'default', 'edit', 'full'])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSafetyLevel(allowedTools: readonly string[]): SafetyLevel {
  const tools = [...allowedTools]
  if (tools.length === 0) return 'cautious'
  if (tools.includes('*')) return 'autonomous'
  return 'balanced'
}

function isModelTier(value: string | null | undefined): value is ModelTier {
  return !!value && MODEL_TIER_SET.has(value as ModelTier)
}

function clampPermissionMode(mode: string | null | undefined): PermissionMode {
  return mode === 'edit' || mode === 'full' ? mode : 'default'
}

function defaultApiModel(provider: AgentProviderId): string {
  return provider === 'perplexity' ? PERPLEXITY_DEFAULT_MODEL : OPENAI_DEFAULT_MODEL
}

// Order-insensitive comparison — tool allowlists are sets, not ordered lists.
function sameStringSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every((x) => setB.has(x))
}

// Order-sensitive comparison — used for scope paths (a user-ordered list).
function sameArray(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i])
}

// ---------------------------------------------------------------------------
// API record → Agent mapping
// ---------------------------------------------------------------------------

/** Shape returned by GET /api/agents/:id (a Prisma row, loosely typed here). */
interface AgentApiRecord {
  readonly id: string
  readonly name: string
  readonly avatar?: string | null
  readonly description?: string | null
  readonly persona?: string
  readonly purpose?: string | null
  readonly scope?: readonly string[]
  readonly allowedTools?: readonly string[]
  readonly memoryEnabled?: boolean
  readonly model?: string | null
  readonly provider?: string | null
  readonly providerConfig?: ProviderConfig | null
  readonly status?: Agent['status']
  readonly permissionMode?: string
  readonly loopEnabled?: boolean
  readonly loopCriteria?: { readonly type: string; readonly value: string } | null
  readonly maxIterations?: number
  readonly teamEnabled?: boolean
  readonly isFavorite?: boolean
  readonly canvasX?: number
  readonly canvasY?: number
  readonly createdAt?: string
  readonly updatedAt?: string
}

/**
 * Map the API record to the strongly-typed Agent the editor tabs expect.
 * The editor previously ran on hardcoded placeholder values (allowedTools: [],
 * permissionMode: 'default', persona: ''), so it never showed — or could safely
 * save — an agent's real configuration. Loading the actual record is what makes
 * the Configure/Safety tabs reflect (and round-trip) the persisted settings.
 *
 * `model` is passed through verbatim (tier OR full custom id): an earlier
 * version coerced any non-tier id to null here, which silently dropped a saved
 * custom model every time the drawer reopened.
 */
function toAgent(r: AgentApiRecord): Agent {
  return {
    id: r.id,
    name: r.name,
    avatar: r.avatar ?? null,
    description: r.description ?? null,
    persona: r.persona ?? '',
    purpose: (r.purpose ?? null) as AgentPurpose | null,
    scope: r.scope ?? [],
    allowedTools: r.allowedTools ?? [],
    memoryEnabled: r.memoryEnabled ?? false,
    model: r.model ?? null,
    provider:
      r.provider === 'openai' || r.provider === 'perplexity'
        ? (r.provider as AgentProviderId)
        : 'claude-code',
    providerConfig:
      r.provider === 'openai' || r.provider === 'perplexity'
        ? {
            ...defaultProviderConfig(r.provider as AgentProviderId)!,
            ...(r.providerConfig ?? {}),
          }
        : null,
    status: r.status ?? 'idle',
    permissionMode:
      r.permissionMode && AGENT_MODES.has(r.permissionMode as AgentMode)
        ? (r.permissionMode as AgentMode)
        : 'default',
    loopEnabled: r.loopEnabled ?? false,
    loopCriteria: (r.loopCriteria ?? null) as Agent['loopCriteria'],
    maxIterations: r.maxIterations ?? 10,
    teamEnabled: r.teamEnabled ?? false,
    isFavorite: r.isFavorite ?? false,
    canvasX: r.canvasX ?? 0,
    canvasY: r.canvasY ?? 0,
    createdAt: r.createdAt ?? '',
    updatedAt: r.updatedAt ?? '',
  }
}

/**
 * Builds a POST /api/agents payload from the drawer's `agent` stub. Used to
 * lazily persist a palette-dropped agent the first time it is edited (records
 * are otherwise created only on run), so the editor works before a first run.
 */
function buildCreatePayload(a: Agent): Record<string, unknown> {
  const persona =
    a.persona && a.persona.trim().length > 0
      ? a.persona
      : `You are ${a.name}.${a.description ? ` ${a.description}` : ''}`.trim()

  const payload: Record<string, unknown> = {
    id: a.id,
    name: a.name,
    persona,
    description: a.description ?? undefined,
    purpose: a.purpose ?? undefined,
    provider: a.provider,
    scope: [...a.scope],
    allowedTools: [...a.allowedTools],
  }
  if (a.provider === 'claude-code') {
    if (a.model) payload['model'] = a.model
  } else if (a.providerConfig) {
    payload['providerConfig'] = a.providerConfig
  }
  return payload
}

// ---------------------------------------------------------------------------
// Draft <-> Agent
// ---------------------------------------------------------------------------

/** Seed the editable form from a loaded agent record. */
function draftFromAgent(a: Agent): AgentDraft {
  return {
    name: a.name,
    description: a.description ?? '',
    persona: a.persona,
    purpose: a.purpose ?? 'general',
    modelTier: isModelTier(a.model) ? a.model : null,
    customModel: a.model && !isModelTier(a.model) ? a.model : '',
    apiModel: a.providerConfig?.model ?? defaultApiModel(a.provider),
    webSearch: a.providerConfig?.webSearch ?? false,
    deepResearch: a.providerConfig?.deepResearch ?? false,
    allowedTools: a.allowedTools,
    scope: a.scope,
    permissionMode: clampPermissionMode(a.permissionMode),
    teamEnabled: a.teamEnabled,
    loopEnabled: a.loopEnabled,
    loopCriteria: a.loopCriteria,
    maxIterations: a.maxIterations,
  }
}

/** The Claude model to persist: the custom id wins, else the tier (or null). */
function resolveClaudeModel(draft: AgentDraft): string | null {
  const custom = draft.customModel.trim()
  return custom.length > 0 ? custom : draft.modelTier
}

/**
 * Diff the draft against the loaded agent and return only the changed fields as
 * a PATCH payload. Returning just the delta keeps the request minimal and —
 * crucially — avoids clobbering fields the UI can't represent (e.g. a 'plan'
 * permission mode the radio group doesn't offer) when they were never touched.
 */
function computeUpdates(draft: AgentDraft, agent: Agent): Partial<Agent> {
  const updates: Record<string, unknown> = {}

  if (draft.name !== agent.name) updates.name = draft.name
  if (draft.description !== (agent.description ?? '')) updates.description = draft.description
  if (draft.persona !== agent.persona) updates.persona = draft.persona
  if (draft.purpose !== (agent.purpose ?? 'general')) updates.purpose = draft.purpose

  if (isApiProvider(agent.provider)) {
    const isPerplexity = agent.provider === 'perplexity'
    const cur = agent.providerConfig
    const providerConfig: ProviderConfig = {
      // Spread the stored config first so optional fields the drawer doesn't edit
      // (e.g. a deepResearchModel override set elsewhere) survive the save instead
      // of being silently dropped — PATCH overwrites the whole JSON column.
      ...(cur ?? {}),
      model: draft.apiModel,
      // Perplexity always searches; for OpenAI deep research implies web search.
      webSearch: isPerplexity ? true : draft.deepResearch ? true : draft.webSearch,
      deepResearch: draft.deepResearch,
    }
    if (
      !cur ||
      cur.model !== providerConfig.model ||
      cur.webSearch !== providerConfig.webSearch ||
      cur.deepResearch !== providerConfig.deepResearch
    ) {
      updates.providerConfig = providerConfig
    }
  } else {
    // Claude-code: a tier preset or a custom model id. Clearing the model
    // (resolved === null) isn't supported by the API (the column is a non-null
    // string on write), so only send a concrete value.
    const resolved = resolveClaudeModel(draft)
    if (resolved !== null && resolved !== agent.model) updates.model = resolved
  }

  if (!sameStringSet(draft.allowedTools, agent.allowedTools)) {
    updates.allowedTools = [...draft.allowedTools]
  }
  if (!sameArray(draft.scope, agent.scope)) updates.scope = [...draft.scope]

  if (draft.permissionMode !== clampPermissionMode(agent.permissionMode)) {
    updates.permissionMode = draft.permissionMode
  }
  if (draft.teamEnabled !== agent.teamEnabled) updates.teamEnabled = draft.teamEnabled

  if (draft.loopEnabled !== agent.loopEnabled) updates.loopEnabled = draft.loopEnabled
  if (JSON.stringify(draft.loopCriteria ?? null) !== JSON.stringify(agent.loopCriteria ?? null)) {
    updates.loopCriteria = draft.loopCriteria
  }
  if (draft.maxIterations !== agent.maxIterations) updates.maxIterations = draft.maxIterations

  return updates as Partial<Agent>
}

// ---------------------------------------------------------------------------
// Settings Section (controlled — edits the shared draft)
// ---------------------------------------------------------------------------

function SettingsSection({
  draft,
  provider,
  onChange,
}: {
  readonly draft: AgentDraft
  readonly provider: AgentProviderId
  readonly onChange: (patch: Partial<AgentDraft>) => void
}) {
  const { t } = useTranslation('agentDrawer')
  const apiProvider = isApiProvider(provider)
  const isPerplexity = provider === 'perplexity'
  // Perplexity's Sonar models always search, so there is no web-search toggle.
  const showWebSearchToggle = provider === 'openai'
  const apiModelOptions = providerModels(provider)

  const recommendation = recommendModel(draft.purpose)
  const effectiveRecommended = recommendation.tier
  const hasCustomModel = draft.customModel.trim().length > 0

  // Deep research implies (and locks) web search on.
  function toggleDeepResearch() {
    const next = !draft.deepResearch
    onChange(next ? { deepResearch: true, webSearch: true } : { deepResearch: false })
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('field.name')}
        </label>
        <Input
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={t('placeholder.name')}
          maxLength={80}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('field.description')}
        </label>
        <Textarea
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={t('placeholder.description')}
          className="resize-none"
          rows={2}
          maxLength={300}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('common:terms.persona')}
        </label>
        <Textarea
          value={draft.persona}
          onChange={(e) => onChange({ persona: e.target.value })}
          placeholder={t('placeholder.persona')}
          className="resize-none"
          rows={5}
          maxLength={25000}
        />
        <p className="text-[11px] text-muted-foreground">
          {t('hint.personaSystemPrompt')}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('field.purpose')}
        </label>
        <div className="relative">
          <select
            value={draft.purpose}
            onChange={(e) => onChange({ purpose: e.target.value as AgentPurpose })}
            className={cn(
              'w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8',
              'text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            )}
          >
            {PURPOSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <Separator />

      {apiProvider ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('field.model')}
            </label>
            <div className="relative">
              <select
                value={draft.apiModel}
                onChange={(e) => onChange({ apiModel: e.target.value })}
                disabled={draft.deepResearch}
                className={cn(
                  'w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8',
                  'text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  draft.deepResearch && 'opacity-60',
                )}
              >
                {apiModelOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {draft.deepResearch && (
              <p className="text-[11px] text-muted-foreground">
                {t('hint.deepResearchModel')}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('field.tools')}
            </label>
            {showWebSearchToggle ? (
              <ToggleRow
                label={t('toggle.webSearch.label')}
                description={t('toggle.webSearch.description')}
                checked={draft.webSearch || draft.deepResearch}
                disabled={draft.deepResearch}
                onToggle={() => onChange({ webSearch: !draft.webSearch })}
              />
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {t('hint.perplexitySearches')}
              </p>
            )}
            <ToggleRow
              label={t('toggle.deepResearch.label')}
              description={t('toggle.deepResearch.description')}
              checked={draft.deepResearch}
              onToggle={toggleDeepResearch}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('field.model')}
            </label>
            <ModelSelector
              value={hasCustomModel ? null : draft.modelTier}
              recommended={effectiveRecommended}
              reason={recommendation.reason}
              onChange={(tier) => onChange({ modelTier: tier, customModel: '' })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-custom-model"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              {t('field.customModelId')}
            </label>
            <Input
              id="settings-custom-model"
              value={draft.customModel}
              onChange={(e) => onChange({ customModel: e.target.value })}
              placeholder={t('placeholder.customModel')}
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              {t('hint.customModel')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toggle row (label + switch) — used for OpenAI tool toggles
// ---------------------------------------------------------------------------

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onToggle,
}: {
  readonly label: string
  readonly description: string
  readonly checked: boolean
  readonly disabled?: boolean
  readonly onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-[11px] text-muted-foreground">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skills Tab
// ---------------------------------------------------------------------------

interface AgentSkillRow {
  readonly skillId: string
  readonly skillName: string
  /** Raw catalog slug (skill.name) — used to exclude already-attached skills from the picker. */
  readonly rawName: string
  readonly skillCategory?: string
  readonly priority: number
  readonly enabled: boolean
}

function humanizeSkillName(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function SkillsTab({
  agentId,
  onOpenMarketplace,
}: {
  readonly agentId: string
  readonly onOpenMarketplace: () => void
}) {
  const [skills, setSkills] = useState<readonly AgentSkillRow[]>([])

  // Load the skills currently attached to this assistant from the server.
  const load = useCallback(async () => {
    if (!agentId) {
      setSkills([])
      return
    }
    try {
      const agent = await apiGet<{
        skills?: ReadonlyArray<{
          skillId: string
          priority: number
          enabled: boolean
          skill?: { name?: string; category?: string | null }
        }>
      }>(`/api/agents/${agentId}`)
      const rows = (agent.skills ?? [])
        .map((as) => ({
          skillId: as.skillId,
          skillName: humanizeSkillName(as.skill?.name ?? as.skillId),
          rawName: as.skill?.name ?? as.skillId,
          skillCategory: as.skill?.category ?? undefined,
          priority: as.priority,
          enabled: as.enabled,
        }))
        .sort((a, b) => a.priority - b.priority)
      setSkills(rows)
    } catch {
      setSkills([])
    }
  }, [agentId])

  useEffect(() => {
    void load()
  }, [load])

  // The attach endpoint upserts the full (priority, enabled) pair, so single-field
  // updates must send the other field too or it resets to its schema default.
  async function handleToggle(skillId: string, enabled: boolean) {
    const target = skills.find((s) => s.skillId === skillId)
    setSkills((prev) => prev.map((s) => (s.skillId === skillId ? { ...s, enabled } : s)))
    try {
      await apiPost(`/api/agents/${agentId}/skills/${skillId}`, {
        priority: target?.priority ?? 0,
        enabled,
      })
    } catch {
      void load()
    }
  }

  async function handleRemove(skillId: string) {
    setSkills((prev) => prev.filter((s) => s.skillId !== skillId))
    try {
      await apiDelete(`/api/agents/${agentId}/skills/${skillId}`)
    } catch {
      void load()
    }
  }

  async function handleReorder(reordered: ReadonlyArray<{ skillId: string; priority: number }>) {
    const enabledById = new Map(skills.map((s) => [s.skillId, s.enabled] as const))
    setSkills((prev) => {
      const next = reordered.map(({ skillId, priority }) => {
        const existing = prev.find((s) => s.skillId === skillId)
        return existing
          ? { ...existing, priority }
          : { skillId, skillName: humanizeSkillName(skillId), rawName: skillId, priority, enabled: true }
      })
      return [...next].sort((a, b) => a.priority - b.priority)
    })
    try {
      await Promise.all(
        reordered.map(({ skillId, priority }) =>
          apiPost(`/api/agents/${agentId}/skills/${skillId}`, {
            priority,
            enabled: enabledById.get(skillId) ?? true,
          }),
        ),
      )
    } catch {
      void load()
    }
  }

  // Built-in skill catalog (served from memory, no DB) — options for the
  // quick-attach dropdown. Loaded once; attaching installs the skill lazily.
  const [catalog, setCatalog] = useState<
    readonly { name: string; category?: string; description?: string }[]
  >([])
  const [attaching, setAttaching] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiGet<Array<{ name: string; category?: string; description?: string }>>('/api/skills/catalog')
      .then((entries) => { if (!cancelled) setCatalog(entries) })
      .catch(() => { if (!cancelled) setCatalog([]) })
    return () => { cancelled = true }
  }, [])

  const attachableSkills = useMemo<SearchableSelectOption[]>(() => {
    const attached = new Set(skills.map((s) => s.rawName))
    return catalog
      .filter((c) => !attached.has(c.name))
      .map((c) => ({
        value: c.name,
        label: humanizeSkillName(c.name),
        description: c.description || c.category,
      }))
  }, [catalog, skills])

  // Install (idempotent) then attach at the end of the priority order.
  const handleAttach = useCallback(
    async (name: string) => {
      if (!agentId) return
      setAttaching(true)
      try {
        const installed = await apiPost<{ id: string }>('/api/skills/install', {
          name,
          source: 'marketplace',
        })
        if (installed?.id) {
          const nextPriority = skills.reduce((max, s) => Math.max(max, s.priority), 0) + 1
          await apiPost(`/api/agents/${agentId}/skills/${installed.id}`, {
            priority: nextPriority,
            enabled: true,
          })
          await load()
        }
      } catch {
        // best-effort — the picker stays open for another try
      } finally {
        setAttaching(false)
      }
    },
    [agentId, skills, load],
  )

  return (
    <AgentSkillsTab
      agentId={agentId}
      skills={skills}
      onToggle={handleToggle}
      onRemove={handleRemove}
      onReorder={handleReorder}
      onOpenMarketplace={onOpenMarketplace}
      attachableSkills={attachableSkills}
      onAttach={handleAttach}
      attaching={attaching}
    />
  )
}

// ---------------------------------------------------------------------------
// External Folders Tab
// ---------------------------------------------------------------------------

interface ExternalFolderRow {
  externalFolderId: string
  name: string
  containerPath: string
  readOnly: boolean
  priority: number
  enabled: boolean
}

function ExternalFoldersTab({
  agentId,
  onOpenManager,
}: {
  readonly agentId: string
  readonly onOpenManager: () => void
}) {
  const [folders, setFolders] = useState<readonly ExternalFolderRow[]>([])

  const load = useCallback(async () => {
    if (!agentId) {
      setFolders([])
      return
    }
    try {
      const agent = await apiGet<{
        externalFolders?: ReadonlyArray<{
          externalFolderId: string
          priority: number
          enabled: boolean
          externalFolder?: { name?: string; containerPath?: string; readOnly?: boolean }
        }>
      }>(`/api/agents/${agentId}`)
      const rows = (agent.externalFolders ?? [])
        .map((af) => ({
          externalFolderId: af.externalFolderId,
          name: af.externalFolder?.name ?? af.externalFolderId,
          containerPath: af.externalFolder?.containerPath ?? '',
          readOnly: af.externalFolder?.readOnly ?? false,
          priority: af.priority,
          enabled: af.enabled,
        }))
        .sort((a, b) => a.priority - b.priority)
      setFolders(rows)
    } catch {
      setFolders([])
    }
  }, [agentId])

  useEffect(() => {
    void load()
  }, [load])

  // The attach endpoint upserts (priority, enabled), so single-field updates
  // must send both or the other resets to its schema default.
  async function handleToggle(folderId: string, enabled: boolean) {
    const target = folders.find((f) => f.externalFolderId === folderId)
    setFolders((prev) => prev.map((f) => (f.externalFolderId === folderId ? { ...f, enabled } : f)))
    try {
      await apiPost(`/api/agents/${agentId}/external-folders/${folderId}`, {
        priority: target?.priority ?? 0,
        enabled,
      })
    } catch {
      void load()
    }
  }

  async function handleRemove(folderId: string) {
    setFolders((prev) => prev.filter((f) => f.externalFolderId !== folderId))
    try {
      await apiDelete(`/api/agents/${agentId}/external-folders/${folderId}`)
    } catch {
      void load()
    }
  }

  async function handleReorder(
    reordered: ReadonlyArray<{ externalFolderId: string; priority: number }>,
  ) {
    const byId = new Map(folders.map((f) => [f.externalFolderId, f] as const))
    setFolders((prev) => {
      const next = reordered.map(({ externalFolderId, priority }) => {
        const existing = prev.find((f) => f.externalFolderId === externalFolderId)
        return existing
          ? { ...existing, priority }
          : {
              externalFolderId,
              name: externalFolderId,
              containerPath: '',
              readOnly: false,
              priority,
              enabled: true,
            }
      })
      return [...next].sort((a, b) => a.priority - b.priority)
    })
    try {
      await Promise.all(
        reordered.map(({ externalFolderId, priority }) =>
          apiPost(`/api/agents/${agentId}/external-folders/${externalFolderId}`, {
            priority,
            enabled: byId.get(externalFolderId)?.enabled ?? true,
          }),
        ),
      )
    } catch {
      void load()
    }
  }

  return (
    <AgentExternalFoldersTab
      agentId={agentId}
      folders={folders}
      onToggle={handleToggle}
      onRemove={handleRemove}
      onReorder={handleReorder}
      onOpenManager={onOpenManager}
    />
  )
}

// ---------------------------------------------------------------------------
// Safety Section (controlled — edits the shared draft)
// ---------------------------------------------------------------------------

function SafetySection({
  draft,
  provider,
  onChange,
}: {
  readonly draft: AgentDraft
  readonly provider: AgentProviderId
  readonly onChange: (patch: Partial<AgentDraft>) => void
}) {
  const { t } = useTranslation('agentDrawer')
  const [newScopePath, setNewScopePath] = useState('')

  const apiProvider = isApiProvider(provider)
  const providerLabel = provider === 'perplexity' ? 'Perplexity' : 'OpenAI'
  const tools = draft.allowedTools
  const safetyLevel = getSafetyLevel(tools)
  const allTools = tools.includes('*')

  const SAFETY_OPTIONS: readonly { value: SafetyLevel; label: string; description: string }[] = [
    {
      value: 'cautious',
      label: t('safety.cautious.label'),
      description: t('safety.cautious.description'),
    },
    {
      value: 'balanced',
      label: t('safety.balanced.label'),
      description: t('safety.balanced.description'),
    },
    {
      value: 'autonomous',
      label: t('safety.autonomous.label'),
      description: t('safety.autonomous.description'),
    },
  ]

  function addScopePath() {
    const trimmed = newScopePath.trim()
    if (!trimmed || draft.scope.includes(trimmed)) return
    onChange({ scope: [...draft.scope, trimmed] })
    setNewScopePath('')
  }

  function removeScopePath(path: string) {
    onChange({ scope: draft.scope.filter((p) => p !== path) })
  }

  // Quick presets that rewrite the tool set.
  function setSafetyLevel(level: SafetyLevel) {
    if (level === 'cautious') {
      onChange({ allowedTools: [] })
    } else if (level === 'autonomous') {
      onChange({ allowedTools: ['*'] })
    } else {
      // Balanced = explicit selection; drop the all-tools wildcard so the
      // per-tool checkboxes below take over.
      onChange({ allowedTools: draft.allowedTools.filter((tool) => tool !== '*') })
    }
  }

  function toggleTool(name: string) {
    const next = new Set(draft.allowedTools)
    next.delete('*') // picking individual tools leaves "all tools" mode
    if (next.has(name)) next.delete(name)
    else next.add(name)
    onChange({ allowedTools: [...next] })
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('safety.level')}
        </label>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label={t('safety.levelAria')}>
          {SAFETY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={safetyLevel === opt.value}
              onClick={() => setSafetyLevel(opt.value)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50',
                safetyLevel === opt.value ? 'border-primary bg-primary/5' : 'border-border bg-card',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  safetyLevel === opt.value ? 'border-primary' : 'border-muted-foreground/50',
                )}
              >
                {safetyLevel === opt.value && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('common:terms.scopePaths')}
        </label>
        {draft.scope.length > 0 && (
          <div className="flex flex-col gap-1">
            {draft.scope.map((path) => (
              <div
                key={path}
                className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5"
              >
                <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs">{path}</span>
                <button
                  type="button"
                  onClick={() => removeScopePath(path)}
                  aria-label={t('action.removePath', { path })}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newScopePath}
            onChange={(e) => setNewScopePath(e.target.value)}
            placeholder={t('placeholder.scopePath')}
            className="font-mono text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addScopePath()
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addScopePath}
            aria-label={t('action.addPath')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('common:terms.allowedTools')}
        </label>
        {apiProvider ? (
          <p className="text-xs text-muted-foreground">
            <Trans
              t={t}
              i18nKey="safety.toolsApiNote"
              values={{ provider: providerLabel }}
              components={[
                <span key="0" className="font-medium text-foreground" />,
                <span key="1" className="font-medium text-foreground" />,
              ]}
            />
          </p>
        ) : allTools ? (
          <p className="text-xs text-muted-foreground">
            <Trans
              t={t}
              i18nKey="safety.toolsAllNote"
              components={[
                <span key="0" className="font-medium text-foreground" />,
                <span key="1" className="font-medium text-foreground" />,
              ]}
            />
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {TOOL_OPTIONS.map((tool) => {
              const checked = tools.includes(tool.name)
              return (
                <label key={tool.name} className="flex cursor-pointer items-center gap-2.5">
                  <div
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleTool(tool.name)}
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                      checked
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/50 bg-background',
                    )}
                  >
                    {checked && (
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{t(tool.labelKey)}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Conversations Tab
// ---------------------------------------------------------------------------

function ConversationsTab({ agentId: _agentId }: { readonly agentId: string }) {
  const { t, i18n } = useTranslation('agentDrawer')
  const conversations: ConversationRow[] = []

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{t('conversations.emptyTitle')}</p>
          <p className="text-xs text-muted-foreground">{t('conversations.emptyDescription')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 py-4" role="list" aria-label={t('conversations.listAria')}>
      {conversations.map((conv) => (
        <div
          key={conv.id}
          role="listitem"
          className="flex items-center gap-3 rounded-md border bg-card p-3 hover:bg-muted/50 cursor-pointer transition-colors"
        >
          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{t('conversations.sessionTitle', { id: conv.id.slice(0, 8) })}</p>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(conv.startedAt, i18n.language)}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {t('conversations.messageCount', { count: conv.messageCount })}
              </span>
            </div>
          </div>
          <Badge
            variant={conv.status === 'active' ? 'default' : 'secondary'}
            className="text-[10px]"
          >
            {conv.status === 'active' ? t('conversations.statusActive') : t('conversations.statusEnded')}
          </Badge>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MCP Tab wrapper
// ---------------------------------------------------------------------------

function McpTab({
  agentId,
  mcpServers,
  mcpAssignments,
  onToggle,
  onOpenManagement,
}: {
  readonly agentId: string
  readonly mcpServers: readonly McpServer[]
  readonly mcpAssignments: readonly AgentMcpAssignment[]
  readonly onToggle: (serverId: string, assigned: boolean) => void
  readonly onOpenManagement: () => void
}) {
  return (
    <AgentMcpTab
      agentId={agentId}
      allServers={mcpServers}
      assignments={mcpAssignments}
      onToggle={onToggle}
      onOpenManagement={onOpenManagement}
    />
  )
}

// ---------------------------------------------------------------------------
// Advanced Section (controlled — edits the shared draft)
// ---------------------------------------------------------------------------

function AdvancedSection({
  draft,
  onChange,
}: {
  readonly draft: AgentDraft
  readonly onChange: (patch: Partial<AgentDraft>) => void
}) {
  const { t } = useTranslation('agentDrawer')
  const loopValue: LoopConfigValue = {
    loopEnabled: draft.loopEnabled,
    loopCriteria: draft.loopCriteria,
    maxIterations: draft.maxIterations,
  }

  function handleLoopChange(val: LoopConfigValue) {
    onChange({
      loopEnabled: val.loopEnabled,
      loopCriteria: val.loopCriteria,
      maxIterations: val.maxIterations,
    })
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Loop configuration */}
      <LoopConfig value={loopValue} onChange={handleLoopChange} />

      <Separator />

      {/* Agent Teams */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium">{t('advanced.teams.title')}</p>
          <p className="text-xs text-muted-foreground">
            {t('advanced.teams.description')}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={draft.teamEnabled}
          aria-label={draft.teamEnabled ? t('advanced.teams.disableAria') : t('advanced.teams.enableAria')}
          onClick={() => onChange({ teamEnabled: !draft.teamEnabled })}
          className={cn(
            'relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
            draft.teamEnabled ? 'bg-primary' : 'bg-muted',
          )}
        >
          <span
            className={cn(
              'block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
              draft.teamEnabled ? 'translate-x-4' : 'translate-x-0',
            )}
          />
        </button>
      </div>

      <Separator />

      {/* Permission mode */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('advanced.permissionMode')}
        </label>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label={t('advanced.permissionModeAria')}>
          {PERMISSION_MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={draft.permissionMode === opt.value}
              onClick={() => onChange({ permissionMode: opt.value })}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50',
                draft.permissionMode === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  draft.permissionMode === opt.value
                    ? 'border-primary'
                    : 'border-muted-foreground/50',
                )}
              >
                {draft.permissionMode === opt.value && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{t(opt.labelKey)}</span>
                <span className="text-xs text-muted-foreground">{t(opt.descriptionKey)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const ALL_TABS = ['configure', 'capabilities', 'safety', 'history'] as const
type DrawerTab = (typeof ALL_TABS)[number]

const TAB_LABEL_KEY: Record<DrawerTab, 'tab.configure' | 'tab.capabilities' | 'tab.safety' | 'tab.history'> = {
  configure: 'tab.configure',
  capabilities: 'tab.capabilities',
  safety: 'tab.safety',
  history: 'tab.history',
}

const TAB_MIN_TIER: Record<DrawerTab, 'simple' | 'standard' | 'full'> = {
  configure: 'simple',
  capabilities: 'simple',
  safety: 'standard',
  history: 'standard',
}

const TIER_ORDER = { simple: 0, standard: 1, full: 2 } as const

// Tabs whose fields are persisted via the unified Save button (the others save
// to their own endpoints immediately), so the Save bar only shows on these.
const SAVE_TABS = new Set<DrawerTab>(['configure', 'safety'])

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Complexity-aware: in Simple mode, only Configure + Capabilities tabs are
 * shown. In Standard mode, Safety + History are added.
 *
 * All agent-record settings across the Configure and Safety tabs are edited in
 * a single in-memory draft and persisted together by one footer Save button, so
 * nothing is silently dropped (a custom model id, loop config, etc.).
 */
export function AgentDrawer({
  agent,
  open,
  onOpenChange,
  onSave,
  onOpenMarketplace,
  onOpenExternalFolders,
  mcpServers = [],
  mcpAssignments = [],
  onMcpToggle,
  onOpenMcpManagement,
}: AgentDrawerProps) {
  const { t } = useTranslation('agentDrawer')
  const [activeTab, setActiveTab] = useState<DrawerTab>('configure')
  const { tier } = useComplexity()
  const visibleTabs = ALL_TABS.filter((tab) => TIER_ORDER[tier] >= TIER_ORDER[TAB_MIN_TIER[tab]])

  // The `agent` prop only carries header essentials; the editable tabs need the
  // agent's REAL persisted config, so load the full record from the API while
  // the drawer is open. Until it arrives the tab body shows a loading state —
  // rendering the tabs against placeholder values is what previously let a save
  // overwrite real settings (e.g. wipe allowedTools) with defaults.
  const agentId = agent?.id ?? ''
  const [fullAgent, setFullAgent] = useState<Agent | null>(null)
  const [draft, setDraft] = useState<AgentDraft | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  // Latest stub, read inside the load effect without making it a dependency
  // (the stub is a fresh object each render — adding it would refetch forever).
  const agentRef = useRef(agent)
  agentRef.current = agent
  // Latest loaded record, used to roll back an optimistic update on a failed
  // save WITHOUT touching the draft (so the user's unsaved edits survive a retry).
  const fullAgentRef = useRef<Agent | null>(null)
  fullAgentRef.current = fullAgent

  // Seed both the source-of-truth record and the editable draft together so the
  // draft never re-initializes from an in-place fullAgent update (e.g. an
  // immediate memory-toggle save) and silently discards unsaved edits.
  const applyLoaded = useCallback((loaded: Agent) => {
    setFullAgent(loaded)
    setDraft(draftFromAgent(loaded))
    setSaveState('idle')
  }, [])

  useEffect(() => {
    if (!open || !agentId) {
      setFullAgent(null)
      setDraft(null)
      setLoadError(null)
      setSaveState('idle')
      return
    }
    let cancelled = false
    setFullAgent(null)
    setDraft(null)
    setLoadError(null)
    setSaveState('idle')
    apiGet<AgentApiRecord>(`/api/agents/${agentId}`)
      .then((rec) => {
        if (!cancelled) applyLoaded(toAgent(rec))
      })
      .catch(async () => {
        // The record may not exist yet: palette-dropped agents are persisted
        // lazily (on run). Create it from the node stub so it can be edited
        // before the first run, then load — mirrors the run-recovery path.
        if (cancelled) return
        const stub = agentRef.current
        if (!stub) {
          setLoadError(t('drawer.loadError'))
          return
        }
        try {
          const created = await apiPost<AgentApiRecord>('/api/agents', buildCreatePayload(stub))
          if (!cancelled) applyLoaded(toAgent(created))
        } catch {
          if (!cancelled) setLoadError(t('drawer.loadError'))
        }
      })
    return () => {
      cancelled = true
    }
  }, [open, agentId, applyLoaded, t])

  useEffect(() => {
    if (agent?.id) setActiveTab('configure')
  }, [agent?.id])

  const updateDraft = useCallback((patch: Partial<AgentDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
    setSaveState('idle')
  }, [])

  // Persist a set of agent-record changes. The canvas autosave only stores
  // layout, so this PATCH is the one thing that writes Configure/Safety/Advanced
  // changes back to the DB the engine reads. Optimistically reflect the change
  // locally, then mirror it into the live canvas node via the parent onSave.
  // Returns whether the write succeeded so the caller can surface save state.
  const persist = useCallback(
    async (updates: Partial<Agent>): Promise<boolean> => {
      if (!agentId) return false
      const snapshot = fullAgentRef.current
      setFullAgent((prev) => (prev ? { ...prev, ...updates } : prev))

      // Server-safe payload: drop undefined values, and a null `model` (the
      // API's model field is a string; clearing it isn't supported here).
      const payload: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) continue
        if (key === 'model' && value === null) continue
        payload[key] = value
      }
      if (Object.keys(payload).length > 0) {
        try {
          await apiPatch(`/api/agents/${agentId}`, payload)
        } catch {
          // Roll back ONLY the keys this call touched, to their pre-save values,
          // and do it functionally — a concurrent persist (e.g. the memory toggle
          // racing the Save button) may have applied other keys we must not clobber.
          // The draft is left untouched so the user keeps their edits to retry.
          setFullAgent((prev) => {
            if (!prev) return prev
            const reverted: Record<string, unknown> = { ...prev }
            const snap = snapshot as Record<string, unknown> | null
            for (const key of Object.keys(updates)) {
              reverted[key] = snap ? snap[key] : undefined
            }
            return reverted as unknown as Agent
          })
          return false
        }
      }
      onSave(updates)
      return true
    },
    [agentId, onSave],
  )

  // Unified Save: diff the draft against the loaded record and PATCH the delta.
  const updates = fullAgent && draft ? computeUpdates(draft, fullAgent) : {}
  const isDirty = Object.keys(updates).length > 0
  const saving = saveState === 'saving'

  // Name and persona are required server-side (z.string().min(1)). Block the save
  // when either is empty: because the whole delta is sent in one PATCH, an empty
  // value would 400 the entire batch and lose every other edit, with no way to
  // succeed on retry. Surfacing it here keeps Save honest and recoverable.
  const validationError =
    draft && draft.name.trim().length === 0
      ? t('drawer.validationNameRequired')
      : draft && draft.persona.trim().length === 0
        ? t('drawer.validationPersonaRequired')
        : null

  const handleSaveAll = useCallback(async () => {
    if (!fullAgent || !draft) return
    if (draft.name.trim().length === 0 || draft.persona.trim().length === 0) return
    const delta = computeUpdates(draft, fullAgent)
    if (Object.keys(delta).length === 0) return
    setSaveState('saving')
    const ok = await persist(delta)
    setSaveState(ok ? 'saved' : 'error')
  }, [fullAgent, draft, persist])

  // Show the save bar on the settings tabs, and keep it visible on any tab while
  // there are pending changes so they can't be lost by switching tabs first.
  const showSaveBar = fullAgent !== null && (SAVE_TABS.has(activeTab) || isDirty)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0">
        {agent === null ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">{t('drawer.noAssistant')}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="flex-row items-center gap-3 border-b px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                {agent.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- agent avatar from arbitrary URL
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <Bot className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="truncate text-base leading-tight">{agent.name}</SheetTitle>
                <SheetDescription className="sr-only">{t('drawer.configureAria', { name: agent.name })}</SheetDescription>
                <div className="mt-1">
                  <Badge variant={STATUS_VARIANT[agent.status]} className="text-[10px]">
                    {t(STATUS_LABEL_KEY[agent.status])}
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as DrawerTab)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TabsList className="mx-4 mt-3 w-auto justify-start rounded-none border-b bg-transparent p-0">
                {visibleTabs.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={cn(
                      'rounded-none border-b-2 border-transparent px-3 py-2 text-xs font-medium',
                      'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                    )}
                  >
                    {t(TAB_LABEL_KEY[tab])}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
                {fullAgent === null || draft === null ? (
                  <div className="flex h-full items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">{loadError ?? t('common:status.loading')}</p>
                  </div>
                ) : (
                  <>
                    {/* Configure = Settings + Advanced merged */}
                    <TabsContent value="configure" className="mt-0">
                      <SettingsSection
                        draft={draft}
                        provider={fullAgent.provider}
                        onChange={updateDraft}
                      />
                      <Separator className="my-4" />
                      <AdvancedSection draft={draft} onChange={updateDraft} />
                    </TabsContent>

                    {/* Capabilities = Skills + MCP merged */}
                    <TabsContent value="capabilities" className="mt-0">
                      <SkillsTab
                        agentId={fullAgent.id}
                        onOpenMarketplace={onOpenMarketplace ?? (() => undefined)}
                      />
                      <Separator className="my-4" />
                      <McpTab
                        agentId={fullAgent.id}
                        mcpServers={mcpServers}
                        mcpAssignments={mcpAssignments}
                        onToggle={(serverId, assigned) =>
                          onMcpToggle?.(fullAgent.id, serverId, assigned)
                        }
                        onOpenManagement={onOpenMcpManagement ?? (() => undefined)}
                      />
                      <Separator className="my-4" />
                      <ExternalFoldersTab
                        agentId={fullAgent.id}
                        onOpenManager={onOpenExternalFolders ?? (() => undefined)}
                      />
                    </TabsContent>

                    {/* Safety (standalone) */}
                    <TabsContent value="safety" className="mt-0">
                      <SafetySection
                        draft={draft}
                        provider={fullAgent.provider}
                        onChange={updateDraft}
                      />
                    </TabsContent>

                    {/* History = Memory + Conversations merged */}
                    <TabsContent value="history" className="mt-0">
                      <AgentMemoryTab
                        agentId={fullAgent.id}
                        memoryEnabled={fullAgent.memoryEnabled}
                        onSave={(u) => void persist(u)}
                      />
                      <Separator className="my-4" />
                      <ConversationsTab agentId={fullAgent.id} />
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>

            {/* Unified save bar — persists every Configure/Safety setting at once */}
            {showSaveBar && (
              <div className="flex items-center justify-between gap-3 border-t bg-background px-6 py-3">
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    validationError || saveState === 'error'
                      ? 'text-destructive'
                      : 'text-muted-foreground',
                  )}
                  aria-live="polite"
                >
                  {validationError ? (
                    // A required field is empty: Save is blocked until it's fixed.
                    validationError
                  ) : saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t('common:status.saving')}
                    </>
                  ) : saveState === 'error' ? (
                    // A failed save leaves the draft dirty (so the user can
                    // retry), so this must take precedence over the dirty label.
                    t('drawer.saveFailed')
                  ) : isDirty ? (
                    t('drawer.unsavedChanges')
                  ) : saveState === 'saved' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-primary" />
                      {t('drawer.allChangesSaved')}
                    </>
                  ) : (
                    t('drawer.noChanges')
                  )}
                </span>
                <Button
                  size="sm"
                  onClick={() => void handleSaveAll()}
                  disabled={!isDirty || saving || validationError !== null}
                >
                  {t('common:action.save')}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
