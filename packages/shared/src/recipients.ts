// Recipient parsing for the Email node — shared by the UI (light validation +
// display) and the scheduler (headless send). Pure, dependency-free. The server
// route remains the authority via zod's `.email()`; this is a best-effort split.

/** Loose email shape check — the server (zod `.email()`) is the authority. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Parse a comma/semicolon-separated recipients string into a trimmed,
 * de-duplicated (case-insensitive) list, splitting valid from invalid entries.
 */
export function parseRecipients(raw: string): { valid: string[]; invalid: string[] } {
  const seen = new Set<string>()
  const valid: string[] = []
  const invalid: string[] = []
  for (const part of (raw ?? '').split(/[,;]/)) {
    const addr = part.trim()
    if (!addr) continue
    const key = addr.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    if (EMAIL_RE.test(addr)) valid.push(addr)
    else invalid.push(addr)
  }
  return { valid, invalid }
}
