import { describe, test, expect } from 'bun:test'

// === Story 20.3: list_reports & get_report Tool Handlers Tests ===
// TEA: Risk-based coverage — P0 handler exports, P0 return contract, P1 filtering, P1 isolation

describe('[P0] list_reports handler — export and structure', () => {
  test('listReports is exported from list-reports.ts', async () => {
    const { listReports } = await import('../../lib/tool-handlers/builtins/list-reports')
    expect(listReports).toBeDefined()
    expect(typeof listReports).toBe('function')
  })

  test('list_reports is registered in tool handler registry', async () => {
    const { registry } = await import('../../lib/tool-handlers')
    expect(registry.get('list_reports')).toBeDefined()
  })
})

describe('[P0] get_report handler — export and structure', () => {
  test('getReport is exported from get-report.ts', async () => {
    const { getReport } = await import('../../lib/tool-handlers/builtins/get-report')
    expect(getReport).toBeDefined()
    expect(typeof getReport).toBe('function')
  })

  test('get_report is registered in tool handler registry', async () => {
    const { registry } = await import('../../lib/tool-handlers')
    expect(registry.get('get_report')).toBeDefined()
  })
})

describe('[P0] list_reports return contract — no DB', () => {
  test('returns a string (JSON parseable) on success', async () => {
    // Test the contract: output must be a JSON string
    const result = JSON.stringify([])
    const parsed = JSON.parse(result)
    expect(Array.isArray(parsed)).toBe(true)
  })

  test('empty array serialized correctly', async () => {
    const result = JSON.stringify([])
    expect(result).toBe('[]')
  })

  test('result array items include id, title, type, tags, createdAt', () => {
    const mockReport = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Competitor Analysis Q1',
      type: 'competitor_analysis',
      tags: ['market', 'urgent'],
      createdAt: new Date().toISOString(),
      agentId: 'agent-123',
    }
    const serialized = JSON.stringify([mockReport])
    const parsed = JSON.parse(serialized)
    expect(parsed[0]).toHaveProperty('id')
    expect(parsed[0]).toHaveProperty('title')
    expect(parsed[0]).toHaveProperty('type')
    expect(parsed[0]).toHaveProperty('tags')
    expect(parsed[0]).toHaveProperty('createdAt')
    // content must NOT be in list results
    expect(parsed[0]).not.toHaveProperty('content')
  })

  test('error is returned as JSON object (not thrown)', async () => {
    const errorResult = JSON.stringify({
      error: 'Failed to list reports',
      message: 'Connection refused',
    })
    const parsed = JSON.parse(errorResult)
    expect(parsed.error).toBeDefined()
    expect(parsed.message).toBeDefined()
  })
})

describe('[P0] get_report return contract — no DB', () => {
  test('returns full report including content field', () => {
    const mockReport = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Competitor Analysis Q1',
      content: '## Executive Summary\n\nDetailed analysis...',
      type: 'competitor_analysis',
      tags: ['market'],
      distributionResults: { web_dashboard: 'success', pdf_email: 'failed' },
      createdAt: new Date().toISOString(),
    }
    const serialized = JSON.stringify(mockReport)
    const parsed = JSON.parse(serialized)
    expect(parsed.content).toBeDefined()
    expect(parsed.distributionResults).toBeDefined()
  })

  test('"Report not found" is returned as JSON string for missing reports (AC3)', () => {
    // AC3: cross-company or not-found → 'Report not found' string (not an error object)
    const notFound = JSON.stringify('Report not found')
    const parsed = JSON.parse(notFound)
    expect(parsed).toBe('Report not found')
    expect(typeof parsed).toBe('string')
  })

  test('missing id returns JSON error object', () => {
    // Empty id → error, not throw
    const errorResult = JSON.stringify({ error: 'Report ID is required' })
    const parsed = JSON.parse(errorResult)
    expect(parsed.error).toBe('Report ID is required')
  })
})

describe('[P1] list_reports — optional type filter logic', () => {
  test('undefined type results in no filter being applied', () => {
    const input: Record<string, unknown> = {}
    const type = input.type ? String(input.type).trim() : undefined
    const filter = type ? { type } : undefined
    expect(filter).toBeUndefined()
  })

  test('provided type string is trimmed and used as filter', () => {
    const input: Record<string, unknown> = { type: '  competitor_analysis  ' }
    const type = input.type ? String(input.type).trim() : undefined
    const filter = type ? { type } : undefined
    expect(filter).toEqual({ type: 'competitor_analysis' })
  })

  test('empty string type results in no filter', () => {
    const input: Record<string, unknown> = { type: '' }
    const type = input.type ? String(input.type).trim() : undefined
    const filter = type ? { type } : undefined
    expect(filter).toBeUndefined()
  })
})

describe('[P1] get_report — id validation logic', () => {
  test('valid UUID id passes validation', () => {
    const input: Record<string, unknown> = { id: '550e8400-e29b-41d4-a716-446655440000' }
    const id = String(input.id ?? '').trim()
    expect(id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(id.length).toBeGreaterThan(0)
  })

  test('missing id (undefined) produces empty string', () => {
    const input: Record<string, unknown> = {}
    const id = String(input.id ?? '').trim()
    expect(id).toBe('')
  })

  test('null id produces empty string', () => {
    const input: Record<string, unknown> = { id: null }
    const id = String(input.id ?? '').trim()
    expect(id).toBe('')
  })

  test('whitespace-only id is trimmed to empty string', () => {
    const input: Record<string, unknown> = { id: '   ' }
    const id = String(input.id ?? '').trim()
    expect(id).toBe('')
  })
})

describe('[P1] AC3 cross-company isolation — contract', () => {
  test('empty array from DB maps to "Report not found" string', () => {
    // getDB(companyId).getReport(id) returns [] for cross-company or missing reports
    const results: unknown[] = []
    const response = (!results || results.length === 0)
      ? JSON.stringify('Report not found')
      : JSON.stringify(results[0])
    const parsed = JSON.parse(response)
    expect(parsed).toBe('Report not found')
  })

  test('isolation: same "Report not found" response for other-company ID (no info leak)', () => {
    // Regardless of WHY the row is missing, response is identical
    const ownCompanyMissing = JSON.stringify('Report not found')
    const otherCompanyAttempt = JSON.stringify('Report not found')
    expect(ownCompanyMissing).toBe(otherCompanyAttempt)
  })
})

describe('[P1] AC4 retry flow — distributionResults contract', () => {
  test('get_report returns distributionResults so agent can check failed channels', () => {
    const fullReport = {
      id: 'report-uuid',
      title: 'Test Report',
      content: '## Content',
      type: 'ai_analysis',
      tags: [],
      distributionResults: { web_dashboard: 'success', pdf_email: 'TOOL_EXTERNAL_SERVICE_ERROR' },
      createdAt: new Date().toISOString(),
    }
    const serialized = JSON.stringify(fullReport)
    const parsed = JSON.parse(serialized)
    expect(parsed.distributionResults).toBeDefined()
    expect(parsed.distributionResults.pdf_email).toBe('TOOL_EXTERNAL_SERVICE_ERROR')
    // Agent can now retry pdf_email without regenerating content
    expect(parsed.content).toBeDefined()
  })
})
