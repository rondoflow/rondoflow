import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents, TokenUsage, ResolvedPolicy, AgentMode, ChainApprovalMode, UserRole } from '@rondoflow/shared'
import { hasMinRole, normalizeRole, ANTHROPIC, TIMEOUTS } from '@rondoflow/shared'
import { prisma } from '../lib/prisma'
import { ProcessManager } from '../engine/process-manager'
import { buildSpawnConfig } from '../engine/prompt-builder'
import { classifyError } from '../engine/error-types'
import { resolvePolicy } from '../engine/policy-resolver'
import { checkToolUse } from '../engine/policy-checker'
import { ApprovalManager } from '../engine/approval-manager'
import { ModeratorEngine } from '../discussion/moderator'
import type { AgentRecord } from '../discussion/moderator'
import { activeDiscussionEngines as activeDiscussions } from '../discussion/registry'
import type { ParticipantRole, DiscussionFormat } from '@rondoflow/shared'
import { LoopEngine } from '../engine/loop-engine'
import { ChainExecutor } from '../engine/chain-executor'
import { WorkflowAdvisor } from '../engine/advisor'
import { Planner } from '../engine/planner'
import type { PlannerAgent } from '../engine/planner'
import { SKILL_CATALOG } from '@rondoflow/catalog'
import { recordActivity } from '../services/activity'
import { registerRun, deregisterRun, runsForUser, teardownRuns } from '../engine/run-registry'
import { extractMemoriesForSession, extractMemoriesForChain } from '../engine/memory-extractor'
import type { ChainDefinition as ChainDefinitionPayload } from '@rondoflow/shared'
import type { ChainDefinition } from '../engine/chain-executor'

// Tracks the active sessionId per agentId so we can emit back on the right channel
const agentSessionMap = new Map<string, string>()

// Tracks the resolved policy per agentId for the duration of a run
const agentPolicyMap = new Map<string, ResolvedPolicy>()

// Tracks the userId per agentId so callbacks can record activity with the correct user
const agentUserMap = new Map<string, string>()

// Tracks the pending approval id per agentId (at most one at a time)
const agentApprovalMap = new Map<string, string>()

// Tracks per-run metadata (workspace + model) per agentId so the completion
// callback can attribute token usage to the right workspace/model. Set at start,
// read+cleared on completion. Overwritten on each new run of the same agent.
const agentRunMetaMap = new Map<string, { workspaceId?: string; model?: string }>()

// Active ModeratorEngine instances are tracked in the shared discussion registry
// (imported above as `activeDiscussions`) so the HTTP routes see the same engines.

// Tracks active LoopEngine instances by agentId
const socketActiveLoops = new Map<string, LoopEngine>()

// Tracks active ChainExecutor instances by chainId
const socketActiveChains = new Map<string, ChainExecutor>()

// Monotonic per-chain sequence counter for the persisted ChainRunEvent log.
// Keyed by chainId; cleared when the run ends so memory does not grow.
const chainEventSeq = new Map<string, number>()

/**
 * Append one log-relevant event to the persisted ChainRunEvent transcript so the
 * execution log can be replayed after a refresh. Fire-and-forget (non-fatal): a
 * failed write only loses replay fidelity for that event, never breaks the run.
 */
function persistChainEvent(
  chainId: string,
  type: string,
  fields: { stepIndex?: number; agentId?: string; agentName?: string; payload?: unknown } = {},
): void {
  const seq = chainEventSeq.get(chainId) ?? 0
  chainEventSeq.set(chainId, seq + 1)
  prisma.chainRunEvent
    .create({
      data: {
        chainRun: { connect: { chainId } },
        seq,
        type,
        stepIndex: fields.stepIndex ?? null,
        agentId: fields.agentId ?? null,
        agentName: fields.agentName ?? null,
        payload: (fields.payload ?? undefined) as never,
      },
    })
    .catch(() => {})
}

// ──────────────────────────────────────────────────────────────────────────
// User-scoped emit + authorization helpers
//
// Every authenticated socket joins a `user:<id>` room on connect (see index.ts).
// Server→client events are emitted to the owning user's room instead of being
// broadcast to every connected client, so one user never receives another user's
// streamed agent output, tool inputs/outputs, costs, or errors. Client-supplied
// agent ids are also checked for ownership before any run-control handler acts.
// ──────────────────────────────────────────────────────────────────────────

type SocketServer = Server<ClientToServerEvents, ServerToClientEvents>
type ClientSocket = Socket<ClientToServerEvents, ServerToClientEvents>

function roomForUser(userId: string | null | undefined): string | null {
  return userId ? `user:${userId}` : null
}

function socketUserId(socket: ClientSocket): string | undefined {
  const user = (socket.data as Record<string, unknown>)?.user as { id?: string } | undefined
  return user?.id
}

/** Effective global role of the socket's user, fail-closed to viewer. */
function socketRole(socket: ClientSocket): UserRole {
  const user = (socket.data as Record<string, unknown>)?.user as { role?: string | null } | undefined
  return normalizeRole(user?.role)
}

/**
 * Gate run/mutate socket actions by role: viewers are read-only and may not
 * start, stop, or modify any run. Emits a POLICY_ERROR and resolves false on
 * denial; resolves true for editor/admin. Use at the top of run-control handlers
 * that emit before reaching {@link ensureAgentsAccessible}.
 */
function ensureCanRun(socket: ClientSocket, refId: string): boolean {
  if (hasMinRole(socketRole(socket), 'editor')) return true
  socket.emit('agent:error', {
    agentId: refId,
    sessionId: '',
    error: 'Your role does not permit running or modifying workflows',
    type: 'POLICY_ERROR',
  })
  return false
}

function socketRoom(socket: ClientSocket): string | null {
  return roomForUser(socketUserId(socket))
}

/** The owning user's room for an in-flight agent run (resolved from agentUserMap). */
function roomForAgent(agentId: string): string | null {
  return roomForUser(agentUserMap.get(agentId) || null)
}

/**
 * Emit a server→client event to a single user's room instead of broadcasting to
 * every connected client. Falls back to a global broadcast only when the owner
 * is unknown (should not happen for socket-initiated runs, which always populate
 * agentUserMap / socket.data.user) so functionality is never silently dropped.
 */
function emitScoped<E extends keyof ServerToClientEvents>(
  io: SocketServer,
  room: string | null,
  event: E,
  payload: Parameters<ServerToClientEvents[E]>[0],
): void {
  const target = room ? io.to(room) : io
  ;(target.emit as (e: E, p: Parameters<ServerToClientEvents[E]>[0]) => void)(event, payload)
}

/** Emit to the user that owns a given agent run. Exported for the approval watchdog. */
export function emitToAgentOwner<E extends keyof ServerToClientEvents>(
  io: SocketServer,
  agentId: string,
  event: E,
  payload: Parameters<ServerToClientEvents[E]>[0],
): void {
  emitScoped(io, roomForAgent(agentId), event, payload)
}

// ──────────────────────────────────────────────────────────────────────────
// Disconnect teardown (last-socket + grace period)
//
// Runs are owned by a userId, not a socket, and a user may have several tabs
// open. We tear a user's runs down only once ALL their sockets are gone, and
// only after a grace window — so a refresh, a new tab, or a transient reconnect
// (Socket.IO auto-reconnects) never kills an expensive in-flight run. Default
// ON; disable with RONDOFLOW_TEARDOWN_ON_DISCONNECT=0.
// ──────────────────────────────────────────────────────────────────────────

const TEARDOWN_ON_DISCONNECT = process.env['RONDOFLOW_TEARDOWN_ON_DISCONNECT'] !== '0'
const TEARDOWN_GRACE_MS = (() => {
  const n = parseInt(process.env['RONDOFLOW_TEARDOWN_GRACE_MS'] ?? '', 10)
  return Number.isNaN(n) || n < 0 ? TIMEOUTS.TEARDOWN_GRACE_DEFAULT_MS : n
})()

// Pending per-user teardown timers, keyed by userId.
const pendingTeardowns = new Map<string, ReturnType<typeof setTimeout>>()

function userSocketCount(io: SocketServer, userId: string): number {
  return io.sockets.adapter.rooms.get(`user:${userId}`)?.size ?? 0
}

/**
 * On a socket disconnect: if it was the user's LAST socket, schedule teardown of
 * their in-flight runs after the grace window. Cancelled if any socket for the
 * user (re)connects first. Exported for the connection/disconnect wiring in index.ts.
 */
export function scheduleUserTeardown(io: SocketServer, userId: string | undefined): void {
  if (!TEARDOWN_ON_DISCONNECT || !userId) return
  // The disconnecting socket has already left its rooms by the time the
  // 'disconnect' event fires, so a count of 0 means no tabs remain for the user.
  if (userSocketCount(io, userId) > 0) return

  const existing = pendingTeardowns.get(userId)
  if (existing) clearTimeout(existing)

  const timer = setTimeout(() => {
    pendingTeardowns.delete(userId)
    // Re-check: a reconnect during the grace window cancels teardown; this also
    // guards the race where a socket connected just before the timer fired.
    if (userSocketCount(io, userId) > 0) return
    const owned = runsForUser(userId)
    if (owned.length === 0) return
    void teardownRuns(owned, 'disconnect')
  }, TEARDOWN_GRACE_MS)
  timer.unref?.()
  pendingTeardowns.set(userId, timer)
}

/** On a (re)connection: cancel any pending teardown for the user. */
export function cancelUserTeardown(userId: string | undefined): void {
  if (!userId) return
  const existing = pendingTeardowns.get(userId)
  if (existing) {
    clearTimeout(existing)
    pendingTeardowns.delete(userId)
  }
}

/**
 * Gate every run/mutate handler that operates on agents. In the shared team
 * pool any editor/admin may operate on any agent — but viewers are read-only
 * and denied (a POLICY_ERROR), and a missing agent id is rejected. This is the
 * universal chokepoint for agent:start/stop/message/set_mode, approval:respond,
 * loop:*, chain:execute, and (via {@link ensureDiscussionAccessible}) discussions.
 */
async function ensureAgentsAccessible(
  socket: ClientSocket,
  agentIds: readonly string[],
): Promise<boolean> {
  if (!hasMinRole(socketRole(socket), 'editor')) {
    socket.emit('agent:error', {
      agentId: agentIds[0] ?? '',
      sessionId: '',
      error: 'Your role does not permit running or modifying workflows',
      type: 'POLICY_ERROR',
    })
    return false
  }
  const ids = [...new Set(agentIds)]
  const agents = await prisma.agent.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  })
  const found = new Set(agents.map((a) => a.id))
  const missing = ids.find((id) => !found.has(id))
  if (missing !== undefined) {
    socket.emit('agent:error', {
      agentId: missing,
      sessionId: '',
      error: 'Agent not found',
      type: 'PROCESS_ERROR',
    })
    return false
  }
  return true
}

/**
 * Authorize discussion access by the agents a table drives. DiscussionTable has
 * no userId of its own — ownership flows through the moderator and participant
 * agents — so a user may start/pause/resume a table only if they can access all
 * of those agents. Emits an error to the socket and resolves false on denial.
 */
async function ensureDiscussionAccessible(socket: ClientSocket, tableId: string): Promise<boolean> {
  const table = await prisma.discussionTable.findUnique({
    where: { id: tableId },
    select: { moderatorId: true, participants: { select: { agentId: true } } },
  })
  if (!table) {
    socket.emit('agent:error', {
      agentId: tableId,
      sessionId: '',
      error: `Discussion table ${tableId} not found`,
      type: 'PROCESS_ERROR',
    })
    return false
  }
  return ensureAgentsAccessible(socket, [table.moderatorId, ...table.participants.map((p) => p.agentId)])
}

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  processManager: ProcessManager,
  approvalManager: ApprovalManager,
): void {
  // ------------------------------------------------------------------
  // Wire ProcessManager callbacks → emit to the owning user's room only
  // ------------------------------------------------------------------
  processManager.setCallbacks({
    onText(agentId, sessionId, data) {
      const payload = data as { content: string; partial: boolean }
      emitScoped(io, roomForAgent(agentId), 'agent:text', {
        agentId,
        sessionId,
        content: payload.content,
        partial: payload.partial,
      })
      // Persist partial=false messages to DB (complete text blocks)
      if (!payload.partial) {
        void saveMessage(sessionId, 'assistant', payload.content, null, data)
      }
    },

    onToolUse(agentId, sessionId, data) {
      const payload = data as { toolName: string; input: unknown; id: string }
      const resolvedPolicy = agentPolicyMap.get(agentId)

      if (resolvedPolicy) {
        const result = checkToolUse(payload.toolName, payload.input, resolvedPolicy)

        if (!result.allowed) {
          // Blocked — emit an error and stop the agent
          emitScoped(io, roomForAgent(agentId), 'agent:error', {
            agentId,
            sessionId,
            error: result.reason ?? 'Tool blocked by policy',
            type: 'POLICY_ERROR',
          })
          emitScoped(io, roomForAgent(agentId), 'agent:status', { agentId, status: 'error' })

          processManager.stopAgent(agentId)
          agentSessionMap.delete(agentId)
          agentPolicyMap.delete(agentId)
          agentUserMap.delete(agentId)
          deregisterRun('agent', agentId)

          void Promise.all([
            prisma.agent.update({ where: { id: agentId }, data: { status: 'error' } }),
            prisma.agentSession.update({ where: { id: sessionId }, data: { endedAt: new Date() } }),
          ]).catch(() => { /* best-effort */ })

          return
        }

        if (result.requiresApproval) {
          // Pause the agent and request human approval
          const commandStr = extractCommandDisplay(payload.toolName, payload.input)

          const approvalId = approvalManager.requestApproval({
            agentId,
            sessionId,
            command: commandStr,
            description: `Tool "${payload.toolName}" requires approval: ${result.reason ?? ''}`,
            toolName: payload.toolName,
            toolInput: payload.input,
            timeoutMs: TIMEOUTS.APPROVAL_DEFAULT_MS,
          })

          agentApprovalMap.set(agentId, approvalId)

          emitScoped(io, roomForAgent(agentId), 'agent:approval', {
            agentId,
            sessionId,
            command: commandStr,
            description: `Tool "${payload.toolName}" requires approval`,
          })

          emitScoped(io, roomForAgent(agentId), 'agent:status', { agentId, status: 'waiting_approval' })

          void prisma.agent
            .update({ where: { id: agentId }, data: { status: 'waiting_approval' } })
            .catch(() => { /* best-effort */ })

          // Record the tool_use event regardless
          void saveMessage(sessionId, 'tool', `tool_use: ${payload.toolName}`, {
            toolName: payload.toolName,
            input: payload.input,
            output: null,
          }, data)

          return
        }
      }

      // Allowed — forward to UI as normal
      emitScoped(io, roomForAgent(agentId), 'agent:tool_use', {
        agentId,
        sessionId,
        toolName: payload.toolName,
        input: payload.input,
      })
      void saveMessage(sessionId, 'tool', `tool_use: ${payload.toolName}`, {
        toolName: payload.toolName,
        input: payload.input,
        output: null,
      }, data)
    },

    onToolResult(agentId, sessionId, data) {
      const payload = data as { toolName: string; output: unknown; toolUseId: string }
      emitScoped(io, roomForAgent(agentId), 'agent:tool_result', {
        agentId,
        sessionId,
        toolName: payload.toolName,
        output: payload.output,
      })
      void saveMessage(sessionId, 'tool', `tool_result: ${payload.toolName}`, {
        toolName: payload.toolName,
        input: null,
        output: payload.output,
      }, data)
    },

    onCompletion(agentId, sessionId, exitCode, usage) {
      const tokenUsage: TokenUsage = usage ?? {
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
      }

      emitScoped(io, roomForAgent(agentId), 'agent:done', { agentId, sessionId, usage: tokenUsage })

      const runMeta = agentRunMetaMap.get(agentId)

      // Persistent cross-session memory: distill durable facts from this run.
      // Best-effort, off the critical path, success runs only.
      if ((exitCode ?? 0) === 0) {
        void extractMemoriesForSession({
          agentId,
          sessionId,
          workspaceId: runMeta?.workspaceId,
        }).catch(() => { /* never fails the run */ })
      }

      void recordActivity({
        userId: agentUserMap.get(agentId),
        agentId,
        workspaceId: runMeta?.workspaceId,
        type: 'agent_completed',
        title: 'Assistant completed',
        metadata: { sessionId, usage: tokenUsage },
      })

      // Persist usage for analytics (cost + per-workspace/model breakdowns).
      if (
        tokenUsage.inputTokens > 0 ||
        tokenUsage.outputTokens > 0 ||
        tokenUsage.estimatedCostUsd > 0
      ) {
        void prisma.sessionUsage
          .create({
            data: {
              sessionId,
              agentId,
              workspaceId: runMeta?.workspaceId ?? null,
              model: runMeta?.model ?? null,
              inputTokens: tokenUsage.inputTokens,
              outputTokens: tokenUsage.outputTokens,
              costUsd: tokenUsage.estimatedCostUsd,
            },
          })
          .catch(() => { /* best-effort — analytics recording never fails the run */ })
      }

      agentSessionMap.delete(agentId)
      agentPolicyMap.delete(agentId)
      agentApprovalMap.delete(agentId)
      agentUserMap.delete(agentId)
      agentRunMetaMap.delete(agentId)
      deregisterRun('agent', agentId)

      // Update agent status and close the session
      void Promise.all([
        prisma.agent.update({
          where: { id: agentId },
          data: { status: 'idle' },
        }),
        prisma.agentSession.update({
          where: { id: sessionId },
          data: { endedAt: new Date() },
        }),
      ]).catch(() => { /* best-effort */ })
    },

    onError(agentId, sessionId, err) {
      const classified = classifyError(err, agentId, sessionId)

      void recordActivity({
        userId: agentUserMap.get(agentId),
        agentId,
        workspaceId: agentRunMetaMap.get(agentId)?.workspaceId,
        type: 'agent_error',
        title: 'Assistant error',
        detail: classified.userMessage,
        metadata: { sessionId, errorType: classified.type },
      })

      // Resolve the owner room BEFORE clearing agentUserMap below.
      const ownerRoom = roomForAgent(agentId)
      emitScoped(io, ownerRoom, 'agent:error', {
        agentId,
        sessionId,
        error: classified.userMessage,
        type: classified.type,
      })

      emitScoped(io, ownerRoom, 'agent:status', { agentId, status: 'error' })

      agentSessionMap.delete(agentId)
      agentPolicyMap.delete(agentId)
      agentApprovalMap.delete(agentId)
      agentUserMap.delete(agentId)
      agentRunMetaMap.delete(agentId)
      deregisterRun('agent', agentId)

      void Promise.all([
        prisma.agent.update({
          where: { id: agentId },
          data: { status: 'error' },
        }),
        prisma.agentSession.update({
          where: { id: sessionId },
          data: { endedAt: new Date() },
        }),
      ]).catch(() => { /* best-effort */ })
    },
  })

  // ------------------------------------------------------------------
  // Per-socket event handlers
  // ------------------------------------------------------------------
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {

    socket.on('agent:start', (data) => {
      void handleAgentStart(socket, io, processManager, approvalManager, data)
    })

    socket.on('agent:stop', (data) => {
      void handleAgentStop(socket, io, processManager, approvalManager, data)
    })

    socket.on('agent:message', (data) => {
      void handleAgentMessage(socket, processManager, data)
    })

    socket.on('approval:respond', (data) => {
      void (async () => {
        if (!(await ensureAgentsAccessible(socket, [data.agentId]))) return
        await handleApprovalRespond(io, processManager, approvalManager, data)
      })()
    })

    socket.on('discussion:start', (data) => {
      void handleDiscussionStart(socket, io, data)
    })

    socket.on('discussion:pause', (data) => {
      void handleDiscussionPause(socket, io, data)
    })

    socket.on('discussion:resume', (data) => {
      void handleDiscussionResume(socket, io, data)
    })

    socket.on('loop:start', (data: { agentId: string; message: string }) => {
      void handleLoopStart(socket, io, data)
    })

    socket.on('loop:stop', (data: { agentId: string }) => {
      void (async () => {
        if (!(await ensureAgentsAccessible(socket, [data.agentId]))) return
        handleLoopStop(socket, io, data)
      })()
    })

    socket.on('loop:approve', (data: { agentId: string; loopId: string; approved: boolean }) => {
      void (async () => {
        if (!(await ensureAgentsAccessible(socket, [data.agentId]))) return
        handleLoopApprove(socket, data)
      })()
    })

    socket.on('agent:set_mode', (data: { agentId: string; mode: AgentMode }) => {
      void handleAgentSetMode(socket, io, processManager, approvalManager, data)
    })

    socket.on('chain:execute', (data: { chainId?: string; definition: ChainDefinitionPayload; initialMessage: string; workspaceId?: string; director?: boolean; directorRigor?: number; directorCustomInstructions?: string; planner?: boolean; plannerCustomInstructions?: string; approvalMode?: ChainApprovalMode }) => {
      void handleChainExecute(socket, io, data)
    })

    socket.on('chain:stop', (data: { chainId: string }) => {
      handleChainStop(socket, io, data)
    })

    socket.on('chain:director_redirect_response', (data: { chainId: string; requestId: string; approved: boolean }) => {
      if (!ensureCanRun(socket, data.chainId)) return
      handleDirectorRedirectResponse(data)
    })

    socket.on('chain:step_approval_response', (data: { chainId: string; requestId: string; approved: boolean }) => {
      if (!ensureCanRun(socket, data.chainId)) return
      handleStepApprovalResponse(data)
    })

    socket.on('advisor:analyze', (data: { chainId: string; model?: string }) => {
      void handleAdvisorAnalyze(socket, io, data)
    })
  })
}

// ------------------------------------------------------------------
// Handler implementations
// ------------------------------------------------------------------

async function handleAgentStart(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  processManager: ProcessManager,
  approvalManager: ApprovalManager,
  data: { agentId: string; message: string; workspaceId?: string },
): Promise<void> {
  const { agentId, message, workspaceId } = data

  // Authorization: never start a run on an agent the caller doesn't own.
  if (!(await ensureAgentsAccessible(socket, [agentId]))) return

  try {
    // Build the spawn configuration from the DB
    const config = await buildSpawnConfig(agentId, workspaceId)

    // Resolve effective policy for this agent (no session yet — session policies
    // are applied after the Session record is created and passed in future calls)
    const resolvedPolicy = await resolvePolicy(agentId)
    agentPolicyMap.set(agentId, resolvedPolicy)

    // Create a Session record in the DB
    const session = await prisma.agentSession.create({
      data: { agentId },
    })

    const sessionId = session.id
    agentSessionMap.set(agentId, sessionId)

    // Update agent status to running
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: 'running' },
    })

    const userId = socketUserId(socket)
    agentUserMap.set(agentId, userId ?? '')
    agentRunMetaMap.set(agentId, { workspaceId, model: config.model })

    // Register for owner-scoped teardown on disconnect/shutdown. stop() is the
    // same kill handleAgentStop uses (idempotent); finalize mirrors its DB close
    // so a torn-down run isn't left at status 'running'.
    registerRun({
      kind: 'agent',
      key: agentId,
      userId: userId ?? null,
      stop: () => processManager.stopAgent(agentId),
      finalize: async () => {
        await Promise.all([
          prisma.agent.update({ where: { id: agentId }, data: { status: 'idle' } }),
          prisma.agentSession.update({ where: { id: sessionId }, data: { endedAt: new Date() } }),
        ]).catch(() => { /* best-effort */ })
      },
    })

    emitScoped(io, roomForUser(userId), 'agent:status', { agentId, status: 'running' })

    void recordActivity({
      userId,
      agentId,
      workspaceId,
      type: 'agent_started',
      title: 'Assistant started',
      metadata: { sessionId, model: config.model },
    })

    // Persist the user message
    await saveMessage(sessionId, 'user', message, null, null)

    // Start the agent process, honouring policy-derived settings
    await processManager.startAgent({
      agentId,
      sessionId,
      message,
      systemPrompt: config.systemPrompt,
      appendSystemPrompt: config.appendSystemPrompt,
      allowedTools: config.allowedTools,
      model: config.model,
      // Policy overrides config: use the most restrictive permission mode
      permissionMode: mergePermissionModeStrings(config.permissionMode, resolvedPolicy.permissionMode),
      // Policy overrides config: use the minimum budget
      maxBudgetUsd: minDefinedBudget(config.maxBudgetUsd, resolvedPolicy.maxBudgetUsd),
      env: config.env,
      provider: config.provider,
      ...(config.providerConfig ? { providerConfig: config.providerConfig } : {}),
      ...(config.addDirs && config.addDirs.length > 0 ? { addDirs: config.addDirs } : {}),
      // Forward the working directory (workspace dir or attached external folder)
      // so the agent runs inside it and git/relative commands resolve correctly.
      ...(config.cwd ? { cwd: config.cwd } : {}),
      verbose: true,
    })
  } catch (err) {
    const sessionId = agentSessionMap.get(agentId) ?? ''
    const classified = classifyError(err, agentId, sessionId || undefined)

    socket.emit('agent:error', {
      agentId,
      sessionId,
      error: classified.userMessage,
      type: classified.type,
    })

    socket.emit('agent:status', { agentId, status: 'error' })

    agentSessionMap.delete(agentId)
    agentPolicyMap.delete(agentId)
    agentUserMap.delete(agentId)
    deregisterRun('agent', agentId)

    // Best-effort status update
    void prisma.agent.update({
      where: { id: agentId },
      data: { status: 'error' },
    }).catch(() => { /* ignore */ })
  }
}

async function handleAgentStop(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  processManager: ProcessManager,
  approvalManager: ApprovalManager,
  data: { agentId: string },
): Promise<void> {
  const { agentId } = data

  // Authorization: don't let one user stop another user's running agent.
  if (!(await ensureAgentsAccessible(socket, [agentId]))) return

  const sessionId = agentSessionMap.get(agentId) ?? ''

  // Cancel any pending approval for this agent
  const approvalId = agentApprovalMap.get(agentId)
  if (approvalId) {
    approvalManager.reject(approvalId)
    agentApprovalMap.delete(agentId)
  }

  processManager.stopAgent(agentId)
  agentSessionMap.delete(agentId)
  agentPolicyMap.delete(agentId)
  agentUserMap.delete(agentId)
  deregisterRun('agent', agentId)

  emitScoped(io, socketRoom(socket), 'agent:status', { agentId, status: 'idle' })

  void Promise.all([
    prisma.agent.update({
      where: { id: agentId },
      data: { status: 'idle' },
    }),
    sessionId
      ? prisma.agentSession.update({
          where: { id: sessionId },
          data: { endedAt: new Date() },
        })
      : Promise.resolve(),
  ]).catch(() => { /* best-effort */ })
}

async function handleAgentMessage(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  processManager: ProcessManager,
  data: { agentId: string; message: string },
): Promise<void> {
  const { agentId, message } = data

  // Authorization: don't let one user inject input into another user's run.
  if (!(await ensureAgentsAccessible(socket, [agentId]))) return

  try {
    processManager.sendMessage(agentId, message)

    const sessionId = agentSessionMap.get(agentId)
    if (sessionId) {
      void saveMessage(sessionId, 'user', message, null, null)
    }
  } catch (err) {
    const sessionId = agentSessionMap.get(agentId) ?? ''
    const classified = classifyError(err, agentId, sessionId || undefined)
    socket.emit('agent:error', {
      agentId,
      sessionId,
      error: classified.userMessage,
      type: classified.type,
    })
  }
}

async function handleAgentSetMode(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  processManager: ProcessManager,
  approvalManager: ApprovalManager,
  data: { agentId: string; mode: AgentMode },
): Promise<void> {
  const { agentId, mode } = data

  const validModes = new Set<AgentMode>(['plan', 'default', 'edit'])
  if (!validModes.has(mode)) {
    socket.emit('agent:error', {
      agentId,
      sessionId: '',
      error: `Invalid mode: ${mode}`,
      type: 'PROCESS_ERROR',
    })
    return
  }

  // Authorization: setting the mode mutates the agent record in the DB.
  if (!(await ensureAgentsAccessible(socket, [agentId]))) return

  const room = socketRoom(socket)

  try {
    await prisma.agent.update({
      where: { id: agentId },
      data: { permissionMode: mode },
    })

    emitScoped(io, room, 'agent:mode_changed', { agentId, mode })

    // If the agent is currently running, stop and re-start with the new mode
    const sessionId = agentSessionMap.get(agentId)
    if (sessionId) {
      // Cancel any pending approval
      const approvalId = agentApprovalMap.get(agentId)
      if (approvalId) {
        approvalManager.reject(approvalId)
        agentApprovalMap.delete(agentId)
      }

      processManager.stopAgent(agentId)
      agentSessionMap.delete(agentId)
      agentPolicyMap.delete(agentId)
      agentUserMap.delete(agentId)
      deregisterRun('agent', agentId)

      emitScoped(io, room, 'agent:status', { agentId, status: 'idle' })

      void Promise.all([
        prisma.agent.update({
          where: { id: agentId },
          data: { status: 'idle' },
        }),
        prisma.agentSession.update({
          where: { id: sessionId },
          data: { endedAt: new Date() },
        }),
      ]).catch(() => { /* best-effort */ })
    }
  } catch (err) {
    socket.emit('agent:error', {
      agentId,
      sessionId: '',
      error: err instanceof Error ? err.message : 'Failed to update mode',
      type: 'PROCESS_ERROR',
    })
  }
}

async function handleApprovalRespond(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  processManager: ProcessManager,
  approvalManager: ApprovalManager,
  data: { agentId: string; approved: boolean; editedCommand?: string },
): Promise<void> {
  const { agentId, approved, editedCommand } = data
  const approvalId = agentApprovalMap.get(agentId)
  const sessionId = agentSessionMap.get(agentId) ?? ''

  if (!approvalId) {
    // No pending approval for this agent — nothing to do
    return
  }

  agentApprovalMap.delete(agentId)

  if (approved) {
    const approval = approvalManager.approve(approvalId)
    if (!approval) return

    // If the client provided an edited command, send it as a message
    if (editedCommand && editedCommand.trim().length > 0) {
      try {
        processManager.sendMessage(agentId, editedCommand)
      } catch {
        // Agent may have already completed — ignore
      }
    }

    emitScoped(io, roomForAgent(agentId), 'agent:status', { agentId, status: 'running' })

    void prisma.agent
      .update({ where: { id: agentId }, data: { status: 'running' } })
      .catch(() => { /* best-effort */ })
  } else {
    const approval = approvalManager.reject(approvalId)
    if (!approval) return

    // Notify the agent process that the tool was rejected
    try {
      processManager.sendMessage(
        agentId,
        `Tool use of "${approval.toolName}" was rejected by the user.`,
      )
    } catch {
      // Agent may have already completed — ignore
    }

    emitScoped(io, roomForAgent(agentId), 'agent:error', {
      agentId,
      sessionId,
      error: `Tool "${approval.toolName}" was rejected by the user.`,
      type: 'POLICY_ERROR',
    })

    emitScoped(io, roomForAgent(agentId), 'agent:status', { agentId, status: 'idle' })

    void prisma.agent
      .update({ where: { id: agentId }, data: { status: 'idle' } })
      .catch(() => { /* best-effort */ })
  }
}

// ------------------------------------------------------------------
// Discussion handler implementations
// ------------------------------------------------------------------

async function handleDiscussionStart(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  data: { tableId: string },
): Promise<void> {
  const { tableId } = data
  const room = socketRoom(socket)

  // Viewers are read-only — reject before any state lookup/emit.
  if (!ensureCanRun(socket, tableId)) return

  if (activeDiscussions.has(tableId)) {
    socket.emit('agent:error', {
      agentId: tableId,
      sessionId: '',
      error: `Discussion ${tableId} is already running`,
      type: 'RESOURCE_ERROR',
    })
    return
  }

  try {
    const table = await prisma.discussionTable.findUnique({
      where: { id: tableId },
      include: {
        moderator: true,
        participants: { include: { agent: true } },
      },
    })

    if (!table) {
      socket.emit('agent:error', {
        agentId: tableId,
        sessionId: '',
        error: `Discussion table ${tableId} not found`,
        type: 'PROCESS_ERROR',
      })
      return
    }

    if (table.status === 'concluded') {
      socket.emit('agent:error', {
        agentId: tableId,
        sessionId: '',
        error: 'Discussion has already concluded',
        type: 'PROCESS_ERROR',
      })
      return
    }

    if (table.participants.length === 0) {
      socket.emit('agent:error', {
        agentId: tableId,
        sessionId: '',
        error: 'Cannot start discussion: no participants added',
        type: 'PROCESS_ERROR',
      })
      return
    }

    // Authorization: a discussion runs the moderator + participant agents and
    // streams their output — only act if the caller can access all of them.
    // (No activeDiscussions entry exists yet, so there is nothing to clean up.)
    if (!(await ensureAgentsAccessible(socket, [table.moderatorId, ...table.participants.map((p) => p.agentId)]))) return

    const participantsWithRoles = (table.participants as Array<{ agent: AgentRecord; role: string }>).map((p) => ({
      agent: p.agent,
      role: p.role as ParticipantRole,
    }))

    const engine = new ModeratorEngine(
      tableId,
      table.topic,
      table.format as DiscussionFormat,
      table.moderator as AgentRecord,
      participantsWithRoles,
      table.maxRounds,
    )

    // Forward engine events to the initiating user's room
    engine.on('turn', (round) => {
      const participant = participantsWithRoles.find((p: { agent: AgentRecord; role: ParticipantRole }) => p.agent.id === round.participantId)
      emitScoped(io, room, 'discussion:turn', {
        tableId,
        agentName: round.participantName,
        role: participant?.role ?? 'participant',
        content: round.response,
      })
    })

    engine.on('moderator_decision', (decision) => {
      emitScoped(io, room, 'discussion:moderator', {
        tableId,
        decision: decision.decision,
        reasoning: decision.reasoning,
      })
    })

    engine.on('concluded', (synthesis) => {
      activeDiscussions.delete(tableId)
      deregisterRun('discussion', tableId)
      emitScoped(io, room, 'discussion:concluded', { tableId, conclusion: synthesis })
    })

    engine.on('error', (err: Error) => {
      activeDiscussions.delete(tableId)
      deregisterRun('discussion', tableId)
      emitScoped(io, room, 'agent:error', {
        agentId: tableId,
        sessionId: '',
        error: err.message,
        type: 'PROCESS_ERROR',
      })
    })

    activeDiscussions.set(tableId, engine)

    // Register for owner-scoped teardown. stop() aborts the engine + kills the
    // in-flight turn spawner (see ModeratorEngine.stop) and also finalizes the
    // DiscussionTable DB status, so no separate finalize is needed here.
    const discussionUserId = socketUserId(socket)
    registerRun({
      kind: 'discussion',
      key: tableId,
      userId: discussionUserId ?? null,
      stop: () => {
        engine.stop()
        activeDiscussions.delete(tableId)
      },
    })

    // Start the engine — this is async and runs the full discussion loop
    engine.start().catch((err: unknown) => {
      activeDiscussions.delete(tableId)
      deregisterRun('discussion', tableId)
      emitScoped(io, room, 'agent:error', {
        agentId: tableId,
        sessionId: '',
        error: err instanceof Error ? err.message : 'Discussion failed to start',
        type: 'PROCESS_ERROR',
      })
    })
  } catch (err) {
    socket.emit('agent:error', {
      agentId: tableId,
      sessionId: '',
      error: err instanceof Error ? err.message : 'Failed to start discussion',
      type: 'PROCESS_ERROR',
    })
  }
}

async function handleDiscussionPause(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  data: { tableId: string },
): Promise<void> {
  const { tableId } = data
  const engine = activeDiscussions.get(tableId)

  if (!engine) {
    socket.emit('agent:error', {
      agentId: tableId,
      sessionId: '',
      error: `No active discussion for table ${tableId}`,
      type: 'PROCESS_ERROR',
    })
    return
  }

  // Authorization: don't let one user pause another user's running discussion.
  if (!(await ensureDiscussionAccessible(socket, tableId))) return

  engine.pause()
  emitScoped(io, socketRoom(socket), 'agent:status', { agentId: tableId, status: 'paused' })

  void prisma.discussionTable
    .update({ where: { id: tableId }, data: { status: 'active' } })
    .catch(() => { /* best-effort */ })
}

async function handleDiscussionResume(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  data: { tableId: string },
): Promise<void> {
  const { tableId } = data
  const engine = activeDiscussions.get(tableId)

  if (!engine) {
    socket.emit('agent:error', {
      agentId: tableId,
      sessionId: '',
      error: `No active discussion for table ${tableId}`,
      type: 'PROCESS_ERROR',
    })
    return
  }

  // Authorization: don't let one user resume another user's discussion.
  if (!(await ensureDiscussionAccessible(socket, tableId))) return

  try {
    emitScoped(io, socketRoom(socket), 'agent:status', { agentId: tableId, status: 'running' })
    await engine.resume()
  } catch (err) {
    socket.emit('agent:error', {
      agentId: tableId,
      sessionId: '',
      error: err instanceof Error ? err.message : 'Failed to resume discussion',
      type: 'PROCESS_ERROR',
    })
  }
}

// ------------------------------------------------------------------
// Loop handler implementations
// ------------------------------------------------------------------

async function handleLoopStart(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  data: { agentId: string; message: string },
): Promise<void> {
  const { agentId, message } = data

  // Authorization: never start a loop on an agent the caller doesn't own.
  if (!(await ensureAgentsAccessible(socket, [agentId]))) return

  const room = socketRoom(socket)

  if (socketActiveLoops.has(agentId)) {
    socket.emit('agent:error', {
      agentId,
      sessionId: '',
      error: `Agent ${agentId} already has a running loop`,
      type: 'RESOURCE_ERROR',
    })
    return
  }

  try {
    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) {
      socket.emit('agent:error', {
        agentId,
        sessionId: '',
        error: `Agent ${agentId} not found`,
        type: 'PROCESS_ERROR',
      })
      return
    }

    const engine = new LoopEngine(agentId)
    socketActiveLoops.set(agentId, engine)

    const loopUserId = socketUserId(socket)
    registerRun({
      kind: 'loop',
      key: agentId,
      userId: loopUserId ?? null,
      stop: () => {
        engine.stop()
        socketActiveLoops.delete(agentId)
      },
      finalize: async () => {
        await prisma.agent.update({ where: { id: agentId }, data: { status: 'idle' } }).catch(() => {})
      },
    })

    engine.on('iteration', (iterData) => {
      emitScoped(io, room, 'agent:loop_iteration', {
        agentId,
        iteration: iterData.iteration,
        maxIterations: iterData.maxIterations,
      })
    })

    engine.on('progress', (progressData) => {
      emitScoped(io, room, 'notification', {
        id: `loop-progress-${agentId}-${progressData.iteration}`,
        level: 'info',
        title: `Loop iteration ${progressData.iteration}: ${progressData.learning.slice(0, 80)}`,
        agentId,
      })
    })

    engine.on('manual_approval_required', (approvalData) => {
      emitScoped(io, room, 'notification', {
        id: `loop-approval-${agentId}-${approvalData.loopId}`,
        level: 'action_required',
        title: `Loop iteration ${approvalData.iteration} requires manual approval`,
        agentId,
        actions: ['approve', 'reject'],
      })
    })

    engine.on('completed', (completedData) => {
      socketActiveLoops.delete(agentId)
      deregisterRun('loop', agentId)
      emitScoped(io, room, 'notification', {
        id: `loop-completed-${agentId}`,
        level: 'info',
        title: `Loop completed after ${completedData.totalIterations} iterations`,
        agentId,
      })
      emitScoped(io, room, 'agent:status', { agentId, status: 'idle' })
    })

    engine.on('failed', (failedData) => {
      socketActiveLoops.delete(agentId)
      deregisterRun('loop', agentId)
      emitScoped(io, room, 'agent:error', {
        agentId,
        sessionId: '',
        error: `Loop failed at iteration ${failedData.iteration}: ${failedData.error}`,
        type: 'PROCESS_ERROR',
      })
      emitScoped(io, room, 'agent:status', { agentId, status: 'error' })
    })

    emitScoped(io, room, 'agent:status', { agentId, status: 'running' })

    engine.start(message).catch((err: unknown) => {
      socketActiveLoops.delete(agentId)
      deregisterRun('loop', agentId)
      emitScoped(io, room, 'agent:error', {
        agentId,
        sessionId: '',
        error: err instanceof Error ? err.message : 'Loop failed to start',
        type: 'PROCESS_ERROR',
      })
    })
  } catch (err) {
    socket.emit('agent:error', {
      agentId,
      sessionId: '',
      error: err instanceof Error ? err.message : 'Failed to start loop',
      type: 'PROCESS_ERROR',
    })
  }
}

function handleLoopStop(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  data: { agentId: string },
): void {
  const { agentId } = data
  const engine = socketActiveLoops.get(agentId)

  if (!engine) {
    socket.emit('agent:error', {
      agentId,
      sessionId: '',
      error: `No active loop for agent ${agentId}`,
      type: 'PROCESS_ERROR',
    })
    return
  }

  engine.stop()
  socketActiveLoops.delete(agentId)
  deregisterRun('loop', agentId)
  emitScoped(io, socketRoom(socket), 'agent:status', { agentId, status: 'idle' })
}

function handleLoopApprove(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  data: { agentId: string; loopId: string; approved: boolean },
): void {
  const { agentId, loopId, approved } = data
  const engine = socketActiveLoops.get(agentId)

  if (!engine) {
    socket.emit('agent:error', {
      agentId,
      sessionId: '',
      error: `No active loop for agent ${agentId}`,
      type: 'PROCESS_ERROR',
    })
    return
  }

  engine.resolveManualApproval(loopId, approved)
}

// ------------------------------------------------------------------
// Chain handler implementations
// ------------------------------------------------------------------

async function handleChainExecute(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  data: { chainId?: string; definition: ChainDefinitionPayload; initialMessage: string; workspaceId?: string; director?: boolean; directorRigor?: number; directorCustomInstructions?: string; planner?: boolean; plannerCustomInstructions?: string; approvalMode?: ChainApprovalMode },
): Promise<void> {
  const chainId = data.chainId ?? `chain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const room = socketRoom(socket)

  // Viewers are read-only — reject before any state lookup/emit.
  if (!ensureCanRun(socket, chainId)) return

  if (socketActiveChains.has(chainId)) {
    socket.emit('agent:error', {
      agentId: chainId,
      sessionId: '',
      error: `Chain ${chainId} is already running`,
      type: 'RESOURCE_ERROR',
    })
    return
  }

  // Authorization: only agent steps run a Claude agent — verify those exist.
  // Non-agent steps (structurer/db-save) carry a canvas node id, not an Agent id,
  // so they must be excluded or the accessibility check would abort the run.
  const agentStepIds = data.definition.steps
    .filter((s) => !s.nodeType || s.nodeType === 'agent')
    .map((s) => s.agentId)
  if (!(await ensureAgentsAccessible(socket, agentStepIds))) return

  try {
    // Resolve workspace working directory if provided
    let cwd: string | undefined
    if (data.workspaceId) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: data.workspaceId },
        select: { workingDirectory: true },
      })
      cwd = workspace?.workingDirectory ?? undefined
    }

    const executor = new ChainExecutor()
    socketActiveChains.set(chainId, executor)
    chainEventSeq.set(chainId, 0)

    // Register for owner-scoped teardown. This is the ONLY place chain ownership
    // is recorded (socketActiveChains is keyed by chainId alone), so it's what
    // lets disconnect teardown find a user's chains. finalize mirrors
    // handleChainStop so a torn-down chain isn't left stuck at status 'running'.
    const chainUserId = socketUserId(socket)
    registerRun({
      kind: 'chain',
      key: chainId,
      userId: chainUserId ?? null,
      stop: () => {
        executor.stop()
        socketActiveChains.delete(chainId)
      },
      finalize: async (reason) => {
        persistChainEvent(chainId, 'chain_complete', { payload: { stopped: true, reason } })
        await prisma.chainRun.update({
          where: { chainId },
          data: { status: 'stopped', completedAt: new Date() },
        }).catch(() => {})
        chainEventSeq.delete(chainId)
      },
    })

    // Persist chain run to DB
    const stepCount = data.definition.steps.length
    await prisma.chainRun.create({
      data: {
        chainId,
        workspaceId: data.workspaceId ?? null,
        initialMessage: data.initialMessage.slice(0, 5000),
        totalSteps: stepCount,
        status: 'running',
      },
    }).catch(() => {}) // Non-fatal if DB write fails

    // Track per-step usage for DB persistence
    const stepUsageMap = new Map<number, { tokensIn: number; tokensOut: number; costUsd: number }>()
    // Track per-step model so SessionUsage rows can be attributed to a model.
    const stepModelMap = new Map<number, string>()

    executor.on('step_start', (stepData) => {
      emitScoped(io, room, 'chain:step_start', {
        chainId,
        stepIndex: stepData.stepIndex,
        agentId: stepData.agentId,
        cwd: stepData.cwd,
      })
      emitScoped(io, room, 'notification', {
        id: `chain-step-${chainId}-${stepData.stepIndex}`,
        level: 'info',
        title: `Chain step ${stepData.stepIndex} started (agent ${stepData.agentId})`,
      })
      // Create step record in DB. Non-agent steps (structurer/db-save) carry no
      // Agent row, so persist their definition name for a readable History label.
      const defStep = data.definition.steps[stepData.stepIndex]
      const nonAgentName = defStep && defStep.nodeType && defStep.nodeType !== 'agent' ? defStep.name : undefined
      prisma.chainStepResult.create({
        data: {
          chainRun: { connect: { chainId } },
          stepIndex: stepData.stepIndex,
          agentId: stepData.agentId,
          ...(nonAgentName ? { agentName: nonAgentName } : {}),
          status: 'running',
        },
      }).catch(() => {})
      persistChainEvent(chainId, 'step_start', {
        stepIndex: stepData.stepIndex,
        agentId: stepData.agentId,
        payload: { cwd: stepData.cwd },
      })
    })

    executor.on('step_text', (stepData) => {
      emitScoped(io, room, 'chain:step_text', { chainId, ...stepData })
      // Streamed deltas are not persisted per-delta — the final accumulated text
      // is captured on step_complete (ChainStepResult.output).
    })

    executor.on('step_tool_use', (stepData) => {
      emitScoped(io, room, 'chain:step_tool_use', { chainId, ...stepData })
      persistChainEvent(chainId, 'step_tool_use', {
        stepIndex: stepData.stepIndex,
        agentId: stepData.agentId,
        payload: { toolName: stepData.toolName, input: stepData.input, id: stepData.id },
      })
    })

    executor.on('step_tool_result', (stepData) => {
      emitScoped(io, room, 'chain:step_tool_result', { chainId, ...stepData })
      persistChainEvent(chainId, 'step_tool_result', {
        stepIndex: stepData.stepIndex,
        agentId: stepData.agentId,
        payload: { toolName: stepData.toolName, output: stepData.output, toolUseId: stepData.toolUseId },
      })
    })

    executor.on('step_usage', (stepData) => {
      emitScoped(io, room, 'chain:step_usage', { chainId, ...stepData })
      stepUsageMap.set(stepData.stepIndex, {
        tokensIn: stepData.usage.inputTokens,
        tokensOut: stepData.usage.outputTokens,
        costUsd: stepData.usage.estimatedCostUsd ?? 0,
      })
      if (stepData.model) stepModelMap.set(stepData.stepIndex, stepData.model)
    })

    executor.on('step_complete', (stepData) => {
      const output = typeof stepData.output === 'string' ? stepData.output : JSON.stringify(stepData.output ?? '')
      emitScoped(io, room, 'chain:step_complete', {
        chainId,
        stepIndex: stepData.stepIndex,
        agentId: stepData.agentId,
        output,
      })
      emitScoped(io, room, 'notification', {
        id: `chain-step-done-${chainId}-${stepData.stepIndex}`,
        level: 'info',
        title: `Chain step ${stepData.stepIndex} completed`,
      })
      // Update step record in DB
      const usage = stepUsageMap.get(stepData.stepIndex)
      prisma.chainStepResult.updateMany({
        where: {
          chainRun: { chainId },
          stepIndex: stepData.stepIndex,
        },
        data: {
          output: output.slice(0, 50000),
          status: 'completed',
          completedAt: new Date(),
          ...(usage ?? {}),
        },
      }).catch(() => {})
      persistChainEvent(chainId, 'step_complete', {
        stepIndex: stepData.stepIndex,
        agentId: stepData.agentId,
        payload: {
          output: output.slice(0, 50000),
          usage: usage
            ? { inputTokens: usage.tokensIn, outputTokens: usage.tokensOut, estimatedCostUsd: usage.costUsd }
            : undefined,
        },
      })

      // Persist per-step usage for analytics (cost + per-workspace/model breakdowns).
      if (usage && (usage.tokensIn > 0 || usage.tokensOut > 0 || usage.costUsd > 0)) {
        prisma.sessionUsage.create({
          data: {
            sessionId: `${chainId}-step-${stepData.stepIndex}`,
            agentId: stepData.agentId,
            workspaceId: data.workspaceId ?? null,
            model: stepModelMap.get(stepData.stepIndex) ?? null,
            inputTokens: usage.tokensIn,
            outputTokens: usage.tokensOut,
            costUsd: usage.costUsd,
          },
        }).catch(() => {})
      }
    })

    executor.on('step_skipped', (stepData) => {
      emitScoped(io, room, 'chain:step_skipped', {
        chainId,
        stepIndex: stepData.stepIndex,
        agentId: stepData.agentId,
        reason: stepData.reason,
      })
      prisma.chainStepResult.updateMany({
        where: { chainRun: { chainId }, stepIndex: stepData.stepIndex },
        data: { status: 'skipped', completedAt: new Date() },
      }).catch(() => {})
      persistChainEvent(chainId, 'step_skipped', {
        stepIndex: stepData.stepIndex,
        agentId: stepData.agentId,
        payload: { reason: stepData.reason },
      })
    })

    executor.on('chain_complete', (completeData) => {
      socketActiveChains.delete(chainId)
      deregisterRun('chain', chainId)
      emitScoped(io, room, 'chain:complete', {
        chainId,
        totalSteps: completeData.outputs.size,
      })
      emitScoped(io, room, 'notification', {
        id: `chain-complete-${chainId}`,
        level: 'info',
        title: `Chain ${chainId} completed (${completeData.outputs.size} steps)`,
      })
      persistChainEvent(chainId, 'chain_complete', {
        payload: { totalSteps: completeData.outputs.size },
      })
      // Update chain run in DB
      prisma.chainRun.update({
        where: { chainId },
        data: { status: 'completed', completedAt: new Date() },
      }).catch(() => {})
      chainEventSeq.delete(chainId)

      // Persistent cross-session memory: distill durable facts from the run.
      void extractMemoriesForChain({
        agentIds: data.definition.steps.map((s) => s.agentId),
        workspaceId: data.workspaceId,
        outputs: completeData.outputs,
      }).catch(() => { /* never fails the chain */ })
    })

    executor.on('error', (errData) => {
      emitScoped(io, room, 'chain:error', {
        chainId,
        stepIndex: errData.stepIndex,
        error: errData.error.slice(0, 200),
      })
      emitScoped(io, room, 'notification', {
        id: `chain-error-${chainId}-${errData.stepIndex}`,
        level: 'error',
        title: `Chain step ${errData.stepIndex} failed: ${errData.error.slice(0, 80)}`,
      })
      // Mark step as failed in DB
      prisma.chainStepResult.updateMany({
        where: {
          chainRun: { chainId },
          stepIndex: errData.stepIndex,
        },
        data: { status: 'failed', completedAt: new Date() },
      }).catch(() => {})
      persistChainEvent(chainId, 'error', {
        stepIndex: errData.stepIndex,
        payload: { error: errData.error.slice(0, 200) },
      })
    })

    // Director event forwarding
    executor.on('step_director_thinking', (stepData) => {
      // Emit a lightweight "thinking" event so the UI can show a spinner
      emitScoped(io, room, 'chain:director_decision', {
        chainId,
        reasoning: 'Evaluating step output...',
        action: 'continue',
        targetAgentName: '',
        message: '',
      })
    })

    executor.on('step_director', (stepData) => {
      const { decision } = stepData
      emitScoped(io, room, 'chain:director_decision', {
        chainId,
        reasoning: decision.reasoning,
        action: decision.action,
        targetAgentName: '',
        message: decision.message,
      })
      persistChainEvent(chainId, 'director_decision', {
        stepIndex: stepData.stepIndex,
        payload: { reasoning: decision.reasoning, action: decision.action, message: decision.message },
      })

      // Continuous planner: emit agent suggestions if any
      if (decision.agentSuggestions && decision.agentSuggestions.length > 0) {
        emitScoped(io, room, 'chain:planner_result', {
          chainId,
          plan: {
            analysis: `Director suggests ${decision.agentSuggestions.length} agent improvement(s) during execution`,
            agentChanges: decision.agentSuggestions.map((s: any) => ({
              agentId: '',
              agentName: s.agentName,
              changes: s.changeType === 'model' ? { model: s.suggestion } : { persona: s.suggestion },
              reason: s.reason,
            })),
            edgeChanges: [],
            addAgents: [],
            removeAgents: [],
            approved: true,
          },
        })
      }
    })

    executor.on('step_director_redirect_request', (stepData) => {
      const { decision, requestId } = stepData
      // Look up agent names for display
      const steps = data.definition.steps
      const fromAgent = steps[stepData.stepIndex]?.agentId ?? 'unknown'
      const toAgent = steps[decision.targetStepIndex]?.agentId ?? 'unknown'

      emitScoped(io, room, 'chain:director_redirect_request', {
        chainId,
        reasoning: decision.reasoning,
        fromAgent,
        toAgent,
        requestId,
      })
      persistChainEvent(chainId, 'director_redirect_request', {
        stepIndex: stepData.stepIndex,
        payload: { reasoning: decision.reasoning, fromAgent, toAgent, requestId },
      })
    })

    // Per-step approval gate (approvalMode === 'perStep'): ask the user to
    // approve each agent step before it runs. The UI resolves the agent name
    // from its own chain definition (same as chain:step_start).
    executor.on('step_approval_request', (stepData) => {
      emitScoped(io, room, 'chain:step_approval_request', {
        chainId,
        stepIndex: stepData.stepIndex,
        agentId: stepData.agentId,
        requestId: stepData.requestId,
      })
      emitScoped(io, room, 'notification', {
        id: `chain-step-approval-${chainId}-${stepData.stepIndex}`,
        level: 'action_required',
        title: `Approval needed to run step ${stepData.stepIndex + 1}`,
        agentId: stepData.agentId,
      })
      persistChainEvent(chainId, 'step_approval_request', {
        stepIndex: stepData.stepIndex,
        agentId: stepData.agentId,
        payload: { requestId: stepData.requestId },
      })
    })

    // The executor stopped itself (e.g. a step approval timed out). Mirror the
    // user-initiated stop cleanup and tell the UI so it leaves the running state.
    executor.on('chain_stopped', (stopData) => {
      socketActiveChains.delete(chainId)
      deregisterRun('chain', chainId)
      emitScoped(io, room, 'chain:stopped', { chainId, reason: stopData.reason })
      emitScoped(io, room, 'notification', {
        id: `chain-stopped-${chainId}`,
        level: 'info',
        title: `Workflow stopped — ${stopData.reason}`,
      })
      persistChainEvent(chainId, 'chain_complete', { payload: { stopped: true, reason: stopData.reason } })
      prisma.chainRun.update({
        where: { chainId },
        data: { status: 'stopped', completedAt: new Date() },
      }).catch(() => {})
      chainEventSeq.delete(chainId)
    })

    // ── Planner pre-execution analysis (if enabled) ──
    if (data.planner) {
      emitScoped(io, room, 'chain:planner_start', { chainId })
      try {
        // Load agent metadata for planner context (agent steps only — non-agent
        // structurer/db-save steps have no Agent row to analyze).
        const plannerAgents: PlannerAgent[] = await Promise.all(
          data.definition.steps
            .filter((step) => !step.nodeType || step.nodeType === 'agent')
            .map(async (step) => {
            const agent = await prisma.agent.findUnique({
              where: { id: step.agentId },
              select: { id: true, name: true, persona: true, model: true },
            })
            const skills = await prisma.agentSkill.findMany({
              where: { agentId: step.agentId, enabled: true },
              select: { skillId: true },
            })
            return {
              agentId: step.agentId,
              name: agent?.name ?? `Agent ${step.agentId.slice(0, 8)}`,
              persona: agent?.persona ?? '',
              model: agent?.model ?? 'sonnet',
              skills: skills.map((s) => s.skillId),
            }
          }),
        )

        const edges = data.definition.edges?.map((e) => ({
          from: data.definition.steps[e.from]?.agentId ?? '',
          to: data.definition.steps[e.to]?.agentId ?? '',
        })) ?? []

        const planner = new Planner()
        const plan = await planner.analyze({
          initialMessage: data.initialMessage,
          agents: plannerAgents,
          edges,
          customInstructions: data.plannerCustomInstructions,
        })

        emitScoped(io, room, 'chain:planner_result', { chainId, plan })
      } catch (err) {
        // Planner failure is non-fatal — continue execution
        emitScoped(io, room, 'chain:planner_error', {
          chainId,
          error: err instanceof Error ? err.message : 'Planner analysis failed',
        })
      }
    }

    executor.execute(data.definition as ChainDefinition, data.initialMessage, {
      cwd,
      workspaceId: data.workspaceId,
      chainId,
      director: data.director,
      directorRigor: data.directorRigor,
      directorCustomInstructions: data.directorCustomInstructions,
      approvalMode: data.approvalMode ?? 'auto',
      // Both run modes let tools execute without the CLI's own (impossible in
      // headless) interactive prompt — that's what fixes "WebSearch requires
      // permission approval". The human gate, in perStep mode, is per-agent-step.
      permissionMode: 'bypassPermissions',
    }).catch((err: unknown) => {
      socketActiveChains.delete(chainId)
      deregisterRun('chain', chainId)
      emitScoped(io, room, 'agent:error', {
        agentId: chainId,
        sessionId: '',
        error: err instanceof Error ? err.message : 'Chain execution failed',
        type: 'PROCESS_ERROR',
      })
      // Mark chain as failed in DB
      prisma.chainRun.update({
        where: { chainId },
        data: { status: 'failed', completedAt: new Date() },
      }).catch(() => {})
      persistChainEvent(chainId, 'error', {
        payload: { error: err instanceof Error ? err.message : 'Chain execution failed' },
      })
      chainEventSeq.delete(chainId)
    })
  } catch (err) {
    socketActiveChains.delete(chainId)
    deregisterRun('chain', chainId)
    socket.emit('agent:error', {
      agentId: chainId,
      sessionId: '',
      error: err instanceof Error ? err.message : 'Failed to start chain',
      type: 'PROCESS_ERROR',
    })
  }
}

function handleChainStop(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  data: { chainId: string },
): void {
  const { chainId } = data
  // Viewers are read-only — stopping a run mutates state.
  if (!ensureCanRun(socket, chainId)) return
  const executor = socketActiveChains.get(chainId)

  if (!executor) {
    socket.emit('agent:error', {
      agentId: chainId,
      sessionId: '',
      error: `No active chain ${chainId}`,
      type: 'PROCESS_ERROR',
    })
    return
  }

  executor.stop()
  socketActiveChains.delete(chainId)
  deregisterRun('chain', chainId)
  emitScoped(io, socketRoom(socket), 'notification', {
    id: `chain-stopped-${chainId}`,
    level: 'info',
    title: `Chain ${chainId} stopped`,
  })
  // Finalize the run so it isn't left stuck at status 'running' forever, and
  // record the stop in the replayable transcript.
  persistChainEvent(chainId, 'chain_complete', { payload: { stopped: true } })
  prisma.chainRun.update({
    where: { chainId },
    data: { status: 'stopped', completedAt: new Date() },
  }).catch(() => {})
  chainEventSeq.delete(chainId)
}

// ------------------------------------------------------------------
// Advisor handler
// ------------------------------------------------------------------

async function handleAdvisorAnalyze(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  data: { chainId: string; model?: string },
): Promise<void> {
  const { chainId } = data
  const model = data.model ?? ANTHROPIC.UTILITY_MODEL
  const room = socketRoom(socket)

  // Advisor spawns a model (compute spend) — gate as a run; viewers are denied.
  if (!hasMinRole(socketRole(socket), 'editor')) {
    socket.emit('advisor:error', { chainId, error: 'Your role does not permit running analysis' })
    return
  }

  try {
    const chainRun = await prisma.chainRun.findUnique({
      where: { chainId },
      include: { steps: { orderBy: { stepIndex: 'asc' } } },
    })

    if (!chainRun || chainRun.status !== 'completed') {
      socket.emit('advisor:error', { chainId, error: 'No completed workflow run found for this chain.' })
      return
    }

    // Load agent metadata
    const agentIds = [...new Set(chainRun.steps.map((s) => s.agentId))]
    const agents = await prisma.agent.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, name: true, persona: true },
    })
    const agentMap = new Map(agents.map((a) => [a.id, a]))

    emitScoped(io, room, 'advisor:analyzing', { chainId })

    const advisor = new WorkflowAdvisor()
    const result = await advisor.analyze(
      {
        initialMessage: chainRun.initialMessage,
        agents: agents.map((a) => ({
          name: a.name,
          persona: a.persona ?? '',
          agentId: a.id,
        })),
        stepResults: chainRun.steps.map((s) => ({
          stepIndex: s.stepIndex,
          agentName: agentMap.get(s.agentId)?.name ?? s.agentName ?? s.agentId,
          agentId: s.agentId,
          output: s.output,
          tokensIn: s.tokensIn,
          tokensOut: s.tokensOut,
          status: s.status,
        })),
        availableSkills: SKILL_CATALOG.map((s) => ({
          name: s.name,
          description: s.description,
          category: s.category,
        })),
      },
      model,
    )

    emitScoped(io, room, 'advisor:result', {
      chainId,
      result: {
        overallAssessment: result.overallAssessment,
        objectiveMet: result.objectiveMet,
        suggestions: result.suggestions.map((s) => ({
          id: s.id,
          category: s.category,
          title: s.title,
          description: s.description,
          actionType: s.actionType,
          actionPayload: s.actionPayload ? { ...s.actionPayload } : undefined,
          severity: s.severity,
        })),
      },
    })
  } catch (err) {
    socket.emit('advisor:error', {
      chainId,
      error: err instanceof Error ? err.message : 'Advisor analysis failed',
    })
  }
}

// ------------------------------------------------------------------
// Director redirect response handler
// ------------------------------------------------------------------

function handleDirectorRedirectResponse(
  data: { chainId: string; requestId: string; approved: boolean },
): void {
  const executor = socketActiveChains.get(data.chainId)
  if (executor) {
    executor.resolveRedirect(data.requestId, data.approved)
  }
}

// ------------------------------------------------------------------
// Per-step approval response handler
// ------------------------------------------------------------------

function handleStepApprovalResponse(
  data: { chainId: string; requestId: string; approved: boolean },
): void {
  const executor = socketActiveChains.get(data.chainId)
  if (executor) {
    executor.resolveStepApproval(data.requestId, data.approved)
  }
}

// ------------------------------------------------------------------
// DB persistence helpers
// ------------------------------------------------------------------

async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'tool' | 'system',
  content: string,
  toolUse: { toolName: string; input: unknown; output: unknown } | null,
  rawEvent: unknown,
): Promise<void> {
  try {
    await prisma.message.create({
      data: {
        sessionId,
        role,
        content,
        toolUse: toolUse as object | undefined,
        rawEvent: rawEvent as object | undefined,
      },
    })
  } catch {
    // Non-fatal — session recording is best-effort
  }
}

// ------------------------------------------------------------------
// Utility helpers
// ------------------------------------------------------------------

/**
 * Return the command portion of a tool invocation as a human-readable string.
 * Used for approval descriptions.
 */
function extractCommandDisplay(toolName: string, toolInput: unknown): string {
  if (
    toolName === 'Bash' &&
    toolInput !== null &&
    typeof toolInput === 'object' &&
    'command' in toolInput &&
    typeof (toolInput as Record<string, unknown>)['command'] === 'string'
  ) {
    return (toolInput as Record<string, string>)['command']
  }
  return toolName
}

/**
 * Merge two permission-mode strings, returning the more restrictive one.
 * Restrictiveness: default > plan > acceptEdits > dontAsk
 */
function mergePermissionModeStrings(a: string, b: string): string {
  const rank: Record<string, number> = {
    default: 3,
    plan: 2,
    acceptEdits: 1,
    dontAsk: 0,
  }
  return (rank[a] ?? 0) >= (rank[b] ?? 0) ? a : b
}

/**
 * Return the minimum of two optional budget values.
 * If both are defined, returns the smaller; if one is undefined, returns the other.
 */
function minDefinedBudget(a: number | undefined, b: number): number | undefined {
  if (a === undefined) return b
  return Math.min(a, b)
}
