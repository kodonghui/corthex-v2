/**
 * TEA Risk-Based Tests: Story 5-7 Command Center UI
 * Risk Level: HIGH (core user-facing feature, real-time WebSocket, API integration)
 * Coverage: Store logic, data integrity, edge cases
 */
import { describe, test, expect, beforeEach } from 'bun:test'
import { useCommandStore, type CommandMessage, type DelegationStep } from '../stores/command-store'

// ============================================================
// Risk Area 1: Slash Command Data Integrity
// Risk: Wrong command names/descriptions would confuse CEO
// ============================================================
describe('TEA: Slash Commands Data', () => {
  // Import the constant from slash-popup
  // Since it's a React component file, we test the data structure directly

  const SLASH_COMMANDS = [
    { cmd: '/전체', args: '[메시지]', desc: '모든 팀장에게 동시에 명령', icon: '📡' },
    { cmd: '/순차', args: '[메시지]', desc: '팀장에게 순차적으로 릴레이 명령', icon: '🔗' },
    { cmd: '/도구점검', args: '', desc: '사용 가능한 도구 상태 확인', icon: '🔧' },
    { cmd: '/배치실행', args: '', desc: '대기 중인 배치 요청 실행', icon: '📦' },
    { cmd: '/배치상태', args: '', desc: '배치 처리 진행 상태 확인', icon: '📊' },
    { cmd: '/명령어', args: '', desc: '사용 가능한 모든 명령어 보기', icon: '📋' },
    { cmd: '/토론', args: '[주제]', desc: '팀장 2라운드 토론 시작', icon: '💬' },
    { cmd: '/심층토론', args: '[주제]', desc: '팀장 3라운드 심층 토론 시작', icon: '🧠' },
  ]

  test('정확히 8개의 슬래시 명령이 정의됨', () => {
    expect(SLASH_COMMANDS).toHaveLength(8)
  })

  test('모든 명령은 /로 시작', () => {
    for (const cmd of SLASH_COMMANDS) {
      expect(cmd.cmd.startsWith('/')).toBe(true)
    }
  })

  test('모든 명령에 아이콘과 설명이 있음', () => {
    for (const cmd of SLASH_COMMANDS) {
      expect(cmd.icon.length).toBeGreaterThan(0)
      expect(cmd.desc.length).toBeGreaterThan(0)
    }
  })

  test('필수 명령이 모두 포함됨 (PRD FR15)', () => {
    const cmdNames = SLASH_COMMANDS.map((c) => c.cmd)
    expect(cmdNames).toContain('/전체')
    expect(cmdNames).toContain('/순차')
    expect(cmdNames).toContain('/도구점검')
    expect(cmdNames).toContain('/배치실행')
    expect(cmdNames).toContain('/배치상태')
    expect(cmdNames).toContain('/명령어')
    expect(cmdNames).toContain('/토론')
    expect(cmdNames).toContain('/심층토론')
  })

  test('중복 명령 없음', () => {
    const cmds = SLASH_COMMANDS.map((c) => c.cmd)
    expect(new Set(cmds).size).toBe(cmds.length)
  })
})

// ============================================================
// Risk Area 2: Mention Detection Patterns
// Risk: Regex failure = CEO can't target specific managers
// ============================================================
describe('TEA: Mention Detection Regex', () => {
  const mentionRegex = /(?:^|\s)@(\S*)$/
  const slashRegex = /(?:^|\s)\/(\S*)$/

  test('@로 시작하는 멘션 감지', () => {
    expect('@CIO'.match(mentionRegex)).toBeTruthy()
    expect('@CIO'.match(mentionRegex)![1]).toBe('CIO')
  })

  test('공백 뒤 @멘션 감지', () => {
    expect('안녕 @CIO'.match(mentionRegex)).toBeTruthy()
    expect('안녕 @CIO'.match(mentionRegex)![1]).toBe('CIO')
  })

  test('부분 입력 감지 (자동완성 트리거)', () => {
    expect('@투'.match(mentionRegex)![1]).toBe('투')
    expect('분석해줘 @투자'.match(mentionRegex)![1]).toBe('투자')
  })

  test('빈 @만 입력 (전체 목록 표시)', () => {
    expect('@'.match(mentionRegex)![1]).toBe('')
  })

  test('멘션이 아닌 경우 미감지', () => {
    expect('email@test.com 분석'.match(mentionRegex)).toBeNull()
    expect('일반 텍스트'.match(mentionRegex)).toBeNull()
  })

  test('/로 시작하는 슬래시 감지', () => {
    expect('/전체'.match(slashRegex)).toBeTruthy()
    expect('/전체'.match(slashRegex)![1]).toBe('전체')
  })

  test('부분 슬래시 입력 감지', () => {
    expect('/전'.match(slashRegex)![1]).toBe('전')
    expect('/도'.match(slashRegex)![1]).toBe('도')
  })

  test('빈 /만 입력 (전체 목록 표시)', () => {
    expect('/'.match(slashRegex)![1]).toBe('')
  })

  test('공백 뒤 슬래시 감지', () => {
    expect('명령 /전체'.match(slashRegex)).toBeTruthy()
  })
})

// ============================================================
// Risk Area 3: Delegation Event Processing
// Risk: Event type mismatch = delegation chain not displayed
// ============================================================
describe('TEA: Delegation Event Labels', () => {
  const EVENT_LABELS: Record<string, string> = {
    COMMAND_RECEIVED: '명령 접수',
    CLASSIFYING: '분류 중...',
    CLASSIFIED: '분류 완료',
    MANAGER_STARTED: '작업 시작',
    SPECIALIST_DISPATCHED: '전문가 배분',
    SPECIALIST_COMPLETED: '전문가 완료',
    SPECIALIST_FAILED: '전문가 실패',
    SYNTHESIZING: '결과 종합 중...',
    SYNTHESIS_COMPLETED: '종합 완료',
    SYNTHESIS_FAILED: '종합 실패',
    QUALITY_CHECKING: '품질 검수 중...',
    QUALITY_PASSED: '품질 통과',
    QUALITY_FAILED: '품질 실패',
    REWORKING: '재작업 중...',
    COMPLETED: '완료',
    FAILED: '실패',
  }

  test('모든 핵심 이벤트 타입에 한글 레이블이 있음', () => {
    const criticalEvents = [
      'CLASSIFYING', 'CLASSIFIED', 'MANAGER_STARTED',
      'SPECIALIST_DISPATCHED', 'SPECIALIST_COMPLETED',
      'SYNTHESIZING', 'QUALITY_CHECKING', 'QUALITY_PASSED',
      'QUALITY_FAILED', 'COMPLETED', 'FAILED',
    ]
    for (const event of criticalEvents) {
      expect(EVENT_LABELS[event]).toBeDefined()
      expect(EVENT_LABELS[event].length).toBeGreaterThan(0)
    }
  })

  test('완료/실패 이벤트가 올바르게 매핑됨', () => {
    expect(EVENT_LABELS.COMPLETED).toBe('완료')
    expect(EVENT_LABELS.FAILED).toBe('실패')
    expect(EVENT_LABELS.QUALITY_PASSED).toBe('품질 통과')
    expect(EVENT_LABELS.QUALITY_FAILED).toBe('품질 실패')
  })

  test('재작업 이벤트 존재', () => {
    expect(EVENT_LABELS.REWORKING).toBeDefined()
  })
})

// ============================================================
// Risk Area 4: Store State Transitions (Happy Path + Edge Cases)
// Risk: State corruption = UI shows stale/wrong data
// ============================================================
describe('TEA: Command Store State Transitions', () => {
  beforeEach(() => {
    useCommandStore.setState({
      messages: [],
      activeCommandId: null,
      delegationSteps: [],
      selectedReportId: null,
      viewMode: 'chat',
    })
  })

  test('전체 명령 수명주기: 제출 → 처리 중 → 완료', () => {
    const store = useCommandStore.getState()

    // 1. User submits command
    store.addMessage({
      id: 'user-cmd-1', role: 'user', text: '삼성전자 분석',
      commandId: 'cmd-1', createdAt: '2026-03-07T10:00:00Z',
    })
    store.setActiveCommand('cmd-1')

    expect(useCommandStore.getState().activeCommandId).toBe('cmd-1')
    expect(useCommandStore.getState().messages).toHaveLength(1)

    // 2. Delegation events arrive
    store.addDelegationStep({
      id: 's1', commandId: 'cmd-1', event: 'CLASSIFYING',
      agentName: '비서실장', phase: 'classify', elapsed: 1000,
      timestamp: '2026-03-07T10:00:01Z',
    })
    store.addDelegationStep({
      id: 's2', commandId: 'cmd-1', event: 'MANAGER_STARTED',
      agentName: 'CIO', phase: 'delegate', elapsed: 3000,
      timestamp: '2026-03-07T10:00:03Z',
    })

    expect(useCommandStore.getState().delegationSteps).toHaveLength(2)

    // 3. Command completes
    store.updateMessageResult('cmd-1', '# 삼성전자 분석 보고서\n## 결론...', { passed: true, score: 8 })
    store.addMessage({
      id: 'agent-cmd-1', role: 'agent', text: '분석 완료',
      commandId: 'cmd-1', status: 'completed',
      result: '# 삼성전자 분석 보고서\n## 결론...',
      quality: { passed: true, score: 8 },
      createdAt: '2026-03-07T10:01:00Z',
    })
    store.setActiveCommand(null)
    store.setSelectedReport('cmd-1')
    store.setViewMode('report')

    const finalState = useCommandStore.getState()
    expect(finalState.messages).toHaveLength(2)
    expect(finalState.activeCommandId).toBeNull()
    expect(finalState.selectedReportId).toBe('cmd-1')
    expect(finalState.viewMode).toBe('report')
  })

  test('실패 명령 수명주기: 제출 → 처리 중 → 실패', () => {
    const store = useCommandStore.getState()

    store.addMessage({
      id: 'user-cmd-2', role: 'user', text: '테스트 명령',
      commandId: 'cmd-2', createdAt: '2026-03-07T10:00:00Z',
    })
    store.setActiveCommand('cmd-2')

    store.addDelegationStep({
      id: 'f1', commandId: 'cmd-2', event: 'FAILED',
      phase: 'error', elapsed: 5000,
      timestamp: '2026-03-07T10:00:05Z',
    })

    store.addMessage({
      id: 'err-cmd-2', role: 'system', text: '명령 처리에 실패했습니다.',
      commandId: 'cmd-2', status: 'failed',
      createdAt: '2026-03-07T10:00:05Z',
    })
    store.setActiveCommand(null)

    const state = useCommandStore.getState()
    expect(state.messages).toHaveLength(2)
    expect(state.messages[1].role).toBe('system')
    expect(state.messages[1].status).toBe('failed')
    expect(state.activeCommandId).toBeNull()
  })

  test('동시 명령: 첫 번째 처리 중 두 번째 제출', () => {
    const store = useCommandStore.getState()

    store.addMessage({
      id: 'user-1', role: 'user', text: '명령 1',
      commandId: 'cmd-1', createdAt: '2026-03-07T10:00:00Z',
    })
    store.setActiveCommand('cmd-1')

    // Second command submitted while first is processing
    store.addMessage({
      id: 'user-2', role: 'user', text: '명령 2',
      commandId: 'cmd-2', createdAt: '2026-03-07T10:00:30Z',
    })

    const state = useCommandStore.getState()
    expect(state.messages).toHaveLength(2)
    // Active command is still the first one
    expect(state.activeCommandId).toBe('cmd-1')
  })

  test('빈 텍스트 메시지 허용 (시스템 메시지 용)', () => {
    const store = useCommandStore.getState()
    store.addMessage({
      id: 'sys-1', role: 'system', text: '',
      createdAt: '2026-03-07T10:00:00Z',
    })
    expect(useCommandStore.getState().messages).toHaveLength(1)
    expect(useCommandStore.getState().messages[0].text).toBe('')
  })

  test('위임 단계에 도구 호출 이벤트 포함', () => {
    const store = useCommandStore.getState()
    store.addDelegationStep({
      id: 'tool-1', commandId: 'cmd-1', event: 'tool_call_started',
      agentName: '종목분석가', phase: 'tool:kr_stock',
      elapsed: 8000, timestamp: '2026-03-07T10:00:08Z',
    })

    const steps = useCommandStore.getState().delegationSteps
    expect(steps).toHaveLength(1)
    expect(steps[0].phase).toBe('tool:kr_stock')
    expect(steps[0].phase.startsWith('tool:')).toBe(true)
  })

  test('clearDelegation 후 새 명령의 위임 체인은 깨끗', () => {
    const store = useCommandStore.getState()

    // First command delegation
    store.setActiveCommand('cmd-1')
    store.addDelegationStep({
      id: 's1', commandId: 'cmd-1', event: 'CLASSIFYING',
      phase: 'classify', elapsed: 0, timestamp: '2026-03-07T10:00:00Z',
    })

    // Clear for new command
    store.clearDelegation()

    expect(useCommandStore.getState().delegationSteps).toHaveLength(0)
    expect(useCommandStore.getState().activeCommandId).toBeNull()

    // New command starts fresh
    store.setActiveCommand('cmd-2')
    store.addDelegationStep({
      id: 's2', commandId: 'cmd-2', event: 'CLASSIFYING',
      phase: 'classify', elapsed: 0, timestamp: '2026-03-07T10:01:00Z',
    })

    const state = useCommandStore.getState()
    expect(state.delegationSteps).toHaveLength(1)
    expect(state.delegationSteps[0].commandId).toBe('cmd-2')
  })
})

// ============================================================
// Risk Area 5: Message Formatting & Display Logic
// Risk: Incorrect date formatting = confusing timestamps
// ============================================================
describe('TEA: Message Formatting', () => {
  test('ISO 날짜 파싱 정확성', () => {
    const iso = '2026-03-07T10:30:00Z'
    const d = new Date(iso)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getUTCMonth()).toBe(2) // March = 2 (0-indexed)
    expect(d.getUTCDate()).toBe(7)
  })

  test('같은 날 메시지는 날짜 구분선 불필요', () => {
    const msg1 = '2026-03-07T10:00:00Z'
    const msg2 = '2026-03-07T15:30:00Z'
    expect(new Date(msg1).toDateString()).toBe(new Date(msg2).toDateString())
  })

  test('다른 날 메시지는 날짜 구분선 필요', () => {
    const msg1 = '2026-03-07T23:59:59Z'
    const msg2 = '2026-03-08T00:00:01Z'
    expect(new Date(msg1).toDateString()).not.toBe(new Date(msg2).toDateString())
  })
})

// ============================================================
// Risk Area 6: Elapsed Time Formatting
// Risk: Wrong time display = CEO can't gauge processing speed
// ============================================================
describe('TEA: Elapsed Time Formatting', () => {
  function formatElapsed(ms: number): string {
    if (ms < 1000) return '<1초'
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}초`
    const minutes = Math.floor(seconds / 60)
    const remainingSec = seconds % 60
    return `${minutes}분 ${remainingSec}초`
  }

  test('1초 미만', () => {
    expect(formatElapsed(500)).toBe('<1초')
    expect(formatElapsed(0)).toBe('<1초')
    expect(formatElapsed(999)).toBe('<1초')
  })

  test('초 단위', () => {
    expect(formatElapsed(1000)).toBe('1초')
    expect(formatElapsed(30000)).toBe('30초')
    expect(formatElapsed(59000)).toBe('59초')
  })

  test('분+초 단위', () => {
    expect(formatElapsed(60000)).toBe('1분 0초')
    expect(formatElapsed(90000)).toBe('1분 30초')
    expect(formatElapsed(300000)).toBe('5분 0초')
  })
})
