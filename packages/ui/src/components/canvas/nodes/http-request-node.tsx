'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Webhook } from 'lucide-react'
import type { HttpRequestNodeData } from '@/lib/canvas-utils'
import { NodeShell, NodeField, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'
import { cn } from '@/lib/utils'

const ACCENT = '#14b8a6'

function HttpRequestNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as HttpRequestNodeData
  const { selected } = props
  const { chainState } = data

  const isActive = chainState === 'active'
  const isSkipped = chainState === 'skipped'
  const isError = chainState === 'error'

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="http-request" selected={selected} />

      <NodeShell
        accent={ACCENT}
        width={230}
        selected={selected}
        hasInput
        runnable={false}
        output={{ label: t('node.httpRequest.outputLabel') }}
        aria-label={t('node.httpRequest.aria', { name: data.name })}
        icon={<Webhook className="h-4 w-4" aria-hidden />}
        title={data.name}
        description={t('node.httpRequest.description')}
        className={cn(
          isActive && 'ring-2 ring-teal-400/70 shadow-[0_0_24px_rgba(20,184,166,0.35)]',
          isSkipped && 'opacity-50 grayscale',
          isError && 'ring-2 ring-destructive/70',
        )}
      >
        <NodeField label={t('node.httpRequest.requestLabel')}>
          <div className={cn(nodeBoxClass, 'truncate')}>
            <span className="font-mono font-semibold text-foreground">{data.method}</span>
            {' '}
            {data.url || t('node.httpRequest.noUrl')}
          </div>
        </NodeField>
        {typeof data.lastStatus === 'number' && (
          <NodeField label={t('node.httpRequest.lastRunLabel')}>
            <div className={nodeBoxClass}>{t('node.httpRequest.status', { status: data.lastStatus })}</div>
          </NodeField>
        )}
        {data.lastError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
            {data.lastError}
          </div>
        )}
      </NodeShell>
    </>
  )
}

export const HttpRequestNode = memo(HttpRequestNodeComponent)
HttpRequestNode.displayName = 'HttpRequestNode'
