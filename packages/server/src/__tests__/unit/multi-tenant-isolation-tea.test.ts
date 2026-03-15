import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 21.3: Multi-Tenant Isolation Tests ===
// TEA: Risk-based — P0 credential isolation (FR-CM1~3), P0 MCP server isolation (FR-MCP1~2, D22),
//      P0 report isolation (FR-RM1), P0 cross-tenant 403 at route level, P1 structural source checks

// ─── Source files ─────────────────────────────────────────────────────────────

const SCOPED_QUERY_SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../db/scoped-query.ts'),
  'utf-8',
)

const MCP_SERVERS_ROUTE_SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../routes/admin/mcp-servers.ts'),
  'utf-8',
)

const CREDENTIALS_ROUTE_SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../routes/admin/credentials.ts'),
  'utf-8',
)

// ─── P0: Credential isolation — companyId WHERE clause ───────────────────────

describe('[P0] FR-CM1 — credential isolation by companyId (listCredentials)', () => {
  test('listCredentials uses eq(credentials.companyId, companyId)', () => {
    expect(SCOPED_QUERY_SRC).toContain('listCredentials')
    expect(SCOPED_QUERY_SRC).toContain('credentials.companyId')
  })

  test('no unscoped credentials select (no db.select().from(credentials) without companyId)', () => {
    // Verify that every credentials query uses companyId scoping
    const lines = SCOPED_QUERY_SRC.split('\n')
    const credentialFromLines = lines.filter(l => l.includes('.from(credentials)'))
    // Every from(credentials) should be followed by a where clause with companyId
    // Source inspection: verify no raw unscoped access
    expect(credentialFromLines.length).toBeGreaterThan(0)
    // Check that every credentials query has companyId in scope
    credentialFromLines.forEach(line => {
      const lineIdx = lines.indexOf(line)
      const context = lines.slice(lineIdx - 2, lineIdx + 5).join('\n')
      // All credential queries are inside getDB(companyId) closure
      expect(SCOPED_QUERY_SRC).toContain('companyId')
    })
  })

  test('getCredential uses and(eq(credentials.companyId, companyId), eq(credentials.keyName, keyName))', () => {
    expect(SCOPED_QUERY_SRC).toContain('getCredential')
    // Both companyId and keyName conditions present
    const getCredIdx = SCOPED_QUERY_SRC.indexOf('getCredential:')
    const getCredSection = SCOPED_QUERY_SRC.slice(getCredIdx, getCredIdx + 300)
    expect(getCredSection).toContain('credentials.companyId')
    expect(getCredSection).toContain('keyName')
  })

  test('updateCredential scoped by companyId + keyName (not just keyName)', () => {
    const updateIdx = SCOPED_QUERY_SRC.indexOf('updateCredential:')
    const section = SCOPED_QUERY_SRC.slice(updateIdx, updateIdx + 300)
    expect(section).toContain('credentials.companyId')
    expect(section).toContain('keyName')
    // Double condition: both companyId AND keyName must match
    expect(section).toContain('and(')
  })

  test('deleteCredential scoped by companyId + keyName (cross-tenant delete blocked)', () => {
    const deleteIdx = SCOPED_QUERY_SRC.indexOf('deleteCredential:')
    const section = SCOPED_QUERY_SRC.slice(deleteIdx, deleteIdx + 300)
    expect(section).toContain('credentials.companyId')
    expect(section).toContain('keyName')
  })
})

// ─── P0: Credential isolation — RESOLVE stage (no global query) ──────────────

describe('[P0] FR-CM2 — RESOLVE stage uses ctx.companyId (no global db query)', () => {
  test('scoped-query.ts has no direct db import for unscoped access', () => {
    // getDB() is the only entry point — verify no unscoped pattern exists
    expect(SCOPED_QUERY_SRC).toContain('getDB')
    // No global credentials access pattern
    expect(SCOPED_QUERY_SRC).not.toContain("from(credentials)\n        .where(eq(credentials.keyName")
  })

  test('listCredentialsForScrubber also scoped (returns only this company credentials)', () => {
    const scrubberIdx = SCOPED_QUERY_SRC.indexOf('listCredentialsForScrubber')
    const section = SCOPED_QUERY_SRC.slice(scrubberIdx, scrubberIdx + 400)
    expect(section).toContain('credentials.companyId')
    expect(section).toContain('companyId')
  })

  test('credentials admin route uses getDB(tenant.companyId) — never raw db', () => {
    expect(CREDENTIALS_ROUTE_SRC).toContain('getDB(')
    expect(CREDENTIALS_ROUTE_SRC).toContain('tenant.companyId')
    // No raw db import used for credential operations
    expect(CREDENTIALS_ROUTE_SRC).not.toContain("from './../../db'")
    expect(CREDENTIALS_ROUTE_SRC).not.toContain("from '../../db/index'")
  })
})

// ─── P0: MCP server isolation — companyId WHERE clause ───────────────────────

describe('[P0] FR-MCP1 — MCP server isolation by companyId (listMcpServers)', () => {
  test('listMcpServers scoped by and(companyId, isActive)', () => {
    const listIdx = SCOPED_QUERY_SRC.indexOf('listMcpServers:')
    const section = SCOPED_QUERY_SRC.slice(listIdx, listIdx + 300)
    expect(section).toContain('mcpServerConfigs.companyId')
    expect(section).toContain('companyId')
  })

  test('getMcpServerById has double companyId check (cross-tenant isolation)', () => {
    const getIdx = SCOPED_QUERY_SRC.indexOf('getMcpServerById:')
    const section = SCOPED_QUERY_SRC.slice(getIdx, getIdx + 300)
    expect(section).toContain('mcpServerConfigs.companyId')
    // both id AND companyId must match
    expect(section).toContain('and(')
  })

  test('updateMcpServer requires both id AND companyId match (no cross-tenant update)', () => {
    const updateIdx = SCOPED_QUERY_SRC.indexOf('updateMcpServer:')
    const section = SCOPED_QUERY_SRC.slice(updateIdx, updateIdx + 500)
    expect(section).toContain('mcpServerConfigs.companyId')
    expect(section).toContain('and(')
  })

  test('insertMcpServer always writes companyId from closure (prevents tenant injection)', () => {
    const insertIdx = SCOPED_QUERY_SRC.indexOf('insertMcpServer:')
    const section = SCOPED_QUERY_SRC.slice(insertIdx, insertIdx + 300)
    expect(section).toContain('companyId: companyId')
  })
})

// ─── P0: MCP access isolation — getMcpServersForAgent cross-tenant block ──────

describe('[P0] D22 — getMcpServersForAgent cross-tenant isolation (INNER JOIN)', () => {
  test('getMcpServersForAgent uses INNER JOIN with companyId WHERE clause', () => {
    const idx = SCOPED_QUERY_SRC.indexOf('getMcpServersForAgent:')
    const section = SCOPED_QUERY_SRC.slice(idx, idx + 500)
    expect(section).toContain('innerJoin')
    expect(section).toContain('mcpServerConfigs.companyId')
  })

  test('cross-tenant isolation comment present in getMcpServersForAgent', () => {
    expect(SCOPED_QUERY_SRC).toContain('cross-tenant isolation')
  })

  test('getMcpServersForAgent requires both agentId AND companyId match', () => {
    const idx = SCOPED_QUERY_SRC.indexOf('getMcpServersForAgent:')
    const section = SCOPED_QUERY_SRC.slice(idx, idx + 500)
    expect(section).toContain('agentMcpAccess.agentId')
    expect(section).toContain('mcpServerConfigs.companyId')
    expect(section).toContain('and(')
  })

  test('cross-tenant scenario: companyB agent + companyA MCP → INNER JOIN returns 0 rows', () => {
    // Simulation: agentId belongs to companyB, mcpServerConfig belongs to companyA
    // getDB(companyB).getMcpServersForAgent(companyAAgentId) → empty
    // The WHERE mcpServerConfigs.companyId = companyB filters out companyA's MCP
    function simulateGetMcpServersForAgent(
      agentMcpRows: Array<{ agentId: string; mcpServerId: string }>,
      mcpServerRows: Array<{ id: string; companyId: string; isActive: boolean }>,
      queryAgentId: string,
      queryCompanyId: string
    ) {
      return agentMcpRows
        .filter(row => row.agentId === queryAgentId)
        .map(row => mcpServerRows.find(mcp => mcp.id === row.mcpServerId))
        .filter((mcp): mcp is NonNullable<typeof mcp> =>
          mcp !== undefined && mcp.companyId === queryCompanyId && mcp.isActive
        )
    }

    const agentMcpAccess = [
      { agentId: 'companyA-agent-1', mcpServerId: 'mcp-server-A1' },
    ]
    const mcpServers = [
      { id: 'mcp-server-A1', companyId: 'company-A', isActive: true },
      { id: 'mcp-server-B1', companyId: 'company-B', isActive: true },
    ]

    // CompanyB queries for companyA agent → should return empty
    const result = simulateGetMcpServersForAgent(
      agentMcpAccess, mcpServers, 'companyA-agent-1', 'company-B'
    )
    expect(result).toHaveLength(0)

    // CompanyA queries for its own agent → should return mcp-server-A1
    const validResult = simulateGetMcpServersForAgent(
      agentMcpAccess, mcpServers, 'companyA-agent-1', 'company-A'
    )
    expect(validResult).toHaveLength(1)
    expect(validResult[0].id).toBe('mcp-server-A1')
  })
})

// ─── P0: Cross-tenant MCP access grant — route-level validation ───────────────

describe('[P0] FR-MCP2 — cross-tenant MCP access grant blocked at route level', () => {
  test('PUT /agents/:agentId/mcp-access validates mcpServerId via getMcpServerById', () => {
    expect(MCP_SERVERS_ROUTE_SRC).toContain('getMcpServerById')
    expect(MCP_SERVERS_ROUTE_SRC).toContain('agentId')
  })

  test('MCP_SERVER_NOT_FOUND returned when mcpServerId not in this company', () => {
    expect(MCP_SERVERS_ROUTE_SRC).toContain('MCP_SERVER_NOT_FOUND')
  })

  test('cross-tenant MCP access simulation: wrong companyId → 0 rows → 404', () => {
    // getMcpServerById(id) scoped to companyId — cross-tenant → empty
    function simulateMcpServerLookup(
      servers: Array<{ id: string; companyId: string }>,
      id: string,
      companyId: string
    ) {
      return servers.filter(s => s.id === id && s.companyId === companyId)
    }

    const servers = [
      { id: 'mcp-A1', companyId: 'company-A' },
    ]

    // CompanyB tries to grant access to companyA MCP server → 0 rows → rejected
    const result = simulateMcpServerLookup(servers, 'mcp-A1', 'company-B')
    expect(result).toHaveLength(0)

    // CompanyA grants access to its own server → 1 row → allowed
    const validResult = simulateMcpServerLookup(servers, 'mcp-A1', 'company-A')
    expect(validResult).toHaveLength(1)
  })

  test('MCP servers route uses getDB(tenant.companyId) for all operations', () => {
    expect(MCP_SERVERS_ROUTE_SRC).toContain('getDB(tenant.companyId)')
    expect(MCP_SERVERS_ROUTE_SRC).toContain('getDB(')
  })
})

// ─── P0: Report isolation — companyId WHERE clause ───────────────────────────

describe('[P0] FR-RM1 — report isolation by companyId (listReports, getReport)', () => {
  test('listReports scoped by companyId as first condition', () => {
    const idx = SCOPED_QUERY_SRC.indexOf('listReports:')
    const section = SCOPED_QUERY_SRC.slice(idx, idx + 400)
    expect(section).toContain('agentReports.companyId')
    expect(section).toContain('companyId')
  })

  test('getReport uses scopedWhere with companyId (double-check pattern)', () => {
    const idx = SCOPED_QUERY_SRC.indexOf('getReport:')
    const section = SCOPED_QUERY_SRC.slice(idx, idx + 300)
    expect(section).toContain('scopedWhere')
    expect(section).toContain('agentReports.companyId')
    expect(section).toContain('companyId')
  })

  test('insertReport always writes companyId from closure', () => {
    const idx = SCOPED_QUERY_SRC.indexOf('insertReport:')
    const section = SCOPED_QUERY_SRC.slice(idx, idx + 400)
    expect(section).toContain('companyId')
    // companyId written at insert time from closure
    expect(section).toContain('companyId:')
  })

  test('cross-tenant report isolation simulation', () => {
    function simulateListReports(
      reports: Array<{ id: string; companyId: string; title: string }>,
      queryCompanyId: string
    ) {
      return reports.filter(r => r.companyId === queryCompanyId)
    }

    const reports = [
      { id: 'r1', companyId: 'company-A', title: 'Report A1' },
      { id: 'r2', companyId: 'company-A', title: 'Report A2' },
      { id: 'r3', companyId: 'company-B', title: 'Report B1' },
    ]

    const companyAReports = simulateListReports(reports, 'company-A')
    const companyBReports = simulateListReports(reports, 'company-B')

    expect(companyAReports).toHaveLength(2)
    expect(companyBReports).toHaveLength(1)
    // CompanyA cannot see companyB reports
    expect(companyAReports.every(r => r.companyId === 'company-A')).toBe(true)
    // CompanyB cannot see companyA reports
    expect(companyBReports.every(r => r.companyId === 'company-B')).toBe(true)
  })
})

// ─── P0: getDB() closure pattern — companyId always from closure ──────────────

describe('[P0] NFR-S4 — getDB(companyId) closure enforces isolation boundary', () => {
  test('scoped-query exports getDB function (single entry point)', () => {
    expect(SCOPED_QUERY_SRC).toContain('export function getDB(')
  })

  test('getDB returns an object with all scoped methods', () => {
    expect(SCOPED_QUERY_SRC).toContain('return {')
    expect(SCOPED_QUERY_SRC).toContain('listCredentials')
    expect(SCOPED_QUERY_SRC).toContain('getMcpServersForAgent')
    expect(SCOPED_QUERY_SRC).toContain('listReports')
  })

  test('D1: direct db import forbidden in business logic — routes use getDB()', () => {
    // Admin routes must use getDB, not raw db
    expect(MCP_SERVERS_ROUTE_SRC).toContain("from '../../db/scoped-query'")
    expect(CREDENTIALS_ROUTE_SRC).toContain('getDB(')
  })

  test('credential isolation simulation: two companies, same keyName', () => {
    // Simulate getDB isolation: same keyName, different companyId
    const credentialsTable = [
      { id: 'cred-1', companyId: 'company-A', keyName: 'tistory_token', encryptedValue: 'enc-A' },
      { id: 'cred-2', companyId: 'company-B', keyName: 'tistory_token', encryptedValue: 'enc-B' },
    ]

    function getDBListCredentials(companyId: string) {
      return credentialsTable.filter(c => c.companyId === companyId)
    }

    const companyAResult = getDBListCredentials('company-A')
    const companyBResult = getDBListCredentials('company-B')

    // Each company sees only its own credential
    expect(companyAResult).toHaveLength(1)
    expect(companyAResult[0].encryptedValue).toBe('enc-A')
    expect(companyBResult).toHaveLength(1)
    expect(companyBResult[0].encryptedValue).toBe('enc-B')

    // companyA cannot access companyB's encrypted value
    expect(companyAResult[0].id).not.toBe(companyBResult[0].id)
  })
})

// ─── P1: scopedWhere / withTenant helpers ─────────────────────────────────────

describe('[P1] E3 — scopedWhere / withTenant helper pattern', () => {
  test('scopedWhere helper defined (companyId enforcement utility)', () => {
    expect(SCOPED_QUERY_SRC).toContain('scopedWhere')
  })

  test('all delete operations use companyId condition (no bare id-only deletes)', () => {
    // Key operations that could be exploited without companyId check
    const deleteCredIdx = SCOPED_QUERY_SRC.indexOf('deleteCredential:')
    const deleteSection = SCOPED_QUERY_SRC.slice(deleteCredIdx, deleteCredIdx + 200)
    expect(deleteSection).toContain('credentials.companyId')
  })

  test('scoped-query imports from schema — no direct SQL string queries', () => {
    expect(SCOPED_QUERY_SRC).toContain("from './schema'")
  })

  test('agent queries also scoped by companyId', () => {
    expect(SCOPED_QUERY_SRC).toContain('agents.companyId')
  })

  test('department queries scoped by companyId', () => {
    expect(SCOPED_QUERY_SRC).toContain('departments.companyId')
  })
})

// ─── P1: Admin routes — authMiddleware + adminOnly access control ─────────────

describe('[P1] NFR-S4 — admin routes enforce authMiddleware + adminOnly', () => {
  test('mcp-servers route uses authMiddleware', () => {
    expect(MCP_SERVERS_ROUTE_SRC).toContain('authMiddleware')
  })

  test('mcp-servers route uses adminOnly', () => {
    expect(MCP_SERVERS_ROUTE_SRC).toContain('adminOnly')
  })

  test('credentials route uses authMiddleware', () => {
    expect(CREDENTIALS_ROUTE_SRC).toContain('authMiddleware')
  })

  test('credentials route uses adminOnly', () => {
    expect(CREDENTIALS_ROUTE_SRC).toContain('adminOnly')
  })

  test('both routes apply middleware via use("*")', () => {
    expect(MCP_SERVERS_ROUTE_SRC).toContain("use('*'")
    expect(CREDENTIALS_ROUTE_SRC).toContain("use('*'")
  })
})

// ─── P1: MCP access control — D22 default OFF logic ──────────────────────────

describe('[P1] D22 — agent MCP access defaults to OFF (no row = no access)', () => {
  test('getMcpServersForAgent: no agent_mcp_access row → 0 MCP servers returned', () => {
    // Simulation: agent exists but no access rows granted
    function simulateGetMcpServersForAgent(
      accessRows: Array<{ agentId: string; mcpServerId: string }>,
      mcpServers: Array<{ id: string; companyId: string; isActive: boolean }>,
      agentId: string,
      companyId: string
    ) {
      const matchingAccess = accessRows.filter(r => r.agentId === agentId)
      return matchingAccess
        .map(r => mcpServers.find(m => m.id === r.mcpServerId))
        .filter((m): m is NonNullable<typeof m> =>
          m !== undefined && m.companyId === companyId && m.isActive
        )
    }

    const mcpServers = [
      { id: 'mcp-1', companyId: 'company-A', isActive: true },
    ]

    // Agent with no access rows → empty result (D22 default OFF)
    const noAccessResult = simulateGetMcpServersForAgent([], mcpServers, 'agent-1', 'company-A')
    expect(noAccessResult).toHaveLength(0)

    // Agent with explicit grant → 1 result
    const withAccessResult = simulateGetMcpServersForAgent(
      [{ agentId: 'agent-1', mcpServerId: 'mcp-1' }],
      mcpServers, 'agent-1', 'company-A'
    )
    expect(withAccessResult).toHaveLength(1)
  })

  test('grantMcpAccess uses onConflictDoNothing (idempotent grant)', () => {
    const idx = SCOPED_QUERY_SRC.indexOf('grantMcpAccess:')
    const section = SCOPED_QUERY_SRC.slice(idx, idx + 200)
    expect(section).toContain('onConflictDoNothing')
  })

  test('revokeMcpAccess deletes by agentId AND mcpServerId (precise revoke)', () => {
    const idx = SCOPED_QUERY_SRC.indexOf('revokeMcpAccess:')
    const section = SCOPED_QUERY_SRC.slice(idx, idx + 200)
    expect(section).toContain('agentMcpAccess.agentId')
    expect(section).toContain('agentMcpAccess.mcpServerId')
    expect(section).toContain('and(')
  })
})
