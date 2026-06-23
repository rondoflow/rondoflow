'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, ClipboardList, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { apiGet, apiPatch } from '@/lib/api'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Workspace {
  readonly id: string
  readonly name: string
  readonly planDocument?: string | null
}

interface WorkspacePlanEditorProps {
  readonly workspaceId: string
}

// ─── Component ──────────────────────────────────────────────────────────────

export function WorkspacePlanEditor({ workspaceId }: WorkspacePlanEditorProps) {
  const { t } = useTranslation(['settings', 'common'])
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const workspaces = await apiGet<Workspace[]>('/api/workspaces')
        const ws = workspaces.find((w) => w.id === workspaceId)
        const doc = ws?.planDocument ?? ''
        setContent(doc)
        setSavedContent(doc)
      } catch {
        // best effort
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [workspaceId])

  const isDirty = content !== savedContent

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await apiPatch(`/api/workspaces/${workspaceId}/plan`, {
        planDocument: content || null,
      })
      setSavedContent(content)
    } catch {
      // best effort
    } finally {
      setSaving(false)
    }
  }, [workspaceId, content])

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
          <ClipboardList className="h-4 w-4 text-violet-400" />
          {t('plan.title')}
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
        {t('plan.description')}
      </p>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('plan.placeholder')}
        className="min-h-[200px] font-mono text-xs"
        rows={12}
      />
    </div>
  )
}
