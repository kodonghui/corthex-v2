import { db } from '../db'
import { costRecords, agents, departments } from '../db/schema'
import { sql, and, eq, gte, lte, sum, count, desc, inArray } from 'drizzle-orm'
import { getModelConfig } from '../config/models'
import type {
  AdminCostByAgent,
  AdminCostByModel,
  AdminCostByDepartment,
  AdminCostSummary,
  AdminCostDaily,
} from '@corthex/shared'

export type DateRange = { startDate: Date; endDate: Date }

function dateConditions(companyId: string, range: DateRange) {
  return [
    eq(costRecords.companyId, companyId),
    gte(costRecords.createdAt, range.startDate),
    lte(costRecords.createdAt, range.endDate),
  ]
}

/**
 * Cost per agent (GROUP BY agentId, JOIN agents for name)
 */
export async function getByAgent(companyId: string, range: DateRange, departmentIds?: string[]): Promise<AdminCostByAgent[]> {
  const conditions = dateConditions(companyId, range)

  // Employee department scope: only include agents from assigned departments
  if (departmentIds) {
    if (departmentIds.length === 0) return []
    conditions.push(inArray(agents.departmentId, departmentIds))
  }

  const rows = await db
    .select({
      agentId: costRecords.agentId,
      agentName: agents.name,
      totalCostMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      inputTokens: sum(costRecords.inputTokens).mapWith(Number),
      outputTokens: sum(costRecords.outputTokens).mapWith(Number),
      callCount: count(),
    })
    .from(costRecords)
    .leftJoin(agents, eq(costRecords.agentId, agents.id))
    .where(and(...conditions))
    .groupBy(costRecords.agentId, agents.name)
    .orderBy(desc(sum(costRecords.costUsdMicro)))

  return rows.map(r => ({
    agentId: r.agentId ?? 'system',
    agentName: r.agentName ?? 'System',
    totalCostMicro: r.totalCostMicro ?? 0,
    inputTokens: r.inputTokens ?? 0,
    outputTokens: r.outputTokens ?? 0,
    callCount: r.callCount ?? 0,
  }))
}

/**
 * Cost per model (GROUP BY model, provider)
 */
export async function getByModel(companyId: string, range: DateRange): Promise<AdminCostByModel[]> {
  const rows = await db
    .select({
      model: costRecords.model,
      provider: costRecords.provider,
      totalCostMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      inputTokens: sum(costRecords.inputTokens).mapWith(Number),
      outputTokens: sum(costRecords.outputTokens).mapWith(Number),
      callCount: count(),
    })
    .from(costRecords)
    .where(and(...dateConditions(companyId, range)))
    .groupBy(costRecords.model, costRecords.provider)
    .orderBy(desc(sum(costRecords.costUsdMicro)))

  return rows.map(r => ({
    model: r.model,
    provider: r.provider,
    displayName: getModelConfig(r.model)?.displayName ?? r.model,
    totalCostMicro: r.totalCostMicro ?? 0,
    inputTokens: r.inputTokens ?? 0,
    outputTokens: r.outputTokens ?? 0,
    callCount: r.callCount ?? 0,
  }))
}

/**
 * Cost per department (JOIN agents -> departments)
 */
export async function getByDepartment(companyId: string, range: DateRange): Promise<AdminCostByDepartment[]> {
  const rows = await db
    .select({
      departmentId: departments.id,
      departmentName: departments.name,
      totalCostMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      agentCount: sql<number>`COUNT(DISTINCT ${costRecords.agentId})`.mapWith(Number),
      callCount: count(),
    })
    .from(costRecords)
    .innerJoin(agents, eq(costRecords.agentId, agents.id))
    .innerJoin(departments, eq(agents.departmentId, departments.id))
    .where(and(...dateConditions(companyId, range)))
    .groupBy(departments.id, departments.name)
    .orderBy(desc(sum(costRecords.costUsdMicro)))

  return rows.map(r => ({
    departmentId: r.departmentId,
    departmentName: r.departmentName,
    totalCostMicro: r.totalCostMicro ?? 0,
    agentCount: r.agentCount ?? 0,
    callCount: r.callCount ?? 0,
  }))
}

/**
 * Overall summary with trend calculation
 */
export async function getSummary(companyId: string, range: DateRange): Promise<AdminCostSummary> {
  // Current period totals
  const [current] = await db
    .select({
      totalCostMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      totalInputTokens: sum(costRecords.inputTokens).mapWith(Number),
      totalOutputTokens: sum(costRecords.outputTokens).mapWith(Number),
      totalCalls: count(),
    })
    .from(costRecords)
    .where(and(...dateConditions(companyId, range)))

  // By provider
  const providerRows = await db
    .select({
      provider: costRecords.provider,
      costMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      callCount: count(),
    })
    .from(costRecords)
    .where(and(...dateConditions(companyId, range)))
    .groupBy(costRecords.provider)
    .orderBy(desc(sum(costRecords.costUsdMicro)))

  // Previous period for trend
  const periodMs = range.endDate.getTime() - range.startDate.getTime()
  const prevStart = new Date(range.startDate.getTime() - periodMs)
  const prevEnd = new Date(range.startDate.getTime())

  const [previous] = await db
    .select({
      totalCostMicro: sum(costRecords.costUsdMicro).mapWith(Number),
    })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, companyId),
      gte(costRecords.createdAt, prevStart),
      sql`${costRecords.createdAt} < ${prevEnd}`,
    ))

  const currentCost = current?.totalCostMicro ?? 0
  const previousCost = previous?.totalCostMicro ?? 0
  let trendPercent = 0
  if (previousCost > 0) {
    trendPercent = Math.round(((currentCost - previousCost) / previousCost) * 100 * 10) / 10
  } else if (currentCost > 0) {
    trendPercent = 100
  }

  return {
    totalCostMicro: currentCost,
    totalInputTokens: current?.totalInputTokens ?? 0,
    totalOutputTokens: current?.totalOutputTokens ?? 0,
    totalCalls: current?.totalCalls ?? 0,
    byProvider: providerRows.map(r => ({
      provider: r.provider,
      costMicro: r.costMicro ?? 0,
      callCount: r.callCount ?? 0,
    })),
    trendPercent,
  }
}

/**
 * Daily time series for charts
 */
export async function getDaily(companyId: string, range: DateRange): Promise<AdminCostDaily[]> {
  const rows = await db
    .select({
      date: sql<string>`DATE(${costRecords.createdAt})`.as('date'),
      costMicro: sum(costRecords.costUsdMicro).mapWith(Number),
      inputTokens: sum(costRecords.inputTokens).mapWith(Number),
      outputTokens: sum(costRecords.outputTokens).mapWith(Number),
      callCount: count(),
    })
    .from(costRecords)
    .where(and(...dateConditions(companyId, range)))
    .groupBy(sql`DATE(${costRecords.createdAt})`)
    .orderBy(sql`DATE(${costRecords.createdAt})`)

  return rows.map(r => ({
    date: String(r.date),
    costMicro: r.costMicro ?? 0,
    inputTokens: r.inputTokens ?? 0,
    outputTokens: r.outputTokens ?? 0,
    callCount: r.callCount ?? 0,
  }))
}
