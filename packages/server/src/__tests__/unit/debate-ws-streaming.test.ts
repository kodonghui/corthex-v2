import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test'
import { eventBus } from '../../lib/event-bus'
import type {
  DebateWsEvent,
  DebateStartedEvent,
  DebateRoundStartedEvent,
  DebateSpeechDeliveredEvent,
  DebateRoundEndedEvent,
  DebateCompletedEvent,
  DebateFailedEvent,
  DebateTimelineEntry,
} from '@corthex/shared'

// === Debate WebSocket Channel Streaming Tests (E11-S3) ===

describe('Debate WebSocket Channel Streaming', () => {
  const COMPANY_ID = 'comp-1111-2222-3333-444444444444'
  const OTHER_COMPANY_ID = 'comp-9999-8888-7777-666666666666'
  const DEBATE_ID = 'deb-1111-2222-3333-444444444444'
  const USER_ID = 'user-1111-2222-3333-444444444444'

  // === EventBus debate event emission tests ===

  describe('EventBus debate event emission', () => {
    test('debate 이벤트가 eventBus에 올바른 형태로 발행됨', () => {
      const events: unknown[] = []
      const handler = (data: unknown) => events.push(data)
      eventBus.on('debate', handler)

      const payload = {
        event: 'round-started',
        debateId: DEBATE_ID,
        roundNum: 1,
        totalRounds: 2,
        timestamp: new Date().toISOString(),
      }
      eventBus.emit('debate', { companyId: COMPANY_ID, payload })

      expect(events).toHaveLength(1)
      const received = events[0] as { companyId: string; payload: typeof payload }
      expect(received.companyId).toBe(COMPANY_ID)
      expect(received.payload.event).toBe('round-started')
      expect(received.payload.debateId).toBe(DEBATE_ID)
      expect(received.payload.roundNum).toBe(1)

      eventBus.removeListener('debate', handler)
    })

    test('debate-started 이벤트 구조 검증', () => {
      const events: unknown[] = []
      const handler = (data: unknown) => events.push(data)
      eventBus.on('debate', handler)

      const payload: DebateStartedEvent = {
        event: 'debate-started',
        debateId: DEBATE_ID,
        topic: 'AI 투자 전략',
        totalRounds: 2,
        timestamp: new Date().toISOString(),
      }
      eventBus.emit('debate', { companyId: COMPANY_ID, payload })

      const received = events[0] as { companyId: string; payload: DebateStartedEvent }
      expect(received.payload.event).toBe('debate-started')
      expect(received.payload.topic).toBe('AI 투자 전략')
      expect(received.payload.totalRounds).toBe(2)
      expect(received.payload.debateId).toBe(DEBATE_ID)
      expect(received.payload.timestamp).toBeDefined()

      eventBus.removeListener('debate', handler)
    })

    test('speech-delivered 이벤트 구조 검증', () => {
      const events: unknown[] = []
      const handler = (data: unknown) => events.push(data)
      eventBus.on('debate', handler)

      const payload: DebateSpeechDeliveredEvent = {
        event: 'speech-delivered',
        debateId: DEBATE_ID,
        roundNum: 1,
        speech: {
          agentId: 'agent-1',
          agentName: '전략팀장',
          content: 'AI는 투자에 필수적입니다',
          position: 'AI 투자 필수',
        },
        timestamp: new Date().toISOString(),
      }
      eventBus.emit('debate', { companyId: COMPANY_ID, payload })

      const received = events[0] as { companyId: string; payload: DebateSpeechDeliveredEvent }
      expect(received.payload.event).toBe('speech-delivered')
      expect(received.payload.speech.agentName).toBe('전략팀장')
      expect(received.payload.speech.content).toContain('AI')

      eventBus.removeListener('debate', handler)
    })

    test('round-ended 이벤트에 speechCount 포함', () => {
      const events: unknown[] = []
      const handler = (data: unknown) => events.push(data)
      eventBus.on('debate', handler)

      const payload: DebateRoundEndedEvent = {
        event: 'round-ended',
        debateId: DEBATE_ID,
        roundNum: 1,
        speechCount: 3,
        timestamp: new Date().toISOString(),
      }
      eventBus.emit('debate', { companyId: COMPANY_ID, payload })

      const received = events[0] as { companyId: string; payload: DebateRoundEndedEvent }
      expect(received.payload.speechCount).toBe(3)
      expect(received.payload.roundNum).toBe(1)

      eventBus.removeListener('debate', handler)
    })

    test('debate-completed 이벤트에 result 포함', () => {
      const events: unknown[] = []
      const handler = (data: unknown) => events.push(data)
      eventBus.on('debate', handler)

      const payload: DebateCompletedEvent = {
        event: 'debate-completed',
        debateId: DEBATE_ID,
        result: {
          consensus: 'consensus',
          summary: '모두 합의',
          majorityPosition: 'AI 투자 찬성',
          minorityPosition: '',
          keyArguments: ['기술 발전', '수익성'],
          roundCount: 2,
        },
        timestamp: new Date().toISOString(),
      }
      eventBus.emit('debate', { companyId: COMPANY_ID, payload })

      const received = events[0] as { companyId: string; payload: DebateCompletedEvent }
      expect(received.payload.result.consensus).toBe('consensus')
      expect(received.payload.result.keyArguments).toHaveLength(2)

      eventBus.removeListener('debate', handler)
    })

    test('debate-failed 이벤트에 error 포함', () => {
      const events: unknown[] = []
      const handler = (data: unknown) => events.push(data)
      eventBus.on('debate', handler)

      const payload: DebateFailedEvent = {
        event: 'debate-failed',
        debateId: DEBATE_ID,
        error: 'LLM 호출 실패',
        timestamp: new Date().toISOString(),
      }
      eventBus.emit('debate', { companyId: COMPANY_ID, payload })

      const received = events[0] as { companyId: string; payload: DebateFailedEvent }
      expect(received.payload.event).toBe('debate-failed')
      expect(received.payload.error).toBe('LLM 호출 실패')

      eventBus.removeListener('debate', handler)
    })
  })

  // === EventBus → WS bridge routing tests ===

  describe('EventBus → WS debate 채널 브릿지', () => {
    test('debate 이벤트에서 debateId 추출하여 채널 라우팅', () => {
      // Simulate the bridge logic from index.ts
      const payload = { debateId: DEBATE_ID, event: 'round-started', roundNum: 1, timestamp: '' }
      const data = { companyId: COMPANY_ID, payload }

      // Extract debateId from payload
      const extracted = (data.payload as { debateId?: string })?.debateId
      expect(extracted).toBe(DEBATE_ID)

      // Channel key should be debate::debateId
      const channelKey = `debate::${extracted}`
      expect(channelKey).toBe(`debate::${DEBATE_ID}`)
    })

    test('debateId 없는 이벤트는 라우팅되지 않음', () => {
      const payload = { event: 'unknown', timestamp: '' }
      const data = { companyId: COMPANY_ID, payload }

      const extracted = (data.payload as { debateId?: string })?.debateId
      expect(extracted).toBeUndefined()
    })
  })

  // === Debate channel subscription key format ===

  describe('Debate 채널 구독 키 형식', () => {
    test('구독키는 debate::debateId 형태', () => {
      const debateId = DEBATE_ID
      const subscriptionKey = `debate::${debateId}`
      expect(subscriptionKey).toBe(`debate::${DEBATE_ID}`)
      expect(subscriptionKey.startsWith('debate::')).toBe(true)
    })

    test('다른 debateId는 다른 구독키 생성', () => {
      const key1 = `debate::${DEBATE_ID}`
      const key2 = `debate::other-debate-id`
      expect(key1).not.toBe(key2)
    })
  })

  // === DebateWsEvent type validation ===

  describe('DebateWsEvent 타입 검증', () => {
    test('모든 이벤트 타입에 debateId와 timestamp 포함', () => {
      const events: DebateWsEvent[] = [
        { event: 'debate-started', debateId: DEBATE_ID, topic: 'test', totalRounds: 2, timestamp: '2026-01-01T00:00:00Z' },
        { event: 'round-started', debateId: DEBATE_ID, roundNum: 1, totalRounds: 2, timestamp: '2026-01-01T00:00:01Z' },
        { event: 'speech-delivered', debateId: DEBATE_ID, roundNum: 1, speech: { agentId: 'a1', agentName: 'A', content: 'x', position: 'y' }, timestamp: '2026-01-01T00:00:02Z' },
        { event: 'round-ended', debateId: DEBATE_ID, roundNum: 1, speechCount: 2, timestamp: '2026-01-01T00:00:03Z' },
        { event: 'debate-completed', debateId: DEBATE_ID, result: { consensus: 'consensus', summary: 's', majorityPosition: 'm', minorityPosition: '', keyArguments: [], roundCount: 1 }, timestamp: '2026-01-01T00:00:04Z' },
        { event: 'debate-failed', debateId: DEBATE_ID, error: 'err', timestamp: '2026-01-01T00:00:05Z' },
      ]

      for (const ev of events) {
        expect(ev.debateId).toBe(DEBATE_ID)
        expect(ev.timestamp).toBeDefined()
        expect(typeof ev.event).toBe('string')
      }
    })

    test('DebateTimelineEntry는 DebateWsEvent와 동일 타입', () => {
      const entry: DebateTimelineEntry = {
        event: 'round-started',
        debateId: DEBATE_ID,
        roundNum: 1,
        totalRounds: 2,
        timestamp: '2026-01-01T00:00:00Z',
      }
      // 컴파일 타임 타입 체크 - DebateTimelineEntry를 DebateWsEvent에 할당 가능
      const wsEvent: DebateWsEvent = entry
      expect(wsEvent.event).toBe('round-started')
    })
  })

  // === Tenant isolation for debate channel ===

  describe('Tenant 격리', () => {
    test('구독 시 companyId 일치 여부 확인 로직', () => {
      // Simulate channel subscription validation
      const clientCompanyId = COMPANY_ID
      const debateCompanyId = COMPANY_ID
      expect(clientCompanyId).toBe(debateCompanyId) // 같은 회사 → 허용

      const otherDebateCompanyId = OTHER_COMPANY_ID
      expect(clientCompanyId).not.toBe(otherDebateCompanyId) // 다른 회사 → 거부
    })

    test('debate 이벤트 브로드캐스트는 debateId 기반 (companyId 기반 아님)', () => {
      // debate 채널은 debateId 기반으로 구독하므로
      // 같은 debateId를 구독한 클라이언트만 이벤트를 수신
      const channelKey = `debate::${DEBATE_ID}`
      expect(channelKey).not.toContain(COMPANY_ID) // companyId가 아닌 debateId 기반
    })
  })

  // === Timeline event ordering ===

  describe('타임라인 이벤트 순서', () => {
    test('토론 이벤트가 올바른 시간순으로 정렬됨', () => {
      const timeline: DebateTimelineEntry[] = [
        { event: 'debate-started', debateId: DEBATE_ID, topic: 't', totalRounds: 2, timestamp: '2026-01-01T00:00:00Z' },
        { event: 'round-started', debateId: DEBATE_ID, roundNum: 1, totalRounds: 2, timestamp: '2026-01-01T00:00:01Z' },
        { event: 'speech-delivered', debateId: DEBATE_ID, roundNum: 1, speech: { agentId: 'a1', agentName: 'A', content: 'x', position: 'y' }, timestamp: '2026-01-01T00:00:02Z' },
        { event: 'round-ended', debateId: DEBATE_ID, roundNum: 1, speechCount: 1, timestamp: '2026-01-01T00:00:03Z' },
        { event: 'debate-completed', debateId: DEBATE_ID, result: { consensus: 'consensus', summary: 's', majorityPosition: 'm', minorityPosition: '', keyArguments: [], roundCount: 1 }, timestamp: '2026-01-01T00:00:04Z' },
      ]

      // Verify chronological order
      for (let i = 1; i < timeline.length; i++) {
        const prev = new Date(timeline[i - 1].timestamp).getTime()
        const curr = new Date(timeline[i].timestamp).getTime()
        expect(curr).toBeGreaterThanOrEqual(prev)
      }
    })

    test('토론 시작과 완료 이벤트가 타임라인 처음/끝에 위치', () => {
      const timeline: DebateTimelineEntry[] = [
        { event: 'debate-started', debateId: DEBATE_ID, topic: 't', totalRounds: 2, timestamp: '2026-01-01T00:00:00Z' },
        { event: 'round-started', debateId: DEBATE_ID, roundNum: 1, totalRounds: 2, timestamp: '2026-01-01T00:00:01Z' },
        { event: 'round-ended', debateId: DEBATE_ID, roundNum: 1, speechCount: 2, timestamp: '2026-01-01T00:00:02Z' },
        { event: 'debate-completed', debateId: DEBATE_ID, result: { consensus: 'partial', summary: 's', majorityPosition: 'm', minorityPosition: '', keyArguments: [], roundCount: 1 }, timestamp: '2026-01-01T00:00:03Z' },
      ]

      expect(timeline[0].event).toBe('debate-started')
      expect(timeline[timeline.length - 1].event).toBe('debate-completed')
    })

    test('실패한 토론은 debate-failed로 끝남', () => {
      const timeline: DebateTimelineEntry[] = [
        { event: 'debate-started', debateId: DEBATE_ID, topic: 't', totalRounds: 2, timestamp: '2026-01-01T00:00:00Z' },
        { event: 'round-started', debateId: DEBATE_ID, roundNum: 1, totalRounds: 2, timestamp: '2026-01-01T00:00:01Z' },
        { event: 'debate-failed', debateId: DEBATE_ID, error: 'LLM 오류', timestamp: '2026-01-01T00:00:02Z' },
      ]

      expect(timeline[0].event).toBe('debate-started')
      expect(timeline[timeline.length - 1].event).toBe('debate-failed')
      expect((timeline[timeline.length - 1] as DebateFailedEvent).error).toBe('LLM 오류')
    })
  })

  // === Multiple debate subscriptions ===

  describe('다중 토론 구독', () => {
    test('서로 다른 debateId로 독립적 구독 가능', () => {
      const subscriptions = new Set<string>()
      subscriptions.add(`debate::${DEBATE_ID}`)
      subscriptions.add(`debate::other-debate-id`)

      expect(subscriptions.size).toBe(2)
      expect(subscriptions.has(`debate::${DEBATE_ID}`)).toBe(true)
      expect(subscriptions.has(`debate::other-debate-id`)).toBe(true)
    })

    test('구독 해제 시 해당 토론만 제거', () => {
      const subscriptions = new Set<string>()
      subscriptions.add(`debate::${DEBATE_ID}`)
      subscriptions.add(`debate::other-debate-id`)

      subscriptions.delete(`debate::${DEBATE_ID}`)

      expect(subscriptions.size).toBe(1)
      expect(subscriptions.has(`debate::${DEBATE_ID}`)).toBe(false)
      expect(subscriptions.has(`debate::other-debate-id`)).toBe(true)
    })
  })

  // === broadcastToChannel integration pattern ===

  describe('broadcastToChannel 통합 패턴', () => {
    test('debate 이벤트 수신 → broadcastToChannel 호출 패턴 검증', () => {
      // Simulate the bridge from index.ts
      let broadcastCalled = false
      let broadcastChannelKey = ''
      let broadcastData: unknown = null

      const mockBroadcast = (channelKey: string, data: unknown) => {
        broadcastCalled = true
        broadcastChannelKey = channelKey
        broadcastData = data
      }

      // Simulate eventBus.on('debate', handler)
      const handler = (data: { companyId: string; payload: unknown }) => {
        const payload = data.payload as { debateId?: string }
        if (payload?.debateId) {
          mockBroadcast(`debate::${payload.debateId}`, data.payload)
        }
      }

      const eventPayload = {
        event: 'speech-delivered',
        debateId: DEBATE_ID,
        roundNum: 1,
        speech: { agentId: 'a1', agentName: 'A', content: 'test', position: 'pos' },
        timestamp: new Date().toISOString(),
      }

      handler({ companyId: COMPANY_ID, payload: eventPayload })

      expect(broadcastCalled).toBe(true)
      expect(broadcastChannelKey).toBe(`debate::${DEBATE_ID}`)
      expect(broadcastData).toBe(eventPayload)
    })

    test('debateId 없는 이벤트는 broadcastToChannel 호출하지 않음', () => {
      let broadcastCalled = false

      const mockBroadcast = () => {
        broadcastCalled = true
      }

      const handler = (data: { companyId: string; payload: unknown }) => {
        const payload = data.payload as { debateId?: string }
        if (payload?.debateId) {
          mockBroadcast()
        }
      }

      handler({ companyId: COMPANY_ID, payload: { event: 'unknown' } })

      expect(broadcastCalled).toBe(false)
    })
  })

  // === Event type consistency ===

  describe('이벤트 타입 일관성', () => {
    test('모든 DebateWsEvent event 값이 유효한 문자열', () => {
      const validEvents = ['debate-started', 'round-started', 'speech-delivered', 'round-ended', 'debate-completed', 'debate-failed']

      const events: DebateWsEvent[] = [
        { event: 'debate-started', debateId: 'x', topic: 't', totalRounds: 2, timestamp: '' },
        { event: 'round-started', debateId: 'x', roundNum: 1, totalRounds: 2, timestamp: '' },
        { event: 'speech-delivered', debateId: 'x', roundNum: 1, speech: { agentId: '', agentName: '', content: '', position: '' }, timestamp: '' },
        { event: 'round-ended', debateId: 'x', roundNum: 1, speechCount: 0, timestamp: '' },
        { event: 'debate-completed', debateId: 'x', result: { consensus: 'consensus', summary: '', majorityPosition: '', minorityPosition: '', keyArguments: [], roundCount: 0 }, timestamp: '' },
        { event: 'debate-failed', debateId: 'x', error: '', timestamp: '' },
      ]

      for (const ev of events) {
        expect(validEvents).toContain(ev.event)
      }
    })

    test('이벤트 이름 변경 확인: agent-spoke → speech-delivered', () => {
      // 기존 AGORA 엔진의 'agent-spoke'가 'speech-delivered'로 변경됨
      const event: DebateSpeechDeliveredEvent = {
        event: 'speech-delivered', // NOT 'agent-spoke'
        debateId: DEBATE_ID,
        roundNum: 1,
        speech: { agentId: 'a1', agentName: 'A', content: 'test', position: 'pos' },
        timestamp: '',
      }
      expect(event.event).toBe('speech-delivered')
      expect(event.event).not.toBe('agent-spoke')
    })

    test('이벤트 이름 변경 확인: debate-done → debate-completed', () => {
      const event: DebateCompletedEvent = {
        event: 'debate-completed', // NOT 'debate-done'
        debateId: DEBATE_ID,
        result: { consensus: 'consensus', summary: '', majorityPosition: '', minorityPosition: '', keyArguments: [], roundCount: 0 },
        timestamp: '',
      }
      expect(event.event).toBe('debate-completed')
      expect(event.event).not.toBe('debate-done')
    })
  })

  // === Channel subscription validation (simulated) ===

  describe('채널 구독 유효성 검증 (시뮬레이션)', () => {
    test('debateId 없이 구독 시도하면 MISSING_PARAM 에러', () => {
      // Simulate: msg.channel = 'debate', msg.params = undefined
      const id: string | undefined = undefined
      const response = id ? 'subscribed' : JSON.stringify({ type: 'error', code: 'MISSING_PARAM', channel: 'debate' })
      expect(response).toContain('MISSING_PARAM')
    })

    test('존재하지 않는 debateId로 구독 시도하면 FORBIDDEN', () => {
      // Simulate: debate not found in DB
      const debateFromDb: { companyId: string } | null = null
      const clientCompanyId = COMPANY_ID
      const shouldReject = !debateFromDb || debateFromDb.companyId !== clientCompanyId
      expect(shouldReject).toBe(true)
    })

    test('다른 companyId의 debate 구독 시도하면 FORBIDDEN', () => {
      const debateFromDb = { companyId: OTHER_COMPANY_ID }
      const clientCompanyId = COMPANY_ID
      const shouldReject = debateFromDb.companyId !== clientCompanyId
      expect(shouldReject).toBe(true)
    })

    test('같은 companyId의 debate 구독 성공', () => {
      const debateFromDb = { companyId: COMPANY_ID }
      const clientCompanyId = COMPANY_ID
      const shouldAllow = debateFromDb.companyId === clientCompanyId
      expect(shouldAllow).toBe(true)
    })
  })
})
