import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, sql, inArray } from 'drizzle-orm'
import { db } from '../../db'
import { agents, agentDelegationRules } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { departmentScopeMiddleware } from '../../middleware/department-scope'
import { HTTPError } from '../../middleware/error'
import { isCeoOrAbove } from '@corthex/shared'
import { logActivity } from '../../lib/activity-logger'
import { detectCycleInDelegationRules } from '../../lib/orchestrator'
import {
  createAgent,
  updateAgent as updateAgentService,
  deactivateAgent,
} from '../../services/organization'
import type { AppEnv } from '../../types'

export const workspaceAgentsRoute = new Hono<AppEnv>()

workspaceAgentsRoute.use('*', authMiddleware)
workspaceAgentsRoute.use('*', departmentScopeMiddleware)

// GET /api/workspace/agents — 내 회사의 활성 에이전트 목록
workspaceAgentsRoute.get('/agents', async (c) => {
  const tenant = c.get('tenant')

  const conditions = [eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)]

  // Employee: only show agents from assigned departments
  if (tenant.departmentIds) {
    if (tenant.departmentIds.length === 0) {
      return c.json({ data: [] })
    }
    conditions.push(inArray(agents.departmentId, tenant.departmentIds))
  }

  const result = await db
    .select({
      id: agents.id,
      name: agents.name,
      nameEn: agents.nameEn,
      role: agents.role,
      tier: agents.tier,
      modelName: agents.modelName,
      status: agents.status,
      isSecretary: agents.isSecretary,
      departmentId: agents.departmentId,
      reportTo: agents.reportTo,
    })
    .from(agents)
    .where(and(...conditions))

  return c.json({ data: result })
})

// GET /api/workspace/agents/hierarchy — 전체 에이전트 조직도 (트리 구조)
workspaceAgentsRoute.get('/agents/hierarchy', async (c) => {
  const tenant = c.get('tenant')

  const conditions = [eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)]

  if (tenant.departmentIds) {
    if (tenant.departmentIds.length === 0) {
      return c.json({ data: [] })
    }
    conditions.push(inArray(agents.departmentId, tenant.departmentIds))
  }

  const allAgents = await db
    .select({
      id: agents.id,
      name: agents.name,
      nameEn: agents.nameEn,
      role: agents.role,
      tier: agents.tier,
      modelName: agents.modelName,
      status: agents.status,
      isSecretary: agents.isSecretary,
      departmentId: agents.departmentId,
      reportTo: agents.reportTo,
    })
    .from(agents)
    .where(and(...conditions))

  // Build tree: find roots (reportTo === null), then recursively attach children
  type AgentNode = typeof allAgents[number] & { children: AgentNode[] }

  const agentById = new Map<string, AgentNode>()
  for (const a of allAgents) {
    agentById.set(a.id, { ...a, children: [] })
  }

  const roots: AgentNode[] = []
  for (const node of agentById.values()) {
    if (node.reportTo && agentById.has(node.reportTo)) {
      agentById.get(node.reportTo)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return c.json({ data: roots })
})

// GET /api/workspace/agents/delegation-rules — 회사 전체 위임 규칙 조회
// NOTE: :id 라우트보다 위에 등록해야 'delegation-rules'가 :id로 캡처되지 않음
workspaceAgentsRoute.get('/agents/delegation-rules', async (c) => {
  const tenant = c.get('tenant')

  const rules = await db
    .select({
      id: agentDelegationRules.id,
      sourceAgentId: agentDelegationRules.sourceAgentId,
      targetAgentId: agentDelegationRules.targetAgentId,
      condition: agentDelegationRules.condition,
      priority: agentDelegationRules.priority,
      isActive: agentDelegationRules.isActive,
      createdAt: agentDelegationRules.createdAt,
    })
    .from(agentDelegationRules)
    .where(eq(agentDelegationRules.companyId, tenant.companyId))

  // 에이전트 이름 조인
  const agentConditions = [eq(agents.companyId, tenant.companyId)]
  if (tenant.departmentIds) {
    if (tenant.departmentIds.length === 0) {
      return c.json({ data: [] })
    }
    agentConditions.push(inArray(agents.departmentId, tenant.departmentIds))
  }

  const agentList = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(and(...agentConditions))
  const agentNames: Record<string, string> = {}
  for (const a of agentList) agentNames[a.id] = a.name

  // Employee: only show rules where both source and target are in their departments
  let filteredRules = rules
  if (tenant.departmentIds) {
    const scopedIds = new Set(agentList.map(a => a.id))
    filteredRules = rules.filter(r => scopedIds.has(r.sourceAgentId) && scopedIds.has(r.targetAgentId))
  }

  const data = filteredRules.map(r => ({
    ...r,
    sourceAgentName: agentNames[r.sourceAgentId] || '알 수 없음',
    targetAgentName: agentNames[r.targetAgentId] || '알 수 없음',
  }))

  return c.json({ data })
})

// GET /api/workspace/agents/:id — 에이전트 상세 (내 회사만)
workspaceAgentsRoute.get('/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [agent] = await db
    .select({
      id: agents.id,
      name: agents.name,
      nameEn: agents.nameEn,
      role: agents.role,
      tier: agents.tier,
      modelName: agents.modelName,
      soul: agents.soul,
      adminSoul: agents.adminSoul,
      status: agents.status,
      departmentId: agents.departmentId,
      reportTo: agents.reportTo,
    })
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

  // Employee: verify agent belongs to assigned department
  if (tenant.departmentIds && (!agent.departmentId || !tenant.departmentIds.includes(agent.departmentId))) {
    throw new HTTPError(403, '해당 부서의 에이전트에만 접근할 수 있습니다', 'SCOPE_001')
  }

  return c.json({ data: agent })
})

// PATCH /api/workspace/agents/:id/soul — 에이전트 소울 수정 (자기 에이전트만)
const updateSoulSchema = z.object({
  soul: z.string().min(1).max(50000),
})

workspaceAgentsRoute.patch('/agents/:id/soul', zValidator('json', updateSoulSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const { soul } = c.req.valid('json')

  // 자기 에이전트만 수정 가능
  const [agent] = await db
    .select({ id: agents.id, userId: agents.userId, name: agents.name })
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')
  if (agent.userId !== tenant.userId && !isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '본인 에이전트만 수정할 수 있습니다', 'AUTH_003')
  }

  const [updated] = await db
    .update(agents)
    .set({ soul, updatedAt: new Date() })
    .where(eq(agents.id, id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `에이전트 소울 수정: ${agent.name}`,
  })

  return c.json({ data: updated })
})

// POST /api/workspace/agents/:id/soul/reset — 에이전트 소울 초기화 (admin_soul로 복원)
workspaceAgentsRoute.post('/agents/:id/soul/reset', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [agent] = await db
    .select({ id: agents.id, userId: agents.userId, name: agents.name, adminSoul: agents.adminSoul })
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')
  if (agent.userId !== tenant.userId && !isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '본인 에이전트만 수정할 수 있습니다', 'AUTH_003')
  }

  if (!agent.adminSoul) {
    throw new HTTPError(400, '초기화할 원본 소울이 없습니다', 'AGENT_002')
  }

  const [updated] = await db
    .update(agents)
    .set({ soul: agent.adminSoul, updatedAt: new Date() })
    .where(eq(agents.id, id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `에이전트 소울 초기화: ${agent.name}`,
  })

  return c.json({ data: updated })
})

// === Agent CRUD (admin/ceo only) ===

const createAgentSchema = z.object({
  userId: z.string().uuid(),
  departmentId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).nullable().optional(),
  role: z.string().max(200).nullable().optional(),
  tier: z.enum(['manager', 'specialist', 'worker']).optional(),
  tierLevel: z.number().int().min(1).optional(),
  modelName: z.string().max(100).optional(),
  allowedTools: z.array(z.string()).optional(),
  soul: z.string().nullable().optional(),
  isSecretary: z.boolean().optional(),
  ownerUserId: z.string().uuid().nullable().optional(),
})

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().max(100).nullable().optional(),
  role: z.string().max(200).nullable().optional(),
  tier: z.enum(['manager', 'specialist', 'worker']).optional(),
  tierLevel: z.number().int().min(1).optional(),
  modelName: z.string().max(100).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  allowedTools: z.array(z.string()).optional(),
  soul: z.string().nullable().optional(),
  status: z.enum(['online', 'working', 'error', 'offline']).optional(),
  isActive: z.boolean().optional(),
  isSecretary: z.boolean().optional(),
  ownerUserId: z.string().uuid().nullable().optional(),
  enableSemanticCache: z.boolean().optional(),
})

// POST /api/workspace/agents — create agent (admin/ceo only)
workspaceAgentsRoute.post('/agents', zValidator('json', createAgentSchema), async (c) => {
  const tenant = c.get('tenant')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '에이전트 생성은 관리자만 가능합니다', 'AUTH_003')
  }

  const body = c.req.valid('json')
  const result = await createAgent(tenant, body)
  if ('error' in result) throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  return c.json({ success: true, data: result.data }, 201)
})

// PATCH /api/workspace/agents/:id — update agent (admin/ceo only)
workspaceAgentsRoute.patch('/agents/:id', zValidator('json', updateAgentSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '에이전트 수정은 관리자만 가능합니다', 'AUTH_003')
  }

  const body = c.req.valid('json')
  const result = await updateAgentService(tenant, id, body)
  if ('error' in result) throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  return c.json({ success: true, data: result.data })
})

// DELETE /api/workspace/agents/:id?force=true — deactivate agent (admin/ceo only)
workspaceAgentsRoute.delete('/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '에이전트 삭제는 관리자만 가능합니다', 'AUTH_003')
  }

  const force = c.req.query('force') === 'true'
  const result = await deactivateAgent(tenant, id, force)
  if ('error' in result) {
    const err = result.error!
    if (err.code === 'AGENT_ACTIVE_SESSIONS') {
      const data = 'data' in err ? (err as { data: Record<string, unknown> }).data : undefined
      return c.json({
        success: false,
        error: { code: err.code, message: err.message },
        data,
      }, 409)
    }
    throw new HTTPError(err.status, err.message, err.code)
  }
  return c.json({ success: true, data: result.data })
})

// === 위임 규칙 CRUD (POST/DELETE) ===

// POST /api/workspace/agents/delegation-rules — 위임 규칙 생성
const createRuleSchema = z.object({
  sourceAgentId: z.string().uuid(),
  targetAgentId: z.string().uuid(),
  condition: z.object({
    keywords: z.array(z.string()).min(1),
    departmentId: z.string().uuid().optional(),
  }),
  priority: z.number().int().min(0).max(100).default(0),
})

workspaceAgentsRoute.post('/agents/delegation-rules', zValidator('json', createRuleSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // 역할 기반 권한 체크: admin만 허용
  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '위임 규칙은 관리자만 생성할 수 있습니다', 'AUTH_003')
  }

  // 자기 자신에게 위임 금지
  if (body.sourceAgentId === body.targetAgentId) {
    throw new HTTPError(400, '같은 에이전트에게 위임할 수 없습니다', 'RULE_002')
  }

  // 회사별 규칙 개수 제한 (50개)
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(agentDelegationRules)
    .where(eq(agentDelegationRules.companyId, tenant.companyId))
  if (countResult.count >= 50) {
    throw new HTTPError(400, '위임 규칙 최대 개수(50)를 초과했습니다', 'RULE_004')
  }

  // sourceAgentId, targetAgentId가 같은 회사 소속인지 확인
  const [source] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, body.sourceAgentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)
  if (!source) throw new HTTPError(404, '소스 에이전트를 찾을 수 없습니다', 'AGENT_001')

  const [target] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, body.targetAgentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)
  if (!target) throw new HTTPError(404, '대상 에이전트를 찾을 수 없습니다', 'AGENT_001')

  // 순환 위임 경로 감지
  const hasCycle = await detectCycleInDelegationRules(tenant.companyId, body.sourceAgentId, body.targetAgentId)
  if (hasCycle) {
    throw new HTTPError(400, '순환 위임 경로가 감지되었습니다', 'RULE_003')
  }

  const [rule] = await db
    .insert(agentDelegationRules)
    .values({
      companyId: tenant.companyId,
      sourceAgentId: body.sourceAgentId,
      targetAgentId: body.targetAgentId,
      condition: body.condition,
      priority: body.priority,
    })
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `위임 규칙 생성`,
  })

  return c.json({ data: rule }, 201)
})

// DELETE /api/workspace/agents/delegation-rules/:id — 위임 규칙 삭제
workspaceAgentsRoute.delete('/agents/delegation-rules/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // 역할 기반 권한 체크: admin만 허용
  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '위임 규칙은 관리자만 삭제할 수 있습니다', 'AUTH_003')
  }

  const deleted = await db
    .delete(agentDelegationRules)
    .where(and(eq(agentDelegationRules.id, id), eq(agentDelegationRules.companyId, tenant.companyId)))
    .returning({ id: agentDelegationRules.id })

  if (deleted.length === 0) throw new HTTPError(404, '위임 규칙을 찾을 수 없습니다', 'RULE_001')

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `위임 규칙 삭제`,
  })

  return c.json({ data: { id: deleted[0].id } })
})
