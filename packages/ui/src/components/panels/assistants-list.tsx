'use client'

import { useTranslation } from 'react-i18next'
import { Bot, Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/ui/status-badge'
import type { AgentStatus } from '@rondoflow/shared'

export interface AssistantSummary {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly status: AgentStatus
  readonly model?: string
  readonly purpose?: string
}

export interface AssistantsListProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly assistants: readonly AssistantSummary[]
  readonly onSelect: (assistant: AssistantSummary) => void
  readonly onCreateNew: () => void
  readonly onDelete?: (id: string) => void
}

export function AssistantsList({
  open,
  onOpenChange,
  assistants,
  onSelect,
  onCreateNew,
  onDelete,
}: AssistantsListProps) {
  const { t } = useTranslation('panelsMisc')
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader className="flex flex-row items-center justify-between pr-6">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {t('assistants.title')}
            <Badge variant="secondary" className="text-xs">
              {assistants.length}
            </Badge>
          </SheetTitle>
          <Button size="sm" variant="outline" className="gap-1" onClick={onCreateNew}>
            <Plus className="h-3.5 w-3.5" />
            {t('assistants.new')}
          </Button>
        </SheetHeader>

        <Separator className="my-3" />

        {assistants.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Bot className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('assistants.empty.title')}</p>
            <Button size="sm" onClick={onCreateNew}>
              {t('assistants.empty.create')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto">
            {assistants.map((a) => (
              <div
                key={a.id}
                role="button"
                tabIndex={0}
                className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent cursor-pointer"
                onClick={() => onSelect(a)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(a) }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {a.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{a.name}</span>
                    {a.model && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {a.model}
                      </Badge>
                    )}
                  </div>
                  {a.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {a.description}
                    </p>
                  )}
                </div>
                <StatusBadge status={a.status} size="sm" />
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(a.id)
                    }}
                    aria-label={t('assistants.delete', { name: a.name })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
