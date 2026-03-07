import { describe, test, expect, beforeEach } from 'bun:test'
import { useCommandStore } from '../stores/command-store'

describe('command-store', () => {
  beforeEach(() => {
    useCommandStore.setState({
      messages: [],
      activeCommandId: null,
      delegationSteps: [],
      selectedReportId: null,
      viewMode: 'chat',
    })
  })

  test('초기 상태', () => {
    const state = useCommandStore.getState()
    expect(state.messages).toHaveLength(0)
    expect(state.activeCommandId).toBeNull()
    expect(state.delegationSteps).toHaveLength(0)
    expect(state.selectedReportId).toBeNull()
    expect(state.viewMode).toBe('chat')
  })

  test('addMessage: 메시지 추가', () => {
    const { addMessage } = useCommandStore.getState()
    addMessage({
      id: 'msg-1',
      role: 'user',
      text: '삼성전자 분석해줘',
      commandId: 'cmd-1',
      createdAt: '2026-03-07T10:00:00Z',
    })

    const state = useCommandStore.getState()
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0].text).toBe('삼성전자 분석해줘')
    expect(state.messages[0].role).toBe('user')
  })

  test('setMessages: 메시지 목록 교체', () => {
    const { addMessage, setMessages } = useCommandStore.getState()
    addMessage({ id: '1', role: 'user', text: 'old', createdAt: '2026-01-01T00:00:00Z' })

    setMessages([
      { id: '2', role: 'agent', text: 'new', createdAt: '2026-01-02T00:00:00Z' },
    ])

    const state = useCommandStore.getState()
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0].id).toBe('2')
  })

  test('setActiveCommand: 활성 명령 설정', () => {
    const { setActiveCommand } = useCommandStore.getState()
    setActiveCommand('cmd-123')
    expect(useCommandStore.getState().activeCommandId).toBe('cmd-123')
  })

  test('addDelegationStep: 위임 단계 추가', () => {
    const { addDelegationStep } = useCommandStore.getState()
    addDelegationStep({
      id: 'step-1',
      commandId: 'cmd-1',
      event: 'CLASSIFYING',
      agentName: '비서실장',
      phase: 'classify',
      elapsed: 1000,
      timestamp: '2026-03-07T10:00:01Z',
    })

    const state = useCommandStore.getState()
    expect(state.delegationSteps).toHaveLength(1)
    expect(state.delegationSteps[0].event).toBe('CLASSIFYING')
    expect(state.delegationSteps[0].agentName).toBe('비서실장')
    expect(state.delegationSteps[0].children).toEqual([])
  })

  test('clearDelegation: 위임 체인 초기화', () => {
    const { addDelegationStep, setActiveCommand, clearDelegation } = useCommandStore.getState()
    setActiveCommand('cmd-1')
    addDelegationStep({
      id: 'step-1',
      commandId: 'cmd-1',
      event: 'CLASSIFYING',
      phase: 'classify',
      elapsed: 0,
      timestamp: '2026-03-07T10:00:00Z',
    })

    clearDelegation()

    const state = useCommandStore.getState()
    expect(state.delegationSteps).toHaveLength(0)
    expect(state.activeCommandId).toBeNull()
  })

  test('setSelectedReport + setViewMode: 보고서 선택 및 뷰 전환', () => {
    const { setSelectedReport, setViewMode } = useCommandStore.getState()
    setSelectedReport('cmd-1')
    setViewMode('report')

    const state = useCommandStore.getState()
    expect(state.selectedReportId).toBe('cmd-1')
    expect(state.viewMode).toBe('report')
  })

  test('updateMessageResult: 메시지 결과 업데이트', () => {
    const { addMessage, updateMessageResult } = useCommandStore.getState()
    addMessage({
      id: 'user-cmd-1',
      role: 'user',
      text: '분석해줘',
      commandId: 'cmd-1',
      createdAt: '2026-03-07T10:00:00Z',
    })

    updateMessageResult('cmd-1', '분석 결과입니다', { passed: true, score: 9 })

    const state = useCommandStore.getState()
    expect(state.messages[0].result).toBe('분석 결과입니다')
    expect(state.messages[0].status).toBe('completed')
    expect(state.messages[0].quality?.passed).toBe(true)
    expect(state.messages[0].quality?.score).toBe(9)
  })

  test('updateMessageResult: 일치하지 않는 commandId는 무시', () => {
    const { addMessage, updateMessageResult } = useCommandStore.getState()
    addMessage({
      id: 'user-cmd-1',
      role: 'user',
      text: '원본',
      commandId: 'cmd-1',
      createdAt: '2026-03-07T10:00:00Z',
    })

    updateMessageResult('cmd-999', '다른 결과', { passed: false })

    const state = useCommandStore.getState()
    expect(state.messages[0].result).toBeUndefined()
    expect(state.messages[0].status).toBeUndefined()
  })

  test('여러 위임 단계 추가 후 commandId로 필터링', () => {
    const { addDelegationStep } = useCommandStore.getState()
    addDelegationStep({
      id: 's1',
      commandId: 'cmd-1',
      event: 'CLASSIFYING',
      phase: 'classify',
      elapsed: 0,
      timestamp: '2026-03-07T10:00:00Z',
    })
    addDelegationStep({
      id: 's2',
      commandId: 'cmd-2',
      event: 'MANAGER_STARTED',
      phase: 'delegate',
      elapsed: 500,
      timestamp: '2026-03-07T10:00:01Z',
    })
    addDelegationStep({
      id: 's3',
      commandId: 'cmd-1',
      event: 'COMPLETED',
      phase: 'done',
      elapsed: 5000,
      timestamp: '2026-03-07T10:00:05Z',
    })

    const state = useCommandStore.getState()
    const cmd1Steps = state.delegationSteps.filter((s) => s.commandId === 'cmd-1')
    expect(cmd1Steps).toHaveLength(2)
    expect(cmd1Steps[0].event).toBe('CLASSIFYING')
    expect(cmd1Steps[1].event).toBe('COMPLETED')
  })

  test('다중 메시지 추가 순서 보존', () => {
    const { addMessage } = useCommandStore.getState()
    addMessage({ id: '1', role: 'user', text: '첫 번째', createdAt: '2026-03-07T10:00:00Z' })
    addMessage({ id: '2', role: 'agent', text: '두 번째', createdAt: '2026-03-07T10:00:01Z' })
    addMessage({ id: '3', role: 'system', text: '세 번째', createdAt: '2026-03-07T10:00:02Z' })

    const state = useCommandStore.getState()
    expect(state.messages).toHaveLength(3)
    expect(state.messages[0].text).toBe('첫 번째')
    expect(state.messages[1].text).toBe('두 번째')
    expect(state.messages[2].text).toBe('세 번째')
  })

  test('viewMode 기본값은 chat', () => {
    expect(useCommandStore.getState().viewMode).toBe('chat')
  })

  test('setViewMode: chat과 report 전환', () => {
    const { setViewMode } = useCommandStore.getState()
    setViewMode('report')
    expect(useCommandStore.getState().viewMode).toBe('report')
    setViewMode('chat')
    expect(useCommandStore.getState().viewMode).toBe('chat')
  })
})
