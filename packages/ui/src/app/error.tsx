'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─── Props ─────────────────────────────────────────────────────────────────

interface ErrorPageProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const { t } = useTranslation('app')

  useEffect(() => {
    console.error('[ErrorPage] Unhandled error:', error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      {/* rondoflow wordmark */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
          aria-hidden
        >
          <span className="text-sm font-bold text-primary-foreground">O</span>
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">
          rondoflow
        </span>
      </div>

      {/* Error card */}
      <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-card shadow-md">
        <div className="flex flex-col items-center gap-4 p-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15"
            aria-hidden
          >
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-semibold text-foreground">
              {t('error.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {error.message || t('error.fallback')}
            </p>
            {error.digest && (
              <p className="text-[11px] text-muted-foreground/60">
                {t('error.errorId', { digest: error.digest })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 border-t border-border px-8 py-4">
          <button
            type="button"
            onClick={reset}
            className={cn(
              'flex items-center gap-1.5 rounded-md bg-primary px-4 py-2',
              'text-xs font-medium text-primary-foreground',
              'transition-colors hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            {t('error.tryAgain')}
          </button>

          <Link
            href="/"
            className={cn(
              'flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2',
              'text-xs font-medium text-foreground',
              'transition-colors hover:bg-accent',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            {t('error.goHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
