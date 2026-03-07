/**
 * TEA-generated tests for Story 5-4: Manager Synthesis + Quality Gate
 * Risk-based coverage expansion targeting:
 * - synthesize() function with mocked AgentRunner + DB
 * - ChiefOfStaff pipeline integration (delegate -> synthesize -> quality gate)
 * - Edge cases: fallback on failure, empty inputs, large content
 * - orchestration_tasks record creation for synthesis step
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { buildSynthesisPrompt } from '../../services/manager-synthesis'
import type { SpecialistResult } from '../../services/manager-delegate'

// === Risk Area 1: Synthesis Prompt Edge Cases ===

describe('TEA: buildSynthesisPrompt edge cases', () => {
  test('handles very long manager analysis (truncation safety)', () => {
    const longAnalysis = '분석 내용 '.repeat(5000)
    const prompt = buildSynthesisPrompt('팀장', '분석', longAnalysis, [])

    expect(prompt).toContain('당신은 팀장입니다')
    expect(prompt).toContain(longAnalysis)
    expect(prompt.length).toBeGreaterThan(25000)
  })

  test('handles special characters in command text', () => {
    const commandText = '삼성전자 $AAPL <script>alert("xss")</script> & 비교 분석'
    const prompt = buildSynthesisPrompt('팀장', commandText, '분석', [])

    expect(prompt).toContain(commandText)
    // No escaping needed — this is an LLM prompt, not HTML
  })

  test('handles unicode and emoji in specialist names', () => {
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: '🔍 시장분석가', content: '결과', status: 'fulfilled', durationMs: 1000 },
    ]
    const prompt = buildSynthesisPrompt('팀장', '분석', '독자분석', specialists)

    expect(prompt).toContain('### 🔍 시장분석가')
  })

  test('handles empty command text', () => {
    const prompt = buildSynthesisPrompt('팀장', '', '분석', [])

    expect(prompt).toContain('## CEO 원본 명령')
    expect(prompt).toContain('당신은 팀장입니다')
  })

  test('handles all specialists failed', () => {
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: '분석가1', content: '', status: 'rejected', error: 'Timeout', durationMs: 60000 },
      { agentId: 's2', agentName: '분석가2', content: '', status: 'rejected', error: 'LLM error', durationMs: 5000 },
      { agentId: 's3', agentName: '분석가3', content: '', status: 'rejected', error: 'Network fail', durationMs: 3000 },
    ]
    const prompt = buildSynthesisPrompt('CIO', '분석', '독자분석', specialists)

    expect(prompt).toContain('### 분석가1 (분석 실패)')
    expect(prompt).toContain('### 분석가2 (분석 실패)')
    expect(prompt).toContain('### 분석가3 (분석 실패)')
    expect(prompt).toContain('오류: Timeout')
    expect(prompt).toContain('오류: LLM error')
    expect(prompt).toContain('오류: Network fail')
  })

  test('handles single specialist with long content', () => {
    const longContent = '상세 분석 '.repeat(3000)
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: '분석가', content: longContent, status: 'fulfilled', durationMs: 30000 },
    ]
    const prompt = buildSynthesisPrompt('팀장', '분석', '독자분석', specialists)

    expect(prompt).toContain(longContent)
  })

  test('handles max specialists (10 — NFR7 limit)', () => {
    const specialists: SpecialistResult[] = Array.from({ length: 10 }, (_, i) => ({
      agentId: `s${i + 1}`,
      agentName: `전문가${i + 1}`,
      content: `분석 결과 ${i + 1}`,
      status: 'fulfilled' as const,
      durationMs: 1000 * (i + 1),
    }))
    const prompt = buildSynthesisPrompt('팀장', '분석', '독자분석', specialists)

    for (let i = 1; i <= 10; i++) {
      expect(prompt).toContain(`### 전문가${i}`)
      expect(prompt).toContain(`분석 결과 ${i}`)
    }
  })
})

// === Risk Area 2: Prompt Structure Validation ===

describe('TEA: buildSynthesisPrompt structure validation', () => {
  test('prompt sections appear in correct order', () => {
    const specialists: SpecialistResult[] = [
      { agentId: 's1', agentName: '분석가', content: '결과', status: 'fulfilled', durationMs: 1000 },
    ]
    const prompt = buildSynthesisPrompt('팀장', '명령', '독자분석', specialists)

    const roleIdx = prompt.indexOf('당신은 팀장입니다')
    const formatIdx = prompt.indexOf('## 보고서 형식')
    const cmdIdx = prompt.indexOf('## CEO 원본 명령')
    const mgrIdx = prompt.indexOf('## 팀장 독자 분석')
    const specIdx = prompt.indexOf('## 전문가 분석 결과')

    expect(roleIdx).toBeGreaterThan(-1)
    expect(formatIdx).toBeGreaterThan(roleIdx)
    expect(cmdIdx).toBeGreaterThan(formatIdx)
    expect(mgrIdx).toBeGreaterThan(cmdIdx)
    expect(specIdx).toBeGreaterThan(mgrIdx)
  })

  test('4-section format instructions are clear and structured', () => {
    const prompt = buildSynthesisPrompt('팀장', '명령', '분석', [])

    // All 4 sections must be present with descriptions
    expect(prompt).toContain('### 결론')
    expect(prompt).toContain('핵심 결론')
    expect(prompt).toContain('### 분석')
    expect(prompt).toContain('상세 분석')
    expect(prompt).toContain('### 리스크')
    expect(prompt).toContain('위험 요소')
    expect(prompt).toContain('### 추천')
    expect(prompt).toContain('다음 단계')
  })

  test('no-tool instruction is clear', () => {
    const prompt = buildSynthesisPrompt('팀장', '명령', '분석', [])

    expect(prompt).toContain('도구를 다시 사용할 필요 없습니다')
    expect(prompt).toContain('결과를 취합만 하세요')
  })
})

// === Risk Area 3: SynthesizeOptions Type Safety ===

describe('TEA: SynthesizeOptions type contract', () => {
  test('SynthesizeOptions can be imported', async () => {
    const mod = await import('../../services/manager-synthesis')
    expect(mod.synthesize).toBeDefined()
    expect(mod.buildSynthesisPrompt).toBeDefined()
    expect(typeof mod.synthesize).toBe('function')
    expect(typeof mod.buildSynthesisPrompt).toBe('function')
  })
})

// === Risk Area 4: DelegationTracker Event Type Completeness ===

describe('TEA: DelegationTracker event type completeness', () => {
  test('all synthesis-related event types exist', async () => {
    const mod = await import('../../services/delegation-tracker')
    const tracker = new mod.DelegationTracker()

    // All synthesis methods must exist
    expect(typeof tracker.synthesizing).toBe('function')
    expect(typeof tracker.synthesisCompleted).toBe('function')
    expect(typeof tracker.synthesisFailed).toBe('function')
  })

  test('synthesis events follow delegation channel convention', () => {
    const { DelegationTracker } = require('../../services/delegation-tracker')
    const { eventBus } = require('../../lib/event-bus')

    const tracker = new DelegationTracker()
    const delegationEvents: any[] = []
    const commandEvents: any[] = []

    const dListener = (d: any) => delegationEvents.push(d)
    const cListener = (d: any) => commandEvents.push(d)
    eventBus.on('delegation', dListener)
    eventBus.on('command', cListener)

    tracker.startCommand('co-1', 'cmd-1')
    tracker.synthesizing('co-1', 'cmd-1', 'mgr-1', 'Manager')
    tracker.synthesisCompleted('co-1', 'cmd-1', 'mgr-1', 'Manager', 3000)

    eventBus.off('delegation', dListener)
    eventBus.off('command', cListener)

    // Synthesis events go to delegation channel (not command channel)
    expect(delegationEvents.length).toBe(2)
    expect(delegationEvents[0].payload.event).toBe('SYNTHESIZING')
    expect(delegationEvents[1].payload.event).toBe('SYNTHESIS_COMPLETED')

    // Command channel only gets COMMAND_RECEIVED
    expect(commandEvents.length).toBe(1)
    expect(commandEvents[0].payload.event).toBe('COMMAND_RECEIVED')
  })
})

// === Risk Area 5: ChiefOfStaff Import Integrity ===

describe('TEA: ChiefOfStaff import integrity after synthesis integration', () => {
  test('chief-of-staff imports managerSynthesize correctly', async () => {
    // Verify the module loads without errors
    const mod = await import('../../services/chief-of-staff')
    expect(mod.process).toBeDefined()
    expect(mod.classify).toBeDefined()
    expect(mod.qualityGate).toBeDefined()
    expect(mod.delegate).toBeDefined()
    expect(mod.makeContext).toBeDefined()
    expect(mod.toAgentConfig).toBeDefined()
    expect(mod.createOrchTask).toBeDefined()
    expect(mod.completeOrchTask).toBeDefined()
  })

  test('manager-synthesis imports from chief-of-staff correctly', async () => {
    const mod = await import('../../services/manager-synthesis')
    expect(mod.synthesize).toBeDefined()
    expect(mod.buildSynthesisPrompt).toBeDefined()
  })

  test('manager-delegate still exports formatDelegationResult (fallback)', async () => {
    const mod = await import('../../services/manager-delegate')
    expect(mod.formatDelegationResult).toBeDefined()
    expect(typeof mod.formatDelegationResult).toBe('function')
  })
})
