/**
 * Story 11.3: SketchVibe AI 실시간 편집 — MCP → WebSocket 브로드캐스트 테스트
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'

// Mock broadcastToCompany
const mockBroadcast = mock(() => {})
mock.module('../../ws/channels', () => ({
  broadcastToCompany: mockBroadcast,
  broadcastToChannel: mock(() => {}),
}))

// Mock callSketchVibeTool — returns JSON string with mermaid field
const mockCallTool = mock(async () => JSON.stringify({
  nodeId: 'node1',
  nodeType: 'agent',
  label: '테스트 에이전트',
  position: { x: 200, y: 100 },
  mermaid: 'flowchart TD\n  node1[테스트 에이전트]',
  saved: false,
}))

mock.module('../../mcp/stdio-client', () => ({
  callSketchVibeTool: mockCallTool,
  getSketchVibeMcpClient: mock(async () => ({})),
  listSketchVibeTools: mock(async () => []),
  closeSketchVibeMcpClient: mock(async () => {}),
}))

// Import after mocking
const { svAddNode, svUpdateNode, svDeleteNode, svAddEdge, svReadCanvas, svSaveDiagram } = await import(
  '../../lib/tool-handlers/builtins/sketchvibe-mcp'
)

const baseCtx = {
  companyId: 'test-company',
  agentId: 'test-agent',
  sessionId: 'test-session',
  departmentId: null,
  userId: 'test-user',
  getCredentials: async () => ({}),
}

describe('SketchVibe MCP → WebSocket Broadcast', () => {
  beforeEach(() => {
    mockBroadcast.mockClear()
    mockCallTool.mockClear()
  })

  test('add_node broadcasts canvas_mcp_update via WebSocket', async () => {
    await svAddNode({ sketchId: 'sk1', nodeType: 'agent', label: '테스트' }, baseCtx)

    expect(mockCallTool).toHaveBeenCalledTimes(1)
    expect(mockBroadcast).toHaveBeenCalledTimes(1)
    expect(mockBroadcast).toHaveBeenCalledWith('test-company', 'nexus', {
      type: 'canvas_mcp_update',
      mermaid: 'flowchart TD\n  node1[테스트 에이전트]',
      toolName: 'add_node',
      description: 'MCP add_node: node1',
    })
  })

  test('update_node broadcasts canvas_mcp_update', async () => {
    mockCallTool.mockImplementationOnce(async () => JSON.stringify({
      nodeId: 'node1',
      updated: { label: '업데이트됨' },
      mermaid: 'flowchart TD\n  node1[업데이트됨]',
      saved: false,
    }))

    await svUpdateNode({ sketchId: 'sk1', nodeId: 'node1', label: '업데이트됨' }, baseCtx)

    expect(mockBroadcast).toHaveBeenCalledTimes(1)
    expect(mockBroadcast.mock.calls[0][2]).toMatchObject({
      type: 'canvas_mcp_update',
      toolName: 'update_node',
    })
  })

  test('delete_node broadcasts canvas_mcp_update', async () => {
    mockCallTool.mockImplementationOnce(async () => JSON.stringify({
      deletedNode: 'node1',
      deletedEdges: 2,
      remainingNodes: 0,
      mermaid: 'flowchart TD',
      saved: false,
    }))

    await svDeleteNode({ sketchId: 'sk1', nodeId: 'node1' }, baseCtx)

    expect(mockBroadcast).toHaveBeenCalledTimes(1)
    expect(mockBroadcast.mock.calls[0][2]).toMatchObject({
      type: 'canvas_mcp_update',
      toolName: 'delete_node',
      description: 'MCP delete_node: node1',
    })
  })

  test('add_edge broadcasts canvas_mcp_update', async () => {
    mockCallTool.mockImplementationOnce(async () => JSON.stringify({
      edgeId: 'edge-0',
      source: 'node1',
      target: 'node2',
      mermaid: 'flowchart TD\n  node1 --> node2',
      saved: false,
    }))

    await svAddEdge({ sketchId: 'sk1', source: 'node1', target: 'node2' }, baseCtx)

    expect(mockBroadcast).toHaveBeenCalledTimes(1)
    expect(mockBroadcast.mock.calls[0][2]).toMatchObject({
      type: 'canvas_mcp_update',
      toolName: 'add_edge',
      description: 'MCP add_edge: edge-0',
    })
  })

  test('read_canvas does NOT broadcast (non-mutation)', async () => {
    mockCallTool.mockImplementationOnce(async () => JSON.stringify({
      name: 'Test Canvas',
      sketchId: 'sk1',
      nodeCount: 3,
      edgeCount: 2,
      mermaid: 'flowchart TD\n  node1[Test]',
    }))

    await svReadCanvas({ sketchId: 'sk1' }, baseCtx)

    expect(mockCallTool).toHaveBeenCalledTimes(1)
    expect(mockBroadcast).toHaveBeenCalledTimes(0)
  })

  test('save_diagram does NOT broadcast (non-mutation)', async () => {
    mockCallTool.mockImplementationOnce(async () => JSON.stringify({
      saved: true,
      sketchId: 'sk1',
      name: 'Test',
      version: 1,
    }))

    await svSaveDiagram({ sketchId: 'sk1' }, baseCtx)

    expect(mockCallTool).toHaveBeenCalledTimes(1)
    expect(mockBroadcast).toHaveBeenCalledTimes(0)
  })

  test('mutation tool with invalid JSON response does not crash', async () => {
    mockCallTool.mockImplementationOnce(async () => 'not-json-response')

    const result = await svAddNode({ sketchId: 'sk1', nodeType: 'agent', label: '테스트' }, baseCtx)

    expect(result).toBe('not-json-response')
    expect(mockBroadcast).toHaveBeenCalledTimes(0) // No broadcast on parse failure
  })

  test('mutation tool with empty response does not crash', async () => {
    mockCallTool.mockImplementationOnce(async () => '')

    const result = await svAddNode({ sketchId: 'sk1', nodeType: 'agent', label: '테스트' }, baseCtx)

    expect(result).toBe('')
    expect(mockBroadcast).toHaveBeenCalledTimes(0)
  })

  test('mutation tool without mermaid field does not broadcast', async () => {
    mockCallTool.mockImplementationOnce(async () => JSON.stringify({ nodeId: 'node1', error: true }))

    await svAddNode({ sketchId: 'sk1', nodeType: 'agent', label: '테스트' }, baseCtx)

    expect(mockBroadcast).toHaveBeenCalledTimes(0)
  })

  test('companyId from ctx is used for broadcast', async () => {
    const customCtx = { ...baseCtx, companyId: 'custom-company-id' }
    await svAddNode({ sketchId: 'sk1', nodeType: 'agent', label: '테스트' }, customCtx)

    expect(mockBroadcast).toHaveBeenCalledWith('custom-company-id', 'nexus', expect.any(Object))
  })

  test('tool handler passes companyId from ctx to MCP tool args', async () => {
    await svAddNode({ sketchId: 'sk1', nodeType: 'agent', label: '테스트' }, baseCtx)

    expect(mockCallTool).toHaveBeenCalledWith('add_node', {
      sketchId: 'sk1',
      nodeType: 'agent',
      label: '테스트',
      companyId: 'test-company',
    })
  })
})
