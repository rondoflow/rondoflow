import type { AgentMode } from './agent'

export interface CanvasViewport {
  readonly x: number
  readonly y: number
  readonly zoom: number
}

export type EdgeType = 'association' | 'flow' | 'conditional'

export interface CanvasNodeData {
  readonly id: string
  readonly type:
    | 'agent'
    | 'skill'
    | 'policy'
    | 'discussion'
    | 'mcp'
    | 'start'
    | 'resource'
    | 'note'
    | 'output'
    | 'email'
    | 'condition'
    | 'structurer'
    | 'db-save'
    | 'http-request'
    | 'duckduckgo-search'
    | 'sakana-ai'
  readonly position: { readonly x: number; readonly y: number }
  readonly data: Record<string, unknown>
}

export interface CanvasEdgeData {
  readonly id: string
  readonly source: string
  readonly target: string
  readonly type: EdgeType
  readonly condition?: string
}

// ─── Condition node ─────────────────────────────────────────────────────────
// A Condition node is a pure router placed in the flow: one agent feeds into it,
// and each branch wires to a downstream agent. At run time the upstream agent's
// output (its last non-empty line) is matched against each branch in order; the
// first matching branch runs, else the fallback branch runs. The node spawns no
// agent — it is compiled away into grouped conditional edges before execution.

export type ConditionMatchKind = 'contains' | 'regex'

export interface ConditionBranchSpec {
  /** Handle id (uuid) — stable across save/load; edges store it as sourceHandle. */
  readonly id: string
  /** Display label, e.g. "Approved" / "Rejected" / "Custom". */
  readonly label: string
  readonly kind: ConditionMatchKind
  /** Keyword(s) for 'contains', regex source for 'regex'. Ignored when isElse. */
  readonly pattern: string
  /** The default/fallback branch — runs when no other branch matched. */
  readonly isElse?: boolean
}

export interface CanvasLayout {
  readonly id: string
  readonly name: string
  readonly workspaceId: string
  readonly viewport: CanvasViewport
  readonly nodes: readonly CanvasNodeData[]
  readonly edges: readonly CanvasEdgeData[]
  readonly updatedAt: string
}

export interface Workspace {
  readonly id: string
  readonly name: string
  readonly createdAt: string
  readonly updatedAt: string
}

// ─── Canvas export / import (share setups) ──────────────────────────────────
// A self-contained, shareable snapshot of an entire workspace canvas. Because
// canvas nodes reference DB entities by id (agent nodes use the agent's id as
// their node id, skill nodes carry a `skillId`, etc.), a layout alone is not
// portable across instances. The bundle therefore embeds the full definition of
// every referenced agent, skill and MCP server so the importer can recreate them
// and remap ids. Secrets (MCP `env`, secret resources) are intentionally omitted.

/** Discriminator value identifying a rondoflow canvas bundle file. */
export const CANVAS_EXPORT_FORMAT = 'rondoflow-canvas'

/** Current bundle schema version. Bump on breaking changes to the shape. */
export const CANVAS_EXPORT_VERSION = 1

/** A policy attached to an exported agent. */
export interface ExportedPolicy {
  readonly name: string
  readonly level: 'global' | 'agent' | 'session'
  readonly rules: Record<string, unknown>
}

/** Full definition of an agent node, keyed by its original canvas node id. */
export interface ExportedAgent {
  /** Original node id on the source canvas — used to remap nodes/edges. */
  readonly nodeId: string
  readonly name: string
  readonly persona: string
  readonly description?: string | null
  readonly purpose?: string | null
  readonly avatar?: string | null
  readonly model?: string | null
  readonly scope: readonly string[]
  readonly allowedTools: readonly string[]
  readonly permissionMode: AgentMode
  readonly memoryEnabled: boolean
  readonly isFacilitator: boolean
  /** Names of installed skills attached to this agent (re-linked on import). */
  readonly skills: readonly string[]
  /** Names of MCP servers assigned to this agent (re-linked on import). */
  readonly mcpServers: readonly string[]
  readonly policies: readonly ExportedPolicy[]
}

/** A referenced skill definition. `id` is the original id, used to remap
 *  skill-node `skillId` references; resolution on import is by `name`. */
export interface ExportedSkill {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly source: 'marketplace' | 'git' | 'custom'
  readonly gitUrl?: string | null
  readonly version?: string | null
  readonly author?: string | null
  readonly category?: string | null
  readonly icon?: string | null
}

/** A referenced MCP server definition. `env`/`auth` secrets are omitted — they
 *  are not shared across instances. */
export interface ExportedMcpServer {
  readonly name: string
  readonly description?: string | null
  readonly type: string
  /** stdio servers only. */
  readonly command?: string | null
  readonly args: readonly string[]
  /** http/sse servers only. */
  readonly url?: string | null
}

/** The portable canvas bundle produced by export and consumed by import. */
export interface CanvasExportBundle {
  readonly format: typeof CANVAS_EXPORT_FORMAT
  readonly version: number
  readonly exportedAt: string
  readonly workspace: {
    readonly name: string
    readonly contextDocument?: string | null
    readonly planDocument?: string | null
  }
  readonly viewport: CanvasViewport
  readonly nodes: readonly CanvasNodeData[]
  readonly edges: readonly CanvasEdgeData[]
  readonly agents: readonly ExportedAgent[]
  readonly skills: readonly ExportedSkill[]
  readonly mcpServers: readonly ExportedMcpServer[]
}

/** Summary returned by the import endpoint describing what was created/skipped. */
export interface CanvasImportReport {
  readonly workspaceId: string
  readonly workspaceName: string
  readonly agentsCreated: number
  readonly skillsReused: number
  readonly skillsInstalled: number
  readonly skillsSkipped: readonly string[]
  readonly mcpServersCreated: number
  readonly mcpServersReused: number
  readonly warnings: readonly string[]
}
