import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, or, desc, lt, count } from 'drizzle-orm'
import { db } from '../../db'
import { reports, reportComments, users, activityLogs } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { createNotification } from '../../lib/notifier'
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
    .select({ id: reports.id, status: reports.status, title: reports.title })
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

  // 작성자 이름 조회
  const [author] = await db.select({ name: users.name }).from(users).where(eq(users.id, tenant.userId)).limit(1)

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

  // 알림: CEO에게 보고서 제출 알림 (fire-and-forget)
  createNotification({
    userId: supervisor.id,
    companyId: tenant.companyId,
    type: 'system',
    title: `${author?.name || ''}님이 보고서를 제출했습니다`,
    body: existing.title ?? '',
    actionUrl: `/reports/${id}`,
  }).catch(() => {})

  // 활동 로그
  db.insert(activityLogs).values({
    companyId: tenant.companyId,
    eventId: crypto.randomUUID(),
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    actorName: author?.name || '',
    action: '보고서 제출',
    detail: existing.title ?? '',
  }).catch(() => {})

  return c.json({ data: updated })
})

// POST /api/workspace/reports/:id/review — 보고서 검토 완료 마킹 (CEO만)
reportsRoute.post('/reports/:id/review', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: reports.id, status: reports.status, submittedTo: reports.submittedTo, authorId: reports.authorId, title: reports.title })
    .from(reports)
    .where(and(eq(reports.id, id), eq(reports.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'REPORT_001')
  if (existing.submittedTo !== tenant.userId) throw new HTTPError(403, '보고 대상만 검토할 수 있습니다', 'REPORT_005')
  if (existing.status !== 'submitted') throw new HTTPError(400, '제출 상태의 보고서만 검토할 수 있습니다', 'REPORT_006')

  const [reviewer] = await db.select({ name: users.name }).from(users).where(eq(users.id, tenant.userId)).limit(1)

  const [updated] = await db
    .update(reports)
    .set({ status: 'reviewed', updatedAt: new Date() })
    .where(eq(reports.id, id))
    .returning()

  // 알림: 작성자에게 검토 완료 알림
  createNotification({
    userId: existing.authorId,
    companyId: tenant.companyId,
    type: 'system',
    title: '보고서 검토가 완료되었습니다',
    body: existing.title,
    actionUrl: `/reports/${id}`,
  }).catch(() => {})

  // 활동 로그
  db.insert(activityLogs).values({
    companyId: tenant.companyId,
    eventId: crypto.randomUUID(),
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    actorName: reviewer?.name || '',
    action: '보고서 검토 완료',
    detail: existing.title,
  }).catch(() => {})

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

  const limit = Math.min(Number(c.req.query('limit')) || 100, 100)
  const before = c.req.query('before') // comment ID for pagination

  // 총 코멘트 수
  const [totalResult] = await db
    .select({ total: count() })
    .from(reportComments)
    .where(eq(reportComments.reportId, reportId))

  const conditions = [eq(reportComments.reportId, reportId)]
  if (before) {
    // before ID의 createdAt 조회 후 그 이전 코멘트 가져오기
    const [ref] = await db
      .select({ createdAt: reportComments.createdAt })
      .from(reportComments)
      .where(eq(reportComments.id, before))
      .limit(1)
    if (ref) {
      conditions.push(lt(reportComments.createdAt, ref.createdAt))
    }
  }

  // 최신 N개를 역순으로 가져온 뒤 오름차순 정렬
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
    .where(and(...conditions))
    .orderBy(desc(reportComments.createdAt))
    .limit(limit)

  // 오름차순으로 되돌리기
  result.reverse()

  return c.json({ data: result, total: totalResult?.total ?? 0 })
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
      .select({ id: reports.id, status: reports.status, authorId: reports.authorId, submittedTo: reports.submittedTo })
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

    // 알림: 코멘트 상대방에게 알림 (fire-and-forget)
    const notifyTarget = report.authorId === tenant.userId ? report.submittedTo : report.authorId
    if (notifyTarget) {
      const [commenter] = await db.select({ name: users.name }).from(users).where(eq(users.id, tenant.userId)).limit(1)
      createNotification({
        userId: notifyTarget,
        companyId: tenant.companyId,
        type: 'system',
        title: `${commenter?.name || ''}님이 보고서에 코멘트를 남겼습니다`,
        body: content.length > 100 ? content.slice(0, 100) + '...' : content,
        actionUrl: `/reports/${reportId}`,
      }).catch(() => {})
    }

    return c.json({ data: comment }, 201)
  },
)

// GET /api/workspace/reports/:id/download — 보고서 MD 다운로드
reportsRoute.get('/reports/:id/download', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [report] = await db
    .select({
      title: reports.title,
      content: reports.content,
      authorId: reports.authorId,
      submittedTo: reports.submittedTo,
    })
    .from(reports)
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

  const md = `# ${report.title}\n\n${report.content || ''}`
  const filename = `${report.title.replace(/[^a-zA-Z0-9가-힣\s-_]/g, '').trim()}.md`

  c.header('Content-Type', 'text/markdown; charset=utf-8')
  c.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
  return c.body(md)
})
