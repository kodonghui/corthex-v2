import { describe, test, expect, beforeEach } from 'bun:test'
import { useNotificationStore } from '../stores/notification-store'
import { useActivityStore } from '../stores/activity-store'
import { useWsStore } from '../stores/ws-store'

describe('notification-store', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [], unreadCount: 0 })
  })

  test('addNotification: 알림 추가 + unreadCount 증가', () => {
    const { addNotification } = useNotificationStore.getState()
    addNotification({ type: 'info', message: '테스트 알림' })

    const state = useNotificationStore.getState()
    expect(state.notifications).toHaveLength(1)
    expect(state.notifications[0].message).toBe('테스트 알림')
    expect(state.notifications[0].read).toBe(false)
    expect(state.unreadCount).toBe(1)
  })

  test('markAllRead: 모든 알림 읽음 처리', () => {
    const { addNotification, markAllRead } = useNotificationStore.getState()
    addNotification({ type: 'info', message: '알림 1' })
    addNotification({ type: 'success', message: '알림 2' })

    markAllRead()

    const state = useNotificationStore.getState()
    expect(state.unreadCount).toBe(0)
    expect(state.notifications.every((n) => n.read)).toBe(true)
  })

  test('clearAll: 전체 초기화', () => {
    const { addNotification, clearAll } = useNotificationStore.getState()
    addNotification({ type: 'error', message: '에러' })
    clearAll()

    const state = useNotificationStore.getState()
    expect(state.notifications).toHaveLength(0)
    expect(state.unreadCount).toBe(0)
  })

  test('최대 50개 제한', () => {
    const { addNotification } = useNotificationStore.getState()
    for (let i = 0; i < 55; i++) {
      addNotification({ type: 'info', message: `알림 ${i}` })
    }
    expect(useNotificationStore.getState().notifications).toHaveLength(50)
  })
})

describe('activity-store', () => {
  beforeEach(() => {
    useActivityStore.setState({ logs: [], isStreaming: false })
  })

  test('addLog: 로그 추가', () => {
    const { addLog } = useActivityStore.getState()
    addLog({ type: 'chat', phase: 'start', action: '채팅 시작' })

    const state = useActivityStore.getState()
    expect(state.logs).toHaveLength(1)
    expect(state.logs[0].action).toBe('채팅 시작')
    expect(state.logs[0].type).toBe('chat')
  })

  test('clearLogs: 로그 초기화', () => {
    const { addLog, clearLogs } = useActivityStore.getState()
    addLog({ type: 'tool_call', phase: 'end', action: '도구 실행' })
    clearLogs()

    expect(useActivityStore.getState().logs).toHaveLength(0)
  })

  test('최대 200개 제한', () => {
    const { addLog } = useActivityStore.getState()
    for (let i = 0; i < 210; i++) {
      addLog({ type: 'system', phase: 'start', action: `로그 ${i}` })
    }
    expect(useActivityStore.getState().logs).toHaveLength(200)
  })
})

describe('ws-store', () => {
  beforeEach(() => {
    useWsStore.setState({ socket: null, isConnected: false })
  })

  test('초기 상태: 미연결', () => {
    const state = useWsStore.getState()
    expect(state.socket).toBeNull()
    expect(state.isConnected).toBe(false)
  })

  test('disconnect: 소켓 정리', () => {
    // 미연결 상태에서 disconnect 호출해도 에러 없음
    useWsStore.getState().disconnect()
    const state = useWsStore.getState()
    expect(state.socket).toBeNull()
    expect(state.isConnected).toBe(false)
  })

  test('send: 미연결 시 무시', () => {
    // 미연결 상태에서 send 호출해도 에러 없음
    expect(() => {
      useWsStore.getState().send('test', { data: 'hello' })
    }).not.toThrow()
  })
})
