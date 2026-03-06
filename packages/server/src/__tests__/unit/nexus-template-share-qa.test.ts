/**
 * QA (Quinn) — Story 17-4: NEXUS 템플릿 공유
 * 기능 검증 + 엣지케이스 확인
 */
import { describe, it, expect, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import type { AppEnv } from '../../types'

// State
const mockWorkflows: any[] = []
let mockTenant = { companyId: 'comp-1', userId: 'user-1', role: 'user' as const }
let insertedValues: any = null
let lastUpdate: any = null

const { nexusRoute } = await (async () => {
  const { mock } = await import('bun:test')

  mock.module('../../db', () => ({
    db: {
      select: () => ({
        from: () => ({
          where: () => ({
            orderBy: () => mockWorkflows,
            limit: () => [mockWorkflows[0] || null],
          }),
        }),
      }),
      insert: () => ({
        values: (v: any) => {
          insertedValues = v
          return {
            returning: () => [{
              id: `qa-${Date.now()}`,
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
                ...mockWorkflows[0],
                ...s,
              }],
            }),
          }
        },
      }),
      delete: () => ({ where: () => ({}) }),
      transaction: async (fn: any) => {
        await fn({ delete: () => ({ where: () => ({}) }) })
      },
    },
  }))

  mock.module('../../db/schema', () => ({
    companies: { id: 'id' },
    departments: { id: 'id', companyId: 'company_id' },
    agents: { id: 'id', companyId: 'company_id' },
    canvasLayouts: { id: 'id', companyId: 'company_id', isDefault: 'is_default' },
    nexusWorkflows: {
      id: 'id', companyId: 'company_id', name: 'name', description: 'description',
      nodes: 'nodes', edges: 'edges', isTemplate: 'is_template', isActive: 'is_active',
      createdBy: 'created_by', updatedAt: 'updated_at',
    },
    nexusExecutions: {
      id: 'id', companyId: 'company_id', workflowId: 'workflow_id',
      status: 'status', startedAt: 'started_at',
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
      status: number; code: string
      constructor(s: number, m: string, c: string) { super(m); this.status = s; this.code = c }
    },
  }))

  mock.module('../../lib/activity-logger', () => ({ logActivity: () => {} }))
  mock.module('drizzle-orm', () => ({
    eq: (a: any, b: any) => ({ op: 'eq', a, b }),
    and: (...args: any[]) => ({ op: 'and', args }),
    desc: (col: any) => ({ op: 'desc', col }),
  }))

  return await import('../../routes/workspace/nexus')
})()

const app = new Hono<AppEnv>()
app.route('/api/workspace', nexusRoute)

describe('QA: Story 17-4 NEXUS 템플릿 공유 — 기능 검증', () => {
  beforeEach(() => {
    mockWorkflows.length = 0
    insertedValues = null
    lastUpdate = null
    mockTenant = { companyId: 'comp-1', userId: 'user-1', role: 'user' }
  })

  // ========== AC#1: 템플릿으로 공유 ==========
  describe('AC#1: 워크플로우를 템플릿으로 공유', () => {
    it('PUT으로 isTemplate=true 설정 가능', async () => {
      mockWorkflows.push({ id: 'wf-1', companyId: 'comp-1', name: 'WF', isTemplate: false })
      const res = await app.request('/api/workspace/nexus/workflows/wf-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: true }),
      })
      expect(res.status).toBe(200)
      expect(lastUpdate.isTemplate).toBe(true)
    })
  })

  // ========== AC#2: 공유 해제 ==========
  describe('AC#2: 템플릿 공유 해제', () => {
    it('PUT으로 isTemplate=false 설정 가능', async () => {
      mockWorkflows.push({ id: 'wf-1', companyId: 'comp-1', name: 'WF', isTemplate: true })
      const res = await app.request('/api/workspace/nexus/workflows/wf-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: false }),
      })
      expect(res.status).toBe(200)
      expect(lastUpdate.isTemplate).toBe(false)
    })
  })

  // ========== AC#3, #4: 필터 ==========
  describe('AC#3,#4: 워크플로우 목록 필터', () => {
    it('filter=mine 요청 성공', async () => {
      const res = await app.request('/api/workspace/nexus/workflows?filter=mine')
      expect(res.status).toBe(200)
    })

    it('filter=templates 요청 성공', async () => {
      const res = await app.request('/api/workspace/nexus/workflows?filter=templates')
      expect(res.status).toBe(200)
    })

    it('filter 없는 기존 요청도 정상 동작', async () => {
      const res = await app.request('/api/workspace/nexus/workflows')
      expect(res.status).toBe(200)
    })
  })

  // ========== AC#5: 복제 ==========
  describe('AC#5: 워크플로우 복제', () => {
    it('복제 시 이름에 (복사) 추가', async () => {
      mockWorkflows.push({
        id: 'src', companyId: 'comp-1', name: '원본',
        description: '설명', nodes: [{ id: 'n1' }], edges: [{ id: 'e1' }],
        isTemplate: true, isActive: true, createdBy: 'user-2',
      })
      const res = await app.request('/api/workspace/nexus/workflows/src/clone', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.name).toBe('원본 (복사)')
    })

    it('복제 시 nodes/edges 복사됨', async () => {
      const nodes = [{ id: 'a' }, { id: 'b' }]
      const edges = [{ id: 'e', source: 'a', target: 'b' }]
      mockWorkflows.push({
        id: 'src', companyId: 'comp-1', name: 'WF',
        description: null, nodes, edges,
        isTemplate: false, isActive: true, createdBy: 'user-1',
      })
      await app.request('/api/workspace/nexus/workflows/src/clone', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      expect(insertedValues.nodes).toEqual(nodes)
      expect(insertedValues.edges).toEqual(edges)
    })

    it('복제된 워크플로우는 isTemplate=false', async () => {
      mockWorkflows.push({
        id: 'tmpl', companyId: 'comp-1', name: '템플릿',
        description: null, nodes: [], edges: [],
        isTemplate: true, isActive: true, createdBy: 'user-2',
      })
      await app.request('/api/workspace/nexus/workflows/tmpl/clone', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      expect(insertedValues.isTemplate).toBe(false)
    })

    it('복제된 워크플로우의 companyId는 요청 유저의 companyId', async () => {
      mockWorkflows.push({
        id: 'other', companyId: 'comp-1', name: 'Other',
        description: null, nodes: [], edges: [],
        isTemplate: true, isActive: true, createdBy: 'original-user',
      })
      await app.request('/api/workspace/nexus/workflows/other/clone', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      expect(insertedValues.companyId).toBe('comp-1')
    })
  })

  // ========== AC#6: 복제 후 자동 진입 (응답 데이터 확인) ==========
  describe('AC#6: 복제 응답에 새 워크플로우 ID 포함', () => {
    it('201 응답에 새 워크플로우 data 포함', async () => {
      mockWorkflows.push({
        id: 'src', companyId: 'comp-1', name: 'WF',
        description: null, nodes: [], edges: [],
        isTemplate: false, isActive: true, createdBy: 'user-1',
      })
      const res = await app.request('/api/workspace/nexus/workflows/src/clone', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      const body = await res.json()
      expect(body.data).toHaveProperty('id')
      expect(body.data.id).toBeTruthy()
    })
  })

  // ========== AC#8: 자기 워크플로우도 복제 가능 ==========
  describe('AC#8: 자기 워크플로우 복제', () => {
    it('같은 유저가 만든 워크플로우도 복제 가능', async () => {
      mockWorkflows.push({
        id: 'mine', companyId: 'comp-1', name: '내 워크플로우',
        description: '내가 만든', nodes: [{ id: 'x' }], edges: [],
        isTemplate: false, isActive: true, createdBy: 'user-1',
      })
      const res = await app.request('/api/workspace/nexus/workflows/mine/clone', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.name).toBe('내 워크플로우 (복사)')
    })
  })

  // ========== AC#9: 빌드 검증 (이미 수동으로 확인됨) ==========

  // ========== 엣지케이스 ==========
  describe('엣지케이스: 한글 이름 + 특수문자', () => {
    it('한글 이름 워크플로우 복제', async () => {
      mockWorkflows.push({
        id: 'kor', companyId: 'comp-1', name: '한글 워크플로우 🚀',
        description: null, nodes: [], edges: [],
        isTemplate: true, isActive: true, createdBy: 'user-2',
      })
      const res = await app.request('/api/workspace/nexus/workflows/kor/clone', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      expect(res.status).toBe(201)
      expect(insertedValues.name).toBe('한글 워크플로우 🚀 (복사)')
    })
  })

  describe('엣지케이스: 복잡한 노드 구조 복제', () => {
    it('nested data가 있는 노드도 복제됨', async () => {
      const complexNodes = [{
        id: 'n1', type: 'custom',
        position: { x: 50, y: 100 },
        data: {
          label: '복잡한 노드',
          config: { retries: 3, timeout: 5000 },
          inputs: ['a', 'b'],
        },
      }]
      mockWorkflows.push({
        id: 'complex', companyId: 'comp-1', name: '복잡',
        description: null, nodes: complexNodes, edges: [],
        isTemplate: true, isActive: true, createdBy: 'user-2',
      })
      await app.request('/api/workspace/nexus/workflows/complex/clone', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      expect(insertedValues.nodes).toEqual(complexNodes)
      expect(insertedValues.nodes[0].data.config.retries).toBe(3)
    })
  })
})
