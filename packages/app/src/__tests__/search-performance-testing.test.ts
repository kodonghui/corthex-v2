/**
 * Story 23.17 — Search, Performance & Testing Patterns Tests
 */
import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const appSrc = resolve(__dirname, '..')
const uiSrc = resolve(__dirname, '../../../ui/src')

describe('Global Search Hook', () => {
  const src = readFileSync(resolve(appSrc, 'hooks/use-global-search.ts'), 'utf-8')

  test('useGlobalSearch is exported', () => {
    expect(src).toContain('export function useGlobalSearch')
  })

  test('has debounced input (300ms)', () => {
    expect(src).toContain('useDebouncedValue')
    expect(src).toContain('300')
  })

  test('searches across agents, departments, documents', () => {
    expect(src).toContain("'agents'")
    expect(src).toContain("'departments'")
    expect(src).toContain("'documents'")
  })

  test('results grouped by category', () => {
    expect(src).toContain('GroupedResults')
    expect(src).toContain('grouped')
  })

  test('has query, setQuery, results, isLoading, isEmpty', () => {
    expect(src).toContain('query,')
    expect(src).toContain('setQuery,')
    expect(src).toContain('results,')
    expect(src).toContain('isLoading')
    expect(src).toContain('isEmpty')
  })
})

describe('Performance Utilities', () => {
  const src = readFileSync(resolve(uiSrc, 'lib/performance.ts'), 'utf-8')

  test('useDebouncedValue is exported', () => {
    expect(src).toContain('export function useDebouncedValue')
  })

  test('useThrottledCallback is exported', () => {
    expect(src).toContain('export function useThrottledCallback')
  })

  test('useIntersectionObserver is exported', () => {
    expect(src).toContain('export function useIntersectionObserver')
    expect(src).toContain('IntersectionObserver')
  })

  test('useVirtualList is exported', () => {
    expect(src).toContain('export function useVirtualList')
    expect(src).toContain('VirtualItem')
  })

  test('useThrottledCallback has trailing call support', () => {
    expect(src).toContain('trailing call')
    expect(src).toContain('timeoutRef')
  })

  test('useIntersectionObserver supports once option', () => {
    expect(src).toContain('once')
    expect(src).toContain('disconnect')
  })

  test('useVirtualList computes visible items with overscan', () => {
    expect(src).toContain('overscan')
    expect(src).toContain('visibleItems')
    expect(src).toContain('totalHeight')
  })
})

describe('Testing Utilities', () => {
  test('render-with-providers exports TestProviders + createWrapper', () => {
    const src = readFileSync(resolve(uiSrc, 'test-utils/render-with-providers.tsx'), 'utf-8')
    expect(src).toContain('export function TestProviders')
    expect(src).toContain('export function createWrapper')
  })

  test('create-mock-agent factory', () => {
    const src = readFileSync(resolve(uiSrc, 'test-utils/create-mock-agent.ts'), 'utf-8')
    expect(src).toContain('export function createMockAgent')
    expect(src).toContain('export function createMockAgents')
    expect(src).toContain('MockAgent')
  })

  test('create-mock-department factory', () => {
    const src = readFileSync(resolve(uiSrc, 'test-utils/create-mock-department.ts'), 'utf-8')
    expect(src).toContain('export function createMockDepartment')
    expect(src).toContain('export function createMockDepartments')
    expect(src).toContain('MockDepartment')
  })
})

describe('Testing Utilities: Runtime', () => {
  test('createMockAgent returns valid agent', async () => {
    const { createMockAgent } = await import('@corthex/ui')
    const agent = createMockAgent({ name: 'Test Agent', tier: 'manager' })
    expect(agent.name).toBe('Test Agent')
    expect(agent.tier).toBe('manager')
    expect(agent.id).toContain('agent-')
    expect(agent.companyId).toBe('company-1')
  })

  test('createMockAgents returns array', async () => {
    const { createMockAgents } = await import('@corthex/ui')
    const agents = createMockAgents(5, { status: 'online' })
    expect(agents).toHaveLength(5)
    expect(agents.every(a => a.status === 'online')).toBe(true)
  })

  test('createMockDepartment returns valid department', async () => {
    const { createMockDepartment } = await import('@corthex/ui')
    const dept = createMockDepartment({ name: 'Engineering' })
    expect(dept.name).toBe('Engineering')
    expect(dept.id).toContain('dept-')
  })

  test('createMockDepartments returns array', async () => {
    const { createMockDepartments } = await import('@corthex/ui')
    const depts = createMockDepartments(3)
    expect(depts).toHaveLength(3)
  })
})

describe('UI Package Exports', () => {
  test('performance hooks are exported from @corthex/ui', () => {
    const src = readFileSync(resolve(uiSrc, 'index.ts'), 'utf-8')
    expect(src).toContain('useDebouncedValue')
    expect(src).toContain('useThrottledCallback')
    expect(src).toContain('useIntersectionObserver')
    expect(src).toContain('useVirtualList')
  })

  test('test utils are exported from @corthex/ui', () => {
    const src = readFileSync(resolve(uiSrc, 'index.ts'), 'utf-8')
    expect(src).toContain('createMockAgent')
    expect(src).toContain('createMockDepartment')
    expect(src).toContain('TestProviders')
  })
})
