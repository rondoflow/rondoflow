// AgentRunner — the modular execution backend behind an agent.
//
// The chain executor and process manager don't care HOW an agent runs, only
// that it exposes the spawner's event contract (text/tool_use/tool_result/
// usage/completion/error) plus spawn/sendMessage/kill and the pid/isRunning
// liveness signals the watchdog reads. `ClaudeCodeSpawner` already satisfies
// this surface structurally, so the abstraction adds the OpenAI path without
// changing any existing wiring — `createAgentRunner` is the single swap-in.

import type { SpawnOptions, SpawnerEvents } from './spawner'
import { ClaudeCodeSpawner } from './spawner'
import { OpenAIRunner } from './openai-runner'
import { PerplexityRunner } from './perplexity-runner'
import type { AgentProviderId } from '@rondoflow/shared'

export interface AgentRunner {
  on<K extends keyof SpawnerEvents>(event: K, listener: SpawnerEvents[K]): this
  spawn(options: SpawnOptions): void
  sendMessage(message: string): void
  kill(): void
  readonly isRunning: boolean
  readonly pid: number | null
}

/**
 * Returns the runner for a provider. Defaults to the Claude Code CLI spawner,
 * so an unset/unknown provider behaves exactly as before this abstraction.
 */
export function createAgentRunner(provider: AgentProviderId | undefined): AgentRunner {
  switch (provider) {
    case 'openai':
      return new OpenAIRunner()
    case 'perplexity':
      return new PerplexityRunner()
    case 'claude-code':
    default:
      return new ClaudeCodeSpawner()
  }
}
