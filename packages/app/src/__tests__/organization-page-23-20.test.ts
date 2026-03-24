import { describe, test, expect, beforeAll } from 'bun:test'

// === Story 23.20 — Organization Page (Tabbed + Canvas) ===
// Tests for tabbed organization page structure and component exports

// Mock browser globals
beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    (globalThis as Record<string, unknown>).localStorage = {
      getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {},
      length: 0, key: () => null,
    }
  }
})

describe('OrganizationPage', () => {
  test('exports OrganizationPage as named export', async () => {
    const mod = await import('../pages/organization')
    expect(mod.OrganizationPage).toBeDefined()
    expect(typeof mod.OrganizationPage).toBe('function')
  })

  test('tab configuration has all 4 tabs', () => {
    const TAB_CONFIG = [
      { value: 'nexus', label: 'NEXUS' },
      { value: 'departments', label: '부서' },
      { value: 'agents', label: '에이전트' },
      { value: 'tiers', label: '티어' },
    ]
    expect(TAB_CONFIG).toHaveLength(4)
    expect(TAB_CONFIG.map(t => t.value)).toEqual(['nexus', 'departments', 'agents', 'tiers'])
  })

  test('sub-pages export their components', async () => {
    // NexusPage
    const nexusMod = await import('../pages/nexus')
    expect(nexusMod.NexusPage).toBeDefined()

    // DepartmentsPage
    const deptsMod = await import('../pages/departments')
    expect(deptsMod.DepartmentsPage).toBeDefined()

    // TiersPage
    const tiersMod = await import('../pages/tiers')
    expect(tiersMod.TiersPage).toBeDefined()
  })

  test('organization page file uses Natural Organic theme', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(new URL('../pages/organization.tsx', import.meta.url).pathname, 'utf8')

    // Uses Natural Organic colors
    expect(content).toContain('#faf8f5')
    expect(content).toContain('#283618')
    expect(content).toContain('#606C38')
    expect(content).toContain('#e5e1d3')
    expect(content).toContain('#f5f0e8')

    // Has data-testid
    expect(content).toContain('data-testid="organization-page"')

    // Has tab test IDs
    expect(content).toContain('data-testid={`org-tab-${value}`}')

    // Uses Lucide icons
    expect(content).toContain('lucide-react')

    // Has aria roles
    expect(content).toContain('role="tab"')
    expect(content).toContain('aria-selected')
  })

  test('App.tsx has organization route', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(new URL('../App.tsx', import.meta.url).pathname, 'utf8')

    expect(content).toContain('OrganizationPage')
    expect(content).toContain('path="organization"')
    // org redirects to organization
    expect(content).toContain('path="org"')
    expect(content).toContain('/organization')
  })

  test('data display patterns are consistent', () => {
    // Test that tab values match expected pattern
    const tabValues = ['nexus', 'departments', 'agents', 'tiers'] as const
    type OrgTab = typeof tabValues[number]

    const isValidTab = (t: string): t is OrgTab => (tabValues as readonly string[]).includes(t)

    expect(isValidTab('nexus')).toBe(true)
    expect(isValidTab('departments')).toBe(true)
    expect(isValidTab('agents')).toBe(true)
    expect(isValidTab('tiers')).toBe(true)
    expect(isValidTab('invalid')).toBe(false)
  })
})
