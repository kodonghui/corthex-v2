/**
 * Handoff Depth Settings — companies.settings.maxHandoffDepth 설정 관리
 * 회사별 핸드오프 최대 깊이 조회/변경 (Story 8.4)
 */

import { db } from '../db'
import { companies } from '../db/schema'
import { eq } from 'drizzle-orm'

const DEFAULT_MAX_HANDOFF_DEPTH = 5
const MIN_DEPTH = 1
const MAX_DEPTH = 10

/**
 * Get max handoff depth for a company.
 * Falls back to default (5) if not configured or on error.
 */
export async function getMaxHandoffDepth(companyId: string): Promise<number> {
  try {
    const [company] = await db
      .select({ settings: companies.settings })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1)

    if (!company?.settings) return DEFAULT_MAX_HANDOFF_DEPTH

    const settings = company.settings as Record<string, unknown>
    const depth = settings.maxHandoffDepth

    if (typeof depth === 'number' && Number.isInteger(depth) && depth >= MIN_DEPTH && depth <= MAX_DEPTH) {
      return depth
    }

    return DEFAULT_MAX_HANDOFF_DEPTH
  } catch {
    return DEFAULT_MAX_HANDOFF_DEPTH
  }
}

/**
 * Save max handoff depth for a company.
 * Merges into existing settings JSONB.
 */
export async function saveMaxHandoffDepth(companyId: string, depth: number): Promise<number> {
  if (!Number.isInteger(depth) || depth < MIN_DEPTH || depth > MAX_DEPTH) {
    throw new Error(`maxHandoffDepth must be an integer between ${MIN_DEPTH} and ${MAX_DEPTH}`)
  }

  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company) {
    throw new Error('Company not found')
  }

  const existingSettings = (company.settings ?? {}) as Record<string, unknown>

  await db
    .update(companies)
    .set({
      settings: { ...existingSettings, maxHandoffDepth: depth },
    })
    .where(eq(companies.id, companyId))

  return depth
}
