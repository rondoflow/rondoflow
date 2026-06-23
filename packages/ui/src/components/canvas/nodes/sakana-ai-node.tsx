'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Waves } from 'lucide-react'
import type { SakanaAiNodeData } from '@/lib/canvas-utils'
import { NodeShell, NodeField, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'
import { cn } from '@/lib/utils'

const ACCENT = '#0ea5e9'

function SakanaAiNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as SakanaAiNodeData
  const { selected } = props
  const { chainState } = data

  const isActive = chainState === 'active'
  const isSkipped = chainState === 'skipped'
  const isError = chainState === 'error'

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="sakana-ai" selected={selected} />

      <NodeShell
        accent={ACCENT}
        width={230}
        selected={selected}
        hasInput
        runnable={false}
        output={{ label: t('node.sakanaAi.outputLabel') }}
        aria-label={t('node.sakanaAi.aria', { name: data.name })}
        icon={<Waves className="h-4 w-4" aria-hidden />}
        title={data.name}
        description={t('node.sakanaAi.description')}
        className={cn(
          isActive && 'ring-2 ring-sky-400/70 shadow-[0_0_24px_rgba(14,165,233,0.35)]',
          isSkipped && 'opacity-50 grayscale',
          isError && 'ring-2 ring-destructive/70',
        )}
      >
        <NodeField label={t('node.sakanaAi.modelLabel')}>
          <div className={cn(nodeBoxClass, 'truncate')}>
            {data.model || t('node.sakanaAi.noModel')}
          </div>
        </NodeField>
        <NodeField label={t('node.sakanaAi.promptLabel')}>
          <div className={cn(nodeBoxClass, 'truncate')}>
            {data.prompt || t('node.sakanaAi.noPrompt')}
          </div>
        </NodeField>
        {data.lastError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
            {data.lastError}
          </div>
        )}
      </NodeShell>
    </>
  )
}

export const SakanaAiNode = memo(SakanaAiNodeComponent)
SakanaAiNode.displayName = 'SakanaAiNode'
