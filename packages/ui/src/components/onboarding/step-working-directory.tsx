'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderOpen, AlertTriangle, CheckCircle2, RefreshCw, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FolderPicker } from '@/components/shared/folder-picker'
import { apiGet } from '@/lib/api'

interface HealthResponse {
  readonly status: string
  readonly prerequisites: {
    readonly results: ReadonlyArray<{
      readonly name: string
      readonly passed: boolean
      readonly fix?: string
    }>
  }
}

export interface StepWorkingDirectoryProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly onContinue: () => void
}

export function StepWorkingDirectory({ value, onChange, onContinue }: StepWorkingDirectoryProps) {
  const { t } = useTranslation('onboarding')
  const [error, setError] = useState<string | null>(null)
  const [cliInstalled, setCliInstalled] = useState<boolean | null>(null)
  const [authConfigured, setAuthConfigured] = useState<boolean | null>(null)
  const [checkingCli, setCheckingCli] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)

  // Check CLI on mount
  useEffect(() => {
    checkCli()
  }, [])

  async function checkCli() {
    setCheckingCli(true)
    try {
      const health = await apiGet<HealthResponse>('/api/health')
      const cli = health.prerequisites.results.find((r) => r.name === 'Claude Code CLI')
      setCliInstalled(cli?.passed ?? false)
      const auth = health.prerequisites.results.find((r) => r.name === 'Claude authentication')
      setAuthConfigured(auth?.passed ?? null)
    } catch {
      setCliInstalled(false)
      setAuthConfigured(null)
    } finally {
      setCheckingCli(false)
    }
  }

  // Auto-detect working directory from server
  useEffect(() => {
    if (value) return
    apiGet<{ directory: string }>('/api/workspaces/detect-directory')
      .then((res) => {
        if (res.directory) {
          onChange(res.directory)
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount to auto-detect the directory
  }, [])

  function handleContinue() {
    const trimmed = value.trim()
    if (!trimmed) {
      setError(t('directory.error.required'))
      return
    }
    setError(null)
    onContinue()
  }

  function handleFolderSelect(path: string) {
    onChange(path)
    setError(null)
    setPickerOpen(false)
  }

  const canContinue = cliInstalled === true && !checkingCli

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <FolderOpen className="h-10 w-10 text-muted-foreground" />

      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('directory.heading')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('directory.description')}
        </p>
      </div>

      {/* CLI status */}
      <div className="w-full max-w-md">
        {checkingCli ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-border p-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t('directory.cli.checking')}
          </div>
        ) : cliInstalled ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {t('directory.cli.detected')}
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
            <div className="flex items-center gap-2 text-sm text-yellow-200">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              {t('directory.cli.notDetected')}
            </div>
            <p className="text-xs text-yellow-200/70">
              {t('directory.cli.installHint')}{' '}
              <code className="rounded bg-yellow-500/10 px-1 py-0.5 font-mono">
                npm install -g @anthropic-ai/claude-code
              </code>
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 gap-1.5 text-xs text-yellow-200 hover:bg-yellow-500/20"
              onClick={checkCli}
            >
              <RefreshCw className="h-3 w-3" aria-hidden />
              {t('directory.cli.checkAgain')}
            </Button>
          </div>
        )}
      </div>

      {/* Claude auth status — non-blocking; can be configured via .env or Settings */}
      {!checkingCli && cliInstalled && authConfigured === false && (
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-1 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-left">
            <div className="flex items-center gap-2 text-sm text-yellow-200">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              {t('directory.auth.missing')}
            </div>
            <p className="text-xs text-yellow-200/70">
              {t('directory.auth.hintSet')} <code className="rounded bg-yellow-500/10 px-1 py-0.5 font-mono">ANTHROPIC_API_KEY</code>{t('directory.auth.hintOrRun')}{' '}
              <code className="rounded bg-yellow-500/10 px-1 py-0.5 font-mono">claude setup-token</code> {t('directory.auth.hintAndSet')}{' '}
              <code className="rounded bg-yellow-500/10 px-1 py-0.5 font-mono">CLAUDE_CODE_OAUTH_TOKEN</code> {t('directory.auth.hintTail')}
            </p>
          </div>
        </div>
      )}

      {/* Working directory input + browse */}
      <div className="w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => { onChange(e.target.value); setError(null) }}
            placeholder={t('directory.placeholder')}
            className="h-11 flex-1 rounded-lg border bg-background px-4 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            autoFocus
            disabled={!canContinue}
            onKeyDown={(e) => { if (e.key === 'Enter' && canContinue) handleContinue() }}
          />
          <Button
            variant="outline"
            className="h-11 gap-1.5 shrink-0"
            onClick={() => setPickerOpen(true)}
            disabled={!canContinue}
          >
            <Search className="h-4 w-4" aria-hidden />
            {t('action.browse')}
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {t('directory.hint')}
        </p>
      </div>

      <Button className="mt-2" onClick={handleContinue} disabled={!canContinue}>
        {t('action.continue')}
      </Button>

      {/* Folder picker dialog */}
      <FolderPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        initialPath={value || null}
        onSelect={handleFolderSelect}
      />
    </div>
  )
}
