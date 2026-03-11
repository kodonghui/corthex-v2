/**
 * Story 11.3 QA: SketchVibe AI 실시간 편집 — AC 검증 테스트
 *
 * AC #1: MCP → WebSocket 실시간 동기화
 * AC #2: 8종 노드 타입 (이미 구현 — 구조 검증만)
 * AC #4: Space바 연결 모드 + Ctrl 멀티선택 (프론트엔드 — 코드 구조 검증)
 * AC #5: edgehandles (이미 구현 — 구조 검증만)
 * AC #6: compound parent subgraph (프론트엔드 — 코드 구조 검증)
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// ======= AC #1: MCP → WebSocket 실시간 동기화 =======

const mockBroadcast = mock(() => {})
mock.module('../../ws/channels', () => ({
  broadcastToCompany: mockBroadcast,
  broadcastToChannel: mock(() => {}),
}))

const mockCallTool = mock(async () => JSON.stringify({
  nodeId: 'qa-node',
  mermaid: 'flowchart TD\n  qa-node[QA]',
  saved: false,
}))

mock.module('../../mcp/stdio-client', () => ({
  callSketchVibeTool: mockCallTool,
  getSketchVibeMcpClient: async () => ({}),
  listSketchVibeTools: async () => [],
  closeSketchVibeMcpClient: async () => {},
}))

const handlers = await import('../../lib/tool-handlers/builtins/sketchvibe-mcp')

const ctx = {
  companyId: 'qa-co',
  agentId: 'qa-agent',
  sessionId: 'qa-sess',
  departmentId: null,
  userId: 'qa-user',
  getCredentials: async () => ({}),
}

describe('QA AC #1: MCP → WebSocket 실시간 동기화', () => {
  beforeEach(() => {
    mockBroadcast.mockClear()
    mockCallTool.mockClear()
  })

  test('AC1-1: 4개 mutation 도구 전부 브로드캐스트', async () => {
    const mutationTools = [
      { handler: handlers.svAddNode, name: 'add_node' },
      { handler: handlers.svUpdateNode, name: 'update_node' },
      { handler: handlers.svDeleteNode, name: 'delete_node' },
      { handler: handlers.svAddEdge, name: 'add_edge' },
    ]

    for (const { handler, name } of mutationTools) {
      mockBroadcast.mockClear()
      mockCallTool.mockImplementationOnce(async () =>
        JSON.stringify({ nodeId: 'n1', mermaid: 'flowchart TD\n  n1[X]', saved: false }),
      )
      await handler({ sketchId: 's1' }, ctx)
      expect(mockBroadcast).toHaveBeenCalledTimes(1)
      expect(mockBroadcast.mock.calls[0][1]).toBe('nexus') // nexus 채널
      const data = mockBroadcast.mock.calls[0][2] as Record<string, unknown>
      expect(data.type).toBe('canvas_mcp_update')
      expect(data.toolName).toBe(name)
    }
  })

  test('AC1-2: 브로드캐스트 이벤트에 mermaid 코드 포함', async () => {
    const testMermaid = 'flowchart TD\n  a[Agent]\n  b[System]\n  a --> b'
    mockCallTool.mockImplementationOnce(async () =>
      JSON.stringify({ nodeId: 'a', mermaid: testMermaid }),
    )
    await handlers.svAddNode({ sketchId: 's1' }, ctx)

    const data = mockBroadcast.mock.calls[0][2] as Record<string, unknown>
    expect(data.mermaid).toBe(testMermaid)
  })

  test('AC1-3: 비-mutation 도구(read_canvas, save_diagram)는 브로드캐스트 없음', async () => {
    await handlers.svReadCanvas({ sketchId: 's1' }, ctx)
    await handlers.svSaveDiagram({ sketchId: 's1' }, ctx)
    expect(mockBroadcast).not.toHaveBeenCalled()
  })
})

// ======= AC #2, #6: 코드 구조 검증 (프론트엔드) =======

const projectRoot = path.resolve(__dirname, '../../../../..')

describe('QA AC #2: 8종 노드 타입 + group 노드', () => {
  test('AC2-1: sketchvibe-nodes.tsx에 9개 노드 타입 (8종 + group) 등록', () => {
    const code = fs.readFileSync(
      path.join(projectRoot, 'packages/app/src/components/nexus/sketchvibe-nodes.tsx'),
      'utf8',
    )
    expect(code).toContain('start: StartNode')
    expect(code).toContain('end: EndNode')
    expect(code).toContain('agent: SvAgentNode')
    expect(code).toContain('system: SystemNode')
    expect(code).toContain('api: ApiNode')
    expect(code).toContain('decide: DecideNode')
    expect(code).toContain('db: DbNode')
    expect(code).toContain('note: NoteNode')
    expect(code).toContain('group: GroupNode')
  })

  test('AC2-2: GroupNode은 Handle 4개 (top/bottom/left/right) 보유', () => {
    const code = fs.readFileSync(
      path.join(projectRoot, 'packages/app/src/components/nexus/sketchvibe-nodes.tsx'),
      'utf8',
    )
    // GroupNode 내부에 Handle이 4개 있어야 함
    const groupSection = code.slice(code.indexOf('export function GroupNode'))
    const handleCount = (groupSection.match(/<Handle/g) || []).length
    expect(handleCount).toBeGreaterThanOrEqual(4)
  })
})

describe('QA AC #4: Space바 연결 모드 + Ctrl 멀티선택', () => {
  let nexusCode: string

  beforeEach(() => {
    nexusCode = fs.readFileSync(
      path.join(projectRoot, 'packages/app/src/pages/nexus.tsx'),
      'utf8',
    )
  })

  test('AC4-1: connectionMode 상태 존재', () => {
    expect(nexusCode).toContain('connectionMode')
    expect(nexusCode).toContain('setConnectionMode')
  })

  test('AC4-2: Space 키 이벤트 핸들러 등록', () => {
    expect(nexusCode).toContain("e.code === 'Space'")
    expect(nexusCode).toContain('setConnectionMode(true)')
    expect(nexusCode).toContain('setConnectionMode(false)')
  })

  test('AC4-3: pendingSource로 두 노드 간 엣지 생성 로직', () => {
    expect(nexusCode).toContain('pendingSource')
    expect(nexusCode).toContain('setPendingSource')
    expect(nexusCode).toContain('handleNodeClickForConnection')
  })

  test('AC4-4: multiSelectionKeyCode="Control" 설정', () => {
    expect(nexusCode).toContain('multiSelectionKeyCode="Control"')
  })

  test('AC4-5: 상태바에 연결 모드 표시', () => {
    expect(nexusCode).toContain('연결 모드')
  })

  test('AC4-6: 상태바에 선택 수 표시', () => {
    expect(nexusCode).toContain('개 선택됨')
  })
})

describe('QA AC #6: Subgraph 그룹핑', () => {
  let nexusCode: string

  beforeEach(() => {
    nexusCode = fs.readFileSync(
      path.join(projectRoot, 'packages/app/src/pages/nexus.tsx'),
      'utf8',
    )
  })

  test('AC6-1: handleGroupSelected 함수 존재', () => {
    expect(nexusCode).toContain('handleGroupSelected')
    expect(nexusCode).toContain('parentId')
  })

  test('AC6-2: handleUngroupNode 함수 존재', () => {
    expect(nexusCode).toContain('handleUngroupNode')
    expect(nexusCode).toContain("parentId: undefined")
  })

  test('AC6-3: context-menu에 그룹 만들기/해제 메뉴', () => {
    const ctxCode = fs.readFileSync(
      path.join(projectRoot, 'packages/app/src/components/nexus/context-menu.tsx'),
      'utf8',
    )
    expect(ctxCode).toContain('group-selected')
    expect(ctxCode).toContain('그룹 만들기')
    expect(ctxCode).toContain('그룹 해제')
  })

  test('AC6-4: group 타입 노드에 대한 context-menu 분기', () => {
    const ctxCode = fs.readFileSync(
      path.join(projectRoot, 'packages/app/src/components/nexus/context-menu.tsx'),
      'utf8',
    )
    expect(ctxCode).toContain("nodeType === 'group'")
    expect(ctxCode).toContain('ungroup')
  })
})

describe('QA AC #1 보완: 프론트엔드 canvas_mcp_update 핸들러', () => {
  test('AC1-FE-1: nexus.tsx에 canvas_mcp_update WebSocket 핸들러 존재', () => {
    const nexusCode = fs.readFileSync(
      path.join(projectRoot, 'packages/app/src/pages/nexus.tsx'),
      'utf8',
    )
    expect(nexusCode).toContain("'canvas_mcp_update'")
    expect(nexusCode).toContain('mermaidToCanvas(msg.mermaid)')
    // 즉시 적용 (setNodes/setEdges 직접 호출)
    expect(nexusCode).toContain('setNodes(mcpNodes)')
    expect(nexusCode).toContain('setEdges(mcpEdges)')
  })

  test('AC1-FE-2: Undo 스택에 이전 상태 저장', () => {
    const nexusCode = fs.readFileSync(
      path.join(projectRoot, 'packages/app/src/pages/nexus.tsx'),
      'utf8',
    )
    // canvas_mcp_update 핸들러 내에 undo stack push
    const mcpSection = nexusCode.slice(nexusCode.indexOf("'canvas_mcp_update'"))
    expect(mcpSection).toContain('setUndoStack')
    expect(mcpSection).toContain('nodesRef.current')
  })
})
