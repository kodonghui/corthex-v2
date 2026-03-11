import { eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { db } from './index'
import { agents, departments, knowledgeDocs } from './schema'
import { withTenant, scopedWhere, scopedInsert } from './tenant-helpers'

type Agent = InferSelectModel<typeof agents>
type NewAgent = InferInsertModel<typeof agents>

/**
 * getDB(companyId) — 멀티테넌시 격리 래퍼 (Architecture D1, E3)
 *
 * 모든 비즈니스 로직은 이 함수를 통해서만 DB 접근.
 * db 직접 import는 마이그레이션, 시드, 시스템 쿼리에서만 허용.
 */
export function getDB(companyId: string) {
  if (!companyId) throw new Error('companyId required')

  return {
    // READ — companyId WHERE 자동 적용
    agents: () =>
      db.select().from(agents).where(withTenant(agents.companyId, companyId)),
    departments: () =>
      db.select().from(departments).where(withTenant(departments.companyId, companyId)),
    knowledgeDocs: () =>
      db.select().from(knowledgeDocs).where(withTenant(knowledgeDocs.companyId, companyId)),

    // WRITE — companyId 자동 주입, 결과 반환
    insertAgent: (data: Omit<NewAgent, 'companyId'>) =>
      db.insert(agents).values(scopedInsert(companyId, data)).returning(),
    updateAgent: (id: string, data: Partial<Omit<Agent, 'id' | 'companyId'>>) =>
      db.update(agents).set(data).where(scopedWhere(agents.companyId, companyId, eq(agents.id, id))).returning(),
    deleteAgent: (id: string) =>
      db.delete(agents).where(scopedWhere(agents.companyId, companyId, eq(agents.id, id))).returning(),
  }
}
