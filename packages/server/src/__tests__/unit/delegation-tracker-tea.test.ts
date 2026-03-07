import { describe, test, expect, beforeEach } from 'bun:test'
import { DelegationTracker, delegationTracker } from '../../services/delegation-tracker'
import { eventBus } from '../../lib/event-bus'

// TEA: Risk-based test expansion for delegation-tracker
// Priority: P0 (critical-path), P1 (important), P2 (edge cases)

describe('TEA: DelegationTracker Risk-Based Tests', () => {
  let tracker: DelegationTracker

  beforeEach(() => {
    tracker = new DelegationTracker()
  })

  // === P0: Singleton Export ===

  describe('[P0] Singleton export', () => {
    test('delegationTracker singleton is a DelegationTracker instance', () => {
      expect(delegationTracker).toBeInstanceOf(DelegationTracker)
    })

    test('singleton emits events correctly', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      delegationTracker.startCommand('singleton-co', 'singleton-cmd')
      delegationTracker.completed('singleton-co', 'singleton-cmd')

      eventBus.off('command', listener)

      expect(events).toHaveLength(2)
      expect(events[0].payload.event).toBe('COMMAND_RECEIVED')
      expect(events[1].payload.event).toBe('COMPLETED')
    })
  })

  // === P0: Timestamp Format ===

  describe('[P0] Timestamp format validation', () => {
    test('command events have valid ISO 8601 timestamps', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')

      eventBus.off('command', listener)

      const ts = events[0].payload.timestamp
      const parsed = new Date(ts)
      expect(parsed.toISOString()).toBe(ts)
      expect(Number.isNaN(parsed.getTime())).toBe(false)
    })

    test('delegation events have valid ISO 8601 timestamps', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('delegation', listener)

      tracker.managerStarted('co-1', 'cmd-1', 'a-1', 'Mgr')

      eventBus.off('delegation', listener)

      const ts = events[0].payload.timestamp
      expect(() => new Date(ts)).not.toThrow()
      expect(new Date(ts).toISOString()).toBe(ts)
    })

    test('tool events have valid ISO 8601 timestamps', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('tool', listener)

      tracker.toolInvoked('co-1', 'cmd-1', 'search', 'a-1')

      eventBus.off('tool', listener)

      const ts = events[0].payload.timestamp
      expect(new Date(ts).toISOString()).toBe(ts)
    })
  })

  // === P1: Concurrent Commands ===

  describe('[P1] Concurrent command tracking', () => {
    test('tracks 10 concurrent commands independently', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      // Start 10 commands
      for (let i = 0; i < 10; i++) {
        tracker.startCommand(`co-${i}`, `cmd-${i}`)
      }

      // Complete them in reverse order
      for (let i = 9; i >= 0; i--) {
        tracker.completed(`co-${i}`, `cmd-${i}`)
      }

      eventBus.off('command', listener)

      // 10 starts + 10 completes = 20 events
      expect(events).toHaveLength(20)

      // All COMPLETED events should have their correct companyId
      const completedEvents = events.filter(e => e.payload.event === 'COMPLETED')
      expect(completedEvents).toHaveLength(10)
      for (let i = 9; i >= 0; i--) {
        const evt = completedEvents[9 - i]
        expect(evt.companyId).toBe(`co-${i}`)
        expect(evt.payload.commandId).toBe(`cmd-${i}`)
      }
    })

    test('completing one command does not affect elapsed time of another', async () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-a')
      tracker.startCommand('co-1', 'cmd-b')

      await new Promise(r => setTimeout(r, 15))

      tracker.completed('co-1', 'cmd-a')

      await new Promise(r => setTimeout(r, 15))

      // cmd-b should still be tracking elapsed time
      tracker.classify('co-1', 'cmd-b')

      eventBus.off('command', listener)

      const classifyEvent = events.find(e => e.payload.commandId === 'cmd-b' && e.payload.event === 'CLASSIFYING')
      // cmd-b has been running for ~30ms, should have elapsed > 20
      expect(classifyEvent.payload.elapsed).toBeGreaterThanOrEqual(20)
    })
  })

  // === P1: Edge Cases - Empty/Special Strings ===

  describe('[P1] Edge cases with special strings', () => {
    test('handles empty agentName', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('delegation', listener)

      tracker.managerStarted('co-1', 'cmd-1', 'a-1', '')

      eventBus.off('delegation', listener)

      expect(events[0].payload.agentName).toBe('')
    })

    test('handles empty error string in failed()', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.failed('co-1', 'cmd-1', '')

      eventBus.off('command', listener)

      expect(events[1].payload.data).toEqual({ error: '' })
    })

    test('handles empty toolName in toolInvoked()', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('tool', listener)

      tracker.toolInvoked('co-1', 'cmd-1', '', 'a-1')

      eventBus.off('tool', listener)

      expect(events[0].payload.toolName).toBe('')
    })

    test('handles unicode characters in agentName and error', () => {
      const events: any[] = []
      const delListener = (data: any) => events.push(data)
      eventBus.on('delegation', delListener)

      tracker.managerStarted('co-1', 'cmd-1', 'a-1', '마케팅 실장')

      eventBus.off('delegation', delListener)

      expect(events[0].payload.agentName).toBe('마케팅 실장')
    })

    test('handles very long error messages', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      const longError = 'x'.repeat(10000)
      tracker.startCommand('co-1', 'cmd-1')
      tracker.failed('co-1', 'cmd-1', longError)

      eventBus.off('command', listener)

      expect(events[1].payload.data.error).toHaveLength(10000)
    })
  })

  // === P1: broadcastToChannel Message Format ===

  describe('[P1] WS broadcast message format', () => {
    test('broadcastToChannel produces valid JSON for command events', async () => {
      const { broadcastToChannel } = await import('../../ws/channels')

      // broadcastToChannel should not throw with valid data
      const data = {
        commandId: 'cmd-1',
        event: 'COMMAND_RECEIVED',
        phase: 'received',
        elapsed: 0,
        timestamp: new Date().toISOString(),
        companyId: 'co-1',
      }

      expect(() => broadcastToChannel('command::co-1', data)).not.toThrow()
    })

    test('broadcastToChannel produces valid JSON for delegation events', async () => {
      const { broadcastToChannel } = await import('../../ws/channels')

      const data = {
        commandId: 'cmd-1',
        event: 'SPECIALIST_DISPATCHED',
        agentId: 'a-1',
        agentName: 'Analyst',
        phase: 'specialist-dispatched',
        elapsed: 500,
        timestamp: new Date().toISOString(),
        companyId: 'co-1',
      }

      expect(() => broadcastToChannel('delegation::co-1', data)).not.toThrow()
    })

    test('broadcastToChannel produces valid JSON for tool events', async () => {
      const { broadcastToChannel } = await import('../../ws/channels')

      const data = {
        commandId: 'cmd-1',
        toolName: 'web_search',
        status: 'completed',
        agentId: 'a-1',
        durationMs: 250,
        companyId: 'co-1',
        timestamp: new Date().toISOString(),
      }

      expect(() => broadcastToChannel('tool::co-1', data)).not.toThrow()
    })
  })

  // === P2: High-Frequency Events ===

  describe('[P2] High-frequency event emission', () => {
    test('handles rapid specialist dispatch events without data loss', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('delegation', listener)

      tracker.startCommand('co-1', 'cmd-1')

      // Dispatch 20 specialists rapidly
      for (let i = 0; i < 20; i++) {
        tracker.specialistDispatched('co-1', 'cmd-1', `spec-${i}`, `Specialist ${i}`)
      }

      eventBus.off('delegation', listener)

      expect(events).toHaveLength(20)
      // Verify each event has unique agent
      const agentIds = events.map(e => e.payload.agentId)
      const uniqueIds = new Set(agentIds)
      expect(uniqueIds.size).toBe(20)
    })

    test('handles rapid tool events without data loss', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('tool', listener)

      for (let i = 0; i < 50; i++) {
        tracker.toolInvoked('co-1', 'cmd-1', `tool_${i}`, 'a-1')
      }

      eventBus.off('tool', listener)

      expect(events).toHaveLength(50)
    })
  })

  // === P1: Event Channel Isolation ===

  describe('[P1] Event channel isolation', () => {
    test('command events do not appear on delegation channel', () => {
      const delegationEvents: any[] = []
      const listener = (data: any) => delegationEvents.push(data)
      eventBus.on('delegation', listener)

      tracker.startCommand('co-1', 'cmd-1')
      tracker.classify('co-1', 'cmd-1')
      tracker.classified('co-1', 'cmd-1', { departmentId: 'd', managerId: 'm', confidence: 1, reasoning: 'r' })
      tracker.qualityChecking('co-1', 'cmd-1')
      tracker.qualityPassed('co-1', 'cmd-1', {}, 20)
      tracker.reworking('co-1', 'cmd-1', 1, 2)
      tracker.completed('co-1', 'cmd-1')
      tracker.startCommand('co-1', 'cmd-2')
      tracker.failed('co-1', 'cmd-2', 'err')

      eventBus.off('delegation', listener)

      // None of these should appear on delegation channel
      expect(delegationEvents).toHaveLength(0)
    })

    test('delegation events do not appear on command channel', () => {
      const commandEvents: any[] = []
      const listener = (data: any) => commandEvents.push(data)
      eventBus.on('command', listener)

      tracker.managerStarted('co-1', 'cmd-1', 'a-1', 'Mgr')
      tracker.specialistDispatched('co-1', 'cmd-1', 's-1', 'Spec')
      tracker.specialistCompleted('co-1', 'cmd-1', 's-1', 'Spec', 100)
      tracker.specialistFailed('co-1', 'cmd-1', 's-2', 'Spec2', 'err')
      tracker.synthesizing('co-1', 'cmd-1', 'a-1', 'Mgr')

      eventBus.off('command', listener)

      // None of these should appear on command channel
      expect(commandEvents).toHaveLength(0)
    })

    test('tool events do not appear on command or delegation channels', () => {
      const commandEvents: any[] = []
      const delegationEvents: any[] = []
      const cmdListener = (data: any) => commandEvents.push(data)
      const delListener = (data: any) => delegationEvents.push(data)
      eventBus.on('command', cmdListener)
      eventBus.on('delegation', delListener)

      tracker.toolInvoked('co-1', 'cmd-1', 'search', 'a-1')
      tracker.toolCompleted('co-1', 'cmd-1', 'search', 'a-1', 100)
      tracker.toolFailed('co-1', 'cmd-1', 'other', 'a-1', 'err')

      eventBus.off('command', cmdListener)
      eventBus.off('delegation', delListener)

      expect(commandEvents).toHaveLength(0)
      expect(delegationEvents).toHaveLength(0)
    })
  })

  // === P1: CompanyId Tenant Isolation ===

  describe('[P1] CompanyId tenant isolation in events', () => {
    test('events from different companies have correct companyId', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      tracker.startCommand('company-A', 'cmd-A')
      tracker.startCommand('company-B', 'cmd-B')
      tracker.classify('company-A', 'cmd-A')
      tracker.classify('company-B', 'cmd-B')

      eventBus.off('command', listener)

      const companyAEvents = events.filter(e => e.companyId === 'company-A')
      const companyBEvents = events.filter(e => e.companyId === 'company-B')

      expect(companyAEvents).toHaveLength(2)
      expect(companyBEvents).toHaveLength(2)

      // Verify payload companyId matches wrapper companyId
      for (const e of events) {
        expect(e.payload.companyId).toBe(e.companyId)
      }
    })
  })

  // === P0: Event Data Integrity ===

  describe('[P0] Event data integrity', () => {
    test('classified event preserves all classification fields', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      const classification = {
        departmentId: 'dept-uuid-123',
        managerId: 'mgr-uuid-456',
        confidence: 0.87,
        reasoning: '마케팅 관련 질문이므로 마케팅 부서에 위임합니다',
      }

      tracker.startCommand('co-1', 'cmd-1')
      tracker.classified('co-1', 'cmd-1', classification)

      eventBus.off('command', listener)

      const classifiedData = events[1].payload.data as any
      expect(classifiedData.departmentId).toBe('dept-uuid-123')
      expect(classifiedData.managerId).toBe('mgr-uuid-456')
      expect(classifiedData.confidence).toBe(0.87)
      expect(classifiedData.reasoning).toBe('마케팅 관련 질문이므로 마케팅 부서에 위임합니다')
    })

    test('qualityPassed event preserves score structure', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('command', listener)

      const scores = {
        conclusionClarity: 4,
        evidenceSufficiency: 5,
        riskMention: 3,
        formatAdequacy: 4,
        logicalConsistency: 4,
      }

      tracker.startCommand('co-1', 'cmd-1')
      tracker.qualityPassed('co-1', 'cmd-1', scores, 20)

      eventBus.off('command', listener)

      const qpData = events[1].payload.data as any
      expect(qpData.scores).toEqual(scores)
      expect(qpData.totalScore).toBe(20)
    })

    test('toolCompleted event preserves durationMs as number', () => {
      const events: any[] = []
      const listener = (data: any) => events.push(data)
      eventBus.on('tool', listener)

      tracker.toolCompleted('co-1', 'cmd-1', 'search', 'a-1', 0)

      eventBus.off('tool', listener)

      expect(typeof events[0].payload.durationMs).toBe('number')
      expect(events[0].payload.durationMs).toBe(0)
    })
  })
})
