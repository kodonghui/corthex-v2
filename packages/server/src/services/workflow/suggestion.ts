import { db } from '../../db'
import { workflowSuggestions } from '../../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { WorkflowService, type WorkflowStep } from './engine'

// === Types ===

export type SuggestionListResult = {
  data: typeof workflowSuggestions.$inferSelect[]
  meta: { page: number; total: number }
}

// === Service ===

export class WorkflowSuggestionService {

  /** pending 제안 목록 조회 (companyId + userId 격리) */
  static async list(
    companyId: string,
    userId: string,
    opts?: { page?: number; limit?: number }
  ): Promise<SuggestionListResult> {
    const page = opts?.page ?? 1
    const limit = opts?.limit ?? 20
    const offset = (page - 1) * limit

    const [results, countResult] = await Promise.all([
      db.query.workflowSuggestions.findMany({
        where: and(
          eq(workflowSuggestions.companyId, companyId),
          eq(workflowSuggestions.userId, userId),
          eq(workflowSuggestions.status, 'pending'),
        ),
        orderBy: [desc(workflowSuggestions.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)::int` })
        .from(workflowSuggestions)
        .where(and(
          eq(workflowSuggestions.companyId, companyId),
          eq(workflowSuggestions.userId, userId),
          eq(workflowSuggestions.status, 'pending'),
        )),
    ])

    return {
      data: results,
      meta: { page, total: countResult[0]?.count ?? 0 },
    }
  }

  /** 제안 수락 → workflows 테이블에 실제 워크플로우 생성 */
  static async accept(
    id: string,
    companyId: string,
    userId: string
  ): Promise<{ success: true; workflowId: string } | { success: false; error: string }> {
    // 1. 제안 조회 + 권한 확인
    const suggestion = await db.query.workflowSuggestions.findFirst({
      where: and(
        eq(workflowSuggestions.id, id),
        eq(workflowSuggestions.companyId, companyId),
        eq(workflowSuggestions.userId, userId),
      ),
    })

    if (!suggestion) {
      return { success: false, error: 'NOT_FOUND' }
    }
    if (suggestion.status !== 'pending') {
      return { success: false, error: 'ALREADY_PROCESSED' }
    }

    // 2. suggestedSteps → WorkflowService.create()
    const steps = suggestion.suggestedSteps as WorkflowStep[]
    const workflowResult = await WorkflowService.create({
      companyId,
      name: `자동 제안: ${steps.map(s => s.action).join(' → ')}`,
      description: suggestion.reason,
      steps,
      createdBy: userId,
    })

    if (!workflowResult.success) {
      return { success: false, error: 'INVALID_WORKFLOW' }
    }

    // 3. 제안 상태 업데이트
    await db.update(workflowSuggestions)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(workflowSuggestions.id, id))

    return { success: true, workflowId: workflowResult.data.id }
  }

  /** 제안 거절 */
  static async reject(
    id: string,
    companyId: string,
    userId: string
  ): Promise<{ success: true } | { success: false; error: string }> {
    const suggestion = await db.query.workflowSuggestions.findFirst({
      where: and(
        eq(workflowSuggestions.id, id),
        eq(workflowSuggestions.companyId, companyId),
        eq(workflowSuggestions.userId, userId),
      ),
    })

    if (!suggestion) {
      return { success: false, error: 'NOT_FOUND' }
    }
    if (suggestion.status !== 'pending') {
      return { success: false, error: 'ALREADY_PROCESSED' }
    }

    await db.update(workflowSuggestions)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(workflowSuggestions.id, id))

    return { success: true }
  }
}
