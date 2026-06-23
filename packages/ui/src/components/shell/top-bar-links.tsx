'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useComplexity } from '@/hooks/use-complexity'
import {
  TOP_BAR_ITEMS,
  isTierVisible,
  type BrowseActions,
} from '@/components/shell/nav-items'

interface TopBarLinksProps {
  readonly actions: BrowseActions
}

/**
 * Dedicated top-bar button(s) for the People panels, relocated out of the Browse
 * menu for one-click access. Currently just Discussions: Facilitators now lives
 * inside the Discussions panel header, and Assistants lives in the canvas
 * workflow-toolbar (see WorkflowToolbar's onAssistantsClick).
 * Each is tier-gated via
 * useComplexity so it only shows when its panel is available, and reuses the
 * page's Browse action handlers. Labels collapse to icon-only (tooltip) on
 * narrow viewports. Renders nothing when no item is visible at the current tier.
 */
export function TopBarLinks({ actions }: TopBarLinksProps) {
  const { t } = useTranslation('shell')
  const { tier } = useComplexity()

  const visible = TOP_BAR_ITEMS.filter((item) => isTierVisible(tier, item.minTier))
  if (visible.length === 0) return null

  return (
    <>
      {visible.map((item) => (
        <Tooltip key={item.action} delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => actions[item.action]?.()}
              aria-label={t(item.labelKey)}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden lg:inline">{t(item.labelKey)}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {t(item.labelKey)}
          </TooltipContent>
        </Tooltip>
      ))}
    </>
  )
}
