/**
 * TEA Risk-Based Tests — tool-check-handler.ts
 * Risk focus: DB query failures, null/undefined tool data, report accuracy
 */
import { describe, it, expect } from 'bun:test'
import { formatToolCheckReport } from '../../services/tool-check-handler'

describe('TEA: tool-check-handler edge cases', () => {
  describe('formatToolCheckReport — data integrity risks', () => {
    it('should handle agent with non-array allowedTools (jsonb null)', () => {
      const agents = [
        { id: 'a1', name: 'Agent', tier: 'manager', allowedTools: null, departmentId: 'd1', departmentName: 'Dept' },
      ]
      const report = formatToolCheckReport([], agents as any)
      // Should not crash, should count as 0 tools
      expect(report).toContain('도구 미배정: 1명')
    })

    it('should handle agent with object allowedTools (unexpected jsonb shape)', () => {
      const agents = [
        { id: 'a1', name: 'Agent', tier: 'manager', allowedTools: { web_search: true }, departmentId: 'd1', departmentName: 'Dept' },
      ]
      const report = formatToolCheckReport([], agents as any)
      // Object is not Array.isArray — should count as 0 tools
      expect(report).toContain('도구 미배정: 1명')
    })

    it('should handle agent with undefined departmentId and departmentName', () => {
      const agents = [
        { id: 'a1', name: 'Agent', tier: 'worker', allowedTools: [], departmentId: null, departmentName: null },
      ]
      const report = formatToolCheckReport([], agents)
      expect(report).toContain('(미배정)')
    })

    it('should handle large tool pool (100+ tools)', () => {
      const tools = Array.from({ length: 120 }, (_, i) => ({
        name: `tool_${i}`,
        description: `Tool ${i}`,
        category: `cat_${i % 5}`,
      }))
      const report = formatToolCheckReport(tools, [])
      expect(report).toContain('총 120개')
      // Should have 5 categories
      expect(report).toContain('cat_0')
      expect(report).toContain('cat_4')
    })

    it('should handle agents with very large allowedTools arrays', () => {
      const bigToolList = Array.from({ length: 50 }, (_, i) => `tool_${i}`)
      const agents = [
        { id: 'a1', name: 'SuperAgent', tier: 'manager', allowedTools: bigToolList, departmentId: 'd1', departmentName: 'Dept' },
      ]
      const report = formatToolCheckReport([], agents)
      expect(report).toContain('50') // 50 tools
      expect(report).toContain('도구 배정됨: 1명')
    })

    it('should accurately count mixed tool assignment status', () => {
      const agents = [
        { id: 'a1', name: 'A1', tier: 'manager', allowedTools: ['t1'], departmentId: 'd1', departmentName: 'D1' },
        { id: 'a2', name: 'A2', tier: 'specialist', allowedTools: [], departmentId: 'd1', departmentName: 'D1' },
        { id: 'a3', name: 'A3', tier: 'worker', allowedTools: null, departmentId: null, departmentName: null },
        { id: 'a4', name: 'A4', tier: 'manager', allowedTools: ['t1', 't2', 't3'], departmentId: 'd2', departmentName: 'D2' },
      ]
      const report = formatToolCheckReport([], agents as any)
      expect(report).toContain('활성 에이전트: 4명')
      expect(report).toContain('도구 배정됨: 2명')
      expect(report).toContain('도구 미배정: 2명')
    })

    it('should handle tools with special characters in names', () => {
      const tools = [
        { name: 'web/search', description: 'Search', category: 'API/External' },
        { name: 'db:query', description: 'DB', category: 'Internal' },
      ]
      const report = formatToolCheckReport(tools, [])
      expect(report).toContain('web/search')
      expect(report).toContain('db:query')
      expect(report).toContain('API/External')
    })
  })
})
