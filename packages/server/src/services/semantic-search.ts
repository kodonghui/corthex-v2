import { generateEmbedding, extractApiKey } from './embedding-service'
import { getCredentials } from './credential-vault'
import { getDB } from '../db/scoped-query'

export interface SemanticSearchOptions {
  topK?: number
  threshold?: number
  folderId?: string
  folderIds?: string[]
}

export interface SemanticSearchResult {
  id: string
  title: string
  content: string | null
  folderId: string | null
  tags: string[] | null
  score: number
}

/**
 * Perform semantic search: query text -> Gemini embedding -> pgvector cosine similarity.
 * Returns results sorted by relevance (highest score first).
 * Returns null if embedding generation fails (caller should fallback to keyword search).
 */
export async function semanticSearch(
  companyId: string,
  query: string,
  options: SemanticSearchOptions = {},
): Promise<SemanticSearchResult[] | null> {
  const { topK = 5, threshold = 0.8, folderId, folderIds } = options

  // Get API key
  let apiKey: string | undefined
  try {
    const credentials = await getCredentials(companyId, 'google_ai')
    apiKey = extractApiKey(credentials)
  } catch {
    console.warn({ companyId }, 'semantic search: failed to get credentials')
    return null
  }

  if (!apiKey) {
    console.warn({ companyId }, 'semantic search: no Google AI API key configured')
    return null
  }

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(apiKey, query)
  if (!queryEmbedding) {
    console.warn({ companyId }, 'semantic search: embedding generation failed')
    return null
  }

  // Search using pgvector cosine similarity
  const dbHelper = getDB(companyId)
  // folderIds takes precedence over folderId; both are optional
  const folderFilter = folderIds && folderIds.length > 0 ? folderIds : folderId
  const results = await dbHelper.searchSimilarDocs(queryEmbedding, topK, threshold, folderFilter)

  // Convert distance to score (score = 1 - distance, clamped to [0, 1])
  return results.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    folderId: row.folderId,
    tags: row.tags,
    score: Math.max(0, 1 - Number(row.distance)),
  }))
}
