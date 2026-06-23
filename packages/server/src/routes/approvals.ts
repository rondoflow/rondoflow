import type { FastifyInstance } from 'fastify'
import { sendSuccess, sendError, NotFoundError } from '../lib/errors'
import type { ApprovalManager } from '../engine/approval-manager'
import { recordActivity } from '../services/activity'

export function approvalRoutes(approvalManager: ApprovalManager) {
  return async function routes(app: FastifyInstance) {
    // GET /api/approvals — list all pending approvals
    app.get('/api/approvals', async (_req, reply) => {
      try {
        const approvals = approvalManager.getPending()
        sendSuccess(reply, approvals)
      } catch (error) {
        sendError(reply, error)
      }
    })

    // GET /api/approvals/count — pending count for notification badge
    app.get('/api/approvals/count', async (_req, reply) => {
      try {
        const count = approvalManager.getPendingCount()
        sendSuccess(reply, { count })
      } catch (error) {
        sendError(reply, error)
      }
    })

    // POST /api/approvals/:id/approve
    app.post<{ Params: { id: string } }>('/api/approvals/:id/approve', async (req, reply) => {
      try {
        const approval = approvalManager.approve(req.params.id)
        if (!approval) throw new NotFoundError('Approval', req.params.id)
        void recordActivity({
          userId: req.user?.id,
          agentId: approval.agentId,
          type: 'approval_granted',
          title: `Approved ${approval.toolName}`,
          detail: approval.command,
          metadata: { approvalId: approval.id, sessionId: approval.sessionId },
        })
        sendSuccess(reply, { approved: true, approval })
      } catch (error) {
        sendError(reply, error)
      }
    })

    // POST /api/approvals/:id/reject
    app.post<{ Params: { id: string } }>('/api/approvals/:id/reject', async (req, reply) => {
      try {
        const approval = approvalManager.reject(req.params.id)
        if (!approval) throw new NotFoundError('Approval', req.params.id)
        void recordActivity({
          userId: req.user?.id,
          agentId: approval.agentId,
          type: 'approval_denied',
          title: `Denied ${approval.toolName}`,
          detail: approval.command,
          metadata: { approvalId: approval.id, sessionId: approval.sessionId },
        })
        sendSuccess(reply, { rejected: true, approval })
      } catch (error) {
        sendError(reply, error)
      }
    })
  }
}
