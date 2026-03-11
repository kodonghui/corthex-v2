import { describe, test, expect } from 'bun:test'
import {
  MANAGER_SOUL_TEMPLATE,
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
      expect(MANAGER_SOUL_TEMPLATE).toContain('독자 분석')
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

    test('contains task decomposition → delegation → synthesis flow', () => {
      const step1Idx = MANAGER_SOUL_TEMPLATE.indexOf('### 1단계')
      const step2Idx = MANAGER_SOUL_TEMPLATE.indexOf('### 2단계')
      const step3Idx = MANAGER_SOUL_TEMPLATE.indexOf('### 3단계')
      expect(step1Idx).toBeGreaterThan(-1)
      expect(step2Idx).toBeGreaterThan(step1Idx)
      expect(step3Idx).toBeGreaterThan(step2Idx)
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

  describe('BUILTIN_SOUL_TEMPLATES', () => {
    test('contains at least one template', () => {
      expect(BUILTIN_SOUL_TEMPLATES.length).toBeGreaterThanOrEqual(1)
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

    test('manager template has description', () => {
      const mgr = BUILTIN_SOUL_TEMPLATES[0]
      expect(mgr.description).toBeTruthy()
      expect(typeof mgr.description).toBe('string')
    })
  })
})
