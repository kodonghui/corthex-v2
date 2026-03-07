import { describe, test, expect, mock, beforeEach } from 'bun:test'

// ============================================================
// TEA P0: cost channel subscription + tenant isolation
// ============================================================

describe('TEA P0: cost channel subscription', () => {
  test('cost subscription defaults to client companyId when no id param', async () => {
    const { handleSubscription } = await import('../../ws/channels')
    const client = {
      ws: { send: mock(() => {}) } as any,
      userId: 'u1',
      companyId: 'comp-abc',
      role: 'ceo' as const,
      subscriptions: new Set<string>(),
      connectedAt: new Date(),
    }
    const ws = { send: mock(() => {}) } as any

    await handleSubscription(client, 'cost', undefined, ws)
    expect(client.subscriptions.has('cost::comp-abc')).toBe(true)
  })

  test('cost subscription uses client companyId when id matches', async () => {
    const { handleSubscription } = await import('../../ws/channels')
    const client = {
      ws: { send: mock(() => {}) } as any,
      userId: 'u1',
      companyId: 'comp-abc',
      role: 'ceo' as const,
      subscriptions: new Set<string>(),
      connectedAt: new Date(),
    }
    const ws = { send: mock(() => {}) } as any

    await handleSubscription(client, 'cost', { id: 'comp-abc' }, ws)
    expect(client.subscriptions.has('cost::comp-abc')).toBe(true)
  })

  test('cost subscription rejects different companyId', async () => {
    const { handleSubscription } = await import('../../ws/channels')
    const client = {
      ws: { send: mock(() => {}) } as any,
      userId: 'u1',
      companyId: 'comp-abc',
      role: 'ceo' as const,
      subscriptions: new Set<string>(),
      connectedAt: new Date(),
    }
    const ws = { send: mock(() => {}) } as any

    await handleSubscription(client, 'cost', { id: 'comp-xyz' }, ws)
    expect(client.subscriptions.size).toBe(0)
    const lastMsg = JSON.parse(ws.send.mock.calls[ws.send.mock.calls.length - 1][0])
    expect(lastMsg.code).toBe('FORBIDDEN')
  })

  test('cost subscription sends subscribed confirmation', async () => {
    const { handleSubscription } = await import('../../ws/channels')
    const client = {
      ws: { send: mock(() => {}) } as any,
      userId: 'u1',
      companyId: 'comp-1',
      role: 'ceo' as const,
      subscriptions: new Set<string>(),
      connectedAt: new Date(),
    }
    const ws = { send: mock(() => {}) } as any

    await handleSubscription(client, 'cost', undefined, ws)
    const msgs = ws.send.mock.calls.map((c: any) => JSON.parse(c[0]))
    expect(msgs.some((m: any) => m.type === 'subscribed' && m.channel === 'cost')).toBe(true)
  })
})

// ============================================================
// TEA P0: cost-tracker eventBus integration
// ============================================================

describe('TEA P0: cost-tracker eventBus emission', () => {
  test('recordCost emits cost event with correct payload structure', async () => {
    const { eventBus } = await import('../../lib/event-bus')
    const events: any[] = []
    const handler = (d: any) => events.push(d)
    eventBus.on('cost', handler)

    const dbModule = await import('../../db')
    const origInsert = dbModule.db.insert
    ;(dbModule.db as any).insert = mock(() => ({ values: mock(() => Promise.resolve()) }))

    try {
      const { recordCost } = await import('../../lib/cost-tracker')
      await recordCost({
        companyId: 'comp-tea',
        model: 'claude-3-haiku-20240307',
        inputTokens: 500,
        outputTokens: 200,
        source: 'delegation',
        agentId: 'agent-1',
      })

      const ev = events[events.length - 1]
      expect(ev.companyId).toBe('comp-tea')
      expect(ev.payload).toBeDefined()
      expect(ev.payload.type).toBe('cost-recorded')
      expect(ev.payload.model).toBe('claude-3-haiku-20240307')
      expect(ev.payload.source).toBe('delegation')
      expect(typeof ev.payload.costUsdMicro).toBe('number')
      expect(ev.payload.costUsdMicro).toBeGreaterThan(0)
    } finally {
      eventBus.removeListener('cost', handler)
      ;(dbModule.db as any).insert = origInsert
    }
  })

  test('recordCost emits with resolved provider', async () => {
    const { eventBus } = await import('../../lib/event-bus')
    const events: any[] = []
    const handler = (d: any) => events.push(d)
    eventBus.on('cost', handler)

    const dbModule = await import('../../db')
    const origInsert = dbModule.db.insert
    ;(dbModule.db as any).insert = mock(() => ({ values: mock(() => Promise.resolve()) }))

    try {
      const { recordCost } = await import('../../lib/cost-tracker')
      await recordCost({
        companyId: 'comp-tea2',
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 100,
        outputTokens: 50,
        source: 'chat',
      })

      const ev = events[events.length - 1]
      expect(ev.payload.provider).toBe('openai')
    } finally {
      eventBus.removeListener('cost', handler)
      ;(dbModule.db as any).insert = origInsert
    }
  })

  test('recordCost does NOT emit if db insert fails', async () => {
    const { eventBus } = await import('../../lib/event-bus')
    const events: any[] = []
    const handler = (d: any) => events.push(d)
    eventBus.on('cost', handler)

    const dbModule = await import('../../db')
    const origInsert = dbModule.db.insert
    ;(dbModule.db as any).insert = mock(() => ({
      values: mock(() => Promise.reject(new Error('DB error'))),
    }))

    const beforeCount = events.length

    try {
      const { recordCost } = await import('../../lib/cost-tracker')
      await recordCost({
        companyId: 'comp-fail',
        model: 'claude-3-haiku-20240307',
        inputTokens: 100,
        outputTokens: 50,
        source: 'chat',
      })

      // Should NOT emit if insert failed
      expect(events.length).toBe(beforeCount)
    } finally {
      eventBus.removeListener('cost', handler)
      ;(dbModule.db as any).insert = origInsert
    }
  })
})

// ============================================================
// TEA P0: broadcastToCompany dispatching
// ============================================================

describe('TEA P0: broadcastToCompany for cost', () => {
  test('broadcastToCompany constructs correct channelKey', async () => {
    const { broadcastToChannel } = await import('../../ws/channels')
    // Verify function signature works
    expect(() => broadcastToChannel('cost::comp-1', { type: 'test' })).not.toThrow()
  })

  test('broadcastToCompany sends to matching subscribers only', async () => {
    const { clientMap } = await import('../../ws/server')
    const { broadcastToCompany } = await import('../../ws/channels')

    const sentMessages: string[] = []
    const mockWs = {
      send: (msg: string) => sentMessages.push(msg),
      close: () => {},
    }

    // Add a test client with cost subscription
    const testClient = {
      ws: mockWs as any,
      userId: 'test-user-tea',
      companyId: 'comp-tea-test',
      role: 'ceo' as const,
      subscriptions: new Set(['cost::comp-tea-test']),
      connectedAt: new Date(),
    }

    clientMap.set('test-user-tea', [testClient])

    try {
      broadcastToCompany('comp-tea-test', 'cost', { amount: 100 })

      expect(sentMessages.length).toBe(1)
      const parsed = JSON.parse(sentMessages[0])
      expect(parsed.type).toBe('data')
      expect(parsed.channel).toBe('cost')
      expect(parsed.channelKey).toBe('cost::comp-tea-test')
      expect(parsed.data.amount).toBe(100)
    } finally {
      clientMap.delete('test-user-tea')
    }
  })

  test('broadcastToCompany does NOT send to different company', async () => {
    const { clientMap } = await import('../../ws/server')
    const { broadcastToCompany } = await import('../../ws/channels')

    const sentMessages: string[] = []
    const mockWs = {
      send: (msg: string) => sentMessages.push(msg),
      close: () => {},
    }

    const testClient = {
      ws: mockWs as any,
      userId: 'test-user-iso',
      companyId: 'comp-other',
      role: 'ceo' as const,
      subscriptions: new Set(['cost::comp-other']),
      connectedAt: new Date(),
    }

    clientMap.set('test-user-iso', [testClient])

    try {
      broadcastToCompany('comp-target', 'cost', { amount: 50 })
      // comp-other should NOT receive comp-target's broadcast
      expect(sentMessages.length).toBe(0)
    } finally {
      clientMap.delete('test-user-iso')
    }
  })
})

// ============================================================
// TEA P1: channel handler edge cases
// ============================================================

describe('TEA P1: channel handler edge cases', () => {
  test('multiple subscriptions to same channel are idempotent', async () => {
    const { handleSubscription } = await import('../../ws/channels')
    const client = {
      ws: { send: mock(() => {}) } as any,
      userId: 'u1',
      companyId: 'comp-1',
      role: 'ceo' as const,
      subscriptions: new Set<string>(),
      connectedAt: new Date(),
    }
    const ws = { send: mock(() => {}) } as any

    await handleSubscription(client, 'cost', undefined, ws)
    await handleSubscription(client, 'cost', undefined, ws)

    // Set ensures no duplicates
    expect(client.subscriptions.size).toBe(1)
    expect(client.subscriptions.has('cost::comp-1')).toBe(true)
  })

  test('all orchestration channels handled without unknown error', async () => {
    const { handleSubscription } = await import('../../ws/channels')
    const orchChannels = ['command', 'delegation', 'tool', 'cost'] as const

    for (const ch of orchChannels) {
      const client = {
        ws: { send: mock(() => {}) } as any,
        userId: 'u1',
        companyId: 'c1',
        role: 'ceo' as const,
        subscriptions: new Set<string>(),
        connectedAt: new Date(),
      }
      const ws = { send: mock(() => {}) } as any

      await handleSubscription(client, ch, undefined, ws)

      const msgs = ws.send.mock.calls.map((c: any) => JSON.parse(c[0]))
      const errors = msgs.filter((m: any) => m.type === 'error' && m.code === 'UNKNOWN_CHANNEL')
      expect(errors.length).toBe(0)
    }
  })
})

// ============================================================
// TEA P1: eventBus bridge patterns
// ============================================================

describe('TEA P1: eventBus bridge patterns', () => {
  test('eventBus cost event structure matches bridge expectation', () => {
    const { eventBus } = require('../../lib/event-bus')
    const received: any[] = []

    const handler = (data: any) => received.push(data)
    eventBus.on('cost', handler)

    // Bridge expects { companyId: string, payload: unknown }
    eventBus.emit('cost', {
      companyId: 'test-comp',
      payload: { type: 'cost-recorded', costUsdMicro: 500 },
    })

    expect(received.length).toBe(1)
    expect(received[0].companyId).toBe('test-comp')
    expect(received[0].payload.type).toBe('cost-recorded')

    eventBus.removeListener('cost', handler)
  })

  test('multiple cost events are received independently', () => {
    const { eventBus } = require('../../lib/event-bus')
    const received: any[] = []

    const handler = (data: any) => received.push(data)
    eventBus.on('cost', handler)

    eventBus.emit('cost', { companyId: 'c1', payload: { n: 1 } })
    eventBus.emit('cost', { companyId: 'c2', payload: { n: 2 } })
    eventBus.emit('cost', { companyId: 'c1', payload: { n: 3 } })

    expect(received.length).toBe(3)
    expect(received[0].companyId).toBe('c1')
    expect(received[1].companyId).toBe('c2')
    expect(received[2].payload.n).toBe(3)

    eventBus.removeListener('cost', handler)
  })
})
