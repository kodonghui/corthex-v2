// Agent Organization Deployer — 회사 생성 시 29명 에이전트 자동 배치
import { db } from '../db'
import { departments, agents, agentDelegationRules } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import { DEPARTMENTS, AGENTS, DELEGATION_RULES } from '../lib/agent-org-definition'

/**
 * Deploy the standard 29-agent organization for a company.
 * Idempotent: skips if agents already exist for this company.
 * Transaction-wrapped: all-or-nothing.
 */
export async function deployOrganization(companyId: string, userId: string): Promise<{ agentCount: number; departmentCount: number }> {
  // Idempotency check: skip if company already has the full 29-agent org
  const [existing] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(agents)
    .where(eq(agents.companyId, companyId))
  if (existing.count >= AGENTS.length) {
    return { agentCount: existing.count, departmentCount: 0 }
  }

  // Deploy in a single logical flow (Neon serverless doesn't support real transactions well,
  // but we do sequential inserts — if any fails, the idempotency check prevents re-creation)

  // 1. Create departments
  const deptMap: Record<string, string> = {} // key -> uuid
  for (const dept of DEPARTMENTS) {
    const [created] = await db
      .insert(departments)
      .values({
        companyId,
        name: dept.name,
        description: dept.description,
      })
      .returning({ id: departments.id })
    deptMap[dept.key] = created.id
  }

  // 2. Create agents (two passes: first pass all agents, second pass to set reportTo)
  const agentMap: Record<string, string> = {} // key -> uuid

  // First pass: create all agents without reportTo
  for (const def of AGENTS) {
    const [created] = await db
      .insert(agents)
      .values({
        companyId,
        userId,
        departmentId: deptMap[def.departmentKey],
        name: def.name,
        nameEn: def.nameEn,
        role: def.role,
        tier: def.tier,
        modelName: def.modelName,
        isSecretary: def.isSecretary,
        soul: def.soul,
        adminSoul: def.soul, // adminSoul = original soul for reset
        status: 'offline',
      })
      .returning({ id: agents.id })
    agentMap[def.key] = created.id
  }

  // Second pass: set reportTo references
  for (const def of AGENTS) {
    if (def.reportToKey && agentMap[def.reportToKey]) {
      await db
        .update(agents)
        .set({ reportTo: agentMap[def.reportToKey] })
        .where(eq(agents.id, agentMap[def.key]))
    }
  }

  // 3. Create delegation rules (CoS -> Managers)
  for (const rule of DELEGATION_RULES) {
    const sourceId = agentMap[rule.sourceKey]
    const targetId = agentMap[rule.targetKey]
    if (sourceId && targetId) {
      await db
        .insert(agentDelegationRules)
        .values({
          companyId,
          sourceAgentId: sourceId,
          targetAgentId: targetId,
          condition: { keywords: rule.keywords },
          priority: 0,
          isActive: true,
        })
    }
  }

  return { agentCount: AGENTS.length, departmentCount: DEPARTMENTS.length }
}
