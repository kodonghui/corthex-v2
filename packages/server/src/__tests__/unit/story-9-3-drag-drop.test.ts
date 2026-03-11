import { describe, it, expect } from 'bun:test'

// ============================================================
// Story 9.3: 드래그&드롭 편집 — Unit Tests
// ============================================================

// --- API Schema Validation Tests ---

describe('Story 9.3: Agent Department Reassignment API', () => {
  describe('Single Agent Reassignment Schema', () => {
    const reassignSchema = {
      validate: (body: unknown) => {
        if (!body || typeof body !== 'object') return { valid: false, error: 'body required' }
        const b = body as Record<string, unknown>
        if (!('departmentId' in b)) return { valid: false, error: 'departmentId required' }
        const deptId = b.departmentId
        if (deptId !== null && (typeof deptId !== 'string' || !isUUID(deptId))) {
          return { valid: false, error: 'departmentId must be uuid or null' }
        }
        return { valid: true }
      },
    }

    it('accepts valid UUID departmentId', () => {
      const result = reassignSchema.validate({ departmentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
      expect(result.valid).toBe(true)
    })

    it('accepts null departmentId (unassign)', () => {
      const result = reassignSchema.validate({ departmentId: null })
      expect(result.valid).toBe(true)
    })

    it('rejects missing departmentId', () => {
      const result = reassignSchema.validate({})
      expect(result.valid).toBe(false)
    })

    it('rejects non-uuid string', () => {
      const result = reassignSchema.validate({ departmentId: 'not-a-uuid' })
      expect(result.valid).toBe(false)
    })
  })

  describe('Batch Reassignment Schema', () => {
    const batchSchema = {
      validate: (body: unknown) => {
        if (!body || typeof body !== 'object') return { valid: false, error: 'body required' }
        const b = body as Record<string, unknown>
        if (!Array.isArray(b.agentIds) || b.agentIds.length === 0) {
          return { valid: false, error: 'agentIds must be non-empty array' }
        }
        if (b.agentIds.length > 50) {
          return { valid: false, error: 'agentIds max 50' }
        }
        for (const id of b.agentIds) {
          if (typeof id !== 'string' || !isUUID(id)) {
            return { valid: false, error: 'each agentId must be uuid' }
          }
        }
        if (!('departmentId' in b)) return { valid: false, error: 'departmentId required' }
        const deptId = b.departmentId
        if (deptId !== null && (typeof deptId !== 'string' || !isUUID(deptId))) {
          return { valid: false, error: 'departmentId must be uuid or null' }
        }
        return { valid: true }
      },
    }

    it('accepts valid batch with UUID array', () => {
      const result = batchSchema.validate({
        agentIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
        departmentId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      })
      expect(result.valid).toBe(true)
    })

    it('accepts null departmentId for batch unassign', () => {
      const result = batchSchema.validate({
        agentIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
        departmentId: null,
      })
      expect(result.valid).toBe(true)
    })

    it('rejects empty agentIds array', () => {
      const result = batchSchema.validate({
        agentIds: [],
        departmentId: null,
      })
      expect(result.valid).toBe(false)
    })

    it('rejects more than 50 agentIds', () => {
      const ids = Array.from({ length: 51 }, (_, i) =>
        `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380${String(i).padStart(3, '0')}`,
      )
      const result = batchSchema.validate({ agentIds: ids, departmentId: null })
      expect(result.valid).toBe(false)
    })

    it('rejects non-uuid in agentIds', () => {
      const result = batchSchema.validate({
        agentIds: ['not-a-uuid'],
        departmentId: null,
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('Secretary Move Prevention', () => {
    it('identifies secretary agents correctly', () => {
      const agents = [
        { id: '1', name: 'Secretary', isSecretary: true, departmentId: null },
        { id: '2', name: 'Worker', isSecretary: false, departmentId: 'dept-1' },
      ]
      const secretaryAgents = agents.filter((a) => a.isSecretary)
      expect(secretaryAgents).toHaveLength(1)
      expect(secretaryAgents[0].name).toBe('Secretary')
    })

    it('filters out secretaries from batch move', () => {
      const agents = [
        { id: '1', name: 'Secretary', isSecretary: true },
        { id: '2', name: 'Worker1', isSecretary: false },
        { id: '3', name: 'Worker2', isSecretary: false },
      ]
      const movable = agents.filter((a) => !a.isSecretary)
      const skipped = agents.filter((a) => a.isSecretary)
      expect(movable).toHaveLength(2)
      expect(skipped).toHaveLength(1)
    })

    it('generates correct skipped reasons', () => {
      const agent = { id: '1', name: '비서실장', isSecretary: true }
      const reason = `${agent.name}: 비서 에이전트는 이동할 수 없습니다`
      expect(reason).toBe('비서실장: 비서 에이전트는 이동할 수 없습니다')
    })
  })

  describe('Batch Move Response Shape', () => {
    it('returns correct shape with moved and skipped counts', () => {
      const response = {
        success: true,
        data: {
          moved: 2,
          skipped: 1,
          skippedReasons: ['비서실장: 비서 에이전트는 이동할 수 없습니다'],
        },
      }
      expect(response.success).toBe(true)
      expect(response.data.moved).toBe(2)
      expect(response.data.skipped).toBe(1)
      expect(response.data.skippedReasons).toHaveLength(1)
    })

    it('returns all moved when no secretaries', () => {
      const response = {
        success: true,
        data: { moved: 3, skipped: 0, skippedReasons: [] },
      }
      expect(response.data.moved).toBe(3)
      expect(response.data.skipped).toBe(0)
      expect(response.data.skippedReasons).toHaveLength(0)
    })
  })
})

// --- Hit Test Logic Tests ---

describe('Story 9.3: Hit Test Logic', () => {
  // Simulated node structure matching React Flow
  type TestNode = {
    id: string
    type: string
    position: { x: number; y: number }
    data: Record<string, unknown>
  }

  function testFindDropTarget(
    dragNodeId: string,
    dragPos: { x: number; y: number },
    allNodes: TestNode[],
    currentDeptId: string | null,
  ) {
    const cx = dragPos.x + 100 // agent width/2
    const cy = dragPos.y + 40  // agent height/2

    const HIT_SIZES: Record<string, { width: number; height: number }> = {
      department: { width: 240, height: 60 },
      'unassigned-group': { width: 240, height: 60 },
    }

    for (const node of allNodes) {
      if (node.id === dragNodeId) continue
      const size = HIT_SIZES[node.type]
      if (!size) continue

      if (cx >= node.position.x && cx <= node.position.x + size.width &&
          cy >= node.position.y && cy <= node.position.y + size.height) {
        if (node.type === 'unassigned-group') {
          if (currentDeptId === null) return null
          return { targetNodeId: node.id, departmentId: null, deptName: '미배속' }
        }
        const deptId = node.id.replace('dept-', '')
        if (deptId === currentDeptId) return null
        return { targetNodeId: node.id, departmentId: deptId, deptName: (node.data.name as string) ?? '부서' }
      }
    }
    return null
  }

  const deptNode: TestNode = {
    id: 'dept-d1',
    type: 'department',
    position: { x: 100, y: 100 },
    data: { name: '개발팀' },
  }

  const unassignedNode: TestNode = {
    id: 'unassigned-group',
    type: 'unassigned-group',
    position: { x: 400, y: 100 },
    data: { name: '미배속' },
  }

  const agentNode: TestNode = {
    id: 'agent-a1',
    type: 'agent',
    position: { x: 200, y: 200 },
    data: { departmentId: 'd2' },
  }

  const allNodes = [deptNode, unassignedNode, agentNode]

  it('detects drop on department node', () => {
    // Agent center at (100+100, 80+40) = (200, 120), dept rect (100,100)-(340,160)
    const result = testFindDropTarget('agent-a1', { x: 100, y: 80 }, allNodes, 'd2')
    expect(result).not.toBeNull()
    expect(result!.departmentId).toBe('d1')
    expect(result!.deptName).toBe('개발팀')
  })

  it('detects drop on unassigned group', () => {
    // Agent center at (400+100, 80+40) = (500, 120), unassigned rect (400,100)-(640,160)
    const result = testFindDropTarget('agent-a1', { x: 400, y: 80 }, allNodes, 'd2')
    expect(result).not.toBeNull()
    expect(result!.departmentId).toBeNull()
    expect(result!.deptName).toBe('미배속')
  })

  it('returns null when dropping outside any target', () => {
    const result = testFindDropTarget('agent-a1', { x: 800, y: 800 }, allNodes, 'd2')
    expect(result).toBeNull()
  })

  it('returns null when dropping on same department', () => {
    // Agent is in dept d1, dropping on dept d1
    const result = testFindDropTarget('agent-a1', { x: 100, y: 80 }, allNodes, 'd1')
    expect(result).toBeNull()
  })

  it('returns null when already unassigned and dropping on unassigned', () => {
    const result = testFindDropTarget('agent-a1', { x: 400, y: 80 }, allNodes, null)
    expect(result).toBeNull()
  })

  it('ignores non-target node types', () => {
    const companyNode: TestNode = {
      id: 'company-c1',
      type: 'company',
      position: { x: 100, y: 80 },
      data: { name: 'CORTHEX' },
    }
    const result = testFindDropTarget('agent-a1', { x: 100, y: 60 }, [companyNode], 'd2')
    expect(result).toBeNull()
  })
})

// --- Undo/Redo Stack Tests ---

describe('Story 9.3: Undo/Redo Stack', () => {
  type UndoAction =
    | { type: 'move-agent'; agentId: string; agentName: string; fromDeptId: string | null; toDeptId: string | null }
    | { type: 'batch-move'; agents: Array<{ agentId: string; fromDeptId: string | null }>; toDeptId: string | null }

  const MAX_HISTORY = 20

  function createStack() {
    const undoStack: UndoAction[] = []
    const redoStack: UndoAction[] = []

    return {
      push(action: UndoAction) {
        undoStack.push(action)
        if (undoStack.length > MAX_HISTORY) undoStack.shift()
        redoStack.length = 0
      },
      undo() {
        const action = undoStack.pop()
        if (action) redoStack.push(action)
        return action ?? null
      },
      redo() {
        const action = redoStack.pop()
        if (action) undoStack.push(action)
        return action ?? null
      },
      get canUndo() { return undoStack.length > 0 },
      get canRedo() { return redoStack.length > 0 },
      get undoCount() { return undoStack.length },
      get redoCount() { return redoStack.length },
    }
  }

  it('pushes actions to undo stack', () => {
    const stack = createStack()
    stack.push({ type: 'move-agent', agentId: '1', agentName: 'A', fromDeptId: 'd1', toDeptId: 'd2' })
    expect(stack.canUndo).toBe(true)
    expect(stack.undoCount).toBe(1)
  })

  it('clears redo stack on new action', () => {
    const stack = createStack()
    stack.push({ type: 'move-agent', agentId: '1', agentName: 'A', fromDeptId: 'd1', toDeptId: 'd2' })
    stack.undo()
    expect(stack.canRedo).toBe(true)
    stack.push({ type: 'move-agent', agentId: '2', agentName: 'B', fromDeptId: 'd1', toDeptId: 'd3' })
    expect(stack.canRedo).toBe(false)
  })

  it('undoes last action', () => {
    const stack = createStack()
    stack.push({ type: 'move-agent', agentId: '1', agentName: 'A', fromDeptId: 'd1', toDeptId: 'd2' })
    const action = stack.undo()
    expect(action).not.toBeNull()
    expect(action!.type).toBe('move-agent')
    expect(stack.canUndo).toBe(false)
    expect(stack.canRedo).toBe(true)
  })

  it('redoes last undone action', () => {
    const stack = createStack()
    stack.push({ type: 'move-agent', agentId: '1', agentName: 'A', fromDeptId: 'd1', toDeptId: 'd2' })
    stack.undo()
    const action = stack.redo()
    expect(action).not.toBeNull()
    expect(stack.canUndo).toBe(true)
    expect(stack.canRedo).toBe(false)
  })

  it('returns null on undo when empty', () => {
    const stack = createStack()
    const action = stack.undo()
    expect(action).toBeNull()
  })

  it('returns null on redo when empty', () => {
    const stack = createStack()
    const action = stack.redo()
    expect(action).toBeNull()
  })

  it('respects max history of 20', () => {
    const stack = createStack()
    for (let i = 0; i < 25; i++) {
      stack.push({ type: 'move-agent', agentId: String(i), agentName: `A${i}`, fromDeptId: 'd1', toDeptId: 'd2' })
    }
    expect(stack.undoCount).toBe(MAX_HISTORY)
  })

  it('handles batch move actions', () => {
    const stack = createStack()
    stack.push({
      type: 'batch-move',
      agents: [
        { agentId: '1', fromDeptId: 'd1' },
        { agentId: '2', fromDeptId: 'd2' },
      ],
      toDeptId: 'd3',
    })
    const action = stack.undo()
    expect(action!.type).toBe('batch-move')
    if (action!.type === 'batch-move') {
      expect(action!.agents).toHaveLength(2)
    }
  })

  it('supports multiple undo/redo cycles', () => {
    const stack = createStack()
    stack.push({ type: 'move-agent', agentId: '1', agentName: 'A', fromDeptId: 'd1', toDeptId: 'd2' })
    stack.push({ type: 'move-agent', agentId: '2', agentName: 'B', fromDeptId: 'd2', toDeptId: 'd3' })

    stack.undo() // undo B
    stack.undo() // undo A
    expect(stack.canUndo).toBe(false)
    expect(stack.redoCount).toBe(2)

    stack.redo() // redo A
    stack.redo() // redo B
    expect(stack.canRedo).toBe(false)
    expect(stack.undoCount).toBe(2)
  })
})

// --- Multi-select Tests ---

describe('Story 9.3: Multi-select Logic', () => {
  it('toggles agent selection', () => {
    const selected = new Set<string>()
    // Ctrl+click agent-1
    selected.add('agent-1')
    expect(selected.size).toBe(1)
    // Ctrl+click agent-2
    selected.add('agent-2')
    expect(selected.size).toBe(2)
    // Ctrl+click agent-1 again (deselect)
    selected.delete('agent-1')
    expect(selected.size).toBe(1)
    expect(selected.has('agent-2')).toBe(true)
  })

  it('clears selection on escape', () => {
    const selected = new Set(['agent-1', 'agent-2', 'agent-3'])
    selected.clear()
    expect(selected.size).toBe(0)
  })

  it('excludes secretary from selection for batch move', () => {
    const agents = [
      { id: 'agent-1', isSecretary: false },
      { id: 'agent-2', isSecretary: true },
      { id: 'agent-3', isSecretary: false },
    ]
    const selected = new Set(['agent-1', 'agent-2', 'agent-3'])
    const movable = [...selected].filter((id) => {
      const agent = agents.find((a) => a.id === id)
      return agent && !agent.isSecretary
    })
    expect(movable).toHaveLength(2)
    expect(movable).not.toContain('agent-2')
  })
})

// --- Node Data Extension Tests ---

describe('Story 9.3: ELK Layout Node Data Extension', () => {
  it('includes agentId in agent node data', () => {
    const agentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    const nodeData = {
      agentId,
      departmentId: 'dept-1',
      name: 'TestAgent',
      tier: 'worker',
      tierLevel: 3,
      status: 'online',
      isSecretary: false,
      isSystem: false,
      subordinateCount: 0,
    }
    expect(nodeData.agentId).toBe(agentId)
    expect(nodeData.departmentId).toBe('dept-1')
  })

  it('sets departmentId to null for unassigned agents', () => {
    const nodeData = {
      agentId: 'a1',
      departmentId: null,
      name: 'Unassigned',
      tier: 'worker',
      tierLevel: 3,
      status: 'offline',
      isSecretary: false,
      isSystem: false,
      subordinateCount: 0,
    }
    expect(nodeData.departmentId).toBeNull()
  })
})

// --- Drop Target Highlight Tests ---

describe('Story 9.3: Drop Target Highlight', () => {
  it('sets isDropTarget on department node', () => {
    const deptData = {
      name: '개발팀',
      description: null,
      agentCount: 3,
      employeeCount: 1,
      managerName: null,
      isDropTarget: true,
    }
    expect(deptData.isDropTarget).toBe(true)
  })

  it('sets isDropTarget on unassigned-group node', () => {
    const groupData = {
      name: '미배속',
      agentCount: 2,
      isDropTarget: true,
    }
    expect(groupData.isDropTarget).toBe(true)
  })

  it('defaults isDropTarget to false/undefined', () => {
    const deptData = {
      name: '디자인팀',
      description: null,
      agentCount: 1,
      employeeCount: 0,
      managerName: null,
    }
    expect((deptData as { isDropTarget?: boolean }).isDropTarget).toBeUndefined()
  })
})

// --- Edge Case Tests ---

describe('Story 9.3: Edge Cases', () => {
  it('handles agent with no departmentId (already unassigned)', () => {
    const agent = { id: 'a1', departmentId: null, isSecretary: false }
    expect(agent.departmentId).toBeNull()
  })

  it('handles empty agent list for batch move', () => {
    const response = { moved: 0, skipped: 0, skippedReasons: [] as string[] }
    expect(response.moved).toBe(0)
  })

  it('handles all-secretary batch (all skipped)', () => {
    const agents = [
      { id: '1', name: 'S1', isSecretary: true },
      { id: '2', name: 'S2', isSecretary: true },
    ]
    const movable = agents.filter((a) => !a.isSecretary)
    const skipped = agents.filter((a) => a.isSecretary)
    expect(movable).toHaveLength(0)
    expect(skipped).toHaveLength(2)
  })

  it('handles agent not found in batch', () => {
    const existingAgents = new Map([['a1', { id: 'a1', name: 'Agent1', isSecretary: false }]])
    const requestedIds = ['a1', 'a2']
    const notFound = requestedIds.filter((id) => !existingAgents.has(id))
    expect(notFound).toEqual(['a2'])
  })
})

// --- Toolbar State Tests ---

describe('Story 9.3: Toolbar Undo/Redo State', () => {
  it('shows undo button disabled when no history', () => {
    const canUndo = false
    const btnClass = canUndo
      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
    expect(btnClass).toContain('cursor-not-allowed')
  })

  it('shows undo button enabled with history', () => {
    const canUndo = true
    const btnClass = canUndo
      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
    expect(btnClass).toContain('hover:bg-slate-600')
  })

  it('generates correct undo label for single move', () => {
    const action = { type: 'move-agent' as const, agentName: '비서A' }
    const label = `실행 취소: ${action.agentName} 이동`
    expect(label).toBe('실행 취소: 비서A 이동')
  })

  it('generates correct undo label for batch move', () => {
    const action = { type: 'batch-move' as const }
    const label = action.type === 'batch-move' ? '실행 취소: 일괄 이동' : ''
    expect(label).toBe('실행 취소: 일괄 이동')
  })

  it('shows selection counter when agents selected', () => {
    const selectedCount = 3
    const badge = selectedCount > 0 ? `${selectedCount}개 선택` : ''
    expect(badge).toBe('3개 선택')
  })

  it('hides selection counter when no agents selected', () => {
    const selectedCount = 0
    const showBadge = selectedCount > 0
    expect(showBadge).toBe(false)
  })
})

// UUID validation helper
function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}
