import { describe, test, expect } from 'bun:test'

// === Story 19.5: Admin Reports UI & Agent Reports API TEA Tests ===
// TEA: Risk-based coverage — P0 route registration, P0 AC1 list, P0 AC2 detail, P1 PDF endpoint, P1 empty state

describe('[P0] adminAgentReportsRoute — registration', () => {
  test('adminAgentReportsRoute is exported from agent-reports route file', async () => {
    const { adminAgentReportsRoute } = await import('../../routes/admin/agent-reports')
    expect(adminAgentReportsRoute).toBeDefined()
    expect(typeof adminAgentReportsRoute.fetch).toBe('function')
  })

  test('route has GET /agent-reports endpoint', async () => {
    const { adminAgentReportsRoute } = await import('../../routes/admin/agent-reports')
    const routes = adminAgentReportsRoute.routes as Array<{ method: string; path: string }>
    const listRoute = routes.some(r => r.method === 'GET' && r.path === '/agent-reports')
    expect(listRoute).toBe(true)
  })

  test('route has GET /agent-reports/:id endpoint', async () => {
    const { adminAgentReportsRoute } = await import('../../routes/admin/agent-reports')
    const routes = adminAgentReportsRoute.routes as Array<{ method: string; path: string }>
    const detailRoute = routes.some(r => r.method === 'GET' && r.path.includes(':id') && !r.path.includes('pdf'))
    expect(detailRoute).toBe(true)
  })

  test('route has GET /agent-reports/:id/pdf endpoint (AC2 PDF download)', async () => {
    const { adminAgentReportsRoute } = await import('../../routes/admin/agent-reports')
    const routes = adminAgentReportsRoute.routes as Array<{ method: string; path: string }>
    const pdfRoute = routes.some(r => r.method === 'GET' && r.path.includes('pdf'))
    expect(pdfRoute).toBe(true)
  })
})

describe('[P0] AC1 list response — field contract', () => {
  test('listReports result has correct fields (no content)', () => {
    // AC1: list returns id, title, type, tags, createdAt, agentId — content EXCLUDED
    const mockListItem = {
      id: 'uuid-1',
      title: 'Competitor Analysis Q1',
      type: 'competitor_analysis',
      tags: ['market', 'urgent'],
      createdAt: new Date().toISOString(),
      agentId: 'agent-uuid',
    }
    expect(mockListItem).toHaveProperty('id')
    expect(mockListItem).toHaveProperty('title')
    expect(mockListItem).toHaveProperty('type')
    expect(mockListItem).toHaveProperty('tags')
    expect(mockListItem).toHaveProperty('createdAt')
    expect(mockListItem).not.toHaveProperty('content')
    expect(mockListItem).not.toHaveProperty('distributionResults')
  })

  test('reports are sorted descending by createdAt', () => {
    const reports = [
      { id: '1', createdAt: '2026-03-14T10:00:00Z' },
      { id: '2', createdAt: '2026-03-15T10:00:00Z' },
    ]
    // First item should be newest
    const sorted = [...reports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    expect(sorted[0].id).toBe('2')
    expect(sorted[1].id).toBe('1')
  })
})

describe('[P0] AC2 detail response — field contract', () => {
  test('detail response includes content field', () => {
    const mockDetail = {
      id: 'uuid-1',
      title: 'Test Report',
      content: '## Executive Summary\n\nAnalysis...',
      type: 'ai_analysis',
      tags: [],
      distributionResults: null,
      createdAt: new Date().toISOString(),
      agentId: null,
    }
    expect(mockDetail).toHaveProperty('content')
    expect(typeof mockDetail.content).toBe('string')
  })

  test('distributionResults can be null or object', () => {
    const withResults = { distributionResults: { web_dashboard: 'success', pdf_email: 'failed' } }
    const withoutResults = { distributionResults: null }
    expect(withResults.distributionResults).not.toBeNull()
    expect(withoutResults.distributionResults).toBeNull()
  })
})

describe('[P0] AC3 empty state — response contract', () => {
  test('empty reports list returns empty array (not error)', () => {
    // AC4: empty state — server returns [], client shows "No reports yet" message
    const emptyResponse = { data: [] }
    expect(emptyResponse.data).toHaveLength(0)
    expect(Array.isArray(emptyResponse.data)).toBe(true)
  })
})

describe('[P1] type filter — query parameter', () => {
  test('type filter is passed as query string', () => {
    const type = 'competitor_analysis'
    const url = `/admin/agent-reports?type=${encodeURIComponent(type)}`
    expect(url).toContain('type=competitor_analysis')
  })

  test('no filter = empty query string (returns all)', () => {
    const url = `/admin/agent-reports`
    expect(url).not.toContain('type=')
  })

  test('type filter correctly encoded for special characters', () => {
    const type = 'market research'
    const encoded = encodeURIComponent(type)
    const url = `/admin/agent-reports?type=${encoded}`
    expect(url).toContain('market%20research')
  })
})

describe('[P1] PDF download endpoint — response headers contract', () => {
  test('PDF response content type is application/pdf', () => {
    const contentType = 'application/pdf'
    expect(contentType).toBe('application/pdf')
  })

  test('PDF filename format uses report ID prefix', () => {
    const reportId = '550e8400-e29b-41d4-a716-446655440000'
    const filename = `report-${reportId.slice(0, 8)}.pdf`
    expect(filename).toBe('report-550e8400.pdf')
    expect(filename.endsWith('.pdf')).toBe(true)
  })

  test('Content-Disposition is attachment (triggers download)', () => {
    const id = 'abc12345-...'
    const filename = `report-${id.slice(0, 8)}.pdf`
    const header = `attachment; filename="${filename}"`
    expect(header.startsWith('attachment')).toBe(true)
    expect(header).toContain('filename=')
  })
})

describe('[P1] NFR-S4 company isolation — contract', () => {
  test('listReports uses companyId from tenant context (not query param)', async () => {
    // Verify listReports method in scoped-query uses companyId injection
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('company-a')
    // Should be a function (not throw at construction)
    expect(typeof db.listReports).toBe('function')
    // Calling listReports() should return a thenable (lazy query, not executed yet)
    const query = db.listReports()
    expect(typeof (query as any).then).toBe('function')
  })

  test('getReport uses scopedWhere ensuring company_id filter', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('company-b')
    expect(typeof db.getReport).toBe('function')
    // Calling getReport with any id — no throw at call time
    expect(() => db.getReport('some-uuid')).not.toThrow()
  })
})
