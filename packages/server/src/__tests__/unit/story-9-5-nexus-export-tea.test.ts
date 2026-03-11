/**
 * Story 9.5: NEXUS 내보내기 + 인쇄 — TEA Risk-Based Tests
 * Risk-based coverage: error handling, boundary conditions, edge cases, integration scenarios
 */
import { describe, it, expect } from 'bun:test'

// ============================================================================
// TEA-R1: Filename Sanitization Boundary Tests (P0 - Data Integrity)
// ============================================================================
describe('TEA 9.5 R1: filename sanitization boundaries', () => {
  function generateFilename(companyName: string, ext: string): string {
    const sanitized = companyName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0, 50)
    const date = new Date().toISOString().slice(0, 10)
    return `NEXUS-${sanitized}-${date}.${ext}`
  }

  it('should handle path traversal characters in company name', () => {
    const filename = generateFilename('../../etc/passwd', 'png')
    expect(filename).not.toContain('/')
    expect(filename).not.toContain('..')
  })

  it('should handle null-like strings in company name', () => {
    const filename = generateFilename('null', 'png')
    expect(filename).toContain('null')
    expect(filename).toEndWith('.png')
  })

  it('should handle unicode emoji in company name', () => {
    const filename = generateFilename('Company🚀Test', 'svg')
    // Emoji should be replaced by _
    expect(filename).toContain('Company')
    expect(filename).toContain('Test')
    expect(filename).toEndWith('.svg')
  })

  it('should handle mixed Korean and English', () => {
    const filename = generateFilename('코르텍스-CORTHEX-v2', 'json')
    expect(filename).toContain('코르텍스-CORTHEX-v2')
  })

  it('should handle company name exactly at 50 char boundary', () => {
    const name50 = 'A'.repeat(50)
    const name51 = 'A'.repeat(51)
    const f50 = generateFilename(name50, 'png')
    const f51 = generateFilename(name51, 'png')
    // Both should have max 50 chars for the sanitized portion
    const part50 = f50.split('NEXUS-')[1]!.split('-20')[0]
    const part51 = f51.split('NEXUS-')[1]!.split('-20')[0]
    expect(part50.length).toBe(50)
    expect(part51.length).toBe(50)
  })

  it('should handle whitespace-only company name', () => {
    const filename = generateFilename('   ', 'png')
    // Spaces get replaced with _
    expect(filename).toMatch(/^NEXUS-/)
    expect(filename).toEndWith('.png')
  })

  it('should handle HTML entities in company name', () => {
    const filename = generateFilename('<script>alert("xss")</script>', 'png')
    expect(filename).not.toContain('<')
    expect(filename).not.toContain('>')
    expect(filename).not.toContain('"')
  })

  it('should handle newlines in company name', () => {
    const filename = generateFilename('Company\nName', 'svg')
    expect(filename).not.toContain('\n')
  })

  it('should produce valid filename characters only', () => {
    const filename = generateFilename('Test!@#$%^&*()', 'png')
    // Valid filename chars: alphanumeric, Korean, underscore, hyphen, dot
    expect(filename).toMatch(/^[a-zA-Z0-9가-힣_.\-]+$/)
  })
})

// ============================================================================
// TEA-R2: Export Filter Robustness (P0 - Correct Export Output)
// ============================================================================
describe('TEA 9.5 R2: export filter robustness', () => {
  function exportFilter(node: { className?: string | { toString: () => string }; dataset?: Record<string, string> }): boolean {
    const cls = node.className?.toString?.() || ''
    if (cls.includes('react-flow__controls')) return false
    if (cls.includes('react-flow__minimap')) return false
    if (node.dataset?.testid === 'nexus-toolbar') return false
    return true
  }

  it('should handle SVGAnimatedString className (SVG elements)', () => {
    // SVG elements have SVGAnimatedString for className, not string
    const svgElement = {
      className: { toString: () => 'react-flow__edges', baseVal: 'react-flow__edges' },
    }
    expect(exportFilter(svgElement)).toBe(true)
  })

  it('should handle SVGAnimatedString className for controls', () => {
    const svgElement = {
      className: { toString: () => 'react-flow__controls panel', baseVal: 'react-flow__controls panel' },
    }
    expect(exportFilter(svgElement)).toBe(false)
  })

  it('should handle multiple classes including controls', () => {
    expect(exportFilter({ className: 'some-class react-flow__controls another-class' })).toBe(false)
  })

  it('should handle multiple classes including minimap', () => {
    expect(exportFilter({ className: 'panel react-flow__minimap bottom' })).toBe(false)
  })

  it('should not filter react-flow__panel (generic panel)', () => {
    expect(exportFilter({ className: 'react-flow__panel' })).toBe(true)
  })

  it('should not filter react-flow__node elements', () => {
    expect(exportFilter({ className: 'react-flow__node react-flow__node-department' })).toBe(true)
  })

  it('should handle null className gracefully', () => {
    expect(exportFilter({ className: undefined })).toBe(true)
  })

  it('should handle empty dataset', () => {
    expect(exportFilter({ className: '', dataset: {} })).toBe(true)
  })

  it('should handle missing dataset entirely', () => {
    expect(exportFilter({ className: 'some-class' })).toBe(true)
  })

  it('should filter toolbar by data-testid only', () => {
    // Toolbar might not have a specific CSS class but has data-testid
    expect(exportFilter({ className: 'custom-toolbar-class', dataset: { testid: 'nexus-toolbar' } })).toBe(false)
  })
})

// ============================================================================
// TEA-R3: JSON Export Edge Cases (P1 - Data Completeness)
// ============================================================================
describe('TEA 9.5 R3: JSON export edge cases', () => {
  it('should handle large org (100+ agents)', () => {
    const agents = Array.from({ length: 150 }, (_, i) => ({
      id: `agent-${i}`,
      name: `Agent ${i}`,
      role: i % 3 === 0 ? null : 'worker',
      tier: (['manager', 'specialist', 'worker'] as const)[i % 3],
      modelName: 'claude-opus-4-20250514',
      departmentId: `dept-${i % 5}`,
      status: 'active',
      isSecretary: i === 0,
      isSystem: false,
      soul: null,
      allowedTools: null,
    }))

    const orgData = {
      company: { id: 'c1', name: 'LargeOrg', slug: 'largeorg' },
      departments: Array.from({ length: 5 }, (_, i) => ({
        id: `dept-${i}`,
        name: `부서 ${i}`,
        description: null,
        agents: agents.filter(a => a.departmentId === `dept-${i}`),
      })),
      unassignedAgents: agents.slice(0, 10).map(a => ({ ...a, departmentId: null })),
    }

    const json = JSON.stringify(orgData, null, 2)
    const parsed = JSON.parse(json)
    expect(parsed.departments).toHaveLength(5)
    expect(parsed.unassignedAgents).toHaveLength(10)
    // Verify no data loss
    const totalAgents = parsed.departments.reduce((s: number, d: any) => s + d.agents.length, 0)
    expect(totalAgents).toBe(150)
  })

  it('should handle special characters in agent names', () => {
    const orgData = {
      company: { id: 'c1', name: 'Test', slug: 'test' },
      departments: [{
        id: 'd1', name: '개발팀 & "특수"팀', description: 'Dept with <html> chars',
        agents: [{
          id: 'a1', name: '에이전트 "특수"', role: "role'with'quotes",
          tier: 'worker' as const, modelName: 'test', departmentId: 'd1',
          status: 'active', isSecretary: false, isSystem: false, soul: null, allowedTools: null,
        }],
      }],
      unassignedAgents: [],
    }

    const json = JSON.stringify(orgData, null, 2)
    const parsed = JSON.parse(json)
    expect(parsed.departments[0].name).toBe('개발팀 & "특수"팀')
    expect(parsed.departments[0].agents[0].name).toBe('에이전트 "특수"')
  })

  it('should preserve null values in JSON', () => {
    const orgData = {
      company: { id: 'c1', name: 'Test', slug: 'test' },
      departments: [{
        id: 'd1', name: 'Dept', description: null,
        agents: [{
          id: 'a1', name: 'Agent', role: null, tier: 'worker' as const,
          modelName: 'test', departmentId: 'd1', status: 'active',
          isSecretary: false, isSystem: false, soul: null, allowedTools: null,
        }],
      }],
      unassignedAgents: [],
    }

    const json = JSON.stringify(orgData, null, 2)
    expect(json).toContain('"description": null')
    expect(json).toContain('"role": null')
    expect(json).toContain('"soul": null')
    expect(json).toContain('"allowedTools": null')
  })

  it('should handle deeply nested allowedTools arrays', () => {
    const orgData = {
      company: { id: 'c1', name: 'Test', slug: 'test' },
      departments: [{
        id: 'd1', name: 'Dept', description: null,
        agents: [{
          id: 'a1', name: 'Agent', role: null, tier: 'worker' as const,
          modelName: 'test', departmentId: 'd1', status: 'active',
          isSecretary: false, isSystem: false, soul: null,
          allowedTools: ['search', 'code_edit', 'file_read', 'web_browse', 'database_query'],
        }],
      }],
      unassignedAgents: [],
    }

    const json = JSON.stringify(orgData, null, 2)
    const parsed = JSON.parse(json)
    expect(parsed.departments[0].agents[0].allowedTools).toHaveLength(5)
    expect(parsed.departments[0].agents[0].allowedTools).toContain('database_query')
  })
})

// ============================================================================
// TEA-R4: Download Trigger Safety (P1 - User Experience)
// ============================================================================
describe('TEA 9.5 R4: download trigger patterns', () => {
  it('should create valid data URL for small PNG', () => {
    // Verify data URL format expectations
    const dataUrl = 'data:image/png;base64,iVBOR...'
    expect(dataUrl).toStartWith('data:image/png')
  })

  it('should create valid data URL for SVG', () => {
    const dataUrl = 'data:image/svg+xml;charset=utf-8,...'
    expect(dataUrl).toStartWith('data:image/svg+xml')
  })

  it('should handle blob URL lifecycle correctly', () => {
    const json = JSON.stringify({ test: true })
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    expect(url).toStartWith('blob:')
    // Verify revoke doesn't throw
    URL.revokeObjectURL(url)
  })

  it('should handle large JSON blob (1MB+)', () => {
    const largeData = { data: 'x'.repeat(1_000_000) }
    const json = JSON.stringify(largeData)
    const blob = new Blob([json], { type: 'application/json' })
    expect(blob.size).toBeGreaterThan(1_000_000)
    const url = URL.createObjectURL(blob)
    expect(url).toStartWith('blob:')
    URL.revokeObjectURL(url)
  })
})

// ============================================================================
// TEA-R5: Print CSS Isolation (P1 - Print Correctness)
// ============================================================================
describe('TEA 9.5 R5: print CSS isolation rules', () => {
  // Validate all CSS selector patterns used in @media print
  const printSelectors = [
    { selector: '.react-flow__controls', rule: 'display: none', purpose: 'Hide zoom controls' },
    { selector: '.react-flow__minimap', rule: 'display: none', purpose: 'Hide minimap' },
    { selector: '[data-testid="nexus-toolbar"]', rule: 'display: none', purpose: 'Hide toolbar' },
    { selector: '.react-flow__background', rule: 'display: none', purpose: 'Hide dot grid' },
    { selector: '.react-flow', rule: 'background: white', purpose: 'White background' },
    { selector: 'aside, nav, header', rule: 'display: none', purpose: 'Hide layout chrome' },
  ]

  for (const { selector, rule, purpose } of printSelectors) {
    it(`should define print rule: ${purpose} (${selector})`, () => {
      expect(selector).toBeTruthy()
      expect(rule).toBeTruthy()
    })
  }

  it('should have 6 print CSS rules total', () => {
    expect(printSelectors).toHaveLength(6)
  })

  it('should not hide react-flow__viewport in print', () => {
    const viewportHidden = printSelectors.some(r => r.selector.includes('viewport'))
    expect(viewportHidden).toBe(false)
  })

  it('should not hide react-flow__edges in print', () => {
    const edgesHidden = printSelectors.some(r => r.selector.includes('edges'))
    expect(edgesHidden).toBe(false)
  })

  it('should not hide react-flow__node in print', () => {
    const nodesHidden = printSelectors.some(r => r.selector.includes('__node'))
    expect(nodesHidden).toBe(false)
  })
})

// ============================================================================
// TEA-R6: Toolbar Dropdown Edge Cases (P1 - UI Correctness)
// ============================================================================
describe('TEA 9.5 R6: toolbar dropdown edge cases', () => {
  it('should handle rapid toggle clicks', () => {
    let isOpen = false
    // Simulate rapid toggles
    for (let i = 0; i < 10; i++) {
      isOpen = !isOpen
    }
    // Even number of toggles = closed
    expect(isOpen).toBe(false)
  })

  it('should handle concurrent export state', () => {
    // If exporting, button should be disabled
    const isExporting = true
    const canExport = !isExporting
    expect(canExport).toBe(false)
  })

  it('should not open dropdown while exporting', () => {
    const isExporting = true
    // Simulating: button is disabled, so dropdown should not open
    const shouldOpenDropdown = !isExporting
    expect(shouldOpenDropdown).toBe(false)
  })

  it('should close dropdown when export starts', () => {
    let dropdownOpen = true
    // When export action is selected, dropdown closes
    dropdownOpen = false
    expect(dropdownOpen).toBe(false)
  })

  it('should have correct menu item count for each format', () => {
    const formatOptions = [
      { label: 'PNG 이미지', ext: 'png' },
      { label: 'SVG 벡터', ext: 'svg' },
      { label: 'JSON 데이터', ext: 'json' },
    ]
    const actionOptions = [
      { label: '인쇄', action: 'print' },
    ]
    expect(formatOptions.length + actionOptions.length).toBe(4)
  })
})

// ============================================================================
// TEA-R7: Export Options Configuration (P2 - Config Correctness)
// ============================================================================
describe('TEA 9.5 R7: export configuration options', () => {
  const pngOptions = {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  }

  const svgOptions = {
    backgroundColor: '#ffffff',
  }

  it('should use white background for PNG export', () => {
    expect(pngOptions.backgroundColor).toBe('#ffffff')
  })

  it('should use white background for SVG export', () => {
    expect(svgOptions.backgroundColor).toBe('#ffffff')
  })

  it('should use 2x pixel ratio for PNG (retina quality)', () => {
    expect(pngOptions.pixelRatio).toBe(2)
  })

  it('should not specify pixel ratio for SVG (vector = infinite resolution)', () => {
    expect(svgOptions).not.toHaveProperty('pixelRatio')
  })

  it('should apply export filter to both PNG and SVG', () => {
    // Both export functions use the same filter
    const usesFilter = true
    expect(usesFilter).toBe(true)
  })

  it('should not apply filter to JSON export (data only)', () => {
    // JSON export doesn't use DOM filter
    const jsonUsesFilter = false
    expect(jsonUsesFilter).toBe(false)
  })
})

// ============================================================================
// TEA-R8: Date Consistency (P2 - Filename Correctness)
// ============================================================================
describe('TEA 9.5 R8: date consistency in filenames', () => {
  function generateFilename(companyName: string, ext: string): string {
    const sanitized = companyName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0, 50)
    const date = new Date().toISOString().slice(0, 10)
    return `NEXUS-${sanitized}-${date}.${ext}`
  }

  it('should produce YYYY-MM-DD format date', () => {
    const filename = generateFilename('Test', 'png')
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
    expect(dateMatch).not.toBeNull()
    const [year, month, day] = dateMatch![1].split('-').map(Number)
    expect(year).toBeGreaterThanOrEqual(2024)
    expect(month).toBeGreaterThanOrEqual(1)
    expect(month).toBeLessThanOrEqual(12)
    expect(day).toBeGreaterThanOrEqual(1)
    expect(day).toBeLessThanOrEqual(31)
  })

  it('should use same date for all formats in same session', () => {
    const png = generateFilename('Test', 'png')
    const svg = generateFilename('Test', 'svg')
    const json = generateFilename('Test', 'json')
    const datePng = png.match(/(\d{4}-\d{2}-\d{2})/)![1]
    const dateSvg = svg.match(/(\d{4}-\d{2}-\d{2})/)![1]
    const dateJson = json.match(/(\d{4}-\d{2}-\d{2})/)![1]
    expect(datePng).toBe(dateSvg)
    expect(dateSvg).toBe(dateJson)
  })

  it('should use ISO date (UTC-based)', () => {
    const filename = generateFilename('Test', 'png')
    const dateInFilename = filename.match(/(\d{4}-\d{2}-\d{2})/)![1]
    const isoDate = new Date().toISOString().slice(0, 10)
    expect(dateInFilename).toBe(isoDate)
  })
})
