/**
 * Factory for creating mock agent data in tests.
 */

export interface MockAgent {
  id: string
  companyId: string
  name: string
  role: string | null
  soul: string | null
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  departmentId: string | null
  status: string
  isSecretary: boolean
  isSystem: boolean
  allowedTools: string[] | null
  createdAt: string
  updatedAt: string
}

let counter = 0

export function createMockAgent(overrides: Partial<MockAgent> = {}): MockAgent {
  counter++
  return {
    id: `agent-${counter}`,
    companyId: 'company-1',
    name: `Agent ${counter}`,
    role: 'General Assistant',
    soul: null,
    tier: 'worker',
    modelName: 'claude-sonnet-4-6',
    departmentId: null,
    status: 'online',
    isSecretary: false,
    isSystem: false,
    allowedTools: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create multiple mock agents at once.
 */
export function createMockAgents(count: number, overrides: Partial<MockAgent> = {}): MockAgent[] {
  return Array.from({ length: count }, () => createMockAgent(overrides))
}
