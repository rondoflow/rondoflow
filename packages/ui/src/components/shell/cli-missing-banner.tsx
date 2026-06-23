'use client'

import { useTranslation } from 'react-i18next'
import { AlertTriangle, ExternalLink, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface CliMissingBannerProps {
  readonly visible: boolean
  readonly loading: boolean
  readonly onRecheck: () => void
}

export function CliMissingBanner({ visible, loading, onRecheck }: CliMissingBannerProps) {
  const { t } = useTranslation('shell')
  if (!visible) return null

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-2.5">
      <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-yellow-200">
          {t('cliBanner.title')}
        </p>
        <p className="text-xs text-yellow-200/70">
          {t('cliBanner.description')}{' '}
          <code className="rounded bg-yellow-500/10 px-1 py-0.5 font-mono text-yellow-200">
            npm install -g @anthropic-ai/claude-code
          </code>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-yellow-200 hover:bg-yellow-500/20 hover:text-yellow-100"
          onClick={onRecheck}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-3 w-3" aria-hidden />
          )}
          {t('cliBanner.checkAgain')}
        </Button>
        <a
          href="https://docs.anthropic.com/en/docs/claude-code"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-yellow-200 transition-colors hover:bg-yellow-500/20 hover:text-yellow-100"
        >
          <ExternalLink className="h-3 w-3" aria-hidden />
          {t('cliBanner.installGuide')}
        </a>
      </div>
    </div>
  )
}
