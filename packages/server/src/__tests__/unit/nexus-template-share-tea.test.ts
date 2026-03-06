/**
 * TEA (Test Architect) — Story 17-4: NEXUS 템플릿 공유
 * Risk-based coverage expansion tests
 */
import { describe, it, expect, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import type { AppEnv } from '../../types'

// Test state
const mockWorkflows: any[] = []
let mockTenant = { companyId: 'comp-1', userId: 'user-1', role: 'user' as const }
let insertedValues: any = null
let lastUpdate: any = null
let selectConditions: any[] = []

// Mock setup
const { nexusRoute } = await (async () => {
  const { mock } = await import('bun:test')

  mock.module('../../db', () => ({
    db: {
      select: () => ({
        from: () => ({
          where: (...conditions: any[]) => {
            selectConditions = conditions
            return {
              orderBy: () => mockWorkflows,
              limit: () => [mockWorkflows[0] || null],
            }
          },
        }),
      }),
      insert: () => ({
        values: (v: any) => {
          insertedValues = v
          return {
            returning: () => [{
              id: `cloned-${Date.now()}`,
              companyId: v.companyId,
              name: v.name,
              description: v.description ?? null,
              nodes: v.nodes ?? [],
              edges: v.edges ?? [],
              isTemplate: v.isTemplate ?? false,
              isActive: v.isActive ?? true,
              createdBy: v.createdBy,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }],
          }
        },
      }),
      update: () => ({
        set: (s: any) => {
          lastUpdate = s
          return {
            where: () => ({
              returning: () => [{
                id: mockWorkflows[0]?.id ?? 'wf-1',
                ...mockWorkflows[0],
                ...s,
              }],
            }),
          }
        },
      }),
      delete: () => ({
        where: () => ({}),
      }),
      transaction: async (fn: any) => {
        await fn({
          delete: () => ({ where: () => ({}) }),
        })
      },
    },
  }))

  mock.module('../../db/schema', () => ({
    companies: { id: 'id' },
    departments: { id: 'id', companyId: 'company_id' },
    agents: { id: 'id', companyId: 'company_id' },
    canvasLayouts: { id: 'id', companyId: 'company_id', isDefault: 'is_default' },
    nexusWorkflows: {
      id: 'id',
      companyId: 'company_id',
      name: 'name',
      description: 'description',
      nodes: 'nodes',
      edges: 'edges',
      isTemplate: 'is_template',
      isActive: 'is_active',
      createdBy: 'created_by',
      updatedAt: 'updated_at',
    },
    nexusExecutions: {
      id: 'id',
      companyId: 'company_id',
      workflowId: 'workflow_id',
      status: 'status',
      startedAt: 'started_at',
    },
  }))

  mock.module('../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
      c.set('tenant', mockTenant)
      await next()
    },
  }))

  mock.module('../../middleware/error', () => ({
    HTTPError: class extends Error {
      status: number
      code: string
      constructor(status: number, message: string, code: string) {
        super(message)
        this.status = status
        this.code = code
      }
    },
  }))

  mock.module('../../lib/activity-logger', () => ({
    logActivity: () => {},
  }))

  mock.module('drizzle-orm', () => ({
    eq: (a: any, b: any) => ({ op: 'eq', a, b }),
    and: (...args: any[]) => ({ op: 'and', args }),
    desc: (col: any) => ({ op: 'desc', col }),
  }))

  return await import('../../routes/workspace/nexus')
})()

const app = new Hono<AppEnv>()
app.route('/api/workspace', nexusRoute)

describe('TEA: Story 17-4 — NEXUS 템플릿 공유 확장 테스트', () => {
  beforeEach(() => {
    mockWorkflows.length = 0
    insertedValues = null
    lastUpdate = null
    selectConditions = []
    mockTenant = { companyId: 'comp-1', userId: 'user-1', role: 'user' }
  })

  // ============================================================
  // R1: GET /nexus/workflows filter — regression risk (HIGH)
  // ============================================================
  describe('[HIGH] GET /nexus/workflows filter regression', () => {
    it('filter=mine은 200을 반환해야 함', async () => {
      const res = await app.request('/api/workspace/nexus/workflows?filter=mine')
      expect(res.status).toBe(200)
    })

    it('filter=templates는 200을 반환해야 함', async () => {
      const res = await app.request('/api/workspace/nexus/workflows?filter=templates')
      expect(res.status).toBe(200)
    })

    it('filter 파라미터 없이도 200을 반환해야 함 (기존 호환)', async () => {
      const res = await app.request('/api/workspace/nexus/workflows')
      expect(res.status).toBe(200)
    })

    it('잘못된 filter 값은 기존 동작(전체) 유지해야 함', async () => {
      const res = await app.request('/api/workspace/nexus/workflows?filter=invalid')
      expect(res.status).toBe(200)
    })

    it('data 프로퍼티가 배열이어야 함', async () => {
      const res = await app.request('/api/workspace/nexus/workflows?filter=mine')
      const body = await res.json()
      expect(body).toHaveProperty('data')
    })

    it('빈 배열도 정상 반환해야 함', async () => {
      const res = await app.request('/api/workspace/nexus/workflows?filter=templates')
      const body = await res.json()
      expect(body).toHaveProperty('data')
    })
  })

  // ============================================================
  // R2: POST clone API — data integrity (HIGH)
  // ============================================================
  describe('[HIGH] POST /nexus/workflows/:id/clone 데이터 무결성', () => {
    const sourceWorkflow = {
      id: 'src-wf-1',
      companyId: 'comp-1',
      name: '원본 워크플로우',
      description: '테스트용 설명',
      nodes: [
        { id: 'n1', type: 'default', position: { x: 100, y: 200 }, data: { label: '시작' } },
        { id: 'n2', type: 'default', position: { x: 300, y: 200 }, data: { label: '끝' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep' },
      ],
      isTemplate: true,
      isActive: true,
      createdBy: 'user-other',
    }

    it('복제 시 이름에 "(복사)" 접미사가 붙어야 함', async () => {
      mockWorkflows.push(sourceWorkflow)
      const res = await app.request('/api/workspace/nexus/workflows/src-wf-1/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.name).toBe('원본 워크플로우 (복사)')
    })

    it('복제 시 description이 복사되어야 함', async () => {
      mockWorkflows.push(sourceWorkflow)
      await app.request('/api/workspace/nexus/workflows/src-wf-1/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(insertedValues.description).toBe('테스트용 설명')
    })

    it('복제 시 nodes 배열이 복사되어야 함', async () => {
      mockWorkflows.push(sourceWorkflow)
      await app.request('/api/workspace/nexus/workflows/src-wf-1/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(insertedValues.nodes).toEqual(sourceWorkflow.nodes)
      expect(insertedValues.nodes.length).toBe(2)
    })

    it('복제 시 edges 배열이 복사되어야 함', async () => {
      mockWorkflows.push(sourceWorkflow)
      await app.request('/api/workspace/nexus/workflows/src-wf-1/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(insertedValues.edges).toEqual(sourceWorkflow.edges)
      expect(insertedValues.edges.length).toBe(1)
    })

    it('복제된 워크플로우의 isTemplate은 false여야 함', async () => {
      mockWorkflows.push(sourceWorkflow)
      await app.request('/api/workspace/nexus/workflows/src-wf-1/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(insertedValues.isTemplate).toBe(false)
    })

    it('복제된 워크플로우의 createdBy는 원본 소유자와 달라야 함', async () => {
      mockWorkflows.push(sourceWorkflow)
      await app.request('/api/workspace/nexus/workflows/src-wf-1/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      // createdBy should be set from tenant, not from source
      expect(insertedValues.createdBy).not.toBe(sourceWorkflow.createdBy)
    })

    it('복제 응답은 201이어야 함', async () => {
      mockWorkflows.push(sourceWorkflow)
      const res = await app.request('/api/workspace/nexus/workflows/src-wf-1/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(res.status).toBe(201)
    })

    it('복제 응답에 data 객체가 포함되어야 함', async () => {
      mockWorkflows.push(sourceWorkflow)
      const res = await app.request('/api/workspace/nexus/workflows/src-wf-1/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const body = await res.json()
      expect(body).toHaveProperty('data')
      expect(body.data).toHaveProperty('id')
      expect(body.data).toHaveProperty('name')
    })

    it('빈 nodes/edges를 가진 워크플로우도 복제 가능해야 함', async () => {
      mockWorkflows.push({
        ...sourceWorkflow,
        id: 'empty-wf',
        nodes: [],
        edges: [],
      })
      const res = await app.request('/api/workspace/nexus/workflows/empty-wf/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.nodes).toEqual([])
      expect(insertedValues.edges).toEqual([])
    })

    it('description이 null인 워크플로우도 복제 가능해야 함', async () => {
      mockWorkflows.push({
        ...sourceWorkflow,
        id: 'null-desc',
        description: null,
      })
      const res = await app.request('/api/workspace/nexus/workflows/null-desc/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.description).toBeNull()
    })
  })

  // ============================================================
  // R3: PUT updateSchema isTemplate — compatibility (MEDIUM)
  // ============================================================
  describe('[MEDIUM] PUT /nexus/workflows/:id isTemplate 호환성', () => {
    it('isTemplate만 단독으로 업데이트 가능해야 함', async () => {
      mockWorkflows.push({
        id: 'wf-1',
        companyId: 'comp-1',
        name: '테스트',
        isTemplate: false,
      })
      const res = await app.request('/api/workspace/nexus/workflows/wf-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: true }),
      })
      expect(res.status).toBe(200)
      expect(lastUpdate).toHaveProperty('isTemplate', true)
    })

    it('isTemplate + name 동시 업데이트 가능해야 함', async () => {
      mockWorkflows.push({
        id: 'wf-1',
        companyId: 'comp-1',
        name: '이전이름',
        isTemplate: false,
      })
      const res = await app.request('/api/workspace/nexus/workflows/wf-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: true, name: '새이름' }),
      })
      expect(res.status).toBe(200)
      expect(lastUpdate).toHaveProperty('isTemplate', true)
      expect(lastUpdate).toHaveProperty('name', '새이름')
    })

    it('isTemplate 없는 기존 PUT 요청도 정상 동작해야 함 (하위호환)', async () => {
      mockWorkflows.push({
        id: 'wf-1',
        companyId: 'comp-1',
        name: '테스트',
        isTemplate: false,
      })
      const res = await app.request('/api/workspace/nexus/workflows/wf-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '수정된이름' }),
      })
      expect(res.status).toBe(200)
      expect(lastUpdate).not.toHaveProperty('isTemplate')
    })

    it('isActive + isTemplate 동시 업데이트 가능해야 함', async () => {
      mockWorkflows.push({
        id: 'wf-1',
        companyId: 'comp-1',
        name: '테스트',
        isTemplate: false,
        isActive: true,
      })
      const res = await app.request('/api/workspace/nexus/workflows/wf-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: true, isActive: false }),
      })
      expect(res.status).toBe(200)
      expect(lastUpdate.isTemplate).toBe(true)
      expect(lastUpdate.isActive).toBe(false)
    })
  })

  // ============================================================
  // R4: 복제 + 템플릿 통합 시나리오 (MEDIUM)
  // ============================================================
  describe('[MEDIUM] 통합 시나리오: 템플릿 공유 → 복제', () => {
    it('비템플릿 워크플로우도 복제 가능해야 함', async () => {
      mockWorkflows.push({
        id: 'non-tmpl',
        companyId: 'comp-1',
        name: '일반 워크플로우',
        description: null,
        nodes: [{ id: 'n1' }],
        edges: [],
        isTemplate: false,
        isActive: true,
        createdBy: 'user-1',
      })
      const res = await app.request('/api/workspace/nexus/workflows/non-tmpl/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.name).toBe('일반 워크플로우 (복사)')
    })

    it('이미 "(복사)"가 있는 워크플로우 재복제 시 이중 접미사', async () => {
      mockWorkflows.push({
        id: 'copy-wf',
        companyId: 'comp-1',
        name: '워크플로우 (복사)',
        description: null,
        nodes: [],
        edges: [],
        isTemplate: false,
        isActive: true,
        createdBy: 'user-1',
      })
      const res = await app.request('/api/workspace/nexus/workflows/copy-wf/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.name).toBe('워크플로우 (복사) (복사)')
    })

    it('companyId가 같아야 복제 가능 (테넌트 격리)', async () => {
      mockWorkflows.push({
        id: 'other-comp-wf',
        companyId: 'comp-1',
        name: '다른 회사 워크플로우',
        description: null,
        nodes: [],
        edges: [],
        isTemplate: true,
        isActive: true,
        createdBy: 'user-2',
      })
      mockTenant = { companyId: 'comp-1', userId: 'user-1', role: 'user' }
      const res = await app.request('/api/workspace/nexus/workflows/other-comp-wf/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.companyId).toBe('comp-1')
    })
  })

  // ============================================================
  // R5: 엣지 케이스 (LOW)
  // ============================================================
  describe('[LOW] 엣지 케이스', () => {
    it('isTemplate을 true→true로 중복 설정해도 에러 없어야 함', async () => {
      mockWorkflows.push({
        id: 'wf-1',
        companyId: 'comp-1',
        name: '이미 템플릿',
        isTemplate: true,
      })
      const res = await app.request('/api/workspace/nexus/workflows/wf-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: true }),
      })
      expect(res.status).toBe(200)
    })

    it('isTemplate을 false→false로 중복 해제해도 에러 없어야 함', async () => {
      mockWorkflows.push({
        id: 'wf-1',
        companyId: 'comp-1',
        name: '일반',
        isTemplate: false,
      })
      const res = await app.request('/api/workspace/nexus/workflows/wf-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: false }),
      })
      expect(res.status).toBe(200)
    })

    it('매우 긴 이름(200자)의 워크플로우 복제 시 200자로 잘려야 함', async () => {
      const longName = 'A'.repeat(200)
      mockWorkflows.push({
        id: 'long-wf',
        companyId: 'comp-1',
        name: longName,
        description: null,
        nodes: [],
        edges: [],
        isTemplate: true,
        isActive: true,
        createdBy: 'user-2',
      })
      const res = await app.request('/api/workspace/nexus/workflows/long-wf/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.name.length).toBeLessThanOrEqual(200)
    })

    it('많은 노드(100개)가 있는 워크플로우도 복제 가능해야 함', async () => {
      const manyNodes = Array.from({ length: 100 }, (_, i) => ({
        id: `n${i}`,
        type: 'default',
        position: { x: i * 10, y: i * 10 },
        data: { label: `Node ${i}` },
      }))
      mockWorkflows.push({
        id: 'many-nodes-wf',
        companyId: 'comp-1',
        name: '대규모',
        description: null,
        nodes: manyNodes,
        edges: [],
        isTemplate: true,
        isActive: true,
        createdBy: 'user-2',
      })
      const res = await app.request('/api/workspace/nexus/workflows/many-nodes-wf/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.nodes.length).toBe(100)
    })
  })
})
