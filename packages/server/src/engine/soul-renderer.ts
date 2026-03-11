import { getDB } from '../db/scoped-query'

/**
 * E4: Soul 템플릿 변수 치환 — engine 내부 전용 (E8)
 *
 * 6개 변수: {{agent_list}}, {{subordinate_list}}, {{tool_list}},
 *           {{department_name}}, {{owner_name}}, {{specialty}}
 *
 * 치환 실패 → 빈 문자열 (에러 아님). 사용자 입력 직접 삽입 금지.
 */
export async function renderSoul(
  soulTemplate: string,
  agentId: string,
  companyId: string,
): Promise<string> {
  const scopedDb = getDB(companyId)

  // Fetch agent first (needed for departmentId, userId, role)
  const [agent] = await scopedDb.agentById(agentId)
  if (!agent) return soulTemplate.replace(/\{\{[^}]+\}\}/g, '')

  // Parallel fetch all variable data
  const [allAgents, subordinates, tools, dept, owner] = await Promise.all([
    scopedDb.agents(),
    scopedDb.agentsByReportTo(agentId),
    scopedDb.agentToolsWithDefs(agentId),
    agent.departmentId ? scopedDb.departmentById(agent.departmentId) : Promise.resolve([]),
    scopedDb.userById(agent.userId),
  ])

  // Build variable map
  const vars: Record<string, string> = {
    agent_list: allAgents.map(a => `${a.name}(${a.role || ''})`).join(', '),
    subordinate_list: subordinates.map(a => `${a.name}(${a.role || ''})`).join(', '),
    tool_list: tools.map(t => `${t.name}: ${t.description || ''}`).join(', '),
    department_name: dept[0]?.name || '',
    owner_name: owner[0]?.name || '',
    specialty: agent.role || '',
  }

  // Replace all {{var}} — known vars get value, unknown vars get empty string
  return soulTemplate.replace(/\{\{([^}]+)\}\}/g, (_, key) => vars[key.trim()] || '')
}
