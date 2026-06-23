import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sendSuccess, sendError } from '../lib/errors'
import { rebuildAuth } from '../auth/auth'
import {
  getCredentialStatus,
  applyCredentialUpdates,
  getEnabledSocialProviders,
  getGlobalBudget,
  setGlobalBudget,
  getDirectorBudget,
  setDirectorBudget,
  getDirectorTimeout,
  setDirectorTimeout,
} from '../services/settings'

// All fields optional. Semantics per field:
//   absent       → leave unchanged
//   ""           → clear (restore the .env fallback)
//   non-empty    → set
const UpdateCredentialsSchema = z.object({
  anthropicApiKey: z.string().max(500).optional(),
  claudeCodeOauthToken: z.string().max(2000).optional(),
  openaiApiKey: z.string().max(500).optional(),
  perplexityApiKey: z.string().max(500).optional(),
  githubClientId: z.string().max(500).optional(),
  githubClientSecret: z.string().max(500).optional(),
  googleClientId: z.string().max(500).optional(),
  googleClientSecret: z.string().max(500).optional(),
  smtpHost: z.string().max(255).optional(),
  smtpPort: z.string().max(10).optional(),
  smtpSecure: z.string().max(10).optional(),
  smtpUser: z.string().max(255).optional(),
  smtpPass: z.string().max(500).optional(),
  smtpFrom: z.string().max(255).optional(),
})

// Global per-run spend cap. null → no cap (clears the rule).
const UpdateBudgetSchema = z.object({
  maxBudgetUsd: z.number().positive().max(1000).nullable(),
})

// Director per-evaluation spend cap. null → reset to the built-in default.
const UpdateDirectorBudgetSchema = z.object({
  maxBudgetUsd: z.number().positive().max(100).nullable(),
})

// Director per-evaluation wall-clock timeout, in seconds. null → reset to default.
// Capped at 600s (10 min) so a misconfiguration can't wedge the chain indefinitely.
const UpdateDirectorTimeoutSchema = z.object({
  timeoutSec: z.number().positive().max(600).nullable(),
})

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  // The global spend cap (`--max-budget-usd`) applied to every run, backed by
  // the canonical global policy. null = no cap.
  app.get('/api/settings/budget', async (_req, reply) => {
    try {
      const maxBudgetUsd = await getGlobalBudget()
      sendSuccess(reply, { maxBudgetUsd })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.put('/api/settings/budget', async (req, reply) => {
    try {
      const { maxBudgetUsd } = UpdateBudgetSchema.parse(req.body)
      const saved = await setGlobalBudget(maxBudgetUsd)
      sendSuccess(reply, { maxBudgetUsd: saved })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // The Director's per-evaluation spend cap (`--max-budget-usd` on the advisory
  // evaluation run). Distinct from the global per-run cap above. null = default.
  app.get('/api/settings/director-budget', async (_req, reply) => {
    try {
      const maxBudgetUsd = await getDirectorBudget()
      sendSuccess(reply, { maxBudgetUsd })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.put('/api/settings/director-budget', async (req, reply) => {
    try {
      const { maxBudgetUsd } = UpdateDirectorBudgetSchema.parse(req.body)
      const saved = await setDirectorBudget(maxBudgetUsd)
      sendSuccess(reply, { maxBudgetUsd: saved })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // The Director's per-evaluation wall-clock timeout (seconds). On timeout the
  // evaluation is reaped and the chain falls back to its default decision. null
  // = default. Raise it for long workflows hitting "timed out (wall-clock)".
  app.get('/api/settings/director-timeout', async (_req, reply) => {
    try {
      const timeoutSec = await getDirectorTimeout()
      sendSuccess(reply, { timeoutSec })
    } catch (error) {
      sendError(reply, error)
    }
  })

  app.put('/api/settings/director-timeout', async (req, reply) => {
    try {
      const { timeoutSec } = UpdateDirectorTimeoutSchema.parse(req.body)
      const saved = await setDirectorTimeout(timeoutSec)
      sendSuccess(reply, { timeoutSec: saved })
    } catch (error) {
      sendError(reply, error)
    }
  })

  // PUBLIC (whitelisted in auth/middleware.ts): which social sign-in providers
  // are configured. The login page reads this to hide GitHub/Google buttons when
  // no OAuth client ID is set. Returns booleans only — never credential values —
  // so it is safe to serve pre-auth.
  app.get('/api/auth-providers', async (_req, reply) => {
    try {
      sendSuccess(reply, getEnabledSocialProviders())
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Masked status of every managed credential — never returns raw secrets.
  app.get('/api/settings/credentials', async (_req, reply) => {
    try {
      const status = await getCredentialStatus()
      sendSuccess(reply, status)
    } catch (error) {
      sendError(reply, error)
    }
  })

  // Upsert/clear credentials. Rebuilds the auth layer when OAuth config changed
  // so GitHub/Google sign-in works without a server restart.
  app.put('/api/settings/credentials', async (req, reply) => {
    try {
      const updates = UpdateCredentialsSchema.parse(req.body)
      const { authChanged } = await applyCredentialUpdates(updates)
      if (authChanged) rebuildAuth()
      const status = await getCredentialStatus()
      sendSuccess(reply, status)
    } catch (error) {
      sendError(reply, error)
    }
  })
}
