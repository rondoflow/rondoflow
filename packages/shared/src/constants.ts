// @rondoflow/shared — Centralized constants
//
// Single source of truth for values that were previously hardcoded and
// duplicated across packages. Prefer adding cross-cutting constants here over
// inlining magic numbers/strings. A value belongs here when it is shared
// between ui and server, or duplicated in more than one module; genuinely
// package-local one-offs may stay in their own module.

// ── Network ──────────────────────────────────────────────────────────────────

/**
 * Network defaults — the fallback used when the corresponding env var is unset.
 * The env reads stay at each call site (Next.js inlines `NEXT_PUBLIC_*` at build
 * time); only the default literals are centralized here.
 */
export const NETWORK = {
  /** Default Fastify server port (env: `PORT`). */
  DEFAULT_SERVER_PORT: 3001,
  /** Default backend API origin (env: `NEXT_PUBLIC_API_URL` / `BETTER_AUTH_URL`). */
  DEFAULT_API_URL: 'http://localhost:3001',
  /** Default Socket.IO origin (env: `NEXT_PUBLIC_SOCKET_URL`). */
  DEFAULT_SOCKET_URL: 'http://localhost:3001',
  /** Default frontend origin allowed by CORS (env: `UI_ORIGIN`). */
  DEFAULT_UI_ORIGIN: 'http://localhost:3000',
} as const

// ── Socket.IO ────────────────────────────────────────────────────────────────

/** Socket.IO client reconnection tuning (see `ui/src/lib/socket.ts`). */
export const SOCKET = {
  RECONNECTION_ATTEMPTS: 3,
  RECONNECTION_DELAY_MS: 3_000,
  RECONNECTION_DELAY_MAX_MS: 10_000,
  CONNECTION_TIMEOUT_MS: 5_000,
} as const

// ── Anthropic / Claude API ─────────────────────────────────────────────────

/**
 * Claude model id per tier, forwarded to the CLI / API. The user-facing tier
 * metadata (labels, cost/latency estimates) lives in `MODEL_TIERS` (models.ts).
 *
 * These are the rolling **aliases**, not dated snapshots — Anthropic's
 * recommended form ("use aliases wherever available"; do not append a date
 * suffix). An alias always resolves to the latest snapshot of its tier.
 */
export const CLAUDE_MODELS = {
  opus: 'claude-opus-4-8',
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5',
} as const

/** Anthropic / Claude API constants used for direct (non-CLI) API calls. */
export const ANTHROPIC = {
  /**
   * Cheap/fast model for best-effort background passes (automatic memory
   * extraction, the post-run advisor, Director evaluation). Currently the Haiku
   * tier — this is NOT the user-facing agent model selection.
   */
  UTILITY_MODEL: CLAUDE_MODELS.haiku,
  /** `anthropic-version` header sent on direct API calls. */
  API_VERSION: '2023-06-01',
  /** `anthropic-beta` header for OAuth (setup-token) auth. */
  OAUTH_BETA: 'oauth-2025-04-20',
  /** Cheap GET endpoint used to probe connectivity + credential validity. */
  MODELS_URL: 'https://api.anthropic.com/v1/models?limit=1',
} as const

// ── Size limits ──────────────────────────────────────────────────────────────

/** File / payload size limits, in bytes. */
export const LIMITS = {
  /** Max uploaded file size — multipart upload cap + resource storage cap. */
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024,
} as const
