'use client'

import React from 'react'
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ErrorBoundaryProps {
  readonly children: React.ReactNode
  readonly fallback?: React.ReactNode
  readonly onError?: (error: Error, info: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  readonly hasError: boolean
  readonly error: Error | null
  readonly detailsOpen: boolean
}

// ─── Default Fallback ──────────────────────────────────────────────────────

interface DefaultFallbackProps {
  readonly error: Error | null
  readonly onReset: () => void
}

function DefaultFallback({ error, onReset }: DefaultFallbackProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(false)

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex h-full min-h-[200px] w-full items-center justify-center p-6"
    >
      <div className="w-full max-w-md rounded-lg border border-destructive/30 bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-3 p-5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/15"
            aria-hidden
          >
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold leading-none text-foreground">
              Something went wrong
            </h3>
            {error && (
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                {error.message}
              </p>
            )}
          </div>
        </div>

        {/* Collapsible details */}
        {error && (
          <div className="border-t border-border">
            <button
              type="button"
              onClick={() => setDetailsOpen((prev) => !prev)}
              aria-expanded={detailsOpen}
              className={cn(
                'flex w-full items-center gap-1.5 px-5 py-2.5 text-left text-[11px] font-medium text-muted-foreground',
                'transition-colors hover:text-foreground',
              )}
            >
              {detailsOpen ? (
                <ChevronUp className="h-3 w-3" aria-hidden />
              ) : (
                <ChevronDown className="h-3 w-3" aria-hidden />
              )}
              {detailsOpen ? 'Hide' : 'Show'} error details
            </button>

            {detailsOpen && (
              <div className="px-5 pb-4">
                <pre
                  className={cn(
                    'overflow-x-auto rounded-md border border-border bg-muted/50 p-3',
                    'font-mono text-[10px] leading-relaxed text-muted-foreground',
                  )}
                >
                  {error.stack ?? error.message}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onReset}
            className={cn(
              'flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5',
              'text-xs font-medium text-primary-foreground',
              'transition-colors hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <RefreshCw className="h-3 w-3" aria-hidden />
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Error Boundary ────────────────────────────────────────────────────────

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, detailsOpen: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, info)
    this.props.onError?.(error, info)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, detailsOpen: false })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <DefaultFallback error={this.state.error} onReset={this.handleReset} />
      )
    }

    return this.props.children
  }
}
