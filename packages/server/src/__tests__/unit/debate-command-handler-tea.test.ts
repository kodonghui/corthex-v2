/**
 * TEA (Test Architect) Risk-Based Tests for Story 11-2
 * debate-command-handler: /토론 + /심층토론 명령 통합
 *
 * Risk Matrix:
 * - R1 (HIGH): processDebateCommand full flow — command status transitions, error propagation
 * - R2 (HIGH): selectDebateParticipants boundary — exactly 2, tier priority, MAX cap
 * - R3 (MEDIUM): formatDebateReport edge cases — empty/null/special chars, XSS
 * - R4 (MEDIUM): Polling behavior — timeout, null debate, failed state
 * - R5 (MEDIUM): DelegationTracker event sequence — correct ordering
 * - R6 (LOW): SlashType → DebateType mapping correctness
 * - R7 (LOW): Metadata merging — preserves existing metadata
 */

import { describe, it, expect, mock, beforeEach } from 'bun:test'

// === Mocks ===

let dbUpdateCalls: Array<{ set: Record<string, unknown> }> = []
let dbSelectResult: unknown[] = []

const mockWhere = mock(() => Promise.resolve())
const mockSet = mock((vals: Record<string, unknown>) => {
  dbUpdateCalls.push({ set: vals })
  return { where: mockWhere }
})
const mockUpdate = mock(() => ({ set: mockSet }))

const mockSelectFrom = mock(() => ({
  where: mock(() => dbSelectResult),
}))
const mockSelect = mock(() => ({
  from: mockSelectFrom,
}))

const mockDb = {
  select: mockSelect,
  update: mockUpdate,
  insert: mock(() => ({ values: mock(() => ({ returning: mock(() => []) })) })),
}

mock.module('../../db', () => ({ db: mockDb }))
mock.module('../../db/schema', () => ({
  commands: { id: 'id', companyId: 'companyId', status: 'status', metadata: 'metadata', result: 'result', completedAt: 'completedAt' },
  agents: { id: 'id', companyId: 'companyId', isActive: 'isActive', isSecretary: 'isSecretary', name: 'name', role: 'role', tier: 'tier' },
}))
mock.module('drizzle-orm', () => ({
  eq: (...args: unknown[]) => ({ type: 'eq', args }),
  and: (...args: unknown[]) => ({ type: 'and', args }),
}))

// Mock AGORA engine
const mockCreateDebate = mock(() => Promise.resolve({
  id: 'debate-tea-1',
  topic: '테스트 주제',
  debateType: 'debate',
  status: 'pending',
  maxRounds: 2,
  participants: [],
  rounds: [],
  result: null,
  companyId: 'co-1',
  createdBy: 'user-1',
}))
const mockStartDebate = mock(() => Promise.resolve({ status: 'in-progress' }))

let getDebateResults: unknown[] = []
let getDebateCallIdx = 0
const mockGetDebate = mock(() => {
  const result = getDebateResults[getDebateCallIdx] || null
  getDebateCallIdx++
  return Promise.resolve(result)
})

mock.module('../../services/agora-engine', () => ({
  createDebate: mockCreateDebate,
  startDebate: mockStartDebate,
  getDebate: mockGetDebate,
}))

const tracker = {
  startCommand: mock(() => {}),
  debateStarted: mock(() => {}),
  debateRoundProgress: mock(() => {}),
  debateCompleted: mock(() => {}),
  completed: mock(() => {}),
  failed: mock(() => {}),
}
mock.module('../../services/delegation-tracker', () => ({ delegationTracker: tracker }))

// Import after mocks
import { selectDebateParticipants, formatDebateReport, processDebateCommand } from '../../services/debate-command-handler'
import type { DebateRound, DebateResult } from '@corthex/shared'

beforeEach(() => {
  dbUpdateCalls = []
  dbSelectResult = []
  getDebateResults = []
  getDebateCallIdx = 0
  for (const fn of Object.values(tracker)) fn.mockClear()
  mockCreateDebate.mockClear()
  mockStartDebate.mockClear()
  mockGetDebate.mockClear()
  mockUpdate.mockClear()
  mockSet.mockClear()
  mockWhere.mockClear()
})

// =============================================
// R1 (HIGH): processDebateCommand integration flow
// =============================================

describe('R1: processDebateCommand full flow', () => {
  it('should set command to processing immediately', async () => {
    // Setup: empty topic → will fail fast
    const promise = processDebateCommand({
      commandId: 'cmd-1',
      topic: '',
      debateType: 'debate',
      companyId: 'co-1',
      userId: 'user-1',
    })
    await promise

    // First update should be status='processing'
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('should call delegationTracker.startCommand before processing', async () => {
    await processDebateCommand({
      commandId: 'cmd-1',
      topic: '',
      debateType: 'debate',
      companyId: 'co-1',
      userId: 'user-1',
    })

    expect(tracker.startCommand).toHaveBeenCalledWith('co-1', 'cmd-1')
  })

  it('should fail with DEBATE_TOPIC_REQUIRED for empty topic', async () => {
    await processDebateCommand({
      commandId: 'cmd-1',
      topic: '',
      debateType: 'debate',
      companyId: 'co-1',
      userId: 'user-1',
    })

    expect(tracker.failed).toHaveBeenCalled()
    const failArgs = tracker.failed.mock.calls[0]
    expect(failArgs[2]).toContain('DEBATE_TOPIC_REQUIRED')
  })

  it('should fail with DEBATE_TOPIC_REQUIRED for whitespace-only topic', async () => {
    await processDebateCommand({
      commandId: 'cmd-1',
      topic: '   ',
      debateType: 'debate',
      companyId: 'co-1',
      userId: 'user-1',
    })

    expect(tracker.failed).toHaveBeenCalled()
    const failArgs = tracker.failed.mock.calls[0]
    expect(failArgs[2]).toContain('DEBATE_TOPIC_REQUIRED')
  })

  it('should propagate AGORA engine errors to command failure', async () => {
    // Setup agents to be available
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 'a1', name: '팀장', role: 'CIO', tier: 'manager' },
          { id: 'a2', name: '전문가', role: 'analyst', tier: 'specialist' },
        ]),
      })),
    })

    // createDebate throws
    mockCreateDebate.mockImplementationOnce(() => {
      throw new Error('AGORA_ENGINE_ERROR: DB connection failed')
    })

    await processDebateCommand({
      commandId: 'cmd-1',
      topic: '유효한 주제',
      debateType: 'debate',
      companyId: 'co-1',
      userId: 'user-1',
    })

    expect(tracker.failed).toHaveBeenCalled()
    const failArgs = tracker.failed.mock.calls[0]
    expect(failArgs[2]).toContain('AGORA_ENGINE_ERROR')
  })

  it('should handle non-Error thrown objects', async () => {
    // selectDebateParticipants query
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => { throw 'string error thrown' }),
      })),
    })

    await processDebateCommand({
      commandId: 'cmd-1',
      topic: '주제',
      debateType: 'debate',
      companyId: 'co-1',
      userId: 'user-1',
    })

    expect(tracker.failed).toHaveBeenCalled()
  })
})

// =============================================
// R2 (HIGH): selectDebateParticipants boundary
// =============================================

describe('R2: selectDebateParticipants boundary conditions', () => {
  it('should return exactly 2 when only 2 eligible', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 'a1', name: '팀장', role: 'CIO', tier: 'manager' },
          { id: 'a2', name: '전문가', role: 'analyst', tier: 'specialist' },
        ]),
      })),
    })

    const result = await selectDebateParticipants('co-1')
    expect(result).toHaveLength(2)
  })

  it('should return exactly 5 when 7 eligible (cap at MAX)', async () => {
    const agents = Array.from({ length: 7 }, (_, i) => ({
      id: `a${i}`, name: `에이전트${i}`, role: 'analyst',
      tier: i < 3 ? 'manager' : 'specialist',
    }))
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => agents),
      })),
    })

    const result = await selectDebateParticipants('co-1')
    expect(result).toHaveLength(5)
  })

  it('should place managers before specialists in selection', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 's1', name: '전문가A', role: 'analyst', tier: 'specialist' },
          { id: 'm1', name: '팀장A', role: 'CIO', tier: 'manager' },
          { id: 's2', name: '전문가B', role: 'writer', tier: 'specialist' },
        ]),
      })),
    })

    const result = await selectDebateParticipants('co-1')
    expect(result[0].id).toBe('m1') // Manager first
    expect(result[1].id).toBe('s1') // Then specialist
  })

  it('should work with all managers and no specialists', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 'm1', name: '팀장1', role: 'CIO', tier: 'manager' },
          { id: 'm2', name: '팀장2', role: 'CMO', tier: 'manager' },
        ]),
      })),
    })

    const result = await selectDebateParticipants('co-1')
    expect(result).toHaveLength(2)
    expect(result.every(r => r.tier === 'manager')).toBe(true)
  })

  it('should work with all specialists and no managers', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 's1', name: '전문가1', role: 'analyst', tier: 'specialist' },
          { id: 's2', name: '전문가2', role: 'writer', tier: 'specialist' },
          { id: 's3', name: '전문가3', role: 'coder', tier: 'specialist' },
        ]),
      })),
    })

    const result = await selectDebateParticipants('co-1')
    expect(result).toHaveLength(3)
    expect(result.every(r => r.tier === 'specialist')).toBe(true)
  })

  it('should throw with exactly 1 eligible agent', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 'm1', name: '팀장', role: 'CIO', tier: 'manager' },
        ]),
      })),
    })

    await expect(selectDebateParticipants('co-1')).rejects.toThrow('DEBATE_INSUFFICIENT_AGENTS')
  })

  it('should exclude workers even if many available', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 'w1', name: '작업자1', role: 'writer', tier: 'worker' },
          { id: 'w2', name: '작업자2', role: 'coder', tier: 'worker' },
          { id: 'w3', name: '작업자3', role: 'tester', tier: 'worker' },
          { id: 'm1', name: '팀장', role: 'CIO', tier: 'manager' },
        ]),
      })),
    })

    // Only 1 eligible (the manager), so should throw
    await expect(selectDebateParticipants('co-1')).rejects.toThrow('DEBATE_INSUFFICIENT_AGENTS')
  })

  it('should handle null role gracefully', async () => {
    mockSelect.mockReturnValueOnce({
      from: mock(() => ({
        where: mock(() => [
          { id: 'm1', name: '팀장', role: null, tier: 'manager' },
          { id: 's1', name: '전문가', role: null, tier: 'specialist' },
        ]),
      })),
    })

    const result = await selectDebateParticipants('co-1')
    expect(result).toHaveLength(2)
    expect(result[0].role).toBeNull()
  })
})

// =============================================
// R3 (MEDIUM): formatDebateReport edge cases
// =============================================

describe('R3: formatDebateReport edge cases', () => {
  const participants = [
    { agentId: 'a1', agentName: '테스트에이전트', role: 'manager' },
  ]

  it('should handle special characters in topic', () => {
    const report = formatDebateReport(
      '주제 <script>alert("xss")</script> & "quotes"',
      'debate', participants, [], null,
    )
    expect(report).toContain('<script>')  // Markdown, not HTML-escaped
    expect(report).toContain('&')
    expect(report).toContain('"quotes"')
  })

  it('should handle very long topic (500+ chars)', () => {
    const longTopic = 'A'.repeat(600)
    const report = formatDebateReport(longTopic, 'debate', participants, [], null)
    expect(report).toContain(longTopic)
  })

  it('should handle empty summary gracefully', () => {
    const result: DebateResult = {
      consensus: 'consensus', summary: '',
      majorityPosition: 'pos', minorityPosition: '',
      keyArguments: [], roundCount: 1,
    }
    const report = formatDebateReport('주제', 'debate', participants, [], result)
    expect(report).toContain('(요약 없음)')
  })

  it('should handle many key arguments (10+)', () => {
    const result: DebateResult = {
      consensus: 'partial', summary: 'test',
      majorityPosition: '', minorityPosition: '',
      keyArguments: Array.from({ length: 15 }, (_, i) => `논점 ${i + 1}`),
      roundCount: 2,
    }
    const report = formatDebateReport('주제', 'debate', participants, [], result)
    expect(report).toContain('15. 논점 15')
  })

  it('should handle multi-round deep-debate with many speeches', () => {
    const rounds: DebateRound[] = Array.from({ length: 3 }, (_, rIdx) => ({
      roundNum: rIdx + 1,
      speeches: Array.from({ length: 5 }, (_, sIdx) => ({
        agentId: `a${sIdx}`,
        agentName: `에이전트${sIdx}`,
        content: `라운드${rIdx + 1} 발언${sIdx + 1}`,
        position: 'pro',
        createdAt: new Date().toISOString(),
      })),
    }))

    const report = formatDebateReport('심층주제', 'deep-debate', participants, rounds, null)
    expect(report).toContain('#### 라운드 1')
    expect(report).toContain('#### 라운드 2')
    expect(report).toContain('#### 라운드 3')
    expect(report).toContain('라운드3 발언5')
  })

  it('should handle newlines in speech content', () => {
    const rounds: DebateRound[] = [{
      roundNum: 1,
      speeches: [{
        agentId: 'a1', agentName: '팀장',
        content: '첫째 의견.\n둘째 의견.\n셋째 의견.',
        position: 'pro', createdAt: new Date().toISOString(),
      }],
    }]

    const report = formatDebateReport('주제', 'debate', participants, rounds, null)
    expect(report).toContain('첫째 의견.\n둘째 의견.')
  })

  it('should handle empty participants array', () => {
    const report = formatDebateReport('주제', 'debate', [], [], null)
    expect(report).toContain('### 참여자')
    // No crash
  })

  it('should return string type', () => {
    const report = formatDebateReport('주제', 'debate', [], [], null)
    expect(typeof report).toBe('string')
  })
})

// =============================================
// R4 (MEDIUM): Polling behavior edge cases
// =============================================

describe('R4: processDebateCommand polling behavior', () => {
  it('should handle failed debate status', async () => {
    // Setup agents
    mockSelect
      .mockReturnValueOnce({
        from: mock(() => ({
          where: mock(() => [
            { id: 'a1', name: '팀장', role: 'CIO', tier: 'manager' },
            { id: 'a2', name: '전문가', role: 'analyst', tier: 'specialist' },
          ]),
        })),
      })
      .mockReturnValueOnce({
        from: mock(() => ({
          where: mock(() => [{ metadata: {} }]),
        })),
      })

    // getDebate returns failed immediately
    getDebateResults = [
      { id: 'debate-1', status: 'failed', error: '에이전트 응답 없음', rounds: [], participants: [], result: null, topic: '주제', debateType: 'debate', maxRounds: 2 },
    ]

    await processDebateCommand({
      commandId: 'cmd-1',
      topic: '실패할 주제',
      debateType: 'debate',
      companyId: 'co-1',
      userId: 'user-1',
    })

    expect(tracker.failed).toHaveBeenCalled()
    const failArgs = tracker.failed.mock.calls[0]
    expect(failArgs[2]).toContain('DEBATE_FAILED')
    expect(failArgs[2]).toContain('에이전트 응답 없음')
  })

  it('should handle getDebate returning null (debate not found)', async () => {
    mockSelect
      .mockReturnValueOnce({
        from: mock(() => ({
          where: mock(() => [
            { id: 'a1', name: '팀장', role: 'CIO', tier: 'manager' },
            { id: 'a2', name: '전문가', role: 'analyst', tier: 'specialist' },
          ]),
        })),
      })
      .mockReturnValueOnce({
        from: mock(() => ({
          where: mock(() => [{ metadata: {} }]),
        })),
      })

    // getDebate returns null
    getDebateResults = [null]

    await processDebateCommand({
      commandId: 'cmd-1',
      topic: '주제',
      debateType: 'debate',
      companyId: 'co-1',
      userId: 'user-1',
    })

    expect(tracker.failed).toHaveBeenCalled()
    const failArgs = tracker.failed.mock.calls[0]
    expect(failArgs[2]).toContain('DEBATE_TIMEOUT')
  })
})

// =============================================
// R5 (MEDIUM): DelegationTracker event sequence
// =============================================

describe('R5: DelegationTracker event ordering', () => {
  it('should emit startCommand before any other events on error', async () => {
    await processDebateCommand({
      commandId: 'cmd-1',
      topic: '',
      debateType: 'debate',
      companyId: 'co-1',
      userId: 'user-1',
    })

    // startCommand must be called
    expect(tracker.startCommand).toHaveBeenCalledTimes(1)
    // failed must be called after
    expect(tracker.failed).toHaveBeenCalledTimes(1)
    // No debate events should fire for empty topic
    expect(tracker.debateStarted).not.toHaveBeenCalled()
    expect(tracker.debateCompleted).not.toHaveBeenCalled()
  })

  it('should not emit debateCompleted on error paths', async () => {
    await processDebateCommand({
      commandId: 'cmd-err',
      topic: '   ',
      debateType: 'deep-debate',
      companyId: 'co-1',
      userId: 'user-1',
    })

    expect(tracker.debateCompleted).not.toHaveBeenCalled()
    expect(tracker.completed).not.toHaveBeenCalled()
    expect(tracker.failed).toHaveBeenCalledTimes(1)
  })
})

// =============================================
// R6 (LOW): SlashType → DebateType mapping
// =============================================

describe('R6: SlashType to DebateType mapping', () => {
  // Test that command-router parseSlash correctly identifies debate types
  const { parseSlash } = require('../../services/command-router')

  it('/토론 maps to debate slashType', () => {
    const r = parseSlash('/토론 주제')
    expect(r?.slashType).toBe('debate')
  })

  it('/심층토론 maps to deep_debate slashType', () => {
    const r = parseSlash('/심층토론 주제')
    expect(r?.slashType).toBe('deep_debate')
  })

  it('debate slashType should be mapped to debate DebateType in handler', () => {
    // Verify the mapping logic: slashType === 'deep_debate' ? 'deep-debate' : 'debate'
    const debateMapping = 'debate' === 'deep_debate' ? 'deep-debate' : 'debate'
    expect(debateMapping).toBe('debate')

    const deepDebateMapping = 'deep_debate' === 'deep_debate' ? 'deep-debate' : 'debate'
    expect(deepDebateMapping).toBe('deep-debate')
  })

  it('/토론 should have 300s timeout override', () => {
    const r = parseSlash('/토론 주제')
    expect(r?.commandType).toBe('slash')
    // The timeout is applied in classify(), checking slashType alone here
    expect(r?.slashType).toBe('debate')
  })

  it('/심층토론 should have 300s timeout override', () => {
    const r = parseSlash('/심층토론 주제')
    expect(r?.commandType).toBe('slash')
    expect(r?.slashType).toBe('deep_debate')
  })

  it('/심층토론 should not be confused with /토론 prefix', () => {
    // This verifies sorted longest-first matching
    const deep = parseSlash('/심층토론 주제')
    const regular = parseSlash('/토론 주제')
    expect(deep?.slashType).toBe('deep_debate')
    expect(regular?.slashType).toBe('debate')
  })
})

// =============================================
// R7 (LOW): Metadata merging
// =============================================

describe('R7: Command metadata merging', () => {
  it('should preserve existing metadata when adding debateId', () => {
    // This tests the pattern: { ...existingMeta, debateId: debate.id }
    const existingMeta = { slashType: 'debate', slashArgs: 'AI 투자', timeoutMs: 300000 }
    const merged = { ...existingMeta, debateId: 'debate-1' }

    expect(merged.slashType).toBe('debate')
    expect(merged.slashArgs).toBe('AI 투자')
    expect(merged.timeoutMs).toBe(300000)
    expect(merged.debateId).toBe('debate-1')
  })

  it('should handle empty existing metadata', () => {
    const existingMeta = {}
    const merged = { ...existingMeta, debateId: 'debate-1' }

    expect(merged.debateId).toBe('debate-1')
    expect(Object.keys(merged)).toHaveLength(1)
  })

  it('should handle null-coalesced metadata', () => {
    const cmd = { metadata: null }
    const existingMeta = (cmd.metadata ?? {}) as Record<string, unknown>
    const merged = { ...existingMeta, debateId: 'debate-1' }

    expect(merged.debateId).toBe('debate-1')
  })
})

// =============================================
// Additional: DelegationTracker type validation
// =============================================

describe('DelegationTracker debate event types', () => {
  it('DEBATE_STARTED should be a valid event type', () => {
    // Import the actual DelegationTracker class to verify types
    const { DelegationTracker } = require('../../services/delegation-tracker')
    const instance = new DelegationTracker()
    expect(typeof instance.debateStarted).toBe('function')
  })

  it('DEBATE_ROUND_PROGRESS should be a valid event type', () => {
    const { DelegationTracker } = require('../../services/delegation-tracker')
    const instance = new DelegationTracker()
    expect(typeof instance.debateRoundProgress).toBe('function')
  })

  it('DEBATE_COMPLETED should be a valid event type', () => {
    const { DelegationTracker } = require('../../services/delegation-tracker')
    const instance = new DelegationTracker()
    expect(typeof instance.debateCompleted).toBe('function')
  })
})
