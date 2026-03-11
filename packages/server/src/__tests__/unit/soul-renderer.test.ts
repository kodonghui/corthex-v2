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
