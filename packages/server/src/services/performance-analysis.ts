import { db } from '../db'
import { agents, departments, orchestrationTasks, costRecords, qualityReviews, commands } from '../db/schema'
import { eq, and, sql, gte, desc, count, avg, lte } from 'drizzle-orm'

// === Performance Trend (daily) ===

export async function getPerformanceTrend(companyId: string, days: number = 30, agentId?: string) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const conditions = [
    eq(orchestrationTasks.companyId, companyId),
    gte(orchestrationTasks.createdAt, startDate),
    ...(agentId ? [eq(orchestrationTasks.agentId, agentId)] : []),
  ]

  const taskTrend = await db.select({
    date: sql<string>`to_char(${orchestrationTasks.createdAt}, 'YYYY-MM-DD')`,
    taskCount: count(),
    completedCount: sql<number>`count(*) filter (where ${orchestrationTasks.status} = 'completed')`,
    failedCount: sql<number>`count(*) filter (where ${orchestrationTasks.status} = 'failed')`,
  }).from(orchestrationTasks)
    .where(and(...conditions))
    .groupBy(sql`to_char(${orchestrationTasks.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orchestrationTasks.createdAt}, 'YYYY-MM-DD')`)

  // Cost trend
  const costConditions = [
    eq(costRecords.companyId, companyId),
    gte(costRecords.createdAt, startDate),
    ...(agentId ? [eq(costRecords.agentId, agentId)] : []),
  ]

  const costTrend = await db.select({
    date: sql<string>`to_char(${costRecords.createdAt}, 'YYYY-MM-DD')`,
    totalMicro: sql<number>`coalesce(sum(${costRecords.costUsdMicro}), 0)`,
  }).from(costRecords)
    .where(and(...costConditions))
    .groupBy(sql`to_char(${costRecords.createdAt}, 'YYYY-MM-DD')`)

  const costByDate = new Map(costTrend.map((r) => [r.date, r.totalMicro / 1_000_000]))

  // Quality trend
  const qualityConditions = [
    eq(qualityReviews.companyId, companyId),
    gte(qualityReviews.createdAt, startDate),
  ]

  const qualityTrend = await db.select({
    date: sql<string>`to_char(${qualityReviews.createdAt}, 'YYYY-MM-DD')`,
    avgScore: sql<number>`coalesce(avg(
      (coalesce((${qualityReviews.scores}->>'conclusionQuality')::numeric, 0) +
       coalesce((${qualityReviews.scores}->>'evidenceSources')::numeric, 0) +
       coalesce((${qualityReviews.scores}->>'riskAssessment')::numeric, 0) +
       coalesce((${qualityReviews.scores}->>'formatCompliance')::numeric, 0) +
       coalesce((${qualityReviews.scores}->>'logicalCoherence')::numeric, 0)) / 5.0
    ), 0)`,
  }).from(qualityReviews)
    .where(and(...qualityConditions))
    .groupBy(sql`to_char(${qualityReviews.createdAt}, 'YYYY-MM-DD')`)

  const scoreByDate = new Map(qualityTrend.map((r) => [r.date, Math.round(r.avgScore * 100) / 100]))

  return taskTrend.map((t) => ({
    date: t.date,
    taskCount: t.taskCount,
    completedCount: t.completedCount,
    failedCount: t.failedCount,
    totalCost: Math.round((costByDate.get(t.date) ?? 0) * 10000) / 10000,
    avgScore: scoreByDate.get(t.date) ?? 0,
  }))
}

// === Quality Trend ===

export async function getQualityTrend(companyId: string, days: number = 30, agentId?: string) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // If agentId specified, filter by tasks for that agent
  const baseConditions = [
    eq(qualityReviews.companyId, companyId),
    gte(qualityReviews.createdAt, startDate),
  ]

  let rows
  if (agentId) {
    rows = await db.select({
      date: sql<string>`to_char(${qualityReviews.createdAt}, 'YYYY-MM-DD')`,
      reviewCount: count(),
      passCount: sql<number>`count(*) filter (where ${qualityReviews.conclusion} = 'pass')`,
      avgConclusionClarity: sql<number>`coalesce(avg((${qualityReviews.scores}->>'conclusionQuality')::numeric), 0)`,
      avgEvidenceSufficiency: sql<number>`coalesce(avg((${qualityReviews.scores}->>'evidenceSources')::numeric), 0)`,
      avgRiskMention: sql<number>`coalesce(avg((${qualityReviews.scores}->>'riskAssessment')::numeric), 0)`,
      avgFormatAdequacy: sql<number>`coalesce(avg((${qualityReviews.scores}->>'formatCompliance')::numeric), 0)`,
      avgLogicalConsistency: sql<number>`coalesce(avg((${qualityReviews.scores}->>'logicalCoherence')::numeric), 0)`,
    }).from(qualityReviews)
      .innerJoin(orchestrationTasks, and(
        eq(qualityReviews.commandId, orchestrationTasks.commandId),
        eq(orchestrationTasks.agentId, agentId),
      ))
      .where(and(...baseConditions))
      .groupBy(sql`to_char(${qualityReviews.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${qualityReviews.createdAt}, 'YYYY-MM-DD')`)
  } else {
    rows = await db.select({
      date: sql<string>`to_char(${qualityReviews.createdAt}, 'YYYY-MM-DD')`,
      reviewCount: count(),
      passCount: sql<number>`count(*) filter (where ${qualityReviews.conclusion} = 'pass')`,
      avgConclusionClarity: sql<number>`coalesce(avg((${qualityReviews.scores}->>'conclusionQuality')::numeric), 0)`,
      avgEvidenceSufficiency: sql<number>`coalesce(avg((${qualityReviews.scores}->>'evidenceSources')::numeric), 0)`,
      avgRiskMention: sql<number>`coalesce(avg((${qualityReviews.scores}->>'riskAssessment')::numeric), 0)`,
      avgFormatAdequacy: sql<number>`coalesce(avg((${qualityReviews.scores}->>'formatCompliance')::numeric), 0)`,
      avgLogicalConsistency: sql<number>`coalesce(avg((${qualityReviews.scores}->>'logicalCoherence')::numeric), 0)`,
    }).from(qualityReviews)
      .where(and(...baseConditions))
      .groupBy(sql`to_char(${qualityReviews.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${qualityReviews.createdAt}, 'YYYY-MM-DD')`)
  }

  return rows.map((r) => {
    const avgScore = (r.avgConclusionClarity + r.avgEvidenceSufficiency + r.avgRiskMention + r.avgFormatAdequacy + r.avgLogicalConsistency) / 5
    return {
      date: r.date,
      reviewCount: r.reviewCount,
      passRate: r.reviewCount > 0 ? Math.round((r.passCount / r.reviewCount) * 100) : 0,
      avgScore: Math.round(avgScore * 100) / 100,
      scores: {
        conclusionClarity: Math.round(r.avgConclusionClarity * 100) / 100,
        evidenceSufficiency: Math.round(r.avgEvidenceSufficiency * 100) / 100,
        riskMention: Math.round(r.avgRiskMention * 100) / 100,
        formatAdequacy: Math.round(r.avgFormatAdequacy * 100) / 100,
        logicalConsistency: Math.round(r.avgLogicalConsistency * 100) / 100,
      },
    }
  })
}

// === Agent Ranking ===

export async function getAgentRanking(
  companyId: string,
  metric: 'successRate' | 'qualityScore' | 'costEfficiency' = 'successRate',
  tier?: string,
  topN: number = 10,
) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const agentConditions = [
    eq(agents.companyId, companyId),
    eq(agents.isActive, true),
    ...(tier ? [eq(agents.tier, tier as 'manager' | 'specialist' | 'worker')] : []),
  ]

  const agentList = await db.select({
    id: agents.id,
    name: agents.name,
    tier: agents.tier,
    departmentName: departments.name,
  }).from(agents)
    .leftJoin(departments, eq(agents.departmentId, departments.id))
    .where(and(...agentConditions))

  const rankings = await Promise.all(agentList.map(async (agent) => {
    const taskStats = await db.select({
      total: count(),
      completed: sql<number>`count(*) filter (where ${orchestrationTasks.status} = 'completed')`,
    }).from(orchestrationTasks).where(and(
      eq(orchestrationTasks.companyId, companyId),
      eq(orchestrationTasks.agentId, agent.id),
      gte(orchestrationTasks.createdAt, thirtyDaysAgo),
    ))

    const total = taskStats[0]?.total ?? 0
    const completed = taskStats[0]?.completed ?? 0
    const successRate = total > 0 ? (completed / total) * 100 : 0

    const costStats = await db.select({
      totalMicro: sql<number>`coalesce(sum(${costRecords.costUsdMicro}), 0)`,
    }).from(costRecords).where(and(
      eq(costRecords.companyId, companyId),
      eq(costRecords.agentId, agent.id),
      gte(costRecords.createdAt, thirtyDaysAgo),
    ))
    const totalCost = (costStats[0]?.totalMicro ?? 0) / 1_000_000

    // Quality avg score
    const qualityStats = await db.select({
      avgScore: sql<number>`coalesce(avg(
        (coalesce((${qualityReviews.scores}->>'conclusionQuality')::numeric, 0) +
         coalesce((${qualityReviews.scores}->>'evidenceSources')::numeric, 0) +
         coalesce((${qualityReviews.scores}->>'riskAssessment')::numeric, 0) +
         coalesce((${qualityReviews.scores}->>'formatCompliance')::numeric, 0) +
         coalesce((${qualityReviews.scores}->>'logicalCoherence')::numeric, 0)) / 5.0
      ), 0)`,
    }).from(qualityReviews)
      .innerJoin(orchestrationTasks, and(
        eq(qualityReviews.commandId, orchestrationTasks.commandId),
        eq(orchestrationTasks.agentId, agent.id),
      ))
      .where(and(
        eq(qualityReviews.companyId, companyId),
        gte(qualityReviews.createdAt, thirtyDaysAgo),
      ))

    const qualityScore = qualityStats[0]?.avgScore ?? 0
    const costEfficiency = total > 0 ? totalCost / total : 999 // lower is better

    let value: number
    if (metric === 'successRate') value = successRate
    else if (metric === 'qualityScore') value = qualityScore
    else value = costEfficiency

    return {
      agentId: agent.id,
      agentName: agent.name,
      tier: agent.tier,
      departmentName: agent.departmentName || '미배정',
      value: Math.round(value * 100) / 100,
      metric,
      _taskCount: total,
    }
  }))

  // Filter agents with at least 1 task
  const active = rankings.filter((r) => r._taskCount > 0)

  // Sort: successRate/qualityScore desc, costEfficiency asc
  active.sort((a, b) => metric === 'costEfficiency' ? a.value - b.value : b.value - a.value)

  return active.slice(0, topN).map((r, i) => ({
    rank: i + 1,
    agentId: r.agentId,
    agentName: r.agentName,
    tier: r.tier,
    departmentName: r.departmentName,
    value: r.value,
    metric: r.metric,
  }))
}
