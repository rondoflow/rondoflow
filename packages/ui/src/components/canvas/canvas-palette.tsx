'use client'

import { Bot, Puzzle, Shield, FolderOpen, Plug, StickyNote, Sparkles, Globe, FileOutput, Split, Mail, Table2, Database, Webhook, Search, Waves, Boxes } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DRAG_TYPES } from '@/lib/canvas-utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useComplexity } from '@/hooks/use-complexity'
import { useCanvasReadOnly } from '@/components/canvas/canvas-read-only'

// ─── Types ──────────────────────────────────────────────────────────────────

export type PaletteNodeType =
  | 'agent' | 'skill' | 'safety' | 'connection' | 'resource' | 'note' | 'output' | 'email' | 'condition' | 'structurer' | 'db-save' | 'http-request' | 'duckduckgo-search' | 'sakana-ai' | 'apify-actor'

interface DragItem {
  readonly icon: React.ElementType
  readonly labelKey: string
  readonly nodeType: PaletteNodeType
  readonly mimeType: string
  readonly minTier: 'simple' | 'standard' | 'full'
  /** Extra fields merged into the drag payload (e.g. the agent's provider). */
  readonly payload?: Record<string, unknown>
}

const DRAG_ITEMS: readonly DragItem[] = [
  { icon: Bot, labelKey: 'palette.item.assistant', nodeType: 'agent', mimeType: DRAG_TYPES.AGENT, minTier: 'simple' },
  { icon: Sparkles, labelKey: 'palette.item.openaiAssistant', nodeType: 'agent', mimeType: DRAG_TYPES.AGENT, minTier: 'simple', payload: { provider: 'openai' } },
  { icon: Globe, labelKey: 'palette.item.perplexityAssistant', nodeType: 'agent', mimeType: DRAG_TYPES.AGENT, minTier: 'simple', payload: { provider: 'perplexity' } },
  { icon: Puzzle, labelKey: 'palette.item.skill', nodeType: 'skill', mimeType: DRAG_TYPES.SKILL, minTier: 'simple' },
  { icon: Shield, labelKey: 'palette.item.safetyRule', nodeType: 'safety', mimeType: DRAG_TYPES.POLICY, minTier: 'standard' },
  { icon: FolderOpen, labelKey: 'palette.item.resource', nodeType: 'resource', mimeType: DRAG_TYPES.RESOURCE, minTier: 'standard' },
  { icon: Plug, labelKey: 'palette.item.connection', nodeType: 'connection', mimeType: DRAG_TYPES.MCP, minTier: 'full' },
  { icon: Split, labelKey: 'palette.item.condition', nodeType: 'condition', mimeType: DRAG_TYPES.CONDITION, minTier: 'standard' },
  { icon: FileOutput, labelKey: 'palette.item.output', nodeType: 'output', mimeType: DRAG_TYPES.OUTPUT, minTier: 'standard' },
  { icon: Webhook, labelKey: 'palette.item.httpRequest', nodeType: 'http-request', mimeType: DRAG_TYPES.HTTP_REQUEST, minTier: 'standard' },
  { icon: Search, labelKey: 'palette.item.duckduckgoSearch', nodeType: 'duckduckgo-search', mimeType: DRAG_TYPES.DUCKDUCKGO_SEARCH, minTier: 'standard' },
  { icon: Waves, labelKey: 'palette.item.sakanaAi', nodeType: 'sakana-ai', mimeType: DRAG_TYPES.SAKANA_AI, minTier: 'standard' },
  { icon: Boxes, labelKey: 'palette.item.apifyActor', nodeType: 'apify-actor', mimeType: DRAG_TYPES.APIFY_ACTOR, minTier: 'standard' },
  { icon: Table2, labelKey: 'palette.item.structurer', nodeType: 'structurer', mimeType: DRAG_TYPES.STRUCTURER, minTier: 'standard' },
  { icon: Database, labelKey: 'palette.item.dbSave', nodeType: 'db-save', mimeType: DRAG_TYPES.DB_SAVE, minTier: 'standard' },
  { icon: Mail, labelKey: 'palette.item.email', nodeType: 'email', mimeType: DRAG_TYPES.EMAIL, minTier: 'standard' },
  { icon: StickyNote, labelKey: 'palette.item.note', nodeType: 'note', mimeType: DRAG_TYPES.NOTE, minTier: 'simple' },
]

const TIER_ORDER = { simple: 0, standard: 1, full: 2 } as const

// ─── Component ──────────────────────────────────────────────────────────────

export interface CanvasPaletteProps {
  /**
   * Add a node without dragging — used by click and keyboard (Enter/Space)
   * activation. The canvas drops it at the centre of the current viewport.
   * Receives the same (mimeType, payload) pair the drag path encodes.
   */
  readonly onAddNode?: (mimeType: string, payload: Record<string, unknown>) => void
}

/**
 * Floating palette docked to the bottom-center of the canvas. Each entry can be
 * dragged onto the canvas (handled by the canvas drop handler) OR activated by
 * click / Enter / Space to drop a node at the viewport centre — a fallback for
 * trackpad, touch and keyboard users who can't easily drag. This replaces the
 * old "Drag to Canvas" section that lived in the left sidebar.
 */
export function CanvasPalette({ onAddNode }: CanvasPaletteProps) {
  const { t } = useTranslation('canvas')
  const { tier } = useComplexity()
  const readOnly = useCanvasReadOnly()

  // Viewers cannot add nodes — hide the palette entirely.
  if (readOnly) return null

  const isVisible = (minTier: 'simple' | 'standard' | 'full') =>
    TIER_ORDER[tier] >= TIER_ORDER[minTier]

  function handleDragStart(e: React.DragEvent<HTMLElement>, item: DragItem) {
    e.dataTransfer.setData(item.mimeType, JSON.stringify({ type: item.nodeType, ...item.payload }))
    e.dataTransfer.effectAllowed = 'all'
  }

  function handleActivate(item: DragItem) {
    onAddNode?.(item.mimeType, { type: item.nodeType, ...item.payload })
  }

  const items = DRAG_ITEMS.filter((item) => isVisible(item.minTier))

  return (
    <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
      <div
        className="flex items-center gap-1 rounded-xl border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur-sm"
        role="toolbar"
        aria-label={t('palette.toolbarLabel')}
      >
        {items.map((item) => (
          <Tooltip key={item.labelKey} delayDuration={0}>
            <TooltipTrigger asChild>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => handleActivate(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleActivate(item)
                  }
                }}
                className={cn(
                  'flex h-9 w-9 cursor-grab items-center justify-center rounded-lg text-muted-foreground transition-colors active:cursor-grabbing',
                  'hover:bg-accent hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                )}
                role="button"
                tabIndex={0}
                aria-label={t('palette.addAria', { label: t(item.labelKey) })}
              >
                <item.icon className="h-4 w-4" aria-hidden />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <span className="font-medium">{t(item.labelKey)}</span>
              <span className="ml-1.5 text-muted-foreground">{t('palette.dragOrClick')}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
