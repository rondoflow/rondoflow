// Manages pending human-approval requests for tool invocations.
// All state is in-process; persistence is not required because approvals
// are ephemeral — they expire when unanswered within the timeout window.

import { randomUUID } from 'crypto'

export interface PendingApproval {
  readonly id: string
  readonly agentId: string
  readonly sessionId: string
  readonly command: string
  readonly description: string
  readonly toolName: string
  readonly toolInput: unknown
  readonly createdAt: Date
  readonly timeoutMs: number
}

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1_000  // 5 minutes

export class ApprovalManager {
  private readonly pending = new Map<string, PendingApproval>()

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Register a new pending approval and return the generated approval ID.
   */
  requestApproval(data: Omit<PendingApproval, 'id' | 'createdAt'>): string {
    const id = randomUUID()
    const approval: PendingApproval = {
      ...data,
      id,
      createdAt: new Date(),
      timeoutMs: data.timeoutMs > 0 ? data.timeoutMs : DEFAULT_TIMEOUT_MS,
    }
    this.pending.set(id, approval)
    return id
  }

  /**
   * Approve a pending request.
   * Returns the approval record if it existed (and removes it), null otherwise.
   */
  approve(approvalId: string): PendingApproval | null {
    return this.consume(approvalId)
  }

  /**
   * Reject a pending request.
   * Returns the approval record if it existed (and removes it), null otherwise.
   */
  reject(approvalId: string): PendingApproval | null {
    return this.consume(approvalId)
  }

  /**
   * Retrieve all pending approvals, optionally filtered by agentId.
   */
  getPending(agentId?: string): PendingApproval[] {
    const all = Array.from(this.pending.values())
    if (agentId === undefined) return all
    return all.filter((a) => a.agentId === agentId)
  }

  /**
   * Count of all pending approvals across all agents.
   * Used for UI notification badge.
   */
  getPendingCount(): number {
    return this.pending.size
  }

  /**
   * Remove and return all approvals that have exceeded their timeout.
   * Intended to be called by the watchdog interval (e.g., every 10 s).
   */
  cleanupExpired(): PendingApproval[] {
    const now = Date.now()
    const expired: PendingApproval[] = []

    for (const [id, approval] of this.pending) {
      const elapsedMs = now - approval.createdAt.getTime()
      if (elapsedMs >= approval.timeoutMs) {
        expired.push(approval)
        this.pending.delete(id)
      }
    }

    return expired
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private consume(approvalId: string): PendingApproval | null {
    const approval = this.pending.get(approvalId) ?? null
    if (approval !== null) {
      this.pending.delete(approvalId)
    }
    return approval
  }
}
