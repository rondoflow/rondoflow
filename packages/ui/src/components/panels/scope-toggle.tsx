'use client'

import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ActivityScope = 'workspace' | 'global'

interface ScopeToggleProps {
  readonly value: ActivityScope
  readonly onChange: (value: ActivityScope) => void
  readonly className?: string
}

/**
 * Workspace-vs-global selector for the Activity / Audit Log panels. Most audit
 * events (assistant create/delete, user management, approvals) carry no
 * workspace, so a workspace-scoped view hides them — "All workspaces" surfaces
 * the full team-wide log.
 */
export function ScopeToggle({ value, onChange, className }: ScopeToggleProps) {
  const { t } = useTranslation('analytics')
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ActivityScope)}
        aria-label={t('scope.label')}
        className={cn(
          'h-8 appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 text-xs',
          'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        )}
      >
        <option value="global">{t('scope.global')}</option>
        <option value="workspace">{t('scope.workspace')}</option>
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
}
