import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { Server } from 'socket.io'
import { createServer } from 'http'
import type { ClientToServerEvents, ServerToClientEvents } from '@rondoflow/shared'
import { NETWORK, LIMITS } from '@rondoflow/shared'
import { checkPrerequisites } from './lib/prerequisites'
import { agentRoutes } from './routes/agents'
import { skillRoutes } from './routes/skills'
import { policyRoutes } from './routes/policies'
import { sessionRoutes } from './routes/sessions'
import { discussionRoutes } from './routes/discussions'
import { canvasRoutes } from './routes/canvas'
import { canvasTransferRoutes } from './routes/canvas-transfer'
import { approvalRoutes } from './routes/approvals'
import { mcpServerRoutes } from './routes/mcp-servers'
import { loopRoutes, activeLoops, activeChains, activePipelines } from './routes/loops'
import { resourceRoutes } from './routes/resources'
import { externalFolderRoutes } from './routes/external-folders'
import { activityRoutes } from './routes/activity'
import { memoryRoutes } from './routes/memories'
import { workspaceMemoryRoutes } from './routes/workspace-memories'
import { analyticsRoutes } from './routes/analytics'
import { runRoutes } from './routes/runs'
import { datasetRoutes } from './routes/datasets'
import { authRoutes } from './routes/auth'
import { gitRoutes } from './routes/git'
import { filesystemRoutes } from './routes/filesystem'
import { emailRoutes } from './routes/email'
import { workflowGeneratorRoutes } from './routes/workflow-generator'
import { savedWorkflowRoutes } from './routes/saved-workflows'
import { scheduleRoutes } from './routes/schedules'
import { settingsRoutes } from './routes/settings'
import { claudeRoutes } from './routes/claude'
import { userRoutes } from './routes/users'
import { Scheduler } from './engine/scheduler'
import { registerAuthMiddleware } from './auth/middleware'
import { getAuth, initAuth } from './auth/auth'
import { loadSettingsIntoEnv } from './services/settings'
import { fromNodeHeaders } from 'better-auth/node'
import { ProcessManager } from './engine/process-manager'
import { ApprovalManager } from './engine/approval-manager'
import { registerSocketHandlers, emitToAgentOwner, scheduleUserTeardown, cancelUserTeardown } from './socket/handlers'
import { allRuns, teardownRuns } from './engine/run-registry'
import { ensureSkillsDirectory } from './skills/installer'
import { sendError } from './lib/errors'

const PORT = parseInt(process.env.PORT ?? String(NETWORK.DEFAULT_SERVER_PORT), 10)
const UI_ORIGIN = process.env.UI_ORIGIN ?? NETWORK.DEFAULT_UI_ORIGIN

async function main() {
  const processManager = new ProcessManager()
  const approvalManager = new ApprovalManager()

  // Ensure ~/.rondoflow/skills/ exists before anything else touches the filesystem
  await ensureSkillsDirectory()

  // Catalog skills are installed lazily — a skill is materialized (DB row +
  // SKILL.md on disk) only the first time it is attached or imported, not
  // eagerly at boot. With thousands of catalog skills an eager install would
  // mean thousands of DB upserts + file writes on every startup. Browsing the
  // catalog reads the in-memory SKILL_CATALOG, and the run path falls back to
  // it by name (see prompt-builder), so nothing depends on a boot-time install.

  // [G2] Prerequisites validation
  const prereqs = await checkPrerequisites()
  if (!prereqs.allPassed) {
    console.error('\n Prerequisites check failed:')
    for (const failure of prereqs.failures) {
      console.error(`  x ${failure.name}: ${failure.message}`)
      if (failure.fix) {
        console.error(`    -> Fix: ${failure.fix}`)
      }
    }
    if (prereqs.critical) {
      console.error('\nCritical prerequisites missing. Cannot start.')
      process.exit(1)
    }
    console.warn('\nStarting with warnings...\n')
  }

  // Create a raw HTTP server so Socket.IO can attach to it before Fastify starts
  const httpServer = createServer()

  const app = Fastify({ logger: true, serverFactory: (handler) => {
    httpServer.on('request', handler)
    return httpServer
  }})

  await app.register(cors, {
    origin: UI_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  await app.register(multipart, {
    limits: {
      fileSize: LIMITS.MAX_FILE_SIZE_BYTES,
    },
  })

  // Rate limiting — registered before any routes so the global hook protects
  // them all (including /api/auth/*, which bypasses the auth middleware). Keyed
  // by client IP. Generous global ceiling so the polling UI is unaffected;
  // expensive/abuse-prone routes (auth, workflow generation) set tighter
  // per-route limits via `config.rateLimit`.
  await app.register(rateLimit, {
    global: true,
    max: 5000,
    timeWindow: '1 minute',
    // Carry statusCode on the thrown value so the global error handler
    // (sendError) preserves the 429 instead of masking it as a 500.
    errorResponseBuilder: (_req, context) =>
      Object.assign(
        new Error(`Rate limit exceeded — retry in ${Math.ceil(context.ttl / 1000)}s`),
        { statusCode: context.statusCode },
      ),
  })

  // Global error + not-found handlers — guarantee the {success,error} envelope
  // even for uncaught throws, body-parse failures, and unknown paths, so the UI
  // never has to parse Fastify's default error shape. Registered BEFORE the
  // route plugins so every encapsulated child context inherits them (Fastify
  // captures the parent handler at register time).
  app.setErrorHandler((error, _req, reply) => {
    sendError(reply, error)
  })
  app.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({ success: false, error: 'Not found' })
  })

  // Load DB-stored credentials into process.env, then build the auth layer.
  // Order matters: Better Auth reads OAuth provider config from env at build time.
  await loadSettingsIntoEnv()
  initAuth()

  // Auth routes (before middleware so /api/auth/* is accessible)
  await app.register(authRoutes)

  // Auth middleware — validates session on all non-public routes
  await registerAuthMiddleware(app)

  // Routes
  await app.register(agentRoutes)
  await app.register(skillRoutes)
  await app.register(policyRoutes)
  await app.register(sessionRoutes)
  await app.register(discussionRoutes)
  await app.register(canvasRoutes)
  await app.register(canvasTransferRoutes)
  await app.register(approvalRoutes(approvalManager))
  await app.register(mcpServerRoutes)
  await app.register(loopRoutes)
  await app.register(resourceRoutes)
  await app.register(externalFolderRoutes)
  await app.register(activityRoutes)
  await app.register(memoryRoutes)
  await app.register(workspaceMemoryRoutes)
  await app.register(analyticsRoutes)
  await app.register(runRoutes)
  await app.register(datasetRoutes)
  await app.register(gitRoutes)
  await app.register(filesystemRoutes)
  await app.register(emailRoutes)
  await app.register(workflowGeneratorRoutes)
  await app.register(savedWorkflowRoutes)
  await app.register(settingsRoutes)
  await app.register(claudeRoutes)
  await app.register(userRoutes)

  // Health check
  app.get('/api/health', async () => ({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      prerequisites: prereqs,
      engine: {
        runningAgents: processManager.getRunningCount(),
        queuedAgents: processManager.getQueuedCount(),
        pendingApprovals: approvalManager.getPendingCount(),
      },
    },
  }))

  // Socket.IO setup — attach to the raw HTTP server (before Fastify listen)
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: UI_ORIGIN, methods: ['GET', 'POST'], credentials: true },
  })

  // Socket.IO auth middleware — validate session cookie
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie
      if (!cookieHeader) {
        return next(new Error('Authentication required'))
      }
      const session = await getAuth().api.getSession({
        headers: fromNodeHeaders({ cookie: cookieHeader }),
      })
      if (!session) {
        return next(new Error('Invalid session'))
      }
      // Attach user to socket data for downstream use
      ;(socket.data as Record<string, unknown>).user = session.user
      next()
    } catch {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    app.log.info(`Client connected: ${socket.id}`)

    // Join a per-user room so server→client events can be scoped to their owner
    // (see emitScoped in socket/handlers.ts) instead of broadcast to everyone.
    const socketUser = (socket.data as Record<string, unknown>)?.user as { id?: string } | undefined
    if (socketUser?.id) socket.join(`user:${socketUser.id}`)

    // A (re)connection cancels any pending disconnect teardown for this user, so
    // a refresh / new tab / reconnect within the grace window keeps runs alive.
    cancelUserTeardown(socketUser?.id)

    // Emit prerequisites status to the client on connect
    socket.emit('prerequisites' as any, prereqs)

    socket.on('disconnect', () => {
      app.log.info(`Client disconnected: ${socket.id}`)
      // If this was the user's last socket, schedule teardown of their in-flight
      // runs after the grace window (no-op if other tabs remain or if disabled).
      scheduleUserTeardown(io, socketUser?.id)
    })
  })

  // Scheduler — cron-based recurring task execution
  const scheduler = new Scheduler({ io })
  await app.register(scheduleRoutes(scheduler))
  void scheduler.start().catch((err) => app.log.error(err, 'Failed to start scheduler'))

  // Register Claude Code engine socket handlers
  registerSocketHandlers(io, processManager, approvalManager)

  // Watchdog: auto-reject expired approvals every 10 s
  const approvalWatchdog = setInterval(() => {
    const expired = approvalManager.cleanupExpired()
    for (const approval of expired) {
      app.log.warn(
        { approvalId: approval.id, agentId: approval.agentId },
        'Approval timed out — auto-rejected',
      )
      emitToAgentOwner(io, approval.agentId, 'agent:error', {
        agentId: approval.agentId,
        sessionId: approval.sessionId,
        error: 'Approval request expired — no response received within the timeout.',
        type: 'APPROVAL_TIMEOUT',
      })
      emitToAgentOwner(io, approval.agentId, 'agent:status', { agentId: approval.agentId, status: 'idle' })
    }
  }, 10_000)
  approvalWatchdog.unref?.()

  // Graceful shutdown [G6]
  const shutdown = async () => {
    app.log.info('Shutting down gracefully...')
    clearInterval(approvalWatchdog)
    scheduler.stop()
    processManager.stopAll()

    // Stop and finalize EVERY registered in-flight run (agents, loops, chains,
    // discussions) regardless of transport. This is what kills the socket-started
    // chain/loop child processes that processManager.stopAll() can't reach (they
    // spawn directly, bypassing it) and finalizes their DB rows so nothing is
    // left stuck at 'running'. Bounded so a slow DB can't block process.exit.
    await teardownRuns(allRuns(), 'shutdown', { finalizeTimeoutMs: 5_000 })

    // Belt-and-braces for any HTTP-started run not registered in the run registry.
    for (const [, engine] of activeLoops) engine.stop()
    activeLoops.clear()
    for (const [, executor] of activeChains) executor.stop()
    activeChains.clear()
    for (const [, pipeline] of activePipelines) pipeline.stop()
    activePipelines.clear()

    io.close()
    await app.close()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`\nrondoflow server running on http://localhost:${PORT}`)
  console.log(`   Accepting connections from ${UI_ORIGIN}\n`)
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
