'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Table2 } from 'lucide-react'
import { STRUCTURED_FORMAT_LABELS } from '@rondoflow/shared'
import type { StructurerNodeData } from '@/lib/canvas-utils'
import { NodeShell, NodeField, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'
import { cn } from '@/lib/utils'

const ACCENT = '#0ea5e9'

function StructurerNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as StructurerNodeData
  const { selected } = props
  const { chainState } = data

  const selectionLabel =
    data.agentSelection === 'all'
      ? t('node.structurer.allAgents')
      : data.agentSelection.length === 0
        ? t('node.structurer.noAgents')
        : t('node.structurer.connectedAgents', { count: data.agentSelection.length })

  const isActive = chainState === 'active'
  const isSkipped = chainState === 'skipped'
  const isError = chainState === 'error'

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="structurer" selected={selected} />

      <NodeShell
        accent={ACCENT}
        width={230}
        selected={selected}
        hasInput
        runnable={false}
        output={{ label: t('node.structurer.outputLabel') }}
        aria-label={t('node.structurer.aria', { name: data.name })}
        icon={<Table2 className="h-4 w-4" aria-hidden />}
        title={data.name}
        description={t('node.structurer.description')}
        className={cn(
          isActive && 'ring-2 ring-sky-400/70 shadow-[0_0_24px_rgba(14,165,233,0.35)]',
          isSkipped && 'opacity-50 grayscale',
          isError && 'ring-2 ring-destructive/70',
        )}
      >
        <NodeField label={t('node.structurer.processLabel')}>
          <div className={nodeBoxClass}>{selectionLabel}</div>
        </NodeField>
        <NodeField label={t('node.structurer.formatLabel')}>
          <div className={nodeBoxClass}>
            {STRUCTURED_FORMAT_LABELS[data.format]}
            {' · '}
            {data.extractionMode === 'ai'
              ? t('node.structurer.modeAi')
              : t('node.structurer.modeParse')}
          </div>
        </NodeField>
        {typeof data.lastRowCount === 'number' && (
          <NodeField label={t('node.structurer.lastRunLabel')}>
            <div className={nodeBoxClass}>
              {t('node.structurer.rowCount', { count: data.lastRowCount })}
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

export const StructurerNode = memo(StructurerNodeComponent)
StructurerNode.displayName = 'StructurerNode'
