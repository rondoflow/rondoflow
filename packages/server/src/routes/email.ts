import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sendSuccess, sendError, ValidationError } from '../lib/errors'
import { requireCapability } from '../auth/rbac'
import { readSmtpConfig, sendEmail, smtpStatus } from '../services/email-sender'

const MAX_BODY = 5 * 1024 * 1024 // 5MB — bound memory; mirrors the fs preview cap.

const SendEmailSchema = z.object({
  // Server is the authority on recipients: each must be a valid address.
  recipients: z.array(z.string().email()).min(1).max(50),
  subject: z.string().min(1).max(255),
  html: z.string().min(1).max(MAX_BODY),
  text: z.string().max(MAX_BODY).optional(),
})

export async function emailRoutes(app: FastifyInstance) {
  // Sending mail is an outward-facing action billed to the operator's SMTP, so
  // cap it tightly and require the `run` capability (editor+), not just `write`.
  app.post(
    '/api/email/send',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      preHandler: requireCapability('run'),
    },
    async (req, reply) => {
      try {
        const body = SendEmailSchema.parse(req.body)

        if (!readSmtpConfig()) {
          return sendError(
            reply,
            new ValidationError('Email is not configured. Set SMTP_HOST and SMTP_FROM.'),
          )
        }

        // Header-injection defense: collapse CR/LF in the subject (recipients are
        // already newline-free via z.email()). Length is capped by the schema.
        const subject = body.subject.replace(/[\r\n]+/g, ' ').trim()

        const result = await sendEmail({
          recipients: body.recipients,
          subject,
          html: body.html,
          text: body.text,
        })
        sendSuccess(reply, { accepted: result.accepted })
      } catch (error) {
        sendError(reply, error)
      }
    },
  )

  // Non-secret config view so the UI can show "Email configured: yes/no".
  app.get('/api/email/status', async (_req, reply) => {
    sendSuccess(reply, smtpStatus())
  })
}
