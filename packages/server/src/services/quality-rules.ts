import { readFileSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'
import { db } from '../db'
import { companies } from '../db/schema'
import { eq } from 'drizzle-orm'
import {
  qualityRulesConfigSchema,
  type QualityRulesConfig,
  type QualityRule,
  type Severity,
  type Rubric,
  type PassCriteria,
  type InvestmentAnalysis,
} from '../config/quality-rules-schema'

// === Default fallback rules (used when YAML fails to load/validate) ===
const DEFAULT_RULES: QualityRule[] = [
  {
    id: 'comp-min-length',
    category: 'completeness',
    name: '최소 응답 길이',
    description: '에이전트 응답이 최소 길이 이상인지 확인',
    severity: 'major',
    enabled: true,
    condition: { type: 'threshold', params: { field: 'responseLength', operator: '>=', value: 50 } },
    action: { onPass: 'pass', onFail: 'fail', failMessage: '응답이 너무 짧습니다 (최소 50자 필요)' },
  },
  {
    id: 'safe-credential-leak',
    category: 'safety',
    name: '크리덴셜 유출 탐지',
    description: 'API 키, 비밀번호, 토큰 등 크리덴셜 패턴 탐지',
    severity: 'critical',
    enabled: true,
    condition: {
      type: 'regex',
      params: {
        patterns: ['sk-[a-zA-Z0-9]{20,}', 'AKIA[A-Z0-9]{16}', 'password\\s*[:=]\\s*["\']?[^\\s"\']{8,}'],
        minMatches: 1,
      },
    },
    action: { onPass: 'pass', onFail: 'fail', failMessage: '크리덴셜 유출이 감지되었습니다' },
  },
  {
    id: 'safe-prompt-injection',
    category: 'safety',
    name: '프롬프트 인젝션 방어',
    description: '시스템 프롬프트 노출 패턴 탐지',
    severity: 'critical',
    enabled: true,
    condition: {
      type: 'regex',
      params: {
        patterns: ['system\\s*prompt', 'ignore\\s+(previous|above|all)\\s+instructions'],
        minMatches: 1,
      },
    },
    action: { onPass: 'pass', onFail: 'fail', failMessage: '프롬프트 인젝션 시도가 감지되었습니다' },
  },
]

const DEFAULT_PASS_CRITERIA: PassCriteria = {
  allCriticalMustPass: true,
  maxFailCount: 0,
  maxWarnCount: 3,
  criticalCap: 2.0,
}

const DEFAULT_RUBRIC: Rubric = {
  name: '기본 검수 기준',
  scoring: [
    { id: 'Q1', label: '관련성', weight: 25, critical: true, criteria: { '1': '핵심 질문 미답', '3': '핵심 답하나 누락', '5': '모든 항목 답변' } },
    { id: 'Q2', label: '구체성', weight: 25, critical: false, criteria: { '1': '일반론만', '3': '일부 구체적', '5': '수치/사례 충분' } },
    { id: 'Q3', label: '신뢰성', weight: 20, critical: true, criteria: { '1': '출처 없는 수치', '3': '대체로 신뢰', '5': '모든 출처 명시' } },
    { id: 'Q4', label: '완결성', weight: 15, critical: false, criteria: { '1': '범위 절반 이하', '3': '대부분 다룸', '5': '빠짐없이 다룸' } },
    { id: 'Q5', label: '가독성', weight: 15, critical: false, criteria: { '1': '과밀/반복', '3': '일부 장황', '5': '구조 명확' } },
  ],
}

const DEFAULT_CONFIG: QualityRulesConfig = {
  rules: DEFAULT_RULES,
  passCriteria: DEFAULT_PASS_CRITERIA,
  rubrics: { default: DEFAULT_RUBRIC },
}

// === Cache ===
let cachedConfig: QualityRulesConfig | null = null
const companyOverrideCache = new Map<string, QualityRulesConfig>()

// === Core Functions ===

/**
 * Load and validate quality_rules.yaml. Returns fallback config on error.
 */
export function loadQualityRulesConfig(): QualityRulesConfig {
  if (cachedConfig) return cachedConfig

  try {
    const yamlPath = join(import.meta.dir, '..', 'config', 'quality_rules.yaml')
    const content = readFileSync(yamlPath, 'utf-8')
    const raw = yaml.load(content) as Record<string, unknown>

    const parsed = qualityRulesConfigSchema.parse(raw)
    cachedConfig = parsed
    return parsed
  } catch (err) {
    console.error('[quality-rules] Failed to load/validate quality_rules.yaml, using defaults:', err instanceof Error ? err.message : err)
    cachedConfig = DEFAULT_CONFIG
    return DEFAULT_CONFIG
  }
}

/**
 * Get all rules.
 */
export function getAllRules(): QualityRule[] {
  return loadQualityRulesConfig().rules
}

/**
 * Get rules filtered by category.
 */
export function getRulesByCategory(category: 'completeness' | 'accuracy' | 'safety'): QualityRule[] {
  return loadQualityRulesConfig().rules.filter(r => r.category === category)
}

/**
 * Get rules filtered by severity.
 */
export function getRulesBySeverity(severity: Severity): QualityRule[] {
  return loadQualityRulesConfig().rules.filter(r => r.severity === severity)
}

/**
 * Get only enabled (active) rules.
 */
export function getActiveRules(): QualityRule[] {
  return loadQualityRulesConfig().rules.filter(r => r.enabled)
}

/**
 * Get pass criteria.
 */
export function getPassCriteria(): PassCriteria {
  return loadQualityRulesConfig().passCriteria
}

/**
 * Get rubric for a department. Falls back to 'default' if not found.
 */
export function getRubricForDepartment(deptNameEn: string): Rubric {
  const config = loadQualityRulesConfig()
  return config.rubrics[deptNameEn] ?? config.rubrics['default'] ?? DEFAULT_RUBRIC
}

/**
 * Get all rubrics.
 */
export function getAllRubrics(): Record<string, Rubric> {
  return loadQualityRulesConfig().rubrics
}

/**
 * Get investment analysis rules.
 */
export function getInvestmentAnalysisRules(): InvestmentAnalysis | undefined {
  return loadQualityRulesConfig().investmentAnalysis
}

/**
 * Get rules with company-level overrides merged.
 * Company overrides are stored in companies.settings.qualityRuleOverrides.
 */
export async function getRulesForCompany(companyId: string): Promise<QualityRulesConfig> {
  // Check cache first
  const cached = companyOverrideCache.get(companyId)
  if (cached) return cached

  const baseConfig = loadQualityRulesConfig()

  try {
    const [row] = await db
      .select({ settings: companies.settings })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1)

    if (!row) return baseConfig

    const settings = (row.settings ?? {}) as Record<string, unknown>
    const overrides = settings.qualityRuleOverrides as Array<{
      ruleId: string
      enabled?: boolean
      params?: Record<string, unknown>
    }> | undefined

    if (!overrides || !Array.isArray(overrides) || overrides.length === 0) {
      companyOverrideCache.set(companyId, baseConfig)
      return baseConfig
    }

    // Deep clone base rules and apply overrides
    const mergedRules = baseConfig.rules.map(rule => {
      const override = overrides.find(o => o.ruleId === rule.id)
      if (!override) return rule

      return {
        ...rule,
        enabled: override.enabled ?? rule.enabled,
        condition: override.params
          ? { ...rule.condition, params: { ...rule.condition.params, ...override.params } }
          : rule.condition,
      }
    })

    const mergedConfig: QualityRulesConfig = {
      ...baseConfig,
      rules: mergedRules,
    }

    companyOverrideCache.set(companyId, mergedConfig)
    return mergedConfig
  } catch (err) {
    console.error('[quality-rules] Failed to load company overrides:', err instanceof Error ? err.message : err)
    return baseConfig
  }
}

/**
 * Save company-level quality rule overrides to DB.
 */
export async function saveCompanyOverrides(
  companyId: string,
  overrides: Array<{ ruleId: string; enabled?: boolean; params?: Record<string, unknown> }>,
): Promise<void> {
  const [row] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!row) throw new Error('Company not found')

  const existingSettings = (row.settings ?? {}) as Record<string, unknown>
  const updatedSettings = { ...existingSettings, qualityRuleOverrides: overrides }

  await db
    .update(companies)
    .set({ settings: updatedSettings, updatedAt: new Date() })
    .where(eq(companies.id, companyId))

  // Invalidate cache
  invalidateCache(companyId)
}

/**
 * Invalidate cache for a specific company or all caches.
 */
export function invalidateCache(companyId?: string): void {
  if (companyId) {
    companyOverrideCache.delete(companyId)
  } else {
    cachedConfig = null
    companyOverrideCache.clear()
  }
}

/**
 * Reset all caches (for testing).
 */
export function resetQualityRulesCache(): void {
  cachedConfig = null
  companyOverrideCache.clear()
}

/**
 * Get grouped rules by category for API response.
 */
export function getRulesGroupedByCategory(): Record<string, QualityRule[]> {
  const rules = loadQualityRulesConfig().rules
  const grouped: Record<string, QualityRule[]> = {
    completeness: [],
    accuracy: [],
    safety: [],
  }

  for (const rule of rules) {
    if (grouped[rule.category]) {
      grouped[rule.category].push(rule)
    }
  }

  return grouped
}
