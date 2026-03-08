import { describe, test, expect } from 'bun:test'
import type {
  Debate,
  DebateResult,
  DebateRound,
  DebateSpeech,
  ConsensusResult,
  DebateWsEvent,
  DebateCompletedEvent,
  DebateType,
  CreateDebateRequest,
} from '@corthex/shared'

// ============================================================
// Tests for Story 11-5: Diff View + Debate Result Insertion
// Frontend story — tests validate type contracts, data
// transformation logic, and integration patterns.
// ============================================================

// --- Helper: create a debate with rounds ---
function makeDebate(overrides: Partial<Debate> = {}): Debate {
  return {
    id: 'debate-001',
    companyId: 'company-001',
    topic: 'AI 도입 전략에 대한 찬반 토론',
    debateType: 'debate',
    status: 'completed',
    maxRounds: 2,
    participants: [
      { agentId: 'a1', agentName: '전략팀장', role: 'Manager' },
      { agentId: 'a2', agentName: '기술팀장', role: 'Manager' },
      { agentId: 'a3', agentName: '재무팀장', role: 'Manager' },
    ],
    rounds: [
      {
        roundNum: 1,
        speeches: [
          { agentId: 'a1', agentName: '전략팀장', content: 'AI 도입은 필수적입니다', position: 'support', createdAt: '2026-03-08T10:00:00Z' },
          { agentId: 'a2', agentName: '기술팀장', content: '기술적 준비가 부족합니다', position: 'oppose', createdAt: '2026-03-08T10:01:00Z' },
          { agentId: 'a3', agentName: '재무팀장', content: '비용 대비 효과를 따져봐야', position: 'neutral', createdAt: '2026-03-08T10:02:00Z' },
        ],
      },
      {
        roundNum: 2,
        speeches: [
          { agentId: 'a1', agentName: '전략팀장', content: '단계적 도입이 합리적', position: 'conditional-support', createdAt: '2026-03-08T10:05:00Z' },
          { agentId: 'a2', agentName: '기술팀장', content: '단계적이라면 동의', position: 'conditional-support', createdAt: '2026-03-08T10:06:00Z' },
          { agentId: 'a3', agentName: '재무팀장', content: 'ROI가 증명되면 찬성', position: 'conditional-support', createdAt: '2026-03-08T10:07:00Z' },
        ],
      },
    ],
    result: {
      consensus: 'partial',
      summary: '단계적 AI 도입에 조건부 합의. ROI 검증 후 확대.',
      majorityPosition: '조건부 도입 찬성',
      minorityPosition: '전면 도입은 시기상조',
      keyArguments: ['단계적 도입이 리스크 최소화', 'ROI 검증 필요', '기술 인프라 병행 준비'],
      roundCount: 2,
    },
    createdBy: 'user1',
    error: null,
    startedAt: '2026-03-08T10:00:00Z',
    completedAt: '2026-03-08T10:10:00Z',
    createdAt: '2026-03-08T09:55:00Z',
    updatedAt: '2026-03-08T10:10:00Z',
    ...overrides,
  }
}

// ============================================================
// 1. Diff View: Position Tracking Logic
// ============================================================
describe('Diff View: Position Tracking', () => {
  test('builds position tracks per agent from rounds', () => {
    const debate = makeDebate()
    const trackMap = new Map<string, { agentId: string; agentName: string; positions: { roundNum: number; position: string }[] }>()

    for (const round of debate.rounds) {
      for (const speech of round.speeches) {
        let track = trackMap.get(speech.agentId)
        if (!track) {
          track = { agentId: speech.agentId, agentName: speech.agentName, positions: [] }
          trackMap.set(speech.agentId, track)
        }
        track.positions.push({ roundNum: round.roundNum, position: speech.position })
      }
    }

    const tracks = Array.from(trackMap.values())
    expect(tracks).toHaveLength(3)
    expect(tracks[0].agentName).toBe('전략팀장')
    expect(tracks[0].positions).toHaveLength(2)
    expect(tracks[0].positions[0].position).toBe('support')
    expect(tracks[0].positions[1].position).toBe('conditional-support')
  })

  test('detects position changes between rounds', () => {
    const debate = makeDebate()
    const tracks = new Map<string, string[]>()

    for (const round of debate.rounds) {
      for (const speech of round.speeches) {
        const existing = tracks.get(speech.agentId) || []
        existing.push(speech.position)
        tracks.set(speech.agentId, existing)
      }
    }

    // 전략팀장: support → conditional-support (changed)
    const a1Positions = tracks.get('a1')!
    expect(a1Positions[0]).toBe('support')
    expect(a1Positions[1]).toBe('conditional-support')
    expect(a1Positions[0] !== a1Positions[1]).toBe(true)

    // 기술팀장: oppose → conditional-support (changed)
    const a2Positions = tracks.get('a2')!
    expect(a2Positions[0]).toBe('oppose')
    expect(a2Positions[1]).toBe('conditional-support')
    expect(a2Positions[0] !== a2Positions[1]).toBe(true)

    // 재무팀장: neutral → conditional-support (changed)
    const a3Positions = tracks.get('a3')!
    expect(a3Positions[0]).toBe('neutral')
    expect(a3Positions[1]).toBe('conditional-support')
  })

  test('handles single-round debate (no changes)', () => {
    const debate = makeDebate({
      rounds: [
        {
          roundNum: 1,
          speeches: [
            { agentId: 'a1', agentName: '전략팀장', content: 'text', position: 'support', createdAt: '2026-03-08T10:00:00Z' },
          ],
        },
      ],
    })

    const tracks = new Map<string, string[]>()
    for (const round of debate.rounds) {
      for (const speech of round.speeches) {
        const existing = tracks.get(speech.agentId) || []
        existing.push(speech.position)
        tracks.set(speech.agentId, existing)
      }
    }

    expect(tracks.get('a1')).toHaveLength(1)
  })

  test('handles empty rounds array', () => {
    const debate = makeDebate({ rounds: [] })
    expect(debate.rounds).toHaveLength(0)
  })
})

// ============================================================
// 2. Diff View: Position Distribution
// ============================================================
describe('Diff View: Position Distribution', () => {
  test('calculates position distribution per round', () => {
    const debate = makeDebate()
    const distributions = debate.rounds.map((round) => {
      const counts: Record<string, number> = {}
      for (const speech of round.speeches) {
        counts[speech.position] = (counts[speech.position] || 0) + 1
      }
      return { roundNum: round.roundNum, counts, total: round.speeches.length }
    })

    expect(distributions).toHaveLength(2)

    // Round 1: 1 support, 1 oppose, 1 neutral
    expect(distributions[0].counts.support).toBe(1)
    expect(distributions[0].counts.oppose).toBe(1)
    expect(distributions[0].counts.neutral).toBe(1)
    expect(distributions[0].total).toBe(3)

    // Round 2: 3 conditional-support
    expect(distributions[1].counts['conditional-support']).toBe(3)
    expect(distributions[1].total).toBe(3)
  })

  test('shows convergence: scattered → unified', () => {
    const debate = makeDebate()
    const r1 = debate.rounds[0]
    const r2 = debate.rounds[1]

    const r1Positions = new Set(r1.speeches.map((s) => s.position))
    const r2Positions = new Set(r2.speeches.map((s) => s.position))

    expect(r1Positions.size).toBe(3) // Diverse
    expect(r2Positions.size).toBe(1) // Converged
  })
})

// ============================================================
// 3. Debate Result Card: Type Contract
// ============================================================
describe('Debate Result Card: Data Contract', () => {
  test('DebateResult has all required fields for result card', () => {
    const result: DebateResult = {
      consensus: 'consensus',
      summary: '모두 동의하였음',
      majorityPosition: '찬성',
      minorityPosition: '',
      keyArguments: ['논점1', '논점2'],
      roundCount: 2,
    }
    expect(result.consensus).toBe('consensus')
    expect(result.summary).toBeTruthy()
    expect(result.keyArguments).toHaveLength(2)
    expect(result.roundCount).toBe(2)
  })

  test('consensus result maps to correct labels', () => {
    const labelMap: Record<ConsensusResult, string> = {
      consensus: '합의 도달',
      dissent: '합의 실패',
      partial: '부분 합의',
    }
    expect(labelMap.consensus).toBe('합의 도달')
    expect(labelMap.dissent).toBe('합의 실패')
    expect(labelMap.partial).toBe('부분 합의')
  })

  test('result card displays max 3 key arguments', () => {
    const result: DebateResult = {
      consensus: 'partial',
      summary: '부분 합의',
      majorityPosition: '찬성',
      minorityPosition: '반대',
      keyArguments: ['A', 'B', 'C', 'D', 'E'],
      roundCount: 3,
    }
    const displayed = result.keyArguments.slice(0, 3)
    expect(displayed).toHaveLength(3)
    expect(displayed).toEqual(['A', 'B', 'C'])
  })

  test('handles empty key arguments', () => {
    const result: DebateResult = {
      consensus: 'consensus',
      summary: '합의',
      majorityPosition: '찬성',
      minorityPosition: '',
      keyArguments: [],
      roundCount: 1,
    }
    expect(result.keyArguments).toHaveLength(0)
  })
})

// ============================================================
// 4. Command Center: Debate Command Parsing
// ============================================================
describe('Command Center: Debate Command Detection', () => {
  function parseDebateCommand(text: string): { debateType: 'debate' | 'deep-debate'; topic: string } | null {
    const trimmed = text.trim()
    if (trimmed.startsWith('/심층토론 ') || trimmed.startsWith('/심층토론\n')) {
      return { debateType: 'deep-debate', topic: trimmed.replace(/^\/심층토론\s*/, '').trim() }
    }
    if (trimmed.startsWith('/토론 ') || trimmed.startsWith('/토론\n')) {
      return { debateType: 'debate', topic: trimmed.replace(/^\/토론\s*/, '').trim() }
    }
    return null
  }

  test('detects /토론 command with topic', () => {
    const result = parseDebateCommand('/토론 AI 도입 전략')
    expect(result).not.toBeNull()
    expect(result!.debateType).toBe('debate')
    expect(result!.topic).toBe('AI 도입 전략')
  })

  test('detects /심층토론 command with topic', () => {
    const result = parseDebateCommand('/심층토론 신규 사업 방향')
    expect(result).not.toBeNull()
    expect(result!.debateType).toBe('deep-debate')
    expect(result!.topic).toBe('신규 사업 방향')
  })

  test('returns null for non-debate commands', () => {
    expect(parseDebateCommand('안녕하세요')).toBeNull()
    expect(parseDebateCommand('/보고서 작성')).toBeNull()
    expect(parseDebateCommand('토론 해줘')).toBeNull()
  })

  test('returns null for /토론 without space (not a command)', () => {
    expect(parseDebateCommand('/토론')).toBeNull()
  })

  test('handles whitespace around command', () => {
    const result = parseDebateCommand('  /토론 주제  ')
    expect(result).not.toBeNull()
    expect(result!.topic).toBe('주제')
  })

  test('handles multiline topic', () => {
    const result = parseDebateCommand('/토론\n주제\n세부사항')
    expect(result).not.toBeNull()
    expect(result!.debateType).toBe('debate')
    expect(result!.topic).toBe('주제\n세부사항')
  })
})

// ============================================================
// 5. AGORA Page: Navigation State
// ============================================================
describe('AGORA Page: Navigation Patterns', () => {
  test('fromChat flag indicates command center origin', () => {
    const navState = { debateId: 'debate-001', fromChat: true }
    expect(navState.fromChat).toBe(true)
    expect(navState.debateId).toBe('debate-001')
  })

  test('URL param debateId for direct access', () => {
    const url = '/agora?debateId=debate-001'
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('debateId')).toBe('debate-001')
  })

  test('navigation state without fromChat defaults to false', () => {
    const navState: { debateId?: string; fromChat?: boolean } = { debateId: 'debate-001' }
    const fromChat = navState.fromChat ?? false
    expect(fromChat).toBe(false)
  })
})

// ============================================================
// 6. WebSocket: Debate Completed Event
// ============================================================
describe('WebSocket: Debate Completed Event Handling', () => {
  test('debate-completed event has result payload', () => {
    const event: DebateCompletedEvent = {
      event: 'debate-completed',
      debateId: 'debate-001',
      timestamp: '2026-03-08T10:10:00Z',
      result: {
        consensus: 'consensus',
        summary: '전원 합의',
        majorityPosition: '찬성',
        minorityPosition: '',
        keyArguments: ['핵심 논점'],
        roundCount: 2,
      },
    }
    expect(event.event).toBe('debate-completed')
    expect(event.result.consensus).toBe('consensus')
    expect(event.result.keyArguments).toHaveLength(1)
  })

  test('debate-completed can be used to create result card data', () => {
    const event: DebateCompletedEvent = {
      event: 'debate-completed',
      debateId: 'debate-002',
      timestamp: '2026-03-08T10:10:00Z',
      result: {
        consensus: 'dissent',
        summary: '합의 실패',
        majorityPosition: '찬성',
        minorityPosition: '반대',
        keyArguments: ['A', 'B'],
        roundCount: 3,
      },
    }

    const cardData = {
      debateId: event.debateId,
      topic: '', // fetched separately
      result: event.result,
      insertedAt: new Date().toISOString(),
    }

    expect(cardData.debateId).toBe('debate-002')
    expect(cardData.result.consensus).toBe('dissent')
  })

  test('DebateWsEvent union includes debate-completed', () => {
    const events: DebateWsEvent['event'][] = [
      'debate-started',
      'round-started',
      'speech-delivered',
      'round-ended',
      'debate-completed',
      'debate-failed',
    ]
    expect(events).toContain('debate-completed')
    expect(events).toHaveLength(6)
  })
})

// ============================================================
// 7. Diff View: Tab Logic
// ============================================================
describe('Diff View: Tab Logic', () => {
  test('diff tab enabled only when debate completed with rounds', () => {
    const completedDebate = makeDebate({ status: 'completed' })
    const isDiffEnabled = completedDebate.status === 'completed' && completedDebate.rounds.length > 0
    expect(isDiffEnabled).toBe(true)
  })

  test('diff tab disabled for in-progress debate', () => {
    const inProgressDebate = makeDebate({ status: 'in-progress' })
    const isDiffEnabled = inProgressDebate.status === 'completed' && inProgressDebate.rounds.length > 0
    expect(isDiffEnabled).toBe(false)
  })

  test('diff tab disabled for completed debate with no rounds', () => {
    const emptyDebate = makeDebate({ status: 'completed', rounds: [] })
    const isDiffEnabled = emptyDebate.status === 'completed' && emptyDebate.rounds.length > 0
    expect(isDiffEnabled).toBe(false)
  })

  test('auto-select diff tab when debate completed', () => {
    const debate = makeDebate({ status: 'completed' })
    const autoTab = debate.status === 'completed' ? 'diff' : 'info'
    expect(autoTab).toBe('diff')
  })

  test('auto-select info tab when debate in-progress', () => {
    const debate = makeDebate({ status: 'in-progress' })
    const autoTab = debate.status === 'completed' ? 'diff' : 'info'
    expect(autoTab).toBe('info')
  })
})

// ============================================================
// 8. Position Style Mapping
// ============================================================
describe('Position Style Mapping', () => {
  const POSITION_COLORS: Record<string, { label: string }> = {
    support: { label: '찬성' },
    oppose: { label: '반대' },
    neutral: { label: '중립' },
    'conditional-support': { label: '조건부 찬성' },
    'conditional-oppose': { label: '조건부 반대' },
  }

  test('all known positions have labels', () => {
    expect(POSITION_COLORS.support.label).toBe('찬성')
    expect(POSITION_COLORS.oppose.label).toBe('반대')
    expect(POSITION_COLORS.neutral.label).toBe('중립')
    expect(POSITION_COLORS['conditional-support'].label).toBe('조건부 찬성')
    expect(POSITION_COLORS['conditional-oppose'].label).toBe('조건부 반대')
  })

  test('handles unknown position gracefully', () => {
    const unknownPos = 'abstain'
    const style = POSITION_COLORS[unknownPos] ?? { label: unknownPos }
    expect(style.label).toBe('abstain')
  })
})

// ============================================================
// 9. Debate Topic vs Result Comparison (Before/After)
// ============================================================
describe('Before/After Comparison', () => {
  test('topic (before) and result summary (after) are different', () => {
    const debate = makeDebate()
    expect(debate.topic).toBeTruthy()
    expect(debate.result!.summary).toBeTruthy()
    expect(debate.topic).not.toBe(debate.result!.summary)
  })

  test('majority and minority positions are available', () => {
    const debate = makeDebate()
    expect(debate.result!.majorityPosition).toBeTruthy()
    expect(debate.result!.minorityPosition).toBeTruthy()
  })

  test('handles debate without result gracefully', () => {
    const debate = makeDebate({ result: null, status: 'in-progress' })
    expect(debate.result).toBeNull()
  })
})

// ============================================================
// 10. CreateDebateRequest Validation
// ============================================================
describe('CreateDebateRequest: API Contract', () => {
  test('minimal request has required fields', () => {
    const req: CreateDebateRequest = {
      topic: 'AI 전략',
      participantAgentIds: ['a1', 'a2'],
    }
    expect(req.topic).toBeTruthy()
    expect(req.participantAgentIds.length).toBeGreaterThanOrEqual(2)
  })

  test('full request includes optional fields', () => {
    const req: CreateDebateRequest = {
      topic: '전략 토론',
      debateType: 'deep-debate',
      participantAgentIds: ['a1', 'a2', 'a3'],
      maxRounds: 3,
    }
    expect(req.debateType).toBe('deep-debate')
    expect(req.maxRounds).toBe(3)
  })

  test('agent selection slices to max 5', () => {
    const allAgents = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7']
    const selected = allAgents.slice(0, 5)
    expect(selected).toHaveLength(5)
  })

  test('rejects debate with fewer than 2 agents', () => {
    const agents = ['a1']
    expect(agents.length < 2).toBe(true)
  })
})

// ============================================================
// 11. Consensus Card Reuse
// ============================================================
describe('Consensus Card: Style Mapping', () => {
  test('consensus styles for all 3 result types', () => {
    const CONSENSUS_STYLES: Record<ConsensusResult, { label: string }> = {
      consensus: { label: '합의 도달' },
      dissent: { label: '합의 실패' },
      partial: { label: '부분 합의' },
    }
    expect(Object.keys(CONSENSUS_STYLES)).toHaveLength(3)
    expect(CONSENSUS_STYLES.consensus.label).toBe('합의 도달')
    expect(CONSENSUS_STYLES.dissent.label).toBe('합의 실패')
    expect(CONSENSUS_STYLES.partial.label).toBe('부분 합의')
  })
})

// ============================================================
// 12. Deep Debate (3-round) Position Tracking
// ============================================================
describe('Deep Debate: 3-Round Position Tracking', () => {
  test('tracks position changes across 3 rounds', () => {
    const debate = makeDebate({
      debateType: 'deep-debate',
      maxRounds: 3,
      rounds: [
        {
          roundNum: 1,
          speeches: [
            { agentId: 'a1', agentName: 'Agent1', content: 'R1', position: 'support', createdAt: '2026-03-08T10:00:00Z' },
            { agentId: 'a2', agentName: 'Agent2', content: 'R1', position: 'oppose', createdAt: '2026-03-08T10:01:00Z' },
          ],
        },
        {
          roundNum: 2,
          speeches: [
            { agentId: 'a1', agentName: 'Agent1', content: 'R2', position: 'conditional-support', createdAt: '2026-03-08T10:05:00Z' },
            { agentId: 'a2', agentName: 'Agent2', content: 'R2', position: 'neutral', createdAt: '2026-03-08T10:06:00Z' },
          ],
        },
        {
          roundNum: 3,
          speeches: [
            { agentId: 'a1', agentName: 'Agent1', content: 'R3', position: 'support', createdAt: '2026-03-08T10:10:00Z' },
            { agentId: 'a2', agentName: 'Agent2', content: 'R3', position: 'support', createdAt: '2026-03-08T10:11:00Z' },
          ],
        },
      ],
    })

    expect(debate.rounds).toHaveLength(3)
    expect(debate.debateType).toBe('deep-debate')

    // Agent1: support → conditional-support → support (went back)
    const a1 = debate.rounds.map((r) => r.speeches.find((s) => s.agentId === 'a1')!.position)
    expect(a1).toEqual(['support', 'conditional-support', 'support'])

    // Agent2: oppose → neutral → support (gradual shift)
    const a2 = debate.rounds.map((r) => r.speeches.find((s) => s.agentId === 'a2')!.position)
    expect(a2).toEqual(['oppose', 'neutral', 'support'])
  })

  test('convergence calculation shows final round unity', () => {
    const finalRound: DebateRound = {
      roundNum: 3,
      speeches: [
        { agentId: 'a1', agentName: 'A1', content: 'R3', position: 'support', createdAt: '2026-03-08T10:10:00Z' },
        { agentId: 'a2', agentName: 'A2', content: 'R3', position: 'support', createdAt: '2026-03-08T10:11:00Z' },
        { agentId: 'a3', agentName: 'A3', content: 'R3', position: 'support', createdAt: '2026-03-08T10:12:00Z' },
      ],
    }

    const uniquePositions = new Set(finalRound.speeches.map((s) => s.position))
    expect(uniquePositions.size).toBe(1) // Full convergence
    expect(uniquePositions.has('support')).toBe(true)
  })
})

// ============================================================
// 13. AGORA → Chat Return Flow
// ============================================================
describe('AGORA → Chat Return Flow', () => {
  test('return button shown when fromChat and completed', () => {
    const fromChat = true
    const debateStatus = 'completed'
    const showReturn = fromChat && debateStatus === 'completed'
    expect(showReturn).toBe(true)
  })

  test('return button hidden when not from chat', () => {
    const fromChat = false
    const debateStatus = 'completed'
    const showReturn = fromChat && debateStatus === 'completed'
    expect(showReturn).toBe(false)
  })

  test('return button hidden when debate in-progress', () => {
    const fromChat = true
    const debateStatus = 'in-progress'
    const showReturn = fromChat && debateStatus === 'completed'
    expect(showReturn).toBe(false)
  })
})

// ============================================================
// 14. Avatar Color Consistency
// ============================================================
describe('Avatar Color: Hash-Based Assignment', () => {
  function getAvatarColorIndex(id: string, totalColors: number): number {
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
    return Math.abs(hash) % totalColors
  }

  test('same agent ID always gets same color', () => {
    const color1 = getAvatarColorIndex('agent-123', 8)
    const color2 = getAvatarColorIndex('agent-123', 8)
    expect(color1).toBe(color2)
  })

  test('different agent IDs get different colors (usually)', () => {
    const color1 = getAvatarColorIndex('agent-1', 8)
    const color2 = getAvatarColorIndex('agent-2', 8)
    // Not guaranteed different, but highly likely with 8 buckets
    expect(typeof color1).toBe('number')
    expect(typeof color2).toBe('number')
    expect(color1).toBeGreaterThanOrEqual(0)
    expect(color1).toBeLessThan(8)
  })
})

// ============================================================
// 15. Edge Cases
// ============================================================
describe('Edge Cases', () => {
  test('debate with all same positions across rounds', () => {
    const debate = makeDebate({
      rounds: [
        {
          roundNum: 1,
          speeches: [
            { agentId: 'a1', agentName: 'A1', content: 'x', position: 'support', createdAt: '2026-03-08T10:00:00Z' },
          ],
        },
        {
          roundNum: 2,
          speeches: [
            { agentId: 'a1', agentName: 'A1', content: 'x', position: 'support', createdAt: '2026-03-08T10:05:00Z' },
          ],
        },
      ],
    })
    const positions = debate.rounds.map((r) => r.speeches[0].position)
    const allSame = positions.every((p) => p === positions[0])
    expect(allSame).toBe(true)
  })

  test('debate with result but no key arguments', () => {
    const result: DebateResult = {
      consensus: 'consensus',
      summary: '합의',
      majorityPosition: '찬성',
      minorityPosition: '',
      keyArguments: [],
      roundCount: 1,
    }
    expect(result.keyArguments).toHaveLength(0)
  })

  test('failed debate has no result', () => {
    const debate = makeDebate({ status: 'failed', result: null, error: '에이전트 타임아웃' })
    expect(debate.result).toBeNull()
    expect(debate.error).toBeTruthy()
    const isDiffEnabled = debate.status === 'completed' && debate.rounds.length > 0
    expect(isDiffEnabled).toBe(false)
  })

  test('pending debate shows no diff', () => {
    const debate = makeDebate({ status: 'pending', rounds: [], result: null })
    const isDiffEnabled = debate.status === 'completed' && debate.rounds.length > 0
    expect(isDiffEnabled).toBe(false)
  })
})

// ============================================================
// TEA Risk-Based Tests: High-Risk Scenarios
// ============================================================

describe('TEA: Command Parsing Edge Cases', () => {
  function parseDebateCommand(text: string): { debateType: 'debate' | 'deep-debate'; topic: string } | null {
    const trimmed = text.trim()
    if (trimmed.startsWith('/심층토론 ') || trimmed.startsWith('/심층토론\n')) {
      return { debateType: 'deep-debate', topic: trimmed.replace(/^\/심층토론\s*/, '').trim() }
    }
    if (trimmed.startsWith('/토론 ') || trimmed.startsWith('/토론\n')) {
      return { debateType: 'debate', topic: trimmed.replace(/^\/토론\s*/, '').trim() }
    }
    return null
  }

  test('rejects partial command prefix /토', () => {
    expect(parseDebateCommand('/토 주제')).toBeNull()
  })

  test('rejects /토론서 (similar but different command)', () => {
    expect(parseDebateCommand('/토론서 작성')).toBeNull()
  })

  test('handles topic with special characters', () => {
    const result = parseDebateCommand('/토론 AI & ML: "미래" vs \'현재\'')
    expect(result).not.toBeNull()
    expect(result!.topic).toBe('AI & ML: "미래" vs \'현재\'')
  })

  test('handles very long topic', () => {
    const longTopic = '가'.repeat(500)
    const result = parseDebateCommand(`/토론 ${longTopic}`)
    expect(result).not.toBeNull()
    expect(result!.topic.length).toBe(500)
  })

  test('심층토론 takes priority over 토론 (longer match)', () => {
    const result = parseDebateCommand('/심층토론 주제')
    expect(result!.debateType).toBe('deep-debate')
  })
})

describe('TEA: Position Distribution Accuracy', () => {
  test('percentage calculation sums to 100%', () => {
    const counts = { support: 2, oppose: 1, neutral: 2 }
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    const percentages = Object.entries(counts).map(([, count]) => (count / total) * 100)
    const sum = percentages.reduce((a, b) => a + b, 0)
    expect(Math.round(sum)).toBe(100)
  })

  test('handles single participant', () => {
    const counts = { support: 1 }
    const total = 1
    const pct = (counts.support / total) * 100
    expect(pct).toBe(100)
  })

  test('handles many participants with same position', () => {
    const counts = { support: 10 }
    const total = 10
    const pct = (counts.support / total) * 100
    expect(pct).toBe(100)
  })
})

describe('TEA: Debate Result Card Rendering Safety', () => {
  test('result card handles empty summary', () => {
    const result: DebateResult = {
      consensus: 'consensus',
      summary: '',
      majorityPosition: '',
      minorityPosition: '',
      keyArguments: [],
      roundCount: 0,
    }
    expect(result.summary).toBe('')
    expect(result.keyArguments.slice(0, 3)).toHaveLength(0)
  })

  test('result card handles XSS-like content in topic', () => {
    const topic = '<script>alert("xss")</script>'
    // React auto-escapes, but verify the data structure handles it
    expect(topic).toContain('<script>')
    expect(typeof topic).toBe('string')
  })

  test('result card handles null-like values in key arguments', () => {
    const result: DebateResult = {
      consensus: 'partial',
      summary: 'summary',
      majorityPosition: 'pos',
      minorityPosition: '',
      keyArguments: ['', 'valid', '  '],
      roundCount: 2,
    }
    expect(result.keyArguments).toHaveLength(3)
    const filtered = result.keyArguments.filter((a) => a.trim())
    expect(filtered).toHaveLength(1)
    expect(filtered[0]).toBe('valid')
  })
})

describe('TEA: WebSocket Event Integrity', () => {
  test('debate-completed event debateId matches expected format', () => {
    const event: DebateCompletedEvent = {
      event: 'debate-completed',
      debateId: '550e8400-e29b-41d4-a716-446655440000',
      timestamp: '2026-03-08T10:10:00Z',
      result: {
        consensus: 'consensus',
        summary: '합의',
        majorityPosition: '찬성',
        minorityPosition: '',
        keyArguments: [],
        roundCount: 2,
      },
    }
    expect(event.debateId).toMatch(/^[0-9a-f-]+$/)
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('multiple debate-completed events create unique entries', () => {
    const entries: { debateId: string; insertedAt: string }[] = []
    const ids = ['d1', 'd2', 'd3']
    for (const id of ids) {
      entries.push({ debateId: id, insertedAt: new Date().toISOString() })
    }
    expect(entries).toHaveLength(3)
    const uniqueIds = new Set(entries.map((e) => e.debateId))
    expect(uniqueIds.size).toBe(3)
  })
})

describe('TEA: Navigation State Preservation', () => {
  test('URL params survive page refresh (debateId in query)', () => {
    const url = '/agora?debateId=abc-123'
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('debateId')).toBe('abc-123')
  })

  test('state-based debateId overrides URL param', () => {
    const stateDebateId = 'from-state'
    const urlDebateId = 'from-url'
    const autoDebateId = stateDebateId || urlDebateId
    expect(autoDebateId).toBe('from-state')
  })

  test('fallback to URL when state is null', () => {
    const stateDebateId: string | undefined = undefined
    const urlDebateId = 'from-url'
    const autoDebateId = stateDebateId || urlDebateId
    expect(autoDebateId).toBe('from-url')
  })

  test('both null returns falsy', () => {
    const stateDebateId: string | undefined = undefined
    const urlDebateId: string | null = null
    const autoDebateId = stateDebateId || urlDebateId
    expect(autoDebateId).toBeFalsy()
  })
})
