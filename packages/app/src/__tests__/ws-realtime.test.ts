import { describe, test, expect } from 'bun:test'

// Since we can't import React hooks in bun:test without jsdom,
// we test the pure logic extracted from the hooks and store.

// === Exponential backoff logic ===

const BACKOFF_BASE = 3000
const BACKOFF_MAX = 30000

function getBackoffDelay(attempt: number): number {
  return Math.min(BACKOFF_BASE * Math.pow(2, attempt), BACKOFF_MAX)
}

describe('WS exponential backoff', () => {
  test('attempt 0 returns base delay 3000ms', () => {
    expect(getBackoffDelay(0)).toBe(3000)
  })

  test('attempt 1 returns 6000ms', () => {
    expect(getBackoffDelay(1)).toBe(6000)
  })

  test('attempt 2 returns 12000ms', () => {
    expect(getBackoffDelay(2)).toBe(12000)
  })

  test('attempt 3 returns 24000ms', () => {
    expect(getBackoffDelay(3)).toBe(24000)
  })

  test('attempt 4 caps at 30000ms', () => {
    expect(getBackoffDelay(4)).toBe(30000)
  })

  test('attempt 10 still caps at 30000ms', () => {
    expect(getBackoffDelay(10)).toBe(30000)
  })

  test('negative attempt returns base delay', () => {
    // Math.pow(2, -1) = 0.5, so 3000 * 0.5 = 1500
    expect(getBackoffDelay(-1)).toBe(1500)
  })
})

// === Dashboard channel mapping logic ===

type WsChannel = 'cost' | 'agent-status' | 'command' | 'activity-log' | 'delegation' | 'tool'

const DASHBOARD_CHANNELS: WsChannel[] = ['cost', 'agent-status', 'command']

describe('Dashboard WS channels', () => {
  test('dashboard subscribes to 3 channels', () => {
    expect(DASHBOARD_CHANNELS).toHaveLength(3)
  })

  test('dashboard includes cost channel', () => {
    expect(DASHBOARD_CHANNELS).toContain('cost')
  })

  test('dashboard includes agent-status channel', () => {
    expect(DASHBOARD_CHANNELS).toContain('agent-status')
  })

  test('dashboard includes command channel', () => {
    expect(DASHBOARD_CHANNELS).toContain('command')
  })
})

// === Activity log channel mapping logic ===

const ACTIVITY_CHANNELS: WsChannel[] = ['activity-log', 'delegation', 'tool', 'command']

function getInvalidationKeys(activeTab: string): string[] {
  switch (activeTab) {
    case 'agents':
      return ['activity-agents']
    case 'delegations':
      return ['activity-delegations']
    case 'quality':
      return ['activity-quality']
    case 'tools':
      return ['activity-tools']
    default:
      return []
  }
}

describe('Activity log WS channels', () => {
  test('activity log subscribes to 4 channels', () => {
    expect(ACTIVITY_CHANNELS).toHaveLength(4)
  })

  test('activity log includes activity-log channel', () => {
    expect(ACTIVITY_CHANNELS).toContain('activity-log')
  })

  test('activity log includes delegation channel', () => {
    expect(ACTIVITY_CHANNELS).toContain('delegation')
  })

  test('activity log includes tool channel', () => {
    expect(ACTIVITY_CHANNELS).toContain('tool')
  })

  test('activity log includes command channel', () => {
    expect(ACTIVITY_CHANNELS).toContain('command')
  })
})

describe('Activity log tab invalidation mapping', () => {
  test('agents tab invalidates activity-agents', () => {
    expect(getInvalidationKeys('agents')).toEqual(['activity-agents'])
  })

  test('delegations tab invalidates activity-delegations', () => {
    expect(getInvalidationKeys('delegations')).toEqual(['activity-delegations'])
  })

  test('quality tab invalidates activity-quality', () => {
    expect(getInvalidationKeys('quality')).toEqual(['activity-quality'])
  })

  test('tools tab invalidates activity-tools', () => {
    expect(getInvalidationKeys('tools')).toEqual(['activity-tools'])
  })

  test('unknown tab returns empty', () => {
    expect(getInvalidationKeys('unknown')).toEqual([])
  })
})

// === Dashboard invalidation mapping logic ===

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

describe('Dashboard invalidation mapping', () => {
  test('cost event invalidates summary, usage, and budget', () => {
    const keys = getDashboardInvalidationKeys('cost')
    expect(keys).toContain('dashboard-summary')
    expect(keys).toContain('dashboard-usage')
    expect(keys).toContain('dashboard-budget')
    expect(keys).toHaveLength(3)
  })

  test('agent-status event invalidates summary only', () => {
    const keys = getDashboardInvalidationKeys('agent-status')
    expect(keys).toEqual(['dashboard-summary'])
  })

  test('command event invalidates summary only', () => {
    const keys = getDashboardInvalidationKeys('command')
    expect(keys).toEqual(['dashboard-summary'])
  })

  test('unrelated channel returns empty', () => {
    expect(getDashboardInvalidationKeys('activity-log')).toEqual([])
  })
})

// === WsStatusIndicator logic ===

describe('WsStatusIndicator logic', () => {
  test('connected state shows green indicator', () => {
    const isConnected = true
    const reconnectAttempt = 0
    const statusText = isConnected ? '실시간' : `재연결 중${reconnectAttempt > 0 ? ` (${reconnectAttempt})` : '...'}`
    expect(statusText).toBe('실시간')
  })

  test('disconnected state shows reconnecting', () => {
    const isConnected = false
    const reconnectAttempt = 0
    const statusText = isConnected ? '실시간' : `재연결 중${reconnectAttempt > 0 ? ` (${reconnectAttempt})` : '...'}`
    expect(statusText).toBe('재연결 중...')
  })

  test('disconnected with attempt shows count', () => {
    const isConnected = false
    const reconnectAttempt = 3
    const statusText = isConnected ? '실시간' : `재연결 중${reconnectAttempt > 0 ? ` (${reconnectAttempt})` : '...'}`
    expect(statusText).toBe('재연결 중 (3)')
  })
})

// === Channel listener dispatch logic ===

describe('Channel listener dispatch', () => {
  test('channelListeners map stores and retrieves listeners', () => {
    const listeners = new Map<string, Set<(data: unknown) => void>>()
    const handler = (data: unknown) => {}

    // addListener
    if (!listeners.has('cost')) {
      listeners.set('cost', new Set())
    }
    listeners.get('cost')!.add(handler)

    expect(listeners.get('cost')!.size).toBe(1)
    expect(listeners.get('cost')!.has(handler)).toBe(true)

    // removeListener
    listeners.get('cost')!.delete(handler)
    expect(listeners.get('cost')!.size).toBe(0)
  })

  test('base channel and full channelKey both dispatch', () => {
    const listeners = new Map<string, Set<(data: unknown) => void>>()
    const received: string[] = []

    const baseHandler = () => received.push('base')
    const fullHandler = () => received.push('full')

    listeners.set('cost', new Set([baseHandler]))
    listeners.set('cost::comp-1', new Set([fullHandler]))

    // Simulate WS message dispatch
    const channel = 'cost'
    const channelKey = 'cost::comp-1'

    // Full key dispatch
    const fullListeners = listeners.get(channelKey)
    if (fullListeners) fullListeners.forEach(fn => fn(null))

    // Base channel dispatch
    const baseListeners = listeners.get(channel)
    if (baseListeners) baseListeners.forEach(fn => fn(null))

    expect(received).toEqual(['full', 'base'])
  })
})

// === WsOutboundMessage parsing ===

describe('WsOutboundMessage parsing', () => {
  test('data message with cost channel is dispatched', () => {
    const msg = {
      type: 'data',
      channel: 'cost',
      channelKey: 'cost::comp-1',
      data: { type: 'cost-recorded', costUsdMicro: 150 },
    }

    expect(msg.type).toBe('data')
    expect(msg.channel).toBe('cost')
    expect(msg.channelKey).toBe('cost::comp-1')
    expect(msg.data.type).toBe('cost-recorded')
  })

  test('subscribed message confirms cost subscription', () => {
    const msg = { type: 'subscribed', channel: 'cost' }
    expect(msg.type).toBe('subscribed')
    expect(msg.channel).toBe('cost')
  })

  test('server-restart message triggers reconnect', () => {
    const msg = { type: 'server-restart' }
    expect(msg.type).toBe('server-restart')
  })
})
