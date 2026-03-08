import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../../middleware/auth'
import { rbacMiddleware } from '../../middleware/rbac'
import { HTTPError } from '../../middleware/error'
import {
  createCompanyWithAdmin,
  listCompanies,
  getCompanyDetail,
  updateCompany,
  softDeleteCompany,
} from '../../services/company-management'
import type { AppEnv } from '../../types'

export const superAdminCompaniesRoute = new Hono<AppEnv>()

// Super Admin 전용: auth + rbac('super_admin')
superAdminCompaniesRoute.use('*', authMiddleware, rbacMiddleware('super_admin'))

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validateUUID(id: string): void {
  if (!UUID_REGEX.test(id)) {
    throw new HTTPError(400, '유효하지 않은 ID 형식입니다', 'INVALID_UUID')
  }
}

// === Zod Schemas ===

const createCompanySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug는 소문자, 숫자, 하이픈만 가능'),
  adminUsername: z.string().min(2).max(50),
  adminName: z.string().min(1).max(100),
  adminEmail: z.string().email().optional(),
})

const updateCompanySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug는 소문자, 숫자, 하이픈만 가능').optional(),
  settings: z.record(z.unknown()).optional(),
  smtpConfig: z.object({
    host: z.string().min(1),
    port: z.number().int().min(1).max(65535),
    secure: z.boolean(),
    user: z.string().min(1),
    pass: z.string().min(1),
  }).nullable().optional(),
})

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

// POST /api/super-admin/companies — 회사 생성 + admin 계정 자동 생성
superAdminCompaniesRoute.post('/companies', zValidator('json', createCompanySchema), async (c) => {
  const input = c.req.valid('json')
  const tenant = c.get('tenant')

  const result = await createCompanyWithAdmin(input, tenant.userId)

  if ('error' in result) {
    throw new HTTPError(409, result.error.message, result.error.code)
  }

  return c.json({ data: result.data }, 201)
})

// GET /api/super-admin/companies — 회사 목록 (페이지네이션 + 검색)
superAdminCompaniesRoute.get('/companies', zValidator('query', listQuerySchema), async (c) => {
  const query = c.req.valid('query')

  const result = await listCompanies({
    page: query.page,
    limit: query.limit,
    search: query.search,
    isActive: query.isActive,
  })

  return c.json({ data: result.data, pagination: result.pagination })
})

// GET /api/super-admin/companies/:id — 회사 상세 (통계 포함)
superAdminCompaniesRoute.get('/companies/:id', async (c) => {
  const id = c.req.param('id')
  validateUUID(id)

  const company = await getCompanyDetail(id)
  if (!company) {
    throw new HTTPError(404, '회사를 찾을 수 없습니다', 'COMPANY_NOT_FOUND')
  }

  return c.json({ data: company })
})

// PUT /api/super-admin/companies/:id — 회사 정보 수정
superAdminCompaniesRoute.put('/companies/:id', zValidator('json', updateCompanySchema), async (c) => {
  const id = c.req.param('id')
  validateUUID(id)
  const input = c.req.valid('json')
  const tenant = c.get('tenant')

  const result = await updateCompany(id, input, tenant.userId)

  if (result === null) {
    throw new HTTPError(404, '회사를 찾을 수 없습니다', 'COMPANY_NOT_FOUND')
  }

  if ('error' in result) {
    throw new HTTPError(409, result.error.message, result.error.code)
  }

  return c.json({ data: result.data })
})

// DELETE /api/super-admin/companies/:id — 회사 소프트 삭제
superAdminCompaniesRoute.delete('/companies/:id', async (c) => {
  const id = c.req.param('id')
  validateUUID(id)
  const tenant = c.get('tenant')

  const result = await softDeleteCompany(id, tenant.userId)

  if ('error' in result) {
    const status = result.error.code === 'COMPANY_NOT_FOUND' ? 404 : 409
    throw new HTTPError(status, result.error.message, result.error.code)
  }

  return c.json({ data: result.data })
})
