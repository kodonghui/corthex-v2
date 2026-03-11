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
import { eq, and, desc, max, sql, ilike, or } from 'drizzle-orm'
import { db } from '../db/index'
import { sketches, sketchVersions, knowledgeDocs } from '../db/schema'
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

// --- Tool 7: search_knowledge (Story 11.4) ---
server.registerTool('search_knowledge', {
  title: 'Search Knowledge Base',
  description: 'Search the knowledge base for related diagrams and documents using keyword matching',
  inputSchema: {
    query: z.string().describe('Search query text'),
    companyId: z.string().describe('Company ID for tenant isolation'),
    limit: z.number().optional().describe('Max results (default 5)'),
  },
}, async ({ query, companyId, limit }) => {
  try {
    const maxResults = limit ?? 5
    const searchPattern = `%${query}%`

    const results = await db
      .select({
        id: knowledgeDocs.id,
        title: knowledgeDocs.title,
        content: knowledgeDocs.content,
        contentType: knowledgeDocs.contentType,
        folderId: knowledgeDocs.folderId,
      })
      .from(knowledgeDocs)
      .where(and(
        eq(knowledgeDocs.companyId, companyId),
        eq(knowledgeDocs.isActive, true),
        or(
          ilike(knowledgeDocs.title, searchPattern),
          ilike(knowledgeDocs.content, searchPattern),
        ),
      ))
      .orderBy(desc(knowledgeDocs.updatedAt))
      .limit(maxResults)

    const data = results.map(r => ({
      id: r.id,
      title: r.title,
      contentType: r.contentType,
      hasMermaid: r.content?.includes('```mermaid') ?? false,
      preview: r.content?.slice(0, 300) || null,
    }))

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ results: data, total: data.length, query }, null, 2),
      }],
    }
  } catch (err) {
    return errorResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
})

// --- Tool 8: load_from_knowledge (Story 11.4) ---
server.registerTool('load_from_knowledge', {
  title: 'Load From Knowledge',
  description: 'Load a Mermaid diagram from knowledge base into the current canvas',
  inputSchema: {
    sketchId: z.string().describe('Canvas ID to load into'),
    companyId: z.string().describe('Company ID for tenant isolation'),
    docId: z.string().describe('Knowledge document ID to load from'),
    mode: z.enum(['replace', 'merge']).optional().describe('Replace canvas or merge (default: replace)'),
  },
}, async ({ sketchId, companyId, docId, mode }) => {
  try {
    const sketch = await getSketch(sketchId, companyId)
    if (!sketch) return errorResult(`Error: Canvas '${sketchId}' not found`)

    const [doc] = await db
      .select({ id: knowledgeDocs.id, title: knowledgeDocs.title, content: knowledgeDocs.content })
      .from(knowledgeDocs)
      .where(and(eq(knowledgeDocs.id, docId), eq(knowledgeDocs.companyId, companyId), eq(knowledgeDocs.isActive, true)))
      .limit(1)

    if (!doc) return errorResult(`Error: Knowledge document '${docId}' not found`)

    let mermaidCode = doc.content || ''
    const match = mermaidCode.match(/```mermaid\s*\n([\s\S]*?)```/)
    if (match) mermaidCode = match[1].trim()
    if (!mermaidCode) return errorResult('Error: No Mermaid code found in document')

    const parsed = parseMermaid(mermaidCode)
    if (parsed.error) return errorResult(`Error: Mermaid parse failed — ${parsed.error}`)

    const newNodes: CanvasNode[] = parsed.nodes.map((n, i) => ({
      id: n.id,
      type: (VALID_NODE_TYPES.includes(n.nodeType as SvNodeType) ? n.nodeType : 'note') as SvNodeType,
      position: { x: 100 + (i % 4) * 250, y: 100 + Math.floor(i / 4) * 150 },
      data: { label: n.label },
    }))

    const newEdges: CanvasEdge[] = parsed.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'editable',
      ...(e.label ? { data: { label: e.label } } : {}),
    }))

    let finalGraphData: GraphData
    const loadMode = mode || 'replace'

    if (loadMode === 'merge') {
      const existing = parseGraphData(sketch.graphData)

      // Version backup before merge (CR fix)
      if (existing.nodes.length > 0) {
        await createVersion(sketchId, existing)
      }

      const maxY = existing.nodes.reduce((m, n) => Math.max(m, n.position.y), 0)
      const offsetY = maxY + 200
      const existingIds = new Set(existing.nodes.map(n => n.id))

      // Dedup node IDs (CR fix)
      const idMap = new Map<string, string>()
      const mergedNodes = newNodes.map(n => {
        let nodeId = n.id
        if (existingIds.has(nodeId)) nodeId = `${nodeId}_merge_${Date.now()}`
        idMap.set(n.id, nodeId)
        return { ...n, id: nodeId, position: { x: n.position.x, y: n.position.y + offsetY } }
      })
      const mergedEdges = newEdges.map(e => ({
        ...e,
        id: `merge-${Date.now()}-${e.id}`,
        source: idMap.get(e.source) || e.source,
        target: idMap.get(e.target) || e.target,
      }))

      finalGraphData = {
        nodes: [...existing.nodes, ...mergedNodes],
        edges: [...existing.edges, ...mergedEdges],
      }
    } else {
      finalGraphData = { nodes: newNodes, edges: newEdges }
    }

    // Save version before replacing
    if (loadMode === 'replace') {
      const currentData = parseGraphData(sketch.graphData)
      if (currentData.nodes.length > 0) {
        await createVersion(sketchId, currentData)
      }
    }

    await updateSketchGraphData(sketchId, companyId, finalGraphData)

    // Link sketch ↔ knowledgeDoc
    await db.update(sketches).set({ knowledgeDocId: docId }).where(eq(sketches.id, sketchId))
    await db.update(knowledgeDocs).set({ linkedSketchId: sketchId }).where(eq(knowledgeDocs.id, docId))

    const mermaid = graphToMermaid(finalGraphData)

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          loaded: true,
          mode: loadMode,
          sourceDocId: docId,
          sourceTitle: doc.title,
          nodeCount: finalGraphData.nodes.length,
          edgeCount: finalGraphData.edges.length,
          mermaid,
        }, null, 2),
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
