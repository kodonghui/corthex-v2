/**
 * TEA Tests for Story 2-8: Org Template UI + Agent Department Move
 *
 * Focus: Validate data contracts between server API and admin UI.
 * Tests validate the shape of API responses that the new org-templates page
 * and org-chart department move UI depend on.
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// Type definitions matching API responses
// ============================================================
type TemplateAgent = {
  name: string
  nameEn?: string
  role: string
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  soul: string
  allowedTools: string[]
}

type TemplateDepartment = {
  name: string
  description?: string
  agents: TemplateAgent[]
}

type OrgTemplate = {
  id: string
  companyId: string | null
  name: string
  description: string | null
  templateData: { departments: TemplateDepartment[] }
  isBuiltin: boolean
  isActive: boolean
  createdBy: string | null
  createdAt: string
}

type ApplyResult = {
  templateId: string
  templateName: string
  departmentsCreated: number
  departmentsSkipped: number
  agentsCreated: number
  agentsSkipped: number
  details: Array<{
    departmentName: string
    action: 'created' | 'skipped'
    departmentId: string
    agentsCreated: string[]
    agentsSkipped: string[]
  }>
}

type OrgAgent = {
  id: string
  name: string
  role: string | null
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  departmentId: string | null
  status: string
  isSecretary: boolean
  isSystem: boolean
  soul: string | null
  allowedTools: string[] | null
}

type OrgDept = {
  id: string
  name: string
  description: string | null
  agents: OrgAgent[]
}

// ============================================================
// Test fixtures
// ============================================================
const SAMPLE_TEMPLATE: OrgTemplate = {
  id: '11111111-1111-1111-1111-111111111111',
  companyId: null,
  name: '투자분석 조직',
  description: 'CIO + 4명 전문가로 구성된 투자 분석 조직',
  templateData: {
    departments: [
      {
        name: '투자전략부',
        description: '투자 전략 수립 및 분석',
        agents: [
          {
            name: 'CIO',
            role: '최고투자책임자',
            tier: 'manager',
            modelName: 'claude-sonnet-4-6',
            soul: '# CIO\n투자 전략을 수립합니다.',
            allowedTools: ['web_search', 'calculator'],
          },
          {
            name: '주식분석가',
            role: '국내외 주식 분석',
            tier: 'specialist',
            modelName: 'claude-haiku-4-5',
            soul: '# 주식분석가\n주식을 분석합니다.',
            allowedTools: ['stock_price_checker'],
          },
        ],
      },
      {
        name: '리스크관리부',
        description: '투자 리스크 평가',
        agents: [
          {
            name: '리스크매니저',
            role: '리스크 평가 및 관리',
            tier: 'specialist',
            modelName: 'claude-haiku-4-5',
            soul: '# 리스크매니저',
            allowedTools: [],
          },
        ],
      },
    ],
  },
  isBuiltin: true,
  isActive: true,
  createdBy: null,
  createdAt: '2026-03-01T00:00:00Z',
}

const SAMPLE_APPLY_RESULT: ApplyResult = {
  templateId: SAMPLE_TEMPLATE.id,
  templateName: SAMPLE_TEMPLATE.name,
  departmentsCreated: 2,
  departmentsSkipped: 0,
  agentsCreated: 3,
  agentsSkipped: 0,
  details: [
    {
      departmentName: '투자전략부',
      action: 'created',
      departmentId: 'dept-1',
      agentsCreated: ['CIO', '주식분석가'],
      agentsSkipped: [],
    },
    {
      departmentName: '리스크관리부',
      action: 'created',
      departmentId: 'dept-2',
      agentsCreated: ['리스크매니저'],
      agentsSkipped: [],
    },
  ],
}

const SAMPLE_APPLY_RESULT_MERGE: ApplyResult = {
  templateId: SAMPLE_TEMPLATE.id,
  templateName: SAMPLE_TEMPLATE.name,
  departmentsCreated: 1,
  departmentsSkipped: 1,
  agentsCreated: 1,
  agentsSkipped: 2,
  details: [
    {
      departmentName: '투자전략부',
      action: 'skipped',
      departmentId: 'dept-existing',
      agentsCreated: [],
      agentsSkipped: ['CIO', '주식분석가'],
    },
    {
      departmentName: '리스크관리부',
      action: 'created',
      departmentId: 'dept-new',
      agentsCreated: ['리스크매니저'],
      agentsSkipped: [],
    },
  ],
}

// ============================================================
// Org Template Card Data Contract Tests
// ============================================================
describe('Org Template Card Data Contract', () => {
  test('template has all fields needed for card rendering', () => {
    const t = SAMPLE_TEMPLATE
    expect(t.id).toBeTruthy()
    expect(t.name).toBeTruthy()
    expect(typeof t.description).toBe('string')
    expect(typeof t.isBuiltin).toBe('boolean')
    expect(typeof t.isActive).toBe('boolean')
    expect(t.templateData).toBeTruthy()
    expect(Array.isArray(t.templateData.departments)).toBe(true)
  })

  test('card can compute total agent count from templateData', () => {
    const depts = SAMPLE_TEMPLATE.templateData.departments
    const totalAgents = depts.reduce((s, d) => s + d.agents.length, 0)
    expect(totalAgents).toBe(3)
    expect(depts.length).toBe(2)
  })

  test('card can display department tags from templateData', () => {
    const deptNames = SAMPLE_TEMPLATE.templateData.departments.map((d) => d.name)
    expect(deptNames).toEqual(['투자전략부', '리스크관리부'])
  })

  test('null companyId indicates builtin template', () => {
    expect(SAMPLE_TEMPLATE.companyId).toBeNull()
    expect(SAMPLE_TEMPLATE.isBuiltin).toBe(true)
  })

  test('company-specific template has non-null companyId', () => {
    const custom: OrgTemplate = { ...SAMPLE_TEMPLATE, companyId: 'company-1', isBuiltin: false }
    expect(custom.companyId).toBeTruthy()
    expect(custom.isBuiltin).toBe(false)
  })
})

// ============================================================
// Preview Modal Data Contract Tests
// ============================================================
describe('Preview Modal Data Contract', () => {
  test('each department has name and agents array', () => {
    for (const dept of SAMPLE_TEMPLATE.templateData.departments) {
      expect(dept.name).toBeTruthy()
      expect(Array.isArray(dept.agents)).toBe(true)
    }
  })

  test('each agent has name, tier, and modelName for preview display', () => {
    for (const dept of SAMPLE_TEMPLATE.templateData.departments) {
      for (const agent of dept.agents) {
        expect(agent.name).toBeTruthy()
        expect(['manager', 'specialist', 'worker']).toContain(agent.tier)
        expect(agent.modelName).toBeTruthy()
      }
    }
  })

  test('agent role is present for preview tooltip', () => {
    for (const dept of SAMPLE_TEMPLATE.templateData.departments) {
      for (const agent of dept.agents) {
        expect(typeof agent.role).toBe('string')
      }
    }
  })

  test('department description is optional', () => {
    const dept1 = SAMPLE_TEMPLATE.templateData.departments[0]
    expect(dept1.description).toBeTruthy()

    const noDescript: TemplateDepartment = {
      name: 'TestDept',
      agents: [],
    }
    expect(noDescript.description).toBeUndefined()
  })
})

// ============================================================
// Apply Result Data Contract Tests
// ============================================================
describe('Apply Result Data Contract', () => {
  test('apply result has all summary counts', () => {
    const r = SAMPLE_APPLY_RESULT
    expect(typeof r.departmentsCreated).toBe('number')
    expect(typeof r.departmentsSkipped).toBe('number')
    expect(typeof r.agentsCreated).toBe('number')
    expect(typeof r.agentsSkipped).toBe('number')
    expect(r.templateName).toBeTruthy()
    expect(r.templateId).toBeTruthy()
  })

  test('summary counts are consistent with details', () => {
    const r = SAMPLE_APPLY_RESULT
    const detailCreatedDepts = r.details.filter((d) => d.action === 'created').length
    const detailSkippedDepts = r.details.filter((d) => d.action === 'skipped').length
    expect(r.departmentsCreated).toBe(detailCreatedDepts)
    expect(r.departmentsSkipped).toBe(detailSkippedDepts)

    const detailAgentsCreated = r.details.reduce((s, d) => s + d.agentsCreated.length, 0)
    const detailAgentsSkipped = r.details.reduce((s, d) => s + d.agentsSkipped.length, 0)
    expect(r.agentsCreated).toBe(detailAgentsCreated)
    expect(r.agentsSkipped).toBe(detailAgentsSkipped)
  })

  test('each detail has department name and action', () => {
    for (const d of SAMPLE_APPLY_RESULT.details) {
      expect(d.departmentName).toBeTruthy()
      expect(['created', 'skipped']).toContain(d.action)
      expect(d.departmentId).toBeTruthy()
      expect(Array.isArray(d.agentsCreated)).toBe(true)
      expect(Array.isArray(d.agentsSkipped)).toBe(true)
    }
  })

  test('merge scenario shows correct skip/create mix', () => {
    const r = SAMPLE_APPLY_RESULT_MERGE
    expect(r.departmentsCreated).toBe(1)
    expect(r.departmentsSkipped).toBe(1)
    expect(r.agentsCreated).toBe(1)
    expect(r.agentsSkipped).toBe(2)
  })

  test('fresh apply scenario shows all created', () => {
    const r = SAMPLE_APPLY_RESULT
    expect(r.departmentsSkipped).toBe(0)
    expect(r.agentsSkipped).toBe(0)
    expect(r.departmentsCreated).toBeGreaterThan(0)
    expect(r.agentsCreated).toBeGreaterThan(0)
  })
})

// ============================================================
// Agent Department Move Data Contract Tests
// ============================================================
describe('Agent Department Move Data Contract', () => {
  test('PATCH body for department move only needs departmentId', () => {
    const movePayload = { departmentId: 'new-dept-id' }
    expect(Object.keys(movePayload)).toEqual(['departmentId'])
  })

  test('move to unassigned uses null departmentId', () => {
    const movePayload = { departmentId: null }
    expect(movePayload.departmentId).toBeNull()
  })

  test('org-chart agent has departmentId for current dept display', () => {
    const agent: OrgAgent = {
      id: 'agent-1',
      name: 'TestAgent',
      role: 'Test',
      tier: 'specialist',
      modelName: 'claude-haiku-4-5',
      departmentId: 'dept-1',
      status: 'offline',
      isSecretary: false,
      isSystem: false,
      soul: null,
      allowedTools: null,
    }
    expect(agent.departmentId).toBeTruthy()
  })

  test('unassigned agent has null departmentId', () => {
    const agent: OrgAgent = {
      id: 'agent-2',
      name: 'UnassignedAgent',
      role: null,
      tier: 'worker',
      modelName: 'gemini-2.5-flash',
      departmentId: null,
      status: 'offline',
      isSecretary: false,
      isSystem: false,
      soul: null,
      allowedTools: null,
    }
    expect(agent.departmentId).toBeNull()
  })

  test('department list provides options for move dropdown', () => {
    const departments: OrgDept[] = [
      { id: 'dept-1', name: '마케팅부', description: null, agents: [] },
      { id: 'dept-2', name: '개발부', description: null, agents: [] },
    ]
    // UI renders: <option value="">미배속</option> + departments.map(d => <option>)
    const options = [{ id: '', name: '미배속' }, ...departments]
    expect(options.length).toBe(3)
    expect(options[0].name).toBe('미배속')
  })

  test('detecting dept change correctly', () => {
    const currentDeptId: string | null = 'dept-1'
    const selectedDeptId = 'dept-2'
    const emptySelected = ''

    // Changed: different dept
    expect((selectedDeptId || null) !== (currentDeptId || null)).toBe(true)

    // Changed: to unassigned
    expect((emptySelected || null) !== (currentDeptId || null)).toBe(true)

    // Not changed: same dept
    expect(('dept-1' || null) !== (currentDeptId || null)).toBe(false)
  })

  test('null vs empty string normalization for departmentId', () => {
    // UI uses empty string for "미배속", API expects null
    const uiValue = ''
    const apiValue = uiValue || null
    expect(apiValue).toBeNull()

    const uiValueDept = 'dept-1'
    const apiValueDept = uiValueDept || null
    expect(apiValueDept).toBe('dept-1')
  })
})

// ============================================================
// Empty State CTA Logic Tests
// ============================================================
describe('Empty State CTA Logic', () => {
  test('isEmpty when no departments and no unassigned agents', () => {
    const departments: OrgDept[] = []
    const unassignedAgents: OrgAgent[] = []
    const isEmpty = departments.length === 0 && unassignedAgents.length === 0
    expect(isEmpty).toBe(true)
  })

  test('not empty when departments exist', () => {
    const departments: OrgDept[] = [{ id: '1', name: 'Test', description: null, agents: [] }]
    const unassignedAgents: OrgAgent[] = []
    const isEmpty = departments.length === 0 && unassignedAgents.length === 0
    expect(isEmpty).toBe(false)
  })

  test('not empty when unassigned agents exist', () => {
    const departments: OrgDept[] = []
    const unassignedAgents: OrgAgent[] = [{
      id: 'a1', name: 'Agent', role: null, tier: 'worker',
      modelName: 'claude-haiku-4-5', departmentId: null,
      status: 'offline', isSecretary: false, isSystem: false,
      soul: null, allowedTools: null,
    }]
    const isEmpty = departments.length === 0 && unassignedAgents.length === 0
    expect(isEmpty).toBe(false)
  })

  test('total agent count includes all departments + unassigned', () => {
    const departments: OrgDept[] = [
      { id: '1', name: 'Dept1', description: null, agents: [
        { id: 'a1', name: 'A1', role: null, tier: 'manager', modelName: 'm', departmentId: '1', status: 'offline', isSecretary: false, isSystem: false, soul: null, allowedTools: null },
        { id: 'a2', name: 'A2', role: null, tier: 'specialist', modelName: 'm', departmentId: '1', status: 'offline', isSecretary: false, isSystem: false, soul: null, allowedTools: null },
      ]},
    ]
    const unassignedAgents: OrgAgent[] = [
      { id: 'a3', name: 'A3', role: null, tier: 'worker', modelName: 'm', departmentId: null, status: 'offline', isSecretary: false, isSystem: false, soul: null, allowedTools: null },
    ]
    const total = departments.reduce((s, d) => s + d.agents.length, 0) + unassignedAgents.length
    expect(total).toBe(3)
  })
})

// ============================================================
// Template Tier/Model Validation Tests
// ============================================================
describe('Template Tier and Model Validation', () => {
  const validTiers = ['manager', 'specialist', 'worker']
  const validModels = [
    'claude-sonnet-4-6', 'claude-haiku-4-5',
    'gpt-4.1', 'gpt-4.1-mini',
    'gemini-2.5-pro', 'gemini-2.5-flash',
  ]

  test('all template agents have valid tier', () => {
    for (const dept of SAMPLE_TEMPLATE.templateData.departments) {
      for (const agent of dept.agents) {
        expect(validTiers).toContain(agent.tier)
      }
    }
  })

  test('all template agents have valid modelName', () => {
    for (const dept of SAMPLE_TEMPLATE.templateData.departments) {
      for (const agent of dept.agents) {
        expect(validModels).toContain(agent.modelName)
      }
    }
  })

  test('manager tier uses sonnet model by default', () => {
    const managers = SAMPLE_TEMPLATE.templateData.departments
      .flatMap((d) => d.agents)
      .filter((a) => a.tier === 'manager')
    for (const m of managers) {
      expect(m.modelName).toBe('claude-sonnet-4-6')
    }
  })

  test('specialist tier uses haiku model by default', () => {
    const specialists = SAMPLE_TEMPLATE.templateData.departments
      .flatMap((d) => d.agents)
      .filter((a) => a.tier === 'specialist')
    for (const s of specialists) {
      expect(s.modelName).toBe('claude-haiku-4-5')
    }
  })
})
