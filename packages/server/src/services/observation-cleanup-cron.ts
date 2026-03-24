/**
 * Story 28.7 — Observation Cleanup Cron (NFR-D8)
 *
 * Daily at 4:00 AM UTC (1 hour after reflection cron).
 * Iterates all active companies, tries advisory lock, runs cleanup.
 */

import { db } from '../db'
import { companies } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import { cleanupExpiredObservations, decayStaleMemories } from './observation-cleanup'
import type { CleanupResult, DecayResult } from './observation-cleanup'

const CRON_INTERVAL_MS = 60 * 60 * 1000 // Check every hour
const CRON_TARGET_HOUR_UTC = 4 // 4:00 AM UTC (1h after reflection)
const STAGGER_WINDOW_MINUTES = 60

let cronTimer: ReturnType<typeof setInterval> | null = null

function getStaggerMinutes(companyId: string): number {
  let hash = 0
  for (let i = 0; i < companyId.length; i++) {
    hash = ((hash << 5) - hash + companyId.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % STAGGER_WINDOW_MINUTES
}

function shouldRunNow(companyId: string): boolean {
  const now = new Date()
  if (now.getUTCHours() !== CRON_TARGET_HOUR_UTC) return false
  const stagger = getStaggerMinutes(companyId)
  const currentMinute = now.getUTCMinutes()
  return Math.abs(currentMinute - stagger) <= 5
}

async function processCompany(companyId: string): Promise<{
  cleanup: CleanupResult
  decay: DecayResult
} | null> {
  // Try advisory lock (non-blocking)
  const [lockResult] = await db.execute(
    sql`SELECT pg_try_advisory_xact_lock(hashtext(${'cleanup_' + companyId})) AS acquired`,
  ) as unknown as [{ acquired: boolean }][]

  if (!lockResult || !(lockResult as any).acquired) {
    console.log({ companyId, event: 'cleanup_lock_skip' }, 'Skipping: advisory lock held')
    return null
  }

  const cleanup = await cleanupExpiredObservations(companyId)
  const decay = await decayStaleMemories(companyId)

  return { cleanup, decay }
}

async function cleanupCronTick(): Promise<void> {
  try {
    const activeCompanies = await db.select({ id: companies.id })
      .from(companies)
      .where(eq(companies.isActive, true))

    for (const company of activeCompanies) {
      if (!shouldRunNow(company.id)) continue

      try {
        const result = await processCompany(company.id)
        if (result && (result.cleanup.totalDeleted > 0 || result.decay.decayed > 0 || result.decay.deleted > 0)) {
          console.log({
            companyId: company.id,
            reflectedDeleted: result.cleanup.reflectedDeleted,
            unreflectedDeleted: result.cleanup.unreflectedDeleted,
            memoriesDecayed: result.decay.decayed,
            memoriesForgotten: result.decay.deleted,
            event: 'cleanup_company_done',
          }, 'Cleanup completed for company')
        }
      } catch (err) {
        console.error({ companyId: company.id, err, event: 'cleanup_company_error' }, 'Cleanup failed for company')
      }
    }
  } catch (err) {
    console.error({ err, event: 'cleanup_cron_error' }, 'Cleanup cron tick failed')
  }
}

export function startObservationCleanupCron(): void {
  if (cronTimer) return
  console.log('🧹 Observation cleanup cron started (interval: 1h, target: 4:00 AM UTC)')
  cronTimer = setInterval(cleanupCronTick, CRON_INTERVAL_MS)
  // Run first tick after 15s delay (offset from reflection cron's 10s)
  setTimeout(cleanupCronTick, 15_000)
}

export function stopObservationCleanupCron(): void {
  if (cronTimer) {
    clearInterval(cronTimer)
    cronTimer = null
    console.log('🛑 Observation cleanup cron stopped')
  }
}
