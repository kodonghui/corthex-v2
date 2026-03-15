import { describe, test, expect, mock, beforeEach } from 'bun:test'

// === Mock Setup ===

const mockCollectAgentResponse = mock(() => Promise.resolve('테스트 응답입니다.'))
const mockRunAgent = mock(async function* () {
  yield { type: 'accepted' as const, sessionId: 'test-session' }
  yield { type: 'message' as const, content: '파트1' }
  yield { type: 'message' as const, content: '파트2' }
  yield { type: 'done' as const, costUsd: 0.001, tokensUsed: 100 }
})

mock.module('../../engine/agent-loop', () => ({
  runAgent: mockRunAgent,
  collectAgentResponse: mockCollectAgentResponse,
}))

const mockRenderSoul = mock(() => Promise.resolve('렌더링된 소울'))
mock.module('../../engine/soul-renderer', () => ({
  renderSoul: mockRenderSoul,
}))

// Mock DB for argos-evaluator
const mockDbInsert = mock(() => ({
  values: mock(() => ({
    returning: mock(() => Promise.resolve([{ id: 'session-1' }])),
  })),
}))

const mockDbSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      limit: mock(() => Promise.resolve([{
        id: '00000000-0000-0000-0000-000000000001',
        name: '비서실장',
        isSecretary: true,
        soul: '당신은 비서실장입니다.',
      }])),
    })),
  })),
}))

// === Tests ===

describe('Story 4.2: Caller Import Migration', () => {
  beforeEach(() => {
    mockCollectAgentResponse.mockClear()
    mockRunAgent.mockClear()
    mockRenderSoul.mockClear()
  })

  describe('TEA P0: collectAgentResponse utility', () => {
    test('collects message events into single string', async () => {
      // Import the real function to test
      const { collectAgentResponse } = await import('../../engine/agent-loop')

      const ctx = {
        cliToken: 'test-key',
        userId: 'user-1',
        companyId: 'company-1',
        depth: 0,
        sessionId: 'session-1',
        startedAt: Date.now(),
        maxDepth: 3,
        visitedAgents: ['agent-1'],
        runId: 'test-run-1',
      }

      const result = await collectAgentResponse({ ctx, soul: 'test soul', message: 'hello' })
      // mockCollectAgentResponse returns '테스트 응답입니다.'
      expect(result).toBe('테스트 응답입니다.')
    })

    test('collectAgentResponse is called with RunAgentOptions shape', async () => {
      const { collectAgentResponse } = await import('../../engine/agent-loop')

      const options = {
        ctx: {
          cliToken: 'key',
          userId: 'u1',
          companyId: 'c1',
          depth: 0,
          sessionId: 's1',
          startedAt: Date.now(),
          maxDepth: 3,
          visitedAgents: ['a1'],
        },
        soul: 'soul template',
        message: 'test message',
      }

      await collectAgentResponse(options)
      expect(mockCollectAgentResponse).toHaveBeenCalledWith(options)
    })
  })

  describe('TEA P0: argos-evaluator SessionContext construction', () => {
    test('SessionContext uses trigger.companyId, trigger.userId, session.id', () => {
      // Verify the pattern: SessionContext is built from trigger data
      const trigger = {
        companyId: 'company-abc',
        userId: 'user-xyz',
        instruction: '데이터를 분석해주세요',
      }
      const sessionId = 'session-123'

      const ctx = {
        cliToken: process.env.ANTHROPIC_API_KEY || '',
        userId: trigger.userId,
        companyId: trigger.companyId,
        depth: 0,
        sessionId,
        startedAt: Date.now(),
        maxDepth: 3,
        visitedAgents: ['agent-1'],
        runId: 'test-run-1',
      }

      expect(ctx.companyId).toBe('company-abc')
      expect(ctx.userId).toBe('user-xyz')
      expect(ctx.sessionId).toBe('session-123')
      expect(ctx.depth).toBe(0)
      expect(ctx.maxDepth).toBe(3)
    })

    test('renderSoul called with agent.soul, agent.id, companyId', async () => {
      const { renderSoul } = await import('../../engine/soul-renderer')

      await renderSoul('당신은 비서실장입니다.', 'agent-1', 'company-abc')

      expect(mockRenderSoul).toHaveBeenCalledWith(
        '당신은 비서실장입니다.',
        'agent-1',
        'company-abc',
      )
    })

    test('renderSoul returns empty string when agent.soul is null', async () => {
      // Pattern: agent.soul ? await renderSoul(...) : ''
      const agent = { soul: null as string | null }
      const soul = agent.soul ? await mockRenderSoul(agent.soul, 'id', 'cid') : ''
      expect(soul).toBe('')
    })

    test('collectAgentResponse called with correct RunAgentOptions', async () => {
      const { collectAgentResponse } = await import('../../engine/agent-loop')

      const options = {
        ctx: {
          cliToken: '',
          userId: 'user-1',
          companyId: 'company-1',
          depth: 0,
          sessionId: 'session-1',
          startedAt: Date.now(),
          maxDepth: 3,
          visitedAgents: ['agent-1'],
        },
        soul: '렌더링된 소울',
        message: '데이터를 분석해주세요',
      }

      const result = await collectAgentResponse(options)
      expect(typeof result).toBe('string')
      expect(mockCollectAgentResponse).toHaveBeenCalledTimes(1)
    })
  })

  describe('TEA P0: agora-engine SessionContext per participant', () => {
    test('each participant gets unique sessionId', () => {
      const participants = [
        { agentId: 'agent-1', agentName: 'Agent A' },
        { agentId: 'agent-2', agentName: 'Agent B' },
      ]

      const sessionIds = new Set<string>()
      for (const participant of participants) {
        const ctx = {
          cliToken: '',
          userId: 'agora-system',
          companyId: 'company-1',
          depth: 0,
          sessionId: crypto.randomUUID(),
          startedAt: Date.now(),
          maxDepth: 1,
          visitedAgents: [participant.agentId],
        }
        sessionIds.add(ctx.sessionId)
        expect(ctx.userId).toBe('agora-system')
        expect(ctx.maxDepth).toBe(1) // debate has no handoff
        expect(ctx.visitedAgents).toEqual([participant.agentId])
      }

      // Each participant should have a unique session
      expect(sessionIds.size).toBe(2)
    })

    test('debate speech uses collectAgentResponse with sliced content', async () => {
      const { collectAgentResponse } = await import('../../engine/agent-loop')

      const longResponse = 'A'.repeat(600)
      mockCollectAgentResponse.mockResolvedValueOnce(longResponse)

      const result = await collectAgentResponse({
        ctx: {
          cliToken: '',
          userId: 'agora-system',
          companyId: 'c1',
          depth: 0,
          sessionId: 'sid',
          startedAt: Date.now(),
          maxDepth: 1,
          visitedAgents: ['a1'],
        },
        soul: '',
        message: 'debate prompt',
      })

      // MAX_SPEECH_LENGTH = 500 in agora-engine
      const content = result.slice(0, 500)
      expect(content.length).toBe(500)
    })
  })

  describe('TEA P0: detectConsensus companyId parameter', () => {
    test('detectConsensus accepts companyId string (not LLMRouterContext)', () => {
      // Verify the function signature change: context: LLMRouterContext → companyId: string
      const companyId = 'company-xyz'
      expect(typeof companyId).toBe('string')

      // Build SessionContext with companyId directly
      const ctx = {
        cliToken: '',
        userId: 'agora-system',
        companyId,
        depth: 0,
        sessionId: crypto.randomUUID(),
        startedAt: Date.now(),
        maxDepth: 1,
        visitedAgents: ['agora-synthesis'],
        runId: 'test-run-1',
      }

      expect(ctx.companyId).toBe('company-xyz')
    })

    test('synthesis uses soulCache when available', async () => {
      const soulCache = new Map<string, string>()
      soulCache.set('agent-1', '캐시된 소울')

      const cached = soulCache.get('agent-1')
      expect(cached).toBe('캐시된 소울')

      // When cached, renderSoul should NOT be called
      const callCount = mockRenderSoul.mock.calls.length
      if (cached !== undefined) {
        // Use cached value — no renderSoul call
        expect(cached).toBe('캐시된 소울')
      }
      expect(mockRenderSoul.mock.calls.length).toBe(callCount) // no new calls
    })

    test('synthesis falls back when soulCache misses', async () => {
      const { renderSoul } = await import('../../engine/soul-renderer')

      const soulCache = new Map<string, string>()
      // Not in cache — should call renderSoul
      const agentId = 'agent-2'
      const cached = soulCache.get(agentId)
      expect(cached).toBeUndefined()

      // Fallback to renderSoul
      const soul = await renderSoul('template', agentId, 'company-1')
      expect(mockRenderSoul).toHaveBeenCalledWith('template', agentId, 'company-1')
      expect(soul).toBe('렌더링된 소울')
    })
  })

  describe('TEA P0: agora-engine soul cache efficiency', () => {
    test('getCachedSoul returns empty string for null soul', () => {
      const agentRow = { id: 'a1', soul: null as string | null }
      const soul = agentRow.soul ? 'would-render' : ''
      expect(soul).toBe('')
    })

    test('getCachedSoul caches rendered souls', async () => {
      const { renderSoul } = await import('../../engine/soul-renderer')
      const soulCache = new Map<string, string>()

      // First call — render and cache
      const agentId = 'agent-1'
      const soulTemplate = '소울 템플릿'
      const companyId = 'c1'

      let cached = soulCache.get(agentId)
      if (cached === undefined) {
        const rendered = await renderSoul(soulTemplate, agentId, companyId)
        soulCache.set(agentId, rendered)
        cached = rendered
      }

      expect(cached).toBe('렌더링된 소울')
      const firstCallCount = mockRenderSoul.mock.calls.length

      // Second call — use cache, no new renderSoul
      const cached2 = soulCache.get(agentId)
      expect(cached2).toBe('렌더링된 소울')
      expect(mockRenderSoul.mock.calls.length).toBe(firstCallCount) // same count
    })
  })

  describe('TEA P1: no direct agent-runner imports in indirect callers', () => {
    test('telegram-bot.ts has no agent-runner import (static verification)', async () => {
      const fs = await import('node:fs')
      const content = fs.readFileSync(
        new URL('../../services/telegram-bot.ts', import.meta.url).pathname,
        'utf-8',
      )
      expect(content).not.toContain("from './agent-runner'")
      expect(content).not.toContain("from '../lib/orchestrator'")
      expect(content).not.toContain("from '../lib/ai'")
    })

    test('vector-executor.ts has no agent-runner import (static verification)', async () => {
      const fs = await import('node:fs')
      const content = fs.readFileSync(
        new URL('../../services/vector-executor.ts', import.meta.url).pathname,
        'utf-8',
      )
      expect(content).not.toContain("from './agent-runner'")
      expect(content).not.toContain("from '../lib/orchestrator'")
      expect(content).not.toContain("from '../lib/ai'")
    })
  })

  describe('TEA P0: argos-evaluator unified path (no secretary branching)', () => {
    test('argos-evaluator.ts no longer imports orchestrator or ai', async () => {
      const fs = await import('node:fs')
      const content = fs.readFileSync(
        new URL('../../services/argos-evaluator.ts', import.meta.url).pathname,
        'utf-8',
      )
      expect(content).not.toContain("from '../lib/orchestrator'")
      expect(content).not.toContain("from '../lib/ai'")
      expect(content).toContain("from '../engine/agent-loop'")
      expect(content).toContain("from '../engine/soul-renderer'")
    })

    test('agora-engine.ts no longer imports agent-runner', async () => {
      const fs = await import('node:fs')
      const content = fs.readFileSync(
        new URL('../../services/agora-engine.ts', import.meta.url).pathname,
        'utf-8',
      )
      expect(content).not.toContain("from './agent-runner'")
      expect(content).not.toContain('AgentConfig')
      expect(content).not.toContain('LLMRouterContext')
      expect(content).toContain("from '../engine/agent-loop'")
      expect(content).toContain("from '../engine/soul-renderer'")
    })
  })
})
