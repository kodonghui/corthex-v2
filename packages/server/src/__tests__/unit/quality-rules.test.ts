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
  invalidateCache,
} from '../../services/quality-rules'

describe('quality-rules: YAML Parser & Validator', () => {
  beforeEach(() => {
    resetQualityRulesCache()
  })

  // === AC #1: YAML load + Zod validation ===
  describe('loadQualityRulesConfig', () => {
    it('loads and validates quality_rules.yaml successfully', () => {
      const config = loadQualityRulesConfig()
      expect(config).toBeDefined()
      expect(config.rules).toBeArray()
      expect(config.rules.length).toBeGreaterThan(0)
      expect(config.passCriteria).toBeDefined()
      expect(config.rubrics).toBeDefined()
    })

    it('returns cached config on subsequent calls', () => {
      const config1 = loadQualityRulesConfig()
      const config2 = loadQualityRulesConfig()
      expect(config1).toBe(config2) // same reference = cached
    })

    it('returns fresh config after cache reset', () => {
      const config1 = loadQualityRulesConfig()
      resetQualityRulesCache()
      const config2 = loadQualityRulesConfig()
      expect(config1).not.toBe(config2) // different reference
      expect(config1.rules.length).toBe(config2.rules.length) // same content
    })
  })

  // === AC #2: 3 categories ===
  describe('getRulesByCategory', () => {
    it('returns completeness rules', () => {
      const rules = getRulesByCategory('completeness')
      expect(rules.length).toBeGreaterThan(0)
      for (const rule of rules) {
        expect(rule.category).toBe('completeness')
      }
    })

    it('returns accuracy rules', () => {
      const rules = getRulesByCategory('accuracy')
      expect(rules.length).toBeGreaterThan(0)
      for (const rule of rules) {
        expect(rule.category).toBe('accuracy')
      }
    })

    it('returns safety rules', () => {
      const rules = getRulesByCategory('safety')
      expect(rules.length).toBeGreaterThan(0)
      for (const rule of rules) {
        expect(rule.category).toBe('safety')
      }
    })

    it('covers all 3 categories', () => {
      const completeness = getRulesByCategory('completeness')
      const accuracy = getRulesByCategory('accuracy')
      const safety = getRulesByCategory('safety')
      expect(completeness.length + accuracy.length + safety.length).toBe(getAllRules().length)
    })
  })

  // === AC #3: Rule structure validation ===
  describe('rule structure', () => {
    it('every rule has required fields: id, category, severity, condition, action', () => {
      const rules = getAllRules()
      for (const rule of rules) {
        expect(rule.id).toBeString()
        expect(rule.id.length).toBeGreaterThan(0)
        expect(['completeness', 'accuracy', 'safety']).toContain(rule.category)
        expect(['critical', 'major', 'minor']).toContain(rule.severity)
        expect(rule.condition).toBeDefined()
        expect(rule.condition.type).toBeString()
        expect(rule.condition.params).toBeDefined()
        expect(rule.action).toBeDefined()
        expect(['pass', 'warn', 'fail']).toContain(rule.action.onPass)
        expect(['pass', 'warn', 'fail']).toContain(rule.action.onFail)
        expect(rule.action.failMessage).toBeString()
      }
    })

    it('every rule has a name and description', () => {
      const rules = getAllRules()
      for (const rule of rules) {
        expect(rule.name).toBeString()
        expect(rule.name.length).toBeGreaterThan(0)
        expect(rule.description).toBeString()
        expect(rule.description.length).toBeGreaterThan(0)
      }
    })

    it('condition types are valid', () => {
      const validTypes = ['regex', 'keyword', 'threshold', 'llm-check']
      const rules = getAllRules()
      for (const rule of rules) {
        expect(validTypes).toContain(rule.condition.type)
      }
    })

    it('rule IDs are unique', () => {
      const rules = getAllRules()
      const ids = rules.map(r => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  // === AC #4: Filter by category ===
  describe('category filtering', () => {
    it('completeness rules have comp- prefix', () => {
      const rules = getRulesByCategory('completeness')
      for (const rule of rules) {
        expect(rule.id.startsWith('comp-')).toBe(true)
      }
    })

    it('accuracy rules have acc- prefix', () => {
      const rules = getRulesByCategory('accuracy')
      for (const rule of rules) {
        expect(rule.id.startsWith('acc-')).toBe(true)
      }
    })

    it('safety rules have safe- prefix', () => {
      const rules = getRulesByCategory('safety')
      for (const rule of rules) {
        expect(rule.id.startsWith('safe-')).toBe(true)
      }
    })
  })

  // === AC #5: Filter by severity ===
  describe('getRulesBySeverity', () => {
    it('returns critical rules', () => {
      const rules = getRulesBySeverity('critical')
      expect(rules.length).toBeGreaterThan(0)
      for (const rule of rules) {
        expect(rule.severity).toBe('critical')
      }
    })

    it('returns major rules', () => {
      const rules = getRulesBySeverity('major')
      expect(rules.length).toBeGreaterThan(0)
      for (const rule of rules) {
        expect(rule.severity).toBe('major')
      }
    })

    it('returns minor rules', () => {
      const rules = getRulesBySeverity('minor')
      expect(rules.length).toBeGreaterThan(0)
      for (const rule of rules) {
        expect(rule.severity).toBe('minor')
      }
    })

    it('severity counts add up to total', () => {
      const critical = getRulesBySeverity('critical')
      const major = getRulesBySeverity('major')
      const minor = getRulesBySeverity('minor')
      expect(critical.length + major.length + minor.length).toBe(getAllRules().length)
    })
  })

  // === AC #6: Active rules filter ===
  describe('getActiveRules', () => {
    it('returns only enabled rules', () => {
      const active = getActiveRules()
      expect(active.length).toBeGreaterThan(0)
      for (const rule of active) {
        expect(rule.enabled).toBe(true)
      }
    })

    it('active rules count <= total rules count', () => {
      const active = getActiveRules()
      const all = getAllRules()
      expect(active.length).toBeLessThanOrEqual(all.length)
    })
  })

  // === AC #7: Fallback on invalid YAML ===
  describe('fallback behavior', () => {
    it('loadQualityRulesConfig always returns a valid config', () => {
      const config = loadQualityRulesConfig()
      expect(config.rules).toBeArray()
      expect(config.passCriteria).toBeDefined()
      expect(config.rubrics).toBeDefined()
    })
  })

  // === Pass Criteria ===
  describe('getPassCriteria', () => {
    it('returns pass criteria with required fields', () => {
      const criteria = getPassCriteria()
      expect(criteria.allCriticalMustPass).toBeBoolean()
      expect(criteria.maxFailCount).toBeNumber()
      expect(criteria.maxWarnCount).toBeNumber()
      expect(criteria.criticalCap).toBeNumber()
    })

    it('default: all critical must pass', () => {
      const criteria = getPassCriteria()
      expect(criteria.allCriticalMustPass).toBe(true)
    })

    it('default: max fail count = 0', () => {
      const criteria = getPassCriteria()
      expect(criteria.maxFailCount).toBe(0)
    })
  })

  // === Rubrics ===
  describe('rubrics', () => {
    it('has default rubric', () => {
      const rubric = getRubricForDepartment('default')
      expect(rubric).toBeDefined()
      expect(rubric.name).toBe('기본 검수 기준')
      expect(rubric.scoring).toBeArray()
      expect(rubric.scoring.length).toBe(5) // Q1-Q5
    })

    it('has secretary rubric', () => {
      const rubric = getRubricForDepartment('secretary')
      expect(rubric).toBeDefined()
      expect(rubric.name).toBe('비서실 검수 기준')
    })

    it('has finance rubric', () => {
      const rubric = getRubricForDepartment('finance')
      expect(rubric).toBeDefined()
      expect(rubric.name).toBe('금융분석팀 검수 기준')
    })

    it('has strategy rubric', () => {
      const rubric = getRubricForDepartment('strategy')
      expect(rubric).toBeDefined()
      expect(rubric.name).toBe('전략기획팀 검수 기준')
    })

    it('has legal rubric', () => {
      const rubric = getRubricForDepartment('legal')
      expect(rubric).toBeDefined()
      expect(rubric.name).toBe('법무팀 검수 기준')
    })

    it('has marketing rubric', () => {
      const rubric = getRubricForDepartment('marketing')
      expect(rubric).toBeDefined()
      expect(rubric.name).toBe('마케팅팀 검수 기준')
    })

    it('has tech rubric', () => {
      const rubric = getRubricForDepartment('tech')
      expect(rubric).toBeDefined()
      expect(rubric.name).toBe('기술개발팀 검수 기준')
    })

    it('has publishing rubric', () => {
      const rubric = getRubricForDepartment('publishing')
      expect(rubric).toBeDefined()
      expect(rubric.name).toBe('콘텐츠팀 검수 기준')
    })

    it('falls back to default for unknown department', () => {
      const rubric = getRubricForDepartment('nonexistent-dept')
      expect(rubric.name).toBe('기본 검수 기준')
    })

    it('scoring weights sum to 100 for each rubric', () => {
      const rubrics = getAllRubrics()
      for (const [deptName, rubric] of Object.entries(rubrics)) {
        const totalWeight = rubric.scoring.reduce((sum, s) => sum + s.weight, 0)
        expect(totalWeight).toBe(100)
      }
    })

    it('each rubric has exactly 5 scoring criteria', () => {
      const rubrics = getAllRubrics()
      for (const [deptName, rubric] of Object.entries(rubrics)) {
        expect(rubric.scoring.length).toBe(5)
      }
    })

    it('each rubric scoring has criteria for scores 1, 3, 5', () => {
      const rubrics = getAllRubrics()
      for (const [deptName, rubric] of Object.entries(rubrics)) {
        for (const scoring of rubric.scoring) {
          expect(scoring.criteria['1']).toBeString()
          expect(scoring.criteria['3']).toBeString()
          expect(scoring.criteria['5']).toBeString()
        }
      }
    })

    it('each rubric has at least one critical scoring item', () => {
      const rubrics = getAllRubrics()
      for (const [deptName, rubric] of Object.entries(rubrics)) {
        const criticalCount = rubric.scoring.filter(s => s.critical).length
        expect(criticalCount).toBeGreaterThanOrEqual(1)
      }
    })
  })

  // === Investment Analysis Rules ===
  describe('investment analysis rules', () => {
    it('has investment analysis config', () => {
      const config = getInvestmentAnalysisRules()
      expect(config).toBeDefined()
    })

    it('has balance required rule', () => {
      const config = getInvestmentAnalysisRules()!
      expect(config.balanceRequired).toBeDefined()
      expect(config.balanceRequired!.enabled).toBe(true)
      expect(config.balanceRequired!.keywordsRisk).toBeArray()
      expect(config.balanceRequired!.keywordsBullish).toBeArray()
    })

    it('has risk disclosure rule', () => {
      const config = getInvestmentAnalysisRules()!
      expect(config.riskDisclosure).toBeDefined()
      expect(config.riskDisclosure!.requiredFields).toBeArray()
    })

    it('has optimism bias check', () => {
      const config = getInvestmentAnalysisRules()!
      expect(config.optimismBiasCheck).toBeDefined()
      expect(config.optimismBiasCheck!.penaltyPhrases).toBeArray()
      expect(config.optimismBiasCheck!.maxPenaltyCount).toBe(0)
    })

    it('has evidence quality rule', () => {
      const config = getInvestmentAnalysisRules()!
      expect(config.evidenceQuality).toBeDefined()
      expect(config.evidenceQuality!.evidenceKeywords).toBeArray()
    })
  })

  // === Grouped Rules ===
  describe('getRulesGroupedByCategory', () => {
    it('returns object with 3 category keys', () => {
      const grouped = getRulesGroupedByCategory()
      expect(Object.keys(grouped)).toEqual(['completeness', 'accuracy', 'safety'])
    })

    it('each category has at least 1 rule', () => {
      const grouped = getRulesGroupedByCategory()
      expect(grouped.completeness.length).toBeGreaterThan(0)
      expect(grouped.accuracy.length).toBeGreaterThan(0)
      expect(grouped.safety.length).toBeGreaterThan(0)
    })
  })

  // === Cache ===
  describe('cache management', () => {
    it('invalidateCache clears all caches', () => {
      loadQualityRulesConfig() // populate cache
      invalidateCache()
      const config = loadQualityRulesConfig()
      expect(config).toBeDefined()
    })

    it('invalidateCache with companyId does not affect base cache', () => {
      const config1 = loadQualityRulesConfig()
      invalidateCache('some-company-id')
      const config2 = loadQualityRulesConfig()
      expect(config1).toBe(config2) // same reference = still cached
    })
  })

  // === Specific Rules Content ===
  describe('specific rules content', () => {
    it('has min-length completeness rule', () => {
      const rules = getRulesByCategory('completeness')
      const minLength = rules.find(r => r.id === 'comp-min-length')
      expect(minLength).toBeDefined()
      expect(minLength!.condition.type).toBe('threshold')
      expect(minLength!.severity).toBe('major')
    })

    it('has credential-leak safety rule', () => {
      const rules = getRulesByCategory('safety')
      const credLeak = rules.find(r => r.id === 'safe-credential-leak')
      expect(credLeak).toBeDefined()
      expect(credLeak!.severity).toBe('critical')
      expect(credLeak!.condition.type).toBe('regex')
    })

    it('has prompt-injection safety rule', () => {
      const rules = getRulesByCategory('safety')
      const injection = rules.find(r => r.id === 'safe-prompt-injection')
      expect(injection).toBeDefined()
      expect(injection!.severity).toBe('critical')
    })

    it('has hallucination-detect accuracy rule', () => {
      const rules = getRulesByCategory('accuracy')
      const hallucination = rules.find(r => r.id === 'acc-hallucination-detect')
      expect(hallucination).toBeDefined()
      expect(hallucination!.severity).toBe('critical')
      expect(hallucination!.condition.type).toBe('llm-check')
    })

    it('has fact-check accuracy rule', () => {
      const rules = getRulesByCategory('accuracy')
      const factCheck = rules.find(r => r.id === 'acc-fact-check')
      expect(factCheck).toBeDefined()
      expect(factCheck!.severity).toBe('critical')
    })

    it('all critical rules have fail action', () => {
      const criticalRules = getRulesBySeverity('critical')
      for (const rule of criticalRules) {
        expect(rule.action.onFail).toBe('fail')
      }
    })
  })

  // === Zod Schema Types ===
  describe('zod schema type integrity', () => {
    it('condition params match condition type (regex)', () => {
      const rules = getAllRules().filter(r => r.condition.type === 'regex')
      for (const rule of rules) {
        const params = rule.condition.params as { patterns: string[]; minMatches: number }
        expect(params.patterns).toBeArray()
        expect(params.minMatches).toBeNumber()
      }
    })

    it('condition params match condition type (keyword)', () => {
      const rules = getAllRules().filter(r => r.condition.type === 'keyword')
      for (const rule of rules) {
        const params = rule.condition.params as { keywords: string[]; minMatches: number }
        expect(params.keywords).toBeArray()
        expect(params.minMatches).toBeNumber()
      }
    })

    it('condition params match condition type (threshold)', () => {
      const rules = getAllRules().filter(r => r.condition.type === 'threshold')
      for (const rule of rules) {
        const params = rule.condition.params as { field: string; operator: string; value: number }
        expect(params.field).toBeString()
        expect(params.operator).toBeString()
        expect(params.value).toBeNumber()
      }
    })

    it('condition params match condition type (llm-check)', () => {
      const rules = getAllRules().filter(r => r.condition.type === 'llm-check')
      for (const rule of rules) {
        const params = rule.condition.params as { prompt: string }
        expect(params.prompt).toBeString()
      }
    })
  })

  // === getAllRules ===
  describe('getAllRules', () => {
    it('returns all rules (completeness + accuracy + safety)', () => {
      const all = getAllRules()
      expect(all.length).toBeGreaterThanOrEqual(10) // At least 10 rules in YAML
    })
  })

  // === Department rubric checklists ===
  describe('department checklists', () => {
    it('default rubric has common checklist', () => {
      const rubric = getRubricForDepartment('default')
      expect(rubric.commonChecklist).toBeDefined()
      expect(rubric.commonChecklist!.required).toBeArray()
      expect(rubric.commonChecklist!.required!.length).toBeGreaterThan(0)
    })

    it('finance rubric excludes C1 from common checklist', () => {
      const rubric = getRubricForDepartment('finance')
      expect(rubric.departmentChecklist?.excludeCommon).toContain('C1')
    })

    it('secretary rubric has department-specific checklist', () => {
      const rubric = getRubricForDepartment('secretary')
      expect(rubric.departmentChecklist).toBeDefined()
      expect(rubric.departmentChecklist!.required).toBeArray()
    })
  })
})
