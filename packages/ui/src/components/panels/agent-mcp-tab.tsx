'use client'

import { useTranslation, Trans } from 'react-i18next'
import { Plug, ExternalLink, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { McpServer } from './mcp-management'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentMcpAssignment {
  readonly serverId: string
  readonly fromSkill: string | null // null = manually assigned
}

export interface AgentMcpTabProps {
  readonly agentId: string
  readonly allServers: readonly McpServer[]
  readonly assignments: readonly AgentMcpAssignment[]
  readonly onToggle: (serverId: string, assigned: boolean) => void
  readonly onOpenManagement: () => void
}

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------

interface ToggleSwitchProps {
  readonly checked: boolean
  readonly disabled: boolean
  readonly onToggle: () => void
  readonly label: string
}

function ToggleSwitch({ checked, disabled, onToggle, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-primary' : 'bg-muted',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Server row
// ---------------------------------------------------------------------------

interface ServerRowProps {
  readonly server: McpServer
  readonly assigned: boolean
  readonly fromSkill: string | null
  readonly onToggle: (assigned: boolean) => void
}

function ServerRow({ server, assigned, fromSkill, onToggle }: ServerRowProps) {
  const { t } = useTranslation('agentDrawer')
  const isSkillManaged = fromSkill !== null

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors">
      {/* Icon */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
          assigned
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
            : 'bg-muted text-muted-foreground',
        )}
      >
        <Plug className="h-4 w-4" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{server.name}</p>
          {isSkillManaged && (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] shrink-0 gap-0.5"
            >
              <Lock className="h-2.5 w-2.5" />
              {fromSkill}
            </Badge>
          )}
        </div>
        {server.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{server.description}</p>
        )}
      </div>

      {/* Toggle */}
      <ToggleSwitch
        checked={assigned}
        disabled={isSkillManaged}
        onToggle={() => onToggle(!assigned)}
        label={t('mcp.addRemoveAria', {
          action: assigned ? t('mcp.removeAction') : t('mcp.addAction'),
          name: server.name,
          managed: isSkillManaged ? t('mcp.managedBySkill') : '',
        })}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AgentMcpTab({
  agentId: _agentId,
  allServers,
  assignments,
  onToggle,
  onOpenManagement,
}: AgentMcpTabProps) {
  const { t } = useTranslation('agentDrawer')
  const assignmentMap = new Map(assignments.map((a) => [a.serverId, a]))

  const assigned = allServers.filter((s) => assignmentMap.has(s.id))
  const unassigned = allServers.filter((s) => !assignmentMap.has(s.id))

  if (allServers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Plug className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{t('mcp.emptyTitle')}</p>
          <p className="text-xs text-muted-foreground">
            {t('mcp.emptyDescription')}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenManagement}
          className="gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t('mcp.manageConnections')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Manage link */}
      <Button
        variant="ghost"
        size="sm"
        className="self-start gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        onClick={onOpenManagement}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        {t('mcp.manageConnections')}
      </Button>

      {/* Assigned servers */}
      {assigned.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('mcp.assignedTitle', { count: assigned.length })}
          </p>
          <div className="flex flex-col gap-2" role="list" aria-label={t('mcp.assignedAria')}>
            {assigned.map((server) => {
              const assignment = assignmentMap.get(server.id)
              return (
                <div key={server.id} role="listitem">
                  <ServerRow
                    server={server}
                    assigned={true}
                    fromSkill={assignment?.fromSkill ?? null}
                    onToggle={(val) => onToggle(server.id, val)}
                  />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {assigned.length > 0 && unassigned.length > 0 && <Separator />}

      {/* Available (unassigned) servers */}
      {unassigned.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('mcp.availableTitle', { count: unassigned.length })}
          </p>
          <div className="flex flex-col gap-2" role="list" aria-label={t('mcp.availableAria')}>
            {unassigned.map((server) => (
              <div key={server.id} role="listitem">
                <ServerRow
                  server={server}
                  assigned={false}
                  fromSkill={null}
                  onToggle={(val) => onToggle(server.id, val)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skill MCP note */}
      <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
        <p className="text-xs text-muted-foreground">
          <Trans
            t={t}
            i18nKey="mcp.skillManagedNote"
            components={[<span key="0" className="font-medium text-amber-400" />]}
          />
        </p>
      </div>
    </div>
  )
}
