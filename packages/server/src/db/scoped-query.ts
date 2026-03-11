import { eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { db } from './index'
import { agents, departments, knowledgeDocs, agentTools, toolDefinitions, users, costRecords } from './schema'
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

    // READ — soul-renderer용 단건/관계 조회 (Story 2.3, E4)
    agentById: (id: string) =>
      db.select().from(agents).where(scopedWhere(agents.companyId, companyId, eq(agents.id, id))),
    agentsByReportTo: (agentId: string) =>
      db.select().from(agents).where(scopedWhere(agents.companyId, companyId, eq(agents.reportTo, agentId))),
    agentToolsWithDefs: (agentId: string) =>
      db.select({ name: toolDefinitions.name, description: toolDefinitions.description })
        .from(agentTools)
        .innerJoin(toolDefinitions, eq(agentTools.toolId, toolDefinitions.id))
        .where(scopedWhere(agentTools.companyId, companyId, eq(agentTools.agentId, agentId), eq(agentTools.isEnabled, true), eq(toolDefinitions.isActive, true))),
    departmentById: (id: string) =>
      db.select().from(departments).where(scopedWhere(departments.companyId, companyId, eq(departments.id, id))),
    userById: (id: string) =>
      db.select().from(users).where(scopedWhere(users.companyId, companyId, eq(users.id, id))),

    // WRITE — companyId 자동 주입, 결과 반환
    insertAgent: (data: Omit<NewAgent, 'companyId'>) =>
      db.insert(agents).values(scopedInsert(companyId, data)).returning(),
    updateAgent: (id: string, data: Partial<Omit<Agent, 'id' | 'companyId'>>) =>
      db.update(agents).set(data).where(scopedWhere(agents.companyId, companyId, eq(agents.id, id))).returning(),
    deleteAgent: (id: string) =>
      db.delete(agents).where(scopedWhere(agents.companyId, companyId, eq(agents.id, id))).returning(),

    // WRITE — cost tracking (Story 3.5)
    insertCostRecord: (data: Omit<InferInsertModel<typeof costRecords>, 'companyId'>) =>
      db.insert(costRecords).values(scopedInsert(companyId, data)).returning(),
  }
}
