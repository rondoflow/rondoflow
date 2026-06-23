'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Link2, AlertTriangle } from 'lucide-react'
import type { EmailNodeData } from '@/lib/canvas-utils'
import { parseRecipients } from '@/lib/canvas-utils'
import { Input } from '@/components/ui/input'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EmailNodeDrawerProps {
  readonly data: EmailNodeData
  /** Agent nodes currently on the canvas (id + display name). */
  readonly agents: ReadonlyArray<{ readonly id: string; readonly name: string }>
  readonly onChange: (patch: Partial<EmailNodeData>) => void
}

// ─── Component ──────────────────────────────────────────────────────────────

export function EmailNodeDrawer({ data, agents, onChange }: EmailNodeDrawerProps) {
  const { t } = useTranslation('panelsMisc')

  // Selection is connection-driven (read-only here): the canvas keeps
  // `agentSelection` in lockstep with the agent→email edges wired into this node.
  const isAll = data.agentSelection === 'all'
  const connectedAgents = useMemo<ReadonlyArray<{ id: string; name: string }>>(() => {
    if (data.agentSelection === 'all') return []
    const byId = new Map(agents.map((a) => [a.id, a.name]))
    return data.agentSelection.map((id) => ({ id, name: byId.get(id) ?? t('emailNode.unknownAgent') }))
  }, [data.agentSelection, agents, t])

  const { valid, invalid } = useMemo(() => parseRecipients(data.recipients), [data.recipients])

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
            <Mail className="h-5 w-5 text-indigo-400" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-indigo-300">{t('emailNode.title')}</p>
            <p className="text-xs text-muted-foreground">{t('emailNode.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Enabled toggle */}
        <section className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
          <label className="flex cursor-pointer items-center justify-between gap-2 text-sm font-medium">
            {t('emailNode.enabled.label')}
            <input
              type="checkbox"
              checked={data.enabled}
              onChange={(e) => onChange({ enabled: e.target.checked })}
              className="h-4 w-4 accent-indigo-500"
            />
          </label>
          <p className="mt-1 text-[11px] text-muted-foreground">{t('emailNode.enabled.hint')}</p>
        </section>

        {/* Name + Subject */}
        <section className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('emailNode.name.label')}</label>
            <Input
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={t('emailNode.name.placeholder')}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('emailNode.subject.label')}</label>
            <Input
              value={data.subject ?? ''}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder={t('emailNode.subject.placeholder')}
              className="h-8 text-xs"
            />
          </div>
        </section>

        {/* Recipients */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('emailNode.recipients.label')}</label>
          <Input
            value={data.recipients}
            onChange={(e) => onChange({ recipients: e.target.value })}
            placeholder={t('emailNode.recipients.placeholder')}
            className="h-8 text-xs"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">{t('emailNode.recipients.hint')}</p>
          {valid.length > 0 && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t('emailNode.recipients.count', { count: valid.length })}
            </p>
          )}
          {invalid.length > 0 && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />
              {t('emailNode.recipients.invalid', { list: invalid.join(', ') })}
            </p>
          )}
        </section>

        {/* Agent selection — driven by canvas connections (read-only) */}
        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-indigo-400" aria-hidden />
            <label className="text-sm font-medium">{t('emailNode.sendingFrom')}</label>
          </div>
          <p className="mb-2 text-[11px] text-muted-foreground">{t('emailNode.sendingHint')}</p>

          {isAll ? (
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              {t('emailNode.allAgents')}
            </p>
          ) : connectedAgents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
              {t('emailNode.noAgents')}
            </p>
          ) : (
            <div className="space-y-1">
              {connectedAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex w-full items-center gap-2 rounded-md border border-indigo-500/30 bg-indigo-500/5 px-2.5 py-1.5 text-xs"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-indigo-400" aria-hidden />
                  <span className="truncate">{agent.name}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
