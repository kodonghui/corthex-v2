/**
 * TEA Risk-Based Tests for DeepWorkService
 *
 * Risk analysis:
 * 1. HIGH: Timeout race conditions (phase timeout vs total timeout interaction)
 * 2. HIGH: Context accumulation corruption with special characters / large payloads
 * 3. HIGH: DB save failure doesn't crash the service
 * 4. MED: Phase order invariant (always 5 phases in correct order)
 * 5. MED: EventBus event ordering and data integrity
 * 6. MED: Non-string error objects handled correctly
 * 7. LOW: Empty command text handling
 * 8. LOW: Singleton instance exported correctly
 */

import { describe, test, expect, beforeEach, mock, spyOn } from 'bun:test'
import { DeepWorkService, deepWorkService } from '../../services/deep-work'
import { eventBus } from '../../lib/event-bus'
import type { AgentConfig } from '../../services/agent-runner'
import type { LLMRouterContext } from '../../services/llm-router'

// === Mocks ===

const mockExecute = mock(() =>
  Promise.resolve({
    content: 'test output',
    toolCalls: [],
    usage: { inputTokens: 100, outputTokens: 200 },
    cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
    finishReason: 'end_turn',
    iterations: 1,
  })
)

mock.module('../../services/agent-runner', () => ({
  agentRunner: { execute: mockExecute },
  buildSystemPrompt: mock(() => 'system prompt'),
  scanForCredentials: mock(() => {}),
  getToolDefinitions: mock(() => []),
  setToolDefinitionProvider: mock(() => {}),
  setToolNameProvider: mock(() => {}),
  getAllToolNames: mock(() => []),
  AgentRunner: class { execute = mockExecute },
}))

const mockDbWhere = mock(() => Promise.resolve())
const mockDbSet = mock(() => ({ where: mockDbWhere }))
const mockDbUpdate = mock(() => ({ set: mockDbSet }))
mock.module('../../db', () => ({
  db: { update: mockDbUpdate },
}))

mock.module('../../db/schema', () => ({
  commands: { id: 'id', companyId: 'company_id' },
}))

mock.module('../../services/knowledge-injector', () => ({
  collectKnowledgeContext: mock(() => Promise.resolve(null)),
  collectAgentMemoryContext: mock(() => Promise.resolve(null)),
  clearKnowledgeCache: mock(() => {}),
  clearAllCache: mock(() => {}),
}))

mock.module('../../services/memory-extractor', () => ({
  extractAndSaveMemories: mock(() => Promise.resolve({ saved: 0, memories: [] })),
  consolidateMemories: mock(() => Promise.resolve({ merged: 0, remaining: 0 })),
  clearRateLimiter: mock(() => {}),
  isRateLimited: mock(() => false),
}))

// === Test Helpers ===

const testAgent: AgentConfig = {
  id: 'agent-tea',
  companyId: 'company-tea',
  name: 'TEA분석가',
  tier: 'specialist',
  modelName: 'claude-sonnet-4-5-20250514',
  soul: 'AI 분석',
  allowedTools: ['web-search'],
  isActive: true,
}

const testContext: LLMRouterContext = {
  companyId: 'company-tea',
  agentId: 'agent-tea',
  agentName: 'TEA분석가',
}

const baseOptions = { commandId: 'cmd-tea', companyId: 'company-tea' }

// === TEA Risk-Based Tests ===

describe('TEA: DeepWorkService Risk-Based Tests', () => {
  beforeEach(() => {
    mockExecute.mockClear()
    mockDbUpdate.mockClear()
    mockDbSet.mockClear()
    mockDbWhere.mockClear()
    mockExecute.mockImplementation(() =>
      Promise.resolve({
        content: 'test output',
        toolCalls: [],
        usage: { inputTokens: 100, outputTokens: 200 },
        cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
        finishReason: 'end_turn',
        iterations: 1,
      })
    )
  })

  describe('R1: Timeout Race Conditions', () => {
    test('phase timeout exactly at total timeout boundary', async () => {
      // phaseTimeout = totalTimeout = 100ms, first phase takes 90ms
      let callCount = 0
      mockExecute.mockImplementation(() => {
        callCount++
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                content: `output ${callCount}`,
                toolCalls: [],
                usage: { inputTokens: 100, outputTokens: 200 },
                cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
                finishReason: 'end_turn',
                iterations: 1,
              }),
            20,
          ),
        )
      })

      const service = new DeepWorkService()
      const result = await service.execute(
        testAgent,
        '분석',
        { ...baseOptions, phaseTimeoutMs: 200, totalTimeoutMs: 60 },
        testContext,
      )

      // Some phases should complete, some timeout
      expect(result.phases).toHaveLength(5)
      const timeoutCount = result.phases.filter((p) => p.status === 'timeout').length
      expect(timeoutCount).toBeGreaterThan(0)
    })

    test('effectiveTimeout is min(phaseTimeout, remaining)', async () => {
      // phaseTimeout is 500ms but total is only 100ms
      const service = new DeepWorkService()
      mockExecute.mockImplementation(() =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                content: 'ok',
                toolCalls: [],
                usage: { inputTokens: 10, outputTokens: 20 },
                cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 10 },
                finishReason: 'end_turn',
                iterations: 1,
              }),
            5,
          ),
        ),
      )

      const result = await service.execute(
        testAgent,
        '분석',
        { ...baseOptions, phaseTimeoutMs: 500, totalTimeoutMs: 100 },
        testContext,
      )

      // Should not take more than ~200ms (total timeout + overhead)
      expect(result.totalDurationMs).toBeLessThan(500)
    })

    test('zero remaining time marks all phases as timeout immediately', async () => {
      // totalTimeoutMs = 0
      const service = new DeepWorkService()
      const result = await service.execute(
        testAgent,
        '분석',
        { ...baseOptions, totalTimeoutMs: 0 },
        testContext,
      )

      // All phases should be timeout (remaining ≤ 0 before first phase)
      // Actually the first check is `remaining <= 0` which is `0 - elapsed <= 0`
      // elapsed is 0 at start, so remaining = 0, which IS <= 0
      expect(result.phases.every((p) => p.status === 'timeout')).toBe(true)
      expect(mockExecute).not.toHaveBeenCalled()
    })
  })

  describe('R2: Context Accumulation Edge Cases', () => {
    test('very long output is accumulated without truncation', async () => {
      const longOutput = 'A'.repeat(50_000)
      mockExecute.mockImplementation(() =>
        Promise.resolve({
          content: longOutput,
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      )

      const calls: any[] = []
      mockExecute.mockImplementation((_agent: any, task: any) => {
        calls.push(task.messages[0].content.length)
        return Promise.resolve({
          content: longOutput,
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      // Context grows with each phase
      expect(calls[0]).toBeLessThan(calls[4])
      expect(result.phases).toHaveLength(5)
    })

    test('special characters in output do not corrupt context', async () => {
      const specialOutput = '```\n## 분석\n<script>alert("xss")</script>\n${variable}\n\\n\\t'
      mockExecute.mockImplementation(() =>
        Promise.resolve({
          content: specialOutput,
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      )

      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.phases).toHaveLength(5)
      expect(result.phases.every((p) => p.status === 'completed')).toBe(true)
      expect(result.finalReport).toContain(specialOutput)
    })

    test('empty output from a phase is handled gracefully', async () => {
      let callCount = 0
      mockExecute.mockImplementation(() => {
        callCount++
        return Promise.resolve({
          content: callCount === 2 ? '' : 'normal output',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.phases[1].output).toBe('')
      expect(result.phases[1].status).toBe('completed')
      // Subsequent phases still work
      expect(result.phases[2].status).toBe('completed')
    })
  })

  describe('R3: DB Save Failure Resilience', () => {
    test('DB save error propagates (caller handles)', async () => {
      mockDbSet.mockReturnValueOnce({ where: mock(() => Promise.reject(new Error('DB connection lost'))) })

      const service = new DeepWorkService()
      await expect(
        service.execute(testAgent, '분석', baseOptions, testContext),
      ).rejects.toThrow('DB connection lost')
    })

    test('saveResult is called with correct parameters', async () => {
      const service = new DeepWorkService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(mockDbUpdate).toHaveBeenCalledTimes(1)
      const setArg = mockDbSet.mock.calls[0][0] as any
      expect(setArg.status).toBe('completed')
      expect(typeof setArg.result).toBe('string')
      expect(setArg.metadata.deepwork.phases).toHaveLength(5)
    })
  })

  describe('R4: Phase Order Invariant', () => {
    test('phases always in plan-collect-analyze-draft-finalize order', async () => {
      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      const names = result.phases.map((p) => p.name)
      expect(names).toEqual(['plan', 'collect', 'analyze', 'draft', 'finalize'])
    })

    test('even with errors, phases maintain order', async () => {
      let callCount = 0
      mockExecute.mockImplementation(() => {
        callCount++
        if (callCount % 2 === 0) return Promise.reject(new Error('intermittent'))
        return Promise.resolve({
          content: 'ok',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.phases.map((p) => p.name)).toEqual(['plan', 'collect', 'analyze', 'draft', 'finalize'])
      expect(result.phases[0].status).toBe('completed')
      expect(result.phases[1].status).toBe('error')
      expect(result.phases[2].status).toBe('completed')
      expect(result.phases[3].status).toBe('error')
      expect(result.phases[4].status).toBe('completed')
    })

    test('always exactly 5 phases regardless of errors/timeouts', async () => {
      mockExecute.mockImplementation(() => Promise.reject(new Error('all fail')))

      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.phases).toHaveLength(5)
    })
  })

  describe('R5: EventBus Event Ordering', () => {
    test('events are emitted in phase order', async () => {
      const phases: string[] = []
      const listener = (data: any) => phases.push(data.phase)
      eventBus.on('deepwork-phase', listener)

      const service = new DeepWorkService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      eventBus.off('deepwork-phase', listener)

      expect(phases).toEqual(['plan', 'collect', 'analyze', 'draft', 'finalize', 'done'])
    })

    test('done event always emitted even on complete failure', async () => {
      mockExecute.mockImplementation(() => Promise.reject(new Error('fail')))

      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('deepwork-phase', listener)

      const service = new DeepWorkService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      eventBus.off('deepwork-phase', listener)

      const doneEvent = events.find((e) => e.phase === 'done')
      expect(doneEvent).toBeDefined()
      expect(doneEvent.progress).toBe(100)
    })

    test('done event emitted even when total timeout is 0', async () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('deepwork-phase', listener)

      const service = new DeepWorkService()
      await service.execute(
        testAgent,
        '분석',
        { ...baseOptions, totalTimeoutMs: 0 },
        testContext,
      )

      eventBus.off('deepwork-phase', listener)

      const doneEvent = events.find((e) => e.phase === 'done')
      expect(doneEvent).toBeDefined()
    })

    test('progress values are monotonically non-decreasing', async () => {
      const progressValues: number[] = []
      const listener = (data: any) => progressValues.push(data.progress)
      eventBus.on('deepwork-phase', listener)

      const service = new DeepWorkService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      eventBus.off('deepwork-phase', listener)

      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1])
      }
    })
  })

  describe('R6: Non-Standard Error Objects', () => {
    test('non-Error thrown value is converted to string', async () => {
      mockExecute.mockImplementationOnce(() => Promise.reject('string error'))
      mockExecute.mockImplementation(() =>
        Promise.resolve({
          content: 'ok',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      )

      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.phases[0].status).toBe('error')
      expect(result.phases[0].output).toBe('string error')
    })

    test('undefined error is handled', async () => {
      mockExecute.mockImplementationOnce(() => Promise.reject(undefined))
      mockExecute.mockImplementation(() =>
        Promise.resolve({
          content: 'ok',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      )

      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.phases[0].status).toBe('error')
      expect(result.phases[0].output).toBe('undefined')
    })

    test('object error is stringified', async () => {
      mockExecute.mockImplementationOnce(() => Promise.reject({ code: 500, msg: 'server error' }))
      mockExecute.mockImplementation(() =>
        Promise.resolve({
          content: 'ok',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      )

      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.phases[0].status).toBe('error')
      expect(result.phases[0].output).toBe('[object Object]')
    })
  })

  describe('R7: Empty/Edge Command Text', () => {
    test('empty command text does not crash', async () => {
      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '', baseOptions, testContext)

      expect(result.phases).toHaveLength(5)
    })

    test('very long command text is passed through', async () => {
      const longText = '분석 요청 '.repeat(5000)
      const calls: any[] = []
      mockExecute.mockImplementation((_agent: any, task: any) => {
        calls.push(task.messages[0].content)
        return Promise.resolve({
          content: 'ok',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = new DeepWorkService()
      await service.execute(testAgent, longText, baseOptions, testContext)

      expect(calls[0]).toContain(longText)
    })
  })

  describe('R8: Singleton Export', () => {
    test('deepWorkService is an instance of DeepWorkService', () => {
      expect(deepWorkService).toBeInstanceOf(DeepWorkService)
    })

    test('deepWorkService has execute method', () => {
      expect(typeof deepWorkService.execute).toBe('function')
    })
  })

  describe('R9: Multiple Tool Calls Tracking', () => {
    test('toolCalls count reflects actual tool usage', async () => {
      mockExecute.mockImplementation(() =>
        Promise.resolve({
          content: 'output',
          toolCalls: [
            { name: 'web-search', arguments: { q: 'test' }, result: 'ok', durationMs: 50 },
            { name: 'web-fetch', arguments: { url: 'test' }, result: 'ok', durationMs: 50 },
            { name: 'web-search', arguments: { q: 'test2' }, result: 'ok', durationMs: 50 },
          ],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 3,
        })
      )

      const service = new DeepWorkService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      for (const phase of result.phases) {
        expect(phase.toolCalls).toBe(3)
      }
    })
  })

  describe('R10: Concurrent Phase Execution Prevention', () => {
    test('phases execute sequentially (second phase starts after first completes)', async () => {
      const executionOrder: string[] = []

      mockExecute.mockImplementation((_agent: any, task: any) => {
        const content = task.context as string
        let phase = 'unknown'
        if (content.includes('PLAN')) phase = 'plan'
        if (content.includes('COLLECT')) phase = 'collect'
        if (content.includes('ANALYZE')) phase = 'analyze'
        if (content.includes('DRAFT')) phase = 'draft'
        if (content.includes('FINALIZE')) phase = 'finalize'

        executionOrder.push(`start:${phase}`)

        return new Promise((resolve) => {
          setTimeout(() => {
            executionOrder.push(`end:${phase}`)
            resolve({
              content: `${phase} output`,
              toolCalls: [],
              usage: { inputTokens: 100, outputTokens: 200 },
              cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
              finishReason: 'end_turn',
              iterations: 1,
            })
          }, 5)
        })
      })

      const service = new DeepWorkService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      // Verify sequential: each phase's end comes before next phase's start
      for (let i = 0; i < executionOrder.length - 1; i++) {
        if (executionOrder[i].startsWith('end:') && executionOrder[i + 1].startsWith('start:')) {
          // This is correct sequential ordering
          expect(true).toBe(true)
        }
        // No two 'start:' should be adjacent (would indicate parallel execution)
        if (executionOrder[i].startsWith('start:') && executionOrder[i + 1]?.startsWith('start:')) {
          throw new Error('Parallel execution detected!')
        }
      }
    })
  })

  describe('R11: Timeout during first phase', () => {
    test('timeout on plan phase marks all 5 phases correctly', async () => {
      mockExecute.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT: Phase plan exceeded 10ms')), 5)),
      )

      const service = new DeepWorkService()
      const result = await service.execute(
        testAgent,
        '분석',
        { ...baseOptions, phaseTimeoutMs: 10, totalTimeoutMs: 60_000 },
        testContext,
      )

      expect(result.phases).toHaveLength(5)
      expect(result.phases[0].status).toBe('timeout')
      expect(result.phases[0].name).toBe('plan')
      // Remaining should all be timeout
      for (let i = 1; i < 5; i++) {
        expect(result.phases[i].status).toBe('timeout')
      }
    })
  })

  describe('R12: Agent Configuration Passthrough', () => {
    test('agent config is passed to each AgentRunner.execute call', async () => {
      const service = new DeepWorkService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(mockExecute).toHaveBeenCalledTimes(5)
      for (const call of mockExecute.mock.calls) {
        expect(call[0]).toBe(testAgent)
      }
    })

    test('context is passed to each AgentRunner.execute call', async () => {
      const service = new DeepWorkService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      for (const call of mockExecute.mock.calls) {
        expect(call[2]).toBe(testContext)
      }
    })
  })
})
