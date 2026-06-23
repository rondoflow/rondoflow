'use client'

import { useTranslation } from 'react-i18next'
import { Waves } from 'lucide-react'
import { SAKANA_AI_MODEL_PRESETS, type SakanaAiNodeData } from '@/lib/canvas-utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export interface SakanaAiNodeDrawerProps {
  readonly data: SakanaAiNodeData
  readonly onChange: (patch: Partial<SakanaAiNodeData>) => void
}

const OUTPUT_FORMATS: ReadonlyArray<SakanaAiNodeData['outputFormat']> = ['text', 'json']

function segmentClass(active: boolean): string {
  return cn(
    'flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
    active
      ? 'border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-300'
      : 'border-border text-muted-foreground hover:bg-muted',
  )
}

export function SakanaAiNodeDrawer({ data, onChange }: SakanaAiNodeDrawerProps) {
  const { t } = useTranslation('panelsMisc')

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
            <Waves className="h-5 w-5 text-sky-500" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-sky-400">{t('sakanaAiNode.title')}</p>
            <p className="text-xs text-muted-foreground">{t('sakanaAiNode.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('sakanaAiNode.name.label')}</label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('sakanaAiNode.name.placeholder')}
            className="h-8 text-xs"
          />
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium">{t('sakanaAiNode.apiUrl.label')}</label>
          <Input
            value={data.apiUrl}
            onChange={(e) => onChange({ apiUrl: e.target.value.trim() })}
            placeholder={t('sakanaAiNode.apiUrl.placeholder')}
            className="h-8 text-xs"
          />
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium">{t('sakanaAiNode.model.label')}</label>
          <Input
            value={data.model}
            onChange={(e) => onChange({ model: e.target.value.trim() })}
            placeholder={t('sakanaAiNode.model.placeholder')}
            list="sakana-ai-model-presets"
            className="h-8 text-xs"
          />
          <datalist id="sakana-ai-model-presets">
            {SAKANA_AI_MODEL_PRESETS.map((modelId) => (
              <option key={modelId} value={modelId} />
            ))}
          </datalist>
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium">{t('sakanaAiNode.systemPrompt.label')}</label>
          <Textarea
            value={data.systemPrompt ?? ''}
            onChange={(e) => onChange({ systemPrompt: e.target.value })}
            placeholder={t('sakanaAiNode.systemPrompt.placeholder')}
            className="min-h-[80px] text-xs"
          />
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium">{t('sakanaAiNode.prompt.label')}</label>
          <Textarea
            value={data.prompt}
            onChange={(e) => onChange({ prompt: e.target.value })}
            placeholder={t('sakanaAiNode.prompt.placeholder')}
            className="min-h-[90px] text-xs"
          />
          <p className="text-[11px] text-muted-foreground">{t('sakanaAiNode.prompt.hint', { token: '{{input}}' })}</p>
        </section>

        <section className="flex gap-3">
          <div className="w-28">
            <label className="mb-1.5 block text-sm font-medium">{t('sakanaAiNode.temperature.label')}</label>
            <Input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={data.temperature}
              onChange={(e) => onChange({ temperature: Math.max(0, Math.min(2, Number(e.target.value) || 0)) })}
              className="h-8 text-xs"
            />
          </div>
          <div className="w-36">
            <label className="mb-1.5 block text-sm font-medium">{t('sakanaAiNode.maxTokens.label')}</label>
            <Input
              type="number"
              min={1}
              max={8192}
              value={data.maxTokens}
              onChange={(e) => onChange({ maxTokens: Math.max(1, Math.min(8192, Number(e.target.value) || 1)) })}
              className="h-8 text-xs"
            />
          </div>
        </section>

        <section>
          <label className="mb-1.5 block text-sm font-medium">{t('sakanaAiNode.output.label')}</label>
          <div className="flex items-center gap-1.5">
            {OUTPUT_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onChange({ outputFormat: f })}
                className={segmentClass(data.outputFormat === f)}
              >
                {t(`sakanaAiNode.output.${f}`)}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{t('sakanaAiNode.output.hint')}</p>
        </section>
      </div>
    </div>
  )
}
