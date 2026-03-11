import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCredentials } from './credential-vault'
import { db } from '../db'
import { knowledgeDocs } from '../db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

const EMBEDDING_MODEL = 'text-embedding-004'
const EMBEDDING_DIMENSIONS = 768
const MAX_TEXT_LENGTH = 10_000
const BATCH_DELAY_MS = 100
const BATCH_MAX_DOCS = 500

// Cache GoogleGenerativeAI instance per apiKey to avoid re-creation per call
let cachedGenAI: { key: string; instance: GoogleGenerativeAI } | null = null

function getGenAI(apiKey: string): GoogleGenerativeAI {
  if (cachedGenAI && cachedGenAI.key === apiKey) return cachedGenAI.instance
  const instance = new GoogleGenerativeAI(apiKey)
  cachedGenAI = { key: apiKey, instance }
  return instance
}

/**
 * Extract API key from credential vault result (handles different field names).
 */
export function extractApiKey(credentials: Record<string, string>): string | undefined {
  return credentials.api_key || credentials.apiKey || Object.values(credentials)[0]
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
 * Generate embedding for a single text using Gemini text-embedding-004.
 * Returns null on failure (graceful degradation).
 */
export async function generateEmbedding(
  apiKey: string,
  text: string,
): Promise<number[] | null> {
  try {
    const genAI = getGenAI(apiKey)
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
    const result = await model.embedContent(text)
    const values = result.embedding.values
    if (!values || values.length !== EMBEDDING_DIMENSIONS) {
      console.warn({ expected: EMBEDDING_DIMENSIONS, got: values?.length }, 'embedding dimension mismatch')
      return null
    }
    return values
  } catch (err) {
    console.error({ err, model: EMBEDDING_MODEL }, 'embedding generation failed')
    return null
  }
}

/**
 * Generate embeddings for multiple texts sequentially with delay.
 * Returns array of embeddings (null for failures).
 */
export async function generateEmbeddings(
  apiKey: string,
  texts: string[],
): Promise<(number[] | null)[]> {
  const results: (number[] | null)[] = []
  for (let i = 0; i < texts.length; i++) {
    const embedding = await generateEmbedding(apiKey, texts[i])
    results.push(embedding)
    if (i < texts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
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
  // Validate all values are finite numbers (prevent NaN/Infinity in SQL)
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
    const credentials = await getCredentials(companyId, 'google_ai')
    const apiKey = extractApiKey(credentials)
    if (!apiKey) {
      console.warn({ companyId }, 'no Google AI API key found, skipping embedding')
      return false
    }

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
    const embedding = await generateEmbedding(apiKey, text)
    if (!embedding) return false

    await updateDocEmbedding(docId, companyId, embedding)
    console.log({ docId, model: EMBEDDING_MODEL }, 'document embedded successfully')
    return true
  } catch (err) {
    console.error({ err, docId }, 'embedDocument failed')
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
  const credentials = await getCredentials(companyId, 'google_ai')
  const apiKey = extractApiKey(credentials)
  if (!apiKey) {
    throw new Error('No Google AI API key configured')
  }

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
    const embedding = await generateEmbedding(apiKey, text)
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
