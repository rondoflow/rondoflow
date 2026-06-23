'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Database } from 'lucide-react'
import type { DbSaveNodeData } from '@/lib/canvas-utils'
import { NodeShell, NodeField, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'
import { cn } from '@/lib/utils'

const ACCENT = '#6366f1'

function DbSaveNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as DbSaveNodeData
  const { selected } = props
  const { chainState } = data

  const isActive = chainState === 'active'
  const isSkipped = chainState === 'skipped'
  const isError = chainState === 'error'

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="db-save" selected={selected} />

      <NodeShell
        accent={ACCENT}
        width={230}
        selected={selected}
        hasInput
        runnable={false}
        output={null}
        aria-label={t('node.dbSave.aria', { name: data.name })}
        icon={<Database className="h-4 w-4" aria-hidden />}
        title={data.name}
        description={t('node.dbSave.description')}
        className={cn(
          isActive && 'ring-2 ring-indigo-400/70 shadow-[0_0_24px_rgba(99,102,241,0.35)]',
          isSkipped && 'opacity-50 grayscale',
          isError && 'ring-2 ring-destructive/70',
        )}
      >
        {data.label && (
          <NodeField label={t('node.dbSave.labelLabel')}>
            <div className={cn(nodeBoxClass, 'truncate')}>{data.label}</div>
          </NodeField>
        )}
        {typeof data.savedRowCount === 'number' && (
          <NodeField label={t('node.dbSave.lastRunLabel')}>
            <div className={nodeBoxClass}>
              {t('node.dbSave.savedRows', { count: data.savedRowCount })}
            </div>
          </NodeField>
        )}
      </NodeShell>
    </>
  )
}

export const DbSaveNode = memo(DbSaveNodeComponent)
DbSaveNode.displayName = 'DbSaveNode'
