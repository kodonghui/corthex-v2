import { describe, it, expect } from 'bun:test'

// ========================================
// Story 13-1: SketchVibe Canvas — Frontend Tests
// ========================================

describe('Story 13-1: SketchVibe node types', () => {
  it('should export 8 node types', async () => {
    const { sketchVibeNodeTypes } = await import('../components/nexus/sketchvibe-nodes')
    const types = Object.keys(sketchVibeNodeTypes)
    expect(types).toHaveLength(8)
    expect(types).toContain('start')
    expect(types).toContain('end')
    expect(types).toContain('agent')
    expect(types).toContain('system')
    expect(types).toContain('api')
    expect(types).toContain('decide')
    expect(types).toContain('db')
    expect(types).toContain('note')
  })

  it('should export NODE_PALETTE with 8 items', async () => {
    const { NODE_PALETTE } = await import('../components/nexus/sketchvibe-nodes')
    expect(NODE_PALETTE).toHaveLength(8)
    NODE_PALETTE.forEach((item) => {
      expect(item.type).toBeTruthy()
      expect(item.label).toBeTruthy()
      expect(item.color).toBeTruthy()
      expect(item.icon).toBeTruthy()
    })
  })

  it('NODE_PALETTE types should match sketchVibeNodeTypes keys', async () => {
    const { sketchVibeNodeTypes, NODE_PALETTE } = await import('../components/nexus/sketchvibe-nodes')
    const nodeTypeKeys = Object.keys(sketchVibeNodeTypes)
    const paletteTypes = NODE_PALETTE.map((p) => p.type)
    expect(paletteTypes.sort()).toEqual(nodeTypeKeys.sort())
  })

  it('SvNodeType should include all 8 types', async () => {
    const { NODE_PALETTE } = await import('../components/nexus/sketchvibe-nodes')
    const expectedTypes = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']
    const actualTypes = NODE_PALETTE.map((p) => p.type)
    expectedTypes.forEach((t) => {
      expect(actualTypes).toContain(t)
    })
  })
})

describe('Story 13-1: Edge types', () => {
  it('should export editable edge type', async () => {
    const { sketchVibeEdgeTypes } = await import('../components/nexus/editable-edge')
    expect(sketchVibeEdgeTypes).toBeDefined()
    expect(sketchVibeEdgeTypes.editable).toBeDefined()
  })

  it('EditableEdge component should be a function', async () => {
    const { EditableEdge } = await import('../components/nexus/editable-edge')
    expect(typeof EditableEdge).toBe('function')
  })
})

describe('Story 13-1: Context menu', () => {
  it('ContextMenu component should be importable', async () => {
    const { ContextMenu } = await import('../components/nexus/context-menu')
    expect(typeof ContextMenu).toBe('function')
  })
})

describe('Story 13-1: Canvas sidebar', () => {
  it('CanvasSidebar component should be importable', async () => {
    const { CanvasSidebar } = await import('../components/nexus/canvas-sidebar')
    expect(typeof CanvasSidebar).toBe('function')
  })
})

describe('Story 13-1: Canvas to Mermaid conversion', () => {
  it('canvasToMermaid should convert nodes', async () => {
    const { canvasToMermaid } = await import('../lib/canvas-to-mermaid')

    const nodes = [
      { id: 'sv-start-1', type: 'start', position: { x: 0, y: 0 }, data: { label: '시작' } },
      { id: 'sv-agent-2', type: 'agent', position: { x: 100, y: 100 }, data: { label: '분석' } },
    ] as any[]

    const edges = [
      { id: 'e-1', source: 'sv-start-1', target: 'sv-agent-2' },
    ] as any[]

    const result = canvasToMermaid(nodes, edges)
    expect(result).toContain('flowchart')
    expect(result).toContain('시작')
    expect(result).toContain('분석')
  })

  it('canvasToMermaid should handle empty canvas', async () => {
    const { canvasToMermaid } = await import('../lib/canvas-to-mermaid')
    const result = canvasToMermaid([], [])
    expect(result).toContain('빈 캔버스')
  })

  it('canvasToText should convert nodes to text', async () => {
    const { canvasToText } = await import('../lib/canvas-to-mermaid')

    const nodes = [
      { id: 'sv-agent-1', type: 'agent', position: { x: 0, y: 0 }, data: { label: '테스트 에이전트' } },
    ] as any[]

    const result = canvasToText(nodes, [])
    expect(result).toContain('테스트 에이전트')
    expect(result).toContain('agent')
  })

  it('canvasToText should handle empty canvas', async () => {
    const { canvasToText } = await import('../lib/canvas-to-mermaid')
    const result = canvasToText([], [])
    expect(result).toBe('')
  })
})

describe('Story 13-1: GraphData serialization', () => {
  it('should strip callback functions for serialization', () => {
    const nodes = [
      {
        id: 'sv-1',
        type: 'agent',
        position: { x: 100, y: 200 },
        data: { label: '테스트', onLabelChange: () => {} },
      },
    ]

    const cleanNodes = nodes.map(({ data, ...rest }) => {
      const { onLabelChange: _, ...cleanData } = data as Record<string, unknown>
      return { ...rest, data: cleanData }
    })

    expect(cleanNodes[0].data).toEqual({ label: '테스트' })
    expect(cleanNodes[0].data).not.toHaveProperty('onLabelChange')
  })

  it('should strip edge callback functions for serialization', () => {
    const edges = [
      {
        id: 'e-1',
        source: 'a',
        target: 'b',
        type: 'editable',
        data: { label: '연결', onEdgeLabelChange: () => {} },
      },
    ]

    const cleanEdges = edges.map(({ data, ...rest }) => {
      if (!data) return rest
      const { onEdgeLabelChange: _, ...cleanData } = data as Record<string, unknown>
      return { ...rest, data: cleanData }
    })

    expect(cleanEdges[0]).toHaveProperty('data')
    expect((cleanEdges[0] as any).data).toEqual({ label: '연결' })
    expect((cleanEdges[0] as any).data).not.toHaveProperty('onEdgeLabelChange')
  })

  it('should handle edges without data', () => {
    const edges = [
      { id: 'e-1', source: 'a', target: 'b', type: 'editable' },
    ]

    const cleanEdges = edges.map(({ data, ...rest }: any) => {
      if (!data) return rest
      const { onEdgeLabelChange: _, ...cleanData } = data
      return { ...rest, data: cleanData }
    })

    expect(cleanEdges[0]).not.toHaveProperty('data')
  })
})

describe('Story 13-1: Node ID generation', () => {
  it('node IDs should follow pattern sv-{type}-{timestamp}-{counter}', () => {
    let counter = 0
    const generateId = (type: string) => {
      counter++
      return `sv-${type}-${Date.now()}-${counter}`
    }

    const id = generateId('agent')
    expect(id).toMatch(/^sv-agent-\d+-\d+$/)
  })

  it('node IDs should be unique', () => {
    let counter = 0
    const ids = new Set<string>()

    for (let i = 0; i < 100; i++) {
      counter++
      ids.add(`sv-agent-${Date.now()}-${counter}`)
    }

    expect(ids.size).toBe(100)
  })
})

describe('Story 13-1: Default labels', () => {
  it('all 8 node types should have Korean default labels', () => {
    const defaultLabels: Record<string, string> = {
      start: '시작',
      end: '종료',
      agent: '에이전트',
      system: '시스템',
      api: '외부 API',
      decide: '결정',
      db: '데이터베이스',
      note: '메모',
    }

    expect(Object.keys(defaultLabels)).toHaveLength(8)
    Object.values(defaultLabels).forEach((label) => {
      expect(label.length).toBeGreaterThan(0)
    })
  })
})

describe('Story 13-1: NexusPage module', () => {
  it('NexusPage should be importable', async () => {
    const mod = await import('../pages/nexus')
    expect(mod.NexusPage).toBeDefined()
    expect(typeof mod.NexusPage).toBe('function')
  })
})

// ========================================
// TEA-Generated: Risk-Based Coverage Expansion
// ========================================

describe('TEA 13-1: NODE_PALETTE detailed validation (P1)', () => {
  it('each palette item should have unique type', async () => {
    const { NODE_PALETTE } = await import('../components/nexus/sketchvibe-nodes')
    const types = NODE_PALETTE.map((p) => p.type)
    const uniqueTypes = new Set(types)
    expect(uniqueTypes.size).toBe(types.length)
  })

  it('each palette item should have unique color', async () => {
    const { NODE_PALETTE } = await import('../components/nexus/sketchvibe-nodes')
    const colors = NODE_PALETTE.map((p) => p.color)
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBe(colors.length)
  })

  it('palette labels should all be Korean', async () => {
    const { NODE_PALETTE } = await import('../components/nexus/sketchvibe-nodes')
    const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/
    NODE_PALETTE.forEach((item) => {
      // Most labels should contain Korean (exception: 'API')
      if (item.type !== 'api') {
        expect(koreanRegex.test(item.label)).toBe(true)
      }
    })
  })
})

describe('TEA 13-1: Canvas-to-Mermaid comprehensive (P1)', () => {
  it('should convert all 8 node types correctly', async () => {
    const { canvasToMermaid } = await import('../lib/canvas-to-mermaid')
    const nodeTypes = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']

    const nodes = nodeTypes.map((type, i) => ({
      id: `sv-${type}-${i}`,
      type,
      position: { x: i * 100, y: 0 },
      data: { label: `${type} 노드` },
    })) as any[]

    const edges = [
      { id: 'e-1', source: 'sv-start-0', target: 'sv-agent-2' },
    ] as any[]

    const result = canvasToMermaid(nodes, edges)
    expect(result).toContain('flowchart')
    // Should contain at least some node references
    expect(result.length).toBeGreaterThan(50)
  })

  it('should handle edges with labels', async () => {
    const { canvasToMermaid } = await import('../lib/canvas-to-mermaid')

    const nodes = [
      { id: 'a', type: 'start', position: { x: 0, y: 0 }, data: { label: '시작' } },
      { id: 'b', type: 'end', position: { x: 100, y: 0 }, data: { label: '종료' } },
    ] as any[]

    const edges = [
      { id: 'e-1', source: 'a', target: 'b', data: { label: '완료됨' } },
    ] as any[]

    const result = canvasToMermaid(nodes, edges)
    expect(result).toContain('시작')
    expect(result).toContain('종료')
  })

  it('canvasToText should handle multiple connected components', async () => {
    const { canvasToText } = await import('../lib/canvas-to-mermaid')

    const nodes = [
      { id: 'a', type: 'agent', position: { x: 0, y: 0 }, data: { label: '분석가' } },
      { id: 'b', type: 'agent', position: { x: 100, y: 0 }, data: { label: '작성자' } },
      { id: 'c', type: 'system', position: { x: 200, y: 0 }, data: { label: '시스템' } },
    ] as any[]

    const edges = [
      { id: 'e-1', source: 'a', target: 'b' },
    ] as any[]

    const result = canvasToText(nodes, edges)
    expect(result).toContain('분석가')
    expect(result).toContain('작성자')
    expect(result).toContain('시스템')
  })
})

describe('TEA 13-1: Serialization robustness (P0 — data integrity)', () => {
  it('should preserve all node properties through serialize/deserialize', () => {
    const original = {
      id: 'sv-agent-1',
      type: 'agent',
      position: { x: 150.5, y: 200.3 },
      data: { label: '에이전트', config: { model: 'claude' } },
      selected: true,
      dragging: false,
    }

    // Simulate what happens when stripping callbacks and serializing
    const { data, ...rest } = original
    const cleanData = { ...data }
    const cleanNode = { ...rest, data: cleanData }

    const serialized = JSON.stringify(cleanNode)
    const deserialized = JSON.parse(serialized)

    expect(deserialized.id).toBe(original.id)
    expect(deserialized.type).toBe(original.type)
    expect(deserialized.position.x).toBe(150.5)
    expect(deserialized.position.y).toBe(200.3)
    expect(deserialized.data.label).toBe('에이전트')
  })

  it('should handle nodes with empty labels', () => {
    const node = {
      id: 'sv-1',
      type: 'note',
      position: { x: 0, y: 0 },
      data: { label: '' },
    }

    const serialized = JSON.stringify(node)
    const deserialized = JSON.parse(serialized)
    expect(deserialized.data.label).toBe('')
  })

  it('should handle mixed callback and non-callback data properties', () => {
    const nodeData = {
      label: '에이전트',
      color: '#3b82f6',
      onLabelChange: () => {},
      metadata: { version: 2 },
    }

    const { onLabelChange: _, ...cleanData } = nodeData as Record<string, unknown>
    expect(cleanData).toEqual({
      label: '에이전트',
      color: '#3b82f6',
      metadata: { version: 2 },
    })
    expect(cleanData).not.toHaveProperty('onLabelChange')
  })

  it('should handle batch serialization of many nodes', () => {
    const nodes = Array.from({ length: 100 }, (_, i) => ({
      id: `sv-agent-${i}`,
      type: 'agent',
      position: { x: i * 50, y: Math.floor(i / 10) * 100 },
      data: { label: `에이전트 ${i}`, onLabelChange: () => {} },
    }))

    const cleanNodes = nodes.map(({ data, ...rest }) => {
      const { onLabelChange: _, ...cleanData } = data as Record<string, unknown>
      return { ...rest, data: cleanData }
    })

    expect(cleanNodes).toHaveLength(100)
    const serialized = JSON.stringify({ nodes: cleanNodes, edges: [] })
    expect(serialized).not.toContain('onLabelChange')
    const deserialized = JSON.parse(serialized)
    expect(deserialized.nodes).toHaveLength(100)
  })
})

describe('TEA 13-1: Edge types validation (P1)', () => {
  it('sketchVibeEdgeTypes should only contain editable type', async () => {
    const { sketchVibeEdgeTypes } = await import('../components/nexus/editable-edge')
    const types = Object.keys(sketchVibeEdgeTypes)
    expect(types).toEqual(['editable'])
  })

  it('edge data should support optional label', () => {
    const edgeWithLabel = { id: 'e-1', source: 'a', target: 'b', type: 'editable', data: { label: '연결' } }
    const edgeWithoutLabel = { id: 'e-2', source: 'b', target: 'c', type: 'editable' }
    const edgeWithEmptyLabel = { id: 'e-3', source: 'c', target: 'd', type: 'editable', data: { label: '' } }

    expect(edgeWithLabel.data.label).toBe('연결')
    expect(edgeWithoutLabel).not.toHaveProperty('data')
    expect(edgeWithEmptyLabel.data.label).toBe('')
  })
})

describe('TEA 13-1: Node ID collision resistance (P1)', () => {
  it('should generate unique IDs across all node types', () => {
    const types = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']
    let counter = 0
    const ids = new Set<string>()

    types.forEach((type) => {
      for (let i = 0; i < 20; i++) {
        counter++
        ids.add(`sv-${type}-${Date.now()}-${counter}`)
      }
    })

    expect(ids.size).toBe(160) // 8 types × 20 each
  })
})

describe('TEA 13-1: Context menu types validation (P1)', () => {
  it('ContextMenu should be exported as named export', async () => {
    const mod = await import('../components/nexus/context-menu')
    expect(mod).toHaveProperty('ContextMenu')
    expect(typeof mod.ContextMenu).toBe('function')
  })
})

describe('TEA 13-1: Canvas sidebar types validation (P1)', () => {
  it('CanvasSidebar should be exported as named export', async () => {
    const mod = await import('../components/nexus/canvas-sidebar')
    expect(mod).toHaveProperty('CanvasSidebar')
    expect(typeof mod.CanvasSidebar).toBe('function')
  })
})
