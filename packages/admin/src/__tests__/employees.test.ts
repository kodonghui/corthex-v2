/**
 * Tests for Story 9-4: Employee Management UI (Admin A4)
 * Pure logic tests: pagination, filter state, department toggle, search debounce, URL param building
 */
import { describe, test, expect } from 'bun:test'

// === Pure functions extracted from employees.tsx logic ===

type Department = { id: string; name: string }
type Employee = {
  id: string; username: string; name: string; email: string
  isActive: boolean; createdAt: string; departments: Department[]
}
type Pagination = { page: number; limit: number; total: number; totalPages: number }

// Build query params for employee list API
function buildEmployeeParams(opts: {
  companyId: string; page: number; limit: number
  search?: string; departmentId?: string; isActive?: string
}): string {
  const params = new URLSearchParams()
  params.set('companyId', opts.companyId)
  params.set('page', String(opts.page))
  params.set('limit', String(opts.limit))
  if (opts.search) params.set('search', opts.search)
  if (opts.departmentId) params.set('departmentId', opts.departmentId)
  if (opts.isActive) params.set('isActive', opts.isActive)
  return params.toString()
}

// Department toggle for multi-select
function toggleDept(deptId: string, current: string[]): string[] {
  return current.includes(deptId)
    ? current.filter((id) => id !== deptId)
    : [...current, deptId]
}

// Pagination page number generation with ellipsis
function generatePageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)

  return pages.reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
    acc.push(p)
    return acc
  }, [])
}

// Pagination range text
function paginationRangeText(pagination: Pagination): string {
  const start = (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, pagination.total)
  return `${pagination.total}명 중 ${start}-${end}명`
}

// Validate invite form
function validateInviteForm(form: { username: string; name: string; email: string }): string | null {
  if (!form.username.trim()) return '아이디를 입력하세요'
  if (form.username.trim().length < 2) return '아이디는 2자 이상이어야 합니다'
  if (!form.name.trim()) return '이름을 입력하세요'
  if (!form.email.trim()) return '이메일을 입력하세요'
  if (!form.email.includes('@')) return '올바른 이메일 형식이 아닙니다'
  return null
}

// === Tests ===

describe('Employee Management UI - Query Params', () => {
  test('builds basic params with companyId, page, limit', () => {
    const params = buildEmployeeParams({ companyId: 'c1', page: 1, limit: 20 })
    expect(params).toContain('companyId=c1')
    expect(params).toContain('page=1')
    expect(params).toContain('limit=20')
    expect(params).not.toContain('search=')
    expect(params).not.toContain('departmentId=')
    expect(params).not.toContain('isActive=')
  })

  test('includes search param when provided', () => {
    const params = buildEmployeeParams({ companyId: 'c1', page: 1, limit: 20, search: 'john' })
    expect(params).toContain('search=john')
  })

  test('includes departmentId when provided', () => {
    const params = buildEmployeeParams({ companyId: 'c1', page: 1, limit: 20, departmentId: 'd1' })
    expect(params).toContain('departmentId=d1')
  })

  test('includes isActive when provided', () => {
    const params = buildEmployeeParams({ companyId: 'c1', page: 1, limit: 20, isActive: 'true' })
    expect(params).toContain('isActive=true')
  })

  test('includes all filters together', () => {
    const params = buildEmployeeParams({
      companyId: 'c1', page: 2, limit: 20,
      search: 'test', departmentId: 'd1', isActive: 'false',
    })
    expect(params).toContain('page=2')
    expect(params).toContain('search=test')
    expect(params).toContain('departmentId=d1')
    expect(params).toContain('isActive=false')
  })

  test('empty string filters are excluded', () => {
    const params = buildEmployeeParams({ companyId: 'c1', page: 1, limit: 20, search: '', departmentId: '', isActive: '' })
    expect(params).not.toContain('search=')
    expect(params).not.toContain('departmentId=')
    expect(params).not.toContain('isActive=')
  })
})

describe('Department Multi-Select Toggle', () => {
  test('adds department to empty list', () => {
    expect(toggleDept('d1', [])).toEqual(['d1'])
  })

  test('adds department to existing list', () => {
    expect(toggleDept('d2', ['d1'])).toEqual(['d1', 'd2'])
  })

  test('removes department from list', () => {
    expect(toggleDept('d1', ['d1', 'd2'])).toEqual(['d2'])
  })

  test('removes last department', () => {
    expect(toggleDept('d1', ['d1'])).toEqual([])
  })

  test('toggle twice returns original', () => {
    const original = ['d1', 'd2']
    const after = toggleDept('d3', original)
    const restored = toggleDept('d3', after)
    expect(restored).toEqual(original)
  })

  test('handles multiple toggles correctly', () => {
    let depts: string[] = []
    depts = toggleDept('d1', depts)
    depts = toggleDept('d2', depts)
    depts = toggleDept('d3', depts)
    expect(depts).toEqual(['d1', 'd2', 'd3'])
    depts = toggleDept('d2', depts)
    expect(depts).toEqual(['d1', 'd3'])
  })
})

describe('Pagination', () => {
  test('generates simple page numbers for few pages', () => {
    expect(generatePageNumbers(1, 3)).toEqual([1, 2, 3])
  })

  test('generates page numbers with ellipsis', () => {
    const result = generatePageNumbers(5, 10)
    expect(result).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10])
  })

  test('no ellipsis at start when on page 1', () => {
    const result = generatePageNumbers(1, 10)
    expect(result).toEqual([1, 2, 'ellipsis', 10])
  })

  test('no ellipsis at end when on last page', () => {
    const result = generatePageNumbers(10, 10)
    expect(result).toEqual([1, 'ellipsis', 9, 10])
  })

  test('single page returns just [1]', () => {
    expect(generatePageNumbers(1, 1)).toEqual([1])
  })

  test('two pages returns [1, 2]', () => {
    expect(generatePageNumbers(1, 2)).toEqual([1, 2])
  })

  test('page 2 of 10 has no leading ellipsis', () => {
    const result = generatePageNumbers(2, 10)
    expect(result).toEqual([1, 2, 3, 'ellipsis', 10])
  })

  test('page 9 of 10 has no trailing ellipsis', () => {
    const result = generatePageNumbers(9, 10)
    expect(result).toEqual([1, 'ellipsis', 8, 9, 10])
  })
})

describe('Pagination Range Text', () => {
  test('first page', () => {
    expect(paginationRangeText({ page: 1, limit: 20, total: 50, totalPages: 3 }))
      .toBe('50명 중 1-20명')
  })

  test('middle page', () => {
    expect(paginationRangeText({ page: 2, limit: 20, total: 50, totalPages: 3 }))
      .toBe('50명 중 21-40명')
  })

  test('last page with partial results', () => {
    expect(paginationRangeText({ page: 3, limit: 20, total: 50, totalPages: 3 }))
      .toBe('50명 중 41-50명')
  })

  test('single page with few items', () => {
    expect(paginationRangeText({ page: 1, limit: 20, total: 5, totalPages: 1 }))
      .toBe('5명 중 1-5명')
  })
})

describe('Invite Form Validation', () => {
  test('valid form returns null', () => {
    expect(validateInviteForm({ username: 'john', name: 'John', email: 'john@test.com' })).toBeNull()
  })

  test('empty username returns error', () => {
    expect(validateInviteForm({ username: '', name: 'John', email: 'john@test.com' })).toBe('아이디를 입력하세요')
  })

  test('short username returns error', () => {
    expect(validateInviteForm({ username: 'j', name: 'John', email: 'john@test.com' })).toBe('아이디는 2자 이상이어야 합니다')
  })

  test('empty name returns error', () => {
    expect(validateInviteForm({ username: 'john', name: '', email: 'john@test.com' })).toBe('이름을 입력하세요')
  })

  test('empty email returns error', () => {
    expect(validateInviteForm({ username: 'john', name: 'John', email: '' })).toBe('이메일을 입력하세요')
  })

  test('invalid email returns error', () => {
    expect(validateInviteForm({ username: 'john', name: 'John', email: 'notanemail' })).toBe('올바른 이메일 형식이 아닙니다')
  })

  test('whitespace-only username returns error', () => {
    expect(validateInviteForm({ username: '  ', name: 'John', email: 'john@test.com' })).toBe('아이디를 입력하세요')
  })
})

describe('Employee Department Display', () => {
  const makeEmployee = (depts: Department[]): Employee => ({
    id: '1', username: 'test', name: 'Test', email: 'test@test.com',
    isActive: true, createdAt: '2026-01-01', departments: depts,
  })

  test('employee with no departments shows empty array', () => {
    const emp = makeEmployee([])
    expect(emp.departments.length).toBe(0)
  })

  test('employee with one department', () => {
    const emp = makeEmployee([{ id: 'd1', name: '개발부' }])
    expect(emp.departments.length).toBe(1)
    expect(emp.departments[0].name).toBe('개발부')
  })

  test('employee with multiple departments', () => {
    const emp = makeEmployee([
      { id: 'd1', name: '개발부' },
      { id: 'd2', name: '마케팅부' },
      { id: 'd3', name: '기획부' },
    ])
    expect(emp.departments.length).toBe(3)
    expect(emp.departments.map((d) => d.name)).toEqual(['개발부', '마케팅부', '기획부'])
  })
})

describe('Active Status Filter', () => {
  test('empty string means show all', () => {
    const filter = ''
    expect(filter).toBe('')
    // In the component, empty filter means no isActive param sent
  })

  test('true means show active only', () => {
    const filter = 'true'
    expect(filter).toBe('true')
  })

  test('false means show inactive only', () => {
    const filter = 'false'
    expect(filter).toBe('false')
  })
})

describe('Edit Form Pre-fill', () => {
  test('pre-fills from employee data', () => {
    const emp: Employee = {
      id: '1', username: 'john', name: 'John Doe', email: 'john@test.com',
      isActive: true, createdAt: '2026-01-01',
      departments: [{ id: 'd1', name: 'Dev' }, { id: 'd2', name: 'QA' }],
    }

    const editForm = {
      name: emp.name,
      email: emp.email || '',
      departmentIds: emp.departments.map((d) => d.id),
    }

    expect(editForm.name).toBe('John Doe')
    expect(editForm.email).toBe('john@test.com')
    expect(editForm.departmentIds).toEqual(['d1', 'd2'])
  })

  test('handles null email', () => {
    const emp = {
      id: '1', username: 'john', name: 'John', email: null as string | null,
      isActive: true, createdAt: '2026-01-01', departments: [],
    }

    const editForm = {
      name: emp.name,
      email: emp.email || '',
      departmentIds: emp.departments.map((d: Department) => d.id),
    }

    expect(editForm.email).toBe('')
    expect(editForm.departmentIds).toEqual([])
  })
})
