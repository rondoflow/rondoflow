'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Node, Edge } from '@xyflow/react'
import {
  GitPullRequest,
  FileText,
  Search,
  Lightbulb,
  Boxes,
  Trash2,
  Wand2,
  type LucideIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { CANVAS_TEMPLATES, materializeCanvasTemplate, type CanvasTemplate } from '@/lib/canvas-templates'
import { createAgentNode } from '@/lib/canvas-utils'
import { apiGet, apiDelete } from '@/lib/api'
import type { GeneratedWorkflowWithLayout } from '@rondoflow/shared'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemplateGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (nodes: Node[], edges: Edge[]) => void
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  GitPullRequest,
  FileText,
  Search,
  Lightbulb,
  Boxes,
}

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Lightbulb
}

// ─── Template card ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: CanvasTemplate
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onSelect: () => void
}

function TemplateCard({
  template,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onSelect,
}: TemplateCardProps) {
  const { t } = useTranslation('canvas')
  const Icon = resolveIcon(template.icon)

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-lg border bg-card p-4 transition-all duration-150',
        isHovered
          ? 'border-primary/50 bg-accent/30 shadow-md'
          : 'border-border hover:border-border/80',
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Icon + node count */}
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md border transition-colors',
            isHovered
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-muted/50 text-muted-foreground',
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>

        <Badge
          variant="secondary"
          className="text-[10px] font-medium"
        >
          {t('template.card.nodeCount', { count: template.nodes.length })}
        </Badge>
      </div>

      {/* Name + description */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold leading-none">{template.name}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* CTA button — visible on hover */}
      <div
        className={cn(
          'mt-auto transition-all duration-150',
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none',
        )}
      >
        <Button
          size="sm"
          className="w-full text-xs"
          onClick={onSelect}
          tabIndex={isHovered ? 0 : -1}
        >
          {t('template.card.use')}
        </Button>
      </div>

      {/* Always-available click target for non-hover devices */}
      <button
        type="button"
        className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={t('template.card.load', { name: template.name })}
        onClick={onSelect}
      />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─── Saved workflow type from API ─────────────────────────────────────────────

interface SavedWorkflowRecord {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly workflow: GeneratedWorkflowWithLayout
  readonly createdAt: string
}

// ─── Saved workflow → React Flow nodes/edges conversion ──────────────────────

function loadSavedWorkflow(wf: GeneratedWorkflowWithLayout): { nodes: Node[]; edges: Edge[] } {
  const nodes = wf.agents.map((agent) => {
    const node = createAgentNode(
      agent.position,
      {
        name: agent.name,
        description: agent.description,
        status: 'idle' as const,
        model: agent.model,
        purpose: agent.purpose,
      },
    )
    node.id = agent.tempId
    return node
  })

  const edges: Edge[] = wf.edges.map((edge) => ({
    id: crypto.randomUUID(),
    source: edge.from,
    target: edge.to,
    type: 'rondoflow' as const,
    data: { edgeType: 'flow' as const },
  }))

  return { nodes, edges }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TemplateGallery({ open, onOpenChange, onSelectTemplate }: TemplateGalleryProps) {
  const { t } = useTranslation('canvas')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflowRecord[]>([])

  // Fetch saved workflows when dialog opens
  useEffect(() => {
    if (!open) return
    apiGet<SavedWorkflowRecord[]>('/api/saved-workflows')
      .then(setSavedWorkflows)
      .catch(() => setSavedWorkflows([]))
  }, [open])

  function handleSelect(template: CanvasTemplate) {
    const { nodes, edges } = materializeCanvasTemplate(template)
    onSelectTemplate(nodes, edges)
    onOpenChange(false)
  }

  function handleSelectSaved(record: SavedWorkflowRecord) {
    const { nodes, edges } = loadSavedWorkflow(record.workflow)
    onSelectTemplate(nodes, edges)
    onOpenChange(false)
  }

  async function handleDeleteSaved(id: string) {
    try {
      await apiDelete(`/api/saved-workflows/${id}`)
      setSavedWorkflows((prev) => prev.filter((w) => w.id !== id))
    } catch { /* best-effort */ }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('template.dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('template.dialog.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Saved Workflows section */}
        {savedWorkflows.length > 0 && (
          <>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Wand2 className="h-3.5 w-3.5" aria-hidden />
                {t('template.saved.heading')}
              </p>
              <div className="flex flex-col gap-2">
                {savedWorkflows.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-accent/30"
                  >
                    <button
                      type="button"
                      className="flex flex-1 flex-col gap-0.5 text-left"
                      onClick={() => handleSelectSaved(record)}
                    >
                      <span className="text-sm font-medium">{record.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {record.description
                          ? t('template.saved.withDescription', {
                              label: t('template.saved.agentCount', { count: record.workflow.agents.length }),
                              description: record.description,
                            })
                          : t('template.saved.agentCount', { count: record.workflow.agents.length })}
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteSaved(record.id)}
                      aria-label={t('template.saved.delete', { name: record.name })}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Built-in Templates */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{t('template.builtIn.heading')}</p>
          <div
            className="grid grid-cols-2 gap-3"
            role="list"
            aria-label={t('template.builtIn.listLabel')}
          >
            {CANVAS_TEMPLATES.map((template) => (
              <div key={template.id} role="listitem">
                <TemplateCard
                  template={template}
                  isHovered={hoveredId === template.id}
                  onMouseEnter={() => setHoveredId(template.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onSelect={() => handleSelect(template)}
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
