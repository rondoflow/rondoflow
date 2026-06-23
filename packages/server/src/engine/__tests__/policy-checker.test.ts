import { describe, it, expect } from 'vitest'
import { checkToolUse } from '../policy-checker'
import type { ResolvedPolicy } from '@rondoflow/shared'

// ---------------------------------------------------------------------------
// Test fixture helpers
// ---------------------------------------------------------------------------

function makePolicy(overrides: Partial<ResolvedPolicy> = {}): ResolvedPolicy {
  return {
    blockedCommands: [],
    requireApproval: [],
    maxTimeout: 300_000,
    maxFileSize: 10_485_760,
    maxBudgetUsd: 100,
    permissionMode: 'dontAsk',
    sources: [],
    ...overrides,
  }
}

describe('checkToolUse — allowed with no restrictions', () => {
  it('returns allowed=true and requiresApproval=false when policy is empty', () => {
    const policy = makePolicy()
    const result = checkToolUse('Read', {}, policy)
    expect(result.allowed).toBe(true)
    expect(result.requiresApproval).toBe(false)
  })

  it('passes an unblocked Bash command through', () => {
    const policy = makePolicy({ blockedCommands: ['rm -rf /'] })
    const result = checkToolUse('Bash', { command: 'ls -la' }, policy)
    expect(result.allowed).toBe(true)
    expect(result.requiresApproval).toBe(false)
  })
})

describe('checkToolUse — blocked commands', () => {
  it('blocks exact command match', () => {
    const policy = makePolicy({ blockedCommands: ['rm -rf /'] })
    const result = checkToolUse('Bash', { command: 'rm -rf /' }, policy)
    expect(result.allowed).toBe(false)
    expect(result.requiresApproval).toBe(false)
    expect(result.matchedRule).toBe('rm -rf /')
    expect(result.reason).toContain('blocked')
  })

  it('blocks command that includes a blocked pattern', () => {
    const policy = makePolicy({ blockedCommands: ['rm -rf'] })
    const result = checkToolUse('Bash', { command: 'rm -rf /tmp/work' }, policy)
    expect(result.allowed).toBe(false)
  })

  it('blocks command that starts with a blocked pattern', () => {
    const policy = makePolicy({ blockedCommands: ['curl'] })
    const result = checkToolUse('Bash', { command: 'curl http://evil.com' }, policy)
    expect(result.allowed).toBe(false)
  })

  it('blocks a non-Bash tool by exact tool name match', () => {
    const policy = makePolicy({ blockedCommands: ['Write'] })
    const result = checkToolUse('Write', { path: '/etc/hosts', content: 'x' }, policy)
    expect(result.allowed).toBe(false)
    expect(result.matchedRule).toBe('Write')
  })

  it('does not block a different non-Bash tool when only one is listed', () => {
    const policy = makePolicy({ blockedCommands: ['Write'] })
    const result = checkToolUse('Read', { path: '/tmp/file' }, policy)
    expect(result.allowed).toBe(true)
  })
})

describe('checkToolUse — requires-approval check', () => {
  it('marks command requiring approval as allowed but flagged', () => {
    const policy = makePolicy({ requireApproval: ['git push'] })
    const result = checkToolUse('Bash', { command: 'git push origin main' }, policy)
    expect(result.allowed).toBe(true)
    expect(result.requiresApproval).toBe(true)
    expect(result.matchedRule).toBe('git push')
  })

  it('marks all commands for approval when requireApproval=true', () => {
    const policy = makePolicy({ requireApproval: true })
    const result = checkToolUse('Bash', { command: 'echo hello' }, policy)
    expect(result.allowed).toBe(true)
    expect(result.requiresApproval).toBe(true)
    expect(result.matchedRule).toBe('all')
  })

  it('approves non-Bash tool when requireApproval matches its name', () => {
    const policy = makePolicy({ requireApproval: ['WebFetch'] })
    const result = checkToolUse('WebFetch', { url: 'http://example.com' }, policy)
    expect(result.allowed).toBe(true)
    expect(result.requiresApproval).toBe(true)
  })

  it('does not require approval when list is empty', () => {
    const policy = makePolicy({ requireApproval: [] })
    const result = checkToolUse('Bash', { command: 'npm install' }, policy)
    expect(result.requiresApproval).toBe(false)
  })
})

describe('checkToolUse — blocked takes priority over requireApproval', () => {
  it('returns allowed=false even when command is also in requireApproval', () => {
    const policy = makePolicy({
      blockedCommands: ['curl'],
      requireApproval: ['curl'],
    })
    const result = checkToolUse('Bash', { command: 'curl http://example.com' }, policy)
    expect(result.allowed).toBe(false)
    expect(result.requiresApproval).toBe(false)
  })
})

describe('checkToolUse — Bash tool command extraction', () => {
  it('uses toolName fallback when Bash has no command field', () => {
    const policy = makePolicy({ blockedCommands: ['Bash'] })
    // Passing an object without a `command` field
    const result = checkToolUse('Bash', { somethingElse: 'value' }, policy)
    expect(result.allowed).toBe(false)
    expect(result.matchedRule).toBe('Bash')
  })

  it('uses toolName when toolInput is null', () => {
    const policy = makePolicy({ blockedCommands: ['Bash'] })
    const result = checkToolUse('Bash', null, policy)
    expect(result.allowed).toBe(false)
  })

  it('uses toolName when toolInput is not an object', () => {
    const policy = makePolicy({ requireApproval: ['Bash'] })
    const result = checkToolUse('Bash', 42, policy)
    expect(result.requiresApproval).toBe(true)
  })
})

describe('checkToolUse — pattern matching edge cases', () => {
  it('performs case-sensitive matching', () => {
    const policy = makePolicy({ blockedCommands: ['RM'] })
    // Lowercase 'rm' should NOT match 'RM'
    const result = checkToolUse('Bash', { command: 'rm /tmp/x' }, policy)
    expect(result.allowed).toBe(true)
  })

  it('matches a partial pattern anywhere in the command', () => {
    const policy = makePolicy({ blockedCommands: ['/etc/passwd'] })
    const result = checkToolUse('Bash', { command: 'cat /etc/passwd' }, policy)
    expect(result.allowed).toBe(false)
  })
})
