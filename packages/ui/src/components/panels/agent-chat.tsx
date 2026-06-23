'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Circle,
  Loader2,
  AlertCircle,
  Square,
  Send,
  Trash2,
  Wrench,
  Clock,
  Pencil,
  Paperclip,
  FolderOpen,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Markdown } from '@/components/shared/markdown'
import { formatTime, formatNumber } from '@/lib/format'
import { useAgentStream, type ChatMessage, type AgentChatError } from '@/hooks/use-agent-stream'
import { useResources } from '@/hooks/use-resources'
import { ModeToggle } from '@/components/panels/mode-toggle'
import type { AgentStatus, TokenUsage } from '@rondoflow/shared'
import { MODEL_TIERS } from '@rondoflow/shared'

// ─── Props ─────────────────────────────────────────────────────────────────

export interface AgentChatProps {
  readonly agentId: string
  readonly agentName: string
  readonly agentDescription?: string
  readonly agentPurpose?: string
  readonly agentStatus: AgentStatus
  readonly agentModel?: string
  readonly workspaceId?: string | null
  readonly onClose?: () => void
  readonly onEdit?: () => void
  readonly onManageResources?: () => void
}

// ─── Status badge ──────────────────────────────────────────────────────────

const STATUS_BADGE_VARIANT: Record<
  AgentStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  idle: 'secondary',
  running: 'default',
  waiting_approval: 'outline',
  error: 'destructive',
}

const STATUS_LABEL_KEY: Record<AgentStatus, 'status.idle' | 'status.running' | 'status.waiting' | 'status.error'> = {
  idle: 'status.idle',
  running: 'status.running',
  waiting_approval: 'status.waiting',
  error: 'status.error',
}

function StatusBadge({ status }: { readonly status: AgentStatus }) {
  const { t } = useTranslation('agentDrawer')
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]} className="gap-1 text-[10px]">
      {status === 'running' && <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden />}
      {status === 'idle' && <Circle className="h-2.5 w-2.5 fill-current" aria-hidden />}
      {status === 'waiting_approval' && <Clock className="h-2.5 w-2.5" aria-hidden />}
      {status === 'error' && <AlertCircle className="h-2.5 w-2.5" aria-hidden />}
      {t(STATUS_LABEL_KEY[status])}
    </Badge>
  )
}

// ─── Model badge ───────────────────────────────────────────────────────────

function ModelBadge({ model }: { readonly model?: string }) {
  if (!model) return null
  const label =
    model in MODEL_TIERS
      ? MODEL_TIERS[model as keyof typeof MODEL_TIERS].label
      : model

  return (
    <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
      {label}
    </span>
  )
}

// ─── Token counter [G16] ───────────────────────────────────────────────────

function TokenCounter({ usage }: { readonly usage: TokenUsage | null }) {
  const { t, i18n } = useTranslation('agentDrawer')
  if (!usage) return null

  const totalTokens = usage.inputTokens + usage.outputTokens
  const cost = usage.estimatedCostUsd.toFixed(4)

  return (
    <span
      className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground"
      title={t('chat.tokenTooltip', { input: usage.inputTokens, output: usage.outputTokens })}
    >
      {t('chat.tokenSummary', { tokens: formatNumber(totalTokens, i18n.language), cost })}
    </span>
  )
}

// ─── Streaming cursor ──────────────────────────────────────────────────────

function StreamingCursor() {
  return (
    <span
      className="ml-0.5 inline-block h-3.5 w-0.5 animate-[blink_1s_step-end_infinite] bg-foreground align-middle"
      aria-hidden
    />
  )
}

// ─── Tool message card ────────────────────────────────────────────────────

function ToolMessageCard({ message }: { readonly message: ChatMessage }) {
  const { t } = useTranslation('agentDrawer')
  const [expanded, setExpanded] = useState(false)
  const tool = message.toolUse

  if (!tool) return null

  return (
    <div
      className="rounded-lg border border-border bg-card text-card-foreground"
      role="listitem"
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label={t('chat.toolAria', {
          tool: tool.toolName,
          action: expanded ? t('chat.toolCollapse') : t('chat.toolExpand'),
        })}
      >
        <Wrench className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="flex-1 font-mono font-medium">{tool.toolName}</span>
        {tool.output === undefined && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" aria-label={t('chat.running')} />
        )}
        {tool.output !== undefined && (
          <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500" aria-label={t('chat.completed')} />
        )}
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-3 py-2 text-xs">
          <p className="mb-1 font-medium text-muted-foreground">{t('chat.toolInput')}</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded bg-muted/50 p-2 font-mono text-[11px] text-foreground">
            {JSON.stringify(tool.input, null, 2)}
          </pre>
          {tool.output !== undefined && (
            <>
              <p className="mb-1 mt-2 font-medium text-muted-foreground">{t('chat.toolOutput')}</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded bg-muted/50 p-2 font-mono text-[11px] text-foreground">
                {JSON.stringify(tool.output, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Error card ────────────────────────────────────────────────────────────

function ErrorCard({
  error,
  onRetry,
}: {
  readonly error: AgentChatError
  readonly onRetry: () => void
}) {
  const { t } = useTranslation('agentDrawer')
  return (
    <div
      className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
      <div className="flex-1">
        <p className="font-medium text-destructive">{t('chat.errorTitle')}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{error.userMessage}</p>
      </div>
      {error.retryable && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 shrink-0 px-2 text-[11px]"
          onClick={onRetry}
        >
          {t('common:action.retry')}
        </Button>
      )}
    </div>
  )
}

// ─── Message bubble ────────────────────────────────────────────────────────

function MessageBubble({ message }: { readonly message: ChatMessage }) {
  const { i18n } = useTranslation('agentDrawer')
  const isUser = message.role === 'user'

  return (
    <div
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
      role="listitem"
    >
      {!isUser && (
        <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-3.5 w-3.5" aria-hidden />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-muted text-foreground rounded-br-sm'
            : 'bg-card border border-border text-card-foreground rounded-bl-sm',
        )}
      >
        {/* Finalized assistant output renders as formatted markdown for
            readability; user input and still-streaming text stay verbatim so
            typed formatting is preserved and the stream doesn't reflow mid-token. */}
        {!isUser && !message.partial ? (
          <Markdown content={message.content} />
        ) : (
          <p className="whitespace-pre-wrap break-words">
            {message.content}
            {message.partial && <StreamingCursor />}
          </p>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground">
          <time dateTime={message.timestamp.toISOString()}>
            {formatTime(message.timestamp, i18n.language)}
          </time>
        </p>
      </div>
    </div>
  )
}

// ─── Message list ──────────────────────────────────────────────────────────

function MessageList({
  messages,
  error,
  onRetry,
}: {
  readonly messages: ChatMessage[]
  readonly error: AgentChatError | null
  readonly onRetry: () => void
}) {
  const { t } = useTranslation('agentDrawer')
  const bottomRef = useRef<HTMLDivElement>(null)

  const lastMessageContent = messages[messages.length - 1]?.content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, lastMessageContent])

  if (messages.length === 0 && !error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Bot className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-sm font-medium">{t('chat.emptyTitle')}</p>
        <p className="text-xs text-muted-foreground">
          {t('chat.emptyDescription')}
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      aria-live="polite"
      aria-label={t('chat.messagesAria')}
      role="list"
    >
      {messages.map((msg) => {
        if (msg.role === 'tool') {
          return <ToolMessageCard key={msg.id} message={msg} />
        }
        return <MessageBubble key={msg.id} message={msg} />
      })}
      {error && <ErrorCard error={error} onRetry={onRetry} />}
      <div ref={bottomRef} aria-hidden />
    </div>
  )
}

// ─── Input area ────────────────────────────────────────────────────────────

interface AttachableFile {
  readonly id: string
  readonly name: string
}

interface InputAreaProps {
  readonly isStreaming: boolean
  readonly attachableFiles: AttachableFile[]
  readonly onSend: (message: string) => void
  readonly onStop: () => void
}

function InputArea({ isStreaming, attachableFiles, onSend, onStop }: InputAreaProps) {
  const { t } = useTranslation('agentDrawer')
  const [value, setValue] = useState('')
  const [attachMenuOpen, setAttachMenuOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const attachMenuRef = useRef<HTMLDivElement>(null)

  const canSend = value.trim().length > 0 && !isStreaming

  function handleSend() {
    if (!canSend) return
    onSend(value)
    setValue('')
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      setAttachMenuOpen(false)
    }
  }

  function handleAttachFile(fileName: string) {
    setValue((prev) => {
      const mention = t('chat.fileMention', { name: fileName })
      return prev ? `${prev} ${mention}` : mention
    })
    setAttachMenuOpen(false)
    textareaRef.current?.focus()
  }

  return (
    <div className="border-t border-border px-4 py-3">
      {/* Attach file menu (shows above input when open) */}
      {attachMenuOpen && (
        <div
          ref={attachMenuRef}
          className="mb-2 rounded-md border border-border bg-card shadow-md"
          role="listbox"
          aria-label={t('chat.workspaceFilesAria')}
        >
          <p className="border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('chat.workspaceFilesTitle')}
          </p>
          {attachableFiles.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-muted-foreground">
              {t('chat.noFiles')}
            </p>
          ) : (
            <ul className="max-h-40 overflow-y-auto py-1">
              {attachableFiles.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors"
                    role="option"
                    aria-selected={false}
                    onClick={() => handleAttachFile(f.name)}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate">{f.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Paperclip attachment button */}
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            'h-8 w-8 shrink-0 self-end p-0',
            attachMenuOpen && 'bg-muted text-foreground',
          )}
          aria-label={t('chat.attachFileAria')}
          aria-expanded={attachMenuOpen}
          title={t('chat.attachFileTitle')}
          disabled={isStreaming}
          onClick={() => setAttachMenuOpen((prev) => !prev)}
        >
          <Paperclip className="h-3.5 w-3.5" aria-hidden />
        </Button>

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.messagePlaceholder')}
          className="min-h-[60px] max-h-[160px] resize-none text-sm"
          rows={2}
          disabled={false}
          aria-label={t('chat.messageInputAria')}
        />
        <div className="flex shrink-0 flex-col gap-1.5">
          {isStreaming ? (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 w-8 p-0"
              onClick={onStop}
              aria-label={t('chat.stopAria')}
              title={t('chat.stopTitle')}
            >
              <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleSend}
              disabled={!canSend}
              aria-label={t('chat.sendAria')}
              title={t('chat.sendTitle')}
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── AgentChat ─────────────────────────────────────────────────────────────

export function AgentChat({
  agentId,
  agentName,
  agentDescription,
  agentPurpose,
  agentStatus,
  agentModel,
  workspaceId,
  onEdit,
  onManageResources,
}: AgentChatProps) {
  const { t } = useTranslation('agentDrawer')
  const { messages, isStreaming, tokenUsage, error, mode, sendMessage, stopAgent, clearMessages, setMode } =
    useAgentStream(agentId, workspaceId)

  const { resources } = useResources(workspaceId ?? null)

  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null)

  const handleSend = useCallback(
    (message: string) => {
      setLastUserMessage(message)
      sendMessage(message)
    },
    [sendMessage],
  )

  const handleRetry = useCallback(() => {
    if (lastUserMessage) {
      sendMessage(lastUserMessage)
    }
  }, [lastUserMessage, sendMessage])

  // Resource summary for header
  const files = resources.filter((r) => r.kind === 'file')
  const attachableFiles = files.map((f) => ({ id: f.id, name: f.name }))

  const resourceSummary = (() => {
    const totalResources = resources.length
    if (totalResources === 0) return null
    const fileNames = files.slice(0, 2).map((f) => f.name)
    const remaining = totalResources - fileNames.length
    const namesText = fileNames.join(', ')
    return remaining > 0 ? t('chat.resourcesMore', { names: namesText, remaining }) : namesText
  })()

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {agentName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{agentName}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <StatusBadge status={agentStatus} />
              <ModelBadge model={agentModel} />
            </div>
            {(agentDescription || agentPurpose) && (
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {agentDescription || t('chat.purposeLabel', { purpose: agentPurpose })}
              </p>
            )}
            {/* Resource summary line */}
            {workspaceId && (
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <FolderOpen className="h-3 w-3 shrink-0 text-cyan-400" aria-hidden />
                <span>
                  {t('chat.resourcesLabel')}{' '}
                  {resourceSummary ?? t('chat.resourcesNone')}
                </span>
                {onManageResources && (
                  <button
                    type="button"
                    className="ml-1 rounded px-1 py-0.5 text-[10px] font-medium text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                    onClick={onManageResources}
                    aria-label={t('chat.manageResourcesAria')}
                  >
                    {t('chat.manageResources')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Mode toggle */}
        <div className="mt-2 border-t border-border pt-2">
          <ModeToggle mode={mode} onChange={setMode} disabled={isStreaming} />
        </div>

        {/* Action bar */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 px-2 text-xs"
                onClick={onEdit}
                aria-label={t('chat.editAria')}
              >
                <Pencil className="h-3 w-3" aria-hidden />
                {t('common:action.edit')}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
              onClick={clearMessages}
              aria-label={t('chat.clearAria')}
            >
              <Trash2 className="h-3 w-3" aria-hidden />
              {t('common:action.clear')}
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <MessageList messages={messages} error={error} onRetry={handleRetry} />

      {/* Token counter [G16] */}
      {tokenUsage && (
        <div className="flex shrink-0 justify-end px-4 pb-1">
          <TokenCounter usage={tokenUsage} />
        </div>
      )}

      {/* Input */}
      <InputArea
        isStreaming={isStreaming}
        attachableFiles={attachableFiles}
        onSend={handleSend}
        onStop={stopAgent}
      />
    </div>
  )
}
