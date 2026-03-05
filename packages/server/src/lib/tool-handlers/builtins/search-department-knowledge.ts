import { db } from '../../../db'
import { departmentKnowledge } from '../../../db/schema'
import { eq, and, ilike } from 'drizzle-orm'
import type { ToolHandler } from '../types'

export const searchDepartmentKnowledge: ToolHandler = async (input, ctx) => {
  const query = String(input.query || '')
  if (!query) return '검색어가 비어있습니다.'

  if (!ctx.departmentId) {
    return '이 에이전트는 부서에 배정되지 않아 지식 검색을 할 수 없습니다.'
  }

  const results = await db
    .select({
      title: departmentKnowledge.title,
      content: departmentKnowledge.content,
      category: departmentKnowledge.category,
    })
    .from(departmentKnowledge)
    .where(
      and(
        eq(departmentKnowledge.companyId, ctx.companyId),
        eq(departmentKnowledge.departmentId, ctx.departmentId),
        ilike(departmentKnowledge.content, `%${query.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`),
      ),
    )
    .limit(5)

  if (results.length === 0) {
    return `'${query}'에 대한 부서 지식이 없습니다.`
  }

  return JSON.stringify(results)
}
