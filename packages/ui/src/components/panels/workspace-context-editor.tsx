'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, FileText, FolderOpen, Loader2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { apiGet, apiPatch } from '@/lib/api'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Workspace {
  readonly id: string
  readonly name: string
  readonly contextDocument?: string | null
  readonly workingDirectory?: string | null
}

interface WorkspaceContextEditorProps {
  readonly workspaceId: string
}

// ─── Component ──────────────────────────────────────────────────────────────

export function WorkspaceContextEditor({ workspaceId }: WorkspaceContextEditorProps) {
  const { t } = useTranslation(['settings', 'common'])
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [workingDir, setWorkingDir] = useState('')
  const [savedWorkingDir, setSavedWorkingDir] = useState('')
  const [workingDirStatus, setWorkingDirStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [workingDirError, setWorkingDirError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const workspaces = await apiGet<Workspace[]>('/api/workspaces')
        const ws = workspaces.find((w) => w.id === workspaceId)
        const doc = ws?.contextDocument ?? ''
        const dir = ws?.workingDirectory ?? ''
        setContent(doc)
        setSavedContent(doc)
        setWorkingDir(dir)
        setSavedWorkingDir(dir)
      } catch {
        // best effort
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [workspaceId])

  const isDirty = content !== savedContent
  const isWorkingDirDirty = workingDir !== savedWorkingDir

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await apiPatch(`/api/workspaces/${workspaceId}/context`, {
        contextDocument: content || null,
      })
      setSavedContent(content)
    } catch {
      // best effort
    } finally {
      setSaving(false)
    }
  }, [workspaceId, content])

  const handleSaveWorkingDir = useCallback(async () => {
    setWorkingDirStatus('saving')
    setWorkingDirError('')
    try {
      await apiPatch(`/api/workspaces/${workspaceId}`, {
        workingDirectory: workingDir.trim() || null,
      })
      setSavedWorkingDir(workingDir.trim())
      setWorkingDirStatus('saved')
      setTimeout(() => setWorkingDirStatus('idle'), 2000)
    } catch (err) {
      setWorkingDirStatus('error')
      setWorkingDirError(err instanceof Error ? err.message : t('context.workingDir.saveError'))
    }
  }, [workspaceId, workingDir, t])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-cyan-400" />
          {t('context.title')}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 px-2 text-xs"
          disabled={!isDirty || saving}
          onClick={() => void handleSave()}
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          {t('common:action.save')}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {t('context.description')}
      </p>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('context.placeholder')}
        className="min-h-[200px] font-mono text-xs"
        rows={12}
      />

      <Separator className="my-1" />

      {/* Working Directory */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FolderOpen className="h-4 w-4 text-amber-400" />
          {t('context.workingDir.title')}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 px-2 text-xs"
          disabled={!isWorkingDirDirty || workingDirStatus === 'saving'}
          onClick={() => void handleSaveWorkingDir()}
        >
          {workingDirStatus === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
          {workingDirStatus === 'saved' && <Check className="h-3 w-3 text-green-500" />}
          {workingDirStatus === 'error' && <AlertCircle className="h-3 w-3 text-destructive" />}
          {(workingDirStatus === 'idle' || workingDirStatus === 'error') && <Save className="h-3 w-3" />}
          {workingDirStatus === 'saved' ? t('context.workingDir.saved') : t('common:action.save')}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {t('context.workingDir.description')}
      </p>
      <Input
        value={workingDir}
        onChange={(e) => {
          setWorkingDir(e.target.value)
          setWorkingDirStatus('idle')
          setWorkingDirError('')
        }}
        placeholder={t('context.workingDir.placeholder')}
        className="font-mono text-xs"
      />
      {workingDirError && (
        <p className="text-[10px] text-destructive">{workingDirError}</p>
      )}
    </div>
  )
}
