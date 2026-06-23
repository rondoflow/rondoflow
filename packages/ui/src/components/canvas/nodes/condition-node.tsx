'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Split } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConditionNodeData, NodeBranch } from '@/lib/canvas-utils'
import { NodeShell } from './node-shell'
import { NodeActions } from './node-actions'

const ACCENT = '#f59e0b'

// NodeProps uses Record<string,unknown> for data; cast to our typed interface.
function ConditionNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as ConditionNodeData
  const { selected } = props
  const { name, branches, chainState } = data

  // Each branch becomes a labelled source handle. The else branch gets a hint so
  // it reads as the fallback route. Handle id === branch id (the edge sourceHandle).
  const shellBranches: NodeBranch[] = (branches ?? []).map((b) => ({
    id: b.id,
    label: b.isElse
      ? t('node.condition.elseSuffix', { label: b.label || t('node.condition.else') })
      : b.label || t('node.condition.branch'),
  }))

  const isActive = chainState === 'active'
  const isSkipped = chainState === 'skipped'

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="condition" selected={selected} />

      <NodeShell
        accent={ACCENT}
        width={230}
        selected={selected}
        hasInput
        runnable={false}
        output={null}
        branches={shellBranches}
        aria-label={t('node.condition.aria', { name })}
        icon={<Split className="h-4 w-4" aria-hidden />}
        title={name}
        description={t('node.condition.description')}
        className={cn(
          isActive && 'ring-2 ring-amber-400/70 shadow-[0_0_24px_rgba(245,158,11,0.35)]',
          isSkipped && 'opacity-50 grayscale',
        )}
      />
    </>
  )
}

export const ConditionNode = memo(ConditionNodeComponent)
ConditionNode.displayName = 'ConditionNode'
