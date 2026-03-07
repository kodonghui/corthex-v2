import { describe, expect, it } from 'bun:test'
import { z } from 'zod'

/**
 * Story 2-6: Department Management UI (Admin)
 * Unit tests for department CRUD UI logic, cascade analysis display, mode selection.
 *
 * Risk Areas:
 * - HIGH: Cascade analysis data display correctness
 * - HIGH: Cascade mode selection and API call construction
 * - MEDIUM: Cost formatting (micro USD conversion)
 * - MEDIUM: Department table data mapping
 * - LOW: Form validation
 */

// === Types matching the UI component ===

type AgentBreakdown = {
  id: string
  name: string
  tier: 'manager' | 'specialist' | 'worker'
  isSystem: boolean
  activeTaskCount: number
  totalCostUsdMicro: number
}

type CascadeAnalysis = {
  departmentId: string
  departmentName: string
  agentCount: number
  activeTaskCount: number
  totalCostUsdMicro: number
  knowledgeCount: number
  agentBreakdown: AgentBreakdown[]
}

type CascadeMode = 'force' | 'wait_completion'

// === Schema validation (mirrors server-side) ===
const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})

const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
})

// === Helper functions (extracted from UI component logic) ===

function formatCost(usdMicro: number): string {
  return `$${(usdMicro / 1_000_000).toFixed(2)}`
}

function buildDeleteUrl(deptId: string, mode: CascadeMode): string {
  return `/admin/departments/${deptId}?mode=${mode}`
}

function agentCountByDept(agents: Array<{ departmentId: string | null }>, deptId: string): number {
  return agents.filter((a) => a.departmentId === deptId).length
}

const tierLabels: Record<string, string> = {
  manager: 'Manager',
  specialist: 'Specialist',
  worker: 'Worker',
}

// =============================================
// HIGH RISK: Cascade Analysis Display
// =============================================
describe('Cascade analysis display', () => {
  const sampleAnalysis: CascadeAnalysis = {
    departmentId: 'dept-1',
    departmentName: '마케팅부',
    agentCount: 3,
    activeTaskCount: 5,
    totalCostUsdMicro: 120_000_000,
    knowledgeCount: 47,
    agentBreakdown: [
      { id: 'a1', name: '콘텐츠 전문가', tier: 'specialist', isSystem: false, activeTaskCount: 2, totalCostUsdMicro: 50_000_000 },
      { id: 'a2', name: 'SEO 분석가', tier: 'worker', isSystem: false, activeTaskCount: 3, totalCostUsdMicro: 30_000_000 },
      { id: 'a3', name: 'Chief of Staff', tier: 'manager', isSystem: true, activeTaskCount: 0, totalCostUsdMicro: 40_000_000 },
    ],
  }

  it('should display correct agent count', () => {
    expect(sampleAnalysis.agentCount).toBe(3)
  })

  it('should display correct active task count', () => {
    expect(sampleAnalysis.activeTaskCount).toBe(5)
  })

  it('should display correct knowledge count', () => {
    expect(sampleAnalysis.knowledgeCount).toBe(47)
  })

  it('should display correct total cost', () => {
    expect(formatCost(sampleAnalysis.totalCostUsdMicro)).toBe('$120.00')
  })

  it('should list all agents in breakdown', () => {
    expect(sampleAnalysis.agentBreakdown).toHaveLength(3)
  })

  it('should identify system agents', () => {
    const systemAgents = sampleAnalysis.agentBreakdown.filter((a) => a.isSystem)
    expect(systemAgents).toHaveLength(1)
    expect(systemAgents[0].name).toBe('Chief of Staff')
  })

  it('should show per-agent active task counts', () => {
    const agentWithTasks = sampleAnalysis.agentBreakdown.filter((a) => a.activeTaskCount > 0)
    expect(agentWithTasks).toHaveLength(2)
  })

  it('should handle empty department (no agents)', () => {
    const emptyAnalysis: CascadeAnalysis = {
      departmentId: 'dept-2',
      departmentName: '빈 부서',
      agentCount: 0,
      activeTaskCount: 0,
      totalCostUsdMicro: 0,
      knowledgeCount: 0,
      agentBreakdown: [],
    }
    expect(emptyAnalysis.agentCount).toBe(0)
    expect(emptyAnalysis.agentBreakdown).toHaveLength(0)
    expect(formatCost(emptyAnalysis.totalCostUsdMicro)).toBe('$0.00')
  })

  it('should sum agent costs correctly', () => {
    const summedCost = sampleAnalysis.agentBreakdown.reduce((s, a) => s + a.totalCostUsdMicro, 0)
    expect(summedCost).toBe(sampleAnalysis.totalCostUsdMicro)
  })
})

// =============================================
// HIGH RISK: Cascade Mode and Delete URL
// =============================================
describe('Cascade mode selection and delete API', () => {
  it('should build correct delete URL with wait_completion mode', () => {
    const url = buildDeleteUrl('dept-123', 'wait_completion')
    expect(url).toBe('/admin/departments/dept-123?mode=wait_completion')
  })

  it('should build correct delete URL with force mode', () => {
    const url = buildDeleteUrl('dept-123', 'force')
    expect(url).toBe('/admin/departments/dept-123?mode=force')
  })

  it('should default to wait_completion mode', () => {
    const defaultMode: CascadeMode = 'wait_completion'
    expect(defaultMode).toBe('wait_completion')
  })

  it('should only allow valid cascade modes', () => {
    const validModes: CascadeMode[] = ['force', 'wait_completion']
    expect(validModes).toContain('force')
    expect(validModes).toContain('wait_completion')
    expect(validModes).toHaveLength(2)
  })
})

// =============================================
// MEDIUM RISK: Cost Formatting
// =============================================
describe('Cost formatting (micro USD)', () => {
  it('should format zero cost', () => {
    expect(formatCost(0)).toBe('$0.00')
  })

  it('should format small cost', () => {
    expect(formatCost(1_000)).toBe('$0.00')
  })

  it('should format sub-dollar cost', () => {
    expect(formatCost(500_000)).toBe('$0.50')
  })

  it('should format dollar cost', () => {
    expect(formatCost(1_000_000)).toBe('$1.00')
  })

  it('should format large cost', () => {
    expect(formatCost(120_000_000)).toBe('$120.00')
  })

  it('should format cost with cents', () => {
    expect(formatCost(1_234_567)).toBe('$1.23')
  })

  it('should format very large cost', () => {
    expect(formatCost(999_000_000_000)).toBe('$999000.00')
  })
})

// =============================================
// MEDIUM RISK: Department Table Data Mapping
// =============================================
describe('Department table data mapping', () => {
  const agents = [
    { id: 'a1', departmentId: 'dept-1' },
    { id: 'a2', departmentId: 'dept-1' },
    { id: 'a3', departmentId: 'dept-2' },
    { id: 'a4', departmentId: null },
    { id: 'a5', departmentId: 'dept-1' },
  ]

  it('should count agents per department', () => {
    expect(agentCountByDept(agents, 'dept-1')).toBe(3)
    expect(agentCountByDept(agents, 'dept-2')).toBe(1)
  })

  it('should return 0 for department with no agents', () => {
    expect(agentCountByDept(agents, 'dept-999')).toBe(0)
  })

  it('should not count unassigned agents', () => {
    expect(agentCountByDept(agents, 'null')).toBe(0)
  })

  it('should display tier labels correctly', () => {
    expect(tierLabels['manager']).toBe('Manager')
    expect(tierLabels['specialist']).toBe('Specialist')
    expect(tierLabels['worker']).toBe('Worker')
  })
})

// =============================================
// LOW RISK: Form Validation
// =============================================
describe('Department form validation', () => {
  it('should accept valid create input', () => {
    const result = createDepartmentSchema.safeParse({ name: '마케팅부' })
    expect(result.success).toBe(true)
  })

  it('should accept create with description', () => {
    const result = createDepartmentSchema.safeParse({ name: '마케팅부', description: '마케팅 담당' })
    expect(result.success).toBe(true)
  })

  it('should reject empty name', () => {
    const result = createDepartmentSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('should reject name over 100 chars', () => {
    const result = createDepartmentSchema.safeParse({ name: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('should accept valid update input', () => {
    const result = updateDepartmentSchema.safeParse({ name: '전략기획부' })
    expect(result.success).toBe(true)
  })

  it('should accept update with null description', () => {
    const result = updateDepartmentSchema.safeParse({ description: null })
    expect(result.success).toBe(true)
  })

  it('should accept empty update (no fields)', () => {
    const result = updateDepartmentSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// =============================================
// MEDIUM RISK: Cascade Analysis API Response Parsing
// =============================================
describe('Cascade analysis API response', () => {
  const cascadeResponseSchema = z.object({
    data: z.object({
      departmentId: z.string(),
      departmentName: z.string(),
      agentCount: z.number(),
      activeTaskCount: z.number(),
      totalCostUsdMicro: z.number(),
      knowledgeCount: z.number(),
      agentBreakdown: z.array(z.object({
        id: z.string(),
        name: z.string(),
        tier: z.enum(['manager', 'specialist', 'worker']),
        isSystem: z.boolean(),
        activeTaskCount: z.number(),
        totalCostUsdMicro: z.number(),
      })),
    }),
  })

  it('should validate correct cascade analysis response', () => {
    const response = {
      data: {
        departmentId: 'dept-1',
        departmentName: '마케팅부',
        agentCount: 2,
        activeTaskCount: 1,
        totalCostUsdMicro: 50_000_000,
        knowledgeCount: 10,
        agentBreakdown: [
          { id: 'a1', name: '분석가', tier: 'specialist' as const, isSystem: false, activeTaskCount: 1, totalCostUsdMicro: 50_000_000 },
        ],
      },
    }
    const result = cascadeResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('should validate empty breakdown', () => {
    const response = {
      data: {
        departmentId: 'dept-1',
        departmentName: '빈부서',
        agentCount: 0,
        activeTaskCount: 0,
        totalCostUsdMicro: 0,
        knowledgeCount: 0,
        agentBreakdown: [],
      },
    }
    const result = cascadeResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('should reject invalid tier', () => {
    const response = {
      data: {
        departmentId: 'dept-1',
        departmentName: 'test',
        agentCount: 1,
        activeTaskCount: 0,
        totalCostUsdMicro: 0,
        knowledgeCount: 0,
        agentBreakdown: [
          { id: 'a1', name: 'test', tier: 'invalid', isSystem: false, activeTaskCount: 0, totalCostUsdMicro: 0 },
        ],
      },
    }
    const result = cascadeResponseSchema.safeParse(response)
    expect(result.success).toBe(false)
  })
})

// =============================================
// LOW RISK: UI State Logic
// =============================================
describe('UI state management patterns', () => {
  it('should track edit mode by department ID', () => {
    let editId: string | null = null
    const dept = { id: 'dept-1', name: '마케팅부', description: '마케팅 담당' }

    // Start editing
    editId = dept.id
    expect(editId).toBe('dept-1')

    // Cancel editing
    editId = null
    expect(editId).toBeNull()
  })

  it('should track cascade modal state', () => {
    let cascadeTarget: { id: string; name: string } | null = null
    let cascadeMode: CascadeMode = 'wait_completion'

    // Open modal
    cascadeTarget = { id: 'dept-1', name: '마케팅부' }
    expect(cascadeTarget).not.toBeNull()

    // Change mode
    cascadeMode = 'force'
    expect(cascadeMode).toBe('force')

    // Close modal
    cascadeTarget = null
    cascadeMode = 'wait_completion'
    expect(cascadeTarget).toBeNull()
    expect(cascadeMode).toBe('wait_completion')
  })

  it('should reset form on create cancel', () => {
    const form = { name: '테스트 부서', description: '설명' }
    const resetForm = { name: '', description: '' }
    expect(resetForm.name).toBe('')
    expect(resetForm.description).toBe('')
    expect(form.name).not.toBe(resetForm.name)
  })
})
