/**
 * routes/admin/mcp-servers.ts — Admin MCP Server CRUD & Connection Test (FR-MCP1~3, D25)
 *
 * Story 18.6: POST/GET/PUT/DELETE /admin/mcp-servers
 *             POST /admin/mcp-servers/:id/test (3-way handshake connection test, NFR-I2)
 *             PUT  /admin/agents/:agentId/mcp-access (grant/revoke agent MCP access, FR-MCP2)
 *
 * D25: 'sse'/'http' transport → TOOL_MCP_TRANSPORT_UNSUPPORTED in connection test
 * NFR-I2: Connection test validates SPAWN → INIT → DISCOVER 3-way handshake
 */
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { getDB } from '../../db/scoped-query'
import { McpManager } from '../../engine/mcp/mcp-manager'
import { ToolError } from '../../lib/tool-error'
import type { AppEnv } from '../../types'

export const adminMcpServersRoute = new Hono<AppEnv>()

adminMcpServersRoute.use('*', authMiddleware, adminOnly)

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createMcpServerSchema = z.object({
  displayName: z.string().min(1).max(255),
  transport:   z.string().min(1),  // 'stdio' | 'sse' | 'http'
  command:     z.string().optional().nullable(),
  args:        z.array(z.string()).optional().default([]),
  env:         z.record(z.string()).optional().default({}),
})

const updateMcpServerSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  transport:   z.string().optional(),
  command:     z.string().optional().nullable(),
  args:        z.array(z.string()).optional(),
  env:         z.record(z.string()).optional(),
  isActive:    z.boolean().optional(),
})

const mcpAccessSchema = z.object({
  mcpServerId: z.string().uuid(),
  grant:       z.boolean(),  // true = grant, false = revoke
})

// ─── MCP Server CRUD ─────────────────────────────────────────────────────────

// POST /api/admin/mcp-servers — register new MCP server (FR-MCP1, AC1)
adminMcpServersRoute.post('/mcp-servers', zValidator('json', createMcpServerSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  const [row] = await getDB(tenant.companyId).insertMcpServer({
    displayName: body.displayName,
    transport: body.transport,
    command: body.command ?? null,
    args: body.args,
    env: body.env,
  })

  return c.json({
    success: true,
    data: {
      id: row!.id,
      displayName: body.displayName,
      transport: body.transport,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  }, 201)
})

// GET /api/admin/mcp-servers — list all active MCP servers (AC2)
// Returns env JSONB with {{credential:*}} templates intact (NOT resolved — security)
adminMcpServersRoute.get('/mcp-servers', async (c) => {
  const tenant = c.get('tenant')
  const rows = await getDB(tenant.companyId).listMcpServers()
  return c.json({ success: true, data: rows })
})

// GET /api/admin/mcp-servers/:id — single MCP server detail
adminMcpServersRoute.get('/mcp-servers/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const rows = await getDB(tenant.companyId).getMcpServerById(id)
  if (!rows.length) {
    return c.json({ success: false, error: { code: 'MCP_SERVER_NOT_FOUND', message: 'MCP server not found' } }, 404)
  }
  return c.json({ success: true, data: rows[0] })
})

// PUT /api/admin/mcp-servers/:id — update MCP server config
adminMcpServersRoute.put('/mcp-servers/:id', zValidator('json', updateMcpServerSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  await getDB(tenant.companyId).updateMcpServer(id, body)
  return c.json({ success: true })
})

// DELETE /api/admin/mcp-servers/:id — soft delete (set isActive=false)
adminMcpServersRoute.delete('/mcp-servers/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  await getDB(tenant.companyId).updateMcpServer(id, { isActive: false })
  return c.json({ success: true })
})

// ─── Connection Test ──────────────────────────────────────────────────────────

// POST /api/admin/mcp-servers/:id/test — 3-way handshake connection test (NFR-I2, AC3)
adminMcpServersRoute.post('/mcp-servers/:id/test', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const rows = await getDB(tenant.companyId).getMcpServerById(id)
  if (!rows.length) {
    return c.json({ success: false, error: { code: 'MCP_SERVER_NOT_FOUND', message: 'MCP server not found' } }, 404)
  }

  const config = rows[0]!

  // D25: sse/http → TOOL_MCP_TRANSPORT_UNSUPPORTED immediately (no spawn)
  if (config.transport !== 'stdio') {
    return c.json({
      success: false,
      error: {
        code: 'TOOL_MCP_TRANSPORT_UNSUPPORTED',
        message: `MCP transport '${config.transport}' is not supported in Phase 1. Use 'stdio'.`,
      },
    }, 422)
  }

  // Run RESOLVE → SPAWN → INIT → DISCOVER using a disposable McpManager
  const testManager = new McpManager()
  const testSessionId = `admin-test-${crypto.randomUUID()}`
  const startTime = Date.now()

  try {
    const session = await testManager.getOrSpawnSession(testSessionId, id, tenant.companyId)
    const latencyMs = Date.now() - startTime
    const toolCount = session.tools.length

    // Clean up: tear down the test session (non-blocking)
    testManager.teardownAll(testSessionId, tenant.companyId).catch(() => {})

    return c.json({
      success: true,
      data: { toolCount, latencyMs },
    })
  } catch (err) {
    const code = err instanceof ToolError ? err.code : 'AGENT_MCP_SPAWN_TIMEOUT'
    const message = err instanceof Error ? err.message : 'Connection test failed'
    return c.json({
      success: false,
      error: { code, message },
    })
  }
})

// ─── Agent-MCP Access Matrix ──────────────────────────────────────────────────

// GET /api/admin/agents/:agentId/mcp-access — list MCP servers accessible to agent
adminMcpServersRoute.get('/agents/:agentId/mcp-access', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')
  const rows = await getDB(tenant.companyId).getMcpServersForAgent(agentId)
  const servers = rows.map(r => r.mcp)
  return c.json({ success: true, data: servers })
})

// PUT /api/admin/agents/:agentId/mcp-access — grant or revoke MCP access (FR-MCP2, AC4)
// Cross-tenant validation: both agentId and mcpServerId must belong to tenant.companyId
adminMcpServersRoute.put('/agents/:agentId/mcp-access', zValidator('json', mcpAccessSchema), async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')
  const { mcpServerId, grant } = c.req.valid('json')
  const db = getDB(tenant.companyId)

  // Cross-tenant validation: verify mcpServerId belongs to this company
  const mcpRows = await db.getMcpServerById(mcpServerId)
  if (!mcpRows.length) {
    return c.json({ success: false, error: { code: 'MCP_SERVER_NOT_FOUND', message: 'MCP server not found or not accessible' } }, 404)
  }

  if (grant) {
    await db.grantMcpAccess(agentId, mcpServerId)
    return c.json({ success: true, data: { message: 'Access granted' } })
  } else {
    await db.revokeMcpAccess(agentId, mcpServerId)
    return c.json({ success: true, data: { message: 'Access revoked' } })
  }
})
