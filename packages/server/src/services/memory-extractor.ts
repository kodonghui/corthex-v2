import { llmRouter, resolveModel } from './llm-router'
import { scanForCredentials } from './agent-runner'
import { clearKnowledgeCache } from './knowledge-injector'
import { db } from '../db'
import { agentMemories } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import type { LLMRouterContext } from './llm-router'

// === Constants ===

const MAX_LEARNINGS = 3
const RATE_LIMIT_MS = 60_000 // 1 minute per agent

// === Rate Limiter ===

const lastExtraction = new Map<string, number>()

export function isRateLimited(agentId: string): boolean {
  const last = lastExtraction.get(agentId)
  if (!last) return false
  return Date.now() - last < RATE_LIMIT_MS
}

function markExtracted(agentId: string): void {
  lastExtraction.set(agentId, Date.now())
}

// Exposed for testing
export function clearRateLimiter(): void {
  lastExtraction.clear()
}

// === Extraction Prompt ===

const EXTRACTION_SYSTEM_PROMPT = `당신은 AI 에이전트의 학습 사항을 추출하는 도우미입니다.
작업 내용과 결과를 보고, 향후 같은 종류의 작업에서 기억해둘 만한
핵심 교훈 1~3개를 추출하세요.

규칙:
- 일반적이고 뻔한 내용(예: "꼼꼼히 작성해야 한다")은 제외
- 이 특정 작업에서 발견한 구체적이고 재사용 가능한 교훈만 포함
- 비밀번호, API 키, 토큰 등 크리덴셜 정보는 절대 포함하지 마세요

반드시 JSON 배열로만 응답하세요 (다른 텍스트 없이):
[{"key": "짧은 제목", "content": "학습 내용", "memoryType": "learning"}]

memoryType 옵션: learning (기본), insight, preference, fact`

// === JSON Parsing ===

export function parseExtractionResponse(raw: string): Array<{
  key: string
  content: string
  memoryType: 'learning' | 'insight' | 'preference' | 'fact'
}> {
  // Try direct JSON parse first
  try {
    const parsed = JSON.parse(raw.trim())
    if (Array.isArray(parsed)) return validateItems(parsed)
  } catch {
    // fallthrough to regex
  }

  // Regex fallback: extract [...] array
  const match = raw.match(/\[[\s\S]*\]/)
  if (match) {
    try {
      const parsed = JSON.parse(match[0])
      if (Array.isArray(parsed)) return validateItems(parsed)
    } catch {
      // parsing failed
    }
  }

  return []
}

function validateItems(items: unknown[]): Array<{
  key: string
  content: string
  memoryType: 'learning' | 'insight' | 'preference' | 'fact'
}> {
  const validTypes = new Set(['learning', 'insight', 'preference', 'fact'])
  const result: Array<{ key: string; content: string; memoryType: 'learning' | 'insight' | 'preference' | 'fact' }> = []

  for (const item of items.slice(0, MAX_LEARNINGS)) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    const key = String(obj.key || obj.title || '').trim()
    const content = String(obj.content || obj.value || '').trim()
    if (!key || !content) continue

    const memoryType = validTypes.has(String(obj.memoryType))
      ? (String(obj.memoryType) as 'learning' | 'insight' | 'preference' | 'fact')
      : 'learning'

    result.push({ key, content, memoryType })
  }

  return result
}

// === Duplicate Detection ===

async function findDuplicateMemory(
  companyId: string,
  agentId: string,
  key: string,
): Promise<{ id: string } | null> {
  const rows = await db
    .select({ id: agentMemories.id, key: agentMemories.key })
    .from(agentMemories)
    .where(
      and(
        eq(agentMemories.companyId, companyId),
        eq(agentMemories.agentId, agentId),
        eq(agentMemories.isActive, true),
      ),
    )

  const lowerKey = key.toLowerCase()
  const match = rows.find(r => r.key.toLowerCase() === lowerKey)
  return match ? { id: match.id } : null
}

// === Save Memory (with dedup + credential scrubbing) ===

async function saveMemory(
  companyId: string,
  agentId: string,
  item: { key: string; content: string; memoryType: 'learning' | 'insight' | 'preference' | 'fact' },
  source: string,
): Promise<boolean> {
  // Credential scrubbing
  try {
    scanForCredentials(item.key + ' ' + item.content)
  } catch {
    // Credential detected — skip this memory
    return false
  }

  // Duplicate detection
  const existing = await findDuplicateMemory(companyId, agentId, item.key)

  if (existing) {
    // Update existing memory
    await db
      .update(agentMemories)
      .set({
        content: item.content,
        memoryType: item.memoryType,
        usageCount: sql`${agentMemories.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(agentMemories.id, existing.id))
  } else {
    // Insert new memory
    await db.insert(agentMemories).values({
      companyId,
      agentId,
      memoryType: item.memoryType,
      key: item.key.slice(0, 200), // varchar(200) limit
      content: item.content,
      source,
      confidence: 70, // auto-extracted default confidence
    })
  }

  return true
}

// === Main Function ===

export async function extractAndSaveMemories(params: {
  companyId: string
  agentId: string
  taskDescription: string
  taskResult: string
  source?: string
}): Promise<{ saved: number; memories: { key: string; content: string }[] }> {
  const { companyId, agentId, taskDescription, taskResult, source } = params

  // Rate limit check
  if (isRateLimited(agentId)) {
    return { saved: 0, memories: [] }
  }

  markExtracted(agentId)

  // LLM call for extraction
  const { model } = resolveModel({ tier: 'worker', modelName: null })
  const context: LLMRouterContext = {
    companyId,
    agentId,
    source: 'delegation',
  }

  const userContent = `작업: ${taskDescription.slice(0, 2000)}\n결과 요약: ${taskResult.slice(0, 2000)}`

  const response = await llmRouter.call(
    {
      model,
      systemPrompt: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
      temperature: 0,
    },
    context,
  )

  const items = parseExtractionResponse(response.content)
  if (items.length === 0) {
    return { saved: 0, memories: [] }
  }

  // Save each extracted memory
  const savedMemories: { key: string; content: string }[] = []
  const sourceLabel = source ? `auto:${source}` : 'auto'

  for (const item of items) {
    const saved = await saveMemory(companyId, agentId, item, sourceLabel)
    if (saved) {
      savedMemories.push({ key: item.key, content: item.content })
    }
  }

  // Clear knowledge cache so next injection picks up new memories
  if (savedMemories.length > 0) {
    clearKnowledgeCache(companyId)
  }

  return { saved: savedMemories.length, memories: savedMemories }
}

// === Memory Consolidation ===

export async function consolidateMemories(
  companyId: string,
  agentId: string,
): Promise<{ merged: number; remaining: number }> {
  const memories = await db
    .select({
      id: agentMemories.id,
      key: agentMemories.key,
      content: agentMemories.content,
      usageCount: agentMemories.usageCount,
      createdAt: agentMemories.createdAt,
    })
    .from(agentMemories)
    .where(
      and(
        eq(agentMemories.companyId, companyId),
        eq(agentMemories.agentId, agentId),
        eq(agentMemories.isActive, true),
      ),
    )

  if (memories.length <= 1) {
    return { merged: 0, remaining: memories.length }
  }

  // Group by similar keys (case-insensitive + substring overlap)
  const groups: Map<string, typeof memories> = new Map()

  for (const mem of memories) {
    const lowerKey = mem.key.toLowerCase()
    let found = false

    for (const [groupKey, group] of groups) {
      // Check if keys are similar: same lowercase, or one contains the other
      if (
        groupKey === lowerKey ||
        groupKey.includes(lowerKey) ||
        lowerKey.includes(groupKey)
      ) {
        group.push(mem)
        found = true
        break
      }
    }

    if (!found) {
      groups.set(lowerKey, [mem])
    }
  }

  let mergedCount = 0

  for (const [, group] of groups) {
    if (group.length <= 1) continue

    // Keep the one with highest usageCount as primary
    group.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
    const primary = group[0]
    const others = group.slice(1)

    // Merge content from others into primary
    const mergedContent = [primary.content, ...others.map(o => o.content)]
      .filter((c, i, arr) => arr.indexOf(c) === i) // deduplicate exact content
      .join('\n---\n')

    const totalUsage = group.reduce((sum, m) => sum + (m.usageCount ?? 0), 0)

    // Update primary
    await db
      .update(agentMemories)
      .set({
        content: mergedContent,
        usageCount: totalUsage,
        updatedAt: new Date(),
      })
      .where(eq(agentMemories.id, primary.id))

    // Soft-delete others
    for (const other of others) {
      await db
        .update(agentMemories)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(agentMemories.id, other.id))
    }

    mergedCount += others.length
  }

  if (mergedCount > 0) {
    clearKnowledgeCache(companyId)
  }

  return { merged: mergedCount, remaining: memories.length - mergedCount }
}
