import { describe, it, expect, mock, beforeEach } from 'bun:test'

// === Mock setup ===

const mockExecute = mock(() => Promise.resolve({
  content: '{"order": ["mgr-1", "mgr-2"], "reason": "tech then business"}',
  usage: { input: 100, output: 50 },
  cost: 0.001,
}))
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
  managerAnalysis: 'analysis result',
  specialistResults: [],
  summary: { totalSpecialists: 0, fulfilled: 0, rejected: 0 },
}))

const mockFormatDelegationResult = mock((_result: unknown, name: string) => `## ${name} 분석\n결과 내용`)

const secretaryAgent = {
  id: 'sec-1', companyId: 'c-1', name: '비서실장', nameEn: 'Secretary', tier: 'manager' as const,
  modelName: 'claude-sonnet-4-6', soul: null, allowedTools: [] as string[], isActive: true,
}

const mockFindSecretaryAgent = mock(() => Promise.resolve(secretaryAgent))

const managerRows = [
  { id: 'mgr-1', companyId: 'c-1', name: 'CTO', nameEn: 'CTO', tier: 'manager', modelName: 'claude-sonnet-4-6', soul: null, allowedTools: [], isActive: true, role: null, departmentId: 'd-1' },
  { id: 'mgr-2', companyId: 'c-1', name: 'CFO', nameEn: 'CFO', tier: 'manager', modelName: 'claude-sonnet-4-6', soul: null, allowedTools: [], isActive: true, role: null, departmentId: 'd-2' },
  { id: 'mgr-3', companyId: 'c-1', name: 'CMO', nameEn: 'CMO', tier: 'manager', modelName: 'claude-sonnet-4-6', soul: null, allowedTools: [], isActive: true, role: null, departmentId: 'd-3' },
]

const mockGetActiveManagers = mock(() => Promise.resolve(managerRows))

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

const mockParseLLMJson = mock((raw: string) => {
  try {
    let cleaned = raw.trim()
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
    if (codeBlockMatch) cleaned = codeBlockMatch[1].trim()
    return JSON.parse(cleaned)
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]) } catch { return null }
    }
    return null
  }
})

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
  parseLLMJson: mockParseLLMJson,
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

import { processSequential, planOrder } from '../../services/sequential-command-processor'

describe('SequentialCommandProcessor', () => {
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
    mockDelegationTracker.managerStarted.mockClear()
    mockCreateOrchTask.mockClear()
    mockCompleteOrchTask.mockClear()

    // Reset to default: first call returns order plan, second returns synthesis
    mockExecute
      .mockResolvedValueOnce({ content: '{"order": ["mgr-1", "mgr-2"], "reason": "tech then finance"}', usage: { input: 100, output: 50 }, cost: 0.001 })
      .mockResolvedValue({ content: '순차 협업 종합 보고서 내용', usage: { input: 100, output: 50 }, cost: 0.001 })
  })

  const baseOptions = {
    commandId: 'cmd-1',
    commandText: 'CORTHEX 사업성 분석',
    companyId: 'c-1',
    userId: 'u-1',
  }

  describe('planOrder', () => {
    it('should parse LLM order plan with valid manager IDs', async () => {
      mockExecute.mockReset()
      mockExecute.mockResolvedValueOnce({
        content: '{"order": ["mgr-1", "mgr-3"], "reason": "tech then marketing"}',
        usage: { input: 100, output: 50 }, cost: 0.001,
      })

      const managers = managerRows.map(mockToAgentConfig)
      const order = await planOrder('test', 'c-1', secretaryAgent, managers)

      expect(order).toEqual(['mgr-1', 'mgr-3'])
    })

    it('should filter out invalid manager IDs', async () => {
      mockExecute.mockReset()
      mockExecute.mockResolvedValueOnce({
        content: '{"order": ["mgr-1", "invalid-id", "mgr-2"], "reason": "reason"}',
        usage: { input: 100, output: 50 }, cost: 0.001,
      })

      const managers = managerRows.map(mockToAgentConfig)
      const order = await planOrder('test', 'c-1', secretaryAgent, managers)

      expect(order).toEqual(['mgr-1', 'mgr-2'])
    })

    it('should fallback to default order when LLM fails', async () => {
      mockExecute.mockReset()
      mockExecute.mockRejectedValueOnce(new Error('LLM error'))

      const managers = managerRows.map(mockToAgentConfig)
      const order = await planOrder('test', 'c-1', secretaryAgent, managers)

      // Should use first MAX_MANAGERS from all managers
      expect(order.length).toBeGreaterThanOrEqual(2)
    })

    it('should limit to MAX_MANAGERS (4)', async () => {
      mockExecute.mockReset()
      mockExecute.mockResolvedValueOnce({
        content: '{"order": ["mgr-1", "mgr-2", "mgr-3"], "reason": "all"}',
        usage: { input: 100, output: 50 }, cost: 0.001,
      })

      const managers = managerRows.map(mockToAgentConfig)
      const order = await planOrder('test', 'c-1', secretaryAgent, managers)

      expect(order.length).toBeLessThanOrEqual(4)
    })
  })

  describe('processSequential', () => {
    it('should process managers sequentially and synthesize', async () => {
      const result = await processSequential(baseOptions)

      expect(result.commandId).toBe('cmd-1')
      expect(result.stepCount).toBe(2) // mgr-1, mgr-2
      expect(result.managerOrder).toEqual(['CTO', 'CFO'])
      expect(result.content).toContain('순차 협업 보고')

      // Sequential: managers called one by one
      expect(mockManagerDelegate).toHaveBeenCalledTimes(2)
      expect(mockDelegationTracker.managerStarted).toHaveBeenCalledTimes(2)
    })

    it('should pass previous results to subsequent managers', async () => {
      await processSequential(baseOptions)

      // First manager gets original command only
      const firstCall = mockManagerDelegate.mock.calls[0][0]
      expect(firstCall.commandText).toBe('CORTHEX 사업성 분석')

      // Second manager gets command + previous results
      const secondCall = mockManagerDelegate.mock.calls[1][0]
      expect(secondCall.commandText).toContain('이전 단계 작업 결과')
    })

    it('should return error when no secretary agent', async () => {
      mockFindSecretaryAgent.mockResolvedValueOnce(null)

      const result = await processSequential(baseOptions)

      expect(result.content).toBe('비서실장 에이전트를 찾을 수 없습니다')
      expect(result.managerOrder).toEqual([])
      expect(mockDelegationTracker.failed).toHaveBeenCalledTimes(1)
    })

    it('should return error when no active managers', async () => {
      mockGetActiveManagers.mockResolvedValueOnce([])

      const result = await processSequential(baseOptions)

      expect(result.content).toBe('활성 Manager가 없습니다')
      expect(result.managerOrder).toEqual([])
    })

    it('should handle manager execution failure gracefully', async () => {
      mockManagerDelegate
        .mockResolvedValueOnce({ managerAnalysis: 'ok', specialistResults: [], summary: { totalSpecialists: 0, fulfilled: 0, rejected: 0 } })
        .mockRejectedValueOnce(new Error('Manager 2 failed'))

      const result = await processSequential(baseOptions)

      expect(result.stepCount).toBe(2)
      // Should still synthesize with partial results
      expect(result.content).toContain('순차 협업 보고')
    })

    it('should handle synthesis failure gracefully', async () => {
      mockExecute
        .mockReset()
        .mockResolvedValueOnce({ content: '{"order": ["mgr-1", "mgr-2"], "reason": "tech"}', usage: { input: 100, output: 50 }, cost: 0.001 })
        .mockRejectedValueOnce(new Error('Synthesis failed'))

      const result = await processSequential(baseOptions)

      expect(result.content).toContain('순차 협업 결과 (종합 실패)')
    })

    it('should emit delegation tracking events', async () => {
      await processSequential(baseOptions)

      expect(mockDelegationTracker.startCommand).toHaveBeenCalledWith('c-1', 'cmd-1')
      expect(mockDelegationTracker.synthesizing).toHaveBeenCalledWith('c-1', 'cmd-1', 'sec-1', '비서실장')
      expect(mockDelegationTracker.completed).toHaveBeenCalledWith('c-1', 'cmd-1')
    })

    it('should create orchestration task for synthesis', async () => {
      await processSequential(baseOptions)

      expect(mockCreateOrchTask).toHaveBeenCalledWith(expect.objectContaining({
        companyId: 'c-1',
        commandId: 'cmd-1',
        agentId: 'sec-1',
        type: 'synthesize',
      }))
    })

    // === TEA Risk-Based Tests ===

    it('should handle single active manager', async () => {
      mockGetActiveManagers.mockResolvedValueOnce([
        { id: 'mgr-1', companyId: 'c-1', name: 'Solo', nameEn: 'Solo', tier: 'manager', modelName: 'claude-sonnet-4-6', soul: null, allowedTools: [], isActive: true, role: null, departmentId: 'd-1' },
      ])

      // planOrder will get fallback since <MIN_MANAGERS
      mockExecute.mockReset()
      mockExecute
        .mockResolvedValueOnce({ content: '{"order": ["mgr-1"], "reason": "only one"}', usage: { input: 100, output: 50 }, cost: 0.001 })
        .mockResolvedValue({ content: 'solo synthesis', usage: { input: 100, output: 50 }, cost: 0.001 })

      const result = await processSequential(baseOptions)

      // Should still process even with 1 manager (fallback)
      expect(result.stepCount).toBeGreaterThanOrEqual(1)
    })

    it('should not pass previous results to first manager', async () => {
      await processSequential(baseOptions)

      const firstCall = mockManagerDelegate.mock.calls[0][0]
      expect(firstCall.commandText).not.toContain('이전 단계 작업 결과')
    })

    it('should include manager order names in final content', async () => {
      const result = await processSequential(baseOptions)

      expect(result.content).toContain('순차 협업 보고')
      expect(result.managerOrder.length).toBeGreaterThan(0)
    })

    it('should handle all sequential managers failing', async () => {
      mockManagerDelegate
        .mockRejectedValueOnce(new Error('fail-1'))
        .mockRejectedValueOnce(new Error('fail-2'))

      const result = await processSequential(baseOptions)

      // Should still synthesize (with error content)
      expect(result.stepCount).toBe(2)
      expect(result.content).toBeDefined()
    })

    it('should not accumulate error results in context for next manager', async () => {
      mockManagerDelegate
        .mockRejectedValueOnce(new Error('first failed'))
        .mockResolvedValueOnce({ managerAnalysis: 'second ok', specialistResults: [], summary: { totalSpecialists: 0, fulfilled: 0, rejected: 0 } })

      await processSequential(baseOptions)

      // Second manager should not get failed first manager's results in context
      const secondCall = mockManagerDelegate.mock.calls[1][0]
      expect(secondCall.commandText).not.toContain('이전 단계 작업 결과')
    })

    it('should format sequential chain summary with step numbers', async () => {
      const result = await processSequential(baseOptions)

      // The synthesis input should contain step numbering
      const synthCall = mockExecute.mock.calls[mockExecute.mock.calls.length - 1]
      const synthInput = synthCall[1].messages[0].content
      expect(synthInput).toContain('1단계')
      expect(synthInput).toContain('2단계')
    })
  })
})
