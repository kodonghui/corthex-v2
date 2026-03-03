import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import type { TenantContext } from '@corthex/shared'

export const workspaceAgentsRoute = new Hono()

workspaceAgentsRoute.use('*', authMiddleware)

// GET /api/workspace/agents — 내 회사의 활성 에이전트 목록
workspaceAgentsRoute.get('/agents', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  const result = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      status: agents.status,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(and(eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))

  return c.json({ data: result })
})

// GET /api/workspace/agents/:id — 에이전트 상세 (내 회사만)
workspaceAgentsRoute.get('/agents/:id', async (c) => {
  const tenant = c.get('tenant') as TenantContext
  const id = c.req.param('id')

  const [agent] = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      soul: agents.soul,
      status: agents.status,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) {
    const { HTTPError } = await import('../../middleware/error')
    throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')
  }

  return c.json({ data: agent })
})
