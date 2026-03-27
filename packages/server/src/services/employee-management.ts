import { eq, and, ilike, count, sql, desc, or, inArray } from 'drizzle-orm'
import { db } from '../db'
import { users, departments, employeeDepartments, sessions } from '../db/schema'
import { createAuditLog, AUDIT_ACTIONS } from './audit-log'
import { generateSecurePassword } from './company-management'

// === Types ===

export interface CreateEmployeeInput {
  username: string
  name: string
  email: string
  role?: 'admin' | 'user'
  departmentIds?: string[]
}

export interface UpdateEmployeeInput {
  name?: string
  email?: string
  departmentIds?: string[]
}

export interface EmployeeListOptions {
  page?: number
  limit?: number
  search?: string
  departmentId?: string
  isActive?: boolean
}

// === Helper: get departments for a user ===

async function getEmployeeDepartments(userId: string) {
  const rows = await db
    .select({
      id: departments.id,
      name: departments.name,
    })
    .from(employeeDepartments)
    .innerJoin(departments, eq(employeeDepartments.departmentId, departments.id))
    .where(eq(employeeDepartments.userId, userId))

  return rows
}

// === Helper: validate departments belong to company ===

async function validateDepartmentOwnership(departmentIds: string[], companyId: string): Promise<string | null> {
  if (departmentIds.length === 0) return null

  const found = await db
    .select({ id: departments.id })
    .from(departments)
    .where(and(
      inArray(departments.id, departmentIds),
      eq(departments.companyId, companyId),
    ))

  if (found.length !== departmentIds.length) {
    return '일부 부서가 존재하지 않거나 다른 회사에 속합니다'
  }
  return null
}

// === Helper: replace department assignments ===

async function replaceDepartmentAssignments(userId: string, companyId: string, departmentIds: string[]) {
  // Delete existing
  await db
    .delete(employeeDepartments)
    .where(eq(employeeDepartments.userId, userId))

  // Insert new
  if (departmentIds.length > 0) {
    await db.insert(employeeDepartments).values(
      departmentIds.map(deptId => ({
        userId,
        departmentId: deptId,
        companyId,
      })),
    )
  }
}

// === Service Functions ===

/**
 * Create a new employee with auto-generated password and optional department assignments.
 */
export async function createEmployee(
  companyId: string,
  input: CreateEmployeeInput,
  actorId: string,
) {
  // Check global username uniqueness (users table has unique constraint)
  const [existingGlobal] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, input.username))
    .limit(1)
  if (existingGlobal) {
    return { error: { code: 'EMPLOYEE_USERNAME_DUPLICATE', message: '이미 존재하는 아이디입니다' } }
  }

  // Validate department ownership
  if (input.departmentIds && input.departmentIds.length > 0) {
    const err = await validateDepartmentOwnership(input.departmentIds, companyId)
    if (err) {
      return { error: { code: 'INVALID_DEPARTMENT', message: err } }
    }
  }

  // Generate secure password
  const initialPassword = generateSecurePassword()
  const passwordHash = await Bun.password.hash(initialPassword)

  // Create user record
  const [employee] = await db
    .insert(users)
    .values({
      companyId,
      username: input.username,
      passwordHash,
      tempPassword: initialPassword,
      name: input.name,
      email: input.email,
      role: input.role ?? 'user',
    })
    .returning({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })

  // Create department assignments
  const departmentIds = input.departmentIds ?? []
  if (departmentIds.length > 0) {
    await db.insert(employeeDepartments).values(
      departmentIds.map(deptId => ({
        userId: employee.id,
        departmentId: deptId,
        companyId,
      })),
    )
  }

  // Get assigned departments for response
  const assignedDepartments = departmentIds.length > 0
    ? await getEmployeeDepartments(employee.id)
    : []

  // Audit log
  await createAuditLog({
    companyId,
    actorType: 'admin_user',
    actorId,
    action: AUDIT_ACTIONS.EMPLOYEE_CREATE,
    targetType: 'user',
    targetId: employee.id,
    after: { username: employee.username, name: employee.name, departmentIds },
  }).catch(() => {})

  return {
    data: {
      employee,
      departments: assignedDepartments,
      initialPassword,
    },
  }
}

/**
 * List employees with pagination, search, and department filter.
 */
export async function listEmployees(companyId: string, options: EmployeeListOptions = {}) {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(Math.max(1, options.limit ?? 20), 100)
  const offset = (page - 1) * limit

  const conditions = [eq(users.companyId, companyId), eq(users.role, 'user')]

  if (options.search) {
    conditions.push(
      or(
        ilike(users.name, `%${options.search}%`),
        ilike(users.username, `%${options.search}%`),
      )!,
    )
  }

  if (options.isActive !== undefined) {
    conditions.push(eq(users.isActive, options.isActive))
  }

  // If departmentId filter, join with employee_departments
  if (options.departmentId) {
    const userIdsInDept = db
      .select({ userId: employeeDepartments.userId })
      .from(employeeDepartments)
      .where(eq(employeeDepartments.departmentId, options.departmentId))

    conditions.push(inArray(users.id, userIdsInDept))
  }

  const where = and(...conditions)

  const [data, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        companyId: users.companyId,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        tempPassword: users.tempPassword,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(users)
      .where(where),
  ])

  // Get departments for each employee
  const employeesWithDepts = await Promise.all(
    data.map(async (emp) => ({
      ...emp,
      departments: await getEmployeeDepartments(emp.id),
    })),
  )

  return {
    data: employeesWithDepts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Get employee detail with assigned departments.
 */
export async function getEmployeeDetail(employeeId: string, companyId: string) {
  const [employee] = await db
    .select({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      tempPassword: users.tempPassword,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(and(eq(users.id, employeeId), eq(users.companyId, companyId), eq(users.role, 'user')))
    .limit(1)

  if (!employee) return null

  const assignedDepartments = await getEmployeeDepartments(employeeId)

  return {
    ...employee,
    departments: assignedDepartments,
  }
}

/**
 * Update employee info and optionally replace department assignments.
 */
export async function updateEmployee(
  employeeId: string,
  companyId: string,
  input: UpdateEmployeeInput,
  actorId: string,
) {
  // Check employee exists in this company (role='user' only)
  const [existing] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(and(eq(users.id, employeeId), eq(users.companyId, companyId), eq(users.role, 'user')))
    .limit(1)

  if (!existing) return null

  // Validate department ownership if changing
  if (input.departmentIds && input.departmentIds.length > 0) {
    const err = await validateDepartmentOwnership(input.departmentIds, companyId)
    if (err) {
      return { error: { code: 'INVALID_DEPARTMENT', message: err } }
    }
  }

  // Update user fields
  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (input.name !== undefined) updateData.name = input.name
  if (input.email !== undefined) updateData.email = input.email

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(and(eq(users.id, employeeId), eq(users.companyId, companyId)))
    .returning({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })

  // Replace department assignments if provided
  if (input.departmentIds !== undefined) {
    await replaceDepartmentAssignments(employeeId, companyId, input.departmentIds)
  }

  const assignedDepartments = await getEmployeeDepartments(employeeId)

  // Audit log
  await createAuditLog({
    companyId,
    actorType: 'admin_user',
    actorId,
    action: AUDIT_ACTIONS.EMPLOYEE_UPDATE,
    targetType: 'user',
    targetId: employeeId,
    before: { name: existing.name, email: existing.email },
    after: { name: updated.name, email: updated.email, departmentIds: input.departmentIds },
  }).catch(() => {})

  return {
    data: {
      employee: updated,
      departments: assignedDepartments,
    },
  }
}

/**
 * Soft delete (deactivate) an employee. Also deletes sessions.
 */
export async function deactivateEmployee(
  employeeId: string,
  companyId: string,
  actorId: string,
) {
  const [employee] = await db
    .select({ id: users.id, isActive: users.isActive, name: users.name })
    .from(users)
    .where(and(eq(users.id, employeeId), eq(users.companyId, companyId), eq(users.role, 'user')))
    .limit(1)

  if (!employee) {
    return { error: { code: 'EMPLOYEE_NOT_FOUND', message: '직원을 찾을 수 없습니다' } }
  }

  if (!employee.isActive) {
    return { error: { code: 'EMPLOYEE_ALREADY_INACTIVE', message: '이미 비활성화된 직원입니다' } }
  }

  // Deactivate
  await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, employeeId))

  // Delete sessions (force logout)
  await db
    .delete(sessions)
    .where(eq(sessions.userId, employeeId))

  // Audit log
  await createAuditLog({
    companyId,
    actorType: 'admin_user',
    actorId,
    action: AUDIT_ACTIONS.EMPLOYEE_DEACTIVATE,
    targetType: 'user',
    targetId: employeeId,
    metadata: { employeeName: employee.name },
  }).catch(() => {})

  return { data: { message: '직원이 비활성화되었습니다' } }
}

/**
 * Reactivate a deactivated employee.
 */
export async function reactivateEmployee(
  employeeId: string,
  companyId: string,
  actorId: string,
) {
  const [employee] = await db
    .select({ id: users.id, isActive: users.isActive, name: users.name })
    .from(users)
    .where(and(eq(users.id, employeeId), eq(users.companyId, companyId), eq(users.role, 'user')))
    .limit(1)

  if (!employee) {
    return { error: { code: 'EMPLOYEE_NOT_FOUND', message: '직원을 찾을 수 없습니다' } }
  }

  if (employee.isActive) {
    return { error: { code: 'EMPLOYEE_ALREADY_ACTIVE', message: '이미 활성 상태인 직원입니다' } }
  }

  await db
    .update(users)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(users.id, employeeId))

  // Audit log
  await createAuditLog({
    companyId,
    actorType: 'admin_user',
    actorId,
    action: AUDIT_ACTIONS.EMPLOYEE_REACTIVATE,
    targetType: 'user',
    targetId: employeeId,
    metadata: { employeeName: employee.name },
  }).catch(() => {})

  return { data: { message: '직원이 재활성화되었습니다' } }
}

/**
 * Reset employee password. Generates new secure password, deletes sessions.
 */
export async function resetEmployeePassword(
  employeeId: string,
  companyId: string,
  actorId: string,
) {
  const [employee] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(and(eq(users.id, employeeId), eq(users.companyId, companyId), eq(users.role, 'user')))
    .limit(1)

  if (!employee) {
    return { error: { code: 'EMPLOYEE_NOT_FOUND', message: '직원을 찾을 수 없습니다' } }
  }

  const newPassword = generateSecurePassword()
  const passwordHash = await Bun.password.hash(newPassword)

  await db
    .update(users)
    .set({ passwordHash, tempPassword: newPassword, updatedAt: new Date() })
    .where(eq(users.id, employeeId))

  // Delete sessions (force logout)
  await db
    .delete(sessions)
    .where(eq(sessions.userId, employeeId))

  // Audit log
  await createAuditLog({
    companyId,
    actorType: 'admin_user',
    actorId,
    action: AUDIT_ACTIONS.EMPLOYEE_PASSWORD_RESET,
    targetType: 'user',
    targetId: employeeId,
    metadata: { employeeName: employee.name },
  }).catch(() => {})

  return { data: { tempPassword: newPassword } }
}
