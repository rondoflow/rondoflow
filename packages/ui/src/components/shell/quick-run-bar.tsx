'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Zap, Bot, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuickRunAgent {
  readonly id: string
  readonly name: string
  readonly description?: string
}

interface QuickRunBarProps {
  readonly open: boolean
  readonly agents: readonly QuickRunAgent[]
  readonly onClose: () => void
  readonly onRun: (agentId: string, message: string) => void
}

// ─── Component ──────────────────────────────────────────────────────────────

export function QuickRunBar({ open, agents, onClose, onRun }: QuickRunBarProps) {
  const { t } = useTranslation('shell')
  const [query, setQuery] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedAgentId(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const filteredAgents = selectedAgentId
    ? []
    : agents.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          (a.description ?? '').toLowerCase().includes(query.toLowerCase()),
      )

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  const handleSubmit = useCallback(() => {
    if (!selectedAgentId || !query.trim()) return
    onRun(selectedAgentId, query.trim())
    onClose()
  }, [selectedAgentId, query, onRun, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        {/* Input */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Zap className="h-4 w-4 shrink-0 text-yellow-400" aria-hidden />
          {selectedAgent && (
            <span className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Bot className="h-3 w-3" />
              {selectedAgent.name}
              <button
                type="button"
                className="ml-0.5 hover:text-foreground"
                onClick={() => setSelectedAgentId(null)}
                aria-label={t('quickRun.deselect')}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder={
              selectedAgentId
                ? t('quickRun.taskPlaceholder')
                : t('quickRun.searchPlaceholder')
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && selectedAgentId) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
        </div>

        {/* Agent list */}
        {!selectedAgentId && filteredAgents.length > 0 && (
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredAgents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-muted transition-colors',
                )}
                onClick={() => {
                  setSelectedAgentId(agent.id)
                  setQuery('')
                  inputRef.current?.focus()
                }}
              >
                <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{agent.name}</p>
                  {agent.description && (
                    <p className="truncate text-xs text-muted-foreground">{agent.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Hint */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <span>
            {selectedAgentId ? t('quickRun.hintRun') : t('quickRun.hintSelectFirst')}
          </span>
          <span>{t('quickRun.hintClose')}</span>
        </div>
      </div>
    </div>
  )
}
