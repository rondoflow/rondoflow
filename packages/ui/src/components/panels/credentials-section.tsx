'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ParseKeys, TFunction } from 'i18next'
import { Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiGet, apiPut } from '@/lib/api'

// ─── Types (mirror the server's CredentialStatus) ───────────────────────────

type CredentialGroup = 'anthropic' | 'openai' | 'perplexity' | 'github' | 'google' | 'smtp'

interface CredentialStatus {
  readonly key: string
  readonly field: string
  readonly label: string
  readonly group: CredentialGroup
  readonly secret: boolean
  readonly isSet: boolean
  readonly source: 'db' | 'env' | null
  readonly preview: string | null
}

const GROUP_ORDER: readonly CredentialGroup[] = ['anthropic', 'openai', 'perplexity', 'github', 'google', 'smtp']

const GROUP_META: Record<CredentialGroup, { titleKey: ParseKeys<'settings'>; hintKey: ParseKeys<'settings'> }> = {
  anthropic: {
    titleKey: 'credentials.group.anthropic.title',
    hintKey: 'credentials.group.anthropic.hint',
  },
  openai: {
    titleKey: 'credentials.group.openai.title',
    hintKey: 'credentials.group.openai.hint',
  },
  perplexity: {
    titleKey: 'credentials.group.perplexity.title',
    hintKey: 'credentials.group.perplexity.hint',
  },
  github: {
    titleKey: 'credentials.group.github.title',
    hintKey: 'credentials.group.github.hint',
  },
  google: {
    titleKey: 'credentials.group.google.title',
    hintKey: 'credentials.group.google.hint',
  },
  smtp: {
    titleKey: 'credentials.group.smtp.title',
    hintKey: 'credentials.group.smtp.hint',
  },
}

function currentStateText(s: CredentialStatus, t: TFunction<['settings', 'common']>): string {
  if (!s.isSet) return t('credentials.state.notSet')
  const src =
    s.source === 'db'
      ? t('credentials.state.saved')
      : s.source === 'env'
        ? t('credentials.state.fromEnv')
        : t('credentials.state.set')
  return s.preview ? t('credentials.state.withPreview', { source: src, preview: s.preview }) : src
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CredentialsSection() {
  const { t } = useTranslation(['settings', 'common'])
  const [statuses, setStatuses] = useState<readonly CredentialStatus[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [cleared, setCleared] = useState<ReadonlySet<string>>(new Set())
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<CredentialStatus[]>('/api/settings/credentials')
      setStatuses(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('credentials.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  function setDraft(field: string, value: string) {
    setSaved(false)
    setDrafts((d) => ({ ...d, [field]: value }))
    if (value.length > 0) {
      setCleared((c) => {
        if (!c.has(field)) return c
        const next = new Set(c)
        next.delete(field)
        return next
      })
    }
  }

  function clearField(field: string) {
    setSaved(false)
    setCleared((c) => new Set(c).add(field))
    setDrafts((d) => {
      const next = { ...d }
      delete next[field]
      return next
    })
  }

  function undoClear(field: string) {
    setCleared((c) => {
      const next = new Set(c)
      next.delete(field)
      return next
    })
  }

  function toggleReveal(field: string) {
    setRevealed((r) => {
      const next = new Set(r)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  const pendingSets = Object.values(drafts).filter((v) => v.trim().length > 0).length
  const hasChanges = pendingSets > 0 || cleared.size > 0

  async function handleSave() {
    const payload: Record<string, string> = {}
    for (const [field, value] of Object.entries(drafts)) {
      const trimmed = value.trim()
      if (trimmed.length > 0) payload[field] = trimmed
    }
    for (const field of cleared) {
      if (!(field in payload)) payload[field] = ''
    }
    if (Object.keys(payload).length === 0) return

    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const data = await apiPut<CredentialStatus[]>('/api/settings/credentials', payload)
      setStatuses(data)
      setDrafts({})
      setCleared(new Set())
      setRevealed(new Set())
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('credentials.saveError'))
    } finally {
      setSaving(false)
    }
  }

  function renderRow(s: CredentialStatus) {
    const draft = drafts[s.field] ?? ''
    const isCleared = cleared.has(s.field)
    const reveal = revealed.has(s.field)
    const inputType = s.secret && !reveal ? 'password' : 'text'

    return (
      <div key={s.field} className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={`cred-${s.field}`} className="text-sm font-medium">
            {s.label}
          </label>
          <span className={isCleared ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
            {isCleared ? t('credentials.state.willClear') : currentStateText(s, t)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              id={`cred-${s.field}`}
              type={inputType}
              value={draft}
              onChange={(e) => setDraft(s.field, e.target.value)}
              placeholder={s.isSet ? t('credentials.input.keepCurrent') : t('credentials.input.notSet')}
              className="pr-9 text-sm"
              autoComplete="off"
              spellCheck={false}
            />
            {s.secret && (
              <button
                type="button"
                onClick={() => toggleReveal(s.field)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={reveal ? t('credentials.reveal.hide', { label: s.label }) : t('credentials.reveal.show', { label: s.label })}
                tabIndex={-1}
              >
                {reveal ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            )}
          </div>
          {s.isSet && !isCleared && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="shrink-0 text-xs text-destructive hover:text-destructive"
              onClick={() => clearField(s.field)}
            >
              {t('credentials.clear')}
            </Button>
          )}
          {isCleared && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="shrink-0 text-xs"
              onClick={() => undoClear(s.field)}
            >
              {t('credentials.undo')}
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        {t('credentials.loading')}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-muted-foreground">
        {t('credentials.intro')}
      </p>

      {GROUP_ORDER.map((group) => {
        const items = statuses.filter((s) => s.group === group)
        if (items.length === 0) return null
        const meta = GROUP_META[group]
        return (
          <div key={group} className="flex flex-col gap-3">
            <div>
              <h4 className="text-sm font-semibold">{t(meta.titleKey)}</h4>
              <p className="text-xs text-muted-foreground">{t(meta.hintKey)}</p>
            </div>
            {items.map((s) => renderRow(s))}
          </div>
        )
      })}

      <div className="flex items-center gap-3">
        <Button type="button" size="sm" onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
              {t('common:status.saving')}
            </>
          ) : (
            t('credentials.save')
          )}
        </Button>
        {saved && !hasChanges && (
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            {t('credentials.savedState')}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" aria-hidden />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
