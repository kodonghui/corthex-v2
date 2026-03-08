import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { db } from '../../db'
import { agents, departments, commands, orchestrationTasks, costRecords, qualityReviews } from '../../db/schema'
import { eq, and, sql, gte, desc, count, avg } from 'drizzle-orm'
import type { AppEnv } from '../../types'

export const performanceRoute = new Hono<AppEnv>()

performanceRoute.use('*', authMiddleware)

// GET /performance/summary — 요약 통계
performanceRoute.get('/performance/summary', async (c) => {
  const tenant = c.get('tenant')
  const companyId = tenant.companyId

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // Total agents
  const agentRows = await db.select({ count: count() })
    .from(agents)
    .where(and(eq(agents.companyId, companyId), eq(agents.isActive, true)))
  const totalAgents = agentRows[0]?.count ?? 0

  // This month commands
  const thisMonthCmds = await db.select({
    total: count(),
    completed: sql<number>`count(*) filter (where ${commands.status} = 'completed')`,
  }).from(commands).where(and(
    eq(commands.companyId, companyId),
    gte(commands.createdAt, thisMonthStart),
  ))

  const totalCmds = thisMonthCmds[0]?.total ?? 0
  const completedCmds = thisMonthCmds[0]?.completed ?? 0
  const avgSuccessRate = totalCmds > 0 ? Math.round((completedCmds / totalCmds) * 100) : 0

  // Last month commands for comparison
  const lastMonthCmds = await db.select({
    total: count(),
    completed: sql<number>`count(*) filter (where ${commands.status} = 'completed')`,
  }).from(commands).where(and(
    eq(commands.companyId, companyId),
    gte(commands.createdAt, lastMonthStart),
    sql`${commands.createdAt} <= ${lastMonthEnd}`,
  ))

  const lastTotal = lastMonthCmds[0]?.total ?? 0
  const lastCompleted = lastMonthCmds[0]?.completed ?? 0
  const lastSuccessRate = lastTotal > 0 ? Math.round((lastCompleted / lastTotal) * 100) : 0

  // This month cost
  const thisMonthCost = await db.select({
    totalMicro: sql<number>`coalesce(sum(${costRecords.costUsdMicro}), 0)`,
  }).from(costRecords).where(and(
    eq(costRecords.companyId, companyId),
    gte(costRecords.createdAt, thisMonthStart),
  ))
  const totalCostThisMonth = (thisMonthCost[0]?.totalMicro ?? 0) / 1_000_000

  // Last month cost
  const lastMonthCost = await db.select({
    totalMicro: sql<number>`coalesce(sum(${costRecords.costUsdMicro}), 0)`,
  }).from(costRecords).where(and(
    eq(costRecords.companyId, companyId),
    gte(costRecords.createdAt, lastMonthStart),
    sql`${costRecords.createdAt} <= ${lastMonthEnd}`,
  ))
  const lastTotalCost = (lastMonthCost[0]?.totalMicro ?? 0) / 1_000_000

  // Avg response time this month
  const thisMonthTime = await db.select({
    avgMs: sql<number>`coalesce(avg(${orchestrationTasks.durationMs}), 0)`,
  }).from(orchestrationTasks).where(and(
    eq(orchestrationTasks.companyId, companyId),
    gte(orchestrationTasks.createdAt, thisMonthStart),
    sql`${orchestrationTasks.durationMs} is not null`,
  ))
  const avgResponseTimeMs = Math.round(thisMonthTime[0]?.avgMs ?? 0)

  // Last month avg response time
  const lastMonthTime = await db.select({
    avgMs: sql<number>`coalesce(avg(${orchestrationTasks.durationMs}), 0)`,
  }).from(orchestrationTasks).where(and(
    eq(orchestrationTasks.companyId, companyId),
    gte(orchestrationTasks.createdAt, lastMonthStart),
    sql`${orchestrationTasks.createdAt} <= ${lastMonthEnd}`,
    sql`${orchestrationTasks.durationMs} is not null`,
  ))
  const lastAvgTime = Math.round(lastMonthTime[0]?.avgMs ?? 0)

  return c.json({
    success: true,
    data: {
      totalAgents,
      avgSuccessRate,
      totalCostThisMonth: Math.round(totalCostThisMonth * 100) / 100,
      avgResponseTimeMs,
      changes: {
        agents: 0, // agent count change is not meaningful monthly
        successRate: avgSuccessRate - lastSuccessRate,
        cost: lastTotalCost > 0 ? Math.round(((totalCostThisMonth - lastTotalCost) / lastTotalCost) * 100) : 0,
        responseTime: lastAvgTime > 0 ? Math.round(((avgResponseTimeMs - lastAvgTime) / lastAvgTime) * 100) : 0,
      },
    },
  })
})

// GET /performance/agents — 에이전트 성능 목록
performanceRoute.get('/performance/agents', async (c) => {
  const tenant = c.get('tenant')
  const companyId = tenant.companyId
  const query = c.req.query()

  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
  const offset = (page - 1) * limit
  const sortBy = query.sortBy || 'name'
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc'

  // Get all active agents with department info
  const agentList = await db.select({
    id: agents.id,
    name: agents.name,
    departmentId: agents.departmentId,
    departmentName: departments.name,
    tier: agents.tier,
    modelName: agents.modelName,
    soul: agents.soul,
    allowedTools: agents.allowedTools,
  }).from(agents)
    .leftJoin(departments, eq(agents.departmentId, departments.id))
    .where(and(
      eq(agents.companyId, companyId),
      eq(agents.isActive, true),
      ...(query.departmentId ? [eq(agents.departmentId, query.departmentId)] : []),
      ...(query.role ? [eq(agents.tier, query.role as 'manager' | 'specialist' | 'worker')] : []),
    ))

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Build performance data for each agent
  const agentPerformances = await Promise.all(agentList.map(async (agent) => {
    // Count tasks for this agent in last 30 days
    const taskStats = await db.select({
      total: count(),
      completed: sql<number>`count(*) filter (where ${orchestrationTasks.status} = 'completed')`,
      avgDurationMs: sql<number>`coalesce(avg(${orchestrationTasks.durationMs}), 0)`,
    }).from(orchestrationTasks).where(and(
      eq(orchestrationTasks.companyId, companyId),
      eq(orchestrationTasks.agentId, agent.id),
      gte(orchestrationTasks.createdAt, thirtyDaysAgo),
    ))

    const totalCalls = taskStats[0]?.total ?? 0
    const completedCalls = taskStats[0]?.completed ?? 0
    const successRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0

    // Cost for this agent in last 30 days
    const costStats = await db.select({
      totalMicro: sql<number>`coalesce(sum(${costRecords.costUsdMicro}), 0)`,
    }).from(costRecords).where(and(
      eq(costRecords.companyId, companyId),
      eq(costRecords.agentId, agent.id),
      gte(costRecords.createdAt, thirtyDaysAgo),
    ))

    const totalCostMicro = costStats[0]?.totalMicro ?? 0
    const avgCostUsd = totalCalls > 0 ? (totalCostMicro / 1_000_000) / totalCalls : 0

    // Soul Gym status
    let soulGymStatus: 'optimal' | 'has-suggestions' | 'needs-attention' = 'optimal'
    if (successRate < 50) soulGymStatus = 'needs-attention'
    else if (successRate < 80) soulGymStatus = 'has-suggestions'

    return {
      id: agent.id,
      name: agent.name,
      departmentName: agent.departmentName || '미배정',
      role: agent.tier,
      totalCalls,
      successRate,
      avgCostUsd: Math.round(avgCostUsd * 10000) / 10000,
      avgResponseTimeMs: Math.round(taskStats[0]?.avgDurationMs ?? 0),
      soulGymStatus,
    }
  }))

  // Sort
  const sorted = agentPerformances.sort((a, b) => {
    const key = sortBy as keyof typeof a
    const aVal = a[key] ?? ''
    const bVal = b[key] ?? ''
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }
    return sortOrder === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })

  // Filter by performance level
  const filtered = query.level
    ? sorted.filter((a) => {
        if (query.level === 'high') return a.successRate >= 80
        if (query.level === 'mid') return a.successRate >= 50 && a.successRate < 80
        if (query.level === 'low') return a.successRate < 50
        return true
      })
    : sorted

  const total = filtered.length
  const paginated = filtered.slice(offset, offset + limit)

  return c.json({
    success: true,
    data: {
      items: paginated,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

// GET /performance/agents/:id — 에이전트 상세 성능
performanceRoute.get('/performance/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  const companyId = tenant.companyId
  const agentId = c.req.param('id')

  // Agent basic info
  const agentRow = await db.select({
    id: agents.id,
    name: agents.name,
    departmentName: departments.name,
    tier: agents.tier,
    modelName: agents.modelName,
    soul: agents.soul,
    allowedTools: agents.allowedTools,
  }).from(agents)
    .leftJoin(departments, eq(agents.departmentId, departments.id))
    .where(and(eq(agents.id, agentId), eq(agents.companyId, companyId)))

  if (agentRow.length === 0) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '에이전트를 찾을 수 없습니다' } }, 404)
  }

  const agent = agentRow[0]
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Daily metrics for last 30 days
  const dailyRaw = await db.select({
    date: sql<string>`to_char(${orchestrationTasks.createdAt}, 'YYYY-MM-DD')`,
    total: count(),
    completed: sql<number>`count(*) filter (where ${orchestrationTasks.status} = 'completed')`,
  }).from(orchestrationTasks).where(and(
    eq(orchestrationTasks.companyId, companyId),
    eq(orchestrationTasks.agentId, agentId),
    gte(orchestrationTasks.createdAt, thirtyDaysAgo),
  )).groupBy(sql`to_char(${orchestrationTasks.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orchestrationTasks.createdAt}, 'YYYY-MM-DD')`)

  // Daily cost
  const dailyCostRaw = await db.select({
    date: sql<string>`to_char(${costRecords.createdAt}, 'YYYY-MM-DD')`,
    totalMicro: sql<number>`coalesce(sum(${costRecords.costUsdMicro}), 0)`,
  }).from(costRecords).where(and(
    eq(costRecords.companyId, companyId),
    eq(costRecords.agentId, agentId),
    gte(costRecords.createdAt, thirtyDaysAgo),
  )).groupBy(sql`to_char(${costRecords.createdAt}, 'YYYY-MM-DD')`)

  const costByDate = new Map(dailyCostRaw.map((r) => [r.date, r.totalMicro / 1_000_000]))

  const dailyMetrics = dailyRaw.map((d) => ({
    date: d.date,
    successRate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
    costUsd: Math.round((costByDate.get(d.date) ?? 0) * 10000) / 10000,
  }))

  // Recent tasks (last 10)
  const recentTasks = await db.select({
    commandText: commands.text,
    status: orchestrationTasks.status,
    durationMs: orchestrationTasks.durationMs,
    createdAt: orchestrationTasks.createdAt,
  }).from(orchestrationTasks)
    .leftJoin(commands, eq(orchestrationTasks.commandId, commands.id))
    .where(and(
      eq(orchestrationTasks.companyId, companyId),
      eq(orchestrationTasks.agentId, agentId),
    ))
    .orderBy(desc(orchestrationTasks.createdAt))
    .limit(10)

  // Get cost for recent tasks via commandId
  const recentTasksMapped = await Promise.all(recentTasks.map(async (t) => {
    return {
      commandText: t.commandText ? (t.commandText.length > 80 ? t.commandText.slice(0, 80) + '...' : t.commandText) : '(없음)',
      status: t.status,
      costUsd: 0,
      durationMs: t.durationMs ?? 0,
      createdAt: t.createdAt?.toISOString() ?? '',
    }
  }))

  // Quality score distribution
  const qualityRaw = await db.select({
    conclusion: qualityReviews.conclusion,
    count: count(),
  }).from(qualityReviews)
    .innerJoin(orchestrationTasks, and(
      eq(qualityReviews.commandId, orchestrationTasks.commandId),
      eq(orchestrationTasks.agentId, agentId),
    ))
    .where(eq(qualityReviews.companyId, companyId))
    .groupBy(qualityReviews.conclusion)

  const qualityDistribution = qualityRaw.map((q) => ({
    score: q.conclusion === 'pass' ? 80 : 40,
    count: q.count,
    label: q.conclusion,
  }))

  // Overall metrics
  const totalTasks = await db.select({ count: count() })
    .from(orchestrationTasks)
    .where(and(
      eq(orchestrationTasks.companyId, companyId),
      eq(orchestrationTasks.agentId, agentId),
      gte(orchestrationTasks.createdAt, thirtyDaysAgo),
    ))

  const completedTasks = await db.select({ count: count() })
    .from(orchestrationTasks)
    .where(and(
      eq(orchestrationTasks.companyId, companyId),
      eq(orchestrationTasks.agentId, agentId),
      eq(orchestrationTasks.status, 'completed'),
      gte(orchestrationTasks.createdAt, thirtyDaysAgo),
    ))

  const totalCalls = totalTasks[0]?.count ?? 0
  const successRate = totalCalls > 0 ? Math.round(((completedTasks[0]?.count ?? 0) / totalCalls) * 100) : 0

  const allowedTools = Array.isArray(agent.allowedTools) ? agent.allowedTools : []
  const soulSummary = agent.soul
    ? (agent.soul.length > 200 ? agent.soul.slice(0, 200) + '...' : agent.soul)
    : '(설정되지 않음)'

  return c.json({
    success: true,
    data: {
      id: agent.id,
      name: agent.name,
      departmentName: agent.departmentName || '미배정',
      role: agent.tier,
      totalCalls,
      successRate,
      avgCostUsd: 0,
      avgResponseTimeMs: 0,
      soulGymStatus: successRate >= 80 ? 'optimal' : successRate >= 50 ? 'has-suggestions' : 'needs-attention',
      dailyMetrics,
      recentTasks: recentTasksMapped,
      qualityDistribution,
      soulInfo: {
        systemPromptSummary: soulSummary,
        allowedToolsCount: allowedTools.length,
        modelName: agent.modelName,
      },
    },
  })
})

// GET /performance/soul-gym — Soul Gym 개선 제안
performanceRoute.get('/performance/soul-gym', async (c) => {
  const tenant = c.get('tenant')
  const companyId = tenant.companyId

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get all agents with performance data
  const agentList = await db.select({
    id: agents.id,
    name: agents.name,
    tier: agents.tier,
    modelName: agents.modelName,
    soul: agents.soul,
    allowedTools: agents.allowedTools,
  }).from(agents).where(and(
    eq(agents.companyId, companyId),
    eq(agents.isActive, true),
  ))

  const suggestions = []

  for (const agent of agentList) {
    // Get task stats
    const taskStats = await db.select({
      total: count(),
      completed: sql<number>`count(*) filter (where ${orchestrationTasks.status} = 'completed')`,
      failed: sql<number>`count(*) filter (where ${orchestrationTasks.status} = 'failed')`,
    }).from(orchestrationTasks).where(and(
      eq(orchestrationTasks.companyId, companyId),
      eq(orchestrationTasks.agentId, agent.id),
      gte(orchestrationTasks.createdAt, thirtyDaysAgo),
    ))

    const total = taskStats[0]?.total ?? 0
    const completed = taskStats[0]?.completed ?? 0
    const failed = taskStats[0]?.failed ?? 0
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 100

    // Skip agents with no activity or already optimal
    if (total < 3 || successRate >= 85) continue

    // Generate suggestions based on patterns
    const allowedTools = Array.isArray(agent.allowedTools) ? agent.allowedTools : []
    const hasSoul = !!agent.soul && agent.soul.length > 50

    if (successRate < 50 && !hasSoul) {
      suggestions.push({
        id: `${agent.id}-prompt`,
        agentId: agent.id,
        agentName: agent.name,
        currentSuccessRate: successRate,
        suggestionType: 'prompt-improve' as const,
        description: `시스템 프롬프트(Soul)가 설정되지 않았거나 너무 짧습니다. 역할과 목표를 명확히 정의하면 성공률이 개선됩니다.`,
        confidence: 90,
        expectedImprovement: 25,
        estimatedTokens: 500,
      })
    }

    if (successRate < 70 && allowedTools.length < 3) {
      suggestions.push({
        id: `${agent.id}-tool`,
        agentId: agent.id,
        agentName: agent.name,
        currentSuccessRate: successRate,
        suggestionType: 'add-tool' as const,
        description: `허용된 도구가 ${allowedTools.length}개뿐입니다. 관련 도구를 추가하면 작업 처리 능력이 향상됩니다.`,
        confidence: 75,
        expectedImprovement: 15,
        estimatedTokens: 200,
      })
    }

    if (failed > 3 && agent.modelName.includes('haiku')) {
      suggestions.push({
        id: `${agent.id}-model`,
        agentId: agent.id,
        agentName: agent.name,
        currentSuccessRate: successRate,
        suggestionType: 'change-model' as const,
        description: `실패 작업이 ${failed}건입니다. 현재 모델(${agent.modelName})을 상위 모델로 변경하면 복잡한 작업의 성공률이 높아집니다.`,
        confidence: 65,
        expectedImprovement: 20,
        estimatedTokens: 0,
      })
    }
  }

  // Sort by confidence desc
  suggestions.sort((a, b) => b.confidence - a.confidence)

  return c.json({ success: true, data: suggestions })
})

// POST /performance/soul-gym/:id/apply — 개선 제안 적용
performanceRoute.post('/performance/soul-gym/:id/apply', async (c) => {
  const tenant = c.get('tenant')
  const suggestionId = c.req.param('id')

  // Parse agentId from suggestion ID (format: agentId-type)
  const dashIdx = suggestionId.lastIndexOf('-')
  if (dashIdx === -1) {
    return c.json({ success: false, error: { code: 'INVALID_ID', message: '잘못된 제안 ID입니다' } }, 400)
  }

  const agentId = suggestionId.slice(0, dashIdx)
  const suggestionType = suggestionId.slice(dashIdx + 1)

  // Verify agent belongs to company
  const agentRow = await db.select({ id: agents.id, soul: agents.soul, modelName: agents.modelName })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))

  if (agentRow.length === 0) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '에이전트를 찾을 수 없습니다' } }, 404)
  }

  // Apply based on type
  if (suggestionType === 'prompt') {
    const currentSoul = agentRow[0].soul || ''
    const improvedSoul = currentSoul
      ? `${currentSoul}\n\n[Soul Gym 개선] 작업 실패 패턴을 분석하여 다음 사항을 강화합니다:\n- 명확한 단계별 작업 수행\n- 오류 발생 시 재시도 전략 적용\n- 결과 검증 후 보고`
      : `[Soul Gym 자동 생성]\n역할: AI 에이전트\n목표: 주어진 작업을 정확하고 효율적으로 수행\n\n작업 수행 원칙:\n1. 명확한 단계별 작업 수행\n2. 오류 발생 시 재시도 전략 적용\n3. 결과 검증 후 보고`

    await db.update(agents)
      .set({ soul: improvedSoul, updatedAt: new Date() })
      .where(eq(agents.id, agentId))
  } else if (suggestionType === 'model') {
    // Upgrade model
    const currentModel = agentRow[0].modelName
    const upgradedModel = currentModel.includes('haiku') ? 'claude-sonnet-4-6' : currentModel
    await db.update(agents)
      .set({ modelName: upgradedModel, updatedAt: new Date() })
      .where(eq(agents.id, agentId))
  }
  // For 'tool' type, just acknowledge — admin needs to add tools manually via admin console

  return c.json({ success: true, data: { applied: true, suggestionId } })
})

// POST /performance/soul-gym/:id/dismiss — 개선 제안 무시
performanceRoute.post('/performance/soul-gym/:id/dismiss', async (c) => {
  // Dismiss is a no-op (suggestions are regenerated from live data)
  const suggestionId = c.req.param('id')
  return c.json({ success: true, data: { dismissed: true, suggestionId } })
})
