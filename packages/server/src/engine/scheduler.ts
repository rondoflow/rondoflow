// Scheduler — manages cron-based recurring execution of workflows and agents.

import { Cron } from 'croner'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { prisma } from '../lib/prisma'
import { ClaudeCodeSpawner } from './spawner'
import { ChainExecutor } from './chain-executor'
import { buildCanvasChain } from './canvas-chain'
import { randomUUID } from 'crypto'
import { formatRunOutput, OUTPUT_FORMAT_EXT, parseRecipients, CLAUDE_MODELS, type WorkflowOutputSpec, type WorkflowEmailSpec } from '@rondoflow/shared'
import { readSmtpConfig, sendEmail } from '../services/email-sender'
import { SCHEDULED_TASK_SYSTEM_PROMPT, defaultScheduledAgentPersona } from '../prompts/scheduler'
import type { Server as SocketIOServer } from 'socket.io'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScheduledJob {
  readonly taskId: string
  readonly cron: Cron
}

interface SchedulerOptions {
  readonly io: SocketIOServer
}

// ─── Scheduler Class ────────────────────────────────────────────────────────

export class Scheduler {
  private readonly jobs = new Map<string, ScheduledJob>()
  private readonly io: SocketIOServer

  constructor(options: SchedulerOptions) {
    this.io = options.io
  }

  /** Load all enabled tasks from DB and start their cron jobs. */
  async start(): Promise<void> {
    const tasks = await prisma.scheduledTask.findMany({
      where: { enabled: true },
    })

    for (const task of tasks) {
      this.scheduleTask(task.id, task.schedule, task.timezone)
    }
  }

  /** Stop all cron jobs (graceful shutdown). */
  stop(): void {
    for (const job of this.jobs.values()) {
      job.cron.stop()
    }
    this.jobs.clear()
  }

  /** Add or replace a cron job for a task. */
  scheduleTask(taskId: string, cronExpression: string, timezone: string): void {
    // Remove existing job if any
    this.unscheduleTask(taskId)

    const cron = new Cron(cronExpression, { timezone }, () => {
      void this.executeTask(taskId)
    })

    this.jobs.set(taskId, { taskId, cron })

    // Update nextRunAt in DB
    const nextRun = cron.nextRun()
    if (nextRun) {
      void prisma.scheduledTask.update({
        where: { id: taskId },
        data: { nextRunAt: nextRun },
      }).catch(() => {})
    }
  }

  /** Remove a cron job for a task. */
  unscheduleTask(taskId: string): void {
    const existing = this.jobs.get(taskId)
    if (existing) {
      existing.cron.stop()
      this.jobs.delete(taskId)
    }
  }

  /** Execute a task immediately (manual trigger or cron tick). */
  async executeTask(taskId: string): Promise<void> {
    const task = await prisma.scheduledTask.findUnique({ where: { id: taskId } })
    if (!task || !task.enabled) return

    // Update status to running
    await prisma.scheduledTask.update({
      where: { id: taskId },
      data: { lastStatus: 'running', lastRunAt: new Date() },
    }).catch(() => {})

    this.io.emit('schedule:run_start' as any, { taskId, name: task.name })

    try {
      if (task.type === 'agent') {
        await this.executeAgentTask(task.targetId, task.message)
      } else {
        await this.executeWorkflowTask(task.targetId, task.message, task.directorEnabled)
      }

      await prisma.scheduledTask.update({
        where: { id: taskId },
        data: {
          lastStatus: 'success',
          nextRunAt: this.jobs.get(taskId)?.cron.nextRun() ?? null,
        },
      }).catch(() => {})

      this.io.emit('schedule:run_complete' as any, { taskId, name: task.name, status: 'success' })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'

      await prisma.scheduledTask.update({
        where: { id: taskId },
        data: {
          lastStatus: 'error',
          nextRunAt: this.jobs.get(taskId)?.cron.nextRun() ?? null,
        },
      }).catch(() => {})

      this.io.emit('schedule:run_error' as any, { taskId, name: task.name, error: errorMsg })
    }
  }

  /** Spawn a single agent with a message. */
  private executeAgentTask(agentId: string, message: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const spawner = new ClaudeCodeSpawner()

      spawner.on('completion', () => resolve())
      spawner.on('error', (err: Error) => reject(err))

      try {
        spawner.spawn({
          agentId: `sched-${agentId.slice(0, 8)}`,
          sessionId: randomUUID(),
          message: message || 'Execute your assigned task.',
          systemPrompt: SCHEDULED_TASK_SYSTEM_PROMPT,
          permissionMode: 'plan',
          maxBudgetUsd: 0.20,
          // No headless approver exists, so a 'plan'-mode permission prompt would
          // stall forever. The spawner's default idle timeout
          // (RONDOFLOW_SPAWN_IDLE_TIMEOUT_MS) reaps that stall — no output while
          // blocked = inactivity — without an absolute cap that would false-kill
          // a legitimately long scheduled task.
        })
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }

  /**
   * Execute a scheduled "workflow" target. The target id is a Workspace id: run
   * its latest canvas as a chain (DAG, conditions, directors) via ChainExecutor.
   * Falls back to the legacy SavedWorkflow path when no workspace matches the id.
   */
  private async executeWorkflowTask(
    targetId: string,
    message: string,
    director = false,
  ): Promise<void> {
    const workspace = await prisma.workspace.findUnique({ where: { id: targetId } })
    if (workspace) {
      await this.executeWorkspaceCanvas(workspace, message, director)
      return
    }
    await this.executeSavedWorkflow(targetId, message)
  }

  /** Run a workspace's latest canvas headlessly as a chain. */
  private async executeWorkspaceCanvas(
    workspace: { id: string; workingDirectory: string | null },
    message: string,
    director = false,
  ): Promise<void> {
    const layout = await prisma.canvasLayout.findFirst({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: 'desc' },
    })
    if (!layout) {
      throw new Error(`Workspace ${workspace.id} has no canvas to run`)
    }

    const { definition, nameByIndex, outputs, emails } = buildCanvasChain(
      layout.nodes,
      layout.edges,
    )
    if (definition.steps.length === 0) {
      throw new Error(`Workspace ${workspace.id} canvas has no runnable agents`)
    }

    // Collect each step's final output (by step index) so Output/Email node
    // specs can be honoured after the run, matched by agent NAME.
    const collected: { agentName: string; output: string }[] = []
    const executor = new ChainExecutor()
    executor.on('step_complete', ({ stepIndex, output }) => {
      collected[stepIndex] = {
        agentName: nameByIndex[stepIndex] ?? `Step ${stepIndex + 1}`,
        output,
      }
    })

    // Headless: no human approver, so tools must never block on a permission
    // prompt — run in auto/bypassPermissions like other non-interactive runs.
    await executor.execute(definition, message || 'Execute this workflow.', {
      workspaceId: workspace.id,
      ...(workspace.workingDirectory ? { cwd: workspace.workingDirectory } : {}),
      director,
      approvalMode: 'auto',
      permissionMode: 'bypassPermissions',
    })

    const done = collected.filter(Boolean)
    for (const spec of outputs) await this.saveOutputSpec(spec, done)
    for (const spec of emails) await this.sendEmailSpec(spec, done)
  }

  /** Load a legacy saved workflow and execute it as a simple sequential chain. */
  private async executeSavedWorkflow(workflowId: string, message: string): Promise<void> {
    const saved = await prisma.savedWorkflow.findUnique({ where: { id: workflowId } })
    if (!saved) {
      throw new Error(`Saved workflow ${workflowId} not found`)
    }

    const workflow = saved.workflow as any
    const agents = Array.isArray(workflow.agents) ? workflow.agents : []

    // Execute agents sequentially, passing output forward, and collect each
    // agent's final output so Output specs can be honoured headlessly.
    let previousOutput = message || 'Execute this workflow.'
    const collected: { agentName: string; output: string }[] = []

    for (const agent of agents) {
      const agentName = agent.name ?? 'Agent'
      previousOutput = await this.spawnAndCollect(
        agentName,
        agent.persona ?? '',
        previousOutput,
        agent.model ?? 'sonnet',
      )
      collected.push({ agentName, output: previousOutput })
    }

    const outputs = Array.isArray(workflow.outputs)
      ? (workflow.outputs as WorkflowOutputSpec[])
      : []
    for (const spec of outputs) {
      await this.saveOutputSpec(spec, collected)
    }

    const emails = Array.isArray(workflow.emails)
      ? (workflow.emails as WorkflowEmailSpec[])
      : []
    for (const spec of emails) {
      await this.sendEmailSpec(spec, collected)
    }
  }

  /**
   * Honour an Output node's spec for a headless/scheduled run. Agents are matched
   * by NAME (the scheduler has no canvas node ids). Writes directly to disk via
   * fs (in-process — no HTTP route). Best-effort: a write failure is swallowed so
   * one bad destination can't abort the whole task.
   */
  private async saveOutputSpec(
    spec: WorkflowOutputSpec,
    collected: ReadonlyArray<{ agentName: string; output: string }>,
  ): Promise<void> {
    const usable = collected.filter((c) => c.output.trim().length > 0)
    const selected =
      spec.agentSelection === 'all'
        ? usable
        : usable.filter((c) => spec.agentSelection.includes(c.agentName))
    if (selected.length === 0) return

    const content = formatRunOutput(selected, { format: spec.format, title: spec.title })
    const ext = OUTPUT_FORMAT_EXT[spec.format]
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `workflow-output-${stamp}-${randomUUID().slice(0, 8)}.${ext}`
    // No workspace dir headless — fall back to a stable per-user outputs folder.
    const dir = spec.destinationDir || join(homedir(), '.rondoflow', 'scheduled-outputs')
    try {
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, filename), content, 'utf-8')
    } catch (err) {
      console.error(`[scheduler] failed to save output to ${dir}:`, err)
    }
  }

  /**
   * Honour an Email node's spec for a headless/scheduled run. Agents are matched
   * by NAME. The body is always HTML (markdown→HTML via the shared formatter),
   * with a plain-text alternative. Best-effort: a send failure (or missing SMTP
   * config) is logged and swallowed so it can't abort the whole task.
   */
  private async sendEmailSpec(
    spec: WorkflowEmailSpec,
    collected: ReadonlyArray<{ agentName: string; output: string }>,
  ): Promise<void> {
    if (!readSmtpConfig()) {
      console.error('[scheduler] email spec skipped — SMTP not configured (set SMTP_HOST/SMTP_FROM)')
      return
    }
    const { valid: recipients } = parseRecipients(spec.recipients)
    if (recipients.length === 0) return

    const usable = collected.filter((c) => c.output.trim().length > 0)
    const selected =
      spec.agentSelection === 'all'
        ? usable
        : usable.filter((c) => spec.agentSelection.includes(c.agentName))
    if (selected.length === 0) return

    const html = formatRunOutput(selected, { format: 'html', title: spec.title })
    const text = formatRunOutput(selected, { format: 'text', title: spec.title })
    const subject = (spec.subject?.trim() || 'Workflow output').replace(/[\r\n]+/g, ' ')
    try {
      await sendEmail({ recipients, subject, html, text })
    } catch (err) {
      console.error('[scheduler] failed to send workflow email:', err)
    }
  }

  private spawnAndCollect(
    name: string,
    systemPrompt: string,
    message: string,
    model: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const spawner = new ClaudeCodeSpawner()
      let output = ''

      spawner.on('text', (data: { content: string; partial: boolean }) => {
        if (data.partial) {
          output += data.content
        } else {
          output = data.content
        }
      })

      spawner.on('completion', () => resolve(output))
      spawner.on('error', (err: Error) => reject(err))

      const MODEL_IDS: Record<string, string> = CLAUDE_MODELS

      try {
        spawner.spawn({
          agentId: `sched-${randomUUID().slice(0, 8)}`,
          sessionId: randomUUID(),
          message,
          systemPrompt: systemPrompt || defaultScheduledAgentPersona(name),
          model: MODEL_IDS[model] ?? MODEL_IDS.sonnet,
          permissionMode: 'plan',
          maxBudgetUsd: 0.15,
          // See executeAgentTask: the inherited idle timeout reaps a stalled
          // 'plan'-mode permission prompt without capping legitimate long work.
        })
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }
}
