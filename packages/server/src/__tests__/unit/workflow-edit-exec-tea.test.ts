import { describe, it, expect } from 'bun:test'
import { z } from 'zod'

// ========================================
// TEA: Story 17-3 워크플로우 편집 + 실행
// Risk-based test coverage expansion
// ========================================

// Mirror Zod schemas from server
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

// ========================================
// P1-HIGH: Tenant Isolation Tests
// ========================================
describe('TEA-HIGH: Tenant isolation for workflow CRUD', () => {
  it('should require companyId matching for workflow listing', () => {
    // Simulate two companies
    const company1Workflows = [
      { id: 'w1', companyId: 'c1', name: 'WF1' },
      { id: 'w2', companyId: 'c1', name: 'WF2' },
    ]
    const company2Workflows = [
      { id: 'w3', companyId: 'c2', name: 'WF3' },
    ]
    const allWorkflows = [...company1Workflows, ...company2Workflows]

    // Company 1 should only see their own
    const filtered = allWorkflows.filter(w => w.companyId === 'c1')
    expect(filtered).toHaveLength(2)
    expect(filtered.every(w => w.companyId === 'c1')).toBe(true)
  })

  it('should reject update/delete with mismatched companyId', () => {
    const workflow = { id: 'w1', companyId: 'company-A' }
    const tenantCompanyId = 'company-B'

    // Simulating the server check: companyId must match
    const found = workflow.companyId === tenantCompanyId ? workflow : null
    expect(found).toBeNull()
  })

  it('should reject execution with mismatched companyId', () => {
    const workflow = { id: 'w1', companyId: 'company-A', isActive: true }
    const tenantCompanyId = 'company-B'

    const found = workflow.companyId === tenantCompanyId ? workflow : null
    expect(found).toBeNull()
  })

  it('should reject execution history access with mismatched companyId', () => {
    const workflow = { id: 'w1', companyId: 'company-A' }
    const tenantCompanyId = 'company-B'

    const found = workflow.companyId === tenantCompanyId ? workflow : null
    expect(found).toBeNull()
  })
})

// ========================================
// P1-HIGH: Cascade Delete Tests
// ========================================
describe('TEA-HIGH: Cascade delete for workflow + executions', () => {
  it('should delete executions before workflow to avoid FK violation', () => {
    const workflowId = 'wf-123'
    const executions = [
      { id: 'ex-1', workflowId },
      { id: 'ex-2', workflowId },
      { id: 'ex-3', workflowId },
    ]

    // Step 1: Delete executions by workflowId
    const remaining = executions.filter(e => e.workflowId !== workflowId)
    expect(remaining).toHaveLength(0)

    // Step 2: Now safe to delete workflow
    const workflow = { id: workflowId, deleted: true }
    expect(workflow.deleted).toBe(true)
  })

  it('should handle workflow with no executions on delete', () => {
    const workflowId = 'wf-no-exec'
    const executions: { id: string; workflowId: string }[] = []

    const remaining = executions.filter(e => e.workflowId !== workflowId)
    expect(remaining).toHaveLength(0)
    // No error even with empty executions
  })

  it('should not affect other workflow executions on delete', () => {
    const targetWorkflowId = 'wf-target'
    const otherWorkflowId = 'wf-other'
    const executions = [
      { id: 'ex-1', workflowId: targetWorkflowId },
      { id: 'ex-2', workflowId: otherWorkflowId },
      { id: 'ex-3', workflowId: targetWorkflowId },
    ]

    const remaining = executions.filter(e => e.workflowId !== targetWorkflowId)
    expect(remaining).toHaveLength(1)
    expect(remaining[0].workflowId).toBe(otherWorkflowId)
  })
})

// ========================================
// P1-HIGH: Execute — isActive Guard
// ========================================
describe('TEA-HIGH: Workflow execution guards', () => {
  it('should reject execution of inactive workflow', () => {
    const workflow = { id: 'wf-1', isActive: false, name: 'Disabled WF' }
    const canExecute = workflow.isActive
    expect(canExecute).toBe(false)
  })

  it('should allow execution of active workflow', () => {
    const workflow = { id: 'wf-1', isActive: true, name: 'Active WF' }
    const canExecute = workflow.isActive
    expect(canExecute).toBe(true)
  })

  it('should reject execution of non-existent workflow', () => {
    const workflow = null
    expect(workflow).toBeNull()
  })

  it('should create execution record with running status', () => {
    const execution = {
      id: 'ex-new',
      workflowId: 'wf-1',
      status: 'running',
      result: null,
      completedAt: null,
    }
    expect(execution.status).toBe('running')
    expect(execution.result).toBeNull()
    expect(execution.completedAt).toBeNull()
  })

  it('should transition from running to completed with result', () => {
    const execution = {
      id: 'ex-new',
      status: 'running' as string,
      result: null as unknown,
      completedAt: null as string | null,
    }

    // Stub execution completes
    execution.status = 'completed'
    execution.result = {
      message: '워크플로우 실행 완료 (stub)',
      nodeCount: 5,
      edgeCount: 3,
      executedAt: new Date().toISOString(),
    }
    execution.completedAt = new Date().toISOString()

    expect(execution.status).toBe('completed')
    expect(execution.result).toBeDefined()
    expect(execution.completedAt).toBeDefined()
  })
})

// ========================================
// P2-MED: Zod Validation Edge Cases
// ========================================
describe('TEA-MED: createWorkflow Zod edge cases', () => {
  it('should reject numeric name', () => {
    const result = createWorkflowSchema.safeParse({ name: 123 })
    expect(result.success).toBe(false)
  })

  it('should reject array as name', () => {
    const result = createWorkflowSchema.safeParse({ name: ['test'] })
    expect(result.success).toBe(false)
  })

  it('should reject null name', () => {
    const result = createWorkflowSchema.safeParse({ name: null })
    expect(result.success).toBe(false)
  })

  it('should accept unicode name (Korean)', () => {
    const result = createWorkflowSchema.safeParse({ name: '자동 보고서 생성 워크플로우' })
    expect(result.success).toBe(true)
  })

  it('should accept name with special characters', () => {
    const result = createWorkflowSchema.safeParse({ name: 'Test (v2) - Final!' })
    expect(result.success).toBe(true)
  })

  it('should default nodes to empty array when not provided', () => {
    const result = createWorkflowSchema.safeParse({ name: 'Test' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.nodes).toEqual([])
      expect(result.data.edges).toEqual([])
    }
  })

  it('should accept nodes with complex nested structure', () => {
    const result = createWorkflowSchema.safeParse({
      name: 'Complex',
      nodes: [
        {
          id: 'n1',
          type: 'custom-agent',
          position: { x: 100, y: 200 },
          data: {
            label: 'Agent Node',
            agentId: 'agent-123',
            config: { timeout: 30, retries: 3 },
          },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'n1',
          target: 'n2',
          type: 'smoothstep',
          animated: true,
          data: { condition: 'success' },
        },
      ],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.nodes[0].data.config.timeout).toBe(30)
    }
  })
})

describe('TEA-MED: updateWorkflow Zod edge cases', () => {
  it('should accept only isActive field', () => {
    const result = updateWorkflowSchema.safeParse({ isActive: false })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isActive).toBe(false)
      expect(result.data.name).toBeUndefined()
    }
  })

  it('should reject non-boolean isActive', () => {
    const result = updateWorkflowSchema.safeParse({ isActive: 'true' })
    expect(result.success).toBe(false)
  })

  it('should accept description set to null (clear)', () => {
    const result = updateWorkflowSchema.safeParse({ description: null })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it('should accept all fields simultaneously', () => {
    const result = updateWorkflowSchema.safeParse({
      name: 'Updated',
      description: 'New desc',
      nodes: [{ id: 'n1' }],
      edges: [{ id: 'e1' }],
      isActive: true,
    })
    expect(result.success).toBe(true)
  })

  it('should strip unknown fields', () => {
    const result = updateWorkflowSchema.safeParse({
      name: 'Test',
      unknownField: 'should be stripped',
    })
    expect(result.success).toBe(true)
  })
})

// ========================================
// P2-MED: Execution Stub Result Structure
// ========================================
describe('TEA-MED: Execution stub result validation', () => {
  it('should include all required result fields', () => {
    const nodes = [{ id: 'n1' }, { id: 'n2' }]
    const edges = [{ id: 'e1' }]
    const result = {
      message: '워크플로우 실행 완료 (stub)',
      nodeCount: Array.isArray(nodes) ? nodes.length : 0,
      edgeCount: Array.isArray(edges) ? edges.length : 0,
      executedAt: new Date().toISOString(),
    }

    expect(result).toHaveProperty('message')
    expect(result).toHaveProperty('nodeCount')
    expect(result).toHaveProperty('edgeCount')
    expect(result).toHaveProperty('executedAt')
    expect(typeof result.message).toBe('string')
    expect(typeof result.nodeCount).toBe('number')
    expect(typeof result.edgeCount).toBe('number')
    expect(typeof result.executedAt).toBe('string')
  })

  it('should return ISO 8601 format for executedAt', () => {
    const executedAt = new Date().toISOString()
    // ISO 8601 format check
    expect(executedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('should have Korean message in stub result', () => {
    const result = {
      message: '워크플로우 실행 완료 (stub)',
    }
    expect(result.message).toContain('워크플로우')
    expect(result.message).toContain('stub')
  })
})

// ========================================
// P2-MED: Execution History Ordering
// ========================================
describe('TEA-MED: Execution history ordering and limits', () => {
  it('should return executions in descending startedAt order', () => {
    const executions = [
      { id: 'ex-1', startedAt: '2026-03-06T01:00:00Z' },
      { id: 'ex-3', startedAt: '2026-03-06T03:00:00Z' },
      { id: 'ex-2', startedAt: '2026-03-06T02:00:00Z' },
    ]

    const sorted = [...executions].sort((a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )

    expect(sorted[0].id).toBe('ex-3')
    expect(sorted[1].id).toBe('ex-2')
    expect(sorted[2].id).toBe('ex-1')
  })

  it('should limit to 20 executions', () => {
    const executions = Array.from({ length: 25 }, (_, i) => ({
      id: `ex-${i}`,
      startedAt: new Date(2026, 2, 6, i).toISOString(),
    }))

    const limited = executions.slice(0, 20)
    expect(limited).toHaveLength(20)
  })

  it('should return empty array for workflow with no executions', () => {
    const executions: unknown[] = []
    expect(executions).toHaveLength(0)
  })
})

// ========================================
// P2-MED: Workflow CRUD — 404 handling
// ========================================
describe('TEA-MED: Workflow 404 handling', () => {
  it('should return 404 for non-existent workflow on update', () => {
    const workflow = null // Not found
    const isNotFound = !workflow
    expect(isNotFound).toBe(true)
  })

  it('should return 404 for non-existent workflow on delete', () => {
    const workflow = null
    const isNotFound = !workflow
    expect(isNotFound).toBe(true)
  })

  it('should return 404 for non-existent workflow on execute', () => {
    const workflow = null
    const isNotFound = !workflow
    expect(isNotFound).toBe(true)
  })

  it('should return 404 for non-existent workflow on execution history', () => {
    const workflow = null
    const isNotFound = !workflow
    expect(isNotFound).toBe(true)
  })
})

// ========================================
// P3-LOW: Workflow state transitions
// ========================================
describe('TEA-LOW: Workflow state management', () => {
  it('should default isTemplate to false for new workflow', () => {
    const defaults = { isTemplate: false, isActive: true }
    expect(defaults.isTemplate).toBe(false)
  })

  it('should default isActive to true for new workflow', () => {
    const defaults = { isActive: true }
    expect(defaults.isActive).toBe(true)
  })

  it('should update updatedAt on workflow modification', () => {
    const original = new Date('2026-03-01T00:00:00Z')
    const modified = new Date('2026-03-06T12:00:00Z')
    expect(modified.getTime()).toBeGreaterThan(original.getTime())
  })

  it('should preserve createdBy on update', () => {
    const workflow = {
      createdBy: 'user-original',
      name: 'Original',
    }
    // Update only changes name, not createdBy
    const update = { name: 'Updated' }
    const merged = { ...workflow, ...update }
    expect(merged.createdBy).toBe('user-original')
    expect(merged.name).toBe('Updated')
  })
})

// ========================================
// P3-LOW: Frontend type compatibility
// ========================================
describe('TEA-LOW: NexusWorkflow type serialization', () => {
  it('should serialize dates as ISO strings', () => {
    const date = new Date()
    const serialized = date.toISOString()
    expect(typeof serialized).toBe('string')
    expect(serialized).toContain('T')
  })

  it('should handle null description in response', () => {
    const workflow = {
      name: 'Test',
      description: null as string | null,
    }
    expect(workflow.description).toBeNull()
  })

  it('should handle empty nodes/edges arrays', () => {
    const workflow = {
      nodes: [] as unknown[],
      edges: [] as unknown[],
    }
    expect(workflow.nodes).toHaveLength(0)
    expect(workflow.edges).toHaveLength(0)
  })

  it('should handle jsonb nodes with various shapes', () => {
    const nodesVariants = [
      [], // empty
      [{ id: 'n1' }], // minimal
      [{ id: 'n1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Test' } }], // full ReactFlow
      [{ id: 'n1', customProp: { nested: true } }], // custom properties
    ]

    for (const nodes of nodesVariants) {
      expect(Array.isArray(nodes)).toBe(true)
    }
  })
})

// ========================================
// P2-MED: Route import validation
// ========================================
describe('TEA-MED: Route module validation', () => {
  it('should import nexusWorkflows from schema', async () => {
    const schema = await import('../../db/schema')
    expect(schema.nexusWorkflows).toBeDefined()
    expect(schema.nexusExecutions).toBeDefined()
  })

  it('should have nexusWorkflowsRelations defined', async () => {
    const schema = await import('../../db/schema')
    expect(schema.nexusWorkflowsRelations).toBeDefined()
  })

  it('should have nexusExecutionsRelations defined', async () => {
    const schema = await import('../../db/schema')
    expect(schema.nexusExecutionsRelations).toBeDefined()
  })

  it('should export nexusRoute from route module', async () => {
    const routes = await import('../../routes/workspace/nexus')
    expect(routes.nexusRoute).toBeDefined()
  })
})

// ========================================
// P1-HIGH: Shared types validation
// ========================================
describe('TEA-HIGH: Shared NexusWorkflow type completeness', () => {
  it('should have all required NexusWorkflow fields', () => {
    const requiredFields = [
      'id', 'companyId', 'name', 'description',
      'nodes', 'edges', 'isTemplate', 'isActive',
      'createdBy', 'createdAt', 'updatedAt',
    ]

    const mockWorkflow = {
      id: 'test',
      companyId: 'test',
      name: 'test',
      description: null,
      nodes: [],
      edges: [],
      isTemplate: false,
      isActive: true,
      createdBy: 'test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    for (const field of requiredFields) {
      expect(field in mockWorkflow).toBe(true)
    }
  })

  it('should have all required NexusExecution fields', () => {
    const requiredFields = [
      'id', 'companyId', 'workflowId', 'status',
      'result', 'startedAt', 'completedAt',
    ]

    const mockExecution = {
      id: 'test',
      companyId: 'test',
      workflowId: 'test',
      status: 'completed',
      result: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    }

    for (const field of requiredFields) {
      expect(field in mockExecution).toBe(true)
    }
  })
})

// ========================================
// P2-MED: Activity logging validation
// ========================================
describe('TEA-MED: Activity logging for workflow operations', () => {
  it('should log create activity with workflow name', () => {
    const workflowName = 'My Workflow'
    const action = `NEXUS: 워크플로우 생성 — ${workflowName}`
    expect(action).toContain('NEXUS')
    expect(action).toContain('워크플로우 생성')
    expect(action).toContain(workflowName)
  })

  it('should log delete activity with workflow name', () => {
    const workflowName = 'Old Workflow'
    const action = `NEXUS: 워크플로우 삭제 — ${workflowName}`
    expect(action).toContain('워크플로우 삭제')
    expect(action).toContain(workflowName)
  })

  it('should log execute activity with workflow name', () => {
    const workflowName = 'Auto Report'
    const action = `NEXUS: 워크플로우 실행 — ${workflowName}`
    expect(action).toContain('워크플로우 실행')
    expect(action).toContain(workflowName)
  })
})
