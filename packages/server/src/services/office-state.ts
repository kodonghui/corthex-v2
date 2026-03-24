import type { AgentOfficeState, AgentOfficeStatus } from '@corthex/shared'

// In-memory state per company: agentId → AgentOfficeState
const companyStates = new Map<string, Map<string, AgentOfficeState>>()

/** Get all agent states for a company */
export function getOfficeState(companyId: string): AgentOfficeState[] {
  const stateMap = companyStates.get(companyId)
  if (!stateMap) return []
  return Array.from(stateMap.values())
}

/** Get single agent state */
export function getAgentState(companyId: string, agentId: string): AgentOfficeState | undefined {
  return companyStates.get(companyId)?.get(agentId)
}

/** Update agent status + optional task */
export function updateAgentStatus(
  companyId: string,
  agentId: string,
  status: AgentOfficeStatus,
  task?: string,
): void {
  const stateMap = companyStates.get(companyId)
  if (!stateMap) return
  const agent = stateMap.get(agentId)
  if (!agent) return
  agent.status = status
  agent.currentTask = task
  agent.lastActiveAt = new Date().toISOString()
}

/** Initialize office state from agent list */
export function initOfficeState(
  companyId: string,
  agents: Array<{ id: string; name: string; tier: string; departmentName?: string }>,
): void {
  const stateMap = new Map<string, AgentOfficeState>()
  const canvasWidth = 1200
  const canvasHeight = 800
  agents.forEach((agent, index) => {
    const pos = calculatePosition(index, agents.length, canvasWidth, canvasHeight)
    stateMap.set(agent.id, {
      agentId: agent.id,
      name: agent.name,
      status: 'idle',
      position: pos,
      lastActiveAt: new Date().toISOString(),
      tier: agent.tier,
      department: agent.departmentName,
    })
  })
  companyStates.set(companyId, stateMap)
}

/** Calculate grid position for an agent */
export function calculatePosition(
  index: number,
  total: number,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number } {
  if (total <= 0) return { x: canvasWidth / 2, y: canvasHeight / 2 }
  const cols = Math.ceil(Math.sqrt(total))
  const rows = Math.ceil(total / cols)
  const cellW = canvasWidth / (cols + 1)
  const cellH = canvasHeight / (rows + 1)
  const col = index % cols
  const row = Math.floor(index / cols)
  return {
    x: Math.round(cellW * (col + 1)),
    y: Math.round(cellH * (row + 1)),
  }
}

/** Clear state for a company (e.g. on teardown) */
export function clearOfficeState(companyId: string): void {
  companyStates.delete(companyId)
}
