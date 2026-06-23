import { describe, it, expect, vi, afterEach } from 'vitest'
import type { FastifyReply } from 'fastify'
import { z } from 'zod'
import {
  AppError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
  formatZodError,
  sendError,
  sendSuccess,
} from '../errors'

// A chainable fake reply that records the last status + sent body, and exposes a
// log.error spy (sendError logs unclassified errors before responding).
function makeReply() {
  const reply = {
    statusCode: undefined as number | undefined,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    send(payload: unknown) {
      this.body = payload
      return this
    },
    log: { error: vi.fn() },
  }
  return reply
}

type FakeReply = ReturnType<typeof makeReply>
const asReply = (r: FakeReply) => r as unknown as FastifyReply

function zodErrorFrom(parse: () => unknown): z.ZodError {
  try {
    parse()
    throw new Error('expected a ZodError')
  } catch (e) {
    return e as z.ZodError
  }
}

describe('error classes', () => {
  it('AppError defaults to 500 and carries no code', () => {
    const e = new AppError('boom')
    expect(e).toBeInstanceOf(Error)
    expect(e.statusCode).toBe(500)
    expect(e.code).toBeUndefined()
    expect(e.message).toBe('boom')
  })

  it('NotFoundError → 404 / NOT_FOUND with a formatted message', () => {
    const e = new NotFoundError('Agent', 'abc')
    expect(e).toBeInstanceOf(AppError)
    expect(e.statusCode).toBe(404)
    expect(e.code).toBe('NOT_FOUND')
    expect(e.message).toBe("Agent with id 'abc' not found")
  })

  it('ValidationError → 400 / VALIDATION_ERROR', () => {
    const e = new ValidationError('bad input')
    expect(e.statusCode).toBe(400)
    expect(e.code).toBe('VALIDATION_ERROR')
    expect(e.message).toBe('bad input')
  })

  it('ForbiddenError → 403 / FORBIDDEN with a default and custom message', () => {
    expect(new ForbiddenError().statusCode).toBe(403)
    expect(new ForbiddenError().code).toBe('FORBIDDEN')
    expect(new ForbiddenError().message).toBe('You do not have permission to perform this action')
    expect(new ForbiddenError('nope').message).toBe('nope')
  })
})

describe('formatZodError', () => {
  it('joins field path and message', () => {
    const err = zodErrorFrom(() =>
      z.object({ name: z.string(), age: z.number() }).parse({ name: 1, age: 'x' }),
    )
    const msg = formatZodError(err)
    expect(msg).toContain('name:')
    expect(msg).toContain('age:')
    expect(msg).toContain('; ')
  })

  it('joins nested paths with dots', () => {
    const err = zodErrorFrom(() =>
      z.object({ a: z.object({ b: z.string() }) }).parse({ a: { b: 1 } }),
    )
    expect(formatZodError(err).startsWith('a.b:')).toBe(true)
  })
})

describe('sendError', () => {
  it('renders an AppError with its status + envelope', () => {
    const reply = makeReply()
    sendError(asReply(reply), new ForbiddenError())
    expect(reply.statusCode).toBe(403)
    expect(reply.body).toEqual({
      success: false,
      error: 'You do not have permission to perform this action',
    })
  })

  it('renders a ZodError as 400 with the formatted message', () => {
    const reply = makeReply()
    const err = zodErrorFrom(() => z.object({ name: z.string() }).parse({ name: 1 }))
    sendError(asReply(reply), err)
    expect(reply.statusCode).toBe(400)
    expect((reply.body as { error: string }).error).toBe(formatZodError(err))
  })

  it('preserves a 4xx status on a non-AppError Error and exposes its message', () => {
    const reply = makeReply()
    const err = Object.assign(new Error('too many requests'), { statusCode: 429 })
    sendError(asReply(reply), err)
    expect(reply.statusCode).toBe(429)
    expect(reply.body).toEqual({ success: false, error: 'too many requests' })
  })

  it('preserves a 4xx status on a plain object but hides its (non-Error) message', () => {
    const reply = makeReply()
    sendError(asReply(reply), { statusCode: 404, message: 'secret detail' })
    expect(reply.statusCode).toBe(404)
    expect(reply.body).toEqual({ success: false, error: 'Request rejected' })
  })

  it('does not treat a 5xx statusCode as a client passthrough', () => {
    const reply = makeReply()
    sendError(asReply(reply), { statusCode: 503, message: 'upstream down' })
    // Falls through to the unclassified branch → 500 + generic message.
    expect(reply.statusCode).toBe(500)
  })

  describe('unclassified errors', () => {
    const original = process.env.NODE_ENV
    afterEach(() => {
      process.env.NODE_ENV = original
    })

    it('logs and returns the real message outside production', () => {
      process.env.NODE_ENV = 'development'
      const reply = makeReply()
      sendError(asReply(reply), new Error('kaboom'))
      expect(reply.statusCode).toBe(500)
      expect(reply.body).toEqual({ success: false, error: 'kaboom' })
      expect(reply.log.error).toHaveBeenCalledOnce()
    })

    it('masks the message in production', () => {
      process.env.NODE_ENV = 'production'
      const reply = makeReply()
      sendError(asReply(reply), new Error('leaky prisma detail'))
      expect(reply.statusCode).toBe(500)
      expect(reply.body).toEqual({ success: false, error: 'Internal server error' })
      expect(reply.log.error).toHaveBeenCalledOnce()
    })

    it('masks the message for a non-Error value', () => {
      process.env.NODE_ENV = 'development'
      const reply = makeReply()
      sendError(asReply(reply), 'just a string')
      expect(reply.statusCode).toBe(500)
      expect(reply.body).toEqual({ success: false, error: 'Internal server error' })
    })
  })
})

describe('sendSuccess', () => {
  it('wraps data in the success envelope with a default 200', () => {
    const reply = makeReply()
    sendSuccess(asReply(reply), { hello: 'world' })
    expect(reply.statusCode).toBe(200)
    expect(reply.body).toEqual({ success: true, data: { hello: 'world' } })
  })

  it('honors an explicit status code', () => {
    const reply = makeReply()
    sendSuccess(asReply(reply), { id: 1 }, 201)
    expect(reply.statusCode).toBe(201)
    expect(reply.body).toEqual({ success: true, data: { id: 1 } })
  })
})
