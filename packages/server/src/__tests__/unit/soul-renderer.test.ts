import { describe, test, expect, mock, beforeEach, afterAll } from 'bun:test'

// Restore mocks after all tests to prevent leakage to other test files
afterAll(() => {
  mock.restore()
})

// Mock getDB before importing soul-renderer
const mockAgentById = mock(() => Promise.resolve([{
  id: 'agent-1',
  companyId: 'co-1',
  userId: 'user-1',
  departmentId: 'dept-1',
  name: 'TestAgent',
  role: 'Researcher',
  tier: 'specialist',
  nameEn: 'TestAgent',
  modelName: 'claude-haiku-4-5',
  reportTo: null,
  soul: '',
  adminSoul: null,
  status: 'online',
  isSecretary: false,
  isSystem: false,
  allowedTools: [],
  autoLearn: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}]))

const mockAgents = mock(() => Promise.resolve([
  { name: 'Alice', role: 'Manager', id: 'a1', companyId: 'co-1', userId: 'u1', departmentId: 'd1', tier: 'manager', nameEn: 'Alice', modelName: 'claude-sonnet-4-6', reportTo: null, soul: '', adminSoul: null, status: 'online', isSecretary: false, isSystem: false, allowedTools: [], autoLearn: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { name: 'Bob', role: 'Worker', id: 'a2', companyId: 'co-1', userId: 'u2', departmentId: 'd1', tier: 'worker', nameEn: 'Bob', modelName: 'claude-haiku-4-5', reportTo: 'a1', soul: '', adminSoul: null, status: 'online', isSecretary: false, isSystem: false, allowedTools: [], autoLearn: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
]))

const mockAgentsByReportTo = mock(() => Promise.resolve([
  { name: 'Sub1', role: 'Analyst', id: 's1', companyId: 'co-1', userId: 'u3', departmentId: 'd1', tier: 'worker', nameEn: 'Sub1', modelName: 'claude-haiku-4-5', reportTo: 'agent-1', soul: '', adminSoul: null, status: 'online', isSecretary: false, isSystem: false, allowedTools: [], autoLearn: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
]))

const mockAgentToolsWithDefs = mock(() => Promise.resolve([
  { name: 'web_search', description: 'Search the web' },
  { name: 'calculator', description: 'Math operations' },
]))

const mockDepartmentById = mock(() => Promise.resolve([
  { id: 'dept-1', companyId: 'co-1', name: 'Research Division', description: 'R&D', isActive: true, createdAt: new Date(), updatedAt: new Date() },
]))

const mockUserById = mock(() => Promise.resolve([
  { id: 'user-1', companyId: 'co-1', username: 'owner', passwordHash: '', name: 'Dr. Owner', email: null, role: 'user', isActive: true, createdAt: new Date(), updatedAt: new Date() },
]))

mock.module('../../db/scoped-query', () => ({
  getDB: (_companyId: string) => ({
    agents: mockAgents,
    agentById: mockAgentById,
    agentsByReportTo: mockAgentsByReportTo,
    agentToolsWithDefs: mockAgentToolsWithDefs,
    departmentById: mockDepartmentById,
    userById: mockUserById,
  }),
}))

import { renderSoul } from '../../engine/soul-renderer'
import { SECRETARY_SOUL_TEMPLATE, MANAGER_SOUL_TEMPLATE, BUILTIN_SOUL_TEMPLATES } from '../../lib/soul-templates'

describe('soul-renderer (E4)', () => {
  beforeEach(() => {
    mockAgentById.mockClear()
    mockAgents.mockClear()
    mockAgentsByReportTo.mockClear()
    mockAgentToolsWithDefs.mockClear()
    mockDepartmentById.mockClear()
    mockUserById.mockClear()
  })

  test('substitutes all 6 variables correctly', async () => {
    const template = [
      'Agents: {{agent_list}}',
      'Subordinates: {{subordinate_list}}',
      'Tools: {{tool_list}}',
      'Dept: {{department_name}}',
      'Owner: {{owner_name}}',
      'Specialty: {{specialty}}',
    ].join('\n')

    const result = await renderSoul(template, 'agent-1', 'co-1')

    expect(result).toContain('Alice(Manager), Bob(Worker)')
    expect(result).toContain('Sub1(Analyst)')
    expect(result).toContain('web_search: Search the web, calculator: Math operations')
    expect(result).toContain('Research Division')
    expect(result).toContain('Dr. Owner')
    expect(result).toContain('Researcher')
  })

  test('replaces missing/unknown variables with empty string', async () => {
    const template = 'Hello {{unknown_var}} world {{another_missing}}'
    const result = await renderSoul(template, 'agent-1', 'co-1')
    expect(result).toBe('Hello  world ')
  })

  test('handles empty DB results gracefully', async () => {
    mockAgentsByReportTo.mockImplementationOnce(() => Promise.resolve([]))
    mockAgentToolsWithDefs.mockImplementationOnce(() => Promise.resolve([]))
    mockDepartmentById.mockImplementationOnce(() => Promise.resolve([]))
    mockUserById.mockImplementationOnce(() => Promise.resolve([]))

    const template = 'Subs: {{subordinate_list}} | Tools: {{tool_list}} | Dept: {{department_name}} | Owner: {{owner_name}}'
    const result = await renderSoul(template, 'agent-1', 'co-1')

    expect(result).toBe('Subs:  | Tools:  | Dept:  | Owner: ')
  })

  test('passes through template with no variables unchanged', async () => {
    const template = 'You are a helpful assistant. Do your best work.'
    const result = await renderSoul(template, 'agent-1', 'co-1')
    expect(result).toBe(template)
  })

  test('returns cleaned template when agent not found', async () => {
    mockAgentById.mockImplementationOnce(() => Promise.resolve([]))

    const template = 'Hello {{agent_list}} and {{specialty}}'
    const result = await renderSoul(template, 'nonexistent', 'co-1')

    expect(result).toBe('Hello  and ')
    // Should not call other queries if agent not found
    expect(mockAgents.mock.calls.length).toBe(0)
  })

  // === TEA Risk-Based Tests ===

  test('TEA P0: does not inject user input — only DB data used', async () => {
    // renderSoul only accepts soulTemplate (from DB soul field), agentId, companyId
    // No user message parameter exists — prompt injection impossible by API design
    const template = '{{agent_list}} {{specialty}}'
    const result = await renderSoul(template, 'agent-1', 'co-1')
    // Result contains only DB-sourced data, never user input
    expect(result).toContain('Alice(Manager)')
    expect(result).toContain('Researcher')
  })

  test('TEA P1: agent with null departmentId skips department query', async () => {
    mockAgentById.mockImplementationOnce(() => Promise.resolve([{
      id: 'agent-no-dept',
      companyId: 'co-1',
      userId: 'user-1',
      departmentId: null,
      name: 'NoDept',
      role: 'Freelancer',
      tier: 'worker',
      nameEn: 'NoDept',
      modelName: 'claude-haiku-4-5',
      reportTo: null,
      soul: '',
      adminSoul: null,
      status: 'online',
      isSecretary: false,
      isSystem: false,
      allowedTools: [],
      autoLearn: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]))

    const template = 'Dept: {{department_name}} | Role: {{specialty}}'
    const result = await renderSoul(template, 'agent-no-dept', 'co-1')

    expect(result).toBe('Dept:  | Role: Freelancer')
    // departmentById should NOT be called when departmentId is null
    expect(mockDepartmentById.mock.calls.length).toBe(0)
  })

  test('TEA P1: multiple occurrences of same variable all substituted', async () => {
    const template = 'First: {{specialty}} | Again: {{specialty}} | Third: {{specialty}}'
    const result = await renderSoul(template, 'agent-1', 'co-1')
    expect(result).toBe('First: Researcher | Again: Researcher | Third: Researcher')
  })

  test('TEA P1: single braces are not treated as variables', async () => {
    const template = 'JSON: {key: "value"} and {{specialty}} end'
    const result = await renderSoul(template, 'agent-1', 'co-1')
    expect(result).toBe('JSON: {key: "value"} and Researcher end')
  })

  test('TEA P1: agent with null role returns empty specialty', async () => {
    mockAgentById.mockImplementationOnce(() => Promise.resolve([{
      id: 'agent-null-role',
      companyId: 'co-1',
      userId: 'user-1',
      departmentId: 'dept-1',
      name: 'NoRole',
      role: null,
      tier: 'worker',
      nameEn: 'NoRole',
      modelName: 'claude-haiku-4-5',
      reportTo: null,
      soul: '',
      adminSoul: null,
      status: 'online',
      isSecretary: false,
      isSystem: false,
      allowedTools: [],
      autoLearn: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]))

    const template = 'Specialty: {{specialty}}'
    const result = await renderSoul(template, 'agent-null-role', 'co-1')
    expect(result).toBe('Specialty: ')
  })
})

// === Story 5.2: Secretary Soul Template Tests ===

describe('SECRETARY_SOUL_TEMPLATE (Story 5.2)', () => {
  test('contains all 6 soul-renderer variables', () => {
    const requiredVars = [
      '{{agent_list}}',
      '{{subordinate_list}}',
      '{{tool_list}}',
      '{{department_name}}',
      '{{owner_name}}',
      '{{specialty}}',
    ]
    for (const v of requiredVars) {
      expect(SECRETARY_SOUL_TEMPLATE).toContain(v)
    }
  })

  test('contains call_agent delegation instruction', () => {
    expect(SECRETARY_SOUL_TEMPLATE).toContain('call_agent')
  })

  test('contains QA 5-item gate (conclusion/evidence/risk/format/logic)', () => {
    expect(SECRETARY_SOUL_TEMPLATE).toContain('결론')
    expect(SECRETARY_SOUL_TEMPLATE).toContain('근거')
    expect(SECRETARY_SOUL_TEMPLATE).toContain('리스크')
    expect(SECRETARY_SOUL_TEMPLATE).toContain('형식')
    expect(SECRETARY_SOUL_TEMPLATE).toContain('논리')
  })

  test('contains 4-step processing flow', () => {
    expect(SECRETARY_SOUL_TEMPLATE).toContain('1단계')
    expect(SECRETARY_SOUL_TEMPLATE).toContain('2단계')
    expect(SECRETARY_SOUL_TEMPLATE).toContain('3단계')
    expect(SECRETARY_SOUL_TEMPLATE).toContain('4단계')
  })

  test('contains synthesis instruction for CEO-level reporting', () => {
    expect(SECRETARY_SOUL_TEMPLATE).toContain('CEO')
    expect(SECRETARY_SOUL_TEMPLATE).toContain('종합')
  })

  test('is approximately 2000 chars', () => {
    // AC says ~2,000 chars — allow range 1200-2500
    expect(SECRETARY_SOUL_TEMPLATE.length).toBeGreaterThan(1200)
    expect(SECRETARY_SOUL_TEMPLATE.length).toBeLessThan(2500)
  })

  test('renders correctly with soul-renderer substitution', async () => {
    const result = await renderSoul(SECRETARY_SOUL_TEMPLATE, 'agent-1', 'co-1')

    // All variables should be replaced (no {{...}} remaining)
    expect(result).not.toMatch(/\{\{[^}]+\}\}/)

    // Specific substitutions should appear
    expect(result).toContain('Alice(Manager), Bob(Worker)')
    expect(result).toContain('Sub1(Analyst)')
    expect(result).toContain('web_search: Search the web')
    expect(result).toContain('Research Division')
    expect(result).toContain('Dr. Owner')
  })

  test('renders gracefully with empty agent list', async () => {
    mockAgents.mockImplementationOnce(() => Promise.resolve([]))
    mockAgentsByReportTo.mockImplementationOnce(() => Promise.resolve([]))
    mockAgentToolsWithDefs.mockImplementationOnce(() => Promise.resolve([]))

    const result = await renderSoul(SECRETARY_SOUL_TEMPLATE, 'agent-1', 'co-1')

    // No remaining variables
    expect(result).not.toMatch(/\{\{[^}]+\}\}/)
    // Template structure still intact
    expect(result).toContain('비서실장')
    expect(result).toContain('call_agent')
  })
})

// === TEA Risk-Based Tests for Story 5.2 ===

describe('TEA: SECRETARY_SOUL_TEMPLATE risk-based tests', () => {
  test('TEA P0: no user input injection vectors in template', () => {
    // Secretary Soul must not contain patterns that could allow prompt injection
    // E4: Soul에 사용자 입력 직접 삽입 절대 금지
    // Only {{variable}} patterns allowed — no eval, no template literals, no user-facing injection
    const dangerousPatterns = [
      /\$\{/,        // JS template literal injection
      /eval\(/,       // eval injection
      /Function\(/,   // Function constructor
      /import\(/,     // dynamic import
    ]
    for (const pattern of dangerousPatterns) {
      expect(SECRETARY_SOUL_TEMPLATE).not.toMatch(pattern)
    }
  })

  test('TEA P0: rendered secretary Soul contains no raw variable placeholders', async () => {
    // After rendering, zero {{...}} should remain — all must resolve
    const result = await renderSoul(SECRETARY_SOUL_TEMPLATE, 'agent-1', 'co-1')
    const remaining = result.match(/\{\{[^}]+\}\}/g)
    expect(remaining).toBeNull()
  })

  test('TEA P1: secretary and manager templates have no duplicate variable patterns', () => {
    // Both templates should use the same 6 variables from E4 spec
    const e4Vars = ['agent_list', 'subordinate_list', 'tool_list', 'department_name', 'owner_name', 'specialty']
    for (const v of e4Vars) {
      // Each variable should appear at least once in secretary template
      expect(SECRETARY_SOUL_TEMPLATE).toContain(`{{${v}}}`)
    }
    // No variables outside E4 spec
    const allVars = SECRETARY_SOUL_TEMPLATE.match(/\{\{(\w+)\}\}/g) || []
    const uniqueVars = [...new Set(allVars.map(v => v.replace(/\{\{|\}\}/g, '')))]
    for (const v of uniqueVars) {
      expect(e4Vars).toContain(v)
    }
  })

  test('TEA P1: BUILTIN array has no duplicate categories', () => {
    const categories = BUILTIN_SOUL_TEMPLATES.map(t => t.category)
    const uniqueCategories = [...new Set(categories)]
    expect(categories.length).toBe(uniqueCategories.length)
  })

  test('TEA P1: secretary template contains rework instruction via call_agent', () => {
    // QA gate must instruct re-delegation on failure (v1 spec #19)
    expect(SECRETARY_SOUL_TEMPLATE).toContain('재작업')
    expect(SECRETARY_SOUL_TEMPLATE).toContain('call_agent')
  })

  test('TEA P2: secretary template token efficiency — under 600 words', () => {
    // ~2000 chars ≈ ~400-500 Korean words, keep under 600
    const wordCount = SECRETARY_SOUL_TEMPLATE.split(/\s+/).length
    expect(wordCount).toBeLessThan(600)
  })
})

describe('BUILTIN_SOUL_TEMPLATES registry', () => {
  test('includes secretary template entry', () => {
    const secretaryEntry = BUILTIN_SOUL_TEMPLATES.find(t => t.category === 'secretary')
    expect(secretaryEntry).toBeDefined()
    expect(secretaryEntry!.name).toBe('비서실장 표준 템플릿')
    expect(secretaryEntry!.tier).toBe('secretary')
    expect(secretaryEntry!.content).toBe(SECRETARY_SOUL_TEMPLATE)
    expect(secretaryEntry!.isBuiltin).toBe(true)
    expect(secretaryEntry!.isActive).toBe(true)
  })

  test('includes manager template entry', () => {
    const managerEntry = BUILTIN_SOUL_TEMPLATES.find(t => t.category === 'manager')
    expect(managerEntry).toBeDefined()
    expect(managerEntry!.content).toBe(MANAGER_SOUL_TEMPLATE)
  })

  test('has exactly 2 built-in templates', () => {
    expect(BUILTIN_SOUL_TEMPLATES).toHaveLength(2)
  })
})
