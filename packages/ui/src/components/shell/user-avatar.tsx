'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut, Settings, Sparkles, Users } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useComplexity } from '@/hooks/use-complexity'
import { useRole } from '@/hooks/use-role'
import {
  USER_MENU_ITEMS,
  isTierVisible,
  type BrowseActions,
} from '@/components/shell/nav-items'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  readonly onSettingsClick?: () => void
  /** Open the admin Users panel. Shown only to admins (canManageUsers). */
  readonly onUsersClick?: () => void
  readonly collapsed?: boolean
  /** Hide the inline name/email (avatar-only trigger), e.g. in the top bar. */
  readonly compact?: boolean
  /** Which way the menu opens. 'top' opens downward (for top-of-screen use). */
  readonly menuSide?: 'top' | 'bottom'
  /**
   * Click handlers for the run-data panels relocated into this menu (Activity,
   * Audit Log, Analytics). Same map the Browse menu uses; items render above
   * Settings and stay tier-gated. Omit to hide them.
   */
  readonly browse?: BrowseActions
  /** Restart the first-run onboarding (wizard + tips) from scratch. */
  readonly onRestartOnboarding?: () => void
}

export function UserAvatar({
  onSettingsClick,
  onUsersClick,
  collapsed = false,
  compact = false,
  menuSide = 'bottom',
  browse,
  onRestartOnboarding,
}: UserAvatarProps) {
  const { t } = useTranslation('shell')
  const { user, signOut } = useAuth()
  const { tier } = useComplexity()
  const { role, canManageUsers } = useRole()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const navItems = browse
    ? USER_MENU_ITEMS.filter((item) => isTierVisible(tier, item.minTier))
    : []

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  if (!user) return null

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  const avatar = (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        user.image ? 'overflow-hidden' : 'bg-primary/10 text-primary',
      )}
    >
      {user.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar from arbitrary OAuth provider URL
        <img src={user.image} alt="" className="h-full w-full object-cover" />
      ) : (
        initials || '?'
      )}
    </span>
  )

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={cn(
          'flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-muted',
          compact ? 'shrink-0' : 'w-full',
          collapsed && 'justify-center',
        )}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('userMenu.trigger')}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {avatar}
        {!collapsed && !compact && (
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-xs font-medium">{user.name}</span>
            <span className="block truncate text-[10px] text-muted-foreground">{user.email}</span>
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 w-56 rounded-md border border-border bg-card py-1 shadow-lg',
            menuSide === 'top' ? 'right-0 top-full mt-1' : 'left-0 bottom-full mb-1',
          )}
          role="menu"
        >
          {/* User info */}
          <div className="border-b border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <Badge
                variant={role === 'admin' ? 'default' : 'secondary'}
                className="shrink-0 text-[10px] capitalize"
              >
                {role}
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>

          {/* Relocated run-data panels (Activity / Audit Log / Analytics) */}
          {navItems.map((item) => (
            <button
              key={item.action}
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => {
                setOpen(false)
                browse?.[item.action]?.()
              }}
            >
              <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
              {t(item.labelKey)}
            </button>
          ))}
          {navItems.length > 0 && <div className="border-t border-border" />}

          {/* Admin: user management */}
          {canManageUsers && onUsersClick && (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => {
                setOpen(false)
                onUsersClick()
              }}
            >
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              {t('userMenu.item.users')}
            </button>
          )}

          {/* Menu items */}
          {onRestartOnboarding && (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => {
                setOpen(false)
                onRestartOnboarding()
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              {t('userMenu.item.restartOnboarding')}
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            onClick={() => {
              setOpen(false)
              onSettingsClick?.()
            }}
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            {t('userMenu.item.settings')}
          </button>
          <div className="border-t border-border" />

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
            onClick={() => {
              setOpen(false)
              void signOut()
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('userMenu.item.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}
