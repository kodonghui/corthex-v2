import type { ToolHandler } from '../types'
import { getDB } from '../../../db/scoped-query'

// Story 20.3: list_reports — list available agent reports (FR-RM3, D27)
// Returns summary array (content EXCLUDED for performance). Empty array = no match (not an error).
export const listReports: ToolHandler = async (input, ctx) => {
  try {
    const type = input.type ? String(input.type).trim() : undefined
    const filter = type ? { type } : undefined
    const results = await getDB(ctx.companyId).listReports(filter)
    return JSON.stringify(results)
  } catch (err) {
    return JSON.stringify({
      error: 'Failed to list reports',
      message: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
