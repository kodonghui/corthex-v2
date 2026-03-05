import { Hono } from 'hono'
import { eq, and, gte, desc, sql, count, sum } from 'drizzle-orm'
import { db } from '../../db'
import { costRecords, agents, chatMessages, delegations, toolCalls, nightJobs, activityLogs } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import type { AppEnv } from '../../types'

export const dashboardRoute = new Hono<AppEnv>()

dashboardRoute.use('*', authMiddleware)

// GET /api/workspace/dashboard/costs — 비용 요약
dashboardRoute.get('/dashboard/costs', async (c) => {
  const tenant = c.get('tenant')
  const days = Number(c.req.query('days')) || 30
  const since = new Date()
  since.setDate(since.getDate() - days)

  // 모델별 비용
  const byModel = await db
    .select({
      model: costRecords.model,
      totalCostMicro: sum(costRecords.costUsdMicro),
      totalInput: sum(costRecords.inputTokens),
      totalOutput: sum(costRecords.outputTokens),
      count: count(),
    })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, tenant.companyId),
      gte(costRecords.createdAt, since),
    ))
    .groupBy(costRecords.model)

  // 에이전트별 비용
  const byAgent = await db
    .select({
      agentId: costRecords.agentId,
      agentName: agents.name,
      totalCostMicro: sum(costRecords.costUsdMicro),
      count: count(),
    })
    .from(costRecords)
    .leftJoin(agents, eq(costRecords.agentId, agents.id))
    .where(and(
      eq(costRecords.companyId, tenant.companyId),
      gte(costRecords.createdAt, since),
    ))
    .groupBy(costRecords.agentId, agents.name)

  // 소스별 비용
  const bySource = await db
    .select({
      source: costRecords.source,
      totalCostMicro: sum(costRecords.costUsdMicro),
      count: count(),
    })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, tenant.companyId),
      gte(costRecords.createdAt, since),
    ))
    .groupBy(costRecords.source)

  // 총 비용
  const [total] = await db
    .select({
      totalCostMicro: sum(costRecords.costUsdMicro),
    })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, tenant.companyId),
      gte(costRecords.createdAt, since),
    ))

  return c.json({
    data: {
      totalCostUsd: Number(total?.totalCostMicro || 0) / 1_000_000,
      byModel: byModel.map((r) => ({
        model: r.model,
        costUsd: Number(r.totalCostMicro || 0) / 1_000_000,
        inputTokens: Number(r.totalInput || 0),
        outputTokens: Number(r.totalOutput || 0),
        count: Number(r.count),
      })),
      byAgent: byAgent.map((r) => ({
        agentId: r.agentId,
        agentName: r.agentName || '알 수 없음',
        costUsd: Number(r.totalCostMicro || 0) / 1_000_000,
        count: Number(r.count),
      })),
      bySource: bySource.map((r) => ({
        source: r.source || '기타',
        costUsd: Number(r.totalCostMicro || 0) / 1_000_000,
        count: Number(r.count),
      })),
      days,
    },
  })
})

// GET /api/workspace/dashboard/agents — 에이전트 상태 overview
dashboardRoute.get('/dashboard/agents', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      status: agents.status,
      isSecretary: agents.isSecretary,
    })
    .from(agents)
    .where(and(eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))
    .orderBy(agents.name)

  const statusCounts = {
    online: result.filter((a) => a.status === 'online').length,
    working: result.filter((a) => a.status === 'working').length,
    error: result.filter((a) => a.status === 'error').length,
    offline: result.filter((a) => a.status === 'offline').length,
  }

  return c.json({ data: { agents: result, statusCounts } })
})

// GET /api/workspace/dashboard/stats — 종합 통계
dashboardRoute.get('/dashboard/stats', async (c) => {
  const tenant = c.get('tenant')
  const days = Number(c.req.query('days')) || 7
  const since = new Date()
  since.setDate(since.getDate() - days)

  const conditions = (table: any) => and(
    eq(table.companyId, tenant.companyId),
    gte(table.createdAt, since),
  )

  const [messagesCount] = await db
    .select({ count: count() })
    .from(chatMessages)
    .where(conditions(chatMessages))

  const [delegationsCount] = await db
    .select({ count: count() })
    .from(delegations)
    .where(conditions(delegations))

  const [toolCallsCount] = await db
    .select({ count: count() })
    .from(toolCalls)
    .where(conditions(toolCalls))

  const [jobsCount] = await db
    .select({ count: count() })
    .from(nightJobs)
    .where(conditions(nightJobs))

  return c.json({
    data: {
      messages: Number(messagesCount?.count || 0),
      delegations: Number(delegationsCount?.count || 0),
      toolCalls: Number(toolCallsCount?.count || 0),
      nightJobs: Number(jobsCount?.count || 0),
      days,
    },
  })
})

// GET /api/workspace/dashboard/system — 시스템 모니터링
dashboardRoute.get('/dashboard/system', async (c) => {
  const tenant = c.get('tenant')

  const uptime = process.uptime()
  const memory = process.memoryUsage()

  // 최근 24시간 에러 카운트
  const recentErrors = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(and(
      eq(activityLogs.companyId, tenant.companyId),
      eq(activityLogs.phase, 'error'),
      gte(activityLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
    ))

  return c.json({
    data: {
      uptime: Math.floor(uptime),
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        rss: Math.round(memory.rss / 1024 / 1024),
      },
      recentErrors: Number(recentErrors[0]?.count || 0),
    },
  })
})
