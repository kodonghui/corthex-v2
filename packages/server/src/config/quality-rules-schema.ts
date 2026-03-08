import { z } from 'zod'

// === Enums ===
export const severityEnum = z.enum(['critical', 'major', 'minor'])
export const conditionTypeEnum = z.enum(['regex', 'keyword', 'threshold', 'llm-check'])
export const actionTypeEnum = z.enum(['pass', 'warn', 'fail'])

// === Condition Params ===
const regexParamsSchema = z.object({
  patterns: z.array(z.string()),
  minMatches: z.number().int().min(1).default(1),
  multiline: z.boolean().optional(),
})

const keywordParamsSchema = z.object({
  keywords: z.array(z.string()),
  minMatches: z.number().int().min(1).default(1),
  mode: z.enum(['presence', 'absence']).optional(),
})

const thresholdParamsSchema = z.object({
  field: z.string(),
  operator: z.enum(['>=', '<=', '>', '<', '==', '!=']),
  value: z.number(),
})

const llmCheckParamsSchema = z.object({
  prompt: z.string(),
  requireToolData: z.boolean().optional(),
  checkPatterns: z.array(z.string()).optional(),
})

// === Condition ===
export const conditionSchema = z.object({
  type: conditionTypeEnum,
  params: z.union([regexParamsSchema, keywordParamsSchema, thresholdParamsSchema, llmCheckParamsSchema]),
})

// === Action ===
export const actionSchema = z.object({
  onPass: actionTypeEnum,
  onFail: actionTypeEnum,
  failMessage: z.string(),
})

// === Quality Rule ===
export const qualityRuleSchema = z.object({
  id: z.string(),
  category: z.enum(['completeness', 'accuracy', 'safety']),
  name: z.string(),
  description: z.string(),
  severity: severityEnum,
  enabled: z.boolean().default(true),
  condition: conditionSchema,
  action: actionSchema,
})

// === Pass Criteria ===
export const passCriteriaSchema = z.object({
  allCriticalMustPass: z.boolean().default(true),
  maxFailCount: z.number().int().min(0).default(0),
  maxWarnCount: z.number().int().min(0).default(3),
  criticalCap: z.number().min(0).default(2.0),
})

// === Checklist Item ===
const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
})

// === Scoring Criteria ===
const scoringCriteriaSchema = z.object({
  id: z.string(),
  label: z.string(),
  weight: z.number().int().min(1).max(100),
  critical: z.boolean().default(false),
  criteria: z.record(z.string(), z.string()),
})

// === Rubric ===
export const rubricSchema = z.object({
  name: z.string(),
  commonChecklist: z.object({
    required: z.array(checklistItemSchema).optional(),
    optional: z.array(checklistItemSchema).optional(),
  }).optional(),
  departmentChecklist: z.object({
    required: z.array(checklistItemSchema).optional(),
    optional: z.array(checklistItemSchema).optional(),
    excludeCommon: z.array(z.string()).optional(),
  }).optional(),
  scoring: z.array(scoringCriteriaSchema),
})

// === Investment Analysis Rules ===
const investmentRuleBaseSchema = z.object({
  enabled: z.boolean().default(true),
  description: z.string(),
})

export const investmentAnalysisSchema = z.object({
  balanceRequired: investmentRuleBaseSchema.extend({
    minRiskMentions: z.number().int().min(0).default(2),
    keywordsRisk: z.array(z.string()),
    keywordsBullish: z.array(z.string()),
    biasThreshold: z.number().default(3.0),
  }).optional(),
  riskDisclosure: investmentRuleBaseSchema.extend({
    requiredFields: z.array(z.string()),
    allowPartial: z.boolean().default(true),
  }).optional(),
  optimismBiasCheck: investmentRuleBaseSchema.extend({
    penaltyPhrases: z.array(z.string()),
    warningPhrases: z.array(z.string()),
    maxPenaltyCount: z.number().int().min(0).default(0),
    maxWarningCount: z.number().int().min(0).default(2),
  }).optional(),
  evidenceQuality: investmentRuleBaseSchema.extend({
    minDataPoints: z.number().int().min(0).default(1),
    evidenceKeywords: z.array(z.string()),
  }).optional(),
})

// === Full Config ===
export const qualityRulesConfigSchema = z.object({
  rules: z.array(qualityRuleSchema),
  passCriteria: passCriteriaSchema,
  rubrics: z.record(z.string(), rubricSchema),
  investmentAnalysis: investmentAnalysisSchema.optional(),
})

// === Inferred Types ===
export type Severity = z.infer<typeof severityEnum>
export type ConditionType = z.infer<typeof conditionTypeEnum>
export type ActionType = z.infer<typeof actionTypeEnum>
export type QualityCondition = z.infer<typeof conditionSchema>
export type QualityAction = z.infer<typeof actionSchema>
export type QualityRule = z.infer<typeof qualityRuleSchema>
export type PassCriteria = z.infer<typeof passCriteriaSchema>
export type Rubric = z.infer<typeof rubricSchema>
export type ScoringCriteria = z.infer<typeof scoringCriteriaSchema>
export type InvestmentAnalysis = z.infer<typeof investmentAnalysisSchema>
export type QualityRulesConfig = z.infer<typeof qualityRulesConfigSchema>
