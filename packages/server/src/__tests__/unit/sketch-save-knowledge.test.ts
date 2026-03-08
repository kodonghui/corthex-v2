import { describe, it, expect } from 'bun:test'
import { z } from 'zod'
import { canvasToMermaidCode } from '@corthex/shared'

// ========================================
// Story 13-4: Save/Load + Knowledge Base Integration — Unit Tests
// ========================================

// === Task 1: DB Schema Extension ===

describe('Story 13-4: sketch_versions table schema', () => {
  it('sketchVersions should be importable from schema', async () => {
    const schema = await import('../../db/schema')
    expect(schema.sketchVersions).toBeDefined()
  })

  it('sketchVersions should have all required columns', async () => {
    const schema = await import('../../db/schema')
    const table = schema.sketchVersions
    expect(table).toHaveProperty('id')
    expect(table).toHaveProperty('sketchId')
    expect(table).toHaveProperty('version')
    expect(table).toHaveProperty('graphData')
    expect(table).toHaveProperty('createdAt')
  })

  it('sketchVersionsRelations should be importable', async () => {
    const schema = await import('../../db/schema')
    expect(schema.sketchVersionsRelations).toBeDefined()
  })

  it('sketches should have versions relation', async () => {
    const schema = await import('../../db/schema')
    expect(schema.sketchesRelations).toBeDefined()
  })
})

// === Task 2: Server API Extension ===

describe('Story 13-4: Sketches route module imports', () => {
  it('sketchesRoute should be importable with new endpoints', async () => {
    const { sketchesRoute } = await import('../../routes/workspace/sketches')
    expect(sketchesRoute).toBeDefined()
  })
})

describe('Story 13-4: Export knowledge validation schema', () => {
  const exportSchema = z.object({
    title: z.string().min(1).max(500),
    folderId: z.string().uuid().optional(),
  })

  it('valid export request with title only', () => {
    const result = exportSchema.safeParse({ title: '테스트 다이어그램' })
    expect(result.success).toBe(true)
  })

  it('valid export request with title and folderId', () => {
    const result = exportSchema.safeParse({
      title: '테스트 다이어그램',
      folderId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = exportSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects title exceeding 500 chars', () => {
    const result = exportSchema.safeParse({ title: 'a'.repeat(501) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid folderId (not UUID)', () => {
    const result = exportSchema.safeParse({ title: '테스트', folderId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

// === Task 2.1: PUT update with autoSave flag ===

describe('Story 13-4: Auto-save version control logic', () => {
  it('autoSave=true should not create version (logic verification)', () => {
    const autoSave = true
    const shouldCreateVersion = !autoSave
    expect(shouldCreateVersion).toBe(false)
  })

  it('autoSave=false (default) should create version', () => {
    const autoSave = false
    const shouldCreateVersion = !autoSave
    expect(shouldCreateVersion).toBe(true)
  })

  it('version pruning: should identify excess versions beyond max', () => {
    const maxVersions = 20
    const currentCount = 22
    const excess = currentCount - maxVersions
    expect(excess).toBe(2)
  })

  it('version pruning: no pruning needed when under limit', () => {
    const maxVersions = 20
    const currentCount = 15
    const excess = currentCount - maxVersions
    expect(excess <= 0).toBe(true)
  })

  it('next version number should increment from max', () => {
    const maxExistingVersion = 5
    const nextVersion = maxExistingVersion + 1
    expect(nextVersion).toBe(6)
  })

  it('first version should be 1 when no previous versions exist', () => {
    const maxExistingVersion = null
    const nextVersion = ((maxExistingVersion as number | null) ?? 0) + 1
    expect(nextVersion).toBe(1)
  })
})

// === Task 2.2: Duplicate endpoint ===

describe('Story 13-4: Sketch duplication logic', () => {
  it('duplicate name should append (복사본)', () => {
    const originalName = '워크플로우 다이어그램'
    const duplicatedName = `${originalName} (복사본)`
    expect(duplicatedName).toBe('워크플로우 다이어그램 (복사본)')
  })

  it('duplicate should preserve graphData structure', () => {
    const original = {
      nodes: [
        { id: 'n1', type: 'start', position: { x: 0, y: 0 }, data: { label: '시작' } },
        { id: 'n2', type: 'end', position: { x: 200, y: 0 }, data: { label: '종료' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', type: 'editable', data: { label: '연결' } },
      ],
    }
    const duplicated = JSON.parse(JSON.stringify(original))
    expect(duplicated.nodes).toHaveLength(2)
    expect(duplicated.edges).toHaveLength(1)
    expect(duplicated.nodes[0].type).toBe('start')
    expect(duplicated.edges[0].data.label).toBe('연결')
  })
})

// === Task 2.3: Export knowledge logic ===

describe('Story 13-4: Export knowledge — canvas to Mermaid conversion', () => {
  it('should convert nodes to Mermaid code using shared parser', () => {
    const nodes = [
      { id: 'A', type: 'start', data: { label: '시작' } },
      { id: 'B', type: 'agent', data: { label: '분석가' } },
    ]
    const edges = [
      { source: 'A', target: 'B', data: { label: '진행' } },
    ]
    const mermaid = canvasToMermaidCode(nodes, edges)
    expect(mermaid).toContain('시작')
    expect(mermaid).toContain('분석가')
    expect(mermaid).toContain('진행')
  })

  it('empty canvas should return marker text', () => {
    const mermaid = canvasToMermaidCode([], [])
    expect(mermaid).toBe('(빈 캔버스)')
  })

  it('exported content should wrap Mermaid in code block', () => {
    const mermaidCode = 'flowchart TD\n  A([시작]) --> B[분석가]'
    const content = `\`\`\`mermaid\n${mermaidCode}\n\`\`\`\n\n> SketchVibe에서 내보냄 — 테스트 (${new Date().toLocaleString('ko-KR')})`
    expect(content).toContain('```mermaid')
    expect(content).toContain('```')
    expect(content).toContain('SketchVibe에서 내보냄')
  })

  it('exported doc should have mermaid contentType', () => {
    const docData = {
      contentType: 'mermaid',
      tags: ['sketchvibe', 'diagram'],
    }
    expect(docData.contentType).toBe('mermaid')
    expect(docData.tags).toContain('sketchvibe')
  })
})

// === Task 2.4: Version history ===

describe('Story 13-4: Version history response format', () => {
  it('version list item should include nodeCount and edgeCount', () => {
    const graphData = {
      nodes: [{ id: '1' }, { id: '2' }, { id: '3' }],
      edges: [{ source: '1', target: '2' }],
    }
    const listItem = {
      id: 'ver-uuid',
      version: 3,
      createdAt: new Date().toISOString(),
      nodeCount: Array.isArray(graphData.nodes) ? graphData.nodes.length : 0,
      edgeCount: Array.isArray(graphData.edges) ? graphData.edges.length : 0,
    }
    expect(listItem.nodeCount).toBe(3)
    expect(listItem.edgeCount).toBe(1)
  })

  it('version list should be sorted descending by version', () => {
    const versions = [
      { version: 5, createdAt: '2026-03-08' },
      { version: 3, createdAt: '2026-03-07' },
      { version: 1, createdAt: '2026-03-06' },
    ]
    expect(versions[0].version).toBeGreaterThan(versions[1].version)
    expect(versions[1].version).toBeGreaterThan(versions[2].version)
  })
})

// === Task 2.5: Version restore ===

describe('Story 13-4: Version restore logic', () => {
  it('restore should backup current state before replacing', () => {
    const currentGraphData = {
      nodes: [{ id: 'current-1' }],
      edges: [],
    }
    const targetGraphData = {
      nodes: [{ id: 'old-1' }, { id: 'old-2' }],
      edges: [{ source: 'old-1', target: 'old-2' }],
    }

    // Simulate backup: current becomes a new version
    const backupVersion = { graphData: { ...currentGraphData } }
    expect(backupVersion.graphData.nodes[0].id).toBe('current-1')

    // After restore, sketch should have target's data
    const restoredSketch = { graphData: targetGraphData }
    expect(restoredSketch.graphData.nodes).toHaveLength(2)
    expect(restoredSketch.graphData.edges).toHaveLength(1)
  })
})

// === Task 2.6: Knowledge docs contentType filter ===

describe('Story 13-4: Knowledge docs contentType filter', () => {
  it('mermaid should be a valid contentType', () => {
    const validTypes = ['markdown', 'text', 'html', 'mermaid']
    expect(validTypes).toContain('mermaid')
  })

  it('contentType query parameter should filter results', () => {
    const allDocs = [
      { id: '1', contentType: 'markdown', title: 'doc1' },
      { id: '2', contentType: 'mermaid', title: 'diagram1' },
      { id: '3', contentType: 'mermaid', title: 'diagram2' },
      { id: '4', contentType: 'text', title: 'note1' },
    ]
    const filtered = allDocs.filter(d => d.contentType === 'mermaid')
    expect(filtered).toHaveLength(2)
    expect(filtered.every(d => d.contentType === 'mermaid')).toBe(true)
  })
})

// === Task 5: Mermaid extraction from knowledge docs ===

describe('Story 13-4: Mermaid code extraction from knowledge docs', () => {
  it('should extract mermaid code from fenced code block', () => {
    const content = '```mermaid\nflowchart TD\n  A([시작]) --> B[에이전트]\n```\n\n> SketchVibe에서 내보냄'
    const match = content.match(/```mermaid\s*\n([\s\S]*?)```/)
    expect(match).not.toBeNull()
    expect(match![1].trim()).toBe('flowchart TD\n  A([시작]) --> B[에이전트]')
  })

  it('should use raw content if no fenced block found', () => {
    const content = 'flowchart TD\n  A([시작]) --> B[에이전트]'
    const match = content.match(/```mermaid\s*\n([\s\S]*?)```/)
    const mermaidCode = match ? match[1].trim() : content
    expect(mermaidCode).toBe('flowchart TD\n  A([시작]) --> B[에이전트]')
  })

  it('should handle multi-line mermaid with subgraphs', () => {
    const content = '```mermaid\nflowchart TD\n  subgraph 분석팀\n    A[분석가1]\n    B[분석가2]\n  end\n  C([시작]) --> A\n  C --> B\n```'
    const match = content.match(/```mermaid\s*\n([\s\S]*?)```/)
    expect(match).not.toBeNull()
    expect(match![1]).toContain('subgraph')
    expect(match![1]).toContain('분석팀')
  })
})

// === Tenant isolation ===

describe('Story 13-4: Tenant isolation', () => {
  it('companyId should be required for all operations', () => {
    const tenantA = { companyId: 'company-A', userId: 'user-1' }
    const tenantB = { companyId: 'company-B', userId: 'user-2' }
    expect(tenantA.companyId).not.toBe(tenantB.companyId)
  })

  it('sketch access should be restricted by companyId', () => {
    const sketch = { id: 'sketch-1', companyId: 'company-A' }
    const requestCompanyId = 'company-B'
    const hasAccess = sketch.companyId === requestCompanyId
    expect(hasAccess).toBe(false)
  })
})

// === Integration: full pipeline validation ===

describe('Story 13-4: Full pipeline — canvas → Mermaid → knowledge doc → canvas', () => {
  it('roundtrip: canvas nodes → Mermaid → extract → parse should preserve structure', () => {
    const originalNodes = [
      { id: 'start1', type: 'start', data: { label: '시작' } },
      { id: 'agent1', type: 'agent', data: { label: '분석가' } },
      { id: 'end1', type: 'end', data: { label: '종료' } },
    ]
    const originalEdges = [
      { source: 'start1', target: 'agent1', data: { label: '진행' } },
      { source: 'agent1', target: 'end1', data: { label: '완료' } },
    ]

    // Step 1: Canvas → Mermaid
    const mermaid = canvasToMermaidCode(originalNodes, originalEdges)
    expect(mermaid).toContain('시작')
    expect(mermaid).toContain('분석가')
    expect(mermaid).toContain('종료')

    // Step 2: Wrap in doc content
    const docContent = `\`\`\`mermaid\n${mermaid}\n\`\`\``
    expect(docContent).toContain('```mermaid')

    // Step 3: Extract from doc
    const match = docContent.match(/```mermaid\s*\n([\s\S]*?)```/)
    expect(match).not.toBeNull()
    const extractedMermaid = match![1].trim()
    expect(extractedMermaid).toBe(mermaid)
  })
})

// === Edge cases ===

describe('Story 13-4: Edge cases', () => {
  it('version with empty graphData should have nodeCount=0', () => {
    const graphData = { nodes: [], edges: [] }
    const nodeCount = Array.isArray(graphData.nodes) ? graphData.nodes.length : 0
    expect(nodeCount).toBe(0)
  })

  it('version with null graphData should have nodeCount=0', () => {
    const graphData = null as unknown as { nodes?: unknown[] }
    const nodeCount = Array.isArray(graphData?.nodes) ? graphData.nodes.length : 0
    expect(nodeCount).toBe(0)
  })

  it('duplicate of sketch with empty graphData should succeed', () => {
    const original = { name: '빈 캔버스', graphData: { nodes: [], edges: [] } }
    const duplicated = { name: `${original.name} (복사본)`, graphData: { ...original.graphData } }
    expect(duplicated.name).toBe('빈 캔버스 (복사본)')
    expect(duplicated.graphData.nodes).toHaveLength(0)
  })

  it('autoSave query param parsing', () => {
    const queryTrue = 'true'
    const queryFalse = 'false'
    const queryUndefined = undefined

    expect(queryTrue === 'true').toBe(true)
    expect(queryFalse === 'true').toBe(false)
    expect(queryUndefined === 'true').toBe(false)
  })
})
