'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GitBranch, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { apiPost } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Skill } from '@rondoflow/shared'

type ImportStatus = 'idle' | 'loading' | 'success' | 'error'

/** Derive a valid skill name from a git URL's final path segment. */
function deriveSkillName(gitUrl: string): string {
  const last = gitUrl.replace(/\/+$/, '').split('/').pop() ?? ''
  const cleaned = last.replace(/\.git$/i, '').replace(/[^a-zA-Z0-9_-]/g, '-')
  // Server caps the name at 100 chars (InstallGitSchema); slicing a regex-valid
  // string keeps it valid.
  return (cleaned || 'skill').slice(0, 100)
}

export function ImportTab({ onImportSuccess }: { readonly onImportSuccess: () => void | Promise<void> }) {
  const { t } = useTranslation('resources')
  const [gitUrl, setGitUrl] = useState('')
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function handleImport() {
    const url = gitUrl.trim()
    if (!url) return

    setStatus('loading')
    setMessage(null)

    try {
      const skill = await apiPost<Skill>('/api/skills/install/git', {
        name: deriveSkillName(url),
        gitUrl: url,
      })
      setStatus('success')
      setMessage(t('marketplace.import.success', { name: skill.name }))
      setGitUrl('')
      await onImportSuccess()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : t('marketplace.import.failed'))
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleImport()
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="git-url-input"
          className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
        >
          {t('marketplace.import.label')}
        </label>
        <p className="text-xs text-muted-foreground">
          {t('marketplace.import.intro')}
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          id="git-url-input"
          value={gitUrl}
          onChange={(e) => setGitUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('marketplace.import.placeholder')}
          className="font-mono text-xs"
          disabled={status === 'loading'}
          aria-label={t('marketplace.import.aria')}
        />
        <Button
          onClick={() => void handleImport()}
          disabled={!gitUrl.trim() || status === 'loading'}
          size="sm"
          className="shrink-0 gap-1.5"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t('marketplace.import.importing')}
            </>
          ) : (
            <>
              <GitBranch className="h-3.5 w-3.5" />
              {t('marketplace.import.submit')}
            </>
          )}
        </Button>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={cn(
            'flex items-start gap-2 rounded-md border px-3 py-2.5 text-xs',
            status === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-destructive/30 bg-destructive/10 text-destructive',
          )}
          role="status"
          aria-live="polite"
        >
          {status === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          {message}
        </div>
      )}

      <Separator />

      {/* Requirements note */}
      <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="mb-2 font-medium text-foreground/80">{t('marketplace.import.requirements')}</p>
        <ul className="flex flex-col gap-1.5 pl-1">
          <li className="flex items-start gap-1.5">
            <span className="mt-0.5 text-muted-foreground/50" aria-hidden>•</span>
            <span>
              {t('marketplace.import.req1Prefix')} <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">SKILL.md</code> {t('marketplace.import.req1Suffix')}
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-0.5 text-muted-foreground/50" aria-hidden>•</span>
            {t('marketplace.import.req2')}
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-0.5 text-muted-foreground/50" aria-hidden>•</span>
            <span>
              {t('marketplace.import.req3Prefix')} <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">package.json</code> {t('marketplace.import.req3Mid')} <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">mcp.json</code> {t('marketplace.import.req3Suffix')}
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
