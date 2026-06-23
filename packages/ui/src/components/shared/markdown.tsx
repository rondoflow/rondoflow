'use client'

import { Fragment, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ─── Inline rendering ─────────────────────────────────────────────────────────
// Handles a pragmatic subset: `code`, **bold**, *italic* / _italic_, [text](url).
// The renderer never throws on malformed input — unmatched markers render as
// literal text.

// The link alternative's classes deliberately exclude brackets/parens (and
// newlines) so each scan is bounded by the distance to the next delimiter.
// A greedy `[^\]]+` here would backtrack O(n^2) on bracket-heavy lines (JSON,
// stack traces) and freeze the render thread.
const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\][\n]+\]\([^()\s\n]+\))/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let i = 0

  // Reset is implicit since we use a fresh regex via lastIndex tracking.
  INLINE_RE.lastIndex = 0
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    const key = `${keyPrefix}-${i++}`

    if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('**') || token.startsWith('__')) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token)
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            {linkMatch[1]}
          </a>,
        )
      } else {
        nodes.push(token)
      }
    } else {
      // single * or _ → italic
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      )
    }
    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

// ─── Block rendering ──────────────────────────────────────────────────────────

const HEADING_CLASSES: Record<number, string> = {
  1: 'mt-4 mb-2 text-lg font-bold first:mt-0',
  2: 'mt-4 mb-2 text-base font-bold first:mt-0',
  3: 'mt-3 mb-1.5 text-sm font-semibold first:mt-0',
  4: 'mt-3 mb-1 text-sm font-semibold first:mt-0',
  5: 'mt-2 mb-1 text-xs font-semibold first:mt-0',
  6: 'mt-2 mb-1 text-xs font-semibold first:mt-0',
}

export interface MarkdownProps {
  readonly content: string
  readonly className?: string
}

/**
 * Minimal, dependency-free markdown renderer for previewing saved workflow
 * output. Supports headings, code fences, inline formatting, blockquotes,
 * ordered/unordered lists, horizontal rules, and paragraphs.
 */
export function Markdown({ content, className }: MarkdownProps) {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []

  let i = 0
  let key = 0
  const nextKey = () => `b-${key++}`

  while (i < lines.length) {
    const line = lines[i]

    // ── Code fence ──
    const fence = /^```(.*)$/.exec(line)
    if (fence) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i])
        i++
      }
      i++ // consume closing fence (or run off the end)
      blocks.push(
        <pre
          key={nextKey()}
          className="my-2 overflow-x-auto rounded-md border border-border bg-muted/50 p-3 text-xs"
        >
          <code className="font-mono">{codeLines.join('\n')}</code>
        </pre>,
      )
      continue
    }

    // ── Blank line ──
    if (line.trim() === '') {
      i++
      continue
    }

    // ── Heading ──
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      const Tag = `h${level}` as keyof JSX.IntrinsicElements
      blocks.push(
        <Tag key={nextKey()} className={HEADING_CLASSES[level]}>
          {renderInline(heading[2], `h${level}`)}
        </Tag>,
      )
      i++
      continue
    }

    // ── Horizontal rule ──
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push(<hr key={nextKey()} className="my-3 border-border" />)
      i++
      continue
    }

    // ── Blockquote ──
    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      blocks.push(
        <blockquote
          key={nextKey()}
          className="my-2 border-l-2 border-border pl-3 text-muted-foreground"
        >
          {renderInline(quoteLines.join(' '), 'bq')}
        </blockquote>,
      )
      continue
    }

    // ── Unordered list ──
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''))
        i++
      }
      blocks.push(
        <ul key={nextKey()} className="my-2 list-disc space-y-0.5 pl-5">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `ul-${idx}`)}</li>
          ))}
        </ul>,
      )
      continue
    }

    // ── Ordered list ──
    if (/^\s*\d+\.\s+/.test(line)) {
      const start = Number.parseInt(/^\s*(\d+)\./.exec(line)?.[1] ?? '1', 10)
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      blocks.push(
        <ol
          key={nextKey()}
          className="my-2 list-decimal space-y-0.5 pl-5"
          start={start === 1 ? undefined : start}
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `ol-${idx}`)}</li>
          ))}
        </ol>,
      )
      continue
    }

    // ── Paragraph (consume consecutive non-blank, non-special lines) ──
    const paraLines: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^```/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    // `whitespace-pre-wrap` keeps leading indentation and column alignment that
    // unfenced agent output relies on (stack traces, pretty-printed JSON, aligned
    // CLI tables). Lines were split on \n, so the explicit <br/> below — not the
    // pre-wrap — supplies the line breaks; there is no doubling.
    blocks.push(
      <p
        key={nextKey()}
        className="my-2 whitespace-pre-wrap leading-relaxed first:mt-0 last:mb-0"
      >
        {paraLines.map((pl, idx) => (
          <Fragment key={idx}>
            {idx > 0 && <br />}
            {renderInline(pl, `p-${idx}`)}
          </Fragment>
        ))}
      </p>,
    )
  }

  return (
    <div className={cn('text-sm text-foreground break-words', className)}>{blocks}</div>
  )
}
