import { describe, it, expect } from 'bun:test'
import {
  parsePaginationParams,
  parseDateFilter,
} from '../../services/activity-log-service'

describe('Activity Tabs API - parsePaginationParams', () => {
  it('returns defaults when no params provided', () => {
    const result = parsePaginationParams({})
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 })
  })

  it('parses valid page and limit', () => {
    const result = parsePaginationParams({ page: '3', limit: '50' })
    expect(result).toEqual({ page: 3, limit: 50, offset: 100 })
  })

  it('caps limit at 100', () => {
    const result = parsePaginationParams({ limit: '500' })
    expect(result).toEqual({ page: 1, limit: 100, offset: 0 })
  })

  it('ensures page is at least 1', () => {
    const result = parsePaginationParams({ page: '-5' })
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 })
  })

  it('treats limit 0 as default (falsy fallback)', () => {
    const result = parsePaginationParams({ limit: '0' })
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 })
  })

  it('handles non-numeric values gracefully', () => {
    const result = parsePaginationParams({ page: 'abc', limit: 'xyz' })
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 })
  })

  it('calculates correct offset for page 5 limit 10', () => {
    const result = parsePaginationParams({ page: '5', limit: '10' })
    expect(result).toEqual({ page: 5, limit: 10, offset: 40 })
  })
})

describe('Activity Tabs API - parseDateFilter', () => {
  it('returns empty array when no dates provided', () => {
    const result = parseDateFilter()
    expect(result).toEqual([])
  })

  it('returns gte condition for startDate', () => {
    const result = parseDateFilter('2026-03-01')
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('gte')
    expect(result[0].date).toBeInstanceOf(Date)
  })

  it('returns lte condition for endDate with end of day', () => {
    const result = parseDateFilter(undefined, '2026-03-07')
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('lte')
    expect(result[0].date.getHours()).toBe(23)
    expect(result[0].date.getMinutes()).toBe(59)
    expect(result[0].date.getSeconds()).toBe(59)
  })

  it('returns both conditions when both dates provided', () => {
    const result = parseDateFilter('2026-03-01', '2026-03-07')
    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('gte')
    expect(result[1].type).toBe('lte')
  })
})

describe('Activity Tabs API - Route structure', () => {
  it('activity-tabs module exports activityTabsRoute', async () => {
    const mod = await import('../../routes/workspace/activity-tabs')
    expect(mod.activityTabsRoute).toBeDefined()
  })

  it('activity-log-service exports all 4 query functions', async () => {
    const mod = await import('../../services/activity-log-service')
    expect(typeof mod.getAgentActivity).toBe('function')
    expect(typeof mod.getDelegations).toBe('function')
    expect(typeof mod.getQualityReviews).toBe('function')
    expect(typeof mod.getToolInvocations).toBe('function')
  })

  it('activity-log-service exports pagination helpers', async () => {
    const mod = await import('../../services/activity-log-service')
    expect(typeof mod.parsePaginationParams).toBe('function')
    expect(typeof mod.parseDateFilter).toBe('function')
  })
})

describe('Activity Tabs API - Response format validation', () => {
  it('pagination params produce correct offset formula', () => {
    // Verify: offset = (page - 1) * limit
    for (let page = 1; page <= 5; page++) {
      for (const limit of [10, 20, 50]) {
        const result = parsePaginationParams({ page: String(page), limit: String(limit) })
        expect(result.offset).toBe((page - 1) * limit)
      }
    }
  })
})
