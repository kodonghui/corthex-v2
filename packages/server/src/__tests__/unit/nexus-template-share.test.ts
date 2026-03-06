import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import type { AppEnv } from '../../types'

// Mock DB and auth
const mockWorkflows: any[] = []
let mockTenant = { companyId: 'comp-1', userId: 'user-1', role: 'user' as const }
let insertedValues: any = null
let lastUpdate: any = null

// Mock modules
const { nexusRoute } = await (async () => {
  const { mock } = await import('bun:test')

  mock.module('../../db', () => ({
    db: {
      select: () => ({
        from: () => ({
          where: (condition: any) => ({
            orderBy: () => ({ data: mockWorkflows }),
            limit: () => [mockWorkflows[0] || null],
          }),
        }),
      }),
      insert: () => ({
        values: (v: any) => {
          insertedValues = v
          return {
            returning: () => [{
              id: 'new-wf-1',
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
      isTemplate: 'is_template',
      isActive: 'is_active',
      createdBy: 'created_by',
      updatedAt: 'updated_at',
    },
    nexusExecutions: {
      id: 'id',
      companyId: 'company_id',
      workflowId: 'workflow_id',
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

  // Need to re-mock drizzle-orm operators
  mock.module('drizzle-orm', () => ({
    eq: (a: any, b: any) => ({ op: 'eq', a, b }),
    and: (...args: any[]) => ({ op: 'and', args }),
    desc: (col: any) => ({ op: 'desc', col }),
  }))

  return await import('../../routes/workspace/nexus')
})()

// Build test app
const app = new Hono<AppEnv>()
app.route('/api/workspace', nexusRoute)

describe('Story 17-4: NEXUS 템플릿 공유', () => {
  beforeEach(() => {
    mockWorkflows.length = 0
    insertedValues = null
    lastUpdate = null
    mockTenant = { companyId: 'comp-1', userId: 'user-1', role: 'user' }
  })

  describe('GET /nexus/workflows — 필터 파라미터', () => {
    it('filter=mine 쿼리 파라미터를 처리해야 함', async () => {
      const res = await app.request('/api/workspace/nexus/workflows?filter=mine', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveProperty('data')
    })

    it('filter=templates 쿼리 파라미터를 처리해야 함', async () => {
      const res = await app.request('/api/workspace/nexus/workflows?filter=templates', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveProperty('data')
    })

    it('filter 없이도 동작해야 함 (전체 반환)', async () => {
      const res = await app.request('/api/workspace/nexus/workflows', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(200)
    })
  })

  describe('PUT /nexus/workflows/:id — isTemplate 필드', () => {
    it('isTemplate을 true로 설정할 수 있어야 함', async () => {
      mockWorkflows.push({
        id: 'wf-1',
        companyId: 'comp-1',
        name: '테스트 워크플로우',
        isTemplate: false,
        isActive: true,
      })

      const res = await app.request('/api/workspace/nexus/workflows/wf-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: true }),
      })
      expect(res.status).toBe(200)
      expect(lastUpdate).toHaveProperty('isTemplate', true)
    })

    it('isTemplate을 false로 해제할 수 있어야 함', async () => {
      mockWorkflows.push({
        id: 'wf-1',
        companyId: 'comp-1',
        name: '테스트 워크플로우',
        isTemplate: true,
      })

      const res = await app.request('/api/workspace/nexus/workflows/wf-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: false }),
      })
      expect(res.status).toBe(200)
      expect(lastUpdate).toHaveProperty('isTemplate', false)
    })
  })

  describe('POST /nexus/workflows/:id/clone — 워크플로우 복제', () => {
    it('워크플로우를 복제하고 201을 반환해야 함', async () => {
      mockWorkflows.push({
        id: 'wf-source',
        companyId: 'comp-1',
        name: '원본 워크플로우',
        description: '설명',
        nodes: [{ id: 'n1', type: 'default', position: { x: 0, y: 0 }, data: { label: '노드1' } }],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
        isTemplate: true,
        isActive: true,
        createdBy: 'user-2',
      })

      const res = await app.request('/api/workspace/nexus/workflows/wf-source/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      expect(res.status).toBe(201)

      const body = await res.json()
      expect(body.data).toBeTruthy()
      expect(insertedValues).toBeTruthy()
      expect(insertedValues.name).toBe('원본 워크플로우 (복사)')
      expect(insertedValues.description).toBe('설명')
      expect(insertedValues.isTemplate).toBe(false)
      expect(insertedValues.createdBy).toBe('user-1')
    })

    it('복제 시 nodes와 edges가 복사되어야 함', async () => {
      const sourceNodes = [{ id: 'n1' }, { id: 'n2' }]
      const sourceEdges = [{ id: 'e1', source: 'n1', target: 'n2' }]

      mockWorkflows.push({
        id: 'wf-source',
        companyId: 'comp-1',
        name: '소스',
        description: null,
        nodes: sourceNodes,
        edges: sourceEdges,
        isTemplate: true,
        isActive: true,
        createdBy: 'user-2',
      })

      const res = await app.request('/api/workspace/nexus/workflows/wf-source/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      expect(res.status).toBe(201)
      expect(insertedValues.nodes).toEqual(sourceNodes)
      expect(insertedValues.edges).toEqual(sourceEdges)
    })

    it('복제된 워크플로우는 isTemplate=false여야 함', async () => {
      mockWorkflows.push({
        id: 'wf-tmpl',
        companyId: 'comp-1',
        name: '템플릿',
        description: null,
        nodes: [],
        edges: [],
        isTemplate: true,
        isActive: true,
        createdBy: 'user-2',
      })

      const res = await app.request('/api/workspace/nexus/workflows/wf-tmpl/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      expect(res.status).toBe(201)
      expect(insertedValues.isTemplate).toBe(false)
    })
  })

  describe('통합 시나리오', () => {
    it('워크플로우 생성 → 템플릿으로 공유 → 다른 유저가 복제 흐름', async () => {
      // 1. 워크플로우 생성 (기존 POST)
      const createRes = await app.request('/api/workspace/nexus/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '공유할 워크플로우' }),
      })
      expect(createRes.status).toBe(201)
      const created = (await createRes.json()).data
      expect(created.name).toBe('공유할 워크플로우')

      // 2. 템플릿으로 공유 (PUT isTemplate: true)
      mockWorkflows.push({
        id: created.id,
        companyId: 'comp-1',
        name: '공유할 워크플로우',
        isTemplate: false,
        isActive: true,
      })

      const shareRes = await app.request(`/api/workspace/nexus/workflows/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: true }),
      })
      expect(shareRes.status).toBe(200)
      expect(lastUpdate.isTemplate).toBe(true)
    })

    it('복제된 워크플로우의 createdBy는 현재 유저여야 함', async () => {
      mockWorkflows.push({
        id: 'wf-src2',
        companyId: 'comp-1',
        name: '다른 유저 워크플로우',
        description: null,
        nodes: [],
        edges: [],
        isTemplate: true,
        isActive: true,
        createdBy: 'user-other',
      })

      mockTenant = { companyId: 'comp-1', userId: 'user-me', role: 'user' }
      const res = await app.request('/api/workspace/nexus/workflows/wf-src2/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      expect(res.status).toBe(201)
      expect(insertedValues.createdBy).toBe('user-me')
    })
  })
})
