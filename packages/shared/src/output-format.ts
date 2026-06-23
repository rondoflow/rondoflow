// Output formatting — shared by the UI (interactive runs) and the scheduler
// (headless/cron runs) so a workflow's Output node produces identical artifacts
// in both paths. Pure, dependency-free string-in / string-out.

export type OutputFormat = 'markdown' | 'html' | 'text' | 'raw-markdown'

export const OUTPUT_FORMAT_LABELS: Record<OutputFormat, string> = {
  markdown: 'Formatted Markdown',
  html: 'Formatted HTML',
  text: 'Raw Text',
  'raw-markdown': 'Raw Markdown',
}

export const OUTPUT_FORMAT_EXT: Record<OutputFormat, 'md' | 'html' | 'txt'> = {
  markdown: 'md',
  html: 'html',
  text: 'txt',
  'raw-markdown': 'md',
}

/** One agent's contribution to a run, in the order it should appear. */
export interface RunStep {
  readonly agentName: string
  readonly output: string
}

export interface FormatOptions {
  readonly format: OutputFormat
  readonly title?: string
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Serialize a run's per-agent outputs into a single document. The `markdown`
 * shape is identical to the legacy auto-save (`## Agent` sections joined by
 * `---`) so existing previews render unchanged.
 */
export function formatRunOutput(steps: readonly RunStep[], opts: FormatOptions): string {
  switch (opts.format) {
    case 'raw-markdown':
      return steps.map((s) => s.output).join('\n\n')
    case 'text':
      return formatText(steps, opts.title)
    case 'html':
      return markdownToHtml(formatMarkdown(steps, opts.title), opts.title)
    case 'markdown':
    default:
      return formatMarkdown(steps, opts.title)
  }
}

function formatMarkdown(steps: readonly RunStep[], title?: string): string {
  const header = title ? `# ${title}\n\n` : ''
  const body = steps.map((s) => `## ${s.agentName}\n\n${s.output}`).join('\n\n---\n\n')
  return header + body
}

function formatText(steps: readonly RunStep[], title?: string): string {
  const header = title ? `${title}\n\n` : ''
  const body = steps
    .map((s) => `${s.agentName.toUpperCase()}\n\n${stripMarkdown(s.output)}`)
    .join('\n\n----------------------------------------\n\n')
  return header + body
}

// ─── Raw text: strip the inline markdown token set used by markdown.tsx ─────────

/** Best-effort plain-text rendering — removes the markers, keeps the text. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/\r\n/g, '\n')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // heading markers
    .replace(/^\s{0,3}>\s?/gm, '') // blockquote markers
    .replace(/^(\s*)[-*+]\s+/gm, '$1• ') // unordered list bullets
    .replace(/```[^\n]*\n?/g, '') // code-fence lines
    .replace(/\[([^\]]+)\]\(([^()\s]+)\)/g, '$1') // links → text
    .replace(/(\*\*|__)(.+?)\1/g, '$2') // bold
    .replace(/(\*|_)([^*_\n]+?)\1/g, '$2') // italic
    .replace(/`([^`]+)`/g, '$1') // inline code
}

// ─── Markdown → HTML (standalone document) ──────────────────────────────────────
// Mirrors the block/inline grammar of packages/ui/src/components/shared/markdown.tsx
// but emits an escaped HTML string. Agent output is UNTRUSTED, so every text node
// is HTML-escaped before inline markers are applied; only the structural tags we
// emit are literal. Never feed the result through dangerouslySetInnerHTML inside
// the app — it is written to a downloadable file artifact only.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\][\n]+\]\([^()\s\n]+\))/g

/** Render inline markers within already-escaped text into HTML. */
function renderInline(text: string): string {
  let html = ''
  let lastIndex = 0
  let match: RegExpExecArray | null
  INLINE_RE.lastIndex = 0
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) html += escapeHtml(text.slice(lastIndex, match.index))
    const token = match[0]
    if (token.startsWith('`')) {
      html += `<code>${escapeHtml(token.slice(1, -1))}</code>`
    } else if (token.startsWith('**') || token.startsWith('__')) {
      html += `<strong>${escapeHtml(token.slice(2, -2))}</strong>`
    } else if (token.startsWith('[')) {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token)
      if (link) {
        html += `<a href="${escapeHtml(link[2])}" target="_blank" rel="noopener noreferrer">${escapeHtml(link[1])}</a>`
      } else {
        html += escapeHtml(token)
      }
    } else {
      html += `<em>${escapeHtml(token.slice(1, -1))}</em>`
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) html += escapeHtml(text.slice(lastIndex))
  return html
}

const DOC_STYLE = `body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;max-width:48rem;margin:2rem auto;padding:0 1rem;color:#1a1a1a}
h1,h2,h3{line-height:1.25}hr{border:0;border-top:1px solid #ddd;margin:2rem 0}
code{background:#f3f3f3;border-radius:3px;padding:.1em .3em;font-size:.9em}
pre{background:#f6f8fa;border:1px solid #e1e4e8;border-radius:6px;padding:1rem;overflow-x:auto}
pre code{background:none;padding:0}blockquote{border-left:3px solid #ddd;margin:1rem 0;padding-left:1rem;color:#555}
a{color:#0969da}`

/** Convert markdown to a complete, self-contained HTML document. */
export function markdownToHtml(md: string, title?: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code fence
    if (/^```(.*)$/.test(line)) {
      const code: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) {
        code.push(lines[i])
        i++
      }
      i++ // consume closing fence
      out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
      continue
    }

    // Blank line
    if (line.trim() === '') {
      i++
      continue
    }

    // Heading
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      i++
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push('<hr>')
      i++
      continue
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      out.push(`<blockquote>${renderInline(quote.join(' '))}</blockquote>`)
      continue
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''))
        i++
      }
      out.push(`<ul>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</ul>`)
      continue
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      out.push(`<ol>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</ol>`)
      continue
    }

    // Paragraph
    const para: string[] = [line]
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
      para.push(lines[i])
      i++
    }
    out.push(`<p>${para.map(renderInline).join('<br>')}</p>`)
  }

  const docTitle = escapeHtml(title ?? 'Workflow Output')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${docTitle}</title>
<style>${DOC_STYLE}</style>
</head>
<body>
${out.join('\n')}
</body>
</html>`
}
