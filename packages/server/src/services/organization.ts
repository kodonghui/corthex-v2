import { db } from '../db'
import { departments, agents } from '../db/schema'
import { eq, and, count, ne, isNull } from 'drizzle-orm'
import { withTenant, scopedWhere, scopedInsert } from '../db/tenant-helpers'
import { createAuditLog, AUDIT_ACTIONS } from './audit-log'
import type { ActorType } from './audit-log'

export interface DepartmentInput {
  name: string
  description?: string | null
}

export interface DepartmentUpdateInput {
  name?: string
  description?: string | null
}

export interface AgentInput {
  userId: string
  departmentId?: string | null
  name: string
  nameEn?: string | null
  role?: string | null
  tier?: 'manager' | 'specialist' | 'worker'
  modelName?: string
  allowedTools?: string[]
  soul?: string | null
}

export interface AgentUpdateInput {
  name?: string
  nameEn?: string | null
  role?: string | null
  tier?: 'manager' | 'specialist' | 'worker'
  modelName?: string
  departmentId?: string | null
  allowedTools?: string[]
  soul?: string | null
  status?: 'online' | 'working' | 'error' | 'offline'
  isActive?: boolean
}

interface TenantActor {
  companyId: string
  userId: string
  isAdminUser?: boolean
}

function actorType(tenant: TenantActor): ActorType {
  return tenant.isAdminUser ? 'admin_user' : 'user'
}

/**
 * Get all departments for a company (tenant-scoped).
 * Returns both active and inactive departments for admin management.
 */
export async function getDepartments(companyId: string) {
  return db
    .select()
    .from(departments)
    .where(withTenant(departments.companyId, companyId))
}

/**
 * Get a single department by ID (tenant-scoped).
 */
export async function getDepartmentById(companyId: string, departmentId: string) {
  const [dept] = await db
    .select()
    .from(departments)
    .where(scopedWhere(departments.companyId, companyId, eq(departments.id, departmentId)))
    .limit(1)
  return dept ?? null
}

/**
 * Create a new department with name uniqueness validation and audit logging.
 */
export async function createDepartment(tenant: TenantActor, input: DepartmentInput) {
  // Name uniqueness check within company
  const [existing] = await db
    .select({ id: departments.id })
    .from(departments)
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.name, input.name)))
    .limit(1)

  if (existing) {
    return { error: { status: 409, message: '같은 이름의 부서가 이미 있습니다', code: 'DEPT_002' } }
  }

  const [dept] = await db
    .insert(departments)
    .values(scopedInsert(tenant.companyId, {
      name: input.name,
      description: input.description ?? null,
    }))
    .returning()

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE,
    targetType: 'department',
    targetId: dept.id,
    after: { name: dept.name, description: dept.description },
  })

  return { data: dept }
}

/**
 * Update a department with name uniqueness validation (excluding self) and audit logging.
 */
export async function updateDepartment(
  tenant: TenantActor,
  departmentId: string,
  input: DepartmentUpdateInput,
) {
  // Get current state for before snapshot
  const [current] = await db
    .select()
    .from(departments)
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.id, departmentId)))
    .limit(1)

  if (!current) {
    return { error: { status: 404, message: '부서를 찾을 수 없습니다', code: 'DEPT_001' } }
  }

  // Name uniqueness check (exclude self)
  if (input.name) {
    const [duplicate] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(
        and(
          withTenant(departments.companyId, tenant.companyId),
          eq(departments.name, input.name),
          ne(departments.id, departmentId),
        ),
      )
      .limit(1)

    if (duplicate) {
      return { error: { status: 409, message: '같은 이름의 부서가 이미 있습니다', code: 'DEPT_002' } }
    }
  }

  const [dept] = await db
    .update(departments)
    .set({ ...input, updatedAt: new Date() })
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.id, departmentId)))
    .returning()

  // Audit log with before/after
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE,
    targetType: 'department',
    targetId: departmentId,
    before: { name: current.name, description: current.description },
    after: { name: dept.name, description: dept.description },
  })

  return { data: dept }
}

/**
 * Soft-delete a department (isActive=false).
 * Blocked if department has active agents.
 */
export async function deleteDepartment(tenant: TenantActor, departmentId: string) {
  // Get current state for audit log
  const [current] = await db
    .select()
    .from(departments)
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.id, departmentId)))
    .limit(1)

  if (!current) {
    return { error: { status: 404, message: '부서를 찾을 수 없습니다', code: 'DEPT_001' } }
  }

  // Check for active agents in this department
  const [{ agentCount }] = await db
    .select({ agentCount: count() })
    .from(agents)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.departmentId, departmentId)))

  if (Number(agentCount) > 0) {
    return {
      error: {
        status: 409,
        message: `소속 에이전트가 ${agentCount}명 있어 삭제할 수 없습니다`,
        code: 'DEPT_003',
      },
    }
  }

  await db
    .update(departments)
    .set({ isActive: false, updatedAt: new Date() })
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.id, departmentId)))

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE,
    targetType: 'department',
    targetId: departmentId,
    before: { name: current.name, description: current.description, isActive: current.isActive },
  })

  return { data: { message: '비활성화되었습니다' } }
}

// ============================================================
// Agent Service Functions
// ============================================================

/**
 * Get all agents for a company (tenant-scoped).
 * Optional filters: departmentId, isActive
 */
export async function getAgents(
  companyId: string,
  filters?: { departmentId?: string; isActive?: boolean },
) {
  const conditions = [withTenant(agents.companyId, companyId)]

  if (filters?.departmentId !== undefined) {
    if (filters.departmentId === 'unassigned') {
      conditions.push(isNull(agents.departmentId))
    } else {
      conditions.push(eq(agents.departmentId, filters.departmentId))
    }
  }

  if (filters?.isActive !== undefined) {
    conditions.push(eq(agents.isActive, filters.isActive))
  }

  return db
    .select()
    .from(agents)
    .where(and(...conditions))
}

/**
 * Get a single agent by ID (tenant-scoped).
 */
export async function getAgentById(companyId: string, agentId: string) {
  const [agent] = await db
    .select()
    .from(agents)
    .where(scopedWhere(agents.companyId, companyId, eq(agents.id, agentId)))
    .limit(1)
  return agent ?? null
}

/**
 * Create a new agent with name uniqueness validation and audit logging.
 */
export async function createAgent(tenant: TenantActor, input: AgentInput) {
  // Name uniqueness check within company
  const [existing] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.name, input.name)))
    .limit(1)

  if (existing) {
    return { error: { status: 409, message: '같은 이름의 에이전트가 이미 있습니다', code: 'AGENT_002' } }
  }

  const [agent] = await db
    .insert(agents)
    .values(scopedInsert(tenant.companyId, {
      userId: input.userId,
      departmentId: input.departmentId ?? null,
      name: input.name,
      nameEn: input.nameEn ?? null,
      role: input.role ?? null,
      tier: input.tier ?? 'specialist',
      modelName: input.modelName ?? 'claude-haiku-4-5',
      allowedTools: input.allowedTools ?? [],
      soul: input.soul ?? null,
      adminSoul: input.soul ?? null,
      status: 'offline',
    }))
    .returning()

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_AGENT_CREATE,
    targetType: 'agent',
    targetId: agent.id,
    after: { name: agent.name, tier: agent.tier, modelName: agent.modelName, departmentId: agent.departmentId },
  })

  return { data: agent }
}

/**
 * Update an agent with name uniqueness validation (excluding self) and audit logging.
 * When soul is updated, adminSoul is also synced.
 */
export async function updateAgent(
  tenant: TenantActor,
  agentId: string,
  input: AgentUpdateInput,
) {
  // Get current state for before snapshot
  const [current] = await db
    .select()
    .from(agents)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.id, agentId)))
    .limit(1)

  if (!current) {
    return { error: { status: 404, message: '에이전트를 찾을 수 없습니다', code: 'AGENT_001' } }
  }

  // Name uniqueness check (exclude self)
  if (input.name) {
    const [duplicate] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(
        and(
          withTenant(agents.companyId, tenant.companyId),
          eq(agents.name, input.name),
          ne(agents.id, agentId),
        ),
      )
      .limit(1)

    if (duplicate) {
      return { error: { status: 409, message: '같은 이름의 에이전트가 이미 있습니다', code: 'AGENT_002' } }
    }
  }

  // Build update set -- sync adminSoul when soul is updated
  const updateData: Record<string, unknown> = { ...input, updatedAt: new Date() }
  if (input.soul !== undefined) {
    updateData.adminSoul = input.soul
  }

  const [agent] = await db
    .update(agents)
    .set(updateData)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.id, agentId)))
    .returning()

  // Audit log with before/after
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_AGENT_UPDATE,
    targetType: 'agent',
    targetId: agentId,
    before: { name: current.name, tier: current.tier, modelName: current.modelName, departmentId: current.departmentId, soul: current.soul },
    after: { name: agent.name, tier: agent.tier, modelName: agent.modelName, departmentId: agent.departmentId, soul: agent.soul },
  })

  return { data: agent }
}

/**
 * Deactivate an agent (soft delete).
 * System agents (isSystem=true) cannot be deactivated (403).
 * Sets departmentId=null, isActive=false, status='offline'.
 */
export async function deactivateAgent(tenant: TenantActor, agentId: string) {
  // Get current state
  const [current] = await db
    .select()
    .from(agents)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.id, agentId)))
    .limit(1)

  if (!current) {
    return { error: { status: 404, message: '에이전트를 찾을 수 없습니다', code: 'AGENT_001' } }
  }

  // System agent protection (FR5)
  if (current.isSystem) {
    return { error: { status: 403, message: '시스템 에이전트는 삭제할 수 없습니다', code: 'AGENT_003' } }
  }

  // Soft deactivation: unassign from department + deactivate
  await db
    .update(agents)
    .set({
      departmentId: null,
      isActive: false,
      status: 'offline',
      updatedAt: new Date(),
    })
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.id, agentId)))

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_AGENT_DEACTIVATE,
    targetType: 'agent',
    targetId: agentId,
    before: { name: current.name, departmentId: current.departmentId, isActive: current.isActive, status: current.status },
    after: { departmentId: null, isActive: false, status: 'offline' },
  })

  return { data: { message: '에이전트가 비활성화되었습니다' } }
}
