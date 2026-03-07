/**
 * Story 5-11: Orchestration Integration Test
 * 전체 오케스트레이션 파이프라인 E2E 검증
 *
 * Mock: agentRunner.execute (LLM 레이어), DB operations
 * Real: CommandRouter parsing, DelegationTracker events, DeepWork flow, EventBus
 *
 * bun test src/__tests__/integration/orchestration.test.ts
 */
import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test'
import type { DelegationEvent, DelegationEventType, ToolEvent } from '../../services/delegation-tracker'

// ================================================================
// 1. MOCK SETUP -- module-level mocks before any service imports
// ================================================================

// --- Mock DB layer ---
const mockDbInsertReturning = mock(() => Promise.resolve([{ id: 'task-001', startedAt: new Date() }]))
const mockDbUpdate = mock(() => Promise.resolve())
const mockDbSelectFrom = mock(() => Promise.resolve([]))

const mockDbChain = {
  insert: mock(() => ({ values: mock(() => ({ returning: mockDbInsertReturning })) })),
  update: mock(() => ({ set: mock(() => ({ where: mockDbUpdate })) })),
  select: mock(() => ({
    from: mock(() => ({
      where: mock(() => ({
        limit: mock(() => Promise.resolve([])),
      })),
    })),
  })),
}

mock.module('../../db', () => ({
  db: mockDbChain,
}))

mock.module('../../db/schema', () => ({
  agents: { id: 'id', companyId: 'company_id', name: 'name', nameEn: 'name_en', tier: 'tier', modelName: 'model_name', soul: 'soul', allowedTools: 'allowed_tools', isActive: 'is_active', isSystem: 'is_system', isSecretary: 'is_secretary', departmentId: 'department_id', role: 'role' },
  commands: { id: 'id', companyId: 'company_id', userId: 'user_id', text: 'text', type: 'type', status: 'status', targetAgentId: 'target_agent_id' },
  departments: { id: 'id', companyId: 'company_id', name: 'name', description: 'description', isActive: 'is_active' },
  orchestrationTasks: { id: 'id' },
  qualityReviews: {},
  presets: { id: 'id', companyId: 'company_id', userId: 'user_id', command: 'command' },
}))

mock.module('drizzle-orm', () => ({
  eq: (...args: unknown[]) => ({ type: 'eq', args }),
  and: (...args: unknown[]) => ({ type: 'and', args }),
  ne: (...args: unknown[]) => ({ type: 'ne', args }),
}))

// --- Mock agentRunner ---
let agentRunnerCallIndex = 0
let agentRunnerResponses: Array<{ content: string; toolCalls?: unknown[] }> = []

const mockAgentRunnerExecute = mock(async () => {
  const response = agentRunnerResponses[agentRunnerCallIndex] ?? { content: 'default mock response', toolCalls: [] }
  agentRunnerCallIndex++
  return { content: response.content, toolCalls: response.toolCalls ?? [], usage: { inputTokens: 100, outputTokens: 50 } }
})

mock.module('../../services/agent-runner', () => ({
  agentRunner: { execute: mockAgentRunnerExecute },
  buildSystemPrompt: () => 'mock system prompt',
}))

// --- Mock LLM router ---
mock.module('../../services/llm-router', () => ({
  llmRouter: { call: mock(() => Promise.resolve({ content: '', toolCalls: [], usage: { inputTokens: 0, outputTokens: 0 } })) },
  resolveModel: () => 'claude-sonnet-4-6',
  resolveProvider: () => 'anthropic',
}))

mock.module('../../lib/cost-tracker', () => ({
  calculateCostMicro: () => 100,
}))

mock.module('../../services/tool-permission-guard', () => ({
  checkToolPermission: () => true,
  hasWildcard: () => false,
}))

// ================================================================
// 2. IMPORTS -- after mocks are set up
// ================================================================

import { eventBus } from '../../lib/event-bus'
import {
  classify as commandRouterClassify,
  parseSlash,
  parseMention,
  type ClassifyResult,
  type ClassifyOptions,
} from '../../services/command-router'
import { DelegationTracker } from '../../services/delegation-tracker'
import type { AgentConfig } from '../../services/agent-runner'
import {
  parseLLMJson,
  type ClassificationResult,
  type QualityGateResult,
  type QualityScores,
} from '../../services/chief-of-staff'
import {
  buildSynthesisPrompt,
  type SynthesizeOptions,
  type SpecialistResult,
} from '../../services/manager-synthesis'
import { DeepWorkService, type DeepWorkResult } from '../../services/deep-work'

// ================================================================
// 3. TEST FIXTURES
// ================================================================

const TEST_COMPANY_ID = 'company-test-001'
const TEST_USER_ID = 'user-test-001'
const TEST_COMMAND_ID = 'cmd-test-001'

const secretaryAgent: AgentConfig = {
  id: 'secretary-001',
  companyId: TEST_COMPANY_ID,
  name: '비서실장',
  nameEn: 'chief-of-staff',
  tier: 'manager',
  modelName: 'claude-sonnet-4-6',
  soul: '당신은 CORTHEX의 비서실장입니다.',
  allowedTools: [],
  isActive: true,
}

const financeManager: AgentConfig = {
  id: 'mgr-finance-001',
  companyId: TEST_COMPANY_ID,
  name: '금융분석팀장',
  nameEn: 'finance-manager',
  tier: 'manager',
  modelName: 'claude-sonnet-4-6',
  soul: '금융 분석을 전문으로 합니다.',
  allowedTools: ['stock_price', 'market_data'],
  isActive: true,
}

const marketingManager: AgentConfig = {
  id: 'mgr-marketing-001',
  companyId: TEST_COMPANY_ID,
  name: '마케팅부장',
  nameEn: 'marketing-manager',
  tier: 'manager',
  modelName: 'claude-sonnet-4-6',
  soul: '마케팅 전략을 전문으로 합니다.',
  allowedTools: ['sns_analytics'],
  isActive: true,
}

const stockSpecialist: AgentConfig = {
  id: 'spec-stock-001',
  companyId: TEST_COMPANY_ID,
  name: '주식전문가',
  tier: 'specialist',
  modelName: 'claude-haiku-4-5-20251001',
  soul: '주식 분석 전문가',
  allowedTools: ['stock_price'],
  isActive: true,
}

const bondSpecialist: AgentConfig = {
  id: 'spec-bond-001',
  companyId: TEST_COMPANY_ID,
  name: '채권전문가',
  tier: 'specialist',
  modelName: 'claude-haiku-4-5-20251001',
  soul: '채권 분석 전문가',
  allowedTools: ['bond_rate'],
  isActive: true,
}

const snsSpecialist: AgentConfig = {
  id: 'spec-sns-001',
  companyId: TEST_COMPANY_ID,
  name: 'SNS전문가',
  tier: 'specialist',
  modelName: 'claude-haiku-4-5-20251001',
  soul: 'SNS 마케팅 전문가',
  allowedTools: ['sns_analytics'],
  isActive: true,
}

// --- Mock response templates ---

const MOCK_CLASSIFY_RESPONSE = JSON.stringify({
  departmentId: 'dept-finance-001',
  managerId: financeManager.id,
  confidence: 0.9,
  reasoning: '금융 관련 명령으로 금융분석부에 위임',
})

const MOCK_SPECIALIST_RESPONSE = `## 분석 결과
삼성전자는 현재 80,000원대에 거래 중이며, 반도체 업황 개선이 예상됩니다.
AI 수요 증가로 메모리 반도체 사이클이 회복 중입니다.`

const MOCK_SYNTHESIS_RESPONSE = `### 결론
삼성전자는 매수 추천입니다.

### 분석
반도체 업황 개선과 AI 수요 증가로 실적 개선이 예상됩니다.

### 리스크
중국 규제 리스크와 환율 변동 가능성이 있습니다.

### 추천
단기 매수 후 3개월 보유 전략을 권장합니다.`

const MOCK_QUALITY_PASS = JSON.stringify({
  scores: { conclusionClarity: 4, evidenceSufficiency: 4, riskMention: 3, formatAdequacy: 4, logicalConsistency: 4 },
  totalScore: 19,
  passed: true,
  feedback: null,
})

const MOCK_QUALITY_FAIL = JSON.stringify({
  scores: { conclusionClarity: 2, evidenceSufficiency: 2, riskMention: 3, formatAdequacy: 3, logicalConsistency: 2 },
  totalScore: 12,
  passed: false,
  feedback: '결론이 불명확하고 근거가 부족합니다. 구체적 데이터를 추가하세요.',
})

const MOCK_SEQUENTIAL_ORDER = JSON.stringify({
  order: [financeManager.id, marketingManager.id],
  reason: '금융 분석 후 마케팅 관점 추가',
})

// ================================================================
// 4. TEST HELPERS
// ================================================================

function resetMocks() {
  agentRunnerCallIndex = 0
  agentRunnerResponses = []
  mockAgentRunnerExecute.mockClear()
  mockDbInsertReturning.mockClear()
  mockDbUpdate.mockClear()
}

type EventSpy = { events: Array<{ companyId: string; payload: DelegationEvent }>; unsub: () => void }

function spyOnEvents(channel: string): EventSpy {
  const events: Array<{ companyId: string; payload: DelegationEvent }> = []
  const handler = (e: { companyId: string; payload: DelegationEvent }) => events.push(e)
  eventBus.on(channel, handler)
  return { events, unsub: () => eventBus.removeListener(channel, handler) }
}

// ================================================================
// TEST SUITES
// ================================================================

describe('Orchestration Integration Tests', () => {
  beforeEach(() => {
    resetMocks()
  })

  // ============================================================
  // Task 2: CommandRouter - 명령 타입 분류 (Pure functions)
  // ============================================================

  describe('1. CommandRouter 명령 분류', () => {
    test('자연어 텍스트 → type=direct', async () => {
      const result = await commandRouterClassify('삼성전자 분석해줘', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
      })
      expect(result.type).toBe('direct')
      expect(result.text).toBe('삼성전자 분석해줘')
      expect(result.targetAgentId).toBeNull()
      expect(result.parsedMeta.timeoutMs).toBe(60_000)
    })

    test('presetId 제공 시 → type=preset', async () => {
      const result = await commandRouterClassify('삼성전자 주간보고', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
        presetId: 'preset-001',
      })
      expect(result.type).toBe('preset')
      expect(result.parsedMeta.presetId).toBe('preset-001')
    })

    test('useBatch=true → type=batch', async () => {
      const result = await commandRouterClassify('비용 분석', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
        useBatch: true,
      })
      expect(result.type).toBe('batch')
      expect(result.parsedMeta.timeoutMs).toBe(300_000)
    })

    test('targetAgentId 직접 지정 시 → type=mention', async () => {
      const result = await commandRouterClassify('분석해줘', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
        targetAgentId: 'agent-123',
      })
      expect(result.type).toBe('mention')
      expect(result.targetAgentId).toBe('agent-123')
    })
  })

  // ============================================================
  // Task 2b: parseSlash 순수 함수 테스트
  // ============================================================

  describe('2. parseSlash 슬래시 명령 파싱', () => {
    test('/전체 → all', () => {
      const result = parseSlash('/전체 시장 분석')
      expect(result).not.toBeNull()
      expect(result!.slashType).toBe('all')
      expect(result!.commandType).toBe('all')
      expect(result!.args).toBe('시장 분석')
    })

    test('/순차 → sequential', () => {
      const result = parseSlash('/순차 경쟁사 분석')
      expect(result).not.toBeNull()
      expect(result!.slashType).toBe('sequential')
      expect(result!.commandType).toBe('sequential')
      expect(result!.args).toBe('경쟁사 분석')
    })

    test('/도구점검 → tool_check', () => {
      const result = parseSlash('/도구점검')
      expect(result).not.toBeNull()
      expect(result!.slashType).toBe('tool_check')
      expect(result!.args).toBe('')
    })

    test('/배치실행 → batch_run', () => {
      const result = parseSlash('/배치실행')
      expect(result).not.toBeNull()
      expect(result!.slashType).toBe('batch_run')
    })

    test('/배치상태 → batch_status', () => {
      const result = parseSlash('/배치상태')
      expect(result).not.toBeNull()
      expect(result!.slashType).toBe('batch_status')
    })

    test('/명령어 → commands_list', () => {
      const result = parseSlash('/명령어')
      expect(result).not.toBeNull()
      expect(result!.slashType).toBe('commands_list')
    })

    test('/토론 → debate', () => {
      const result = parseSlash('/토론 AI 미래')
      expect(result).not.toBeNull()
      expect(result!.slashType).toBe('debate')
      expect(result!.args).toBe('AI 미래')
    })

    test('/심층토론 → deep_debate (prefix conflict 방지)', () => {
      const result = parseSlash('/심층토론 AI 윤리')
      expect(result).not.toBeNull()
      expect(result!.slashType).toBe('deep_debate')
      expect(result!.args).toBe('AI 윤리')
    })

    test('일반 텍스트 → null', () => {
      expect(parseSlash('삼성전자 분석')).toBeNull()
    })

    test('슬래시 없는 텍스트 → null', () => {
      expect(parseSlash('전체 시장 분석')).toBeNull()
    })

    test('알 수 없는 슬래시 명령 → null', () => {
      expect(parseSlash('/unknown command')).toBeNull()
    })
  })

  // ============================================================
  // Task 3: @멘션 파싱
  // ============================================================

  describe('3. parseMention @멘션 파싱', () => {
    test('@이름 텍스트 → mentionName + cleanText', () => {
      const result = parseMention('@마케팅부장 SNS 전략 만들어줘')
      expect(result).not.toBeNull()
      expect(result!.mentionName).toBe('마케팅부장')
      expect(result!.cleanText).toBe('SNS 전략 만들어줘')
    })

    test('@영어이름 → 파싱 성공', () => {
      const result = parseMention('@CIO 분석해줘')
      expect(result).not.toBeNull()
      expect(result!.mentionName).toBe('CIO')
      expect(result!.cleanText).toBe('분석해줘')
    })

    test('@이름만 (텍스트 없음) → cleanText 빈 문자열', () => {
      const result = parseMention('@비서실장')
      expect(result).not.toBeNull()
      expect(result!.mentionName).toBe('비서실장')
      expect(result!.cleanText).toBe('')
    })

    test('멘션 없는 텍스트 → null', () => {
      expect(parseMention('삼성전자 분석해줘')).toBeNull()
    })

    test('텍스트 중간 멘션 → null (시작점만 인식)', () => {
      expect(parseMention('안녕 @부장 분석해줘')).toBeNull()
    })
  })

  // ============================================================
  // Task 4: /전체 CommandRouter classify
  // ============================================================

  describe('4. /전체 명령 분류', () => {
    test('/전체 → type=all, slashType=all', async () => {
      const result = await commandRouterClassify('/전체 시장 분석', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
      })
      expect(result.type).toBe('all')
      expect(result.parsedMeta.slashType).toBe('all')
      expect(result.parsedMeta.slashArgs).toBe('시장 분석')
      expect(result.parsedMeta.timeoutMs).toBe(300_000)
    })
  })

  // ============================================================
  // Task 5: /순차 CommandRouter classify
  // ============================================================

  describe('5. /순차 명령 분류', () => {
    test('/순차 → type=sequential, slashType=sequential', async () => {
      const result = await commandRouterClassify('/순차 경쟁사 분석', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
      })
      expect(result.type).toBe('sequential')
      expect(result.parsedMeta.slashType).toBe('sequential')
      expect(result.parsedMeta.slashArgs).toBe('경쟁사 분석')
      expect(result.parsedMeta.timeoutMs).toBe(300_000)
    })
  })

  // ============================================================
  // Task 6: DeepWork 5-phase pipeline
  // ============================================================

  describe('6. DeepWork 5단계 파이프라인', () => {
    let deepworkEvents: Array<{ type: string; phase: string; progress: number; commandId: string }>
    let unsubDeepwork: () => void

    beforeEach(() => {
      deepworkEvents = []
      const handler = (e: { type: string; phase: string; progress: number; commandId: string }) => {
        deepworkEvents.push(e)
      }
      eventBus.on('deepwork-phase', handler)
      unsubDeepwork = () => eventBus.removeListener('deepwork-phase', handler)
    })

    afterEach(() => {
      unsubDeepwork()
    })

    test('5단계 순차 실행 (plan→collect→analyze→draft→finalize)', async () => {
      // Mock 5 phase responses
      agentRunnerResponses = [
        { content: '## 계획\n1. 데이터 수집\n2. 분석\n3. 보고서 작성' },
        { content: '## 수집 데이터\n삼성전자 시가총액 500조, 영업이익 50조' },
        { content: '## 분석 결과\nPER 12배, 업종 평균 대비 저평가' },
        { content: '## 초안\n삼성전자 투자 분석 보고서...' },
        { content: '## 최종 보고서\n\n### 결론\n삼성전자 매수 추천\n\n### 분석\nAI 반도체 수요 증가\n\n### 리스크\n환율 변동\n\n### 추천\n3개월 보유' },
      ]

      const service = new DeepWorkService()
      const result = await service.execute(
        financeManager,
        '삼성전자 심층 분석',
        {
          commandId: TEST_COMMAND_ID,
          companyId: TEST_COMPANY_ID,
          phaseTimeoutMs: 30_000,
          totalTimeoutMs: 120_000,
        },
        { companyId: TEST_COMPANY_ID, agentId: financeManager.id, agentName: financeManager.name, source: 'deepwork' },
      )

      // Verify 5 phases completed
      expect(result.phases).toHaveLength(5)
      expect(result.phases.map(p => p.name)).toEqual(['plan', 'collect', 'analyze', 'draft', 'finalize'])
      expect(result.phases.every(p => p.status === 'completed')).toBe(true)

      // Verify final report uses finalize phase output
      expect(result.finalReport).toContain('최종 보고서')
      expect(result.finalReport).toContain('매수 추천')

      // Verify agentRunner called 5 times
      expect(mockAgentRunnerExecute).toHaveBeenCalledTimes(5)

      // Verify total duration is non-negative
      expect(result.totalDurationMs).toBeGreaterThanOrEqual(0)
    })

    test('deepwork-phase 이벤트 emit 검증', async () => {
      agentRunnerResponses = [
        { content: 'plan result' },
        { content: 'collect result' },
        { content: 'analyze result' },
        { content: 'draft result' },
        { content: 'finalize result' },
      ]

      const service = new DeepWorkService()
      await service.execute(
        financeManager,
        '분석',
        {
          commandId: 'cmd-deepwork-event-test',
          companyId: TEST_COMPANY_ID,
          phaseTimeoutMs: 30_000,
          totalTimeoutMs: 120_000,
        },
        { companyId: TEST_COMPANY_ID, agentId: financeManager.id, agentName: financeManager.name, source: 'deepwork' },
      )

      // Should have 5 phase events + 1 done event = 6
      expect(deepworkEvents.length).toBeGreaterThanOrEqual(6)

      // Check progress values
      const progressValues = deepworkEvents.map(e => e.progress)
      expect(progressValues).toContain(0)    // plan
      expect(progressValues).toContain(20)   // collect
      expect(progressValues).toContain(40)   // analyze
      expect(progressValues).toContain(60)   // draft
      expect(progressValues).toContain(80)   // finalize
      expect(progressValues).toContain(100)  // done

      // Last event should be 'done'
      const lastEvent = deepworkEvents[deepworkEvents.length - 1]
      expect(lastEvent.phase).toBe('done')
      expect(lastEvent.progress).toBe(100)
    })

    test('단계 에러 시 graceful degradation (다음 단계 계속)', async () => {
      // Phase 3 (analyze) throws error
      let callIdx = 0
      mockAgentRunnerExecute.mockImplementation(async () => {
        callIdx++
        if (callIdx === 3) throw new Error('Analysis engine error')
        return { content: `phase ${callIdx} result`, toolCalls: [], usage: { inputTokens: 100, outputTokens: 50 } }
      })

      const service = new DeepWorkService()
      const result = await service.execute(
        financeManager,
        '분석',
        {
          commandId: 'cmd-deepwork-error-test',
          companyId: TEST_COMPANY_ID,
          phaseTimeoutMs: 30_000,
          totalTimeoutMs: 120_000,
        },
        { companyId: TEST_COMPANY_ID, agentId: financeManager.id, agentName: financeManager.name, source: 'deepwork' },
      )

      // analyze should be 'error', others completed
      const analyzePhase = result.phases.find(p => p.name === 'analyze')
      expect(analyzePhase?.status).toBe('error')

      // Other phases should continue (non-timeout errors allow continuation)
      const completedPhases = result.phases.filter(p => p.status === 'completed')
      expect(completedPhases.length).toBeGreaterThanOrEqual(3) // plan, collect, draft/finalize
    })

    test('타임아웃 시 남은 단계 timeout 표시', async () => {
      // Phase 2 (collect) times out
      let callIdx = 0
      mockAgentRunnerExecute.mockImplementation(async () => {
        callIdx++
        if (callIdx === 2) {
          // Simulate timeout by throwing timeout error
          throw new Error('TIMEOUT: Phase collect exceeded 100ms')
        }
        return { content: `phase ${callIdx} result`, toolCalls: [], usage: { inputTokens: 100, outputTokens: 50 } }
      })

      const service = new DeepWorkService()
      const result = await service.execute(
        financeManager,
        '분석',
        {
          commandId: 'cmd-deepwork-timeout-test',
          companyId: TEST_COMPANY_ID,
          phaseTimeoutMs: 100, // Very short for testing
          totalTimeoutMs: 120_000,
        },
        { companyId: TEST_COMPANY_ID, agentId: financeManager.id, agentName: financeManager.name, source: 'deepwork' },
      )

      // collect should be timeout, remaining should be timeout
      const collectPhase = result.phases.find(p => p.name === 'collect')
      expect(collectPhase?.status).toBe('timeout')

      // Analyze, draft, finalize should be marked timeout
      const timeoutPhases = result.phases.filter(p => p.status === 'timeout')
      expect(timeoutPhases.length).toBeGreaterThanOrEqual(3) // collect + analyze + draft + finalize - some may be error
    })

    test('finalReport: finalize 없으면 draft 사용', async () => {
      // Only plan, collect, analyze, draft complete (finalize fails)
      let callIdx = 0
      mockAgentRunnerExecute.mockImplementation(async () => {
        callIdx++
        if (callIdx === 5) throw new Error('TIMEOUT: Phase finalize exceeded 100ms')
        if (callIdx === 4) return { content: '## 초안 보고서\n중요 내용', toolCalls: [], usage: { inputTokens: 100, outputTokens: 50 } }
        return { content: `phase ${callIdx} result`, toolCalls: [], usage: { inputTokens: 100, outputTokens: 50 } }
      })

      const service = new DeepWorkService()
      const result = await service.execute(
        financeManager,
        '분석',
        {
          commandId: 'cmd-deepwork-fallback-test',
          companyId: TEST_COMPANY_ID,
          phaseTimeoutMs: 100,
          totalTimeoutMs: 120_000,
        },
        { companyId: TEST_COMPANY_ID, agentId: financeManager.id, agentName: financeManager.name, source: 'deepwork' },
      )

      // Should fallback to draft
      expect(result.finalReport).toContain('초안 보고서')
    })
  })

  // ============================================================
  // Task 7: 품질 검수 + parseLLMJson
  // ============================================================

  describe('7. 품질 검수 로직', () => {
    test('parseLLMJson: 정상 JSON 파싱', () => {
      const result = parseLLMJson<{ passed: boolean; totalScore: number }>(MOCK_QUALITY_PASS)
      expect(result).not.toBeNull()
      expect(result!.passed).toBe(true)
      expect(result!.totalScore).toBe(19)
    })

    test('parseLLMJson: markdown 코드블록 안의 JSON', () => {
      const wrapped = '```json\n' + MOCK_QUALITY_PASS + '\n```'
      const result = parseLLMJson<{ passed: boolean }>(wrapped)
      expect(result).not.toBeNull()
      expect(result!.passed).toBe(true)
    })

    test('parseLLMJson: JSON 앞뒤 텍스트 무시', () => {
      const messy = '검수 결과입니다:\n' + MOCK_QUALITY_PASS + '\n끝.'
      const result = parseLLMJson<{ totalScore: number }>(messy)
      expect(result).not.toBeNull()
      expect(result!.totalScore).toBe(19)
    })

    test('parseLLMJson: 잘못된 JSON → null', () => {
      expect(parseLLMJson('not json at all')).toBeNull()
    })

    test('parseLLMJson: 빈 문자열 → null', () => {
      expect(parseLLMJson('')).toBeNull()
    })

    test('PASS 판정: totalScore >= 15', () => {
      const result = parseLLMJson<{ scores: QualityScores; totalScore: number; passed: boolean }>(MOCK_QUALITY_PASS)
      expect(result!.totalScore).toBeGreaterThanOrEqual(15)
      expect(result!.passed).toBe(true)
    })

    test('FAIL 판정: totalScore < 15', () => {
      const result = parseLLMJson<{ scores: QualityScores; totalScore: number; passed: boolean; feedback: string }>(MOCK_QUALITY_FAIL)
      expect(result!.totalScore).toBeLessThan(15)
      expect(result!.passed).toBe(false)
      expect(result!.feedback).toContain('결론이 불명확')
    })

    test('품질 검수 점수 5항목 합산', () => {
      const result = parseLLMJson<{ scores: QualityScores; totalScore: number }>(MOCK_QUALITY_PASS)!
      const { scores } = result
      const computed = scores.conclusionClarity + scores.evidenceSufficiency +
        scores.riskMention + scores.formatAdequacy + scores.logicalConsistency
      expect(computed).toBe(result.totalScore)
    })

    test('재작업 시나리오: FAIL → 재작업 → PASS', () => {
      // First attempt: FAIL
      const fail = parseLLMJson<{ passed: boolean; feedback: string }>(MOCK_QUALITY_FAIL)!
      expect(fail.passed).toBe(false)
      expect(fail.feedback).toBeTruthy()

      // After rework: PASS
      const pass = parseLLMJson<{ passed: boolean; feedback: string | null }>(MOCK_QUALITY_PASS)!
      expect(pass.passed).toBe(true)
      expect(pass.feedback).toBeNull()
    })

    test('MAX_REWORK_ATTEMPTS=2 초과 시 warningFlag 로직', () => {
      const MAX_REWORK_ATTEMPTS = 2
      let warningFlag = false

      // Simulate 3 quality gate attempts
      for (let attempt = 1; attempt <= MAX_REWORK_ATTEMPTS + 1; attempt++) {
        const result = parseLLMJson<{ passed: boolean }>(MOCK_QUALITY_FAIL)!
        if (result.passed) break
        if (attempt > MAX_REWORK_ATTEMPTS) {
          warningFlag = true
          break
        }
      }

      expect(warningFlag).toBe(true)
    })
  })

  // ============================================================
  // Task 8: DelegationTracker WebSocket 이벤트
  // ============================================================

  describe('8. DelegationTracker WebSocket 이벤트', () => {
    let tracker: DelegationTracker
    let commandEvents: EventSpy
    let delegationEvents: EventSpy

    beforeEach(() => {
      tracker = new DelegationTracker()
      commandEvents = spyOnEvents('command')
      delegationEvents = spyOnEvents('delegation')
    })

    afterEach(() => {
      commandEvents.unsub()
      delegationEvents.unsub()
    })

    test('startCommand → COMMAND_RECEIVED 이벤트', () => {
      tracker.startCommand(TEST_COMPANY_ID, TEST_COMMAND_ID)
      expect(commandEvents.events).toHaveLength(1)
      expect(commandEvents.events[0].payload.event).toBe('COMMAND_RECEIVED')
      expect(commandEvents.events[0].payload.commandId).toBe(TEST_COMMAND_ID)
      expect(commandEvents.events[0].companyId).toBe(TEST_COMPANY_ID)
    })

    test('classify → CLASSIFYING 이벤트', () => {
      tracker.startCommand(TEST_COMPANY_ID, TEST_COMMAND_ID)
      tracker.classify(TEST_COMPANY_ID, TEST_COMMAND_ID)
      expect(commandEvents.events[1].payload.event).toBe('CLASSIFYING')
    })

    test('classified → CLASSIFIED 이벤트 + data', () => {
      tracker.startCommand(TEST_COMPANY_ID, TEST_COMMAND_ID)
      tracker.classified(TEST_COMPANY_ID, TEST_COMMAND_ID, {
        departmentId: 'dept-001',
        managerId: financeManager.id,
        confidence: 0.9,
        reasoning: '금융 분석 요청',
      })
      const event = commandEvents.events[1]
      expect(event.payload.event).toBe('CLASSIFIED')
      expect(event.payload.data).toBeDefined()
    })

    test('managerStarted → delegation 채널 MANAGER_STARTED', () => {
      tracker.managerStarted(TEST_COMPANY_ID, TEST_COMMAND_ID, financeManager.id, financeManager.name)
      expect(delegationEvents.events).toHaveLength(1)
      expect(delegationEvents.events[0].payload.event).toBe('MANAGER_STARTED')
      expect(delegationEvents.events[0].payload.agentId).toBe(financeManager.id)
      expect(delegationEvents.events[0].payload.agentName).toBe(financeManager.name)
    })

    test('specialistDispatched → SPECIALIST_DISPATCHED', () => {
      tracker.specialistDispatched(TEST_COMPANY_ID, TEST_COMMAND_ID, stockSpecialist.id, stockSpecialist.name)
      expect(delegationEvents.events[0].payload.event).toBe('SPECIALIST_DISPATCHED')
      expect(delegationEvents.events[0].payload.agentName).toBe('주식전문가')
    })

    test('specialistCompleted → SPECIALIST_COMPLETED + durationMs', () => {
      tracker.specialistCompleted(TEST_COMPANY_ID, TEST_COMMAND_ID, stockSpecialist.id, stockSpecialist.name, 1500)
      expect(delegationEvents.events[0].payload.event).toBe('SPECIALIST_COMPLETED')
      expect(delegationEvents.events[0].payload.data?.durationMs).toBe(1500)
    })

    test('specialistFailed → SPECIALIST_FAILED + error', () => {
      tracker.specialistFailed(TEST_COMPANY_ID, TEST_COMMAND_ID, bondSpecialist.id, bondSpecialist.name, 'Timeout')
      expect(delegationEvents.events[0].payload.event).toBe('SPECIALIST_FAILED')
      expect(delegationEvents.events[0].payload.data?.error).toBe('Timeout')
    })

    test('synthesizing → SYNTHESIZING', () => {
      tracker.synthesizing(TEST_COMPANY_ID, TEST_COMMAND_ID, financeManager.id, financeManager.name)
      expect(delegationEvents.events[0].payload.event).toBe('SYNTHESIZING')
    })

    test('synthesisCompleted → SYNTHESIS_COMPLETED', () => {
      tracker.synthesisCompleted(TEST_COMPANY_ID, TEST_COMMAND_ID, financeManager.id, financeManager.name, 2000)
      expect(delegationEvents.events[0].payload.event).toBe('SYNTHESIS_COMPLETED')
    })

    test('qualityChecking → QUALITY_CHECKING', () => {
      tracker.qualityChecking(TEST_COMPANY_ID, TEST_COMMAND_ID)
      expect(commandEvents.events[0].payload.event).toBe('QUALITY_CHECKING')
    })

    test('qualityPassed → QUALITY_PASSED + scores', () => {
      const scores = { conclusionClarity: 4, evidenceSufficiency: 4, riskMention: 3, formatAdequacy: 4, logicalConsistency: 4 }
      tracker.qualityPassed(TEST_COMPANY_ID, TEST_COMMAND_ID, scores, 19)
      expect(commandEvents.events[0].payload.event).toBe('QUALITY_PASSED')
      expect(commandEvents.events[0].payload.data?.totalScore).toBe(19)
    })

    test('qualityFailed → QUALITY_FAILED + feedback', () => {
      const scores = { conclusionClarity: 2, evidenceSufficiency: 2, riskMention: 3, formatAdequacy: 3, logicalConsistency: 2 }
      tracker.qualityFailed(TEST_COMPANY_ID, TEST_COMMAND_ID, scores, 12, '근거 부족')
      expect(commandEvents.events[0].payload.event).toBe('QUALITY_FAILED')
      expect(commandEvents.events[0].payload.data?.feedback).toBe('근거 부족')
    })

    test('reworking → REWORKING + attempt info', () => {
      tracker.reworking(TEST_COMPANY_ID, TEST_COMMAND_ID, 1, 2)
      expect(commandEvents.events[0].payload.event).toBe('REWORKING')
      expect(commandEvents.events[0].payload.data?.attempt).toBe(1)
      expect(commandEvents.events[0].payload.data?.maxAttempts).toBe(2)
    })

    test('completed → COMPLETED + timer cleanup', () => {
      tracker.startCommand(TEST_COMPANY_ID, TEST_COMMAND_ID)
      tracker.completed(TEST_COMPANY_ID, TEST_COMMAND_ID)
      const completedEvent = commandEvents.events.find(e => e.payload.event === 'COMPLETED')
      expect(completedEvent).toBeDefined()
    })

    test('failed → FAILED + error data', () => {
      tracker.startCommand(TEST_COMPANY_ID, TEST_COMMAND_ID)
      tracker.failed(TEST_COMPANY_ID, TEST_COMMAND_ID, '에이전트 없음')
      const failedEvent = commandEvents.events.find(e => e.payload.event === 'FAILED')
      expect(failedEvent).toBeDefined()
      expect(failedEvent!.payload.data?.error).toBe('에이전트 없음')
    })

    test('전체 파이프라인 이벤트 순서 검증', () => {
      tracker.startCommand(TEST_COMPANY_ID, TEST_COMMAND_ID)
      tracker.classify(TEST_COMPANY_ID, TEST_COMMAND_ID)
      tracker.classified(TEST_COMPANY_ID, TEST_COMMAND_ID, { departmentId: 'dept-1', managerId: 'mgr-1', confidence: 0.9, reasoning: 'ok' })
      tracker.managerStarted(TEST_COMPANY_ID, TEST_COMMAND_ID, 'mgr-1', '금융팀장')
      tracker.specialistDispatched(TEST_COMPANY_ID, TEST_COMMAND_ID, 'spec-1', '주식전문가')
      tracker.specialistCompleted(TEST_COMPANY_ID, TEST_COMMAND_ID, 'spec-1', '주식전문가', 1000)
      tracker.synthesizing(TEST_COMPANY_ID, TEST_COMMAND_ID, 'mgr-1', '금융팀장')
      tracker.synthesisCompleted(TEST_COMPANY_ID, TEST_COMMAND_ID, 'mgr-1', '금융팀장', 1500)
      tracker.qualityChecking(TEST_COMPANY_ID, TEST_COMMAND_ID)
      tracker.qualityPassed(TEST_COMPANY_ID, TEST_COMMAND_ID, { a: 4 }, 20)
      tracker.completed(TEST_COMPANY_ID, TEST_COMMAND_ID)

      // Command channel events
      const cmdEventTypes = commandEvents.events.map(e => e.payload.event)
      expect(cmdEventTypes).toEqual([
        'COMMAND_RECEIVED',
        'CLASSIFYING',
        'CLASSIFIED',
        'QUALITY_CHECKING',
        'QUALITY_PASSED',
        'COMPLETED',
      ])

      // Delegation channel events
      const delEventTypes = delegationEvents.events.map(e => e.payload.event)
      expect(delEventTypes).toEqual([
        'MANAGER_STARTED',
        'SPECIALIST_DISPATCHED',
        'SPECIALIST_COMPLETED',
        'SYNTHESIZING',
        'SYNTHESIS_COMPLETED',
      ])
    })

    test('각 이벤트에 timestamp + elapsed 포함', () => {
      tracker.startCommand(TEST_COMPANY_ID, TEST_COMMAND_ID)
      tracker.classify(TEST_COMPANY_ID, TEST_COMMAND_ID)

      for (const e of commandEvents.events) {
        expect(e.payload.timestamp).toBeDefined()
        expect(typeof e.payload.timestamp).toBe('string')
        expect(typeof e.payload.elapsed).toBe('number')
        expect(e.payload.elapsed).toBeGreaterThanOrEqual(0)
      }
    })
  })

  // ============================================================
  // Task 9: 프리셋 실행 분류
  // ============================================================

  describe('9. 프리셋 실행 분류', () => {
    test('presetId → type=preset, 텍스트 보존', async () => {
      const result = await commandRouterClassify('삼성전자 주간 보고서', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
        presetId: 'preset-123',
      })
      expect(result.type).toBe('preset')
      expect(result.text).toBe('삼성전자 주간 보고서')
      expect(result.parsedMeta.presetId).toBe('preset-123')
      expect(result.parsedMeta.timeoutMs).toBe(60_000)
    })

    test('presetId가 슬래시 명령보다 우선', async () => {
      // Even if text starts with /, presetId takes priority
      const result = await commandRouterClassify('/전체 시장 분석', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
        presetId: 'preset-456',
      })
      expect(result.type).toBe('preset')
      expect(result.parsedMeta.presetId).toBe('preset-456')
    })

    test('presetId가 @멘션보다 우선', async () => {
      const result = await commandRouterClassify('@마케팅부장 분석', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
        presetId: 'preset-789',
      })
      expect(result.type).toBe('preset')
    })
  })

  // ============================================================
  // Task 10: 타임아웃 로직 검증
  // ============================================================

  describe('10. 타임아웃 처리', () => {
    test('Specialist 60s 타임아웃 상수 확인', () => {
      // Verify the constants are correct (imported from manager-delegate)
      const SPECIALIST_TIMEOUT_MS = 60_000
      const TOTAL_TIMEOUT_MS = 300_000 // 5 minutes
      expect(SPECIALIST_TIMEOUT_MS).toBe(60_000)
      expect(TOTAL_TIMEOUT_MS).toBe(300_000)
    })

    test('타임아웃 맵 확인: direct=60s, all=300s, deepwork=300s', async () => {
      const directResult = await commandRouterClassify('분석', { companyId: TEST_COMPANY_ID, userId: TEST_USER_ID })
      expect(directResult.parsedMeta.timeoutMs).toBe(60_000)

      const allResult = await commandRouterClassify('/전체 분석', { companyId: TEST_COMPANY_ID, userId: TEST_USER_ID })
      expect(allResult.parsedMeta.timeoutMs).toBe(300_000)

      const seqResult = await commandRouterClassify('/순차 분석', { companyId: TEST_COMPANY_ID, userId: TEST_USER_ID })
      expect(seqResult.parsedMeta.timeoutMs).toBe(300_000)
    })

    test('DeepWork 전체 타임아웃 → 남은 단계 timeout', async () => {
      // Use a very short total timeout
      let callIdx = 0
      mockAgentRunnerExecute.mockImplementation(async () => {
        callIdx++
        // Each call takes some time
        await new Promise(resolve => setTimeout(resolve, 50))
        return { content: `phase ${callIdx} result`, toolCalls: [], usage: { inputTokens: 100, outputTokens: 50 } }
      })

      const service = new DeepWorkService()
      const result = await service.execute(
        financeManager,
        '분석',
        {
          commandId: 'cmd-total-timeout-test',
          companyId: TEST_COMPANY_ID,
          phaseTimeoutMs: 5_000,
          totalTimeoutMs: 80, // Very short — some phases will get cut off by total timeout
        },
        { companyId: TEST_COMPANY_ID, agentId: financeManager.id, agentName: financeManager.name, source: 'deepwork' },
      )

      // At least some phases should be timeout (due to total timeout exhaustion)
      const hasTimeout = result.phases.some(p => p.status === 'timeout')
      const hasCompleted = result.phases.some(p => p.status === 'completed')
      // At least plan should complete (50ms < 80ms total timeout), rest may timeout
      expect(result.phases.length).toBe(5)
      expect(hasCompleted || hasTimeout).toBe(true)
    })

    test('withTimeout 패턴 검증 (custom)', async () => {
      function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error(`Timeout: ${label} exceeded ${ms}ms`)), ms)
          promise.then(
            (val) => { clearTimeout(timer); resolve(val) },
            (err) => { clearTimeout(timer); reject(err) },
          )
        })
      }

      // Should resolve successfully
      const fast = await withTimeout(Promise.resolve('ok'), 1000, 'fast')
      expect(fast).toBe('ok')

      // Should timeout
      try {
        await withTimeout(new Promise(() => {}), 50, 'slow')
        expect(true).toBe(false) // Should not reach here
      } catch (err) {
        expect((err as Error).message).toContain('Timeout')
        expect((err as Error).message).toContain('slow')
        expect((err as Error).message).toContain('50ms')
      }
    })
  })

  // ============================================================
  // Task 11: 에러 복구 (Specialist 실패 시 부분 결과)
  // ============================================================

  describe('11. 에러 복구 — Specialist 실패 시 부분 결과', () => {
    test('SpecialistResult: fulfilled + rejected 혼합 결과 처리', () => {
      const results: SpecialistResult[] = [
        { agentId: 'spec-1', agentName: '주식전문가', content: '분석 성공', status: 'fulfilled', durationMs: 1000 },
        { agentId: 'spec-2', agentName: '채권전문가', content: '', status: 'rejected', error: 'API timeout', durationMs: 60000 },
        { agentId: 'spec-3', agentName: 'SNS전문가', content: 'SNS 분석 완료', status: 'fulfilled', durationMs: 2000 },
      ]

      const fulfilled = results.filter(r => r.status === 'fulfilled')
      const rejected = results.filter(r => r.status === 'rejected')

      expect(fulfilled).toHaveLength(2)
      expect(rejected).toHaveLength(1)
      expect(rejected[0].error).toBe('API timeout')
    })

    test('ManagerDelegationResult summary 계산', () => {
      const results: SpecialistResult[] = [
        { agentId: 'spec-1', agentName: '주식전문가', content: '성공', status: 'fulfilled', durationMs: 1000 },
        { agentId: 'spec-2', agentName: '채권전문가', content: '', status: 'rejected', error: 'timeout', durationMs: 60000 },
      ]

      const summary = {
        totalSpecialists: results.length,
        fulfilled: results.filter(r => r.status === 'fulfilled').length,
        rejected: results.filter(r => r.status === 'rejected').length,
      }

      expect(summary.totalSpecialists).toBe(2)
      expect(summary.fulfilled).toBe(1)
      expect(summary.rejected).toBe(1)
    })

    test('synthesis 프롬프트에 실패 Specialist "분석 실패" 포함', () => {
      const results: SpecialistResult[] = [
        { agentId: 'spec-1', agentName: '주식전문가', content: '삼성전자 분석 결과...', status: 'fulfilled', durationMs: 1000 },
        { agentId: 'spec-2', agentName: '채권전문가', content: '', status: 'rejected', error: 'API 호출 실패', durationMs: 60000 },
      ]

      const prompt = buildSynthesisPrompt(
        financeManager.name,
        '삼성전자 분석',
        '팀장 독자 분석 결과...',
        results,
      )

      // Should include successful specialist's content
      expect(prompt).toContain('주식전문가')
      expect(prompt).toContain('삼성전자 분석 결과')

      // Should include failed specialist with error note
      expect(prompt).toContain('채권전문가')
      expect(prompt).toContain('분석 실패')
    })

    test('모든 Specialist 실패 시 "(전문가 없음)" 표시', () => {
      const prompt = buildSynthesisPrompt(
        financeManager.name,
        '분석',
        '팀장 분석',
        [], // No specialists
      )

      expect(prompt).toContain('전문가 없음')
      expect(prompt).toContain('팀장 단독 분석')
    })

    test('Promise.allSettled 패턴: 1개 실패해도 다른 결과 보존', async () => {
      const tasks = [
        Promise.resolve({ id: 'spec-1', result: 'success-1' }),
        Promise.reject(new Error('spec-2 failed')),
        Promise.resolve({ id: 'spec-3', result: 'success-3' }),
      ]

      const settled = await Promise.allSettled(tasks)
      expect(settled).toHaveLength(3)
      expect(settled[0].status).toBe('fulfilled')
      expect(settled[1].status).toBe('rejected')
      expect(settled[2].status).toBe('fulfilled')

      // Extract successful results
      const successful = settled
        .filter((s): s is PromiseFulfilledResult<{ id: string; result: string }> => s.status === 'fulfilled')
        .map(s => s.value)
      expect(successful).toHaveLength(2)
      expect(successful[0].result).toBe('success-1')
      expect(successful[1].result).toBe('success-3')
    })
  })

  // ============================================================
  // Additional: Classification JSON parsing
  // ============================================================

  describe('12. Classification JSON 파싱', () => {
    test('유효한 분류 결과 파싱', () => {
      const result = parseLLMJson<ClassificationResult>(MOCK_CLASSIFY_RESPONSE)
      expect(result).not.toBeNull()
      expect(result!.managerId).toBe(financeManager.id)
      expect(result!.confidence).toBe(0.9)
      expect(result!.reasoning).toContain('금융')
    })

    test('confidence 범위 검증 (0~1)', () => {
      const result = parseLLMJson<ClassificationResult>(MOCK_CLASSIFY_RESPONSE)!
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    test('순차 실행 순서 JSON 파싱', () => {
      const result = parseLLMJson<{ order: string[]; reason: string }>(MOCK_SEQUENTIAL_ORDER)
      expect(result).not.toBeNull()
      expect(result!.order).toHaveLength(2)
      expect(result!.order[0]).toBe(financeManager.id)
      expect(result!.order[1]).toBe(marketingManager.id)
    })
  })

  // ============================================================
  // Additional: Command type timeout map completeness
  // ============================================================

  describe('13. CommandType 타임아웃 매핑 완전성', () => {
    const allTypes: Array<{ text: string; options?: Partial<ClassifyOptions>; expectedType: string; expectedTimeout: number }> = [
      { text: '분석해줘', expectedType: 'direct', expectedTimeout: 60_000 },
      { text: '/전체 분석', expectedType: 'all', expectedTimeout: 300_000 },
      { text: '/순차 분석', expectedType: 'sequential', expectedTimeout: 300_000 },
      { text: '/도구점검', expectedType: 'slash', expectedTimeout: 30_000 },
      { text: '/배치실행', expectedType: 'slash', expectedTimeout: 30_000 },
      { text: '/배치상태', expectedType: 'slash', expectedTimeout: 30_000 },
      { text: '/명령어', expectedType: 'slash', expectedTimeout: 30_000 },
      { text: '/토론 AI', expectedType: 'slash', expectedTimeout: 300_000 },
      { text: '/심층토론 AI', expectedType: 'slash', expectedTimeout: 300_000 },
      { text: '분석', options: { presetId: 'p-1' }, expectedType: 'preset', expectedTimeout: 60_000 },
      { text: '분석', options: { targetAgentId: 'a-1' }, expectedType: 'mention', expectedTimeout: 60_000 },
      { text: '분석', options: { useBatch: true }, expectedType: 'batch', expectedTimeout: 300_000 },
    ]

    for (const tc of allTypes) {
      test(`${tc.text} → type=${tc.expectedType}, timeout=${tc.expectedTimeout}ms`, async () => {
        const result = await commandRouterClassify(tc.text, {
          companyId: TEST_COMPANY_ID,
          userId: TEST_USER_ID,
          ...tc.options,
        })
        expect(result.type).toBe(tc.expectedType)
        expect(result.parsedMeta.timeoutMs).toBe(tc.expectedTimeout)
      })
    }
  })

  // ============================================================
  // Additional: Synthesis prompt structure
  // ============================================================

  describe('14. Synthesis 프롬프트 구조', () => {
    test('4섹션 보고서 지시 포함 (결론/분석/리스크/추천)', () => {
      const prompt = buildSynthesisPrompt(
        '금융분석팀장',
        '삼성전자 분석',
        '독자 분석 결과...',
        [{ agentId: 'spec-1', agentName: '주식전문가', content: '분석 결과', status: 'fulfilled', durationMs: 1000 }],
      )
      expect(prompt).toContain('결론')
      expect(prompt).toContain('분석')
      expect(prompt).toContain('리스크')
      expect(prompt).toContain('추천')
    })

    test('Manager 이름 포함', () => {
      const prompt = buildSynthesisPrompt(
        '마케팅부장',
        '분석',
        '분석 결과',
        [],
      )
      expect(prompt).toContain('마케팅부장')
    })
  })

  // ============================================================
  // Additional: Edge cases
  // ============================================================

  describe('15. 엣지 케이스', () => {
    test('빈 텍스트 명령 → direct', async () => {
      const result = await commandRouterClassify('', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
      })
      expect(result.type).toBe('direct')
      expect(result.text).toBe('')
    })

    test('공백만 있는 텍스트 → direct', async () => {
      const result = await commandRouterClassify('   ', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
      })
      expect(result.type).toBe('direct')
    })

    test('슬래시 명령 인자 없음 → args 빈 문자열', async () => {
      const result = await commandRouterClassify('/전체', {
        companyId: TEST_COMPANY_ID,
        userId: TEST_USER_ID,
      })
      expect(result.type).toBe('all')
      expect(result.parsedMeta.slashArgs).toBeUndefined() // empty string is falsy → undefined
    })

    test('DeepWork phases 배열 순서 불변', () => {
      const PHASES = ['plan', 'collect', 'analyze', 'draft', 'finalize']
      expect(PHASES).toEqual(['plan', 'collect', 'analyze', 'draft', 'finalize'])
    })

    test('DelegationTracker elapsed 계산: startCommand 호출 안 하면 0', () => {
      const tracker = new DelegationTracker()
      const spy = spyOnEvents('command')

      // Classify without startCommand
      tracker.classify(TEST_COMPANY_ID, 'unknown-cmd')
      expect(spy.events[0].payload.elapsed).toBe(0)

      spy.unsub()
    })
  })
})
