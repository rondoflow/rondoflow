'use client'

import { cn } from '@/lib/utils'

// Splits on `{{ ... }}` tokens (keeps the delimiters via the capture group).
const TOKEN_RE = /(\{\{[^}]+\}\})/g

/**
 * Renders message text, highlighting `{{variable}}` tokens as subtle inline
 * chips — matches the flow-builder card style.
 */
export function TemplateText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(TOKEN_RE)

  return (
    <p className={cn('whitespace-pre-wrap break-words', className)}>
      {parts.map((part, i) => {
        const isToken = part.startsWith('{{') && part.endsWith('}}')
        return isToken ? (
          <span
            key={i}
            className="rounded bg-muted px-1 py-px font-medium text-foreground/90"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      })}
    </p>
  )
}
