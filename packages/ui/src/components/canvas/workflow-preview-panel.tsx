'use client'

import { useTranslation } from 'react-i18next'
import {
  GitPullRequest,
  FileText,
  Search,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CANVAS_TEMPLATES, type CanvasTemplate } from '@/lib/canvas-templates'

// A dot-grid "canvas" panel that shows the template gallery until the user
// describes a task, then morphs into a predicted-workflow preview. Shared by
// the onboarding wizard's first-action step and the empty-canvas placeholder.

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  GitPullRequest,
  FileText,
  Search,
  Lightbulb,
}

export interface WorkflowPreviewPanelProps {
  /** Trimmed task description; when non-empty the panel shows the live preview. */
  readonly task: string
  readonly onPickTemplate: (templateId: string) => void
  readonly className?: string
}

export function WorkflowPreviewPanel({ task, onPickTemplate, className }: WorkflowPreviewPanelProps) {
  const { t } = useTranslation('onboarding')
  const building = task.length > 0

  return (
    <div
      className={cn(
        'relative flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-border',
        className,
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
        backgroundSize: '22px 22px',
      }}
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-background/70 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
        <span>{building ? t('firstAction.preview.heading') : t('firstAction.gallery.heading')}</span>
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-colors',
              building ? 'bg-[hsl(var(--status-running))]' : 'bg-muted-foreground/50',
            )}
          />
          {building ? t('firstAction.preview.live') : t('firstAction.preview.idle')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {building ? <WorkflowPreview task={task} /> : <TemplateGalleryGrid onPick={onPickTemplate} />}
      </div>
    </div>
  )
}

// ─── Gallery grid of real catalog templates ──────────────────────────────────

function TemplateGalleryGrid({ onPick }: { readonly onPick: (id: string) => void }) {
  const { t } = useTranslation('onboarding')
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid flex-1 grid-cols-2 gap-3">
        {CANVAS_TEMPLATES.map((template) => (
          <TemplateMiniCard key={template.id} template={template} onPick={() => onPick(template.id)} />
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">{t('firstAction.gallery.hint')}</p>
    </div>
  )
}

function TemplateMiniCard({
  template,
  onPick,
}: {
  readonly template: CanvasTemplate
  readonly onPick: () => void
}) {
  const { t } = useTranslation('canvas')
  const Icon = TEMPLATE_ICONS[template.icon] ?? Lightbulb
  return (
    <button
      type="button"
      onClick={onPick}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card/70 p-3 text-left backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="text-[10px] text-muted-foreground">
          {t('template.card.nodeCount', { count: template.nodes.length })}
        </span>
      </div>
      <span className="text-sm font-semibold leading-none">{template.name}</span>
      <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {template.description}
      </span>
    </button>
  )
}

// ─── Live preview: a predicted workflow shape from the task description ───────
// This is a sketch of what generation will assemble — the real graph is created
// (and reviewable) afterwards, so this stays deliberately generic.

type PreviewKind = 'start' | 'agent' | 'output' | 'email'

interface PreviewStep {
  readonly kind: PreviewKind
  readonly label: string
}

const DOT_BY_KIND: Record<PreviewKind, string> = {
  start: 'bg-foreground',
  agent: 'bg-[hsl(var(--status-running))]',
  output: 'bg-[hsl(var(--status-waiting))]',
  email: 'bg-[hsl(var(--status-waiting))]',
}

function predictSteps(task: string, agentTerm: string, labels: Record<PreviewKind, string>): PreviewStep[] {
  const s = task.toLowerCase()
  const wantsEmail = /(email|mail|pošli|odošli|send|enviar|envoyer|sende)/.test(s)
  let count = 1
  if (/(report|zhrn|newsletter|obsah|content|write|píš|redacta|rédige)/.test(s)) count += 1
  if (/(review|revíz|oprav|kontrol|check|revisa|prüf)/.test(s)) count += 1
  if (/(csv|dáta|data|datos|pipeline|vyčisti|clean|process|spracuj)/.test(s)) count += 1
  count = Math.min(count, 3)

  const truncated = task.length > 36 ? `${task.slice(0, 36)}…` : task
  const steps: PreviewStep[] = [{ kind: 'start', label: truncated || labels.start }]
  for (let i = 0; i < count; i += 1) {
    steps.push({ kind: 'agent', label: count > 1 ? `${agentTerm} ${i + 1}` : agentTerm })
  }
  steps.push(wantsEmail ? { kind: 'email', label: labels.email } : { kind: 'output', label: labels.output })
  return steps
}

function WorkflowPreview({ task }: { readonly task: string }) {
  const { t } = useTranslation(['onboarding', 'common'])
  const agentTerm = t('common:terms.agent')
  const labels: Record<PreviewKind, string> = {
    start: t('firstAction.preview.start'),
    agent: agentTerm,
    output: t('firstAction.preview.output'),
    email: t('firstAction.preview.email'),
  }
  const steps = predictSteps(task, agentTerm, labels)

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-0 py-2">
        {steps.map((step, i) => (
          <div key={`${step.kind}-${i}`} className="flex w-full max-w-[260px] flex-col items-center">
            {i > 0 && (
              <span
                className="my-0 h-5 w-px border-l border-dashed border-[color-mix(in_srgb,hsl(var(--status-running))_50%,transparent)] animate-in fade-in"
                style={{ animationDelay: `${i * 110}ms`, animationFillMode: 'both' }}
                aria-hidden
              />
            )}
            <div
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm',
                'animate-in fade-in slide-in-from-bottom-2',
                step.kind === 'agent' &&
                  'border-[color-mix(in_srgb,hsl(var(--status-running))_45%,transparent)]',
              )}
              style={{ animationDelay: `${i * 110}ms`, animationFillMode: 'both' }}
            >
              <span className={cn('h-2 w-2 shrink-0 rounded-full', DOT_BY_KIND[step.kind])} aria-hidden />
              <span className="truncate text-sm font-medium">{step.label}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">{t('firstAction.preview.caption')}</p>
    </div>
  )
}
