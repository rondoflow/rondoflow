'use client'

import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { type NodeProps } from '@xyflow/react'
import Image from 'next/image'
import { CheckCircle2, Timer, Sparkles, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStatusHex, getStatusLabel, type AgentNodeData } from '@/lib/canvas-utils'
import { ModeBadge } from '@/components/panels/mode-toggle'
import type { AgentMode } from '@rondoflow/shared'
import { MODEL_TIERS } from '@rondoflow/shared'
import { NodeShell, NodeField, nodeBoxClass } from './node-shell'
import { NodeActions } from './node-actions'
import { TemplateText } from './template-text'
import { useCanvasActions } from '../canvas-actions'

// ─── Avatar (header icon chip) ───────────────────────────────────────────────

function AgentAvatar({
  avatar,
  name,
  accent,
}: {
  avatar?: string
  name: string
  accent: string
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

  if (avatar) {
    return (
      <Image
        src={avatar}
        alt=""
        aria-hidden
        width={28}
        height={28}
        className="h-7 w-7 rounded-lg object-cover"
      />
    )
  }

  return (
    <span className="text-xs font-semibold" style={{ color: accent }} aria-hidden>
      {initials || '?'}
    </span>
  )
}

// ─── Model badge ───────────────────────────────────────────────────────────

function ModelBadge({ model }: { model?: string }) {
  if (!model) return null

  const label =
    model in MODEL_TIERS
      ? MODEL_TIERS[model as keyof typeof MODEL_TIERS].label
      : model

  return (
    <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
      {label}
    </span>
  )
}

// ─── Provider badge (API-backed agents) ──────────────────────────────────────

const PROVIDER_BADGE: Partial<
  Record<NonNullable<AgentNodeData['provider']>, { label: string; icon: typeof Sparkles }>
> = {
  openai: { label: 'OpenAI', icon: Sparkles },
  perplexity: { label: 'Perplexity', icon: Globe },
}

function ProviderBadge({ provider }: { provider?: AgentNodeData['provider'] }) {
  const meta = provider ? PROVIDER_BADGE[provider] : undefined
  if (!meta) return null
  const Icon = meta.icon
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
      <Icon className="h-2.5 w-2.5" aria-hidden />
      {meta.label}
    </span>
  )
}

// ─── Agent node ────────────────────────────────────────────────────────────

// NodeProps uses Record<string,unknown> for data; we cast to our typed interface.
function AgentNodeComponent(props: NodeProps) {
  const { t } = useTranslation('canvas')
  const data = props.data as AgentNodeData
  const { selected } = props
  const { name, description, message, avatar, status, model, permissionMode, provider, providerConfig, chainState, hasSchedule, branches, skipped } = data
  const statusLabel = getStatusLabel(status)
  const isApiProvider = provider === 'openai' || provider === 'perplexity'
  // API agents display their own model (or a "Deep Research" marker) and have no
  // Claude permission mode, so the badge row is driven differently.
  const displayModel = isApiProvider
    ? providerConfig?.deepResearch
      ? t('node.agent.deepResearch')
      : providerConfig?.model
    : model
  const hasBadges = Boolean(isApiProvider || displayModel || (permissionMode && permissionMode !== 'default'))

  const isActive = chainState === 'active'
  const isCompleted = chainState === 'completed'
  const isPending = chainState === 'pending'
  const isChainError = chainState === 'error'
  const isChainSkipped = chainState === 'skipped'

  const accent = isCompleted ? '#22c55e' : getStatusHex(status)
  const running = status === 'running' && !isCompleted

  const { requestUpdateNodeData } = useCanvasActions()
  const handleSkipToggle = useCallback(() => {
    requestUpdateNodeData(props.id, { skipped: !skipped })
  }, [props.id, requestUpdateNodeData, skipped])

  return (
    <>
      <NodeActions nodeId={props.id} nodeType="agent" selected={selected} />

      <NodeShell
        accent={accent}
        width={260}
        selected={selected}
        chip={!avatar}
        hasInput
        output={{ label: t('node.agent.outputLabel') }}
        branches={branches}
        running={running}
        skipped={skipped}
        onSkipToggle={handleSkipToggle}
        headerRight={
          isCompleted ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" aria-hidden />
          ) : undefined
        }
        aria-label={t('node.agent.aria', { name, status: statusLabel })}
        className={cn(
          isActive && 'ring-2 ring-blue-400/70 shadow-[0_0_24px_rgba(96,165,250,0.35)]',
          isCompleted && 'border-green-500/50',
          isPending && 'opacity-50',
          isChainError && 'ring-2 ring-red-400/70',
          isChainSkipped && 'opacity-40 grayscale',
          skipped && 'opacity-50 grayscale',
        )}
        icon={<AgentAvatar avatar={avatar} name={name} accent={accent} />}
        title={name}
        description={description}
      >
        {/* Schedule badge — top right corner */}
        {hasSchedule && (
          <div
            className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-lg border bg-card shadow-sm"
            title={t('node.agent.scheduleTitle')}
          >
            <Timer className="h-3.5 w-3.5 text-amber-500" aria-hidden />
          </div>
        )}

        {message && (
          <NodeField label={t('node.agent.instructionsLabel')} port accent={accent}>
            <div className={cn(nodeBoxClass, 'leading-relaxed')}>
              <TemplateText text={message} className="line-clamp-4 text-foreground/80" />
            </div>
          </NodeField>
        )}

        {/* Provider + model + mode badges */}
        {hasBadges && (
          <div className="flex items-center gap-1.5">
            <ProviderBadge provider={provider} />
            <ModelBadge model={displayModel} />
            {!isApiProvider && <ModeBadge mode={(permissionMode ?? 'default') as AgentMode} />}
          </div>
        )}
      </NodeShell>
    </>
  )
}

export const AgentNode = memo(AgentNodeComponent)
AgentNode.displayName = 'AgentNode'
