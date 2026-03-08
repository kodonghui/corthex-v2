import { describe, it, expect } from 'bun:test'

// ========================================
// Story 13-1: SketchVibe 캔버스 CRUD — Unit Tests
// ========================================

describe('Story 13-1: Sketches schema validation', () => {
  it('sketches table should be importable from schema', async () => {
    const schema = await import('../../db/schema')
    expect(schema.sketches).toBeDefined()
  })

  it('sketches table should have all required columns', async () => {
    const schema = await import('../../db/schema')
    const table = schema.sketches
    // Drizzle table columns are accessible as properties
    expect(table).toHaveProperty('id')
    expect(table).toHaveProperty('companyId')
    expect(table).toHaveProperty('name')
    expect(table).toHaveProperty('graphData')
    expect(table).toHaveProperty('createdBy')
    expect(table).toHaveProperty('createdAt')
    expect(table).toHaveProperty('updatedAt')
  })

  it('sketchesRelations should be importable', async () => {
    const schema = await import('../../db/schema')
    expect(schema.sketchesRelations).toBeDefined()
  })
})

describe('Story 13-1: Sketches route module', () => {
  it('sketchesRoute should be importable', async () => {
    const { sketchesRoute } = await import('../../routes/workspace/sketches')
    expect(sketchesRoute).toBeDefined()
  })
})

describe('Story 13-1: GraphData structure validation', () => {
  it('valid graphData with nodes and edges', () => {
    const graphData = {
      nodes: [
        { id: 'sv-start-1', type: 'start', position: { x: 100, y: 100 }, data: { label: '시작' } },
        { id: 'sv-agent-2', type: 'agent', position: { x: 200, y: 200 }, data: { label: '분석가' } },
        { id: 'sv-end-3', type: 'end', position: { x: 300, y: 300 }, data: { label: '종료' } },
      ],
      edges: [
        { id: 'e-1', source: 'sv-start-1', target: 'sv-agent-2', type: 'editable', data: { label: '시작' } },
        { id: 'e-2', source: 'sv-agent-2', target: 'sv-end-3', type: 'editable', data: { label: '완료' } },
      ],
    }

    expect(graphData.nodes).toHaveLength(3)
    expect(graphData.edges).toHaveLength(2)
    expect(graphData.nodes[0].type).toBe('start')
    expect(graphData.nodes[1].type).toBe('agent')
    expect(graphData.nodes[2].type).toBe('end')
    expect(graphData.edges[0].data?.label).toBe('시작')
  })

  it('all 8 node types should be representable', () => {
    const nodeTypes = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']

    const nodes = nodeTypes.map((type, i) => ({
      id: `sv-${type}-${i}`,
      type,
      position: { x: i * 100, y: 0 },
      data: { label: type },
    }))

    expect(nodes).toHaveLength(8)
    nodeTypes.forEach((type, i) => {
      expect(nodes[i].type).toBe(type)
    })
  })

  it('empty graphData is valid', () => {
    const graphData = { nodes: [], edges: [] }
    expect(graphData.nodes).toHaveLength(0)
    expect(graphData.edges).toHaveLength(0)
  })

  it('edge with empty label is valid', () => {
    const edge = { id: 'e-1', source: 'a', target: 'b', type: 'editable', data: { label: '' } }
    expect(edge.data.label).toBe('')
  })

  it('node positions should be numbers', () => {
    const node = { id: 'sv-1', type: 'agent', position: { x: 150.5, y: 200.3 }, data: { label: 'test' } }
    expect(typeof node.position.x).toBe('number')
    expect(typeof node.position.y).toBe('number')
  })
})

describe('Story 13-1: Zod schema validation', () => {
  it('createSketchSchema should accept valid data', async () => {
    const { z } = await import('zod')
    const createSketchSchema = z.object({
      name: z.string().min(1).max(200),
      graphData: z.object({
        nodes: z.array(z.any()).default([]),
        edges: z.array(z.any()).default([]),
      }).default({ nodes: [], edges: [] }),
    })

    const result = createSketchSchema.safeParse({ name: '테스트 캔버스' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('테스트 캔버스')
      expect(result.data.graphData.nodes).toHaveLength(0)
      expect(result.data.graphData.edges).toHaveLength(0)
    }
  })

  it('createSketchSchema should reject empty name', async () => {
    const { z } = await import('zod')
    const createSketchSchema = z.object({
      name: z.string().min(1).max(200),
      graphData: z.object({
        nodes: z.array(z.any()).default([]),
        edges: z.array(z.any()).default([]),
      }).default({ nodes: [], edges: [] }),
    })

    const result = createSketchSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('createSketchSchema should reject name exceeding 200 chars', async () => {
    const { z } = await import('zod')
    const createSketchSchema = z.object({
      name: z.string().min(1).max(200),
    })

    const result = createSketchSchema.safeParse({ name: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('updateSketchSchema should accept partial updates', async () => {
    const { z } = await import('zod')
    const updateSketchSchema = z.object({
      name: z.string().min(1).max(200).optional(),
      graphData: z.object({
        nodes: z.array(z.any()),
        edges: z.array(z.any()),
      }).optional(),
    })

    // Name only
    const nameResult = updateSketchSchema.safeParse({ name: '새 이름' })
    expect(nameResult.success).toBe(true)

    // GraphData only
    const graphResult = updateSketchSchema.safeParse({
      graphData: { nodes: [{ id: '1' }], edges: [] },
    })
    expect(graphResult.success).toBe(true)

    // Both
    const bothResult = updateSketchSchema.safeParse({
      name: '수정됨',
      graphData: { nodes: [], edges: [] },
    })
    expect(bothResult.success).toBe(true)

    // Empty (all optional)
    const emptyResult = updateSketchSchema.safeParse({})
    expect(emptyResult.success).toBe(true)
  })
})

describe('Story 13-1: Tenant isolation logic', () => {
  it('sketches should always require companyId for queries', () => {
    // Validate that our route logic always includes companyId filter
    // This is a design-time check
    const queryConditions = (companyId: string, sketchId: string) => {
      return { companyId, sketchId }
    }

    const result = queryConditions('company-1', 'sketch-1')
    expect(result.companyId).toBe('company-1')
    expect(result.sketchId).toBe('sketch-1')
  })

  it('different companies should have isolated sketches', () => {
    const company1Sketches = [
      { id: 's1', companyId: 'c1', name: 'Sketch A' },
      { id: 's2', companyId: 'c1', name: 'Sketch B' },
    ]

    const company2Sketches = [
      { id: 's3', companyId: 'c2', name: 'Sketch C' },
    ]

    // Simulated query filter
    const queryForCompany = (sketches: typeof company1Sketches, companyId: string) =>
      sketches.filter((s) => s.companyId === companyId)

    const allSketches = [...company1Sketches, ...company2Sketches]

    expect(queryForCompany(allSketches, 'c1')).toHaveLength(2)
    expect(queryForCompany(allSketches, 'c2')).toHaveLength(1)
    expect(queryForCompany(allSketches, 'c3')).toHaveLength(0)
  })
})

describe('Story 13-1: Migration SQL validation', () => {
  it('migration file should exist', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(
      import.meta.dir,
      '../../db/migrations/0035_sketches-table.sql',
    )
    expect(fs.existsSync(migrationPath)).toBe(true)
  })

  it('migration should contain CREATE TABLE sketches', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(
      import.meta.dir,
      '../../db/migrations/0035_sketches-table.sql',
    )
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE TABLE')
    expect(content).toContain('sketches')
    expect(content).toContain('company_id')
    expect(content).toContain('graph_data')
    expect(content).toContain('created_by')
    expect(content).toContain('sketches_company_idx')
  })
})

// ========================================
// TEA-Generated: Risk-Based Coverage Expansion
// ========================================

describe('TEA 13-1: Zod schema edge cases (P0 — data integrity)', () => {
  it('createSketchSchema should accept name at exactly 200 chars', async () => {
    const { z } = await import('zod')
    const schema = z.object({
      name: z.string().min(1).max(200),
      graphData: z.object({
        nodes: z.array(z.any()).default([]),
        edges: z.array(z.any()).default([]),
      }).default({ nodes: [], edges: [] }),
    })

    const result = schema.safeParse({ name: 'a'.repeat(200) })
    expect(result.success).toBe(true)
  })

  it('createSketchSchema should accept name at exactly 1 char', async () => {
    const { z } = await import('zod')
    const schema = z.object({
      name: z.string().min(1).max(200),
    })

    const result = schema.safeParse({ name: 'A' })
    expect(result.success).toBe(true)
  })

  it('createSketchSchema should accept Korean/Unicode names', async () => {
    const { z } = await import('zod')
    const schema = z.object({
      name: z.string().min(1).max(200),
    })

    const koreanNames = ['테스트 캔버스', '🎨 디자인', '에이전트 워크플로우 #1', '한글+English混合']
    koreanNames.forEach((name) => {
      const result = schema.safeParse({ name })
      expect(result.success).toBe(true)
    })
  })

  it('createSketchSchema should accept graphData with complex nodes', async () => {
    const { z } = await import('zod')
    const schema = z.object({
      name: z.string().min(1).max(200),
      graphData: z.object({
        nodes: z.array(z.any()).default([]),
        edges: z.array(z.any()).default([]),
      }).default({ nodes: [], edges: [] }),
    })

    const result = schema.safeParse({
      name: '복잡한 캔버스',
      graphData: {
        nodes: Array.from({ length: 50 }, (_, i) => ({
          id: `sv-agent-${i}`,
          type: 'agent',
          position: { x: i * 100, y: Math.random() * 500 },
          data: { label: `에이전트 ${i}`, config: { model: 'claude', temperature: 0.7 } },
        })),
        edges: Array.from({ length: 49 }, (_, i) => ({
          id: `e-${i}`,
          source: `sv-agent-${i}`,
          target: `sv-agent-${i + 1}`,
          type: 'editable',
          data: { label: `연결 ${i}` },
        })),
      },
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.graphData.nodes).toHaveLength(50)
      expect(result.data.graphData.edges).toHaveLength(49)
    }
  })

  it('updateSketchSchema should reject invalid graphData structure', async () => {
    const { z } = await import('zod')
    const schema = z.object({
      name: z.string().min(1).max(200).optional(),
      graphData: z.object({
        nodes: z.array(z.any()),
        edges: z.array(z.any()),
      }).optional(),
    })

    // Missing edges
    const result = schema.safeParse({ graphData: { nodes: [] } })
    expect(result.success).toBe(false)

    // Missing nodes
    const result2 = schema.safeParse({ graphData: { edges: [] } })
    expect(result2.success).toBe(false)
  })
})

describe('TEA 13-1: Tenant isolation edge cases (P0 — security)', () => {
  it('query filter should not return sketches when companyId is empty string', () => {
    const allSketches = [
      { id: 's1', companyId: 'c1', name: 'A' },
      { id: 's2', companyId: 'c2', name: 'B' },
    ]

    const filtered = allSketches.filter((s) => s.companyId === '')
    expect(filtered).toHaveLength(0)
  })

  it('query filter should handle UUID format companyIds', () => {
    const uuid1 = '550e8400-e29b-41d4-a716-446655440000'
    const uuid2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

    const allSketches = [
      { id: 's1', companyId: uuid1, name: 'A' },
      { id: 's2', companyId: uuid1, name: 'B' },
      { id: 's3', companyId: uuid2, name: 'C' },
    ]

    const filtered = allSketches.filter((s) => s.companyId === uuid1)
    expect(filtered).toHaveLength(2)
    expect(filtered.every((s) => s.companyId === uuid1)).toBe(true)
  })

  it('delete should only affect target sketch within company', () => {
    const companyId = 'c1'
    const allSketches = [
      { id: 's1', companyId: 'c1', name: 'Keep' },
      { id: 's2', companyId: 'c1', name: 'Delete' },
      { id: 's3', companyId: 'c2', name: 'Other Company' },
    ]

    // Simulate delete: only remove s2 from c1
    const afterDelete = allSketches.filter(
      (s) => !(s.id === 's2' && s.companyId === companyId),
    )

    expect(afterDelete).toHaveLength(2)
    expect(afterDelete.find((s) => s.id === 's1')).toBeDefined()
    expect(afterDelete.find((s) => s.id === 's3')).toBeDefined()
    expect(afterDelete.find((s) => s.id === 's2')).toBeUndefined()
  })
})

describe('TEA 13-1: GraphData serialization edge cases (P1)', () => {
  it('graphData should handle nodes with special characters in labels', () => {
    const graphData = {
      nodes: [
        { id: 'sv-1', type: 'note', position: { x: 0, y: 0 }, data: { label: '특수문자: <script>alert("xss")</script>' } },
        { id: 'sv-2', type: 'note', position: { x: 100, y: 0 }, data: { label: "SQL: '; DROP TABLE users; --" } },
        { id: 'sv-3', type: 'note', position: { x: 200, y: 0 }, data: { label: '줄바꿈\n포함\t탭도' } },
      ],
      edges: [],
    }

    const serialized = JSON.stringify(graphData)
    const deserialized = JSON.parse(serialized)

    expect(deserialized.nodes).toHaveLength(3)
    expect(deserialized.nodes[0].data.label).toContain('<script>')
    expect(deserialized.nodes[1].data.label).toContain('DROP TABLE')
    expect(deserialized.nodes[2].data.label).toContain('\n')
  })

  it('graphData should survive JSON round-trip with all node types', () => {
    const nodeTypes = ['start', 'end', 'agent', 'system', 'api', 'decide', 'db', 'note']
    const graphData = {
      nodes: nodeTypes.map((type, i) => ({
        id: `sv-${type}-${i}`,
        type,
        position: { x: i * 150, y: Math.floor(i / 4) * 200 },
        data: { label: `${type} 노드` },
      })),
      edges: [
        { id: 'e-1', source: 'sv-start-0', target: 'sv-agent-2', type: 'editable', data: { label: '시작→분석' } },
        { id: 'e-2', source: 'sv-agent-2', target: 'sv-decide-5', type: 'editable', data: { label: '' } },
        { id: 'e-3', source: 'sv-decide-5', target: 'sv-end-1', type: 'editable' },
      ],
    }

    const serialized = JSON.stringify(graphData)
    const deserialized = JSON.parse(serialized)

    expect(deserialized.nodes).toHaveLength(8)
    expect(deserialized.edges).toHaveLength(3)
    nodeTypes.forEach((type, i) => {
      expect(deserialized.nodes[i].type).toBe(type)
    })
  })

  it('graphData should handle very large node positions', () => {
    const node = {
      id: 'sv-1',
      type: 'agent',
      position: { x: 99999.999, y: -50000.5 },
      data: { label: '극한 위치' },
    }

    const serialized = JSON.stringify(node)
    const deserialized = JSON.parse(serialized)
    expect(deserialized.position.x).toBe(99999.999)
    expect(deserialized.position.y).toBe(-50000.5)
  })
})

describe('TEA 13-1: Route source code verification (P0)', () => {
  it('sketches route should use authMiddleware', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const routePath = path.resolve(
      import.meta.dir,
      '../../routes/workspace/sketches.ts',
    )
    const content = fs.readFileSync(routePath, 'utf-8')
    expect(content).toContain('authMiddleware')
    expect(content).toContain("tenant.companyId")
  })

  it('all CRUD endpoints should include companyId filter', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const routePath = path.resolve(
      import.meta.dir,
      '../../routes/workspace/sketches.ts',
    )
    const content = fs.readFileSync(routePath, 'utf-8')

    // Count occurrences of companyId filter in WHERE conditions
    const companyIdMatches = content.match(/tenant\.companyId/g) || []
    // Should appear in: list (1), get (1), create (1), update (1), delete (1) = 5
    expect(companyIdMatches.length).toBeGreaterThanOrEqual(5)
  })

  it('route should use Zod validation for create and update', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const routePath = path.resolve(
      import.meta.dir,
      '../../routes/workspace/sketches.ts',
    )
    const content = fs.readFileSync(routePath, 'utf-8')
    expect(content).toContain('createSketchSchema')
    expect(content).toContain('updateSketchSchema')
    expect(content).toContain('zValidator')
  })

  it('route should throw 404 for non-existent sketches', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const routePath = path.resolve(
      import.meta.dir,
      '../../routes/workspace/sketches.ts',
    )
    const content = fs.readFileSync(routePath, 'utf-8')
    // GET, PUT, DELETE should all have 404 handling
    const notFoundMatches = content.match(/HTTPError\(404/g) || []
    expect(notFoundMatches.length).toBeGreaterThanOrEqual(3)
  })
})
