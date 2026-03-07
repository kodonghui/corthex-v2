import { describe, it, expect, mock, beforeEach } from 'bun:test'

// === Mock setup ===

const mockExecute = mock(() => Promise.resolve({ content: 'synthesis result', usage: { input: 100, output: 50 }, cost: 0.001 }))
const mockAgentRunner = { execute: mockExecute }

const mockDb = {
  update: mock(() => mockDb),
  set: mock(() => mockDb),
  where: mock(() => Promise.resolve()),
  insert: mock(() => ({ values: mock(() => ({ returning: mock(() => Promise.resolve([{ id: 'orch-1', startedAt: new Date() }])) })) })),
}

const mockDelegationTracker = {
  startCommand: mock(() => {}),
  completed: mock(() => {}),
  failed: mock(() => {}),
  synthesizing: mock(() => {}),
  managerStarted: mock(() => {}),
}

const mockManagerDelegate = mock(() => Promise.resolve({
  managerAnalysis: 'analysis',
  specialistResults: [],
  summary: { totalSpecialists: 0, fulfilled: 0, rejected: 0 },
}))

const mockFormatDelegationResult = mock((result: unknown, name: string) => `## ${name} 분석\n내용`)

const mockFindSecretaryAgent = mock(() => Promise.resolve({
  id: 'sec-1', companyId: 'c-1', name: '비서실장', nameEn: 'Secretary', tier: 'manager' as const,
  modelName: 'claude-sonnet-4-6', soul: null, allowedTools: [], isActive: true,
}))

const mockGetActiveManagers = mock(() => Promise.resolve([
  { id: 'mgr-1', companyId: 'c-1', name: 'CTO', nameEn: 'CTO', tier: 'manager', modelName: 'claude-sonnet-4-6', soul: null, allowedTools: [], isActive: true, role: null, departmentId: 'd-1' },
  { id: 'mgr-2', companyId: 'c-1', name: 'CFO', nameEn: 'CFO', tier: 'manager', modelName: 'claude-sonnet-4-6', soul: null, allowedTools: [], isActive: true, role: null, departmentId: 'd-2' },
  { id: 'mgr-3', companyId: 'c-1', name: 'CMO', nameEn: 'CMO', tier: 'manager', modelName: 'claude-sonnet-4-6', soul: null, allowedTools: [], isActive: true, role: null, departmentId: 'd-3' },
]))

const mockToAgentConfig = mock((row: Record<string, unknown>) => ({
  id: row.id as string,
  companyId: row.companyId as string,
  name: row.name as string,
  nameEn: row.nameEn as string | null,
  tier: row.tier as 'manager' | 'specialist' | 'worker',
  modelName: (row.modelName as string) ?? 'claude-sonnet-4-6',
  soul: row.soul as string | null,
  allowedTools: (row.allowedTools as string[]) ?? [],
  isActive: row.isActive as boolean,
}))

const mockCreateOrchTask = mock(() => Promise.resolve({ id: 'orch-1', startedAt: new Date() }))
const mockCompleteOrchTask = mock(() => Promise.resolve())
const mockMakeContext = mock((companyId: string, agent: { id: string; name: string }) => ({
  companyId, agentId: agent.id, agentName: agent.name, source: 'delegation',
}))

mock.module('../../services/agent-runner', () => ({
  agentRunner: mockAgentRunner,
  AgentConfig: {},
}))

mock.module('../../services/chief-of-staff', () => ({
  findSecretaryAgent: mockFindSecretaryAgent,
  getActiveManagers: mockGetActiveManagers,
  toAgentConfig: mockToAgentConfig,
  createOrchTask: mockCreateOrchTask,
  completeOrchTask: mockCompleteOrchTask,
  makeContext: mockMakeContext,
  parseLLMJson: mock(),
}))

mock.module('../../services/manager-delegate', () => ({
  delegate: mockManagerDelegate,
  formatDelegationResult: mockFormatDelegationResult,
}))

mock.module('../../services/delegation-tracker', () => ({
  delegationTracker: mockDelegationTracker,
}))

mock.module('../../db', () => ({ db: mockDb }))
mock.module('../../db/schema', () => ({
  commands: { id: 'id', companyId: 'companyId', status: 'status' },
  orchestrationTasks: {},
}))
mock.module('drizzle-orm', () => ({
  eq: mock((a: unknown, b: unknown) => ({ a, b })),
  and: mock((...args: unknown[]) => args),
}))

import { processAll } from '../../services/all-command-processor'

describe('AllCommandProcessor', () => {
  beforeEach(() => {
    mockExecute.mockClear()
    mockManagerDelegate.mockClear()
    mockFormatDelegationResult.mockClear()
    mockFindSecretaryAgent.mockClear()
    mockGetActiveManagers.mockClear()
    mockDelegationTracker.startCommand.mockClear()
    mockDelegationTracker.completed.mockClear()
    mockDelegationTracker.failed.mockClear()
    mockDelegationTracker.synthesizing.mockClear()
    mockCreateOrchTask.mockClear()
    mockCompleteOrchTask.mockClear()
  })

  const baseOptions = {
    commandId: 'cmd-1',
    commandText: '시장 분석',
    companyId: 'c-1',
    userId: 'u-1',
  }

  it('should process all managers in parallel and synthesize', async () => {
    const result = await processAll(baseOptions)

    expect(result.commandId).toBe('cmd-1')
    expect(result.managerCount).toBe(3)
    expect(result.successCount).toBe(3)
    expect(result.failedCount).toBe(0)
    expect(result.content).toBe('synthesis result')

    // Should have called managerDelegate for each manager
    expect(mockManagerDelegate).toHaveBeenCalledTimes(3)

    // Should have called synthesis
    expect(mockExecute).toHaveBeenCalledTimes(1)

    // Should have started and completed tracking
    expect(mockDelegationTracker.startCommand).toHaveBeenCalledTimes(1)
    expect(mockDelegationTracker.managerStarted).toHaveBeenCalledTimes(3)
    expect(mockDelegationTracker.completed).toHaveBeenCalledTimes(1)
    expect(mockDelegationTracker.synthesizing).toHaveBeenCalledTimes(1)
  })

  it('should handle partial manager failures', async () => {
    mockManagerDelegate
      .mockResolvedValueOnce({ managerAnalysis: 'ok', specialistResults: [], summary: { totalSpecialists: 0, fulfilled: 0, rejected: 0 } })
      .mockRejectedValueOnce(new Error('LLM failed'))
      .mockResolvedValueOnce({ managerAnalysis: 'ok', specialistResults: [], summary: { totalSpecialists: 0, fulfilled: 0, rejected: 0 } })

    const result = await processAll(baseOptions)

    expect(result.successCount).toBe(2)
    expect(result.failedCount).toBe(1)
    expect(result.content).toBe('synthesis result')
  })

  it('should return error when no secretary agent', async () => {
    mockFindSecretaryAgent.mockResolvedValueOnce(null)

    const result = await processAll(baseOptions)

    expect(result.content).toBe('비서실장 에이전트를 찾을 수 없습니다')
    expect(result.managerCount).toBe(0)
    expect(mockDelegationTracker.failed).toHaveBeenCalledTimes(1)
  })

  it('should return error when no active managers', async () => {
    mockGetActiveManagers.mockResolvedValueOnce([])

    const result = await processAll(baseOptions)

    expect(result.content).toBe('활성 Manager가 없습니다')
    expect(result.managerCount).toBe(0)
    expect(mockDelegationTracker.failed).toHaveBeenCalledTimes(1)
  })

  it('should handle synthesis failure gracefully', async () => {
    mockExecute.mockRejectedValueOnce(new Error('Synthesis LLM error'))

    const result = await processAll(baseOptions)

    expect(result.content).toContain('전체 명령 결과 (종합 실패)')
    expect(result.successCount).toBe(3)
  })

  it('should format delegation results for each manager', async () => {
    await processAll(baseOptions)

    expect(mockFormatDelegationResult).toHaveBeenCalledTimes(3)
  })

  it('should create orchestration task for synthesis', async () => {
    await processAll(baseOptions)

    expect(mockCreateOrchTask).toHaveBeenCalledWith(expect.objectContaining({
      companyId: 'c-1',
      commandId: 'cmd-1',
      agentId: 'sec-1',
      type: 'synthesize',
    }))
  })

  it('should emit delegation tracking events', async () => {
    await processAll(baseOptions)

    expect(mockDelegationTracker.startCommand).toHaveBeenCalledWith('c-1', 'cmd-1')
    expect(mockDelegationTracker.synthesizing).toHaveBeenCalledWith('c-1', 'cmd-1', 'sec-1', '비서실장')
    expect(mockDelegationTracker.completed).toHaveBeenCalledWith('c-1', 'cmd-1')
  })

  // === TEA Risk-Based Tests ===

  it('should handle all managers failing', async () => {
    mockManagerDelegate
      .mockRejectedValueOnce(new Error('fail-1'))
      .mockRejectedValueOnce(new Error('fail-2'))
      .mockRejectedValueOnce(new Error('fail-3'))

    const result = await processAll(baseOptions)

    expect(result.successCount).toBe(0)
    expect(result.failedCount).toBe(3)
    // Should still attempt synthesis with error reports
    expect(result.content).toBeDefined()
  })

  it('should handle single manager org', async () => {
    mockGetActiveManagers.mockResolvedValueOnce([
      { id: 'mgr-1', companyId: 'c-1', name: 'Solo', nameEn: 'Solo', tier: 'manager', modelName: 'claude-sonnet-4-6', soul: null, allowedTools: [], isActive: true, role: null, departmentId: 'd-1' },
    ])

    const result = await processAll(baseOptions)

    expect(result.managerCount).toBe(1)
    expect(result.successCount).toBe(1)
    expect(mockManagerDelegate).toHaveBeenCalledTimes(1)
  })

  it('should pass commandText to each manager delegate', async () => {
    await processAll(baseOptions)

    for (const call of mockManagerDelegate.mock.calls) {
      expect(call[0].commandText).toBe('시장 분석')
      expect(call[0].companyId).toBe('c-1')
      expect(call[0].commandId).toBe('cmd-1')
    }
  })

  it('should include all manager reports in synthesis input', async () => {
    mockFormatDelegationResult
      .mockReturnValueOnce('## CTO Report')
      .mockReturnValueOnce('## CFO Report')
      .mockReturnValueOnce('## CMO Report')

    await processAll(baseOptions)

    const synthCall = mockExecute.mock.calls[0]
    const messages = synthCall[1].messages
    expect(messages[0].content).toContain('CTO Report')
    expect(messages[0].content).toContain('CFO Report')
    expect(messages[0].content).toContain('CMO Report')
  })

  it('should complete orchestration task on synthesis success', async () => {
    await processAll(baseOptions)

    expect(mockCompleteOrchTask).toHaveBeenCalledWith(
      'orch-1',
      'synthesis result',
      'completed',
      expect.any(Date),
    )
  })

  it('should complete orchestration task as failed on synthesis error', async () => {
    mockExecute.mockRejectedValueOnce(new Error('Synth error'))

    await processAll(baseOptions)

    expect(mockCompleteOrchTask).toHaveBeenCalledWith(
      'orch-1',
      'Synth error',
      'failed',
      expect.any(Date),
    )
  })
})
