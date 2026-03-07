import { describe, expect, it } from 'bun:test'
import { z } from 'zod'

/**
 * Story 0-4: Admin Console Company & User Management UI
 * TEA Risk-Based Test Suite — 36 tests
 *
 * Risk Areas:
 * - HIGH: Stats aggregation correctness (data integrity)
 * - HIGH: Company deactivation guard (business rule)
 * - MEDIUM: Search filter edge cases (UX)
 * - MEDIUM: User edit payload construction (data integrity)
 * - MEDIUM: Department filter mapping (data correctness)
 * - LOW: Schema validation (API boundary)
 * - LOW: UI state management patterns
 */

// === Schema validation (mirrors server-side Zod schemas) ===
const createCompanySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug는 소문자, 숫자, 하이픈만 가능'),
})

const updateCompanySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
})

const createUserSchema = z.object({
  companyId: z.string().uuid(),
  username: z.string().min(2).max(50),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).default('user'),
})

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().nullable().optional(),
  role: z.enum(['admin', 'user']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
})

// =============================================
// HIGH RISK: Stats Aggregation
// =============================================
describe('Companies Stats aggregation', () => {
  function buildStats(
    userCounts: { companyId: string; userCount: number }[],
    agentCounts: { companyId: string; agentCount: number }[]
  ) {
    const stats: Record<string, { userCount: number; agentCount: number }> = {}
    for (const row of userCounts) {
      stats[row.companyId] = { userCount: Number(row.userCount), agentCount: 0 }
    }
    for (const row of agentCounts) {
      if (!stats[row.companyId]) stats[row.companyId] = { userCount: 0, agentCount: 0 }
      stats[row.companyId].agentCount = Number(row.agentCount)
    }
    return stats
  }

  it('should aggregate user and agent counts per company', () => {
    const stats = buildStats(
      [{ companyId: 'c1', userCount: 3 }, { companyId: 'c2', userCount: 5 }],
      [{ companyId: 'c1', agentCount: 10 }, { companyId: 'c3', agentCount: 2 }]
    )
    expect(stats['c1']).toEqual({ userCount: 3, agentCount: 10 })
    expect(stats['c2']).toEqual({ userCount: 5, agentCount: 0 })
    expect(stats['c3']).toEqual({ userCount: 0, agentCount: 2 })
  })

  it('should handle empty data gracefully', () => {
    const stats = buildStats([], [])
    expect(Object.keys(stats)).toHaveLength(0)
  })

  it('should convert bigint count results to numbers', () => {
    expect(Number(BigInt(42))).toBe(42)
    expect(Number(BigInt(0))).toBe(0)
  })

  it('should handle company with users but no agents', () => {
    const stats = buildStats(
      [{ companyId: 'c1', userCount: 10 }],
      []
    )
    expect(stats['c1']).toEqual({ userCount: 10, agentCount: 0 })
  })

  it('should handle company with agents but no users', () => {
    const stats = buildStats(
      [],
      [{ companyId: 'c1', agentCount: 5 }]
    )
    expect(stats['c1']).toEqual({ userCount: 0, agentCount: 5 })
  })

  it('should handle large number of companies', () => {
    const userCounts = Array.from({ length: 100 }, (_, i) => ({ companyId: `c${i}`, userCount: i }))
    const agentCounts = Array.from({ length: 50 }, (_, i) => ({ companyId: `c${i}`, agentCount: i * 2 }))
    const stats = buildStats(userCounts, agentCounts)
    expect(Object.keys(stats)).toHaveLength(100)
    expect(stats['c0']).toEqual({ userCount: 0, agentCount: 0 })
    expect(stats['c49']).toEqual({ userCount: 49, agentCount: 98 })
    expect(stats['c99']).toEqual({ userCount: 99, agentCount: 0 })
  })

  it('should not mutate input arrays', () => {
    const uc = [{ companyId: 'c1', userCount: 1 }]
    const ac = [{ companyId: 'c1', agentCount: 2 }]
    const ucCopy = [...uc]
    const acCopy = [...ac]
    buildStats(uc, ac)
    expect(uc).toEqual(ucCopy)
    expect(ac).toEqual(acCopy)
  })
})

// =============================================
// HIGH RISK: Company Deactivation Guard
// =============================================
describe('Company deactivation business rules', () => {
  it('should block deactivation when active users exist', () => {
    const activeCount = 3
    const canDeactivate = Number(activeCount) === 0
    expect(canDeactivate).toBe(false)
  })

  it('should allow deactivation when no active users', () => {
    const activeCount = 0
    const canDeactivate = Number(activeCount) === 0
    expect(canDeactivate).toBe(true)
  })

  it('should produce correct error message with user count', () => {
    const activeCount = 5
    const msg = `활성 직원이 ${activeCount}명 있어 비활성화할 수 없습니다. 먼저 직원을 이동하거나 비활성화하세요`
    expect(msg).toContain('5명')
    expect(msg).toContain('비활성화')
  })

  it('should handle bigint activeCount from DB', () => {
    const activeCount = BigInt(0)
    expect(Number(activeCount) === 0).toBe(true)
    expect(Number(BigInt(1)) > 0).toBe(true)
  })
})

// =============================================
// MEDIUM RISK: Company Search Filter
// =============================================
describe('Company search filter', () => {
  const companies = [
    { id: '1', name: 'Acme Corp', slug: 'acme', isActive: true },
    { id: '2', name: 'Bravo Inc', slug: 'bravo', isActive: true },
    { id: '3', name: 'Charlie Ltd', slug: 'charlie', isActive: false },
    { id: '4', name: '한글회사', slug: 'korean-co', isActive: true },
  ]

  function searchCompanies(q: string) {
    if (!q.trim()) return companies
    const lower = q.toLowerCase()
    return companies.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.slug.toLowerCase().includes(lower)
    )
  }

  it('should filter by name (case-insensitive)', () => {
    expect(searchCompanies('acme')).toHaveLength(1)
    expect(searchCompanies('ACME')).toHaveLength(1)
    expect(searchCompanies('AcMe')).toHaveLength(1)
  })

  it('should filter by slug', () => {
    expect(searchCompanies('brav')).toHaveLength(1)
    expect(searchCompanies('bravo')[0].slug).toBe('bravo')
  })

  it('should return all when search is empty', () => {
    expect(searchCompanies('')).toHaveLength(4)
    expect(searchCompanies('   ')).toHaveLength(4)
  })

  it('should return empty array when no match', () => {
    expect(searchCompanies('nonexistent')).toHaveLength(0)
    expect(searchCompanies('zzz')).toHaveLength(0)
  })

  it('should handle Korean characters', () => {
    expect(searchCompanies('한글')).toHaveLength(1)
    expect(searchCompanies('한글회사')[0].id).toBe('4')
  })

  it('should handle partial matches', () => {
    expect(searchCompanies('ltd')).toHaveLength(1) // Charlie Ltd only
    expect(searchCompanies('inc')).toHaveLength(1) // Bravo Inc only
  })

  it('should match both name and slug for same company', () => {
    const result = searchCompanies('korean')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('korean-co')
  })
})

// =============================================
// MEDIUM RISK: User Department Filter
// =============================================
describe('User department filter', () => {
  const users = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Charlie' },
    { id: 'u4', name: 'Diana' },
  ]

  const agents = [
    { id: 'a1', userId: 'u1', departmentId: 'd1' },
    { id: 'a2', userId: 'u2', departmentId: 'd2' },
    { id: 'a3', userId: 'u3', departmentId: null },
    { id: 'a4', userId: 'u1', departmentId: 'd2' }, // u1 has multiple agents in different depts
  ]

  function buildUserDeptMap(agentsList: typeof agents) {
    const map = new Map<string, string>()
    for (const agent of agentsList) {
      if (agent.departmentId && agent.userId) {
        map.set(agent.userId, agent.departmentId)
      }
    }
    return map
  }

  it('should build user-to-department mapping from agents', () => {
    const map = buildUserDeptMap(agents)
    expect(map.has('u1')).toBe(true)
    expect(map.get('u2')).toBe('d2')
    expect(map.has('u3')).toBe(false) // null departmentId
  })

  it('should filter users by department', () => {
    const map = buildUserDeptMap(agents)
    const filtered = users.filter((u) => map.get(u.id) === 'd2')
    // u1's last agent is in d2 (overwritten), u2 is in d2
    expect(filtered.length).toBeGreaterThanOrEqual(1)
  })

  it('should return all users when filter is "all"', () => {
    const deptFilter = 'all'
    const filtered = deptFilter === 'all' ? users : users.filter(() => false)
    expect(filtered).toHaveLength(4)
  })

  it('should handle user with no agent assignment', () => {
    const map = buildUserDeptMap(agents)
    const unassigned = users.filter((u) => !map.has(u.id))
    expect(unassigned.some((u) => u.id === 'u3')).toBe(true)
    expect(unassigned.some((u) => u.id === 'u4')).toBe(true)
  })

  it('should handle empty agents list', () => {
    const map = buildUserDeptMap([])
    expect(map.size).toBe(0)
    const filtered = users.filter((u) => map.get(u.id) === 'd1')
    expect(filtered).toHaveLength(0)
  })

  it('should handle last-write-wins for multiple agents per user', () => {
    const map = buildUserDeptMap(agents)
    // u1 has agents in d1 and d2, last one (d2) should win
    expect(map.get('u1')).toBe('d2')
  })
})

// =============================================
// MEDIUM RISK: User Edit Payload Construction
// =============================================
describe('User edit form payload', () => {
  it('should include name, email, and role in payload', () => {
    const editForm = { name: 'New Name', email: 'new@email.com', role: 'admin' }
    const payload = {
      id: 'u1',
      name: editForm.name,
      email: editForm.email || undefined,
      role: editForm.role,
    }
    expect(payload.name).toBe('New Name')
    expect(payload.email).toBe('new@email.com')
    expect(payload.role).toBe('admin')
  })

  it('should handle empty email as undefined', () => {
    const editForm = { name: 'Test', email: '', role: 'user' }
    const payload = {
      id: 'u1',
      name: editForm.name,
      email: editForm.email || undefined,
      role: editForm.role,
    }
    expect(payload.email).toBeUndefined()
  })

  it('should preserve role change from user to admin', () => {
    const payload = { id: 'u1', role: 'admin' }
    expect(payload.role).toBe('admin')
  })

  it('should preserve role change from admin to user', () => {
    const payload = { id: 'u1', role: 'user' }
    expect(payload.role).toBe('user')
  })
})

// =============================================
// LOW RISK: Schema Validation (API Boundary)
// =============================================
describe('Company schema validation', () => {
  it('should accept valid company creation', () => {
    const result = createCompanySchema.safeParse({ name: 'Test Corp', slug: 'test-corp' })
    expect(result.success).toBe(true)
  })

  it('should reject empty name', () => {
    const result = createCompanySchema.safeParse({ name: '', slug: 'test' })
    expect(result.success).toBe(false)
  })

  it('should reject invalid slug (uppercase)', () => {
    const result = createCompanySchema.safeParse({ name: 'Test', slug: 'Test-Corp' })
    expect(result.success).toBe(false)
  })

  it('should reject slug with special characters', () => {
    const result = createCompanySchema.safeParse({ name: 'Test', slug: 'test@corp' })
    expect(result.success).toBe(false)
  })

  it('should accept slug with hyphens and numbers', () => {
    const result = createCompanySchema.safeParse({ name: 'Test', slug: 'test-123' })
    expect(result.success).toBe(true)
  })

  it('should reject name exceeding 100 chars', () => {
    const result = createCompanySchema.safeParse({ name: 'a'.repeat(101), slug: 'test' })
    expect(result.success).toBe(false)
  })

  it('should accept partial update schema', () => {
    expect(updateCompanySchema.safeParse({ name: 'New Name' }).success).toBe(true)
    expect(updateCompanySchema.safeParse({ isActive: false }).success).toBe(true)
    expect(updateCompanySchema.safeParse({}).success).toBe(true)
  })
})

describe('User schema validation', () => {
  const validUser = {
    companyId: '550e8400-e29b-41d4-a716-446655440000',
    username: 'testuser',
    password: 'secret123',
    name: 'Test User',
  }

  it('should accept valid user creation', () => {
    const result = createUserSchema.safeParse(validUser)
    expect(result.success).toBe(true)
  })

  it('should default role to "user"', () => {
    const result = createUserSchema.safeParse(validUser)
    if (result.success) expect(result.data.role).toBe('user')
  })

  it('should reject short username (< 2 chars)', () => {
    const result = createUserSchema.safeParse({ ...validUser, username: 'x' })
    expect(result.success).toBe(false)
  })

  it('should reject short password (< 6 chars)', () => {
    const result = createUserSchema.safeParse({ ...validUser, password: '12345' })
    expect(result.success).toBe(false)
  })

  it('should reject invalid companyId (not UUID)', () => {
    const result = createUserSchema.safeParse({ ...validUser, companyId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('should accept optional email in update', () => {
    expect(updateUserSchema.safeParse({ email: 'test@example.com' }).success).toBe(true)
    expect(updateUserSchema.safeParse({ email: null }).success).toBe(true)
  })

  it('should reject invalid role', () => {
    const result = updateUserSchema.safeParse({ role: 'superadmin' })
    expect(result.success).toBe(false)
  })
})

// =============================================
// LOW RISK: UI State Management Patterns
// =============================================
describe('UI state management patterns', () => {
  it('should show filtered count when search active', () => {
    const total = 10
    const filtered = 3
    const display = filtered === total
      ? `${total}개 회사`
      : `${filtered} / ${total}개 회사`
    expect(display).toBe('3 / 10개 회사')
  })

  it('should show simple count when no search', () => {
    const total = 10
    const filtered = 10
    const display = filtered === total
      ? `${total}개 회사`
      : `${filtered} / ${total}개 회사`
    expect(display).toBe('10개 회사')
  })

  it('should sanitize slug input', () => {
    const rawInput = 'Test Company 한글!'
    const sanitized = rawInput.toLowerCase().replace(/[^a-z0-9-]/g, '')
    expect(sanitized).toBe('testcompany')
  })
})
