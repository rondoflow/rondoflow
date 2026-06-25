import { execFile } from 'child_process'
import { promisify } from 'util'
import { TIMEOUTS } from '@rondoflow/shared'

const execFileAsync = promisify(execFile)

export interface PrereqResult {
  readonly name: string
  readonly passed: boolean
  readonly message: string
  readonly fix?: string
  readonly critical: boolean
}

export interface PrerequisitesReport {
  readonly allPassed: boolean
  readonly critical: boolean
  readonly results: readonly PrereqResult[]
  readonly failures: readonly PrereqResult[]
}

async function checkClaudeCode(): Promise<PrereqResult> {
  try {
    const { stdout } = await execFileAsync('claude', ['--version'], {
      timeout: TIMEOUTS.CLI_VERSION_CHECK_MS,
    })
    return {
      name: 'Claude Code CLI',
      passed: true,
      message: `Found: ${stdout.trim()}`,
      critical: true,
    }
  } catch {
    return {
      name: 'Claude Code CLI',
      passed: false,
      message: 'Claude Code CLI not found in PATH',
      fix: 'Install Claude Code: npm install -g @anthropic-ai/claude-code',
      critical: false,
    }
  }
}

function checkClaudeAuth(): PrereqResult {
  const hasToken = Boolean(process.env.CLAUDE_CODE_OAUTH_TOKEN?.trim())
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY?.trim())

  if (hasToken || hasApiKey) {
    // The setup-token takes precedence over the API key (see spawner.ts).
    const method = hasToken ? 'setup token' : 'API key'
    return {
      name: 'Claude authentication',
      passed: true,
      message: `Configured (${method})`,
      critical: false,
    }
  }

  return {
    name: 'Claude authentication',
    passed: false,
    message: 'No Claude credential configured — agents cannot run',
    fix: 'Set ANTHROPIC_API_KEY, or run `claude setup-token` and set CLAUDE_CODE_OAUTH_TOKEN (also configurable in Settings → Credentials)',
    critical: false,
  }
}

async function checkDocker(): Promise<PrereqResult> {
  try {
    const { stdout } = await execFileAsync('docker', ['--version'], {
      timeout: TIMEOUTS.CLI_VERSION_CHECK_MS,
    })
    return {
      name: 'Docker',
      passed: true,
      message: `Found: ${stdout.trim()}`,
      critical: false,
    }
  } catch {
    return {
      name: 'Docker',
      passed: false,
      message: 'Docker not found',
      fix: 'Install Docker Desktop: https://docker.com/products/docker-desktop',
      critical: false,
    }
  }
}

async function checkPostgres(): Promise<PrereqResult> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return {
      name: 'PostgreSQL',
      passed: false,
      message: 'DATABASE_URL environment variable not set',
      fix: 'Set DATABASE_URL=postgresql://rondoflow:rondoflow_dev@localhost:5432/rondoflow',
      critical: true,
    }
  }

  return {
    name: 'PostgreSQL',
    passed: true,
    message: 'DATABASE_URL configured',
    critical: true,
  }
}

export async function checkPrerequisites(): Promise<PrerequisitesReport> {
  const [claude, docker, postgres] = await Promise.all([
    checkClaudeCode(),
    checkDocker(),
    checkPostgres(),
  ])
  // checkClaudeAuth is synchronous (reads process.env); keep it adjacent to the
  // CLI check in the results order so the two Claude-related rows stay together.
  const results = [claude, checkClaudeAuth(), docker, postgres]

  const failures = results.filter((r) => !r.passed)
  const critical = failures.some((r) => r.critical)

  return {
    allPassed: failures.length === 0,
    critical,
    results,
    failures,
  }
}
