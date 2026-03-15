import type { ToolHandler } from '../types'
import { getDB } from '../../../db/scoped-query'

// Story 20.3: get_report — retrieve full report by ID (FR-RM4, D27, AC3 cross-company isolation)
// Not found (own or other company) returns 'Report not found' — no info leak.
export const getReport: ToolHandler = async (input, ctx) => {
  const id = String(input.id ?? '').trim()
  if (!id) {
    return JSON.stringify({ error: 'Report ID is required' })
  }

  try {
    const results = await getDB(ctx.companyId).getReport(id)
    if (!results || results.length === 0) {
      return JSON.stringify('Report not found')
    }
    return JSON.stringify(results[0])
  } catch (err) {
    return JSON.stringify({
      error: 'Failed to retrieve report',
      message: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
