/**
 * Story 29.3: Server-Side State Polling & Broadcasting
 *
 * Periodically polls agent states from DB + active sessions,
 * resolves statuses, and broadcasts changes to connected office clients via WS.
 */

import type { AgentOfficeState } from '@corthex/shared'
import { getActiveSessions } from '../engine/agent-loop'
import { clientMap } from '../ws/server'
import { broadcastToCompany } from '../ws/channels'
import {
  getOfficeState,
  initOfficeState,
  updateAgentStatus,
} from './office-state'
import { getAgents } from './organization'
import { db } from '../db'
import { departments } from '../db/schema'
import { eq } from 'drizzle-orm'

const POLL_INTERVAL_MS = 5_000

/** Hash of last broadcast per company — skip if unchanged */
const lastBroadcastHash = new Map<string, string>()

/** Department name cache (refreshed each poll cycle) */
const deptNameCache = new Map<string, string>()

/**
 * Get unique companyIds that have at least one client subscribed to the office channel.
 */
function getConnectedOfficeCompanyIds(): Set<string> {
  const companyIds = new Set<string>()
  for (const clients of clientMap.values()) {
    for (const client of clients) {
      if (client.subscriptions.has(`office::${client.companyId}`)) {
        companyIds.add(client.companyId)
      }
    }
  }
  return companyIds
}

/**
 * Resolve agent statuses from DB + active sessions for a company.
 * - Active session → 'working'
 * - Default → 'idle'
 */
async function resolveAgentStatuses(companyId: string): Promise<AgentOfficeState[]> {
  const agentRows = await getAgents(companyId, { isActive: true })

  // Batch-fetch department names for agents that have departmentId
  const deptIds = [...new Set(agentRows.map(a => a.departmentId).filter(Boolean))] as string[]
  for (const deptId of deptIds) {
    if (!deptNameCache.has(deptId)) {
      try {
        const [dept] = await db
          .select({ name: departments.name })
          .from(departments)
          .where(eq(departments.id, deptId))
          .limit(1)
        if (dept) deptNameCache.set(deptId, dept.name)
      } catch {
        // fire-and-forget — dept name is cosmetic
      }
    }
  }

  // Build set of agentIds that have active sessions
  const activeSessions = getActiveSessions()
  const activeAgentIds = new Set<string>()
  for (const session of activeSessions.values()) {
    if (session.companyId === companyId) {
      for (const agentId of session.visitedAgents) {
        activeAgentIds.add(agentId)
      }
    }
  }

  // Map agents to AgentOfficeState
  const agents: Array<{ id: string; name: string; tier: string; departmentName?: string }> = agentRows.map(a => ({
    id: a.id,
    name: a.name,
    tier: a.tier ?? 'worker',
    departmentName: a.departmentId ? deptNameCache.get(a.departmentId) : undefined,
  }))

  // Ensure office state is initialized (idempotent — only inits if empty)
  const existing = getOfficeState(companyId)
  if (existing.length === 0 && agents.length > 0) {
    initOfficeState(companyId, agents)
  }

  // Update statuses based on active sessions
  for (const agent of agents) {
    const isActive = activeAgentIds.has(agent.id)
    updateAgentStatus(
      companyId,
      agent.id,
      isActive ? 'working' : 'idle',
      isActive ? 'Processing...' : undefined,
    )
  }

  return getOfficeState(companyId)
}

/**
 * Determine if state has changed since last broadcast (diff detection).
 * Compares a hash of agentId:status pairs.
 */
function shouldBroadcast(companyId: string, state: AgentOfficeState[]): boolean {
  const hash = state.map(a => `${a.agentId}:${a.status}`).join('|')
  const lastHash = lastBroadcastHash.get(companyId)
  if (hash === lastHash) return false
  lastBroadcastHash.set(companyId, hash)
  return true
}

/**
 * Single poll tick — resolve + broadcast for each connected company.
 */
async function pollTick(): Promise<void> {
  const companyIds = getConnectedOfficeCompanyIds()
  if (companyIds.size === 0) return

  // Clear dept cache each cycle to pick up renames
  deptNameCache.clear()

  const promises = [...companyIds].map(async (companyId) => {
    try {
      const state = await resolveAgentStatuses(companyId)
      if (shouldBroadcast(companyId, state)) {
        broadcastToCompany(companyId, 'office', { type: 'office_state', agents: state })
      }
    } catch (err) {
      console.error(`[office-poller] Error polling company ${companyId}:`, err)
    }
  })

  await Promise.all(promises)
}

let pollerTimer: ReturnType<typeof setInterval> | null = null

/** Start the office state poller */
export function startOfficePoller(): void {
  if (pollerTimer) return
  pollerTimer = setInterval(pollTick, POLL_INTERVAL_MS)
  console.log(`🏢 Office poller started (interval: ${POLL_INTERVAL_MS}ms)`)
}

/** Stop the office state poller */
export function stopOfficePoller(): void {
  if (pollerTimer) {
    clearInterval(pollerTimer)
    pollerTimer = null
    lastBroadcastHash.clear()
    console.log('🛑 Office poller stopped')
  }
}

// Export for testing
export {
  resolveAgentStatuses,
  shouldBroadcast,
  pollTick,
  getConnectedOfficeCompanyIds,
  lastBroadcastHash,
  POLL_INTERVAL_MS,
}
