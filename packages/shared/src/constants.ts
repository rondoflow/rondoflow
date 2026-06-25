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

// ── Timeouts ─────────────────────────────────────────────────────────────────

/**
 * Operation timeouts — centralized for a single-glance overview of every wait
 * bound in the app. Units are explicit in each key (`_MS` / `_SEC`). Values are
 * the literal defaults; for the env-overridable ones the `process.env` read
 * stays at the call site (as with `NETWORK` above) and only the fallback lives
 * here. (Socket.IO's own connect timeout lives in `SOCKET` above.)
 */
export const TIMEOUTS = {
  // Direct Claude / Anthropic API
  /** Connectivity + auth probe against GET /v1/models (server: lib/claude-connection.ts). */
  CLAUDE_CONNECTION_PROBE_MS: 10_000,

  // Spawned Claude Code runs (server: engine/spawner.ts) — env-overridable defaults
  /** Default inactivity (idle) timeout for every spawned run; 0 disables. Env: `RONDOFLOW_SPAWN_IDLE_TIMEOUT_MS`. */
  SPAWN_IDLE_DEFAULT_MS: 300_000,
  /** Default absolute wall-clock cap for a spawned run; 0 = off. Env: `RONDOFLOW_SPAWN_MAX_MS`. */
  SPAWN_WALLCLOCK_DEFAULT_MS: 0,

  // Discussion turns (server: discussion/turn-router.ts)
  /** Per participant turn. */
  DISCUSSION_TURN_MS: 2 * 60 * 1_000,
  /** Per moderator decision turn. */
  DISCUSSION_MODERATOR_TURN_MS: 90 * 1_000,

  // One-shot generators / evaluators
  /** Workflow generation one-shot (server: engine/workflow-generator.ts). */
  WORKFLOW_GENERATION_MS: 90_000,
  /** Director per-evaluation wall-clock default, in SECONDS — UI-configurable (server: services/settings.ts). */
  DIRECTOR_EVAL_DEFAULT_SEC: 90,
  /** Upper bound accepted for the configurable Director timeout, in SECONDS (server: routes/settings.ts). */
  DIRECTOR_EVAL_MAX_SEC: 600,

  // External provider runners
  /** Perplexity Sonar default client timeout (server: engine/perplexity-runner.ts). */
  PERPLEXITY_DEFAULT_MS: 10 * 60_000,
  /** Perplexity deep-research client timeout. */
  PERPLEXITY_DEEP_RESEARCH_MS: 30 * 60_000,
  /** Sakana AI request default, in SECONDS (server: engine/sakana-ai-runner.ts). */
  SAKANA_DEFAULT_SEC: 30,
  /** Apify actor run-sync default timeout, in SECONDS (server: engine/apify-actor-runner.ts). */
  APIFY_ACTOR_DEFAULT_SEC: 120,
  /** Apify actor hard cap on the user-configured timeout, in SECONDS — Apify's
   *  run-sync endpoint itself rejects waits longer than 300s. */
  APIFY_ACTOR_MAX_SEC: 300,
  /** HTTP-request node default timeout, in SECONDS (server: engine/http-request-runner.ts). */
  HTTP_REQUEST_DEFAULT_SEC: 30,
  /** HTTP-request node hard cap on the user-configured timeout, in SECONDS. */
  HTTP_REQUEST_MAX_SEC: 300,

  // Approvals (server: engine/approval-manager.ts, socket/handlers.ts)
  /** Auto-reject an unanswered tool-approval request after this long. */
  APPROVAL_DEFAULT_MS: 5 * 60 * 1_000,

  // Lifecycle / housekeeping (server)
  /** Grace window before tearing down a disconnected user's runs. Env: `RONDOFLOW_TEARDOWN_GRACE_MS` (socket/handlers.ts). */
  TEARDOWN_GRACE_DEFAULT_MS: 60_000,
  /** Bound on awaiting finalize() writes during run teardown (engine/run-registry.ts). */
  RUN_FINALIZE_MS: 5_000,
  /** CLI version-check probes — `claude` / `docker --version` (lib/prerequisites.ts). */
  CLI_VERSION_CHECK_MS: 5_000,
  /** PRD-pipeline shell-out command cap (engine/prd-pipeline.ts). */
  PRD_COMMAND_MS: 60_000,
} as const

// ── Intervals ──────────────────────────────────────────────────────────────

/**
 * Recurring poll / watchdog cadences. (Socket.IO reconnection delays live in
 * `SOCKET` above; short-lived UI animation/countdown ticks stay inline at their
 * call site.)
 */
export const INTERVALS = {
  /** ProcessManager watchdog sweep — reap dead child processes (server: engine/process-manager.ts). */
  PROCESS_WATCHDOG_MS: 10_000,
  /** Approval watchdog sweep — auto-reject expired approvals (server: index.ts). */
  APPROVAL_WATCHDOG_MS: 10_000,
  /** Git-status auto-refresh poll while the Git panel is open (ui: hooks/use-git.ts). */
  GIT_STATUS_POLL_MS: 10_000,
} as const

// ── Concurrency / queue ──────────────────────────────────────────────────────

/** Agent execution concurrency + queue bounds (server: engine/process-manager.ts). */
export const CONCURRENCY = {
  /** Default max concurrently-running agent processes. Env: `MAX_CONCURRENT_AGENTS`; also the UI default. */
  DEFAULT_MAX_CONCURRENT_AGENTS: 5,
  /** Max requests queued once the concurrency cap is reached, before rejecting. */
  MAX_QUEUE: 20,
} as const

// ── Skill selection ──────────────────────────────────────────────────────────

/** Tuning for relevance-filtering the skill catalog into a prompt (server: engine/skill-selection.ts). */
export const SKILL_SELECTION = {
  /** Cap on skills rendered into a plan/generate prompt; above it, keep the top-N by relevance. */
  MAX_SKILLS_IN_PROMPT: 60,
  /** Common words stripped before term-overlap scoring (they carry no matching signal). */
  STOP_WORDS: [
    'the',
    'and',
    'for',
    'with',
    'that',
    'this',
    'from',
    'into',
    'your',
    'you',
    'are',
    'was',
    'will',
    'have',
    'has',
    'all',
    'any',
    'use',
    'using',
    'used',
    'can',
    'should',
    'when',
    'then',
    'them',
    'they',
    'its',
    'our',
    'out',
    'who',
    'what',
    'which',
    'how',
    'why',
    'task',
    'agent',
    'agents',
    'workflow',
  ],
} as const
