import { db } from '../db'
import { departments, agents } from '../db/schema'
import { eq, and, count, ne } from 'drizzle-orm'
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
