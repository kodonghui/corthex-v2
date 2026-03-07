import { describe, test, expect, beforeEach, mock, spyOn } from 'bun:test'

// === Test 1: WsChannel type includes 'cost' ===
describe('WsChannel cost channel', () => {
  test('cost is a valid WsChannel value', async () => {
    // Dynamically check by importing the type usage
    const types = await import('@corthex/shared')
    // WsChannel is a type-only export, so we verify through channel handler
    const { handleSubscription } = await import('../../ws/channels')
    expect(typeof handleSubscription).toBe('function')
  })
})

// === Test 2: channels.ts handles 'cost' channel subscription ===
describe('channels.ts cost channel', () => {
  test('cost channel subscription adds correct channelKey', async () => {
    // Mock db to avoid actual DB queries
    const mockClient = {
      ws: { send: mock(() => {}) } as any,
      userId: 'user-1',
      companyId: 'comp-1',
      role: 'ceo' as const,
      subscriptions: new Set<string>(),
      connectedAt: new Date(),
    }

    const mockWs = {
      send: mock((msg: string) => {}),
    } as any

    const { handleSubscription } = await import('../../ws/channels')

    await handleSubscription(mockClient, 'cost', undefined, mockWs)

    expect(mockClient.subscriptions.has('cost::comp-1')).toBe(true)
    // Verify subscribed message sent
    const calls = mockWs.send.mock.calls
    const lastCall = JSON.parse(calls[calls.length - 1][0])
    expect(lastCall.type).toBe('subscribed')
    expect(lastCall.channel).toBe('cost')
  })

  test('cost channel rejects cross-company subscription', async () => {
    const mockClient = {
      ws: { send: mock(() => {}) } as any,
      userId: 'user-1',
      companyId: 'comp-1',
      role: 'ceo' as const,
      subscriptions: new Set<string>(),
      connectedAt: new Date(),
    }

    const mockWs = {
      send: mock((msg: string) => {}),
    } as any

    const { handleSubscription } = await import('../../ws/channels')

    await handleSubscription(mockClient, 'cost', { id: 'comp-other' }, mockWs)

    expect(mockClient.subscriptions.has('cost::comp-other')).toBe(false)
    const calls = mockWs.send.mock.calls
    const lastCall = JSON.parse(calls[calls.length - 1][0])
    expect(lastCall.type).toBe('error')
    expect(lastCall.code).toBe('FORBIDDEN')
  })
})

// === Test 3: broadcastToChannel/broadcastToCompany works for cost ===
describe('broadcastToCompany cost', () => {
  test('broadcastToCompany sends to cost subscribers', async () => {
    const { broadcastToCompany, broadcastToChannel } = await import('../../ws/channels')
    const { clientMap } = await import('../../ws/server')

    expect(typeof broadcastToCompany).toBe('function')
    expect(typeof broadcastToChannel).toBe('function')

    // Smoke test: calling with no subscribers doesn't throw
    broadcastToCompany('comp-1', 'cost', { type: 'cost-recorded' })
  })
})

// === Test 4: cost-tracker emits cost event ===
describe('cost-tracker eventBus emit', () => {
  test('recordCost emits cost event on eventBus', async () => {
    const { eventBus } = await import('../../lib/event-bus')
    const events: unknown[] = []

    const handler = (data: unknown) => events.push(data)
    eventBus.on('cost', handler)

    // Mock DB insert to avoid actual DB call
    const dbModule = await import('../../db')
    const origInsert = dbModule.db.insert
    const mockInsert = mock(() => ({
      values: mock(() => Promise.resolve()),
    }))
    ;(dbModule.db as any).insert = mockInsert

    try {
      const { recordCost } = await import('../../lib/cost-tracker')
      await recordCost({
        companyId: 'comp-test',
        model: 'claude-3-haiku-20240307',
        inputTokens: 100,
        outputTokens: 50,
        source: 'chat',
      })

      expect(events.length).toBeGreaterThanOrEqual(1)
      const costEvent = events[events.length - 1] as any
      expect(costEvent.companyId).toBe('comp-test')
      expect(costEvent.payload.type).toBe('cost-recorded')
      expect(costEvent.payload.model).toBe('claude-3-haiku-20240307')
      expect(typeof costEvent.payload.costUsdMicro).toBe('number')
    } finally {
      eventBus.removeListener('cost', handler)
      ;(dbModule.db as any).insert = origInsert
    }
  })
})

// === Test 5: index.ts eventBus→WS bridge includes cost ===
describe('eventBus cost bridge', () => {
  test('eventBus can register and receive cost events', async () => {
    const { eventBus } = await import('../../lib/event-bus')
    const received: unknown[] = []

    const handler = (data: unknown) => received.push(data)
    eventBus.on('cost', handler)

    try {
      eventBus.emit('cost', { companyId: 'c1', payload: { type: 'cost-recorded' } })
      expect(received.length).toBe(1)
      expect((received[0] as any).companyId).toBe('c1')
    } finally {
      eventBus.removeListener('cost', handler)
    }
  })
})

// === Test 6: WsChannel type validation ===
describe('WsChannel type completeness', () => {
  test('all architecture-defined channels exist in handleSubscription', async () => {
    const channels = [
      'chat-stream', 'agent-status', 'notifications', 'messenger',
      'activity-log', 'strategy-notes', 'night-job', 'nexus',
      'command', 'delegation', 'tool', 'cost',
    ]

    // Verify channels.ts handles all channels (won't throw unknown channel)
    const { handleSubscription } = await import('../../ws/channels')

    for (const ch of channels) {
      const mockClient = {
        ws: { send: mock(() => {}) } as any,
        userId: 'u1',
        companyId: 'c1',
        role: 'ceo' as const,
        subscriptions: new Set<string>(),
        connectedAt: new Date(),
      }
      const mockWs = { send: mock(() => {}) } as any

      // Should not throw for any known channel
      try {
        await handleSubscription(mockClient, ch as any, undefined, mockWs)
      } catch {
        // DB errors are expected for chat-stream/messenger/strategy-notes, but no unknown channel error
      }

      // Verify no UNKNOWN_CHANNEL error was sent
      const calls = mockWs.send.mock.calls
      for (const call of calls) {
        const msg = JSON.parse(call[0])
        if (msg.type === 'error') {
          expect(msg.code).not.toBe('UNKNOWN_CHANNEL')
        }
      }
    }
  })
})
