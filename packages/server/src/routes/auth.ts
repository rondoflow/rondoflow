import type { FastifyInstance } from 'fastify'
import { toNodeHandler } from 'better-auth/node'
import { NETWORK } from '@rondoflow/shared'
import { getAuth } from '../auth/auth'

const UI_ORIGIN = process.env.UI_ORIGIN ?? NETWORK.DEFAULT_UI_ORIGIN

export async function authRoutes(parent: FastifyInstance): Promise<void> {
  // Register in an encapsulated scope so we can override body parsing
  // without affecting other routes. Better Auth reads the raw Node.js
  // IncomingMessage stream directly — Fastify must not consume it first.
  parent.register(async (app) => {
    app.removeAllContentTypeParsers()
    app.addContentTypeParser('*', (_req, _payload, done) => {
      done(null)
    })

    // Tighter rate limit than the global default: deters credential brute-force
    // on sign-in/sign-up (all auth traffic is keyed by IP).
    app.all('/api/auth/*', {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    }, async (request, reply) => {
      const raw = reply.raw
      raw.setHeader('Access-Control-Allow-Origin', UI_ORIGIN)
      raw.setHeader('Access-Control-Allow-Credentials', 'true')
      raw.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      raw.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      if (request.method === 'OPTIONS') {
        raw.writeHead(204)
        raw.end()
        reply.hijack()
        return
      }

      // Build the handler from the current auth instance on each request so
      // OAuth credential changes (which rebuild auth) take effect without a restart.
      const handler = toNodeHandler(getAuth())
      await handler(request.raw, raw)
      reply.hijack()
    })
  })
}
