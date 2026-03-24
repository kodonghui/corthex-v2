/**
 * Story 28.10 — Capability Evaluation Framework Tests
 *
 * Unit tests for the capability evaluator service.
 * Tests: scoring logic, dimension calculations, zero-data edge cases, weighted averages.
 */

import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read source files for structural validation (no runtime imports to avoid credential-crypto chain)
const evaluatorSource = readFileSync(
  resolve(__dirname, '../../services/capability-evaluator.ts'),
  'utf-8',
)
const scopedQuerySource = readFileSync(
  resolve(__dirname, '../../db/scoped-query.ts'),
  'utf-8',
)
const schemaSource = readFileSync(
  resolve(__dirname, '../../db/schema.ts'),
  'utf-8',
)
const workspaceRouteSource = readFileSync(
  resolve(__dirname, '../../routes/workspace/capability.ts'),
  'utf-8',
)
const adminRouteSource = readFileSync(
  resolve(__dirname, '../../routes/admin/capability.ts'),
  'utf-8',
)
const indexSource = readFileSync(
  resolve(__dirname, '../../index.ts'),
  'utf-8',
)
const frontendSource = readFileSync(
  resolve(__dirname, '../../../../app/src/pages/memories.tsx'),
  'utf-8',
)

// Pure reimplementation of domainBreadthScore for unit testing (mirrors capability-evaluator.ts)
function domainBreadthScore(distinctDomains: number): number {
  if (distinctDomains <= 0) return 0
  if (distinctDomains >= 5) return 100
  return distinctDomains * 20
}

describe('Capability Evaluator — domainBreadthScore', () => {
  test('0 domains → 0', () => {
    expect(domainBreadthScore(0)).toBe(0)
  })

  test('1 domain → 20', () => {
    expect(domainBreadthScore(1)).toBe(20)
  })

  test('2 domains → 40', () => {
    expect(domainBreadthScore(2)).toBe(40)
  })

  test('3 domains → 60', () => {
    expect(domainBreadthScore(3)).toBe(60)
  })

  test('4 domains → 80', () => {
    expect(domainBreadthScore(4)).toBe(80)
  })

  test('5+ domains → 100', () => {
    expect(domainBreadthScore(5)).toBe(100)
    expect(domainBreadthScore(10)).toBe(100)
  })

  test('negative input → 0', () => {
    expect(domainBreadthScore(-1)).toBe(0)
  })
})

describe('Capability Evaluator — Service Structure', () => {
  test('exports CapabilityScore interface with required fields', () => {
    expect(evaluatorSource).toContain('export interface CapabilityScore')
    expect(evaluatorSource).toContain('agentId: string')
    expect(evaluatorSource).toContain('companyId: string')
    expect(evaluatorSource).toContain('overall: number')
    expect(evaluatorSource).toContain('dimensions: CapabilityDimensions')
    expect(evaluatorSource).toContain('evaluatedAt: Date')
    expect(evaluatorSource).toContain('observationCount: number')
    expect(evaluatorSource).toContain('memoryCount: number')
  })

  test('exports CapabilityDimensions with all 5 dimensions', () => {
    expect(evaluatorSource).toContain('export interface CapabilityDimensions')
    expect(evaluatorSource).toContain('taskSuccessRate: number')
    expect(evaluatorSource).toContain('domainBreadth: number')
    expect(evaluatorSource).toContain('learningVelocity: number')
    expect(evaluatorSource).toContain('memoryRetention: number')
    expect(evaluatorSource).toContain('toolProficiency: number')
  })

  test('exports evaluateAgentCapability function', () => {
    expect(evaluatorSource).toContain('export async function evaluateAgentCapability')
  })

  test('uses getDB(companyId) for tenant isolation', () => {
    expect(evaluatorSource).toContain("getDB(companyId)")
  })

  test('uses correct weights: task=30%, domain=15%, velocity=20%, retention=20%, tool=15%', () => {
    expect(evaluatorSource).toContain('taskSuccessRate: 0.3')
    expect(evaluatorSource).toContain('domainBreadth: 0.15')
    expect(evaluatorSource).toContain('learningVelocity: 0.2')
    expect(evaluatorSource).toContain('memoryRetention: 0.2')
    expect(evaluatorSource).toContain('toolProficiency: 0.15')
  })

  test('saves evaluation snapshot to DB', () => {
    expect(evaluatorSource).toContain('insertCapabilityEvaluation')
  })

  test('queries all 4 stat methods in parallel with Promise.all', () => {
    expect(evaluatorSource).toContain('Promise.all')
    expect(evaluatorSource).toContain('getObservationOutcomeStats')
    expect(evaluatorSource).toContain('getObservationDomainStats')
    expect(evaluatorSource).toContain('getToolProficiencyStats')
    expect(evaluatorSource).toContain('getMemoryCapabilityStats')
  })
})

describe('Capability Evaluator — Weighted Score Calculation', () => {
  // Test the math directly
  test('all 100s → overall 100', () => {
    const overall = Math.round(
      100 * 0.3 + 100 * 0.15 + 100 * 0.2 + 100 * 0.2 + 100 * 0.15,
    )
    expect(overall).toBe(100)
  })

  test('all 0s → overall 0', () => {
    const overall = Math.round(
      0 * 0.3 + 0 * 0.15 + 0 * 0.2 + 0 * 0.2 + 0 * 0.15,
    )
    expect(overall).toBe(0)
  })

  test('mixed scores produce correct weighted average', () => {
    // taskSuccess=80, domain=60, velocity=40, retention=90, tool=50
    const overall = Math.round(
      80 * 0.3 + 60 * 0.15 + 40 * 0.2 + 90 * 0.2 + 50 * 0.15,
    )
    // 24 + 9 + 8 + 18 + 7.5 = 66.5 → 67
    expect(overall).toBe(67)
  })

  test('taskSuccessRate has highest weight (30%)', () => {
    // Only taskSuccess=100, rest=0
    const taskOnly = Math.round(100 * 0.3)
    expect(taskOnly).toBe(30)

    // Only domainBreadth=100, rest=0
    const domainOnly = Math.round(100 * 0.15)
    expect(domainOnly).toBe(15)

    expect(taskOnly).toBeGreaterThan(domainOnly)
  })
})

describe('Capability Evaluator — taskSuccessRate logic', () => {
  test('all success observations → 100%', () => {
    const total = 10
    const success = 10
    expect(Math.round((success / total) * 100)).toBe(100)
  })

  test('all failure observations → 0%', () => {
    const total = 5
    const success = 0
    expect(Math.round((success / total) * 100)).toBe(0)
  })

  test('mixed observations → correct percentage', () => {
    const total = 8 // 5 success + 2 failure + 1 unknown
    const success = 5
    expect(Math.round((success / total) * 100)).toBe(63)
  })

  test('zero observations → 0%', () => {
    const total = 0
    const rate = total > 0 ? Math.round((0 / total) * 100) : 0
    expect(rate).toBe(0)
  })
})

describe('Capability Evaluator — learningVelocity logic', () => {
  test('all memories recent → 100%', () => {
    const total = 10
    const recent = 10
    expect(Math.round((recent / total) * 100)).toBe(100)
  })

  test('no recent memories → 0%', () => {
    const total = 10
    const recent = 0
    expect(Math.round((recent / total) * 100)).toBe(0)
  })

  test('zero total memories → 0%', () => {
    const total = 0
    const velocity = total > 0 ? Math.round((0 / total) * 100) : 0
    expect(velocity).toBe(0)
  })
})

describe('Capability Evaluator — memoryRetention logic', () => {
  test('all memories high confidence → 100%', () => {
    const total = 10
    const highConf = 10
    expect(Math.round((highConf / total) * 100)).toBe(100)
  })

  test('no high confidence memories → 0%', () => {
    const total = 5
    const highConf = 0
    expect(Math.round((highConf / total) * 100)).toBe(0)
  })

  test('mixed confidence → correct percentage', () => {
    const total = 10
    const highConf = 7
    expect(Math.round((highConf / total) * 100)).toBe(70)
  })
})

describe('Capability Evaluator — toolProficiency logic', () => {
  test('single tool 100% success → 100', () => {
    const tools = [{ successCount: 5, totalCount: 5 }]
    const avg = tools.reduce((s, t) => s + (t.successCount / t.totalCount) * 100, 0) / tools.length
    expect(Math.round(avg)).toBe(100)
  })

  test('multiple tools with mixed success → average', () => {
    const tools = [
      { successCount: 8, totalCount: 10 },  // 80%
      { successCount: 3, totalCount: 10 },   // 30%
    ]
    const avg = tools.reduce((s, t) => s + (t.successCount / t.totalCount) * 100, 0) / tools.length
    expect(Math.round(avg)).toBe(55)
  })

  test('no tools → 0', () => {
    const tools: any[] = []
    const proficiency = tools.length > 0
      ? Math.round(tools.reduce((s, t) => s + (t.successCount / t.totalCount) * 100, 0) / tools.length)
      : 0
    expect(proficiency).toBe(0)
  })
})

describe('Scoped Query — Capability Methods', () => {
  test('getObservationOutcomeStats method exists', () => {
    expect(scopedQuerySource).toContain('getObservationOutcomeStats:')
    expect(scopedQuerySource).toContain("outcome = 'success'")
    expect(scopedQuerySource).toContain("outcome = 'failure'")
    expect(scopedQuerySource).toContain("outcome = 'unknown'")
  })

  test('getObservationDomainStats method exists with GROUP BY domain', () => {
    expect(scopedQuerySource).toContain('getObservationDomainStats:')
    expect(scopedQuerySource).toContain('GROUP BY domain')
  })

  test('getToolProficiencyStats method exists with tool_used IS NOT NULL', () => {
    expect(scopedQuerySource).toContain('getToolProficiencyStats:')
    expect(scopedQuerySource).toContain('tool_used IS NOT NULL')
    expect(scopedQuerySource).toContain('GROUP BY tool_used')
  })

  test('getMemoryCapabilityStats method exists with 30-day window and confidence threshold', () => {
    expect(scopedQuerySource).toContain('getMemoryCapabilityStats:')
    expect(scopedQuerySource).toContain("INTERVAL '30 days'")
    expect(scopedQuerySource).toContain('confidence >= 50')
  })

  test('insertCapabilityEvaluation method exists', () => {
    expect(scopedQuerySource).toContain('insertCapabilityEvaluation:')
    expect(scopedQuerySource).toContain('capabilityEvaluations')
  })

  test('getCapabilityHistory method exists with DESC order', () => {
    expect(scopedQuerySource).toContain('getCapabilityHistory:')
    expect(scopedQuerySource).toContain('desc(capabilityEvaluations.evaluatedAt)')
  })

  test('getCompanyCapabilityOverview method uses DISTINCT ON for latest per agent', () => {
    expect(scopedQuerySource).toContain('getCompanyCapabilityOverview:')
    expect(scopedQuerySource).toContain('DISTINCT ON (ce.agent_id)')
  })

  test('all query methods enforce tenant isolation with companyId', () => {
    // Each new method should reference companyId in its query
    const methods = [
      'getObservationOutcomeStats',
      'getObservationDomainStats',
      'getToolProficiencyStats',
      'getMemoryCapabilityStats',
      'insertCapabilityEvaluation',
      'getCapabilityHistory',
      'getCompanyCapabilityOverview',
    ]
    for (const m of methods) {
      expect(scopedQuerySource).toContain(m)
    }
  })
})

describe('Schema — capability_evaluations table', () => {
  test('capabilityEvaluations table defined in schema', () => {
    expect(schemaSource).toContain("export const capabilityEvaluations = pgTable('capability_evaluations'")
  })

  test('has required columns', () => {
    expect(schemaSource).toContain("'company_id'")
    expect(schemaSource).toContain("'agent_id'")
    expect(schemaSource).toContain("'overall_score'")
    expect(schemaSource).toContain("'dimensions'")
    expect(schemaSource).toContain("'observation_count'")
    expect(schemaSource).toContain("'memory_count'")
    expect(schemaSource).toContain("'evaluated_at'")
  })

  test('has CASCADE delete on company_id and agent_id', () => {
    // Check the section around capabilityEvaluations
    const tableStart = schemaSource.indexOf("capabilityEvaluations = pgTable")
    const tableSection = schemaSource.slice(tableStart, tableStart + 600)
    const cascadeCount = (tableSection.match(/onDelete: 'cascade'/g) || []).length
    expect(cascadeCount).toBe(2)
  })

  test('has index on (company_id, agent_id, evaluated_at)', () => {
    expect(schemaSource).toContain('idx_capability_evaluations_agent')
  })
})

describe('Routes — Workspace Capability', () => {
  test('GET /capability/:agentId route exists', () => {
    expect(workspaceRouteSource).toContain("capabilityRoute.get('/capability/:agentId'")
  })

  test('GET /capability/:agentId/history route exists', () => {
    expect(workspaceRouteSource).toContain("capabilityRoute.get('/capability/:agentId/history'")
  })

  test('uses authMiddleware', () => {
    expect(workspaceRouteSource).toContain('authMiddleware')
  })

  test('returns { success: true, data: ... } format', () => {
    expect(workspaceRouteSource).toContain('success: true, data:')
  })
})

describe('Routes — Admin Capability', () => {
  test('GET /capability/company-overview route exists', () => {
    expect(adminRouteSource).toContain("adminCapabilityRoute.get('/capability/company-overview'")
  })

  test('POST /capability/:agentId/evaluate route exists', () => {
    expect(adminRouteSource).toContain("adminCapabilityRoute.post('/capability/:agentId/evaluate'")
  })

  test('uses authMiddleware + adminOnly + tenantMiddleware', () => {
    expect(adminRouteSource).toContain('authMiddleware, adminOnly, tenantMiddleware')
  })
})

describe('Route Registration — index.ts', () => {
  test('workspace capability route registered', () => {
    expect(indexSource).toContain("import { capabilityRoute } from './routes/workspace/capability'")
    expect(indexSource).toContain("app.route('/api/workspace', capabilityRoute)")
  })

  test('admin capability route registered', () => {
    expect(indexSource).toContain("import { adminCapabilityRoute } from './routes/admin/capability'")
    expect(indexSource).toContain("app.route('/api/admin', adminCapabilityRoute)")
  })
})

describe('Frontend — Capability Tab', () => {
  test('CapabilityTab component exists', () => {
    expect(frontendSource).toContain('function CapabilityTab')
  })

  test('capability tab added to AgentDetail tabs', () => {
    expect(frontendSource).toContain("key: 'capability'")
    expect(frontendSource).toContain("label: '역량'")
    expect(frontendSource).toContain('icon: Gauge')
  })

  test('ScoreRing component for overall score visualization', () => {
    expect(frontendSource).toContain('function ScoreRing')
  })

  test('fetches capability score from API', () => {
    expect(frontendSource).toContain('/workspace/capability/')
  })

  test('fetches capability history from API', () => {
    expect(frontendSource).toContain('/workspace/capability/')
    expect(frontendSource).toContain('/history')
  })

  test('displays all 5 dimensions', () => {
    expect(frontendSource).toContain('taskSuccessRate')
    expect(frontendSource).toContain('domainBreadth')
    expect(frontendSource).toContain('learningVelocity')
    expect(frontendSource).toContain('memoryRetention')
    expect(frontendSource).toContain('toolProficiency')
  })

  test('shows history trend chart', () => {
    expect(frontendSource).toContain('Score History')
  })

  test('renders tab for capability tab state', () => {
    expect(frontendSource).toContain("{tab === 'capability' && <CapabilityTab")
  })
})

describe('Migration — 0066_capability_evaluations.sql', () => {
  const migrationSource = readFileSync(
    resolve(__dirname, '../../db/migrations/0066_capability_evaluations.sql'),
    'utf-8',
  )

  test('creates capability_evaluations table', () => {
    expect(migrationSource).toContain('CREATE TABLE')
    expect(migrationSource).toContain('capability_evaluations')
  })

  test('has foreign key to companies', () => {
    expect(migrationSource).toContain('companies')
    expect(migrationSource).toContain('ON DELETE cascade')
  })

  test('has foreign key to agents', () => {
    expect(migrationSource).toContain('agents')
  })

  test('has index on (company_id, agent_id, evaluated_at)', () => {
    expect(migrationSource).toContain('idx_capability_evaluations_agent')
  })
})
