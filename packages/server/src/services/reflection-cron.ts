/**
 * Story 28.4 — Reflection Cron (D28)
 *
 * Daily at 3:00 AM UTC + company hash stagger (60-minute spread).
 * Iterates all active companies, tries advisory lock, processes each agent.
 * Tier 1-2: unlimited, Tier 3-4: weekly 1x cap.
 */

import { db } from '../db'
import { companies, agents } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { reflectForAgent, type ReflectionResult } from './reflection-worker'

const CRON_INTERVAL_MS = 60 * 60 * 1000 // Check every hour (stagger handles timing)
const CRON_TARGET_HOUR_UTC = 3 // 3:00 AM UTC base
const STAGGER_WINDOW_MINUTES = 60 // 60-minute spread per company

let cronTimer: ReturnType<typeof setInterval> | null = null

/**
 * Hash a companyId to a stagger offset in minutes (0-59)
 */
function getStaggerMinutes(companyId: string): number {
  let hash = 0
  for (let i = 0; i < companyId.length; i++) {
    hash = ((hash << 5) - hash + companyId.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % STAGGER_WINDOW_MINUTES
}

/**
 * Check if this company should run now based on stagger offset.
 * Returns true if current UTC hour = CRON_TARGET_HOUR_UTC and
 * current minute matches the stagger window.
 */
function shouldRunNow(companyId: string): boolean {
  const now = new Date()
  if (now.getUTCHours() !== CRON_TARGET_HOUR_UTC) return false
  const stagger = getStaggerMinutes(companyId)
  const currentMinute = now.getUTCMinutes()
  // Allow a 5-minute window around the stagger offset
  return Math.abs(currentMinute - stagger) <= 5
}

/**
 * Check tier-based weekly cap: Tier 3-4 agents get max 1 reflection per week.
 * Returns true if reflection is allowed.
 */
async function checkTierWeeklyCap(companyId: string, agentId: string, tierLevel: number): Promise<boolean> {
  // Tier 1-2: unlimited
  if (tierLevel <= 2) return true

  // Tier 3-4: max 1 reflection per 7 days
  const [result] = await db.select({ count: sql<number>`count(*)::int` })
    .from(sql`observations`)
    .where(sql`
      company_id = ${companyId}::uuid
      AND agent_id = ${agentId}::uuid
      AND reflected = true
      AND reflected_at >= NOW() - INTERVAL '7 days'
    `)
  return (result?.count ?? 0) === 0
}

/**
 * Process all agents for a single company.
 */
async function processCompany(companyId: string): Promise<ReflectionResult[]> {
  const results: ReflectionResult[] = []

  // Try advisory lock (non-blocking — skip if another instance is processing)
  const [lockResult] = await db.execute(
    sql`SELECT pg_try_advisory_xact_lock(hashtext(${companyId})) AS acquired`,
  ) as unknown as [{ acquired: boolean }][]

  if (!lockResult || !(lockResult as any).acquired) {
    console.log({ companyId, event: 'reflection_lock_skip' }, 'Skipping: advisory lock held by another instance')
    return results
  }

  // Get all active agents for this company
  const companyAgents = await db.select({
    id: agents.id,
    tierLevel: agents.tierLevel,
  })
    .from(agents)
    .where(and(
      eq(agents.companyId, companyId),
      eq(agents.isActive, true),
    ))

  for (const agent of companyAgents) {
    try {
      // Check tier weekly cap
      const allowed = await checkTierWeeklyCap(companyId, agent.id, agent.tierLevel)
      if (!allowed) {
        console.log({ companyId, agentId: agent.id, tierLevel: agent.tierLevel, event: 'reflection_tier_cap' }, 'Skipping: weekly tier cap reached')
        continue
      }

      const result = await reflectForAgent(companyId, agent.id)
      if (result) {
        results.push(result)
        console.log({
          companyId,
          agentId: agent.id,
          memoriesCreated: result.memoriesCreated,
          observationsProcessed: result.observationsProcessed,
          event: 'reflection_complete',
        }, 'Reflection completed for agent')
      }
    } catch (err) {
      console.error({ companyId, agentId: agent.id, err, event: 'reflection_agent_error' }, 'Reflection failed for agent')
    }
  }

  return results
}

/**
 * Main cron tick — iterates all active companies with stagger check.
 */
async function reflectionCronTick(): Promise<void> {
  try {
    // Get all active companies
    const activeCompanies = await db.select({ id: companies.id })
      .from(companies)
      .where(eq(companies.isActive, true))

    for (const company of activeCompanies) {
      if (!shouldRunNow(company.id)) continue

      try {
        const results = await processCompany(company.id)
        if (results.length > 0) {
          const totalMemories = results.reduce((sum, r) => sum + r.memoriesCreated, 0)
          const totalObs = results.reduce((sum, r) => sum + r.observationsProcessed, 0)
          console.log({
            companyId: company.id,
            agentsProcessed: results.length,
            totalMemories,
            totalObs,
            event: 'reflection_company_done',
          }, 'Reflection cron completed for company')
        }
      } catch (err) {
        console.error({ companyId: company.id, err, event: 'reflection_company_error' }, 'Reflection cron failed for company')
      }
    }
  } catch (err) {
    console.error({ err, event: 'reflection_cron_error' }, 'Reflection cron tick failed')
  }
}

export function startReflectionCron(): void {
  if (cronTimer) return
  console.log('🔄 Reflection cron worker started (interval: 1h, target: 3:00 AM UTC)')
  cronTimer = setInterval(reflectionCronTick, CRON_INTERVAL_MS)
  // Run first tick after 10s delay to not block startup
  setTimeout(reflectionCronTick, 10_000)
}

export function stopReflectionCron(): void {
  if (cronTimer) {
    clearInterval(cronTimer)
    cronTimer = null
    console.log('🛑 Reflection cron worker stopped')
  }
}
