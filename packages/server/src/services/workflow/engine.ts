import { db } from '../../db'
import { workflows, workflowExecutions } from '../../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

// === Step Type Definitions ===

export interface WorkflowStep {
  id: string
  name: string
  type: 'tool' | 'llm' | 'condition'
  action: string
  params?: Record<string, any>
  agentId?: string
  dependsOn?: string[]
  // condition 전용
  trueBranch?: string
  falseBranch?: string
  // llm 전용
  systemPrompt?: string
  // 공통
  timeout?: number
  retryCount?: number
}

// === DAG Validation ===

export interface DagValidationResult {
  valid: boolean
  errors: string[]
  layers?: WorkflowStep[][] // topologically sorted layers (for parallel execution)
}

/**
 * DAG 유효성 검증: 순환 참조 탐지 + stepId 참조 검증 + condition 분기 검증
 */
export function validateDag(steps: WorkflowStep[]): DagValidationResult {
  const errors: string[] = []
  const stepIds = new Set(steps.map(s => s.id))

  // 1. stepId 중복 검사
  if (stepIds.size !== steps.length) {
    const seen = new Set<string>()
    for (const s of steps) {
      if (seen.has(s.id)) errors.push(`중복된 스텝 ID: ${s.id}`)
      seen.add(s.id)
    }
  }

  // 2. dependsOn 참조 검증
  for (const step of steps) {
    if (step.dependsOn) {
      for (const dep of step.dependsOn) {
        if (!stepIds.has(dep)) {
          errors.push(`스텝 "${step.name}"(${step.id})의 dependsOn이 존재하지 않는 스텝을 참조: ${dep}`)
        }
        if (dep === step.id) {
          errors.push(`스텝 "${step.name}"(${step.id})이 자기 자신을 참조`)
        }
      }
    }
  }

  // 3. condition 분기 검증
  for (const step of steps) {
    if (step.type === 'condition') {
      if (step.trueBranch && !stepIds.has(step.trueBranch)) {
        errors.push(`스텝 "${step.name}"의 trueBranch가 존재하지 않는 스텝을 참조: ${step.trueBranch}`)
      }
      if (step.falseBranch && !stepIds.has(step.falseBranch)) {
        errors.push(`스텝 "${step.name}"의 falseBranch가 존재하지 않는 스텝을 참조: ${step.falseBranch}`)
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  // 4. Kahn's algorithm으로 순환 참조 탐지 + 레이어 분류
  const inDegree: Record<string, number> = {}
  const graph: Record<string, string[]> = {}
  const stepMap = new Map<string, WorkflowStep>()

  for (const s of steps) {
    stepMap.set(s.id, s)
    inDegree[s.id] = 0
    graph[s.id] = []
  }

  for (const s of steps) {
    if (s.dependsOn) {
      for (const dep of s.dependsOn) {
        graph[dep].push(s.id)
        inDegree[s.id]++
      }
    }
  }

  const layers: WorkflowStep[][] = []
  let queue = Object.keys(inDegree).filter(id => inDegree[id] === 0)

  while (queue.length > 0) {
    layers.push(queue.map(id => stepMap.get(id)!))
    const nextQueue: string[] = []
    for (const id of queue) {
      for (const neighbor of graph[id]) {
        inDegree[neighbor]--
        if (inDegree[neighbor] === 0) {
          nextQueue.push(neighbor)
        }
      }
    }
    queue = nextQueue
  }

  const visitedCount = layers.reduce((acc, l) => acc + l.length, 0)
  if (visitedCount !== steps.length) {
    return { valid: false, errors: ['워크플로우에 순환 의존성이 있습니다'] }
  }

  return { valid: true, errors: [], layers }
}

// === Workflow Service (CRUD) ===

export class WorkflowService {

  /** 워크플로우 생성 */
  static async create(params: {
    companyId: string
    name: string
    description?: string
    steps: WorkflowStep[]
    createdBy: string
  }) {
    // DAG 유효성 검증
    const validation = validateDag(params.steps)
    if (!validation.valid) {
      return { success: false as const, errors: validation.errors }
    }

    const [workflow] = await db.insert(workflows)
      .values({
        companyId: params.companyId,
        name: params.name,
        description: params.description ?? null,
        steps: params.steps,
        createdBy: params.createdBy,
      })
      .returning()

    return { success: true as const, data: workflow }
  }

  /** 워크플로우 목록 조회 (활성만, 최신순) */
  static async list(companyId: string, opts?: { page?: number; limit?: number }) {
    const page = opts?.page ?? 1
    const limit = opts?.limit ?? 20
    const offset = (page - 1) * limit

    const [results, countResult] = await Promise.all([
      db.query.workflows.findMany({
        where: and(
          eq(workflows.companyId, companyId),
          eq(workflows.isActive, true),
        ),
        orderBy: [desc(workflows.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)::int` })
        .from(workflows)
        .where(and(
          eq(workflows.companyId, companyId),
          eq(workflows.isActive, true),
        )),
    ])

    return {
      data: results,
      meta: { page, total: countResult[0]?.count ?? 0 },
    }
  }

  /** 워크플로우 단건 조회 (최근 실행 이력 5건 포함) */
  static async getById(id: string, companyId: string) {
    const workflow = await db.query.workflows.findFirst({
      where: and(
        eq(workflows.id, id),
        eq(workflows.companyId, companyId),
        eq(workflows.isActive, true),
      ),
    })

    if (!workflow) return null

    // 최근 실행 이력 5건
    const recentExecutions = await db.query.workflowExecutions.findMany({
      where: and(
        eq(workflowExecutions.workflowId, id),
        eq(workflowExecutions.companyId, companyId),
      ),
      orderBy: [desc(workflowExecutions.createdAt)],
      limit: 5,
    })

    return { ...workflow, recentExecutions }
  }

  /** 워크플로우 수정 */
  static async update(id: string, companyId: string, updates: {
    name?: string
    description?: string
    steps?: WorkflowStep[]
  }) {
    // 존재 여부 + 활성 상태 확인
    const existing = await db.query.workflows.findFirst({
      where: and(
        eq(workflows.id, id),
        eq(workflows.companyId, companyId),
      ),
    })

    if (!existing) return { success: false as const, error: 'NOT_FOUND' as const }
    if (!existing.isActive) return { success: false as const, error: 'INACTIVE' as const }

    // steps 변경 시 DAG 유효성 검증
    if (updates.steps) {
      const validation = validateDag(updates.steps)
      if (!validation.valid) {
        return { success: false as const, error: 'INVALID_DAG' as const, errors: validation.errors }
      }
    }

    const [updated] = await db.update(workflows)
      .set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.steps !== undefined && { steps: updates.steps }),
        updatedAt: new Date(),
      })
      .where(and(eq(workflows.id, id), eq(workflows.companyId, companyId)))
      .returning()

    return { success: true as const, data: updated }
  }

  /** 워크플로우 소프트 삭제 */
  static async softDelete(id: string, companyId: string) {
    const existing = await db.query.workflows.findFirst({
      where: and(
        eq(workflows.id, id),
        eq(workflows.companyId, companyId),
        eq(workflows.isActive, true),
      ),
    })

    if (!existing) return { success: false as const, error: 'NOT_FOUND' as const }

    await db.update(workflows)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(workflows.id, id), eq(workflows.companyId, companyId)))

    return { success: true as const }
  }
}
