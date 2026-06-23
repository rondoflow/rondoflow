'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Search } from 'lucide-react'
import type { DuckDuckGoSearchNodeData } from '@/lib/canvas-utils'
import { NodeShell, NodeField, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'
import { cn } from '@/lib/utils'

// DuckDuckGo brand orange — distinct from the HTTP Request node's teal.
const ACCENT = '#de5833'

function DuckDuckGoSearchNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as DuckDuckGoSearchNodeData
  const { selected } = props
  const { chainState } = data

  const isActive = chainState === 'active'
  const isSkipped = chainState === 'skipped'
  const isError = chainState === 'error'

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="duckduckgo-search" selected={selected} />

      <NodeShell
        accent={ACCENT}
        width={230}
        selected={selected}
        hasInput
        runnable={false}
        output={{ label: t('node.duckduckgoSearch.outputLabel') }}
        aria-label={t('node.duckduckgoSearch.aria', { name: data.name })}
        icon={<Search className="h-4 w-4" aria-hidden />}
        title={data.name}
        description={t('node.duckduckgoSearch.description')}
        className={cn(
          isActive && 'ring-2 ring-orange-400/70 shadow-[0_0_24px_rgba(222,88,51,0.35)]',
          isSkipped && 'opacity-50 grayscale',
          isError && 'ring-2 ring-destructive/70',
        )}
      >
        <NodeField label={t('node.duckduckgoSearch.queryLabel')}>
          <div className={cn(nodeBoxClass, 'truncate')}>
            {data.query || t('node.duckduckgoSearch.noQuery')}
          </div>
        </NodeField>
        <NodeField label={t('node.duckduckgoSearch.optionsLabel')}>
          <div className={nodeBoxClass}>
            {t('node.duckduckgoSearch.options', { max: data.maxResults, region: data.region || 'us-en' })}
          </div>
        </NodeField>
        {typeof data.lastResultCount === 'number' && (
          <NodeField label={t('node.duckduckgoSearch.lastRunLabel')}>
            <div className={nodeBoxClass}>{t('node.duckduckgoSearch.results', { n: data.lastResultCount })}</div>
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

export const DuckDuckGoSearchNode = memo(DuckDuckGoSearchNodeComponent)
DuckDuckGoSearchNode.displayName = 'DuckDuckGoSearchNode'
