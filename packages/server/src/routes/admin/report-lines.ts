import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { reportLines } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const reportLinesRoute = new Hono<AppEnv>()

reportLinesRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

const bulkUpsertSchema = z.object({
  companyId: z.string().uuid(),
  lines: z.array(z.object({
    userId: z.string().uuid(),
    reportsToUserId: z.string().uuid(),
  })),
})

// GET /api/admin/report-lines — 보고 라인 목록
reportLinesRoute.get('/report-lines', async (c) => {
  const companyId = c.get('tenant').companyId

  const result = await db
    .select()
    .from(reportLines)
    .where(eq(reportLines.companyId, companyId))

  return c.json({ data: result })
})

// PUT /api/admin/report-lines — 벌크 업서트
reportLinesRoute.put('/report-lines', zValidator('json', bulkUpsertSchema), async (c) => {
  const { companyId, lines } = c.req.valid('json')

  // 자기 자신을 상위자로 설정 방지
  for (const line of lines) {
    if (line.userId === line.reportsToUserId) {
      throw new HTTPError(400, '자신을 보고 대상으로 설정할 수 없습니다', 'REPORT_LINE_002')
    }
  }

  // 순환 참조 감지 (A→B→C→A)
  const graph = new Map<string, string>()
  for (const line of lines) {
    graph.set(line.userId, line.reportsToUserId)
  }
  for (const startId of graph.keys()) {
    const visited = new Set<string>()
    let current: string | undefined = startId
    while (current && graph.has(current)) {
      if (visited.has(current)) {
        throw new HTTPError(400, '순환 보고 구조가 감지되었습니다', 'REPORT_LINE_003')
      }
      visited.add(current)
      current = graph.get(current)
    }
  }

  // 기존 보고 라인 삭제 후 새로 삽입 (트랜잭션)
  await db.transaction(async (tx) => {
    await tx.delete(reportLines).where(eq(reportLines.companyId, companyId))

    if (lines.length > 0) {
      const values = lines.map((line) => ({
        companyId,
        reporterId: line.userId,
        supervisorId: line.reportsToUserId,
      }))
      await tx.insert(reportLines).values(values)
    }
  })

  // 저장된 결과 반환
  const result = await db
    .select()
    .from(reportLines)
    .where(eq(reportLines.companyId, companyId))

  return c.json({ data: result })
})
