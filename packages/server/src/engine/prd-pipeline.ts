// PrdPipelineEngine — processes all Stories in a PRD in priority order.
// Spawns an agent for each story, verifies acceptance criteria, retries once
// via LoopEngine on failure, then moves on regardless.

import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { spawnSync } from 'child_process'
import { TIMEOUTS } from '@rondoflow/shared'
import { prisma } from '../lib/prisma'
import { buildSpawnConfig } from './prompt-builder'
import { ClaudeCodeSpawner } from './spawner'
import { LoopEngine } from './loop-engine'

type PipelineStatus = 'running' | 'paused' | 'completed' | 'stopped'

export interface PrdPipelineEvents {
  story_start: (data: { storyId: string; title: string; priority: number }) => void
  story_complete: (data: { storyId: string; status: 'passed' | 'failed' }) => void
  progress: (data: { learning: string }) => void
  pipeline_complete: (data: { passedCount: number; failedCount: number }) => void
}

export declare interface PrdPipelineEngine {
  on<K extends keyof PrdPipelineEvents>(event: K, listener: PrdPipelineEvents[K]): this
  emit<K extends keyof PrdPipelineEvents>(event: K, ...args: Parameters<PrdPipelineEvents[K]>): boolean
}

export class PrdPipelineEngine extends EventEmitter {
  private status: PipelineStatus = 'running'
  private currentSpawner: ClaudeCodeSpawner | null = null
  private currentLoopEngine: LoopEngine | null = null
  private resumeCallback: (() => void) | null = null
  private stopped = false

  async start(prdId: string, agentId: string): Promise<void> {
    this.stopped = false
    this.status = 'running'

    const prd = await prisma.pRD.findUnique({
      where: { id: prdId },
      include: {
        stories: {
          orderBy: { priority: 'asc' },
        },
      },
    })

    if (!prd) {
      throw new Error(`PRD '${prdId}' not found`)
    }

    const progressJournal: string[] = []
    let passedCount = 0
    let failedCount = 0

    for (const story of prd.stories) {
      if (this.stopped) break

      // Skip already-passed stories
      if (story.status === 'passed') {
        passedCount++
        continue
      }

      await this.waitIfPaused()
      if (this.stopped) break

      this.emit('story_start', {
        storyId: story.id,
        title: story.title,
        priority: story.priority,
      })

      // Mark story as in_progress
      await prisma.story.update({
        where: { id: story.id },
        data: { status: 'in_progress' },
      }).catch(() => { /* best-effort */ })

      // Build the story prompt
      const storyMessage = buildStoryMessage(story, progressJournal)

      let passed = false
      let output = ''

      try {
        output = await this.runStoryAgent(agentId, storyMessage)
        passed = await this.verifyStory(story.acceptanceCriteria, output)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        this.emit('progress', { learning: `Story "${story.title}" failed on first attempt: ${errorMsg}` })
      }

      if (!passed && !this.stopped) {
        // Retry once using LoopEngine (max 2 iterations, same criteria)
        try {
          passed = await this.retryWithLoop(agentId, story, storyMessage, progressJournal)
        } catch {
          passed = false
        }
      }

      const finalStatus: 'passed' | 'failed' = passed ? 'passed' : 'failed'

      await prisma.story.update({
        where: { id: story.id },
        data: { status: finalStatus },
      }).catch(() => { /* best-effort */ })

      this.emit('story_complete', { storyId: story.id, status: finalStatus })

      if (passed) {
        passedCount++
        const learning = `Story "${story.title}" passed. Output summary: ${output.slice(0, 200).replace(/\n+/g, ' ')}`
        progressJournal.push(learning)
        this.emit('progress', { learning })
      } else {
        failedCount++
        const learning = `Story "${story.title}" failed after retry.`
        progressJournal.push(learning)
        this.emit('progress', { learning })
      }
    }

    if (!this.stopped) {
      this.status = 'completed'
      this.emit('pipeline_complete', { passedCount, failedCount })
    }
  }

  pause(): void {
    if (this.status === 'running') {
      this.status = 'paused'
    }
  }

  resume(): void {
    if (this.status === 'paused') {
      this.status = 'running'
      if (this.resumeCallback) {
        const cb = this.resumeCallback
        this.resumeCallback = null
        cb()
      }
    }
  }

  stop(): void {
    this.stopped = true
    this.status = 'stopped'
    this.currentSpawner?.kill()
    this.currentSpawner = null
    this.currentLoopEngine?.stop()
    this.currentLoopEngine = null
    if (this.resumeCallback) {
      this.resumeCallback = null
    }
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private async runStoryAgent(agentId: string, message: string): Promise<string> {
    const config = await buildSpawnConfig(agentId)
    const sessionId = randomUUID()
    const spawner = new ClaudeCodeSpawner()
    this.currentSpawner = spawner

    return new Promise<string>((resolve, reject) => {
      let fullOutput = ''

      spawner.on('text', (data: { content: string; partial: boolean }) => {
        if (!data.partial) {
          fullOutput += data.content
        }
      })

      spawner.on('completion', () => {
        this.currentSpawner = null
        resolve(fullOutput)
      })

      spawner.on('error', (err: Error) => {
        this.currentSpawner = null
        reject(new Error(`Story agent run failed: ${err.message}`))
      })

      try {
        spawner.spawn({
          agentId,
          sessionId,
          message,
          systemPrompt: config.systemPrompt,
          appendSystemPrompt: config.appendSystemPrompt,
          allowedTools: config.allowedTools,
          model: config.model,
          // Story agents run headless with no human to answer the CLI's in-run
          // tool prompt. In a prompting mode the CLI auto-denies any tool not
          // pre-approved via --allowedTools, stalling the agent with "I need your
          // permission…". Run with bypassPermissions so tools execute — matching
          // discussions (turn-router), chain runs (chain-executor) and
          // routes/loops.ts. Spend stays bounded by maxBudgetUsd.
          permissionMode: 'bypassPermissions',
          maxBudgetUsd: config.maxBudgetUsd,
          env: config.env,
        })
      } catch (err) {
        this.currentSpawner = null
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }

  private async retryWithLoop(
    agentId: string,
    story: { id: string; title: string; acceptanceCriteria: string; priority: number },
    originalMessage: string,
    progressJournal: string[],
  ): Promise<boolean> {
    // We can't use LoopEngine.start() directly since the agent may not have
    // loopEnabled=true. Instead run one extra iteration manually via spawner.
    const retryMessage = [
      originalMessage,
      '\n\n## Retry Attempt',
      'The previous attempt did not satisfy the acceptance criteria. Please try again more carefully.',
      progressJournal.length > 0
        ? `\n\n## Prior Context\n${progressJournal.slice(-3).join('\n')}`
        : '',
    ].join('')

    let output = ''
    try {
      output = await this.runStoryAgent(agentId, retryMessage)
    } catch {
      return false
    }

    return this.verifyStory(story.acceptanceCriteria, output)
  }

  private async verifyStory(
    acceptanceCriteria: string,
    output: string,
  ): Promise<boolean> {
    // Check if acceptance criteria contains a test command (lines starting with `$`)
    const testCommandLines = acceptanceCriteria
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('$ '))

    if (testCommandLines.length === 0) {
      // No automated check — story passes if there was output
      return output.trim().length > 0
    }

    for (const line of testCommandLines) {
      const command = line.slice(2).trim()
      const passed = runCommand(command)
      if (!passed) return false
    }

    return true
  }

  private waitIfPaused(): Promise<void> {
    if (this.status !== 'paused') {
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      this.resumeCallback = resolve
    })
  }
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

interface StoryRow {
  title: string
  acceptanceCriteria: string
  priority: number
}

function buildStoryMessage(story: StoryRow, progressJournal: string[]): string {
  const parts: string[] = [
    `# Story: ${story.title}`,
    '',
    '## Acceptance Criteria',
    story.acceptanceCriteria,
  ]

  if (progressJournal.length > 0) {
    parts.push('')
    parts.push('## Context from Completed Stories')
    for (const entry of progressJournal) {
      parts.push(`- ${entry}`)
    }
  }

  return parts.join('\n')
}

function runCommand(command: string): boolean {
  try {
    // [SECURITY] Never use execSync (shell: true). Split command and spawn directly.
    const parts = command.trim().split(/\s+/)
    const [cmd, ...args] = parts
    if (!cmd) return false
    const result = spawnSync(cmd, args, { stdio: 'ignore', timeout: TIMEOUTS.PRD_COMMAND_MS })
    return result.status === 0
  } catch {
    return false
  }
}
