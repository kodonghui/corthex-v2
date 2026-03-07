// Story 1-6: Seed Data & Org Templates -- 단위 테스트
import { describe, test, expect } from 'bun:test'
import {
  CHIEF_OF_STAFF_SOUL,
  BUILTIN_TEMPLATES,
  INVESTMENT_TEMPLATE,
  MARKETING_TEMPLATE,
  ALL_IN_ONE_TEMPLATE,
  type TemplateData,
  type TemplateAgent,
  type TemplateDepartment,
} from '../../services/seed.service'

// =============================================
// 비서실장 Soul 검증
// =============================================
describe('Chief of Staff Soul', () => {
  test('Soul 마크다운이 비어있지 않아야 함', () => {
    expect(CHIEF_OF_STAFF_SOUL).toBeTruthy()
    expect(CHIEF_OF_STAFF_SOUL.length).toBeGreaterThan(100)
  })

  test('핵심 역할 키워드가 포함되어야 함', () => {
    expect(CHIEF_OF_STAFF_SOUL).toContain('비서실장')
    expect(CHIEF_OF_STAFF_SOUL).toContain('명령 분류')
    expect(CHIEF_OF_STAFF_SOUL).toContain('자동 위임')
    expect(CHIEF_OF_STAFF_SOUL).toContain('결과 종합')
    expect(CHIEF_OF_STAFF_SOUL).toContain('품질 검수')
  })

  test('5항목 루브릭 키워드가 포함되어야 함', () => {
    expect(CHIEF_OF_STAFF_SOUL).toContain('결론 명확성')
    expect(CHIEF_OF_STAFF_SOUL).toContain('근거 출처')
    expect(CHIEF_OF_STAFF_SOUL).toContain('리스크 언급')
    expect(CHIEF_OF_STAFF_SOUL).toContain('형식 준수')
    expect(CHIEF_OF_STAFF_SOUL).toContain('논리적 일관성')
  })

  test('isSystem=true 관련 내용이 포함되어야 함', () => {
    expect(CHIEF_OF_STAFF_SOUL).toContain('isSystem=true')
  })
})

// =============================================
// 빌트인 조직 템플릿 검증
// =============================================
describe('Builtin Templates', () => {
  test('3종 템플릿이 정확히 존재해야 함', () => {
    expect(BUILTIN_TEMPLATES).toHaveLength(3)
    const names = BUILTIN_TEMPLATES.map(t => t.name)
    expect(names).toContain('투자분석')
    expect(names).toContain('마케팅')
    expect(names).toContain('올인원')
  })

  test('모든 템플릿에 description이 있어야 함', () => {
    for (const tmpl of BUILTIN_TEMPLATES) {
      expect(tmpl.description).toBeTruthy()
      expect(tmpl.description.length).toBeGreaterThan(10)
    }
  })

  test('모든 템플릿에 templateData.departments가 있어야 함', () => {
    for (const tmpl of BUILTIN_TEMPLATES) {
      expect(tmpl.templateData).toBeTruthy()
      expect(tmpl.templateData.departments).toBeArray()
      expect(tmpl.templateData.departments.length).toBeGreaterThan(0)
    }
  })
})

// =============================================
// 에이전트 필수 필드 유효성 헬퍼
// =============================================
function validateAgent(agent: TemplateAgent, context: string) {
  test(`${context} -- name이 비어있지 않아야 함`, () => {
    expect(agent.name).toBeTruthy()
  })

  test(`${context} -- role이 비어있지 않아야 함`, () => {
    expect(agent.role).toBeTruthy()
  })

  test(`${context} -- tier가 유효해야 함`, () => {
    expect(['manager', 'specialist', 'worker']).toContain(agent.tier)
  })

  test(`${context} -- modelName이 비어있지 않아야 함`, () => {
    expect(agent.modelName).toBeTruthy()
  })

  test(`${context} -- soul이 비어있지 않아야 함`, () => {
    expect(agent.soul).toBeTruthy()
    expect(agent.soul.length).toBeGreaterThan(10)
  })

  test(`${context} -- allowedTools가 배열이어야 함`, () => {
    expect(agent.allowedTools).toBeArray()
    expect(agent.allowedTools.length).toBeGreaterThan(0)
  })
}

function validateDepartment(dept: TemplateDepartment, templateName: string) {
  test(`${templateName}/${dept.name} -- 부서명이 비어있지 않아야 함`, () => {
    expect(dept.name).toBeTruthy()
  })

  test(`${templateName}/${dept.name} -- description이 비어있지 않아야 함`, () => {
    expect(dept.description).toBeTruthy()
  })

  test(`${templateName}/${dept.name} -- 에이전트가 1명 이상이어야 함`, () => {
    expect(dept.agents.length).toBeGreaterThan(0)
  })

  test(`${templateName}/${dept.name} -- Manager가 정확히 1명이어야 함`, () => {
    const managers = dept.agents.filter(a => a.tier === 'manager')
    expect(managers).toHaveLength(1)
  })

  for (const agent of dept.agents) {
    validateAgent(agent, `${templateName}/${dept.name}/${agent.name}`)
  }
}

// =============================================
// 투자분석 템플릿 상세 검증
// =============================================
describe('Investment Template', () => {
  test('재무팀 1개 부서가 있어야 함', () => {
    expect(INVESTMENT_TEMPLATE.departments).toHaveLength(1)
    expect(INVESTMENT_TEMPLATE.departments[0].name).toBe('재무팀')
  })

  test('5명 에이전트가 있어야 함 (CIO + 전문가2 + 워커2)', () => {
    const agents = INVESTMENT_TEMPLATE.departments[0].agents
    expect(agents).toHaveLength(5)
  })

  test('Manager 모델이 claude-sonnet-4-6이어야 함', () => {
    const manager = INVESTMENT_TEMPLATE.departments[0].agents.find(a => a.tier === 'manager')
    expect(manager).toBeTruthy()
    expect(manager!.modelName).toBe('claude-sonnet-4-6')
  })

  test('Specialist/Worker 모델이 claude-haiku-4-5이어야 함', () => {
    const nonManagers = INVESTMENT_TEMPLATE.departments[0].agents.filter(a => a.tier !== 'manager')
    for (const agent of nonManagers) {
      expect(agent.modelName).toBe('claude-haiku-4-5')
    }
  })

  test('투자 관련 도구가 포함되어야 함', () => {
    const allTools = INVESTMENT_TEMPLATE.departments[0].agents.flatMap(a => a.allowedTools)
    expect(allTools).toContain('get_stock_price')
    expect(allTools).toContain('search_news')
  })

  for (const dept of INVESTMENT_TEMPLATE.departments) {
    validateDepartment(dept, '투자분석')
  }
})

// =============================================
// 마케팅 템플릿 상세 검증
// =============================================
describe('Marketing Template', () => {
  test('마케팅팀 1개 부서가 있어야 함', () => {
    expect(MARKETING_TEMPLATE.departments).toHaveLength(1)
    expect(MARKETING_TEMPLATE.departments[0].name).toBe('마케팅팀')
  })

  test('4명 에이전트가 있어야 함 (CMO + 전문가2 + 워커1)', () => {
    const agents = MARKETING_TEMPLATE.departments[0].agents
    expect(agents).toHaveLength(4)
  })

  test('마케팅 관련 도구가 포함되어야 함', () => {
    const allTools = MARKETING_TEMPLATE.departments[0].agents.flatMap(a => a.allowedTools)
    expect(allTools).toContain('publish_instagram')
    expect(allTools).toContain('generate_image')
  })

  for (const dept of MARKETING_TEMPLATE.departments) {
    validateDepartment(dept, '마케팅')
  }
})

// =============================================
// 올인원 템플릿 상세 검증
// =============================================
describe('All-in-One Template', () => {
  test('4개 부서가 있어야 함', () => {
    expect(ALL_IN_ONE_TEMPLATE.departments).toHaveLength(4)
    const deptNames = ALL_IN_ONE_TEMPLATE.departments.map(d => d.name)
    expect(deptNames).toContain('경영지원실')
    expect(deptNames).toContain('개발팀')
    expect(deptNames).toContain('마케팅팀')
    expect(deptNames).toContain('재무팀')
  })

  test('총 12명 에이전트가 있어야 함', () => {
    const totalAgents = ALL_IN_ONE_TEMPLATE.departments.reduce(
      (sum, dept) => sum + dept.agents.length,
      0,
    )
    expect(totalAgents).toBe(12)
  })

  test('각 부서에 Manager가 정확히 1명씩 있어야 함', () => {
    for (const dept of ALL_IN_ONE_TEMPLATE.departments) {
      const managers = dept.agents.filter(a => a.tier === 'manager')
      expect(managers).toHaveLength(1)
    }
  })

  test('모든 Manager 모델이 claude-sonnet-4-6이어야 함', () => {
    for (const dept of ALL_IN_ONE_TEMPLATE.departments) {
      const manager = dept.agents.find(a => a.tier === 'manager')!
      expect(manager.modelName).toBe('claude-sonnet-4-6')
    }
  })

  for (const dept of ALL_IN_ONE_TEMPLATE.departments) {
    validateDepartment(dept, '올인원')
  }
})

// =============================================
// 3계급 모델 배정 규칙 검증 (모든 템플릿)
// =============================================
describe('Model Assignment Rules', () => {
  const allTemplates = [INVESTMENT_TEMPLATE, MARKETING_TEMPLATE, ALL_IN_ONE_TEMPLATE]

  test('모든 Manager는 claude-sonnet-4-6이어야 함', () => {
    for (const tmpl of allTemplates) {
      for (const dept of tmpl.departments) {
        for (const agent of dept.agents) {
          if (agent.tier === 'manager') {
            expect(agent.modelName).toBe('claude-sonnet-4-6')
          }
        }
      }
    }
  })

  test('모든 Specialist/Worker는 claude-haiku-4-5이어야 함', () => {
    for (const tmpl of allTemplates) {
      for (const dept of tmpl.departments) {
        for (const agent of dept.agents) {
          if (agent.tier === 'specialist' || agent.tier === 'worker') {
            expect(agent.modelName).toBe('claude-haiku-4-5')
          }
        }
      }
    }
  })
})

// =============================================
// templateData 구조 유효성 (JSON 직렬화 호환)
// =============================================
describe('Template Data JSON Compatibility', () => {
  test('투자분석 템플릿이 JSON 직렬화/역직렬화 가능해야 함', () => {
    const json = JSON.stringify(INVESTMENT_TEMPLATE)
    const parsed = JSON.parse(json) as TemplateData
    expect(parsed.departments).toHaveLength(1)
    expect(parsed.departments[0].agents).toHaveLength(5)
  })

  test('마케팅 템플릿이 JSON 직렬화/역직렬화 가능해야 함', () => {
    const json = JSON.stringify(MARKETING_TEMPLATE)
    const parsed = JSON.parse(json) as TemplateData
    expect(parsed.departments).toHaveLength(1)
    expect(parsed.departments[0].agents).toHaveLength(4)
  })

  test('올인원 템플릿이 JSON 직렬화/역직렬화 가능해야 함', () => {
    const json = JSON.stringify(ALL_IN_ONE_TEMPLATE)
    const parsed = JSON.parse(json) as TemplateData
    expect(parsed.departments).toHaveLength(4)
  })
})

// =============================================
// 모든 에이전트에 한국어 소통 언급 확인
// =============================================
describe('All Agents Korean Communication', () => {
  const allTemplates = [
    { name: '투자분석', data: INVESTMENT_TEMPLATE },
    { name: '마케팅', data: MARKETING_TEMPLATE },
    { name: '올인원', data: ALL_IN_ONE_TEMPLATE },
  ]

  for (const { name, data } of allTemplates) {
    for (const dept of data.departments) {
      for (const agent of dept.agents) {
        test(`${name}/${dept.name}/${agent.name} -- Soul에 한국어 소통 언급`, () => {
          expect(agent.soul).toContain('한국어')
        })
      }
    }
  }
})
