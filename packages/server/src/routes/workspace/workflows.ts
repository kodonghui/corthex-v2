import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { workflows } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { isCeoOrAbove } from '@corthex/shared'
import { WorkflowEngine } from '../../lib/workflow/engine'
import { WorkflowAnalyticsService } from '../../services/workflow/analytics.service'
import { PredictiveInsightsService } from '../../services/workflow/predictive-insights.service'
import type { AppEnv } from '../../types'

export const workflowsRoute = new Hono<AppEnv>()

workflowsRoute.use('*', authMiddleware)

// Zod schemas
const workflowStepSchema = z.object({
  id: z.string().min(1, '스텝 ID는 필수입니다.'),
  type: z.enum(['tool', 'llm', 'condition']),
  action: z.string().min(1, '액션은 필수입니다.'),
  params: z.record(z.unknown()).optional(),
  dependsOn: z.array(z.string()).optional(),
})

const createWorkflowSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다.').max(200),
  description: z.string().max(2000).optional(),
  steps: z.array(workflowStepSchema).min(1, '최소 1개 이상의 스텝이 필요합니다.'),
}).superRefine((data, ctx) => {
  const stepIds = new Set<string>()
  const allIds = data.steps.map(s => s.id)
  
  data.steps.forEach((step, index) => {
    // 중복 ID 체크
    if (stepIds.has(step.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `중복된 스텝 ID가 발견되었습니다: ${step.id}`,
        path: ['steps', index, 'id'],
      })
    }
    stepIds.add(step.id)

    // 존재하지 않는 의존성 체크
    if (step.dependsOn) {
      step.dependsOn.forEach((depId, depIndex) => {
        if (!allIds.includes(depId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `존재하지 않는 스텝을 참조하고 있습니다: ${depId}`,
            path: ['steps', index, 'dependsOn', depIndex],
          })
        }
        // 자기 참조 체크
        if (depId === step.id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `자기 자신을 의존성으로 가질 수 없습니다: ${depId}`,
            path: ['steps', index, 'dependsOn', depIndex],
          })
        }
      })
    }
  })
})

const updateWorkflowSchema = createWorkflowSchema.partial().extend({
  isActive: z.boolean().optional(),
})

// GET /api/workspace/workflows 
workflowsRoute.get('/workflows', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: workflows.id,
      name: workflows.name,
      description: workflows.description,
      steps: workflows.steps,
      isActive: workflows.isActive,
      createdBy: workflows.createdBy,
      createdAt: workflows.createdAt,
      updatedAt: workflows.updatedAt,
    })
    .from(workflows)
    .where(and(eq(workflows.companyId, tenant.companyId), eq(workflows.isActive, true)))
    .orderBy(desc(workflows.createdAt))

  return c.json({ data: result })
})

// GET /api/workspace/workflows/:id
workflowsRoute.get('/workflows/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.companyId, tenant.companyId), eq(workflows.isActive, true)))
    .limit(1)

  if (!workflow) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'WF_001')

  return c.json({ data: workflow })
})

// GET /workflows/:id/analytics: 워크플로우 통계
workflowsRoute.get('/workflows/:id/analytics', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  try {
    const analytics = await WorkflowAnalyticsService.getAnalytics(id, tenant.companyId)
    return c.json({ success: true, data: analytics })
  } catch (error: any) {
    throw new HTTPError(500, error.message || '통계를 불러오지 못했습니다', 'WF_ANALYTICS_ERR')
  }
})

// POST /workflows/:id/analytics/insights: AI 기반 구조적 향상 제안
workflowsRoute.post('/workflows/:id/analytics/insights', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  try {
    const data = await PredictiveInsightsService.generateInsights(id, tenant.companyId)
    return c.json({ success: true, msg: data.insights })
  } catch (error: any) {
    throw new HTTPError(500, error.message || 'AI 분석을 실패했습니다', 'WF_INSIGHTS_ERR')
  }
})

// POST /workflows/:id/execute: 워크플로우 실행
workflowsRoute.post('/workflows/:id/execute', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // Only CEO or Admin can execute workflows
  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '워크플로우 실행은 관리자만 가능합니다', 'AUTH_003')
  }

  const [workflowData] = await db.select().from(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.companyId, tenant.companyId), eq(workflows.isActive, true)))
    .limit(1)

  if (!workflowData) {
    throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'WF_001')
  }

  // DB의 jsonb steps를 WorkflowStep 배열로 캐스팅 (검증을 거쳤다고 가정)
  const workflow: any = { ...workflowData, steps: workflowData.steps as any }

  // Request body로 초기 글로벌 컨텍스트 주입 가능 (optional)
  let initialContext = {}
  try {
    initialContext = await c.req.json()
  } catch (e) { /* ignore */ }

  const engine = new WorkflowEngine(workflow, initialContext)
  const executionResult = await engine.run()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `워크플로우 실행: ${workflow.name}`,
    details: { workflowId: workflow.id, executionResult: executionResult.success ? 'success' : 'failure' }
  })

  return c.json({ 
    success: executionResult.success, 
    results: executionResult.results 
  })
})

// POST /api/workspace/workflows
workflowsRoute.post('/workflows', zValidator('json', createWorkflowSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // 역할 권한 (CEO, Admin 만 수정/생성 가능)
  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '워크플로우 관리는 관리자만 가능합니다', 'AUTH_003')
  }

  const [workflow] = await db
    .insert(workflows)
    .values({
      companyId: tenant.companyId,
      name: body.name,
      description: body.description,
      steps: body.steps,
      createdBy: tenant.userId,
    })
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `워크플로우 생성: ${workflow.name}`,
  })

  return c.json({ data: workflow }, 201)
})

// PUT /api/workspace/workflows/:id
workflowsRoute.put('/workflows/:id', zValidator('json', updateWorkflowSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '워크플로우 관리는 관리자만 가능합니다', 'AUTH_003')
  }

  const [workflow] = await db
    .select({ id: workflows.id })
    .from(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.companyId, tenant.companyId)))
    .limit(1)

  if (!workflow) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'WF_001')

  const [updated] = await db
    .update(workflows)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.steps !== undefined && { steps: body.steps }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(workflows.id, id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `워크플로우 수정: ${updated.name}`,
  })

  return c.json({ data: updated })
})

// DELETE /api/workspace/workflows/:id (Soft-delete)
workflowsRoute.delete('/workflows/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '워크플로우 관리는 관리자만 가능합니다', 'AUTH_003')
  }

  const [workflow] = await db
    .select({ id: workflows.id, name: workflows.name })
    .from(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.companyId, tenant.companyId)))
    .limit(1)

  if (!workflow) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'WF_001')

  const [deleted] = await db
    .update(workflows)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(workflows.id, id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `워크플로우 삭제(비활성화): ${deleted.name}`,
  })

  return c.json({ data: { id: deleted.id, isActive: deleted.isActive } })
})
