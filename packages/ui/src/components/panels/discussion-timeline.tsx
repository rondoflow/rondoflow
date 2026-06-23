'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bot,
  Copy,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Gavel,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useDiscussion, type DiscussionTurn } from '@/hooks/use-discussion'
import { formatTime } from '@/lib/format'
import type { DiscussionStatus } from '@rondoflow/shared'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DiscussionTimelineProps {
  readonly tableId: string
  readonly topic: string
  readonly status: DiscussionStatus
  readonly conclusion?: string
  readonly currentRound?: number
  readonly maxRounds?: number
}

// ─── Role badge ────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  participant: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  observer: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  devil_advocate: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  moderator: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
}

const ROLE_LABEL_KEYS: Record<string, string> = {
  participant: 'role.participant.label',
  observer: 'role.observer.label',
  devil_advocate: 'role.devilAdvocate.label',
  moderator: 'role.moderator.label',
}

function RoleBadge({ role }: { readonly role: string }) {
  const { t } = useTranslation('discussions')
  const colorClass = ROLE_COLORS[role] ?? 'border-border bg-muted text-muted-foreground'
  const labelKey = ROLE_LABEL_KEYS[role]
  const label = labelKey ? t(labelKey) : role

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
        colorClass,
      )}
    >
      {label}
    </span>
  )
}

// ─── Agent avatar ──────────────────────────────────────────────────────────

function AgentAvatar({
  name,
  type,
}: {
  readonly name: string
  readonly type: DiscussionTurn['type']
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const bgClass =
    type === 'moderator_decision' || type === 'conclusion'
      ? 'bg-amber-500/20 text-amber-400'
      : 'bg-primary/10 text-primary'

  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        bgClass,
      )}
      aria-hidden
    >
      {type === 'moderator_decision' || type === 'conclusion' ? (
        <Gavel className="h-4 w-4" />
      ) : initials.length > 0 ? (
        initials
      ) : (
        <Bot className="h-4 w-4" />
      )}
    </div>
  )
}

// ─── Expandable content ────────────────────────────────────────────────────

function ExpandableContent({ content }: { readonly content: string }) {
  const { t } = useTranslation('discussions')
  const COLLAPSE_THRESHOLD = 280
  const [expanded, setExpanded] = useState(false)

  const isLong = content.length > COLLAPSE_THRESHOLD
  const displayContent =
    isLong && !expanded ? content.slice(0, COLLAPSE_THRESHOLD) + '…' : content

  return (
    <div>
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
        {displayContent}
      </p>
      {isLong && (
        <button
          type="button"
          className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" aria-hidden />
              {t('timeline.showLess')}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" aria-hidden />
              {t('timeline.showMore')}
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ─── Participant turn card ─────────────────────────────────────────────────

function ParticipantCard({
  turn,
  side,
}: {
  readonly turn: DiscussionTurn
  readonly side: 'left' | 'right'
}) {
  const { t, i18n } = useTranslation('discussions')
  return (
    <div
      className={cn(
        'flex gap-3',
        side === 'right' ? 'flex-row-reverse' : 'flex-row',
      )}
      role="listitem"
      aria-label={t('timeline.saidLabel', { name: turn.agentName })}
    >
      <AgentAvatar name={turn.agentName} type={turn.type} />

      <div
        className={cn(
          'max-w-[78%] rounded-lg border bg-card px-3 py-2.5 shadow-sm',
          side === 'right' && 'border-primary/20',
        )}
      >
        <div className={cn('mb-1 flex items-center gap-2', side === 'right' && 'flex-row-reverse')}>
          <span className="text-xs font-semibold leading-none">{turn.agentName}</span>
          <RoleBadge role={turn.role} />
        </div>

        <ExpandableContent content={turn.content} />

        <p className={cn('mt-1.5 text-[10px] text-muted-foreground', side === 'right' && 'text-right')}>
          <time dateTime={turn.timestamp.toISOString()}>
            {formatTime(turn.timestamp, i18n.language)}
          </time>
        </p>
      </div>
    </div>
  )
}

// ─── Moderator decision card ───────────────────────────────────────────────

function ModeratorCard({ turn }: { readonly turn: DiscussionTurn }) {
  const { t, i18n } = useTranslation('discussions')
  // Content format is "Decision: reasoning"
  const colonIndex = turn.content.indexOf(':')
  const decision = colonIndex > -1 ? turn.content.slice(0, colonIndex).trim() : turn.agentName
  const reasoning = colonIndex > -1 ? turn.content.slice(colonIndex + 1).trim() : turn.content

  return (
    <div
      className="flex gap-3"
      role="listitem"
      aria-label={t('timeline.moderatorDecisionLabel')}
    >
      <AgentAvatar name="Moderator" type="moderator_decision" />

      <div className="max-w-[78%] rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-400">{decision}</span>
          <RoleBadge role="moderator" />
        </div>
        <p className="text-sm italic leading-relaxed text-muted-foreground">{reasoning}</p>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          <time dateTime={turn.timestamp.toISOString()}>
            {formatTime(turn.timestamp, i18n.language)}
          </time>
        </p>
      </div>
    </div>
  )
}

// ─── Conclusion card ───────────────────────────────────────────────────────

function ConclusionCard({
  conclusion,
  onCopy,
  onDownload,
  topic,
}: {
  readonly conclusion: string
  readonly onCopy: () => void
  readonly onDownload: () => void
  readonly topic: string
}) {
  const { t } = useTranslation('discussions')
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="mx-auto w-full rounded-lg border-2 border-blue-500/40 bg-blue-500/5 px-5 py-4"
      role="listitem"
      aria-label={t('timeline.conclusionLabel')}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-blue-400" aria-hidden />
          <span className="text-sm font-semibold text-blue-400">{t('timeline.conclusionTitle')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            aria-label={t('timeline.copyLabel')}
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            {copied ? t('timeline.copied') : t('timeline.copy')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            onClick={onDownload}
            aria-label={t('timeline.downloadLabel')}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            {t('timeline.download')}
          </Button>
        </div>
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
        {t('timeline.topicLabel', { topic })}
      </p>

      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
        {conclusion}
      </p>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────

function EmptyState({ status }: { readonly status: DiscussionStatus }) {
  const { t } = useTranslation('discussions')
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      {status === 'draft' ? (
        <>
          <p className="text-sm font-medium">{t('timeline.empty.draftTitle')}</p>
          <p className="text-xs text-muted-foreground">
            {t('timeline.empty.draftHint')}
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium">{t('timeline.empty.waitingTitle')}</p>
          <p className="text-xs text-muted-foreground">
            {t('timeline.empty.waitingHint')}
          </p>
        </>
      )}
    </div>
  )
}

// ─── DiscussionTimeline ────────────────────────────────────────────────────

export function DiscussionTimeline({
  tableId,
  topic,
  status: externalStatus,
  conclusion: externalConclusion,
  currentRound: externalRound,
  maxRounds,
}: DiscussionTimelineProps) {
  const { t } = useTranslation('discussions')
  const { turns, status: liveStatus, currentRound: liveRound, conclusion: liveConclusion } =
    useDiscussion(tableId)

  // Prefer live socket data over props when available
  const status = turns.length > 0 ? liveStatus : externalStatus
  const currentRound = liveRound > 0 ? liveRound : (externalRound ?? 0)
  const conclusion = liveConclusion ?? externalConclusion ?? null

  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever turns update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns.length])

  const handleCopy = useCallback(() => {
    if (!conclusion) return
    const text = `# ${t('timeline.exportHeading')}\n\n${t('timeline.exportTopic', { topic })}\n\n${conclusion}`
    void navigator.clipboard.writeText(text).catch(() => {
      // Clipboard write may fail in insecure contexts — silently ignore
    })
  }, [conclusion, topic, t])

  const handleDownload = useCallback(() => {
    if (!conclusion) return
    const text = `# ${t('timeline.exportHeading')}\n\n${t('timeline.exportTopic', { topic })}\n\n${conclusion}`
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `discussion-${tableId}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [conclusion, topic, tableId, t])

  // Determine which side each participant turn appears on.
  // Track unique agent names to alternate sides per participant.
  const agentSideMap = new Map<string, 'left' | 'right'>()
  let sideToggle: 'left' | 'right' = 'left'

  function getSide(agentName: string): 'left' | 'right' {
    if (!agentSideMap.has(agentName)) {
      agentSideMap.set(agentName, sideToggle)
      sideToggle = sideToggle === 'left' ? 'right' : 'left'
    }
    return agentSideMap.get(agentName) as 'left' | 'right'
  }

  const hasTurns = turns.length > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Round + status header */}
      {(hasTurns || status !== 'draft') && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
          {maxRounds && maxRounds > 0 ? (
            <span>{t('timeline.roundOf', { current: currentRound, max: maxRounds })}</span>
          ) : currentRound > 0 ? (
            <span>{t('timeline.round', { current: currentRound })}</span>
          ) : null}
          <Badge
            variant={status === 'active' ? 'default' : 'secondary'}
            className="ml-auto text-[10px]"
          >
            {status === 'active' ? t('timeline.status.active') : status === 'concluded' ? t('timeline.status.concluded') : t('timeline.status.draft')}
          </Badge>
        </div>
      )}

      {/* Timeline content */}
      <div
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
        role="list"
        aria-label={t('timeline.turnsLabel')}
        aria-live="polite"
      >
        {!hasTurns ? (
          <EmptyState status={status} />
        ) : (
          <>
            {turns.map((turn) => {
              if (turn.type === 'conclusion') {
                return (
                  <ConclusionCard
                    key={turn.id}
                    conclusion={turn.content}
                    topic={topic}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                  />
                )
              }

              if (turn.type === 'moderator_decision') {
                return <ModeratorCard key={turn.id} turn={turn} />
              }

              return (
                <ParticipantCard
                  key={turn.id}
                  turn={turn}
                  side={getSide(turn.agentName)}
                />
              )
            })}
          </>
        )}
        <div ref={bottomRef} aria-hidden />
      </div>
    </div>
  )
}
