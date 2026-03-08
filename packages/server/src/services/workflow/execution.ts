import { db } from '../../db'
import { workflowExecutions } from '../../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { WorkflowEngine } from '../../lib/workflow/engine'
import type { WorkflowStep } from './engine'

type WorkflowInput = {
  id: string
  companyId: string
  name: string
  steps: WorkflowStep[] | unknown
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * 워크플로우 실행 서비스
 * WorkflowEngine을 호출하여 실행하고, 결과를 DB에 기록
 */
export class WorkflowExecutionService {

  /** 워크플로우 실행 + DB 기록 */
  static async execute(params: {
    workflow: WorkflowInput
    companyId: string
    triggeredBy: string
  }) {
    const { workflow, companyId, triggeredBy } = params
    const steps = workflow.steps as WorkflowStep[]

    const engine = new WorkflowEngine({
      id: workflow.id,
      name: workflow.name,
      companyId: workflow.companyId,
      steps,
      isActive: workflow.isActive,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    })

    const result = await engine.run()

    // DB에 실행 기록 저장
    const stepSummaries = result.results.map(r => ({
      stepId: r.id,
      stepName: r.name,
      status: r.state,
      output: r.output ?? null,
      durationMs: r.durationMs,
      error: r.error ?? null,
    }))

    const [execution] = await db.insert(workflowExecutions)
      .values({
        companyId,
        workflowId: workflow.id,
        status: result.success ? 'success' : 'failed',
        totalDurationMs: result.totalDurationMs,
        stepSummaries,
        triggeredBy,
      })
      .returning()

    return {
      executionId: execution.id,
      status: execution.status,
      totalDurationMs: execution.totalDurationMs,
      stepSummaries,
    }
  }

  /** 워크플로우 실행 이력 조회 */
  static async list(workflowId: string, companyId: string, opts?: { page?: number; limit?: number }) {
    const page = opts?.page ?? 1
    const limit = opts?.limit ?? 20
    const offset = (page - 1) * limit

    const [results, countResult] = await Promise.all([
      db.query.workflowExecutions.findMany({
        where: and(
          eq(workflowExecutions.workflowId, workflowId),
          eq(workflowExecutions.companyId, companyId),
        ),
        orderBy: [desc(workflowExecutions.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)::int` })
        .from(workflowExecutions)
        .where(and(
          eq(workflowExecutions.workflowId, workflowId),
          eq(workflowExecutions.companyId, companyId),
        )),
    ])

    return {
      data: results,
      meta: { page, total: countResult[0]?.count ?? 0 },
    }
  }
}
