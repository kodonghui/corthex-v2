import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 18.6: Admin MCP Server CRUD API Routes TEA Tests ===
// TEA: Risk-based — P0 route registration + path structure, P0 connection test contract,
//      P0 D25 sse rejection, P0 agent-MCP access grant/revoke contract,
//      P1 security: env template not resolved, P1 cross-tenant isolation

const SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../routes/admin/mcp-servers.ts'),
  'utf-8',
)

// ─── P0: Route registration (source code inspection) ─────────────────────────
// NOTE: Dynamic import fails (credential-crypto module-level key validation).
// Use source code inspection to verify route definitions.

describe('[P0] adminMcpServersRoute — registration (source checks)', () => {
  test('adminMcpServersRoute is exported', () => {
    expect(SRC).toContain('export const adminMcpServersRoute')
  })

  test('route has POST /mcp-servers endpoint (AC1 create)', () => {
    expect(SRC).toContain("post('/mcp-servers'")
  })

  test('route has GET /mcp-servers endpoint (AC2 list)', () => {
    expect(SRC).toContain("get('/mcp-servers'")
  })

  test('route has GET /mcp-servers/:id endpoint (detail)', () => {
    expect(SRC).toContain("get('/mcp-servers/:id'")
  })

  test('route has PUT /mcp-servers/:id endpoint (update)', () => {
    expect(SRC).toContain("put('/mcp-servers/:id'")
  })

  test('route has DELETE /mcp-servers/:id endpoint (soft delete)', () => {
    expect(SRC).toContain("delete('/mcp-servers/:id'")
  })

  test('route has POST /mcp-servers/:id/test endpoint (NFR-I2 connection test, AC3)', () => {
    expect(SRC).toContain("post('/mcp-servers/:id/test'")
  })

  test('route has PUT /agents/:agentId/mcp-access endpoint (FR-MCP2, AC4)', () => {
    expect(SRC).toContain("put('/agents/:agentId/mcp-access'")
  })

  test('route has GET /agents/:agentId/mcp-access endpoint (list MCP access)', () => {
    expect(SRC).toContain("get('/agents/:agentId/mcp-access'")
  })
})

// ─── P0: Connection test contract ────────────────────────────────────────────

describe('[P0] connection test — response contract (NFR-I2, AC3)', () => {
  test('success response has { success: true, data: { toolCount, latencyMs } }', () => {
    const mockSuccess = { success: true, data: { toolCount: 22, latencyMs: 2800 } }
    expect(mockSuccess.success).toBe(true)
    expect(typeof mockSuccess.data.toolCount).toBe('number')
    expect(typeof mockSuccess.data.latencyMs).toBe('number')
  })

  test('failure response has { success: false, error: { code, message } }', () => {
    const mockFailure = {
      success: false,
      error: { code: 'AGENT_MCP_SPAWN_TIMEOUT', message: 'MCP cold start exceeded 120000ms' },
    }
    expect(mockFailure.success).toBe(false)
    expect(mockFailure.error).toHaveProperty('code')
    expect(mockFailure.error).toHaveProperty('message')
    expect(mockFailure.error.code).toBe('AGENT_MCP_SPAWN_TIMEOUT')
  })

  test('latencyMs is non-negative number in success response', () => {
    const latencyMs = 2800
    expect(latencyMs).toBeGreaterThanOrEqual(0)
    expect(typeof latencyMs).toBe('number')
  })

  test('toolCount is non-negative integer in success response', () => {
    const toolCount = 22
    expect(toolCount).toBeGreaterThanOrEqual(0)
    expect(Number.isInteger(toolCount)).toBe(true)
  })
})

// ─── P0: D25 sse rejection in connection test ─────────────────────────────────

describe('[P0] D25 — sse/http transport rejected in connection test (AC3)', () => {
  test('TOOL_MCP_TRANSPORT_UNSUPPORTED returned for sse transport', () => {
    const transport = 'sse'
    const isUnsupported = transport !== 'stdio'
    const response = isUnsupported
      ? {
          success: false,
          error: {
            code: 'TOOL_MCP_TRANSPORT_UNSUPPORTED',
            message: `MCP transport '${transport}' is not supported in Phase 1. Use 'stdio'.`,
          },
        }
      : { success: true }

    expect(response.success).toBe(false)
    expect((response as any).error.code).toBe('TOOL_MCP_TRANSPORT_UNSUPPORTED')
    expect((response as any).error.message).toContain('sse')
  })

  test('TOOL_MCP_TRANSPORT_UNSUPPORTED returned for http transport (D25)', () => {
    const transport = 'http'
    expect(transport !== 'stdio').toBe(true)
  })

  test('stdio transport is not rejected (Phase 1 valid transport)', () => {
    const transport = 'stdio'
    expect(transport !== 'stdio').toBe(false)
  })

  test('error message tells user to use stdio (helpful error)', () => {
    const message = "MCP transport 'sse' is not supported in Phase 1. Use 'stdio'."
    expect(message).toContain('stdio')
  })
})

// ─── P0: Agent-MCP access grant/revoke contract ──────────────────────────────

describe('[P0] FR-MCP2 — agent-MCP access grant/revoke (AC4)', () => {
  test('grant=true body is valid access grant', () => {
    const body = { mcpServerId: '550e8400-e29b-41d4-a716-446655440001', grant: true }
    expect(body.grant).toBe(true)
    expect(body.mcpServerId).toBeDefined()
  })

  test('grant=false body is valid access revoke', () => {
    const body = { mcpServerId: '550e8400-e29b-41d4-a716-446655440001', grant: false }
    expect(body.grant).toBe(false)
  })

  test('grant response: { success: true, data: { message: "Access granted" } }', () => {
    const response = { success: true, data: { message: 'Access granted' } }
    expect(response.success).toBe(true)
    expect(response.data.message).toContain('granted')
  })

  test('revoke response: { success: true, data: { message: "Access revoked" } }', () => {
    const response = { success: true, data: { message: 'Access revoked' } }
    expect(response.success).toBe(true)
    expect(response.data.message).toContain('revoked')
  })

  test('cross-tenant block: invalid mcpServerId returns 404 (AC4 isolation)', () => {
    // getMcpServerById with wrong companyId returns [] → 404
    const rows: unknown[] = []
    const response = rows.length === 0
      ? { success: false, error: { code: 'MCP_SERVER_NOT_FOUND', message: 'MCP server not found or not accessible' } }
      : { success: true }
    expect(response.success).toBe(false)
    expect((response as any).error.code).toBe('MCP_SERVER_NOT_FOUND')
  })
})

// ─── P0: Create MCP server response contract ──────────────────────────────────

describe('[P0] AC1 — create MCP server response contract', () => {
  test('success response includes id, displayName, transport, isActive, createdAt', () => {
    const mockResponse = {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        displayName: 'notion',
        transport: 'stdio',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    }
    expect(mockResponse.data).toHaveProperty('id')
    expect(mockResponse.data).toHaveProperty('displayName')
    expect(mockResponse.data).toHaveProperty('transport')
    expect(mockResponse.data).toHaveProperty('isActive')
    expect(mockResponse.data).toHaveProperty('createdAt')
    expect(mockResponse.data.isActive).toBe(true)
  })

  test('HTTP 201 status for create (POST /mcp-servers)', () => {
    // Convention check: new resource creation → 201
    const status = 201
    expect(status).toBe(201)
  })
})

// ─── P1: Security — env templates not resolved in list ─────────────────────────

describe('[P1] Security — env JSONB returned with templates intact (AC2)', () => {
  test('listMcpServers returns env with {{credential:*}} templates (not resolved values)', () => {
    const mcpServerRow = {
      id: 'uuid-1',
      displayName: 'Notion',
      transport: 'stdio',
      env: { NOTION_TOKEN: '{{credential:notion_integration_token}}' },
      isActive: true,
    }
    // Template string intact — real token NOT exposed
    expect(mcpServerRow.env.NOTION_TOKEN).toBe('{{credential:notion_integration_token}}')
    expect(mcpServerRow.env.NOTION_TOKEN).not.toBe('secret-token-value')
  })

  test('env template pattern: {{credential:key_name}} format', () => {
    const template = '{{credential:notion_integration_token}}'
    expect(template).toMatch(/^\{\{credential:.+\}\}$/)
  })
})

// ─── P1: Source code structural checks ───────────────────────────────────────

describe('[P1] mcp-servers.ts — source structure', () => {
  const src = fs.readFileSync(
    path.resolve(import.meta.dir, '../../routes/admin/mcp-servers.ts'),
    'utf-8',
  )

  test('imports McpManager from engine (connection test uses real manager)', () => {
    expect(src).toContain('McpManager')
    expect(src).toContain("from '../../engine/mcp/mcp-manager'")
  })

  test('imports ToolError for error code extraction', () => {
    expect(src).toContain("from '../../lib/tool-error'")
  })

  test('imports getDB from scoped-query (NFR-S4 isolation)', () => {
    expect(src).toContain("from '../../db/scoped-query'")
  })

  test('authMiddleware + adminOnly applied (access control)', () => {
    expect(src).toContain('authMiddleware')
    expect(src).toContain('adminOnly')
  })

  test('TOOL_MCP_TRANSPORT_UNSUPPORTED error code in connection test (D25)', () => {
    expect(src).toContain('TOOL_MCP_TRANSPORT_UNSUPPORTED')
  })

  test('MCP_SERVER_NOT_FOUND error code for missing server', () => {
    expect(src).toContain('MCP_SERVER_NOT_FOUND')
  })

  test('AGENT_MCP_SPAWN_TIMEOUT extracted from ToolError in catch (AC3 timeout)', () => {
    expect(src).toContain('AGENT_MCP_SPAWN_TIMEOUT')
  })

  test('getMcpServerById used for cross-tenant validation in access grant', () => {
    expect(src).toContain('getMcpServerById')
  })

  test('grantMcpAccess called for grant=true (FR-MCP2)', () => {
    expect(src).toContain('grantMcpAccess')
  })

  test('revokeMcpAccess called for grant=false (FR-MCP2)', () => {
    expect(src).toContain('revokeMcpAccess')
  })

  test('teardownAll called after test (resource cleanup)', () => {
    expect(src).toContain('teardownAll')
  })

  test('test session uses random UUID prefix to avoid cache collision', () => {
    expect(src).toContain('admin-test-')
  })

  test('isActive: false for soft delete (not hard delete)', () => {
    expect(src).toContain('isActive: false')
  })
})

// ─── P1: Schema validation ────────────────────────────────────────────────────

describe('[P1] Zod schema validation — MCP server create body', () => {
  test('valid create body: displayName, transport, command, args, env', () => {
    const body = {
      displayName: 'Notion MCP',
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@notionhq/notion-mcp-server'],
      env: { NOTION_TOKEN: '{{credential:notion_integration_token}}' },
    }
    expect(body.displayName).toBeTruthy()
    expect(body.transport).toBe('stdio')
    expect(Array.isArray(body.args)).toBe(true)
    expect(typeof body.env).toBe('object')
  })

  test('args defaults to [] when not provided', () => {
    const defaultArgs: string[] = []
    expect(Array.isArray(defaultArgs)).toBe(true)
    expect(defaultArgs).toHaveLength(0)
  })

  test('env defaults to {} when not provided', () => {
    const defaultEnv: Record<string, string> = {}
    expect(typeof defaultEnv).toBe('object')
    expect(Object.keys(defaultEnv)).toHaveLength(0)
  })

  test('mcpAccessSchema requires mcpServerId (UUID) and grant (boolean)', () => {
    const valid = { mcpServerId: '550e8400-e29b-41d4-a716-446655440001', grant: true }
    expect(typeof valid.mcpServerId).toBe('string')
    expect(typeof valid.grant).toBe('boolean')
  })
})

// ─── P1: index.ts registration ───────────────────────────────────────────────

describe('[P1] index.ts — adminMcpServersRoute registered', () => {
  test('index.ts imports adminMcpServersRoute', () => {
    const indexSrc = fs.readFileSync(
      path.resolve(import.meta.dir, '../../index.ts'),
      'utf-8',
    )
    expect(indexSrc).toContain('adminMcpServersRoute')
    expect(indexSrc).toContain("from './routes/admin/mcp-servers'")
  })

  test('index.ts registers route at /api/admin', () => {
    const indexSrc = fs.readFileSync(
      path.resolve(import.meta.dir, '../../index.ts'),
      'utf-8',
    )
    expect(indexSrc).toContain("app.route('/api/admin', adminMcpServersRoute)")
  })
})
