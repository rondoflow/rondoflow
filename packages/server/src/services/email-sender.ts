// SMTP transport for the canvas "Email" node. Configuration is read from
// SMTP_* env vars (env-only — not the DB settings UI). Markdown→HTML rendering
// happens upstream (shared `formatRunOutput`), so this module is a thin, safe
// transport wrapper: build a transport, send one message, surface a clean error.

import nodemailer from 'nodemailer'
import { AppError } from '../lib/errors'

export interface SmtpConfig {
  readonly host: string
  readonly port: number
  readonly secure: boolean
  readonly user?: string
  readonly pass?: string
  readonly from: string
}

export interface SendEmailInput {
  readonly recipients: readonly string[]
  readonly subject: string
  readonly html: string
  /** Optional plain-text alternative (improves deliverability/spam score). */
  readonly text?: string
}

/**
 * Read SMTP config from the environment. Returns `null` when the feature is not
 * configured (host or from missing) so callers can fail gracefully with a clear
 * "not configured" message instead of a cryptic transport error.
 *
 * `secure` derives from SMTP_SECURE when set, otherwise defaults to port 465
 * (implicit TLS). Auth is only attached when both user and pass are present, so
 * unauthenticated relays / local dev catchers (e.g. MailHog) work.
 */
export function readSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim()
  const from = process.env.SMTP_FROM?.trim()
  if (!host || !from) return null

  const port = Number.parseInt(process.env.SMTP_PORT ?? '587', 10) || 587
  const secureRaw = process.env.SMTP_SECURE?.trim().toLowerCase()
  const secure = secureRaw === 'true' || secureRaw === '1' ? true : secureRaw === 'false' || secureRaw === '0' ? false : port === 465
  const user = process.env.SMTP_USER?.trim() || undefined
  const pass = process.env.SMTP_PASS || undefined

  return { host, port, secure, user, pass, from }
}

/** Non-secret view of the current config — safe to return from a status route. */
export function smtpStatus(): { configured: boolean; host?: string; port?: number; secure?: boolean; from?: string } {
  const cfg = readSmtpConfig()
  if (!cfg) return { configured: false }
  return { configured: true, host: cfg.host, port: cfg.port, secure: cfg.secure, from: cfg.from }
}

function buildTransport(cfg: SmtpConfig): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    // Force STARTTLS when not using implicit TLS, so plaintext isn't silently kept.
    requireTLS: !cfg.secure,
    auth: cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined,
    // Bound a hung SMTP server so it can't pin a worker indefinitely.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })
}

/** Map a nodemailer error to a short, safe message. */
function safeMessage(err: unknown): string {
  const code = err != null && typeof err === 'object' ? (err as { code?: unknown }).code : undefined
  switch (code) {
    case 'EAUTH':
      return 'SMTP authentication failed'
    case 'ECONNECTION':
    case 'ETIMEDOUT':
    case 'ESOCKET':
    case 'EDNS':
      return 'Could not reach the SMTP server'
    case 'EENVELOPE':
      return 'The SMTP server rejected the recipients or sender'
    default:
      return 'Failed to send email'
  }
}

/**
 * Send one email. Throws an {@link AppError} (502) with a safe message on
 * transport/auth/send failure; the route maps it via `sendError`. The caller is
 * responsible for ensuring config exists (see {@link readSmtpConfig}).
 */
export async function sendEmail(input: SendEmailInput): Promise<{ accepted: string[] }> {
  const cfg = readSmtpConfig()
  if (!cfg) throw new AppError('Email is not configured. Set SMTP_HOST and SMTP_FROM.', 400)

  const transport = buildTransport(cfg)
  try {
    const info = await transport.sendMail({
      from: cfg.from,
      to: input.recipients.join(', '),
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
    })
    const acceptedRaw: unknown = (info as { accepted?: unknown }).accepted
    const accepted = Array.isArray(acceptedRaw)
      ? acceptedRaw.map((a) => (typeof a === 'string' ? a : String((a as { address?: string }).address ?? '')))
      : []
    return { accepted }
  } catch (err) {
    throw new AppError(safeMessage(err), 502, 'EMAIL_SEND_FAILED')
  } finally {
    transport.close()
  }
}
