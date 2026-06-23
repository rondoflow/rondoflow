import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock nodemailer so no real SMTP connection is made. A hoisted handle records
// the transport options and the last sendMail payload, and lets a test force a
// send failure.
const h = vi.hoisted(() => ({
  transportOpts: null as unknown,
  sentMail: null as unknown,
  closed: false,
  failWith: null as Error | null,
  accepted: ['a@example.com'] as string[],
}))

vi.mock('nodemailer', () => ({
  default: {
    createTransport: (opts: unknown) => {
      h.transportOpts = opts
      return {
        sendMail: async (mail: unknown) => {
          h.sentMail = mail
          if (h.failWith) throw h.failWith
          return { accepted: h.accepted }
        },
        close: () => {
          h.closed = true
        },
      }
    },
  },
}))

import { readSmtpConfig, smtpStatus, sendEmail } from '../email-sender'

const SMTP_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']

function clearSmtpEnv() {
  for (const k of SMTP_KEYS) delete process.env[k]
}

describe('readSmtpConfig', () => {
  beforeEach(clearSmtpEnv)
  afterEach(clearSmtpEnv)

  it('returns null when SMTP_HOST is unset', () => {
    process.env.SMTP_FROM = 'a@b.com'
    expect(readSmtpConfig()).toBeNull()
  })

  it('returns null when SMTP_FROM is unset', () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    expect(readSmtpConfig()).toBeNull()
  })

  it('parses a full config and defaults port to 587', () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'RondoFlow <no-reply@example.com>'
    const cfg = readSmtpConfig()
    expect(cfg).toMatchObject({ host: 'smtp.example.com', port: 587, secure: false })
  })

  it('defaults secure to true when port is 465 and SMTP_SECURE is unset', () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'a@b.com'
    process.env.SMTP_PORT = '465'
    expect(readSmtpConfig()?.secure).toBe(true)
  })

  it('honours an explicit SMTP_SECURE flag over the port default', () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'a@b.com'
    process.env.SMTP_PORT = '465'
    process.env.SMTP_SECURE = 'false'
    expect(readSmtpConfig()?.secure).toBe(false)
  })

  it('omits auth when user/pass are absent', () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'a@b.com'
    const cfg = readSmtpConfig()!
    expect(cfg.user).toBeUndefined()
    expect(cfg.pass).toBeUndefined()
  })

  it('smtpStatus never exposes the password', () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'a@b.com'
    process.env.SMTP_PASS = 'super-secret'
    const status = smtpStatus()
    expect(status.configured).toBe(true)
    expect(JSON.stringify(status)).not.toContain('super-secret')
  })
})

describe('sendEmail', () => {
  beforeEach(() => {
    clearSmtpEnv()
    h.transportOpts = null
    h.sentMail = null
    h.closed = false
    h.failWith = null
    h.accepted = ['a@example.com', 'b@example.com']
  })
  afterEach(clearSmtpEnv)

  it('throws a 400 AppError when SMTP is not configured', async () => {
    await expect(
      sendEmail({ recipients: ['a@example.com'], subject: 's', html: '<p>x</p>' }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('passes from/to/subject/html/text and returns accepted', async () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'RondoFlow <no-reply@example.com>'
    process.env.SMTP_USER = 'u'
    process.env.SMTP_PASS = 'p'

    const result = await sendEmail({
      recipients: ['a@example.com', 'b@example.com'],
      subject: 'Report',
      html: '<h1>Hi</h1>',
      text: 'Hi',
    })

    expect(h.transportOpts).toMatchObject({ host: 'smtp.example.com', auth: { user: 'u', pass: 'p' } })
    expect(h.sentMail).toMatchObject({
      from: 'RondoFlow <no-reply@example.com>',
      to: 'a@example.com, b@example.com',
      subject: 'Report',
      html: '<h1>Hi</h1>',
      text: 'Hi',
    })
    expect(result.accepted).toEqual(['a@example.com', 'b@example.com'])
    expect(h.closed).toBe(true)
  })

  it('maps an auth failure to a 502 AppError and still closes the transport', async () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'a@b.com'
    h.failWith = Object.assign(new Error('bad creds'), { code: 'EAUTH' })

    await expect(
      sendEmail({ recipients: ['a@example.com'], subject: 's', html: '<p>x</p>' }),
    ).rejects.toMatchObject({ statusCode: 502, message: 'SMTP authentication failed' })
    expect(h.closed).toBe(true)
  })
})
