'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Node, Edge } from '@xyflow/react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { WorkspaceTabs } from '@/components/shell/workspace-tabs'
import { BottomBar } from '@/components/shell/bottom-bar'
import { CanvasPlaceholder } from '@/components/canvas/canvas-placeholder'
import { OnboardingWizard, type OnboardingResult } from '@/components/onboarding/onboarding-wizard'
import { CliMissingBanner } from '@/components/shell/cli-missing-banner'
import { useOnboarding, restartOnboarding } from '@/hooks/use-onboarding'
import { usePrerequisites } from '@/hooks/use-prerequisites'
import { AgentCreateDialog } from '@/components/panels/agent-create-dialog'
import { TemplateGallery } from '@/components/canvas/template-gallery'
import { CANVAS_TEMPLATES, materializeCanvasTemplate } from '@/lib/canvas-templates'
import { CommandPalette } from '@/components/shell/command-palette'
import { formatRunOutput, OUTPUT_FORMAT_EXT, parseDataset, ANTHROPIC, NETWORK } from '@rondoflow/shared'
import type { CreateAgentInput } from '@rondoflow/shared'
import type { ClaudeConnectionResult } from '@rondoflow/shared'
import type { CanvasExportBundle, CanvasImportReport, McpServerInput } from '@rondoflow/shared'
import { createAgentNode, ensureStartNode, ensureStartEdges, normalizeLoadedCanvas, parseRecipients, withStartNodeStatus } from '@/lib/canvas-utils'
import { findWorkspacePreset, type WorkspacePreset } from '@rondoflow/catalog'
import { apiPost, apiDelete } from '@/lib/api'
import { RondoflowCanvas, type UndoRedoControls } from '@/components/canvas/rondoflow-canvas'
import { NodeFinder } from '@/components/canvas/node-finder'
import { CanvasPalette } from '@/components/canvas/canvas-palette'
import { CanvasReadOnlyProvider } from '@/components/canvas/canvas-read-only'
import { WorkflowToolbar } from '@/components/canvas/workflow-toolbar'
import { DirectorDrawer } from '@/components/panels/director-drawer'
import { OutputNodeDrawer } from '@/components/panels/output-node-drawer'
import { EmailNodeDrawer } from '@/components/panels/email-node-drawer'
import { ConditionNodeDrawer } from '@/components/panels/condition-node-drawer'
import { StructurerNodeDrawer } from '@/components/panels/structurer-node-drawer'
import { DbSaveNodeDrawer } from '@/components/panels/db-save-node-drawer'
import { HttpRequestNodeDrawer } from '@/components/panels/http-request-node-drawer'
import { DuckDuckGoSearchNodeDrawer } from '@/components/panels/duckduckgo-search-node-drawer'
import { SakanaAiNodeDrawer } from '@/components/panels/sakana-ai-node-drawer'
import { SavedDatasetsPanel } from '@/components/panels/saved-datasets-panel'
import { WorkflowChat, type WorkflowLogEntry } from '@/components/panels/workflow-chat'
import { hasAgentChain, buildChain, buildChainDefinition, buildWorkflowOutputs, buildWorkflowEmails, lintConditionWorkflow } from '@/lib/chain-utils'
import { getSocket } from '@/lib/socket'
import { ShortcutOverlay } from '@/components/shell/shortcut-overlay'
import { AgentChat } from '@/components/panels/agent-chat'
import { ApprovalDialog } from '@/components/panels/approval-dialog'
import { SkillMarketplace } from '@/components/panels/skill-marketplace'
import { DiscussionWizard, type DiscussionAgent } from '@/components/panels/discussion-wizard'
import { DiscussionPanel } from '@/components/panels/discussion-panel'
import { DiscussionsList } from '@/components/panels/discussions-list'
import { HistoryPanel } from '@/components/panels/history-panel'
import { SettingsPanel } from '@/components/panels/settings-panel'
import { UsersPanel } from '@/components/panels/users-panel'
import { ResourceBrowser, type ResourceCounts } from '@/components/panels/resource-browser'
import { ExternalFoldersPanel } from '@/components/panels/external-folders-panel'
import { McpManagement, type McpServer } from '@/components/panels/mcp-management'
import type { AgentMcpAssignment } from '@/components/panels/agent-mcp-tab'
import { PrdEditor, type PrdData } from '@/components/panels/prd-editor'
import { AssistantsList, type AssistantSummary } from '@/components/panels/assistants-list'
import { FacilitatorList } from '@/components/panels/facilitator-list'
import { GlobalSafetyPanel } from '@/components/panels/global-safety-panel'
import { AgentDrawer } from '@/components/panels/agent-drawer'
import { QuickRunBar } from '@/components/shell/quick-run-bar'
import { ActivityFeed } from '@/components/panels/activity-feed'
import { AuditLogDashboard } from '@/components/panels/audit-log-dashboard'
import { WorkspaceContextEditor } from '@/components/panels/workspace-context-editor'
import { WorkspacePlanEditor } from '@/components/panels/workspace-plan-editor'
import { GitPanel } from '@/components/panels/git-panel'
import { CostDashboard } from '@/components/panels/cost-dashboard'
import { AnalyticsDashboard } from '@/components/panels/analytics-dashboard'
import { MemoryPanel } from '@/components/panels/memory-panel'
import { WorkflowReviewDialog } from '@/components/panels/workflow-review-dialog'
import { SchedulesPanel } from '@/components/panels/schedules-panel'
import { OutputLogPreview } from '@/components/panels/output-log-preview'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { toast } from '@/components/ui/toast'
import { apiGet, apiPatch } from '@/lib/api'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { ComplexityContext, useComplexityState } from '@/hooks/use-complexity'
import { useSocket } from '@/hooks/use-socket'
import { useCanvasPersistence } from '@/hooks/use-canvas-persistence'
import { useAgentStatus } from '@/hooks/use-agent-status'
import { useNotifications } from '@/hooks/use-notifications'
import { injectMessagesIntoCache, type ChatMessage } from '@/hooks/use-agent-stream'
import { runToLogEntries, runToSteps, type RunDetail, type RunSummary } from '@/lib/run-history'
import { useApprovals } from '@/hooks/use-approvals'
import { usePanel } from '@/hooks/use-panel'
import { useRole } from '@/hooks/use-role'
import type { AgentNodeData, OutputNodeData, EmailNodeData, ConditionNodeData, StructurerNodeData, DbSaveNodeData, HttpRequestNodeData, DuckDuckGoSearchNodeData, SakanaAiNodeData } from '@/lib/canvas-utils'
import type { Agent, AgentStatus, DiscussionTable, CreateDiscussionInput } from '@rondoflow/shared'
import type { rondoflowNotification } from '@/hooks/use-notifications'

// ─── Types ─────────────────────────────────────────────────────────────────

/** Which secondary panel the workspace view is currently tracking. */
type PanelTab = 'workspace' | 'discussions' | 'history'

interface SelectedAgent {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly purpose?: string
  readonly status: AgentStatus
  readonly model?: string
}

// ─── Page ──────────────────────────────────────────────────────────────────

/** Delay before opening a right-side panel after closing the workflow chat sheet,
 *  so the two sheets don't briefly co-mount (matches the sheet close animation). */
const SHEET_TRANSITION_MS = 200

/** Structural fingerprint of the canvas used to detect unsaved changes. Volatile
 *  per-run fields (`status`, `chainState`) are excluded so the "unsaved" highlight
 *  doesn't flicker while a workflow is executing. */
function canvasDirtyKey(nodes: Node[], edges: Edge[]): string {
  return JSON.stringify({
    n: nodes.map((n) => {
      const data = (n.data ?? {}) as Record<string, unknown>
      const stable = Object.fromEntries(
        Object.entries(data).filter(([k]) => k !== 'status' && k !== 'chainState'),
      )
      return { i: n.id, t: n.type, x: Math.round(n.position.x), y: Math.round(n.position.y), d: stable }
    }),
    e: edges.map((e) => ({ i: e.id, s: e.source, t: e.target, d: e.data })),
  })
}

export default function Home() {
  const { t } = useTranslation('app')
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  // ── Panel manager: one right-side panel at a time ──
  const { panel, openPanel, closePanel, isOpen } = usePanel()
  // ── Role-based capabilities (server is the real authority; this is UX) ──
  const { canEdit, canRun, canManageUsers } = useRole()

  // ── Onboarding ──
  const { showWizard, completeWizard } = useOnboarding()
  const { cliInstalled, loading: cliLoading, recheck: recheckCli } = usePrerequisites()

  // ── Dialog states (modals overlay, don't compete with panels) ──
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [discussionWizardOpen, setDiscussionWizardOpen] = useState(false)
  const [quickRunOpen, setQuickRunOpen] = useState(false)
  const [createAgentOpen, setCreateAgentOpen] = useState(false)
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [nodeFinderOpen, setNodeFinderOpen] = useState(false)

  // ── Non-panel state ──
  const [selectedAgent, setSelectedAgent] = useState<SelectedAgent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<import('@rondoflow/shared').GeneratedWorkflowWithLayout | null>(null)
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionTable | null>(null)
  const [activeTab, setActiveTab] = useState<PanelTab>('workspace')
  const [discussions, setDiscussions] = useState<DiscussionTable[]>([])
  const [mcpServers, setMcpServers] = useState<McpServer[]>([])
  const [mcpAssignments, setMcpAssignments] = useState<AgentMcpAssignment[]>([])
  const [workflowRunning, setWorkflowRunning] = useState(false)
  const [workflowStep, setWorkflowStep] = useState<{ index: number; total: number; agentName: string } | null>(null)
  const [workflowChatOpen, setWorkflowChatOpen] = useState(false)
  const [workflowLog, setWorkflowLog] = useState<WorkflowLogEntry[]>([])
  const [workflowMode, setWorkflowMode] = useState<import('@rondoflow/shared').AgentMode>('default')
  // How this workflow run handles tool permissions: 'auto' runs everything,
  // 'perStep' pauses for approval before each agent step. Defaults to 'auto' so
  // tools like WebSearch are no longer denied ("requires permission approval").
  const [workflowApprovalMode, setWorkflowApprovalMode] = useState<import('@rondoflow/shared').ChainApprovalMode>('auto')
  const [directorEnabled, setDirectorEnabled] = useState(true)
  const [plannerEnabled, setPlannerEnabled] = useState(false)
  const [plannerStatus, setPlannerStatus] = useState<'idle' | 'planning' | 'done'>('idle')
  const [directorRigor, setDirectorRigor] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [directorCustomInstructions, setDirectorCustomInstructions] = useState('')
  const [directorStatus, setDirectorStatus] = useState<'idle' | 'thinking' | 'decided'>('idle')
  const [directorLastAction, setDirectorLastAction] = useState<'continue' | 'redirect' | 'conclude' | null>(null)
  const [directorLastTargetAgent, setDirectorLastTargetAgent] = useState<string | null>(null)
  const [advisorRunning, setAdvisorRunning] = useState(false)
  const [advisorModel, setAdvisorModel] = useState<string>(ANTHROPIC.UTILITY_MODEL)
  const [workspaceWorkingDir, setWorkspaceWorkingDir] = useState<string | null>(null)
  // When opening the saved-output log, optionally auto-select this file's preview (by name).
  const [outputLogInitialName, setOutputLogInitialName] = useState<string | null>(null)
  // Directory the output-log preview scans; null falls back to the workspace dir.
  // Set when opening an Output node's saved file from a custom destination folder.
  const [outputLogDirectory, setOutputLogDirectory] = useState<string | null>(null)

  // Favorites — fetched from DB
  const [favoriteAgents, setFavoriteAgents] = useState<Array<{ id: string; name: string; avatar?: string | null; status: string }>>([])

  useEffect(() => {
    apiGet<Array<{ id: string; name: string; avatar: string | null; status: string; isFavorite: boolean }>>('/api/agents')
      .then((agents) => {
        setFavoriteAgents(
          agents
            .filter((a) => a.isFavorite)
            .map((a) => ({ id: a.id, name: a.name, avatar: a.avatar, status: a.status })),
        )
      })
      .catch(() => {})
  }, [])

  // Load persisted discussions so the list survives reloads and reflects the DB.
  useEffect(() => {
    apiGet<DiscussionTable[]>('/api/discussions')
      .then((list) => setDiscussions(list))
      .catch(() => {})
  }, [])

  // Load registered MCP servers (auth secrets redacted) so the management panel
  // and the agent drawer's MCP tab reflect the DB.
  useEffect(() => {
    apiGet<McpServer[]>('/api/mcp-servers')
      .then((list) => setMcpServers(list))
      .catch(() => {})
  }, [])

  // Restore the most recent run's execution log on mount so a page refresh no
  // longer loses it. If that run is still running, reattach (set the chainId the
  // socket listeners gate on) so live events keep streaming into the log.
  useEffect(() => {
    let cancelled = false
    apiGet<RunSummary[]>('/api/runs?limit=1')
      .then((runs) => {
        const latest = runs[0]
        if (!latest || cancelled) return undefined
        return apiGet<RunDetail>(`/api/runs/${latest.chainId}`)
      })
      .then((run) => {
        if (!run || cancelled) return
        const entries = runToLogEntries(run)
        if (entries.length === 0) return
        setWorkflowLog(entries)
        workflowStepsRef.current = runToSteps(run)
        if (run.status === 'completed') lastCompletedChainIdRef.current = run.chainId
        if (run.status === 'running') {
          workflowChainIdRef.current = run.chainId
          setWorkflowRunning(true)
          setWorkflowChatOpen(true)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleSelectFavorite = useCallback((agentId: string) => {
    const fav = favoriteAgents.find((a) => a.id === agentId)
    if (!fav) return
    setSelectedAgent({
      id: fav.id,
      name: fav.name,
      status: fav.status as AgentStatus,
    })
    openPanel({ type: 'agent-chat', agentId: selectedAgent?.id ?? '' })
  }, [favoriteAgents, openPanel, selectedAgent?.id])

  const [zoomLevel, setZoomLevel] = useState(100)
  const { value: complexity, refresh: refreshComplexity } = useComplexityState()
  const {
    workspaces, activeWorkspaceId, loaded: canvasLoaded, saving: canvasSaving,
    loadCanvas, saveCanvas, saveNow, switchWorkspace, refreshWorkspaces, createWorkspace,
    renameWorkspace, deleteWorkspace,
  } = useCanvasPersistence()
  const [canvasSaveFlash, setCanvasSaveFlash] = useState(false)
  // Fingerprint of the last-persisted canvas; `nodes/edges` differing from this
  // means there are unsaved changes (drives the Save button highlight).
  const [savedCanvasKey, setSavedCanvasKey] = useState('')

  // Fetch workspace workingDirectory when workspace changes
  useEffect(() => {
    if (!activeWorkspaceId) {
      setWorkspaceWorkingDir(null)
      return
    }
    apiGet<Array<{ id: string; workingDirectory?: string | null }>>('/api/workspaces')
      .then((ws) => {
        const match = ws.find((w) => w.id === activeWorkspaceId)
        setWorkspaceWorkingDir(match?.workingDirectory ?? null)
      })
      .catch(() => {})
  }, [activeWorkspaceId])

  const handleWorkingDirectoryChange = useCallback(async (dir: string | null) => {
    if (!activeWorkspaceId) return
    try {
      await apiPatch(`/api/workspaces/${activeWorkspaceId}`, {
        workingDirectory: dir,
      })
      setWorkspaceWorkingDir(dir)
    } catch (err) {
      console.error('Failed to save working directory:', err)
    }
  }, [activeWorkspaceId])

  const handleAgentStatusChange = useCallback((agentId: string, status: import('@rondoflow/shared').AgentStatus) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === agentId ? { ...n, data: { ...n.data, status } } : n,
      ),
    )
  }, [])

  const { sessionTokens, activeAgentIds, addTokens } = useAgentStatus(handleAgentStatusChange)


  const { connected, connecting, error: socketError } = useSocket()

  const {
    notifications,
    unreadCount,
    addNotification,
    acknowledge,
    acknowledgeAll,
    removeNotification,
  } = useNotifications()

  const {
    currentApproval,
    showApprovalDialog,
    approve,
    reject,
    dismissDialog,
  } = useApprovals()

  const undoRedoRef = useRef<UndoRedoControls | null>(null)
  const viewRef = useRef<import('@/components/canvas/rondoflow-canvas').CanvasViewControls | null>(null)

  // Mirror canUndo/canRedo into state so the bottom-bar buttons can enable/disable.
  const [undoState, setUndoState] = useState({ canUndo: false, canRedo: false })
  const undoStateRef = useRef(undoState)

  const handleUndoRedoReady = useCallback((controls: UndoRedoControls) => {
    undoRedoRef.current = controls
    // The canvas invokes this during its render; defer the state update to a
    // microtask so we never call setState while another component is rendering.
    if (
      controls.canUndo !== undoStateRef.current.canUndo ||
      controls.canRedo !== undoStateRef.current.canRedo
    ) {
      const next = { canUndo: controls.canUndo, canRedo: controls.canRedo }
      undoStateRef.current = next
      queueMicrotask(() => setUndoState(next))
    }
  }, [])

  const handleViewReady = useCallback((controls: import('@/components/canvas/rondoflow-canvas').CanvasViewControls) => {
    viewRef.current = controls
  }, [])

  const handleZoomIn = useCallback(() => {
    viewRef.current?.zoomIn()
    const z = viewRef.current?.getZoom()
    if (z) setZoomLevel(Math.round(z * 100))
  }, [])

  const handleZoomOut = useCallback(() => {
    viewRef.current?.zoomOut()
    const z = viewRef.current?.getZoom()
    if (z) setZoomLevel(Math.round(z * 100))
  }, [])

  const handleFitView = useCallback(() => {
    viewRef.current?.fitView()
    setTimeout(() => {
      const z = viewRef.current?.getZoom()
      if (z) setZoomLevel(Math.round(z * 100))
    }, 100)
  }, [])

  // Palette click/keyboard add — drops the node at the viewport centre (the
  // drag path drops at the cursor). Fallback for trackpad/touch/keyboard users.
  const handlePaletteAddNode = useCallback((mimeType: string, payload: Record<string, unknown>) => {
    if (!canEdit) return
    viewRef.current?.addNode(mimeType, payload)
  }, [canEdit])

  // Explain why a connection was rejected instead of silently snapping back.
  const handleInvalidConnection = useCallback((reason: string) => {
    toast({ description: reason, variant: 'error' })
  }, [])

  // After a node/edge is removed via its toolbar, offer an inline Undo so the
  // (otherwise keyboard-only) undo is discoverable right where it's needed.
  const handleElementDeleted = useCallback((kind: 'node' | 'edge') => {
    toast({
      description: kind === 'edge' ? t('toast.edgeDeleted') : t('toast.nodeDeleted'),
      duration: 6000,
      action: { label: t('toast.undo'), onClick: () => undoRedoRef.current?.undo() },
    })
  }, [t])

  // Load canvas from DB on mount (but don't auto-switch to canvas view)
  const [savedNodes, setSavedNodes] = useState<Node[]>([])
  const [savedEdges, setSavedEdges] = useState<Edge[]>([])
  const [showHome, setShowHome] = useState(true)
  const loadedRef = useRef(false)

  // Safety net: ensure start node is present whenever the canvas is entered.
  // Covers paths (e.g. describe/fallback) that don't call ensureStartNode explicitly.
  useEffect(() => {
    if (showHome || !canvasLoaded) return
    setNodes((prev) => {
      const ensured = ensureStartNode(prev)
      return ensured === prev ? prev : ensured
    })
  }, [showHome, canvasLoaded])

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    void loadCanvas().then((data) => {
      if (data) {
        setSavedNodes(data.nodes)
        setSavedEdges(data.edges)
      }
    })
  }, [loadCanvas])

  const goToWorkspace = useCallback(() => {
    // Normalize at load (Start node + connection-driven Output selections) so the
    // baseline below already reflects it and the canvas's sync effect is a no-op.
    const ensured = normalizeLoadedCanvas(savedNodes, savedEdges)
    setNodes(ensured)
    setEdges(savedEdges)
    // Freshly loaded from DB → mark as the clean baseline (not dirty).
    setSavedCanvasKey(canvasDirtyKey(ensured, savedEdges))
    setShowHome(false)
    setTimeout(() => {
      viewRef.current?.fitView()
      const z = viewRef.current?.getZoom()
      if (z) setZoomLevel(Math.round(z * 100))
    }, 300)
  }, [savedNodes, savedEdges])

  const showCanvas = !showHome && nodes.length > 0

  const runningAgentCount = nodes.filter(
    (n) => n.type === 'agent' && (n.data as AgentNodeData).status === 'running',
  ).length

  // ── Shortcut callbacks ─────────────────────────────────────────────────

  const handleUndo = useCallback(() => {
    undoRedoRef.current?.undo()
  }, [])

  const handleRedo = useCallback(() => {
    undoRedoRef.current?.redo()
  }, [])

  const handleDelete = useCallback(() => {
    const event = new KeyboardEvent('keydown', {
      key: 'Delete',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(event)
  }, [])

  const handleSelectAll = useCallback(() => {
    setNodes((prev) =>
      prev.map((n) => ({ ...n, selected: true })),
    )
  }, [])

  const handleCommandPalette = useCallback(() => {
    setCommandPaletteOpen((prev) => !prev)
  }, [])

  const handleCreateAgent = useCallback(() => {
    if (!canEdit) return
    setCreateAgentOpen(true)
  }, [canEdit])

  const handleUseTemplate = useCallback(() => {
    setTemplateGalleryOpen(true)
  }, [])

  const handleAgentCreated = useCallback(async (input: CreateAgentInput) => {
    try {
      // Persist to DB so the backend can find this agent when spawning
      const saved = await apiPost<{ id: string }>('/api/agents', {
        name: input.name,
        persona: input.persona ?? `You are ${input.name}, a helpful assistant.`,
        description: input.description,
        purpose: input.purpose,
        model: input.model,
        scope: input.scope ?? [],
        allowedTools: input.allowedTools ?? [],
      })

      const node = createAgentNode(
        { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
        {
          name: input.name,
          description: input.description,
          status: 'idle',
          model: input.model,
          purpose: input.purpose,
        },
      )
      // Use the DB id so the socket handler can find the agent
      node.id = saved.id
      setNodes((prev) => [...prev, node])
    } catch {
      // If API fails (server down), create local-only node
      const node = createAgentNode(
        { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
        {
          name: input.name,
          description: input.description,
          status: 'idle',
          model: input.model,
          purpose: input.purpose,
        },
      )
      setNodes((prev) => [...prev, node])
    }
    setCreateAgentOpen(false)
  }, [])

  const handleTemplateSelected = useCallback(async (templateNodes: Node[], templateEdges: Edge[]) => {
    // Persist each agent node to DB so they can be spawned
    const persistedNodes = await Promise.all(
      templateNodes.map(async (node) => {
        if (node.type !== 'agent') return node
        const data = node.data as AgentNodeData
        try {
          const saved = await apiPost<{ id: string }>('/api/agents', {
            name: data.name,
            persona: `You are ${data.name}. ${data.description ?? ''}`.trim(),
            description: data.description,
            purpose: data.purpose,
            model: data.model,
            scope: [],
            allowedTools: [],
          })
          return { ...node, id: saved.id }
        } catch {
          return node // keep local-only if server unavailable
        }
      }),
    )

    // Update edge source/target ids to match persisted agent ids
    const idMap = new Map<string, string>()
    templateNodes.forEach((orig, i) => {
      if (orig.id !== persistedNodes[i].id) {
        idMap.set(orig.id, persistedNodes[i].id)
      }
    })

    const updatedEdges = templateEdges.map((edge) => ({
      ...edge,
      source: idMap.get(edge.source) ?? edge.source,
      target: idMap.get(edge.target) ?? edge.target,
    }))

    const startedNodes = ensureStartNode(persistedNodes)
    setNodes(startedNodes)
    setEdges(ensureStartEdges(startedNodes, updatedEdges))
    setTemplateGalleryOpen(false)
    setTimeout(() => {
      viewRef.current?.fitView()
      const z = viewRef.current?.getZoom()
      if (z) setZoomLevel(Math.round(z * 100))
    }, 200)
  }, [])

  // Materialize a generated workflow onto the canvas (persist agents, create nodes/edges)
  const materializeWorkflow = useCallback(async (workflow: import('@rondoflow/shared').GeneratedWorkflowWithLayout) => {
    // Persist each agent to DB (same pattern as handleTemplateSelected)
    const persistedAgents = await Promise.all(
      workflow.agents.map(async (agent) => {
        try {
          const saved = await apiPost<{ id: string }>('/api/agents', {
            name: agent.name,
            persona: agent.persona,
            description: agent.description,
            purpose: agent.purpose,
            model: agent.model,
            scope: [],
            allowedTools: [],
          })
          return { ...agent, persistedId: saved.id }
        } catch {
          return { ...agent, persistedId: agent.tempId }
        }
      }),
    )

    // Build ID map: tempId → persisted DB id
    const idMap = new Map<string, string>()
    for (const agent of persistedAgents) {
      idMap.set(agent.tempId, agent.persistedId)
    }

    // Assign skills to agents (best-effort, don't block on failure)
    for (const agent of persistedAgents) {
      for (const skillId of agent.suggestedSkills) {
        apiPost(`/api/agents/${agent.persistedId}/skills/${skillId}`, {}).catch(() => {})
      }
    }

    // Create React Flow nodes
    const newNodes = persistedAgents.map((agent) => {
      const node = createAgentNode(
        agent.position,
        {
          name: agent.name,
          description: agent.description,
          status: 'idle' as const,
          model: agent.model,
          purpose: agent.purpose,
        },
      )
      node.id = agent.persistedId
      return node
    })

    // Create React Flow edges with remapped IDs
    const newEdges: Edge[] = workflow.edges.map((edge) => ({
      id: crypto.randomUUID(),
      source: idMap.get(edge.from) ?? edge.from,
      target: idMap.get(edge.to) ?? edge.to,
      type: 'rondoflow' as const,
      data: { edgeType: 'flow' as const },
    }))

    const startedNodes = ensureStartNode(newNodes)
    setNodes(startedNodes)
    setEdges(ensureStartEdges(startedNodes, newEdges))
    // Reveal the canvas now that the generated nodes exist. The onboarding
    // describe path reaches materialization without going through
    // goToWorkspace/handleCreateWorkspace (where showHome is otherwise cleared),
    // so without this the workspace would stay hidden behind the placeholder.
    setShowHome(false)
    setTimeout(() => {
      viewRef.current?.fitView()
      const z = viewRef.current?.getZoom()
      if (z) setZoomLevel(Math.round(z * 100))
    }, 200)
  }, [])

  // Materialize a predefined workspace preset (SEO flows etc.) onto the canvas.
  // Persists each preset agent to the DB using its rich persona, lays nodes out
  // by column/row, then wires the flow edges with the remapped ids. Mirrors
  // materializeWorkflow but sources its data from the static preset catalog.
  const materializePreset = useCallback(async (preset: WorkspacePreset) => {
    const persistedAgents = await Promise.all(
      preset.agents.map(async (agent) => {
        try {
          const saved = await apiPost<{ id: string }>('/api/agents', {
            name: agent.name,
            persona: agent.persona,
            description: agent.description,
            purpose: agent.purpose,
            model: agent.model,
            scope: [],
            allowedTools: [],
            provider: agent.provider ?? 'claude-code',
            // API providers (openai/perplexity) require providerConfig server-side.
            ...(agent.providerConfig ? { providerConfig: agent.providerConfig } : {}),
          })
          return { ...agent, persistedId: saved.id }
        } catch {
          // Keep a UUID-valid id so the run-time agent-recovery path (which
          // re-POSTs with this id) passes the server's `id: uuid` validation.
          return { ...agent, persistedId: crypto.randomUUID() }
        }
      }),
    )

    const idMap = new Map<string, string>()
    for (const agent of persistedAgents) {
      idMap.set(agent.key, agent.persistedId)
    }

    const newNodes = persistedAgents.map((agent) => {
      const node = createAgentNode(
        { x: 120 + agent.column * 300, y: 160 + agent.row * 150 },
        {
          name: agent.name,
          description: agent.description,
          status: 'idle' as const,
          model: agent.model,
          purpose: agent.purpose,
          provider: agent.provider,
          providerConfig: agent.providerConfig,
        },
      )
      node.id = agent.persistedId
      return node
    })

    const newEdges: Edge[] = preset.edges.map((edge) => ({
      id: crypto.randomUUID(),
      source: idMap.get(edge.from) ?? edge.from,
      target: idMap.get(edge.to) ?? edge.to,
      type: 'rondoflow' as const,
      data: { edgeType: 'flow' as const },
    }))

    const finalNodes = ensureStartNode(newNodes)
    const finalEdges = ensureStartEdges(finalNodes, newEdges)
    setNodes(finalNodes)
    setEdges(finalEdges)
    // Mark the freshly-materialized canvas as the clean baseline so the
    // "unsaved changes" highlight doesn't flash before the autosave lands
    // (mirrors goToWorkspace / handleSelectWorkspace).
    setSavedCanvasKey(canvasDirtyKey(finalNodes, finalEdges))
    setTimeout(() => {
      viewRef.current?.fitView()
      const z = viewRef.current?.getZoom()
      if (z) setZoomLevel(Math.round(z * 100))
    }, 200)
  }, [])

  const handleOnboardingComplete = useCallback(async (result: OnboardingResult) => {
    completeWizard()

    // Set working directory on the workspace
    if (result.workingDirectory && activeWorkspaceId) {
      try {
        await apiPatch(`/api/workspaces/${activeWorkspaceId}`, {
          workingDirectory: result.workingDirectory,
        })
        setWorkspaceWorkingDir(result.workingDirectory)
      } catch (err) {
        console.error('Failed to save working directory:', err)
      }
    }

    // Execute first action
    switch (result.firstAction) {
      case 'describe':
        if (result.description) {
          void handleDescribe(result.description)
        }
        break
      case 'template': {
        // A specific template picked from the onboarding gallery loads directly;
        // the bare "Start from Template" button (no id) opens the full gallery.
        const template = result.templateId
          ? CANVAS_TEMPLATES.find((tpl) => tpl.id === result.templateId)
          : undefined
        if (template) {
          const { nodes: tplNodes, edges: tplEdges } = materializeCanvasTemplate(template)
          void handleTemplateSelected(tplNodes, tplEdges)
        } else {
          setTemplateGalleryOpen(true)
        }
        break
      }
      case 'create':
        setCreateAgentOpen(true)
        break
      case 'skip':
      default:
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleDescribe/handleTemplateSelected are declared elsewhere (forward ref)
  }, [activeWorkspaceId, completeWizard])

  const handleDescribe = useCallback(async (description: string) => {
    setIsGenerating(true)
    // NB: do NOT clear showHome here. While generating, nodes is still empty so
    // the placeholder stays mounted and shows its "Generating…" spinner. The
    // canvas is revealed only once nodes land (materializeWorkflow / the
    // fallback below) — clearing showHome up front would swap the spinner for an
    // empty canvas with no progress indication.
    try {
      const workflow = await apiPost<import('@rondoflow/shared').GeneratedWorkflowWithLayout>(
        '/api/workflows/generate',
        { description },
      )
      // Open review dialog instead of materializing directly
      setGeneratedWorkflow(workflow)
      setReviewDialogOpen(true)
    } catch (err) {
      // Notify user that workflow generation failed before falling back
      console.error('[handleDescribe] Workflow generation failed:', err)
      addNotification({
        level: 'error',
        title: t('notify.workflowGenerationFailed.title'),
        description: t('notify.workflowGenerationFailed.description'),
      })

      // Fallback: create a single agent (reveal the canvas, same as the
      // materialized path, so the node isn't stranded behind the placeholder).
      setShowHome(false)
      const name = description.length > 30 ? description.slice(0, 30) + '...' : description
      try {
        const saved = await apiPost<{ id: string }>('/api/agents', {
          name,
          persona: `You are a helpful assistant. The user described you as: "${description}". Follow these instructions carefully.`,
          description,
          purpose: 'general',
          model: 'sonnet',
          scope: [],
          allowedTools: [],
        })
        const node = createAgentNode(
          { x: 300, y: 250 },
          { name, description, status: 'idle', model: 'sonnet', purpose: 'general' },
        )
        node.id = saved.id
        setNodes((prev) => [...prev, node])
      } catch {
        const node = createAgentNode(
          { x: 300, y: 250 },
          { name, description, status: 'idle', model: 'sonnet', purpose: 'general' },
        )
        setNodes((prev) => [...prev, node])
      }
    } finally {
      setIsGenerating(false)
    }
  }, [addNotification, t])

  const handleToggleMarketplace = useCallback(() => {
    if (isOpen('skill-marketplace')) {
      closePanel()
    } else {
      openPanel({ type: 'skill-marketplace' })
    }
  }, [isOpen, closePanel, openPanel])

  // "Start a discussion" CTA (empty-canvas placeholder) → jump straight to the wizard
  const handleSidebarDiscussionsClick = useCallback(() => {
    setDiscussionWizardOpen(true)
  }, [])

  // Sidebar "Discussions" + command palette → open the list of created discussions
  const handleTopBarDiscussionsClick = useCallback(() => {
    setActiveTab('discussions')
    openPanel({ type: 'discussions-list' })
    /* history closed by panel switch */
  }, [openPanel])

  // Settings gear → open settings panel
  const handleSettingsClick = useCallback(() => {
    openPanel({ type: 'settings' })
  }, [openPanel])

  // Guards against a stale reattach (an earlier workspace switch resolving after
  // a later one) clobbering the live view.
  const reattachSeqRef = useRef(0)

  // Repoint the single live-execution view at `workspaceId`'s most-recent run.
  //
  // rondoflow streams a run into one set of refs/log at a time, but the backend
  // executes chains independently per chainId — so the run in the workspace we're
  // leaving keeps going. Reattaching on every workspace switch is what lets two
  // workspaces run concurrently: the Run/Stop button and the log reflect the
  // *active* workspace instead of one global flag. Switch away and the Run button
  // frees up for the new workspace; switch back and we resume showing the
  // still-running (or finished) run, with live events streaming again.
  const reattachWorkspaceRun = useCallback(async (workspaceId: string) => {
    const seq = ++reattachSeqRef.current
    // Clear the live-view scratch synchronously so the previous workspace's run
    // never bleeds into the new one while we fetch.
    workflowStepUsageRef.current.clear()
    workflowStepTextRef.current.clear()
    workflowStepMsgsRef.current.clear()
    workflowSkippedStepsRef.current.clear()
    workflowStepOutputRef.current.clear()
    workflowStepsRef.current = []
    workflowChainIdRef.current = ''
    lastCompletedChainIdRef.current = ''
    setWorkflowStep(null)
    setDirectorStatus('idle')
    setDirectorLastAction(null)
    setDirectorLastTargetAgent(null)
    setPlannerStatus('idle')

    const stale = () => seq !== reattachSeqRef.current

    let run: RunDetail | null = null
    try {
      const runs = await apiGet<RunSummary[]>(
        `/api/runs?workspaceId=${encodeURIComponent(workspaceId)}&limit=1`,
      )
      if (stale()) return
      const latest = runs[0]
      if (latest) {
        run = await apiGet<RunDetail>(`/api/runs/${latest.chainId}`)
        if (stale()) return
      }
    } catch {
      if (stale()) return
    }

    if (!run) {
      // No run for this workspace → blank slate, Run button enabled.
      setWorkflowLog([])
      setWorkflowRunning(false)
      return
    }

    workflowStepsRef.current = runToSteps(run)
    setWorkflowLog(runToLogEntries(run))
    if (run.status === 'running') {
      // Re-arm the socket gate so live events for this chain stream in again.
      workflowChainIdRef.current = run.chainId
      setWorkflowRunning(true)
    } else {
      if (run.status === 'completed') lastCompletedChainIdRef.current = run.chainId
      setWorkflowRunning(false)
    }
  }, [])

  const handleSelectWorkspace = useCallback(async (id: string) => {
    // Flush-save the current canvas before switching so in-memory edits aren't
    // discarded when the target workspace's layout loads (switchWorkspace cancels
    // any pending debounced save).
    if (nodes.length > 0) await saveNow(nodes, edges)
    const data = await switchWorkspace(id)
    const ensuredNodes = normalizeLoadedCanvas(data?.nodes ?? [], data?.edges ?? [])
    setNodes(ensuredNodes)
    setEdges(data?.edges ?? [])
    setSavedCanvasKey(canvasDirtyKey(ensuredNodes, data?.edges ?? []))
    setShowHome(false)
    setActiveTab('workspace')
    // Point the live-execution view at this workspace's own run (if any); the
    // previous workspace's run keeps executing on the backend.
    void reattachWorkspaceRun(id)
    setTimeout(() => {
      viewRef.current?.fitView()
      const z = viewRef.current?.getZoom()
      if (z) setZoomLevel(Math.round(z * 100))
    }, 300)
  }, [nodes, edges, saveNow, switchWorkspace, reattachWorkspaceRun])

  // Tab click: clicking the already-open workspace is a no-op so we never reload
  // its canvas from the DB and lose unsaved in-memory edits.
  const handleTabSelect = useCallback((id: string) => {
    if (id === activeWorkspaceId && showCanvas) return
    void handleSelectWorkspace(id)
  }, [activeWorkspaceId, showCanvas, handleSelectWorkspace])

  const handleCreateWorkspace = useCallback(async (name: string, workingDirectory?: string, presetId?: string) => {
    if (!canEdit) return
    if (nodes.length > 0) await saveNow(nodes, edges)
    // Guard: createWorkspace returns '' (and leaves the OLD workspace active) if
    // the server call fails. Bail before switching views or materializing a
    // preset — otherwise the new canvas would be autosaved over the old
    // workspace and its agents leaked as orphans.
    const newId = await createWorkspace(name, workingDirectory)
    if (!newId) {
      addNotification({
        level: 'error',
        title: t('notify.workspaceCreateFailed.title'),
        description: t('notify.workspaceCreateFailed.description'),
      })
      return
    }
    if (workingDirectory) setWorkspaceWorkingDir(workingDirectory)
    setShowHome(false)
    setActiveTab('workspace')
    // Fresh workspace has no run of its own — clear the live view so the Run
    // button isn't left showing the previous workspace's in-flight run.
    void reattachWorkspaceRun(newId)
    // Start from a predefined flow when a preset was chosen; otherwise blank.
    // createWorkspace has already switched the active workspace, so the canvas
    // autosave persists the materialized nodes to the new workspace.
    const preset = presetId ? findWorkspacePreset(presetId) : undefined
    if (preset) {
      await materializePreset(preset)
      return
    }
    const blankNodes = ensureStartNode([])
    setNodes(blankNodes)
    setEdges([])
    setSavedCanvasKey(canvasDirtyKey(blankNodes, []))
  }, [nodes, edges, saveNow, createWorkspace, materializePreset, addNotification, canEdit, t, reattachWorkspaceRun])

  // Generate the next free "Workspace N" name, skipping any already in use.
  const nextWorkspaceName = useCallback((): string => {
    const taken = new Set(workspaces.map((w) => w.name))
    let n = workspaces.length + 1
    while (taken.has(t('workspace.numberedName', { n }))) n += 1
    return t('workspace.numberedName', { n })
  }, [workspaces, t])

  // Welcome-screen CTAs ("Use a Template" / "Create an Assistant") drop the user
  // into a fresh workspace so brand-new work doesn't pile into an existing one.
  // The current workspace is reused when it's still empty (e.g. the default one
  // on first launch) so we never leave an orphaned blank workspace behind.
  const enterFreshWorkspace = useCallback(async (): Promise<void> => {
    const currentHasContent = savedNodes.some((n) => n.type !== 'start')
    if (currentHasContent) {
      await handleCreateWorkspace(nextWorkspaceName())
      return
    }
    setShowHome(false)
    setActiveTab('workspace')
    const blankNodes = ensureStartNode([])
    setNodes(blankNodes)
    setEdges([])
    setSavedCanvasKey(canvasDirtyKey(blankNodes, []))
  }, [savedNodes, handleCreateWorkspace, nextWorkspaceName])

  const handleWelcomeCreateAssistant = useCallback(async (): Promise<void> => {
    await enterFreshWorkspace()
    handleCreateAgent()
  }, [enterFreshWorkspace, handleCreateAgent])

  const handleWelcomeUseTemplate = useCallback(async (): Promise<void> => {
    await enterFreshWorkspace()
    handleUseTemplate()
  }, [enterFreshWorkspace, handleUseTemplate])

  const handleWelcomePickTemplate = useCallback(async (templateId: string): Promise<void> => {
    const template = CANVAS_TEMPLATES.find((tpl) => tpl.id === templateId)
    if (!template) return
    await enterFreshWorkspace()
    const { nodes: tplNodes, edges: tplEdges } = materializeCanvasTemplate(template)
    void handleTemplateSelected(tplNodes, tplEdges)
  }, [enterFreshWorkspace, handleTemplateSelected])

  const handleRenameWorkspace = useCallback(async (id: string, name: string) => {
    if (!canEdit) return
    await renameWorkspace(id, name)
  }, [renameWorkspace, canEdit])

  const handleDeleteWorkspace = useCallback(async (id: string) => {
    if (!canEdit) return
    await deleteWorkspace(id)
    // Load canvas for the new active workspace
    const remaining = workspaces.filter((w) => w.id !== id)
    if (remaining.length > 0) {
      const data = await switchWorkspace(remaining[0].id)
      const ensured = normalizeLoadedCanvas(data?.nodes ?? [], data?.edges ?? [])
      setNodes(ensured)
      setEdges(data?.edges ?? [])
      // Just-loaded from DB → clean baseline (parity with goToWorkspace /
      // handleSelectWorkspace), so the switch doesn't flash unsaved/auto-save.
      setSavedCanvasKey(canvasDirtyKey(ensured, data?.edges ?? []))
      void reattachWorkspaceRun(remaining[0].id)
    }
  }, [deleteWorkspace, workspaces, switchWorkspace, canEdit, reattachWorkspaceRun])

  const handleResourcesClick = useCallback(() => {
    openPanel({ type: 'resource-browser' })
  }, [openPanel])

  // Keep every Resources node on the canvas in sync with the live resource counts.
  const handleResourceCountsChange = useCallback((counts: ResourceCounts) => {
    setNodes((prev) => {
      let changed = false
      const next = prev.map((n) => {
        if (n.type !== 'resource') return n
        const d = n.data as Record<string, unknown>
        if (
          d.fileCount === counts.fileCount &&
          d.linkCount === counts.linkCount &&
          d.noteCount === counts.noteCount &&
          d.variableCount === counts.variableCount
        ) {
          return n
        }
        changed = true
        return { ...n, data: { ...n.data, ...counts } }
      })
      return changed ? next : prev
    })
  }, [])

  const handleExternalFoldersClick = useCallback(() => {
    openPanel({ type: 'external-folders' })
  }, [openPanel])

  const handleAssistantsClick = useCallback(() => {
    openPanel({ type: 'assistants-list' })
  }, [openPanel])

  const handleSafetyClick = useCallback(() => {
    openPanel({ type: 'safety' })
  }, [openPanel])

  const handleSelectAssistant = useCallback((assistant: AssistantSummary) => {
    closePanel()
    setSelectedAgent({
      id: assistant.id,
      name: assistant.name,
      status: assistant.status,
      model: assistant.model,
    })
    openPanel({ type: 'agent-chat', agentId: selectedAgent?.id ?? '' })
  }, [closePanel, openPanel, selectedAgent?.id])

  const handleDeleteAssistant = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id))
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id))
    // Also delete from DB
    void apiDelete(`/api/agents/${id}`).catch(() => {})
  }, [])

  const handleDiscussionCreate = useCallback(async (config: CreateDiscussionInput) => {
    try {
      // Persist the discussion (and its participants) so the engine can find it
      // by id when the user presses Start. Omit maxRounds for "auto" mode so the
      // server default applies as the cap — sending 0 makes the engine conclude
      // after a single turn.
      const created = await apiPost<DiscussionTable>('/api/discussions', {
        name: config.name,
        topic: config.topic,
        format: config.format,
        moderatorId: config.moderatorId,
        ...(config.maxRounds ? { maxRounds: config.maxRounds } : {}),
        participants: config.participants,
      })
      setDiscussions((prev) => [created, ...prev.filter((d) => d.id !== created.id)])
      setSelectedDiscussion(created)
      openPanel({ type: 'discussion-panel', discussionId: created.id })
    } catch (err) {
      addNotification({
        level: 'error',
        title: t('notify.discussionCreateFailed.title'),
        description:
          err instanceof Error
            ? err.message
            : t('notify.discussionCreateFailed.description'),
      })
    }
  }, [openPanel, addNotification, t])

  const handleSelectDiscussionFromList = useCallback((discussion: DiscussionTable) => {
    setSelectedDiscussion(discussion)
    // Opening the detail panel implicitly closes the discussions list (panels are
    // mutually exclusive), so this single openPanel is the only panel mutation —
    // no competing closePanel that would clobber it. Reset the tab indicator here
    // since the list's onOpenChange no longer runs on selection.
    openPanel({ type: 'discussion-panel', discussionId: discussion.id })
    if (activeTab === 'discussions') setActiveTab('workspace')
  }, [openPanel, activeTab])

  const discussionAgents: DiscussionAgent[] = nodes
    .filter((n) => n.type === 'agent')
    .map((n) => {
      const data = n.data as AgentNodeData
      return {
        id: n.id,
        name: data.name,
        model: data.model,
      }
    })

  const handleToggleShortcuts = useCallback(() => {
    setShortcutsOpen((prev) => !prev)
  }, [])

  const handleEscape = useCallback(() => {
    setShortcutsOpen(false)
    setDiscussionWizardOpen(false)
    setQuickRunOpen(false)
    setWorkflowChatOpen(false)
    closePanel()
    setNodes((prev) =>
      prev.map((n) => ({ ...n, selected: false })),
    )
  }, [closePanel])

  const handleQuickRun = useCallback(() => {
    setQuickRunOpen((prev) => !prev)
  }, [])

  const handleActivityClick = useCallback(() => {
    openPanel({ type: 'activity' })
  }, [openPanel])

  const handleAuditClick = useCallback(() => {
    openPanel({ type: 'audit-log' })
  }, [openPanel])

  const handleMemoryClick = useCallback(() => {
    openPanel({ type: 'memory' })
  }, [openPanel])

  const handleAnalyticsClick = useCallback(() => {
    openPanel({ type: 'analytics' })
  }, [openPanel])

  const handleHistoryClick = useCallback(() => {
    openPanel({ type: 'history' })
  }, [openPanel])

  // Command palette dispatch — maps command ids to existing panel handlers.
  // Defined after the panel handlers so they can sit in the dependency array.
  const handleCommand = useCallback((commandId: string) => {
    setCommandPaletteOpen(false)
    switch (commandId) {
      case 'assistant:create': handleCreateAgent(); break
      case 'assistant:list':
      case 'nav:assistants': handleAssistantsClick(); break
      case 'canvas:fit': break
      case 'nav:skills': handleToggleMarketplace(); break
      case 'nav:facilitators': openPanel({ type: 'facilitators' }); break
      case 'nav:discussions': handleTopBarDiscussionsClick(); break
      case 'nav:activity': handleActivityClick(); break
      case 'nav:audit': handleAuditClick(); break
      case 'nav:memory': handleMemoryClick(); break
      case 'nav:history': handleHistoryClick(); break
      case 'nav:analytics': handleAnalyticsClick(); break
      case 'nav:safety': handleSafetyClick(); break
      case 'nav:schedules': openPanel({ type: 'schedules' }); break
      case 'action:shortcuts': handleToggleShortcuts(); break
      case 'template:code-review':
      case 'template:content-writing':
      case 'template:research':
      case 'template:brainstorm':
        handleUseTemplate(); break
      default: break
    }
  }, [
    handleCreateAgent,
    handleAssistantsClick,
    handleToggleMarketplace,
    handleTopBarDiscussionsClick,
    handleActivityClick,
    handleAuditClick,
    handleMemoryClick,
    handleHistoryClick,
    handleAnalyticsClick,
    handleSafetyClick,
    handleToggleShortcuts,
    handleUseTemplate,
    openPanel,
  ])

  // Pull a past run (from the History panel) back into the workflow execution log.
  const handleRestoreRun = useCallback((run: RunDetail) => {
    const entries = runToLogEntries(run)
    setWorkflowLog(entries)
    workflowStepsRef.current = runToSteps(run)
    workflowStepUsageRef.current.clear()
    workflowStepTextRef.current.clear()
    workflowStepMsgsRef.current.clear()
    if (run.status === 'completed') lastCompletedChainIdRef.current = run.chainId
    if (run.status === 'running') {
      workflowChainIdRef.current = run.chainId
      setWorkflowRunning(true)
    }
    closePanel()
    setTimeout(() => setWorkflowChatOpen(true), SHEET_TRANSITION_MS)
  }, [closePanel])

  const handlePlanClick = useCallback(() => {
    openPanel({ type: 'plan-editor' })
  }, [openPanel])

  const handleRunWorkflow = useCallback(async (message: string) => {
    if (!canRun) {
      toast({ description: t('toast.runNotPermitted'), variant: 'error' })
      return
    }
    // Compile the real canvas DAG (branching + Condition nodes) into the chain
    // definition. `chain` is the ordered agent steps; `defEdges` preserves the
    // graph and carries compiled branch conditions.
    const { chain, steps: defSteps, edges: defEdges } = buildChainDefinition(nodes, edges)
    if (chain.length < 1) {
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'error' as const,
          content: chain.length === 0
            ? t('log.noAgents')
            : t('log.connectTwoAgents'),
          timestamp: new Date(),
        },
      ])
      return
    }

    // Start each run with a fresh log so a restored/previous run's entries don't
    // mix with this one (past runs remain available in the History panel).
    setWorkflowLog([])
    workflowStepUsageRef.current.clear()
    workflowStepTextRef.current.clear()
    workflowStepMsgsRef.current.clear()
    workflowSkippedStepsRef.current.clear()

    // Clear any lingering chain visual state from a prior run (e.g. a fast
    // re-run before the post-completion cleanup fired) so skipped/completed
    // dimming doesn't carry over.
    setNodes((prev) => prev.map((n) => {
      if (n.type !== 'agent' && n.type !== 'structurer' && n.type !== 'db-save' && n.type !== 'http-request' && n.type !== 'duckduckgo-search' && n.type !== 'sakana-ai') return n
      const nd = n.data as AgentNodeData
      return nd.chainState ? { ...n, data: { ...nd, chainState: undefined } } : n
    }))

    // ── Step 0: test Claude API connection before any agent runs ──────────
    setNodes((prev) => withStartNodeStatus(prev, 'testing'))
    setWorkflowLog((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'system' as const,
        content: t('log.startTesting'),
        timestamp: new Date(),
      },
    ])
    let connection: ClaudeConnectionResult
    try {
      connection = await apiPost<ClaudeConnectionResult>('/api/claude/test-connection', {})
    } catch (err) {
      connection = { ok: false, method: null, message: err instanceof Error ? err.message : t('connection.testFailed') }
    }
    if (!connection.ok) {
      setNodes((prev) => withStartNodeStatus(prev, 'error', connection.message))
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'error' as const,
          content: t('log.startConnectionFailed', { message: connection.message }),
          timestamp: new Date(),
        },
      ])
      return
    }
    setNodes((prev) => withStartNodeStatus(prev, 'success', connection.message))
    setWorkflowLog((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'system' as const,
        content: t('log.startConnection', { message: connection.message }),
        timestamp: new Date(),
      },
    ])

    // Ensure all agents in the chain exist in the database
    for (const step of chain) {
      try {
        await apiGet(`/api/agents/${step.nodeId}`)
      } catch {
        // Agent not in DB — sync it now
        const node = nodes.find((n) => n.id === step.nodeId)
        const data = node?.data as AgentNodeData | undefined
        try {
          const saved = await apiPost<{ id: string }>('/api/agents', {
            id: step.nodeId,
            name: data?.name ?? step.agentName,
            persona: `You are ${data?.name ?? step.agentName}. ${data?.description ?? ''}`.trim(),
            purpose: data?.purpose,
            model: data?.model,
            provider: data?.provider ?? 'claude-code',
            ...(data?.providerConfig ? { providerConfig: data.providerConfig } : {}),
            scope: [],
            allowedTools: [],
          })
          // If DB assigned a different ID, update the node
          if (saved.id !== step.nodeId) {
            setNodes((prev) => prev.map((n) =>
              n.id === step.nodeId ? { ...n, id: saved.id } : n,
            ))
          }
        } catch {
          setWorkflowLog((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type: 'error' as const,
              content: t('log.agentSaveFailed', { name: step.agentName }),
              timestamp: new Date(),
            },
          ])
          return
        }
      }
    }

    const sock = getSocket()
    if (!sock.connected) {
      sock.connect()
      // Give socket a moment to connect before emitting
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('timeout'))
        }, 3000)
        sock.once('connect', () => {
          clearTimeout(timeout)
          resolve()
        })
        // If already connected by the time listener fires
        if (sock.connected) {
          clearTimeout(timeout)
          resolve()
        }
      }).catch(() => {
        setWorkflowLog((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: 'error' as const,
            content: t('log.cannotConnectServer'),
            timestamp: new Date(),
          },
        ])
        return
      })
      // If we returned from the catch, don't continue
      if (!sock.connected) return
    }

    const chainId = crypto.randomUUID()
    workflowChainIdRef.current = chainId
    workflowStepsRef.current = chain
    workflowStepOutputRef.current.clear()

    // NOTE: the agent-sync loop above can remap a node id when the DB returns a
    // different id; `defSteps`/`defEdges` were built from the pre-sync ids. This
    // matches the pre-existing behaviour (the old payload had the same gap) and
    // only bites when an agent is first persisted mid-run.
    const definition = {
      steps: defSteps,
      edges: defEdges,
    }

    // Surface non-blocking author-time warnings about Condition-node wiring.
    const conditionWarnings = lintConditionWorkflow(nodes, edges)
    if (conditionWarnings.length > 0) {
      setWorkflowLog((prev) => [
        ...prev,
        ...conditionWarnings.map((w) => ({
          id: crypto.randomUUID(),
          type: 'system' as const,
          content: t('log.conditionWarning', { warning: w }),
          timestamp: new Date(),
        })),
      ])
    }

    // Add user message and system log entry
    setWorkflowLog((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'user',
        content: message,
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'system',
        content: workflowApprovalMode === 'perStep'
          ? t('log.startingWorkflowPerStep', { count: chain.length })
          : t('log.startingWorkflowAuto', { count: chain.length }),
        timestamp: new Date(),
      },
    ])

    setWorkflowRunning(true)
    setWorkflowStep({ index: 1, total: chain.length, agentName: chain[0].agentName })

    if (plannerEnabled) setPlannerStatus('planning')

    sock.emit('chain:execute', {
      chainId,
      definition,
      initialMessage: message,
      workspaceId: activeWorkspaceId ?? undefined,
      director: directorEnabled,
      directorRigor,
      directorCustomInstructions: directorCustomInstructions || undefined,
      planner: plannerEnabled,
      approvalMode: workflowApprovalMode,
    })
  }, [nodes, edges, workflowMode, workflowApprovalMode, activeWorkspaceId, directorEnabled, directorRigor, directorCustomInstructions, plannerEnabled, canRun, t])

  const handleStopWorkflow = useCallback(() => {
    const chainId = workflowChainIdRef.current
    if (chainId) {
      const sock = getSocket()
      sock.emit('chain:stop', { chainId })
    }
    setWorkflowRunning(false)
    setWorkflowStep(null)
    setDirectorStatus('idle')
    setDirectorLastAction(null)
    setDirectorLastTargetAgent(null)
    setWorkflowLog((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'system',
        content: t('log.stoppedByUser'),
        timestamp: new Date(),
      },
    ])
  }, [t])

  const handleWorkflowSendMessage = useCallback((message: string) => {
    setWorkflowLog((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'user',
        content: message,
        timestamp: new Date(),
      },
    ])
  }, [])

  const handleClearWorkflowLog = useCallback(() => {
    setWorkflowLog([])
  }, [])


  const handleSaveWorkflowOutput = useCallback(async (content: string) => {
    // Collect all step outputs from the log
    const stepOutputs = workflowLog
      .filter((e) => e.type === 'step_complete' && e.content)
      .map((e) => `## ${e.agentName ?? t('fallbackAgent.agentLabel')}\n\n${e.content}`)
      .join('\n\n---\n\n')

    const fullOutput = stepOutputs || content
    // Full ms precision + short random suffix so saves in the same second can't
    // collide and silently overwrite each other (WORKFLOW_OUTPUT_RE matches any suffix).
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `workflow-output-${stamp}-${crypto.randomUUID().slice(0, 8)}.md`

    // Determine target directory
    const dir = workspaceWorkingDir || '.'

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? NETWORK.DEFAULT_API_URL
      const res = await fetch(`${API_BASE}/api/fs/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ directory: dir, filename, content: fullOutput }),
      })
      const data = await res.json()
      if (data.success) {
        setWorkflowLog((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: 'system' as const,
            content: t('log.outputSavedTo', { path: data.data.path }),
            timestamp: new Date(),
          },
        ])
        // Surface the saved markdown immediately in the output log preview.
        setOutputLogInitialName(filename)
        setWorkflowChatOpen(false)
        setTimeout(() => openPanel({ type: 'output-log' }), SHEET_TRANSITION_MS)
      } else {
        setWorkflowLog((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: 'error' as const,
            content: t('log.saveFailed', { error: data.error }),
            timestamp: new Date(),
          },
        ])
      }
    } catch (err) {
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'error' as const,
          content: t('log.saveFailed', { error: err instanceof Error ? err.message : t('log.unknownError') }),
          timestamp: new Date(),
        },
      ])
    }
  }, [workflowLog, workspaceWorkingDir, openPanel, t])

  // Open the saved-output log preview. Pass a filename to jump straight to one
  // file. Resets the scan directory to the workspace dir (used by the chat log).
  const handleViewOutputs = useCallback((name?: string | null) => {
    setOutputLogInitialName(name ?? null)
    setOutputLogDirectory(null)
    setWorkflowChatOpen(false)
    setTimeout(() => openPanel({ type: 'output-log' }), SHEET_TRANSITION_MS)
  }, [openPanel])

  // Open an Output node's saved file — its destination may be a custom folder,
  // so scan that directory rather than the workspace default.
  const handleViewNodeOutput = useCallback(
    (directory: string | null | undefined, name: string) => {
      setOutputLogDirectory(directory ?? null)
      setOutputLogInitialName(name)
      setWorkflowChatOpen(false)
      setTimeout(() => openPanel({ type: 'output-log' }), SHEET_TRANSITION_MS)
    },
    [openPanel],
  )

  const handleAdvisorRequest = useCallback((model: string) => {
    if (!canRun) return
    const chainId = lastCompletedChainIdRef.current
    if (!chainId) return
    const sock = getSocket()
    sock.emit('advisor:analyze', { chainId, model })
  }, [canRun])

  const handleApplySkill = useCallback(async (agentId: string, skillName: string) => {
    const installRes = await apiPost<{ id: string }>('/api/skills/install', {
      name: skillName,
      source: 'marketplace',
    })
    await apiPost(`/api/agents/${agentId}/skills/${installRes.id}`, {})
  }, [])

  const handleUpdatePersona = useCallback(async (agentId: string, newPersona: string) => {
    await apiPatch(`/api/agents/${agentId}`, { persona: newPersona })
  }, [])

  const handleDirectorRedirectRespond = useCallback((requestId: string, approved: boolean) => {
    const chainId = workflowChainIdRef.current
    if (!chainId) return

    const sock = getSocket()
    sock.emit('chain:director_redirect_response', { chainId, requestId, approved })

    // Update log: remove the request entry and add result
    setWorkflowLog((prev) => {
      const updated = prev.map((e) =>
        e.type === 'director_redirect_request' && e.requestId === requestId
          ? { ...e, requestId: undefined }
          : e,
      )
      return [
        ...updated,
        {
          id: crypto.randomUUID(),
          type: approved ? 'director_redirect_approved' as WorkflowLogEntry['type'] : 'director_redirect_declined' as WorkflowLogEntry['type'],
          content: approved ? t('log.redirectApproved') : t('log.continuingForward'),
          timestamp: new Date(),
        },
      ]
    })
  }, [t])

  // Respond to a per-step approval prompt (approvalMode === 'perStep'). Approving
  // lets the step run; declining stops the whole flow — the server resolves the
  // gate, halts the run, and emits 'chain:stopped' which resets the UI.
  const handleStepApprovalRespond = useCallback((requestId: string, approved: boolean) => {
    const chainId = workflowChainIdRef.current
    if (!chainId) return

    getSocket().emit('chain:step_approval_response', { chainId, requestId, approved })

    // Clear the pending request so its buttons disappear once answered.
    setWorkflowLog((prev) =>
      prev.map((e) =>
        e.type === 'step_approval_request' && e.requestId === requestId
          ? { ...e, requestId: undefined }
          : e,
      ),
    )
  }, [])

  // Track current chain ID, steps, per-step usage, per-step chat messages, and accumulated text
  const workflowChainIdRef = useRef<string>('')
  const lastCompletedChainIdRef = useRef<string>('')
  const workflowStepsRef = useRef<ReturnType<typeof buildChain>>([])
  const workflowSkippedStepsRef = useRef<Set<number>>(new Set())
  const workflowStepUsageRef = useRef<Map<number, import('@rondoflow/shared').TokenUsage>>(new Map())
  const addTokensRef = useRef(addTokens)
  addTokensRef.current = addTokens
  const workflowStepMsgsRef = useRef<Map<number, ChatMessage[]>>(new Map())
  const workflowStepTextRef = useRef<Map<number, string>>(new Map())
  // Definitive per-step output for the current run, keyed by stepIndex (retries
  // overwrite). Cleared at run start so auto-save only folds in this run's steps.
  // `agentId` lets Output nodes match a specific agent's output by canvas node id.
  const workflowStepOutputRef = useRef<Map<number, { agentId: string; agentName: string; output: string }>>(new Map())
  // Per-run send guard so an Email node never double-sends if `chain:complete`
  // is re-delivered (reconnect / duplicate event). The file path tolerates a
  // re-save; an email must not be sent twice.
  const emailedChainIdsRef = useRef<Set<string>>(new Set())
  // The socket-listener effect attaches once with an empty dep array, so it can't
  // close over the latest `t`. Mirror `t` into a ref the handlers read instead, so
  // log strings re-localize correctly after a language switch.
  const tRef = useRef(t)
  tRef.current = t

  // Auto-save the just-finished run's combined output to a markdown file. On
  // success it stamps the completion entry (by id) with the saved filename so the
  // Execution Log can offer an "Open result" button; on failure it logs an error.
  // Always clears the entry's `savingOutput` spinner when it resolves.
  const autoSaveWorkflowOutput = useCallback(
    async (completeEntryId: string) => {
      const finalize = (patch: Partial<WorkflowLogEntry>, extra?: WorkflowLogEntry) =>
        setWorkflowLog((prev) => {
          // The completion entry may have been cleared by a new run starting while
          // this save was in flight — drop the stale result instead of leaking it
          // (and its "Output saved" line) into an unrelated run's log.
          if (!prev.some((e) => e.id === completeEntryId)) return prev
          const mapped = prev.map((e) =>
            e.id === completeEntryId ? { ...e, savingOutput: false, ...patch } : e,
          )
          return extra ? [...mapped, extra] : mapped
        })

      const steps = [...workflowStepOutputRef.current.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => v)
        .filter((v) => v.output.trim().length > 0)
      if (steps.length === 0) {
        finalize({})
        return
      }

      const fullOutput = steps
        .map((v) => `## ${v.agentName}\n\n${v.output}`)
        .join('\n\n---\n\n')
      // Full ms precision + short random suffix so back-to-back saves in the same
      // second can't collide and silently overwrite each other's file.
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `workflow-output-${stamp}-${crypto.randomUUID().slice(0, 8)}.md`
      const dir = workspaceWorkingDir || '.'

      // Bound the request so a hung connection can't pin the "Saving output…"
      // spinner forever — an abort rejects into the catch, which clears it.
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? NETWORK.DEFAULT_API_URL
        const res = await fetch(`${API_BASE}/api/fs/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ directory: dir, filename, content: fullOutput }),
          signal: controller.signal,
        })
        const data = await res.json()
        if (data?.success) {
          finalize(
            { savedOutputName: filename },
            {
              id: crypto.randomUUID(),
              type: 'system',
              content: t('log.outputSavedTo', { path: data.data.path }),
              timestamp: new Date(),
            },
          )
        } else {
          finalize(
            {},
            {
              id: crypto.randomUUID(),
              type: 'error',
              content: t('log.autoSaveFailed', { error: data?.error ?? t('log.unknownError') }),
              timestamp: new Date(),
            },
          )
        }
      } catch (err) {
        finalize(
          {},
          {
            id: crypto.randomUUID(),
            type: 'error',
            content: t('log.autoSaveFailed', { error: err instanceof Error ? err.message : t('log.unknownError') }),
            timestamp: new Date(),
          },
        )
      } finally {
        clearTimeout(timeout)
      }
    },
    [workspaceWorkingDir, t],
  )
  const autoSaveWorkflowOutputRef = useRef(autoSaveWorkflowOutput)
  autoSaveWorkflowOutputRef.current = autoSaveWorkflowOutput

  // Process Output node(s) after a run: each saves its own configured artifact
  // (selected agents, format, destination). Additive to the blanket auto-save —
  // a default Output node may duplicate it, which is the intended behaviour.
  const processOutputNodes = useCallback(async () => {
    const outputNodes = nodesRef.current.filter((n) => n.type === 'output')
    if (outputNodes.length === 0) return

    const runSteps = [...workflowStepOutputRef.current.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v)
      .filter((v) => v.output.trim().length > 0)

    const pushLog = (type: WorkflowLogEntry['type'], content: string) =>
      setWorkflowLog((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type, content, timestamp: new Date() },
      ])

    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? NETWORK.DEFAULT_API_URL
    let lastSaved: string | null = null
    // Per-node {name, dir} of the file each output node wrote — patched back into
    // node data so the node can offer an "Open saved output" button afterwards.
    const savedByNode = new Map<string, { name: string; dir: string }>()

    for (const node of outputNodes) {
      const data = node.data as OutputNodeData
      const nodeName = data.name || t('output.defaultName')
      const selected =
        data.agentSelection === 'all'
          ? runSteps
          : runSteps.filter((s) => (data.agentSelection as readonly string[]).includes(s.agentId))

      if (selected.length === 0) {
        pushLog('system', t('log.outputNoMatch', { name: nodeName }))
        continue
      }

      const content = formatRunOutput(
        selected.map((s) => ({ agentName: s.agentName, output: s.output })),
        { format: data.format, title: data.title },
      )
      const ext = OUTPUT_FORMAT_EXT[data.format]
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `workflow-output-${stamp}-${crypto.randomUUID().slice(0, 8)}.${ext}`
      const dir = data.destinationDir || workspaceWorkingDir || '.'

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      try {
        const res = await fetch(`${API_BASE}/api/fs/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ directory: dir, filename, content }),
          signal: controller.signal,
        })
        const resp = await res.json()
        if (resp?.success) {
          lastSaved = filename
          savedByNode.set(node.id, { name: filename, dir })
          pushLog('system', t('log.outputNodeSaved', { name: nodeName, path: resp.data.path }))
        } else {
          pushLog('error', t('log.outputNodeSaveFailed', { name: nodeName, error: resp?.error ?? t('log.unknownError') }))
        }
      } catch (err) {
        pushLog(
          'error',
          t('log.outputNodeSaveFailed', { name: nodeName, error: err instanceof Error ? err.message : t('log.unknownError') }),
        )
      } finally {
        clearTimeout(timeout)
      }
    }

    if (lastSaved) setOutputLogInitialName(lastSaved)

    // Record each node's saved file so it can re-open it later (also persists).
    if (savedByNode.size > 0) {
      setNodes((prev) =>
        prev.map((n) => {
          const saved = savedByNode.get(n.id)
          return saved
            ? { ...n, data: { ...n.data, savedOutputName: saved.name, savedOutputDir: saved.dir } }
            : n
        }),
      )
    }
  }, [workspaceWorkingDir, t])
  const processOutputNodesRef = useRef(processOutputNodes)
  processOutputNodesRef.current = processOutputNodes

  // Process Email node(s) after a run: each enabled node renders the selected
  // agents' output as HTML (markdown→HTML via the shared formatter) and POSTs it
  // to the server, which sends it over SMTP. Disabled nodes are skipped so
  // building a workflow never sends mail until the user opts in. Guarded per
  // chainId so a re-delivered `chain:complete` can't double-send.
  const processEmailNodes = useCallback(async (chainId: string) => {
    const emailNodes = nodesRef.current.filter(
      (n) => n.type === 'email' && (n.data as EmailNodeData).enabled,
    )
    if (emailNodes.length === 0) return
    if (emailedChainIdsRef.current.has(chainId)) return
    emailedChainIdsRef.current.add(chainId)

    const runSteps = [...workflowStepOutputRef.current.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v)
      .filter((v) => v.output.trim().length > 0)

    const pushLog = (type: WorkflowLogEntry['type'], content: string) =>
      setWorkflowLog((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type, content, timestamp: new Date() },
      ])

    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? NETWORK.DEFAULT_API_URL
    // Per-node send result patched back into node data for the status chip.
    const sentByNode = new Map<string, { status: 'sent' | 'error'; detail: string; at: string }>()

    for (const node of emailNodes) {
      const data = node.data as EmailNodeData
      const nodeName = data.name || t('email.defaultName')
      const { valid: recipients } = parseRecipients(data.recipients)

      if (recipients.length === 0) {
        pushLog('system', t('log.emailNoRecipients', { name: nodeName }))
        continue
      }

      const selected =
        data.agentSelection === 'all'
          ? runSteps
          : runSteps.filter((s) => (data.agentSelection as readonly string[]).includes(s.agentId))

      if (selected.length === 0) {
        pushLog('system', t('log.emailNoMatch', { name: nodeName }))
        continue
      }

      const steps = selected.map((s) => ({ agentName: s.agentName, output: s.output }))
      const html = formatRunOutput(steps, { format: 'html', title: data.title })
      const text = formatRunOutput(steps, { format: 'text', title: data.title })
      const subject = data.subject?.trim() || t('email.defaultSubject')
      const at = new Date().toISOString()

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20000)
      try {
        const res = await fetch(`${API_BASE}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ recipients, subject, html, text }),
          signal: controller.signal,
        })
        const resp = await res.json()
        if (resp?.success) {
          const to = recipients.join(', ')
          sentByNode.set(node.id, { status: 'sent', detail: to, at })
          pushLog('system', t('log.emailSent', { name: nodeName, count: recipients.length, to }))
        } else {
          const error = resp?.error ?? t('log.unknownError')
          sentByNode.set(node.id, { status: 'error', detail: error, at })
          pushLog('error', t('log.emailSendFailed', { name: nodeName, error }))
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : t('log.unknownError')
        sentByNode.set(node.id, { status: 'error', detail: error, at })
        pushLog('error', t('log.emailSendFailed', { name: nodeName, error }))
      } finally {
        clearTimeout(timeout)
      }
    }

    // Record each node's send result so its status chip reflects the last attempt.
    if (sentByNode.size > 0) {
      setNodes((prev) =>
        prev.map((n) => {
          const sent = sentByNode.get(n.id)
          return sent
            ? {
                ...n,
                data: { ...n.data, lastSentStatus: sent.status, lastSentDetail: sent.detail, lastSentAt: sent.at },
              }
            : n
        }),
      )
    }
  }, [t])
  const processEmailNodesRef = useRef(processEmailNodes)
  processEmailNodesRef.current = processEmailNodes

  // Listen for chain socket events to update workflow log
  const chainListenersAttachedRef = useRef(false)
  useEffect(() => {
    if (chainListenersAttachedRef.current) return
    chainListenersAttachedRef.current = true

    const socket = getSocket()

    socket.on('chain:step_start', (data: { chainId: string; stepIndex: number; agentId: string; cwd?: string }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      const steps = workflowStepsRef.current
      const step = steps[data.stepIndex]
      const agentName = step?.agentName ?? tRef.current('fallbackAgent.stepLabel', { index: data.stepIndex + 1 })

      setWorkflowStep({ index: data.stepIndex + 1, total: steps.length, agentName })

      // Set chain visual state: active for current, pending for future
      setNodes((prev) => prev.map((n) => {
        if (n.type !== 'agent' && n.type !== 'structurer' && n.type !== 'db-save' && n.type !== 'http-request' && n.type !== 'duckduckgo-search' && n.type !== 'sakana-ai') return n
        const nd = n.data as import('@/lib/canvas-utils').AgentNodeData
        if (n.id === data.agentId) {
          return { ...n, data: { ...nd, chainState: 'active' } }
        }
        // Mark not-yet-started agents as pending, but keep terminal states
        // (completed / skipped) so a routed-away branch stays dimmed mid-run.
        if (
          nd.chainState !== 'completed' &&
          nd.chainState !== 'active' &&
          nd.chainState !== 'skipped'
        ) {
          return { ...n, data: { ...nd, chainState: 'pending' } }
        }
        return n
      }))

      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'step_start' as const,
          content: '',
          agentName,
          stepIndex: data.stepIndex,
          cwd: data.cwd,
          timestamp: new Date(),
        },
      ])
      // Update canvas node status to running
      setNodes((prev) => prev.map((n) =>
        n.id === data.agentId ? { ...n, data: { ...n.data, status: 'running' } } : n,
      ))
      // Init step tracking
      workflowStepMsgsRef.current.set(data.stepIndex, [])
      workflowStepTextRef.current.set(data.stepIndex, '')
    })

    // Streaming text — accumulate in ref, update single log entry per step
    socket.on('chain:step_text', (data: { chainId: string; stepIndex: number; agentId: string; content: string; partial: boolean }) => {
      if (data.chainId !== workflowChainIdRef.current) return

      // Accumulate text in ref (source of truth)
      const prev = workflowStepTextRef.current.get(data.stepIndex) ?? ''
      const accumulated = prev + data.content
      workflowStepTextRef.current.set(data.stepIndex, accumulated)

      // Update or create a single step_text entry for this stepIndex
      setWorkflowLog((logPrev) => {
        const idx = logPrev.findIndex(
          (e) => e.type === 'step_text' && e.stepIndex === data.stepIndex,
        )

        const entry = {
          id: idx >= 0 ? logPrev[idx]!.id : crypto.randomUUID(),
          type: 'step_text' as const,
          content: accumulated,
          stepIndex: data.stepIndex,
          partial: data.partial,
          timestamp: idx >= 0 ? logPrev[idx]!.timestamp : new Date(),
        }

        if (idx >= 0) {
          return [...logPrev.slice(0, idx), entry, ...logPrev.slice(idx + 1)]
        }
        return [...logPrev, entry]
      })
    })

    // Tool usage
    socket.on('chain:step_tool_use', (data: { chainId: string; stepIndex: number; agentId: string; toolName: string; input: unknown; id: string }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      const steps = workflowStepsRef.current
      const step = steps[data.stepIndex]
      const agentName = step?.agentName ?? tRef.current('fallbackAgent.stepLabel', { index: data.stepIndex + 1 })

      // Collect for step history
      const stepMsgs = workflowStepMsgsRef.current.get(data.stepIndex) ?? []
      stepMsgs.push({ id: data.id, role: 'tool', content: data.toolName, toolUse: { toolName: data.toolName, input: data.input }, timestamp: new Date() })
      workflowStepMsgsRef.current.set(data.stepIndex, stepMsgs)

      setWorkflowLog((prev) => [
        ...prev,
        {
          id: data.id,
          type: 'step_tool_use' as const,
          content: data.toolName,
          agentName,
          stepIndex: data.stepIndex,
          toolUse: { toolName: data.toolName, input: data.input, id: data.id },
          timestamp: new Date(),
        },
      ])
    })

    // Tool result — update matching tool_use entry with output
    socket.on('chain:step_tool_result', (data: { chainId: string; stepIndex: number; agentId: string; toolName: string; output: unknown; toolUseId: string }) => {
      if (data.chainId !== workflowChainIdRef.current) return

      // Update step history tool message
      const stepMsgs = workflowStepMsgsRef.current.get(data.stepIndex) ?? []
      const toolMsg = stepMsgs.find((m) => m.role === 'tool' && m.id === data.toolUseId)
      if (toolMsg?.toolUse) {
        toolMsg.toolUse.output = data.output
      }

      setWorkflowLog((prev) => {
        const toolIdx = prev.findIndex(
          (e) => e.type === 'step_tool_use' && e.toolUse?.id === data.toolUseId,
        )
        if (toolIdx < 0) return prev

        const existing = prev[toolIdx]!
        return [
          ...prev.slice(0, toolIdx),
          {
            ...existing,
            toolUse: { ...existing.toolUse!, output: data.output },
          },
          ...prev.slice(toolIdx + 1),
        ]
      })
    })

    // Per-step usage — store on a ref so step_complete can include it,
    // and also increment the global session token counter in the bottom bar.
    socket.on('chain:step_usage', (data: { chainId: string; stepIndex: number; agentId: string; usage: import('@rondoflow/shared').TokenUsage }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      workflowStepUsageRef.current.set(data.stepIndex, data.usage)
      const total = (data.usage?.inputTokens ?? 0) + (data.usage?.outputTokens ?? 0)
      addTokensRef.current(total)
    })

    socket.on('chain:step_complete', (data: { chainId: string; stepIndex: number; agentId: string; output: string }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      const steps = workflowStepsRef.current
      const step = steps[data.stepIndex]
      const agentName = step?.agentName ?? tRef.current('fallbackAgent.stepLabel', { index: data.stepIndex + 1 })
      const usage = workflowStepUsageRef.current.get(data.stepIndex)
      const isAgentStep = !step?.nodeType || step.nodeType === 'agent'
      // Record the definitive output so auto-save / Output nodes can rebuild the
      // run's result. agentId enables Output nodes to match a specific agent.
      // Non-agent steps (structurer/db-save) emit a JSON envelope / save summary,
      // not human content — keep them out of the auto-save and agent chat cache.
      if (isAgentStep) {
        workflowStepOutputRef.current.set(data.stepIndex, { agentId: data.agentId, agentName, output: data.output })
      }

      // Mark the step's node completed; structurer/db-save also surface a count.
      setNodes((prev) => prev.map((n) => {
        if (n.id !== data.agentId) return n
        if (n.type === 'structurer') {
          const ds = parseDataset(data.output)
          return { ...n, data: { ...(n.data as StructurerNodeData), chainState: 'completed', lastRowCount: ds?.rows.length ?? 0, lastError: undefined } }
        }
        if (n.type === 'db-save') {
          const m = data.output.match(/Saved\s+(\d+)\s+row.*?dataset\s+([\w-]+)/i)
          return { ...n, data: { ...(n.data as DbSaveNodeData), chainState: 'completed', ...(m ? { savedRowCount: Number(m[1]), savedDatasetId: m[2] } : {}) } }
        }
        if (n.type === 'http-request') {
          return { ...n, data: { ...(n.data as HttpRequestNodeData), chainState: 'completed', lastError: undefined, lastRequestAt: new Date().toISOString() } }
        }
        if (n.type === 'duckduckgo-search') {
          // Count results from the runner's own output (JSON array, or `\n\n`-
          // separated blocks; the "No results" message means zero).
          const out = data.output.trim()
          let lastResultCount = 0
          if (out.startsWith('[')) {
            try { const arr = JSON.parse(out); lastResultCount = Array.isArray(arr) ? arr.length : 0 } catch { lastResultCount = 0 }
          } else if (!out.startsWith('No DuckDuckGo results')) {
            lastResultCount = out.split(/\n\n+/).filter(Boolean).length
          }
          return { ...n, data: { ...(n.data as DuckDuckGoSearchNodeData), chainState: 'completed', lastError: undefined, lastResultCount, lastSearchAt: new Date().toISOString() } }
        }
        if (n.type === 'sakana-ai') {
          return { ...n, data: { ...(n.data as SakanaAiNodeData), chainState: 'completed', lastError: undefined, lastRequestAt: new Date().toISOString() } }
        }
        if (n.type === 'agent') {
          return { ...n, data: { ...(n.data as import('@/lib/canvas-utils').AgentNodeData), chainState: 'completed' } }
        }
        return n
      }))

      setWorkflowLog((prev) => {
        // Mark the step_start entry as completed and remove duplicates
        const updated = prev
          .filter((entry) => {
            // Remove previous step_complete for this step (retry case)
            if (entry.type === 'step_complete' && entry.stepIndex === data.stepIndex) return false
            // Remove step_text for this step (output already shown in step_complete)
            if (entry.type === 'step_text' && entry.stepIndex === data.stepIndex) return false
            return true
          })
          .map((entry) =>
            entry.type === 'step_start' && entry.stepIndex === data.stepIndex
              ? { ...entry, completed: true }
              : entry,
          )
        return [
          ...updated,
          {
            id: crypto.randomUUID(),
            type: 'step_complete' as const,
            content: data.output,
            agentName,
            stepIndex: data.stepIndex,
            usage,
            timestamp: new Date(),
          },
        ]
      })
      // Update canvas node status back to idle
      setNodes((prev) => prev.map((n) =>
        n.id === data.agentId ? { ...n, data: { ...n.data, status: 'idle' } } : n,
      ))
      // Build definitive step history from the complete output
      const stepMsgs = workflowStepMsgsRef.current.get(data.stepIndex) ?? []
      const finalMsgs = [
        ...stepMsgs.filter((m) => m.role === 'tool'),
        ...(data.output ? [{ id: crypto.randomUUID(), role: 'assistant' as const, content: data.output, timestamp: new Date() }] : []),
      ]
      workflowStepMsgsRef.current.set(data.stepIndex, finalMsgs)
      // Auto-inject into agent chat cache so opening the agent
      // from canvas/sidebar shows the workflow history immediately. Skip for
      // non-agent steps — their id is a node id with no agent chat behind it.
      if (finalMsgs.length > 0 && isAgentStep) {
        injectMessagesIntoCache(data.agentId, finalMsgs, usage)
      }
    })

    socket.on('chain:step_skipped', (data: { chainId: string; stepIndex: number; agentId: string; reason: string }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      workflowSkippedStepsRef.current.add(data.stepIndex)
      const steps = workflowStepsRef.current
      const agentName = steps[data.stepIndex]?.agentName ?? tRef.current('fallbackAgent.stepLabel', { index: data.stepIndex + 1 })
      // Dim the skipped node on the canvas (agent or structurer/db-save).
      setNodes((prev) => prev.map((n) => {
        if (n.id !== data.agentId) return n
        if (n.type !== 'agent' && n.type !== 'structurer' && n.type !== 'db-save' && n.type !== 'http-request' && n.type !== 'duckduckgo-search' && n.type !== 'sakana-ai') return n
        const nd = n.data as import('@/lib/canvas-utils').AgentNodeData
        return { ...n, data: { ...nd, chainState: 'skipped', status: 'idle' } }
      }))
      const why = data.reason === 'condition_not_met'
        ? tRef.current('log.skipReasonConditionNotMet')
        : data.reason === 'error_cascade'
          ? tRef.current('log.skipReasonErrorCascade')
          : tRef.current('log.skipReasonNoActivePath')
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'system' as const,
          content: tRef.current('log.stepSkipped', { agentName, reason: why }),
          timestamp: new Date(),
        },
      ])
    })

    socket.on('chain:complete', (data: { chainId: string; totalSteps: number }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      setWorkflowRunning(false)
      setWorkflowStep(null)
      setDirectorStatus('idle')
      setDirectorLastAction(null)
      setPlannerStatus('idle')

      // Clear chain visual states after a delay (keep completed checkmarks visible briefly)
      setTimeout(() => {
        setNodes((prev) => prev.map((n) => {
          if (n.type !== 'agent' && n.type !== 'structurer' && n.type !== 'db-save' && n.type !== 'http-request' && n.type !== 'duckduckgo-search' && n.type !== 'sakana-ai') return n
          const nd = n.data as import('@/lib/canvas-utils').AgentNodeData
          if (nd.chainState) {
            return { ...n, data: { ...nd, chainState: undefined } }
          }
          return n
        }))
      }, 3000)
      lastCompletedChainIdRef.current = data.chainId

      // Calculate total usage across all steps
      let totalIn = 0
      let totalOut = 0
      let totalCost = 0
      workflowStepUsageRef.current.forEach((u) => {
        totalIn += u.inputTokens
        totalOut += u.outputTokens
        totalCost += u.estimatedCostUsd ?? 0
      })
      const totalUsage = totalIn > 0 ? { inputTokens: totalIn, outputTokens: totalOut, estimatedCostUsd: totalCost } : undefined
      workflowStepUsageRef.current.clear()
      workflowStepTextRef.current.clear()

      // Auto-save this run's combined output, then attach the saved file to the
      // completion entry so it offers an "Open result" button. Built from the
      // per-step output ref (scoped to this run) — not the whole persisted log.
      const completeEntryId = crypto.randomUUID()
      const hasOutputToSave = [...workflowStepOutputRef.current.values()].some(
        (v) => v.output.trim().length > 0,
      )
      const skippedCount = workflowSkippedStepsRef.current.size
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: completeEntryId,
          type: 'chain_complete' as const,
          content: skippedCount > 0
            ? tRef.current('log.completedStepsSkipped', { done: data.totalSteps - skippedCount, total: data.totalSteps, skipped: skippedCount })
            : tRef.current('log.completedSteps', { done: data.totalSteps - skippedCount, total: data.totalSteps }),
          usage: totalUsage,
          savingOutput: hasOutputToSave,
          timestamp: new Date(),
        },
      ])
      if (hasOutputToSave) void autoSaveWorkflowOutputRef.current(completeEntryId)
      // Output node(s) save their own configured artifacts on top of the auto-save.
      void processOutputNodesRef.current()
      // Email node(s) send their configured reports (enabled nodes only).
      void processEmailNodesRef.current(data.chainId)
    })

    socket.on('chain:error', (data: { chainId: string; stepIndex: number; error: string }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      const steps = workflowStepsRef.current
      const step = steps[data.stepIndex]
      const agentName = step?.agentName ?? tRef.current('fallbackAgent.stepLabel', { index: data.stepIndex + 1 })

      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'error' as const,
          content: tRef.current('log.stepError', { agentName, error: data.error }),
          timestamp: new Date(),
        },
      ])
    })

    // Director events
    socket.on('chain:director_decision', (data) => {
      if (data.chainId !== workflowChainIdRef.current) return

      // Detect "thinking" vs actual decision
      const isThinking = data.reasoning === 'Evaluating step output...'
      if (isThinking) {
        setDirectorStatus('thinking')
        return
      }

      // Update canvas-level director status
      setDirectorStatus('decided')
      setDirectorLastAction(data.action)
      setDirectorLastTargetAgent(data.targetAgentName || null)
      // Reset to idle after a moment so the badge fades
      setTimeout(() => {
        setDirectorStatus('idle')
        setDirectorLastAction(null)
        setDirectorLastTargetAgent(null)
      }, 4000)

      // Replace any existing "thinking" entry with the actual decision
      setWorkflowLog((prev) => {
        const withoutThinking = prev.filter((e) => e.type !== 'director_thinking')
        const entryType: WorkflowLogEntry['type'] = 'director_decision'
        return [
          ...withoutThinking,
          {
            id: crypto.randomUUID(),
            type: entryType,
            content: data.reasoning,
            directorAction: data.action,
            timestamp: new Date(),
          },
        ]
      })
    })

    socket.on('chain:director_redirect_request', (data) => {
      if (data.chainId !== workflowChainIdRef.current) return

      const entryType: WorkflowLogEntry['type'] = 'director_redirect_request'
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: entryType,
          content: data.reasoning,
          agentName: data.toAgent,
          requestId: data.requestId,
          timestamp: new Date(),
        },
      ])
    })

    // Per-step approval prompt (approvalMode === 'perStep'): pause before a step.
    socket.on('chain:step_approval_request', (data: { chainId: string; stepIndex: number; agentId: string; requestId: string }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      const steps = workflowStepsRef.current
      const step = steps[data.stepIndex]
      const agentName = step?.agentName ?? tRef.current('fallbackAgent.stepLabel', { index: data.stepIndex + 1 })

      setWorkflowChatOpen(true)
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'step_approval_request' as const,
          content: '',
          agentName,
          stepIndex: data.stepIndex,
          requestId: data.requestId,
          timestamp: new Date(),
        },
      ])
    })

    // Server stopped the run on its own (e.g. a step approval timed out).
    socket.on('chain:stopped', (data: { chainId: string; reason: string }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      setWorkflowRunning(false)
      setWorkflowStep(null)
      setDirectorStatus('idle')
      setPlannerStatus('idle')
      setWorkflowLog((prev) => [
        ...prev.map((e) =>
          e.type === 'step_approval_request' && e.requestId ? { ...e, requestId: undefined } : e,
        ),
        {
          id: crypto.randomUUID(),
          type: 'system' as const,
          content: tRef.current('log.workflowStoppedReason', { reason: data.reason }),
          timestamp: new Date(),
        },
      ])
    })

    // Planner events
    socket.on('chain:planner_start', (data: { chainId: string }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      setPlannerStatus('planning')
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'system' as const,
          content: tRef.current('log.plannerAnalyzing'),
          timestamp: new Date(),
        },
      ])
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('chain:planner_result', (data: { chainId: string; plan: any }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      setPlannerStatus('done')
      const plan = data.plan
      const changesCount = (plan?.agentChanges?.length ?? 0) + (plan?.edgeChanges?.length ?? 0)
      const summary = changesCount > 0
        ? tRef.current('log.plannerSuggests', { count: changesCount, analysis: plan.analysis })
        : tRef.current('log.plannerApproved', { analysis: plan.analysis })
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'system' as const,
          content: summary,
          timestamp: new Date(),
        },
      ])
    })

    socket.on('chain:planner_error', (data: { chainId: string; error: string }) => {
      if (data.chainId !== workflowChainIdRef.current) return
      setPlannerStatus('idle')
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'error' as const,
          content: tRef.current('log.plannerError', { error: data.error }),
          timestamp: new Date(),
        },
      ])
    })

    // Advisor events
    socket.on('advisor:analyzing', (data) => {
      if (data.chainId !== lastCompletedChainIdRef.current) return
      setAdvisorRunning(true)
      setWorkflowChatOpen(true)
      const entryType: WorkflowLogEntry['type'] = 'advisor_analyzing'
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: entryType,
          content: tRef.current('log.advisorAnalyzing'),
          timestamp: new Date(),
        },
      ])
    })

    socket.on('advisor:result', (data) => {
      if (data.chainId !== lastCompletedChainIdRef.current) return
      setAdvisorRunning(false)
      setWorkflowChatOpen(true)
      const entryType: WorkflowLogEntry['type'] = 'advisor_result'
      setWorkflowLog((prev) => {
        const withoutAnalyzing = prev.filter((e) => e.type !== 'advisor_analyzing')
        return [
          ...withoutAnalyzing,
          {
            id: crypto.randomUUID(),
            type: entryType,
            content: data.result.overallAssessment,
            advisorResult: data.result,
            timestamp: new Date(),
          },
        ]
      })
    })

    socket.on('advisor:error', (data) => {
      if (data.chainId !== lastCompletedChainIdRef.current) return
      setAdvisorRunning(false)
      setWorkflowLog((prev) => {
        const withoutAnalyzing = prev.filter((e) => e.type !== 'advisor_analyzing')
        return [
          ...withoutAnalyzing,
          {
            id: crypto.randomUUID(),
            type: 'error' as const,
            content: tRef.current('log.advisorFailed', { error: data.error }),
            timestamp: new Date(),
          },
        ]
      })
    })

    // Listen for executor-level errors (e.g. agent not found, chain execution failed)
    // These are emitted as 'agent:error' by the backend when the whole chain fails
    socket.on('agent:error', (data: { agentId: string; sessionId: string; error: string; type: string }) => {
      // Match by chainId (stored in agentId field for chain-level errors)
      if (data.agentId !== workflowChainIdRef.current) return

      setWorkflowRunning(false)
      setWorkflowStep(null)
      setWorkflowLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'error' as const,
          content: data.error,
          timestamp: new Date(),
        },
      ])
    })
  }, [])

  const handleDuplicate = useCallback(() => {
    if (!canEdit) return
    viewRef.current?.duplicateSelection()
  }, [canEdit])
  const handleFindNode = useCallback(() => setNodeFinderOpen(true), [])

  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDelete: handleDelete,
    onSelectAll: handleSelectAll,
    onCommandPalette: handleCommandPalette,
    onCreateAgent: handleCreateAgent,
    onToggleMarketplace: handleToggleMarketplace,
    onToggleShortcuts: handleToggleShortcuts,
    onEscape: handleEscape,
    onQuickRun: handleQuickRun,
    onDuplicate: handleDuplicate,
    onFindNode: handleFindNode,
  })

  // ── Node double-click → open AgentChat ────────────────────────────────

  const handleNodeDoubleClick = useCallback(
    (nodeId: string, nodeType: string) => {
      if (nodeType === 'resource') {
        openPanel({ type: 'resource-browser' })
        return
      }
      if (nodeType === 'skill') {
        openPanel({ type: 'skill-marketplace' })
        return
      }
      if (nodeType === 'policy') {
        openPanel({ type: 'safety' })
        return
      }
      if (nodeType === 'mcp') {
        openPanel({ type: 'mcp-management' })
        return
      }
      if (nodeType === 'output') {
        openPanel({ type: 'output-node', nodeId })
        return
      }
      if (nodeType === 'email') {
        openPanel({ type: 'email-node', nodeId })
        return
      }
      if (nodeType === 'condition') {
        openPanel({ type: 'condition-node', nodeId })
        return
      }
      if (nodeType === 'structurer') {
        openPanel({ type: 'structurer-node', nodeId })
        return
      }
      if (nodeType === 'db-save') {
        openPanel({ type: 'db-save-node', nodeId })
        return
      }
      if (nodeType === 'http-request') {
        openPanel({ type: 'http-request-node', nodeId })
        return
      }
      if (nodeType === 'duckduckgo-search') {
        openPanel({ type: 'duckduckgo-search-node', nodeId })
        return
      }
      if (nodeType === 'sakana-ai') {
        openPanel({ type: 'sakana-ai-node', nodeId })
        return
      }

      if (nodeType !== 'agent') return

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const data = node.data as AgentNodeData
      setSelectedAgent({
        id: nodeId,
        name: data.name,
        description: data.description,
        purpose: data.purpose,
        status: data.status,
        model: data.model,
      })
      openPanel({ type: 'agent-chat', agentId: selectedAgent?.id ?? '' })
    },
    [nodes, openPanel, selectedAgent?.id],
  )

  // ── Approval dialog ────────────────────────────────────────────────────

  const handleApprovalDialogChange = useCallback(
    (open: boolean) => {
      if (!open) dismissDialog()
    },
    [dismissDialog],
  )

  const handleReviewApproval = useCallback((_notification: rondoflowNotification) => {
    void _notification
  }, [])

  const approvalDialogData = currentApproval
    ? {
        id: currentApproval.id,
        agentId: currentApproval.agentId,
        agentName: currentApproval.agentName,
        command: currentApproval.command,
        description: currentApproval.description,
        toolName: currentApproval.toolName,
      }
    : null

  // ── MCP server CRUD (persisted; auth secrets handled server-side) ───────

  const handleMcpAdd = useCallback((server: McpServerInput) => {
    apiPost<McpServer>('/api/mcp-servers', server)
      .then((created) => setMcpServers((prev) => [created, ...prev]))
      .catch((err) => toast({ description: err instanceof Error ? err.message : String(err), variant: 'error' }))
  }, [])

  const handleMcpEdit = useCallback((id: string, updates: McpServerInput) => {
    apiPatch<McpServer>(`/api/mcp-servers/${id}`, updates)
      .then((updated) => setMcpServers((prev) => prev.map((s) => (s.id === id ? updated : s))))
      .catch((err) => toast({ description: err instanceof Error ? err.message : String(err), variant: 'error' }))
  }, [])

  const handleMcpDelete = useCallback((id: string) => {
    apiDelete(`/api/mcp-servers/${id}`)
      .then(() => setMcpServers((prev) => prev.filter((s) => s.id !== id)))
      .catch((err) => toast({ description: err instanceof Error ? err.message : String(err), variant: 'error' }))
  }, [])

  // ── Agent ↔ MCP assignment ──────────────────────────────────────────────

  // Load the selected agent's MCP assignments whenever the drawer opens for it.
  const agentDrawerOpen = isOpen('agent-drawer')
  useEffect(() => {
    const agentId = selectedAgent?.id
    if (!agentId || !agentDrawerOpen) {
      setMcpAssignments([])
      return
    }
    apiGet<McpServer[]>(`/api/agents/${agentId}/mcp`)
      .then((servers) => setMcpAssignments(servers.map((s) => ({ serverId: s.id, fromSkill: null }))))
      .catch(() => setMcpAssignments([]))
  }, [selectedAgent?.id, agentDrawerOpen])

  const handleMcpToggle = useCallback((agentId: string, serverId: string, assigned: boolean) => {
    // Optimistic update, reverted on failure.
    setMcpAssignments((prev) =>
      assigned
        ? prev.some((a) => a.serverId === serverId)
          ? prev
          : [...prev, { serverId, fromSkill: null }]
        : prev.filter((a) => a.serverId !== serverId),
    )
    const request = assigned
      ? apiPost(`/api/agents/${agentId}/mcp/${serverId}`, {})
      : apiDelete(`/api/agents/${agentId}/mcp/${serverId}`)
    request.catch((err) => {
      toast({ description: err instanceof Error ? err.message : String(err), variant: 'error' })
      setMcpAssignments((prev) =>
        assigned
          ? prev.filter((a) => a.serverId !== serverId)
          : [...prev, { serverId, fromSkill: null }],
      )
    })
  }, [])

  // ── PRD pipeline ──────────────────────────────────────────────────────

  const handlePrdStart = useCallback((prd: PrdData) => {
    void prd
  }, [])

  // ── Canvas nodes/edges sync ───────────────────────────────────────────

  // Auto-save canvas on any change (debounced in the hook)
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  nodesRef.current = nodes
  edgesRef.current = edges

  useEffect(() => {
    if (!canvasLoaded || nodes.length === 0) return
    saveCanvas(nodes, edges)
  }, [nodes, edges, canvasLoaded, saveCanvas])

  // When a save (auto or explicit) finishes, the current canvas is now the
  // persisted baseline — clear the unsaved-changes highlight.
  const prevCanvasSavingRef = useRef(false)
  useEffect(() => {
    if (prevCanvasSavingRef.current && !canvasSaving) {
      setSavedCanvasKey(canvasDirtyKey(nodesRef.current, edgesRef.current))
    }
    prevCanvasSavingRef.current = canvasSaving
  }, [canvasSaving])

  const handleNodesChange = useCallback((updated: Node[]) => {
    // Detect removed nodes and clean up edges + DB
    setNodes((prev) => {
      const removedIds = new Set(
        prev.filter((n) => !updated.some((u) => u.id === n.id)).map((n) => n.id),
      )
      if (removedIds.size > 0) {
        // Remove edges connected to deleted nodes
        setEdges((prevEdges) =>
          prevEdges.filter((e) => !removedIds.has(e.source) && !removedIds.has(e.target)),
        )
        // Best-effort DB cleanup for agent nodes
        for (const id of removedIds) {
          void apiDelete(`/api/agents/${id}`).catch(() => {})
        }
      }
      return updated
    })
  }, [])

  // Mirror edge changes (new connections, deletions) from the canvas into the
  // authoritative parent state so they get persisted and used when running.
  const handleEdgesChange = useCallback((updated: Edge[]) => {
    setEdges(updated)
  }, [])

  // Explicit "Save canvas" — flushes immediately and flashes a confirmation.
  const handleSaveCanvasRef = useRef<() => void>(() => {})
  const handleSaveCanvas = useCallback(async () => {
    if (!canEdit) return
    const ok = await saveNow(nodesRef.current, edgesRef.current)
    if (ok) {
      setCanvasSaveFlash(true)
      setTimeout(() => setCanvasSaveFlash(false), 2000)
    } else {
      // Save no longer fails silently — surface it with a one-tap retry.
      toast({
        variant: 'error',
        description: t('toast.saveFailed'),
        duration: 8000,
        action: { label: t('toast.retry'), onClick: () => handleSaveCanvasRef.current() },
      })
    }
  }, [saveNow, canEdit, t])
  handleSaveCanvasRef.current = handleSaveCanvas

  // Export the active workspace as a shareable bundle and trigger a download.
  const handleExportCanvas = useCallback(async () => {
    if (!activeWorkspaceId) return
    try {
      // Flush any pending edits so the export reflects the on-screen canvas
      // (the server builds the bundle from the persisted layout).
      if (nodesRef.current.length > 0) await saveNow(nodesRef.current, edgesRef.current)
      const bundle = await apiGet<CanvasExportBundle>(`/api/workspaces/${activeWorkspaceId}/export`)

      const ws = workspaces.find((w) => w.id === activeWorkspaceId)
      const slug =
        (ws?.name ?? bundle.workspace?.name ?? 'canvas')
          .replace(/[^a-z0-9-_]+/gi, '-')
          .replace(/^-+|-+$/g, '')
          .toLowerCase() || 'canvas'

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-canvas.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      addNotification({
        level: 'info',
        title: t('notify.canvasExported.title'),
        description: t('notify.canvasExported.description', { file: a.download, count: bundle.agents.length }),
      })
    } catch (err) {
      addNotification({
        level: 'error',
        title: t('notify.exportFailed.title'),
        description: err instanceof Error ? err.message : t('notify.exportFailed.description'),
      })
    }
  }, [activeWorkspaceId, saveNow, workspaces, addNotification, t])

  // Import a previously-exported bundle as a NEW workspace, then switch to it.
  const handleImportCanvas = useCallback(async (file: File) => {
    try {
      // Mirror the server's 16 MB import limit so oversized files fail with a
      // clear message rather than a raw "Payload Too Large" from the framework.
      if (file.size > 16 * 1024 * 1024) {
        throw new Error(t('import.tooLarge'))
      }
      const text = await file.text()
      let bundle: unknown
      try {
        bundle = JSON.parse(text)
      } catch {
        throw new Error(t('import.invalidJson'))
      }

      const report = await apiPost<CanvasImportReport>('/api/canvas/import', { bundle })

      await refreshWorkspaces()
      await handleSelectWorkspace(report.workspaceId)

      const parts = [t('import.agents', { count: report.agentsCreated })]
      if (report.skillsInstalled > 0) parts.push(t('import.skillsInstalled', { count: report.skillsInstalled }))
      if (report.skillsSkipped.length > 0) parts.push(t('import.skillsSkipped', { count: report.skillsSkipped.length }))
      if (report.mcpServersCreated > 0) parts.push(t('import.mcpServers', { count: report.mcpServersCreated }))

      addNotification({
        level: report.warnings.length > 0 ? 'action_required' : 'info',
        title: t('notify.imported.title', { name: report.workspaceName }),
        description:
          parts.join(' · ') + (report.warnings.length > 0 ? `\n${report.warnings.join('\n')}` : ''),
      })
    } catch (err) {
      addNotification({
        level: 'error',
        title: t('notify.importFailed.title'),
        description: err instanceof Error ? err.message : t('notify.importFailed.description'),
      })
    }
  }, [refreshWorkspaces, handleSelectWorkspace, addNotification, t])

  // True when the canvas has edits not yet persisted (drives the Save highlight).
  const canvasDirty = showCanvas && canvasDirtyKey(nodes, edges) !== savedCanvasKey

  return (
    <ComplexityContext.Provider value={complexity}>
    {/* Onboarding Wizard — shown once for first-time users */}
    <OnboardingWizard open={showWizard} onComplete={handleOnboardingComplete} />

    <div className="flex h-screen flex-col overflow-hidden">
      <CliMissingBanner
        visible={!cliInstalled && !cliLoading}
        loading={cliLoading}
        onRecheck={recheckCli}
      />
      <div className="flex flex-1 overflow-hidden">
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {/* VSCode-style workspace tabs — also hosts the relocated sidebar
              controls: brand + Browse menu + favorites (left), tier + search +
              user menu (right). This is the only top chrome rendered for every
              canvas state, so browse/account never vanish on an empty canvas. */}
          <WorkspaceTabs
            workspaces={workspaces}
            activeId={activeWorkspaceId}
            onSelect={handleTabSelect}
            onCreateWorkspace={handleCreateWorkspace}
            onRenameWorkspace={canEdit ? handleRenameWorkspace : undefined}
            onDeleteWorkspace={canEdit ? handleDeleteWorkspace : undefined}
            onExportCanvas={activeWorkspaceId ? handleExportCanvas : undefined}
            onImportCanvas={canEdit ? handleImportCanvas : undefined}
            favorites={favoriteAgents}
            onSelectFavorite={handleSelectFavorite}
            browse={{
              skills: handleToggleMarketplace,
              facilitators: () => openPanel({ type: 'facilitators' }),
              discussions: handleTopBarDiscussionsClick,
              activity: handleActivityClick,
              audit: handleAuditClick,
              memory: handleMemoryClick,
              history: handleHistoryClick,
              analytics: handleAnalyticsClick,
              schedules: () => openPanel({ type: 'schedules' }),
              'external-folders': handleExternalFoldersClick,
            }}
            onCommandPalette={() => setCommandPaletteOpen(true)}
            onSettingsClick={handleSettingsClick}
            onUsersClick={canManageUsers ? () => openPanel({ type: 'users' }) : undefined}
            onRestartOnboarding={restartOnboarding}
          />
          <div className="relative min-h-0 flex-1 overflow-hidden">
          <CanvasReadOnlyProvider value={!canEdit}>
          {!canEdit && showCanvas && (
            <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-full border border-border bg-card/95 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
              {t('banner.viewOnly')}
            </div>
          )}
          <ErrorBoundary>
            <div
              className={showCanvas ? 'h-full w-full' : 'hidden'}
              aria-hidden={!showCanvas}
            >
              <WorkflowToolbar
                hasChain={hasAgentChain(nodes)}
                canRun={canRun}
                isRunning={workflowRunning}
                currentStep={workflowStep}
                onOpenRunPanel={() => setWorkflowChatOpen(true)}
                onStop={handleStopWorkflow}
                chatOpen={workflowChatOpen}
                onToggleChat={() => setWorkflowChatOpen((prev) => !prev)}
                directorEnabled={directorEnabled}
                directorStatus={directorStatus}
                directorLastAction={directorLastAction}
                directorLastTargetAgent={directorLastTargetAgent}
                onDirectorToggle={() => setDirectorEnabled((prev) => !prev)}
                advisorVisible={!!lastCompletedChainIdRef.current && !workflowRunning}
                advisorRunning={advisorRunning}
                onAdvisorClick={() => handleAdvisorRequest(advisorModel)}
                plannerEnabled={plannerEnabled}
                plannerStatus={plannerStatus}
                onPlannerToggle={() => setPlannerEnabled((prev) => !prev)}
                onAssistantsClick={handleAssistantsClick}
                onPlanClick={handlePlanClick}
                onResourcesClick={handleResourcesClick}
                canSave={showCanvas}
                canvasDirty={canvasDirty}
                canvasSaving={canvasSaving}
                canvasSaveFlash={canvasSaveFlash}
                onSaveCanvas={canEdit ? handleSaveCanvas : undefined}
              />
              <RondoflowCanvas
                initialNodes={nodes}
                initialEdges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onUndoRedoReady={handleUndoRedoReady}
                onViewReady={handleViewReady}
                onNodeDoubleClick={handleNodeDoubleClick}
                onViewOutput={handleViewNodeOutput}
                onZoomChange={setZoomLevel}
                onInvalidConnection={handleInvalidConnection}
                onElementDeleted={handleElementDeleted}
                activeAgentIds={activeAgentIds}
              />
              {/* Drag-to-canvas palette — bottom-center of the canvas */}
              <CanvasPalette onAddNode={handlePaletteAddNode} />
            </div>

            {!showCanvas && (
              <CanvasPlaceholder
                onCreateAssistant={handleWelcomeCreateAssistant}
                onStartDiscussion={() => { setShowHome(false); handleSidebarDiscussionsClick() }}
                onUseTemplate={handleWelcomeUseTemplate}
                onPickTemplate={(id) => { void handleWelcomePickTemplate(id) }}
                onExploreSkills={() => { setShowHome(false); handleToggleMarketplace() }}
                onDescribe={(desc) => { void handleDescribe(desc) }}
                onGoToWorkspace={goToWorkspace}
                hasExistingCanvas={savedNodes.some((n) => n.type !== 'start')}
                isGenerating={isGenerating}
              />
            )}
          </ErrorBoundary>
          </CanvasReadOnlyProvider>
          </div>
        </main>
      </div>

      <BottomBar
        connected={connected}
        connecting={connecting}
        socketError={socketError}
        runningAgentCount={runningAgentCount}
        sessionTokens={sessionTokens}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoState.canUndo}
        canRedo={undoState.canRedo}
        notifications={notifications}
        unreadCount={unreadCount}
        onAcknowledge={acknowledge}
        onAcknowledgeAll={acknowledgeAll}
        onRemoveNotification={removeNotification}
        onReviewApproval={handleReviewApproval}
      />

      <NodeFinder
        open={nodeFinderOpen}
        onClose={() => setNodeFinderOpen(false)}
        nodes={nodes}
        onPick={(id) => { viewRef.current?.focusNode(id); setNodeFinderOpen(false) }}
      />

      <ShortcutOverlay
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />

      {/* Assistants List */}
      <ErrorBoundary>
        <AssistantsList
          open={isOpen('assistants-list')}
          onOpenChange={(open) => open ? openPanel({ type: 'assistants-list' }) : closePanel()}
          assistants={nodes
            .filter((n) => n.type === 'agent')
            .map((n) => {
              const d = n.data as AgentNodeData
              return { id: n.id, name: d.name, description: d.description, status: d.status, model: d.model, purpose: d.purpose }
            })}
          onSelect={handleSelectAssistant}
          onCreateNew={handleCreateAgent}
          onDelete={handleDeleteAssistant}
        />
      </ErrorBoundary>

      {/* Facilitator List */}
      <ErrorBoundary>
        <FacilitatorList
          open={isOpen('facilitators')}
          onOpenChange={(open) => open ? openPanel({ type: 'facilitators' }) : closePanel()}
          onSelect={(f) => {
            closePanel()
            openPanel({ type: 'agent-drawer', agentId: f.id })
          }}
        />
      </ErrorBoundary>

      {/* Global Safety Panel */}
      <ErrorBoundary>
        <GlobalSafetyPanel
          open={isOpen('safety')}
          onOpenChange={(open) => open ? openPanel({ type: 'safety' }) : closePanel()}
        />
      </ErrorBoundary>

      {/* Settings Panel */}
      <ErrorBoundary>
        <SettingsPanel
          open={isOpen('settings')}
          onOpenChange={(open) => { if (!open) { closePanel(); refreshComplexity() } }}
        />
      </ErrorBoundary>

      {/* Admin: Users management — only mounted for admins */}
      {canManageUsers && (
        <ErrorBoundary>
          <UsersPanel
            open={isOpen('users')}
            onOpenChange={(open) => (open ? openPanel({ type: 'users' }) : closePanel())}
          />
        </ErrorBoundary>
      )}

      {/* Resource Browser */}
      <ErrorBoundary>
        <ResourceBrowser
          open={isOpen('resource-browser')}
          onOpenChange={(open) => open ? openPanel({ type: 'resource-browser' }) : closePanel()}
          workspaceId={activeWorkspaceId || null}
          onCountsChange={handleResourceCountsChange}
        />
      </ErrorBoundary>

      {/* Discussions List */}
      <ErrorBoundary>
        <DiscussionsList
          open={isOpen('discussions-list')}
          onOpenChange={(open) => {
            if (open) openPanel({ type: 'discussions-list' }); else closePanel()
            if (!open && activeTab === 'discussions') setActiveTab('workspace')
          }}
          discussions={discussions}
          onSelectDiscussion={handleSelectDiscussionFromList}
          onNewDiscussion={() => {
            /* discussions closed by panel switch */
            setDiscussionWizardOpen(true)
          }}
          onOpenFacilitators={() => openPanel({ type: 'facilitators' })}
        />
      </ErrorBoundary>

      {/* History Panel */}
      <ErrorBoundary>
        <HistoryPanel
          open={isOpen('history')}
          workspaceId={activeWorkspaceId}
          onRestore={handleRestoreRun}
          onOpenChange={(open) => {
            if (open) openPanel({ type: 'history' }); else closePanel()
            if (!open && activeTab === 'history') setActiveTab('workspace')
          }}
        />
      </ErrorBoundary>

      {/* Skill Marketplace */}
      <ErrorBoundary>
        <SkillMarketplace
          open={isOpen('skill-marketplace')}
          agentId={panel.type === 'skill-marketplace' ? panel.agentId : undefined}
          onOpenChange={(open) =>
            open
              ? openPanel(panel.type === 'skill-marketplace' ? panel : { type: 'skill-marketplace' })
              : closePanel()
          }
        />
      </ErrorBoundary>

      {/* External Folders */}
      <ErrorBoundary>
        <ExternalFoldersPanel
          open={isOpen('external-folders')}
          agentId={panel.type === 'external-folders' ? panel.agentId : undefined}
          onOpenChange={(open) =>
            open
              ? openPanel(panel.type === 'external-folders' ? panel : { type: 'external-folders' })
              : closePanel()
          }
        />
      </ErrorBoundary>

      {/* MCP Management */}
      <ErrorBoundary>
        <McpManagement
          open={isOpen('mcp-management')}
          onOpenChange={(open) => open ? openPanel({ type: 'mcp-management' }) : closePanel()}
          servers={mcpServers}
          onAdd={handleMcpAdd}
          onEdit={handleMcpEdit}
          onDelete={handleMcpDelete}
        />
      </ErrorBoundary>


      {/* PRD Editor */}
      <ErrorBoundary>
        <PrdEditor
          open={isOpen('prd-editor')}
          onOpenChange={(open) => open ? openPanel({ type: 'prd-editor' }) : closePanel()}
          onStartPipeline={handlePrdStart}
        />
      </ErrorBoundary>

      {/* AgentChat */}
      <Sheet open={isOpen('agent-chat')} onOpenChange={(open) => open ? openPanel({ type: 'agent-chat', agentId: selectedAgent?.id ?? '' }) : closePanel()}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">
            {selectedAgent ? t('agentChat.sheetTitleWith', { name: selectedAgent.name }) : t('agentChat.sheetTitle')}
          </SheetTitle>
          <ErrorBoundary>
            {selectedAgent ? (
              <AgentChat
                agentId={selectedAgent.id}
                agentName={selectedAgent.name}
                agentDescription={selectedAgent.description}
                agentPurpose={selectedAgent.purpose}
                agentStatus={selectedAgent.status}
                agentModel={selectedAgent.model}
                workspaceId={activeWorkspaceId || null}
                onEdit={() => {
                  closePanel()
                  openPanel({ type: 'agent-drawer', agentId: selectedAgent?.id ?? '' })
                }}
                onManageResources={() => {
                  openPanel({ type: 'resource-browser' })
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {t('agentChat.empty')}
              </div>
            )}
          </ErrorBoundary>
        </SheetContent>
      </Sheet>

      {/* Agent Drawer (edit) */}
      <ErrorBoundary>
        <AgentDrawer
          agent={selectedAgent ? ((): Agent => {
            // Pull provider config + persona from the live canvas node so the
            // drawer can lazily persist a not-yet-saved (palette-dropped) agent.
            const nodeData = nodes.find((n) => n.id === selectedAgent.id)?.data as
              | AgentNodeData
              | undefined
            return {
              id: selectedAgent.id,
              name: selectedAgent.name,
              avatar: null,
              description: selectedAgent.description ?? null,
              persona: (nodeData?.message as string | undefined) ?? '',
              purpose: (selectedAgent.purpose ?? null) as Agent['purpose'],
              scope: [],
              allowedTools: [],
              memoryEnabled: false,
              model: (selectedAgent.model ?? null) as Agent['model'],
              provider: nodeData?.provider ?? 'claude-code',
              providerConfig: nodeData?.providerConfig ?? null,
              status: selectedAgent.status,
              permissionMode: 'default' as const,
              loopEnabled: false,
              loopCriteria: null,
              maxIterations: 10,
              teamEnabled: false,
              isFavorite: false,
              canvasX: 0,
              canvasY: 0,
              createdAt: '',
              updatedAt: '',
            }
          })() : null}
          open={isOpen('agent-drawer')}
          onOpenChange={(open) => open ? openPanel({ type: 'agent-drawer', agentId: selectedAgent?.id ?? '' }) : closePanel()}
          onSave={(updates) => {
            if (!selectedAgent) return
            // The drawer persists to the agent record itself (apiPatch); here we
            // only mirror the change into the live canvas node so labels/state
            // stay in sync. Don't close the panel — the Advanced/Safety/History
            // tabs save per-field and closing on each edit would be jarring.
            setNodes((prev) => prev.map((n) =>
              n.id === selectedAgent.id
                ? { ...n, data: { ...n.data, ...updates } }
                : n,
            ))
          }}
          onOpenMarketplace={() => {
            const agentId = selectedAgent?.id
            closePanel()
            openPanel({ type: 'skill-marketplace', agentId })
          }}
          onOpenExternalFolders={() => {
            const agentId = selectedAgent?.id
            closePanel()
            openPanel({ type: 'external-folders', agentId })
          }}
          mcpServers={mcpServers}
          mcpAssignments={mcpAssignments}
          onMcpToggle={handleMcpToggle}
          onOpenMcpManagement={() => {
            closePanel()
            openPanel({ type: 'mcp-management' })
          }}
        />
      </ErrorBoundary>

      {/* Approval Dialog */}
      <ErrorBoundary>
        <ApprovalDialog
          open={showApprovalDialog}
          onOpenChange={handleApprovalDialogChange}
          approval={approvalDialogData}
          onApprove={approve}
          onReject={reject}
        />
      </ErrorBoundary>

      {/* Discussion Wizard */}
      <ErrorBoundary>
        <DiscussionWizard
          open={discussionWizardOpen}
          onOpenChange={setDiscussionWizardOpen}
          agents={discussionAgents}
          onCreate={handleDiscussionCreate}
        />
      </ErrorBoundary>

      {/* Agent Create Dialog */}
      <ErrorBoundary>
        <AgentCreateDialog
          open={createAgentOpen}
          onOpenChange={setCreateAgentOpen}
          onCreate={handleAgentCreated}
        />
      </ErrorBoundary>

      {/* Template Gallery */}
      <ErrorBoundary>
        <TemplateGallery
          open={templateGalleryOpen}
          onOpenChange={setTemplateGalleryOpen}
          onSelectTemplate={handleTemplateSelected}
        />
      </ErrorBoundary>

      {/* Schedules Panel */}
      <SchedulesPanel open={isOpen('schedules')} onOpenChange={(open) => open ? openPanel({ type: 'schedules' }) : closePanel()} />

      {/* Workflow Review Dialog */}
      <WorkflowReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        workflow={generatedWorkflow}
        onConfirm={materializeWorkflow}
        onSaveAsTemplate={async (wf) => {
          try {
            // Persist any canvas Output/Email node config so scheduled/headless
            // runs honour it (matched by agent name server-side).
            const outputs = buildWorkflowOutputs(nodes)
            const emails = buildWorkflowEmails(nodes)
            await apiPost('/api/saved-workflows', {
              name: wf.name,
              description: t('savedWorkflow.description', { count: wf.agents.length }),
              workflow: {
                ...wf,
                ...(outputs.length > 0 ? { outputs } : {}),
                ...(emails.length > 0 ? { emails } : {}),
              },
            })
          } catch { /* best-effort */ }
        }}
      />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onCommand={handleCommand}
      />

      {/* Discussion Panel */}
      <ErrorBoundary>
        <DiscussionPanel
          open={isOpen('discussion-panel')}
          onOpenChange={(open) => open ? openPanel({ type: 'discussion-panel', discussionId: selectedDiscussion?.id ?? '' }) : closePanel()}
          discussion={selectedDiscussion}
        />
      </ErrorBoundary>

      {/* Quick Run Bar (Cmd+Shift+R) */}
      <QuickRunBar
        open={quickRunOpen}
        agents={nodes
          .filter((n) => n.type === 'agent')
          .map((n) => {
            const d = n.data as AgentNodeData
            return { id: n.id, name: d.name, description: d.description }
          })}
        onClose={() => setQuickRunOpen(false)}
        onRun={(agentId, _message) => {
          const node = nodes.find((n) => n.id === agentId)
          if (!node) return
          const d = node.data as AgentNodeData
          setSelectedAgent({
            id: agentId,
            name: d.name,
            description: d.description,
            purpose: d.purpose,
            status: d.status,
            model: d.model,
          })
          openPanel({ type: 'agent-chat', agentId: selectedAgent?.id ?? '' })
        }}
      />

      {/* Activity Feed */}
      <Sheet open={isOpen('activity')} onOpenChange={(open) => open ? openPanel({ type: 'activity' }) : closePanel()}>
        <SheetContent side="right" className="p-0">
          <SheetTitle className="border-b border-border px-4 py-3 text-sm font-semibold">
            {t('sheet.activity')}
          </SheetTitle>
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
            <ActivityFeed workspaceId={activeWorkspaceId || null} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Audit Log Dashboard */}
      <Sheet open={isOpen('audit-log')} onOpenChange={(open) => open ? openPanel({ type: 'audit-log' }) : closePanel()}>
        <SheetContent side="right" className="p-0 sm:w-3/5 sm:max-w-4xl">
          <SheetTitle className="border-b border-border px-4 py-3 text-sm font-semibold">
            {t('sheet.auditLog')}
          </SheetTitle>
          <div style={{ height: 'calc(100% - 48px)' }}>
            <AuditLogDashboard workspaceId={activeWorkspaceId || null} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Memory */}
      <Sheet open={isOpen('memory')} onOpenChange={(open) => open ? openPanel({ type: 'memory' }) : closePanel()}>
        <SheetContent side="right" className="p-0">
          <SheetTitle className="border-b border-border px-4 py-3 text-sm font-semibold">
            {t('sheet.memory')}
          </SheetTitle>
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
            <MemoryPanel workspaceId={activeWorkspaceId || null} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Workspace Context Editor */}
      <Sheet open={isOpen('context-editor')} onOpenChange={(open) => open ? openPanel({ type: 'context-editor' }) : closePanel()}>
        <SheetContent side="right" className="p-0">
          <SheetTitle className="border-b border-border px-4 py-3 text-sm font-semibold">
            {t('sheet.workspaceContext')}
          </SheetTitle>
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
            {activeWorkspaceId ? (
              <WorkspaceContextEditor workspaceId={activeWorkspaceId} />
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                {t('empty.selectWorkspace')}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cost Dashboard */}
      <Sheet open={isOpen('cost-dashboard')} onOpenChange={(open) => open ? openPanel({ type: 'cost-dashboard' }) : closePanel()}>
        <SheetContent side="right" className="p-0">
          <SheetTitle className="border-b border-border px-4 py-3 text-sm font-semibold">
            {t('sheet.costDashboard')}
          </SheetTitle>
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
            <CostDashboard />
          </div>
        </SheetContent>
      </Sheet>

      {/* Analytics */}
      <Sheet open={isOpen('analytics')} onOpenChange={(open) => open ? openPanel({ type: 'analytics' }) : closePanel()}>
        <SheetContent side="right" className="p-0">
          <SheetTitle className="border-b border-border px-4 py-3 text-sm font-semibold">
            {t('sheet.analytics')}
          </SheetTitle>
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
            <AnalyticsDashboard />
          </div>
        </SheetContent>
      </Sheet>
      {/* Director Drawer */}
      <Sheet open={isOpen('director-drawer')} onOpenChange={(open) => open ? openPanel({ type: 'director-drawer' }) : closePanel()}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">{t('sheet.directorSettings')}</SheetTitle>
          <DirectorDrawer
            enabled={directorEnabled}
            rigor={directorRigor}
            customInstructions={directorCustomInstructions}
            onToggle={setDirectorEnabled}
            onRigorChange={setDirectorRigor}
            onCustomInstructionsChange={setDirectorCustomInstructions}
          />
        </SheetContent>
      </Sheet>

      {/* Output Node config drawer */}
      <Sheet open={panel.type === 'output-node'} onOpenChange={(open) => { if (!open) closePanel() }}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">{t('sheet.outputSettings')}</SheetTitle>
          {panel.type === 'output-node' && (() => {
            const node = nodes.find((n) => n.id === panel.nodeId)
            if (!node) return null
            const agentList = nodes
              .filter((n) => n.type === 'agent')
              .map((n) => ({ id: n.id, name: (n.data as AgentNodeData).name }))
            return (
              <OutputNodeDrawer
                data={node.data as OutputNodeData}
                agents={agentList}
                defaultDir={workspaceWorkingDir}
                onChange={(patch) =>
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === panel.nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
                    ),
                  )
                }
              />
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* Email Node config drawer */}
      <Sheet open={panel.type === 'email-node'} onOpenChange={(open) => { if (!open) closePanel() }}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">{t('sheet.emailSettings')}</SheetTitle>
          {panel.type === 'email-node' && (() => {
            const node = nodes.find((n) => n.id === panel.nodeId)
            if (!node) return null
            const agentList = nodes
              .filter((n) => n.type === 'agent')
              .map((n) => ({ id: n.id, name: (n.data as AgentNodeData).name }))
            return (
              <EmailNodeDrawer
                data={node.data as EmailNodeData}
                agents={agentList}
                onChange={(patch) =>
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === panel.nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
                    ),
                  )
                }
              />
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* Condition Node config drawer */}
      <Sheet open={panel.type === 'condition-node'} onOpenChange={(open) => { if (!open) closePanel() }}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">{t('sheet.conditionSettings')}</SheetTitle>
          {panel.type === 'condition-node' && (() => {
            const node = nodes.find((n) => n.id === panel.nodeId)
            if (!node) return null
            // The single agent wired into this condition node (for the hint).
            const inputEdge = edges.find((e) => e.target === panel.nodeId)
            const inputAgentName = inputEdge
              ? (nodes.find((n) => n.id === inputEdge.source)?.data as AgentNodeData | undefined)?.name ?? null
              : null
            return (
              <ConditionNodeDrawer
                data={node.data as ConditionNodeData}
                inputAgentName={inputAgentName}
                onChange={(patch) => {
                  // Prune edges wired to a branch handle that no longer exists
                  // (so removing a branch also removes its outgoing routes).
                  const nextBranchIds =
                    patch.branches !== undefined
                      ? new Set(patch.branches.map((b) => b.id))
                      : null
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === panel.nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
                    ),
                  )
                  if (nextBranchIds) {
                    setEdges((prev) =>
                      prev.filter(
                        (e) =>
                          !(e.source === panel.nodeId && e.sourceHandle != null && !nextBranchIds.has(e.sourceHandle)),
                      ),
                    )
                  }
                }}
              />
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* Structurer Node config drawer */}
      <Sheet open={panel.type === 'structurer-node'} onOpenChange={(open) => { if (!open) closePanel() }}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">{t('sheet.structurerSettings')}</SheetTitle>
          {panel.type === 'structurer-node' && (() => {
            const node = nodes.find((n) => n.id === panel.nodeId)
            if (!node) return null
            const agentList = nodes
              .filter((n) => n.type === 'agent')
              .map((n) => ({ id: n.id, name: (n.data as AgentNodeData).name }))
            return (
              <StructurerNodeDrawer
                data={node.data as StructurerNodeData}
                agents={agentList}
                onChange={(patch) =>
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === panel.nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
                    ),
                  )
                }
              />
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* Save-to-DB Node config drawer */}
      <Sheet open={panel.type === 'db-save-node'} onOpenChange={(open) => { if (!open) closePanel() }}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">{t('sheet.dbSaveSettings')}</SheetTitle>
          {panel.type === 'db-save-node' && (() => {
            const node = nodes.find((n) => n.id === panel.nodeId)
            if (!node) return null
            // The single structurer wired into this node (for the summary).
            const inputEdge = edges.find((e) => e.target === panel.nodeId)
            const upstreamName = inputEdge
              ? (nodes.find((n) => n.id === inputEdge.source)?.data as StructurerNodeData | undefined)?.name ?? null
              : null
            return (
              <DbSaveNodeDrawer
                data={node.data as DbSaveNodeData}
                upstreamName={upstreamName}
                onChange={(patch) =>
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === panel.nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
                    ),
                  )
                }
                onViewDatasets={() => openPanel({ type: 'saved-datasets' })}
              />
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* HTTP Request Node config drawer */}
      <Sheet open={panel.type === 'http-request-node'} onOpenChange={(open) => { if (!open) closePanel() }}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">{t('sheet.httpRequestSettings')}</SheetTitle>
          {panel.type === 'http-request-node' && (() => {
            const node = nodes.find((n) => n.id === panel.nodeId)
            if (!node) return null
            return (
              <HttpRequestNodeDrawer
                data={node.data as HttpRequestNodeData}
                onChange={(patch) =>
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === panel.nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
                    ),
                  )
                }
              />
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* DuckDuckGo Search Node config drawer */}
      <Sheet open={panel.type === 'duckduckgo-search-node'} onOpenChange={(open) => { if (!open) closePanel() }}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">{t('sheet.duckduckgoSearchSettings')}</SheetTitle>
          {panel.type === 'duckduckgo-search-node' && (() => {
            const node = nodes.find((n) => n.id === panel.nodeId)
            if (!node) return null
            return (
              <DuckDuckGoSearchNodeDrawer
                data={node.data as DuckDuckGoSearchNodeData}
                onChange={(patch) =>
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === panel.nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
                    ),
                  )
                }
              />
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* Sakana AI Node config drawer */}
      <Sheet open={panel.type === 'sakana-ai-node'} onOpenChange={(open) => { if (!open) closePanel() }}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">{t('sheet.sakanaAiSettings')}</SheetTitle>
          {panel.type === 'sakana-ai-node' && (() => {
            const node = nodes.find((n) => n.id === panel.nodeId)
            if (!node) return null
            return (
              <SakanaAiNodeDrawer
                data={node.data as SakanaAiNodeData}
                onChange={(patch) =>
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === panel.nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
                    ),
                  )
                }
              />
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* Saved datasets viewer */}
      <SavedDatasetsPanel
        open={panel.type === 'saved-datasets'}
        onOpenChange={(open) => { if (!open) closePanel() }}
        workspaceId={activeWorkspaceId}
      />

      {/* Workflow Chat */}
      <Sheet open={workflowChatOpen} onOpenChange={setWorkflowChatOpen}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 [&>button.absolute]:hidden"
          // Don't let the Sheet grab focus onto a header button on open — the
          // Execution Log focuses its composer itself so the user can type the task.
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetTitle className="sr-only">{t('sheet.workflowChat')}</SheetTitle>
          <WorkflowChat
            steps={buildChain(nodes, edges)}
            isRunning={workflowRunning}
            log={workflowLog}
            mode={workflowMode}
            approvalMode={workflowApprovalMode}
            onApprovalModeChange={setWorkflowApprovalMode}
            onStepApprovalRespond={handleStepApprovalRespond}
            hasWorkspace={!!activeWorkspaceId}
            directorEnabled={directorEnabled}
            onDirectorToggle={setDirectorEnabled}
            onDirectorRedirectRespond={handleDirectorRedirectRespond}
            hasCompletedRun={!!lastCompletedChainIdRef.current}
            advisorRunning={advisorRunning}
            advisorModel={advisorModel}
            onAdvisorRequest={handleAdvisorRequest}
            onAdvisorModelChange={setAdvisorModel}
            onApplySkill={handleApplySkill}
            onUpdatePersona={handleUpdatePersona}
            onSaveOutput={handleSaveWorkflowOutput}
            onViewOutputs={handleViewOutputs}
            workingDirectory={workspaceWorkingDir}
            onWorkingDirectoryChange={(dir) => void handleWorkingDirectoryChange(dir)}
            onSendMessage={handleWorkflowSendMessage}
            onRun={handleRunWorkflow}
            onStop={handleStopWorkflow}
            onModeChange={setWorkflowMode}
            onClearLog={handleClearWorkflowLog}
            onStepClick={(stepIndex) => {
              const steps = workflowStepsRef.current
              const step = steps[stepIndex]
              if (!step) return
              const msgs = workflowStepMsgsRef.current.get(stepIndex) ?? []
              if (msgs.length === 0) {
                // Show feedback — no history available yet
                setWorkflowLog((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    type: 'system' as const,
                    content: t('log.noStepHistory', { agentName: step.agentName }),
                    timestamp: new Date(),
                  },
                ])
                return
              }
              // Close workflow chat and open agent chat with step history
              setWorkflowChatOpen(false)
              injectMessagesIntoCache(step.nodeId, msgs)
              setSelectedAgent({
                id: step.nodeId,
                name: step.agentName,
                status: 'idle' as AgentStatus,
                model: step.model,
              })
              // Small delay for Sheet transition
              setTimeout(() => openPanel({ type: 'agent-chat', agentId: selectedAgent?.id ?? '' }), 200)
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Workspace Plan Editor */}
      <Sheet open={isOpen('plan-editor')} onOpenChange={(open) => open ? openPanel({ type: 'plan-editor' }) : closePanel()}>
        <SheetContent side="right" className="p-0">
          <SheetTitle className="border-b border-border px-4 py-3 text-sm font-semibold">
            {t('sheet.workspacePlan')}
          </SheetTitle>
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
            {activeWorkspaceId ? (
              <WorkspacePlanEditor workspaceId={activeWorkspaceId} />
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                {t('empty.selectWorkspace')}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Git Panel */}
      <GitPanel key={`git-${activeWorkspaceId}-${workspaceWorkingDir}`} open={isOpen('git')} onOpenChange={(open) => open ? openPanel({ type: 'git' }) : closePanel()} workspaceId={activeWorkspaceId} />

      {/* Saved Output Log Preview */}
      <OutputLogPreview
        open={isOpen('output-log')}
        onOpenChange={(open) => {
          if (open) {
            openPanel({ type: 'output-log' })
          } else {
            // Consume-once: clear so a later reopen shows the list, not a stale file.
            setOutputLogInitialName(null)
            setOutputLogDirectory(null)
            closePanel()
          }
        }}
        directory={outputLogDirectory ?? workspaceWorkingDir}
        initialName={outputLogInitialName}
      />
    </div>
    </ComplexityContext.Provider>
  )
}
