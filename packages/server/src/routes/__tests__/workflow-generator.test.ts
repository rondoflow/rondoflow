import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'

// Mock the engine so the route test exercises only validation + delegation —
// no Claude CLI is spawned. `generate` is a hoisted spy we drive per test.
const { generate } = vi.hoisted(() => ({ generate: vi.fn() }))
vi.mock('../../engine/workflow-generator', () => ({
  WorkflowGenerator: class {
    generate = generate
  },
}))

import { workflowGeneratorRoutes } from '../workflow-generator'

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify()
  await app.register(workflowGeneratorRoutes)
  await app.ready()
  return app
}

const post = (app: FastifyInstance, body: unknown) =>
  app.inject({ method: 'POST', url: '/api/workflows/generate', payload: body as object })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/workflows/generate', () => {
  it('returns the generated workflow for a valid description', async () => {
    const workflow = { name: 'X', agents: [], edges: [], directorEnabled: false }
    generate.mockResolvedValue(workflow)
    const app = await buildApp()

    const res = await post(app, { description: 'build a REST API with tests' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ success: true, data: workflow })
    expect(generate).toHaveBeenCalledWith('build a REST API with tests')
    await app.close()
  })

  it('rejects a too-short description with 400 and never calls the generator', async () => {
    const app = await buildApp()

    const res = await post(app, { description: 'short' })

    expect(res.statusCode).toBe(400)
    expect(res.json().success).toBe(false)
    expect(generate).not.toHaveBeenCalled()
    await app.close()
  })

  it('rejects a missing description with 400', async () => {
    const app = await buildApp()

    const res = await post(app, {})

    expect(res.statusCode).toBe(400)
    expect(generate).not.toHaveBeenCalled()
    await app.close()
  })

  it('rejects a description longer than 1000 characters with 400', async () => {
    const app = await buildApp()

    const res = await post(app, { description: 'a'.repeat(1001) })

    expect(res.statusCode).toBe(400)
    expect(generate).not.toHaveBeenCalled()
    await app.close()
  })

  it('returns 500 with the error message when the generator throws', async () => {
    generate.mockRejectedValue(new Error('Claude CLI returned empty output'))
    const app = await buildApp()

    const res = await post(app, { description: 'a perfectly valid description' })

    expect(res.statusCode).toBe(500)
    expect(res.json()).toMatchObject({ success: false, error: 'Claude CLI returned empty output' })
    await app.close()
  })
})
