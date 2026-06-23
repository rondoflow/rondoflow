// ModeratorEngine — state machine for multi-agent Discussion Table sessions.
//
// State transitions:
//   setup → moderator_opening → participant_turn → moderator_evaluation
//          ↓                                              ↓
//        error                               (continue) participant_turn
//                                            (synthesize or maxRounds) synthesis → concluded
//
// Each agent spawn is a fresh process (no long-lived sessions).
// State is checkpointed to the DB after every round for crash recovery.

import { EventEmitter } from 'events'
import { prisma } from '../lib/prisma'
import { TurnRouter } from './turn-router'
import {
  buildOpeningPrompt,
  buildParticipantPrompt,
  buildEvaluationPrompt,
  buildSynthesisPrompt,
} from './prompts'
import type { DiscussionFormat, ParticipantRole } from '@rondoflow/shared'

// Minimal shape of the Agent DB record used by the engine.
// Mirrors the fields selected in discussions.ts/handlers.ts includes.
export interface AgentRecord {
  readonly id: string
  readonly name: string
  readonly persona: string
  readonly model: string | null
  readonly allowedTools: string[]
  readonly purpose: string | null
  readonly memoryEnabled: boolean
  readonly status: string
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type DiscussionState =
  | 'setup'
  | 'moderator_opening'
  | 'participant_turn'
  | 'moderator_evaluation'
  | 'synthesis'
  | 'concluded'
  | 'paused'
  | 'error'

export interface Round {
  readonly participantId: string
  readonly participantName: string
  readonly question: string
  readonly response: string
  readonly timestamp: Date
}

export interface ModeratorDecision {
  readonly decision: 'continue' | 'synthesize'
  readonly nextParticipantId?: string
  readonly question?: string
  readonly synthesis?: string
  readonly reasoning: string
}

export interface ModeratorEngineEvents {
  state_change: (state: DiscussionState) => void
  turn: (round: Round) => void
  moderator_decision: (decision: ModeratorDecision) => void
  concluded: (synthesis: string) => void
  error: (err: Error) => void
}

// ---------------------------------------------------------------------------
// ModeratorEngine
// ---------------------------------------------------------------------------

export class ModeratorEngine extends EventEmitter {
  private state: DiscussionState = 'setup'
  private readonly rounds: Round[] = []
  private currentRound = 0

  // Accumulated discussion context — each turn is appended here
  private accumulatedContext = ''

  // Session record id for message persistence
  private sessionId: string | null = null

  // Resume-after-pause support: store next participant + question
  private pendingNextParticipantId: string | null = null
  private pendingNextQuestion: string | null = null

  // Set to true when pause() is called; the run loop checks this
  private pauseRequested = false

  // Set to true when stop() is called (teardown on disconnect/shutdown). Unlike
  // pause, this is terminal: the loop bails without scheduling a resume, the
  // in-flight turn's process is killed, and handleError suppresses the resulting
  // abort error so a deliberate stop doesn't surface as a discussion failure.
  private stopped = false

  private readonly turnRouter: TurnRouter

  constructor(
    private readonly tableId: string,
    private readonly topic: string,
    private readonly format: DiscussionFormat,
    private readonly moderator: AgentRecord,
    private readonly participants: ReadonlyArray<{ agent: AgentRecord; role: ParticipantRole }>,
    private readonly maxRounds: number,
  ) {
    super()
    // Guard against a non-positive cap reaching the loop out of band: the loop
    // runs one turn before checking `currentRound >= maxRounds`, so maxRounds < 1
    // would conclude after a single turn. The route schema enforces min(1), but
    // this protects engines constructed elsewhere.
    if (!Number.isInteger(maxRounds) || maxRounds < 1) {
      throw new Error(`maxRounds must be a positive integer, got ${maxRounds}`)
    }
    this.turnRouter = new TurnRouter()
  }

  // ---------------------------------------------------------------------------
  // Public lifecycle methods
  // ---------------------------------------------------------------------------

  async start(): Promise<void> {
    if (this.state !== 'setup') {
      throw new Error(`Cannot start discussion in state '${this.state}'. Expected 'setup'.`)
    }

    // Create a DB session to attach all messages to
    const session = await prisma.agentSession.create({
      data: { tableId: this.tableId },
    })
    this.sessionId = session.id

    // Mark the discussion as active
    await prisma.discussionTable.update({
      where: { id: this.tableId },
      data: { status: 'active' },
    })

    await this.runMachineFromState()
  }

  pause(): void {
    if (this.state === 'concluded' || this.state === 'error') return
    this.pauseRequested = true
    this.transitionTo('paused')
  }

  async resume(): Promise<void> {
    if (this.state !== 'paused') {
      throw new Error(`Cannot resume discussion in state '${this.state}'. Expected 'paused'.`)
    }
    this.pauseRequested = false

    // Resume from where we left off
    if (this.pendingNextParticipantId && this.pendingNextQuestion) {
      await this.runParticipantTurnLoop(
        this.pendingNextParticipantId,
        this.pendingNextQuestion,
      )
    } else {
      // No pending turn — fall through to evaluation or synthesis
      await this.runMachineFromState()
    }
  }

  async conclude(): Promise<void> {
    if (this.state === 'concluded') return
    // Force-synthesize with whatever context we have accumulated
    await this.runSynthesis()
  }

  /**
   * Hard stop for teardown (client fully disconnected, or server shutting down).
   * Kills the in-flight turn's child process and prevents further turns. The DB
   * row is finalized to 'concluded' — the only terminal value in DiscussionStatus
   * (draft/active/concluded) — so a torn-down discussion isn't left stuck 'active'.
   * Idempotent.
   */
  stop(): void {
    if (this.state === 'concluded' || this.state === 'error') return
    this.stopped = true
    this.turnRouter.abort()
    this.transitionTo('paused')
    void prisma.discussionTable
      .update({ where: { id: this.tableId }, data: { status: 'concluded' } })
      .catch(() => { /* best-effort terminal write */ })
  }

  // ---------------------------------------------------------------------------
  // State machine
  // ---------------------------------------------------------------------------

  private async runMachineFromState(): Promise<void> {
    try {
      // Opening: moderator selects first participant and asks opening question
      this.transitionTo('moderator_opening')

      const openingResult = await this.runModeratorOpening()
      if (!openingResult) return   // error already emitted inside

      // Enter participant turn loop
      await this.runParticipantTurnLoop(
        openingResult.nextParticipantId,
        openingResult.question,
      )
    } catch (err) {
      this.handleError(err)
    }
  }

  /**
   * Spawn the moderator for the opening turn.
   * Returns the first participant id and their opening question, or null on failure.
   */
  private async runModeratorOpening(): Promise<{ nextParticipantId: string; question: string } | null> {
    const participantInfos = this.participants.map((p) => ({
      agentId: p.agent.id,
      agentName: p.agent.name,
      role: p.role,
    }))

    const prompt = buildOpeningPrompt(this.topic, this.format, participantInfos)

    let decisionResult
    try {
      decisionResult = await this.turnRouter.executeModeratorTurn(
        this.moderator,
        prompt,
        '',
      )
    } catch (err) {
      this.handleError(err)
      return null
    }

    const decision = decisionResult.parsed

    if (!decision || !decision.nextParticipantId || !decision.question) {
      // Moderator did not return parseable structured output — fall back to round-robin
      const firstParticipant = this.getActiveParticipants()[0]
      if (!firstParticipant) {
        this.handleError(new Error('No participants configured for this discussion'))
        return null
      }
      return {
        nextParticipantId: firstParticipant.agent.id,
        question: `Please share your perspective on: ${this.topic}`,
      }
    }

    this.emit('moderator_decision', decision)
    await this.persistModeratorMessage(
      `[MODERATOR OPENING] Chose ${decision.nextParticipantId} first. ${decision.reasoning}`,
    )

    return {
      nextParticipantId: decision.nextParticipantId,
      question: decision.question,
    }
  }

  /**
   * Main turn loop: participant turn → moderator evaluation → repeat or synthesize.
   */
  private async runParticipantTurnLoop(
    firstParticipantId: string,
    firstQuestion: string,
  ): Promise<void> {
    let nextParticipantId = firstParticipantId
    let nextQuestion = firstQuestion

    while (true) {
      // Teardown stop is terminal — bail immediately without scheduling a resume.
      if (this.stopped) return

      // Honour pause requests between turns. Storing the upcoming participant +
      // question here (and transitioning to 'paused') is what lets resume()
      // continue from the next turn rather than restarting the discussion.
      if (this.pauseRequested) {
        this.pendingNextParticipantId = nextParticipantId
        this.pendingNextQuestion = nextQuestion
        this.transitionTo('paused')
        return
      }

      this.transitionTo('participant_turn')
      this.currentRound += 1

      const participant = this.findParticipant(nextParticipantId)
      if (!participant) {
        // Participant not found — pick round-robin fallback
        const fallback = this.getActiveParticipants()[this.currentRound % this.getActiveParticipants().length]
        if (!fallback) {
          this.handleError(new Error(`Participant ${nextParticipantId} not found and no fallback available`))
          return
        }
        nextParticipantId = fallback.agent.id
      }

      const activeParticipant = this.findParticipant(nextParticipantId) ?? this.getActiveParticipants()[0]
      if (!activeParticipant) {
        this.handleError(new Error('No active participants'))
        return
      }

      // Execute participant turn (may timeout)
      let turnResult
      try {
        turnResult = await this.turnRouter.executeTurn(
          activeParticipant.agent,
          nextQuestion,
          this.accumulatedContext,
        )
      } catch (err) {
        // Participant timed out or errored — record timeout and continue
        const timeoutMessage = `Agent ${activeParticipant.agent.name} timed out or failed: ${err instanceof Error ? err.message : String(err)}`
        const timeoutRound: Round = {
          participantId: activeParticipant.agent.id,
          participantName: activeParticipant.agent.name,
          question: nextQuestion,
          response: '[Agent timed out — no response provided]',
          timestamp: new Date(),
        }
        this.rounds.push(timeoutRound)
        this.appendToContext(activeParticipant.agent.name, nextQuestion, '[Timed out — no response]')
        this.emit('turn', timeoutRound)
        await this.persistParticipantMessage(activeParticipant.agent.name, nextQuestion, '[Timed out]')

        // Notify moderator evaluation with timeout note for context
        void timeoutMessage
        // Fall through to evaluation below using what we have
        turnResult = null
      }

      // A stop() during the turn killed the spawner — bail before persisting a
      // partial/empty round or starting the moderator evaluation spawn.
      if (this.stopped) return

      if (turnResult) {
        const round: Round = {
          participantId: turnResult.agentId,
          participantName: turnResult.agentName,
          question: nextQuestion,
          response: turnResult.response,
          timestamp: new Date(),
        }
        this.rounds.push(round)
        this.appendToContext(turnResult.agentName, nextQuestion, turnResult.response)
        this.emit('turn', round)
        await this.persistParticipantMessage(turnResult.agentName, nextQuestion, turnResult.response)
      }

      // Checkpoint state to DB
      await this.checkpoint()

      // Check if we've hit max rounds
      if (this.currentRound >= this.maxRounds) {
        await this.runSynthesis()
        return
      }

      // A pause requested during this turn is honoured at the top of the next
      // loop iteration, which stores the *next* participant/question so resume()
      // continues from there. We intentionally run the moderator evaluation first
      // (rather than bailing here) so the next turn target is known — bailing here
      // previously discarded the pending turn and made resume() restart the whole
      // discussion from the opening.

      // Moderator evaluation
      this.transitionTo('moderator_evaluation')

      let decision: ModeratorDecision | undefined
      try {
        const evalResult = await this.runModeratorEvaluation()
        decision = evalResult
      } catch (err) {
        this.handleError(err)
        return
      }

      if (!decision) {
        // Moderator could not produce a decision — force synthesis
        await this.runSynthesis()
        return
      }

      this.emit('moderator_decision', decision)

      if (decision.decision === 'synthesize') {
        // Use the synthesis the moderator already provided in the decision
        if (decision.synthesis && decision.synthesis.trim().length > 0) {
          await this.concludeWithSynthesis(decision.synthesis)
        } else {
          await this.runSynthesis()
        }
        return
      }

      // Continue — set up next turn
      nextParticipantId = decision.nextParticipantId ?? this.nextRoundRobinParticipantId()
      nextQuestion = decision.question ?? `Please continue sharing your perspective on: ${this.topic}`
    }
  }

  /**
   * Ask the moderator to evaluate and decide: continue or synthesize.
   */
  private async runModeratorEvaluation(): Promise<ModeratorDecision | undefined> {
    const prompt = buildEvaluationPrompt(
      this.topic,
      this.accumulatedContext,
      this.currentRound,
      this.maxRounds,
    )

    const result = await this.turnRouter.executeModeratorTurn(
      this.moderator,
      prompt,
      '',
    )

    if (result.parsed) {
      await this.persistModeratorMessage(
        `[MODERATOR EVALUATION - Round ${this.currentRound}] Decision: ${result.parsed.decision}. ${result.parsed.reasoning}`,
      )
      return result.parsed
    }

    // Fallback: if we can't parse the decision and rounds remain, continue round-robin
    if (this.currentRound < this.maxRounds) {
      const fallbackDecision: ModeratorDecision = {
        decision: 'continue',
        nextParticipantId: this.nextRoundRobinParticipantId(),
        question: `Please continue the discussion on: ${this.topic}. Build on what has been shared so far.`,
        reasoning: 'Moderator response was unparseable — defaulting to round-robin continuation',
      }
      return fallbackDecision
    }

    return undefined
  }

  /**
   * Spawn the moderator for final synthesis.
   * Used when decision is 'synthesize' but no synthesis text was provided,
   * or when maxRounds is exhausted.
   */
  private async runSynthesis(): Promise<void> {
    this.transitionTo('synthesis')

    const prompt = buildSynthesisPrompt(this.topic, this.accumulatedContext, this.format)

    let synthesis: string
    try {
      const result = await this.turnRouter.executeModeratorTurn(
        this.moderator,
        prompt,
        '',
      )
      synthesis = result.raw.trim()
    } catch (err) {
      // Synthesis failed — use accumulated context as fallback
      synthesis = `Discussion concluded. ${err instanceof Error ? err.message : 'Synthesis generation failed.'}\n\nDiscussion transcript:\n${this.accumulatedContext}`
    }

    if (synthesis.length === 0) {
      synthesis = `The discussion on "${this.topic}" has concluded. See transcript for details.`
    }

    await this.concludeWithSynthesis(synthesis)
  }

  /**
   * Persist the conclusion to the DB and emit the concluded event.
   */
  private async concludeWithSynthesis(synthesis: string): Promise<void> {
    try {
      await prisma.discussionTable.update({
        where: { id: this.tableId },
        data: { status: 'concluded', conclusion: synthesis },
      })

      if (this.sessionId) {
        await prisma.agentSession.update({
          where: { id: this.sessionId },
          data: { endedAt: new Date() },
        })
      }

      await this.persistModeratorMessage(`[SYNTHESIS]\n${synthesis}`)
    } catch {
      // Best-effort — do not block the concluded event
    }

    this.transitionTo('concluded')
    this.emit('concluded', synthesis)
  }

  // ---------------------------------------------------------------------------
  // Context management
  // ---------------------------------------------------------------------------

  private appendToContext(agentName: string, question: string, response: string): void {
    const entry = `\n**[${agentName}]**\nQuestion: ${question}\nResponse: ${response}\n`
    this.accumulatedContext = this.accumulatedContext + entry
  }

  // ---------------------------------------------------------------------------
  // Participant helpers
  // ---------------------------------------------------------------------------

  private findParticipant(agentId: string): { agent: AgentRecord; role: ParticipantRole } | undefined {
    return this.participants.find((p) => p.agent.id === agentId)
  }

  private getActiveParticipants(): ReadonlyArray<{ agent: AgentRecord; role: ParticipantRole }> {
    // Observers are excluded from speaking turns
    return this.participants.filter((p) => p.role !== 'observer')
  }

  private nextRoundRobinParticipantId(): string {
    const active = this.getActiveParticipants()
    if (active.length === 0) return this.participants[0]?.agent.id ?? ''
    const index = this.currentRound % active.length
    return active[index]?.agent.id ?? active[0]?.agent.id ?? ''
  }

  // ---------------------------------------------------------------------------
  // State machine transitions
  // ---------------------------------------------------------------------------

  private transitionTo(newState: DiscussionState): void {
    this.state = newState
    this.emit('state_change', newState)
  }

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------

  private handleError(err: unknown): void {
    // A deliberate stop() aborts the in-flight turn, which surfaces here as an
    // error. Suppress it: the run is being torn down, not failing.
    if (this.stopped) return

    const error = err instanceof Error ? err : new Error(String(err))
    this.transitionTo('error')

    void prisma.discussionTable
      .update({ where: { id: this.tableId }, data: { status: 'concluded' } })
      .catch(() => { /* best-effort */ })

    this.emit('error', error)
  }

  // ---------------------------------------------------------------------------
  // DB persistence helpers
  // ---------------------------------------------------------------------------

  private async persistModeratorMessage(content: string): Promise<void> {
    if (!this.sessionId) return
    try {
      await prisma.message.create({
        data: {
          sessionId: this.sessionId,
          role: 'assistant',
          content: `[MODERATOR] ${content}`,
        },
      })
    } catch {
      // Best-effort
    }
  }

  private async persistParticipantMessage(
    agentName: string,
    question: string,
    response: string,
  ): Promise<void> {
    if (!this.sessionId) return
    try {
      await prisma.message.create({
        data: {
          sessionId: this.sessionId,
          role: 'assistant',
          content: `[${agentName}] Q: ${question}\n\nA: ${response}`,
        },
      })
    } catch {
      // Best-effort
    }
  }

  /**
   * Checkpoint: save current round count and partial context to the DB
   * so the discussion can resume after a server crash.
   */
  private async checkpoint(): Promise<void> {
    try {
      await prisma.discussionTable.update({
        where: { id: this.tableId },
        data: {
          // Store current round progress in the conclusion field as interim state.
          // The conclusion field is overwritten with the actual synthesis at the end.
          conclusion: `[checkpoint:round=${this.currentRound}/${this.maxRounds}]`,
        },
      })
    } catch {
      // Best-effort
    }
  }

  // ---------------------------------------------------------------------------
  // Accessors (useful for tests and the socket handler)
  // ---------------------------------------------------------------------------

  get currentState(): DiscussionState {
    return this.state
  }

  get roundCount(): number {
    return this.currentRound
  }

  get completedRounds(): readonly Round[] {
    return this.rounds
  }
}
