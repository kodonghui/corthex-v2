import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, count } from 'drizzle-orm'
import { db } from '../../db'
import { snsAccounts, snsContents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { encrypt, decrypt } from '../../lib/crypto'
import { logActivity } from '../../lib/activity-logger'
import type { AppEnv } from '../../types'

export const snsAccountsRoute = new Hono<AppEnv>()

snsAccountsRoute.use('*', authMiddleware)

const createSnsAccountSchema = z.object({
  platform: z.enum(['instagram', 'tistory', 'daum_cafe']),
  accountName: z.string().min(1).max(100),
  accountId: z.string().min(1).max(200),
  credentials: z.record(z.string()).optional(),
})

const updateSnsAccountSchema = z.object({
  accountName: z.string().min(1).max(100).optional(),
  accountId: z.string().min(1).max(200).optional(),
  credentials: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/workspace/sns-accounts — 계정 목록
snsAccountsRoute.get('/', async (c) => {
  const tenant = c.get('tenant')

  const accounts = await db
    .select({
      id: snsAccounts.id,
      platform: snsAccounts.platform,
      accountName: snsAccounts.accountName,
      accountId: snsAccounts.accountId,
      isActive: snsAccounts.isActive,
      createdBy: snsAccounts.createdBy,
      createdAt: snsAccounts.createdAt,
      updatedAt: snsAccounts.updatedAt,
    })
    .from(snsAccounts)
    .where(eq(snsAccounts.companyId, tenant.companyId))

  return c.json({ data: accounts })
})

// POST /api/workspace/sns-accounts — 계정 등록
snsAccountsRoute.post('/', zValidator('json', createSnsAccountSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  const encryptedCreds = body.credentials
    ? await encrypt(JSON.stringify(body.credentials))
    : null

  const [account] = await db
    .insert(snsAccounts)
    .values({
      companyId: tenant.companyId,
      platform: body.platform,
      accountName: body.accountName,
      accountId: body.accountId,
      credentials: encryptedCreds,
      createdBy: tenant.userId,
    })
    .returning({
      id: snsAccounts.id,
      platform: snsAccounts.platform,
      accountName: snsAccounts.accountName,
      accountId: snsAccounts.accountId,
      isActive: snsAccounts.isActive,
      createdAt: snsAccounts.createdAt,
    })

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `SNS 계정 등록 (${body.platform})`,
    detail: body.accountName,
  })

  return c.json({ data: account }, 201)
})

// PUT /api/workspace/sns-accounts/:id — 계정 수정
snsAccountsRoute.put('/:id', zValidator('json', updateSnsAccountSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const [existing] = await db
    .select({ id: snsAccounts.id })
    .from(snsAccounts)
    .where(and(eq(snsAccounts.id, id), eq(snsAccounts.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 계정을 찾을 수 없습니다', 'SNS_ACCOUNT_001')

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (body.accountName !== undefined) updateData.accountName = body.accountName
  if (body.accountId !== undefined) updateData.accountId = body.accountId
  if (body.isActive !== undefined) updateData.isActive = body.isActive
  if (body.credentials !== undefined) {
    updateData.credentials = await encrypt(JSON.stringify(body.credentials))
  }

  const [updated] = await db
    .update(snsAccounts)
    .set(updateData)
    .where(and(eq(snsAccounts.id, id), eq(snsAccounts.companyId, tenant.companyId)))
    .returning({
      id: snsAccounts.id,
      platform: snsAccounts.platform,
      accountName: snsAccounts.accountName,
      accountId: snsAccounts.accountId,
      isActive: snsAccounts.isActive,
      updatedAt: snsAccounts.updatedAt,
    })

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: 'SNS 계정 수정',
    detail: updated.accountName,
  })

  return c.json({ data: updated })
})

// DELETE /api/workspace/sns-accounts/:id — 계정 삭제
snsAccountsRoute.delete('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: snsAccounts.id, accountName: snsAccounts.accountName })
    .from(snsAccounts)
    .where(and(eq(snsAccounts.id, id), eq(snsAccounts.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 계정을 찾을 수 없습니다', 'SNS_ACCOUNT_001')

  // 연결된 콘텐츠 확인
  const [linkedCount] = await db
    .select({ count: count() })
    .from(snsContents)
    .where(eq(snsContents.snsAccountId, id))

  if (linkedCount && linkedCount.count > 0) {
    throw new HTTPError(400, `연결된 SNS 콘텐츠가 ${linkedCount.count}건 있어 삭제할 수 없습니다`, 'SNS_ACCOUNT_002')
  }

  await db.delete(snsAccounts).where(and(eq(snsAccounts.id, id), eq(snsAccounts.companyId, tenant.companyId)))

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: 'SNS 계정 삭제',
    detail: existing.accountName,
  })

  return c.json({ data: { deleted: true } })
})
