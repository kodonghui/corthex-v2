/**
 * Tool Check Handler — /도구점검 슬래시 명령 처리
 * 전체 도구 등록 현황 + 에이전트별 도구 배정 상태 보고
 */
import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { commands, agents, departments } from '../db/schema'
import { toolPool } from './tool-pool'
import { delegationTracker } from './delegation-tracker'

// === Types ===

export type ToolCheckOptions = {
  commandId: string
  companyId: string
  userId: string
}

// === Main Processing ===

export async function processToolCheck(options: ToolCheckOptions): Promise<void> {
  const { commandId, companyId } = options

  await db.update(commands)
    .set({ status: 'processing' })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  delegationTracker.startCommand(companyId, commandId)

  try {
    // 1. Get registered tools from pool
    const registeredTools = toolPool.list()

    // 2. Get all active agents with their allowed tools and department info
    const agentRows = await db
      .select({
        id: agents.id,
        name: agents.name,
        tier: agents.tier,
        allowedTools: agents.allowedTools,
        departmentId: agents.departmentId,
        departmentName: departments.name,
      })
      .from(agents)
      .leftJoin(departments, eq(agents.departmentId, departments.id))
      .where(and(
        eq(agents.companyId, companyId),
        eq(agents.isActive, true),
      ))

    // 3. Build report
    const report = formatToolCheckReport(registeredTools, agentRows)

    // 4. Update command
    delegationTracker.completed(companyId, commandId)
    await db.update(commands)
      .set({
        status: 'completed',
        result: report,
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    delegationTracker.failed(companyId, commandId, errorMsg)
    await db.update(commands)
      .set({
        status: 'failed',
        result: `도구 점검 실패: ${errorMsg}`,
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  }
}

// === Report Formatting ===

type AgentToolRow = {
  id: string
  name: string
  tier: string
  allowedTools: unknown
  departmentId: string | null
  departmentName: string | null
}

type ToolInfo = {
  name: string
  description: string
  category: string
}

export function formatToolCheckReport(
  registeredTools: ToolInfo[],
  agentRows: AgentToolRow[],
): string {
  const lines: string[] = []

  lines.push('## 🔧 도구 점검 결과')
  lines.push('')

  // Tool registration summary
  lines.push(`### 도구 등록 현황 (총 ${registeredTools.length}개)`)
  lines.push('')

  if (registeredTools.length > 0) {
    // Group by category
    const byCategory = new Map<string, ToolInfo[]>()
    for (const tool of registeredTools) {
      const cat = tool.category || '기타'
      if (!byCategory.has(cat)) byCategory.set(cat, [])
      byCategory.get(cat)!.push(tool)
    }

    lines.push('| 카테고리 | 도구 수 | 도구 목록 |')
    lines.push('|---------|--------|----------|')
    for (const [category, tools] of byCategory) {
      const toolNames = tools.map(t => t.name).join(', ')
      lines.push(`| ${category} | ${tools.length} | ${toolNames} |`)
    }
  } else {
    lines.push('등록된 도구가 없습니다.')
  }

  lines.push('')

  // Agent tool assignment
  lines.push(`### 에이전트별 도구 배정 (총 ${agentRows.length}명)`)
  lines.push('')

  if (agentRows.length > 0) {
    lines.push('| 에이전트 | 부서 | 등급 | 허용 도구 수 |')
    lines.push('|---------|------|------|------------|')

    for (const agent of agentRows) {
      const tools = Array.isArray(agent.allowedTools) ? agent.allowedTools : []
      const deptName = agent.departmentName || '(미배정)'
      lines.push(`| ${agent.name} | ${deptName} | ${agent.tier} | ${tools.length} |`)
    }
  } else {
    lines.push('활성 에이전트가 없습니다.')
  }

  lines.push('')

  // Summary
  const totalAgents = agentRows.length
  const agentsWithTools = agentRows.filter(a => {
    const tools = Array.isArray(a.allowedTools) ? a.allowedTools : []
    return tools.length > 0
  }).length
  const agentsWithoutTools = totalAgents - agentsWithTools

  lines.push('### 요약')
  lines.push(`- 등록 도구: ${registeredTools.length}개`)
  lines.push(`- 활성 에이전트: ${totalAgents}명`)
  lines.push(`- 도구 배정됨: ${agentsWithTools}명`)
  lines.push(`- 도구 미배정: ${agentsWithoutTools}명`)

  return lines.join('\n')
}
