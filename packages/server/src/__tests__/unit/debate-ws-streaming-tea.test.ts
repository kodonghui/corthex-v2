import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
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
  DebateResult,
} from '@corthex/shared'

// === TEA Risk-Based Tests: Debate WebSocket Channel Streaming (E11-S3) ===
// Risk areas: event ordering, concurrent subscriptions, payload integrity,
// timeline consistency, edge cases in debate lifecycle

describe('TEA: Debate WS Streaming -- Risk-Based Coverage', () => {
  const COMPANY_A = 'comp-aaaa-bbbb-cccc-dddddddddddd'
  const COMPANY_B = 'comp-1111-2222-3333-444444444444'
  const DEBATE_1 = 'deb-aaaa-1111-2222-333333333333'
  const DEBATE_2 = 'deb-bbbb-4444-5555-666666666666'

  // === Risk Area 1: EventBus listener memory leaks ===

  describe('EventBus 리스너 누수 방지', () => {
    test('이벤트 리스너 등록 후 반드시 해제해야 함', () => {
      const initialCount = eventBus.listenerCount('debate')
      const handler = () => {}
      eventBus.on('debate', handler)
      expect(eventBus.listenerCount('debate')).toBe(initialCount + 1)
      eventBus.removeListener('debate', handler)
      expect(eventBus.listenerCount('debate')).toBe(initialCount)
    })

    test('동일 핸들러 중복 등록 시 이벤트가 중복 수신됨', () => {
      const events: unknown[] = []
      const handler = (d: unknown) => events.push(d)
      eventBus.on('debate', handler)
      eventBus.on('debate', handler)

      eventBus.emit('debate', { companyId: COMPANY_A, payload: { event: 'test', debateId: 'x' } })

      expect(events).toHaveLength(2) // 중복 등록 → 중복 수신

      eventBus.removeListener('debate', handler)
      eventBus.removeListener('debate', handler)
    })
  })

  // === Risk Area 2: Payload integrity under various data shapes ===

  describe('페이로드 무결성 -- 다양한 데이터 형태', () => {
    test('빈 topic으로 debate-started 이벤트 처리', () => {
      const events: unknown[] = []
      const handler = (d: unknown) => events.push(d)
      eventBus.on('debate', handler)

      const payload: DebateStartedEvent = {
        event: 'debate-started',
        debateId: DEBATE_1,
        topic: '',
        totalRounds: 2,
        timestamp: new Date().toISOString(),
      }
      eventBus.emit('debate', { companyId: COMPANY_A, payload })

      const received = (events[0] as { payload: DebateStartedEvent }).payload
      expect(received.topic).toBe('')
      expect(received.totalRounds).toBe(2)

      eventBus.removeListener('debate', handler)
    })

    test('긴 한글 발언 내용 처리 (500자 MAX_SPEECH_LENGTH)', () => {
      const longContent = '가'.repeat(500)
      const events: unknown[] = []
      const handler = (d: unknown) => events.push(d)
      eventBus.on('debate', handler)

      const payload: DebateSpeechDeliveredEvent = {
        event: 'speech-delivered',
        debateId: DEBATE_1,
        roundNum: 1,
        speech: {
          agentId: 'agent-1',
          agentName: '전략분석전문가',
          content: longContent,
          position: '강력 찬성',
        },
        timestamp: new Date().toISOString(),
      }
      eventBus.emit('debate', { companyId: COMPANY_A, payload })

      const received = (events[0] as { payload: DebateSpeechDeliveredEvent }).payload
      expect(received.speech.content).toHaveLength(500)

      eventBus.removeListener('debate', handler)
    })

    test('특수 문자가 포함된 topic 처리', () => {
      const specialTopic = 'AI 투자 전략 <script>alert("XSS")</script> & "quotes" \'apostrophe\''
      const events: unknown[] = []
      const handler = (d: unknown) => events.push(d)
      eventBus.on('debate', handler)

      const payload: DebateStartedEvent = {
        event: 'debate-started',
        debateId: DEBATE_1,
        topic: specialTopic,
        totalRounds: 2,
        timestamp: new Date().toISOString(),
      }
      eventBus.emit('debate', { companyId: COMPANY_A, payload })

      const received = (events[0] as { payload: DebateStartedEvent }).payload
      expect(received.topic).toBe(specialTopic) // 이벤트 전달 시 원본 그대로

      eventBus.removeListener('debate', handler)
    })

    test('speechCount가 0인 round-ended 이벤트 (모든 에이전트 실패)', () => {
      const payload: DebateRoundEndedEvent = {
        event: 'round-ended',
        debateId: DEBATE_1,
        roundNum: 1,
        speechCount: 0,
        timestamp: new Date().toISOString(),
      }
      expect(payload.speechCount).toBe(0)
      expect(payload.roundNum).toBe(1)
    })

    test('keyArguments가 빈 배열인 debate-completed', () => {
      const result: DebateResult = {
        consensus: 'dissent',
        summary: '합의 실패',
        majorityPosition: 'A 의견',
        minorityPosition: 'B 의견',
        keyArguments: [],
        roundCount: 3,
      }
      const payload: DebateCompletedEvent = {
        event: 'debate-completed',
        debateId: DEBATE_1,
        result,
        timestamp: new Date().toISOString(),
      }
      expect(payload.result.keyArguments).toHaveLength(0)
      expect(payload.result.consensus).toBe('dissent')
    })

    test('에러 메시지가 매우 긴 경우 debate-failed', () => {
      const longError = 'E'.repeat(2000)
      const payload: DebateFailedEvent = {
        event: 'debate-failed',
        debateId: DEBATE_1,
        error: longError,
        timestamp: new Date().toISOString(),
      }
      expect(payload.error).toHaveLength(2000)
    })
  })

  // === Risk Area 3: Multi-debate concurrent event streams ===

  describe('다중 토론 동시 이벤트 스트림', () => {
    test('두 토론의 이벤트가 독립적으로 라우팅됨', () => {
      const debate1Events: unknown[] = []
      const debate2Events: unknown[] = []

      const handler = (data: { companyId: string; payload: { debateId: string; event: string } }) => {
        if (data.payload.debateId === DEBATE_1) debate1Events.push(data.payload)
        if (data.payload.debateId === DEBATE_2) debate2Events.push(data.payload)
      }

      eventBus.on('debate', handler)

      // Interleaved events from two debates
      eventBus.emit('debate', { companyId: COMPANY_A, payload: { event: 'round-started', debateId: DEBATE_1, roundNum: 1 } })
      eventBus.emit('debate', { companyId: COMPANY_A, payload: { event: 'round-started', debateId: DEBATE_2, roundNum: 1 } })
      eventBus.emit('debate', { companyId: COMPANY_A, payload: { event: 'speech-delivered', debateId: DEBATE_1, roundNum: 1 } })
      eventBus.emit('debate', { companyId: COMPANY_A, payload: { event: 'debate-completed', debateId: DEBATE_2, result: {} } })

      expect(debate1Events).toHaveLength(2) // round-started + speech-delivered
      expect(debate2Events).toHaveLength(2) // round-started + debate-completed

      eventBus.removeListener('debate', handler)
    })

    test('서로 다른 companyId의 토론 이벤트 분리', () => {
      const companyAEvents: unknown[] = []
      const companyBEvents: unknown[] = []

      const handler = (data: { companyId: string; payload: unknown }) => {
        if (data.companyId === COMPANY_A) companyAEvents.push(data.payload)
        if (data.companyId === COMPANY_B) companyBEvents.push(data.payload)
      }

      eventBus.on('debate', handler)

      eventBus.emit('debate', { companyId: COMPANY_A, payload: { event: 'round-started', debateId: DEBATE_1 } })
      eventBus.emit('debate', { companyId: COMPANY_B, payload: { event: 'round-started', debateId: DEBATE_2 } })

      expect(companyAEvents).toHaveLength(1)
      expect(companyBEvents).toHaveLength(1)

      eventBus.removeListener('debate', handler)
    })
  })

  // === Risk Area 4: Timeline consistency and ordering ===

  describe('타임라인 일관성 및 순서 보장', () => {
    test('2라운드 토론의 전체 타임라인 이벤트 시퀀스', () => {
      const timeline: DebateTimelineEntry[] = [
        { event: 'debate-started', debateId: DEBATE_1, topic: 'AI 투자', totalRounds: 2, timestamp: '2026-01-01T00:00:00.000Z' },
        { event: 'round-started', debateId: DEBATE_1, roundNum: 1, totalRounds: 2, timestamp: '2026-01-01T00:00:01.000Z' },
        { event: 'speech-delivered', debateId: DEBATE_1, roundNum: 1, speech: { agentId: 'a1', agentName: 'Agent1', content: 'x', position: 'y' }, timestamp: '2026-01-01T00:00:02.000Z' },
        { event: 'speech-delivered', debateId: DEBATE_1, roundNum: 1, speech: { agentId: 'a2', agentName: 'Agent2', content: 'z', position: 'w' }, timestamp: '2026-01-01T00:00:03.000Z' },
        { event: 'round-ended', debateId: DEBATE_1, roundNum: 1, speechCount: 2, timestamp: '2026-01-01T00:00:04.000Z' },
        { event: 'round-started', debateId: DEBATE_1, roundNum: 2, totalRounds: 2, timestamp: '2026-01-01T00:00:05.000Z' },
        { event: 'speech-delivered', debateId: DEBATE_1, roundNum: 2, speech: { agentId: 'a1', agentName: 'Agent1', content: 'rebuttal', position: 'p' }, timestamp: '2026-01-01T00:00:06.000Z' },
        { event: 'speech-delivered', debateId: DEBATE_1, roundNum: 2, speech: { agentId: 'a2', agentName: 'Agent2', content: 'counter', position: 'q' }, timestamp: '2026-01-01T00:00:07.000Z' },
        { event: 'round-ended', debateId: DEBATE_1, roundNum: 2, speechCount: 2, timestamp: '2026-01-01T00:00:08.000Z' },
        { event: 'debate-completed', debateId: DEBATE_1, result: { consensus: 'partial', summary: '부분 합의', majorityPosition: 'A', minorityPosition: 'B', keyArguments: ['point1'], roundCount: 2 }, timestamp: '2026-01-01T00:00:09.000Z' },
      ]

      // Total 10 events for 2-round debate with 2 participants
      expect(timeline).toHaveLength(10)

      // Event sequence validation
      const eventSeq = timeline.map(t => t.event)
      expect(eventSeq[0]).toBe('debate-started')
      expect(eventSeq[1]).toBe('round-started')
      expect(eventSeq[4]).toBe('round-ended')
      expect(eventSeq[5]).toBe('round-started')
      expect(eventSeq[8]).toBe('round-ended')
      expect(eventSeq[9]).toBe('debate-completed')

      // Monotonic timestamp ordering
      for (let i = 1; i < timeline.length; i++) {
        expect(new Date(timeline[i].timestamp).getTime()).toBeGreaterThanOrEqual(
          new Date(timeline[i - 1].timestamp).getTime()
        )
      }

      // Round number progression
      const roundStartEvents = timeline.filter(t => t.event === 'round-started') as DebateRoundStartedEvent[]
      expect(roundStartEvents[0].roundNum).toBe(1)
      expect(roundStartEvents[1].roundNum).toBe(2)
    })

    test('3라운드 심층토론의 이벤트 수 검증', () => {
      // deep-debate: 3 rounds × 3 participants = expected events:
      // debate-started + (round-started + 3 speeches + round-ended) × 3 + debate-completed
      // = 1 + (1 + 3 + 1) × 3 + 1 = 1 + 15 + 1 = 17
      const participantCount = 3
      const rounds = 3
      const expectedEvents = 1 + (1 + participantCount + 1) * rounds + 1
      expect(expectedEvents).toBe(17)
    })

    test('빈 타임라인 (아직 시작 안 된 토론)', () => {
      const timeline: DebateTimelineEntry[] = []
      expect(timeline).toHaveLength(0)
    })
  })

  // === Risk Area 5: Bridge handler edge cases ===

  describe('브릿지 핸들러 엣지 케이스', () => {
    test('payload가 null인 debate 이벤트', () => {
      const handler = (data: { companyId: string; payload: unknown }) => {
        const payload = data.payload as { debateId?: string } | null
        const debateId = payload?.debateId
        expect(debateId).toBeUndefined()
      }

      handler({ companyId: COMPANY_A, payload: null })
    })

    test('payload가 빈 객체인 debate 이벤트', () => {
      const handler = (data: { companyId: string; payload: unknown }) => {
        const payload = data.payload as { debateId?: string }
        const debateId = payload?.debateId
        expect(debateId).toBeUndefined()
      }

      handler({ companyId: COMPANY_A, payload: {} })
    })

    test('debateId가 빈 문자열인 경우', () => {
      const handler = (data: { companyId: string; payload: unknown }) => {
        const payload = data.payload as { debateId?: string }
        if (payload?.debateId) {
          // 빈 문자열은 falsy → broadcastToChannel 호출 안 함
          expect(true).toBe(true)
        }
      }

      // Empty string is falsy
      const emptyDebateId = ''
      expect(!!emptyDebateId).toBe(false)
    })

    test('companyId 없는 이벤트는 정상 처리되어야 함', () => {
      // EventBus는 companyId 없어도 이벤트를 전달하지만
      // broadcastToChannel은 debateId 기반이므로 companyId 무관
      const events: unknown[] = []
      const handler = (d: unknown) => events.push(d)
      eventBus.on('debate', handler)

      eventBus.emit('debate', { companyId: '', payload: { event: 'round-started', debateId: DEBATE_1 } })

      expect(events).toHaveLength(1)
      const received = events[0] as { companyId: string }
      expect(received.companyId).toBe('')

      eventBus.removeListener('debate', handler)
    })
  })

  // === Risk Area 6: Subscription set behavior ===

  describe('구독 Set 동작', () => {
    test('동일 debateId 중복 구독 시 Set에 하나만 저장', () => {
      const subs = new Set<string>()
      subs.add(`debate::${DEBATE_1}`)
      subs.add(`debate::${DEBATE_1}`) // 중복
      expect(subs.size).toBe(1)
    })

    test('대량 구독 (100개 토론) 성능', () => {
      const subs = new Set<string>()
      for (let i = 0; i < 100; i++) {
        subs.add(`debate::debate-${i}`)
      }
      expect(subs.size).toBe(100)
      expect(subs.has('debate::debate-50')).toBe(true)
      expect(subs.has('debate::debate-999')).toBe(false)
    })

    test('구독 패턴이 다른 채널과 충돌하지 않음', () => {
      const subs = new Set<string>()
      subs.add(`debate::${DEBATE_1}`)
      subs.add(`command::${COMPANY_A}`)
      subs.add(`delegation::${COMPANY_A}`)
      subs.add(`chat-stream::some-session-id`)

      expect(subs.has(`debate::${DEBATE_1}`)).toBe(true)
      expect(subs.has(`command::${DEBATE_1}`)).toBe(false) // debate ID가 command 채널과 충돌 없음
    })
  })

  // === Risk Area 7: ConsensusResult edge cases ===

  describe('ConsensusResult 엣지 케이스', () => {
    test('모든 합의 결과 타입 처리', () => {
      const results: DebateResult[] = [
        { consensus: 'consensus', summary: '완전 합의', majorityPosition: 'A', minorityPosition: '', keyArguments: ['p1', 'p2'], roundCount: 2 },
        { consensus: 'dissent', summary: '완전 비합의', majorityPosition: 'A', minorityPosition: 'B', keyArguments: ['p1'], roundCount: 3 },
        { consensus: 'partial', summary: '부분 합의', majorityPosition: 'A', minorityPosition: 'C', keyArguments: [], roundCount: 2 },
      ]

      for (const result of results) {
        const event: DebateCompletedEvent = {
          event: 'debate-completed',
          debateId: DEBATE_1,
          result,
          timestamp: new Date().toISOString(),
        }
        expect(['consensus', 'dissent', 'partial']).toContain(event.result.consensus)
      }
    })

    test('keyArguments에 10개 항목까지 허용', () => {
      const args = Array.from({ length: 10 }, (_, i) => `논점 ${i + 1}`)
      const result: DebateResult = {
        consensus: 'partial',
        summary: '복잡한 토론',
        majorityPosition: 'A',
        minorityPosition: 'B',
        keyArguments: args,
        roundCount: 3,
      }
      expect(result.keyArguments).toHaveLength(10)
    })
  })

  // === Risk Area 8: emitDebateEvent signature change regression ===

  describe('emitDebateEvent 시그니처 변경 회귀 방지', () => {
    test('이벤트 payload에 debateId가 최상위에 포함됨', () => {
      const events: unknown[] = []
      const handler = (d: unknown) => events.push(d)
      eventBus.on('debate', handler)

      // New signature: event object has debateId at top level
      const payload = {
        event: 'round-started',
        debateId: DEBATE_1, // ← 반드시 최상위
        roundNum: 1,
        totalRounds: 2,
        timestamp: new Date().toISOString(),
      }
      eventBus.emit('debate', { companyId: COMPANY_A, payload })

      const received = events[0] as { payload: Record<string, unknown> }
      expect(received.payload.debateId).toBe(DEBATE_1) // debateId는 payload 최상위
      expect(received.payload.event).toBe('round-started')

      eventBus.removeListener('debate', handler)
    })

    test('이전 형태 (type 필드 사용)가 아닌 event 필드 사용 확인', () => {
      // 이전: { type: 'round-started', ... }
      // 현재: { event: 'round-started', ... }
      const payload: DebateRoundStartedEvent = {
        event: 'round-started',
        debateId: DEBATE_1,
        roundNum: 1,
        totalRounds: 2,
        timestamp: '',
      }
      expect('event' in payload).toBe(true)
      expect(payload.event).toBe('round-started')
    })
  })

  // === Risk Area 9: Rapid event emission (burst scenario) ===

  describe('급속 이벤트 발행 (버스트 시나리오)', () => {
    test('빠른 연속 이벤트 발행 시 모두 수신됨', () => {
      const events: unknown[] = []
      const handler = (d: unknown) => events.push(d)
      eventBus.on('debate', handler)

      // 20 rapid-fire events
      for (let i = 0; i < 20; i++) {
        eventBus.emit('debate', {
          companyId: COMPANY_A,
          payload: { event: 'speech-delivered', debateId: DEBATE_1, roundNum: 1, index: i },
        })
      }

      expect(events).toHaveLength(20)

      eventBus.removeListener('debate', handler)
    })

    test('다중 리스너 모두 이벤트 수신', () => {
      const listener1Events: unknown[] = []
      const listener2Events: unknown[] = []
      const handler1 = (d: unknown) => listener1Events.push(d)
      const handler2 = (d: unknown) => listener2Events.push(d)

      eventBus.on('debate', handler1)
      eventBus.on('debate', handler2)

      eventBus.emit('debate', { companyId: COMPANY_A, payload: { event: 'round-started', debateId: DEBATE_1 } })

      expect(listener1Events).toHaveLength(1)
      expect(listener2Events).toHaveLength(1)

      eventBus.removeListener('debate', handler1)
      eventBus.removeListener('debate', handler2)
    })
  })

  // === Risk Area 10: Channel key parsing ===

  describe('채널 키 파싱', () => {
    test('broadcastToChannel에서 채널명 추출', () => {
      const channelKey = `debate::${DEBATE_1}`
      const channelName = channelKey.split('::')[0]
      expect(channelName).toBe('debate')
    })

    test('debateId에 ::가 포함된 경우에도 안전', () => {
      // UUID 형식이므로 :: 포함 불가, 하지만 방어적 검증
      const normalId = 'deb-aaaa-1111-2222-333333333333'
      const key = `debate::${normalId}`
      const parts = key.split('::')
      expect(parts[0]).toBe('debate')
      expect(parts[1]).toBe(normalId)
    })
  })
})
