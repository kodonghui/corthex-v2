import { randomBytes } from 'crypto'
import { eq, and, ilike, count, sql, desc } from 'drizzle-orm'
import { db } from '../db'
import { companies, adminUsers, users, agents, departments } from '../db/schema'
import { createAuditLog, AUDIT_ACTIONS } from './audit-log'

export interface CreateCompanyInput {
  name: string
  slug: string
  adminUsername: string
  adminName: string
  adminEmail?: string
}

export interface UpdateCompanyInput {
  name?: string
  slug?: string
  settings?: Record<string, unknown>
  smtpConfig?: Record<string, unknown> | null
}

export interface CompanyListOptions {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

/**
 * Generate a cryptographically secure random password.
 * Contains at least 1 uppercase, 1 lowercase, 1 digit, 1 special character.
 */
export function generateSecurePassword(length = 16): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const digits = '0123456789'
  const specials = '!@#$%^&*'
  const allChars = upper + lower + digits + specials

  // Ensure at least one from each category
  const required = [
    upper[randomBytes(1)[0] % upper.length],
    lower[randomBytes(1)[0] % lower.length],
    digits[randomBytes(1)[0] % digits.length],
    specials[randomBytes(1)[0] % specials.length],
  ]

  // Fill remaining length with random chars
  const remaining = length - required.length
  const bytes = randomBytes(remaining)
  const extra = Array.from(bytes).map(b => allChars[b % allChars.length])

  // Shuffle all characters together
  const all = [...required, ...extra]
  const shuffleBytes = randomBytes(all.length)
  for (let i = all.length - 1; i > 0; i--) {
    const j = shuffleBytes[i] % (i + 1)
    ;[all[i], all[j]] = [all[j], all[i]]
  }

  return all.join('')
}

/**
 * Create a new company with its first admin account.
 * Returns the company, admin account, and the plaintext initial password (shown once).
 */
export async function createCompanyWithAdmin(
  input: CreateCompanyInput,
  actorId: string,
) {
  // Check slug uniqueness
  const [existingSlug] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.slug, input.slug))
    .limit(1)
  if (existingSlug) {
    return { error: { code: 'COMPANY_SLUG_DUPLICATE', message: '이미 사용 중인 slug입니다' } }
  }

  // Check admin username uniqueness
  const [existingUsername] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.username, input.adminUsername))
    .limit(1)
  if (existingUsername) {
    return { error: { code: 'ADMIN_USERNAME_DUPLICATE', message: '이미 존재하는 관리자 아이디입니다' } }
  }

  // Generate secure initial password
  const initialPassword = generateSecurePassword()
  const passwordHash = await Bun.password.hash(initialPassword)

  // Create company
  const [company] = await db
    .insert(companies)
    .values({
      name: input.name,
      slug: input.slug,
    })
    .returning()

  // Create company admin account
  const [admin] = await db
    .insert(adminUsers)
    .values({
      companyId: company.id,
      username: input.adminUsername,
      passwordHash,
      name: input.adminName,
      email: input.adminEmail ?? null,
      role: 'admin', // company_admin role in admin_users table
    })
    .returning({
      id: adminUsers.id,
      companyId: adminUsers.companyId,
      username: adminUsers.username,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
    })

  // Audit log
  await createAuditLog({
    companyId: company.id,
    actorType: 'admin_user',
    actorId,
    action: AUDIT_ACTIONS.COMPANY_CREATE,
    targetType: 'company',
    targetId: company.id,
    after: { company: { id: company.id, name: company.name, slug: company.slug }, adminUsername: admin.username },
  }).catch(() => {})

  return {
    data: {
      company,
      admin,
      initialPassword,
    },
  }
}

/**
 * List companies with pagination and search.
 */
export async function listCompanies(options: CompanyListOptions = {}) {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(Math.max(1, options.limit ?? 20), 100)
  const offset = (page - 1) * limit

  const conditions = []

  if (options.search) {
    conditions.push(ilike(companies.name, `%${options.search}%`))
  }

  if (options.isActive !== undefined) {
    conditions.push(eq(companies.isActive, options.isActive))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, [{ total }]] = await Promise.all([
    db
      .select()
      .from(companies)
      .where(where)
      .orderBy(desc(companies.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(companies)
      .where(where),
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Get company by ID with related stats (user count, agent count, department count).
 */
export async function getCompanyDetail(companyId: string) {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company) return null

  const [[userStats], [agentStats], [deptStats]] = await Promise.all([
    db.select({ count: count() }).from(users).where(and(eq(users.companyId, companyId), eq(users.isActive, true))),
    db.select({ count: count() }).from(agents).where(and(eq(agents.companyId, companyId), eq(agents.isActive, true))),
    db.select({ count: count() }).from(departments).where(eq(departments.companyId, companyId)),
  ])

  return {
    ...company,
    stats: {
      userCount: Number(userStats.count),
      agentCount: Number(agentStats.count),
      departmentCount: Number(deptStats.count),
    },
  }
}

/**
 * Update company info. Returns null if not found.
 */
export async function updateCompany(
  companyId: string,
  input: UpdateCompanyInput,
  actorId: string,
) {
  // If slug is being changed, check uniqueness
  if (input.slug) {
    const [existingSlug] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.slug, input.slug), sql`${companies.id} != ${companyId}`))
      .limit(1)
    if (existingSlug) {
      return { error: { code: 'COMPANY_SLUG_DUPLICATE', message: '이미 사용 중인 slug입니다' } }
    }
  }

  // Get before state for audit
  const [before] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)
  if (!before) return null

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (input.name !== undefined) updateData.name = input.name
  if (input.slug !== undefined) updateData.slug = input.slug
  if (input.settings !== undefined) updateData.settings = input.settings
  if (input.smtpConfig !== undefined) updateData.smtpConfig = input.smtpConfig

  const [updated] = await db
    .update(companies)
    .set(updateData)
    .where(eq(companies.id, companyId))
    .returning()

  // Audit log
  await createAuditLog({
    companyId,
    actorType: 'admin_user',
    actorId,
    action: AUDIT_ACTIONS.COMPANY_UPDATE,
    targetType: 'company',
    targetId: companyId,
    before: { name: before.name, slug: before.slug },
    after: { name: updated.name, slug: updated.slug },
  }).catch(() => {})

  return { data: updated }
}

/**
 * Soft delete a company (set isActive=false) and cascade to all its users.
 */
export async function softDeleteCompany(companyId: string, actorId: string) {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company) return { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾을 수 없습니다' } }

  if (!company.isActive) {
    return { error: { code: 'COMPANY_ALREADY_INACTIVE', message: '이미 비활성화된 회사입니다' } }
  }

  // Cascade soft delete: company + users + admin_users for this company
  await db
    .update(companies)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(companies.id, companyId))

  // Deactivate all users in this company
  const deactivatedUsers = await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.companyId, companyId))
    .returning({ id: users.id })

  // Deactivate all admin_users linked to this company
  const deactivatedAdmins = await db
    .update(adminUsers)
    .set({ isActive: false })
    .where(eq(adminUsers.companyId, companyId))
    .returning({ id: adminUsers.id })

  // Audit log
  await createAuditLog({
    companyId,
    actorType: 'admin_user',
    actorId,
    action: AUDIT_ACTIONS.COMPANY_DELETE,
    targetType: 'company',
    targetId: companyId,
    metadata: {
      companyName: company.name,
      deactivatedUsers: deactivatedUsers.length,
      deactivatedAdmins: deactivatedAdmins.length,
    },
  }).catch(() => {})

  return {
    data: {
      message: '회사가 비활성화되었습니다',
      deactivatedUsers: deactivatedUsers.length,
      deactivatedAdmins: deactivatedAdmins.length,
    },
  }
}
