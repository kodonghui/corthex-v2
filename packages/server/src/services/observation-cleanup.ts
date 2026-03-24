/**
 * Story 28.7 — Observation TTL & Memory Cleanup (NFR-D8)
 *
 * - Reflected observations expire after 30 days
 * - Unreflected observations expire after 90 days (gives reflection cron time)
 * - Low-confidence memories decay 10% per cycle if not updated in 60 days
 * - Memories below confidence 10 are soft-deleted (forgotten)
 */

import { getDB } from '../db/scoped-query'

export const REFLECTED_TTL_DAYS = 30
export const UNREFLECTED_TTL_DAYS = 90
export const BATCH_SIZE = 500
export const STALE_MEMORY_DAYS = 60
export const DECAY_FACTOR = 0.9
export const MIN_CONFIDENCE = 10

export interface CleanupResult {
  reflectedDeleted: number
  unreflectedDeleted: number
  totalDeleted: number
}

export interface DecayResult {
  decayed: number
  deleted: number
}

/**
 * Delete expired observations in batches.
 * Uses idx_observations_ttl index for reflected observations.
 */
export async function cleanupExpiredObservations(companyId: string): Promise<CleanupResult> {
  const db = getDB(companyId)

  // Delete reflected observations older than 30 days
  const reflectedCutoff = new Date(Date.now() - REFLECTED_TTL_DAYS * 86400000)
  const reflectedDeleted = await db.deleteExpiredObservations({
    reflected: true,
    before: reflectedCutoff,
    batchSize: BATCH_SIZE,
  })

  // Delete unreflected observations older than 90 days (abandoned)
  const unreflectedCutoff = new Date(Date.now() - UNREFLECTED_TTL_DAYS * 86400000)
  const unreflectedDeleted = await db.deleteExpiredObservations({
    reflected: false,
    before: unreflectedCutoff,
    batchSize: BATCH_SIZE,
  })

  return {
    reflectedDeleted,
    unreflectedDeleted,
    totalDeleted: reflectedDeleted + unreflectedDeleted,
  }
}

/**
 * Decay confidence of stale memories.
 * Memories not updated in 60 days lose 10% confidence per cycle.
 * Memories below confidence 10 are soft-deleted (forgotten).
 */
export async function decayStaleMemories(companyId: string): Promise<DecayResult> {
  const db = getDB(companyId)
  const staleCutoff = new Date(Date.now() - STALE_MEMORY_DAYS * 86400000)

  // Decay confidence by 10% for memories not updated in 60 days
  const decayed = await db.decayMemoryConfidence(staleCutoff, DECAY_FACTOR)

  // Soft-delete memories with confidence < 10 (effectively forgotten)
  const deleted = await db.deleteWeakMemories(MIN_CONFIDENCE)

  return { decayed, deleted }
}
