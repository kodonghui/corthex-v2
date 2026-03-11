import { describe, test, expect } from 'bun:test'
import {
  MANAGER_SOUL_TEMPLATE,
  SECRETARY_SOUL_TEMPLATE,
  DEEPWORK_SOUL_SNIPPET,
  QUALITY_GATE_SNIPPET,
  BUILTIN_SOUL_TEMPLATES,
} from '../../lib/soul-templates'

describe('soul-templates', () => {
  describe('MANAGER_SOUL_TEMPLATE', () => {
    test('template is a non-empty string', () => {
      expect(typeof MANAGER_SOUL_TEMPLATE).toBe('string')
      expect(MANAGER_SOUL_TEMPLATE.length).toBeGreaterThan(500)
    })

    test('contains {{subordinate_list}} variable', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('{{subordinate_list}}')
    })

    test('contains {{tool_list}} variable', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('{{tool_list}}')
    })

    test('contains {{department_name}} variable', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('{{department_name}}')
    })

    test('contains {{owner_name}} variable', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('{{owner_name}}')
    })

    test('contains {{specialty}} variable', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('{{specialty}}')
    })

    test('uses only valid {{variable}} syntax compatible with soul-renderer', () => {
      const vars = MANAGER_SOUL_TEMPLATE.match(/\{\{([^}]+)\}\}/g) || []
      const validVars = [
        '{{agent_list}}',
        '{{subordinate_list}}',
        '{{tool_list}}',
        '{{department_name}}',
        '{{owner_name}}',
        '{{specialty}}',
      ]
      for (const v of vars) {
        expect(validVars).toContain(v)
      }
    })

    test('contains 5th analyst pattern (독자 분석)', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('5번째 분석가')
    })

    test('contains delegation pattern (call_agent)', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('call_agent')
    })

    test('contains 4-section report format (결론/분석/리스크/추천)', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('### 결론')
      expect(MANAGER_SOUL_TEMPLATE).toContain('### 분석')
      expect(MANAGER_SOUL_TEMPLATE).toContain('### 리스크')
      expect(MANAGER_SOUL_TEMPLATE).toContain('### 추천')
    })

    test('contains 5-step deepwork pattern (계획→수집→분석→초안→최종)', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('1단계: 계획 수립')
      expect(MANAGER_SOUL_TEMPLATE).toContain('2단계: 데이터 수집')
      expect(MANAGER_SOUL_TEMPLATE).toContain('3단계: 분석')
      expect(MANAGER_SOUL_TEMPLATE).toContain('4단계: 초안 작성')
      expect(MANAGER_SOUL_TEMPLATE).toContain('5단계: 최종 보고서')
    })

    test('5-step order is correct (계획→수집→분석→초안→최종)', () => {
      const step1Idx = MANAGER_SOUL_TEMPLATE.indexOf('1단계: 계획 수립')
      const step2Idx = MANAGER_SOUL_TEMPLATE.indexOf('2단계: 데이터 수집')
      const step3Idx = MANAGER_SOUL_TEMPLATE.indexOf('3단계: 분석')
      const step4Idx = MANAGER_SOUL_TEMPLATE.indexOf('4단계: 초안 작성')
      const step5Idx = MANAGER_SOUL_TEMPLATE.indexOf('5단계: 최종 보고서')
      expect(step1Idx).toBeGreaterThan(-1)
      expect(step2Idx).toBeGreaterThan(step1Idx)
      expect(step3Idx).toBeGreaterThan(step2Idx)
      expect(step4Idx).toBeGreaterThan(step3Idx)
      expect(step5Idx).toBeGreaterThan(step4Idx)
    })

    test('contains deepwork delegation instruction to subordinates', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('딥워크 5단계')
    })

    test('handles solo mode (no subordinates fallback)', () => {
      expect(MANAGER_SOUL_TEMPLATE).toContain('혼자 처리')
    })
  })

  describe('MANAGER_SOUL_TEMPLATE rendering compatibility', () => {
    test('all {{variables}} are substituted after manual regex replacement', () => {
      const vars: Record<string, string> = {
        agent_list: 'Alice(Manager), Bob(Worker)',
        subordinate_list: '투자전문가(specialist), 리서치전문가(specialist)',
        tool_list: 'kr_stock: 한국 주식 조회, web_search: 웹 검색',
        department_name: '투자분석부',
        owner_name: '홍길동',
        specialty: '투자분석팀장',
      }
      const rendered = MANAGER_SOUL_TEMPLATE.replace(
        /\{\{([^}]+)\}\}/g,
        (_, key) => vars[key.trim()] || '',
      )
      // No unresolved variables should remain
      expect(rendered).not.toMatch(/\{\{[^}]+\}\}/)
      // Substituted values should be present
      expect(rendered).toContain('투자분석부')
      expect(rendered).toContain('홍길동')
      expect(rendered).toContain('투자분석팀장')
      expect(rendered).toContain('투자전문가(specialist)')
      expect(rendered).toContain('kr_stock: 한국 주식 조회')
    })

    test('template with empty variables produces clean output (no leftover {{}})', () => {
      const rendered = MANAGER_SOUL_TEMPLATE.replace(
        /\{\{([^}]+)\}\}/g,
        () => '',
      )
      expect(rendered).not.toMatch(/\{\{[^}]+\}\}/)
      // Core structure still present
      expect(rendered).toContain('### 결론')
      expect(rendered).toContain('call_agent')
    })

    test('template does not contain prompt injection risks', () => {
      // No user input placeholder patterns
      expect(MANAGER_SOUL_TEMPLATE).not.toContain('${')
      expect(MANAGER_SOUL_TEMPLATE).not.toContain('`${')
      // No system override patterns
      expect(MANAGER_SOUL_TEMPLATE).not.toMatch(/ignore.*previous.*instructions/i)
      expect(MANAGER_SOUL_TEMPLATE).not.toMatch(/system.*override/i)
    })
  })

  describe('SECRETARY_SOUL_TEMPLATE', () => {
    test('template is a non-empty string', () => {
      expect(typeof SECRETARY_SOUL_TEMPLATE).toBe('string')
      expect(SECRETARY_SOUL_TEMPLATE.length).toBeGreaterThan(500)
    })

    test('contains all 6 valid {{variable}} placeholders', () => {
      expect(SECRETARY_SOUL_TEMPLATE).toContain('{{agent_list}}')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('{{subordinate_list}}')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('{{tool_list}}')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('{{department_name}}')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('{{owner_name}}')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('{{specialty}}')
    })

    test('uses only valid {{variable}} syntax compatible with soul-renderer', () => {
      const vars = SECRETARY_SOUL_TEMPLATE.match(/\{\{([^}]+)\}\}/g) || []
      const validVars = [
        '{{agent_list}}',
        '{{subordinate_list}}',
        '{{tool_list}}',
        '{{department_name}}',
        '{{owner_name}}',
        '{{specialty}}',
      ]
      for (const v of vars) {
        expect(validVars).toContain(v)
      }
    })

    test('contains deepwork delegation instruction', () => {
      expect(SECRETARY_SOUL_TEMPLATE).toContain('딥워크 5단계')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('계획→수집→분석→초안→최종')
    })

    test('contains quality gate 5-item checklist (결론/근거/리스크/형식/논리)', () => {
      expect(SECRETARY_SOUL_TEMPLATE).toContain('**결론**')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('**근거**')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('**리스크**')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('**형식**')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('**논리**')
    })

    test('contains PASS/FAIL criteria (4 of 5 items)', () => {
      expect(SECRETARY_SOUL_TEMPLATE).toContain('4항목 이상 충족')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('PASS')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('FAIL')
    })

    test('contains rework feedback format', () => {
      expect(SECRETARY_SOUL_TEMPLATE).toContain('[재작업 요청]')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('미달 항목')
      expect(SECRETARY_SOUL_TEMPLATE).toContain('개선사항')
    })

    test('contains max 2 rework limit', () => {
      expect(SECRETARY_SOUL_TEMPLATE).toContain('최대 2회')
    })

    test('contains rework method using call_agent', () => {
      expect(SECRETARY_SOUL_TEMPLATE).toContain('call_agent로 동일 에이전트를 재호출')
    })

    test('contains 4-step procedure (분류→위임→종합→검수)', () => {
      const step1 = SECRETARY_SOUL_TEMPLATE.indexOf('1단계: 명령 분류')
      const step2 = SECRETARY_SOUL_TEMPLATE.indexOf('2단계: 에이전트 위임')
      const step3 = SECRETARY_SOUL_TEMPLATE.indexOf('3단계: 결과 종합')
      const step4 = SECRETARY_SOUL_TEMPLATE.indexOf('4단계: 품질 검수')
      expect(step1).toBeGreaterThan(-1)
      expect(step2).toBeGreaterThan(step1)
      expect(step3).toBeGreaterThan(step2)
      expect(step4).toBeGreaterThan(step3)
    })

    test('rendering produces clean output', () => {
      const vars: Record<string, string> = {
        agent_list: 'CIO(매니저), CMO(매니저)',
        subordinate_list: '보좌관A(worker)',
        tool_list: 'web_search: 웹 검색',
        department_name: '비서실',
        owner_name: 'CEO',
        specialty: '비서실장',
      }
      const rendered = SECRETARY_SOUL_TEMPLATE.replace(
        /\{\{([^}]+)\}\}/g,
        (_, key) => vars[key.trim()] || '',
      )
      expect(rendered).not.toMatch(/\{\{[^}]+\}\}/)
      expect(rendered).toContain('비서실')
      expect(rendered).toContain('CIO(매니저)')
    })

    test('does not contain prompt injection risks', () => {
      expect(SECRETARY_SOUL_TEMPLATE).not.toContain('${')
      expect(SECRETARY_SOUL_TEMPLATE).not.toMatch(/ignore.*previous.*instructions/i)
    })
  })

  describe('DEEPWORK_SOUL_SNIPPET', () => {
    test('snippet is a non-empty string', () => {
      expect(typeof DEEPWORK_SOUL_SNIPPET).toBe('string')
      expect(DEEPWORK_SOUL_SNIPPET.length).toBeGreaterThan(200)
    })

    test('contains all 5 deepwork steps', () => {
      expect(DEEPWORK_SOUL_SNIPPET).toContain('1단계: 계획 수립')
      expect(DEEPWORK_SOUL_SNIPPET).toContain('2단계: 데이터 수집')
      expect(DEEPWORK_SOUL_SNIPPET).toContain('3단계: 분석')
      expect(DEEPWORK_SOUL_SNIPPET).toContain('4단계: 초안 작성')
      expect(DEEPWORK_SOUL_SNIPPET).toContain('5단계: 최종 보고서')
    })

    test('5 steps are in correct order', () => {
      const idx1 = DEEPWORK_SOUL_SNIPPET.indexOf('1단계: 계획 수립')
      const idx2 = DEEPWORK_SOUL_SNIPPET.indexOf('2단계: 데이터 수집')
      const idx3 = DEEPWORK_SOUL_SNIPPET.indexOf('3단계: 분석')
      const idx4 = DEEPWORK_SOUL_SNIPPET.indexOf('4단계: 초안 작성')
      const idx5 = DEEPWORK_SOUL_SNIPPET.indexOf('5단계: 최종 보고서')
      expect(idx1).toBeGreaterThan(-1)
      expect(idx2).toBeGreaterThan(idx1)
      expect(idx3).toBeGreaterThan(idx2)
      expect(idx4).toBeGreaterThan(idx3)
      expect(idx5).toBeGreaterThan(idx4)
    })

    test('contains "자율 딥워크 프로토콜" header', () => {
      expect(DEEPWORK_SOUL_SNIPPET).toContain('자율 딥워크 프로토콜')
    })

    test('prohibits skipping step 1', () => {
      expect(DEEPWORK_SOUL_SNIPPET).toContain('건너뛰고 바로 답하는 것은 금지')
    })

    test('requires minimum 2 tools/sources in data collection', () => {
      expect(DEEPWORK_SOUL_SNIPPET).toContain('최소 2개 이상')
    })

    test('does not contain any {{variable}} placeholders (pure snippet)', () => {
      expect(DEEPWORK_SOUL_SNIPPET).not.toMatch(/\{\{[^}]+\}\}/)
    })
  })

  describe('QUALITY_GATE_SNIPPET', () => {
    test('snippet is a non-empty string', () => {
      expect(typeof QUALITY_GATE_SNIPPET).toBe('string')
      expect(QUALITY_GATE_SNIPPET.length).toBeGreaterThan(200)
    })

    test('contains all 5 QA items (결론/근거/리스크/형식/논리)', () => {
      expect(QUALITY_GATE_SNIPPET).toContain('**결론**')
      expect(QUALITY_GATE_SNIPPET).toContain('**근거**')
      expect(QUALITY_GATE_SNIPPET).toContain('**리스크**')
      expect(QUALITY_GATE_SNIPPET).toContain('**형식**')
      expect(QUALITY_GATE_SNIPPET).toContain('**논리**')
    })

    test('contains PASS/FAIL criteria', () => {
      expect(QUALITY_GATE_SNIPPET).toContain('PASS')
      expect(QUALITY_GATE_SNIPPET).toContain('FAIL')
      expect(QUALITY_GATE_SNIPPET).toContain('4항목 이상 충족')
    })

    test('contains rework request format with structured feedback', () => {
      expect(QUALITY_GATE_SNIPPET).toContain('[재작업 요청]')
      expect(QUALITY_GATE_SNIPPET).toContain('미달 항목')
      expect(QUALITY_GATE_SNIPPET).toContain('개선사항')
    })

    test('contains max 2 rework limit', () => {
      expect(QUALITY_GATE_SNIPPET).toContain('최대 2회 재작업 허용')
    })

    test('contains honest reporting on 3rd failure', () => {
      expect(QUALITY_GATE_SNIPPET).toContain('솔직하게 보고')
    })

    test('contains rework method using call_agent', () => {
      expect(QUALITY_GATE_SNIPPET).toContain('call_agent로 동일 에이전트를 재호출')
    })

    test('contains 품질 게이트 header', () => {
      expect(QUALITY_GATE_SNIPPET).toContain('품질 게이트')
    })

    test('does not contain any {{variable}} placeholders (pure snippet)', () => {
      expect(QUALITY_GATE_SNIPPET).not.toMatch(/\{\{[^}]+\}\}/)
    })
  })

  describe('BUILTIN_SOUL_TEMPLATES', () => {
    test('contains exactly 2 templates (manager + secretary)', () => {
      expect(BUILTIN_SOUL_TEMPLATES.length).toBe(2)
    })

    test('manager template has correct metadata', () => {
      const mgr = BUILTIN_SOUL_TEMPLATES[0]
      expect(mgr.name).toBe('매니저 표준 템플릿')
      expect(mgr.tier).toBe('manager')
      expect(mgr.category).toBe('manager')
      expect(mgr.isBuiltin).toBe(true)
      expect(mgr.isActive).toBe(true)
      expect(mgr.content).toBe(MANAGER_SOUL_TEMPLATE)
    })

    test('manager template description mentions deepwork', () => {
      const mgr = BUILTIN_SOUL_TEMPLATES[0]
      expect(mgr.description).toContain('딥워크')
    })

    test('secretary template has correct metadata', () => {
      const sec = BUILTIN_SOUL_TEMPLATES[1]
      expect(sec.name).toBe('비서실장 표준 템플릿')
      expect(sec.tier).toBe('secretary')
      expect(sec.category).toBe('secretary')
      expect(sec.isBuiltin).toBe(true)
      expect(sec.isActive).toBe(true)
      expect(sec.content).toBe(SECRETARY_SOUL_TEMPLATE)
    })

    test('secretary template description mentions deepwork and quality gate', () => {
      const sec = BUILTIN_SOUL_TEMPLATES[1]
      expect(sec.description).toContain('딥워크')
      expect(sec.description).toContain('품질 게이트')
    })
  })

  describe('Template size limits (token efficiency)', () => {
    test('MANAGER_SOUL_TEMPLATE does not exceed 2,500 chars', () => {
      expect(MANAGER_SOUL_TEMPLATE.length).toBeLessThanOrEqual(2500)
    })

    test('SECRETARY_SOUL_TEMPLATE does not exceed 2,500 chars', () => {
      expect(SECRETARY_SOUL_TEMPLATE.length).toBeLessThanOrEqual(2500)
    })

    test('DEEPWORK_SOUL_SNIPPET is reasonably sized (under 1,000 chars)', () => {
      expect(DEEPWORK_SOUL_SNIPPET.length).toBeLessThanOrEqual(1000)
    })

    test('QUALITY_GATE_SNIPPET is reasonably sized (under 1,000 chars)', () => {
      expect(QUALITY_GATE_SNIPPET.length).toBeLessThanOrEqual(1000)
    })
  })
})
