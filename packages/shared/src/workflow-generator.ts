// Workflow Generator — types for AI-generated multi-agent workflows.

import type { AgentPurpose, ModelTier } from './models'
import type { OutputFormat } from './output-format'

/**
 * Output-node config persisted into a saved workflow so the scheduler can honour
 * it for headless/cron runs. Agents are matched by NAME here (the scheduler has
 * no canvas node ids); `'all'` is the robust default. Resolved at save time from
 * the canvas Output node(s).
 */
export interface WorkflowOutputSpec {
  readonly agentSelection: 'all' | readonly string[] // agent NAMES, or 'all'
  readonly format: OutputFormat
  readonly destinationDir?: string
  readonly title?: string
}

/**
 * Email-node config persisted into a saved workflow so the scheduler can send
 * the report on headless/cron runs. Like {@link WorkflowOutputSpec}, agents are
 * matched by NAME (no canvas node ids headless). Only enabled Email nodes are
 * resolved into a spec at save time. The body is always HTML (markdown→HTML).
 */
export interface WorkflowEmailSpec {
  readonly agentSelection: 'all' | readonly string[] // agent NAMES, or 'all'
  readonly recipients: string // comma-separated; parsed/validated at send time
  readonly subject?: string
  readonly title?: string
}

export interface GeneratedAgent {
  readonly tempId: string
  readonly name: string
  readonly description: string
  readonly persona: string
  readonly purpose: AgentPurpose
  readonly model: ModelTier
  readonly suggestedSkills: readonly string[]
}

export interface GeneratedEdge {
  readonly from: string
  readonly to: string
  readonly condition?: string
}

export interface GeneratedWorkflow {
  readonly name: string
  readonly agents: readonly GeneratedAgent[]
  readonly edges: readonly GeneratedEdge[]
  readonly directorEnabled: boolean
  /** Output-node specs for headless/scheduled honouring; omitted when none. */
  readonly outputs?: readonly WorkflowOutputSpec[]
  /** Email-node specs for headless/scheduled sending; omitted when none. */
  readonly emails?: readonly WorkflowEmailSpec[]
}

export interface GeneratedAgentWithPosition extends GeneratedAgent {
  readonly position: { readonly x: number; readonly y: number }
}

export interface GeneratedWorkflowWithLayout extends Omit<GeneratedWorkflow, 'agents'> {
  readonly agents: readonly GeneratedAgentWithPosition[]
}
