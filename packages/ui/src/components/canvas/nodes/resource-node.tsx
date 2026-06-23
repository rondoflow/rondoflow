'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { FolderOpen } from 'lucide-react'
import { NodeShell, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'

// ─── Data type ─────────────────────────────────────────────────────────────

export interface ResourceNodeData extends Record<string, unknown> {
  label?: string
  fileCount?: number
  linkCount?: number
  noteCount?: number
  variableCount?: number
}

const RESOURCE_ACCENT = '#06b6d4'

// ─── Component ─────────────────────────────────────────────────────────────

function ResourceNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as ResourceNodeData
  const { selected } = props
  const {
    fileCount = 0,
    linkCount = 0,
    noteCount = 0,
    variableCount = 0,
  } = data
  const label = data.label ?? t('node.resource.defaultLabel')

  const fileLine = `${t('node.resource.files', { count: fileCount })} · ${t('node.resource.links', { count: linkCount })}`
  const noteLine = `${t('node.resource.notes', { count: noteCount })} · ${t('node.resource.vars', { count: variableCount })}`

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="resource" selected={selected} />

      <NodeShell
        accent={RESOURCE_ACCENT}
        width={220}
        selected={selected}
        hasInput
        output={{ label: t('node.resource.outputLabel') }}
        aria-label={t('node.resource.aria', { fileCount, linkCount, noteCount, variableCount })}
        icon={<FolderOpen className="h-4 w-4" aria-hidden />}
        title={label}
        description={t('node.resource.description')}
      >
        <div className={nodeBoxClass}>
          <p>{fileLine}</p>
          <p className="mt-0.5">{noteLine}</p>
        </div>
      </NodeShell>
    </>
  )
}

export const ResourceNode = memo(ResourceNodeComponent)
ResourceNode.displayName = 'ResourceNode'
