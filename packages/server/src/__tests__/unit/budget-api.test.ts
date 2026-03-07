import { describe, it, expect, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import type { AppEnv } from '../../types'

// === Mock Setup with async pattern (must run before route import) ===

const mockSelectResults: Array<Array<Record<string, unknown>>> = []
const mockUpdateCalls: Array<{ settings: unknown }> = []
let selectCallIdx = 0

const { budgetRoute } = await (async () => {
  const { mock } = await import('bun:test')

  mock.module('../../db', () => ({
    db: {
      select: () => ({
        from: () => ({
          where: () => {
            const idx = selectCallIdx++
            const result = mockSelectResults[idx] ?? []
            const p = Promise.resolve(result) as any
            p.limit = () => Promise.resolve(result)
            return p
          },
        }),
      }),
      update: () => ({
        set: (values: Record<string, unknown>) => {
          mockUpdateCalls.push({ settings: values.settings })
          return {
            where: () => Promise.resolve(),
          }
        },
      }),
    },
  }))

  mock.module('../../db/schema', () => ({
    companies: { id: 'id', settings: 'settings' },
    costRecords: { companyId: 'company_id', costUsdMicro: 'cost_usd_micro', createdAt: 'created_at' },
  }))

  mock.module('../../lib/event-bus', () => ({
    eventBus: { emit: () => {} },
  }))

  mock.module('../../lib/cost-tracker', () => ({
    microToUsd: (micro: number) => micro / 1_000_000,
  }))

  mock.module('drizzle-orm', () => ({
    eq: (...args: unknown[]) => ({ type: 'eq', args }),
    and: (...args: unknown[]) => ({ type: 'and', args }),
    gte: (...args: unknown[]) => ({ type: 'gte', args }),
    sum: (col: unknown) => ({ mapWith: () => col }),
  }))

  mock.module('../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
      c.set('tenant', { companyId: 'test-company-id', userId: 'test-user-id', role: 'admin' })
      await next()
    },
    adminOnly: async (_c: any, next: any) => await next(),
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

  return import('../../routes/admin/budget')
})()

// === Test App ===

const app = new Hono<AppEnv>()
app.route('/api/admin', budgetRoute)

// === Helpers ===

function setSelectResults(...results: Array<Array<Record<string, unknown>>>) {
  mockSelectResults.length = 0
  mockSelectResults.push(...results)
  selectCallIdx = 0
  mockUpdateCalls.length = 0
}

// === Tests ===

describe('Budget API', () => {
  beforeEach(() => {
    selectCallIdx = 0
    mockSelectResults.length = 0
    mockUpdateCalls.length = 0
  })

  describe('GET /api/admin/budget', () => {
    it('returns default config when no settings', async () => {
      setSelectResults([]) // loadBudgetConfig: no company found
      const res = await app.request('/api/admin/budget', { method: 'GET' })
      expect(res.status).toBe(200)
      const json = await res.json() as any
      expect(json.success).toBe(true)
      expect(json.data.monthlyBudget).toBe(0)
      expect(json.data.dailyBudget).toBe(0)
      expect(json.data.warningThreshold).toBe(80)
      expect(json.data.autoBlock).toBe(true)
    })

    it('returns stored budget config', async () => {
      setSelectResults([{
        settings: {
          budgetConfig: {
            monthlyBudget: 500_000_000,
            dailyBudget: 20_000_000,
            warningThreshold: 90,
            autoBlock: false,
          },
        },
      }])
      const res = await app.request('/api/admin/budget', { method: 'GET' })
      const json = await res.json() as any
      expect(json.success).toBe(true)
      expect(json.data.monthlyBudget).toBe(500_000_000)
      expect(json.data.dailyBudget).toBe(20_000_000)
      expect(json.data.warningThreshold).toBe(90)
      expect(json.data.autoBlock).toBe(false)
    })

    it('returns defaults when settings exist but no budgetConfig', async () => {
      setSelectResults([{ settings: { dashboardQuickActions: [] } }])
      const res = await app.request('/api/admin/budget', { method: 'GET' })
      const json = await res.json() as any
      expect(json.data.monthlyBudget).toBe(0)
      expect(json.data.autoBlock).toBe(true)
    })
  })

  describe('PUT /api/admin/budget', () => {
    it('updates budget config', async () => {
      setSelectResults(
        [{ settings: { dashboardQuickActions: [] } }], // loadBudgetConfig (from GET in route)
      )

      const res = await app.request('/api/admin/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyBudget: 300_000_000,
          warningThreshold: 70,
        }),
      })

      expect(res.status).toBe(200)
      const json = await res.json() as any
      expect(json.success).toBe(true)
      expect(json.data.monthlyBudget).toBe(300_000_000)
      expect(json.data.warningThreshold).toBe(70)
    })

    it('merges with existing budget config preserving other settings', async () => {
      setSelectResults([{
        settings: {
          dashboardQuickActions: [{ id: 'a' }],
          budgetConfig: {
            monthlyBudget: 500_000_000,
            warningThreshold: 80,
            autoBlock: true,
          },
        },
      }])

      const res = await app.request('/api/admin/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warningThreshold: 95 }),
      })

      const json = await res.json() as any
      expect(json.data.monthlyBudget).toBe(500_000_000) // preserved
      expect(json.data.warningThreshold).toBe(95)        // updated
      expect(json.data.autoBlock).toBe(true)              // preserved

      // Verify existing settings preserved in DB update
      expect(mockUpdateCalls.length).toBe(1)
      const updatedSettings = mockUpdateCalls[0].settings as Record<string, unknown>
      expect(updatedSettings.dashboardQuickActions).toBeDefined()
    })

    it('rejects invalid warningThreshold > 100', async () => {
      const res = await app.request('/api/admin/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warningThreshold: 150 }),
      })
      expect(res.status).toBe(400)
    })

    it('rejects negative monthlyBudget', async () => {
      const res = await app.request('/api/admin/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyBudget: -100 }),
      })
      expect(res.status).toBe(400)
    })

    it('returns 404 when company not found', async () => {
      setSelectResults([]) // no company row
      const res = await app.request('/api/admin/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyBudget: 100_000_000 }),
      })
      expect(res.status).toBe(404)
    })

    it('allows empty body', async () => {
      setSelectResults([{ settings: { budgetConfig: { monthlyBudget: 100 } } }])
      const res = await app.request('/api/admin/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      expect(res.status).toBe(200)
    })

    it('accepts autoBlock=false', async () => {
      setSelectResults([{ settings: {} }])
      const res = await app.request('/api/admin/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoBlock: false }),
      })
      const json = await res.json() as any
      expect(json.data.autoBlock).toBe(false)
    })

    it('accepts dailyBudget', async () => {
      setSelectResults([{ settings: {} }])
      const res = await app.request('/api/admin/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyBudget: 10_000_000 }),
      })
      const json = await res.json() as any
      expect(json.data.dailyBudget).toBe(10_000_000)
    })
  })
})
