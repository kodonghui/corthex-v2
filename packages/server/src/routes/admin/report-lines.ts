import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { reportLines } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const reportLinesRoute = new Hono<AppEnv>()

reportLinesRoute.use('*', authMiddleware, adminOnly)

const bulkUpsertSchema = z.object({
  companyId: z.string().uuid(),
  lines: z.array(z.object({
    userId: z.string().uuid(),
    reportsToUserId: z.string().uuid(),
  })),
})

// GET /api/admin/report-lines?companyId=xxx — 보고 라인 목록
reportLinesRoute.get('/report-lines', async (c) => {
  const companyId = c.req.query('companyId')
  if (!companyId) throw new HTTPError(400, 'companyId가 필요합니다', 'REPORT_LINE_001')

  const result = await db
    .select()
    .from(reportLines)
    .where(eq(reportLines.companyId, companyId))

  return c.json({ data: result })
})

// PUT /api/admin/report-lines — 벌크 업서트
reportLinesRoute.put('/report-lines', zValidator('json', bulkUpsertSchema), async (c) => {
  const { companyId, lines } = c.req.valid('json')

  // 기존 보고 라인 삭제 후 새로 삽입
  await db.delete(reportLines).where(eq(reportLines.companyId, companyId))

  if (lines.length > 0) {
    const values = lines.map((line) => ({
      companyId,
      reporterId: line.userId,
      supervisorId: line.reportsToUserId,
    }))
    await db.insert(reportLines).values(values)
  }

  // 저장된 결과 반환
  const result = await db
    .select()
    .from(reportLines)
    .where(eq(reportLines.companyId, companyId))

  return c.json({ data: result })
})
