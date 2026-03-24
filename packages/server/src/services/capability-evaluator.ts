/**
 * Story 28.10 — Capability Evaluation Framework (FR-MEM9)
 *
 * Evaluates agent capabilities based on observation + memory history.
 * Dimensions: taskSuccessRate, domainBreadth, learningVelocity, memoryRetention, toolProficiency
 */

import { getDB } from '../db/scoped-query'

export interface CapabilityDimensions {
  taskSuccessRate: number
  domainBreadth: number
  learningVelocity: number
  memoryRetention: number
  toolProficiency: number
}

export interface CapabilityScore {
  agentId: string
  companyId: string
  overall: number
  dimensions: CapabilityDimensions
  evaluatedAt: Date
  observationCount: number
  memoryCount: number
}

// Weights for overall score calculation
const WEIGHTS = {
  taskSuccessRate: 0.3,
  domainBreadth: 0.15,
  learningVelocity: 0.2,
  memoryRetention: 0.2,
  toolProficiency: 0.15,
} as const

/**
 * Calculate domain breadth score from distinct domain count.
 * 1 domain=20, 2=40, 3=60, 4=80, 5+=100
 */
export function domainBreadthScore(distinctDomains: number): number {
  if (distinctDomains <= 0) return 0
  if (distinctDomains >= 5) return 100
  return distinctDomains * 20
}

/**
 * Evaluate agent capability based on observation + memory data.
 */
export async function evaluateAgentCapability(
  companyId: string,
  agentId: string,
): Promise<CapabilityScore> {
  const db = getDB(companyId)

  const [outcomeStats, domainStats, toolStats, memoryStats] = await Promise.all([
    db.getObservationOutcomeStats(agentId),
    db.getObservationDomainStats(agentId),
    db.getToolProficiencyStats(agentId),
    db.getMemoryCapabilityStats(agentId),
  ])

  // taskSuccessRate: success / total observations * 100
  const totalOutcomes = outcomeStats.success + outcomeStats.failure + outcomeStats.unknown
  const taskSuccessRate = totalOutcomes > 0
    ? Math.round((outcomeStats.success / totalOutcomes) * 100)
    : 0

  // domainBreadth: distinct domain count → score
  const domainBreadth = domainBreadthScore(domainStats.length)

  // learningVelocity: recent memories / total memories * 100
  const learningVelocity = memoryStats.totalMemories > 0
    ? Math.round((memoryStats.recentMemories / memoryStats.totalMemories) * 100)
    : 0

  // memoryRetention: high confidence memories / total memories * 100
  const memoryRetention = memoryStats.totalMemories > 0
    ? Math.round((memoryStats.highConfidenceCount / memoryStats.totalMemories) * 100)
    : 0

  // toolProficiency: average success rate across tools
  let toolProficiency = 0
  if (toolStats.length > 0) {
    const totalRate = toolStats.reduce((sum, t) => {
      return sum + (t.totalCount > 0 ? (t.successCount / t.totalCount) * 100 : 0)
    }, 0)
    toolProficiency = Math.round(totalRate / toolStats.length)
  }

  const dimensions: CapabilityDimensions = {
    taskSuccessRate,
    domainBreadth,
    learningVelocity,
    memoryRetention,
    toolProficiency,
  }

  // Overall = weighted average
  const overall = Math.round(
    dimensions.taskSuccessRate * WEIGHTS.taskSuccessRate +
    dimensions.domainBreadth * WEIGHTS.domainBreadth +
    dimensions.learningVelocity * WEIGHTS.learningVelocity +
    dimensions.memoryRetention * WEIGHTS.memoryRetention +
    dimensions.toolProficiency * WEIGHTS.toolProficiency,
  )

  const score: CapabilityScore = {
    agentId,
    companyId,
    overall,
    dimensions,
    evaluatedAt: new Date(),
    observationCount: totalOutcomes,
    memoryCount: memoryStats.totalMemories,
  }

  // Save evaluation snapshot
  await db.insertCapabilityEvaluation({
    ...score,
    dimensions: dimensions as unknown as Record<string, number>,
  })

  return score
}
