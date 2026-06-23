import { describe, it, expect } from 'vitest'
import { formatRunOutput, stripMarkdown, markdownToHtml, type RunStep } from '../output-format'

const steps: RunStep[] = [
  { agentName: 'Researcher', output: 'first **bold**' },
  { agentName: 'Writer', output: 'second' },
]

describe('formatRunOutput', () => {
  it('raw-markdown joins outputs verbatim with no headers', () => {
    expect(formatRunOutput(steps, { format: 'raw-markdown' })).toBe('first **bold**\n\nsecond')
  })

  it('markdown emits ## sections joined by ---', () => {
    expect(formatRunOutput(steps, { format: 'markdown' })).toBe(
      '## Researcher\n\nfirst **bold**\n\n---\n\n## Writer\n\nsecond',
    )
  })

  it('markdown prepends a # title when given', () => {
    expect(formatRunOutput([steps[0]], { format: 'markdown', title: 'Report' })).toBe(
      '# Report\n\n## Researcher\n\nfirst **bold**',
    )
  })

  it('text uppercases agent names and strips markdown', () => {
    const out = formatRunOutput([{ agentName: 'Writer', output: '# Heading\n**bold**' }], {
      format: 'text',
    })
    expect(out).toContain('WRITER')
    expect(out).not.toContain('**')
    expect(out).not.toContain('# Heading')
    expect(out).toContain('Heading')
  })

  it('html produces a self-contained document', () => {
    const html = formatRunOutput(steps, { format: 'html', title: 'Doc' })
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('<title>Doc</title>')
    expect(html).toContain('<h2>Researcher</h2>')
  })
})

describe('stripMarkdown', () => {
  it.each([
    ['# Heading', 'Heading'],
    ['> quote', 'quote'],
    ['- item', '• item'],
    ['* item', '• item'],
    ['`code`', 'code'],
    ['**bold**', 'bold'],
    ['_italic_', 'italic'],
    ['[link](http://x.com)', 'link'],
  ])('strips %p → %p', (input, expected) => {
    expect(stripMarkdown(input)).toBe(expected)
  })

  it('removes code-fence lines', () => {
    expect(stripMarkdown('```js\ncode\n```')).not.toContain('```')
  })

  it('normalizes CRLF to LF', () => {
    expect(stripMarkdown('a\r\nb')).toBe('a\nb')
  })
})

describe('markdownToHtml — escaping (untrusted agent output)', () => {
  it('escapes HTML in plain text so tags cannot be injected', () => {
    const html = markdownToHtml('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('escapes code-fence bodies', () => {
    const html = markdownToHtml('```\n<b>x</b>\n```')
    expect(html).toContain('<pre><code>&lt;b&gt;x&lt;/b&gt;</code></pre>')
  })

  it('renders headings, hr, blockquote, and lists', () => {
    expect(markdownToHtml('# Title')).toContain('<h1>Title</h1>')
    expect(markdownToHtml('---')).toContain('<hr>')
    expect(markdownToHtml('> note')).toContain('<blockquote>note</blockquote>')
    expect(markdownToHtml('- a\n- b')).toContain('<ul><li>a</li><li>b</li></ul>')
    expect(markdownToHtml('1. a\n2. b')).toContain('<ol><li>a</li><li>b</li></ol>')
  })

  it('renders inline bold and code', () => {
    expect(markdownToHtml('**bold**')).toContain('<strong>bold</strong>')
    expect(markdownToHtml('`snippet`')).toContain('<code>snippet</code>')
  })

  it('renders links with a safe target/rel and escaped href', () => {
    const html = markdownToHtml('[text](http://e.com/a&b)')
    expect(html).toContain(
      '<a href="http://e.com/a&amp;b" target="_blank" rel="noopener noreferrer">text</a>',
    )
  })

  it('escapes the document title', () => {
    expect(markdownToHtml('body', '<x>')).toContain('<title>&lt;x&gt;</title>')
  })
})
