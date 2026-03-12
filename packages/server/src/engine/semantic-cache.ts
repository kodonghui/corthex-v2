/**
 * Semantic Cache — Story 15.3 (D19/D20)
 *
 * Internal engine module. ONLY importable from engine/agent-loop.ts.
 * E8 boundary: engine/semantic-cache.ts must not be imported outside agent-loop.ts.
 * CI check: .github/scripts/engine-boundary-check.sh
 *
 * DB access via getDB(companyId) proxy — direct db import forbidden (E3).
 */

import { createSessionLogger } from '../db/logger'
import { getDB } from '../db/scoped-query'
import { generateEmbedding, extractApiKey } from '../services/embedding-service'
import { getCredentials } from '../services/credential-vault'
import { scrubCredentials } from '../lib/credential-patterns'

const SIMILARITY_THRESHOLD = 0.95
const TTL_HOURS = 24

const log = createSessionLogger({ sessionId: 'semantic-cache', companyId: 'system', agentId: 'semantic-cache' })

/**
 * Check if a semantically similar query exists in cache.
 * Returns { response, similarity } on hit, null on miss or error.
 * NFR-CACHE-R2: errors → null (graceful fallback, no session disruption).
 */
export async function checkSemanticCache(
  companyId: string,
  query: string,
): Promise<{ response: string; similarity: number } | null> {
  try {
    const apiKey = await getGoogleApiKey(companyId)
    if (!apiKey) return null

    const embedding = await generateEmbedding(apiKey, query)
    if (!embedding) return null

    const result = await getDB(companyId).findSemanticCache(embedding, SIMILARITY_THRESHOLD)
    return result
  } catch (err) {
    log.warn({ event: 'semantic_cache_error', op: 'check', err }, 'Semantic cache check failed')
    return null
  }
}

/**
 * Save a query+response pair to semantic cache.
 * Applies CREDENTIAL_PATTERNS scrubbing before storing (D20 callee-side — NFR-CACHE-S3).
 * NFR-CACHE-R2: errors logged + ignored (no session disruption).
 */
export async function saveToSemanticCache(
  companyId: string,
  query: string,
  response: string,
): Promise<void> {
  try {
    const apiKey = await getGoogleApiKey(companyId)
    if (!apiKey) return

    const embedding = await generateEmbedding(apiKey, query)
    if (!embedding) return

    // D20: callee-side credential scrubbing — DO NOT store raw response
    const sanitizedResponse = scrubCredentials(response)

    await getDB(companyId).insertSemanticCache({
      queryText: query,
      queryEmbedding: embedding,
      response: sanitizedResponse,
      ttlHours: TTL_HOURS,
    })
  } catch (err) {
    log.warn({ event: 'semantic_cache_error', op: 'save', err }, 'Semantic cache save failed')
    // Silently ignore — NFR-CACHE-R2
  }
}

async function getGoogleApiKey(companyId: string): Promise<string | null> {
  try {
    const credentials = await getCredentials(companyId, 'google_ai')
    const apiKey = extractApiKey(credentials)
    if (!apiKey) {
      log.warn({ event: 'semantic_cache_error', op: 'embedding', reason: 'no_google_api_key', companyId })
      return null
    }
    return apiKey
  } catch {
    return null
  }
}
