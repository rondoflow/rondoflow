'use client'

import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { RunHistory } from './run-history'
import type { RunDetail } from '@/lib/run-history'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface HistoryPanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly workspaceId?: string | null
  readonly onRestore?: (run: RunDetail) => void
}

// ─── HistoryPanel ──────────────────────────────────────────────────────────

export function HistoryPanel({ open, onOpenChange, workspaceId, onRestore }: HistoryPanelProps) {
  const { t } = useTranslation('panelsMisc')
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0"
        aria-label={t('history.panelLabel')}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t('history.title')}</SheetTitle>
          <SheetDescription>{t('history.description')}</SheetDescription>
        </SheetHeader>

        <RunHistory open={open} workspaceId={workspaceId} onRestore={onRestore} />
      </SheetContent>
    </Sheet>
  )
}
