/**
 * SketchVibe MCP Stdio Server
 *
 * 독립 프로세스로 실행되는 MCP 서버. 에이전트가 다이어그램을 읽고/수정/저장할 수 있는 6개 도구 제공.
 * 실행: bun run mcp:sketchvibe
 *
 * Architecture: packages/server/src/mcp/ (D6 단일 진입점과 별도)
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { eq, and, desc, max } from 'drizzle-orm'
import { db } from '../db/index'
import { sketches, sketchVersions } from '../db/schema'
import {
  parseMermaid,
  canvasToMermaidCode,
  type SvNodeType,
  type ParsedNode,
  type ParsedEdge,
} from '@corthex/shared'

// === Types ===

type CanvasNode = {
  id: string
  type: SvNodeType
  position: { x: number; y: number }
  data: { label: string }
}

type CanvasEdge = {
  id: string
  source: string
  target: string
  type?: string
  data?: { label: string }
}

type GraphData = {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

const VALID_NODE_TYPES: SvNodeType[] = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']

// === DB Helpers (scoped by companyId) ===

async function getSketch(sketchId: string, companyId: string) {
  const [sketch] = await db
    .select()
    .from(sketches)
    .where(and(eq(sketches.id, sketchId), eq(sketches.companyId, companyId)))
    .limit(1)
  return sketch ?? null
}

async function updateSketchGraphData(sketchId: string, companyId: string, graphData: GraphData) {
  const [updated] = await db
    .update(sketches)
    .set({ graphData, updatedAt: new Date() })
    .where(and(eq(sketches.id, sketchId), eq(sketches.companyId, companyId)))
    .returning()
  return updated ?? null
}

async function createVersion(sketchId: string, graphData: GraphData) {
  // Get current max version
  const [maxResult] = await db
    .select({ maxVersion: max(sketchVersions.version) })
    .from(sketchVersions)
    .where(eq(sketchVersions.sketchId, sketchId))
  const nextVersion = ((maxResult?.maxVersion as number | null) ?? 0) + 1

  await db.insert(sketchVersions).values({
    sketchId,
    version: nextVersion,
    graphData,
  })

  // Keep only latest 20 versions
  const allVersions = await db
    .select({ id: sketchVersions.id, version: sketchVersions.version })
    .from(sketchVersions)
    .where(eq(sketchVersions.sketchId, sketchId))
    .orderBy(desc(sketchVersions.version))

  if (allVersions.length > 20) {
    const toDelete = allVersions.slice(20).map((v) => v.id)
    for (const id of toDelete) {
      await db.delete(sketchVersions).where(eq(sketchVersions.id, id))
    }
  }

  return nextVersion
}

function parseGraphData(raw: unknown): GraphData {
  if (!raw || typeof raw !== 'object') return { nodes: [], edges: [] }
  const data = raw as Record<string, unknown>
  return {
    nodes: (Array.isArray(data.nodes) ? data.nodes : []) as CanvasNode[],
    edges: (Array.isArray(data.edges) ? data.edges : []) as CanvasEdge[],
  }
}

function graphToMermaid(graphData: GraphData): string {
  // canvasToMermaidCode expects CanvasNode/CanvasEdge from @corthex/shared
  return canvasToMermaidCode(graphData.nodes as never[], graphData.edges as never[])
}

function generateNodeId(existingNodes: CanvasNode[]): string {
  const existingIds = new Set(existingNodes.map((n) => n.id))
  let i = 1
  while (existingIds.has(`node${i}`)) i++
  return `node${i}`
}

function generateEdgeId(existingEdges: CanvasEdge[]): string {
  const existingIds = new Set(existingEdges.map((e) => e.id))
  let i = 0
  while (existingIds.has(`edge-${i}`)) i++
  return `edge-${i}`
}

function getAutoPosition(existingNodes: CanvasNode[]): { x: number; y: number } {
  if (existingNodes.length === 0) return { x: 200, y: 100 }
  const maxY = Math.max(...existingNodes.map((n) => n.position.y))
  return { x: 200, y: maxY + 120 }
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true }
}

// === MCP Server Setup ===

const server = new McpServer(
  { name: 'corthex-sketchvibe', version: '1.0.0' },
  { capabilities: { tools: {} } },
)

// --- Tool 1: read_canvas ---
server.registerTool('read_canvas', {
  title: 'Read Canvas',
  description: 'Read a SketchVibe canvas and return its content as Mermaid code with metadata',
  inputSchema: {
    sketchId: z.string().describe('Canvas ID to read'),
    companyId: z.string().describe('Company ID for tenant isolation'),
  },
}, async ({ sketchId, companyId }) => {
  try {
    const sketch = await getSketch(sketchId, companyId)
    if (!sketch) {
      return errorResult(`Error: Canvas '${sketchId}' not found`)
    }
    const graphData = parseGraphData(sketch.graphData)
    const mermaid = graphToMermaid(graphData)
    const result = JSON.stringify({
      name: sketch.name,
      sketchId: sketch.id,
      nodeCount: graphData.nodes.length,
      edgeCount: graphData.edges.length,
      mermaid,
      nodes: graphData.nodes.map((n) => ({ id: n.id, type: n.type, label: n.data.label })),
    }, null, 2)
    return { content: [{ type: 'text' as const, text: result }] }
  } catch (err) {
    return errorResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
})

// --- Tool 2: add_node ---
server.registerTool('add_node', {
  title: 'Add Node',
  description: 'Add a node to a SketchVibe canvas. Supported types: start, end, agent, system, api, decide, db, note',
  inputSchema: {
    sketchId: z.string().describe('Canvas ID'),
    companyId: z.string().describe('Company ID for tenant isolation'),
    nodeType: z.enum(['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']).describe('Node type'),
    label: z.string().describe('Node label text'),
    x: z.number().optional().describe('X position (auto if omitted)'),
    y: z.number().optional().describe('Y position (auto if omitted)'),
    autoSave: z.boolean().optional().default(false).describe('Save to DB immediately'),
  },
}, async ({ sketchId, companyId, nodeType, label, x, y, autoSave }) => {
  try {
    const sketch = await getSketch(sketchId, companyId)
    if (!sketch) {
      return errorResult(`Error: Canvas '${sketchId}' not found`)
    }
    const graphData = parseGraphData(sketch.graphData)
    const nodeId = generateNodeId(graphData.nodes)
    const position = (x !== undefined && y !== undefined) ? { x, y } : getAutoPosition(graphData.nodes)
    const newNode: CanvasNode = { id: nodeId, type: nodeType, position, data: { label } }
    graphData.nodes.push(newNode)

    if (autoSave) {
      await updateSketchGraphData(sketchId, companyId, graphData)
    }

    const mermaid = graphToMermaid(graphData)
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ nodeId, nodeType, label, position, mermaid, saved: !!autoSave }),
      }],
    }
  } catch (err) {
    return errorResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
})

// --- Tool 3: update_node ---
server.registerTool('update_node', {
  title: 'Update Node',
  description: 'Update a node label, type, or position on a SketchVibe canvas',
  inputSchema: {
    sketchId: z.string().describe('Canvas ID'),
    companyId: z.string().describe('Company ID for tenant isolation'),
    nodeId: z.string().describe('Node ID to update'),
    label: z.string().optional().describe('New label'),
    nodeType: z.enum(['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']).optional().describe('New node type'),
    x: z.number().optional().describe('New X position'),
    y: z.number().optional().describe('New Y position'),
    autoSave: z.boolean().optional().default(false).describe('Save to DB immediately'),
  },
}, async ({ sketchId, companyId, nodeId, label, nodeType, x, y, autoSave }) => {
  try {
    const sketch = await getSketch(sketchId, companyId)
    if (!sketch) {
      return errorResult(`Error: Canvas '${sketchId}' not found`)
    }
    const graphData = parseGraphData(sketch.graphData)
    const node = graphData.nodes.find((n) => n.id === nodeId)
    if (!node) {
      return errorResult(`Error: Node '${nodeId}' not found`)
    }

    if (label !== undefined) node.data.label = label
    if (nodeType !== undefined) node.type = nodeType
    if (x !== undefined) node.position.x = x
    if (y !== undefined) node.position.y = y

    if (autoSave) {
      await updateSketchGraphData(sketchId, companyId, graphData)
    }

    const mermaid = graphToMermaid(graphData)
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ nodeId, updated: { label, nodeType, x, y }, mermaid, saved: !!autoSave }),
      }],
    }
  } catch (err) {
    return errorResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
})

// --- Tool 4: delete_node ---
server.registerTool('delete_node', {
  title: 'Delete Node',
  description: 'Delete a node and all connected edges from a SketchVibe canvas',
  inputSchema: {
    sketchId: z.string().describe('Canvas ID'),
    companyId: z.string().describe('Company ID for tenant isolation'),
    nodeId: z.string().describe('Node ID to delete'),
    autoSave: z.boolean().optional().default(false).describe('Save to DB immediately'),
  },
}, async ({ sketchId, companyId, nodeId, autoSave }) => {
  try {
    const sketch = await getSketch(sketchId, companyId)
    if (!sketch) {
      return errorResult(`Error: Canvas '${sketchId}' not found`)
    }
    const graphData = parseGraphData(sketch.graphData)
    const nodeIndex = graphData.nodes.findIndex((n) => n.id === nodeId)
    if (nodeIndex === -1) {
      return errorResult(`Error: Node '${nodeId}' not found`)
    }

    graphData.nodes.splice(nodeIndex, 1)
    const removedEdges = graphData.edges.filter((e) => e.source === nodeId || e.target === nodeId)
    graphData.edges = graphData.edges.filter((e) => e.source !== nodeId && e.target !== nodeId)

    if (autoSave) {
      await updateSketchGraphData(sketchId, companyId, graphData)
    }

    const mermaid = graphToMermaid(graphData)
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          deletedNode: nodeId,
          deletedEdges: removedEdges.length,
          remainingNodes: graphData.nodes.length,
          mermaid,
          saved: !!autoSave,
        }),
      }],
    }
  } catch (err) {
    return errorResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
})

// --- Tool 5: add_edge ---
server.registerTool('add_edge', {
  title: 'Add Edge',
  description: 'Add a connection (edge) between two nodes on a SketchVibe canvas',
  inputSchema: {
    sketchId: z.string().describe('Canvas ID'),
    companyId: z.string().describe('Company ID for tenant isolation'),
    source: z.string().describe('Source node ID'),
    target: z.string().describe('Target node ID'),
    label: z.string().optional().describe('Edge label'),
    autoSave: z.boolean().optional().default(false).describe('Save to DB immediately'),
  },
}, async ({ sketchId, companyId, source, target, label, autoSave }) => {
  try {
    const sketch = await getSketch(sketchId, companyId)
    if (!sketch) {
      return errorResult(`Error: Canvas '${sketchId}' not found`)
    }
    const graphData = parseGraphData(sketch.graphData)
    const sourceNode = graphData.nodes.find((n) => n.id === source)
    const targetNode = graphData.nodes.find((n) => n.id === target)
    if (!sourceNode) {
      return errorResult(`Error: Source node '${source}' not found`)
    }
    if (!targetNode) {
      return errorResult(`Error: Target node '${target}' not found`)
    }

    const edgeId = generateEdgeId(graphData.edges)
    const newEdge: CanvasEdge = {
      id: edgeId,
      source,
      target,
      type: 'editable',
      ...(label ? { data: { label } } : {}),
    }
    graphData.edges.push(newEdge)

    if (autoSave) {
      await updateSketchGraphData(sketchId, companyId, graphData)
    }

    const mermaid = graphToMermaid(graphData)
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ edgeId, source, target, label: label ?? null, mermaid, saved: !!autoSave }),
      }],
    }
  } catch (err) {
    return errorResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
})

// --- Tool 6: save_diagram ---
server.registerTool('save_diagram', {
  title: 'Save Diagram',
  description: 'Save the current canvas state to the database with version history',
  inputSchema: {
    sketchId: z.string().describe('Canvas ID'),
    companyId: z.string().describe('Company ID for tenant isolation'),
    name: z.string().optional().describe('Optional new name for the canvas'),
  },
}, async ({ sketchId, companyId, name }) => {
  try {
    const sketch = await getSketch(sketchId, companyId)
    if (!sketch) {
      return errorResult(`Error: Canvas '${sketchId}' not found`)
    }

    const graphData = parseGraphData(sketch.graphData)
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (name) updateData.name = name

    await db
      .update(sketches)
      .set(updateData)
      .where(and(eq(sketches.id, sketchId), eq(sketches.companyId, companyId)))

    const version = await createVersion(sketchId, graphData)

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          saved: true,
          sketchId,
          name: name ?? sketch.name,
          version,
          nodeCount: graphData.nodes.length,
          edgeCount: graphData.edges.length,
        }),
      }],
    }
  } catch (err) {
    return errorResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
})

// === Start Server ===

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // Server is now running on stdin/stdout
}

main().catch((err) => {
  console.error('SketchVibe MCP server failed to start:', err)
  process.exit(1)
})
