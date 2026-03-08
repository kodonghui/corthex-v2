import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { db } from '../../db'
import { workflows } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { HTTPError } from '../../middleware/error'
import { authMiddleware } from '../../middleware/auth'
import { isCeoOrAbove } from '@corthex/shared'
import type { AppEnv } from '../../types'

export const workflowsRoute = new Hono<AppEnv>()

workflowsRoute.use('*', authMiddleware)

// StepSchema Definition
export const StepSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['tool', 'llm', 'condition']),
  action: z.string(),
  params: z.record(z.any()).optional(),
  dependsOn: z.array(z.string().uuid()).optional()
})

export type WorkflowStep = z.infer<typeof StepSchema>

// Create Workflow
workflowsRoute.post(
  '/workflows',
  zValidator(
    'json',
    z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      steps: z.array(StepSchema).max(20)
    })
  ),
  async (c) => {
    const tenant = c.get('tenant')
    
    if (!isCeoOrAbove(tenant.role) && !tenant.isAdminUser) {
      throw new HTTPError(403, '관리자/CEO 권한이 필요합니다.', 'FORBIDDEN')
    }

    const { name, description, steps } = c.req.valid('json')

    const [workflow] = await db.insert(workflows)
      .values({
        companyId: tenant.companyId,
        name,
        description,
        steps,
        createdBy: tenant.userId
      })
      .returning()

    return c.json({ data: workflow }, 201)
  }
)

// List Workflows
workflowsRoute.get('/workflows', async (c) => {
  const tenant = c.get('tenant')

  const results = await db.query.workflows.findMany({
    where: and(
      eq(workflows.companyId, tenant.companyId),
      eq(workflows.isActive, true)
    ),
    orderBy: (workflows, { desc }) => [desc(workflows.createdAt)]
  })

  return c.json({ data: results })
})

// Get Single Workflow
workflowsRoute.get('/workflows/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const workflow = await db.query.workflows.findFirst({
    where: and(
      eq(workflows.id, id),
      eq(workflows.companyId, tenant.companyId),
      eq(workflows.isActive, true)
    )
  })

  if (!workflow) {
    throw new HTTPError(404, '워크플로우를 찾을 수 없습니다.', 'NOT_FOUND')
  }

  return c.json({ data: workflow })
})

// Update Workflow
workflowsRoute.put(
  '/workflows/:id',
  zValidator(
    'json',
    z.object({
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      steps: z.array(StepSchema).max(20).optional()
    })
  ),
  async (c) => {
    const tenant = c.get('tenant')

    if (!isCeoOrAbove(tenant.role) && !tenant.isAdminUser) {
      throw new HTTPError(403, '관리자/CEO 권한이 필요합니다.', 'FORBIDDEN')
    }

    const id = c.req.param('id')
    const updates = c.req.valid('json')

    // 존재 여부 및 권한 확인
    const existing = await db.query.workflows.findFirst({
      where: and(
        eq(workflows.id, id),
        eq(workflows.companyId, tenant.companyId),
        eq(workflows.isActive, true)
      )
    })

    if (!existing) {
      throw new HTTPError(404, '워크플로우를 찾을 수 없습니다.', 'NOT_FOUND')
    }

    const [updated] = await db.update(workflows)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(eq(workflows.id, id), eq(workflows.companyId, tenant.companyId)))
      .returning()

    return c.json({ data: updated })
  }
)

// Soft Delete Workflow
workflowsRoute.delete(
  '/workflows/:id',
  async (c) => {
    const tenant = c.get('tenant')

    if (!isCeoOrAbove(tenant.role) && !tenant.isAdminUser) {
      throw new HTTPError(403, '관리자/CEO 권한이 필요합니다.', 'FORBIDDEN')
    }

    const id = c.req.param('id')

    const existing = await db.query.workflows.findFirst({
      where: and(
        eq(workflows.id, id),
        eq(workflows.companyId, tenant.companyId),
        eq(workflows.isActive, true)
      )
    })

    if (!existing) {
      throw new HTTPError(404, '워크플로우를 찾을 수 없습니다.', 'NOT_FOUND')
    }

    await db.update(workflows)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(and(eq(workflows.id, id), eq(workflows.companyId, tenant.companyId)))

    return c.json({ success: true, message: '워크플로우가 삭제되었습니다.' })
  }
)

// Execute Workflow
workflowsRoute.post(
  '/workflows/:id/execute',
  async (c) => {
    const tenant = c.get('tenant')

    const id = c.req.param('id')

    try {
      // WorkflowEngine.startExecution handles db check and throws if not found
      const execution = await WorkflowEngine.startExecution(id, tenant.companyId, tenant.sub)
      return c.json({ success: true, data: execution })
    } catch (err: any) {
      if (err.message.includes('not found')) {
        throw new HTTPError(404, '워크플로우를 찾을 수 없거나 비활성화 상태입니다.', 'NOT_FOUND')
      }
      throw new HTTPError(500, `실행 시작 실패: ${err.message}`, 'INTERNAL_ERROR')
    }
  }
)
