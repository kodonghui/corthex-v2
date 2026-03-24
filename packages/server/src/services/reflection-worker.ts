/**
 * Story 28.4 — Reflection Worker (D28)
 *
 * Synthesizes unreflected observations into permanent agent memories.
 * Uses Haiku for cost-efficient reflection with MEM-6 Layer 3 prompt hardening.
 */

import Anthropic from '@anthropic-ai/sdk'
import { getDB } from '../db/scoped-query'
import { getCredentials } from './credential-vault'
import { recordCost } from '../lib/cost-tracker'
import { getEmbedding } from './voyage-embedding'

export const REFLECTION_MODEL = 'claude-haiku-4-5-20251001'
const MIN_OBSERVATIONS = 20
const MIN_AVG_CONFIDENCE = 0.7
const MAX_DAILY_COST_MICRO = 100_000 // $0.10 in microdollars

export interface ReflectionResult {
  agentId: string
  companyId: string
  memoriesCreated: number
  observationsProcessed: number
  costUsdMicro: number
}

/**
 * Run reflection for a single agent within a company.
 * Returns null if conditions not met (skip).
 */
export async function reflectForAgent(
  companyId: string,
  agentId: string,
): Promise<ReflectionResult | null> {
  const db = getDB(companyId)

  // Check daily cost cap before doing anything
  const dailyCost = await db.getReflectionCostToday()
  if (dailyCost >= MAX_DAILY_COST_MICRO) {
    console.log({ companyId, agentId, dailyCost, event: 'reflection_cost_cap' }, 'Reflection paused: daily cost cap reached')
    return null
  }

  // Check trigger conditions: minimum observation count
  const count = await db.countUnreflectedObservations(agentId)
  if (count < MIN_OBSERVATIONS) return null

  // Fetch unreflected observations (max 50 per batch)
  const observations = await db.getUnreflectedObservations(agentId, 50)
  if (observations.length < MIN_OBSERVATIONS) return null

  // Check trigger conditions: average confidence threshold
  const avgConfidence = observations.reduce((sum, o) => sum + o.confidence, 0) / observations.length
  if (avgConfidence < MIN_AVG_CONFIDENCE) return null

  // Resolve API key from credential vault (company-level anthropic key)
  const credentials = await getCredentials(companyId, 'anthropic')
  const apiKey = credentials.api_key || credentials.apiKey || Object.values(credentials)[0]
  if (!apiKey) {
    console.warn({ companyId, event: 'reflection_no_api_key' }, 'No Anthropic API key for reflection')
    return null
  }

  // MEM-6 Layer 3: Wrap observations in <observation> XML tags for prompt hardening
  const observationBlock = observations.map((o, i) =>
    `<observation index="${i + 1}" domain="${o.domain}" outcome="${o.outcome}" confidence="${o.confidence}">\n${o.content}\n</observation>`,
  ).join('\n\n')

  const systemPrompt = `You are a reflection engine. Analyze the observations and extract lasting insights, patterns, and lessons learned. Output structured memories as JSON array.

Rules:
- Extract 2-5 memories from the observations
- Each memory should be a generalized insight, not a specific event recap
- Include confidence (0-100 scale)
- Include a category: 'skill', 'preference', 'knowledge', 'relationship', 'pattern'
- Be concise — each memory max 500 chars

Output format:
[{"content": "...", "confidence": 85, "category": "skill"}, ...]`

  const userPrompt = `Reflect on these ${observations.length} observations from agent "${agentId}":\n\n${observationBlock}`

  // Call Haiku
  const anthropic = new Anthropic({ apiKey })
  const response = await anthropic.messages.create({
    model: REFLECTION_MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  // Record cost
  const inputTokens = response.usage.input_tokens
  const outputTokens = response.usage.output_tokens
  recordCost({
    companyId,
    agentId,
    model: REFLECTION_MODEL,
    inputTokens,
    outputTokens,
    source: 'reflection',
  })

  // Parse memories from response
  const responseText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')

  let memories: Array<{ content: string; confidence: number; category: string }>
  try {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    memories = jsonMatch ? JSON.parse(jsonMatch[0]) : []
  } catch {
    console.warn({ companyId, agentId, event: 'reflection_parse_error' }, 'Failed to parse reflection response')
    memories = []
  }

  // Validate and insert memories
  let memoriesCreated = 0
  for (const mem of memories) {
    if (!mem.content || typeof mem.content !== 'string') continue
    const validCategories = ['skill', 'preference', 'knowledge', 'relationship', 'pattern']
    const category = validCategories.includes(mem.category) ? mem.category : 'pattern'
    const confidence = typeof mem.confidence === 'number'
      ? Math.max(0, Math.min(100, Math.round(mem.confidence)))
      : 50

    const truncatedContent = mem.content.slice(0, 500)
    const [inserted] = await db.insertReflectionMemory({
      agentId,
      content: truncatedContent,
      confidence,
      category,
    })
    memoriesCreated++

    // Fire-and-forget vectorize the new memory (same pattern as observation vectorization)
    if (inserted?.id) {
      Promise.resolve().then(async () => {
        try {
          const embedding = await getEmbedding(companyId, truncatedContent)
          if (embedding) {
            await db.updateAgentMemoryEmbedding(inserted.id, embedding)
          }
        } catch { /* graceful degradation — NFR-D3 */ }
      }).catch(() => {})
    }
  }

  // Mark observations as reflected
  const observationIds = observations.map(o => o.id)
  await db.markObservationsReflected(observationIds)

  return {
    agentId,
    companyId,
    memoriesCreated,
    observationsProcessed: observations.length,
    costUsdMicro: inputTokens * 0.80 / 1_000_000 * 1_000_000 + outputTokens * 4.00 / 1_000_000 * 1_000_000,
  }
}
