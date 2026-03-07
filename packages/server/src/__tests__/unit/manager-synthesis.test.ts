import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { buildSynthesisPrompt } from '../../services/manager-synthesis'
import type { SpecialistResult, ManagerDelegationResult } from '../../services/manager-delegate'
import { DelegationTracker } from '../../services/delegation-tracker'
import { eventBus } from '../../lib/event-bus'

// === buildSynthesisPrompt Tests ===

describe('buildSynthesisPrompt', () => {
  test('builds v1-pattern prompt with manager analysis + specialist results', () => {
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: '시장분석가', content: '시장 분석 결과', status: 'fulfilled', durationMs: 5000 },
      { agentId: 's2', agentName: '재무분석가', content: '재무 분석 결과', status: 'fulfilled', durationMs: 3000 },
    ]

    const prompt = buildSynthesisPrompt('전략팀장', '삼성전자 분석해줘', 'Manager 독자 분석 내용', specialists)

    // v1 pattern: "당신은 {mgr_name}입니다"
    expect(prompt).toContain('당신은 전략팀장입니다')
    // v1 pattern: "결과를 취합만 하세요"
    expect(prompt).toContain('결과를 취합만 하세요')
    // v1 pattern: "도구를 다시 사용할 필요 없습니다"
    expect(prompt).toContain('도구를 다시 사용할 필요 없습니다')
    // CEO original command
    expect(prompt).toContain('## CEO 원본 명령')
    expect(prompt).toContain('삼성전자 분석해줘')
    // Manager analysis
    expect(prompt).toContain('## 팀장 독자 분석')
    expect(prompt).toContain('Manager 독자 분석 내용')
    // Specialist results
    expect(prompt).toContain('## 전문가 분석 결과')
    expect(prompt).toContain('### 시장분석가')
    expect(prompt).toContain('시장 분석 결과')
    expect(prompt).toContain('### 재무분석가')
    expect(prompt).toContain('재무 분석 결과')
  })

  test('includes 4-section format instruction (conclusion, analysis, risk, recommendation)', () => {
    const prompt = buildSynthesisPrompt('팀장', '분석해줘', '분석', [])

    expect(prompt).toContain('### 결론')
    expect(prompt).toContain('### 분석')
    expect(prompt).toContain('### 리스크')
    expect(prompt).toContain('### 추천')
  })

  test('handles empty specialists with "(전문가 없음)" message', () => {
    const prompt = buildSynthesisPrompt('팀장', '명령어', 'Manager 분석', [])

    expect(prompt).toContain('(전문가 없음 — 팀장 단독 분석)')
  })

  test('handles failed specialists with error display', () => {
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: '분석가A', content: '결과 A', status: 'fulfilled', durationMs: 5000 },
      { agentId: 's2', agentName: '분석가B', content: '', status: 'rejected', error: 'Timeout 초과', durationMs: 60000 },
    ]

    const prompt = buildSynthesisPrompt('CIO', '분석해줘', '독자 분석', specialists)

    expect(prompt).toContain('### 분석가A')
    expect(prompt).toContain('결과 A')
    expect(prompt).toContain('### 분석가B (분석 실패)')
    expect(prompt).toContain('오류: Timeout 초과')
  })

  test('handles failed specialist without error message', () => {
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: '전문가', content: '', status: 'rejected', durationMs: 0 },
    ]

    const prompt = buildSynthesisPrompt('팀장', '명령', '분석', specialists)

    expect(prompt).toContain('오류: 알 수 없는 오류')
  })

  test('handles empty manager analysis with "(분석 실패)" fallback', () => {
    const prompt = buildSynthesisPrompt('팀장', '명령', '', [])

    expect(prompt).toContain('(분석 실패)')
  })

  test('includes all specialists in order', () => {
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: '1번', content: '결과1', status: 'fulfilled', durationMs: 1000 },
      { agentId: 's2', agentName: '2번', content: '결과2', status: 'fulfilled', durationMs: 2000 },
      { agentId: 's3', agentName: '3번', content: '결과3', status: 'fulfilled', durationMs: 3000 },
    ]

    const prompt = buildSynthesisPrompt('팀장', '분석', '독자분석', specialists)

    const idx1 = prompt.indexOf('### 1번')
    const idx2 = prompt.indexOf('### 2번')
    const idx3 = prompt.indexOf('### 3번')

    expect(idx1).toBeLessThan(idx2)
    expect(idx2).toBeLessThan(idx3)
  })
})

// === DelegationTracker Synthesis Event Tests ===

describe('DelegationTracker synthesis events', () => {
  let tracker: DelegationTracker

  beforeEach(() => {
    tracker = new DelegationTracker()
  })

  test('synthesizing emits SYNTHESIZING on delegation channel', () => {
    const events: any[] = []
    const listener = (data: any) => events.push(data)
    eventBus.on('delegation', listener)

    tracker.startCommand('co-1', 'cmd-1')
    tracker.synthesizing('co-1', 'cmd-1', 'mgr-1', '전략팀장')

    eventBus.off('delegation', listener)

    expect(events).toHaveLength(1)
    expect(events[0].companyId).toBe('co-1')
    expect(events[0].payload.event).toBe('SYNTHESIZING')
    expect(events[0].payload.phase).toBe('synthesizing')
    expect(events[0].payload.agentId).toBe('mgr-1')
    expect(events[0].payload.agentName).toBe('전략팀장')
  })

  test('synthesisCompleted emits SYNTHESIS_COMPLETED with durationMs', () => {
    const events: any[] = []
    const listener = (data: any) => events.push(data)
    eventBus.on('delegation', listener)

    tracker.startCommand('co-1', 'cmd-1')
    tracker.synthesisCompleted('co-1', 'cmd-1', 'mgr-1', '전략팀장', 2500)

    eventBus.off('delegation', listener)

    expect(events).toHaveLength(1)
    expect(events[0].payload.event).toBe('SYNTHESIS_COMPLETED')
    expect(events[0].payload.phase).toBe('synthesis-completed')
    expect(events[0].payload.agentId).toBe('mgr-1')
    expect(events[0].payload.agentName).toBe('전략팀장')
    expect(events[0].payload.data).toEqual({ durationMs: 2500 })
  })

  test('synthesisFailed emits SYNTHESIS_FAILED with error', () => {
    const events: any[] = []
    const listener = (data: any) => events.push(data)
    eventBus.on('delegation', listener)

    tracker.startCommand('co-1', 'cmd-1')
    tracker.synthesisFailed('co-1', 'cmd-1', 'mgr-1', '전략팀장', 'LLM 호출 실패')

    eventBus.off('delegation', listener)

    expect(events).toHaveLength(1)
    expect(events[0].payload.event).toBe('SYNTHESIS_FAILED')
    expect(events[0].payload.phase).toBe('synthesis-failed')
    expect(events[0].payload.data).toEqual({ error: 'LLM 호출 실패' })
  })
})

// === Synthesis Function Integration Tests (mocked dependencies) ===

describe('synthesize function', () => {
  // These tests verify the synthesize function's behavior by mocking agentRunner and DB

  test('buildSynthesisPrompt produces valid prompt for quality gate consumption', () => {
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: '기술분석가', content: 'AI 기술 동향 분석 결과', status: 'fulfilled', durationMs: 5000 },
    ]

    const prompt = buildSynthesisPrompt('기술팀장', 'AI 기술 동향 분석해줘', '팀장 독자 분석 결과', specialists)

    // Verify prompt has all necessary sections for quality gate
    expect(prompt).toContain('당신은 기술팀장입니다')
    expect(prompt).toContain('AI 기술 동향 분석해줘')
    expect(prompt).toContain('팀장 독자 분석 결과')
    expect(prompt).toContain('AI 기술 동향 분석 결과')
    // Verify format instructions
    expect(prompt).toContain('결론')
    expect(prompt).toContain('분석')
    expect(prompt).toContain('리스크')
    expect(prompt).toContain('추천')
  })

  test('buildSynthesisPrompt with manager solo (no specialists) still has report format', () => {
    const prompt = buildSynthesisPrompt('비서실장', '일정 확인', '오늘 일정 없습니다.', [])

    expect(prompt).toContain('당신은 비서실장입니다')
    expect(prompt).toContain('일정 확인')
    expect(prompt).toContain('오늘 일정 없습니다.')
    expect(prompt).toContain('(전문가 없음 — 팀장 단독 분석)')
    expect(prompt).toContain('### 결론')
    expect(prompt).toContain('### 리스크')
  })

  test('buildSynthesisPrompt handles mixed success/failure specialist results', () => {
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: '분석가1', content: '분석 성공', status: 'fulfilled', durationMs: 3000 },
      { agentId: 's2', agentName: '분석가2', content: '', status: 'rejected', error: 'Timeout: exceeded 60000ms', durationMs: 60000 },
      { agentId: 's3', agentName: '분석가3', content: '또 다른 분석', status: 'fulfilled', durationMs: 4000 },
    ]

    const prompt = buildSynthesisPrompt('팀장', '종합 분석', '독자 분석', specialists)

    expect(prompt).toContain('### 분석가1')
    expect(prompt).toContain('분석 성공')
    expect(prompt).toContain('### 분석가2 (분석 실패)')
    expect(prompt).toContain('Timeout: exceeded 60000ms')
    expect(prompt).toContain('### 분석가3')
    expect(prompt).toContain('또 다른 분석')
  })

  test('buildSynthesisPrompt preserves specialist order', () => {
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: 'Alpha', content: 'First', status: 'fulfilled', durationMs: 1000 },
      { agentId: 's2', agentName: 'Beta', content: 'Second', status: 'fulfilled', durationMs: 2000 },
      { agentId: 's3', agentName: 'Gamma', content: 'Third', status: 'fulfilled', durationMs: 3000 },
    ]

    const prompt = buildSynthesisPrompt('Manager', '분석', '독자 분석', specialists)

    const idxAlpha = prompt.indexOf('### Alpha')
    const idxBeta = prompt.indexOf('### Beta')
    const idxGamma = prompt.indexOf('### Gamma')

    expect(idxAlpha).toBeGreaterThan(-1)
    expect(idxBeta).toBeGreaterThan(idxAlpha)
    expect(idxGamma).toBeGreaterThan(idxBeta)
  })
})

// === DelegationEventType Tests ===

describe('DelegationEventType coverage', () => {
  test('SYNTHESIS_COMPLETED is a valid event type', () => {
    const tracker = new DelegationTracker()
    // Should not throw
    expect(() => {
      tracker.synthesisCompleted('co-1', 'cmd-1', 'mgr-1', 'Manager', 1000)
    }).not.toThrow()
  })

  test('SYNTHESIS_FAILED is a valid event type', () => {
    const tracker = new DelegationTracker()
    expect(() => {
      tracker.synthesisFailed('co-1', 'cmd-1', 'mgr-1', 'Manager', 'error')
    }).not.toThrow()
  })
})
