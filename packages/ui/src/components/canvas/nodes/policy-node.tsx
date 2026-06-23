'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Shield } from 'lucide-react'
import type { PolicyNodeData } from '@/lib/canvas-utils'
import { NodeShell } from './node-shell'
import { NodeActions } from './node-actions'

const LEVEL_ACCENTS: Record<PolicyNodeData['level'], string> = {
  global: '#3b82f6',
  agent: '#eab308',
  session: '#94a3b8',
}

const LEVEL_LABEL_KEYS: Record<PolicyNodeData['level'], string> = {
  global: 'node.policy.level.global',
  agent: 'node.policy.level.agent',
  session: 'node.policy.level.session',
}

function PolicyNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as PolicyNodeData
  const { selected } = props
  const { name, level } = data
  const accent = LEVEL_ACCENTS[level]
  const levelLabel = t(LEVEL_LABEL_KEYS[level])

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="policy" selected={selected} />

      <NodeShell
        accent={accent}
        width={210}
        selected={selected}
        output={{ label: t('node.policy.outputLabel') }}
        aria-label={t('node.policy.aria', { name, level: levelLabel })}
        icon={<Shield className="h-4 w-4" aria-hidden />}
        title={name}
        description={t('node.policy.description', { level: levelLabel })}
      />
    </>
  )
}

export const PolicyNode = memo(PolicyNodeComponent)
PolicyNode.displayName = 'PolicyNode'
