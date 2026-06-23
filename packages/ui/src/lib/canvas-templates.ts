// Canvas template materializer. The template DATA now lives in the shared
// content catalog (`@rondoflow/catalog`, declarative node/edge specs); this
// module turns one of those declarative templates into concrete React Flow
// nodes/edges using the canvas node/edge factories. Re-exports the catalog
// values so existing importers of `@/lib/canvas-templates` keep working.

import type { Node, Edge } from '@xyflow/react'
import { CANVAS_TEMPLATES, type CanvasTemplate, type CanvasNodeSpec } from '@rondoflow/catalog'
import { createAgentNode, createSkillNode } from './canvas-utils'
import type { rondoflowEdgeData } from '@/components/canvas/edges/rondoflow-edge'

export { CANVAS_TEMPLATES }
export type { CanvasTemplate }

function materializeNode(spec: CanvasNodeSpec): Node {
  if (spec.type === 'skill') {
    return createSkillNode(spec.position, {
      name: spec.name,
      icon: spec.icon,
      category: spec.category,
    })
  }
  return createAgentNode(spec.position, {
    name: spec.name,
    description: spec.description,
    status: 'idle',
    model: spec.model,
    purpose: spec.purpose,
  })
}

/**
 * Turn a declarative canvas template into React Flow nodes/edges. Node ids are
 * freshly generated; edges are rewired from the template's local `key`s to the
 * generated ids.
 */
export function materializeCanvasTemplate(template: CanvasTemplate): {
  nodes: Node[]
  edges: Edge[]
} {
  const idByKey = new Map<string, string>()
  const nodes = template.nodes.map((spec) => {
    const node = materializeNode(spec)
    idByKey.set(spec.key, node.id)
    return node
  })

  const edges: Edge[] = template.edges.map((edge) => ({
    id: crypto.randomUUID(),
    source: idByKey.get(edge.source) ?? edge.source,
    target: idByKey.get(edge.target) ?? edge.target,
    type: 'rondoflow',
    data: { edgeType: edge.edgeType } satisfies rondoflowEdgeData,
  }))

  return { nodes, edges }
}
