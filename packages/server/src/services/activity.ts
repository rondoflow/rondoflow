import { prisma } from '../lib/prisma'

export interface ActivityInput {
  readonly userId?: string
  readonly workspaceId?: string
  readonly agentId?: string
  readonly type: string
  readonly title: string
  readonly detail?: string
  readonly metadata?: Record<string, unknown>
}

export async function recordActivity(input: ActivityInput): Promise<void> {
  try {
    await prisma.activityEvent.create({
      data: {
        userId: input.userId,
        workspaceId: input.workspaceId,
        agentId: input.agentId,
        type: input.type,
        title: input.title,
        detail: input.detail,
        metadata: input.metadata as object | undefined,
      },
    })
  } catch {
    // Activity recording is best-effort — never fail the caller
  }
}
