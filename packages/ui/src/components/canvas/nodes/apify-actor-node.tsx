'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Boxes } from 'lucide-react'
import type { ApifyActorNodeData } from '@/lib/canvas-utils'
import { NodeShell, NodeField, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'
import { cn } from '@/lib/utils'

const ACCENT = '#22c55e'

function ApifyActorNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as ApifyActorNodeData
  const { selected } = props
  const { chainState } = data

  const isActive = chainState === 'active'
  const isSkipped = chainState === 'skipped'
  const isError = chainState === 'error'

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="apify-actor" selected={selected} />

      <NodeShell
        accent={ACCENT}
        width={230}
        selected={selected}
        hasInput
        runnable={false}
        output={{ label: t('node.apifyActor.outputLabel') }}
        aria-label={t('node.apifyActor.aria', { name: data.name })}
        icon={<Boxes className="h-4 w-4" aria-hidden />}
        title={data.name}
        description={t('node.apifyActor.description')}
        className={cn(
          isActive && 'ring-2 ring-emerald-400/70 shadow-[0_0_24px_rgba(34,197,94,0.35)]',
          isSkipped && 'opacity-50 grayscale',
          isError && 'ring-2 ring-destructive/70',
        )}
      >
        <NodeField label={t('node.apifyActor.actorLabel')}>
          <div className={cn(nodeBoxClass, 'truncate')}>
            {data.actorId || t('node.apifyActor.noActor')}
          </div>
        </NodeField>
        {typeof data.lastItemCount === 'number' && (
          <NodeField label={t('node.apifyActor.lastRunLabel')}>
            <div className={cn(nodeBoxClass, 'truncate')}>
              {t('node.apifyActor.items', { n: data.lastItemCount })}
            </div>
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

export const ApifyActorNode = memo(ApifyActorNodeComponent)
ApifyActorNode.displayName = 'ApifyActorNode'
