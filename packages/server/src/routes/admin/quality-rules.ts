import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import {
  getRulesGroupedByCategory,
  getAllRules,
  getAllRubrics,
  getPassCriteria,
  getInvestmentAnalysisRules,
  getRulesForCompany,
  saveCompanyOverrides,
  getActiveRules,
} from '../../services/quality-rules'
import type { AppEnv } from '../../types'

export const qualityRulesRoute = new Hono<AppEnv>()

qualityRulesRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// GET /api/admin/quality-rules — full rules list grouped by category
qualityRulesRoute.get('/quality-rules', async (c) => {
  const companyId = c.get('tenant').companyId
  const companyConfig = await getRulesForCompany(companyId)

  const grouped: Record<string, typeof companyConfig.rules> = {
    completeness: [],
    accuracy: [],
    safety: [],
  }
  for (const rule of companyConfig.rules) {
    if (grouped[rule.category]) {
      grouped[rule.category].push(rule)
    }
  }

  return c.json({
    success: true,
    data: {
      rules: grouped,
      passCriteria: companyConfig.passCriteria,
      totalRules: companyConfig.rules.length,
      activeRules: companyConfig.rules.filter(r => r.enabled).length,
    },
  })
})

// GET /api/admin/quality-rules/rubrics — department rubrics
qualityRulesRoute.get('/quality-rules/rubrics', async (c) => {
  const rubrics = getAllRubrics()

  return c.json({
    success: true,
    data: rubrics,
  })
})

// GET /api/admin/quality-rules/active — active rules only
qualityRulesRoute.get('/quality-rules/active', async (c) => {
  const companyId = c.get('tenant').companyId
  const companyConfig = await getRulesForCompany(companyId)
  const activeRules = companyConfig.rules.filter(r => r.enabled)

  return c.json({
    success: true,
    data: activeRules,
  })
})

// GET /api/admin/quality-rules/investment — investment analysis rules
qualityRulesRoute.get('/quality-rules/investment', async (c) => {
  const investmentRules = getInvestmentAnalysisRules()

  return c.json({
    success: true,
    data: investmentRules ?? null,
  })
})

// PUT /api/admin/quality-rules/overrides — save company-level overrides
const overrideItemSchema = z.object({
  ruleId: z.string(),
  enabled: z.boolean().optional(),
  params: z.record(z.string(), z.unknown()).optional(),
})

const overridesBodySchema = z.object({
  overrides: z.array(overrideItemSchema),
})

qualityRulesRoute.put('/quality-rules/overrides', zValidator('json', overridesBodySchema), async (c) => {
  const companyId = c.get('tenant').companyId
  const body = c.req.valid('json')

  // Validate that all ruleIds exist in base config
  const baseRules = getAllRules()
  const ruleMap = new Map(baseRules.map(r => [r.id, r]))

  const invalidIds = body.overrides
    .filter(o => !ruleMap.has(o.ruleId))
    .map(o => o.ruleId)

  if (invalidIds.length > 0) {
    return c.json({
      success: false,
      error: { code: 'INVALID_RULE_ID', message: `Unknown rule IDs: ${invalidIds.join(', ')}` },
    }, 400)
  }

  // Validate override params keys match rule condition type
  const paramErrors: string[] = []
  const validParamKeys: Record<string, string[]> = {
    'regex': ['patterns', 'minMatches', 'multiline'],
    'keyword': ['keywords', 'minMatches', 'mode'],
    'threshold': ['field', 'operator', 'value'],
    'llm-check': ['prompt', 'requireToolData', 'checkPatterns'],
  }
  for (const o of body.overrides) {
    if (o.params) {
      const rule = ruleMap.get(o.ruleId)!
      const allowed = validParamKeys[rule.condition.type] ?? []
      const unknown = Object.keys(o.params).filter(k => !allowed.includes(k))
      if (unknown.length > 0) {
        paramErrors.push(`${o.ruleId}: invalid params [${unknown.join(', ')}] for ${rule.condition.type} rule`)
      }
    }
  }
  if (paramErrors.length > 0) {
    return c.json({
      success: false,
      error: { code: 'INVALID_PARAMS', message: paramErrors.join('; ') },
    }, 400)
  }

  await saveCompanyOverrides(companyId, body.overrides)

  return c.json({
    success: true,
    data: { overrideCount: body.overrides.length },
  })
})
