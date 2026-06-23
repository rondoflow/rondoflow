import type { FastifyInstance } from 'fastify'
import { sendSuccess, sendError } from '../lib/errors'
import { testClaudeConnection } from '../lib/claude-connection'

export async function claudeRoutes(app: FastifyInstance): Promise<void> {
  // Live Claude API connectivity + auth probe. Drives the canvas Start node's
  // "Test" button and the pre-run gate. Always returns a success envelope — a
  // failed connection is reported as `{ ok: false, ... }` in the data, not as
  // an HTTP error — so callers can render the failure detail.
  app.post('/api/claude/test-connection', async (_req, reply) => {
    try {
      const result = await testClaudeConnection()
      sendSuccess(reply, result)
    } catch (error) {
      sendError(reply, error)
    }
  })
}
