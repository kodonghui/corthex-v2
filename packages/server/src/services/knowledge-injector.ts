import { db } from '../db'
import { departmentKnowledge, knowledgeDocs, knowledgeFolders, agentMemories } from '../db/schema'
import { eq, and, desc, sql, inArray } from 'drizzle-orm'

// === Constants ===

const DEPT_KNOWLEDGE_CHAR_BUDGET = 4000
const AGENT_MEMORY_CHAR_BUDGET = 2000
const DOC_CONTENT_MAX_CHARS = 2000
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// === Cache ===

type CacheEntry = { data: string | null; timestamp: number }
const cache = new Map<string, CacheEntry>()

function getCached(key: string): string | null | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return undefined
  }
  return entry.data
}

function setCache(key: string, data: string | null): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function clearKnowledgeCache(companyId: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(companyId + ':')) {
      cache.delete(key)
    }
  }
}

// Exposed for testing
export function clearAllCache(): void {
  cache.clear()
}

// === Layer 1: Department Knowledge ===

export async function collectDepartmentKnowledge(
  companyId: string,
  departmentId: string,
): Promise<{ title: string; content: string; category: string | null }[]> {
  const rows = await db
    .select({
      title: departmentKnowledge.title,
      content: departmentKnowledge.content,
      category: departmentKnowledge.category,
    })
    .from(departmentKnowledge)
    .where(
      and(
        eq(departmentKnowledge.companyId, companyId),
        eq(departmentKnowledge.departmentId, departmentId),
      ),
    )
    .orderBy(desc(departmentKnowledge.updatedAt))

  return rows
}

// === Layer 2: Knowledge Docs in Department Folders ===

export async function collectDepartmentDocs(
  companyId: string,
  departmentId: string,
  charBudget: number,
): Promise<{ title: string; content: string | null; updatedAt: Date }[]> {
  const docs = await db
    .select({
      title: knowledgeDocs.title,
      content: knowledgeDocs.content,
      updatedAt: knowledgeDocs.updatedAt,
    })
    .from(knowledgeDocs)
    .innerJoin(knowledgeFolders, eq(knowledgeDocs.folderId, knowledgeFolders.id))
    .where(
      and(
        eq(knowledgeFolders.companyId, companyId),
        eq(knowledgeFolders.departmentId, departmentId),
        eq(knowledgeDocs.isActive, true),
        eq(knowledgeFolders.isActive, true),
      ),
    )
    .orderBy(desc(knowledgeDocs.updatedAt))

  // Truncate docs to fit within budget
  const result: { title: string; content: string | null; updatedAt: Date }[] = []
  let usedChars = 0

  for (const doc of docs) {
    const titleLen = doc.title.length + 10 // formatting overhead
    if (usedChars + titleLen > charBudget) break

    let truncatedContent = doc.content
    if (truncatedContent && truncatedContent.length > DOC_CONTENT_MAX_CHARS) {
      truncatedContent = truncatedContent.slice(0, DOC_CONTENT_MAX_CHARS) + '\n[...truncated]'
    }

    const entryLen = titleLen + (truncatedContent?.length ?? 0)
    if (usedChars + entryLen > charBudget) {
      // Truncate this doc's content to fit remaining budget
      const truncSuffix = '\n[...truncated]'
      const remaining = charBudget - usedChars - titleLen - truncSuffix.length
      if (remaining > 100 && truncatedContent) {
        truncatedContent = truncatedContent.slice(0, remaining) + truncSuffix
        result.push({ title: doc.title, content: truncatedContent, updatedAt: doc.updatedAt })
      }
      break
    }

    usedChars += entryLen
    result.push({ title: doc.title, content: truncatedContent, updatedAt: doc.updatedAt })
  }

  return result
}

// === Similarity Scoring ===

export function calculateSimilarity(
  taskKeywords: string[],
  memoryContext: string | null,
): number {
  if (!memoryContext || !memoryContext.trim() || taskKeywords.length === 0) return 0

  const memoryKeywords = memoryContext
    .split('\n')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0)

  if (memoryKeywords.length === 0) return 0

  const taskSet = new Set(taskKeywords.map(k => k.toLowerCase()))
  const memSet = new Set(memoryKeywords)

  // Jaccard similarity: |intersection| / |union|
  let intersectionCount = 0
  for (const k of taskSet) {
    if (memSet.has(k)) intersectionCount++
  }

  const unionCount = new Set([...taskSet, ...memSet]).size
  let score = unionCount > 0 ? intersectionCount / unionCount : 0

  // Substring boost: +0.1 if any keyword is a substring of another keyword in the other set
  if (score < 1.0) {
    let hasSubstringMatch = false
    for (const tk of taskSet) {
      if (hasSubstringMatch) break
      for (const mk of memSet) {
        if (tk !== mk && (mk.includes(tk) || tk.includes(mk))) {
          hasSubstringMatch = true
          break
        }
      }
    }
    if (hasSubstringMatch) {
      score = Math.min(1.0, score + 0.1)
    }
  }

  return score
}

// === Agent Memories ===

export async function collectAgentMemories(
  companyId: string,
  agentId: string,
  charBudget: number,
): Promise<{ id: string; key: string; content: string; memoryType: string }[]> {
  const memories = await db
    .select({
      id: agentMemories.id,
      key: agentMemories.key,
      content: agentMemories.content,
      memoryType: agentMemories.memoryType,
    })
    .from(agentMemories)
    .where(
      and(
        eq(agentMemories.companyId, companyId),
        eq(agentMemories.agentId, agentId),
        eq(agentMemories.isActive, true),
      ),
    )
    .orderBy(desc(agentMemories.usageCount))

  const result: { id: string; key: string; content: string; memoryType: string }[] = []
  let usedChars = 0

  for (const mem of memories) {
    const entryLen = mem.key.length + mem.content.length + 20 // formatting overhead
    if (usedChars + entryLen > charBudget) break
    usedChars += entryLen
    result.push(mem)
  }

  return result
}

async function updateMemoryUsage(memoryIds: string[]): Promise<void> {
  if (memoryIds.length === 0) return
  try {
    await db
      .update(agentMemories)
      .set({
        usageCount: sql`${agentMemories.usageCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(inArray(agentMemories.id, memoryIds))
  } catch {
    // Fire-and-forget: don't break agent execution for usage tracking
  }
}

// === Similarity-Based Memory Collection ===

export async function collectSimilarMemories(
  companyId: string,
  agentId: string,
  taskDescription: string,
  charBudget: number,
): Promise<string> {
  // Dynamic import to avoid circular dependency (memory-extractor imports from knowledge-injector)
  const { extractTaskKeywords } = await import('./memory-extractor')
  const taskKeywords = extractTaskKeywords(taskDescription)

  if (taskKeywords.length === 0) {
    return ''
  }

  // Fetch all active memories with context field
  const memories = await db
    .select({
      id: agentMemories.id,
      key: agentMemories.key,
      content: agentMemories.content,
      memoryType: agentMemories.memoryType,
      context: agentMemories.context,
      usageCount: agentMemories.usageCount,
    })
    .from(agentMemories)
    .where(
      and(
        eq(agentMemories.companyId, companyId),
        eq(agentMemories.agentId, agentId),
        eq(agentMemories.isActive, true),
      ),
    )

  // Score each memory
  const scored = memories
    .map(m => ({
      ...m,
      score: calculateSimilarity(taskKeywords, m.context),
    }))
    .filter(m => m.score >= 0.2)
    .sort((a, b) => b.score - a.score || (b.usageCount ?? 0) - (a.usageCount ?? 0))

  if (scored.length === 0) return ''

  // Format output
  const parts: string[] = ['### 관련 학습 기억 (유사도 기반)\n']
  let usedChars = parts[0].length
  const matchedIds: string[] = []

  for (const mem of scored) {
    const scorePercent = Math.round(mem.score * 100)
    const entry = `- **${mem.key}** (유사도: ${scorePercent}%): ${mem.content}\n`
    if (usedChars + entry.length > charBudget) break
    parts.push(entry)
    usedChars += entry.length
    matchedIds.push(mem.id)
  }

  // Fire-and-forget: update usage counts for matched memories
  if (matchedIds.length > 0) {
    updateMemoryUsage(matchedIds).catch(() => {})
  }

  return parts.join('')
}

// === Main Collector ===

export async function collectKnowledgeContext(
  companyId: string,
  agentId: string,
  departmentId: string | null | undefined,
): Promise<string | null> {
  if (!departmentId) return null

  const cacheKey = `${companyId}:dept:${departmentId}`
  const cached = getCached(cacheKey)
  if (cached !== undefined) return cached

  const parts: string[] = []
  let totalChars = 0

  // Layer 1: Department Knowledge (priority)
  const deptKnowledge = await collectDepartmentKnowledge(companyId, departmentId)
  if (deptKnowledge.length > 0) {
    parts.push('### 부서 참고 자료\n')
    for (const item of deptKnowledge) {
      const entry = `- **${item.title}**${item.category ? ` [${item.category}]` : ''}: ${item.content}\n`
      if (totalChars + entry.length > DEPT_KNOWLEDGE_CHAR_BUDGET) break
      parts.push(entry)
      totalChars += entry.length
    }
  }

  // Layer 2: Knowledge Docs in Department Folders
  const remainingBudget = DEPT_KNOWLEDGE_CHAR_BUDGET - totalChars
  if (remainingBudget > 200) {
    const docs = await collectDepartmentDocs(companyId, departmentId, remainingBudget)
    if (docs.length > 0) {
      parts.push('\n### 관련 문서\n')
      for (const doc of docs) {
        parts.push(`#### ${doc.title}\n`)
        if (doc.content) {
          parts.push(`${doc.content}\n`)
        }
      }
    }
  }

  if (parts.length === 0) {
    setCache(cacheKey, null)
    return null
  }

  const result = parts.join('')
  setCache(cacheKey, result)
  return result
}

export async function collectAgentMemoryContext(
  companyId: string,
  agentId: string,
  taskDescription?: string,
): Promise<string | null> {
  // Cache key includes task context hash for similarity-based lookups
  const taskHash = taskDescription
    ? simpleHash(taskDescription.slice(0, 100))
    : 'none'
  const cacheKey = `${companyId}:agent:${agentId}:${taskHash}`
  const cached = getCached(cacheKey)
  if (cached !== undefined) return cached

  // Route to similarity-based collection when task description provided
  if (taskDescription && taskDescription.trim()) {
    const similarResult = await collectSimilarMemories(
      companyId,
      agentId,
      taskDescription,
      AGENT_MEMORY_CHAR_BUDGET,
    )

    if (similarResult) {
      setCache(cacheKey, similarResult)
      return similarResult
    }
    // Fall through to generic collection if no similar memories found
  }

  const memories = await collectAgentMemories(companyId, agentId, AGENT_MEMORY_CHAR_BUDGET)
  if (memories.length === 0) {
    setCache(cacheKey, null)
    return null
  }

  const parts: string[] = []
  for (const mem of memories) {
    parts.push(`- **${mem.key}** (${mem.memoryType}): ${mem.content}`)
  }

  const result = parts.join('\n')
  setCache(cacheKey, result)

  // Update usage counts (fire-and-forget)
  updateMemoryUsage(memories.map((m) => m.id)).catch(() => {})

  return result
}

// Simple hash for cache key differentiation
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32bit integer
  }
  return hash.toString(36)
}

// === Injection Preview (for API) ===

export async function getInjectionPreview(
  companyId: string,
  agentId: string,
  departmentId: string | null | undefined,
): Promise<{
  departmentKnowledge: { title: string; category: string | null }[]
  knowledgeDocs: { title: string; excerpt: string }[]
  agentMemories: { key: string; content: string }[]
  totalChars: number
  truncated: boolean
}> {
  const deptKnowledge = departmentId
    ? await collectDepartmentKnowledge(companyId, departmentId)
    : []
  const docs = departmentId
    ? await collectDepartmentDocs(companyId, departmentId, DEPT_KNOWLEDGE_CHAR_BUDGET)
    : []
  const memories = await collectAgentMemories(companyId, agentId, AGENT_MEMORY_CHAR_BUDGET)

  let totalChars = 0
  for (const dk of deptKnowledge) totalChars += dk.title.length + dk.content.length
  for (const d of docs) totalChars += d.title.length + (d.content?.length ?? 0)
  for (const m of memories) totalChars += m.key.length + m.content.length

  return {
    departmentKnowledge: deptKnowledge.map((dk) => ({ title: dk.title, category: dk.category })),
    knowledgeDocs: docs.map((d) => ({
      title: d.title,
      excerpt: (d.content ?? '').slice(0, 200),
    })),
    agentMemories: memories.map((m) => ({ key: m.key, content: m.content })),
    totalChars,
    truncated: totalChars > DEPT_KNOWLEDGE_CHAR_BUDGET + AGENT_MEMORY_CHAR_BUDGET,
  }
}
