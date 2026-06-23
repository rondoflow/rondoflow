#!/usr/bin/env node
// Guided environment setup for rondoflow.
//
//   • Ensures a root .env exists (generated from .env.example) with a random
//     BETTER_AUTH_SECRET — never overwrites an existing .env.
//   • Checks the Claude Code CLI and your Claude credential, and can run
//     `claude setup-token` for you and write the token into .env.
//
// Interactive when run in a TTY; falls back to silent, safe defaults under CI
// or when piped (or with --yes / --non-interactive). Dependency-free (Node
// built-ins only) so it runs before `npm install` has finished wiring deps.

const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const { spawnSync } = require('child_process')
const readline = require('readline/promises')
const { stdin, stdout } = require('process')

const ROOT = path.join(__dirname, '..')
const ENV_FILE = path.join(ROOT, '.env')
const EXAMPLE_FILE = path.join(ROOT, '.env.example')

const ARGS = new Set(process.argv.slice(2))
const DRY_RUN = ARGS.has('--dry-run') || ARGS.has('-n')
const NON_INTERACTIVE =
  ARGS.has('--yes') ||
  ARGS.has('-y') ||
  ARGS.has('--non-interactive') ||
  Boolean(process.env.CI) ||
  !stdin.isTTY ||
  !stdout.isTTY

// ── tiny ANSI helpers (respect NO_COLOR / non-TTY) ───────────────────────────
const COLOR = stdout.isTTY && !process.env.NO_COLOR
const wrap = (open, close) => (s) => (COLOR ? `\x1b[${open}m${s}\x1b[${close}m` : String(s))
const c = {
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  cyan: wrap(36, 39),
  magenta: wrap(35, 39),
}
const ICON = {
  ok: c.green('✔'),
  warn: c.yellow('●'),
  err: c.red('✖'),
  info: c.cyan('›'),
  star: c.magenta('✦'),
}

function banner() {
  const line = c.dim('─'.repeat(52))
  console.log('')
  console.log(line)
  console.log(
    `  ${c.bold(c.magenta('rondoflow'))} ${c.dim('· environment setup')}${DRY_RUN ? `  ${c.yellow('[dry-run]')}` : ''}`,
  )
  console.log(line)
}

function step(n, total, title) {
  console.log('')
  console.log(`${c.dim(`[${n}/${total}]`)} ${c.bold(title)}`)
}

// ── .env file helpers ────────────────────────────────────────────────────────
const generateSecret = () => crypto.randomBytes(32).toString('hex')

function readEnv() {
  return fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : null
}

// Single write seam — a no-op under --dry-run so every flow can run end-to-end
// without touching .env. Returns whether the write was actually performed.
function persist(content) {
  if (DRY_RUN) return false
  fs.writeFileSync(ENV_FILE, content)
  return true
}

const tag = (msg) => (DRY_RUN ? `${msg} ${c.dim('[dry-run — not written]')}` : msg)

function getEnvVar(content, key) {
  const m = content?.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return m ? m[1].trim() : ''
}

// Replace an existing `KEY=...` line in place, or append it if absent.
function upsertEnvVar(content, key, value) {
  const re = new RegExp(`^${key}=.*$`, 'm')
  if (re.test(content)) return content.replace(re, `${key}=${value}`)
  const sep = content.endsWith('\n') || content.length === 0 ? '' : '\n'
  return `${content}${sep}${key}=${value}\n`
}

function writeEnvVar(key, value) {
  const content = readEnv() ?? ''
  persist(upsertEnvVar(content, key, value))
}

const mask = (v) => (v.length <= 10 ? '••••' : `${v.slice(0, 6)}…${v.slice(-4)}`)

// Ensure .env exists. Returns { created, content }.
function ensureEnvFile() {
  const existing = readEnv()
  if (existing !== null) {
    if (
      getEnvVar(existing, 'BETTER_AUTH_SECRET') === 'change-me-to-a-random-secret' ||
      !getEnvVar(existing, 'BETTER_AUTH_SECRET')
    ) {
      const patched = upsertEnvVar(existing, 'BETTER_AUTH_SECRET', generateSecret())
      const withUrl = getEnvVar(patched, 'BETTER_AUTH_URL')
        ? patched
        : upsertEnvVar(patched, 'BETTER_AUTH_URL', 'http://localhost:3001')
      persist(withUrl)
      console.log(
        `  ${ICON.ok} ${tag(`Existing ${c.cyan('.env')} found — generated a fresh BETTER_AUTH_SECRET`)}`,
      )
      return { created: false, content: withUrl }
    }
    console.log(`  ${ICON.ok} Existing ${c.cyan('.env')} found — leaving it untouched`)
    return { created: false, content: existing }
  }

  if (!fs.existsSync(EXAMPLE_FILE)) {
    console.error(`  ${ICON.err} .env.example not found — cannot create .env`)
    process.exit(1)
  }
  const content = upsertEnvVar(
    fs.readFileSync(EXAMPLE_FILE, 'utf8'),
    'BETTER_AUTH_SECRET',
    generateSecret(),
  )
  persist(content)
  console.log(
    `  ${ICON.ok} ${tag(`Created ${c.cyan('.env')} from .env.example with a random BETTER_AUTH_SECRET`)}`,
  )
  return { created: true, content }
}

// ── prerequisite probes ──────────────────────────────────────────────────────
function probe(cmd, args) {
  try {
    const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 5000 })
    return r.status === 0 ? (r.stdout || r.stderr || '').trim().split('\n')[0] : null
  } catch {
    return null
  }
}

function detectAuth(content) {
  const token = getEnvVar(content, 'CLAUDE_CODE_OAUTH_TOKEN')
  const apiKey = getEnvVar(content, 'ANTHROPIC_API_KEY')
  if (token) return { method: 'setup token', value: token }
  if (apiKey) return { method: 'API key', value: apiKey }
  return null
}

// ── interactive Claude credential flow ───────────────────────────────────────
async function configureClaudeAuth(rl, content, claudeVersion) {
  const existing = detectAuth(content)
  if (existing) {
    console.log(
      `  ${ICON.ok} Claude credential already set (${existing.method}: ${c.dim(mask(existing.value))})`,
    )
    return
  }

  console.log(
    `  ${ICON.warn} No Claude credential configured ${c.dim('— agents cannot run until one is set')}`,
  )
  const choices = []
  if (claudeVersion)
    choices.push(['t', `Run ${c.cyan('claude setup-token')} now (uses your Claude subscription)`])
  choices.push(['k', 'Paste an ANTHROPIC_API_KEY'])
  choices.push(['s', 'Skip — configure later in Settings → Credentials'])

  console.log('')
  choices.forEach(([k, label]) => console.log(`    ${c.bold(c.cyan(k))}  ${label}`))
  const def = claudeVersion ? 't' : 's'
  const answer = (
    await rl.question(
      `\n  ${ICON.info} Choose [${choices.map((x) => x[0]).join('/')}] ${c.dim(`(default ${def})`)}: `,
    )
  )
    .trim()
    .toLowerCase()
  const choice = answer || def

  if (choice === 't' && claudeVersion) return runSetupToken(rl)
  if (choice === 'k') return pasteApiKey(rl)
  console.log(
    `  ${ICON.info} Skipped — set a credential later via Settings → Credentials or in ${c.cyan('.env')}.`,
  )
}

async function runSetupToken(rl) {
  console.log('')
  console.log(
    `  ${ICON.star} Launching ${c.cyan('claude setup-token')}. Complete the browser flow; a token`,
  )
  console.log(
    `     ${c.dim('(starts with')} ${c.cyan('sk-ant-oat…')}${c.dim(') will be printed when it finishes.')}`,
  )
  console.log('')

  // Inherit stdio so the user can complete the interactive OAuth flow and see
  // the printed token. Capturing stdout here would break that interactivity,
  // so we ask the user to paste the token back afterwards.
  const r = spawnSync('claude', ['setup-token'], { stdio: 'inherit' })
  if (r.status !== 0) {
    console.log(
      `  ${ICON.warn} ${c.cyan('claude setup-token')} did not complete — you can paste an API key instead.`,
    )
    return pasteApiKey(rl)
  }

  const token = (
    await rl.question(`\n  ${ICON.info} Paste the token shown above (or leave blank to skip): `)
  ).trim()
  if (!token) {
    console.log(
      `  ${ICON.info} No token entered — skipping. Set CLAUDE_CODE_OAUTH_TOKEN later if needed.`,
    )
    return
  }
  if (!token.startsWith('sk-ant-')) {
    console.log(
      `  ${ICON.warn} That doesn't look like a Claude token (expected ${c.cyan('sk-ant-…')}). Saving it anyway.`,
    )
  }
  writeEnvVar('CLAUDE_CODE_OAUTH_TOKEN', token)
  console.log(
    `  ${ICON.ok} ${tag(`Saved CLAUDE_CODE_OAUTH_TOKEN to ${c.cyan('.env')} ${c.dim(`(${mask(token)})`)}`)}`,
  )
}

async function pasteApiKey(rl) {
  const key = (
    await rl.question(`\n  ${ICON.info} Paste your ANTHROPIC_API_KEY (or leave blank to skip): `)
  ).trim()
  if (!key) {
    console.log(`  ${ICON.info} No key entered — skipping. Configure a credential later.`)
    return
  }
  if (!key.startsWith('sk-ant-')) {
    console.log(
      `  ${ICON.warn} That doesn't look like an Anthropic API key (expected ${c.cyan('sk-ant-…')}). Saving it anyway.`,
    )
  }
  writeEnvVar('ANTHROPIC_API_KEY', key)
  console.log(
    `  ${ICON.ok} ${tag(`Saved ANTHROPIC_API_KEY to ${c.cyan('.env')} ${c.dim(`(${mask(key)})`)}`)}`,
  )
}

// ── non-interactive path (CI / piped / --yes) ────────────────────────────────
function runNonInteractive() {
  const { content } = ensureEnvFile()
  const claude = probe('claude', ['--version'])
  if (!claude)
    console.log(
      `  ${ICON.warn} Claude Code CLI not found ${c.dim('— install: npm i -g @anthropic-ai/claude-code')}`,
    )
  if (!detectAuth(content)) {
    console.log(
      `  ${ICON.warn} No Claude credential in .env — set ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN before running agents.`,
    )
  }
  console.log(`  ${ICON.ok} Environment ready ${c.dim('(non-interactive)')}.`)
}

function nextSteps() {
  console.log('')
  console.log(c.dim('─'.repeat(52)))
  console.log(`  ${ICON.star} ${c.bold('Setup helper done.')} Next:`)
  console.log(
    `     ${c.dim('•')} ${c.cyan('npm run dev')}        ${c.dim('start UI (3000) + server (3001)')}`,
  )
  console.log(
    `     ${c.dim('•')} edit ${c.cyan('.env')}          ${c.dim('OAuth, SMTP, telemetry — all optional')}`,
  )
  console.log(c.dim('─'.repeat(52)))
  console.log('')
}

async function main() {
  banner()

  if (NON_INTERACTIVE) {
    runNonInteractive()
    return
  }

  const TOTAL = 2
  step(1, TOTAL, 'Environment file')
  const { content } = ensureEnvFile()

  step(2, TOTAL, 'Claude Code & authentication')
  const claudeVersion = probe('claude', ['--version'])
  if (claudeVersion) {
    console.log(`  ${ICON.ok} Claude Code CLI ${c.dim(`(${claudeVersion})`)}`)
  } else {
    console.log(`  ${ICON.warn} Claude Code CLI not found in PATH`)
    console.log(`     ${c.dim('Install:')} ${c.cyan('npm install -g @anthropic-ai/claude-code')}`)
  }

  const rl = readline.createInterface({ input: stdin, output: stdout })
  try {
    await configureClaudeAuth(rl, content, claudeVersion)
  } finally {
    rl.close()
  }

  nextSteps()
}

main().catch((err) => {
  console.error(
    `\n  ${ICON.err} setup-env failed: ${err instanceof Error ? err.message : String(err)}`,
  )
  process.exit(1)
})
