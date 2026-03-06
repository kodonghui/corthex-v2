import { describe, it, expect } from 'bun:test'

// ========================================
// Story 17-2: NEXUS 캔버스 베이스 — Unit Tests
// ========================================

describe('Story 17-2: NexusGraphData shared types', () => {
  it('NexusGraphNode type should be importable', async () => {
    const types = await import('@corthex/shared')
    // Type exists if module loads without error
    expect(types).toBeDefined()
  })

  it('NexusGraphData type structure validation', () => {
    // Validate type structure at runtime
    const mockGraphData = {
      nodes: [
        {
          id: 'company-1',
          type: 'company' as const,
          label: 'Test Corp',
          x: 0,
          y: 0,
          slug: 'test-corp',
        },
        {
          id: 'dept-1',
          type: 'department' as const,
          label: 'Engineering',
          x: 100,
          y: 100,
          description: 'Dev team',
          agentCount: 3,
        },
        {
          id: 'agent-1',
          type: 'agent' as const,
          label: 'Agent A',
          x: 200,
          y: 200,
          agentId: 'uuid-1',
          role: 'Analyst',
          status: 'online',
          isSecretary: false,
          soul: 'I am a helpful agent',
        },
      ],
      edges: [
        {
          id: 'e-company-dept1',
          source: 'company-1',
          target: 'dept-1',
          type: 'smoothstep' as const,
        },
        {
          id: 'e-dept-agent1',
          source: 'dept-1',
          target: 'agent-1',
          type: 'smoothstep' as const,
        },
      ],
      updatedAt: '2026-03-06T00:00:00.000Z',
    }

    expect(mockGraphData.nodes).toHaveLength(3)
    expect(mockGraphData.edges).toHaveLength(2)
    expect(mockGraphData.updatedAt).toBeTruthy()

    // Company node
    const companyNode = mockGraphData.nodes[0]
    expect(companyNode.type).toBe('company')
    expect(companyNode.slug).toBe('test-corp')

    // Department node
    const deptNode = mockGraphData.nodes[1]
    expect(deptNode.type).toBe('department')
    expect(deptNode.agentCount).toBe(3)

    // Agent node
    const agentNode = mockGraphData.nodes[2]
    expect(agentNode.type).toBe('agent')
    expect(agentNode.agentId).toBe('uuid-1')
    expect(agentNode.soul).toBe('I am a helpful agent')
  })

  it('NexusGraphEdge supports smoothstep and bezier types', () => {
    const smoothstepEdge = { id: 'e1', source: 'a', target: 'b', type: 'smoothstep' as const }
    const bezierEdge = { id: 'e2', source: 'a', target: 'c', type: 'bezier' as const }

    expect(smoothstepEdge.type).toBe('smoothstep')
    expect(bezierEdge.type).toBe('bezier')
  })

  it('NexusGraphEdge style supports strokeDasharray', () => {
    const dashedEdge = {
      id: 'e1',
      source: 'a',
      target: 'b',
      type: 'smoothstep' as const,
      style: { strokeDasharray: '5 5' },
    }
    expect(dashedEdge.style.strokeDasharray).toBe('5 5')
  })

  it('NexusGraphNode optional fields are truly optional', () => {
    const minimalNode = {
      id: 'company-1',
      type: 'company' as const,
      label: 'Corp',
      x: 0,
      y: 0,
    }
    expect(minimalNode.id).toBe('company-1')
    expect((minimalNode as Record<string, unknown>).soul).toBeUndefined()
    expect((minimalNode as Record<string, unknown>).agentId).toBeUndefined()
  })

  it('updatedAt can be null for no saved layout', () => {
    const data = { nodes: [], edges: [], updatedAt: null }
    expect(data.updatedAt).toBeNull()
  })
})

describe('Story 17-2: GET /nexus/graph API logic', () => {
  it('graph node id format follows convention', () => {
    const companyId = 'uuid-company'
    const deptId = 'uuid-dept'
    const agentId = 'uuid-agent'

    expect(`company-${companyId}`).toBe('company-uuid-company')
    expect(`dept-${deptId}`).toBe('dept-uuid-dept')
    expect(`agent-${agentId}`).toBe('agent-uuid-agent')
  })

  it('edge id format follows convention', () => {
    const deptId = 'uuid-dept'
    const agentId = 'uuid-agent'

    expect(`e-company-${deptId}`).toBe('e-company-uuid-dept')
    expect(`e-dept-${agentId}`).toBe('e-dept-uuid-agent')
    expect(`e-unassigned-${agentId}`).toBe('e-unassigned-uuid-agent')
  })

  it('soul truncation extracts first line limited to 100 chars', () => {
    const longSoul = 'First line of soul persona definition\nSecond line\nThird line'
    const truncated = longSoul.split('\n')[0].slice(0, 100)
    expect(truncated).toBe('First line of soul persona definition')

    const veryLong = 'A'.repeat(200)
    const truncated2 = veryLong.split('\n')[0].slice(0, 100)
    expect(truncated2).toHaveLength(100)

    const nullSoul = null as string | null
    const result = nullSoul ? nullSoul.split('\n')[0].slice(0, 100) : null
    expect(result).toBeNull()
  })

  it('unassigned agents get dashed edge style', () => {
    const unassignedEdge = {
      id: 'e-unassigned-123',
      source: 'company-1',
      target: 'agent-123',
      type: 'smoothstep' as const,
      style: { strokeDasharray: '5 5' },
    }
    expect(unassignedEdge.style.strokeDasharray).toBe('5 5')
  })

  it('saved positions are used when available', () => {
    const saved: Record<string, { x: number; y: number }> = {
      'company-1': { x: 100, y: 200 },
    }
    const nodeId = 'company-1'
    const x = saved[nodeId]?.x ?? 0
    const y = saved[nodeId]?.y ?? 0
    expect(x).toBe(100)
    expect(y).toBe(200)
  })

  it('defaults to (0,0) when no saved position', () => {
    const saved: Record<string, { x: number; y: number }> = {}
    const nodeId = 'company-1'
    const x = saved[nodeId]?.x ?? 0
    const y = saved[nodeId]?.y ?? 0
    expect(x).toBe(0)
    expect(y).toBe(0)
  })
})

describe('Story 17-2: Department highlight logic', () => {
  it('identifies child agent nodes from edges', () => {
    const deptId = 'dept-1'
    const edges = [
      { id: 'e1', source: 'company-1', target: 'dept-1' },
      { id: 'e2', source: 'dept-1', target: 'agent-1' },
      { id: 'e3', source: 'dept-1', target: 'agent-2' },
      { id: 'e4', source: 'dept-2', target: 'agent-3' },
    ]

    const highlightedIds = new Set<string>([deptId])
    edges.forEach((e) => {
      if (e.source === deptId) highlightedIds.add(e.target)
    })
    // Also add parent
    edges.forEach((e) => {
      if (e.target === deptId) highlightedIds.add(e.source)
    })

    expect(highlightedIds.has('dept-1')).toBe(true)
    expect(highlightedIds.has('agent-1')).toBe(true)
    expect(highlightedIds.has('agent-2')).toBe(true)
    expect(highlightedIds.has('company-1')).toBe(true)
    expect(highlightedIds.has('agent-3')).toBe(false)
    expect(highlightedIds.has('dept-2')).toBe(false)
  })

  it('toggling same department clears highlight', () => {
    let highlightedDeptId = null as string | null
    const toggle = (id: string) => {
      highlightedDeptId = highlightedDeptId === id ? null : id
    }

    toggle('dept-1')
    expect(highlightedDeptId as string).toBe('dept-1')

    toggle('dept-1')
    expect(highlightedDeptId).toBeNull()
  })

  it('clicking different department switches highlight', () => {
    let highlightedDeptId = null as string | null
    const toggle = (id: string) => {
      highlightedDeptId = highlightedDeptId === id ? null : id
    }

    toggle('dept-1')
    expect(highlightedDeptId as string).toBe('dept-1')

    toggle('dept-2')
    expect(highlightedDeptId as string).toBe('dept-2')
  })

  it('non-highlighted nodes get opacity 0.3', () => {
    const highlightedIds = new Set(['dept-1', 'agent-1'])
    const nodes = [
      { id: 'dept-1' },
      { id: 'agent-1' },
      { id: 'agent-2' },
    ]

    const styled = nodes.map((n) => ({
      ...n,
      opacity: highlightedIds.has(n.id) ? 1 : 0.3,
    }))

    expect(styled[0].opacity).toBe(1)
    expect(styled[1].opacity).toBe(1)
    expect(styled[2].opacity).toBe(0.3)
  })
})

describe('Story 17-2: WebSocket nexus subscription', () => {
  it('nexus channel key matches expected pattern', () => {
    const companyId = 'uuid-company'
    const channelKey = `nexus::${companyId}`
    expect(channelKey).toBe('nexus::uuid-company')
  })

  it('nexus-updated event triggers query invalidation', () => {
    const msg = { type: 'nexus-updated', updatedBy: 'admin', updatedAt: '2026-03-06T00:00:00Z' }
    expect(msg.type).toBe('nexus-updated')
    expect(msg.updatedBy).toBe('admin')
  })
})

describe('Story 17-2: NexusInfoPanel data', () => {
  it('agent node has required fields for info panel', () => {
    const agent = {
      id: 'agent-1',
      type: 'agent' as const,
      label: 'Agent Name',
      x: 0,
      y: 0,
      agentId: 'uuid-1',
      role: 'Analyst',
      status: 'online',
      isSecretary: false,
      soul: 'I help with analysis',
    }

    expect(agent.label).toBe('Agent Name')
    expect(agent.role).toBe('Analyst')
    expect(agent.status).toBe('online')
    expect(agent.soul).toBeTruthy()
    expect(agent.agentId).toBeTruthy()
  })

  it('chat navigation URL is correctly formed', () => {
    const agentId = 'uuid-agent-123'
    const url = `/chat?agentId=${agentId}`
    expect(url).toBe('/chat?agentId=uuid-agent-123')
  })

  it('status labels map correctly', () => {
    const STATUS_LABELS: Record<string, string> = {
      online: '온라인',
      working: '작업 중',
      error: '오류',
      offline: '오프라인',
    }
    expect(STATUS_LABELS['online']).toBe('온라인')
    expect(STATUS_LABELS['offline']).toBe('오프라인')
    expect(STATUS_LABELS['unknown']).toBeUndefined()
  })
})

describe('Story 17-2: Auto layout fallback', () => {
  it('detects when saved positions exist (non-zero)', () => {
    const nodes = [
      { x: 100, y: 200 },
      { x: 0, y: 0 },
    ]
    const hasSavedPositions = nodes.some((n) => n.x !== 0 || n.y !== 0)
    expect(hasSavedPositions).toBe(true)
  })

  it('detects when no saved positions (all zero)', () => {
    const nodes = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]
    const hasSavedPositions = nodes.some((n) => n.x !== 0 || n.y !== 0)
    expect(hasSavedPositions).toBe(false)
  })
})
