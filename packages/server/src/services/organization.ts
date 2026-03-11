import { db } from '../db'
import { departments, agents, orchestrationTasks, costRecords, departmentKnowledge, orgTemplates } from '../db/schema'
import { eq, and, count, ne, isNull, inArray, sum, or } from 'drizzle-orm'
import { withTenant, scopedWhere, scopedInsert } from '../db/tenant-helpers'
import { createAuditLog, AUDIT_ACTIONS } from './audit-log'
import type { ActorType } from './audit-log'
import type { TemplateData } from './seed.service'

export interface DepartmentInput {
  name: string
  description?: string | null
}

export interface DepartmentUpdateInput {
  name?: string
  description?: string | null
}

export interface AgentInput {
  userId: string
  departmentId?: string | null
  name: string
  nameEn?: string | null
  role?: string | null
  tier?: 'manager' | 'specialist' | 'worker'
  modelName?: string
  allowedTools?: string[]
  soul?: string | null
}

export interface AgentUpdateInput {
  name?: string
  nameEn?: string | null
  role?: string | null
  tier?: 'manager' | 'specialist' | 'worker'
  modelName?: string
  departmentId?: string | null
  allowedTools?: string[]
  soul?: string | null
  status?: 'online' | 'working' | 'error' | 'offline'
  isActive?: boolean
}

interface TenantActor {
  companyId: string
  userId: string
  isAdminUser?: boolean
}

function actorType(tenant: TenantActor): ActorType {
  return tenant.isAdminUser ? 'admin_user' : 'user'
}

/**
 * Get all departments for a company (tenant-scoped).
 * Returns both active and inactive departments for admin management.
 */
export async function getDepartments(companyId: string) {
  return db
    .select()
    .from(departments)
    .where(withTenant(departments.companyId, companyId))
}

/**
 * Get a single department by ID (tenant-scoped).
 */
export async function getDepartmentById(companyId: string, departmentId: string) {
  const [dept] = await db
    .select()
    .from(departments)
    .where(scopedWhere(departments.companyId, companyId, eq(departments.id, departmentId)))
    .limit(1)
  return dept ?? null
}

/**
 * Create a new department with name uniqueness validation and audit logging.
 */
export async function createDepartment(tenant: TenantActor, input: DepartmentInput) {
  // Name uniqueness check within company
  const [existing] = await db
    .select({ id: departments.id })
    .from(departments)
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.name, input.name)))
    .limit(1)

  if (existing) {
    return { error: { status: 409, message: '같은 이름의 부서가 이미 있습니다', code: 'DEPT_002' } }
  }

  const [dept] = await db
    .insert(departments)
    .values(scopedInsert(tenant.companyId, {
      name: input.name,
      description: input.description ?? null,
    }))
    .returning()

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE,
    targetType: 'department',
    targetId: dept.id,
    after: { name: dept.name, description: dept.description },
  })

  return { data: dept }
}

/**
 * Update a department with name uniqueness validation (excluding self) and audit logging.
 */
export async function updateDepartment(
  tenant: TenantActor,
  departmentId: string,
  input: DepartmentUpdateInput,
) {
  // Get current state for before snapshot
  const [current] = await db
    .select()
    .from(departments)
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.id, departmentId)))
    .limit(1)

  if (!current) {
    return { error: { status: 404, message: '부서를 찾을 수 없습니다', code: 'DEPT_001' } }
  }

  // Name uniqueness check (exclude self)
  if (input.name) {
    const [duplicate] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(
        and(
          withTenant(departments.companyId, tenant.companyId),
          eq(departments.name, input.name),
          ne(departments.id, departmentId),
        ),
      )
      .limit(1)

    if (duplicate) {
      return { error: { status: 409, message: '같은 이름의 부서가 이미 있습니다', code: 'DEPT_002' } }
    }
  }

  const [dept] = await db
    .update(departments)
    .set({ ...input, updatedAt: new Date() })
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.id, departmentId)))
    .returning()

  // Audit log with before/after
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE,
    targetType: 'department',
    targetId: departmentId,
    before: { name: current.name, description: current.description },
    after: { name: dept.name, description: dept.description },
  })

  return { data: dept }
}

/**
 * Soft-delete a department (isActive=false).
 * Blocked if department has active agents.
 */
export async function deleteDepartment(tenant: TenantActor, departmentId: string) {
  // Get current state for audit log
  const [current] = await db
    .select()
    .from(departments)
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.id, departmentId)))
    .limit(1)

  if (!current) {
    return { error: { status: 404, message: '부서를 찾을 수 없습니다', code: 'DEPT_001' } }
  }

  // Check for active agents in this department
  const [{ agentCount }] = await db
    .select({ agentCount: count() })
    .from(agents)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.departmentId, departmentId)))

  if (Number(agentCount) > 0) {
    return {
      error: {
        status: 409,
        message: `소속 에이전트가 ${agentCount}명 있어 삭제할 수 없습니다`,
        code: 'DEPT_003',
      },
    }
  }

  await db
    .update(departments)
    .set({ isActive: false, updatedAt: new Date() })
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.id, departmentId)))

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE,
    targetType: 'department',
    targetId: departmentId,
    before: { name: current.name, description: current.description, isActive: current.isActive },
  })

  return { data: { message: '비활성화되었습니다' } }
}

// ============================================================
// Agent Service Functions
// ============================================================

/**
 * Get all agents for a company (tenant-scoped).
 * Optional filters: departmentId, isActive
 */
export async function getAgents(
  companyId: string,
  filters?: { departmentId?: string; isActive?: boolean },
) {
  const conditions = [withTenant(agents.companyId, companyId)]

  if (filters?.departmentId !== undefined) {
    if (filters.departmentId === 'unassigned') {
      conditions.push(isNull(agents.departmentId))
    } else {
      conditions.push(eq(agents.departmentId, filters.departmentId))
    }
  }

  if (filters?.isActive !== undefined) {
    conditions.push(eq(agents.isActive, filters.isActive))
  }

  return db
    .select()
    .from(agents)
    .where(and(...conditions))
}

/**
 * Get a single agent by ID (tenant-scoped).
 */
export async function getAgentById(companyId: string, agentId: string) {
  const [agent] = await db
    .select()
    .from(agents)
    .where(scopedWhere(agents.companyId, companyId, eq(agents.id, agentId)))
    .limit(1)
  return agent ?? null
}

/**
 * Create a new agent with name uniqueness validation and audit logging.
 */
export async function createAgent(tenant: TenantActor, input: AgentInput) {
  // Name uniqueness check within company
  const [existing] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.name, input.name)))
    .limit(1)

  if (existing) {
    return { error: { status: 409, message: '같은 이름의 에이전트가 이미 있습니다', code: 'AGENT_002' } }
  }

  const [agent] = await db
    .insert(agents)
    .values(scopedInsert(tenant.companyId, {
      userId: input.userId,
      departmentId: input.departmentId ?? null,
      name: input.name,
      nameEn: input.nameEn ?? null,
      role: input.role ?? null,
      tier: input.tier ?? 'specialist',
      modelName: input.modelName ?? 'claude-haiku-4-5',
      allowedTools: input.allowedTools ?? [],
      soul: input.soul ?? null,
      adminSoul: input.soul ?? null,
      status: 'offline',
    }))
    .returning()

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_AGENT_CREATE,
    targetType: 'agent',
    targetId: agent.id,
    after: { name: agent.name, tier: agent.tier, modelName: agent.modelName, departmentId: agent.departmentId },
  })

  return { data: agent }
}

/**
 * Update an agent with name uniqueness validation (excluding self) and audit logging.
 * When soul is updated, adminSoul is also synced.
 */
export async function updateAgent(
  tenant: TenantActor,
  agentId: string,
  input: AgentUpdateInput,
) {
  // Get current state for before snapshot
  const [current] = await db
    .select()
    .from(agents)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.id, agentId)))
    .limit(1)

  if (!current) {
    return { error: { status: 404, message: '에이전트를 찾을 수 없습니다', code: 'AGENT_001' } }
  }

  // Name uniqueness check (exclude self)
  if (input.name) {
    const [duplicate] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(
        and(
          withTenant(agents.companyId, tenant.companyId),
          eq(agents.name, input.name),
          ne(agents.id, agentId),
        ),
      )
      .limit(1)

    if (duplicate) {
      return { error: { status: 409, message: '같은 이름의 에이전트가 이미 있습니다', code: 'AGENT_002' } }
    }
  }

  // Build update set -- sync adminSoul when soul is updated
  const updateData: Record<string, unknown> = { ...input, updatedAt: new Date() }
  if (input.soul !== undefined) {
    updateData.adminSoul = input.soul
  }

  const [agent] = await db
    .update(agents)
    .set(updateData)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.id, agentId)))
    .returning()

  // Audit log with before/after
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_AGENT_UPDATE,
    targetType: 'agent',
    targetId: agentId,
    before: { name: current.name, tier: current.tier, modelName: current.modelName, departmentId: current.departmentId, soul: current.soul },
    after: { name: agent.name, tier: agent.tier, modelName: agent.modelName, departmentId: agent.departmentId, soul: agent.soul },
  })

  return { data: agent }
}

/**
 * Deactivate an agent (soft delete).
 * System agents (isSystem=true) cannot be deactivated (403).
 * Sets departmentId=null, isActive=false, status='offline'.
 */
export async function deactivateAgent(tenant: TenantActor, agentId: string) {
  // Get current state
  const [current] = await db
    .select()
    .from(agents)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.id, agentId)))
    .limit(1)

  if (!current) {
    return { error: { status: 404, message: '에이전트를 찾을 수 없습니다', code: 'AGENT_001' } }
  }

  // System agent protection (FR5)
  if (current.isSystem) {
    return { error: { status: 403, message: '시스템 에이전트는 삭제할 수 없습니다', code: 'AGENT_003' } }
  }

  // Secretary agent protection (Story 5.1)
  if (current.isSecretary) {
    return { error: { status: 403, message: '비서 에이전트는 삭제할 수 없습니다', code: 'ORG_SECRETARY_DELETE_DENIED' } }
  }

  // Soft deactivation: unassign from department + deactivate
  await db
    .update(agents)
    .set({
      departmentId: null,
      isActive: false,
      status: 'offline',
      updatedAt: new Date(),
    })
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.id, agentId)))

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_AGENT_DEACTIVATE,
    targetType: 'agent',
    targetId: agentId,
    before: { name: current.name, departmentId: current.departmentId, isActive: current.isActive, status: current.status },
    after: { departmentId: null, isActive: false, status: 'offline' },
  })

  return { data: { message: '에이전트가 비활성화되었습니다' } }
}

// ============================================================
// Cascade Analysis & Execution
// ============================================================

export interface AgentCascadeBreakdown {
  id: string
  name: string
  tier: string
  isSystem: boolean
  activeTaskCount: number
  totalCostUsdMicro: number
}

export interface CascadeAnalysis {
  departmentId: string
  departmentName: string
  agentCount: number
  activeTaskCount: number
  totalCostUsdMicro: number
  knowledgeCount: number
  agentBreakdown: AgentCascadeBreakdown[]
}

/**
 * Analyze cascade impact of deleting a department.
 * Returns agent count, active tasks, accumulated costs, knowledge count, and per-agent breakdown.
 */
export async function analyzeCascade(
  companyId: string,
  departmentId: string,
): Promise<{ data: CascadeAnalysis } | { error: { status: number; message: string; code: string } }> {
  // Verify department exists and belongs to tenant
  const [dept] = await db
    .select()
    .from(departments)
    .where(scopedWhere(departments.companyId, companyId, eq(departments.id, departmentId)))
    .limit(1)

  if (!dept) {
    return { error: { status: 404, message: '부서를 찾을 수 없습니다', code: 'DEPT_001' } }
  }

  if (!dept.isActive) {
    return { error: { status: 409, message: '이미 비활성화된 부서입니다', code: 'CASCADE_002' } }
  }

  // Get all agents in this department
  const deptAgents = await db
    .select()
    .from(agents)
    .where(
      and(
        withTenant(agents.companyId, companyId),
        eq(agents.departmentId, departmentId),
      ),
    )

  // Build per-agent breakdown
  const agentBreakdown: AgentCascadeBreakdown[] = []
  let totalActiveTaskCount = 0
  let totalCostUsdMicro = 0

  for (const agent of deptAgents) {
    // Count active tasks for this agent
    const [taskResult] = await db
      .select({ cnt: count() })
      .from(orchestrationTasks)
      .where(
        and(
          withTenant(orchestrationTasks.companyId, companyId),
          eq(orchestrationTasks.agentId, agent.id),
          inArray(orchestrationTasks.status, ['pending', 'running']),
        ),
      )
    const activeTaskCount = Number(taskResult?.cnt ?? 0)

    // Sum costs for this agent
    const [costResult] = await db
      .select({ total: sum(costRecords.costUsdMicro) })
      .from(costRecords)
      .where(
        and(
          withTenant(costRecords.companyId, companyId),
          eq(costRecords.agentId, agent.id),
        ),
      )
    const agentCost = Number(costResult?.total ?? 0)

    agentBreakdown.push({
      id: agent.id,
      name: agent.name,
      tier: agent.tier,
      isSystem: agent.isSystem,
      activeTaskCount,
      totalCostUsdMicro: agentCost,
    })

    totalActiveTaskCount += activeTaskCount
    totalCostUsdMicro += agentCost
  }

  // Count department knowledge entries
  const [knowledgeResult] = await db
    .select({ cnt: count() })
    .from(departmentKnowledge)
    .where(
      and(
        withTenant(departmentKnowledge.companyId, companyId),
        eq(departmentKnowledge.departmentId, departmentId),
      ),
    )
  const knowledgeCount = Number(knowledgeResult?.cnt ?? 0)

  return {
    data: {
      departmentId,
      departmentName: dept.name,
      agentCount: deptAgents.length,
      activeTaskCount: totalActiveTaskCount,
      totalCostUsdMicro,
      knowledgeCount,
      agentBreakdown,
    },
  }
}

export type CascadeMode = 'wait_completion' | 'force'

/**
 * Execute cascade deletion of a department.
 * - mode='force': immediately stops active tasks, unassigns agents, soft-deletes dept
 * - mode='wait_completion': if active tasks exist, returns pending status; otherwise proceeds
 * - no mode: proceeds only if no active tasks, otherwise returns 409
 */
export async function executeCascade(
  tenant: TenantActor,
  departmentId: string,
  mode?: CascadeMode,
) {
  // Run impact analysis first
  const analysisResult = await analyzeCascade(tenant.companyId, departmentId)
  if ('error' in analysisResult) {
    return analysisResult
  }
  const analysis = analysisResult.data

  // If no mode specified and active tasks exist, require mode selection
  if (!mode && analysis.activeTaskCount > 0) {
    return {
      error: {
        status: 409,
        message: `진행 중인 작업이 ${analysis.activeTaskCount}개 있습니다. mode=force 또는 mode=wait_completion을 지정하세요`,
        code: 'CASCADE_001',
        analysis,
      },
    }
  }

  // mode=wait_completion with active tasks: return pending status
  if (mode === 'wait_completion' && analysis.activeTaskCount > 0) {
    return {
      data: {
        status: 'pending',
        message: `진행 중인 작업 ${analysis.activeTaskCount}개가 완료될 때까지 대기합니다. 작업 완료 후 다시 삭제를 시도하세요.`,
        analysis,
      },
    }
  }

  // mode=force: stop active tasks
  if (mode === 'force' && analysis.activeTaskCount > 0) {
    const agentIds = analysis.agentBreakdown.map((a) => a.id)
    if (agentIds.length > 0) {
      await db
        .update(orchestrationTasks)
        .set({
          status: 'failed',
          completedAt: new Date(),
          metadata: { reason: 'cascade_force_stop' },
        })
        .where(
          and(
            withTenant(orchestrationTasks.companyId, tenant.companyId),
            inArray(orchestrationTasks.agentId, agentIds),
            inArray(orchestrationTasks.status, ['pending', 'running']),
          ),
        )
    }
  }

  // Unassign all agents in department (batch update)
  if (analysis.agentCount > 0) {
    const agentIds = analysis.agentBreakdown.map((a) => a.id)
    await db
      .update(agents)
      .set({
        departmentId: null,
        isActive: false,
        status: 'offline',
        updatedAt: new Date(),
      })
      .where(
        and(
          withTenant(agents.companyId, tenant.companyId),
          inArray(agents.id, agentIds),
        ),
      )
  }

  // Soft-delete department
  await db
    .update(departments)
    .set({ isActive: false, updatedAt: new Date() })
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.id, departmentId)))

  // Audit log with cascade analysis
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_CASCADE_EXECUTE,
    targetType: 'department',
    targetId: departmentId,
    before: {
      name: analysis.departmentName,
      agentCount: analysis.agentCount,
      isActive: true,
    },
    after: { isActive: false },
    metadata: {
      mode: mode ?? 'immediate',
      analysis: {
        activeTaskCount: analysis.activeTaskCount,
        totalCostUsdMicro: analysis.totalCostUsdMicro,
        knowledgeCount: analysis.knowledgeCount,
        agentBreakdown: analysis.agentBreakdown.map((a) => ({
          id: a.id,
          name: a.name,
          activeTaskCount: a.activeTaskCount,
        })),
      },
    },
  })

  return {
    data: {
      status: 'completed',
      message: `부서 "${analysis.departmentName}"이(가) 삭제되었습니다. 에이전트 ${analysis.agentCount}명 미배속 전환.`,
      analysis,
    },
  }
}

// ============================================================
// Org Template Functions
// ============================================================

export interface TemplateApplySummary {
  templateId: string
  templateName: string
  departmentsCreated: number
  departmentsSkipped: number
  agentsCreated: number
  agentsSkipped: number
  details: Array<{
    departmentName: string
    action: 'created' | 'skipped'
    departmentId: string
    agentsCreated: string[]
    agentsSkipped: string[]
  }>
}

/**
 * Get all org templates visible to a company.
 * Returns builtin templates (companyId=null) + company-specific templates.
 */
export async function getOrgTemplates(companyId: string) {
  return db
    .select()
    .from(orgTemplates)
    .where(
      and(
        eq(orgTemplates.isActive, true),
        or(
          isNull(orgTemplates.companyId),
          eq(orgTemplates.companyId, companyId),
        ),
      ),
    )
}

/**
 * Get a single org template by ID, visible to the given company.
 */
export async function getOrgTemplateById(companyId: string, templateId: string) {
  const [tmpl] = await db
    .select()
    .from(orgTemplates)
    .where(
      and(
        eq(orgTemplates.id, templateId),
        or(
          isNull(orgTemplates.companyId),
          eq(orgTemplates.companyId, companyId),
        ),
      ),
    )
    .limit(1)
  return tmpl ?? null
}

/**
 * Apply an org template: bulk-create departments + agents.
 * Merge strategy: skip existing departments/agents by name within the company.
 */
export async function applyTemplate(
  tenant: TenantActor,
  templateId: string,
): Promise<{ data: TemplateApplySummary } | { error: { status: number; message: string; code: string } }> {
  // Load template
  const tmpl = await getOrgTemplateById(tenant.companyId, templateId)
  if (!tmpl) {
    return { error: { status: 404, message: '조직 템플릿을 찾을 수 없습니다', code: 'TMPL_001' } }
  }
  if (!tmpl.isActive) {
    return { error: { status: 409, message: '비활성화된 조직 템플릿입니다', code: 'TMPL_002' } }
  }

  const templateData = tmpl.templateData as TemplateData

  // Pre-load existing departments and agents for merge check
  const existingDepts = await db
    .select({ id: departments.id, name: departments.name })
    .from(departments)
    .where(
      and(
        withTenant(departments.companyId, tenant.companyId),
        eq(departments.isActive, true),
      ),
    )
  const existingDeptMap = new Map(existingDepts.map((d) => [d.name, d.id]))

  const existingAgentList = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(withTenant(agents.companyId, tenant.companyId))
  const existingAgentNames = new Set(existingAgentList.map((a) => a.name))

  const summary: TemplateApplySummary = {
    templateId,
    templateName: tmpl.name,
    departmentsCreated: 0,
    departmentsSkipped: 0,
    agentsCreated: 0,
    agentsSkipped: 0,
    details: [],
  }

  for (const dept of templateData.departments) {
    let departmentId: string
    let deptAction: 'created' | 'skipped'

    const existingId = existingDeptMap.get(dept.name)
    if (existingId) {
      departmentId = existingId
      deptAction = 'skipped'
      summary.departmentsSkipped++
    } else {
      const [newDept] = await db
        .insert(departments)
        .values(scopedInsert(tenant.companyId, {
          name: dept.name,
          description: dept.description,
        }))
        .returning()
      departmentId = newDept.id
      deptAction = 'created'
      summary.departmentsCreated++
      existingDeptMap.set(dept.name, departmentId)
    }

    const detail: (typeof summary.details)[number] = {
      departmentName: dept.name,
      action: deptAction,
      departmentId,
      agentsCreated: [],
      agentsSkipped: [],
    }

    for (const agentDef of dept.agents) {
      if (existingAgentNames.has(agentDef.name)) {
        detail.agentsSkipped.push(agentDef.name)
        summary.agentsSkipped++
        continue
      }

      await db
        .insert(agents)
        .values(scopedInsert(tenant.companyId, {
          userId: tenant.userId,
          departmentId,
          name: agentDef.name,
          nameEn: agentDef.nameEn ?? null,
          role: agentDef.role,
          tier: agentDef.tier,
          modelName: agentDef.modelName,
          soul: agentDef.soul,
          adminSoul: agentDef.soul,
          allowedTools: agentDef.allowedTools,
          status: 'offline',
        }))

      detail.agentsCreated.push(agentDef.name)
      summary.agentsCreated++
      existingAgentNames.add(agentDef.name)
    }

    summary.details.push(detail)
  }

  // Audit log
  await createAuditLog({
    companyId: tenant.companyId,
    actorType: actorType(tenant),
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.ORG_TEMPLATE_APPLY,
    targetType: 'org_template',
    targetId: templateId,
    metadata: {
      templateName: tmpl.name,
      departmentsCreated: summary.departmentsCreated,
      departmentsSkipped: summary.departmentsSkipped,
      agentsCreated: summary.agentsCreated,
      agentsSkipped: summary.agentsSkipped,
    },
  })

  return { data: summary }
}
