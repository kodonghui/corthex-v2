import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, or, desc } from 'drizzle-orm'
import { db } from '../../db'
import { reports, reportComments, users } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const reportsRoute = new Hono<AppEnv>()

reportsRoute.use('*', authMiddleware)

const createReportSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
})

const updateReportSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
})

const createCommentSchema = z.object({
  content: z.string().min(1),
})

// GET /api/workspace/reports — 내 보고서 + 나에게 온 보고서 목록
reportsRoute.get('/reports', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: reports.id,
      title: reports.title,
      status: reports.status,
      authorId: reports.authorId,
      authorName: users.name,
      submittedTo: reports.submittedTo,
      submittedAt: reports.submittedAt,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
    })
    .from(reports)
    .innerJoin(users, eq(reports.authorId, users.id))
    .where(
      and(
        eq(reports.companyId, tenant.companyId),
        or(
          eq(reports.authorId, tenant.userId),        // 내가 작성한 보고서
          eq(reports.submittedTo, tenant.userId),      // 나에게 제출된 보고서
        ),
      ),
    )
    .orderBy(desc(reports.updatedAt))

  return c.json({ data: result })
})

// POST /api/workspace/reports — 새 보고서 작성 (초안)
reportsRoute.post('/reports', zValidator('json', createReportSchema), async (c) => {
  const tenant = c.get('tenant')
  const { title, content } = c.req.valid('json')

  const [report] = await db
    .insert(reports)
    .values({
      companyId: tenant.companyId,
      authorId: tenant.userId,
      title,
      content: content || '',
      status: 'draft',
    })
    .returning()

  return c.json({ data: report }, 201)
})

// GET /api/workspace/reports/:id — 보고서 상세 (본인 작성 또는 수신)
reportsRoute.get('/reports/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [report] = await db
    .select({
      id: reports.id,
      title: reports.title,
      content: reports.content,
      status: reports.status,
      authorId: reports.authorId,
      authorName: users.name,
      submittedTo: reports.submittedTo,
      submittedAt: reports.submittedAt,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
    })
    .from(reports)
    .innerJoin(users, eq(reports.authorId, users.id))
    .where(
      and(
        eq(reports.id, id),
        eq(reports.companyId, tenant.companyId),
        or(
          eq(reports.authorId, tenant.userId),
          eq(reports.submittedTo, tenant.userId),
        ),
      ),
    )
    .limit(1)

  if (!report) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'REPORT_001')

  return c.json({ data: report })
})

// PUT /api/workspace/reports/:id — 보고서 수정 (초안 상태만)
reportsRoute.put('/reports/:id', zValidator('json', updateReportSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // 본인 작성 + 초안 상태만 수정 가능
  const [existing] = await db
    .select({ id: reports.id, status: reports.status })
    .from(reports)
    .where(and(eq(reports.id, id), eq(reports.companyId, tenant.companyId), eq(reports.authorId, tenant.userId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'REPORT_001')
  if (existing.status !== 'draft') throw new HTTPError(400, '초안 상태에서만 수정할 수 있습니다', 'REPORT_002')

  const [updated] = await db
    .update(reports)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(reports.id, id))
    .returning()

  return c.json({ data: updated })
})

// POST /api/workspace/reports/:id/submit — "CEO에게 보고" (제출)
reportsRoute.post('/reports/:id/submit', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // 본인 작성 + 초안 상태만 제출 가능
  const [existing] = await db
    .select({ id: reports.id, status: reports.status })
    .from(reports)
    .where(and(eq(reports.id, id), eq(reports.companyId, tenant.companyId), eq(reports.authorId, tenant.userId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'REPORT_001')
  if (existing.status !== 'draft') throw new HTTPError(400, '이미 제출된 보고서입니다', 'REPORT_003')

  // 보고 대상: 같은 회사의 admin(CEO) 찾기
  const [supervisor] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.companyId, tenant.companyId), eq(users.role, 'admin')))
    .limit(1)

  if (!supervisor) throw new HTTPError(400, '보고 대상(CEO)을 찾을 수 없습니다', 'REPORT_004')

  const [updated] = await db
    .update(reports)
    .set({
      status: 'submitted',
      submittedTo: supervisor.id,
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(reports.id, id))
    .returning()

  return c.json({ data: updated })
})

// POST /api/workspace/reports/:id/review — 보고서 검토 완료 마킹 (CEO만)
reportsRoute.post('/reports/:id/review', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: reports.id, status: reports.status, submittedTo: reports.submittedTo })
    .from(reports)
    .where(and(eq(reports.id, id), eq(reports.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'REPORT_001')
  if (existing.submittedTo !== tenant.userId) throw new HTTPError(403, '보고 대상만 검토할 수 있습니다', 'REPORT_005')
  if (existing.status !== 'submitted') throw new HTTPError(400, '제출 상태의 보고서만 검토할 수 있습니다', 'REPORT_006')

  const [updated] = await db
    .update(reports)
    .set({ status: 'reviewed', updatedAt: new Date() })
    .where(eq(reports.id, id))
    .returning()

  return c.json({ data: updated })
})

// DELETE /api/workspace/reports/:id — 보고서 삭제 (초안만, 본인만)
reportsRoute.delete('/reports/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: reports.id, status: reports.status })
    .from(reports)
    .where(and(eq(reports.id, id), eq(reports.companyId, tenant.companyId), eq(reports.authorId, tenant.userId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'REPORT_001')
  if (existing.status !== 'draft') throw new HTTPError(400, '초안 상태에서만 삭제할 수 있습니다', 'REPORT_007')

  await db.delete(reportComments).where(eq(reportComments.reportId, id))
  await db.delete(reports).where(eq(reports.id, id))

  return c.json({ data: { deleted: true } })
})

// GET /api/workspace/reports/:id/comments — 코멘트 목록
reportsRoute.get('/reports/:id/comments', async (c) => {
  const tenant = c.get('tenant')
  const reportId = c.req.param('id')

  // 보고서 접근 권한 확인
  const [report] = await db
    .select({ id: reports.id })
    .from(reports)
    .where(
      and(
        eq(reports.id, reportId),
        eq(reports.companyId, tenant.companyId),
        or(
          eq(reports.authorId, tenant.userId),
          eq(reports.submittedTo, tenant.userId),
        ),
      ),
    )
    .limit(1)

  if (!report) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'REPORT_001')

  const result = await db
    .select({
      id: reportComments.id,
      content: reportComments.content,
      authorId: reportComments.authorId,
      authorName: users.name,
      createdAt: reportComments.createdAt,
    })
    .from(reportComments)
    .innerJoin(users, eq(reportComments.authorId, users.id))
    .where(eq(reportComments.reportId, reportId))
    .orderBy(reportComments.createdAt)

  return c.json({ data: result })
})

// POST /api/workspace/reports/:id/comments — 코멘트 작성
reportsRoute.post(
  '/reports/:id/comments',
  zValidator('json', createCommentSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const reportId = c.req.param('id')
    const { content } = c.req.valid('json')

    // 보고서 접근 권한 확인 (작성자 또는 수신자만 코멘트 가능)
    const [report] = await db
      .select({ id: reports.id, status: reports.status })
      .from(reports)
      .where(
        and(
          eq(reports.id, reportId),
          eq(reports.companyId, tenant.companyId),
          or(
            eq(reports.authorId, tenant.userId),
            eq(reports.submittedTo, tenant.userId),
          ),
        ),
      )
      .limit(1)

    if (!report) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'REPORT_001')
    if (report.status === 'draft') throw new HTTPError(400, '제출된 보고서에만 코멘트할 수 있습니다', 'REPORT_008')

    const [comment] = await db
      .insert(reportComments)
      .values({
        companyId: tenant.companyId,
        reportId,
        authorId: tenant.userId,
        content,
      })
      .returning()

    return c.json({ data: comment }, 201)
  },
)
