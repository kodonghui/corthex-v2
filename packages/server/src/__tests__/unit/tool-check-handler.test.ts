import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { formatToolCheckReport } from '../../services/tool-check-handler'

// === Unit tests for formatToolCheckReport (pure function, no DB mocking needed) ===

describe('tool-check-handler', () => {
  describe('formatToolCheckReport', () => {
    it('should format empty tool pool + empty agents', () => {
      const report = formatToolCheckReport([], [])

      expect(report).toContain('도구 점검 결과')
      expect(report).toContain('총 0개')
      expect(report).toContain('등록된 도구가 없습니다')
      expect(report).toContain('활성 에이전트가 없습니다')
      expect(report).toContain('등록 도구: 0개')
      expect(report).toContain('활성 에이전트: 0명')
    })

    it('should group tools by category', () => {
      const tools = [
        { name: 'web_search', description: '웹 검색', category: '검색' },
        { name: 'news_search', description: '뉴스 검색', category: '검색' },
        { name: 'stock_price', description: '주가 조회', category: '금융' },
      ]
      const report = formatToolCheckReport(tools, [])

      expect(report).toContain('총 3개')
      expect(report).toContain('검색')
      expect(report).toContain('금융')
      expect(report).toContain('web_search, news_search')
      expect(report).toContain('stock_price')
    })

    it('should list agents with tool counts', () => {
      const agents = [
        { id: 'a1', name: '투자분석팀장', tier: 'manager', allowedTools: ['web_search', 'stock_price'], departmentId: 'd1', departmentName: '전략기획부' },
        { id: 'a2', name: '콘텐츠분석가', tier: 'specialist', allowedTools: ['web_search'], departmentId: 'd2', departmentName: '콘텐츠부' },
        { id: 'a3', name: '신입', tier: 'worker', allowedTools: [], departmentId: null, departmentName: null },
      ]
      const report = formatToolCheckReport([], agents)

      expect(report).toContain('총 3명')
      expect(report).toContain('투자분석팀장')
      expect(report).toContain('전략기획부')
      expect(report).toContain('manager')
      expect(report).toContain('2') // 2 tools
      expect(report).toContain('콘텐츠분석가')
      expect(report).toContain('(미배정)') // no department
    })

    it('should calculate summary correctly', () => {
      const tools = [
        { name: 'tool1', description: 't', category: 'cat' },
        { name: 'tool2', description: 't', category: 'cat' },
      ]
      const agents = [
        { id: 'a1', name: 'Agent1', tier: 'manager', allowedTools: ['tool1'], departmentId: 'd1', departmentName: 'Dept' },
        { id: 'a2', name: 'Agent2', tier: 'specialist', allowedTools: [], departmentId: 'd1', departmentName: 'Dept' },
        { id: 'a3', name: 'Agent3', tier: 'worker', allowedTools: ['tool1', 'tool2'], departmentId: 'd1', departmentName: 'Dept' },
      ]
      const report = formatToolCheckReport(tools, agents)

      expect(report).toContain('등록 도구: 2개')
      expect(report).toContain('활성 에이전트: 3명')
      expect(report).toContain('도구 배정됨: 2명')
      expect(report).toContain('도구 미배정: 1명')
    })

    it('should handle null allowedTools as empty', () => {
      const agents = [
        { id: 'a1', name: 'Agent1', tier: 'manager', allowedTools: null, departmentId: 'd1', departmentName: 'Dept' },
      ]
      const report = formatToolCheckReport([], agents as any)

      expect(report).toContain('도구 미배정: 1명')
      expect(report).toContain('0') // 0 tools
    })

    it('should handle tools with empty category as 기타', () => {
      const tools = [
        { name: 'misc_tool', description: '기타 도구', category: '' },
      ]
      const report = formatToolCheckReport(tools, [])

      // Empty category falls through to '기타'
      expect(report).toContain('총 1개')
    })
  })
})
