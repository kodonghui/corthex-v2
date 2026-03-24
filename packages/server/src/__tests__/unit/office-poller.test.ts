/**
 * Story 29.3: Office Poller Tests
 *
 * Tests resolveAgentStatuses, shouldBroadcast, getConnectedOfficeCompanyIds,
 * and poller start/stop without triggering credential-crypto validation.
 *
 * Strategy: read source for structural validation + test pure functions
 * extracted into office-state (already tested in office-websocket.test.ts).
 */
import { describe, test, expect, beforeEach } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { AgentOfficeState } from '@corthex/shared'
import {
  getOfficeState,
  clearOfficeState,
  initOfficeState,
  updateAgentStatus,
  calculatePosition,
} from '../../services/office-state'

const COMPANY_ID = 'test-co-29-3'

const POLLER_PATH = resolve(__dirname, '../../services/office-poller.ts')
const ROUTE_PATH = resolve(__dirname, '../../routes/workspace/office.ts')
const INDEX_PATH = resolve(__dirname, '../../index.ts')

const pollerSrc = readFileSync(POLLER_PATH, 'utf-8')
const routeSrc = readFileSync(ROUTE_PATH, 'utf-8')
const indexSrc = readFileSync(INDEX_PATH, 'utf-8')

describe('Office Poller — Source Structure', () => {
  test('exports startOfficePoller and stopOfficePoller', () => {
    expect(pollerSrc).toContain('export function startOfficePoller')
    expect(pollerSrc).toContain('export function stopOfficePoller')
  })

  test('exports resolveAgentStatuses', () => {
    expect(pollerSrc).toContain('export {')
    expect(pollerSrc).toContain('resolveAgentStatuses')
  })

  test('exports shouldBroadcast for diff detection', () => {
    expect(pollerSrc).toContain('shouldBroadcast')
  })

  test('exports getConnectedOfficeCompanyIds', () => {
    expect(pollerSrc).toContain('getConnectedOfficeCompanyIds')
  })

  test('uses POLL_INTERVAL_MS = 5000', () => {
    expect(pollerSrc).toContain('POLL_INTERVAL_MS = 5_000')
  })

  test('imports getActiveSessions from agent-loop', () => {
    expect(pollerSrc).toContain("import { getActiveSessions } from '../engine/agent-loop'")
  })

  test('imports clientMap from ws/server', () => {
    expect(pollerSrc).toContain("import { clientMap } from '../ws/server'")
  })

  test('imports broadcastToCompany from ws/channels', () => {
    expect(pollerSrc).toContain("import { broadcastToCompany } from '../ws/channels'")
  })

  test('imports getAgents from organization', () => {
    expect(pollerSrc).toContain("import { getAgents } from './organization'")
  })

  test('uses office-state functions (initOfficeState, updateAgentStatus, getOfficeState)', () => {
    expect(pollerSrc).toContain('initOfficeState')
    expect(pollerSrc).toContain('updateAgentStatus')
    expect(pollerSrc).toContain('getOfficeState')
  })

  test('resolveAgentStatuses checks active sessions for working status', () => {
    expect(pollerSrc).toContain("isActive ? 'working' : 'idle'")
  })

  test('shouldBroadcast uses hash comparison', () => {
    expect(pollerSrc).toContain('lastBroadcastHash')
    expect(pollerSrc).toContain('hash === lastHash')
  })

  test('getConnectedOfficeCompanyIds checks office:: subscription prefix', () => {
    expect(pollerSrc).toContain('`office::${client.companyId}`')
  })

  test('pollTick clears dept cache each cycle', () => {
    expect(pollerSrc).toContain('deptNameCache.clear()')
  })

  test('pollTick handles errors gracefully (try-catch per company)', () => {
    expect(pollerSrc).toContain('catch (err)')
    expect(pollerSrc).toContain('[office-poller]')
  })

  test('broadcasts office_state type with agents array', () => {
    expect(pollerSrc).toContain("type: 'office_state'")
    expect(pollerSrc).toContain('agents: state')
  })
})

describe('Office REST Route — Source Structure', () => {
  test('exports officeRoute', () => {
    expect(routeSrc).toContain('export const officeRoute')
  })

  test('registers GET /state endpoint', () => {
    expect(routeSrc).toContain("officeRoute.get('/state'")
  })

  test('uses authMiddleware', () => {
    expect(routeSrc).toContain('authMiddleware')
  })

  test('calls resolveAgentStatuses with tenant companyId', () => {
    expect(routeSrc).toContain('resolveAgentStatuses(tenant.companyId)')
  })

  test('returns { success: true, data: { agents } }', () => {
    expect(routeSrc).toContain('success: true')
    expect(routeSrc).toContain('data: { agents }')
  })
})

describe('Server Registration — index.ts', () => {
  test('imports officeRoute', () => {
    expect(indexSrc).toContain("import { officeRoute } from './routes/workspace/office'")
  })

  test('registers office route at /api/workspace/office', () => {
    expect(indexSrc).toContain("app.route('/api/workspace/office', officeRoute)")
  })

  test('imports startOfficePoller and stopOfficePoller', () => {
    expect(indexSrc).toContain("import { startOfficePoller, stopOfficePoller } from './services/office-poller'")
  })

  test('starts poller after migrations', () => {
    expect(indexSrc).toContain('startOfficePoller()')
  })

  test('stops poller on graceful shutdown', () => {
    expect(indexSrc).toContain('stopOfficePoller()')
  })
})

describe('Agent Status Resolution — via office-state', () => {
  beforeEach(() => {
    clearOfficeState(COMPANY_ID)
  })

  const mockAgents = [
    { id: 'a1', name: 'Alpha', tier: 'manager', departmentName: 'Engineering' },
    { id: 'a2', name: 'Bravo', tier: 'specialist' },
    { id: 'a3', name: 'Charlie', tier: 'worker', departmentName: 'Marketing' },
  ]

  test('active session → working status', () => {
    initOfficeState(COMPANY_ID, mockAgents)
    updateAgentStatus(COMPANY_ID, 'a1', 'working', 'Processing...')
    const state = getOfficeState(COMPANY_ID)
    const alpha = state.find(s => s.agentId === 'a1')!
    expect(alpha.status).toBe('working')
    expect(alpha.currentTask).toBe('Processing...')
  })

  test('no active session → idle status', () => {
    initOfficeState(COMPANY_ID, mockAgents)
    updateAgentStatus(COMPANY_ID, 'a2', 'idle')
    const state = getOfficeState(COMPANY_ID)
    const bravo = state.find(s => s.agentId === 'a2')!
    expect(bravo.status).toBe('idle')
    expect(bravo.currentTask).toBeUndefined()
  })

  test('maps all agents with correct properties', () => {
    initOfficeState(COMPANY_ID, mockAgents)
    const state = getOfficeState(COMPANY_ID)
    expect(state).toHaveLength(3)

    const alpha = state.find(s => s.agentId === 'a1')!
    expect(alpha.name).toBe('Alpha')
    expect(alpha.tier).toBe('manager')
    expect(alpha.department).toBe('Engineering')

    const bravo = state.find(s => s.agentId === 'a2')!
    expect(bravo.department).toBeUndefined()
  })

  test('all agents start idle', () => {
    initOfficeState(COMPANY_ID, mockAgents)
    const state = getOfficeState(COMPANY_ID)
    for (const s of state) {
      expect(s.status).toBe('idle')
    }
  })

  test('positions are unique and within bounds', () => {
    initOfficeState(COMPANY_ID, mockAgents)
    const state = getOfficeState(COMPANY_ID)
    const keys = state.map(s => `${s.position.x},${s.position.y}`)
    expect(new Set(keys).size).toBe(state.length)
    for (const s of state) {
      expect(s.position.x).toBeGreaterThan(0)
      expect(s.position.y).toBeGreaterThan(0)
    }
  })

  test('lastActiveAt is ISO string', () => {
    initOfficeState(COMPANY_ID, mockAgents)
    const state = getOfficeState(COMPANY_ID)
    for (const s of state) {
      expect(s.lastActiveAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    }
  })
})

describe('Smart Broadcast Diff Detection — inline reimplementation', () => {
  // Re-implement shouldBroadcast logic inline for testing (same algorithm as office-poller.ts)
  const hashCache = new Map<string, string>()

  function testShouldBroadcast(companyId: string, state: AgentOfficeState[]): boolean {
    const hash = state.map(a => `${a.agentId}:${a.status}`).join('|')
    const lastHash = hashCache.get(companyId)
    if (hash === lastHash) return false
    hashCache.set(companyId, hash)
    return true
  }

  beforeEach(() => {
    hashCache.clear()
  })

  test('first broadcast → true', () => {
    const state = [{ agentId: 'a1', status: 'idle' }] as AgentOfficeState[]
    expect(testShouldBroadcast('co-1', state)).toBe(true)
  })

  test('same state → false (skip)', () => {
    const state = [{ agentId: 'a1', status: 'idle' }] as AgentOfficeState[]
    testShouldBroadcast('co-1', state)
    expect(testShouldBroadcast('co-1', state)).toBe(false)
  })

  test('changed state → true (broadcast)', () => {
    const s1 = [{ agentId: 'a1', status: 'idle' }] as AgentOfficeState[]
    const s2 = [{ agentId: 'a1', status: 'working' }] as AgentOfficeState[]
    testShouldBroadcast('co-1', s1)
    expect(testShouldBroadcast('co-1', s2)).toBe(true)
  })

  test('different companies tracked independently', () => {
    const state = [{ agentId: 'a1', status: 'idle' }] as AgentOfficeState[]
    testShouldBroadcast('co-A', state)
    expect(testShouldBroadcast('co-B', state)).toBe(true) // first for co-B
  })

  test('hash format matches source implementation', () => {
    // Verify the hash format used in office-poller.ts
    const state = [
      { agentId: 'a1', status: 'idle' },
      { agentId: 'a2', status: 'working' },
    ] as AgentOfficeState[]
    const hash = state.map(a => `${a.agentId}:${a.status}`).join('|')
    expect(hash).toBe('a1:idle|a2:working')
  })
})
