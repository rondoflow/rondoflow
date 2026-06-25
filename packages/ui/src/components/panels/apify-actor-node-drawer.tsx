'use client'

import { useTranslation } from 'react-i18next'
import { Boxes } from 'lucide-react'
import { APIFY_ACTOR_PRESETS, type ApifyActorNodeData } from '@/lib/canvas-utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export interface ApifyActorNodeDrawerProps {
  readonly data: ApifyActorNodeData
  readonly onChange: (patch: Partial<ApifyActorNodeData>) => void
}

const OUTPUT_FORMATS: ReadonlyArray<ApifyActorNodeData['outputFormat']> = ['text', 'json']

function segmentClass(active: boolean): string {
  return cn(
    'flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
    active
      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
      : 'border-border text-muted-foreground hover:bg-muted',
  )
}

export function ApifyActorNodeDrawer({ data, onChange }: ApifyActorNodeDrawerProps) {
  const { t } = useTranslation('panelsMisc')

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
            <Boxes className="h-5 w-5 text-emerald-500" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-emerald-400">{t('apifyActorNode.title')}</p>
            <p className="text-xs text-muted-foreground">{t('apifyActorNode.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('apifyActorNode.name.label')}</label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('apifyActorNode.name.placeholder')}
            className="h-8 text-xs"
          />
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium">{t('apifyActorNode.actorId.label')}</label>
          <Input
            value={data.actorId}
            onChange={(e) => onChange({ actorId: e.target.value.trim() })}
            placeholder={t('apifyActorNode.actorId.placeholder')}
            list="apify-actor-presets"
            className="h-8 text-xs"
          />
          <datalist id="apify-actor-presets">
            {APIFY_ACTOR_PRESETS.map((actorId) => (
              <option key={actorId} value={actorId} />
            ))}
          </datalist>
          <p className="text-[11px] text-muted-foreground">{t('apifyActorNode.actorId.hint')}</p>
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium">{t('apifyActorNode.input.label')}</label>
          <Textarea
            value={data.input}
            onChange={(e) => onChange({ input: e.target.value })}
            placeholder={t('apifyActorNode.input.placeholder')}
            className="min-h-[120px] font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">{t('apifyActorNode.input.hint', { token: '{{input}}' })}</p>
        </section>

        <section className="flex gap-3">
          <div className="w-28">
            <label className="mb-1.5 block text-sm font-medium">{t('apifyActorNode.timeout.label')}</label>
            <Input
              type="number"
              min={1}
              max={300}
              value={data.timeoutSec}
              onChange={(e) => onChange({ timeoutSec: Math.max(1, Math.min(300, Number(e.target.value) || 1)) })}
              className="h-8 text-xs"
            />
          </div>
          <div className="w-36">
            <label className="mb-1.5 block text-sm font-medium">{t('apifyActorNode.maxItems.label')}</label>
            <Input
              type="number"
              min={0}
              value={data.maxItems}
              onChange={(e) => onChange({ maxItems: Math.max(0, Number(e.target.value) || 0) })}
              className="h-8 text-xs"
            />
          </div>
        </section>

        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('apifyActorNode.output.label')}</label>
          <div className="flex items-center gap-1.5">
            {OUTPUT_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onChange({ outputFormat: f })}
                className={segmentClass(data.outputFormat === f)}
              >
                {t(`apifyActorNode.output.${f}`)}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{t('apifyActorNode.output.hint')}</p>
        </section>
      </div>
    </div>
  )
}
