import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'
import { NETWORK } from '@rondoflow/shared'
import { prisma } from '../lib/prisma'

const UI_ORIGIN = process.env.UI_ORIGIN ?? NETWORK.DEFAULT_UI_ORIGIN

// Builds a Better Auth instance from the CURRENT process.env. Social provider
// credentials are read here, so the instance must be (re)built AFTER
// loadSettingsIntoEnv() and again whenever OAuth credentials change.
function buildAuth() {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? NETWORK.DEFAULT_API_URL,
    basePath: '/api/auth',
    secret: (() => {
      const secret = process.env.BETTER_AUTH_SECRET
      if (!secret) throw new Error('BETTER_AUTH_SECRET environment variable is required. Run `npm run setup` to generate one.')
      return secret
    })(),
    appName: 'rondoflow',

    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),

    // Invite-only: open self-registration is disabled. Accounts are created
    // exclusively by an admin (Better Auth admin plugin → /api/users wrapper),
    // or seeded via the env-driven bootstrap admin. disableSignUp blocks the
    // email/password sign-up route; disableImplicitSignUp (below) blocks OAuth
    // from auto-provisioning unknown emails.
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },

    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID ?? '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
        enabled: Boolean(process.env.GITHUB_CLIENT_ID),
        disableImplicitSignUp: true,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        enabled: Boolean(process.env.GOOGLE_CLIENT_ID),
        disableImplicitSignUp: true,
      },
    },

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 min cache
      },
    },

    trustedOrigins: [UI_ORIGIN],

    // Global roles (admin/editor/viewer). The plugin stores `role` on the user
    // (surfaced on the session for the Fastify + Socket.IO middleware and the
    // UI) and exposes server APIs (createUser/listUsers/setRole/ban*) that the
    // /api/users routes wrap. We do NOT configure custom access-control roles —
    // editor/viewer action semantics are enforced in our own route/socket layer
    // (see auth/rbac.ts). defaultRole is the fail-closed fallback.
    plugins: [admin({ defaultRole: 'viewer', adminRoles: ['admin'] })],
  })
}

export type Auth = ReturnType<typeof buildAuth>

let instance: Auth | null = null

/**
 * Builds the auth layer once (idempotent). Call at boot AFTER loadSettingsIntoEnv()
 * so DB-stored OAuth credentials are picked up.
 */
export function initAuth(): Auth {
  if (instance === null) instance = buildAuth()
  return instance
}

/** Returns the current auth instance, building it on first use. */
export function getAuth(): Auth {
  return instance ?? (instance = buildAuth())
}

/**
 * Forces a rebuild from the current process.env. Call after OAuth credentials
 * change so the new provider config takes effect without a server restart.
 */
export function rebuildAuth(): Auth {
  instance = buildAuth()
  return instance
}
