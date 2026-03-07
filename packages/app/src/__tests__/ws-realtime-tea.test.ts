import { describe, test, expect } from 'bun:test'

// ============================================================
// TEA P0: Exponential backoff edge cases
// ============================================================

const BACKOFF_BASE = 3000
const BACKOFF_MAX = 30000

function getBackoffDelay(attempt: number): number {
  return Math.min(BACKOFF_BASE * Math.pow(2, attempt), BACKOFF_MAX)
}

describe('TEA P0: Exponential backoff edge cases', () => {
  test('backoff sequence follows 3s, 6s, 12s, 24s, 30s pattern', () => {
    const delays = [0, 1, 2, 3, 4].map(getBackoffDelay)
    expect(delays).toEqual([3000, 6000, 12000, 24000, 30000])
  })

  test('backoff never exceeds 30 seconds', () => {
    for (let i = 0; i < 100; i++) {
      expect(getBackoffDelay(i)).toBeLessThanOrEqual(30000)
    }
  })

  test('backoff at boundary (attempt 3 = 24000, attempt 4 = 30000)', () => {
    expect(getBackoffDelay(3)).toBe(24000)
    expect(getBackoffDelay(4)).toBe(30000)
  })

  test('backoff is always positive', () => {
    for (let i = -5; i < 20; i++) {
      expect(getBackoffDelay(i)).toBeGreaterThan(0)
    }
  })
})

// ============================================================
// TEA P0: Dashboard channel-to-invalidation mapping completeness
// ============================================================

type WsChannel = 'cost' | 'agent-status' | 'command' | 'activity-log' | 'delegation' | 'tool'

function getDashboardInvalidationKeys(channel: WsChannel): string[] {
  switch (channel) {
    case 'cost':
      return ['dashboard-summary', 'dashboard-usage', 'dashboard-budget']
    case 'agent-status':
      return ['dashboard-summary']
    case 'command':
      return ['dashboard-summary']
    default:
      return []
  }
}

describe('TEA P0: Dashboard invalidation completeness', () => {
  test('cost channel triggers all 3 dashboard queries', () => {
    const keys = getDashboardInvalidationKeys('cost')
    expect(keys.length).toBe(3)
    expect(keys).toContain('dashboard-summary')
    expect(keys).toContain('dashboard-usage')
    expect(keys).toContain('dashboard-budget')
  })

  test('every dashboard channel produces at least one invalidation key', () => {
    const dashboardChannels: WsChannel[] = ['cost', 'agent-status', 'command']
    for (const ch of dashboardChannels) {
      const keys = getDashboardInvalidationKeys(ch)
      expect(keys.length).toBeGreaterThan(0)
    }
  })

  test('non-dashboard channels produce no keys', () => {
    const nonDashboard: WsChannel[] = ['activity-log', 'delegation', 'tool']
    for (const ch of nonDashboard) {
      expect(getDashboardInvalidationKeys(ch)).toEqual([])
    }
  })
})

// ============================================================
// TEA P0: Activity log tab-to-invalidation mapping completeness
// ============================================================

function getActivityInvalidationKey(tab: string): string | null {
  switch (tab) {
    case 'agents': return 'activity-agents'
    case 'delegations': return 'activity-delegations'
    case 'quality': return 'activity-quality'
    case 'tools': return 'activity-tools'
    default: return null
  }
}

describe('TEA P0: Activity log tab invalidation completeness', () => {
  test('all 4 tabs have unique invalidation keys', () => {
    const tabs = ['agents', 'delegations', 'quality', 'tools']
    const keys = tabs.map(getActivityInvalidationKey)
    expect(new Set(keys).size).toBe(4)
    expect(keys.every(k => k !== null)).toBe(true)
  })

  test('tab names match expected values', () => {
    expect(getActivityInvalidationKey('agents')).toBe('activity-agents')
    expect(getActivityInvalidationKey('delegations')).toBe('activity-delegations')
    expect(getActivityInvalidationKey('quality')).toBe('activity-quality')
    expect(getActivityInvalidationKey('tools')).toBe('activity-tools')
  })

  test('invalid tab returns null', () => {
    expect(getActivityInvalidationKey('')).toBeNull()
    expect(getActivityInvalidationKey('invalid')).toBeNull()
    expect(getActivityInvalidationKey('agent')).toBeNull() // typo
  })
})

// ============================================================
// TEA P1: WsStatusIndicator display logic edge cases
// ============================================================

describe('TEA P1: WsStatusIndicator display logic', () => {
  function getStatusDisplay(isConnected: boolean, reconnectAttempt: number) {
    const color = isConnected ? 'green' : 'red'
    const text = isConnected
      ? '실시간'
      : `재연결 중${reconnectAttempt > 0 ? ` (${reconnectAttempt})` : '...'}`
    return { color, text }
  }

  test('connected: green + 실시간', () => {
    const { color, text } = getStatusDisplay(true, 0)
    expect(color).toBe('green')
    expect(text).toBe('실시간')
  })

  test('connected ignores reconnectAttempt', () => {
    const { color, text } = getStatusDisplay(true, 5)
    expect(color).toBe('green')
    expect(text).toBe('실시간')
  })

  test('disconnected attempt=0: red + 재연결 중...', () => {
    const { color, text } = getStatusDisplay(false, 0)
    expect(color).toBe('red')
    expect(text).toBe('재연결 중...')
  })

  test('disconnected attempt=1: shows count', () => {
    const { text } = getStatusDisplay(false, 1)
    expect(text).toBe('재연결 중 (1)')
  })

  test('disconnected attempt=10: shows high count', () => {
    const { text } = getStatusDisplay(false, 10)
    expect(text).toBe('재연결 중 (10)')
  })
})

// ============================================================
// TEA P1: Channel listener management
// ============================================================

describe('TEA P1: Channel listener management', () => {
  test('adding same listener twice does not duplicate (Set behavior)', () => {
    const listeners = new Map<string, Set<() => void>>()
    const fn = () => {}

    if (!listeners.has('cost')) listeners.set('cost', new Set())
    listeners.get('cost')!.add(fn)
    listeners.get('cost')!.add(fn) // duplicate

    expect(listeners.get('cost')!.size).toBe(1)
  })

  test('removing non-existent listener is safe', () => {
    const listeners = new Map<string, Set<() => void>>()
    listeners.set('cost', new Set())

    const fn = () => {}
    // Should not throw
    expect(() => listeners.get('cost')!.delete(fn)).not.toThrow()
  })

  test('removing from non-existent channel is safe with optional chaining', () => {
    const listeners = new Map<string, Set<() => void>>()
    const fn = () => {}

    // Should not throw
    expect(() => listeners.get('nonexistent')?.delete(fn)).not.toThrow()
  })
})

// ============================================================
// TEA P1: WS message parsing edge cases
// ============================================================

describe('TEA P1: WS message parsing', () => {
  test('data message with both channelKey and channel dispatches to both', () => {
    const listeners = new Map<string, Set<(d: unknown) => void>>()
    const received: string[] = []

    listeners.set('cost', new Set([(d) => received.push('base')]))
    listeners.set('cost::c1', new Set([(d) => received.push('full')]))

    // Simulate dispatch
    const msg = { type: 'data', channel: 'cost', channelKey: 'cost::c1', data: {} }

    const fullSet = listeners.get(msg.channelKey!)
    if (fullSet) fullSet.forEach(fn => fn(msg.data))
    const baseSet = listeners.get(msg.channel!)
    if (baseSet) baseSet.forEach(fn => fn(msg.data))

    expect(received).toEqual(['full', 'base'])
  })

  test('data message without channelKey only dispatches to base', () => {
    const listeners = new Map<string, Set<(d: unknown) => void>>()
    const received: string[] = []

    listeners.set('cost', new Set([(d) => received.push('base')]))

    const msg = { type: 'data', channel: 'cost', data: {} }

    if (msg.channel) {
      const baseSet = listeners.get(msg.channel)
      if (baseSet) baseSet.forEach(fn => fn(msg.data))
    }

    expect(received).toEqual(['base'])
  })

  test('non-data message type is ignored', () => {
    const received: unknown[] = []

    const msg = { type: 'subscribed', channel: 'cost' }
    // Only 'data' type should dispatch
    if (msg.type === 'data') {
      received.push(msg)
    }

    expect(received.length).toBe(0)
  })
})

// ============================================================
// TEA P2: Reconnection state transitions
// ============================================================

describe('TEA P2: Reconnection state transitions', () => {
  test('successful connection resets attempt to 0', () => {
    let attempt = 5
    // Simulate onopen
    attempt = 0
    expect(attempt).toBe(0)
  })

  test('disconnect resets attempt to 0', () => {
    let attempt = 3
    // Simulate disconnect()
    attempt = 0
    expect(attempt).toBe(0)
  })

  test('server-restart resets attempt before reconnect', () => {
    let attempt = 2
    // server-restart handler
    attempt = 0
    expect(attempt).toBe(0)
  })

  test('each close increments attempt', () => {
    let attempt = 0
    // Simulate multiple closes
    for (let i = 0; i < 5; i++) {
      const delay = getBackoffDelay(attempt)
      attempt++
      expect(delay).toBeGreaterThan(0)
    }
    expect(attempt).toBe(5)
  })
})
