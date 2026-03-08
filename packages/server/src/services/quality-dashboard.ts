import { eq, and, gte, sql, count, desc } from 'drizzle-orm'
import { db } from '../db'
import { qualityReviews, agents, departments, commands } from '../db/schema'

// === Types ===

type QualityDashboardParams = {
  companyId: string
  period?: '7d' | '30d' | 'all'
  departmentId?: string
}

type QualitySummary = {
  totalReviews: number
  passCount: number
  failCount: number
  passRate: number
  avgScore: number
}

type TrendItem = {
  date: string
  passCount: number
  failCount: number
}

type DepartmentStat = {
  departmentId: string
  departmentName: string
  totalReviews: number
  passRate: number
  avgScore: number
}

type AgentStat = {
  agentId: string
  agentName: string
  departmentName: string
  totalReviews: number
  passRate: number
  avgScore: number
  recentFailCount: number
}

type FailedItem = {
  reviewId: string
  commandId: string
  commandText: string
  agentName: string
  avgScore: number
  feedback: string | null
  attemptNumber: number
  createdAt: string
}

export type QualityDashboardData = {
  summary: QualitySummary
  trend: TrendItem[]
  departmentStats: DepartmentStat[]
  agentStats: AgentStat[]
  failedList: FailedItem[]
}

// === Score calculation helper (matches operation-log-service.ts pattern) ===

function avgScoreExpr() {
  return sql<number>`
    (COALESCE((${qualityReviews.scores}->>'conclusionQuality')::numeric, 0) +
     COALESCE((${qualityReviews.scores}->>'evidenceSources')::numeric, 0) +
     COALESCE((${qualityReviews.scores}->>'riskAssessment')::numeric, 0) +
     COALESCE((${qualityReviews.scores}->>'formatCompliance')::numeric, 0) +
     COALESCE((${qualityReviews.scores}->>'logicalCoherence')::numeric, 0)) / 5.0
  `
}

function periodToDate(period: '7d' | '30d' | 'all'): Date | null {
  if (period === 'all') return null
  const d = new Date()
  d.setDate(d.getDate() - (period === '7d' ? 7 : 30))
  d.setHours(0, 0, 0, 0)
  return d
}

// === Main query ===

export async function getQualityDashboard(params: QualityDashboardParams): Promise<QualityDashboardData> {
  const { companyId, period = '30d', departmentId } = params
  const sinceDate = periodToDate(period)

  const [summary, trend, departmentStats, agentStats, failedList] = await Promise.all([
    getSummary(companyId, sinceDate, departmentId),
    getTrend(companyId, sinceDate, departmentId),
    getDepartmentStats(companyId, sinceDate),
    getAgentStats(companyId, sinceDate, departmentId),
    getFailedList(companyId, sinceDate, departmentId),
  ])

  return { summary, trend, departmentStats, agentStats, failedList }
}

// === Summary ===

async function getSummary(companyId: string, sinceDate: Date | null, departmentId?: string): Promise<QualitySummary> {
  const conditions = [eq(qualityReviews.companyId, companyId)]
  if (sinceDate) conditions.push(gte(qualityReviews.createdAt, sinceDate))
  if (departmentId) {
    // Filter by department via agent
    const agentIds = await getAgentIdsByDepartment(companyId, departmentId)
    if (agentIds.length === 0) return { totalReviews: 0, passCount: 0, failCount: 0, passRate: 0, avgScore: 0 }
    conditions.push(sql`${qualityReviews.reviewerAgentId} = ANY(${agentIds})`)
  }

  const rows = await db
    .select({
      totalReviews: count(),
      passCount: sql<number>`SUM(CASE WHEN ${qualityReviews.conclusion} = 'pass' THEN 1 ELSE 0 END)`,
      failCount: sql<number>`SUM(CASE WHEN ${qualityReviews.conclusion} = 'fail' THEN 1 ELSE 0 END)`,
      avgScore: sql<number>`AVG(${avgScoreExpr()})`,
    })
    .from(qualityReviews)
    .where(and(...conditions))

  const row = rows[0]
  const total = Number(row?.totalReviews ?? 0)
  const pass = Number(row?.passCount ?? 0)
  const fail = Number(row?.failCount ?? 0)
  const avg = Number(row?.avgScore ?? 0)

  return {
    totalReviews: total,
    passCount: pass,
    failCount: fail,
    passRate: total > 0 ? Math.round((pass / total) * 1000) / 10 : 0,
    avgScore: Math.round(avg * 100) / 100,
  }
}

// === Trend ===

async function getTrend(companyId: string, sinceDate: Date | null, departmentId?: string): Promise<TrendItem[]> {
  const conditions = [eq(qualityReviews.companyId, companyId)]
  if (sinceDate) conditions.push(gte(qualityReviews.createdAt, sinceDate))
  if (departmentId) {
    const agentIds = await getAgentIdsByDepartment(companyId, departmentId)
    if (agentIds.length === 0) return []
    conditions.push(sql`${qualityReviews.reviewerAgentId} = ANY(${agentIds})`)
  }

  const rows = await db
    .select({
      date: sql<string>`DATE(${qualityReviews.createdAt})`.as('review_date'),
      passCount: sql<number>`SUM(CASE WHEN ${qualityReviews.conclusion} = 'pass' THEN 1 ELSE 0 END)`,
      failCount: sql<number>`SUM(CASE WHEN ${qualityReviews.conclusion} = 'fail' THEN 1 ELSE 0 END)`,
    })
    .from(qualityReviews)
    .where(and(...conditions))
    .groupBy(sql`DATE(${qualityReviews.createdAt})`)
    .orderBy(sql`DATE(${qualityReviews.createdAt})`)

  return rows.map((r) => ({
    date: String(r.date),
    passCount: Number(r.passCount),
    failCount: Number(r.failCount),
  }))
}

// === Department Stats ===

async function getDepartmentStats(companyId: string, sinceDate: Date | null): Promise<DepartmentStat[]> {
  const conditions = [eq(qualityReviews.companyId, companyId)]
  if (sinceDate) conditions.push(gte(qualityReviews.createdAt, sinceDate))

  const rows = await db
    .select({
      departmentId: agents.departmentId,
      departmentName: departments.name,
      totalReviews: count(),
      passCount: sql<number>`SUM(CASE WHEN ${qualityReviews.conclusion} = 'pass' THEN 1 ELSE 0 END)`,
      avgScore: sql<number>`AVG(${avgScoreExpr()})`,
    })
    .from(qualityReviews)
    .innerJoin(agents, eq(qualityReviews.reviewerAgentId, agents.id))
    .innerJoin(departments, eq(agents.departmentId, departments.id))
    .where(and(...conditions))
    .groupBy(agents.departmentId, departments.name)
    .orderBy(desc(count()))

  return rows
    .filter((r) => r.departmentId !== null)
    .map((r) => {
      const total = Number(r.totalReviews)
      const pass = Number(r.passCount)
      return {
        departmentId: r.departmentId!,
        departmentName: r.departmentName,
        totalReviews: total,
        passRate: total > 0 ? Math.round((pass / total) * 1000) / 10 : 0,
        avgScore: Math.round(Number(r.avgScore) * 100) / 100,
      }
    })
}

// === Agent Stats ===

async function getAgentStats(companyId: string, sinceDate: Date | null, departmentId?: string): Promise<AgentStat[]> {
  const conditions = [eq(qualityReviews.companyId, companyId)]
  if (sinceDate) conditions.push(gte(qualityReviews.createdAt, sinceDate))
  if (departmentId) {
    conditions.push(eq(agents.departmentId, departmentId))
  }

  // Recent fail count (last 7 days)
  const recentDate = new Date()
  recentDate.setDate(recentDate.getDate() - 7)

  const rows = await db
    .select({
      agentId: qualityReviews.reviewerAgentId,
      agentName: agents.name,
      departmentName: sql<string>`COALESCE(${departments.name}, '미배속')`,
      totalReviews: count(),
      passCount: sql<number>`SUM(CASE WHEN ${qualityReviews.conclusion} = 'pass' THEN 1 ELSE 0 END)`,
      avgScore: sql<number>`AVG(${avgScoreExpr()})`,
      recentFailCount: sql<number>`SUM(CASE WHEN ${qualityReviews.conclusion} = 'fail' AND ${qualityReviews.createdAt} >= ${recentDate} THEN 1 ELSE 0 END)`,
    })
    .from(qualityReviews)
    .innerJoin(agents, eq(qualityReviews.reviewerAgentId, agents.id))
    .leftJoin(departments, eq(agents.departmentId, departments.id))
    .where(and(...conditions))
    .groupBy(qualityReviews.reviewerAgentId, agents.name, departments.name)
    .orderBy(desc(count()))

  return rows.map((r) => {
    const total = Number(r.totalReviews)
    const pass = Number(r.passCount)
    return {
      agentId: r.agentId,
      agentName: r.agentName,
      departmentName: r.departmentName,
      totalReviews: total,
      passRate: total > 0 ? Math.round((pass / total) * 1000) / 10 : 0,
      avgScore: Math.round(Number(r.avgScore) * 100) / 100,
      recentFailCount: Number(r.recentFailCount),
    }
  })
}

// === Failed List ===

async function getFailedList(companyId: string, sinceDate: Date | null, departmentId?: string): Promise<FailedItem[]> {
  const conditions = [
    eq(qualityReviews.companyId, companyId),
    eq(qualityReviews.conclusion, 'fail'),
  ]
  if (sinceDate) conditions.push(gte(qualityReviews.createdAt, sinceDate))
  if (departmentId) {
    const agentIds = await getAgentIdsByDepartment(companyId, departmentId)
    if (agentIds.length === 0) return []
    conditions.push(sql`${qualityReviews.reviewerAgentId} = ANY(${agentIds})`)
  }

  const rows = await db
    .select({
      reviewId: qualityReviews.id,
      commandId: qualityReviews.commandId,
      commandText: commands.text,
      agentName: agents.name,
      avgScore: avgScoreExpr(),
      feedback: qualityReviews.feedback,
      attemptNumber: qualityReviews.attemptNumber,
      createdAt: qualityReviews.createdAt,
    })
    .from(qualityReviews)
    .innerJoin(commands, eq(qualityReviews.commandId, commands.id))
    .innerJoin(agents, eq(qualityReviews.reviewerAgentId, agents.id))
    .where(and(...conditions))
    .orderBy(desc(qualityReviews.createdAt))
    .limit(20)

  return rows.map((r) => ({
    reviewId: r.reviewId,
    commandId: r.commandId,
    commandText: r.commandText ? (r.commandText.length > 100 ? r.commandText.slice(0, 100) + '…' : r.commandText) : '',
    agentName: r.agentName,
    avgScore: Math.round(Number(r.avgScore) * 100) / 100,
    feedback: r.feedback,
    attemptNumber: r.attemptNumber,
    createdAt: r.createdAt.toISOString(),
  }))
}

// === Helpers ===

async function getAgentIdsByDepartment(companyId: string, departmentId: string): Promise<string[]> {
  const rows = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.companyId, companyId), eq(agents.departmentId, departmentId)))

  return rows.map((r) => r.id)
}
