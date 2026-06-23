'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import { Mail, CheckCircle2, AlertCircle, BellOff } from 'lucide-react'
import type { EmailNodeData } from '@/lib/canvas-utils'
import { parseRecipients } from '@/lib/canvas-utils'
import { NodeShell, NodeField, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'
import { cn } from '@/lib/utils'

const ACCENT = '#6366f1'

function EmailNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as EmailNodeData
  const { selected } = props

  const selectionLabel =
    data.agentSelection === 'all'
      ? t('node.email.allAgents')
      : data.agentSelection.length === 0
        ? t('node.email.noAgents')
        : t('node.email.connectedAgents', { count: data.agentSelection.length })

  const recipientCount = parseRecipients(data.recipients).valid.length
  const recipientsLabel =
    recipientCount === 0
      ? t('node.email.noRecipients')
      : t('node.email.recipientCount', { count: recipientCount })

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="email" selected={selected} />

      <NodeShell
        accent={ACCENT}
        width={230}
        selected={selected}
        hasInput
        runnable={false}
        output={null}
        aria-label={t('node.email.aria', { name: data.name })}
        icon={<Mail className="h-4 w-4" aria-hidden />}
        title={data.name}
        description={t('node.email.description')}
      >
        <NodeField label={t('node.email.processLabel')}>
          <div className={nodeBoxClass}>{selectionLabel}</div>
        </NodeField>
        <NodeField label={t('node.email.recipientsLabel')}>
          <div className={nodeBoxClass}>{recipientsLabel}</div>
        </NodeField>
        <NodeField label={t('node.email.subjectLabel')}>
          <div className={cn(nodeBoxClass, 'truncate')}>
            {data.subject?.trim() || t('node.email.noSubject')}
          </div>
        </NodeField>

        {!data.enabled && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            <BellOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('node.email.sendingOff')}
          </div>
        )}

        {data.enabled && data.lastSentStatus === 'sent' && (
          <div
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
            title={data.lastSentDetail}
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('node.email.sent')}
          </div>
        )}

        {data.enabled && data.lastSentStatus === 'error' && (
          <div
            className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-300"
            title={data.lastSentDetail}
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('node.email.sendFailed')}
          </div>
        )}
      </NodeShell>
    </>
  )
}

export const EmailNode = memo(EmailNodeComponent)
EmailNode.displayName = 'EmailNode'
