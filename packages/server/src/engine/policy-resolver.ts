// Policy resolution engine [G19]
// Implements the formal 3-layer merge algorithm: global → agent → session.
// Most-restrictive-wins semantics are applied for every field.

import { prisma } from '../lib/prisma'
import type { ResolvedPolicy, Policy, PolicyRules } from '@rondoflow/shared'

// Internal mutable working state used during the merge pass.
interface MergeState {
  blockedCommands: Set<string>
  requireApproval: Set<string> | true   // `true` means "approve everything"
  maxTimeout: number
  maxFileSize: number
  maxBudgetUsd: number
  permissionMode: string
  sources: Policy[]
}

const DEFAULTS = {
  maxTimeout: 300_000,      // 5 minutes
  maxFileSize: 10_485_760,  // 10 MB
  maxBudgetUsd: 100,
  permissionMode: 'dontAsk',
} as const

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve the effective policy for an agent, optionally scoped to a session.
 *
 * Load order (least → most specific):
 *   1. Global policies   (level='global', agentId=null)
 *   2. Agent policies    (level='agent',  agentId=targetAgentId)
 *   3. Session policies  (level='session', sessionId=targetSessionId)
 *
 * Merge semantics (most restrictive wins):
 *   - Numeric limits (maxTimeout, maxBudgetUsd, maxFileSize): minimum value
 *   - Blocked lists (blockedCommands): union (additive — never shrink)
 *   - requireApproval: union of patterns; if ANY policy sets `true`, result is `true`
 *   - permissionMode: 'dontAsk' only when ALL layers agree; any 'default' forces 'default'
 */
export async function resolvePolicy(
  agentId: string,
  sessionId?: string,
): Promise<ResolvedPolicy> {
  const [globalPolicies, agentPolicies, sessionPolicies] = await Promise.all([
    prisma.policy.findMany({ where: { level: 'global', agentId: null } }),
    prisma.policy.findMany({ where: { level: 'agent', agentId } }),
    sessionId
      ? prisma.policy.findMany({ where: { level: 'session', sessionId } })
      : Promise.resolve([]),
  ])

  const state: MergeState = {
    blockedCommands: new Set<string>(),
    requireApproval: new Set<string>(),
    maxTimeout: DEFAULTS.maxTimeout,
    maxFileSize: DEFAULTS.maxFileSize,
    maxBudgetUsd: DEFAULTS.maxBudgetUsd,
    permissionMode: DEFAULTS.permissionMode,
    sources: [],
  }

  // Merge in load order — session cannot relax global restrictions because
  // each merge call only tightens values (minimum, union, escalation).
  for (const policy of [...globalPolicies, ...agentPolicies, ...sessionPolicies]) {
    mergePolicy(state, policy as unknown as Policy)
  }

  return buildResult(state)
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function mergePolicy(state: MergeState, policy: Policy): void {
  const rules = policy.rules as PolicyRules

  // Track contribution (store the full Policy so sources satisfies readonly Policy[])
  state.sources.push(policy)

  // blockedCommands — union (additive)
  if (rules.blockedCommands) {
    for (const cmd of rules.blockedCommands) {
      state.blockedCommands.add(cmd)
    }
  }

  // requireApproval — union of patterns; boolean true escalates to approve-all
  if (rules.requireApproval !== undefined) {
    if (rules.requireApproval === true) {
      state.requireApproval = true
    } else if (state.requireApproval !== true && Array.isArray(rules.requireApproval)) {
      for (const pattern of rules.requireApproval) {
        state.requireApproval.add(pattern)
      }
    }
  }

  // Numeric limits — minimum (most restrictive)
  if (typeof rules.maxTimeout === 'number') {
    state.maxTimeout = Math.min(state.maxTimeout, rules.maxTimeout)
  }

  if (typeof rules.maxFileSize === 'number') {
    state.maxFileSize = Math.min(state.maxFileSize, rules.maxFileSize)
  }

  if (typeof rules.maxBudgetUsd === 'number') {
    state.maxBudgetUsd = Math.min(state.maxBudgetUsd, rules.maxBudgetUsd)
  }

  // permissionMode — 'dontAsk' only when all agree; any 'default' wins
  if (rules.permissionMode !== undefined) {
    state.permissionMode = mergePermissionMode(state.permissionMode, rules.permissionMode)
  }
}

/**
 * Merge permission modes with most-restrictive-wins semantics.
 * Restrictiveness ranking (most → least): default > plan > acceptEdits > dontAsk
 */
function mergePermissionMode(current: string, incoming: string): string {
  const rank: Record<string, number> = {
    default: 3,
    plan: 2,
    acceptEdits: 1,
    dontAsk: 0,
  }
  const currentRank = rank[current] ?? 0
  const incomingRank = rank[incoming] ?? 0
  return incomingRank > currentRank ? incoming : current
}

function buildResult(state: MergeState): ResolvedPolicy {
  const requireApproval: readonly string[] | boolean =
    state.requireApproval === true
      ? true
      : Array.from(state.requireApproval)

  return {
    blockedCommands: Array.from(state.blockedCommands),
    requireApproval,
    maxTimeout: state.maxTimeout,
    maxFileSize: state.maxFileSize,
    maxBudgetUsd: state.maxBudgetUsd,
    permissionMode: state.permissionMode,
    sources: state.sources,
  }
}
