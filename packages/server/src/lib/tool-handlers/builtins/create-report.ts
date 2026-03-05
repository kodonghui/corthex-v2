import { db } from '../../../db'
import { reports, activityLogs } from '../../../db/schema'
import type { ToolHandler } from '../types'

export const createReport: ToolHandler = async (input, ctx) => {
  const title = String(input.title || '').trim()
  const content = String(input.content || '').trim()

  if (!title) return JSON.stringify({ error: '보고서 제목이 필요합니다.' })
  if (title.length > 200) return JSON.stringify({ error: '보고서 제목은 200자 이내여야 합니다.' })
  if (content.length > 50_000) return JSON.stringify({ error: '보고서 내용은 50,000자 이내여야 합니다.' })

  const [report] = await db
    .insert(reports)
    .values({
      companyId: ctx.companyId,
      authorId: ctx.userId,
      title,
      content,
      status: 'draft',
    })
    .returning()

  // 활동 로그 (fire-and-forget)
  db.insert(activityLogs)
    .values({
      companyId: ctx.companyId,
      eventId: crypto.randomUUID(),
      type: 'system',
      phase: 'end',
      actorType: 'agent',
      actorId: ctx.agentId,
      actorName: '',
      action: '보고서 자동 생성',
      detail: title,
    })
    .catch(() => {})

  return JSON.stringify({
    reportId: report.id,
    title: report.title,
    url: `/reports/${report.id}`,
    message: `보고서 "${title}"이(가) 생성되었습니다. [보고서 보기](/reports/${report.id})`,
  })
}
