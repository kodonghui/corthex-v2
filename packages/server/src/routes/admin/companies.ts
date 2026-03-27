import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, count } from 'drizzle-orm'
import { db } from '../../db'
import { companies, users, agents, adminUsers } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const companiesRoute = new Hono<AppEnv>()

// 모든 관리자 라우트는 인증 + admin 권한 필요
companiesRoute.use('*', authMiddleware, adminOnly)

const createCompanySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug는 소문자, 숫자, 하이픈만 가능'),
})

const updateCompanySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
})

const smtpConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean(),
  user: z.string().min(1),
  pass: z.string().min(1),
})

// GET /api/admin/companies — 회사 목록 (기본: active만, ?all=true면 전체)
companiesRoute.get('/companies', async (c) => {
  const showAll = c.req.query('all') === 'true'
  const result = showAll
    ? await db.select().from(companies).orderBy(companies.createdAt)
    : await db.select().from(companies).where(eq(companies.isActive, true)).orderBy(companies.createdAt)
  return c.json({ data: result })
})

// GET /api/admin/companies/stats — 회사별 유저/에이전트 수 통계
companiesRoute.get('/companies/stats', async (c) => {
  const userCounts = await db
    .select({ companyId: users.companyId, userCount: count() })
    .from(users)
    .where(eq(users.isActive, true))
    .groupBy(users.companyId)

  const agentCounts = await db
    .select({ companyId: agents.companyId, agentCount: count() })
    .from(agents)
    .where(eq(agents.isActive, true))
    .groupBy(agents.companyId)

  const stats: Record<string, { userCount: number; agentCount: number }> = {}
  for (const row of userCounts) {
    stats[row.companyId] = { userCount: Number(row.userCount), agentCount: 0 }
  }
  for (const row of agentCounts) {
    if (!stats[row.companyId]) stats[row.companyId] = { userCount: 0, agentCount: 0 }
    stats[row.companyId].agentCount = Number(row.agentCount)
  }

  return c.json({ data: stats })
})

// GET /api/admin/companies/:id — 회사 상세
companiesRoute.get('/companies/:id', async (c) => {
  const id = c.req.param('id')
  const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1)
  if (!company) throw new HTTPError(404, '회사를 찾을 수 없습니다', 'COMPANY_001')
  return c.json({ data: company })
})

// POST /api/admin/companies — 회사 생성
companiesRoute.post('/companies', zValidator('json', createCompanySchema), async (c) => {
  const body = c.req.valid('json')
  const [company] = await db.insert(companies).values(body).returning()
  return c.json({ data: company }, 201)
})

// PATCH /api/admin/companies/:id — 회사 수정
companiesRoute.patch('/companies/:id', zValidator('json', updateCompanySchema), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const [company] = await db
    .update(companies)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning()
  if (!company) throw new HTTPError(404, '회사를 찾을 수 없습니다', 'COMPANY_001')
  return c.json({ data: company })
})

// DELETE /api/admin/companies/:id — 회사 비활성화 (cascade soft delete)
companiesRoute.delete('/companies/:id', async (c) => {
  const id = c.req.param('id')

  // Cascade: deactivate all related records in a single transaction
  const result = await db.transaction(async (tx) => {
    // Run independent deactivations in parallel
    const [userRows, agentRows, adminRows] = await Promise.all([
      tx.update(users).set({ isActive: false })
        .where(and(eq(users.companyId, id), eq(users.isActive, true)))
        .returning({ id: users.id }),
      tx.update(agents).set({ isActive: false, status: 'offline' })
        .where(and(eq(agents.companyId, id), eq(agents.isActive, true)))
        .returning({ id: agents.id }),
      tx.update(adminUsers).set({ isActive: false })
        .where(and(eq(adminUsers.companyId, id), eq(adminUsers.isActive, true)))
        .returning({ id: adminUsers.id }),
    ])

    const [company] = await tx.update(companies)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning()
    if (!company) throw new HTTPError(404, '회사를 찾을 수 없습니다', 'COMPANY_001')

    return { deactivatedUsers: userRows.length, deactivatedAgents: agentRows.length, deactivatedAdmins: adminRows.length }
  })

  return c.json({ data: { message: '비활성화되었습니다', ...result } })
})

// POST /api/admin/companies/:id/hard-delete — 회사 영구 삭제
companiesRoute.post('/companies/:id/hard-delete', zValidator('json', z.object({ confirmName: z.string().min(1) })), async (c) => {
  const id = c.req.param('id')
  const { confirmName } = c.req.valid('json')
  const { hardDeleteCompany } = await import('../../services/hard-delete')
  const result = await hardDeleteCompany(id, confirmName)
  return c.json({ data: { message: '회사가 영구 삭제되었습니다', ...result } })
})

// PUT /api/admin/companies/:id/smtp — SMTP 설정 저장
companiesRoute.put('/companies/:id/smtp', zValidator('json', smtpConfigSchema), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const [company] = await db
    .update(companies)
    .set({ smtpConfig: body, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning()
  if (!company) throw new HTTPError(404, '회사를 찾을 수 없습니다', 'COMPANY_001')
  return c.json({ data: { success: true } })
})

// DELETE /api/admin/companies/:id/smtp — SMTP 설정 삭제
companiesRoute.delete('/companies/:id/smtp', async (c) => {
  const id = c.req.param('id')
  const [company] = await db
    .update(companies)
    .set({ smtpConfig: null, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning()
  if (!company) throw new HTTPError(404, '회사를 찾을 수 없습니다', 'COMPANY_001')
  return c.json({ data: { success: true } })
})
