'use client'

import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Rocket, Loader2, CheckCircle2, XCircle, Plug } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiPost } from '@/lib/api'
import type { ClaudeConnectionResult } from '@rondoflow/shared'
import type { StartNodeData, StartConnectionStatus } from '@/lib/canvas-utils'
import { NodeShell, NodeField, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'
import { useCanvasActions } from '../canvas-actions'

// ─── Start node ──────────────────────────────────────────────────────────────
// The fixed, non-deletable entry point present in every canvas. Its function is
// to test the Claude API connection — manually via the "Test" button, and
// automatically as the gate before a workflow run (see page.tsx).

const START_ACCENT = '#10b981' // emerald — the flow's entry point

const STATUS_META: Record<StartConnectionStatus, { labelKey: string; className: string }> = {
  idle: { labelKey: 'node.start.status.idle', className: 'text-muted-foreground' },
  testing: { labelKey: 'node.start.status.testing', className: 'text-blue-500' },
  success: { labelKey: 'node.start.status.success', className: 'text-emerald-500' },
  error: { labelKey: 'node.start.status.error', className: 'text-destructive' },
}

function StartNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as StartNodeData
  const { selected } = props
  const { requestUpdateNodeData } = useCanvasActions()

  const [testing, setTesting] = useState(false)
  const effectiveStatus: StartConnectionStatus = testing ? 'testing' : data.status ?? 'idle'
  const meta = STATUS_META[effectiveStatus]

  const runTest = useCallback(async () => {
    if (testing) return
    setTesting(true)
    requestUpdateNodeData(props.id, { status: 'testing', message: undefined })
    try {
      const result = await apiPost<ClaudeConnectionResult>('/api/claude/test-connection', {})
      requestUpdateNodeData(props.id, {
        status: result.ok ? 'success' : 'error',
        message: result.message,
        testedAt: new Date().toISOString(),
      })
    } catch (err) {
      requestUpdateNodeData(props.id, {
        status: 'error',
        message: err instanceof Error ? err.message : t('node.start.testFailed'),
        testedAt: new Date().toISOString(),
      })
    } finally {
      setTesting(false)
    }
  }, [props.id, requestUpdateNodeData, testing, t])

  const StatusIcon =
    effectiveStatus === 'success'
      ? CheckCircle2
      : effectiveStatus === 'error'
        ? XCircle
        : effectiveStatus === 'testing'
          ? Loader2
          : Plug

  return (
    <>
      <NodeActions
        nodeId={props.id}
        nodeType="start"
        selected={selected}
        editable={false}
        deletable={false}
      />

      <NodeShell
        accent={START_ACCENT}
        width={244}
        selected={selected}
        runnable={false}
        output={{ label: t('node.start.outputLabel') }}
        headerRight={
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              void runTest()
            }}
            disabled={testing}
            className={cn(
              'nodrag flex h-6 items-center gap-1 rounded-md border border-border bg-muted px-2 text-[11px] font-medium text-foreground',
              'transition-colors hover:bg-emerald-500/15 hover:text-emerald-600 disabled:opacity-60',
            )}
            aria-label={t('node.start.testAria')}
            title={t('node.start.testAria')}
          >
            {testing ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            ) : (
              <Plug className="h-3 w-3" aria-hidden />
            )}
            {t('node.start.testLabel')}
          </button>
        }
        aria-label={t('node.start.aria')}
        icon={<Rocket className="h-4 w-4" aria-hidden />}
        title={t('node.start.title')}
        description={t('node.start.description')}
      >
        <NodeField label={t('node.start.fieldLabel')}>
          <div className={cn(nodeBoxClass, 'flex items-start gap-1.5 leading-relaxed')}>
            <StatusIcon
              className={cn(
                'mt-0.5 h-3.5 w-3.5 shrink-0',
                meta.className,
                effectiveStatus === 'testing' && 'animate-spin',
              )}
              aria-hidden
            />
            <span className="min-w-0">
              <span className={cn('font-medium', meta.className)}>{t(meta.labelKey)}</span>
              {data.message && effectiveStatus !== 'testing' && (
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground line-clamp-3">
                  {data.message}
                </span>
              )}
            </span>
          </div>
        </NodeField>
      </NodeShell>
    </>
  )
}

export const StartNode = memo(StartNodeComponent)
StartNode.displayName = 'StartNode'
