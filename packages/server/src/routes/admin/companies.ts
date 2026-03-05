import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, count } from 'drizzle-orm'
import { db } from '../../db'
import { companies, users } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'

export const companiesRoute = new Hono()

// 모든 관리자 라우트는 인증 + admin 권한 필요
companiesRoute.use('*', authMiddleware, adminOnly)

const createCompanySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug는 소문자, 숫자, 하이픈만 가능'),
})

const updateCompanySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/admin/companies — 전체 회사 목록
companiesRoute.get('/companies', async (c) => {
  const result = await db.select().from(companies).orderBy(companies.createdAt)
  return c.json({ data: result })
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

// DELETE /api/admin/companies/:id — 회사 비활성화 (soft delete)
companiesRoute.delete('/companies/:id', async (c) => {
  const id = c.req.param('id')

  // 활성 직원 수 체크
  const [{ activeCount }] = await db
    .select({ activeCount: count() })
    .from(users)
    .where(and(eq(users.companyId, id), eq(users.isActive, true)))

  if (Number(activeCount) > 0) {
    throw new HTTPError(409, `활성 직원이 ${activeCount}명 있어 비활성화할 수 없습니다. 먼저 직원을 이동하거나 비활성화하세요`, 'COMPANY_002')
  }

  const [company] = await db
    .update(companies)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning()
  if (!company) throw new HTTPError(404, '회사를 찾을 수 없습니다', 'COMPANY_001')
  return c.json({ data: { message: '비활성화되었습니다' } })
})
