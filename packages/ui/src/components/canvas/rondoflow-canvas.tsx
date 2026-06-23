'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type XYPosition,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  ReactFlowProvider,
  type ReactFlowInstance,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { AgentNode } from './nodes/agent-node'
import { SkillNode } from './nodes/skill-node'
import { PolicyNode } from './nodes/policy-node'
import { McpNode, type McpNodeData } from './nodes/mcp-node'
import { ResourceNode, type ResourceNodeData } from './nodes/resource-node'
import { StickyNoteNode } from './nodes/sticky-note-node'
import { OutputNode } from './nodes/output-node'
import { EmailNode } from './nodes/email-node'
import { ConditionNode } from './nodes/condition-node'
import { StructurerNode } from './nodes/structurer-node'
import { DbSaveNode } from './nodes/db-save-node'
import { HttpRequestNode } from './nodes/http-request-node'
import { DuckDuckGoSearchNode } from './nodes/duckduckgo-search-node'
import { SakanaAiNode } from './nodes/sakana-ai-node'
import { StartNode } from './nodes/start-node'
import { rondoflowEdge, type rondoflowEdgeData } from './edges/rondoflow-edge'
import { CanvasActionsProvider, type CanvasActions } from './canvas-actions'
import { useCanvasReadOnly } from './canvas-read-only'
import {
  isValidConnection,
  connectionError,
  syncOutputSelections,
  syncStructurerSelections,
  defaultConditionBranches,
  defaultStructurerData,
  defaultHttpRequestData,
  defaultDuckDuckGoSearchData,
  defaultSakanaAiData,
  DRAG_TYPES,
  START_NODE_ID,
  type AgentNodeData,
  type SkillNodeData,
  type PolicyNodeData,
  type StickyNoteNodeData,
  type OutputNodeData,
  type EmailNodeData,
  type ConditionNodeData,
  type StructurerNodeData,
  type DbSaveNodeData,
  type HttpRequestNodeData,
  type DuckDuckGoSearchNodeData,
  type SakanaAiNodeData,
} from '@/lib/canvas-utils'
import { useUndoRedo } from '@/hooks/use-undo-redo'
import { useTheme } from '@/hooks/use-theme'
import { defaultProviderConfig, type AgentProviderId } from '@rondoflow/shared'

// ─── Node and edge type registries ────────────────────────────────────────

const NODE_TYPES: NodeTypes = {
  start: StartNode,
  agent: AgentNode,
  skill: SkillNode,
  policy: PolicyNode,
  mcp: McpNode,
  resource: ResourceNode,
  note: StickyNoteNode,
  output: OutputNode,
  email: EmailNode,
  condition: ConditionNode,
  structurer: StructurerNode,
  'db-save': DbSaveNode,
  'http-request': HttpRequestNode,
  'duckduckgo-search': DuckDuckGoSearchNode,
  'sakana-ai': SakanaAiNode,
}

const EDGE_TYPES: EdgeTypes = {
  rondoflow: rondoflowEdge,
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function resolveEdgeType(
  sourceNode: Node | undefined,
): rondoflowEdgeData['edgeType'] {
  if (
    sourceNode?.type === 'skill' ||
    sourceNode?.type === 'policy' ||
    sourceNode?.type === 'mcp'
  ) {
    return 'association'
  }
  // Edges leaving a Condition node branch are the conditional/branch routes.
  if (sourceNode?.type === 'condition') {
    return 'conditional'
  }
  return 'flow'
}

/**
 * Builds a fresh canvas node from a palette drag payload. Shared by the drop
 * handler (position = cursor) and the click/keyboard add path (position =
 * viewport centre), so both routes produce identical nodes. Returns null for an
 * unrecognised drag type.
 */
function buildNodeFromPalette(
  dragType: string,
  parsedData: Record<string, unknown>,
  position: XYPosition,
  t: TFunction<'canvas'>,
): Node | null {
  if (dragType === DRAG_TYPES.AGENT) {
    const rawProvider = parsedData['provider']
    const provider: AgentProviderId =
      rawProvider === 'openai' || rawProvider === 'perplexity' ? rawProvider : 'claude-code'
    const defaultName =
      provider === 'openai'
        ? t('palette.item.openaiAssistant')
        : provider === 'perplexity'
          ? t('palette.item.perplexityAssistant')
          : t('default.agentName')
    const agentData: AgentNodeData = {
      name: (parsedData['name'] as string | undefined) ?? defaultName,
      description: parsedData['description'] as string | undefined,
      avatar: parsedData['avatar'] as string | undefined,
      status: (parsedData['status'] as AgentNodeData['status'] | undefined) ?? 'idle',
      model: parsedData['model'] as string | undefined,
      purpose: parsedData['purpose'] as string | undefined,
      provider,
      providerConfig: defaultProviderConfig(provider),
    }
    return { id: crypto.randomUUID(), type: 'agent', position, data: agentData }
  }
  if (dragType === DRAG_TYPES.SKILL) {
    const skillData: SkillNodeData = {
      name: (parsedData['name'] as string | undefined) ?? t('default.skillName'),
      category: parsedData['category'] as string | undefined,
    }
    return { id: crypto.randomUUID(), type: 'skill', position, data: skillData }
  }
  if (dragType === DRAG_TYPES.POLICY) {
    const policyData: PolicyNodeData = {
      name: (parsedData['name'] as string | undefined) ?? t('default.policyName'),
      level: (parsedData['level'] as PolicyNodeData['level'] | undefined) ?? 'agent',
    }
    return { id: crypto.randomUUID(), type: 'policy', position, data: policyData }
  }
  if (dragType === DRAG_TYPES.MCP) {
    const mcpData: McpNodeData = {
      name: (parsedData['name'] as string | undefined) ?? t('default.mcpName'),
      serverType: (parsedData['serverType'] as McpNodeData['serverType'] | undefined) ?? 'stdio',
      description: parsedData['description'] as string | undefined,
    }
    return { id: crypto.randomUUID(), type: 'mcp', position, data: mcpData }
  }
  if (dragType === DRAG_TYPES.RESOURCE) {
    const resourceData: ResourceNodeData = {
      label: (parsedData['label'] as string | undefined) ?? t('default.resourceLabel'),
      fileCount: (parsedData['fileCount'] as number | undefined) ?? 0,
      linkCount: (parsedData['linkCount'] as number | undefined) ?? 0,
      noteCount: (parsedData['noteCount'] as number | undefined) ?? 0,
      variableCount: (parsedData['variableCount'] as number | undefined) ?? 0,
    }
    return { id: crypto.randomUUID(), type: 'resource', position, data: resourceData }
  }
  if (dragType === DRAG_TYPES.NOTE) {
    const noteData: StickyNoteNodeData = {
      text: (parsedData['text'] as string | undefined) ?? '',
      color: (parsedData['color'] as string | undefined) ?? 'yellow',
    }
    return { id: crypto.randomUUID(), type: 'note', position, data: noteData }
  }
  if (dragType === DRAG_TYPES.OUTPUT) {
    const outputData: OutputNodeData = {
      name: (parsedData['name'] as string | undefined) ?? t('default.outputName'),
      // Connection-driven: starts empty (saves nothing) until agents are
      // wired into it. The sync effect keeps this in step with the edges.
      agentSelection: [],
      format: 'markdown',
    }
    return { id: crypto.randomUUID(), type: 'output', position, data: outputData }
  }
  if (dragType === DRAG_TYPES.EMAIL) {
    const emailData: EmailNodeData = {
      name: (parsedData['name'] as string | undefined) ?? t('default.emailName'),
      // Off by default so building a workflow never sends mail until opted in.
      enabled: false,
      // Connection-driven: starts empty until agents are wired into it.
      agentSelection: [],
      recipients: '',
    }
    return { id: crypto.randomUUID(), type: 'email', position, data: emailData }
  }
  if (dragType === DRAG_TYPES.CONDITION) {
    const conditionData: ConditionNodeData = {
      name: (parsedData['name'] as string | undefined) ?? t('default.conditionName'),
      branches: defaultConditionBranches(),
    }
    return { id: crypto.randomUUID(), type: 'condition', position, data: conditionData }
  }
  if (dragType === DRAG_TYPES.STRUCTURER) {
    const structurerData: StructurerNodeData = defaultStructurerData(
      (parsedData['name'] as string | undefined) ?? t('default.structurerName'),
    )
    return { id: crypto.randomUUID(), type: 'structurer', position, data: structurerData }
  }
  if (dragType === DRAG_TYPES.DB_SAVE) {
    const dbSaveData: DbSaveNodeData = {
      name: (parsedData['name'] as string | undefined) ?? t('default.dbSaveName'),
    }
    return { id: crypto.randomUUID(), type: 'db-save', position, data: dbSaveData }
  }
  if (dragType === DRAG_TYPES.HTTP_REQUEST) {
    const httpRequestData: HttpRequestNodeData = defaultHttpRequestData(
      (parsedData['name'] as string | undefined) ?? t('default.httpRequestName'),
    )
    return { id: crypto.randomUUID(), type: 'http-request', position, data: httpRequestData }
  }
  if (dragType === DRAG_TYPES.DUCKDUCKGO_SEARCH) {
    const duckduckgoSearchData: DuckDuckGoSearchNodeData = defaultDuckDuckGoSearchData(
      (parsedData['name'] as string | undefined) ?? t('default.duckduckgoSearchName'),
    )
    return { id: crypto.randomUUID(), type: 'duckduckgo-search', position, data: duckduckgoSearchData }
  }
  if (dragType === DRAG_TYPES.SAKANA_AI) {
    const sakanaAiData: SakanaAiNodeData = defaultSakanaAiData(
      (parsedData['name'] as string | undefined) ?? t('default.sakanaAiName'),
    )
    return { id: crypto.randomUUID(), type: 'sakana-ai', position, data: sakanaAiData }
  }
  return null
}

// ─── Inner canvas (needs ReactFlowProvider ancestor) ──────────────────────

interface RondoflowCanvasInnerProps {
  initialNodes: Node[]
  initialEdges: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  onUndoRedoReady?: (controls: UndoRedoControls) => void
  onViewReady?: (controls: CanvasViewControls) => void
  onNodeDoubleClick?: (nodeId: string, nodeType: string) => void
  onViewOutput?: (directory: string | null | undefined, name: string) => void
  onZoomChange?: (zoom: number) => void
  /** Called when a drop/connect is rejected, with a human-readable reason. */
  onInvalidConnection?: (reason: string) => void
  /** Called after a node/edge is removed via its toolbar, for undo feedback. */
  onElementDeleted?: (kind: 'node' | 'edge') => void
  activeAgentIds?: ReadonlySet<string>
}

export interface UndoRedoControls {
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

export interface CanvasViewControls {
  zoomIn: () => void
  zoomOut: () => void
  fitView: () => void
  getZoom: () => number
  /** Add a palette node at the centre of the current viewport (click/keyboard). */
  addNode: (mimeType: string, payload: Record<string, unknown>) => void
  /** Duplicate the currently selected node(s) along with their internal edges. */
  duplicateSelection: () => void
  /** Center the viewport on a node and select it (used by the node finder). */
  focusNode: (id: string) => void
}

function RondoflowCanvasInner({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onUndoRedoReady,
  onViewReady,
  onNodeDoubleClick,
  onViewOutput,
  onZoomChange,
  onInvalidConnection,
  onElementDeleted,
  activeAgentIds,
}: RondoflowCanvasInnerProps) {
  const { t } = useTranslation('canvas')
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges)
  const { resolved: themeMode } = useTheme()
  const rfInstance = useRef<ReactFlowInstance | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useReactFlow()
  const readOnly = useCanvasReadOnly()

  // ── Two-way sync with the parent's authoritative nodes/edges ─────────────
  // The parent owns the canonical nodes/edges (for persistence, running
  // workflows, etc.); React Flow keeps a local controlled copy here. Both
  // directions must stay in sync WITHOUT an update loop. To break the cycle we
  // track the last array we PUSHED up and the last array we PULLED down:
  //   • an incoming `initialNodes` equal to what we just pushed is our own echo
  //     coming back through the parent — don't re-apply it (that re-render +
  //     React Flow re-measure is exactly what caused "max update depth", #185).
  //   • a local `nodes` value equal to what we just pulled came from the parent
  //     — don't push it straight back up.
  const prevInitialNodesRef = useRef(initialNodes)
  const prevInitialEdgesRef = useRef(initialEdges)
  const pushedNodesRef = useRef<Node[] | null>(null)
  const pushedEdgesRef = useRef<Edge[] | null>(null)
  const pulledNodesRef = useRef<Node[] | null>(initialNodes)
  const pulledEdgesRef = useRef<Edge[] | null>(initialEdges)

  const onNodesChangeRef = useRef(onNodesChange)
  const onEdgesChangeRef = useRef(onEdgesChange)
  onNodesChangeRef.current = onNodesChange
  onEdgesChangeRef.current = onEdgesChange

  // While a node is being dragged React Flow fires a change per frame; defer
  // propagation to drag-stop to avoid re-rendering the parent each frame.
  const isDraggingRef = useRef(false)
  // Always-current view of the local nodes/edges, for use inside event callbacks.
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes
  const edgesRef = useRef(edges)
  edgesRef.current = edges
  // Deterministic cascade offset for click/keyboard node adds (replaces jitter).
  const addCountRef = useRef(0)
  // `takeSnapshot` identity changes each render (it closes over nodes/edges);
  // the once-created view-controls closure reads the latest via this ref so a
  // click-to-add captures the current canvas for undo, not a stale one.
  const takeSnapshotRef = useRef<() => void>(() => {})

  // Parent → child: only genuine external updates (template load, new agent,
  // workspace switch). Skip our own echoes.
  useEffect(() => {
    if (initialNodes === prevInitialNodesRef.current) return
    prevInitialNodesRef.current = initialNodes
    if (initialNodes === pushedNodesRef.current) return
    pulledNodesRef.current = initialNodes
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    if (initialEdges === prevInitialEdgesRef.current) return
    prevInitialEdgesRef.current = initialEdges
    if (initialEdges === pushedEdgesRef.current) return
    pulledEdgesRef.current = initialEdges
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  // Child → parent: connect, delete, reposition, data edits. Skip values that
  // were just pulled down from the parent.
  useEffect(() => {
    if (isDraggingRef.current) return
    if (nodes === pulledNodesRef.current) return
    pushedNodesRef.current = nodes
    onNodesChangeRef.current?.(nodes)
  }, [nodes])

  useEffect(() => {
    if (edges === pulledEdgesRef.current) return
    pushedEdgesRef.current = edges
    onEdgesChangeRef.current?.(edges)
  }, [edges])

  // ── Output nodes follow their connections ───────────────────────────────
  // Connections are the source of truth for what an Output node saves: keep each
  // output's `agentSelection` in lockstep with the agent→output edges wired into
  // it. `syncOutputSelections` returns the same array reference when nothing
  // changed, so the functional setState bails out (no re-render, no parent push)
  // unless a wire was actually added or removed — and it won't loop because it
  // only depends on `edges`, which its own `setNodes` never touches.
  useEffect(() => {
    setNodes((prev) => syncStructurerSelections(syncOutputSelections(prev, edges), edges))
  }, [edges, setNodes])

  // ── View controls (zoom, fit) ──────────────────────────────────────────
  const viewControlsRef = useRef(false)
  if (!viewControlsRef.current && onViewReady) {
    viewControlsRef.current = true
    // Defer to avoid calling during render
    setTimeout(() => {
      onViewReady({
        zoomIn: () => reactFlowInstance.zoomIn(),
        zoomOut: () => reactFlowInstance.zoomOut(),
        fitView: () => reactFlowInstance.fitView({ padding: 0.2 }),
        getZoom: () => reactFlowInstance.getZoom(),
        addNode: (mimeType, payload) => {
          const rect = wrapperRef.current?.getBoundingClientRect()
          const inst = rfInstance.current
          if (!rect || !inst) return
          // Deterministic diagonal cascade so repeated adds fan out predictably
          // (instead of the old random jitter) and never land exactly stacked.
          const offset = (addCountRef.current++ % 6) * 28
          const position = inst.screenToFlowPosition({
            x: rect.left + rect.width / 2 + offset,
            y: rect.top + rect.height / 2 + offset,
          })
          const node = buildNodeFromPalette(mimeType, payload, position, t)
          if (!node) return
          takeSnapshotRef.current()
          setNodes((prev) => [...prev, node])
        },
        duplicateSelection: () => {
          // Start nodes are singletons — never duplicate them.
          const selected = nodesRef.current.filter((n) => n.selected && n.type !== 'start')
          if (selected.length === 0) return
          const idMap = new Map<string, string>()
          const OFFSET = 40
          const clones = selected.map((n) => {
            const newId = crypto.randomUUID()
            idMap.set(n.id, newId)
            return {
              ...n,
              id: newId,
              selected: true,
              position: { x: n.position.x + OFFSET, y: n.position.y + OFFSET },
              data: { ...n.data },
            }
          })
          // Re-create only the edges that connect two duplicated nodes.
          const cloneEdges = edgesRef.current
            .filter((e) => idMap.has(e.source) && idMap.has(e.target))
            .map((e) => ({
              ...e,
              id: crypto.randomUUID(),
              source: idMap.get(e.source) as string,
              target: idMap.get(e.target) as string,
              selected: false,
            }))
          takeSnapshotRef.current()
          // Deselect originals, append clones already marked selected.
          setNodes((prev) => prev.map((n) => ({ ...n, selected: false })).concat(clones))
          if (cloneEdges.length > 0) setEdges((prev) => [...prev, ...cloneEdges])
        },
        focusNode: (id) => {
          const inst = rfInstance.current
          const node = nodesRef.current.find((n) => n.id === id)
          if (!inst || !node) return
          const w = node.measured?.width ?? 140
          const h = node.measured?.height ?? 60
          inst.setCenter(node.position.x + w / 2, node.position.y + h / 2, {
            zoom: Math.max(inst.getZoom(), 1),
            duration: 400,
          })
          setNodes((prev) => prev.map((n) => ({ ...n, selected: n.id === id })))
        },
      })
    }, 0)
  }

  // ── Undo / Redo ────────────────────────────────────────────────────────

  const { undo, redo, canUndo, canRedo, takeSnapshot } = useUndoRedo({
    nodes,
    edges,
    // Use the local React Flow state setters (the controlled source of truth).
    // The propagation effects above forward the result to the parent.
    setNodes,
    setEdges,
  })
  // Keep the view-controls closure's snapshot reference current (see above).
  takeSnapshotRef.current = takeSnapshot

  // Expose undo/redo controls to the parent via callback ref pattern
  const controlsRef = useRef<UndoRedoControls | null>(null)
  const nextControls: UndoRedoControls = { undo, redo, canUndo, canRedo }

  if (
    onUndoRedoReady &&
    (controlsRef.current === null ||
      controlsRef.current.canUndo !== canUndo ||
      controlsRef.current.canRedo !== canRedo)
  ) {
    controlsRef.current = nextControls
    onUndoRedoReady(nextControls)
  }

  // ── Connection handler ────────────────────────────────────────────────

  // Live connection validator for React Flow (drag feedback + drop gating). Uses
  // the always-current nodesRef so the node-type rules see the latest canvas.
  const validateConnection = useCallback(
    (connection: Connection | Edge) => isValidConnection(connection, nodesRef.current),
    [],
  )

  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const reason = connectionError(connection, nodes)
      if (reason) {
        onInvalidConnection?.(reason)
        return
      }

      const sourceNode = nodes.find((n) => n.id === connection.source)

      takeSnapshot()

      const edgeType = resolveEdgeType(sourceNode)

      // For branch edges leaving a Condition node, label the edge with the
      // branch name (resolved from the source handle) so it shows on the canvas.
      let branchLabel: string | undefined
      if (sourceNode?.type === 'condition' && connection.sourceHandle) {
        const branch = (sourceNode.data as ConditionNodeData).branches?.find(
          (b) => b.id === connection.sourceHandle,
        )
        branchLabel = branch?.label
      }

      const newEdge: Edge = {
        id: crypto.randomUUID(),
        source: connection.source ?? '',
        target: connection.target ?? '',
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'rondoflow',
        data: { edgeType, ...(branchLabel ? { branchLabel } : {}) } satisfies rondoflowEdgeData,
      }

      setEdges((prev) => addEdge(newEdge, prev))
    },
    [nodes, setEdges, takeSnapshot, onInvalidConnection],
  )

  // ── Drag-and-drop handlers ────────────────────────────────────────────

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      if (!rfInstance.current) return

      const dragType = Object.values(DRAG_TYPES).find((t) =>
        event.dataTransfer.types.includes(t),
      )
      if (!dragType) return

      const rawData = event.dataTransfer.getData(dragType)
      if (!rawData) return

      let parsedData: Record<string, unknown>
      try {
        parsedData = JSON.parse(rawData) as Record<string, unknown>
      } catch {
        return
      }

      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode = buildNodeFromPalette(dragType, parsedData, position, t)
      if (!newNode) return

      takeSnapshot()

      // The [nodes] propagation effect forwards this addition to the parent.
      setNodes((prev) => [...prev, newNode])
    },
    [setNodes, takeSnapshot, t],
  )

  // ── Node drag – snapshot before, propagate after ───────────────────────

  const handleNodeDragStart = useCallback(() => {
    isDraggingRef.current = true
    takeSnapshot()
  }, [takeSnapshot])

  const handleNodeDragStop = useCallback(() => {
    isDraggingRef.current = false
    // Per-frame propagation was suppressed during the drag; push the final
    // positions up now. Use our own local array (not getNodes()) so the
    // push-guard recognises the echo and the parent→child sync stays a no-op.
    const current = nodesRef.current
    pushedNodesRef.current = current
    onNodesChangeRef.current?.(current)
  }, [])

  // ── Node double-click ─────────────────────────────────────────────────

  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeDoubleClick?.(node.id, node.type ?? '')
    },
    [onNodeDoubleClick],
  )

  // ── Element actions (edit / delete) exposed to nodes and edges ──────────

  const canvasActions = useMemo<CanvasActions>(
    () => ({
      requestEdit: (nodeId, nodeType) => onNodeDoubleClick?.(nodeId, nodeType),
      requestDeleteNode: (nodeId) => {
        // The Start node is the fixed entry point and cannot be removed.
        if (nodeId === START_NODE_ID) return
        takeSnapshot()
        void reactFlowInstance.deleteElements({ nodes: [{ id: nodeId }] })
        onElementDeleted?.('node')
      },
      requestDeleteEdge: (edgeId) => {
        takeSnapshot()
        void reactFlowInstance.deleteElements({ edges: [{ id: edgeId }] })
        onElementDeleted?.('edge')
      },
      requestUpdateNodeData: (nodeId, patch) => {
        // New node + array reference so the [nodes] propagation effect fires
        // and the change reaches the parent (and gets persisted).
        setNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
          ),
        )
      },
      requestViewOutput: (directory, name) => onViewOutput?.(directory, name),
    }),
    [onNodeDoubleClick, onViewOutput, reactFlowInstance, takeSnapshot, setNodes, onElementDeleted],
  )

  return (
    <CanvasActionsProvider value={canvasActions}>
    <div className="h-full w-full" ref={wrapperRef}>
      <ReactFlow
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        nodes={nodes}
        edges={useMemo(() =>
          activeAgentIds && activeAgentIds.size > 0
            ? edges.map((e) => ({
                ...e,
                // Light an edge when its source is running, or — for a Condition
                // branch (source is the condition node, not an agent) — when its
                // target agent has started, so the taken branch glows.
                data: {
                  ...e.data,
                  isActive: activeAgentIds.has(e.source) || activeAgentIds.has(e.target),
                },
              }))
            : edges,
          [edges, activeAgentIds],
        )}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={readOnly ? undefined : handleConnect}
        isValidConnection={validateConnection}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        edgesReconnectable={!readOnly}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        onNodeDoubleClick={handleNodeDoubleClick}
        onMoveEnd={(_event, viewport) => {
          onZoomChange?.(Math.round(viewport.zoom * 100))
        }}
        onInit={(instance) => {
          rfInstance.current = instance
          onZoomChange?.(Math.round(instance.getZoom() * 100))
        }}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        connectionLineType={ConnectionLineType.Bezier}
        colorMode={themeMode}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={readOnly ? null : 'Delete'}
        className="bg-[#f6f7fb] dark:bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.4}
          color="hsl(var(--muted-foreground) / 0.35)"
        />

        {nodes.length > 8 && (
        <MiniMap
          position="bottom-right"
          className="!bottom-4 !right-4 overflow-hidden rounded-md border border-border !bg-card"
          nodeColor={(node) => {
            if (node.type === 'start') return '#10b981'
            if (node.type === 'agent') return 'hsl(var(--primary))'
            if (node.type === 'skill') return 'hsl(var(--secondary-foreground))'
            if (node.type === 'policy') return 'hsl(217 91% 60%)'
            if (node.type === 'mcp') return 'hsl(271 91% 65%)'
            if (node.type === 'resource') return 'hsl(189 94% 43%)'
            if (node.type === 'output') return '#14b8a6'
            return 'hsl(var(--muted-foreground))'
          }}
          maskColor="hsl(var(--background) / 0.7)"
        />
        )}
      </ReactFlow>
    </div>
    </CanvasActionsProvider>
  )
}

// ─── Public component ─────────────────────────────────────────────────────

export interface RondoflowCanvasProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  onUndoRedoReady?: (controls: UndoRedoControls) => void
  onViewReady?: (controls: CanvasViewControls) => void
  onNodeDoubleClick?: (nodeId: string, nodeType: string) => void
  onViewOutput?: (directory: string | null | undefined, name: string) => void
  onZoomChange?: (zoom: number) => void
  onInvalidConnection?: (reason: string) => void
  onElementDeleted?: (kind: 'node' | 'edge') => void
  activeAgentIds?: ReadonlySet<string>
}

export function RondoflowCanvas({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onUndoRedoReady,
  onViewReady,
  onNodeDoubleClick,
  onViewOutput,
  onZoomChange,
  onInvalidConnection,
  onElementDeleted,
  activeAgentIds,
}: RondoflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <RondoflowCanvasInner
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onUndoRedoReady={onUndoRedoReady}
        onViewReady={onViewReady}
        onNodeDoubleClick={onNodeDoubleClick}
        onViewOutput={onViewOutput}
        onZoomChange={onZoomChange}
        onInvalidConnection={onInvalidConnection}
        onElementDeleted={onElementDeleted}
        activeAgentIds={activeAgentIds}
      />
    </ReactFlowProvider>
  )
}
