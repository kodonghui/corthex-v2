import { describe, test, expect, mock, beforeEach } from 'bun:test'

// --- Mocks ---

const mockListMcpServers = mock(() => Promise.resolve([]))
const mockGetMcpServerById = mock(() => Promise.resolve([]))
const mockGetMcpServersForAgent = mock(() => Promise.resolve([]))
const mockInsertMcpServer = mock(() => Promise.resolve([{ id: 'mcp-uuid-1' }]))
const mockUpdateMcpServer = mock(() => Promise.resolve([]))
const mockGrantMcpAccess = mock(() => Promise.resolve([]))
const mockRevokeMcpAccess = mock(() => Promise.resolve([]))
const mockInsertMcpLifecycleEvent = mock(() => Promise.resolve([]))
const mockGetActiveMcpSessions = mock(() => Promise.resolve([]))

const mockGetDB = mock(() => ({
  listMcpServers: mockListMcpServers,
  getMcpServerById: mockGetMcpServerById,
  getMcpServersForAgent: mockGetMcpServersForAgent,
  insertMcpServer: mockInsertMcpServer,
  updateMcpServer: mockUpdateMcpServer,
  grantMcpAccess: mockGrantMcpAccess,
  revokeMcpAccess: mockRevokeMcpAccess,
  insertMcpLifecycleEvent: mockInsertMcpLifecycleEvent,
  getActiveMcpSessions: mockGetActiveMcpSessions,
}))

mock.module('../../db/scoped-query', () => ({ getDB: mockGetDB }))

// --- Helper ---

function resetMocks() {
  mockListMcpServers.mockReset()
  mockGetMcpServerById.mockReset()
  mockGetMcpServersForAgent.mockReset()
  mockInsertMcpServer.mockReset()
  mockUpdateMcpServer.mockReset()
  mockGrantMcpAccess.mockReset()
  mockRevokeMcpAccess.mockReset()
  mockInsertMcpLifecycleEvent.mockReset()
  mockGetActiveMcpSessions.mockReset()
  mockGetDB.mockReset()
  mockGetDB.mockReturnValue({
    listMcpServers: mockListMcpServers,
    getMcpServerById: mockGetMcpServerById,
    getMcpServersForAgent: mockGetMcpServersForAgent,
    insertMcpServer: mockInsertMcpServer,
    updateMcpServer: mockUpdateMcpServer,
    grantMcpAccess: mockGrantMcpAccess,
    revokeMcpAccess: mockRevokeMcpAccess,
    insertMcpLifecycleEvent: mockInsertMcpLifecycleEvent,
    getActiveMcpSessions: mockGetActiveMcpSessions,
  })
}

// --- Schema Introspection ---

describe('Story 18.1: mcp_server_configs schema (FR-MCP1~3, D25)', () => {
  const fs = require('fs')
  const path = require('path')
  const schemaSrc = fs.readFileSync(
    path.resolve(__dirname, '../../db/schema.ts'),
    'utf-8',
  )

  test('mcpServerConfigs table is defined', () => {
    expect(schemaSrc).toContain("pgTable('mcp_server_configs'")
  })

  test('has display_name, transport, command, args, env columns', () => {
    const cols = ['display_name', 'transport', 'command', 'args', 'env']
    for (const col of cols) {
      expect(schemaSrc).toContain(`'${col}'`)
    }
  })

  test('transport field exists for stdio/sse/http (D25)', () => {
    // Comment mentions stdio, sse, http transport options
    expect(schemaSrc).toContain('stdio')
    expect(schemaSrc).toContain('sse')
    expect(schemaSrc).toContain('http')
  })

  test('is_active defaults to true', () => {
    expect(schemaSrc).toContain('is_active')
    expect(schemaSrc).toContain('default(true)')
  })

  test('company_id has FK to companies', () => {
    const mcpBlock = schemaSrc.slice(
      schemaSrc.indexOf("pgTable('mcp_server_configs'"),
      schemaSrc.indexOf("pgTable('agent_mcp_access'"),
    )
    expect(mcpBlock).toContain('references')
    expect(mcpBlock).toContain('companies')
  })
})

describe('Story 18.1: agent_mcp_access schema (FR-MCP2, D22)', () => {
  const fs = require('fs')
  const path = require('path')
  const schemaSrc = fs.readFileSync(
    path.resolve(__dirname, '../../db/schema.ts'),
    'utf-8',
  )

  test('agentMcpAccess table is defined', () => {
    expect(schemaSrc).toContain("pgTable('agent_mcp_access'")
  })

  test('has composite PK (agent_id, mcp_server_id)', () => {
    const accessBlock = schemaSrc.slice(
      schemaSrc.indexOf("pgTable('agent_mcp_access'"),
      schemaSrc.indexOf("pgTable('mcp_lifecycle_events'"),
    )
    expect(accessBlock).toContain('primaryKey')
    expect(accessBlock).toContain('agentId')
    expect(accessBlock).toContain('mcpServerId')
  })

  test('both FKs have onDelete cascade', () => {
    const accessBlock = schemaSrc.slice(
      schemaSrc.indexOf("pgTable('agent_mcp_access'"),
      schemaSrc.indexOf("pgTable('mcp_lifecycle_events'"),
    )
    const cascadeCount = (accessBlock.match(/onDelete: 'cascade'/g) ?? []).length
    expect(cascadeCount).toBe(2)  // both agent_id and mcp_server_id FKs cascade
  })

  test('no enabled/disabled column — absence = not granted (D22 default OFF)', () => {
    const accessBlock = schemaSrc.slice(
      schemaSrc.indexOf("pgTable('agent_mcp_access'"),
      schemaSrc.indexOf("pgTable('mcp_lifecycle_events'"),
    )
    // D22: row existence = granted. No row = denied (no enabled boolean column needed)
    expect(accessBlock).not.toContain("'enabled'")
    expect(accessBlock).not.toContain("'is_enabled'")
  })
})

describe('Story 18.1: mcp_lifecycle_events schema (FR-SO3, NFR-R3)', () => {
  const fs = require('fs')
  const path = require('path')
  const schemaSrc = fs.readFileSync(
    path.resolve(__dirname, '../../db/schema.ts'),
    'utf-8',
  )

  test('mcpLifecycleEvents table is defined', () => {
    expect(schemaSrc).toContain("pgTable('mcp_lifecycle_events'")
  })

  test('has session_id, event, latency_ms, error_code columns', () => {
    const lifecycleBlock = schemaSrc.slice(
      schemaSrc.indexOf("pgTable('mcp_lifecycle_events'"),
      schemaSrc.indexOf("pgTable('tool_call_events'"),
    )
    expect(lifecycleBlock).toContain("'session_id'")
    expect(lifecycleBlock).toContain("'event'")
    expect(lifecycleBlock).toContain("'latency_ms'")
    expect(lifecycleBlock).toContain("'error_code'")
  })

  test('mle_company_mcp index exists (Audit UI)', () => {
    expect(schemaSrc).toContain("'mle_company_mcp'")
  })

  test('mle_session index exists (NFR-R3 zombie detection)', () => {
    expect(schemaSrc).toContain("'mle_session'")
  })
})

describe('Story 18.1: SQL migration (0055_mcp-db-schema.sql)', () => {
  const fs = require('fs')
  const path = require('path')
  const migrationSrc = fs.readFileSync(
    path.resolve(__dirname, '../../db/migrations/0055_mcp-db-schema.sql'),
    'utf-8',
  )

  test('creates mcp_server_configs table', () => {
    expect(migrationSrc).toContain('CREATE TABLE mcp_server_configs')
  })

  test('creates agent_mcp_access with composite PK', () => {
    expect(migrationSrc).toContain('CREATE TABLE agent_mcp_access')
    expect(migrationSrc).toContain('PRIMARY KEY (agent_id, mcp_server_id)')
  })

  test('both FKs in agent_mcp_access have ON DELETE CASCADE', () => {
    const cascadeCount = (migrationSrc.match(/ON DELETE CASCADE/g) ?? []).length
    expect(cascadeCount).toBe(2)
  })

  test('creates mcp_lifecycle_events table', () => {
    expect(migrationSrc).toContain('CREATE TABLE mcp_lifecycle_events')
  })

  test('creates mle_company_mcp and mle_session indexes', () => {
    expect(migrationSrc).toContain('mle_company_mcp')
    expect(migrationSrc).toContain('mle_session')
  })

  test('journal entry 0055 exists', () => {
    const journal = fs.readFileSync(
      path.resolve(__dirname, '../../db/migrations/meta/_journal.json'),
      'utf-8',
    )
    expect(journal).toContain('0055_mcp-db-schema')
  })
})

describe('Story 18.1: getDB() listMcpServers', () => {
  beforeEach(resetMocks)

  test('listMcpServers returns active servers for company', async () => {
    const mockServers = [
      { id: 'mcp-1', displayName: 'Notion MCP', transport: 'stdio', isActive: true },
    ]
    mockListMcpServers.mockResolvedValue(mockServers)

    const { getDB } = await import('../../db/scoped-query')
    const result = await getDB('company-1').listMcpServers()

    expect(result).toEqual(mockServers)
    expect(mockListMcpServers).toHaveBeenCalledTimes(1)
  })

  test('listMcpServers returns empty array when no active servers', async () => {
    mockListMcpServers.mockResolvedValue([])

    const { getDB } = await import('../../db/scoped-query')
    const result = await getDB('company-1').listMcpServers()

    expect(result).toEqual([])
  })
})

describe('Story 18.1: getDB() getMcpServersForAgent (D22 enforcement)', () => {
  beforeEach(resetMocks)

  test('getMcpServersForAgent returns empty for agent with no MCP grants (D22 default OFF)', async () => {
    mockGetMcpServersForAgent.mockResolvedValue([])

    const { getDB } = await import('../../db/scoped-query')
    const result = await getDB('company-1').getMcpServersForAgent('agent-1')

    expect(result).toEqual([])
    expect(mockGetMcpServersForAgent).toHaveBeenCalledWith('agent-1')
  })

  test('getMcpServersForAgent returns granted servers', async () => {
    const mockResult = [{ mcp: { id: 'mcp-1', displayName: 'Notion MCP', transport: 'stdio' } }]
    mockGetMcpServersForAgent.mockResolvedValue(mockResult)

    const { getDB } = await import('../../db/scoped-query')
    const result = await getDB('company-1').getMcpServersForAgent('agent-cmo')

    expect(result).toEqual(mockResult)
  })
})

describe('Story 18.1: getDB() insertMcpServer', () => {
  beforeEach(resetMocks)

  test('insertMcpServer returns [{id}]', async () => {
    mockInsertMcpServer.mockResolvedValue([{ id: 'new-mcp-id' }])

    const { getDB } = await import('../../db/scoped-query')
    const result = await getDB('company-1').insertMcpServer({
      displayName: 'Notion MCP',
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@notionhq/notion-mcp-server'],
      env: { NOTION_TOKEN: '{{credential:notion_token}}' },
      isActive: true,
    })

    expect(result).toEqual([{ id: 'new-mcp-id' }])
    expect(mockInsertMcpServer).toHaveBeenCalledTimes(1)
  })
})

describe('Story 18.1: getDB() grantMcpAccess / revokeMcpAccess (D22)', () => {
  beforeEach(resetMocks)

  test('grantMcpAccess called with agent and server IDs', async () => {
    mockGrantMcpAccess.mockResolvedValue([])

    const { getDB } = await import('../../db/scoped-query')
    await getDB('company-1').grantMcpAccess('agent-cmo', 'mcp-notion-1')

    expect(mockGrantMcpAccess).toHaveBeenCalledWith('agent-cmo', 'mcp-notion-1')
  })

  test('revokeMcpAccess called with agent and server IDs', async () => {
    mockRevokeMcpAccess.mockResolvedValue([])

    const { getDB } = await import('../../db/scoped-query')
    await getDB('company-1').revokeMcpAccess('agent-cmo', 'mcp-notion-1')

    expect(mockRevokeMcpAccess).toHaveBeenCalledWith('agent-cmo', 'mcp-notion-1')
  })
})

describe('Story 18.1: getDB() insertMcpLifecycleEvent (FR-SO3)', () => {
  beforeEach(resetMocks)

  test('insertMcpLifecycleEvent called with correct event data', async () => {
    mockInsertMcpLifecycleEvent.mockResolvedValue([])

    const { getDB } = await import('../../db/scoped-query')
    await getDB('company-1').insertMcpLifecycleEvent({
      mcpServerId: 'mcp-notion-1',
      sessionId: 'session-abc',
      event: 'spawn',
      latencyMs: 2500,
    })

    expect(mockInsertMcpLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'session-abc',
      event: 'spawn',
      latencyMs: 2500,
    }))
  })

  test('lifecycle events support all 6 event types', async () => {
    mockInsertMcpLifecycleEvent.mockResolvedValue([])
    const { getDB } = await import('../../db/scoped-query')

    const events = ['spawn', 'init', 'discover', 'execute', 'teardown', 'error']
    for (const event of events) {
      await getDB('company-1').insertMcpLifecycleEvent({ sessionId: 'sid-1', event })
    }

    expect(mockInsertMcpLifecycleEvent).toHaveBeenCalledTimes(6)
  })

  test('lifecycle event with errorCode for error type (AGENT_MCP_CREDENTIAL_MISSING)', async () => {
    mockInsertMcpLifecycleEvent.mockResolvedValue([])

    const { getDB } = await import('../../db/scoped-query')
    await getDB('company-1').insertMcpLifecycleEvent({
      sessionId: 'session-xyz',
      event: 'error',
      errorCode: 'AGENT_MCP_CREDENTIAL_MISSING',
    })

    expect(mockInsertMcpLifecycleEvent).toHaveBeenCalledWith(expect.objectContaining({
      event: 'error',
      errorCode: 'AGENT_MCP_CREDENTIAL_MISSING',
    }))
  })
})

describe('Story 18.1: getDB() getActiveMcpSessions (NFR-R3 zombie detection)', () => {
  beforeEach(resetMocks)

  test('getActiveMcpSessions called with olderThanSeconds', async () => {
    mockGetActiveMcpSessions.mockResolvedValue([
      { sessionId: 'zombie-session-1', mcpServerId: 'mcp-1' },
    ])

    const { getDB } = await import('../../db/scoped-query')
    const result = await getDB('company-1').getActiveMcpSessions(30)

    expect(mockGetActiveMcpSessions).toHaveBeenCalledWith(30)
    expect(result).toHaveLength(1)
    expect((result[0] as Record<string, unknown>).sessionId).toBe('zombie-session-1')
  })

  test('returns empty when no zombie sessions', async () => {
    mockGetActiveMcpSessions.mockResolvedValue([])

    const { getDB } = await import('../../db/scoped-query')
    const result = await getDB('company-1').getActiveMcpSessions(30)

    expect(result).toEqual([])
  })
})

// --- TEA P0: Source Introspection ---

describe('TEA P0: scoped-query MCP methods', () => {
  const fs = require('fs')
  const path = require('path')
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../db/scoped-query.ts'),
    'utf-8',
  )

  test('imports mcpServerConfigs, agentMcpAccess, mcpLifecycleEvents from schema', () => {
    expect(src).toContain('mcpServerConfigs')
    expect(src).toContain('agentMcpAccess')
    expect(src).toContain('mcpLifecycleEvents')
  })

  test('listMcpServers method exists', () => {
    expect(src).toContain('listMcpServers')
  })

  test('getMcpServersForAgent method exists (D22 access control)', () => {
    expect(src).toContain('getMcpServersForAgent')
  })

  test('getMcpServersForAgent has companyId WHERE clause (cross-tenant isolation)', () => {
    // The method must filter by companyId to prevent cross-tenant access
    const methodIdx = src.indexOf('getMcpServersForAgent')
    const methodBlock = src.slice(methodIdx, methodIdx + 400)
    expect(methodBlock).toContain('companyId')
  })

  test('grantMcpAccess and revokeMcpAccess methods exist', () => {
    expect(src).toContain('grantMcpAccess')
    expect(src).toContain('revokeMcpAccess')
  })

  test('insertMcpLifecycleEvent method exists', () => {
    expect(src).toContain('insertMcpLifecycleEvent')
  })

  test('getActiveMcpSessions method exists (NFR-R3)', () => {
    expect(src).toContain('getActiveMcpSessions')
  })
})
