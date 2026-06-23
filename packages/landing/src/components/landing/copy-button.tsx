'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard unavailable (e.g. insecure context) - no-op, the command is visible.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-2.5 py-1.5 font-mono text-xs text-muted transition-colors hover:border-ink/30 hover:text-ink"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-node-skill" aria-hidden="true" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </>
      )}
    </button>
  )
}
