/**
 * Story 28.8 — CEO Memory Dashboard API Routes
 *
 * Dashboard endpoints for viewing agent observations, memories, and timeline events.
 * Uses workspace auth pattern (authMiddleware + tenant isolation via getDB).
 */

import { Hono } from 'hono'
import { eq, and, desc, sql, type SQL } from 'drizzle-orm'
import { db } from '../../db'
import { agents, observations, agentMemories } from '../../db/schema'
import { getDB } from '../../db/scoped-query'
import { authMiddleware } from '../../middleware/auth'
import type { AppEnv } from '../../types'

export const memoryDashboardRoute = new Hono<AppEnv>()

memoryDashboardRoute.use('*', authMiddleware)

// GET /api/workspace/memory-dashboard/overview — per-agent summary stats
memoryDashboardRoute.get('/memory-dashboard/overview', async (c) => {
  const tenant = c.get('tenant')
  const companyId = tenant.companyId

  // Get per-agent observation stats
  const obsStatsRaw = await db.execute(sql`
    SELECT o.agent_id,
           a.name AS agent_name,
           COUNT(*)::int AS total_observations,
           COUNT(*) FILTER (WHERE o.reflected = false AND o.flagged = false)::int AS unreflected_count,
           COUNT(*) FILTER (WHERE o.flagged = true)::int AS flagged_count
    FROM observations o
    JOIN agents a ON a.id = o.agent_id
    WHERE o.company_id = ${companyId}::uuid
    GROUP BY o.agent_id, a.name
  `)

  // Get per-agent memory stats
  const memStatsRaw = await db.execute(sql`
    SELECT m.agent_id,
           COUNT(*) FILTER (WHERE m.is_active = true)::int AS total_memories,
           MAX(m.created_at) FILTER (WHERE m.source = 'reflection') AS last_reflection_at
    FROM agent_memories m
    WHERE m.company_id = ${companyId}::uuid
    GROUP BY m.agent_id
  `)

  const obsRows = (obsStatsRaw as unknown as { rows: any[] }).rows ?? (obsStatsRaw as unknown as any[]) ?? []
  const memRows = (memStatsRaw as unknown as { rows: any[] }).rows ?? (memStatsRaw as unknown as any[]) ?? []

  const memMap = new Map<string, any>()
  for (const r of memRows) memMap.set(r.agent_id, r)

  const agentsResult = obsRows.map((obs: any) => {
    const mem = memMap.get(obs.agent_id)
    return {
      agentId: obs.agent_id,
      agentName: obs.agent_name,
      totalObservations: Number(obs.total_observations),
      unreflectedCount: Number(obs.unreflected_count),
      flaggedCount: Number(obs.flagged_count),
      totalMemories: Number(mem?.total_memories ?? 0),
      lastReflectionAt: mem?.last_reflection_at ?? null,
    }
  })

  // Include agents that have memories but no observations
  for (const [agentId, mem] of memMap) {
    if (!obsRows.find((o: any) => o.agent_id === agentId)) {
      agentsResult.push({
        agentId,
        agentName: '',
        totalObservations: 0,
        unreflectedCount: 0,
        flaggedCount: 0,
        totalMemories: Number(mem.total_memories),
        lastReflectionAt: mem.last_reflection_at ?? null,
      })
    }
  }

  return c.json({ success: true, data: { agents: agentsResult } })
})

// GET /api/workspace/memory-dashboard/agent/:agentId/observations — paginated observations
memoryDashboardRoute.get('/memory-dashboard/agent/:agentId/observations', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100)
  const offset = Number(c.req.query('offset')) || 0
  const domain = c.req.query('domain')
  const outcome = c.req.query('outcome')
  const flagged = c.req.query('flagged')

  const conditions: SQL[] = [
    eq(observations.companyId, tenant.companyId as any),
    eq(observations.agentId, agentId),
  ]
  if (domain) conditions.push(eq(observations.domain, domain))
  if (outcome) conditions.push(eq(observations.outcome, outcome))
  if (flagged === 'true') conditions.push(eq(observations.flagged, true))
  if (flagged === 'false') conditions.push(eq(observations.flagged, false))

  const data = await db.select({
    id: observations.id,
    content: observations.content,
    domain: observations.domain,
    outcome: observations.outcome,
    toolUsed: observations.toolUsed,
    importance: observations.importance,
    confidence: observations.confidence,
    reflected: observations.reflected,
    flagged: observations.flagged,
    observedAt: observations.observedAt,
    createdAt: observations.createdAt,
  })
    .from(observations)
    .where(and(...conditions))
    .orderBy(desc(observations.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ success: true, data })
})

// GET /api/workspace/memory-dashboard/agent/:agentId/memories — paginated memories
memoryDashboardRoute.get('/memory-dashboard/agent/:agentId/memories', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100)
  const offset = Number(c.req.query('offset')) || 0
  const source = c.req.query('source')
  const category = c.req.query('category')

  const conditions: SQL[] = [
    eq(agentMemories.companyId, tenant.companyId as any),
    eq(agentMemories.agentId, agentId),
    eq(agentMemories.isActive, true),
  ]
  if (source) conditions.push(eq(agentMemories.source, source))
  if (category) conditions.push(eq(agentMemories.category, category))

  const data = await db.select({
    id: agentMemories.id,
    memoryType: agentMemories.memoryType,
    key: agentMemories.key,
    content: agentMemories.content,
    context: agentMemories.context,
    source: agentMemories.source,
    confidence: agentMemories.confidence,
    category: agentMemories.category,
    pinned: agentMemories.pinned,
    usageCount: agentMemories.usageCount,
    lastUsedAt: agentMemories.lastUsedAt,
    createdAt: agentMemories.createdAt,
  })
    .from(agentMemories)
    .where(and(...conditions))
    .orderBy(desc(agentMemories.pinned), desc(agentMemories.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ success: true, data })
})

// GET /api/workspace/memory-dashboard/agent/:agentId/timeline — mixed events timeline
memoryDashboardRoute.get('/memory-dashboard/agent/:agentId/timeline', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100)
  const offset = Number(c.req.query('offset')) || 0

  const companyId = tenant.companyId

  const rows = await db.execute(sql`
    (
      SELECT 'observation' AS type, id, content,
             observed_at AS timestamp,
             json_build_object(
               'domain', domain, 'outcome', outcome, 'importance', importance,
               'confidence', confidence, 'flagged', flagged, 'reflected', reflected
             ) AS metadata
      FROM observations
      WHERE company_id = ${companyId}::uuid AND agent_id = ${agentId}::uuid
    )
    UNION ALL
    (
      SELECT 'memory' AS type, id, content,
             created_at AS timestamp,
             json_build_object(
               'source', source, 'confidence', confidence, 'category', category,
               'memoryType', memory_type, 'pinned', pinned, 'usageCount', usage_count
             ) AS metadata
      FROM agent_memories
      WHERE company_id = ${companyId}::uuid AND agent_id = ${agentId}::uuid AND is_active = true
    )
    ORDER BY timestamp DESC
    LIMIT ${limit} OFFSET ${offset}
  `)

  const resultRows = (rows as unknown as { rows: any[] }).rows ?? (rows as unknown as any[]) ?? []
  const data = resultRows.map((r: any) => ({
    type: r.type as 'observation' | 'memory',
    id: r.id as string,
    content: r.content as string,
    timestamp: r.timestamp,
    metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
  }))

  return c.json({ success: true, data })
})

// POST /api/workspace/memory-dashboard/agent/:agentId/memories/:memoryId/pin — pin/unpin memory
memoryDashboardRoute.post('/memory-dashboard/agent/:agentId/memories/:memoryId/pin', async (c) => {
  const tenant = c.get('tenant')
  const memoryId = c.req.param('memoryId')

  // Toggle pinned state
  const [current] = await db.select({ pinned: agentMemories.pinned })
    .from(agentMemories)
    .where(and(
      eq(agentMemories.id, memoryId),
      eq(agentMemories.companyId, tenant.companyId as any),
    ))
    .limit(1)

  if (!current) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Memory not found' } }, 404)
  }

  const newPinned = !current.pinned
  await db.update(agentMemories)
    .set({ pinned: newPinned, updatedAt: new Date() })
    .where(and(
      eq(agentMemories.id, memoryId),
      eq(agentMemories.companyId, tenant.companyId as any),
    ))

  return c.json({ success: true, data: { pinned: newPinned } })
})

// DELETE /api/workspace/memory-dashboard/agent/:agentId/observations/:observationId — delete observation
memoryDashboardRoute.delete('/memory-dashboard/agent/:agentId/observations/:observationId', async (c) => {
  const tenant = c.get('tenant')
  const observationId = c.req.param('observationId')

  const result = await db.delete(observations)
    .where(and(
      eq(observations.id, observationId),
      eq(observations.companyId, tenant.companyId as any),
    ))
    .returning({ id: observations.id })

  if (result.length === 0) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Observation not found' } }, 404)
  }

  return c.json({ success: true, data: { deleted: true } })
})
