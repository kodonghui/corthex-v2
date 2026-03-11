import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, gte, sql, count, sum, inArray } from 'drizzle-orm'
import { db } from '../../db'
import { costRecords, agents, chatMessages, delegations, toolCalls, nightJobs } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { departmentScopeMiddleware } from '../../middleware/department-scope'
import { getSummary, getUsage, getBudget, getQuickActions, updateQuickActions, getSatisfaction } from '../../services/dashboard'
import * as costAggregation from '../../services/cost-aggregation'
import type { AppEnv } from '../../types'

export const dashboardRoute = new Hono<AppEnv>()

dashboardRoute.use('*', authMiddleware)
dashboardRoute.use('*', departmentScopeMiddleware)

// GET /api/workspace/dashboard/summary — 4개 요약 카드 (Story 6-1)
dashboardRoute.get('/dashboard/summary', async (c) => {
  const tenant = c.get('tenant')
  const data = await getSummary(tenant.companyId, tenant.departmentIds)
  return c.json({ success: true, data })
})

// GET /api/workspace/dashboard/usage — AI 사용량 차트 (Story 6-1)
const usageQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
})

dashboardRoute.get('/dashboard/usage', zValidator('query', usageQuerySchema), async (c) => {
  const tenant = c.get('tenant')
  const { days } = c.req.valid('query')
  const data = await getUsage(tenant.companyId, days)
  return c.json({ success: true, data })
})

// GET /api/workspace/dashboard/budget — 예산 진행률 (Story 6-1)
dashboardRoute.get('/dashboard/budget', async (c) => {
  const tenant = c.get('tenant')
  const data = await getBudget(tenant.companyId, tenant.departmentIds)
  return c.json({ success: true, data })
})

// GET /api/workspace/dashboard/costs — 비용 요약
dashboardRoute.get('/dashboard/costs', async (c) => {
  const tenant = c.get('tenant')
  const days = Number(c.req.query('days')) || 30
  const since = new Date()
  since.setDate(since.getDate() - days)

  // Employee with no departments: empty result
  if (tenant.departmentIds && tenant.departmentIds.length === 0) {
    return c.json({ data: { totalCostUsd: 0, byModel: [], byAgent: [], bySource: [], days } })
  }

  // Get scoped agent IDs for employee department filtering
  let scopedAgentIds: string[] | undefined
  if (tenant.departmentIds) {
    const scopedAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.companyId, tenant.companyId), inArray(agents.departmentId, tenant.departmentIds)))
    scopedAgentIds = scopedAgents.map(a => a.id)
    if (scopedAgentIds.length === 0) {
      return c.json({ data: { totalCostUsd: 0, byModel: [], byAgent: [], bySource: [], days } })
    }
  }

  const baseCostConditions = [
    eq(costRecords.companyId, tenant.companyId),
    gte(costRecords.createdAt, since),
  ]
  if (scopedAgentIds) {
    baseCostConditions.push(inArray(costRecords.agentId, scopedAgentIds))
  }

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
    .where(and(...baseCostConditions))
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
    .where(and(...baseCostConditions))
    .groupBy(costRecords.agentId, agents.name)

  // 소스별 비용
  const bySource = await db
    .select({
      source: costRecords.source,
      totalCostMicro: sum(costRecords.costUsdMicro),
      count: count(),
    })
    .from(costRecords)
    .where(and(...baseCostConditions))
    .groupBy(costRecords.source)

  // 총 비용
  const [total] = await db
    .select({
      totalCostMicro: sum(costRecords.costUsdMicro),
    })
    .from(costRecords)
    .where(and(...baseCostConditions))

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

// GET /api/workspace/dashboard/costs/by-agent — 에이전트별 비용 (Story 7-4)
const costDateRangeSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
})

dashboardRoute.get('/dashboard/costs/by-agent', zValidator('query', costDateRangeSchema), async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.valid('query')
  const endDate = query.endDate ? new Date(query.endDate + 'T23:59:59.999Z') : new Date()
  const startDate = query.startDate
    ? new Date(query.startDate + 'T00:00:00.000Z')
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
  const items = await costAggregation.getByAgent(tenant.companyId, { startDate, endDate }, tenant.departmentIds)
  return c.json({ success: true, data: { items } })
})

// GET /api/workspace/dashboard/costs/daily — 일일 비용 추이 (Story 7-4)
dashboardRoute.get('/dashboard/costs/daily', zValidator('query', costDateRangeSchema), async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.valid('query')
  const endDate = query.endDate ? new Date(query.endDate + 'T23:59:59.999Z') : new Date()
  const startDate = query.startDate
    ? new Date(query.startDate + 'T00:00:00.000Z')
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
  const items = await costAggregation.getDaily(tenant.companyId, { startDate, endDate })
  return c.json({
    success: true,
    data: {
      items,
      meta: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    },
  })
})

// GET /api/workspace/dashboard/costs/by-tier — tier별 비용 집계 (Story 8.3)
dashboardRoute.get('/dashboard/costs/by-tier', zValidator('query', costDateRangeSchema), async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.valid('query')
  const endDate = query.endDate ? new Date(query.endDate + 'T23:59:59.999Z') : new Date()
  const startDate = query.startDate
    ? new Date(query.startDate + 'T00:00:00.000Z')
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
  const items = await costAggregation.getByTier(tenant.companyId, { startDate, endDate }, tenant.departmentIds)
  return c.json({ success: true, data: { items } })
})

// GET /api/workspace/dashboard/agents — 에이전트 상태 overview
dashboardRoute.get('/dashboard/agents', async (c) => {
  const tenant = c.get('tenant')

  const conditions = [eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)]
  if (tenant.departmentIds) {
    if (tenant.departmentIds.length === 0) {
      return c.json({ data: { agents: [], statusCounts: { online: 0, working: 0, error: 0, offline: 0 } } })
    }
    conditions.push(inArray(agents.departmentId, tenant.departmentIds))
  }

  const result = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      status: agents.status,
      isSecretary: agents.isSecretary,
    })
    .from(agents)
    .where(and(...conditions))
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

// GET /api/workspace/dashboard/quick-actions — 퀵 액션 목록 (Story 6-6)
dashboardRoute.get('/dashboard/quick-actions', async (c) => {
  const tenant = c.get('tenant')
  const data = await getQuickActions(tenant.companyId)
  return c.json({ success: true, data })
})

// PUT /api/workspace/dashboard/quick-actions — 퀵 액션 수정 (Story 6-6)
const quickActionSchema = z.object({
  id: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  icon: z.string().min(1).max(10),
  command: z.string().min(1).max(1000),
  presetId: z.string().uuid().nullish(),
  sortOrder: z.number().int().min(0),
})

const updateQuickActionsSchema = z.object({
  actions: z.array(quickActionSchema).min(1).max(10),
})

dashboardRoute.put('/dashboard/quick-actions', zValidator('json', updateQuickActionsSchema), async (c) => {
  const tenant = c.get('tenant')
  const { actions } = c.req.valid('json')
  const data = await updateQuickActions(tenant.companyId, actions)
  return c.json({ success: true, data })
})

// GET /api/workspace/dashboard/satisfaction — 만족도 차트 데이터 (Story 6-6)
const satisfactionQuerySchema = z.object({
  period: z.enum(['7d', '30d', 'all']).default('7d'),
})

dashboardRoute.get('/dashboard/satisfaction', zValidator('query', satisfactionQuerySchema), async (c) => {
  const tenant = c.get('tenant')
  const { period } = c.req.valid('query')
  const data = await getSatisfaction(tenant.companyId, period)
  return c.json({ success: true, data })
})
