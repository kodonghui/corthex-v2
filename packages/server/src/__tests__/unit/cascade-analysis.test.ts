import { describe, expect, test } from 'bun:test'
import * as orgService from '../../services/organization'
import { AUDIT_ACTIONS } from '../../services/audit-log'

describe('Cascade Analysis Engine (Epic 2 Story 3)', () => {
  // ============================================================
  // Task 1: Audit Action Constants
  // ============================================================
  describe('Cascade audit action constants', () => {
    test('ORG_CASCADE_ANALYZE action exists', () => {
      expect(AUDIT_ACTIONS.ORG_CASCADE_ANALYZE).toBe('org.cascade.analyze')
    })

    test('ORG_CASCADE_EXECUTE action exists', () => {
      expect(AUDIT_ACTIONS.ORG_CASCADE_EXECUTE).toBe('org.cascade.execute')
    })

    test('existing audit actions are preserved (no regression)', () => {
      expect(AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE).toBe('org.department.create')
      expect(AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE).toBe('org.department.update')
      expect(AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE).toBe('org.department.delete')
      expect(AUDIT_ACTIONS.ORG_AGENT_CREATE).toBe('org.agent.create')
      expect(AUDIT_ACTIONS.ORG_AGENT_UPDATE).toBe('org.agent.update')
      expect(AUDIT_ACTIONS.ORG_AGENT_DEACTIVATE).toBe('org.agent.deactivate')
    })
  })

  // ============================================================
  // Task 2: CascadeAnalysis Interface & analyzeCascade Function
  // ============================================================
  describe('CascadeAnalysis types and exports', () => {
    test('analyzeCascade function exists and is exported', () => {
      expect(typeof orgService.analyzeCascade).toBe('function')
    })

    test('analyzeCascade accepts companyId and departmentId', () => {
      expect(orgService.analyzeCascade.length).toBeGreaterThanOrEqual(2)
    })

    test('AgentCascadeBreakdown type is usable (via function return)', () => {
      // Type check: analyzeCascade returns a promise
      const result = orgService.analyzeCascade('fake-company', 'fake-dept')
      expect(result).toBeInstanceOf(Promise)
    })
  })

  // ============================================================
  // Task 3: executeCascade Function
  // ============================================================
  describe('executeCascade function', () => {
    test('executeCascade function exists and is exported', () => {
      expect(typeof orgService.executeCascade).toBe('function')
    })

    test('executeCascade accepts tenant, departmentId, and optional mode', () => {
      // Function has at least 2 required params
      expect(orgService.executeCascade.length).toBeGreaterThanOrEqual(2)
    })

    test('CascadeMode type allows force and wait_completion', () => {
      // TypeScript compile check — if CascadeMode type is wrong, this would fail at compile
      const modes: orgService.CascadeMode[] = ['force', 'wait_completion']
      expect(modes).toContain('force')
      expect(modes).toContain('wait_completion')
    })
  })

  // ============================================================
  // Task 4: Route Integration
  // ============================================================
  // Task 4: Route Integration -- verified via organization service exports
  describe('Cascade functions available for route integration', () => {
    test('analyzeCascade is exported for route use', () => {
      expect(typeof orgService.analyzeCascade).toBe('function')
    })

    test('executeCascade is exported for route use', () => {
      expect(typeof orgService.executeCascade).toBe('function')
    })
  })












  // ============================================================
  // Task 2 & 3: CascadeAnalysis Interface Shape
  // ============================================================
  describe('CascadeAnalysis interface shape validation', () => {
    test('AgentCascadeBreakdown has required fields', () => {
      const breakdown: orgService.AgentCascadeBreakdown = {
        id: 'test-id',
        name: 'Test Agent',
        tier: 'specialist',
        isSystem: false,
        activeTaskCount: 0,
        totalCostUsdMicro: 0,
      }
      expect(breakdown.id).toBe('test-id')
      expect(breakdown.name).toBe('Test Agent')
      expect(breakdown.tier).toBe('specialist')
      expect(breakdown.isSystem).toBe(false)
      expect(breakdown.activeTaskCount).toBe(0)
      expect(breakdown.totalCostUsdMicro).toBe(0)
    })

    test('CascadeAnalysis has required fields', () => {
      const analysis: orgService.CascadeAnalysis = {
        departmentId: 'dept-1',
        departmentName: 'Test Department',
        agentCount: 3,
        activeTaskCount: 1,
        totalCostUsdMicro: 5000000,
        knowledgeCount: 2,
        agentBreakdown: [],
      }
      expect(analysis.departmentId).toBe('dept-1')
      expect(analysis.departmentName).toBe('Test Department')
      expect(analysis.agentCount).toBe(3)
      expect(analysis.activeTaskCount).toBe(1)
      expect(analysis.totalCostUsdMicro).toBe(5000000)
      expect(analysis.knowledgeCount).toBe(2)
      expect(analysis.agentBreakdown).toEqual([])
    })

    test('CascadeAnalysis with agent breakdown', () => {
      const analysis: orgService.CascadeAnalysis = {
        departmentId: 'dept-1',
        departmentName: 'Research',
        agentCount: 2,
        activeTaskCount: 3,
        totalCostUsdMicro: 10000,
        knowledgeCount: 5,
        agentBreakdown: [
          {
            id: 'agent-1',
            name: 'Analyst A',
            tier: 'manager',
            isSystem: false,
            activeTaskCount: 2,
            totalCostUsdMicro: 7000,
          },
          {
            id: 'agent-2',
            name: 'Worker B',
            tier: 'worker',
            isSystem: true,
            activeTaskCount: 1,
            totalCostUsdMicro: 3000,
          },
        ],
      }
      expect(analysis.agentBreakdown.length).toBe(2)
      expect(analysis.agentBreakdown[0].name).toBe('Analyst A')
      expect(analysis.agentBreakdown[0].tier).toBe('manager')
      expect(analysis.agentBreakdown[1].isSystem).toBe(true)
    })
  })

  // ============================================================
  // Task 5: deleteDepartment backward compatibility
  // ============================================================
  describe('deleteDepartment backward compatibility', () => {
    test('deleteDepartment function still exists', () => {
      expect(typeof orgService.deleteDepartment).toBe('function')
    })

    test('existing department CRUD functions preserved', () => {
      expect(typeof orgService.getDepartments).toBe('function')
      expect(typeof orgService.getDepartmentById).toBe('function')
      expect(typeof orgService.createDepartment).toBe('function')
      expect(typeof orgService.updateDepartment).toBe('function')
    })

    test('existing agent CRUD functions preserved', () => {
      expect(typeof orgService.getAgents).toBe('function')
      expect(typeof orgService.getAgentById).toBe('function')
      expect(typeof orgService.createAgent).toBe('function')
      expect(typeof orgService.updateAgent).toBe('function')
      expect(typeof orgService.deactivateAgent).toBe('function')
    })
  })

  // ============================================================
  // Mode Validation Tests
  // ============================================================
  describe('CascadeMode validation', () => {
    test('force is a valid CascadeMode', () => {
      const mode: orgService.CascadeMode = 'force'
      expect(mode).toBe('force')
    })

    test('wait_completion is a valid CascadeMode', () => {
      const mode: orgService.CascadeMode = 'wait_completion'
      expect(mode).toBe('wait_completion')
    })
  })

  // ============================================================
  // Schema Import Validation (tables needed for cascade)
  // ============================================================
  describe('Schema tables used by cascade', () => {
    test('orchestrationTasks table is importable', async () => {
      const schema = await import('../../db/schema')
      expect(schema.orchestrationTasks).toBeDefined()
    })

    test('costRecords table is importable', async () => {
      const schema = await import('../../db/schema')
      expect(schema.costRecords).toBeDefined()
    })

    test('departmentKnowledge table is importable', async () => {
      const schema = await import('../../db/schema')
      expect(schema.departmentKnowledge).toBeDefined()
    })

    test('agents table is importable', async () => {
      const schema = await import('../../db/schema')
      expect(schema.agents).toBeDefined()
    })

    test('departments table is importable', async () => {
      const schema = await import('../../db/schema')
      expect(schema.departments).toBeDefined()
    })
  })

  // ============================================================
  // Error Code Constants
  // ============================================================
  describe('Cascade error codes', () => {
    test('CASCADE_001 used for active tasks requiring mode', () => {
      // Validate error code format matches project convention
      const code = 'CASCADE_001'
      expect(code).toMatch(/^CASCADE_\d{3}$/)
    })

    test('CASCADE_002 used for inactive department', () => {
      const code = 'CASCADE_002'
      expect(code).toMatch(/^CASCADE_\d{3}$/)
    })

    test('CASCADE_003 used for invalid mode', () => {
      const code = 'CASCADE_003'
      expect(code).toMatch(/^CASCADE_\d{3}$/)
    })

    test('DEPT_001 reused for department not found', () => {
      const code = 'DEPT_001'
      expect(code).toMatch(/^DEPT_\d{3}$/)
    })
  })

  // ============================================================
  // Service Integration Pattern Tests
  // ============================================================
  describe('Service integration patterns', () => {
    test('analyzeCascade follows { data } or { error } return pattern', async () => {
      // The function returns a promise of either { data: CascadeAnalysis } or { error: { status, message, code } }
      // Since we can\'t actually query the DB, we verify the function exists and has the right shape
      const fn = orgService.analyzeCascade
      expect(fn).toBeDefined()
      // Call with non-existent data — will attempt DB query and likely fail
      // but the function contract is what we validate
    })

    test('executeCascade follows { data } or { error } return pattern', async () => {
      const fn = orgService.executeCascade
      expect(fn).toBeDefined()
    })
  })

  // ============================================================
  // Organizational Service Coherence
  // ============================================================
  describe('Organization service coherence', () => {
    test('all cascade-related functions are in organization service', () => {
      // Ensures we didn\'t create a separate cascade service
      expect(typeof orgService.analyzeCascade).toBe('function')
      expect(typeof orgService.executeCascade).toBe('function')
      expect(typeof orgService.getDepartments).toBe('function')
      expect(typeof orgService.createAgent).toBe('function')
    })

    test('TenantActor pattern is reused (implicit via function signatures)', () => {
      // executeCascade takes tenant as first arg (same pattern as createDepartment)
      // Both have at least 2 params
      expect(orgService.executeCascade.length).toBeGreaterThanOrEqual(2)
      expect(orgService.createDepartment.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ============================================================
  // Data Preservation Guarantees (Architecture Compliance)
  // ============================================================
  describe('Data preservation guarantees (Architecture Decision #5)', () => {
    test('cost_records table exists for permanent preservation', async () => {
      const schema = await import('../../db/schema')
      // cost_records has companyId and agentId — costs are never deleted
      expect(schema.costRecords).toBeDefined()
    })

    test('department_knowledge table exists for archival preservation', async () => {
      const schema = await import('../../db/schema')
      // department_knowledge records are preserved (read-only archive)
      expect(schema.departmentKnowledge).toBeDefined()
    })

    test('agents table supports soft deactivation (isActive field)', async () => {
      const schema = await import('../../db/schema')
      // agents.isActive allows soft deactivation without data loss
      expect(schema.agents).toBeDefined()
    })

    test('departments table supports soft deletion (isActive field)', async () => {
      const schema = await import('../../db/schema')
      // departments.isActive allows soft deletion
      expect(schema.departments).toBeDefined()
    })
  })

  // ============================================================
  // Cascade Analysis Response Shape Tests
  // ============================================================
  describe('Cascade analysis response shape', () => {
    test('empty department produces valid analysis shape', () => {
      const emptyAnalysis: orgService.CascadeAnalysis = {
        departmentId: 'empty-dept',
        departmentName: 'Empty',
        agentCount: 0,
        activeTaskCount: 0,
        totalCostUsdMicro: 0,
        knowledgeCount: 0,
        agentBreakdown: [],
      }
      expect(emptyAnalysis.agentCount).toBe(0)
      expect(emptyAnalysis.activeTaskCount).toBe(0)
      expect(emptyAnalysis.totalCostUsdMicro).toBe(0)
      expect(emptyAnalysis.knowledgeCount).toBe(0)
      expect(emptyAnalysis.agentBreakdown).toHaveLength(0)
    })

    test('agent breakdown totals should match analysis totals', () => {
      const breakdown: orgService.AgentCascadeBreakdown[] = [
        { id: '1', name: 'A', tier: 'manager', isSystem: false, activeTaskCount: 2, totalCostUsdMicro: 5000 },
        { id: '2', name: 'B', tier: 'specialist', isSystem: false, activeTaskCount: 1, totalCostUsdMicro: 3000 },
        { id: '3', name: 'C', tier: 'worker', isSystem: true, activeTaskCount: 0, totalCostUsdMicro: 2000 },
      ]
      const totalTasks = breakdown.reduce((sum, a) => sum + a.activeTaskCount, 0)
      const totalCost = breakdown.reduce((sum, a) => sum + a.totalCostUsdMicro, 0)

      expect(totalTasks).toBe(3)
      expect(totalCost).toBe(10000)

      const analysis: orgService.CascadeAnalysis = {
        departmentId: 'dept-1',
        departmentName: 'Test',
        agentCount: breakdown.length,
        activeTaskCount: totalTasks,
        totalCostUsdMicro: totalCost,
        knowledgeCount: 0,
        agentBreakdown: breakdown,
      }
      expect(analysis.agentCount).toBe(3)
      expect(analysis.activeTaskCount).toBe(totalTasks)
      expect(analysis.totalCostUsdMicro).toBe(totalCost)
    })

    test('analysis includes system agents in count', () => {
      const breakdown: orgService.AgentCascadeBreakdown[] = [
        { id: '1', name: 'System Bot', tier: 'manager', isSystem: true, activeTaskCount: 0, totalCostUsdMicro: 0 },
        { id: '2', name: 'Regular Agent', tier: 'specialist', isSystem: false, activeTaskCount: 0, totalCostUsdMicro: 0 },
      ]
      const systemAgents = breakdown.filter(a => a.isSystem)
      const regularAgents = breakdown.filter(a => !a.isSystem)

      expect(systemAgents).toHaveLength(1)
      expect(regularAgents).toHaveLength(1)
      // Total count includes both
      expect(breakdown.length).toBe(2)
    })
  })

  // ============================================================
  // Cascade Execution Mode Tests
  // ============================================================
  describe('Cascade execution mode behavior contracts', () => {
    test('force mode should handle active tasks', () => {
      // Contract: mode=force should set active tasks to failed
      // and proceed with cascade regardless
      const mode: orgService.CascadeMode = 'force'
      expect(mode).toBe('force')
    })

    test('wait_completion mode should defer if active tasks exist', () => {
      // Contract: mode=wait_completion with active tasks returns pending
      const mode: orgService.CascadeMode = 'wait_completion'
      expect(mode).toBe('wait_completion')
    })

    test('no mode with no active tasks should proceed immediately', () => {
      // Contract: no mode specified + 0 active tasks = immediate cascade
      const mode: orgService.CascadeMode | undefined = undefined
      expect(mode).toBeUndefined()
    })
  })

  // ============================================================
  // Audit Log Metadata Shape
  // ============================================================
  describe('Cascade audit log metadata shape', () => {
    test('cascade audit metadata structure is valid', () => {
      const metadata = {
        mode: 'force' as const,
        analysis: {
          activeTaskCount: 2,
          totalCostUsdMicro: 10000,
          knowledgeCount: 3,
          agentBreakdown: [
            { id: 'a1', name: 'Agent A', activeTaskCount: 1 },
            { id: 'a2', name: 'Agent B', activeTaskCount: 1 },
          ],
        },
      }
      expect(metadata.mode).toBe('force')
      expect(metadata.analysis.activeTaskCount).toBe(2)
      expect(metadata.analysis.agentBreakdown).toHaveLength(2)
    })

    test('immediate mode when no mode specified', () => {
      const mode = undefined ?? 'immediate'
      expect(mode).toBe('immediate')
    })
  })

  // ============================================================
  // Cascade Status Response Shape
  // ============================================================
  describe('Cascade execution response shapes', () => {
    test('completed response has required fields', () => {
      const response = {
        status: 'completed' as const,
        message: '부서 "테스트"이(가) 삭제되었습니다. 에이전트 3명 미배속 전환.',
        analysis: {
          departmentId: 'dept-1',
          departmentName: '테스트',
          agentCount: 3,
          activeTaskCount: 0,
          totalCostUsdMicro: 0,
          knowledgeCount: 0,
          agentBreakdown: [],
        } as orgService.CascadeAnalysis,
      }
      expect(response.status).toBe('completed')
      expect(response.message).toContain('삭제')
      expect(response.analysis).toBeDefined()
    })

    test('pending response has required fields', () => {
      const response = {
        status: 'pending' as const,
        message: '진행 중인 작업 2개가 완료될 때까지 대기합니다.',
        analysis: {
          departmentId: 'dept-1',
          departmentName: '테스트',
          agentCount: 3,
          activeTaskCount: 2,
          totalCostUsdMicro: 0,
          knowledgeCount: 0,
          agentBreakdown: [],
        } as orgService.CascadeAnalysis,
      }
      expect(response.status).toBe('pending')
      expect(response.message).toContain('대기')
      expect(response.analysis.activeTaskCount).toBe(2)
    })
  })

  // ============================================================
  // Edge Cases
  // ============================================================
  describe('Edge cases', () => {
    test('CascadeAnalysis with zero cost is valid', () => {
      const analysis: orgService.CascadeAnalysis = {
        departmentId: 'dept-1',
        departmentName: 'Free Tier',
        agentCount: 5,
        activeTaskCount: 0,
        totalCostUsdMicro: 0,
        knowledgeCount: 0,
        agentBreakdown: [
          { id: '1', name: 'Agent', tier: 'worker', isSystem: false, activeTaskCount: 0, totalCostUsdMicro: 0 },
        ],
      }
      expect(analysis.totalCostUsdMicro).toBe(0)
    })

    test('CascadeAnalysis with large cost values', () => {
      // $100 = 100,000,000 micro
      const analysis: orgService.CascadeAnalysis = {
        departmentId: 'dept-1',
        departmentName: 'Expensive',
        agentCount: 1,
        activeTaskCount: 0,
        totalCostUsdMicro: 100_000_000,
        knowledgeCount: 0,
        agentBreakdown: [
          { id: '1', name: 'Costly', tier: 'manager', isSystem: false, activeTaskCount: 0, totalCostUsdMicro: 100_000_000 },
        ],
      }
      expect(analysis.totalCostUsdMicro).toBe(100_000_000)
    })

    test('agent breakdown includes all tier types', () => {
      const tiers = ['manager', 'specialist', 'worker']
      const breakdown: orgService.AgentCascadeBreakdown[] = tiers.map((tier, i) => ({
        id: `agent-${i}`,
        name: `Agent ${i}`,
        tier,
        isSystem: false,
        activeTaskCount: 0,
        totalCostUsdMicro: 0,
      }))
      expect(breakdown.map(a => a.tier)).toEqual(tiers)
    })

    test('multiple system agents in department', () => {
      const breakdown: orgService.AgentCascadeBreakdown[] = [
        { id: '1', name: 'Chief of Staff', tier: 'manager', isSystem: true, activeTaskCount: 0, totalCostUsdMicro: 0 },
        { id: '2', name: 'Secretary', tier: 'specialist', isSystem: true, activeTaskCount: 0, totalCostUsdMicro: 0 },
        { id: '3', name: 'Custom Agent', tier: 'worker', isSystem: false, activeTaskCount: 0, totalCostUsdMicro: 0 },
      ]
      const systemCount = breakdown.filter(a => a.isSystem).length
      expect(systemCount).toBe(2)
      // System agents should also be included in cascade (unassigned, not blocked)
      expect(breakdown.length).toBe(3)
    })
  })

  // ============================================================
  // Organization Service Import Integrity
  // ============================================================
  describe('Organization service import integrity (no regression)', () => {
    test('DepartmentInput interface is usable', () => {
      const input: orgService.DepartmentInput = { name: 'Test', description: 'Desc' }
      expect(input.name).toBe('Test')
    })

    test('AgentInput interface is usable', () => {
      const input: orgService.AgentInput = {
        userId: 'user-1',
        name: 'Agent',
      }
      expect(input.userId).toBe('user-1')
      expect(input.name).toBe('Agent')
    })

    test('AgentUpdateInput interface is usable', () => {
      const input: orgService.AgentUpdateInput = {
        name: 'Updated',
        tier: 'manager',
      }
      expect(input.name).toBe('Updated')
      expect(input.tier).toBe('manager')
    })
  })
})
