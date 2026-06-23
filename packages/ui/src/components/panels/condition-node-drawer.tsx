'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Split, Plus, Trash2, Flag } from 'lucide-react'
import type { ConditionBranchSpec, ConditionMatchKind } from '@rondoflow/shared'
import type { ConditionNodeData } from '@/lib/canvas-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ConditionNodeDrawerProps {
  readonly data: ConditionNodeData
  /** Source agent feeding this node (for the hint), if exactly one is wired in. */
  readonly inputAgentName?: string | null
  readonly onChange: (patch: Partial<ConditionNodeData>) => void
}

const PRESETS: ReadonlyArray<{ labelKey: string; kind: ConditionMatchKind; pattern: string }> = [
  { labelKey: 'condition.preset.approved', kind: 'contains', pattern: 'approved|approve|lgtm' },
  { labelKey: 'condition.preset.rejected', kind: 'contains', pattern: 'rejected|reject|denied|blocked' },
  { labelKey: 'condition.preset.custom', kind: 'contains', pattern: '' },
]

function newBranch(preset: (typeof PRESETS)[number], label: string): ConditionBranchSpec {
  return { id: crypto.randomUUID(), label, kind: preset.kind, pattern: preset.pattern }
}

/** Validate a regex pattern; returns an error message or null. */
function regexError(pattern: string, fallback: string): string | null {
  if (!pattern.trim()) return null
  try {
    new RegExp(pattern, 'i')
    return null
  } catch (e) {
    return e instanceof Error ? e.message : fallback
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ConditionNodeDrawer({ data, inputAgentName, onChange }: ConditionNodeDrawerProps) {
  const { t } = useTranslation('panelsMisc')
  const branches = useMemo(() => data.branches ?? [], [data.branches])

  const update = (next: ConditionBranchSpec[]) => onChange({ branches: next })

  const patchBranch = (id: string, patch: Partial<ConditionBranchSpec>) => {
    update(branches.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  const removeBranch = (id: string) => update(branches.filter((b) => b.id !== id))

  const addBranch = (preset: (typeof PRESETS)[number]) =>
    update([...branches, newBranch(preset, t(preset.labelKey))])

  // Marking a branch as the default clears the flag on every other branch.
  const setElse = (id: string) =>
    update(branches.map((b) => ({ ...b, isElse: b.id === id })))

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
            <Split className="h-5 w-5 text-amber-500" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-amber-400">{t('condition.title')}</p>
            <p className="text-xs text-muted-foreground">{t('condition.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Name */}
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('condition.name.label')}</label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('condition.name.placeholder')}
            className="h-8 text-xs"
          />
        </section>

        {/* Hint */}
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          {inputAgentName
            ? t('condition.hint.withAgent', { agent: inputAgentName })
            : t('condition.hint.noAgent')}
        </p>

        {/* Branches */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('condition.branches.heading')}</label>
            <span className="text-[11px] text-muted-foreground">{t('condition.branches.total', { count: branches.length })}</span>
          </div>

          {branches.map((b, i) => {
            const err = b.kind === 'regex' ? regexError(b.pattern, t('condition.regexInvalid')) : null
            return (
              <div
                key={b.id}
                className={cn(
                  'space-y-2 rounded-lg border px-3 py-2.5',
                  b.isElse ? 'border-amber-500/40 bg-amber-500/5' : 'border-border bg-muted/20',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                  <Input
                    value={b.label}
                    onChange={(e) => patchBranch(b.id, { label: e.target.value })}
                    placeholder={t('condition.branches.labelPlaceholder')}
                    className="h-7 flex-1 text-xs"
                    aria-label={t('condition.branches.labelAria', { index: i + 1 })}
                  />
                  <button
                    type="button"
                    onClick={() => removeBranch(b.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                    aria-label={t('condition.branches.remove', { index: i + 1 })}
                    title={t('condition.branches.removeTitle')}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>

                {!b.isElse && (
                  <>
                    <div className="flex items-center gap-1.5">
                      {(['contains', 'regex'] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => patchBranch(b.id, { kind: k })}
                          className={cn(
                            'rounded-md border px-2 py-1 text-[10px] font-medium transition-colors',
                            b.kind === k
                              ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-300'
                              : 'border-border text-muted-foreground hover:bg-muted',
                          )}
                        >
                          {k === 'contains' ? t('condition.branches.kind.contains') : t('condition.branches.kind.regex')}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={b.pattern}
                      onChange={(e) => patchBranch(b.id, { pattern: e.target.value })}
                      placeholder={b.kind === 'contains' ? t('condition.branches.patternPlaceholder.contains') : t('condition.branches.patternPlaceholder.regex')}
                      className="h-7 font-mono text-xs"
                      aria-label={t('condition.branches.patternAria', { index: i + 1 })}
                    />
                    {err && <p className="text-[10px] text-destructive">{err}</p>}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setElse(b.id)}
                  className={cn(
                    'flex items-center gap-1 text-[10px] font-medium transition-colors',
                    b.isElse ? 'text-amber-600 dark:text-amber-300' : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-pressed={b.isElse ?? false}
                >
                  <Flag className="h-3 w-3" aria-hidden />
                  {b.isElse ? t('condition.branches.default') : t('condition.branches.setDefault')}
                </button>
              </div>
            )
          })}

          {/* Add branch presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground">{t('condition.branches.addLabel')}</span>
            {PRESETS.map((p) => (
              <Button
                key={p.labelKey}
                size="sm"
                variant="outline"
                className="h-7 gap-1 px-2 text-[11px]"
                onClick={() => addBranch(p)}
              >
                <Plus className="h-3 w-3" aria-hidden />
                {t(p.labelKey)}
              </Button>
            ))}
          </div>

          {branches.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
              {t('condition.branches.empty')}
            </p>
          )}
          {branches.length > 0 && !branches.some((b) => b.isElse) && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              {t('condition.branches.noDefault')}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
