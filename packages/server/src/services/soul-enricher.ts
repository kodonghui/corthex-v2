/**
 * Story 24.2: Soul Enricher — personality extraVars injection (E11, D23)
 * Story 28.6: Memory enrichment — agent memories injected into system prompt
 *
 * Single entry point for Soul pre-processing. Located in services/ (not engine/) — E8 boundary.
 * Sprint 1: personalityVars from DB. Sprint 3: + memoryContext (additive-only).
 * EnrichResult interface frozen after Sprint 1 (AR27) — additive-only extensions.
 *
 * AR60: Memory enrichment is independent of PER-1 4-layer sanitization.
 * Memory content is NOT processed through personality sanitization layers.
 */
import { db } from '../db'
import { agents } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { createLogger } from '../db/logger'
import { getDB } from '../db/scoped-query'
import { getEmbedding } from './voyage-embedding'

const log = createLogger()

const MAX_MEMORY_COUNT = 10

// AR27: Interface frozen after Sprint 1 — additive-only extension in Sprint 3
export interface EnrichResult {
  personalityVars: Record<string, string>
  memoryVars: Record<string, string>
  /** Story 28.6: Memory block to append to rendered soul (not a template var) */
  memoryContext: string
}

const EMPTY_RESULT: EnrichResult = { personalityVars: {}, memoryVars: {}, memoryContext: '' }

const PERSONALITY_KEYS = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const

/**
 * Story 28.6: Build memory context block from agent's top-N memories.
 * Ordered by confidence DESC. Separate from PER-1 sanitization (AR60).
 * DB error → empty string (AR31, session not interrupted).
 */
export async function getMemoryContext(companyId: string, agentId: string): Promise<string> {
  const memories = await getDB(companyId).listAgentMemories(agentId, { limit: 20 })
  if (memories.length === 0) return ''

  // Sort by confidence DESC, take top N
  const topMemories = memories
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
    .slice(0, MAX_MEMORY_COUNT)

  const memoryBlock = topMemories.map(m =>
    `- ${m.content} (confidence: ${m.confidence}%)`,
  ).join('\n')

  return `\n\n<agent_memories>\nThese are your accumulated memories and learnings from past interactions:\n${memoryBlock}\n</agent_memories>`
}

/**
 * Story 28.6: Semantic memory search — find relevant memories by embedding similarity.
 * Used by agent-loop.ts to inject context-relevant memories based on user message.
 * NFR-D3: failure returns empty string (never throws).
 */
export async function searchRelevantMemories(
  companyId: string,
  agentId: string,
  userMessage: string,
  limit?: number,
): Promise<string> {
  const embedding = await getEmbedding(companyId, userMessage)
  if (!embedding) return ''

  const memories = await getDB(companyId).searchMemoriesBySimilarity(
    agentId, embedding, limit ?? 5, 0.3,
  )

  if (memories.length === 0) return ''

  return memories.map(m =>
    `- ${m.content} (relevance: ${Math.round(m.similarity * 100)}%)`,
  ).join('\n')
}

/**
 * Enrich agent soul with personality extraVars + memory context.
 * NULL personality → empty result (AR31, Zero Regression).
 * DB error → empty result + log.warn (AR31, session not interrupted).
 */
export async function enrich(agentId: string, companyId: string): Promise<EnrichResult> {
  try {
    const [agent] = await db
      .select({ personalityTraits: agents.personalityTraits })
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.companyId, companyId)))
      .limit(1)

    // E12 Layer 1: Key Boundary — extract only allowed keys, ignore others
    // E12 Layer 3: extraVars strip — control characters removed before renderSoul (Story 24.3, PER-1)
    const personalityVars: Record<string, string> = {}
    if (agent?.personalityTraits) {
      const traits = agent.personalityTraits as Record<string, unknown>
      for (const key of PERSONALITY_KEYS) {
        const val = traits[key]
        if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && val <= 100) {
          personalityVars[`personality_${key}`] = String(val).replace(/[\n\r\t\x00-\x1f]/g, '')
        }
      }
    }

    // Memory enrichment — separate from PER-1 sanitization (AR60)
    let memoryContext = ''
    try {
      memoryContext = await getMemoryContext(companyId, agentId)
    } catch (memErr) {
      log.warn({ err: memErr, agentId, companyId }, 'soul-enricher: memory context fetch failed')
    }

    return { personalityVars, memoryVars: {}, memoryContext }
  } catch (err) {
    log.warn({ err, agentId, companyId }, 'soul-enricher: DB error fetching personality_traits')
    return EMPTY_RESULT
  }
}
