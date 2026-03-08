import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { isCeoOrAbove } from '@corthex/shared'
import type { AppEnv } from '../../types'
import { HTTPError } from '../../middleware/error'
import { authMiddleware } from '../../middleware/auth'
import { WorkflowService } from '../../services/workflow/engine'
import { WorkflowExecutionService } from '../../services/workflow/execution'

// === Zod Schemas ===

export const StepSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(['tool', 'llm', 'condition']),
  action: z.string().min(1),
  params: z.record(z.any()).optional(),
  agentId: z.string().uuid().optional(),
  dependsOn: z.array(z.string().uuid()).optional(),
  trueBranch: z.string().uuid().optional(),
  falseBranch: z.string().uuid().optional(),
  systemPrompt: z.string().optional(),
  timeout: z.number().int().min(1000).max(300000).optional(),
  retryCount: z.number().int().min(0).max(3).optional(),
})

const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  steps: z.array(StepSchema).min(1).max(20),
})

const UpdateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  steps: z.array(StepSchema).min(1).max(20).optional(),
}).refine(
  (data) => data.name !== undefined || data.description !== undefined || data.steps !== undefined,
  { message: '최소 하나의 필드(name, description, steps)가 필요합니다' }
)

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// === Routes ===

export const workflowsRoute = new Hono<AppEnv>()

workflowsRoute.use('*', authMiddleware)

/** CEO/Admin 권한 확인 헬퍼 */
function requireCeoOrAdmin(tenant: { role: string; isAdminUser?: boolean }) {
  if (!isCeoOrAbove(tenant.role as any) && !tenant.isAdminUser) {
    throw new HTTPError(403, 'CEO 또는 관리자 권한이 필요합니다', 'FORBIDDEN')
  }
}

// POST /workflows -- 워크플로우 생성
workflowsRoute.post(
  '/workflows',
  zValidator('json', CreateWorkflowSchema),
  async (c) => {
    const tenant = c.get('tenant')
    requireCeoOrAdmin(tenant)

    const body = c.req.valid('json')
    const result = await WorkflowService.create({
      companyId: tenant.companyId,
      name: body.name,
      description: body.description,
      steps: body.steps,
      createdBy: tenant.userId,
    })

    if (!result.success) {
      throw new HTTPError(400, `DAG 유효성 검증 실패: ${result.errors.join('; ')}`, 'INVALID_DAG')
    }

    return c.json({ success: true, data: result.data }, 201)
  }
)

// GET /workflows -- 워크플로우 목록 조회
workflowsRoute.get(
  '/workflows',
  zValidator('query', ListQuerySchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { page, limit } = c.req.valid('query')

    const result = await WorkflowService.list(tenant.companyId, { page, limit })
    return c.json({ success: true, data: result.data, meta: result.meta })
  }
)

// GET /workflows/:id -- 워크플로우 단건 조회
workflowsRoute.get('/workflows/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const workflow = await WorkflowService.getById(id, tenant.companyId)
  if (!workflow) {
    throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'NOT_FOUND')
  }

  return c.json({ success: true, data: workflow })
})

// PUT /workflows/:id -- 워크플로우 수정
workflowsRoute.put(
  '/workflows/:id',
  zValidator('json', UpdateWorkflowSchema),
  async (c) => {
    const tenant = c.get('tenant')
    requireCeoOrAdmin(tenant)

    const id = c.req.param('id')
    const updates = c.req.valid('json')

    const result = await WorkflowService.update(id, tenant.companyId, updates)

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'NOT_FOUND')
      }
      if (result.error === 'INACTIVE') {
        throw new HTTPError(400, '비활성 워크플로우는 수정할 수 없습니다', 'WORKFLOW_INACTIVE')
      }
      if (result.error === 'INVALID_DAG') {
        throw new HTTPError(400, `DAG 유효성 검증 실패: ${(result as any).errors.join('; ')}`, 'INVALID_DAG')
      }
    }

    return c.json({ success: true, data: (result as any).data })
  }
)

// POST /workflows/:id/execute -- 워크플로우 실행
workflowsRoute.post('/workflows/:id/execute', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const workflow = await WorkflowService.getById(id, tenant.companyId)
  if (!workflow) {
    throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'NOT_FOUND')
  }

  const result = await WorkflowExecutionService.execute({
    workflow,
    companyId: tenant.companyId,
    triggeredBy: tenant.userId,
  })

  return c.json({ success: true, data: result })
})

// GET /workflows/:workflowId/executions -- 워크플로우 실행 이력 조회
workflowsRoute.get(
  '/workflows/:workflowId/executions',
  zValidator('query', ListQuerySchema),
  async (c) => {
    const tenant = c.get('tenant')
    const workflowId = c.req.param('workflowId')
    const { page, limit } = c.req.valid('query')

    const result = await WorkflowExecutionService.list(workflowId, tenant.companyId, { page, limit })
    return c.json({ success: true, data: result.data, meta: result.meta })
  }
)

// DELETE /workflows/:id -- 워크플로우 소프트 삭제
workflowsRoute.delete('/workflows/:id', async (c) => {
  const tenant = c.get('tenant')
  requireCeoOrAdmin(tenant)

  const id = c.req.param('id')
  const result = await WorkflowService.softDelete(id, tenant.companyId)

  if (!result.success) {
    throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'NOT_FOUND')
  }

  return c.json({ success: true, message: '워크플로우가 삭제되었습니다' })
})
