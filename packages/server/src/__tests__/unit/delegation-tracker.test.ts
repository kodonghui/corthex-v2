import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { DelegationTracker } from '../../services/delegation-tracker'
import { eventBus } from '../../lib/event-bus'

describe('DelegationTracker', () => {
  let tracker: DelegationTracker

  beforeEach(() => {
    tracker = new DelegationTracker()
  })

  // === Event Emission Tests ===

  describe('Command lifecycle events', () => {
    test('startCommand emits COMMAND_RECEIVED on command channel', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')

      eventBus.off('command', listener)

      expect(events).toHaveLength(1)
      expect(events[0].companyId).toBe('co-1')
      expect(events[0].payload.event).toBe('COMMAND_RECEIVED')
      expect(events[0].payload.commandId).toBe('cmd-1')
      expect(events[0].payload.phase).toBe('received')
      expect(events[0].payload.companyId).toBe('co-1')
      expect(events[0].payload.timestamp).toBeDefined()
    })

    test('classify emits CLASSIFYING on command channel', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.classify('co-1', 'cmd-1')

      eventBus.off('command', listener)

      expect(events).toHaveLength(2)
      expect(events[1].payload.event).toBe('CLASSIFYING')
      expect(events[1].payload.phase).toBe('classifying')
    })

    test('classified emits CLASSIFIED with classification data', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      const classData = { departmentId: 'd-1', managerId: 'm-1', confidence: 0.9, reasoning: 'test' }
      tracker.startCommand('co-1', 'cmd-1')
      tracker.classified('co-1', 'cmd-1', classData)

      eventBus.off('command', listener)

      expect(events[1].payload.event).toBe('CLASSIFIED')
      expect(events[1].payload.data).toBeDefined()
      expect((events[1].payload.data as any).departmentId).toBe('d-1')
      expect((events[1].payload.data as any).confidence).toBe(0.9)
    })

    test('completed emits COMPLETED and cleans up timer', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.completed('co-1', 'cmd-1')

      eventBus.off('command', listener)

      expect(events[1].payload.event).toBe('COMPLETED')
      expect(events[1].payload.phase).toBe('completed')
    })

    test('failed emits FAILED with error message', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.failed('co-1', 'cmd-1', 'test error')

      eventBus.off('command', listener)

      expect(events[1].payload.event).toBe('FAILED')
      expect(events[1].payload.data).toEqual({ error: 'test error' })
    })
  })

  describe('Delegation chain events', () => {
    test('managerStarted emits MANAGER_STARTED on delegation channel', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('delegation', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.managerStarted('co-1', 'cmd-1', 'agent-1', 'CIO')

      eventBus.off('delegation', listener)

      expect(events).toHaveLength(1)
      expect(events[0].companyId).toBe('co-1')
      expect(events[0].payload.event).toBe('MANAGER_STARTED')
      expect(events[0].payload.agentId).toBe('agent-1')
      expect(events[0].payload.agentName).toBe('CIO')
    })

    test('specialistDispatched emits SPECIALIST_DISPATCHED on delegation channel', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('delegation', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.specialistDispatched('co-1', 'cmd-1', 'spec-1', 'Analyst')

      eventBus.off('delegation', listener)

      expect(events).toHaveLength(1)
      expect(events[0].payload.event).toBe('SPECIALIST_DISPATCHED')
      expect(events[0].payload.agentId).toBe('spec-1')
      expect(events[0].payload.agentName).toBe('Analyst')
    })

    test('specialistCompleted emits SPECIALIST_COMPLETED with duration', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('delegation', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.specialistCompleted('co-1', 'cmd-1', 'spec-1', 'Analyst', 1500)

      eventBus.off('delegation', listener)

      expect(events[0].payload.event).toBe('SPECIALIST_COMPLETED')
      expect(events[0].payload.data).toEqual({ durationMs: 1500 })
    })

    test('specialistFailed emits SPECIALIST_FAILED with error', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('delegation', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.specialistFailed('co-1', 'cmd-1', 'spec-1', 'Analyst', 'timeout')

      eventBus.off('delegation', listener)

      expect(events[0].payload.event).toBe('SPECIALIST_FAILED')
      expect(events[0].payload.data).toEqual({ error: 'timeout' })
    })

    test('synthesizing emits SYNTHESIZING on delegation channel', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('delegation', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.synthesizing('co-1', 'cmd-1', 'mgr-1', 'Manager')

      eventBus.off('delegation', listener)

      expect(events[0].payload.event).toBe('SYNTHESIZING')
      expect(events[0].payload.agentId).toBe('mgr-1')
      expect(events[0].payload.agentName).toBe('Manager')
    })
  })

  describe('Quality gate events', () => {
    test('qualityChecking emits QUALITY_CHECKING on command channel', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.qualityChecking('co-1', 'cmd-1')

      eventBus.off('command', listener)

      expect(events[1].payload.event).toBe('QUALITY_CHECKING')
    })

    test('qualityPassed emits QUALITY_PASSED with scores', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      const scores = { conclusionClarity: 4, evidenceSufficiency: 4 }
      tracker.startCommand('co-1', 'cmd-1')
      tracker.qualityPassed('co-1', 'cmd-1', scores, 20)

      eventBus.off('command', listener)

      expect(events[1].payload.event).toBe('QUALITY_PASSED')
      expect(events[1].payload.data).toEqual({ scores, totalScore: 20 })
    })

    test('qualityFailed emits QUALITY_FAILED with scores and feedback', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      const scores = { conclusionClarity: 2, evidenceSufficiency: 1 }
      tracker.startCommand('co-1', 'cmd-1')
      tracker.qualityFailed('co-1', 'cmd-1', scores, 8, 'needs improvement')

      eventBus.off('command', listener)

      expect(events[1].payload.event).toBe('QUALITY_FAILED')
      expect(events[1].payload.data).toEqual({ scores, totalScore: 8, feedback: 'needs improvement' })
    })

    test('reworking emits REWORKING with attempt info', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.reworking('co-1', 'cmd-1', 1, 2)

      eventBus.off('command', listener)

      expect(events[1].payload.event).toBe('REWORKING')
      expect(events[1].payload.data).toEqual({ attempt: 1, maxAttempts: 2 })
    })
  })

  describe('Tool tracking events', () => {
    test('toolInvoked emits tool-invoked on tool channel', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('tool', listener)

      tracker.toolInvoked('co-1', 'cmd-1', 'web_search', 'agent-1')

      eventBus.off('tool', listener)

      expect(events).toHaveLength(1)
      expect(events[0].companyId).toBe('co-1')
      expect(events[0].payload.toolName).toBe('web_search')
      expect(events[0].payload.status).toBe('invoked')
      expect(events[0].payload.agentId).toBe('agent-1')
      expect(events[0].payload.commandId).toBe('cmd-1')
    })

    test('toolCompleted emits tool-completed with duration', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('tool', listener)

      tracker.toolCompleted('co-1', 'cmd-1', 'web_search', 'agent-1', 250)

      eventBus.off('tool', listener)

      expect(events[0].payload.status).toBe('completed')
      expect(events[0].payload.durationMs).toBe(250)
    })

    test('toolFailed emits tool-failed with error', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('tool', listener)

      tracker.toolFailed('co-1', 'cmd-1', 'db_query', 'agent-1', 'connection refused')

      eventBus.off('tool', listener)

      expect(events[0].payload.status).toBe('failed')
      expect(events[0].payload.error).toBe('connection refused')
    })
  })

  // === Elapsed Time Tests ===

  describe('Elapsed time tracking', () => {
    test('elapsed time increases after startCommand', async () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')
      // Small delay to ensure elapsed > 0
      await new Promise(r => setTimeout(r, 10))
      tracker.classify('co-1', 'cmd-1')

      eventBus.off('command', listener)

      // First event (startCommand) should have elapsed ~0
      expect(events[0].payload.elapsed).toBeLessThan(5)
      // Second event (classify) should have elapsed > 0
      expect(events[1].payload.elapsed).toBeGreaterThanOrEqual(5)
    })

    test('elapsed is 0 for unknown commandId', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      // Don't call startCommand first
      tracker.classify('co-1', 'unknown-cmd')

      eventBus.off('command', listener)

      expect(events[0].payload.elapsed).toBe(0)
    })

    test('completed cleans up timer for commandId', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.completed('co-1', 'cmd-1')
      // After completed, classify should have elapsed = 0 (timer cleaned up)
      tracker.classify('co-1', 'cmd-1')

      eventBus.off('command', listener)

      expect(events[2].payload.elapsed).toBe(0) // timer was cleaned up
    })

    test('failed cleans up timer for commandId', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.failed('co-1', 'cmd-1', 'err')
      tracker.classify('co-1', 'cmd-1')

      eventBus.off('command', listener)

      expect(events[2].payload.elapsed).toBe(0) // timer was cleaned up
    })

    test('tracks multiple commands independently', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-a')
      tracker.startCommand('co-1', 'cmd-b')
      tracker.completed('co-1', 'cmd-a')
      tracker.classify('co-1', 'cmd-b')

      eventBus.off('command', listener)

      // cmd-a completed (timer cleaned up), cmd-b classify should still have elapsed > 0
      const classifyEvent = events.find(e => e.payload.commandId === 'cmd-b' && e.payload.event === 'CLASSIFYING')
      expect(classifyEvent).toBeDefined()
      expect(classifyEvent.payload.elapsed).toBeGreaterThanOrEqual(0)
    })
  })

  // === Event Structure Tests ===

  describe('Event payload structure', () => {
    test('command channel events have correct structure', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')

      eventBus.off('command', listener)

      const payload = events[0].payload
      expect(payload).toHaveProperty('commandId')
      expect(payload).toHaveProperty('event')
      expect(payload).toHaveProperty('phase')
      expect(payload).toHaveProperty('elapsed')
      expect(payload).toHaveProperty('timestamp')
      expect(payload).toHaveProperty('companyId')
    })

    test('delegation channel events include agentId and agentName', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('delegation', listener)

      tracker.managerStarted('co-1', 'cmd-1', 'agent-42', 'CIO Korea')

      eventBus.off('delegation', listener)

      const payload = events[0].payload
      expect(payload.agentId).toBe('agent-42')
      expect(payload.agentName).toBe('CIO Korea')
    })

    test('tool channel events have correct structure', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('tool', listener)

      tracker.toolInvoked('co-1', 'cmd-1', 'search_web', 'agent-1')

      eventBus.off('tool', listener)

      const payload = events[0].payload
      expect(payload).toHaveProperty('commandId')
      expect(payload).toHaveProperty('toolName')
      expect(payload).toHaveProperty('status')
      expect(payload).toHaveProperty('agentId')
      expect(payload).toHaveProperty('companyId')
      expect(payload).toHaveProperty('timestamp')
    })

    test('event wrapper includes companyId for WS routing', () => {
      const commandEvents: any[] = []
      const delegationEvents: any[] = []
      const toolEvents: any[] = []
      const cmdListener = (data: any) => commandEvents.push(data)
      const delListener = (data: any) => delegationEvents.push(data)
      const toolListener = (data: any) => toolEvents.push(data)
      eventBus.on('command', cmdListener)
      eventBus.on('delegation', delListener)
      eventBus.on('tool', toolListener)

      tracker.startCommand('co-99', 'cmd-1')
      tracker.managerStarted('co-99', 'cmd-1', 'a-1', 'Mgr')
      tracker.toolInvoked('co-99', 'cmd-1', 'tool1', 'a-1')

      eventBus.off('command', cmdListener)
      eventBus.off('delegation', delListener)
      eventBus.off('tool', toolListener)

      // All event wrappers should have companyId for broadcastToCompany routing
      expect(commandEvents[0].companyId).toBe('co-99')
      expect(delegationEvents[0].companyId).toBe('co-99')
      expect(toolEvents[0].companyId).toBe('co-99')
    })
  })

  // === Full Orchestration Flow Test ===

  describe('Full orchestration flow', () => {
    test('emits correct event sequence for a complete command lifecycle', () => {
      const commandEvents: any[] = []
      const delegationEvents: any[] = []
      const cmdListener = (data: any) => commandEvents.push(data)
      const delListener = (data: any) => delegationEvents.push(data)
      eventBus.on('command', cmdListener)
      eventBus.on('delegation', delListener)

      // Full lifecycle
      tracker.startCommand('co-1', 'cmd-1')
      tracker.classify('co-1', 'cmd-1')
      tracker.classified('co-1', 'cmd-1', { departmentId: 'd-1', managerId: 'm-1', confidence: 0.95, reasoning: 'marketing' })
      tracker.managerStarted('co-1', 'cmd-1', 'm-1', 'Marketing Manager')
      tracker.specialistDispatched('co-1', 'cmd-1', 's-1', 'Analyst A')
      tracker.specialistDispatched('co-1', 'cmd-1', 's-2', 'Analyst B')
      tracker.specialistCompleted('co-1', 'cmd-1', 's-1', 'Analyst A', 2000)
      tracker.specialistCompleted('co-1', 'cmd-1', 's-2', 'Analyst B', 3000)
      tracker.synthesizing('co-1', 'cmd-1', 'm-1', 'Marketing Manager')
      tracker.qualityChecking('co-1', 'cmd-1')
      tracker.qualityPassed('co-1', 'cmd-1', { conclusionClarity: 4 }, 20)
      tracker.completed('co-1', 'cmd-1')

      eventBus.off('command', cmdListener)
      eventBus.off('delegation', delListener)

      // Command channel events: RECEIVED, CLASSIFYING, CLASSIFIED, QUALITY_CHECKING, QUALITY_PASSED, COMPLETED
      const cmdEventTypes = commandEvents.map(e => e.payload.event)
      expect(cmdEventTypes).toEqual([
        'COMMAND_RECEIVED',
        'CLASSIFYING',
        'CLASSIFIED',
        'QUALITY_CHECKING',
        'QUALITY_PASSED',
        'COMPLETED',
      ])

      // Delegation channel events: MANAGER_STARTED, 2x DISPATCHED, 2x COMPLETED, SYNTHESIZING
      const delEventTypes = delegationEvents.map(e => e.payload.event)
      expect(delEventTypes).toEqual([
        'MANAGER_STARTED',
        'SPECIALIST_DISPATCHED',
        'SPECIALIST_DISPATCHED',
        'SPECIALIST_COMPLETED',
        'SPECIALIST_COMPLETED',
        'SYNTHESIZING',
      ])
    })

    test('emits correct event sequence for failed command', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-2')
      tracker.classify('co-1', 'cmd-2')
      tracker.failed('co-1', 'cmd-2', 'no managers available')

      eventBus.off('command', listener)

      const eventTypes = events.map(e => e.payload.event)
      expect(eventTypes).toEqual(['COMMAND_RECEIVED', 'CLASSIFYING', 'FAILED'])
      expect(events[2].payload.data).toEqual({ error: 'no managers available' })
    })

    test('emits correct event sequence for quality gate failure + rework', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-3')
      tracker.qualityChecking('co-1', 'cmd-3')
      tracker.qualityFailed('co-1', 'cmd-3', { conclusionClarity: 2 }, 8, 'weak conclusion')
      tracker.reworking('co-1', 'cmd-3', 1, 2)
      tracker.qualityChecking('co-1', 'cmd-3')
      tracker.qualityPassed('co-1', 'cmd-3', { conclusionClarity: 4 }, 18)
      tracker.completed('co-1', 'cmd-3')

      eventBus.off('command', listener)

      const eventTypes = events.map(e => e.payload.event)
      expect(eventTypes).toEqual([
        'COMMAND_RECEIVED',
        'QUALITY_CHECKING',
        'QUALITY_FAILED',
        'REWORKING',
        'QUALITY_CHECKING',
        'QUALITY_PASSED',
        'COMPLETED',
      ])
    })
  })

  // === WsChannel Type Extension Tests ===

  describe('WsChannel type compatibility', () => {
    test('command, delegation, tool are valid channel names', async () => {
      // Import the type to verify it includes our new channels
      const { broadcastToCompany } = await import('../../ws/channels')

      // These should not throw — the channels are now valid
      expect(() => broadcastToCompany('test-co', 'command', { test: true })).not.toThrow()
      expect(() => broadcastToCompany('test-co', 'delegation', { test: true })).not.toThrow()
      expect(() => broadcastToCompany('test-co', 'tool', { test: true })).not.toThrow()
    })
  })

  // === Channel Subscription Tests ===

  describe('Channel subscription handling', () => {
    test('handleSubscription accepts command channel', async () => {
      const { handleSubscription } = await import('../../ws/channels')

      const sentMessages: string[] = []
      const mockWs = {
        send: (msg: string) => sentMessages.push(msg),
      } as any

      const mockClient = {
        companyId: 'co-1',
        userId: 'user-1',
        role: 'ceo' as const,
        subscriptions: new Set<string>(),
        ws: {} as any,
        connectedAt: new Date(),
      }

      await handleSubscription(mockClient, 'command', undefined, mockWs)

      expect(mockClient.subscriptions.has('command::co-1')).toBe(true)
      expect(sentMessages).toHaveLength(1)
      expect(JSON.parse(sentMessages[0])).toEqual({ type: 'subscribed', channel: 'command' })
    })

    test('handleSubscription accepts delegation channel', async () => {
      const { handleSubscription } = await import('../../ws/channels')

      const sentMessages: string[] = []
      const mockWs = {
        send: (msg: string) => sentMessages.push(msg),
      } as any

      const mockClient = {
        companyId: 'co-1',
        userId: 'user-1',
        role: 'ceo' as const,
        subscriptions: new Set<string>(),
        ws: {} as any,
        connectedAt: new Date(),
      }

      await handleSubscription(mockClient, 'delegation', undefined, mockWs)

      expect(mockClient.subscriptions.has('delegation::co-1')).toBe(true)
    })

    test('handleSubscription accepts tool channel', async () => {
      const { handleSubscription } = await import('../../ws/channels')

      const sentMessages: string[] = []
      const mockWs = {
        send: (msg: string) => sentMessages.push(msg),
      } as any

      const mockClient = {
        companyId: 'co-1',
        userId: 'user-1',
        role: 'ceo' as const,
        subscriptions: new Set<string>(),
        ws: {} as any,
        connectedAt: new Date(),
      }

      await handleSubscription(mockClient, 'tool', undefined, mockWs)

      expect(mockClient.subscriptions.has('tool::co-1')).toBe(true)
    })

    test('handleSubscription rejects cross-company subscription for command channel', async () => {
      const { handleSubscription } = await import('../../ws/channels')

      const sentMessages: string[] = []
      const mockWs = {
        send: (msg: string) => sentMessages.push(msg),
      } as any

      const mockClient = {
        companyId: 'co-1',
        userId: 'user-1',
        role: 'ceo' as const,
        subscriptions: new Set<string>(),
        ws: {} as any,
        connectedAt: new Date(),
      }

      await handleSubscription(mockClient, 'command', { id: 'other-company' }, mockWs)

      expect(mockClient.subscriptions.size).toBe(0)
      expect(sentMessages).toHaveLength(1)
      expect(JSON.parse(sentMessages[0])).toEqual({ type: 'error', code: 'FORBIDDEN', channel: 'command' })
    })
  })

  // === 14 Event Type Coverage ===

  describe('All 14 event types coverage', () => {
    const ALL_EVENT_TYPES = [
      'COMMAND_RECEIVED',
      'CLASSIFYING',
      'CLASSIFIED',
      'MANAGER_STARTED',
      'SPECIALIST_DISPATCHED',
      'SPECIALIST_COMPLETED',
      'SPECIALIST_FAILED',
      'SYNTHESIZING',
      'QUALITY_CHECKING',
      'QUALITY_PASSED',
      'QUALITY_FAILED',
      'REWORKING',
      'COMPLETED',
      'FAILED',
    ]

    test('all 14 event types can be emitted', () => {
      const commandEvents: any[] = []
      const delegationEvents: any[] = []
      const cmdListener = (data: any) => commandEvents.push(data)
      const delListener = (data: any) => delegationEvents.push(data)
      eventBus.on('command', cmdListener)
      eventBus.on('delegation', delListener)

      tracker.startCommand('co-1', 'cmd-x')          // COMMAND_RECEIVED
      tracker.classify('co-1', 'cmd-x')               // CLASSIFYING
      tracker.classified('co-1', 'cmd-x', { departmentId: 'd', managerId: 'm', confidence: 1, reasoning: 'r' }) // CLASSIFIED
      tracker.managerStarted('co-1', 'cmd-x', 'a', 'n')     // MANAGER_STARTED
      tracker.specialistDispatched('co-1', 'cmd-x', 'a', 'n') // SPECIALIST_DISPATCHED
      tracker.specialistCompleted('co-1', 'cmd-x', 'a', 'n', 100) // SPECIALIST_COMPLETED
      tracker.specialistFailed('co-1', 'cmd-x', 'a', 'n', 'e')   // SPECIALIST_FAILED
      tracker.synthesizing('co-1', 'cmd-x', 'a', 'n')            // SYNTHESIZING
      tracker.qualityChecking('co-1', 'cmd-x')       // QUALITY_CHECKING
      tracker.qualityPassed('co-1', 'cmd-x', {}, 20) // QUALITY_PASSED
      tracker.qualityFailed('co-1', 'cmd-x', {}, 8, 'f') // QUALITY_FAILED
      tracker.reworking('co-1', 'cmd-x', 1, 2)       // REWORKING
      tracker.completed('co-1', 'cmd-x')              // COMPLETED

      // Need a new command for FAILED (since completed already cleaned up timer)
      tracker.startCommand('co-1', 'cmd-y')
      tracker.failed('co-1', 'cmd-y', 'err')

      eventBus.off('command', cmdListener)
      eventBus.off('delegation', delListener)

      const allEmitted = [
        ...commandEvents.map(e => e.payload.event),
        ...delegationEvents.map(e => e.payload.event),
      ]

      for (const type of ALL_EVENT_TYPES) {
        expect(allEmitted).toContain(type)
      }
    })
  })
})
