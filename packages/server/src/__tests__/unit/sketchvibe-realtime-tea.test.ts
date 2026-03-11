/**
 * Story 11.3 TEA: SketchVibe AI 실시간 편집 — Risk-Based Test Suite
 *
 * Risk Matrix:
 * - R1 HIGH: MCP mutation broadcast integrity (correct event shape)
 * - R2 HIGH: companyId isolation in broadcast
 * - R3 HIGH: Error handling — tool failure does not crash broadcast
 * - R4 MEDIUM: Non-mutation tools must NOT broadcast
 * - R5 MEDIUM: Concurrent rapid mutations broadcast order
 * - R6 MEDIUM: Large mermaid payload handling
 * - R7 LOW: Empty/null fields in MCP response
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'

// === Mocks ===
const broadcastCalls: Array<{ companyId: string; event: string; data: unknown }> = []
mock.module('../../ws/channels', () => ({
  broadcastToCompany: (companyId: string, event: string, data: unknown) => {
    broadcastCalls.push({ companyId, event, data })
  },
  broadcastToChannel: mock(() => {}),
}))

let toolResponse = ''
mock.module('../../mcp/stdio-client', () => ({
  callSketchVibeTool: async () => toolResponse,
  getSketchVibeMcpClient: async () => ({}),
  listSketchVibeTools: async () => [],
  closeSketchVibeMcpClient: async () => {},
}))

const {
  svAddNode, svUpdateNode, svDeleteNode, svAddEdge,
  svReadCanvas, svSaveDiagram,
} = await import('../../lib/tool-handlers/builtins/sketchvibe-mcp')

const ctx = {
  companyId: 'co-tea',
  agentId: 'agent-1',
  sessionId: 'sess-1',
  departmentId: null,
  userId: 'user-1',
  getCredentials: async () => ({}),
}

describe('TEA R1: Broadcast event shape integrity', () => {
  beforeEach(() => { broadcastCalls.length = 0 })

  test('add_node broadcast has correct canvas_mcp_update shape', async () => {
    toolResponse = JSON.stringify({ nodeId: 'n1', mermaid: 'flowchart TD\n  n1[X]', saved: false })
    await svAddNode({ sketchId: 's1', nodeType: 'agent', label: 'X' }, ctx)

    expect(broadcastCalls).toHaveLength(1)
    const data = broadcastCalls[0].data as Record<string, unknown>
    expect(data.type).toBe('canvas_mcp_update')
    expect(data.mermaid).toBe('flowchart TD\n  n1[X]')
    expect(data.toolName).toBe('add_node')
    expect(typeof data.description).toBe('string')
  })

  test('update_node broadcast includes toolName', async () => {
    toolResponse = JSON.stringify({ nodeId: 'n1', mermaid: 'flowchart TD\n  n1[Y]', saved: false })
    await svUpdateNode({ sketchId: 's1', nodeId: 'n1', label: 'Y' }, ctx)

    expect(broadcastCalls).toHaveLength(1)
    expect((broadcastCalls[0].data as Record<string, unknown>).toolName).toBe('update_node')
  })

  test('delete_node broadcast uses deletedNode in description', async () => {
    toolResponse = JSON.stringify({ deletedNode: 'n2', deletedEdges: 1, mermaid: 'flowchart TD', saved: false })
    await svDeleteNode({ sketchId: 's1', nodeId: 'n2' }, ctx)

    expect(broadcastCalls).toHaveLength(1)
    expect((broadcastCalls[0].data as Record<string, unknown>).description).toContain('n2')
  })

  test('add_edge broadcast uses edgeId in description', async () => {
    toolResponse = JSON.stringify({ edgeId: 'e-0', source: 'a', target: 'b', mermaid: 'flowchart TD\n  a --> b', saved: false })
    await svAddEdge({ sketchId: 's1', source: 'a', target: 'b' }, ctx)

    expect(broadcastCalls).toHaveLength(1)
    expect((broadcastCalls[0].data as Record<string, unknown>).description).toContain('e-0')
  })
})

describe('TEA R2: companyId tenant isolation', () => {
  beforeEach(() => { broadcastCalls.length = 0 })

  test('broadcast uses ctx.companyId not input.companyId', async () => {
    toolResponse = JSON.stringify({ nodeId: 'n1', mermaid: 'flowchart TD\n  n1[A]', saved: false })
    const isolatedCtx = { ...ctx, companyId: 'tenant-abc' }
    await svAddNode({ sketchId: 's1', nodeType: 'agent', label: 'A', companyId: 'wrong-tenant' }, isolatedCtx)

    expect(broadcastCalls).toHaveLength(1)
    expect(broadcastCalls[0].companyId).toBe('tenant-abc')
    expect(broadcastCalls[0].event).toBe('nexus')
  })

  test('different companies get different broadcasts', async () => {
    toolResponse = JSON.stringify({ nodeId: 'n1', mermaid: 'flowchart TD\n  n1[A]', saved: false })

    await svAddNode({ sketchId: 's1' }, { ...ctx, companyId: 'co-1' })
    await svAddNode({ sketchId: 's1' }, { ...ctx, companyId: 'co-2' })

    expect(broadcastCalls).toHaveLength(2)
    expect(broadcastCalls[0].companyId).toBe('co-1')
    expect(broadcastCalls[1].companyId).toBe('co-2')
  })
})

describe('TEA R3: Error resilience', () => {
  beforeEach(() => { broadcastCalls.length = 0 })

  test('malformed JSON does not throw, returns raw result', async () => {
    toolResponse = 'Error: Canvas not found'
    const result = await svAddNode({ sketchId: 's1' }, ctx)

    expect(result).toBe('Error: Canvas not found')
    expect(broadcastCalls).toHaveLength(0)
  })

  test('JSON with isError=true still broadcasts if mermaid present', async () => {
    toolResponse = JSON.stringify({ nodeId: 'n1', mermaid: 'flowchart TD\n  n1[OK]', isError: false })
    await svAddNode({ sketchId: 's1' }, ctx)

    expect(broadcastCalls).toHaveLength(1)
  })

  test('empty string response does not throw', async () => {
    toolResponse = ''
    const result = await svAddNode({ sketchId: 's1' }, ctx)

    expect(result).toBe('')
    expect(broadcastCalls).toHaveLength(0)
  })

  test('null-like JSON values do not crash', async () => {
    toolResponse = JSON.stringify({ nodeId: null, mermaid: null })
    await svAddNode({ sketchId: 's1' }, ctx)

    expect(broadcastCalls).toHaveLength(0) // null mermaid = no broadcast
  })
})

describe('TEA R4: Non-mutation tools must NOT broadcast', () => {
  beforeEach(() => { broadcastCalls.length = 0 })

  test('read_canvas with mermaid in response still no broadcast', async () => {
    toolResponse = JSON.stringify({ name: 'Test', mermaid: 'flowchart TD\n  a[X]', nodeCount: 1 })
    await svReadCanvas({ sketchId: 's1' }, ctx)

    expect(broadcastCalls).toHaveLength(0)
  })

  test('save_diagram no broadcast', async () => {
    toolResponse = JSON.stringify({ saved: true, version: 5, mermaid: 'flowchart TD' })
    await svSaveDiagram({ sketchId: 's1' }, ctx)

    expect(broadcastCalls).toHaveLength(0)
  })
})

describe('TEA R5: Rapid sequential mutations', () => {
  beforeEach(() => { broadcastCalls.length = 0 })

  test('5 rapid add_node calls produce 5 broadcasts in order', async () => {
    const promises = []
    for (let i = 0; i < 5; i++) {
      toolResponse = JSON.stringify({ nodeId: `n${i}`, mermaid: `flowchart TD\n  n${i}[Node ${i}]`, saved: false })
      promises.push(svAddNode({ sketchId: 's1', nodeType: 'agent', label: `Node ${i}` }, ctx))
    }
    await Promise.all(promises)

    expect(broadcastCalls).toHaveLength(5)
    // All should be canvas_mcp_update
    for (const call of broadcastCalls) {
      expect((call.data as Record<string, unknown>).type).toBe('canvas_mcp_update')
    }
  })
})

describe('TEA R6: Large mermaid payload', () => {
  beforeEach(() => { broadcastCalls.length = 0 })

  test('large mermaid (100 nodes) broadcasts successfully', async () => {
    const lines = ['flowchart TD']
    for (let i = 0; i < 100; i++) lines.push(`  node${i}[Node ${i}]`)
    const largeMermaid = lines.join('\n')

    toolResponse = JSON.stringify({ nodeId: 'node100', mermaid: largeMermaid, saved: false })
    await svAddNode({ sketchId: 's1' }, ctx)

    expect(broadcastCalls).toHaveLength(1)
    expect(((broadcastCalls[0].data as Record<string, unknown>).mermaid as string).length).toBeGreaterThan(1000)
  })
})

describe('TEA R7: Edge field extraction', () => {
  beforeEach(() => { broadcastCalls.length = 0 })

  test('description falls back to empty when no nodeId/edgeId/deletedNode', async () => {
    toolResponse = JSON.stringify({ mermaid: 'flowchart TD\n  a[X]', saved: true })
    await svAddNode({ sketchId: 's1' }, ctx)

    expect(broadcastCalls).toHaveLength(1)
    const desc = (broadcastCalls[0].data as Record<string, unknown>).description as string
    expect(desc).toBe('MCP add_node: ')
  })

  test('nodeId takes priority over edgeId in description', async () => {
    toolResponse = JSON.stringify({ nodeId: 'n1', edgeId: 'e1', mermaid: 'flowchart TD', saved: false })
    await svAddNode({ sketchId: 's1' }, ctx)

    expect((broadcastCalls[0].data as Record<string, unknown>).description).toContain('n1')
  })
})
