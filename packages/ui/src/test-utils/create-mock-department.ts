/**
 * Factory for creating mock department data in tests.
 */

export interface MockDepartment {
  id: string
  companyId: string
  name: string
  parentId: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

let counter = 0

export function createMockDepartment(overrides: Partial<MockDepartment> = {}): MockDepartment {
  counter++
  return {
    id: `dept-${counter}`,
    companyId: 'company-1',
    name: `Department ${counter}`,
    parentId: null,
    description: `Test department ${counter}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create multiple mock departments at once.
 */
export function createMockDepartments(count: number, overrides: Partial<MockDepartment> = {}): MockDepartment[] {
  return Array.from({ length: count }, () => createMockDepartment(overrides))
}
