import type { FastifyReply } from 'fastify'
import type { ZodError } from 'zod'
import type { ApiResponse } from '@rondoflow/shared'

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN')
  }
}

export function formatZodError(error: ZodError): string {
  return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
}

export function sendError(reply: FastifyReply, error: unknown): void {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      error: error.message,
    } satisfies ApiResponse<never>)
    return
  }

  if (isZodError(error)) {
    reply.status(400).send({
      success: false,
      error: formatZodError(error),
    } satisfies ApiResponse<never>)
    return
  }

  // Errors that already carry a 4xx status (Fastify validation/parse errors,
  // @fastify/rate-limit's 429) are client errors, not server faults — preserve
  // the status and their (safe) message rather than masking them as a 500.
  const statusCode =
    error != null && typeof error === 'object'
      ? (error as { statusCode?: unknown }).statusCode
      : undefined
  if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
    reply.status(statusCode).send({
      success: false,
      error: error instanceof Error ? error.message : 'Request rejected',
    } satisfies ApiResponse<never>)
    return
  }

  // Unclassified error: log the full detail server-side, but never leak internal
  // messages (Prisma table/column names, filesystem paths, stack traces) to the
  // client in production. Local/dev keeps the real message for debugging.
  reply.log.error(error, 'Unhandled error')
  const exposeDetail = process.env.NODE_ENV !== 'production'
  const message = exposeDetail && error instanceof Error ? error.message : 'Internal server error'
  reply.status(500).send({
    success: false,
    error: message,
  } satisfies ApiResponse<never>)
}

function isZodError(error: unknown): error is ZodError {
  return error instanceof Error && error.name === 'ZodError'
}

export function sendSuccess<T>(reply: FastifyReply, data: T, statusCode = 200): void {
  reply.status(statusCode).send({
    success: true,
    data,
  } satisfies ApiResponse<T>)
}
