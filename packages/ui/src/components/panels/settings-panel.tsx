'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle, CheckCircle2, XCircle, Loader2,
  Palette, Languages, KeyRound, Plug, ShieldCheck, Cpu, SlidersHorizontal,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTheme, type ThemeMode } from '@/hooks/use-theme'
import { useLocale } from '@/hooks/use-locale'
import { LOCALE_LABELS, type AppLocale } from '@/lib/i18n/config'
import { useTranslation } from 'react-i18next'
import type { ParseKeys } from 'i18next'
import { CredentialsSection } from './credentials-section'
import { apiGet, apiPut } from '@/lib/api'
import { NETWORK } from '@rondoflow/shared'

// ─── Types ─────────────────────────────────────────────────────────────────

type SafetyLevel = 'cautious' | 'balanced' | 'autonomous'
type DefaultModel = 'deep-thinker' | 'all-rounder' | 'quick-helper'
type ConnectionStatus = 'connected' | 'disconnected' | 'checking'

export interface SettingsPanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

// ─── Storage keys ──────────────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'rondoflow:settings:'

function storageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function storageSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value))
  } catch {
    // Ignore write errors
  }
}

// ─── Section wrapper ───────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  readonly title: string
  readonly children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

// ─── Slider row ────────────────────────────────────────────────────────────

function SliderRow({
  label,
  min,
  max,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  readonly label: string
  readonly min: number
  readonly max: number
  readonly value: number
  readonly onChange: (v: number) => void
  readonly leftLabel?: string
  readonly rightLabel?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        {leftLabel && (
          <span className="shrink-0 text-xs text-muted-foreground">{leftLabel}</span>
        )}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-primary"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
        {rightLabel && (
          <span className="shrink-0 text-xs text-muted-foreground">{rightLabel}</span>
        )}
      </div>
    </div>
  )
}

// ─── Radio group row ───────────────────────────────────────────────────────

function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  readonly label: string
  readonly options: ReadonlyArray<{ value: T; label: string; description?: string }>
  readonly value: T
  readonly onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
              value === opt.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-muted/50',
            )}
          >
            <input
              type="radio"
              name={label}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 accent-primary"
              aria-label={opt.label}
            />
            <div>
              <p className="text-sm font-medium leading-tight">{opt.label}</p>
              {opt.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── Toggle row ────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  warning,
}: {
  readonly label: string
  readonly description?: string
  readonly checked: boolean
  readonly onChange: (v: boolean) => void
  readonly warning?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium">{label}</label>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            checked ? 'bg-primary' : 'bg-muted',
          )}
          aria-label={label}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
              checked ? 'translate-x-4' : 'translate-x-0',
            )}
          />
        </button>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {warning && checked && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
          <p className="text-xs text-amber-400">{warning}</p>
        </div>
      )}
    </div>
  )
}

// ─── Connection indicator ──────────────────────────────────────────────────

function ConnectionIndicator({ status }: { readonly status: ConnectionStatus }) {
  const { t } = useTranslation('settings')
  if (status === 'checking') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        {t('connection.status.checking')}
      </span>
    )
  }
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        {t('connection.status.connected')}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-destructive">
      <XCircle className="h-3.5 w-3.5" aria-hidden />
      {t('connection.status.unreachable')}
    </span>
  )
}

// ─── Tabs ──────────────────────────────────────────────────────────────────

type SettingsTab =
  | 'appearance'
  | 'language'
  | 'apiKeys'
  | 'connection'
  | 'safety'
  | 'models'
  | 'advanced'

const SETTINGS_TABS: ReadonlyArray<{
  readonly value: SettingsTab
  readonly labelKey: ParseKeys<'settings'>
  readonly icon: React.ElementType
}> = [
  { value: 'appearance', labelKey: 'appearance.section', icon: Palette },
  { value: 'language', labelKey: 'language.section', icon: Languages },
  { value: 'apiKeys', labelKey: 'apiKeys.section', icon: KeyRound },
  { value: 'connection', labelKey: 'connection.section', icon: Plug },
  { value: 'safety', labelKey: 'safety.section', icon: ShieldCheck },
  { value: 'models', labelKey: 'models.section', icon: Cpu },
  { value: 'advanced', labelKey: 'advanced.section', icon: SlidersHorizontal },
]

// ─── SettingsPanel ─────────────────────────────────────────────────────────

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  // ── Theme ────────────────────────────────────────────────────────────
  const { mode: themeMode, setMode: setThemeMode } = useTheme()

  // ── Language ──────────────────────────────────────────────────────────
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation(['settings', 'common'])

  // ── Connection ────────────────────────────────────────────────────────
  const [serverUrl, setServerUrl] = useState(() =>
    storageGet<string>('serverUrl', NETWORK.DEFAULT_API_URL),
  )
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

  // ── Safety ────────────────────────────────────────────────────────────
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>(() =>
    storageGet<SafetyLevel>('safetyLevel', 'balanced'),
  )

  // ── Models ────────────────────────────────────────────────────────────
  const [defaultModel, setDefaultModel] = useState<DefaultModel>(() =>
    storageGet<DefaultModel>('defaultModel', 'all-rounder'),
  )

  // ── Advanced ──────────────────────────────────────────────────────────
  const [agentTeams, setAgentTeams] = useState(() => storageGet<boolean>('agentTeams', false))
  const [maxConcurrent, setMaxConcurrent] = useState(() =>
    storageGet<number>('maxConcurrent', 5),
  )
  // Global per-run spend cap, backed by the server (canonical global policy).
  // '' = no cap. Loaded when the panel opens, saved on blur.
  const [maxBudget, setMaxBudget] = useState('')
  const [budgetStatus, setBudgetStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  // Director per-evaluation spend cap, backed by the server. '' = use the default.
  const [directorBudget, setDirectorBudget] = useState('')
  const [directorBudgetStatus, setDirectorBudgetStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  // Director per-evaluation wall-clock timeout (seconds), backed by the server. '' = default.
  const [directorTimeout, setDirectorTimeout] = useState('')
  const [directorTimeoutStatus, setDirectorTimeoutStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Persist all settings to localStorage on change
  useEffect(() => { storageSet('serverUrl', serverUrl) }, [serverUrl])
  useEffect(() => { storageSet('safetyLevel', safetyLevel) }, [safetyLevel])
  useEffect(() => { storageSet('defaultModel', defaultModel) }, [defaultModel])
  useEffect(() => { storageSet('agentTeams', agentTeams) }, [agentTeams])
  useEffect(() => { storageSet('maxConcurrent', maxConcurrent) }, [maxConcurrent])

  // Load the global budget from the server whenever the panel opens.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    apiGet<{ maxBudgetUsd: number | null }>('/api/settings/budget')
      .then((d) => {
        if (!cancelled) setMaxBudget(d.maxBudgetUsd != null ? String(d.maxBudgetUsd) : '')
      })
      .catch(() => { /* keep whatever is shown */ })
    apiGet<{ maxBudgetUsd: number | null }>('/api/settings/director-budget')
      .then((d) => {
        if (!cancelled) setDirectorBudget(d.maxBudgetUsd != null ? String(d.maxBudgetUsd) : '')
      })
      .catch(() => { /* keep whatever is shown */ })
    apiGet<{ timeoutSec: number | null }>('/api/settings/director-timeout')
      .then((d) => {
        if (!cancelled) setDirectorTimeout(d.timeoutSec != null ? String(d.timeoutSec) : '')
      })
      .catch(() => { /* keep whatever is shown */ })
    return () => { cancelled = true }
  }, [open])

  async function saveBudget() {
    const trimmed = maxBudget.trim()
    let value: number | null
    if (trimmed === '') {
      value = null
    } else {
      const n = Number(trimmed)
      if (!Number.isFinite(n) || n <= 0) { setBudgetStatus('error'); return }
      value = n
    }
    setBudgetStatus('saving')
    try {
      const d = await apiPut<{ maxBudgetUsd: number | null }>('/api/settings/budget', { maxBudgetUsd: value })
      setMaxBudget(d.maxBudgetUsd != null ? String(d.maxBudgetUsd) : '')
      setBudgetStatus('saved')
    } catch {
      setBudgetStatus('error')
    }
  }

  async function saveDirectorBudget() {
    const trimmed = directorBudget.trim()
    let value: number | null
    if (trimmed === '') {
      value = null
    } else {
      const n = Number(trimmed)
      if (!Number.isFinite(n) || n <= 0) { setDirectorBudgetStatus('error'); return }
      value = n
    }
    setDirectorBudgetStatus('saving')
    try {
      const d = await apiPut<{ maxBudgetUsd: number | null }>('/api/settings/director-budget', { maxBudgetUsd: value })
      setDirectorBudget(d.maxBudgetUsd != null ? String(d.maxBudgetUsd) : '')
      setDirectorBudgetStatus('saved')
    } catch {
      setDirectorBudgetStatus('error')
    }
  }

  async function saveDirectorTimeout() {
    const trimmed = directorTimeout.trim()
    let value: number | null
    if (trimmed === '') {
      value = null
    } else {
      const n = Number(trimmed)
      if (!Number.isFinite(n) || n <= 0) { setDirectorTimeoutStatus('error'); return }
      value = n
    }
    setDirectorTimeoutStatus('saving')
    try {
      const d = await apiPut<{ timeoutSec: number | null }>('/api/settings/director-timeout', { timeoutSec: value })
      setDirectorTimeout(d.timeoutSec != null ? String(d.timeoutSec) : '')
      setDirectorTimeoutStatus('saved')
    } catch {
      setDirectorTimeoutStatus('error')
    }
  }

  function handleTestConnection() {
    setConnectionStatus('checking')
    // Simulate a connectivity probe — replace with real fetch in production
    setTimeout(() => {
      setConnectionStatus(serverUrl.includes('localhost') ? 'connected' : 'disconnected')
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[640px] max-h-[85vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0"
      >
        {/* Header */}
        <DialogHeader className="shrink-0 space-y-0 border-b border-border px-6 py-4 text-left">
          <DialogTitle className="text-base">{t('panel.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('panel.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Body: vertical tab rail + scrollable content */}
        <Tabs
          defaultValue="appearance"
          orientation="vertical"
          className="flex min-h-0 flex-1 flex-row"
        >
          <TabsList className="flex h-full w-48 shrink-0 flex-col items-stretch justify-start gap-0.5 rounded-none border-r border-border bg-muted/20 p-2">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    'h-9 w-full justify-start gap-2.5 rounded-md px-3 text-sm font-medium text-muted-foreground',
                    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {t(tab.labelKey)}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {/* Appearance */}
            <TabsContent value="appearance" className="mt-0">
              <Section title={t('appearance.section')}>
                <RadioGroup<ThemeMode>
                  label={t('theme.label')}
                  value={themeMode}
                  onChange={setThemeMode}
                  options={[
                    { value: 'system', label: t('theme.option.system') },
                    { value: 'light', label: t('theme.option.light') },
                    { value: 'dark', label: t('theme.option.dark') },
                  ]}
                />
              </Section>
            </TabsContent>

            {/* Language */}
            <TabsContent value="language" className="mt-0">
              <Section title={t('language.section')}>
                <RadioGroup<AppLocale>
                  label={t('language.label')}
                  value={locale}
                  onChange={setLocale}
                  options={[
                    { value: 'en', label: LOCALE_LABELS.en },
                    { value: 'sk', label: LOCALE_LABELS.sk },
                    { value: 'es', label: LOCALE_LABELS.es },
                    { value: 'fr', label: LOCALE_LABELS.fr },
                    { value: 'de', label: LOCALE_LABELS.de },
                  ]}
                />
              </Section>
            </TabsContent>

            {/* API Keys & Integrations */}
            <TabsContent value="apiKeys" className="mt-0">
              <Section title={t('apiKeys.section')}>
                <CredentialsSection />
              </Section>
            </TabsContent>

            {/* Connection */}
            <TabsContent value="connection" className="mt-0">
              <Section title={t('connection.section')}>
                <div className="flex flex-col gap-2">
                  <label htmlFor="server-url" className="text-sm font-medium">
                    {t('connection.serverUrl')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="server-url"
                      value={serverUrl}
                      onChange={(e) => {
                        setServerUrl(e.target.value)
                        setConnectionStatus('disconnected')
                      }}
                      placeholder={t('connection.serverUrlPlaceholder')}
                      className="flex-1 text-sm"
                      aria-describedby="server-url-status"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs"
                      onClick={handleTestConnection}
                      disabled={connectionStatus === 'checking'}
                      aria-label={t('connection.testAriaLabel')}
                    >
                      {t('common:action.test')}
                    </Button>
                  </div>
                  <div id="server-url-status">
                    <ConnectionIndicator status={connectionStatus} />
                  </div>
                </div>
              </Section>
            </TabsContent>

            {/* Safety */}
            <TabsContent value="safety" className="mt-0">
              <Section title={t('safety.section')}>
                <RadioGroup<SafetyLevel>
                  label={t('safety.globalLevel')}
                  value={safetyLevel}
                  onChange={setSafetyLevel}
                  options={[
                    {
                      value: 'cautious',
                      label: t('safety.level.cautious.label'),
                      description: t('safety.level.cautious.description'),
                    },
                    {
                      value: 'balanced',
                      label: t('safety.level.balanced.label'),
                      description: t('safety.level.balanced.description'),
                    },
                    {
                      value: 'autonomous',
                      label: t('safety.level.autonomous.label'),
                      description: t('safety.level.autonomous.description'),
                    },
                  ]}
                />
              </Section>
            </TabsContent>

            {/* Models */}
            <TabsContent value="models" className="mt-0">
              <Section title={t('models.section')}>
                <RadioGroup<DefaultModel>
                  label={t('models.default')}
                  value={defaultModel}
                  onChange={setDefaultModel}
                  options={[
                    {
                      value: 'deep-thinker',
                      label: t('models.option.deepThinker.label'),
                      description: t('models.option.deepThinker.description'),
                    },
                    {
                      value: 'all-rounder',
                      label: t('models.option.allRounder.label'),
                      description: t('models.option.allRounder.description'),
                    },
                    {
                      value: 'quick-helper',
                      label: t('models.option.quickHelper.label'),
                      description: t('models.option.quickHelper.description'),
                    },
                  ]}
                />
              </Section>
            </TabsContent>

            {/* Advanced */}
            <TabsContent value="advanced" className="mt-0">
              <Section title={t('advanced.section')}>
                <ToggleRow
                  label={t('advanced.agentTeams.label')}
                  description={t('advanced.agentTeams.description')}
                  checked={agentTeams}
                  onChange={setAgentTeams}
                  warning={t('advanced.agentTeams.warning')}
                />

                <SliderRow
                  label={t('advanced.maxConcurrent', { count: maxConcurrent })}
                  min={1}
                  max={10}
                  value={maxConcurrent}
                  onChange={setMaxConcurrent}
                  leftLabel="1"
                  rightLabel="10"
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="max-budget" className="text-sm font-medium">
                    {t('advanced.maxBudget.label')}
                  </label>
                  <Input
                    id="max-budget"
                    type="number"
                    min={0}
                    step={0.01}
                    value={maxBudget}
                    onChange={(e) => { setMaxBudget(e.target.value); setBudgetStatus('idle') }}
                    onBlur={saveBudget}
                    placeholder={t('advanced.maxBudget.placeholder')}
                    className="text-sm"
                    aria-describedby="max-budget-desc"
                  />
                  <p id="max-budget-desc" className="text-xs text-muted-foreground">
                    {t('advanced.maxBudget.description')}
                    {budgetStatus === 'saving' && <> · {t('common:status.saving')}</>}
                    {budgetStatus === 'saved' && <> · {t('common:status.saved')}</>}
                    {budgetStatus === 'error' && (
                      <span className="text-destructive"> · {t('common:status.error')}</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="director-budget" className="text-sm font-medium">
                    {t('advanced.directorBudget.label')}
                  </label>
                  <Input
                    id="director-budget"
                    type="number"
                    min={0}
                    step={0.01}
                    value={directorBudget}
                    onChange={(e) => { setDirectorBudget(e.target.value); setDirectorBudgetStatus('idle') }}
                    onBlur={saveDirectorBudget}
                    placeholder={t('advanced.directorBudget.placeholder')}
                    className="text-sm"
                    aria-describedby="director-budget-desc"
                  />
                  <p id="director-budget-desc" className="text-xs text-muted-foreground">
                    {t('advanced.directorBudget.description')}
                    {directorBudgetStatus === 'saving' && <> · {t('common:status.saving')}</>}
                    {directorBudgetStatus === 'saved' && <> · {t('common:status.saved')}</>}
                    {directorBudgetStatus === 'error' && (
                      <span className="text-destructive"> · {t('common:status.error')}</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="director-timeout" className="text-sm font-medium">
                    {t('advanced.directorTimeout.label')}
                  </label>
                  <Input
                    id="director-timeout"
                    type="number"
                    min={0}
                    step={1}
                    value={directorTimeout}
                    onChange={(e) => { setDirectorTimeout(e.target.value); setDirectorTimeoutStatus('idle') }}
                    onBlur={saveDirectorTimeout}
                    placeholder={t('advanced.directorTimeout.placeholder')}
                    className="text-sm"
                    aria-describedby="director-timeout-desc"
                  />
                  <p id="director-timeout-desc" className="text-xs text-muted-foreground">
                    {t('advanced.directorTimeout.description')}
                    {directorTimeoutStatus === 'saving' && <> · {t('common:status.saving')}</>}
                    {directorTimeoutStatus === 'saved' && <> · {t('common:status.saved')}</>}
                    {directorTimeoutStatus === 'error' && (
                      <span className="text-destructive"> · {t('common:status.error')}</span>
                    )}
                  </p>
                </div>
              </Section>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
