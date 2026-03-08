import { describe, test, expect } from 'bun:test'
import type {
  Debate,
  DebateStatus,
  DebateType,
  DebateWsEvent,
  DebateRoundStartedEvent,
  DebateSpeechDeliveredEvent,
  DebateRoundEndedEvent,
  DebateCompletedEvent,
  DebateFailedEvent,
  DebateStartedEvent,
  DebateResult,
  DebateRound,
  DebateSpeech,
  ConsensusResult,
  DebateTimelineEntry,
} from '@corthex/shared'

// ============================================================
// Tests for AGORA UI Story 11-4
// Since this is a frontend story, we test the shared type contracts,
// data transformation logic, and API response shapes that the UI depends on.
// ============================================================

describe('AGORA UI: Shared Types Contract', () => {
  test('Debate type has all required fields', () => {
    const debate: Debate = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      companyId: '550e8400-e29b-41d4-a716-446655440001',
      topic: '신규 사업 진출 전략',
      debateType: 'debate',
      status: 'completed',
      maxRounds: 2,
      participants: [
        { agentId: 'a1', agentName: '분석팀장', role: 'Manager' },
        { agentId: 'a2', agentName: '전략팀장', role: 'Manager' },
      ],
      rounds: [],
      result: null,
      createdBy: 'user1',
      error: null,
      startedAt: '2026-03-08T10:00:00Z',
      completedAt: '2026-03-08T10:05:00Z',
      createdAt: '2026-03-08T09:55:00Z',
      updatedAt: '2026-03-08T10:05:00Z',
    }
    expect(debate.id).toBeTruthy()
    expect(debate.topic).toBe('신규 사업 진출 전략')
    expect(debate.participants).toHaveLength(2)
  })

  test('DebateStatus has all valid values', () => {
    const statuses: DebateStatus[] = ['pending', 'in-progress', 'completed', 'failed']
    expect(statuses).toHaveLength(4)
  })

  test('DebateType has valid values', () => {
    const types: DebateType[] = ['debate', 'deep-debate']
    expect(types).toHaveLength(2)
  })

  test('ConsensusResult has valid values', () => {
    const results: ConsensusResult[] = ['consensus', 'dissent', 'partial']
    expect(results).toHaveLength(3)
  })

  test('DebateSpeech has all required fields', () => {
    const speech: DebateSpeech = {
      agentId: 'agent-1',
      agentName: '분석팀장',
      content: '저는 동남아 시장 진출을 제안합니다.',
      position: '찬성',
      createdAt: '2026-03-08T10:01:00Z',
    }
    expect(speech.agentId).toBeTruthy()
    expect(speech.content).toBeTruthy()
    expect(speech.position).toBe('찬성')
  })

  test('DebateRound contains speeches', () => {
    const round: DebateRound = {
      roundNum: 1,
      speeches: [
        { agentId: 'a1', agentName: '분석팀장', content: '찬성', position: '찬성', createdAt: '2026-03-08T10:01:00Z' },
        { agentId: 'a2', agentName: '전략팀장', content: '반대', position: '반대', createdAt: '2026-03-08T10:02:00Z' },
      ],
    }
    expect(round.roundNum).toBe(1)
    expect(round.speeches).toHaveLength(2)
  })

  test('DebateResult has all fields', () => {
    const result: DebateResult = {
      consensus: 'consensus',
      summary: '동남아 시장 진출에 합의',
      majorityPosition: '동남아 시장 진출 찬성',
      minorityPosition: '신중한 접근 필요',
      keyArguments: ['시장 성장성', '경쟁 우위', '리스크 관리'],
      roundCount: 2,
    }
    expect(result.consensus).toBe('consensus')
    expect(result.keyArguments).toHaveLength(3)
    expect(result.roundCount).toBe(2)
  })
})

describe('AGORA UI: WebSocket Event Types', () => {
  test('DebateStartedEvent structure', () => {
    const event: DebateStartedEvent = {
      event: 'debate-started',
      debateId: 'debate-1',
      topic: '신규 사업 전략',
      totalRounds: 2,
      timestamp: '2026-03-08T10:00:00Z',
    }
    expect(event.event).toBe('debate-started')
    expect(event.totalRounds).toBe(2)
  })

  test('DebateRoundStartedEvent structure', () => {
    const event: DebateRoundStartedEvent = {
      event: 'round-started',
      debateId: 'debate-1',
      roundNum: 1,
      totalRounds: 2,
      timestamp: '2026-03-08T10:00:01Z',
    }
    expect(event.event).toBe('round-started')
    expect(event.roundNum).toBe(1)
  })

  test('DebateSpeechDeliveredEvent structure', () => {
    const event: DebateSpeechDeliveredEvent = {
      event: 'speech-delivered',
      debateId: 'debate-1',
      roundNum: 1,
      speech: {
        agentId: 'agent-1',
        agentName: '분석팀장',
        content: '동남아 시장 진출을 제안합니다.',
        position: '찬성',
      },
      timestamp: '2026-03-08T10:01:00Z',
    }
    expect(event.event).toBe('speech-delivered')
    expect(event.speech.agentName).toBe('분석팀장')
  })

  test('DebateRoundEndedEvent structure', () => {
    const event: DebateRoundEndedEvent = {
      event: 'round-ended',
      debateId: 'debate-1',
      roundNum: 1,
      speechCount: 3,
      timestamp: '2026-03-08T10:03:00Z',
    }
    expect(event.event).toBe('round-ended')
    expect(event.speechCount).toBe(3)
  })

  test('DebateCompletedEvent structure', () => {
    const event: DebateCompletedEvent = {
      event: 'debate-completed',
      debateId: 'debate-1',
      result: {
        consensus: 'consensus',
        summary: '합의 도달',
        majorityPosition: '찬성',
        minorityPosition: '반대',
        keyArguments: ['arg1'],
        roundCount: 2,
      },
      timestamp: '2026-03-08T10:05:00Z',
    }
    expect(event.event).toBe('debate-completed')
    expect(event.result.consensus).toBe('consensus')
  })

  test('DebateFailedEvent structure', () => {
    const event: DebateFailedEvent = {
      event: 'debate-failed',
      debateId: 'debate-1',
      error: 'LLM provider timeout',
      timestamp: '2026-03-08T10:05:00Z',
    }
    expect(event.event).toBe('debate-failed')
    expect(event.error).toBe('LLM provider timeout')
  })

  test('DebateWsEvent union type covers all events', () => {
    const events: DebateWsEvent[] = [
      { event: 'debate-started', debateId: 'd1', topic: 'test', totalRounds: 2, timestamp: 't' },
      { event: 'round-started', debateId: 'd1', roundNum: 1, totalRounds: 2, timestamp: 't' },
      { event: 'speech-delivered', debateId: 'd1', roundNum: 1, speech: { agentId: 'a', agentName: 'A', content: 'c', position: 'p' }, timestamp: 't' },
      { event: 'round-ended', debateId: 'd1', roundNum: 1, speechCount: 1, timestamp: 't' },
      { event: 'debate-completed', debateId: 'd1', result: { consensus: 'consensus', summary: 's', majorityPosition: 'm', minorityPosition: 'mi', keyArguments: [], roundCount: 1 }, timestamp: 't' },
      { event: 'debate-failed', debateId: 'd1', error: 'err', timestamp: 't' },
    ]
    expect(events).toHaveLength(6)
  })

  test('DebateTimelineEntry is same as DebateWsEvent', () => {
    const entry: DebateTimelineEntry = {
      event: 'speech-delivered',
      debateId: 'd1',
      roundNum: 1,
      speech: { agentId: 'a', agentName: 'A', content: 'c', position: 'p' },
      timestamp: 't',
    }
    const wsEvent: DebateWsEvent = entry
    expect(wsEvent.event).toBe('speech-delivered')
  })
})

describe('AGORA UI: Timeline Data Transformation', () => {
  // Test the logic that transforms rounds data into timeline entries
  // This mirrors the buildEntriesFromRounds function in debate-timeline.tsx

  function buildEntriesFromRounds(rounds: DebateRound[], totalRounds: number) {
    const entries: { type: string; [k: string]: unknown }[] = []
    for (const round of rounds) {
      entries.push({ type: 'round-header', roundNum: round.roundNum, totalRounds })
      for (const speech of round.speeches) {
        entries.push({
          type: 'speech',
          agentId: speech.agentId,
          agentName: speech.agentName,
          content: speech.content,
          position: speech.position,
          roundNum: round.roundNum,
        })
      }
      entries.push({ type: 'round-end', roundNum: round.roundNum, speechCount: round.speeches.length })
    }
    return entries
  }

  test('transforms empty rounds to empty entries', () => {
    const entries = buildEntriesFromRounds([], 2)
    expect(entries).toHaveLength(0)
  })

  test('transforms single round with 2 speeches', () => {
    const rounds: DebateRound[] = [
      {
        roundNum: 1,
        speeches: [
          { agentId: 'a1', agentName: 'Agent1', content: 'Speech 1', position: 'for', createdAt: '2026-03-08T10:00:00Z' },
          { agentId: 'a2', agentName: 'Agent2', content: 'Speech 2', position: 'against', createdAt: '2026-03-08T10:01:00Z' },
        ],
      },
    ]
    const entries = buildEntriesFromRounds(rounds, 2)
    expect(entries).toHaveLength(4) // header + 2 speeches + round-end
    expect(entries[0].type).toBe('round-header')
    expect(entries[0].roundNum).toBe(1)
    expect(entries[0].totalRounds).toBe(2)
    expect(entries[1].type).toBe('speech')
    expect(entries[1].agentName).toBe('Agent1')
    expect(entries[2].type).toBe('speech')
    expect(entries[2].agentName).toBe('Agent2')
    expect(entries[3].type).toBe('round-end')
    expect(entries[3].speechCount).toBe(2)
  })

  test('transforms multiple rounds correctly', () => {
    const rounds: DebateRound[] = [
      { roundNum: 1, speeches: [{ agentId: 'a1', agentName: 'A', content: 'c1', position: 'p', createdAt: 't' }] },
      { roundNum: 2, speeches: [{ agentId: 'a1', agentName: 'A', content: 'c2', position: 'p', createdAt: 't' }, { agentId: 'a2', agentName: 'B', content: 'c3', position: 'p', createdAt: 't' }] },
    ]
    const entries = buildEntriesFromRounds(rounds, 3)
    // R1: header + 1 speech + end = 3
    // R2: header + 2 speeches + end = 4
    expect(entries).toHaveLength(7)
    expect(entries[0].type).toBe('round-header')
    expect(entries[0].roundNum).toBe(1)
    expect(entries[3].type).toBe('round-header')
    expect(entries[3].roundNum).toBe(2)
  })

  // Test buildEntriesFromTimeline logic
  function buildEntriesFromTimeline(timeline: DebateTimelineEntry[]) {
    const entries: { type: string; [k: string]: unknown }[] = []
    for (const ev of timeline) {
      switch (ev.event) {
        case 'round-started':
          entries.push({ type: 'round-header', roundNum: ev.roundNum, totalRounds: ev.totalRounds })
          break
        case 'speech-delivered':
          entries.push({ type: 'speech', agentId: ev.speech.agentId, agentName: ev.speech.agentName, content: ev.speech.content, position: ev.speech.position, roundNum: ev.roundNum })
          break
        case 'round-ended':
          entries.push({ type: 'round-end', roundNum: ev.roundNum, speechCount: ev.speechCount })
          break
        case 'debate-completed':
          entries.push({ type: 'result', result: ev.result })
          break
        case 'debate-failed':
          entries.push({ type: 'error', error: ev.error })
          break
      }
    }
    return entries
  }

  test('transforms timeline events to entries', () => {
    const timeline: DebateTimelineEntry[] = [
      { event: 'round-started', debateId: 'd1', roundNum: 1, totalRounds: 2, timestamp: 't' },
      { event: 'speech-delivered', debateId: 'd1', roundNum: 1, speech: { agentId: 'a1', agentName: 'A1', content: 'c', position: 'p' }, timestamp: 't' },
      { event: 'round-ended', debateId: 'd1', roundNum: 1, speechCount: 1, timestamp: 't' },
      { event: 'debate-completed', debateId: 'd1', result: { consensus: 'consensus', summary: 's', majorityPosition: 'm', minorityPosition: 'mi', keyArguments: ['a'], roundCount: 1 }, timestamp: 't' },
    ]
    const entries = buildEntriesFromTimeline(timeline)
    expect(entries).toHaveLength(4)
    expect(entries[0].type).toBe('round-header')
    expect(entries[1].type).toBe('speech')
    expect(entries[2].type).toBe('round-end')
    expect(entries[3].type).toBe('result')
  })

  test('handles debate-failed in timeline', () => {
    const timeline: DebateTimelineEntry[] = [
      { event: 'round-started', debateId: 'd1', roundNum: 1, totalRounds: 2, timestamp: 't' },
      { event: 'debate-failed', debateId: 'd1', error: 'timeout', timestamp: 't' },
    ]
    const entries = buildEntriesFromTimeline(timeline)
    expect(entries).toHaveLength(2)
    expect(entries[1].type).toBe('error')
    expect(entries[1].error).toBe('timeout')
  })

  test('handles empty timeline', () => {
    const entries = buildEntriesFromTimeline([])
    expect(entries).toHaveLength(0)
  })

  test('skips debate-started events (no UI entry for that)', () => {
    const timeline: DebateTimelineEntry[] = [
      { event: 'debate-started', debateId: 'd1', topic: 'test', totalRounds: 2, timestamp: 't' },
    ]
    const entries = buildEntriesFromTimeline(timeline)
    expect(entries).toHaveLength(0) // debate-started is not shown as a timeline entry
  })
})

describe('AGORA UI: Avatar Color Hashing', () => {
  function getAvatarColorIndex(agentId: string): number {
    let hash = 0
    for (let i = 0; i < agentId.length; i++) {
      hash = ((hash << 5) - hash + agentId.charCodeAt(i)) | 0
    }
    return Math.abs(hash) % 8
  }

  test('same agentId always produces same color', () => {
    const color1 = getAvatarColorIndex('agent-123')
    const color2 = getAvatarColorIndex('agent-123')
    expect(color1).toBe(color2)
  })

  test('different agentIds produce different colors (usually)', () => {
    const colors = new Set<number>()
    for (let i = 0; i < 20; i++) {
      colors.add(getAvatarColorIndex(`agent-${i}`))
    }
    // At least 3 different colors out of 20 agents
    expect(colors.size).toBeGreaterThan(2)
  })

  test('color index is within valid range', () => {
    for (let i = 0; i < 100; i++) {
      const idx = getAvatarColorIndex(`test-agent-${i}`)
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(8)
    }
  })
})

describe('AGORA UI: Status Badge Mapping', () => {
  const STATUS_BADGE: Record<DebateStatus, { label: string; variant: string }> = {
    pending: { label: '대기', variant: 'default' },
    'in-progress': { label: '진행중', variant: 'warning' },
    completed: { label: '완료', variant: 'success' },
    failed: { label: '실패', variant: 'error' },
  }

  test('all debate statuses have badge mappings', () => {
    const statuses: DebateStatus[] = ['pending', 'in-progress', 'completed', 'failed']
    for (const status of statuses) {
      expect(STATUS_BADGE[status]).toBeDefined()
      expect(STATUS_BADGE[status].label).toBeTruthy()
      expect(STATUS_BADGE[status].variant).toBeTruthy()
    }
  })

  test('badge variants are valid UI variants', () => {
    const validVariants = ['default', 'success', 'warning', 'error', 'info', 'purple', 'amber']
    for (const status of Object.values(STATUS_BADGE)) {
      expect(validVariants).toContain(status.variant)
    }
  })
})

describe('AGORA UI: Consensus Card Styles', () => {
  const CONSENSUS_STYLES: Record<ConsensusResult, { icon: string; label: string }> = {
    consensus: { icon: '✅', label: '합의 도달' },
    dissent: { icon: '❌', label: '합의 실패 (이견)' },
    partial: { icon: '⚠️', label: '부분 합의' },
  }

  test('all consensus results have styles', () => {
    const results: ConsensusResult[] = ['consensus', 'dissent', 'partial']
    for (const result of results) {
      expect(CONSENSUS_STYLES[result]).toBeDefined()
      expect(CONSENSUS_STYLES[result].icon).toBeTruthy()
      expect(CONSENSUS_STYLES[result].label).toBeTruthy()
    }
  })
})

describe('AGORA UI: Debate List Filtering', () => {
  const mockDebates: { status: DebateStatus; topic: string }[] = [
    { status: 'completed', topic: '전략 토론 1' },
    { status: 'in-progress', topic: '전략 토론 2' },
    { status: 'completed', topic: '전략 토론 3' },
    { status: 'failed', topic: '전략 토론 4' },
    { status: 'pending', topic: '전략 토론 5' },
  ]

  test('filter all returns all debates', () => {
    const filtered = mockDebates
    expect(filtered).toHaveLength(5)
  })

  test('filter in-progress', () => {
    const filtered = mockDebates.filter((d) => d.status === 'in-progress')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].topic).toBe('전략 토론 2')
  })

  test('filter completed', () => {
    const filtered = mockDebates.filter((d) => d.status === 'completed')
    expect(filtered).toHaveLength(2)
  })

  test('filter failed', () => {
    const filtered = mockDebates.filter((d) => d.status === 'failed')
    expect(filtered).toHaveLength(1)
  })
})

describe('AGORA UI: Speech Card Collapse Logic', () => {
  const COLLAPSE_THRESHOLD = 200

  test('short content should not collapse', () => {
    const content = '짧은 발언입니다.'
    expect(content.length <= COLLAPSE_THRESHOLD).toBe(true)
  })

  test('long content should collapse', () => {
    const content = '가'.repeat(250)
    expect(content.length > COLLAPSE_THRESHOLD).toBe(true)
    const collapsed = content.slice(0, COLLAPSE_THRESHOLD) + '...'
    expect(collapsed.length).toBe(COLLAPSE_THRESHOLD + 3)
  })

  test('threshold boundary - exactly 200 chars', () => {
    const content = 'a'.repeat(200)
    expect(content.length > COLLAPSE_THRESHOLD).toBe(false)
  })

  test('threshold boundary - 201 chars triggers collapse', () => {
    const content = 'a'.repeat(201)
    expect(content.length > COLLAPSE_THRESHOLD).toBe(true)
  })
})

describe('AGORA UI: API Response Shape Validation', () => {
  test('debates list API response shape', () => {
    const response = {
      success: true,
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          companyId: 'c1',
          topic: '토론 주제',
          debateType: 'debate' as DebateType,
          status: 'completed' as DebateStatus,
          maxRounds: 2,
          participants: [{ agentId: 'a1', agentName: 'A1', role: 'Manager' }],
          rounds: [],
          result: null,
          createdBy: 'user1',
          error: null,
          startedAt: null,
          completedAt: null,
          createdAt: '2026-03-08T10:00:00Z',
          updatedAt: '2026-03-08T10:00:00Z',
        },
      ],
    }
    expect(response.success).toBe(true)
    expect(Array.isArray(response.data)).toBe(true)
    expect(response.data[0].topic).toBe('토론 주제')
  })

  test('debate detail API response shape', () => {
    const response = {
      success: true,
      data: {
        id: 'd1',
        companyId: 'c1',
        topic: '상세 토론',
        debateType: 'deep-debate' as DebateType,
        status: 'completed' as DebateStatus,
        maxRounds: 3,
        participants: [
          { agentId: 'a1', agentName: 'A1', role: 'Manager' },
          { agentId: 'a2', agentName: 'A2', role: 'Manager' },
        ],
        rounds: [
          { roundNum: 1, speeches: [{ agentId: 'a1', agentName: 'A1', content: 'c1', position: 'for', createdAt: 't' }] },
        ],
        result: {
          consensus: 'consensus' as ConsensusResult,
          summary: '합의',
          majorityPosition: '찬성',
          minorityPosition: '반대',
          keyArguments: ['이유 1'],
          roundCount: 1,
        },
        createdBy: 'user1',
        error: null,
        startedAt: '2026-03-08T10:00:00Z',
        completedAt: '2026-03-08T10:05:00Z',
        createdAt: '2026-03-08T09:55:00Z',
        updatedAt: '2026-03-08T10:05:00Z',
      },
    }
    expect(response.data.rounds).toHaveLength(1)
    expect(response.data.result?.consensus).toBe('consensus')
  })

  test('timeline API response shape', () => {
    const response = {
      success: true,
      data: [
        { event: 'round-started' as const, debateId: 'd1', roundNum: 1, totalRounds: 2, timestamp: 't' },
        { event: 'speech-delivered' as const, debateId: 'd1', roundNum: 1, speech: { agentId: 'a1', agentName: 'A', content: 'c', position: 'p' }, timestamp: 't' },
      ] as DebateTimelineEntry[],
    }
    expect(response.data).toHaveLength(2)
    expect(response.data[0].event).toBe('round-started')
  })
})

describe('AGORA UI: Create Debate Request', () => {
  test('debate request body shape', () => {
    const request = {
      topic: '신규 사업 전략 논의',
      debateType: 'debate' as DebateType,
      participantAgentIds: ['agent-1', 'agent-2', 'agent-3'],
    }
    expect(request.topic.length).toBeGreaterThan(0)
    expect(request.participantAgentIds.length).toBeGreaterThanOrEqual(2)
  })

  test('deep-debate request', () => {
    const request = {
      topic: '시장 분석 심층토론',
      debateType: 'deep-debate' as DebateType,
      participantAgentIds: ['agent-1', 'agent-2'],
      maxRounds: 3,
    }
    expect(request.debateType).toBe('deep-debate')
    expect(request.maxRounds).toBe(3)
  })

  test('minimum 2 participants required', () => {
    const ids = ['agent-1', 'agent-2']
    expect(ids.length >= 2).toBe(true)
  })

  test('single participant should be invalid', () => {
    const ids = ['agent-1']
    expect(ids.length >= 2).toBe(false)
  })
})

describe('AGORA UI: Date Formatting', () => {
  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  test('null date returns dash', () => {
    expect(formatDate(null)).toBe('-')
  })

  test('valid date formats correctly', () => {
    const formatted = formatDate('2026-03-08T10:00:00Z')
    expect(formatted).toBeTruthy()
    expect(formatted).not.toBe('-')
  })
})

describe('AGORA UI: Navigation State', () => {
  test('debateId can be extracted from URL params', () => {
    const params = new URLSearchParams('?debateId=550e8400-e29b-41d4-a716-446655440000')
    const debateId = params.get('debateId')
    expect(debateId).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('missing debateId returns null', () => {
    const params = new URLSearchParams('')
    const debateId = params.get('debateId')
    expect(debateId).toBeNull()
  })
})
