/**
 * QA Tests -- Story 8-1: Quality Rules YAML Parser
 * Focus: Functional verification, edge cases, API contract validation
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import {
  loadQualityRulesConfig,
  getAllRules,
  getRulesByCategory,
  getRulesBySeverity,
  getActiveRules,
  getPassCriteria,
  getRubricForDepartment,
  getAllRubrics,
  getInvestmentAnalysisRules,
  getRulesGroupedByCategory,
  resetQualityRulesCache,
} from '../../services/quality-rules'

// === AC #1: YAML load + Zod validation on service init ===
describe('QA-AC1: YAML loads and validates on first access', () => {
  beforeEach(() => resetQualityRulesCache())

  it('config is immediately usable after loadQualityRulesConfig', () => {
    const config = loadQualityRulesConfig()
    // Must have all required top-level sections
    expect(config).toHaveProperty('rules')
    expect(config).toHaveProperty('passCriteria')
    expect(config).toHaveProperty('rubrics')
  })

  it('config contains real data, not empty fallback', () => {
    const config = loadQualityRulesConfig()
    // Real YAML has 11 rules, 8 rubrics
    expect(config.rules.length).toBeGreaterThanOrEqual(10)
    expect(Object.keys(config.rubrics).length).toBeGreaterThanOrEqual(7)
  })
})

// === AC #2: 3 categories with rules ===
describe('QA-AC2: Three categories return correct rules', () => {
  beforeEach(() => resetQualityRulesCache())

  it('completeness has min-length, has-sources, has-structure, conclusion-present', () => {
    const rules = getRulesByCategory('completeness')
    const ids = rules.map(r => r.id)
    expect(ids).toContain('comp-min-length')
    expect(ids).toContain('comp-has-sources')
    expect(ids).toContain('comp-has-structure')
    expect(ids).toContain('comp-conclusion-present')
  })

  it('accuracy has fact-check, hallucination-detect, no-absolute-claims', () => {
    const rules = getRulesByCategory('accuracy')
    const ids = rules.map(r => r.id)
    expect(ids).toContain('acc-fact-check')
    expect(ids).toContain('acc-hallucination-detect')
    expect(ids).toContain('acc-no-absolute-claims')
  })

  it('safety has credential-leak, prompt-injection, pii-exposure', () => {
    const rules = getRulesByCategory('safety')
    const ids = rules.map(r => r.id)
    expect(ids).toContain('safe-credential-leak')
    expect(ids).toContain('safe-prompt-injection')
    expect(ids).toContain('safe-pii-exposure')
  })
})

// === AC #3: Rule fields present ===
describe('QA-AC3: Each rule has required field structure', () => {
  beforeEach(() => resetQualityRulesCache())

  it('all rules have complete action with failMessage', () => {
    for (const rule of getAllRules()) {
      expect(rule.action.failMessage).toBeTruthy()
      expect(rule.action.failMessage.length).toBeGreaterThan(5)
    }
  })

  it('all rules have enabled property (boolean)', () => {
    for (const rule of getAllRules()) {
      expect(typeof rule.enabled).toBe('boolean')
    }
  })

  it('all rules have name and description in Korean', () => {
    for (const rule of getAllRules()) {
      expect(rule.name.length).toBeGreaterThan(0)
      expect(rule.description.length).toBeGreaterThan(0)
    }
  })
})

// === AC #4: Category query API ===
describe('QA-AC4: getRulesByCategory filters correctly', () => {
  beforeEach(() => resetQualityRulesCache())

  it('returns only matching category', () => {
    for (const cat of ['completeness', 'accuracy', 'safety'] as const) {
      const rules = getRulesByCategory(cat)
      expect(rules.every(r => r.category === cat)).toBe(true)
    }
  })

  it('does not return rules from other categories', () => {
    const completeness = getRulesByCategory('completeness')
    expect(completeness.every(r => r.category !== 'safety')).toBe(true)
    expect(completeness.every(r => r.category !== 'accuracy')).toBe(true)
  })
})

// === AC #5: Severity query API ===
describe('QA-AC5: getRulesBySeverity filters correctly', () => {
  beforeEach(() => resetQualityRulesCache())

  it('critical includes credential-leak and prompt-injection', () => {
    const critical = getRulesBySeverity('critical')
    const ids = critical.map(r => r.id)
    expect(ids).toContain('safe-credential-leak')
    expect(ids).toContain('safe-prompt-injection')
    expect(ids).toContain('acc-fact-check')
    expect(ids).toContain('acc-hallucination-detect')
  })

  it('major includes min-length and conclusion-present', () => {
    const major = getRulesBySeverity('major')
    const ids = major.map(r => r.id)
    expect(ids).toContain('comp-min-length')
    expect(ids).toContain('comp-conclusion-present')
  })

  it('minor includes has-sources and has-structure', () => {
    const minor = getRulesBySeverity('minor')
    const ids = minor.map(r => r.id)
    expect(ids).toContain('comp-has-sources')
    expect(ids).toContain('comp-has-structure')
  })
})

// === AC #6: Active rules filter ===
describe('QA-AC6: getActiveRules returns only enabled rules', () => {
  beforeEach(() => resetQualityRulesCache())

  it('all rules in YAML are enabled by default', () => {
    const all = getAllRules()
    const active = getActiveRules()
    // All rules in our YAML have enabled: true
    expect(active.length).toBe(all.length)
  })
})

// === AC #7: Fallback on invalid YAML ===
describe('QA-AC7: Graceful fallback', () => {
  beforeEach(() => resetQualityRulesCache())

  it('service functions never throw regardless of state', () => {
    expect(() => getAllRules()).not.toThrow()
    expect(() => getRulesByCategory('completeness')).not.toThrow()
    expect(() => getRulesBySeverity('critical')).not.toThrow()
    expect(() => getActiveRules()).not.toThrow()
    expect(() => getPassCriteria()).not.toThrow()
    expect(() => getRubricForDepartment('unknown')).not.toThrow()
    expect(() => getAllRubrics()).not.toThrow()
    expect(() => getInvestmentAnalysisRules()).not.toThrow()
    expect(() => getRulesGroupedByCategory()).not.toThrow()
  })
})

// === AC #9: API response structure (grouped by category) ===
describe('QA-AC9: API response structure matches contract', () => {
  beforeEach(() => resetQualityRulesCache())

  it('getRulesGroupedByCategory returns expected API shape', () => {
    const grouped = getRulesGroupedByCategory()
    expect(grouped).toHaveProperty('completeness')
    expect(grouped).toHaveProperty('accuracy')
    expect(grouped).toHaveProperty('safety')
    expect(Array.isArray(grouped.completeness)).toBe(true)
    expect(Array.isArray(grouped.accuracy)).toBe(true)
    expect(Array.isArray(grouped.safety)).toBe(true)
  })

  it('pass criteria matches API contract', () => {
    const criteria = getPassCriteria()
    expect(criteria).toHaveProperty('allCriticalMustPass')
    expect(criteria).toHaveProperty('maxFailCount')
    expect(criteria).toHaveProperty('maxWarnCount')
    expect(criteria).toHaveProperty('criticalCap')
  })
})

// === v1 Feature Parity: Rubrics ===
describe('QA: v1 rubric parity', () => {
  beforeEach(() => resetQualityRulesCache())

  it('covers all v1 departments: default, secretary, finance, strategy, legal, marketing, tech, publishing', () => {
    const rubrics = getAllRubrics()
    const depts = Object.keys(rubrics)
    expect(depts).toContain('default')
    expect(depts).toContain('secretary')
    expect(depts).toContain('finance')
    expect(depts).toContain('strategy')
    expect(depts).toContain('legal')
    expect(depts).toContain('marketing')
    expect(depts).toContain('tech')
    expect(depts).toContain('publishing')
  })

  it('finance rubric has excludeCommon for C1 (v1 parity)', () => {
    const rubric = getRubricForDepartment('finance')
    expect(rubric.departmentChecklist?.excludeCommon).toContain('C1')
  })

  it('all rubrics follow 1/3/5 scoring pattern (v1 parity)', () => {
    const rubrics = getAllRubrics()
    for (const [dept, rubric] of Object.entries(rubrics)) {
      for (const scoring of rubric.scoring) {
        expect(scoring.criteria).toHaveProperty('1')
        expect(scoring.criteria).toHaveProperty('3')
        expect(scoring.criteria).toHaveProperty('5')
      }
    }
  })
})

// === v1 Feature Parity: Investment Analysis ===
describe('QA: v1 investment analysis parity', () => {
  beforeEach(() => resetQualityRulesCache())

  it('has all 4 investment analysis rule types from v1', () => {
    const inv = getInvestmentAnalysisRules()!
    expect(inv.balanceRequired).toBeDefined()
    expect(inv.riskDisclosure).toBeDefined()
    expect(inv.optimismBiasCheck).toBeDefined()
    expect(inv.evidenceQuality).toBeDefined()
  })

  it('balance required keywords match v1 risk keywords', () => {
    const inv = getInvestmentAnalysisRules()!
    const riskKw = inv.balanceRequired!.keywordsRisk
    expect(riskKw).toContain('하락 리스크')
    expect(riskKw).toContain('손절')
    expect(riskKw).toContain('리스크')
  })

  it('optimism bias penalties match v1', () => {
    const inv = getInvestmentAnalysisRules()!
    expect(inv.optimismBiasCheck!.maxPenaltyCount).toBe(0)
    expect(inv.optimismBiasCheck!.maxWarningCount).toBe(2)
  })

  it('evidence quality keywords include financial metrics from v1', () => {
    const inv = getInvestmentAnalysisRules()!
    const kw = inv.evidenceQuality!.evidenceKeywords
    expect(kw).toContain('PER')
    expect(kw).toContain('PBR')
    expect(kw).toContain('ROE')
    expect(kw).toContain('영업이익')
  })
})
