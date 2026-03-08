import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { agents } from '../../db/schema'
import { apiKeyAuth } from '../../middleware/api-key-auth'
import { HTTPError } from '../../middleware/error'
import { classify, createCommand } from '../../services/command-router'
import { process as chiefOfStaffProcess } from '../../services/chief-of-staff'
import type { AppEnv } from '../../types'

export const publicApiV1Route = new Hono<AppEnv>()

// 모든 공개 API에 API 키 인증 적용
publicApiV1Route.use('*', apiKeyAuth)

// 스코프 검증 헬퍼
function requireScope(c: { req: { header: (name: string) => string | undefined } }, required: string) {
  const scopes = c.req.header('X-API-Key-Scopes')?.split(',') || []
  if (!scopes.includes(required)) {
    throw new HTTPError(403, `이 작업에는 '${required}' 스코프가 필요합니다`, 'API_005')
  }
}

// GET /api/v1/agents — 에이전트 목록
publicApiV1Route.get('/agents', async (c) => {
  const tenant = c.get('tenant')
  requireScope(c, 'read')

  const result = await db
    .select({
      id: agents.id,
      name: agents.name,
      nameEn: agents.nameEn,
      role: agents.role,
      tier: agents.tier,
      status: agents.status,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(and(eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))

  return c.json({ success: true, data: result })
})

// GET /api/v1/agents/:id — 에이전트 상세
publicApiV1Route.get('/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  requireScope(c, 'read')
  const id = c.req.param('id')

  const [agent] = await db
    .select({
      id: agents.id,
      name: agents.name,
      nameEn: agents.nameEn,
      role: agents.role,
      tier: agents.tier,
      modelName: agents.modelName,
      status: agents.status,
      departmentId: agents.departmentId,
      reportTo: agents.reportTo,
    })
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'API_006')

  return c.json({ success: true, data: agent })
})

const commandSchema = z.object({
  text: z.string().min(1).max(10_000),
  targetAgentId: z.string().uuid().nullish(),
})

// POST /api/v1/commands — 명령 실행
publicApiV1Route.post('/commands', zValidator('json', commandSchema), async (c) => {
  const tenant = c.get('tenant')
  requireScope(c, 'execute')
  const body = c.req.valid('json')

  const result = await classify(body.text, {
    companyId: tenant.companyId,
    userId: tenant.userId,
    targetAgentId: body.targetAgentId ?? null,
    presetId: null,
    useBatch: false,
  })

  const command = await createCommand({
    companyId: tenant.companyId,
    userId: tenant.userId,
    text: body.text,
    type: result.type,
    targetAgentId: result.targetAgentId,
    metadata: result.parsedMeta,
  })

  // direct 명령은 ChiefOfStaff 비동기 처리
  if (result.type === 'direct') {
    chiefOfStaffProcess({
      commandId: command.id,
      commandText: body.text,
      companyId: tenant.companyId,
      userId: tenant.userId,
    }).catch((err) => {
      console.error(`[PublicAPI] ChiefOfStaff process failed for command ${command.id}:`, err)
    })
  }

  return c.json({
    success: true,
    data: {
      commandId: command.id,
      type: result.type,
      status: 'submitted',
    },
  }, 201)
})
