import { describe, test, expect } from 'bun:test'

// Story 24.7: AR73 call_agent response standardization tests

import { parseChildResponse } from '../../tool-handlers/builtins/call-agent'
import type { CallAgentResponse } from '../../engine/types'

describe('Story 24.7: AR73 call_agent Response Standardization', () => {
  describe('parseChildResponse', () => {
    test('success: content without error → status "success"', () => {
      const result = parseChildResponse('Researcher', 'Analysis complete. Found 3 trends.', false, '')
      expect(result.status).toBe('success')
      expect(result.summary).toContain('Analysis complete')
      expect(result.delegatedTo).toBe('Researcher')
    })

    test('failure: error with no content → status "failure"', () => {
      const result = parseChildResponse('Writer', '', true, 'Timeout exceeded')
      expect(result.status).toBe('failure')
      expect(result.summary).toBe('Timeout exceeded')
      expect(result.delegatedTo).toBe('Writer')
    })

    test('partial: error with some content → status "partial"', () => {
      const result = parseChildResponse('Analyst', 'Partial data gathered', true, 'Connection lost')
      expect(result.status).toBe('partial')
      expect(result.summary).toContain('Partial data')
      expect(result.delegatedTo).toBe('Analyst')
      expect(result.next_actions).toContain('부분 결과 확인 필요')
    })

    test('summary truncated to 500 chars', () => {
      const longContent = 'A'.repeat(1000)
      const result = parseChildResponse('Agent', longContent, false, '')
      expect(result.summary.length).toBe(500)
    })

    test('empty content + no error → success with empty summary', () => {
      const result = parseChildResponse('Silent', '', false, '')
      expect(result.status).toBe('success')
      expect(result.summary).toBe('')
      expect(result.delegatedTo).toBe('Silent')
    })

    test('failure with empty error message → uses agent name fallback', () => {
      const result = parseChildResponse('Bot', '', true, '')
      expect(result.status).toBe('failure')
      expect(result.summary).toContain('Bot')
      expect(result.summary).toContain('실패')
    })
  })

  describe('CallAgentResponse type compliance', () => {
    test('success response has required fields', () => {
      const response: CallAgentResponse = {
        status: 'success',
        summary: 'Task done',
        delegatedTo: 'Agent-1',
      }
      expect(response.status).toBe('success')
      expect(response.summary).toBe('Task done')
      expect(response.delegatedTo).toBe('Agent-1')
      expect(response.next_actions).toBeUndefined()
      expect(response.artifacts).toBeUndefined()
    })

    test('partial response can include next_actions', () => {
      const response: CallAgentResponse = {
        status: 'partial',
        summary: 'Incomplete',
        delegatedTo: 'Agent-2',
        next_actions: ['Retry step 3', 'Check logs'],
      }
      expect(response.next_actions).toHaveLength(2)
    })

    test('response can include artifacts', () => {
      const response: CallAgentResponse = {
        status: 'success',
        summary: 'Report ready',
        delegatedTo: 'Reporter',
        artifacts: [{ type: 'report', url: '/reports/123' }],
      }
      expect(response.artifacts).toHaveLength(1)
    })

    test('status enum restricted to 3 values', () => {
      const validStatuses: CallAgentResponse['status'][] = ['success', 'failure', 'partial']
      expect(validStatuses).toHaveLength(3)
    })
  })
})
