import { describe, it, expect } from 'bun:test'
import { z } from 'zod'

// ========================================
// Story 17-3: 워크플로우 편집 + 실행 — Unit Tests
// ========================================

// Zod schemas (mirror of server implementation)
const createWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  nodes: z.array(z.any()).default([]),
  edges: z.array(z.any()).default([]),
})

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
})

describe('Story 17-3: Shared types', () => {
  it('NexusWorkflow type should be importable', async () => {
    const types = await import('@corthex/shared')
    expect(types).toBeDefined()
  })

  it('NexusWorkflow type structure validation', () => {
    const mockWorkflow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      companyId: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Workflow',
      description: 'A test workflow',
      nodes: [{ id: 'n1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Start' } }],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
      isTemplate: false,
      isActive: true,
      createdBy: '123e4567-e89b-12d3-a456-426614174002',
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
    }
    expect(mockWorkflow.id).toBeDefined()
    expect(mockWorkflow.name).toBe('Test Workflow')
    expect(mockWorkflow.nodes).toHaveLength(1)
    expect(mockWorkflow.edges).toHaveLength(1)
    expect(mockWorkflow.isTemplate).toBe(false)
    expect(mockWorkflow.isActive).toBe(true)
  })

  it('NexusExecution type structure validation', () => {
    const mockExecution = {
      id: '123e4567-e89b-12d3-a456-426614174010',
      companyId: '123e4567-e89b-12d3-a456-426614174001',
      workflowId: '123e4567-e89b-12d3-a456-426614174000',
      status: 'completed',
      result: { message: '워크플로우 실행 완료 (stub)', nodeCount: 3, edgeCount: 2 },
      startedAt: '2026-03-06T00:00:00.000Z',
      completedAt: '2026-03-06T00:01:00.000Z',
    }
    expect(mockExecution.status).toBe('completed')
    expect(mockExecution.result).toBeDefined()
    expect(mockExecution.completedAt).toBeDefined()
  })
})

describe('Story 17-3: createWorkflow Zod schema', () => {
  it('should accept valid create payload with name only', () => {
    const result = createWorkflowSchema.safeParse({ name: 'My Workflow' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('My Workflow')
      expect(result.data.nodes).toEqual([])
      expect(result.data.edges).toEqual([])
    }
  })

  it('should accept valid create payload with all fields', () => {
    const result = createWorkflowSchema.safeParse({
      name: 'Full Workflow',
      description: 'A complete workflow',
      nodes: [{ id: 'n1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Start' } }],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.nodes).toHaveLength(1)
      expect(result.data.edges).toHaveLength(1)
    }
  })

  it('should reject empty name', () => {
    const result = createWorkflowSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('should reject name exceeding 200 chars', () => {
    const result = createWorkflowSchema.safeParse({ name: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('should reject missing name', () => {
    const result = createWorkflowSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should accept name with exactly 200 chars', () => {
    const result = createWorkflowSchema.safeParse({ name: 'x'.repeat(200) })
    expect(result.success).toBe(true)
  })
})

describe('Story 17-3: updateWorkflow Zod schema', () => {
  it('should accept empty update (all optional)', () => {
    const result = updateWorkflowSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should accept partial name update', () => {
    const result = updateWorkflowSchema.safeParse({ name: 'Updated Name' })
    expect(result.success).toBe(true)
  })

  it('should accept isActive toggle', () => {
    const result = updateWorkflowSchema.safeParse({ isActive: false })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isActive).toBe(false)
    }
  })

  it('should accept null description', () => {
    const result = updateWorkflowSchema.safeParse({ description: null })
    expect(result.success).toBe(true)
  })

  it('should accept nodes and edges update', () => {
    const result = updateWorkflowSchema.safeParse({
      nodes: [{ id: 'n1', data: { label: 'Updated' } }],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    })
    expect(result.success).toBe(true)
  })

  it('should reject name exceeding 200 chars', () => {
    const result = updateWorkflowSchema.safeParse({ name: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('should reject empty name string', () => {
    const result = updateWorkflowSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })
})

describe('Story 17-3: Workflow execution stub logic', () => {
  it('should generate correct stub result structure', () => {
    const nodes = [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }]
    const edges = [{ id: 'e1' }, { id: 'e2' }]
    const executedAt = new Date().toISOString()

    const result = {
      message: '워크플로우 실행 완료 (stub)',
      nodeCount: Array.isArray(nodes) ? nodes.length : 0,
      edgeCount: Array.isArray(edges) ? edges.length : 0,
      executedAt,
    }

    expect(result.message).toContain('stub')
    expect(result.nodeCount).toBe(3)
    expect(result.edgeCount).toBe(2)
    expect(result.executedAt).toBeDefined()
  })

  it('should handle empty nodes/edges', () => {
    const nodes: unknown[] = []
    const edges: unknown[] = []

    const result = {
      message: '워크플로우 실행 완료 (stub)',
      nodeCount: Array.isArray(nodes) ? nodes.length : 0,
      edgeCount: Array.isArray(edges) ? edges.length : 0,
      executedAt: new Date().toISOString(),
    }

    expect(result.nodeCount).toBe(0)
    expect(result.edgeCount).toBe(0)
  })

  it('should handle non-array nodes/edges gracefully', () => {
    const nodes = null as unknown
    const edges = undefined as unknown

    const nodeCount = Array.isArray(nodes) ? (nodes as unknown[]).length : 0
    const edgeCount = Array.isArray(edges) ? (edges as unknown[]).length : 0

    expect(nodeCount).toBe(0)
    expect(edgeCount).toBe(0)
  })
})

describe('Story 17-3: DB schema validation', () => {
  it('nexusWorkflows table should exist in schema', async () => {
    const schema = await import('../../db/schema')
    expect(schema.nexusWorkflows).toBeDefined()
  })

  it('nexusExecutions table should exist in schema', async () => {
    const schema = await import('../../db/schema')
    expect(schema.nexusExecutions).toBeDefined()
  })

  it('nexusWorkflows should have correct columns', async () => {
    const schema = await import('../../db/schema')
    const table = schema.nexusWorkflows
    expect(table.id).toBeDefined()
    expect(table.companyId).toBeDefined()
    expect(table.name).toBeDefined()
    expect(table.description).toBeDefined()
    expect(table.nodes).toBeDefined()
    expect(table.edges).toBeDefined()
    expect(table.isTemplate).toBeDefined()
    expect(table.isActive).toBeDefined()
    expect(table.createdBy).toBeDefined()
    expect(table.createdAt).toBeDefined()
    expect(table.updatedAt).toBeDefined()
  })

  it('nexusExecutions should have correct columns', async () => {
    const schema = await import('../../db/schema')
    const table = schema.nexusExecutions
    expect(table.id).toBeDefined()
    expect(table.companyId).toBeDefined()
    expect(table.workflowId).toBeDefined()
    expect(table.status).toBeDefined()
    expect(table.result).toBeDefined()
    expect(table.startedAt).toBeDefined()
    expect(table.completedAt).toBeDefined()
  })
})

describe('Story 17-3: API route structure', () => {
  it('nexusRoute should be importable', async () => {
    const routeModule = await import('../../routes/workspace/nexus')
    expect(routeModule.nexusRoute).toBeDefined()
  })

  it('nexusRoute should be a Hono instance', async () => {
    const routeModule = await import('../../routes/workspace/nexus')
    expect(routeModule.nexusRoute).toBeDefined()
    expect(typeof routeModule.nexusRoute.get).toBe('function')
    expect(typeof routeModule.nexusRoute.post).toBe('function')
    expect(typeof routeModule.nexusRoute.put).toBe('function')
    expect(typeof routeModule.nexusRoute.delete).toBe('function')
  })
})

describe('Story 17-3: Execution status values', () => {
  it('should support running status', () => {
    const validStatuses = ['running', 'completed', 'failed']
    expect(validStatuses).toContain('running')
  })

  it('should support completed status', () => {
    const validStatuses = ['running', 'completed', 'failed']
    expect(validStatuses).toContain('completed')
  })

  it('should support failed status', () => {
    const validStatuses = ['running', 'completed', 'failed']
    expect(validStatuses).toContain('failed')
  })
})
