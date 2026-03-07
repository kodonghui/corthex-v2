import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db'
import { commands } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import { HTTPError } from '../middleware/error'
import { classify, createCommand } from '../services/command-router'
import type { AppEnv } from '../types'

export const commandsRoute = new Hono<AppEnv>()

commandsRoute.use('*', authMiddleware)

const submitCommandSchema = z.object({
  text: z.string().min(1).max(10_000),
  targetAgentId: z.string().uuid().nullish(),
  presetId: z.string().uuid().nullish(),
  useBatch: z.boolean().optional().default(false),
})

// POST /api/workspace/commands — 명령 제출 + 자동 분류
commandsRoute.post('/', zValidator('json', submitCommandSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  const result = await classify(body.text, {
    companyId: tenant.companyId,
    userId: tenant.userId,
    targetAgentId: body.targetAgentId ?? null,
    presetId: body.presetId ?? null,
    useBatch: body.useBatch,
  })

  const command = await createCommand({
    companyId: tenant.companyId,
    userId: tenant.userId,
    text: body.text,
    type: result.type,
    targetAgentId: result.targetAgentId,
    metadata: result.parsedMeta,
  })

  return c.json({
    success: true,
    data: {
      id: command.id,
      type: command.type,
      status: command.status,
      targetAgentId: command.targetAgentId,
      parsedMeta: result.parsedMeta,
      createdAt: command.createdAt,
    },
  }, 201)
})

// GET /api/workspace/commands — 명령 이력 조회
commandsRoute.get('/', async (c) => {
  const tenant = c.get('tenant')
  const limit = Math.min(Number(c.req.query('limit') || '20'), 100)
  const offset = Math.max(Number(c.req.query('offset') || '0'), 0)

  const result = await db
    .select({
      id: commands.id,
      type: commands.type,
      text: commands.text,
      targetAgentId: commands.targetAgentId,
      status: commands.status,
      result: commands.result,
      metadata: commands.metadata,
      createdAt: commands.createdAt,
      completedAt: commands.completedAt,
    })
    .from(commands)
    .where(and(
      eq(commands.companyId, tenant.companyId),
      eq(commands.userId, tenant.userId),
    ))
    .orderBy(desc(commands.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ success: true, data: result })
})

// GET /api/workspace/commands/:id — 단일 명령 조회
commandsRoute.get('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [command] = await db
    .select()
    .from(commands)
    .where(and(
      eq(commands.id, id),
      eq(commands.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!command) {
    throw new HTTPError(404, '명령을 찾을 수 없습니다', 'CMD_001')
  }

  return c.json({ success: true, data: command })
})
