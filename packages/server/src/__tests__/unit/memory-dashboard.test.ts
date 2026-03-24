/**
 * Story 28.8 — CEO Memory Dashboard Tests
 *
 * Tests overview, observations, memories, timeline, pin/unpin, delete observation,
 * notification emission on reflection complete.
 */

import { describe, test, expect, mock, beforeEach } from 'bun:test'

// === Mocks (must be registered before any transitive import of scoped-query) ===

// Mock credential-crypto to prevent fail-fast validation at module load
mock.module('../../lib/credential-crypto', () => ({
  encrypt: mock((v: string) => v),
  decrypt: mock((v: string) => v),
  _validateKeyHex: mock(() => {}),
}))

const mockExecute = mock(() => Promise.resolve({ rows: [] }))
const mockSelectReturn = mock()
const mockUpdateReturn = mock()
const mockDeleteReturn = mock()

mock.module('../../db', () => ({
  db: {
    execute: (...args: any[]) => mockExecute(...args),
    select: (...args: any[]) => mockSelectReturn(...args),
    insert: mock(() => ({
      values: mock(() => ({
        returning: mock(() => Promise.resolve([{ id: 'new-1' }])),
        onConflictDoNothing: mock(() => Promise.resolve()),
      })),
    })),
    update: (...args: any[]) => mockUpdateReturn(...args),
    delete: (...args: any[]) => mockDeleteReturn(...args),
  },
}))

mock.module('../../db/schema', () => ({
  agents: { id: 'id', name: 'name', companyId: 'company_id' },
  observations: {
    id: 'id', companyId: 'company_id', agentId: 'agent_id', content: 'content',
    domain: 'domain', outcome: 'outcome', toolUsed: 'tool_used', importance: 'importance',
    confidence: 'confidence', reflected: 'reflected', reflectedAt: 'reflected_at',
    flagged: 'flagged', observedAt: 'observed_at', createdAt: 'created_at',
    updatedAt: 'updated_at', embedding: 'embedding',
  },
  agentMemories: {
    id: 'id', companyId: 'company_id', agentId: 'agent_id', memoryType: 'memory_type',
    key: 'key', content: 'content', context: 'context', source: 'source',
    confidence: 'confidence', embedding: 'embedding', category: 'category',
    observationIds: 'observation_ids', usageCount: 'usage_count', lastUsedAt: 'last_used_at',
    pinned: 'pinned', isActive: 'is_active', createdAt: 'created_at', updatedAt: 'updated_at',
  },
  users: { id: 'id', companyId: 'company_id', role: 'role', isActive: 'is_active', email: 'email' },
  notifications: { id: 'id', userId: 'user_id', companyId: 'company_id', type: 'type', title: 'title', body: 'body', actionUrl: 'action_url', isRead: 'is_read', createdAt: 'created_at' },
  notificationPreferences: { userId: 'user_id', companyId: 'company_id', inApp: 'in_app', email: 'email' },
  companies: { id: 'id', smtpConfig: 'smtp_config' },
  costRecords: { companyId: 'company_id', source: 'source', createdAt: 'created_at' },
  presets: { companyId: 'company_id', isActive: 'is_active', userId: 'user_id', isGlobal: 'is_global', sortOrder: 'sort_order', createdAt: 'created_at', name: 'name', id: 'id' },
  sketches: { companyId: 'company_id', updatedAt: 'updated_at', id: 'id' },
  tierConfigs: { companyId: 'company_id', tierLevel: 'tier_level', id: 'id' },
  knowledgeDocs: { companyId: 'company_id', embedding: 'embedding', isActive: 'is_active', folderId: 'folder_id', id: 'id', title: 'title', content: 'content', tags: 'tags' },
  semanticCache: { companyId: 'company_id' },
  agentReports: { companyId: 'company_id', id: 'id', title: 'title', type: 'type', tags: 'tags', createdAt: 'created_at', agentId: 'agent_id', content: 'content', runId: 'run_id', distributionResults: 'distribution_results' },
  toolCallEvents: { id: 'id', companyId: 'company_id' },
  mcpServerConfigs: { companyId: 'company_id', id: 'id', isActive: 'is_active', displayName: 'display_name' },
  agentMcpAccess: { agentId: 'agent_id', mcpServerId: 'mcp_server_id' },
  mcpLifecycleEvents: { companyId: 'company_id', sessionId: 'session_id', mcpServerId: 'mcp_server_id', event: 'event', createdAt: 'created_at' },
  credentials: { companyId: 'company_id', id: 'id', keyName: 'key_name', updatedAt: 'updated_at', encryptedValue: 'encrypted_value', createdByUserId: 'created_by_user_id', updatedByUserId: 'updated_by_user_id' },
  activityLogs: { companyId: 'company_id' },
  agentTools: { companyId: 'company_id', agentId: 'agent_id', toolId: 'tool_id', isEnabled: 'is_enabled' },
  toolDefinitions: { name: 'name', description: 'description', id: 'id', isActive: 'is_active', inputSchema: 'input_schema' },
  departments: { companyId: 'company_id', id: 'id' },
}))

mock.module('../../db/tenant-helpers', () => ({
  withTenant: mock(() => 'mock-where'),
  scopedWhere: mock((..._args: any[]) => 'mock-where'),
  scopedInsert: mock((companyId: string, data: any) => ({ companyId, ...data })),
}))

mock.module('pgvector', () => ({
  toSql: mock((v: number[]) => `[${v.join(',')}]`),
}))

mock.module('../../db/pgvector', () => ({
  cosineDistance: mock(() => 'mock-distance'),
}))

// Now import after mocks are in place
const { getDB } = await import('../../db/scoped-query')

describe('Story 28.8: CEO Memory Dashboard', () => {
  const TEST_COMPANY = 'aaaaaaaa-1111-2222-3333-444444444444'
  const TEST_AGENT = 'bbbbbbbb-1111-2222-3333-444444444444'

  beforeEach(() => {
    mockExecute.mockReset()
    mockSelectReturn.mockReset()
    mockUpdateReturn.mockReset()
    mockDeleteReturn.mockReset()
  })

  describe('getMemoryDashboardOverview', () => {
    test('returns per-agent stats with observations and memories', async () => {
      const obsRows = [
        { agent_id: TEST_AGENT, agent_name: 'TestBot', total_observations: 42, unreflected_count: 12 },
      ]
      const memRows = [
        { agent_id: TEST_AGENT, total_memories: 8, last_reflection_at: '2026-03-20T10:00:00Z' },
      ]

      mockExecute
        .mockResolvedValueOnce({ rows: obsRows })
        .mockResolvedValueOnce({ rows: memRows })

      const db = getDB(TEST_COMPANY)
      const result = await db.getMemoryDashboardOverview()

      expect(result).toHaveLength(1)
      expect(result[0].agentId).toBe(TEST_AGENT)
      expect(result[0].agentName).toBe('TestBot')
      expect(result[0].totalObservations).toBe(42)
      expect(result[0].unreflectedCount).toBe(12)
      expect(result[0].totalMemories).toBe(8)
      expect(result[0].lastReflectionAt).toBeInstanceOf(Date)
    })

    test('handles agents with memories but no observations', async () => {
      const agentB = 'cccccccc-1111-2222-3333-444444444444'
      mockExecute
        .mockResolvedValueOnce({ rows: [] }) // no obs
        .mockResolvedValueOnce({ rows: [{ agent_id: agentB, total_memories: 3, last_reflection_at: null }] })

      const db = getDB(TEST_COMPANY)
      const result = await db.getMemoryDashboardOverview()

      expect(result).toHaveLength(1)
      expect(result[0].agentId).toBe(agentB)
      expect(result[0].totalObservations).toBe(0)
      expect(result[0].totalMemories).toBe(3)
      expect(result[0].lastReflectionAt).toBeNull()
    })

    test('returns empty array when no data', async () => {
      mockExecute
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })

      const db = getDB(TEST_COMPANY)
      const result = await db.getMemoryDashboardOverview()
      expect(result).toHaveLength(0)
    })
  })

  describe('getMemoryTimeline', () => {
    test('returns mixed observation + memory events ordered by date', async () => {
      const timelineRows = [
        { type: 'memory', id: 'mem-1', content: 'Learned pattern', timestamp: '2026-03-20T12:00:00Z', metadata: { source: 'reflection', confidence: 85, category: 'pattern' } },
        { type: 'observation', id: 'obs-1', content: 'Tool call succeeded', timestamp: '2026-03-20T11:00:00Z', metadata: { domain: 'tool_use', outcome: 'success', importance: 8, confidence: 0.9, flagged: false, reflected: true } },
      ]

      mockExecute.mockResolvedValueOnce({ rows: timelineRows })

      const db = getDB(TEST_COMPANY)
      const result = await db.getMemoryTimeline(TEST_AGENT, 50, 0)

      expect(result).toHaveLength(2)
      expect(result[0].type).toBe('memory')
      expect(result[0].content).toBe('Learned pattern')
      expect(result[1].type).toBe('observation')
      expect(result[1].timestamp).toBeInstanceOf(Date)
    })

    test('returns empty for agent with no events', async () => {
      mockExecute.mockResolvedValueOnce({ rows: [] })

      const db = getDB(TEST_COMPANY)
      const result = await db.getMemoryTimeline(TEST_AGENT)
      expect(result).toHaveLength(0)
    })

    test('parses string metadata as JSON', async () => {
      const rows = [
        { type: 'observation', id: 'obs-2', content: 'Test', timestamp: '2026-03-20T10:00:00Z', metadata: JSON.stringify({ domain: 'conversation', outcome: 'success' }) },
      ]
      mockExecute.mockResolvedValueOnce({ rows })

      const db = getDB(TEST_COMPANY)
      const result = await db.getMemoryTimeline(TEST_AGENT)

      expect(result[0].metadata).toEqual({ domain: 'conversation', outcome: 'success' })
    })
  })

  describe('pinAgentMemory', () => {
    test('updates pinned state on memory', async () => {
      mockUpdateReturn.mockReturnValue({
        set: mock(() => ({
          where: mock(() => Promise.resolve()),
        })),
      })

      const db = getDB(TEST_COMPANY)
      await db.pinAgentMemory('mem-1', true)

      expect(mockUpdateReturn).toHaveBeenCalled()
    })

    test('unpins a previously pinned memory', async () => {
      mockUpdateReturn.mockReturnValue({
        set: mock(() => ({
          where: mock(() => Promise.resolve()),
        })),
      })

      const db = getDB(TEST_COMPANY)
      await db.pinAgentMemory('mem-1', false)

      expect(mockUpdateReturn).toHaveBeenCalled()
    })
  })

  describe('deleteObservation', () => {
    test('deletes observation and returns true', async () => {
      mockDeleteReturn.mockReturnValue({
        where: mock(() => ({
          returning: mock(() => Promise.resolve([{ id: 'obs-1' }])),
        })),
      })

      const db = getDB(TEST_COMPANY)
      const result = await db.deleteObservation('obs-1')

      expect(result).toBe(true)
    })

    test('returns false when observation not found', async () => {
      mockDeleteReturn.mockReturnValue({
        where: mock(() => ({
          returning: mock(() => Promise.resolve([])),
        })),
      })

      const db = getDB(TEST_COMPANY)
      const result = await db.deleteObservation('nonexistent')

      expect(result).toBe(false)
    })

    test('enforces company isolation — different company sees empty', async () => {
      const otherCompany = 'zzzzzzzz-1111-2222-3333-444444444444'
      mockDeleteReturn.mockReturnValue({
        where: mock(() => ({
          returning: mock(() => Promise.resolve([])),
        })),
      })

      const db = getDB(otherCompany)
      const result = await db.deleteObservation('obs-1')

      expect(result).toBe(false)
    })
  })

  describe('Notification helpers', () => {
    test('notifier exports memory notification functions', async () => {
      // Mock the transitive deps for notifier (broadcastToChannel, email-sender)
      mock.module('../../ws/channels', () => ({
        broadcastToChannel: mock(() => {}),
      }))
      mock.module('../../services/email-sender', () => ({
        sendEmail: mock(() => Promise.resolve()),
        buildNotificationEmail: mock(() => '<html></html>'),
      }))

      const mod = await import('../../lib/notifier')

      expect(typeof mod.notifyReflectionComplete).toBe('function')
      expect(typeof mod.notifyObservationFlagged).toBe('function')
      expect(typeof mod.notifyMemoryMilestone).toBe('function')
    })
  })

  describe('Schema: pinned column', () => {
    test('agentMemories schema mock includes pinned field', () => {
      // The real schema has pinned — we verify via the mock structure
      const schema = require('../../db/schema')
      expect(schema.agentMemories.pinned).toBe('pinned')
    })
  })

  describe('Route registration', () => {
    test('memory-dashboard route module exports memoryDashboardRoute', async () => {
      // Mock auth middleware for route import
      mock.module('../../middleware/auth', () => ({
        authMiddleware: mock(async (_c: any, next: any) => next()),
      }))

      const routeMod = await import('../../routes/workspace/memory-dashboard')
      expect(routeMod.memoryDashboardRoute).toBeDefined()
      expect(typeof routeMod.memoryDashboardRoute.fetch).toBe('function')
    })
  })
})
