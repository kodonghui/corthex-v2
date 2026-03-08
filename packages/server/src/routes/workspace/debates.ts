import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../../middleware/auth'
import { createDebate, startDebate, getDebate, listDebates } from '../../services/agora-engine'
import type { AppEnv } from '../../types'

export const debatesRoute = new Hono<AppEnv>()

debatesRoute.use('*', authMiddleware)

const createDebateSchema = z.object({
  topic: z.string().min(1).max(500),
  debateType: z.enum(['debate', 'deep-debate']).optional().default('debate'),
  participantAgentIds: z.array(z.string().uuid()).min(2).max(20),
  maxRounds: z.number().int().min(1).max(10).optional(),
})

// POST /api/workspace/debates — 토론 생성
debatesRoute.post('/', zValidator('json', createDebateSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  try {
    const debate = await createDebate({
      companyId: tenant.companyId,
      topic: body.topic,
      debateType: body.debateType,
      participantAgentIds: body.participantAgentIds,
      createdBy: tenant.userId,
      maxRounds: body.maxRounds,
    })

    return c.json({ success: true, data: debate }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const code = message.split(':')[0] || 'DEBATE_ERROR'
    return c.json({ success: false, error: { code, message } }, 400)
  }
})

// POST /api/workspace/debates/:id/start — 토론 시작 (비동기 실행)
debatesRoute.post('/:id/start', zValidator('param', z.object({ id: z.string().uuid() })), async (c) => {
  const tenant = c.get('tenant')
  const { id } = c.req.valid('param')

  try {
    const debate = await startDebate(id, tenant.companyId)
    return c.json({ success: true, data: debate })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const code = message.split(':')[0] || 'DEBATE_ERROR'
    return c.json({ success: false, error: { code, message } }, 400)
  }
})

// GET /api/workspace/debates — 토론 목록
debatesRoute.get('/', async (c) => {
  const tenant = c.get('tenant')
  const limit = Number(c.req.query('limit')) || 20
  const offset = Number(c.req.query('offset')) || 0

  const results = await listDebates(tenant.companyId, limit, offset)
  return c.json({ success: true, data: results })
})

// GET /api/workspace/debates/:id — 토론 상세
debatesRoute.get('/:id', zValidator('param', z.object({ id: z.string().uuid() })), async (c) => {
  const tenant = c.get('tenant')
  const { id } = c.req.valid('param')

  const debate = await getDebate(id, tenant.companyId)
  if (!debate) {
    return c.json({ success: false, error: { code: 'DEBATE_NOT_FOUND', message: '토론을 찾을 수 없습니다' } }, 404)
  }

  return c.json({ success: true, data: debate })
})
