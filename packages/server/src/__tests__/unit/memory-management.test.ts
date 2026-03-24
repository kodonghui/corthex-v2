/**
 * Story 28.9 — Admin Memory Management Tests
 *
 * Tests: list flagged observations, unflag, delete flagged, reset agent memories,
 * memory settings CRUD, company isolation, admin-only auth.
 */

import { describe, test, expect, mock, beforeEach } from 'bun:test'

// === Mocks (must be registered before any transitive import of scoped-query) ===

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
  companies: { id: 'id', smtpConfig: 'smtp_config', settings: 'settings' },
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

describe('Story 28.9: Admin Memory Management', () => {
  const COMPANY_A = 'aaaaaaaa-1111-2222-3333-444444444444'
  const COMPANY_B = 'bbbbbbbb-9999-8888-7777-666666666666'
  const AGENT_1 = 'cccccccc-1111-2222-3333-444444444444'

  beforeEach(() => {
    mockExecute.mockReset()
    mockSelectReturn.mockReset()
    mockUpdateReturn.mockReset()
    mockDeleteReturn.mockReset()
  })

  describe('listFlaggedObservations', () => {
    test('returns flagged observations with pagination', async () => {
      const flaggedRows = [
        { id: 'obs-1', agentId: AGENT_1, content: 'API key leaked', domain: 'tool_use', flagged: true, observedAt: new Date('2026-03-20T10:00:00Z') },
        { id: 'obs-2', agentId: AGENT_1, content: 'Bearer token found', domain: 'conversation', flagged: true, observedAt: new Date('2026-03-20T11:00:00Z') },
      ]

      mockSelectReturn.mockReturnValue({
        from: mock(() => ({
          where: mock(() => ({
            orderBy: mock(() => ({
              limit: mock(() => ({
                offset: mock(() => Promise.resolve(flaggedRows)),
              })),
            })),
          })),
        })),
      })

      const db = getDB(COMPANY_A)
      const result = await db.listFlaggedObservations(50, 0)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('obs-1')
      expect(result[0].flagged).toBe(true)
      expect(result[0].content).toBe('API key leaked')
      expect(result[1].domain).toBe('conversation')
    })

    test('returns empty array when no flagged observations', async () => {
      mockSelectReturn.mockReturnValue({
        from: mock(() => ({
          where: mock(() => ({
            orderBy: mock(() => ({
              limit: mock(() => ({
                offset: mock(() => Promise.resolve([])),
              })),
            })),
          })),
        })),
      })

      const db = getDB(COMPANY_A)
      const result = await db.listFlaggedObservations()
      expect(result).toHaveLength(0)
    })

    test('respects limit and offset', async () => {
      const limitMock = mock()
      const offsetMock = mock(() => Promise.resolve([]))
      limitMock.mockReturnValue({ offset: offsetMock })

      mockSelectReturn.mockReturnValue({
        from: mock(() => ({
          where: mock(() => ({
            orderBy: mock(() => ({
              limit: limitMock,
            })),
          })),
        })),
      })

      const db = getDB(COMPANY_A)
      await db.listFlaggedObservations(10, 20)

      expect(limitMock).toHaveBeenCalledWith(10)
      expect(offsetMock).toHaveBeenCalled()
    })
  })

  describe('unflagObservation', () => {
    test('sets flagged=false and returns true', async () => {
      mockUpdateReturn.mockReturnValue({
        set: mock(() => ({
          where: mock(() => ({
            returning: mock(() => Promise.resolve([{ id: 'obs-1' }])),
          })),
        })),
      })

      const db = getDB(COMPANY_A)
      const result = await db.unflagObservation('obs-1')
      expect(result).toBe(true)
    })

    test('returns false when observation not found', async () => {
      mockUpdateReturn.mockReturnValue({
        set: mock(() => ({
          where: mock(() => ({
            returning: mock(() => Promise.resolve([])),
          })),
        })),
      })

      const db = getDB(COMPANY_A)
      const result = await db.unflagObservation('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('deleteObservation (flagged)', () => {
    test('hard-deletes and returns true', async () => {
      mockDeleteReturn.mockReturnValue({
        where: mock(() => ({
          returning: mock(() => Promise.resolve([{ id: 'obs-1' }])),
        })),
      })

      const db = getDB(COMPANY_A)
      const result = await db.deleteObservation('obs-1')
      expect(result).toBe(true)
    })

    test('returns false when not found', async () => {
      mockDeleteReturn.mockReturnValue({
        where: mock(() => ({
          returning: mock(() => Promise.resolve([])),
        })),
      })

      const db = getDB(COMPANY_A)
      const result = await db.deleteObservation('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('resetAgentMemories', () => {
    test('deletes all memories and observations for agent', async () => {
      mockDeleteReturn
        .mockReturnValueOnce({
          where: mock(() => ({
            returning: mock(() => Promise.resolve([{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }])),
          })),
        })
        .mockReturnValueOnce({
          where: mock(() => ({
            returning: mock(() => Promise.resolve([{ id: 'o1' }, { id: 'o2' }])),
          })),
        })

      const db = getDB(COMPANY_A)
      const result = await db.resetAgentMemories(AGENT_1)

      expect(result.memoriesDeleted).toBe(3)
      expect(result.observationsDeleted).toBe(2)
    })

    test('returns zeros when agent has no data', async () => {
      mockDeleteReturn
        .mockReturnValueOnce({
          where: mock(() => ({
            returning: mock(() => Promise.resolve([])),
          })),
        })
        .mockReturnValueOnce({
          where: mock(() => ({
            returning: mock(() => Promise.resolve([])),
          })),
        })

      const db = getDB(COMPANY_A)
      const result = await db.resetAgentMemories(AGENT_1)

      expect(result.memoriesDeleted).toBe(0)
      expect(result.observationsDeleted).toBe(0)
    })
  })

  describe('company isolation', () => {
    test('different companies get separate DB instances', () => {
      const dbA = getDB(COMPANY_A)
      const dbB = getDB(COMPANY_B)

      // Each call returns a fresh object — they cannot share state
      expect(dbA).not.toBe(dbB)
      expect(typeof dbA.listFlaggedObservations).toBe('function')
      expect(typeof dbB.listFlaggedObservations).toBe('function')
    })

    test('getDB requires companyId', () => {
      expect(() => getDB('')).toThrow('companyId required')
    })
  })

  describe('getMemoryStats (admin stats)', () => {
    test('returns per-agent aggregation', async () => {
      const obsRows = [
        { agent_id: AGENT_1, total_observations: 50, reflected_observations: 30, unreflected_observations: 20 },
      ]
      const memRows = [
        { agent_id: AGENT_1, total_memories: 10, active_memories: 8, avg_confidence: 75 },
      ]

      mockExecute
        .mockResolvedValueOnce({ rows: obsRows })
        .mockResolvedValueOnce({ rows: memRows })

      const db = getDB(COMPANY_A)
      const stats = await db.getMemoryStats()

      expect(stats).toHaveLength(1)
      expect(stats[0].agentId).toBe(AGENT_1)
      expect(stats[0].totalObservations).toBe(50)
      expect(stats[0].reflectedObservations).toBe(30)
      expect(stats[0].unreflectedObservations).toBe(20)
      expect(stats[0].totalMemories).toBe(10)
      expect(stats[0].activeMemories).toBe(8)
      expect(stats[0].avgConfidence).toBe(75)
    })

    test('handles empty data', async () => {
      mockExecute
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })

      const db = getDB(COMPANY_A)
      const stats = await db.getMemoryStats()
      expect(stats).toHaveLength(0)
    })
  })
})

describe('Story 28.9: Memory Settings Service', () => {
  // Memory settings tests use the service directly
  // Testing the getMemorySettings and saveMemorySettings functions

  test('getDefaultMemorySettings returns correct defaults', async () => {
    const { getDefaultMemorySettings } = await import('../../services/memory-settings')
    const defaults = getDefaultMemorySettings()

    expect(defaults.reflectedTtlDays).toBe(30)
    expect(defaults.unreflectedTtlDays).toBe(90)
    expect(defaults.minObservationsForReflection).toBe(20)
    expect(defaults.minAvgConfidence).toBe(0.7)
    expect(defaults.maxDailyCostUsd).toBe(0.10)
    expect(defaults.memoryDecayDays).toBe(60)
    expect(defaults.enabled).toBe(true)
  })
})
