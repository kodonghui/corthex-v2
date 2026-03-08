import { db } from '../../db'
import { eq, desc } from 'drizzle-orm'
import { workflows, workflowExecutions } from '../../db/schema'

export interface WorkflowAnalytics {
  workflowId: string
  totalExecutions: number
  successRatePercent: number
  averageDurationMs: number
  bottlenecks: { stepId: string, averageMs: number, relativeTimePercent: number }[]
  flakySteps: { stepId: string, failureRatePercent: number }[]
  timeSeries: { date: string, durationMs: number }[] // For UI charts
}

export class WorkflowAnalyticsService {
  static async getAnalytics(workflowId: string, companyId: string): Promise<WorkflowAnalytics> {
    const executions = await db.select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.workflowId, workflowId))
      .orderBy(desc(workflowExecutions.createdAt))
      .limit(100) // Analyze up to last 100 executions for performance

    // Handle 0-execution gracefully
    if (executions.length === 0) {
      return {
        workflowId,
        totalExecutions: 0,
        successRatePercent: 0,
        averageDurationMs: 0,
        bottlenecks: [],
        flakySteps: [],
        timeSeries: []
      }
    }

    const total = executions.length
    let successes = 0
    let totalDuration = 0
    const stepStats = new Map<string, { totalMs: number, failures: number, count: number }>()

    const timeSeries = executions.map(ex => ({
      date: ex.createdAt.toISOString(),
      durationMs: ex.totalDurationMs,
    })).reverse() // Chronological order

    executions.forEach(ex => {
      if (ex.status === 'success') successes++
      totalDuration += ex.totalDurationMs

      const steps: any[] = ex.stepSummaries as any[]
      steps.forEach(step => {
        const stats = stepStats.get(step.id) || { totalMs: 0, failures: 0, count: 0 }
        stats.count++
        stats.totalMs += step.durationMs
        if (step.state === 'failed') stats.failures++
        stepStats.set(step.id, stats)
      })
    })

    const avgDuration = totalDuration / total
    const bottlenecks: any[] = []
    const flakySteps: any[] = []

    stepStats.forEach((stats, stepId) => {
      const stepAvgMs = stats.totalMs / stats.count
      const relativeTime = avgDuration > 0 ? (stepAvgMs / avgDuration) * 100 : 0
      const failRate = (stats.failures / stats.count) * 100

      // Bottleneck: takes > 50% relative time OR Outlier via simple hard threshold
      if (relativeTime > 50 && stepAvgMs > 200) {
        bottlenecks.push({ stepId, averageMs: Math.round(stepAvgMs), relativeTimePercent: Math.round(relativeTime) })
      }

      // Flaky: fails > 10% of the time
      if (failRate > 10) {
        flakySteps.push({ stepId, failureRatePercent: Math.round(failRate) })
      }
    })

    return {
      workflowId,
      totalExecutions: total,
      successRatePercent: Math.round((successes / total) * 100),
      averageDurationMs: Math.round(avgDuration),
      bottlenecks,
      flakySteps,
      timeSeries
    }
  }
}
