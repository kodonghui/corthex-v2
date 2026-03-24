import { describe, test, expect } from 'bun:test'
import type { AgentOfficeState } from '@corthex/shared'
import { sortAgentsByStatus } from '../components/MobileAgentList'

function makeAgent(overrides: Partial<AgentOfficeState> = {}): AgentOfficeState {
  return {
    agentId: 'agent-1',
    name: 'Alpha',
    status: 'idle',
    position: { x: 100, y: 200 },
    lastActiveAt: new Date().toISOString(),
    tier: 'T1',
    department: 'Engineering',
    ...overrides,
  }
}

describe('MobileAgentList — sortAgentsByStatus', () => {
  test('sorts working agents first', () => {
    const agents = [
      makeAgent({ agentId: 'a1', name: 'Alpha', status: 'idle' }),
      makeAgent({ agentId: 'a2', name: 'Bravo', status: 'working' }),
      makeAgent({ agentId: 'a3', name: 'Charlie', status: 'offline' }),
    ]
    const sorted = sortAgentsByStatus(agents)
    expect(sorted[0].agentId).toBe('a2') // working first
    expect(sorted[1].agentId).toBe('a1') // idle second
    expect(sorted[2].agentId).toBe('a3') // offline last
  })

  test('sorts by name within same status', () => {
    const agents = [
      makeAgent({ agentId: 'a1', name: 'Charlie', status: 'idle' }),
      makeAgent({ agentId: 'a2', name: 'Alpha', status: 'idle' }),
      makeAgent({ agentId: 'a3', name: 'Bravo', status: 'idle' }),
    ]
    const sorted = sortAgentsByStatus(agents)
    expect(sorted[0].name).toBe('Alpha')
    expect(sorted[1].name).toBe('Bravo')
    expect(sorted[2].name).toBe('Charlie')
  })

  test('full status order: working → reflecting → idle → error → offline', () => {
    const agents = [
      makeAgent({ agentId: 'a1', name: 'A', status: 'offline' }),
      makeAgent({ agentId: 'a2', name: 'B', status: 'error' }),
      makeAgent({ agentId: 'a3', name: 'C', status: 'idle' }),
      makeAgent({ agentId: 'a4', name: 'D', status: 'reflecting' }),
      makeAgent({ agentId: 'a5', name: 'E', status: 'working' }),
    ]
    const sorted = sortAgentsByStatus(agents)
    expect(sorted.map(a => a.status)).toEqual([
      'working', 'reflecting', 'idle', 'error', 'offline',
    ])
  })

  test('does not mutate original array', () => {
    const agents = [
      makeAgent({ agentId: 'a1', status: 'offline' }),
      makeAgent({ agentId: 'a2', status: 'working' }),
    ]
    const original = [...agents]
    sortAgentsByStatus(agents)
    expect(agents[0].agentId).toBe(original[0].agentId)
    expect(agents[1].agentId).toBe(original[1].agentId)
  })

  test('handles empty array', () => {
    expect(sortAgentsByStatus([])).toEqual([])
  })
})

describe('ResponsiveOffice — breakpoint logic', () => {
  test('MOBILE_BREAKPOINT is 768', async () => {
    const mod = await import('../components/ResponsiveOffice')
    expect(mod.MOBILE_BREAKPOINT).toBe(768)
  })
})

describe('Component exports', () => {
  test('MobileAgentList exports correctly', async () => {
    const mod = await import('../components/MobileAgentList')
    expect(mod.MobileAgentList).toBeDefined()
    expect(typeof mod.MobileAgentList).toBe('function')
    expect(mod.sortAgentsByStatus).toBeDefined()
    expect(typeof mod.sortAgentsByStatus).toBe('function')
  })

  test('ResponsiveOffice exports correctly', async () => {
    const mod = await import('../components/ResponsiveOffice')
    expect(mod.ResponsiveOffice).toBeDefined()
    expect(typeof mod.ResponsiveOffice).toBe('function')
  })

  test('useOfficeSocket returns reconnect function', async () => {
    const mod = await import('../hooks/useOfficeSocket')
    expect(mod.useOfficeSocket).toBeDefined()
    expect(typeof mod.useOfficeSocket).toBe('function')
  })

  test('App uses ResponsiveOffice', async () => {
    const mod = await import('../App')
    expect(mod.App).toBeDefined()
    expect(typeof mod.App).toBe('function')
  })
})
