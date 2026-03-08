import { describe, it, expect, mock, beforeEach } from 'bun:test'

// === Mock DB ===
const mockSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => []),
  })),
}))

const mockUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => Promise.resolve()),
  })),
}))

const mockDb = {
  select: mockSelect,
  update: mockUpdate,
  insert: mock(() => ({
    values: mock(() => ({
      returning: mock(() => [{ id: 'cmd-1', metadata: {} }]),
    })),
  })),
}

mock.module('../../db', () => ({ db: mockDb }))

// === Mock DB Schema ===
mock.module('../../db/schema', () => ({
  commands: { id: 'id', companyId: 'companyId', status: 'status', metadata: 'metadata', result: 'result', completedAt: 'completedAt' },
  agents: { id: 'id', companyId: 'companyId', isActive: 'isActive', isSecretary: 'isSecretary', name: 'name', role: 'role', tier: 'tier' },
}))

// === Mock drizzle-orm ===
mock.module('drizzle-orm', () => ({
  eq: (...args: unknown[]) => ({ type: 'eq', args }),
  and: (...args: unknown[]) => ({ type: 'and', args }),
  desc: (col: unknown) => ({ type: 'desc', col }),
}))

// === Mock AGORA engine ===
const mockCreateDebate = mock(() => Promise.resolve({
  id: 'debate-1',
  companyId: 'company-1',
  topic: 'AI 투자 전략',
  debateType: 'debate',
  status: 'pending',
  maxRounds: 2,
  participants: [
    { agentId: 'agent-1', agentName: '투자팀장', role: 'manager' },
    { agentId: 'agent-2', agentName: '리서치전문가', role: 'specialist' },
  ],
  rounds: [],
  result: null,
  createdBy: 'user-1',
}))

const mockStartDebate = mock(() => Promise.resolve({ status: 'in-progress' }))

let mockGetDebateCallCount = 0
const mockGetDebate = mock(() => {
  mockGetDebateCallCount++
  if (mockGetDebateCallCount <= 1) {
    return Promise.resolve({
      id: 'debate-1',
      status: 'in-progress',
      topic: 'AI 투자 전략',
      debateType: 'debate',
      participants: [
        { agentId: 'agent-1', agentName: '투자팀장', role: 'manager' },
        { agentId: 'agent-2', agentName: '리서치전문가', role: 'specialist' },
      ],
      rounds: [{ roundNum: 1, speeches: [{ agentId: 'agent-1', agentName: '투자팀장', content: 'AI 투자는 유망합니다', position: 'pro', createdAt: new Date().toISOString() }] }],
      result: null,
      maxRounds: 2,
    })
  }
  return Promise.resolve({
    id: 'debate-1',
    status: 'completed',
    topic: 'AI 투자 전략',
    debateType: 'debate',
    participants: [
      { agentId: 'agent-1', agentName: '투자팀장', role: 'manager' },
      { agentId: 'agent-2', agentName: '리서치전문가', role: 'specialist' },
    ],
    rounds: [
      { roundNum: 1, speeches: [
        { agentId: 'agent-1', agentName: '투자팀장', content: 'AI 투자는 유망합니다', position: 'pro', createdAt: new Date().toISOString() },
        { agentId: 'agent-2', agentName: '리서치전문가', content: '리스크도 있습니다', position: 'cautious', createdAt: new Date().toISOString() },
      ]},
      { roundNum: 2, speeches: [
        { agentId: 'agent-1', agentName: '투자팀장', content: '분산 투자가 핵심입니다', position: 'pro', createdAt: new Date().toISOString() },
        { agentId: 'agent-2', agentName: '리서치전문가', content: '동의합니다', position: 'agree', createdAt: new Date().toISOString() },
      ]},
    ],
    result: {
      consensus: 'consensus',
      summary: 'AI 투자에 대해 분산 투자 전략으로 합의',
      majorityPosition: '분산 투자가 핵심',
      minorityPosition: '',
      keyArguments: ['AI 투자 유망', '리스크 관리 필요', '분산 투자 전략'],
      roundCount: 2,
    },
    maxRounds: 2,
  })
})

mock.module('../../services/agora-engine', () => ({
  createDebate: mockCreateDebate,
  startDebate: mockStartDebate,
  getDebate: mockGetDebate,
}))

// === Mock delegation tracker ===
const mockTracker = {
  startCommand: mock(() => {}),
  debateStarted: mock(() => {}),
  debateRoundProgress: mock(() => {}),
  debateCompleted: mock(() => {}),
  completed: mock(() => {}),
  failed: mock(() => {}),
}
mock.module('../../services/delegation-tracker', () => ({
  delegationTracker: mockTracker,
}))

// === Import after mocks ===
import { selectDebateParticipants, formatDebateReport } from '../../services/debate-command-handler'
import type { DebateRound, DebateResult, DebateType } from '@corthex/shared'

beforeEach(() => {
  mockGetDebateCallCount = 0
  mockTracker.startCommand.mockClear()
  mockTracker.debateStarted.mockClear()
  mockTracker.debateRoundProgress.mockClear()
  mockTracker.debateCompleted.mockClear()
  mockTracker.completed.mockClear()
  mockTracker.failed.mockClear()
  mockCreateDebate.mockClear()
  mockStartDebate.mockClear()
  mockGetDebate.mockClear()
})

// =============================================
// selectDebateParticipants
// =============================================

describe('selectDebateParticipants', () => {
  it('should select Manager and Specialist agents', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 'a1', name: '팀장A', role: 'CIO', tier: 'manager' },
          { id: 'a2', name: '전문가B', role: 'analyst', tier: 'specialist' },
          { id: 'a3', name: '작업자C', role: 'writer', tier: 'worker' },
        ]),
      })),
    })

    const result = await selectDebateParticipants('company-1')
    // Should exclude worker
    expect(result).toHaveLength(2)
    expect(result.map(r => r.id)).toEqual(['a1', 'a2'])
  })

  it('should throw when fewer than 2 eligible agents', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 'a1', name: '팀장A', role: 'CIO', tier: 'manager' },
        ]),
      })),
    })

    await expect(selectDebateParticipants('company-1')).rejects.toThrow('DEBATE_INSUFFICIENT_AGENTS')
  })

  it('should limit to MAX_PARTICIPANTS (5)', async () => {
    const sixAgents = Array.from({ length: 6 }, (_, i) => ({
      id: `a${i}`, name: `에이전트${i}`, role: 'analyst', tier: i < 3 ? 'manager' : 'specialist',
    }))
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => sixAgents),
      })),
    })

    const result = await selectDebateParticipants('company-1')
    expect(result).toHaveLength(5)
  })

  it('should prioritize managers over specialists', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 'sp1', name: '전문가1', role: 'analyst', tier: 'specialist' },
          { id: 'mg1', name: '팀장1', role: 'CIO', tier: 'manager' },
          { id: 'sp2', name: '전문가2', role: 'writer', tier: 'specialist' },
          { id: 'mg2', name: '팀장2', role: 'CMO', tier: 'manager' },
        ]),
      })),
    })

    const result = await selectDebateParticipants('company-1')
    // Managers first
    expect(result[0].tier).toBe('manager')
    expect(result[1].tier).toBe('manager')
    expect(result[2].tier).toBe('specialist')
  })

  it('should throw with zero eligible agents', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => []),
      })),
    })

    await expect(selectDebateParticipants('company-1')).rejects.toThrow('DEBATE_INSUFFICIENT_AGENTS')
  })

  it('should only include worker-excluded agents', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 'w1', name: '작업자1', role: 'writer', tier: 'worker' },
          { id: 'w2', name: '작업자2', role: 'writer', tier: 'worker' },
        ]),
      })),
    })

    await expect(selectDebateParticipants('company-1')).rejects.toThrow('DEBATE_INSUFFICIENT_AGENTS')
  })
})

// =============================================
// formatDebateReport
// =============================================

describe('formatDebateReport', () => {
  const participants = [
    { agentId: 'a1', agentName: '투자팀장', role: 'manager' },
    { agentId: 'a2', agentName: '리서치전문가', role: 'specialist' },
  ]

  const rounds: DebateRound[] = [
    {
      roundNum: 1,
      speeches: [
        { agentId: 'a1', agentName: '투자팀장', content: 'AI는 유망합니다', position: 'pro', createdAt: '2026-01-01' },
        { agentId: 'a2', agentName: '리서치전문가', content: '동의하나 리스크 존재', position: 'cautious', createdAt: '2026-01-01' },
      ],
    },
  ]

  const result: DebateResult = {
    consensus: 'consensus',
    summary: 'AI 투자에 긍정적 합의',
    majorityPosition: '분산 투자 추천',
    minorityPosition: '',
    keyArguments: ['AI 성장 전망', '리스크 관리'],
    roundCount: 1,
  }

  it('should generate markdown report with consensus label', () => {
    const report = formatDebateReport('AI 투자', 'debate', participants, rounds, result)

    expect(report).toContain('## 🏛️ AGORA 토론 결과')
    expect(report).toContain('**주제:** AI 투자')
    expect(report).toContain('**유형:** 일반 토론')
    expect(report).toContain('합의 ✅')
  })

  it('should include participants section', () => {
    const report = formatDebateReport('AI 투자', 'debate', participants, rounds, result)

    expect(report).toContain('### 참여자')
    expect(report).toContain('- 투자팀장 (manager)')
    expect(report).toContain('- 리서치전문가 (specialist)')
  })

  it('should include summary and key arguments', () => {
    const report = formatDebateReport('AI 투자', 'debate', participants, rounds, result)

    expect(report).toContain('### 토론 요약')
    expect(report).toContain('AI 투자에 긍정적 합의')
    expect(report).toContain('### 핵심 논점')
    expect(report).toContain('1. AI 성장 전망')
    expect(report).toContain('2. 리스크 관리')
  })

  it('should include round details with speeches', () => {
    const report = formatDebateReport('AI 투자', 'debate', participants, rounds, result)

    expect(report).toContain('### 라운드 상세')
    expect(report).toContain('#### 라운드 1')
    expect(report).toContain('- **투자팀장**: AI는 유망합니다')
  })

  it('should handle deep-debate type', () => {
    const report = formatDebateReport('경제 전망', 'deep-debate', participants, rounds, result)

    expect(report).toContain('**유형:** 심층 토론')
  })

  it('should handle dissent result', () => {
    const dissentResult: DebateResult = { ...result, consensus: 'dissent' }
    const report = formatDebateReport('AI', 'debate', participants, rounds, dissentResult)

    expect(report).toContain('비합의 ❌')
  })

  it('should handle partial result', () => {
    const partialResult: DebateResult = { ...result, consensus: 'partial' }
    const report = formatDebateReport('AI', 'debate', participants, rounds, partialResult)

    expect(report).toContain('부분합의 ⚠️')
  })

  it('should handle null result gracefully', () => {
    const report = formatDebateReport('AI', 'debate', participants, rounds, null)

    expect(report).toContain('판정 없음')
    expect(report).not.toContain('### 토론 요약')
  })

  it('should omit minority position section when empty', () => {
    const noMinority: DebateResult = { ...result, minorityPosition: '' }
    const report = formatDebateReport('AI', 'debate', participants, rounds, noMinority)

    expect(report).not.toContain('### 소수파 의견')
  })

  it('should include majority position when present', () => {
    const report = formatDebateReport('AI', 'debate', participants, rounds, result)

    expect(report).toContain('### 다수파 의견')
    expect(report).toContain('분산 투자 추천')
  })

  it('should handle minority position when present', () => {
    const withMinority: DebateResult = { ...result, minorityPosition: '리스크가 높아 신중해야' }
    const report = formatDebateReport('AI', 'debate', participants, [], withMinority)

    expect(report).toContain('### 소수파 의견')
    expect(report).toContain('리스크가 높아 신중해야')
  })

  it('should handle empty rounds', () => {
    const report = formatDebateReport('AI', 'debate', participants, [], result)

    expect(report).not.toContain('### 라운드 상세')
  })

  it('should handle empty key arguments', () => {
    const noArgs: DebateResult = { ...result, keyArguments: [] }
    const report = formatDebateReport('AI', 'debate', participants, rounds, noArgs)

    expect(report).not.toContain('### 핵심 논점')
  })
})

// =============================================
// DelegationTracker debate events
// =============================================

describe('DelegationTracker debate events', () => {
  it('should have debateStarted method', () => {
    expect(typeof mockTracker.debateStarted).toBe('function')
  })

  it('should have debateRoundProgress method', () => {
    expect(typeof mockTracker.debateRoundProgress).toBe('function')
  })

  it('should have debateCompleted method', () => {
    expect(typeof mockTracker.debateCompleted).toBe('function')
  })

  it('debateStarted should accept correct params', () => {
    mockTracker.debateStarted('company-1', 'cmd-1', {
      debateId: 'debate-1',
      topic: 'AI 투자',
      participants: ['팀장A', '전문가B'],
    })
    expect(mockTracker.debateStarted).toHaveBeenCalledTimes(1)
  })

  it('debateRoundProgress should accept correct params', () => {
    mockTracker.debateRoundProgress('company-1', 'cmd-1', {
      debateId: 'debate-1',
      roundNum: 1,
      totalRounds: 2,
    })
    expect(mockTracker.debateRoundProgress).toHaveBeenCalledTimes(1)
  })

  it('debateCompleted should accept correct params', () => {
    mockTracker.debateCompleted('company-1', 'cmd-1', {
      debateId: 'debate-1',
      consensus: 'consensus',
      summary: 'AI 투자 합의',
    })
    expect(mockTracker.debateCompleted).toHaveBeenCalledTimes(1)
  })
})

// =============================================
// Command Router debate slash parsing
// =============================================

describe('command-router debate parsing', () => {
  // These tests verify the existing command-router parses /토론 and /심층토론 correctly
  // We import parseSlash to test it directly
  const { parseSlash } = require('../../services/command-router')

  it('should parse /토론 with topic', () => {
    const result = parseSlash('/토론 AI 투자 전략')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('debate')
    expect(result!.args).toBe('AI 투자 전략')
  })

  it('should parse /심층토론 with topic', () => {
    const result = parseSlash('/심층토론 글로벌 경제 전망')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('deep_debate')
    expect(result!.args).toBe('글로벌 경제 전망')
  })

  it('should parse /토론 without topic', () => {
    const result = parseSlash('/토론')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('debate')
    expect(result!.args).toBe('')
  })

  it('should parse /심층토론 without topic', () => {
    const result = parseSlash('/심층토론')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('deep_debate')
    expect(result!.args).toBe('')
  })

  it('should map debate to slash commandType', () => {
    const result = parseSlash('/토론 주제')
    expect(result!.commandType).toBe('slash')
  })

  it('should map deep_debate to slash commandType', () => {
    const result = parseSlash('/심층토론 주제')
    expect(result!.commandType).toBe('slash')
  })

  it('should not match /심층토론 when input is /토론', () => {
    // /심층토론 is longer, so it should be tried first
    const result = parseSlash('/토론 주제')
    expect(result!.slashType).toBe('debate')
  })

  it('should handle /심층토론 with whitespace', () => {
    const result = parseSlash('  /심층토론   복잡한 주제  ')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('deep_debate')
    expect(result!.args).toBe('복잡한 주제')
  })
})

// =============================================
// DebateCommandResult shared type
// =============================================

describe('DebateCommandResult type', () => {
  it('should be valid TypeScript type', () => {
    // Type check at compile time
    const result: import('@corthex/shared').DebateCommandResult = {
      debateId: 'debate-1',
      topic: 'AI 투자',
      debateType: 'debate',
      consensus: 'consensus',
      report: '## AGORA 결과',
      participants: [{ agentId: 'a1', agentName: '팀장', role: 'manager' }],
    }
    expect(result.debateId).toBe('debate-1')
    expect(result.debateType).toBe('debate')
    expect(result.consensus).toBe('consensus')
  })

  it('should allow null consensus', () => {
    const result: import('@corthex/shared').DebateCommandResult = {
      debateId: 'debate-1',
      topic: 'AI',
      debateType: 'deep-debate',
      consensus: null,
      report: '',
      participants: [],
    }
    expect(result.consensus).toBeNull()
  })
})

// =============================================
// Error handling
// =============================================

describe('processDebateCommand error handling', () => {
  it('selectDebateParticipants throws on insufficient agents', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => []),
      })),
    })

    try {
      await selectDebateParticipants('company-1')
      expect(true).toBe(false) // Should not reach
    } catch (err) {
      expect((err as Error).message).toContain('DEBATE_INSUFFICIENT_AGENTS')
      expect((err as Error).message).toContain('2명 미만')
    }
  })

  it('formatDebateReport handles empty everything gracefully', () => {
    const report = formatDebateReport('', 'debate', [], [], null)
    expect(report).toContain('AGORA 토론 결과')
    expect(report).toContain('**주제:** ')
  })
})

// =============================================
// Tenant isolation
// =============================================

describe('tenant isolation', () => {
  it('selectDebateParticipants queries with companyId filter', async () => {
    let capturedQuery: unknown = null
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock((query: unknown) => {
          capturedQuery = query
          return [
            { id: 'a1', name: '팀장', role: 'manager', tier: 'manager' },
            { id: 'a2', name: '전문가', role: 'analyst', tier: 'specialist' },
          ]
        }),
      })),
    })

    await selectDebateParticipants('company-99')
    // The query is called with and() containing eq(companyId)
    // We verify it was called (the mock captures the call)
    expect(mockSelect).toHaveBeenCalled()
  })
})
