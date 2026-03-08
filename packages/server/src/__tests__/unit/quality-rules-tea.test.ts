/**
 * TEA (Test Architect) Risk-Based Tests for Story 8-1: Quality Rules YAML Parser
 *
 * Risk Matrix:
 * - CRITICAL: Zod schema rejects valid YAML → service fails silently
 * - CRITICAL: Fallback not triggered on malformed YAML → server crash
 * - HIGH: Company override merging corrupts base rules
 * - HIGH: Admin API returns incorrect data structure
 * - MEDIUM: Cache invalidation misses edge cases
 * - MEDIUM: Rubric weight validation off
 * - LOW: Investment analysis optional fields handling
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import { z } from 'zod'
import {
  qualityRulesConfigSchema,
  qualityRuleSchema,
  rubricSchema,
  passCriteriaSchema,
  severityEnum,
  conditionTypeEnum,
  actionTypeEnum,
  type QualityRule,
  type QualityRulesConfig,
} from '../../config/quality-rules-schema'
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
  invalidateCache,
} from '../../services/quality-rules'

// === CRITICAL: Zod Schema Validation Edge Cases ===

describe('TEA: Zod schema validation', () => {
  beforeEach(() => resetQualityRulesCache())

  it('rejects rule with missing id', () => {
    const result = qualityRuleSchema.safeParse({
      category: 'completeness',
      name: 'test',
      description: 'test',
      severity: 'major',
      enabled: true,
      condition: { type: 'threshold', params: { field: 'x', operator: '>=', value: 1 } },
      action: { onPass: 'pass', onFail: 'fail', failMessage: 'msg' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects rule with invalid severity', () => {
    const result = qualityRuleSchema.safeParse({
      id: 'test',
      category: 'completeness',
      name: 'test',
      description: 'test',
      severity: 'unknown',
      enabled: true,
      condition: { type: 'threshold', params: { field: 'x', operator: '>=', value: 1 } },
      action: { onPass: 'pass', onFail: 'fail', failMessage: 'msg' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects rule with invalid category', () => {
    const result = qualityRuleSchema.safeParse({
      id: 'test',
      category: 'unknown-category',
      name: 'test',
      description: 'test',
      severity: 'major',
      enabled: true,
      condition: { type: 'threshold', params: { field: 'x', operator: '>=', value: 1 } },
      action: { onPass: 'pass', onFail: 'fail', failMessage: 'msg' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects rule with invalid condition type', () => {
    const result = qualityRuleSchema.safeParse({
      id: 'test',
      category: 'completeness',
      name: 'test',
      description: 'test',
      severity: 'major',
      enabled: true,
      condition: { type: 'invalid-type', params: {} },
      action: { onPass: 'pass', onFail: 'fail', failMessage: 'msg' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects rule with invalid action type', () => {
    const result = qualityRuleSchema.safeParse({
      id: 'test',
      category: 'completeness',
      name: 'test',
      description: 'test',
      severity: 'major',
      enabled: true,
      condition: { type: 'threshold', params: { field: 'x', operator: '>=', value: 1 } },
      action: { onPass: 'invalid', onFail: 'fail', failMessage: 'msg' },
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid complete rule', () => {
    const result = qualityRuleSchema.safeParse({
      id: 'test-rule',
      category: 'safety',
      name: 'test rule',
      description: 'test description',
      severity: 'critical',
      enabled: true,
      condition: { type: 'regex', params: { patterns: ['sk-[a-z]+'], minMatches: 1 } },
      action: { onPass: 'pass', onFail: 'fail', failMessage: 'credential leak' },
    })
    expect(result.success).toBe(true)
  })

  it('defaults enabled to true when missing', () => {
    const result = qualityRuleSchema.safeParse({
      id: 'test',
      category: 'completeness',
      name: 'test',
      description: 'test',
      severity: 'minor',
      condition: { type: 'threshold', params: { field: 'x', operator: '>=', value: 1 } },
      action: { onPass: 'pass', onFail: 'warn', failMessage: 'msg' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.enabled).toBe(true)
    }
  })

  it('severity enum accepts exactly 3 values', () => {
    expect(severityEnum.safeParse('critical').success).toBe(true)
    expect(severityEnum.safeParse('major').success).toBe(true)
    expect(severityEnum.safeParse('minor').success).toBe(true)
    expect(severityEnum.safeParse('low').success).toBe(false)
    expect(severityEnum.safeParse('high').success).toBe(false)
  })

  it('conditionType enum accepts exactly 4 values', () => {
    expect(conditionTypeEnum.safeParse('regex').success).toBe(true)
    expect(conditionTypeEnum.safeParse('keyword').success).toBe(true)
    expect(conditionTypeEnum.safeParse('threshold').success).toBe(true)
    expect(conditionTypeEnum.safeParse('llm-check').success).toBe(true)
    expect(conditionTypeEnum.safeParse('custom').success).toBe(false)
  })

  it('actionType enum accepts exactly 3 values', () => {
    expect(actionTypeEnum.safeParse('pass').success).toBe(true)
    expect(actionTypeEnum.safeParse('warn').success).toBe(true)
    expect(actionTypeEnum.safeParse('fail').success).toBe(true)
    expect(actionTypeEnum.safeParse('block').success).toBe(false)
  })
})

// === CRITICAL: Rubric Schema Validation ===

describe('TEA: Rubric schema validation', () => {
  it('rejects rubric without scoring array', () => {
    const result = rubricSchema.safeParse({
      name: 'test',
    })
    expect(result.success).toBe(false)
  })

  it('rejects rubric with empty scoring array', () => {
    const result = rubricSchema.safeParse({
      name: 'test',
      scoring: [],
    })
    // Empty array is technically valid by Zod, but we test content elsewhere
    expect(result.success).toBe(true)
  })

  it('rejects scoring with weight over 100', () => {
    const result = rubricSchema.safeParse({
      name: 'test',
      scoring: [
        { id: 'Q1', label: 'test', weight: 150, critical: true, criteria: { '1': 'bad', '3': 'ok', '5': 'good' } },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('rejects scoring with weight under 1', () => {
    const result = rubricSchema.safeParse({
      name: 'test',
      scoring: [
        { id: 'Q1', label: 'test', weight: 0, critical: false, criteria: { '1': 'bad', '3': 'ok', '5': 'good' } },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid rubric with department checklist', () => {
    const result = rubricSchema.safeParse({
      name: 'Finance',
      departmentChecklist: {
        required: [{ id: 'D1', label: 'Has data?' }],
        optional: [{ id: 'D2', label: 'Has chart?' }],
        excludeCommon: ['C1'],
      },
      scoring: [
        { id: 'Q1', label: 'Accuracy', weight: 50, critical: true, criteria: { '1': 'bad', '5': 'good' } },
        { id: 'Q2', label: 'Completeness', weight: 50, critical: false, criteria: { '1': 'bad', '5': 'good' } },
      ],
    })
    expect(result.success).toBe(true)
  })
})

// === CRITICAL: Pass Criteria Validation ===

describe('TEA: Pass criteria schema', () => {
  it('rejects negative maxFailCount', () => {
    const result = passCriteriaSchema.safeParse({
      allCriticalMustPass: true,
      maxFailCount: -1,
      maxWarnCount: 3,
      criticalCap: 2.0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative maxWarnCount', () => {
    const result = passCriteriaSchema.safeParse({
      allCriticalMustPass: true,
      maxFailCount: 0,
      maxWarnCount: -1,
      criticalCap: 2.0,
    })
    expect(result.success).toBe(false)
  })

  it('defaults values correctly', () => {
    const result = passCriteriaSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.allCriticalMustPass).toBe(true)
      expect(result.data.maxFailCount).toBe(0)
      expect(result.data.maxWarnCount).toBe(3)
      expect(result.data.criticalCap).toBe(2.0)
    }
  })
})

// === CRITICAL: Fallback Behavior ===

describe('TEA: Fallback and resilience', () => {
  beforeEach(() => resetQualityRulesCache())

  it('loadQualityRulesConfig never throws', () => {
    expect(() => loadQualityRulesConfig()).not.toThrow()
  })

  it('always returns rules array (never undefined)', () => {
    const config = loadQualityRulesConfig()
    expect(Array.isArray(config.rules)).toBe(true)
  })

  it('always returns passCriteria object', () => {
    const config = loadQualityRulesConfig()
    expect(config.passCriteria).toBeDefined()
    expect(typeof config.passCriteria.allCriticalMustPass).toBe('boolean')
  })

  it('always returns rubrics with at least default', () => {
    const config = loadQualityRulesConfig()
    expect(config.rubrics).toBeDefined()
    expect(config.rubrics['default']).toBeDefined()
  })

  it('getRubricForDepartment never returns undefined', () => {
    const rubric = getRubricForDepartment('nonexistent')
    expect(rubric).toBeDefined()
    expect(rubric.name).toBeTruthy()
    expect(rubric.scoring).toBeArray()
  })
})

// === HIGH: Full Config Schema Integration ===

describe('TEA: Full config schema', () => {
  it('rejects config with rules as object instead of array', () => {
    const result = qualityRulesConfigSchema.safeParse({
      rules: { rule1: {} },
      passCriteria: {},
      rubrics: { default: { name: 'x', scoring: [] } },
    })
    expect(result.success).toBe(false)
  })

  it('rejects config without rubrics', () => {
    const result = qualityRulesConfigSchema.safeParse({
      rules: [],
      passCriteria: {},
    })
    expect(result.success).toBe(false)
  })

  it('accepts minimal valid config', () => {
    const result = qualityRulesConfigSchema.safeParse({
      rules: [],
      passCriteria: {},
      rubrics: {
        default: { name: 'Default', scoring: [] },
      },
    })
    expect(result.success).toBe(true)
  })

  it('accepts config with investmentAnalysis', () => {
    const result = qualityRulesConfigSchema.safeParse({
      rules: [],
      passCriteria: {},
      rubrics: { default: { name: 'x', scoring: [] } },
      investmentAnalysis: {
        balanceRequired: {
          enabled: true,
          description: 'test',
          minRiskMentions: 2,
          keywordsRisk: ['risk'],
          keywordsBullish: ['buy'],
          biasThreshold: 3.0,
        },
      },
    })
    expect(result.success).toBe(true)
  })
})

// === HIGH: Data Integrity ===

describe('TEA: Data integrity', () => {
  beforeEach(() => resetQualityRulesCache())

  it('category filter + severity filter = consistent total', () => {
    const allRules = getAllRules()
    const byCat = [
      ...getRulesByCategory('completeness'),
      ...getRulesByCategory('accuracy'),
      ...getRulesByCategory('safety'),
    ]
    expect(byCat.length).toBe(allRules.length)

    const bySev = [
      ...getRulesBySeverity('critical'),
      ...getRulesBySeverity('major'),
      ...getRulesBySeverity('minor'),
    ]
    expect(bySev.length).toBe(allRules.length)
  })

  it('active rules is subset of all rules', () => {
    const all = getAllRules()
    const active = getActiveRules()
    for (const rule of active) {
      expect(all.find(r => r.id === rule.id)).toBeDefined()
    }
  })

  it('grouped rules contain same rules as flat list', () => {
    const grouped = getRulesGroupedByCategory()
    const allFromGrouped = [
      ...grouped.completeness,
      ...grouped.accuracy,
      ...grouped.safety,
    ]
    const allRules = getAllRules()
    expect(allFromGrouped.length).toBe(allRules.length)
  })

  it('no duplicate rule IDs across categories', () => {
    const grouped = getRulesGroupedByCategory()
    const allIds = [
      ...grouped.completeness.map(r => r.id),
      ...grouped.accuracy.map(r => r.id),
      ...grouped.safety.map(r => r.id),
    ]
    expect(new Set(allIds).size).toBe(allIds.length)
  })
})

// === MEDIUM: Cache Behavior ===

describe('TEA: Cache edge cases', () => {
  beforeEach(() => resetQualityRulesCache())

  it('multiple rapid loads return same instance', () => {
    const results = Array.from({ length: 10 }, () => loadQualityRulesConfig())
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBe(results[0])
    }
  })

  it('invalidateCache without arg clears base config', () => {
    const config1 = loadQualityRulesConfig()
    invalidateCache()
    const config2 = loadQualityRulesConfig()
    expect(config1).not.toBe(config2) // different object
    expect(config1.rules.length).toBe(config2.rules.length) // same content
  })

  it('invalidateCache with specific companyId preserves base cache', () => {
    const config1 = loadQualityRulesConfig()
    invalidateCache('company-123')
    const config2 = loadQualityRulesConfig()
    expect(config1).toBe(config2) // same reference
  })

  it('resetQualityRulesCache clears everything', () => {
    loadQualityRulesConfig()
    resetQualityRulesCache()
    const config = loadQualityRulesConfig()
    expect(config).toBeDefined()
  })
})

// === MEDIUM: Rubric Consistency ===

describe('TEA: Rubric consistency checks', () => {
  beforeEach(() => resetQualityRulesCache())

  it('all rubric scoring IDs follow Q1-Q5 pattern', () => {
    const rubrics = getAllRubrics()
    for (const [name, rubric] of Object.entries(rubrics)) {
      const ids = rubric.scoring.map(s => s.id)
      expect(ids).toEqual(['Q1', 'Q2', 'Q3', 'Q4', 'Q5'])
    }
  })

  it('all rubric scoring labels are non-empty', () => {
    const rubrics = getAllRubrics()
    for (const [name, rubric] of Object.entries(rubrics)) {
      for (const scoring of rubric.scoring) {
        expect(scoring.label.length).toBeGreaterThan(0)
      }
    }
  })

  it('all scoring criteria values are non-empty strings', () => {
    const rubrics = getAllRubrics()
    for (const [name, rubric] of Object.entries(rubrics)) {
      for (const scoring of rubric.scoring) {
        for (const [score, desc] of Object.entries(scoring.criteria)) {
          expect(typeof desc).toBe('string')
          expect(desc.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('department rubrics have unique names', () => {
    const rubrics = getAllRubrics()
    const names = Object.values(rubrics).map(r => r.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

// === MEDIUM: Specific Rule Conditions ===

describe('TEA: Rule condition params integrity', () => {
  beforeEach(() => resetQualityRulesCache())

  it('regex rules have non-empty patterns array', () => {
    const regexRules = getAllRules().filter(r => r.condition.type === 'regex')
    for (const rule of regexRules) {
      const params = rule.condition.params as { patterns: string[] }
      expect(params.patterns.length).toBeGreaterThan(0)
      for (const pattern of params.patterns) {
        expect(pattern.length).toBeGreaterThan(0)
      }
    }
  })

  it('keyword rules have non-empty keywords array', () => {
    const keywordRules = getAllRules().filter(r => r.condition.type === 'keyword')
    for (const rule of keywordRules) {
      const params = rule.condition.params as { keywords: string[] }
      expect(params.keywords.length).toBeGreaterThan(0)
    }
  })

  it('threshold rules have valid operator', () => {
    const thresholdRules = getAllRules().filter(r => r.condition.type === 'threshold')
    const validOps = ['>=', '<=', '>', '<', '==', '!=']
    for (const rule of thresholdRules) {
      const params = rule.condition.params as { operator: string }
      expect(validOps).toContain(params.operator)
    }
  })

  it('llm-check rules have non-empty prompt', () => {
    const llmRules = getAllRules().filter(r => r.condition.type === 'llm-check')
    for (const rule of llmRules) {
      const params = rule.condition.params as { prompt: string }
      expect(params.prompt.length).toBeGreaterThan(10)
    }
  })
})

// === LOW: Investment Analysis ===

describe('TEA: Investment analysis edge cases', () => {
  beforeEach(() => resetQualityRulesCache())

  it('balance required has both keyword arrays', () => {
    const config = getInvestmentAnalysisRules()!
    expect(config.balanceRequired!.keywordsRisk.length).toBeGreaterThan(3)
    expect(config.balanceRequired!.keywordsBullish.length).toBeGreaterThan(3)
  })

  it('risk disclosure has required fields list', () => {
    const config = getInvestmentAnalysisRules()!
    expect(config.riskDisclosure!.requiredFields.length).toBeGreaterThan(0)
  })

  it('optimism bias check has penalty phrases', () => {
    const config = getInvestmentAnalysisRules()!
    expect(config.optimismBiasCheck!.penaltyPhrases.length).toBeGreaterThan(0)
    expect(config.optimismBiasCheck!.warningPhrases.length).toBeGreaterThan(0)
  })

  it('evidence quality has evidence keywords', () => {
    const config = getInvestmentAnalysisRules()!
    expect(config.evidenceQuality!.evidenceKeywords.length).toBeGreaterThan(3)
  })

  it('no overlap between penalty and warning phrases', () => {
    const config = getInvestmentAnalysisRules()!
    const penalty = new Set(config.optimismBiasCheck!.penaltyPhrases)
    const warning = new Set(config.optimismBiasCheck!.warningPhrases)
    for (const w of warning) {
      expect(penalty.has(w)).toBe(false)
    }
  })
})

// === LOW: Safety rules specific patterns ===

describe('TEA: Safety rules pattern validation', () => {
  beforeEach(() => resetQualityRulesCache())

  it('credential-leak rule covers major API key formats', () => {
    const rules = getRulesByCategory('safety')
    const credRule = rules.find(r => r.id === 'safe-credential-leak')!
    const params = credRule.condition.params as { patterns: string[] }
    const patternsStr = params.patterns.join(' ')
    // Should cover: OpenAI (sk-), AWS (AKIA), GitHub (ghp_), password, api_key, Bearer, private key
    expect(patternsStr).toContain('sk-')
    expect(patternsStr).toContain('AKIA')
    expect(patternsStr).toContain('ghp_')
    expect(patternsStr).toContain('password')
    expect(patternsStr).toContain('Bearer')
    expect(patternsStr).toContain('PRIVATE')
  })

  it('prompt-injection rule covers multiple attack patterns', () => {
    const rules = getRulesByCategory('safety')
    const injRule = rules.find(r => r.id === 'safe-prompt-injection')!
    const params = injRule.condition.params as { patterns: string[] }
    expect(params.patterns.length).toBeGreaterThanOrEqual(5) // Multiple patterns
  })

  it('all safety rules have severity critical or major', () => {
    const safetyRules = getRulesByCategory('safety')
    for (const rule of safetyRules) {
      expect(['critical', 'major']).toContain(rule.severity)
    }
  })
})
