import { TIMEOUTS, type SocialAuthProviders } from '@rondoflow/shared'
import { prisma } from '../lib/prisma'
import { encrypt, decrypt } from '../resources/encryption'

// ─── Credential metadata ─────────────────────────────────────────────────────
// Single source of truth for the credentials managed via the UI. Each entry maps
// an env var (also the Setting.key) to a camelCase API field and UI display info.

export type CredentialGroup = 'anthropic' | 'openai' | 'perplexity' | 'github' | 'google' | 'smtp'

export interface CredentialMeta {
  readonly key: string // env var name + Setting.key, e.g. "ANTHROPIC_API_KEY"
  readonly field: string // camelCase field used in API payloads, e.g. "anthropicApiKey"
  readonly label: string
  readonly group: CredentialGroup
  readonly secret: boolean // true → masked in status + password input in UI
}

export const CREDENTIALS: readonly CredentialMeta[] = [
  { key: 'ANTHROPIC_API_KEY', field: 'anthropicApiKey', label: 'Claude API key', group: 'anthropic', secret: true },
  { key: 'CLAUDE_CODE_OAUTH_TOKEN', field: 'claudeCodeOauthToken', label: 'Claude setup token', group: 'anthropic', secret: true },
  { key: 'OPENAI_API_KEY', field: 'openaiApiKey', label: 'OpenAI API key', group: 'openai', secret: true },
  { key: 'PERPLEXITY_API_KEY', field: 'perplexityApiKey', label: 'Perplexity API key', group: 'perplexity', secret: true },
  { key: 'GITHUB_CLIENT_ID', field: 'githubClientId', label: 'GitHub Client ID', group: 'github', secret: false },
  { key: 'GITHUB_CLIENT_SECRET', field: 'githubClientSecret', label: 'GitHub Client Secret', group: 'github', secret: true },
  { key: 'GOOGLE_CLIENT_ID', field: 'googleClientId', label: 'Google Client ID', group: 'google', secret: false },
  { key: 'GOOGLE_CLIENT_SECRET', field: 'googleClientSecret', label: 'Google Client Secret', group: 'google', secret: true },
  { key: 'SMTP_HOST', field: 'smtpHost', label: 'SMTP host', group: 'smtp', secret: false },
  { key: 'SMTP_PORT', field: 'smtpPort', label: 'SMTP port', group: 'smtp', secret: false },
  { key: 'SMTP_SECURE', field: 'smtpSecure', label: 'SMTP secure (true / false)', group: 'smtp', secret: false },
  { key: 'SMTP_USER', field: 'smtpUser', label: 'SMTP username', group: 'smtp', secret: false },
  { key: 'SMTP_PASS', field: 'smtpPass', label: 'SMTP password', group: 'smtp', secret: true },
  { key: 'SMTP_FROM', field: 'smtpFrom', label: 'SMTP from address', group: 'smtp', secret: false },
]

const FIELD_TO_META = new Map(CREDENTIALS.map((c) => [c.field, c]))

// Pristine `.env` values captured at import — used to restore the file-based
// fallback when a DB-stored credential is cleared. Captured before
// `loadSettingsIntoEnv()` ever mutates process.env, so these reflect the .env file.
const ENV_BASELINE: Readonly<Record<string, string | undefined>> = Object.fromEntries(
  CREDENTIALS.map((c) => [c.key, process.env[c.key]]),
)

function setEnv(key: string, value: string | undefined): void {
  if (value === undefined || value.length === 0) {
    delete process.env[key]
  } else {
    process.env[key] = value
  }
}

// ─── Status (read) ───────────────────────────────────────────────────────────

export interface CredentialStatus {
  readonly key: string
  readonly field: string
  readonly label: string
  readonly group: CredentialGroup
  readonly secret: boolean
  readonly isSet: boolean
  readonly source: 'db' | 'env' | null
  readonly preview: string | null // full value for non-secrets, masked for secrets, null if unset
}

export function maskValue(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length <= 4) return '••••'
  return `••••${trimmed.slice(-4)}`
}

/**
 * Returns the presence + masked preview of every managed credential.
 * Never returns raw secret values — secrets are masked, non-secrets (client IDs)
 * are shown in full so the user can confirm what is configured.
 */
export async function getCredentialStatus(): Promise<readonly CredentialStatus[]> {
  const rows = await prisma.setting.findMany({ select: { key: true } })
  const dbKeys = new Set(rows.map((r) => r.key))

  return CREDENTIALS.map((c) => {
    const envVal = process.env[c.key]
    const isSet = Boolean(envVal && envVal.length > 0)
    const inDb = dbKeys.has(c.key)
    const source: 'db' | 'env' | null = inDb ? 'db' : isSet ? 'env' : null
    const preview = isSet && envVal ? (c.secret ? maskValue(envVal) : envVal) : null
    return {
      key: c.key,
      field: c.field,
      label: c.label,
      group: c.group,
      secret: c.secret,
      isSet,
      source,
      preview,
    }
  })
}

/**
 * Which social sign-in providers are currently enabled. Mirrors the `enabled`
 * gate in the auth layer (auth/auth.ts): a provider is enabled iff its OAuth
 * client ID is present in process.env. Reads process.env so it reflects both
 * DB-stored credentials loaded at boot (loadSettingsIntoEnv) and runtime changes
 * (applyCredentialUpdates). Returns booleans only — never credential values —
 * so it is safe to expose pre-auth to the login page.
 */
export function getEnabledSocialProviders(): SocialAuthProviders {
  return {
    github: Boolean(process.env.GITHUB_CLIENT_ID),
    google: Boolean(process.env.GOOGLE_CLIENT_ID),
  }
}

// ─── Boot loader ───────────────────────────────────────────────────────────────

/**
 * Loads DB-stored credentials into process.env, overriding the .env file.
 * Must run at boot BEFORE the auth layer is built so Better Auth picks up
 * DB-stored OAuth credentials, and before any agent is spawned.
 */
export async function loadSettingsIntoEnv(): Promise<void> {
  const rows = await prisma.setting.findMany()
  const byKey = new Map(rows.map((r) => [r.key, r.value]))

  for (const c of CREDENTIALS) {
    const stored = byKey.get(c.key)
    if (stored === undefined) continue
    try {
      process.env[c.key] = decrypt(stored)
    } catch (err) {
      console.error(
        `[settings] Failed to decrypt stored credential "${c.key}" — leaving .env value in place:`,
        err instanceof Error ? err.message : err,
      )
    }
  }
}

// ─── Global execution budget ───────────────────────────────────────────────
// The per-run spend cap (`--max-budget-usd`) is resolved from global Policy rows
// (prompt-builder.ts: most-restrictive wins). The UI exposes it as a single
// "Max Budget" setting that reads/writes the canonical global policy created by
// the seed. `null` = no cap (the rule is removed and no flag is forwarded).

// Matches the seed's POLICY_ID so the upsert targets the same row.
const GLOBAL_POLICY_ID = 'd0000000-0000-0000-0000-000000000001'

// Rules used only when no global policy exists yet (fresh DB / never seeded).
const DEFAULT_GLOBAL_RULES: Record<string, unknown> = {
  blockedCommands: ['rm -rf /', 'DROP TABLE', 'FORMAT'],
  requireApproval: ['rm', 'git push', 'npm publish', 'docker rm'],
  maxTimeout: 300,
  permissionMode: 'default',
}

function parseBudget(rules: unknown): number | null {
  if (rules && typeof rules === 'object' && 'maxBudgetUsd' in rules) {
    const v = (rules as { maxBudgetUsd?: unknown }).maxBudgetUsd
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return null
}

/**
 * The configured global spend cap in USD, or null if no cap is set. Reads the
 * canonical global policy, falling back to the oldest global policy if that row
 * was renamed/removed.
 */
export async function getGlobalBudget(): Promise<number | null> {
  const canonical = await prisma.policy.findUnique({ where: { id: GLOBAL_POLICY_ID } })
  if (canonical) return parseBudget(canonical.rules)
  const anyGlobal = await prisma.policy.findFirst({
    where: { level: 'global' },
    orderBy: { createdAt: 'asc' },
  })
  return anyGlobal ? parseBudget(anyGlobal.rules) : null
}

/**
 * Sets (or clears, when value is null) the global spend cap by upserting the
 * canonical global policy. Other rules on the policy are preserved. Returns the
 * persisted value.
 */
export async function setGlobalBudget(value: number | null): Promise<number | null> {
  const existing = await prisma.policy.findUnique({ where: { id: GLOBAL_POLICY_ID } })
  const baseRules: Record<string, unknown> =
    existing && existing.rules && typeof existing.rules === 'object'
      ? { ...(existing.rules as Record<string, unknown>) }
      : { ...DEFAULT_GLOBAL_RULES }

  if (value === null) {
    delete baseRules.maxBudgetUsd
  } else {
    baseRules.maxBudgetUsd = value
  }

  const policy = await prisma.policy.upsert({
    where: { id: GLOBAL_POLICY_ID },
    create: { id: GLOBAL_POLICY_ID, name: 'Default Safety Rules', level: 'global', rules: baseRules as never },
    update: { rules: baseRules as never },
  })
  return parseBudget(policy.rules)
}

// ─── Director evaluation budget ──────────────────────────────────────────────
// The Director is an advisory per-step evaluator (engine/director.ts). It runs a
// bounded JSON-only Claude call capped by `--max-budget-usd` so a single
// evaluation can never run away. The cap defaults to a few cents but is exposed
// as a UI setting because long workflows embed large step histories in the
// prompt and can exceed the default, producing `error_max_budget_usd`. Stored as
// a plaintext numeric Setting row (not a secret, not env-backed).

const DIRECTOR_BUDGET_KEY = 'DIRECTOR_MAX_BUDGET_USD'
export const DEFAULT_DIRECTOR_BUDGET_USD = 0.05

/**
 * The configured per-evaluation spend cap for the Director, in USD. Falls back to
 * DEFAULT_DIRECTOR_BUDGET_USD when no value is stored or the stored value is
 * malformed. Never null — the Director always runs with some cap.
 */
export async function getDirectorBudget(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: DIRECTOR_BUDGET_KEY } })
  if (!row) return DEFAULT_DIRECTOR_BUDGET_USD
  const n = Number(row.value)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DIRECTOR_BUDGET_USD
}

/**
 * Sets (or resets to the default, when value is null) the Director's per-evaluation
 * spend cap. Returns the value the Director will use going forward.
 */
export async function setDirectorBudget(value: number | null): Promise<number> {
  if (value === null) {
    await prisma.setting.deleteMany({ where: { key: DIRECTOR_BUDGET_KEY } })
    return DEFAULT_DIRECTOR_BUDGET_USD
  }
  await prisma.setting.upsert({
    where: { key: DIRECTOR_BUDGET_KEY },
    create: { key: DIRECTOR_BUDGET_KEY, value: String(value) },
    update: { value: String(value) },
  })
  return value
}

// ─── Director evaluation timeout ─────────────────────────────────────────────
// Each Director evaluation spawns a bounded JSON-only Claude call (engine/
// director.ts). Besides the spend cap above, the call is also capped by an
// absolute wall-clock timeout so a hung/slow CLI can't wedge the chain — on
// timeout the evaluation is reaped and the chain falls back to its default
// decision (`Director evaluation failed: … timed out (wall-clock) after …`). The
// default suits short workflows, but long workflows embed large step histories
// in the prompt, so the haiku call can legitimately need longer than the default
// to finish; expose it as a UI setting. Stored in SECONDS as a plaintext numeric
// Setting row (not a secret, not env-backed); the Director converts to ms.

const DIRECTOR_TIMEOUT_KEY = 'DIRECTOR_MAX_WALL_CLOCK_SEC'
export const DEFAULT_DIRECTOR_TIMEOUT_SEC = TIMEOUTS.DIRECTOR_EVAL_DEFAULT_SEC

/**
 * The configured per-evaluation wall-clock timeout for the Director, in SECONDS.
 * Falls back to DEFAULT_DIRECTOR_TIMEOUT_SEC when no value is stored or the stored
 * value is malformed. Never null — the Director always runs with some timeout.
 */
export async function getDirectorTimeout(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: DIRECTOR_TIMEOUT_KEY } })
  if (!row) return DEFAULT_DIRECTOR_TIMEOUT_SEC
  const n = Number(row.value)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DIRECTOR_TIMEOUT_SEC
}

/**
 * Sets (or resets to the default, when value is null) the Director's per-evaluation
 * wall-clock timeout in SECONDS. Returns the value the Director will use going forward.
 */
export async function setDirectorTimeout(value: number | null): Promise<number> {
  if (value === null) {
    await prisma.setting.deleteMany({ where: { key: DIRECTOR_TIMEOUT_KEY } })
    return DEFAULT_DIRECTOR_TIMEOUT_SEC
  }
  await prisma.setting.upsert({
    where: { key: DIRECTOR_TIMEOUT_KEY },
    create: { key: DIRECTOR_TIMEOUT_KEY, value: String(value) },
    update: { value: String(value) },
  })
  return value
}

// ─── Updates (write) ─────────────────────────────────────────────────────────

export type CredentialUpdates = Record<string, string | undefined>

/**
 * Applies credential updates keyed by API field name. For each provided field:
 *   - non-empty value → encrypt + upsert to DB + set process.env
 *   - empty string    → clear: delete DB row + restore the .env baseline value
 *   - undefined       → left unchanged (not present in payload)
 * Returns whether any GitHub/Google credential changed (caller rebuilds auth).
 */
export async function applyCredentialUpdates(updates: CredentialUpdates): Promise<{ authChanged: boolean }> {
  let authChanged = false

  for (const [field, rawValue] of Object.entries(updates)) {
    if (rawValue === undefined) continue
    const meta = FIELD_TO_META.get(field)
    if (!meta) continue

    const value = rawValue.trim()
    if (value.length > 0) {
      const ciphertext = encrypt(value)
      await prisma.setting.upsert({
        where: { key: meta.key },
        create: { key: meta.key, value: ciphertext },
        update: { value: ciphertext },
      })
      process.env[meta.key] = value
    } else {
      // Explicit clear — remove the stored value and fall back to the .env file
      await prisma.setting.deleteMany({ where: { key: meta.key } })
      setEnv(meta.key, ENV_BASELINE[meta.key])
    }

    if (meta.group === 'github' || meta.group === 'google') authChanged = true
  }

  return { authChanged }
}
