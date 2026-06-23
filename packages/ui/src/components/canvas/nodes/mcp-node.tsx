'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Plug } from 'lucide-react'
import { isRemoteMcpTransport, type McpTransport, type McpAuthType } from '@rondoflow/shared'
import { NodeShell } from './node-shell'
import { NodeActions } from './node-actions'

// ---------------------------------------------------------------------------
// Data type
// ---------------------------------------------------------------------------

export interface McpNodeData extends Record<string, unknown> {
  name: string
  serverType?: McpTransport
  /** http/sse servers only. */
  url?: string
  /** When the remote server requires auth (anything other than 'none'). */
  authType?: McpAuthType
  description?: string
}

const MCP_ACCENT = '#a855f7'

/** Host portion of a URL for a compact subtitle, falling back to the raw value. */
function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function McpNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as McpNodeData
  const { selected } = props
  const { name, serverType, url, authType, description } = data

  const transport = serverType ?? 'stdio'
  const secured = !!authType && authType !== 'none'
  const remoteTarget = isRemoteMcpTransport(transport) && url ? hostOf(url) : null

  const subtitle =
    [transport, remoteTarget, secured ? t('node.mcp.secured') : null, description]
      .filter(Boolean)
      .join(' · ') || t('node.mcp.subtitle')

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="mcp" selected={selected} />

      <NodeShell
        accent={MCP_ACCENT}
        width={220}
        selected={selected}
        output={{ label: t('node.mcp.outputLabel') }}
        aria-label={t('node.mcp.aria', { name })}
        icon={<Plug className="h-4 w-4" aria-hidden />}
        title={name}
        description={subtitle}
      />
    </>
  )
}

export const McpNode = memo(McpNodeComponent)
McpNode.displayName = 'McpNode'
