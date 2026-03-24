/**
 * Story 24.2: Soul Enricher — personality extraVars injection (E11, D23)
 *
 * Single entry point for Soul pre-processing. Located in services/ (not engine/) — E8 boundary.
 * Sprint 1: personalityVars from DB. Sprint 3: + memoryVars (additive-only).
 * EnrichResult interface frozen after Sprint 1 (AR27).
 */
import { db } from '../db'
import { agents } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { createLogger } from '../db/logger'

const log = createLogger()

// AR27: Interface frozen after Sprint 1 — additive-only extension in Sprint 3
export interface EnrichResult {
  personalityVars: Record<string, string>
  memoryVars: Record<string, string>
}

const EMPTY_RESULT: EnrichResult = { personalityVars: {}, memoryVars: {} }

const PERSONALITY_KEYS = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const

/**
 * Enrich agent soul with personality extraVars.
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

    if (!agent?.personalityTraits) return EMPTY_RESULT

    const traits = agent.personalityTraits as Record<string, unknown>

    // E12 Layer 1: Key Boundary — extract only allowed keys, ignore others
    // E12 Layer 3: extraVars strip — control characters removed before renderSoul (Story 24.3, PER-1)
    const personalityVars: Record<string, string> = {}
    for (const key of PERSONALITY_KEYS) {
      const val = traits[key]
      if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && val <= 100) {
        personalityVars[`personality_${key}`] = String(val).replace(/[\n\r\t\x00-\x1f]/g, '')
      }
    }

    return { personalityVars, memoryVars: {} }
  } catch (err) {
    log.warn({ err, agentId, companyId }, 'soul-enricher: DB error fetching personality_traits')
    return EMPTY_RESULT
  }
}
