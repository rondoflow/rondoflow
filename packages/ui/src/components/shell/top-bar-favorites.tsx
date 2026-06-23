'use client'

import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { FavoriteAgent } from '@/components/shell/nav-items'

const MAX_VISIBLE = 4

interface TopBarFavoritesProps {
  readonly favorites: readonly FavoriteAgent[]
  readonly onSelect: (agentId: string) => void
}

function statusDotClass(status: string): string {
  if (status === 'running') return 'bg-blue-400 animate-pulse'
  if (status === 'error') return 'bg-red-400'
  return 'bg-green-400'
}

function AgentAvatar({ agent, withStatus }: { agent: FavoriteAgent; withStatus?: boolean }) {
  return (
    <span className="relative inline-flex shrink-0">
      <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
        {agent.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- agent avatar from arbitrary URL
          <img src={agent.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          agent.name.charAt(0).toUpperCase()
        )}
      </span>
      {withStatus && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-card',
            statusDotClass(agent.status),
          )}
          aria-hidden
        />
      )}
    </span>
  )
}

/**
 * Horizontal favorites strip for the top bar — keeps one-click access to starred
 * agents (the main discoverability advantage over hiding them in a menu). Shows
 * up to MAX_VISIBLE avatars with a live status dot; the rest overflow into a
 * "+N" dropdown. Renders nothing when there are no favorites.
 */
export function TopBarFavorites({ favorites, onSelect }: TopBarFavoritesProps) {
  const { t } = useTranslation('shell')
  if (favorites.length === 0) return null

  const visible = favorites.slice(0, MAX_VISIBLE)
  const overflow = favorites.slice(MAX_VISIBLE)

  return (
    <div className="flex items-center gap-0.5">
      {visible.map((agent) => (
        <Tooltip key={agent.id} delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="rounded-full p-0.5 transition-colors hover:bg-muted"
              onClick={() => onSelect(agent.id)}
              aria-label={agent.name}
            >
              <AgentAvatar agent={agent} withStatus />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {agent.name}
          </TooltipContent>
        </Tooltip>
      ))}

      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-6 items-center rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t('favorites.moreCount', { count: overflow.length })}
            >
              +{overflow.length}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t('favorites.label')}
            </DropdownMenuLabel>
            {overflow.map((agent) => (
              <DropdownMenuItem
                key={agent.id}
                className="gap-2 text-xs"
                onSelect={() => onSelect(agent.id)}
              >
                <AgentAvatar agent={agent} />
                <span className="flex-1 truncate">{agent.name}</span>
                <span className={cn('h-1.5 w-1.5 rounded-full', statusDotClass(agent.status))} aria-hidden />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
