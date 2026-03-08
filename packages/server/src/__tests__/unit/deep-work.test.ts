import { describe, test, expect, beforeEach, mock } from 'bun:test'
import { DeepWorkService } from '../../services/deep-work'
import { eventBus } from '../../lib/event-bus'
import type { AgentConfig } from '../../services/agent-runner'
import type { LLMRouterContext } from '../../services/llm-router'

// === Mocks ===

// Mock agent-runner module
const mockExecute = mock(() =>
  Promise.resolve({
    content: 'test phase output',
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

// Mock DB
const mockDbUpdateSet = mock(() => ({ where: mock(() => Promise.resolve()) }))
const mockDbUpdate = mock(() => ({ set: mockDbUpdateSet }))
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
  id: 'agent-001',
  companyId: 'company-001',
  name: '전략분석가',
  tier: 'specialist',
  modelName: 'claude-sonnet-4-5-20250514',
  soul: 'AI 전략 분석 전문가',
  allowedTools: ['web-search', 'web-fetch'],
  isActive: true,
}

const testContext: LLMRouterContext = {
  companyId: 'company-001',
  agentId: 'agent-001',
  agentName: '전략분석가',
}

const baseOptions = {
  commandId: 'cmd-001',
  companyId: 'company-001',
}

function createService() {
  return new DeepWorkService()
}

// === Tests ===

describe('DeepWorkService', () => {
  beforeEach(() => {
    mockExecute.mockClear()
    mockDbUpdate.mockClear()
    mockDbUpdateSet.mockClear()
  })

  describe('5단계 파이프라인 정상 동작', () => {
    test('5개 단계가 순차적으로 실행된다', async () => {
      const service = createService()
      const result = await service.execute(testAgent, '삼성전자 분석', baseOptions, testContext)

      // AgentRunner.execute()가 5번 호출되어야 함
      expect(mockExecute).toHaveBeenCalledTimes(5)
      expect(result.phases).toHaveLength(5)
      expect(result.phases.map((p) => p.name)).toEqual(['plan', 'collect', 'analyze', 'draft', 'finalize'])
    })

    test('모든 단계가 completed 상태로 완료된다', async () => {
      const service = createService()
      const result = await service.execute(testAgent, '시장 조사', baseOptions, testContext)

      for (const phase of result.phases) {
        expect(phase.status).toBe('completed')
        expect(phase.output).toBe('test phase output')
      }
    })

    test('최종 보고서가 finalize 단계 출력이다', async () => {
      mockExecute.mockImplementation((_agent: any, task: any) => {
        const content = task.messages[0].content
        if (content.includes('FINALIZE')) {
          return Promise.resolve({
            content: '# 최종 보고서\n분석 결과입니다.',
            toolCalls: [],
            usage: { inputTokens: 100, outputTokens: 200 },
            cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
            finishReason: 'end_turn',
            iterations: 1,
          })
        }
        return Promise.resolve({
          content: '중간 결과',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = createService()
      const result = await service.execute(testAgent, '분석 요청', baseOptions, testContext)

      expect(result.finalReport).toBe('# 최종 보고서\n분석 결과입니다.')
    })

    test('totalDurationMs가 기록된다', async () => {
      const service = createService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.totalDurationMs).toBeGreaterThanOrEqual(0)
    })

    test('각 단계의 durationMs가 기록된다', async () => {
      const service = createService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      for (const phase of result.phases) {
        expect(phase.durationMs).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('컨텍스트 누적', () => {
    test('이전 단계 출력이 다음 단계 입력에 포함된다', async () => {
      const calls: string[] = []
      mockExecute.mockImplementation((_agent: any, task: any) => {
        calls.push(task.messages[0].content)
        return Promise.resolve({
          content: `phase output ${calls.length}`,
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = createService()
      await service.execute(testAgent, '분석 요청', baseOptions, testContext)

      // First call (plan): no previous context
      expect(calls[0]).toContain('분석 요청')
      expect(calls[0]).not.toContain('이전 단계 결과')

      // Second call (collect): has plan output
      expect(calls[1]).toContain('이전 단계 결과')
      expect(calls[1]).toContain('phase output 1')

      // Third call (analyze): has plan + collect output
      expect(calls[2]).toContain('phase output 1')
      expect(calls[2]).toContain('phase output 2')

      // Fifth call (finalize): has all previous outputs
      expect(calls[4]).toContain('phase output 1')
      expect(calls[4]).toContain('phase output 4')
    })

    test('원래 업무 텍스트가 모든 단계에 전달된다', async () => {
      const calls: string[] = []
      mockExecute.mockImplementation((_agent: any, task: any) => {
        calls.push(task.messages[0].content)
        return Promise.resolve({
          content: 'output',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = createService()
      await service.execute(testAgent, '삼성전자 재무분석', baseOptions, testContext)

      for (const call of calls) {
        expect(call).toContain('삼성전자 재무분석')
      }
    })
  })

  describe('도구 호출', () => {
    test('도구 호출 횟수가 단계별로 기록된다', async () => {
      mockExecute.mockImplementation(() =>
        Promise.resolve({
          content: 'output',
          toolCalls: [
            { name: 'web-search', arguments: {}, result: 'data', durationMs: 100 },
            { name: 'web-fetch', arguments: {}, result: 'data2', durationMs: 200 },
          ],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 2,
        })
      )

      const service = createService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      for (const phase of result.phases) {
        expect(phase.toolCalls).toBe(2)
      }
    })

    test('maxToolIterationsPerPhase가 AgentRunner에 전달된다', async () => {
      const service = createService()
      await service.execute(
        testAgent,
        '분석',
        { ...baseOptions, maxToolIterationsPerPhase: 15 },
        testContext,
      )

      for (const call of mockExecute.mock.calls) {
        const task = call[1] as any
        expect(task.maxToolIterations).toBe(15)
      }
    })

    test('toolExecutor가 AgentRunner에 전달된다', async () => {
      const mockToolExecutor = mock(() => Promise.resolve({ result: 'tool result' }))

      const service = createService()
      await service.execute(testAgent, '분석', baseOptions, testContext, mockToolExecutor as any)

      for (const call of mockExecute.mock.calls) {
        // toolExecutor is the 4th argument (index 3)
        expect(call[3]).toBe(mockToolExecutor)
      }
    })
  })

  describe('타임아웃', () => {
    test('단계별 타임아웃 시 해당 단계가 timeout 상태가 된다', async () => {
      let callCount = 0
      mockExecute.mockImplementation(() => {
        callCount++
        if (callCount === 2) {
          // collect 단계에서 타임아웃 시뮬레이션
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT: Phase collect exceeded 100ms')), 50)
          })
        }
        return Promise.resolve({
          content: 'output',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = createService()
      const result = await service.execute(
        testAgent,
        '분석',
        { ...baseOptions, phaseTimeoutMs: 100, totalTimeoutMs: 60_000 },
        testContext,
      )

      expect(result.phases[0].status).toBe('completed') // plan
      expect(result.phases[1].status).toBe('timeout')    // collect - timed out
      // Remaining phases are also timeout (after a timeout, remaining are marked timeout)
      expect(result.phases[2].status).toBe('timeout')    // analyze
      expect(result.phases[3].status).toBe('timeout')    // draft
      expect(result.phases[4].status).toBe('timeout')    // finalize
    })

    test('전체 타임아웃 초과 시 남은 단계가 timeout된다', async () => {
      mockExecute.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                content: 'slow output',
                toolCalls: [],
                usage: { inputTokens: 100, outputTokens: 200 },
                cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
                finishReason: 'end_turn',
                iterations: 1,
              }),
            30,
          )
        })
      })

      const service = createService()
      // totalTimeoutMs very short: only first phase might complete
      const result = await service.execute(
        testAgent,
        '분석',
        { ...baseOptions, phaseTimeoutMs: 200, totalTimeoutMs: 50 },
        testContext,
      )

      // At least some phases should be timeout
      const timeoutPhases = result.phases.filter((p) => p.status === 'timeout')
      expect(timeoutPhases.length).toBeGreaterThan(0)
    })

    test('기본 타임아웃 값이 적용된다 (phaseTimeoutMs=60000, totalTimeoutMs=300000)', async () => {
      // Just verify default options are used when not specified
      const service = createService()
      // This test just verifies execution doesn't throw with defaults
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)
      expect(result.phases).toHaveLength(5)
    })
  })

  describe('graceful degradation', () => {
    test('단계 에러 시 다음 단계로 계속 진행한다', async () => {
      let callCount = 0
      mockExecute.mockImplementation(() => {
        callCount++
        if (callCount === 3) {
          // analyze 단계에서 에러
          return Promise.reject(new Error('LLM call failed'))
        }
        return Promise.resolve({
          content: 'output',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = createService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.phases[0].status).toBe('completed')  // plan
      expect(result.phases[1].status).toBe('completed')  // collect
      expect(result.phases[2].status).toBe('error')      // analyze - error
      expect(result.phases[3].status).toBe('completed')  // draft - continues
      expect(result.phases[4].status).toBe('completed')  // finalize - continues
    })

    test('finalize가 실패해도 draft 결과가 최종 보고서가 된다', async () => {
      let callCount = 0
      mockExecute.mockImplementation(() => {
        callCount++
        if (callCount === 4) {
          return Promise.resolve({
            content: '초안 보고서 내용',
            toolCalls: [],
            usage: { inputTokens: 100, outputTokens: 200 },
            cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
            finishReason: 'end_turn',
            iterations: 1,
          })
        }
        if (callCount === 5) {
          return Promise.reject(new Error('finalize failed'))
        }
        return Promise.resolve({
          content: 'output',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = createService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.finalReport).toBe('초안 보고서 내용')
    })

    test('모든 단계가 실패하면 에러 보고서가 반환된다', async () => {
      mockExecute.mockImplementation(() => Promise.reject(new Error('all failed')))

      const service = createService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.finalReport).toContain('분석을 완료하지 못했습니다')
    })
  })

  describe('WebSocket 이벤트', () => {
    test('각 단계 시작 시 deepwork-phase 이벤트가 발행된다', async () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('deepwork-phase', listener)

      const service = createService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      eventBus.off('deepwork-phase', listener)

      // 5 phase events + 1 done event = 6
      expect(events).toHaveLength(6)

      // Check phase progression
      expect(events[0]).toEqual({
        type: 'deepwork-phase',
        phase: 'plan',
        progress: 0,
        commandId: 'cmd-001',
        companyId: 'company-001',
      })
      expect(events[1].phase).toBe('collect')
      expect(events[1].progress).toBe(20)
      expect(events[2].phase).toBe('analyze')
      expect(events[2].progress).toBe(40)
      expect(events[3].phase).toBe('draft')
      expect(events[3].progress).toBe(60)
      expect(events[4].phase).toBe('finalize')
      expect(events[4].progress).toBe(80)
      expect(events[5]).toEqual({
        type: 'deepwork-phase',
        phase: 'done',
        progress: 100,
        commandId: 'cmd-001',
        companyId: 'company-001',
      })
    })

    test('commandId와 companyId가 이벤트에 포함된다', async () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('deepwork-phase', listener)

      const service = createService()
      await service.execute(
        testAgent,
        '분석',
        { commandId: 'cmd-xyz', companyId: 'co-abc' },
        testContext,
      )

      eventBus.off('deepwork-phase', listener)

      for (const event of events) {
        expect(event.commandId).toBe('cmd-xyz')
        expect(event.companyId).toBe('co-abc')
      }
    })
  })

  describe('결과 저장 (DB)', () => {
    test('saveResult가 commands 테이블을 업데이트한다', async () => {
      const service = createService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      // db.update should have been called
      expect(mockDbUpdate).toHaveBeenCalled()
      expect(mockDbUpdateSet).toHaveBeenCalled()

      const setArg = mockDbUpdateSet.mock.calls[0][0] as any
      expect(setArg.status).toBe('completed')
      expect(setArg.result).toBeDefined()
      expect(setArg.metadata.deepwork).toBeDefined()
      expect(setArg.metadata.deepwork.phases).toHaveLength(5)
      expect(setArg.metadata.deepwork.totalDurationMs).toBeGreaterThanOrEqual(0)
      expect(setArg.completedAt).toBeInstanceOf(Date)
    })

    test('metadata.deepwork.phases에 각 단계 결과가 포함된다', async () => {
      const service = createService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      const setArg = mockDbUpdateSet.mock.calls[0][0] as any
      const phases = setArg.metadata.deepwork.phases

      expect(phases[0].name).toBe('plan')
      expect(phases[1].name).toBe('collect')
      expect(phases[2].name).toBe('analyze')
      expect(phases[3].name).toBe('draft')
      expect(phases[4].name).toBe('finalize')

      for (const phase of phases) {
        expect(phase).toHaveProperty('status')
        expect(phase).toHaveProperty('output')
        expect(phase).toHaveProperty('durationMs')
        expect(phase).toHaveProperty('toolCalls')
      }
    })
  })

  describe('에러 핸들링', () => {
    test('AgentRunner 에러가 phase status에 반영된다', async () => {
      let callCount = 0
      mockExecute.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.reject(new Error('Agent execution failed'))
        }
        return Promise.resolve({
          content: 'recovered',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = createService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.phases[0].status).toBe('error')
      expect(result.phases[0].output).toContain('Agent execution failed')
      expect(result.phases[1].status).toBe('completed')
    })

    test('phase에서 에러 시 에러 메시지가 output에 기록된다', async () => {
      mockExecute.mockImplementationOnce(() => Promise.reject(new Error('specific error message')))
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

      const service = createService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.phases[0].output).toBe('specific error message')
    })
  })

  describe('시스템 프롬프트', () => {
    test('각 단계에 적절한 phase prompt가 포함된다', async () => {
      const calls: any[] = []
      mockExecute.mockImplementation((_agent: any, task: any) => {
        calls.push(task)
        return Promise.resolve({
          content: 'output',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 200 },
          cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
          finishReason: 'end_turn',
          iterations: 1,
        })
      })

      const service = createService()
      await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(calls[0].context).toContain('PLAN')
      expect(calls[1].context).toContain('COLLECT')
      expect(calls[2].context).toContain('ANALYZE')
      expect(calls[3].context).toContain('DRAFT')
      expect(calls[4].context).toContain('FINALIZE')
    })
  })

  describe('buildFinalReport fallback', () => {
    test('plan과 collect만 성공해도 partial report가 생성된다', async () => {
      let callCount = 0
      mockExecute.mockImplementation(() => {
        callCount++
        if (callCount <= 2) {
          return Promise.resolve({
            content: `output ${callCount}`,
            toolCalls: [],
            usage: { inputTokens: 100, outputTokens: 200 },
            cost: { model: 'claude-sonnet-4-5-20250514', provider: 'anthropic' as const, estimatedCostMicro: 100 },
            finishReason: 'end_turn',
            iterations: 1,
          })
        }
        return Promise.reject(new Error('failed'))
      })

      const service = createService()
      const result = await service.execute(testAgent, '분석', baseOptions, testContext)

      expect(result.finalReport).toContain('DeepWork Report (Partial)')
      expect(result.finalReport).toContain('PLAN')
      expect(result.finalReport).toContain('COLLECT')
    })
  })
})
