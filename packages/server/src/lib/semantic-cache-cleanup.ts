/**
 * Semantic Cache Cleanup — Story 15.3 (NFR-CACHE-O5)
 *
 * Daily cleanup of expired semantic_cache rows.
 * Runs once every 24h via setInterval after server start.
 */

import { db } from '../db'
import { sql } from 'drizzle-orm'

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

let cleanupTimer: ReturnType<typeof setInterval> | null = null

async function cleanupExpiredCache(): Promise<void> {
  try {
    const result = await db.execute(sql`
      DELETE FROM semantic_cache
      WHERE created_at < NOW() - ttl_hours * INTERVAL '1 hour'
    `)
    const deletedRows = (result as unknown as { rowCount?: number }).rowCount ?? 0
    console.log({ event: 'semantic_cache_cleanup', deletedRows }, 'Semantic cache cleanup completed')
  } catch (err) {
    console.error({ event: 'semantic_cache_cleanup_error', err }, 'Semantic cache cleanup failed')
  }
}

export function startSemanticCacheCleanup(): void {
  if (cleanupTimer) return
  console.log('🧹 Semantic cache cleanup worker started (interval: 24h)')
  // Run immediately on start, then every 24h
  cleanupExpiredCache()
  cleanupTimer = setInterval(cleanupExpiredCache, CLEANUP_INTERVAL_MS)
}

export function stopSemanticCacheCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
    console.log('🛑 Semantic cache cleanup worker stopped')
  }
}
