'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { FileOutput, ExternalLink } from 'lucide-react'
import { OUTPUT_FORMAT_LABELS } from '@rondoflow/shared'
import type { OutputNodeData } from '@/lib/canvas-utils'
import { NodeShell, NodeField, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'
import { useCanvasActions } from '../canvas-actions'
import { cn } from '@/lib/utils'

const ACCENT = '#14b8a6'

function OutputNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as OutputNodeData
  const { selected } = props
  const { requestViewOutput } = useCanvasActions()

  const selectionLabel =
    data.agentSelection === 'all'
      ? t('node.output.allAgents')
      : data.agentSelection.length === 0
        ? t('node.output.noAgents')
        : t('node.output.connectedAgents', { count: data.agentSelection.length })

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="output" selected={selected} />

      <NodeShell
        accent={ACCENT}
        width={230}
        selected={selected}
        hasInput
        runnable={false}
        output={null}
        aria-label={t('node.output.aria', { name: data.name })}
        icon={<FileOutput className="h-4 w-4" aria-hidden />}
        title={data.name}
        description={t('node.output.description')}
      >
        <NodeField label={t('node.output.processLabel')}>
          <div className={nodeBoxClass}>{selectionLabel}</div>
        </NodeField>
        <NodeField label={t('node.output.formatLabel')}>
          <div className={nodeBoxClass}>{OUTPUT_FORMAT_LABELS[data.format]}</div>
        </NodeField>
        <NodeField label={t('node.output.destinationLabel')}>
          <div className={cn(nodeBoxClass, 'truncate')}>
            {data.destinationDir || t('node.output.workspaceFolder')}
          </div>
        </NodeField>

        {data.savedOutputName && (
          <button
            type="button"
            className="nodrag flex w-full items-center justify-center gap-1.5 rounded-lg border border-teal-500/40 bg-teal-500/10 px-2.5 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:border-teal-500/70 hover:bg-teal-500/20 dark:text-teal-300"
            onClick={(e) => {
              e.stopPropagation()
              requestViewOutput(data.savedOutputDir, data.savedOutputName!)
            }}
            title={t('node.output.openTitle', { name: data.savedOutputName })}
            aria-label={t('node.output.openAria', { name: data.savedOutputName })}
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('node.output.openSaved')}
          </button>
        )}
      </NodeShell>
    </>
  )
}

export const OutputNode = memo(OutputNodeComponent)
OutputNode.displayName = 'OutputNode'
