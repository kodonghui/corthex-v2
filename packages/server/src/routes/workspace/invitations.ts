import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { db } from '../../db'
import { invitations, users } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { companyAdminOnly } from '../../middleware/company-admin'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import type { AppEnv } from '../../types'

export const invitationsRoute = new Hono<AppEnv>()

invitationsRoute.use('*', authMiddleware, companyAdminOnly)

const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'user']).default('user'),
})

// POST /api/workspace/invitations — 초대 생성
invitationsRoute.post('/invitations', zValidator('json', createInvitationSchema), async (c) => {
  const tenant = c.get('tenant')
  const { email, role } = c.req.valid('json')

  // 같은 회사+이메일로 pending 초대가 있으면 revoke
  const [existingPending] = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(and(
      eq(invitations.companyId, tenant.companyId),
      eq(invitations.email, email),
      eq(invitations.status, 'pending'),
    ))
    .limit(1)

  if (existingPending) {
    await db
      .update(invitations)
      .set({ status: 'revoked' })
      .where(eq(invitations.id, existingPending.id))
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일

  const [invitation] = await db
    .insert(invitations)
    .values({
      companyId: tenant.companyId,
      email,
      role,
      token,
      invitedBy: tenant.userId,
      expiresAt,
    })
    .returning({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      token: invitations.token,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      createdAt: invitations.createdAt,
    })

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `직원 초대: ${email} (${role})`,
  })

  return c.json({ data: invitation }, 201)
})

// GET /api/workspace/invitations — 초대 목록
invitationsRoute.get('/invitations', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      acceptedAt: invitations.acceptedAt,
      createdAt: invitations.createdAt,
    })
    .from(invitations)
    .where(eq(invitations.companyId, tenant.companyId))
    .orderBy(desc(invitations.createdAt))

  // 만료된 pending 초대 자동 업데이트
  const now = new Date()
  const updated = result.map((inv) => {
    if (inv.status === 'pending' && inv.expiresAt < now) {
      return { ...inv, status: 'expired' as const }
    }
    return inv
  })

  return c.json({ data: updated })
})

// DELETE /api/workspace/invitations/:id — 초대 취소
invitationsRoute.delete('/invitations/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [invitation] = await db
    .select({ id: invitations.id, status: invitations.status })
    .from(invitations)
    .where(and(
      eq(invitations.id, id),
      eq(invitations.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!invitation) throw new HTTPError(404, '초대를 찾을 수 없습니다', 'INVITE_001')
  if (invitation.status !== 'pending') throw new HTTPError(400, '대기 중인 초대만 취소할 수 있습니다', 'INVITE_002')

  await db
    .update(invitations)
    .set({ status: 'revoked' })
    .where(eq(invitations.id, id))

  return c.json({ data: { message: '초대가 취소되었습니다' } })
})
