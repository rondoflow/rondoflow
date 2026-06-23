import type { ComponentType } from 'react'
import {
  Puzzle,
  MessageSquare,
  Activity,
  ScrollText,
  Brain,
  History,
  BarChart3,
  Clock,
  HardDrive,
} from 'lucide-react'
import type { ComplexityTier } from '@/hooks/use-complexity'

// ─── Browse navigation metadata ──────────────────────────────────────────────
// Shared between the top-bar Browse menu and the command palette. Lifted out of
// the (now removed) left sidebar so tier-gating survives the sidebar's removal.

export type BrowseAction =
  | 'assistants'
  | 'skills'
  | 'facilitators'
  | 'discussions'
  | 'activity'
  | 'audit'
  | 'memory'
  | 'history'
  | 'analytics'
  | 'schedules'
  | 'external-folders'

export type BrowseGroup = 'People' | 'Run data' | 'System'

export interface NavItem {
  readonly icon: ComponentType<{ className?: string }>
  /** i18n key in the `shell` namespace; resolved with `t()` at the render site. */
  readonly labelKey: string
  readonly shortcut?: string
  readonly action: BrowseAction
  readonly group: BrowseGroup
  readonly minTier: ComplexityTier
}

export const GROUP_ORDER: readonly BrowseGroup[] = ['People', 'Run data', 'System']

export const BROWSE_ITEMS: readonly NavItem[] = [
  // 'People' panels live outside this Browse dropdown: Discussions is a dedicated
  // top-bar button (see TOP_BAR_ITEMS), Facilitators lives inside the Discussions
  // panel header, and Assistants lives in the canvas workflow-toolbar. None are
  // duplicated here.
  //
  // 'Run data' is split: History stays here; Activity, Audit Log, and Analytics
  // were relocated into the user (account) menu — see USER_MENU_ITEMS.
  { icon: History, labelKey: 'browse.item.history', action: 'history', group: 'System', minTier: 'standard' },
  { icon: Puzzle, labelKey: 'browse.item.skills', shortcut: 'S', action: 'skills', group: 'System', minTier: 'simple' },
  { icon: HardDrive, labelKey: 'browse.item.externalFolders', action: 'external-folders', group: 'System', minTier: 'simple' },
  { icon: Brain, labelKey: 'browse.item.memory', shortcut: 'M', action: 'memory', group: 'System', minTier: 'standard' },
  { icon: Clock, labelKey: 'browse.item.schedules', action: 'schedules', group: 'System', minTier: 'simple' },
]

/**
 * People panels relocated out of the Browse menu into dedicated top-bar buttons
 * for one-click access. Same NavItem shape (icon/label/action/minTier) so they
 * stay tier-gated and reuse the page's Browse action handlers. Two exceptions:
 * Assistants lives in the canvas workflow-toolbar (top-center) — see
 * WorkflowToolbar's `onAssistantsClick`; and Facilitators lives inside the
 * Discussions panel header, next to its "New Discussion" button.
 */
export const TOP_BAR_ITEMS: readonly NavItem[] = [
  { icon: MessageSquare, labelKey: 'browse.item.discussions', action: 'discussions', group: 'People', minTier: 'standard' },
]

/**
 * Run-data panels relocated out of the Browse menu into the user (account) menu,
 * rendered directly above the Settings item. Same NavItem shape (icon/label/
 * action/minTier) so they stay tier-gated and reuse the page's Browse action
 * handlers (`UserAvatar` receives the same `BrowseActions` map). History is the
 * one 'Run data' panel that stayed in the Browse menu.
 */
export const USER_MENU_ITEMS: readonly NavItem[] = [
  { icon: Activity, labelKey: 'userMenu.item.activity', action: 'activity', group: 'Run data', minTier: 'standard' },
  { icon: ScrollText, labelKey: 'userMenu.item.audit', action: 'audit', group: 'Run data', minTier: 'standard' },
  { icon: BarChart3, labelKey: 'userMenu.item.analytics', action: 'analytics', group: 'Run data', minTier: 'standard' },
]

/** Optional click handler per browse action — supplied by the page. */
export type BrowseActions = Partial<Record<BrowseAction, () => void>>

const TIER_ORDER: Record<ComplexityTier, number> = { simple: 0, standard: 1, full: 2 }

export function isTierVisible(tier: ComplexityTier, minTier: ComplexityTier): boolean {
  return TIER_ORDER[tier] >= TIER_ORDER[minTier]
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export interface FavoriteAgent {
  readonly id: string
  readonly name: string
  readonly avatar?: string | null
  readonly status: string
}
