import { VoyageAIClient, VoyageAIError, VoyageAITimeoutError } from 'voyageai'
import { getCredentials } from './credential-vault'
import { db } from '../db'
import { knowledgeDocs } from '../db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export const EMBEDDING_MODEL = 'voyage-3'
export const EMBEDDING_DIMENSIONS = 1024
const MAX_TEXT_LENGTH = 10_000
const BATCH_DELAY_MS = 100
const BATCH_MAX_DOCS = 500
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000] // ms
const MAX_RETRY_DELAY = 30_000

/**
 * Extract API key from credential vault result (handles different field names).
 */
function extractApiKey(credentials: Record<string, string>): string | undefined {
  return credentials.api_key || credentials.apiKey || Object.values(credentials)[0]
}

/**
 * Determine if an error is retryable (rate limit or server error).
 */
function isRetryable(err: unknown): boolean {
  if (err instanceof VoyageAITimeoutError) return true
  if (err instanceof VoyageAIError) {
    const status = err.statusCode
    if (status === 429 || (status !== undefined && status >= 500)) return true
    return false
  }
  // Network errors
  if (err instanceof TypeError && (err as any).message?.includes('fetch')) return true
  return false
}

/**
 * Execute fn with exponential backoff on retryable errors.
 * Returns null after all retries exhausted or on non-retryable error.
 */
async function withBackoff<T>(fn: () => Promise<T>, companyId: string): Promise<T | null> {
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const errorType = err instanceof Error ? err.constructor.name : 'UnknownError'
      if (attempt === RETRY_DELAYS.length || !isRetryable(err)) {
        console.warn({ companyId, model: EMBEDDING_MODEL, errorType }, 'embedding failed after retries')
        return null
      }
      const delay = Math.min(RETRY_DELAYS[attempt], MAX_RETRY_DELAY)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  return null
}

/**
 * Prepare text for embedding: title + content, truncated to MAX_TEXT_LENGTH.
 */
export function prepareText(title: string, content: string | null): string {
  const combined = content ? `${title}\n\n${content}` : title
  return combined.length > MAX_TEXT_LENGTH
    ? combined.slice(0, MAX_TEXT_LENGTH)
    : combined
}

/**
 * Generate embedding for a single text using Voyage AI voyage-3.
 * Returns null on failure (graceful degradation — never throws).
 * Credentials are fetched internally via getCredentials(companyId, 'voyage_ai').
 */
export async function getEmbedding(
  companyId: string,
  text: string,
): Promise<number[] | null> {
  try {
    const credentials = await getCredentials(companyId, 'voyage_ai')
    const apiKey = extractApiKey(credentials)
    if (!apiKey) {
      console.warn({ companyId, model: EMBEDDING_MODEL, errorType: 'NoApiKey' }, 'no Voyage AI API key found')
      return null
    }

    const client = new VoyageAIClient({ apiKey })
    const result = await withBackoff(
      () => client.embed({ input: [text], model: EMBEDDING_MODEL }),
      companyId,
    )
    if (!result) return null

    const embedding = result.data?.[0]?.embedding
    if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
      console.warn({ companyId, model: EMBEDDING_MODEL, errorType: 'DimensionMismatch', expected: EMBEDDING_DIMENSIONS, got: embedding?.length }, 'embedding dimension mismatch')
      return null
    }
    return embedding
  } catch (err) {
    const errorType = err instanceof Error ? err.constructor.name : 'UnknownError'
    console.warn({ companyId, model: EMBEDDING_MODEL, errorType }, 'getEmbedding failed')
    return null
  }
}

/**
 * Generate embeddings for multiple texts in batches.
 * Returns array of embeddings (null for failures).
 * Processes in chunks of batchSize with 100ms delay between batches.
 */
export async function getEmbeddingBatch(
  companyId: string,
  texts: string[],
  batchSize = 32,
): Promise<(number[] | null)[]> {
  if (texts.length === 0) return []

  let apiKey: string | undefined
  try {
    const credentials = await getCredentials(companyId, 'voyage_ai')
    apiKey = extractApiKey(credentials)
  } catch {
    console.warn({ companyId, model: EMBEDDING_MODEL, errorType: 'CredentialError' }, 'batch: failed to get credentials')
    return texts.map(() => null)
  }

  if (!apiKey) {
    console.warn({ companyId, model: EMBEDDING_MODEL, errorType: 'NoApiKey' }, 'batch: no Voyage AI API key')
    return texts.map(() => null)
  }

  const client = new VoyageAIClient({ apiKey })
  const results: (number[] | null)[] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)

    const batchResult = await withBackoff(
      () => client.embed({ input: batch, model: EMBEDDING_MODEL }),
      companyId,
    )

    if (batchResult?.data) {
      for (let j = 0; j < batch.length; j++) {
        const embedding = batchResult.data[j]?.embedding
        if (embedding && embedding.length === EMBEDDING_DIMENSIONS) {
          results.push(embedding)
        } else {
          results.push(null)
        }
      }
    } else {
      // Entire batch failed — fill with nulls
      for (let j = 0; j < batch.length; j++) {
        results.push(null)
      }
    }

    // Rate limit: 100ms delay between batches
    if (i + batchSize < texts.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS))
    }
  }

  return results
}

/**
 * Update a document's embedding in the database.
 * Uses raw SQL for the vector column since Drizzle .set() with customType
 * may not handle pgvector correctly in UPDATE context.
 */
export async function updateDocEmbedding(
  docId: string,
  companyId: string,
  embedding: number[],
  model: string = EMBEDDING_MODEL,
): Promise<void> {
  if (embedding.some(v => !Number.isFinite(v))) {
    throw new Error('embedding contains non-finite values')
  }
  const vectorStr = `[${embedding.join(',')}]`
  await db.execute(sql`
    UPDATE knowledge_docs
    SET embedding = ${vectorStr}::vector,
        embedding_model = ${model},
        embedded_at = NOW()
    WHERE id = ${docId} AND company_id = ${companyId}
  `)
}

/**
 * Embed a single document by ID. Fire-and-forget safe.
 * Returns true if embedding was successful.
 */
export async function embedDocument(
  docId: string,
  companyId: string,
): Promise<boolean> {
  try {
    const [doc] = await db.select({
      id: knowledgeDocs.id,
      title: knowledgeDocs.title,
      content: knowledgeDocs.content,
    })
      .from(knowledgeDocs)
      .where(and(
        eq(knowledgeDocs.id, docId),
        eq(knowledgeDocs.companyId, companyId),
        eq(knowledgeDocs.isActive, true),
      ))
      .limit(1)

    if (!doc) {
      console.warn({ docId }, 'document not found for embedding')
      return false
    }

    const text = prepareText(doc.title, doc.content)
    const embedding = await getEmbedding(companyId, text)
    if (!embedding) return false

    await updateDocEmbedding(docId, companyId, embedding)
    console.log({ docId, model: EMBEDDING_MODEL }, 'document embedded successfully')
    return true
  } catch (err) {
    const errorType = err instanceof Error ? err.constructor.name : 'UnknownError'
    console.error({ errorType, docId }, 'embedDocument failed')
    return false
  }
}

/**
 * Trigger embedding in the background (fire-and-forget).
 * Does not block the caller. Failures are logged but not thrown.
 */
export function triggerEmbedding(docId: string, companyId: string): void {
  Promise.resolve().then(() => embedDocument(docId, companyId)).catch(() => {
    // Already logged in embedDocument
  })
}

/**
 * Batch embed all documents that have no embedding yet.
 * Returns summary of results.
 */
export async function embedAllDocuments(
  companyId: string,
): Promise<{ total: number; succeeded: number; failed: number; skipped: number }> {
  const docs = await db.select({
    id: knowledgeDocs.id,
    title: knowledgeDocs.title,
    content: knowledgeDocs.content,
  })
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.companyId, companyId),
      eq(knowledgeDocs.isActive, true),
      isNull(knowledgeDocs.embedding),
    ))
    .limit(BATCH_MAX_DOCS)

  const result = { total: docs.length, succeeded: 0, failed: 0, skipped: 0 }

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    if (!doc.title && !doc.content) {
      result.skipped++
      continue
    }

    const text = prepareText(doc.title, doc.content)
    const embedding = await getEmbedding(companyId, text)
    if (embedding) {
      try {
        await updateDocEmbedding(doc.id, companyId, embedding)
        result.succeeded++
      } catch {
        result.failed++
      }
    } else {
      result.failed++
    }

    if (i < docs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  console.log({ companyId, ...result }, 'batch embedding completed')
  return result
}
