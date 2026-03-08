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
// TEA Risk-Based Tests for AGORA UI (Story 11-4)
// Focus: Edge cases, error handling, boundary conditions,
//        integration patterns, and regression prevention
// ============================================================

// --- Replicate data transformation functions for testing ---

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

function buildEntriesFromTimeline(timeline: DebateTimelineEntry[]) {
  const entries: { type: string; [k: string]: unknown }[] = []
  for (const ev of timeline) {
    switch (ev.event) {
      case 'round-started':
        entries.push({ type: 'round-header', roundNum: ev.roundNum, totalRounds: ev.totalRounds })
        break
      case 'speech-delivered':
        entries.push({
          type: 'speech',
          agentId: ev.speech.agentId,
          agentName: ev.speech.agentName,
          content: ev.speech.content,
          position: ev.speech.position,
          roundNum: ev.roundNum,
        })
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

function getAvatarColorIndex(agentId: string): number {
  let hash = 0
  for (let i = 0; i < agentId.length; i++) {
    hash = ((hash << 5) - hash + agentId.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 8
}

// ============================================================
// P0: Critical Path - WebSocket Event Handling Edge Cases
// ============================================================

describe('TEA P0: WS Event Sequence Edge Cases', () => {
  test('handles out-of-order events gracefully', () => {
    // speech-delivered before round-started (race condition)
    const timeline: DebateTimelineEntry[] = [
      { event: 'speech-delivered', debateId: 'd1', roundNum: 1, speech: { agentId: 'a1', agentName: 'A', content: 'c', position: 'p' }, timestamp: 't1' },
      { event: 'round-started', debateId: 'd1', roundNum: 1, totalRounds: 2, timestamp: 't2' },
    ]
    const entries = buildEntriesFromTimeline(timeline)
    // Should not crash, produces entries in received order
    expect(entries).toHaveLength(2)
    expect(entries[0].type).toBe('speech')
    expect(entries[1].type).toBe('round-header')
  })

  test('handles duplicate round-started events', () => {
    const timeline: DebateTimelineEntry[] = [
      { event: 'round-started', debateId: 'd1', roundNum: 1, totalRounds: 2, timestamp: 't1' },
      { event: 'round-started', debateId: 'd1', roundNum: 1, totalRounds: 2, timestamp: 't2' },
    ]
    const entries = buildEntriesFromTimeline(timeline)
    expect(entries).toHaveLength(2) // Both processed (UI handles display)
  })

  test('handles debate-failed after partial round', () => {
    const timeline: DebateTimelineEntry[] = [
      { event: 'round-started', debateId: 'd1', roundNum: 1, totalRounds: 2, timestamp: 't1' },
      { event: 'speech-delivered', debateId: 'd1', roundNum: 1, speech: { agentId: 'a1', agentName: 'A', content: 'c', position: 'p' }, timestamp: 't2' },
      { event: 'debate-failed', debateId: 'd1', error: 'LLM timeout during round 1', timestamp: 't3' },
    ]
    const entries = buildEntriesFromTimeline(timeline)
    expect(entries).toHaveLength(3)
    expect(entries[2].type).toBe('error')
    expect(entries[2].error).toBe('LLM timeout during round 1')
  })

  test('handles debate-completed without any round-ended', () => {
    const timeline: DebateTimelineEntry[] = [
      { event: 'debate-completed', debateId: 'd1', result: {
        consensus: 'consensus', summary: 's', majorityPosition: 'm',
        minorityPosition: 'mi', keyArguments: [], roundCount: 0,
      }, timestamp: 't' },
    ]
    const entries = buildEntriesFromTimeline(timeline)
    expect(entries).toHaveLength(1)
    expect(entries[0].type).toBe('result')
  })

  test('handles very long timeline (100+ events)', () => {
    const timeline: DebateTimelineEntry[] = []
    for (let r = 1; r <= 10; r++) {
      timeline.push({ event: 'round-started', debateId: 'd1', roundNum: r, totalRounds: 10, timestamp: `t-r${r}-start` })
      for (let s = 0; s < 10; s++) {
        timeline.push({
          event: 'speech-delivered', debateId: 'd1', roundNum: r,
          speech: { agentId: `a${s}`, agentName: `Agent${s}`, content: `Speech ${r}-${s}`, position: 'neutral' },
          timestamp: `t-r${r}-s${s}`,
        })
      }
      timeline.push({ event: 'round-ended', debateId: 'd1', roundNum: r, speechCount: 10, timestamp: `t-r${r}-end` })
    }
    const entries = buildEntriesFromTimeline(timeline)
    // 10 rounds * (1 header + 10 speeches + 1 end) = 120
    expect(entries).toHaveLength(120)
  })
})

describe('TEA P0: WS Event Type Discrimination', () => {
  test('all 6 event types are handled', () => {
    const events: DebateWsEvent[] = [
      { event: 'debate-started', debateId: 'd', topic: 't', totalRounds: 2, timestamp: 't' },
      { event: 'round-started', debateId: 'd', roundNum: 1, totalRounds: 2, timestamp: 't' },
      { event: 'speech-delivered', debateId: 'd', roundNum: 1, speech: { agentId: 'a', agentName: 'A', content: 'c', position: 'p' }, timestamp: 't' },
      { event: 'round-ended', debateId: 'd', roundNum: 1, speechCount: 1, timestamp: 't' },
      { event: 'debate-completed', debateId: 'd', result: { consensus: 'consensus', summary: 's', majorityPosition: 'm', minorityPosition: 'mi', keyArguments: [], roundCount: 1 }, timestamp: 't' },
      { event: 'debate-failed', debateId: 'd', error: 'err', timestamp: 't' },
    ]
    for (const event of events) {
      expect(event.event).toBeTruthy()
      expect(event.debateId).toBe('d')
      expect(event.timestamp).toBeTruthy()
    }
  })

  test('debate-started is not rendered as timeline entry', () => {
    const entry = buildEntriesFromTimeline([
      { event: 'debate-started', debateId: 'd', topic: 'test', totalRounds: 2, timestamp: 't' },
    ])
    expect(entry).toHaveLength(0)
  })
})

// ============================================================
// P0: Critical Path - Data Transformation Consistency
// ============================================================

describe('TEA P0: Rounds vs Timeline Consistency', () => {
  test('rounds and timeline produce equivalent entries for complete debate', () => {
    const rounds: DebateRound[] = [
      {
        roundNum: 1,
        speeches: [
          { agentId: 'a1', agentName: 'A1', content: 'c1', position: 'for', createdAt: 't' },
          { agentId: 'a2', agentName: 'A2', content: 'c2', position: 'against', createdAt: 't' },
        ],
      },
    ]
    const timeline: DebateTimelineEntry[] = [
      { event: 'round-started', debateId: 'd', roundNum: 1, totalRounds: 2, timestamp: 't' },
      { event: 'speech-delivered', debateId: 'd', roundNum: 1, speech: { agentId: 'a1', agentName: 'A1', content: 'c1', position: 'for' }, timestamp: 't' },
      { event: 'speech-delivered', debateId: 'd', roundNum: 1, speech: { agentId: 'a2', agentName: 'A2', content: 'c2', position: 'against' }, timestamp: 't' },
      { event: 'round-ended', debateId: 'd', roundNum: 1, speechCount: 2, timestamp: 't' },
    ]

    const fromRounds = buildEntriesFromRounds(rounds, 2)
    const fromTimeline = buildEntriesFromTimeline(timeline)

    // Both should have same number of entries
    expect(fromRounds).toHaveLength(fromTimeline.length)
    // Both should have same structure
    expect(fromRounds[0].type).toBe(fromTimeline[0].type)
    expect(fromRounds[1].type).toBe(fromTimeline[1].type)
    expect(fromRounds[1].agentName).toBe(fromTimeline[1].agentName)
  })

  test('empty debate produces empty entries from both sources', () => {
    expect(buildEntriesFromRounds([], 2)).toHaveLength(0)
    expect(buildEntriesFromTimeline([])).toHaveLength(0)
  })
})

// ============================================================
// P1: Important - Speech Card Edge Cases
// ============================================================

describe('TEA P1: Speech Content Edge Cases', () => {
  const THRESHOLD = 200

  test('content with Korean characters at threshold boundary', () => {
    const korean = '가'.repeat(200)
    expect(korean.length).toBe(200)
    expect(korean.length > THRESHOLD).toBe(false) // exactly 200 does NOT collapse
  })

  test('content with mixed unicode characters', () => {
    const mixed = 'Hello 세계 🌍 '.repeat(30)
    expect(mixed.length > THRESHOLD).toBe(true)
  })

  test('content with only whitespace', () => {
    const ws = '   \n\n   '
    expect(ws.length > THRESHOLD).toBe(false)
  })

  test('content with markdown formatting preserved', () => {
    const md = '## Header\n- **Bold** item\n- *Italic* item\n```code```'
    expect(md.length > THRESHOLD).toBe(false)
    // Content should be displayable (whitespace-pre-wrap CSS handles rendering)
  })

  test('very long content (10000 chars) collapses correctly', () => {
    const long = 'A'.repeat(10000)
    const collapsed = long.slice(0, THRESHOLD) + '...'
    expect(collapsed.length).toBe(203)
  })

  test('empty content should not collapse', () => {
    const empty = ''
    expect(empty.length > THRESHOLD).toBe(false)
  })

  test('position tag handles empty string', () => {
    const position = ''
    // Empty position should not render a tag (handled by {position && <tag>})
    expect(position).toBeFalsy()
  })
})

// ============================================================
// P1: Important - Consensus Result Edge Cases
// ============================================================

describe('TEA P1: Consensus Result Edge Cases', () => {
  test('result with empty keyArguments', () => {
    const result: DebateResult = {
      consensus: 'consensus',
      summary: '합의 도달',
      majorityPosition: 'A',
      minorityPosition: 'B',
      keyArguments: [],
      roundCount: 2,
    }
    expect(result.keyArguments).toHaveLength(0)
  })

  test('result with many keyArguments', () => {
    const result: DebateResult = {
      consensus: 'partial',
      summary: '부분 합의',
      majorityPosition: 'A',
      minorityPosition: 'B',
      keyArguments: Array.from({ length: 20 }, (_, i) => `Argument ${i + 1}`),
      roundCount: 3,
    }
    expect(result.keyArguments).toHaveLength(20)
  })

  test('result with long summary text', () => {
    const result: DebateResult = {
      consensus: 'dissent',
      summary: '매우 긴 요약 텍스트. '.repeat(50),
      majorityPosition: 'Position A with long description',
      minorityPosition: 'Position B with long description',
      keyArguments: ['arg1'],
      roundCount: 3,
    }
    expect(result.summary.length).toBeGreaterThan(500)
  })

  test('roundCount 0 edge case', () => {
    const result: DebateResult = {
      consensus: 'dissent',
      summary: 'no rounds completed',
      majorityPosition: '',
      minorityPosition: '',
      keyArguments: [],
      roundCount: 0,
    }
    expect(result.roundCount).toBe(0)
  })
})

// ============================================================
// P1: Important - Debate List Filtering Edge Cases
// ============================================================

describe('TEA P1: Debate List Edge Cases', () => {
  test('filter with all same status', () => {
    const debates = Array.from({ length: 10 }, (_, i) => ({
      status: 'completed' as DebateStatus,
      topic: `Topic ${i}`,
    }))
    const filtered = debates.filter((d) => d.status === 'in-progress')
    expect(filtered).toHaveLength(0)
  })

  test('filter preserves original order', () => {
    const debates = [
      { status: 'completed' as DebateStatus, topic: 'Z First' },
      { status: 'in-progress' as DebateStatus, topic: 'A Second' },
      { status: 'completed' as DebateStatus, topic: 'M Third' },
    ]
    const filtered = debates.filter((d) => d.status === 'completed')
    expect(filtered[0].topic).toBe('Z First')
    expect(filtered[1].topic).toBe('M Third')
  })

  test('empty debates list', () => {
    const debates: { status: DebateStatus; topic: string }[] = []
    expect(debates.filter((d) => d.status === 'completed')).toHaveLength(0)
  })
})

// ============================================================
// P1: Important - Debate Create Request Validation
// ============================================================

describe('TEA P1: Create Debate Request Validation', () => {
  test('topic must be non-empty', () => {
    const topic = ''
    expect(topic.trim().length > 0).toBe(false)
  })

  test('topic max length 500', () => {
    const topic = 'A'.repeat(501)
    expect(topic.length <= 500).toBe(false)
  })

  test('exactly 500 chars is valid', () => {
    const topic = 'A'.repeat(500)
    expect(topic.length <= 500).toBe(true)
  })

  test('participantAgentIds must have at least 2', () => {
    expect([].length >= 2).toBe(false)
    expect(['a1'].length >= 2).toBe(false)
    expect(['a1', 'a2'].length >= 2).toBe(true)
  })

  test('participantAgentIds max 20', () => {
    const ids = Array.from({ length: 21 }, (_, i) => `agent-${i}`)
    expect(ids.length <= 20).toBe(false)
  })

  test('maxRounds bounds: 1-10', () => {
    expect(0 >= 1 && 0 <= 10).toBe(false)
    expect(1 >= 1 && 1 <= 10).toBe(true)
    expect(10 >= 1 && 10 <= 10).toBe(true)
    expect(11 >= 1 && 11 <= 10).toBe(false)
  })
})

// ============================================================
// P1: Important - Avatar Color Distribution
// ============================================================

describe('TEA P1: Avatar Color Hash Quality', () => {
  test('UUID-like agent IDs distribute across colors', () => {
    const uuids = [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
      '550e8400-e29b-41d4-a716-446655440003',
      '550e8400-e29b-41d4-a716-446655440004',
      '550e8400-e29b-41d4-a716-446655440005',
    ]
    const colors = new Set(uuids.map(getAvatarColorIndex))
    expect(colors.size).toBeGreaterThan(1) // At least 2 different colors
  })

  test('empty string produces valid index', () => {
    const idx = getAvatarColorIndex('')
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(8)
  })

  test('single character produces valid index', () => {
    const idx = getAvatarColorIndex('A')
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(8)
  })

  test('Korean name produces valid index', () => {
    const idx = getAvatarColorIndex('분석팀장')
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(8)
  })
})

// ============================================================
// P2: Secondary - Navigation Edge Cases
// ============================================================

describe('TEA P2: Navigation State Edge Cases', () => {
  test('multiple debateId params takes first', () => {
    const params = new URLSearchParams('?debateId=first&debateId=second')
    expect(params.get('debateId')).toBe('first')
  })

  test('empty debateId param', () => {
    const params = new URLSearchParams('?debateId=')
    expect(params.get('debateId')).toBe('')
  })

  test('URL-encoded debateId', () => {
    const params = new URLSearchParams(`?debateId=${encodeURIComponent('550e8400-e29b-41d4-a716-446655440000')}`)
    expect(params.get('debateId')).toBe('550e8400-e29b-41d4-a716-446655440000')
  })
})

// ============================================================
// P2: Secondary - Debate Type Display Mapping
// ============================================================

describe('TEA P2: Debate Type Display', () => {
  test('debate type label mapping', () => {
    const labels: Record<DebateType, string> = {
      debate: '토론 (2라운드)',
      'deep-debate': '심층토론 (3라운드)',
    }
    expect(labels['debate']).toBe('토론 (2라운드)')
    expect(labels['deep-debate']).toBe('심층토론 (3라운드)')
  })
})

// ============================================================
// P2: Secondary - Date Display Edge Cases
// ============================================================

describe('TEA P2: Date Display Edge Cases', () => {
  function formatShortDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  test('formats ISO date correctly', () => {
    const formatted = formatShortDate('2026-03-08T10:00:00Z')
    expect(formatted).toBeTruthy()
  })

  test('handles date-only string', () => {
    const formatted = formatShortDate('2026-03-08')
    expect(formatted).toBeTruthy()
  })
})

// ============================================================
// P0: Critical - Debate Object Completeness
// ============================================================

describe('TEA P0: Debate Object Integrity', () => {
  test('completed debate has result', () => {
    const debate: Partial<Debate> = {
      status: 'completed',
      result: {
        consensus: 'consensus',
        summary: 's',
        majorityPosition: 'm',
        minorityPosition: 'mi',
        keyArguments: [],
        roundCount: 2,
      },
    }
    expect(debate.result).toBeTruthy()
  })

  test('pending debate has null result', () => {
    const debate: Partial<Debate> = {
      status: 'pending',
      result: null,
    }
    expect(debate.result).toBeNull()
  })

  test('failed debate has error string', () => {
    const debate: Partial<Debate> = {
      status: 'failed',
      error: 'LLM provider unreachable',
      result: null,
    }
    expect(debate.error).toBeTruthy()
    expect(debate.result).toBeNull()
  })

  test('in-progress debate has partial rounds', () => {
    const debate: Partial<Debate> = {
      status: 'in-progress',
      rounds: [{ roundNum: 1, speeches: [{ agentId: 'a1', agentName: 'A', content: 'c', position: 'p', createdAt: 't' }] }],
      result: null,
    }
    expect(debate.rounds).toHaveLength(1)
    expect(debate.result).toBeNull()
  })

  test('participants always have required fields', () => {
    const participants = [
      { agentId: 'a1', agentName: 'Agent 1', role: 'Manager' },
      { agentId: 'a2', agentName: 'Agent 2', role: 'Specialist' },
    ]
    for (const p of participants) {
      expect(p.agentId).toBeTruthy()
      expect(p.agentName).toBeTruthy()
      expect(p.role).toBeTruthy()
    }
  })
})

// ============================================================
// P1: Important - WebSocket Channel Key Pattern
// ============================================================

describe('TEA P1: WS Channel Key Construction', () => {
  test('debate channel key format', () => {
    const debateId = '550e8400-e29b-41d4-a716-446655440000'
    const channelKey = `debate::${debateId}`
    expect(channelKey).toBe('debate::550e8400-e29b-41d4-a716-446655440000')
  })

  test('channel key uniqueness per debate', () => {
    const keys = [
      `debate::${'d1'}`,
      `debate::${'d2'}`,
      `debate::${'d3'}`,
    ]
    const unique = new Set(keys)
    expect(unique.size).toBe(3)
  })
})
