/**
 * Story 22.3: Batch re-embedding script — Gemini 768d → Voyage AI 1024d
 *
 * Run AFTER migration 0061_voyage_vector_1024.sql has been applied.
 * Idempotent: only processes docs with NULL embeddings.
 * Advisory-locked: prevents concurrent execution.
 *
 * Usage: bun run packages/server/src/scripts/migrate-embeddings-1024.ts
 */

import { db } from '../db'
import { knowledgeDocs } from '../db/schema'
import {
  getEmbeddingBatch,
  prepareText,
  updateDocEmbedding,
  EMBEDDING_MODEL,
} from '../services/voyage-embedding'
import { eq, and, isNull } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

const BATCH_SIZE = 500
const EMBED_BATCH_SIZE = 32
const BATCH_DELAY_MS = 100

interface MigrationResult {
  totalDocs: number
  succeeded: number
  failed: number
  skipped: number
}

async function acquireLock(): Promise<boolean> {
  const rows = await db.execute(
    sql`SELECT pg_try_advisory_lock(hashtext('migrate-embeddings-1024')) AS acquired`
  )
  const row = (rows as unknown as Array<{ acquired: boolean }>)[0]
  return row?.acquired === true
}

async function releaseLock(): Promise<void> {
  await db.execute(
    sql`SELECT pg_advisory_unlock(hashtext('migrate-embeddings-1024'))`
  )
}

async function fetchNullEmbeddingDocs(): Promise<
  Array<{ id: string; companyId: string; title: string; content: string | null }>
> {
  return db
    .select({
      id: knowledgeDocs.id,
      companyId: knowledgeDocs.companyId,
      title: knowledgeDocs.title,
      content: knowledgeDocs.content,
    })
    .from(knowledgeDocs)
    .where(
      and(isNull(knowledgeDocs.embedding), eq(knowledgeDocs.isActive, true))
    )
    .orderBy(knowledgeDocs.id)
    .limit(BATCH_SIZE)
}

function groupByCompany(
  docs: Array<{ id: string; companyId: string; title: string; content: string | null }>
): Map<string, Array<{ id: string; title: string; content: string | null }>> {
  const grouped = new Map<string, Array<{ id: string; title: string; content: string | null }>>()
  for (const doc of docs) {
    const existing = grouped.get(doc.companyId) ?? []
    existing.push({ id: doc.id, title: doc.title, content: doc.content })
    grouped.set(doc.companyId, existing)
  }
  return grouped
}

async function embedCompanyDocs(
  companyId: string,
  docs: Array<{ id: string; title: string; content: string | null }>
): Promise<{ succeeded: number; failed: number; skipped: number }> {
  const result = { succeeded: 0, failed: 0, skipped: 0 }

  const validDocs: Array<{ id: string; text: string }> = []
  for (const doc of docs) {
    if (!doc.title && !doc.content) {
      result.skipped++
      continue
    }
    validDocs.push({ id: doc.id, text: prepareText(doc.title, doc.content) })
  }

  if (validDocs.length === 0) return result

  // Process in embedding batch chunks
  for (let i = 0; i < validDocs.length; i += EMBED_BATCH_SIZE) {
    const chunk = validDocs.slice(i, i + EMBED_BATCH_SIZE)
    const texts = chunk.map((d) => d.text)
    const embeddings = await getEmbeddingBatch(companyId, texts, EMBED_BATCH_SIZE)

    for (let j = 0; j < chunk.length; j++) {
      const embedding = embeddings[j]
      if (embedding) {
        try {
          await updateDocEmbedding(chunk[j].id, companyId, embedding)
          result.succeeded++
        } catch {
          result.failed++
        }
      } else {
        result.failed++
      }
    }

    // Rate limit delay between batches
    if (i + EMBED_BATCH_SIZE < validDocs.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
    }
  }

  return result
}

async function verifyGoNoGo10(): Promise<{
  nullActive: number
  wrongDims: number
  cacheWrongDims: number
  pass: boolean
}> {
  const nullRows = await db.execute(
    sql`SELECT count(*)::int AS cnt FROM knowledge_docs WHERE embedding IS NULL AND is_active = true`
  )
  const nullResult = (nullRows as unknown as Array<{ cnt: number }>)[0]

  const dimsRows = await db.execute(
    sql`SELECT count(*)::int AS cnt FROM knowledge_docs WHERE vector_dims(embedding) != 1024`
  )
  const dimsResult = (dimsRows as unknown as Array<{ cnt: number }>)[0]

  const cacheRows = await db.execute(
    sql`SELECT count(*)::int AS cnt FROM semantic_cache WHERE vector_dims(query_embedding) != 1024`
  )
  const cacheResult = (cacheRows as unknown as Array<{ cnt: number }>)[0]

  const nullActive = nullResult?.cnt ?? -1
  const wrongDims = dimsResult?.cnt ?? -1
  const cacheWrongDims = cacheResult?.cnt ?? -1

  return {
    nullActive,
    wrongDims,
    cacheWrongDims,
    pass: nullActive === 0 && wrongDims === 0 && cacheWrongDims === 0,
  }
}

async function main(): Promise<void> {
  console.log('=== Story 22.3: Voyage AI Vector Migration 768→1024 ===')
  console.log(`Model: ${EMBEDDING_MODEL}, Batch: ${EMBED_BATCH_SIZE}, Page: ${BATCH_SIZE}`)

  // Acquire advisory lock
  const locked = await acquireLock()
  if (!locked) {
    console.error('ABORT: Another instance is already running (advisory lock not acquired)')
    process.exit(1)
  }
  console.log('Advisory lock acquired')

  const totals: MigrationResult = { totalDocs: 0, succeeded: 0, failed: 0, skipped: 0 }

  try {
    // Paginated loop — process BATCH_SIZE docs at a time until none remain
    // Safety: break on zero-progress page to prevent infinite loop (e.g., missing API key for all remaining companies)
    let pageNum = 0
    let consecutiveZeroProgress = 0
    const MAX_ZERO_PROGRESS_PAGES = 3

    while (true) {
      pageNum++
      const docs = await fetchNullEmbeddingDocs()
      if (docs.length === 0) break

      console.log(`\nPage ${pageNum}: ${docs.length} docs with NULL embedding`)
      totals.totalDocs += docs.length

      let pageSucceeded = 0
      const grouped = groupByCompany(docs)
      for (const [companyId, companyDocs] of grouped) {
        const result = await embedCompanyDocs(companyId, companyDocs)
        totals.succeeded += result.succeeded
        totals.failed += result.failed
        totals.skipped += result.skipped
        pageSucceeded += result.succeeded
        console.log(
          `  company=${companyId}: ${result.succeeded} succeeded, ${result.failed} failed, ${result.skipped} skipped`
        )
      }

      // Detect zero-progress loop (all docs failed, none embedded)
      if (pageSucceeded === 0) {
        consecutiveZeroProgress++
        console.warn(`WARNING: Zero progress on page ${pageNum} (${consecutiveZeroProgress}/${MAX_ZERO_PROGRESS_PAGES})`)
        if (consecutiveZeroProgress >= MAX_ZERO_PROGRESS_PAGES) {
          console.error('ABORT: No progress after 3 consecutive pages — check Voyage AI credentials')
          break
        }
      } else {
        consecutiveZeroProgress = 0
      }
    }

    console.log('\n=== Migration Summary ===')
    console.log(`Total docs: ${totals.totalDocs}`)
    console.log(`Succeeded: ${totals.succeeded}`)
    console.log(`Failed: ${totals.failed}`)
    console.log(`Skipped (no content): ${totals.skipped}`)

    // Go/No-Go #10 verification
    console.log('\n=== Go/No-Go #10 Verification ===')
    const verification = await verifyGoNoGo10()
    console.log(`NULL active docs: ${verification.nullActive} (must be 0)`)
    console.log(`Wrong dimension docs: ${verification.wrongDims} (must be 0)`)
    console.log(`Wrong dimension cache: ${verification.cacheWrongDims} (must be 0)`)

    if (verification.pass) {
      console.log('\n✅ Go/No-Go #10 PASSED — all vectors are 1024d, zero NULLs')
    } else {
      console.error('\n❌ Go/No-Go #10 FAILED')
      process.exit(1)
    }
  } finally {
    await releaseLock()
    console.log('Advisory lock released')
  }
}

main().catch((err) => {
  console.error('Migration script failed:', err)
  process.exit(1)
})
