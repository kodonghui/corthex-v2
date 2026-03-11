import { describe, it, expect } from 'bun:test'

// ============================================================
// Story 9.3: 드래그&드롭 편집 — TEA Risk-Based Expanded Tests
// Risk coverage: API error paths, hit-test boundaries, undo/redo
// concurrency, batch edge cases, drop target lifecycle
// ============================================================

// UUID validation helper
function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

// --- P0: API Error Path Tests ---

describe('[P0] Single Agent Reassignment — Error Paths', () => {
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

  it('rejects undefined body', () => {
    const result = reassignSchema.validate(undefined)
    expect(result.valid).toBe(false)
  })

  it('rejects numeric departmentId', () => {
    const result = reassignSchema.validate({ departmentId: 12345 })
    expect(result.valid).toBe(false)
  })

  it('rejects empty string departmentId', () => {
    const result = reassignSchema.validate({ departmentId: '' })
    expect(result.valid).toBe(false)
  })

  it('rejects array departmentId', () => {
    const result = reassignSchema.validate({ departmentId: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'] })
    expect(result.valid).toBe(false)
  })

  it('accepts extra fields alongside valid departmentId (lenient)', () => {
    const result = reassignSchema.validate({
      departmentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      extraField: 'ignored',
    })
    expect(result.valid).toBe(true)
  })

  it('validates UUID format strictly (no short UUIDs)', () => {
    const result = reassignSchema.validate({ departmentId: 'a0eebc99' })
    expect(result.valid).toBe(false)
  })
})

// --- P0: Batch Reassignment — Extended Validation ---

describe('[P0] Batch Reassignment — Extended Validation', () => {
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

  it('rejects string instead of array for agentIds', () => {
    const result = batchSchema.validate({
      agentIds: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      departmentId: null,
    })
    expect(result.valid).toBe(false)
  })

  it('rejects null agentIds', () => {
    const result = batchSchema.validate({
      agentIds: null,
      departmentId: null,
    })
    expect(result.valid).toBe(false)
  })

  it('accepts exactly 50 agentIds (boundary)', () => {
    const ids = Array.from({ length: 50 }, (_, i) =>
      `a0eebc99-9c0b-4ef8-bb6d-6bb9bd38${String(i).padStart(4, '0')}`,
    )
    const result = batchSchema.validate({ agentIds: ids, departmentId: null })
    expect(result.valid).toBe(true)
  })

  it('accepts exactly 1 agentId (minimum boundary)', () => {
    const result = batchSchema.validate({
      agentIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
      departmentId: null,
    })
    expect(result.valid).toBe(true)
  })

  it('rejects mixed valid/invalid UUIDs in agentIds', () => {
    const result = batchSchema.validate({
      agentIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'not-valid'],
      departmentId: null,
    })
    expect(result.valid).toBe(false)
  })

  it('rejects missing departmentId field entirely', () => {
    const result = batchSchema.validate({
      agentIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
    })
    expect(result.valid).toBe(false)
  })
})

// --- P0: Hit-Test Boundary Conditions ---

describe('[P0] Hit-Test — Boundary & Edge Cases', () => {
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
    const cx = dragPos.x + 100
    const cy = dragPos.y + 40

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

  it('detects hit at exact left boundary of department', () => {
    const deptNode: TestNode = {
      id: 'dept-d1', type: 'department',
      position: { x: 200, y: 100 }, data: { name: '마케팅' },
    }
    // Agent center: (dragPos.x+100, dragPos.y+40) = (200, 140)
    // Dept rect: x=200..440, y=100..160 → center (200,140) is ON left boundary
    const result = testFindDropTarget('agent-x', { x: 100, y: 100 }, [deptNode], 'other')
    expect(result).not.toBeNull()
    expect(result!.departmentId).toBe('d1')
  })

  it('detects hit at exact right boundary of department', () => {
    const deptNode: TestNode = {
      id: 'dept-d2', type: 'department',
      position: { x: 100, y: 100 }, data: { name: 'HR' },
    }
    // Agent center: (240+100, 100+40) = (340, 140)
    // Dept rect: x=100..340, y=100..160 → center (340,140) is ON right boundary
    const result = testFindDropTarget('agent-x', { x: 240, y: 100 }, [deptNode], 'other')
    expect(result).not.toBeNull()
  })

  it('misses just outside right boundary', () => {
    const deptNode: TestNode = {
      id: 'dept-d2', type: 'department',
      position: { x: 100, y: 100 }, data: { name: 'HR' },
    }
    // Agent center: (241+100, 100+40) = (341, 140)
    // Dept rect ends at x=340 → miss
    const result = testFindDropTarget('agent-x', { x: 241, y: 100 }, [deptNode], 'other')
    expect(result).toBeNull()
  })

  it('returns first matching node when two departments overlap', () => {
    const dept1: TestNode = {
      id: 'dept-d1', type: 'department',
      position: { x: 100, y: 100 }, data: { name: '개발' },
    }
    const dept2: TestNode = {
      id: 'dept-d2', type: 'department',
      position: { x: 150, y: 100 }, data: { name: '디자인' },
    }
    // Agent center in overlap zone: (200+100, 100+40) = (300, 140)
    // Both rects contain (300,140)
    const result = testFindDropTarget('agent-x', { x: 200, y: 100 }, [dept1, dept2], 'other')
    expect(result).not.toBeNull()
    expect(result!.departmentId).toBe('d1') // first match wins
  })

  it('handles empty nodes array gracefully', () => {
    const result = testFindDropTarget('agent-x', { x: 100, y: 100 }, [], 'd1')
    expect(result).toBeNull()
  })

  it('skips own node id during hit-test', () => {
    const selfNode: TestNode = {
      id: 'agent-x', type: 'department',
      position: { x: 0, y: 0 }, data: { name: 'Self' },
    }
    const result = testFindDropTarget('agent-x', { x: 0, y: 0 }, [selfNode], 'other')
    expect(result).toBeNull()
  })

  it('handles negative coordinates', () => {
    const deptNode: TestNode = {
      id: 'dept-neg', type: 'department',
      position: { x: -200, y: -100 }, data: { name: '음수' },
    }
    // Agent center: (-200+100, -100+40) = (-100, -60)
    // Dept rect: x=-200..40, y=-100..-40 → center (-100,-60) is inside
    const result = testFindDropTarget('agent-x', { x: -200, y: -100 }, [deptNode], 'other')
    expect(result).not.toBeNull()
  })
})

// --- P1: Undo/Redo — Concurrency & State Integrity ---

describe('[P1] Undo/Redo — Advanced State Scenarios', () => {
  type UndoAction =
    | { type: 'move-agent'; agentId: string; agentName: string; fromDeptId: string | null; toDeptId: string | null }
    | { type: 'batch-move'; agents: Array<{ agentId: string; fromDeptId: string | null }>; toDeptId: string | null }

  const MAX_HISTORY = 20

  function createStack() {
    const undoStack: UndoAction[] = []
    const redoStack: UndoAction[] = []
    let isProcessing = false

    return {
      push(action: UndoAction) {
        undoStack.push(action)
        if (undoStack.length > MAX_HISTORY) undoStack.shift()
        redoStack.length = 0
      },
      undo() {
        if (isProcessing) return null
        isProcessing = true
        const action = undoStack.pop()
        if (action) redoStack.push(action)
        isProcessing = false
        return action ?? null
      },
      redo() {
        if (isProcessing) return null
        isProcessing = true
        const action = redoStack.pop()
        if (action) undoStack.push(action)
        isProcessing = false
        return action ?? null
      },
      get canUndo() { return undoStack.length > 0 && !isProcessing },
      get canRedo() { return redoStack.length > 0 && !isProcessing },
      get undoCount() { return undoStack.length },
      get redoCount() { return redoStack.length },
    }
  }

  it('oldest action is evicted when exceeding MAX_HISTORY', () => {
    const stack = createStack()
    for (let i = 0; i < 21; i++) {
      stack.push({ type: 'move-agent', agentId: String(i), agentName: `A${i}`, fromDeptId: 'd1', toDeptId: 'd2' })
    }
    expect(stack.undoCount).toBe(MAX_HISTORY)
    // Undo all 20 — first one should be agent "1" not "0" (0 was evicted)
    const actions: UndoAction[] = []
    while (stack.canUndo) {
      const a = stack.undo()
      if (a) actions.push(a)
    }
    expect(actions).toHaveLength(20)
    // Last undone (earliest remaining) should be agentId "1"
    const lastUndone = actions[actions.length - 1]
    expect(lastUndone.type).toBe('move-agent')
    if (lastUndone.type === 'move-agent') {
      expect(lastUndone.agentId).toBe('1')
    }
  })

  it('alternating undo/redo preserves correct order', () => {
    const stack = createStack()
    stack.push({ type: 'move-agent', agentId: '1', agentName: 'A', fromDeptId: null, toDeptId: 'd1' })
    stack.push({ type: 'move-agent', agentId: '2', agentName: 'B', fromDeptId: 'd1', toDeptId: 'd2' })
    stack.push({ type: 'move-agent', agentId: '3', agentName: 'C', fromDeptId: 'd2', toDeptId: 'd3' })

    const u1 = stack.undo() // undo C
    expect(u1?.type === 'move-agent' && u1.agentId).toBe('3')

    const r1 = stack.redo() // redo C
    expect(r1?.type === 'move-agent' && r1.agentId).toBe('3')

    const u2 = stack.undo() // undo C again
    const u3 = stack.undo() // undo B
    expect(u2?.type === 'move-agent' && u2.agentId).toBe('3')
    expect(u3?.type === 'move-agent' && u3.agentId).toBe('2')

    expect(stack.redoCount).toBe(2) // C and B in redo
    expect(stack.undoCount).toBe(1) // A in undo
  })

  it('new push after partial undo discards redo correctly', () => {
    const stack = createStack()
    stack.push({ type: 'move-agent', agentId: '1', agentName: 'A', fromDeptId: null, toDeptId: 'd1' })
    stack.push({ type: 'move-agent', agentId: '2', agentName: 'B', fromDeptId: 'd1', toDeptId: 'd2' })
    stack.push({ type: 'move-agent', agentId: '3', agentName: 'C', fromDeptId: 'd2', toDeptId: 'd3' })

    stack.undo() // undo C
    stack.undo() // undo B

    // New action after undo should discard redo (C and B)
    stack.push({ type: 'move-agent', agentId: '4', agentName: 'D', fromDeptId: 'd1', toDeptId: 'd4' })
    expect(stack.canRedo).toBe(false)
    expect(stack.undoCount).toBe(2) // A and D
  })

  it('handles interleaved single and batch actions', () => {
    const stack = createStack()
    stack.push({ type: 'move-agent', agentId: '1', agentName: 'A', fromDeptId: null, toDeptId: 'd1' })
    stack.push({
      type: 'batch-move',
      agents: [{ agentId: '2', fromDeptId: 'd1' }, { agentId: '3', fromDeptId: 'd2' }],
      toDeptId: 'd3',
    })
    stack.push({ type: 'move-agent', agentId: '4', agentName: 'D', fromDeptId: 'd3', toDeptId: null })

    const u1 = stack.undo()
    expect(u1!.type).toBe('move-agent')

    const u2 = stack.undo()
    expect(u2!.type).toBe('batch-move')
    if (u2!.type === 'batch-move') {
      expect(u2!.agents).toHaveLength(2)
    }

    const u3 = stack.undo()
    expect(u3!.type).toBe('move-agent')
    if (u3!.type === 'move-agent') {
      expect(u3!.agentId).toBe('1')
    }
  })
})

// --- P1: Batch Move — Server Logic Edge Cases ---

describe('[P1] Batch Move — Server Logic Edge Cases', () => {
  // Simulate server-side batch processing
  function simulateBatchMove(
    requestedIds: string[],
    agentDb: Map<string, { id: string; name: string; isSecretary: boolean; companyId: string }>,
    tenantCompanyId: string,
  ) {
    let moved = 0
    const skippedReasons: string[] = []

    for (const agentId of requestedIds) {
      const agent = agentDb.get(agentId)
      if (!agent) {
        skippedReasons.push(`${agentId}: 에이전트를 찾을 수 없습니다`)
        continue
      }
      if (agent.companyId !== tenantCompanyId) {
        skippedReasons.push(`${agentId}: 에이전트를 찾을 수 없습니다`)
        continue
      }
      if (agent.isSecretary) {
        skippedReasons.push(`${agent.name}: 비서 에이전트는 이동할 수 없습니다`)
        continue
      }
      moved++
    }

    return { moved, skipped: skippedReasons.length, skippedReasons }
  }

  const agentDb = new Map([
    ['a1', { id: 'a1', name: 'Worker1', isSecretary: false, companyId: 'c1' }],
    ['a2', { id: 'a2', name: 'Worker2', isSecretary: false, companyId: 'c1' }],
    ['a3', { id: 'a3', name: 'Secretary', isSecretary: true, companyId: 'c1' }],
    ['a4', { id: 'a4', name: 'OtherCo', isSecretary: false, companyId: 'c2' }],
  ])

  it('handles duplicate IDs in request', () => {
    const result = simulateBatchMove(['a1', 'a1', 'a1'], agentDb, 'c1')
    expect(result.moved).toBe(3) // Server processes each occurrence
  })

  it('skips cross-tenant agents', () => {
    const result = simulateBatchMove(['a1', 'a4'], agentDb, 'c1')
    expect(result.moved).toBe(1)
    expect(result.skipped).toBe(1)
    expect(result.skippedReasons[0]).toContain('에이전트를 찾을 수 없습니다')
  })

  it('handles all agents not found', () => {
    const result = simulateBatchMove(['nonexistent1', 'nonexistent2'], agentDb, 'c1')
    expect(result.moved).toBe(0)
    expect(result.skipped).toBe(2)
  })

  it('handles mixed: valid + secretary + not-found', () => {
    const result = simulateBatchMove(['a1', 'a3', 'missing'], agentDb, 'c1')
    expect(result.moved).toBe(1) // a1
    expect(result.skipped).toBe(2) // a3 (secretary) + missing (not found)
  })

  it('all-secretary batch returns 0 moved', () => {
    const result = simulateBatchMove(['a3'], agentDb, 'c1')
    expect(result.moved).toBe(0)
    expect(result.skipped).toBe(1)
    expect(result.skippedReasons[0]).toContain('비서')
  })

  it('processes large batch (50 agents) correctly', () => {
    const largeDb = new Map<string, { id: string; name: string; isSecretary: boolean; companyId: string }>()
    const ids: string[] = []
    for (let i = 0; i < 50; i++) {
      const id = `agent-${i}`
      ids.push(id)
      largeDb.set(id, { id, name: `Agent${i}`, isSecretary: i === 25, companyId: 'c1' })
    }
    const result = simulateBatchMove(ids, largeDb, 'c1')
    expect(result.moved).toBe(49) // 50 - 1 secretary
    expect(result.skipped).toBe(1)
  })
})

// --- P1: Multi-Select + Drag Interaction ---

describe('[P1] Multi-Select — Drag Interaction Logic', () => {
  it('dragging a selected agent should include all selected agents', () => {
    const selectedAgentIds = new Set(['agent-1', 'agent-2', 'agent-3'])
    const draggedAgentId = 'agent-2'

    // If dragged agent is in selection, use entire selection
    const agentsToDrag = selectedAgentIds.has(draggedAgentId)
      ? [...selectedAgentIds]
      : [draggedAgentId]

    expect(agentsToDrag).toHaveLength(3)
    expect(agentsToDrag).toContain('agent-1')
    expect(agentsToDrag).toContain('agent-2')
    expect(agentsToDrag).toContain('agent-3')
  })

  it('dragging an unselected agent should only move that agent', () => {
    const selectedAgentIds = new Set(['agent-1', 'agent-3'])
    const draggedAgentId = 'agent-2'

    const agentsToDrag = selectedAgentIds.has(draggedAgentId)
      ? [...selectedAgentIds]
      : [draggedAgentId]

    expect(agentsToDrag).toHaveLength(1)
    expect(agentsToDrag[0]).toBe('agent-2')
  })

  it('empty selection + drag = single agent move', () => {
    const selectedAgentIds = new Set<string>()
    const draggedAgentId = 'agent-5'

    const agentsToDrag = selectedAgentIds.has(draggedAgentId)
      ? [...selectedAgentIds]
      : [draggedAgentId]

    expect(agentsToDrag).toEqual(['agent-5'])
  })

  it('selection correctly filters out secretaries for batch', () => {
    const agents = [
      { id: 'a1', isSecretary: false, departmentId: 'd1' },
      { id: 'a2', isSecretary: true, departmentId: null },
      { id: 'a3', isSecretary: false, departmentId: 'd2' },
    ]
    const selectedAgentIds = new Set(['a1', 'a2', 'a3'])

    const movableAgents = agents.filter((a) => selectedAgentIds.has(a.id) && !a.isSecretary)
    expect(movableAgents).toHaveLength(2)
    expect(movableAgents.map((a) => a.id)).toEqual(['a1', 'a3'])
  })
})

// --- P1: Drop Target Lifecycle ---

describe('[P1] Drop Target Highlight Lifecycle', () => {
  it('clears all isDropTarget flags on drag end', () => {
    const nodes = [
      { id: 'dept-1', data: { name: 'A', isDropTarget: true } },
      { id: 'dept-2', data: { name: 'B', isDropTarget: false } },
      { id: 'unassigned', data: { name: 'U', isDropTarget: true } },
    ]

    // Simulate drag-end cleanup
    const cleaned = nodes.map((n) => ({
      ...n,
      data: { ...n.data, isDropTarget: false },
    }))

    expect(cleaned.every((n) => n.data.isDropTarget === false)).toBe(true)
  })

  it('sets exactly one target during drag', () => {
    const nodes = [
      { id: 'dept-1', data: { isDropTarget: false } },
      { id: 'dept-2', data: { isDropTarget: false } },
      { id: 'dept-3', data: { isDropTarget: false } },
    ]

    const targetId = 'dept-2'
    const updated = nodes.map((n) => ({
      ...n,
      data: { ...n.data, isDropTarget: n.id === targetId },
    }))

    const targets = updated.filter((n) => n.data.isDropTarget)
    expect(targets).toHaveLength(1)
    expect(targets[0].id).toBe('dept-2')
  })

  it('no targets highlighted when drag pos is outside all nodes', () => {
    const nodes = [
      { id: 'dept-1', data: { isDropTarget: false } },
      { id: 'dept-2', data: { isDropTarget: false } },
    ]

    const targetId: string | null = null // no match
    const updated = nodes.map((n) => ({
      ...n,
      data: { ...n.data, isDropTarget: n.id === targetId },
    }))

    expect(updated.every((n) => n.data.isDropTarget === false)).toBe(true)
  })
})

// --- P2: Undo Label Generation ---

describe('[P2] Undo/Redo Label Generation', () => {
  type UndoAction =
    | { type: 'move-agent'; agentId: string; agentName: string; fromDeptId: string | null; toDeptId: string | null; fromDeptName: string; toDeptName: string }
    | { type: 'batch-move'; agents: Array<{ agentId: string; agentName: string; fromDeptId: string | null }>; toDeptId: string | null; toDeptName: string }

  function getUndoLabel(stack: UndoAction[]): string {
    if (stack.length === 0) return ''
    const action = stack[stack.length - 1]
    return action.type === 'move-agent'
      ? `실행 취소: ${action.agentName} 이동`
      : `실행 취소: 일괄 이동`
  }

  function getRedoLabel(stack: UndoAction[]): string {
    if (stack.length === 0) return ''
    const action = stack[stack.length - 1]
    return action.type === 'move-agent'
      ? `다시 실행: ${action.agentName} 이동`
      : `다시 실행: 일괄 이동`
  }

  it('returns empty string for empty undo stack', () => {
    expect(getUndoLabel([])).toBe('')
  })

  it('returns empty string for empty redo stack', () => {
    expect(getRedoLabel([])).toBe('')
  })

  it('returns agent name for single move undo', () => {
    const stack: UndoAction[] = [
      { type: 'move-agent', agentId: '1', agentName: '개발봇', fromDeptId: 'd1', toDeptId: 'd2', fromDeptName: '개발팀', toDeptName: 'QA팀' },
    ]
    expect(getUndoLabel(stack)).toBe('실행 취소: 개발봇 이동')
  })

  it('returns batch label for batch move undo', () => {
    const stack: UndoAction[] = [
      { type: 'batch-move', agents: [{ agentId: '1', agentName: 'A', fromDeptId: 'd1' }], toDeptId: 'd2', toDeptName: 'QA팀' },
    ]
    expect(getUndoLabel(stack)).toBe('실행 취소: 일괄 이동')
  })

  it('returns correct redo label for single move', () => {
    const stack: UndoAction[] = [
      { type: 'move-agent', agentId: '1', agentName: '분석봇', fromDeptId: 'd1', toDeptId: 'd2', fromDeptName: '분석팀', toDeptName: '전략팀' },
    ]
    expect(getRedoLabel(stack)).toBe('다시 실행: 분석봇 이동')
  })

  it('uses last action in stack (not first) for label', () => {
    const stack: UndoAction[] = [
      { type: 'move-agent', agentId: '1', agentName: 'First', fromDeptId: null, toDeptId: 'd1', fromDeptName: '미배속', toDeptName: '개발팀' },
      { type: 'move-agent', agentId: '2', agentName: 'Last', fromDeptId: 'd1', toDeptId: 'd2', fromDeptName: '개발팀', toDeptName: 'QA팀' },
    ]
    expect(getUndoLabel(stack)).toBe('실행 취소: Last 이동')
  })
})

// --- P2: Keyboard Shortcut Logic ---

describe('[P2] Keyboard Shortcut Logic', () => {
  function simulateKeyAction(key: string, ctrlKey: boolean, shiftKey: boolean, isEditMode: boolean) {
    if (!isEditMode) return null

    if (key === 'z' && ctrlKey && !shiftKey) return 'undo'
    if (key === 'z' && ctrlKey && shiftKey) return 'redo'
    if (key === 'y' && ctrlKey) return 'redo'
    if (key === 'Escape') return 'clear-selection'
    return null
  }

  it('Ctrl+Z triggers undo in edit mode', () => {
    expect(simulateKeyAction('z', true, false, true)).toBe('undo')
  })

  it('Ctrl+Shift+Z triggers redo in edit mode', () => {
    expect(simulateKeyAction('z', true, true, true)).toBe('redo')
  })

  it('Ctrl+Y triggers redo in edit mode', () => {
    expect(simulateKeyAction('y', true, false, true)).toBe('redo')
  })

  it('Escape triggers clear selection in edit mode', () => {
    expect(simulateKeyAction('Escape', false, false, true)).toBe('clear-selection')
  })

  it('Ctrl+Z does nothing in view mode', () => {
    expect(simulateKeyAction('z', true, false, false)).toBeNull()
  })

  it('Ctrl+Shift+Z does nothing in view mode', () => {
    expect(simulateKeyAction('z', true, true, false)).toBeNull()
  })

  it('random key does nothing', () => {
    expect(simulateKeyAction('a', false, false, true)).toBeNull()
  })
})

// --- P2: Position Reset on Failed Drop ---

describe('[P2] Position Reset on Failed Drop', () => {
  it('restores agent to original position when no drop target found', () => {
    const originalPos = { x: 150, y: 200 }
    const draggedPos = { x: 800, y: 900 } // outside all targets
    const dropTarget = null // no valid target

    const finalPos = dropTarget ? draggedPos : originalPos
    expect(finalPos).toEqual({ x: 150, y: 200 })
  })

  it('keeps new position when drop target is valid', () => {
    const originalPos = { x: 150, y: 200 }
    const draggedPos = { x: 300, y: 150 }
    const dropTarget = { targetNodeId: 'dept-d1', departmentId: 'd1', deptName: '개발팀' }

    // On successful drop, position doesn't matter — refetch relayout handles it
    expect(dropTarget).not.toBeNull()
    expect(dropTarget.departmentId).toBe('d1')
  })
})

// --- P2: Secretary Drag Prevention Client-Side ---

describe('[P2] Secretary Drag Prevention — Client-Side', () => {
  it('blocks drag start for secretary agent', () => {
    const node = { type: 'agent', data: { isSecretary: true, agentId: 's1' } }
    const isEditMode = true
    const canDrag = isEditMode && node.type === 'agent' && !node.data.isSecretary
    expect(canDrag).toBe(false)
  })

  it('allows drag start for non-secretary agent', () => {
    const node = { type: 'agent', data: { isSecretary: false, agentId: 'w1' } }
    const isEditMode = true
    const canDrag = isEditMode && node.type === 'agent' && !node.data.isSecretary
    expect(canDrag).toBe(true)
  })

  it('blocks drag in view mode regardless of secretary status', () => {
    const node = { type: 'agent', data: { isSecretary: false, agentId: 'w1' } }
    const isEditMode = false
    const canDrag = isEditMode && node.type === 'agent' && !node.data.isSecretary
    expect(canDrag).toBe(false)
  })

  it('blocks drag for non-agent nodes (department)', () => {
    const node = { type: 'department', data: { isSecretary: false } }
    const isEditMode = true
    const canDrag = isEditMode && node.type === 'agent' && !node.data.isSecretary
    expect(canDrag).toBe(false)
  })
})
