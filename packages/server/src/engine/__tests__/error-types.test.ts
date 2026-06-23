import { describe, it, expect } from 'vitest'
import { classifyError, getUserMessage } from '../error-types'
import type { AgentErrorType } from '../error-types'

const ALL_TYPES: AgentErrorType[] = [
  'PROCESS_ERROR',
  'STREAM_ERROR',
  'API_ERROR',
  'POLICY_ERROR',
  'TIMEOUT_ERROR',
  'APPROVAL_TIMEOUT',
  'RESOURCE_ERROR',
]

describe('getUserMessage', () => {
  it('returns a non-empty string for every error type', () => {
    for (const type of ALL_TYPES) {
      const msg = getUserMessage(type)
      expect(typeof msg).toBe('string')
      expect(msg.length).toBeGreaterThan(0)
    }
  })

  it('returns a distinct message for each type', () => {
    const messages = ALL_TYPES.map(getUserMessage)
    const unique = new Set(messages)
    expect(unique.size).toBe(ALL_TYPES.length)
  })
})

describe('classifyError', () => {
  const agentId = 'agent-1'
  const sessionId = 'session-1'

  // Helper: classify a plain string message
  function classify(msg: string) {
    return classifyError(new Error(msg), agentId, sessionId)
  }

  it('classifies rate-limit messages as API_ERROR', () => {
    expect(classify('rate limit exceeded').type).toBe('API_ERROR')
  })

  it('classifies 429 status in message as API_ERROR', () => {
    expect(classify('HTTP 429 Too Many Requests').type).toBe('API_ERROR')
  })

  it('classifies overloaded messages as API_ERROR', () => {
    expect(classify('Claude is overloaded right now').type).toBe('API_ERROR')
  })

  it('classifies unauthorized / 401 as API_ERROR', () => {
    expect(classify('401 Unauthorized').type).toBe('API_ERROR')
  })

  it('classifies invalid api key as API_ERROR', () => {
    expect(classify('Invalid api key provided').type).toBe('API_ERROR')
  })

  it('classifies "policy" in message as POLICY_ERROR', () => {
    expect(classify('action blocked by policy').type).toBe('POLICY_ERROR')
  })

  it('classifies "blocked" in message as POLICY_ERROR', () => {
    expect(classify('command is blocked').type).toBe('POLICY_ERROR')
  })

  it('classifies "not permitted" as POLICY_ERROR', () => {
    expect(classify('this action is not permitted here').type).toBe('POLICY_ERROR')
  })

  it('classifies "timeout" in message as TIMEOUT_ERROR', () => {
    expect(classify('operation timed out after 30s').type).toBe('TIMEOUT_ERROR')
  })

  it('classifies "timed out" as TIMEOUT_ERROR', () => {
    expect(classify('request timed out').type).toBe('TIMEOUT_ERROR')
  })

  it('classifies the exact spawn-timeout message format as TIMEOUT_ERROR', () => {
    // Pins the contract relied on by spawner.ts / streaming-runner.ts onTimeout.
    expect(classify('Agent agent-1 timed out (inactivity) after 300000ms').type).toBe('TIMEOUT_ERROR')
    expect(classify('Agent agent-1 timed out (wall-clock) after 90000ms').type).toBe('TIMEOUT_ERROR')
  })

  it('classifies "queue full" as RESOURCE_ERROR', () => {
    expect(classify('queue full — try again later').type).toBe('RESOURCE_ERROR')
  })

  it('classifies "max concurrent" as RESOURCE_ERROR', () => {
    expect(classify('max concurrent agents reached').type).toBe('RESOURCE_ERROR')
  })

  it('classifies "capacity" as RESOURCE_ERROR', () => {
    expect(classify('system is at capacity').type).toBe('RESOURCE_ERROR')
  })

  it('classifies JSON parse errors as STREAM_ERROR', () => {
    expect(classify('Unexpected end of json input').type).toBe('STREAM_ERROR')
  })

  it('classifies parse errors as STREAM_ERROR', () => {
    expect(classify('failed to parse response').type).toBe('STREAM_ERROR')
  })

  it('classifies spawn / ENOENT errors as PROCESS_ERROR', () => {
    expect(classify('spawn claude ENOENT').type).toBe('PROCESS_ERROR')
  })

  it('classifies non-zero exit code as PROCESS_ERROR', () => {
    expect(classify('Claude exited with exit code 1').type).toBe('PROCESS_ERROR')
  })

  it('defaults to PROCESS_ERROR for unknown messages', () => {
    expect(classify('some completely unknown error message xyz').type).toBe('PROCESS_ERROR')
  })

  it('accepts a plain string (non-Error) as the error argument', () => {
    const result = classifyError('rate limit hit', agentId)
    expect(result.type).toBe('API_ERROR')
    expect(result.message).toBe('rate limit hit')
  })

  it('populates agentId and sessionId on the result', () => {
    const result = classify('something bad')
    expect(result.agentId).toBe(agentId)
    expect(result.sessionId).toBe(sessionId)
  })

  it('omits sessionId when not provided', () => {
    const result = classifyError(new Error('boom'), agentId)
    expect(result.sessionId).toBeUndefined()
  })

  it('sets retryable=true for API_ERROR', () => {
    expect(classify('rate limit').retryable).toBe(true)
  })

  it('sets retryable=false for POLICY_ERROR', () => {
    expect(classify('action blocked by policy').retryable).toBe(false)
  })

  it('sets retryable=false for PROCESS_ERROR', () => {
    expect(classify('spawn failed ENOENT').retryable).toBe(false)
  })

  it('sets retryable=true for TIMEOUT_ERROR', () => {
    expect(classify('request timed out').retryable).toBe(true)
  })

  it('sets retryable=true for RESOURCE_ERROR', () => {
    expect(classify('queue full').retryable).toBe(true)
  })

  it('sets retryable=true for STREAM_ERROR', () => {
    expect(classify('unexpected end of json').retryable).toBe(true)
  })

  it('userMessage matches getUserMessage for the classified type', () => {
    const result = classify('rate limit exceeded')
    expect(result.userMessage).toBe(getUserMessage(result.type))
  })
})
