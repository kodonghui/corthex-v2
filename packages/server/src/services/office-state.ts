import type { AgentOfficeState, AgentOfficeStatus } from '@corthex/shared'

// In-memory state per company: agentId → AgentOfficeState
const companyStates = new Map<string, Map<string, AgentOfficeState>>()

// Connection tracking for office WS
const companyConnectionCounts = new Map<string, number>()
let totalConnections = 0

export const CONNECTION_LIMITS = {
  maxPerCompany: 50,
  maxTotal: 100,
  heartbeatTimeoutMs: 60_000,
} as const

/** Check if a new office WS connection is allowed for a company */
export function canAcceptConnection(companyId: string): { allowed: boolean; reason?: string } {
  if (totalConnections >= CONNECTION_LIMITS.maxTotal) {
    return { allowed: false, reason: 'Server connection limit reached' }
  }
  const companyCount = companyConnectionCounts.get(companyId) ?? 0
  if (companyCount >= CONNECTION_LIMITS.maxPerCompany) {
    return { allowed: false, reason: 'Company connection limit reached' }
  }
  return { allowed: true }
}

/** Register a new office WS connection */
export function registerConnection(companyId: string): void {
  companyConnectionCounts.set(companyId, (companyConnectionCounts.get(companyId) ?? 0) + 1)
  totalConnections++
}

/** Unregister an office WS connection */
export function unregisterConnection(companyId: string): void {
  const count = companyConnectionCounts.get(companyId) ?? 0
  if (count <= 1) {
    companyConnectionCounts.delete(companyId)
  } else {
    companyConnectionCounts.set(companyId, count - 1)
  }
  totalConnections = Math.max(0, totalConnections - 1)
}

/** Get current connection counts (for monitoring) */
export function getConnectionCounts(): { total: number; byCompany: Record<string, number> } {
  return {
    total: totalConnections,
    byCompany: Object.fromEntries(companyConnectionCounts),
  }
}

/** Reset connection tracking (for tests) */
export function resetConnectionCounts(): void {
  companyConnectionCounts.clear()
  totalConnections = 0
}

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
