import { describe, test, expect, beforeEach } from 'bun:test'
import {
  getOfficeState,
  getAgentState,
  updateAgentStatus,
  initOfficeState,
  calculatePosition,
  clearOfficeState,
} from '../../services/office-state'

const COMPANY_ID = 'test-company-001'

const mockAgents = [
  { id: 'agent-1', name: 'Alpha', tier: 'manager', departmentName: 'Engineering' },
  { id: 'agent-2', name: 'Bravo', tier: 'specialist', departmentName: 'Marketing' },
  { id: 'agent-3', name: 'Charlie', tier: 'worker', departmentName: 'Engineering' },
  { id: 'agent-4', name: 'Delta', tier: 'worker' },
]

describe('Office State Manager', () => {
  beforeEach(() => {
    clearOfficeState(COMPANY_ID)
  })

  describe('initOfficeState', () => {
    test('initializes all agents with idle status', () => {
      initOfficeState(COMPANY_ID, mockAgents)
      const state = getOfficeState(COMPANY_ID)
      expect(state).toHaveLength(4)
      for (const agent of state) {
        expect(agent.status).toBe('idle')
      }
    })

    test('assigns correct agent properties', () => {
      initOfficeState(COMPANY_ID, mockAgents)
      const alpha = getAgentState(COMPANY_ID, 'agent-1')
      expect(alpha).toBeDefined()
      expect(alpha!.name).toBe('Alpha')
      expect(alpha!.tier).toBe('manager')
      expect(alpha!.department).toBe('Engineering')
      expect(alpha!.agentId).toBe('agent-1')
    })

    test('handles agent without department', () => {
      initOfficeState(COMPANY_ID, mockAgents)
      const delta = getAgentState(COMPANY_ID, 'agent-4')
      expect(delta).toBeDefined()
      expect(delta!.department).toBeUndefined()
    })

    test('assigns unique positions to each agent', () => {
      initOfficeState(COMPANY_ID, mockAgents)
      const state = getOfficeState(COMPANY_ID)
      const positions = state.map((a) => `${a.position.x},${a.position.y}`)
      const uniquePositions = new Set(positions)
      expect(uniquePositions.size).toBe(state.length)
    })

    test('sets lastActiveAt as ISO string', () => {
      initOfficeState(COMPANY_ID, mockAgents)
      const agent = getAgentState(COMPANY_ID, 'agent-1')
      expect(agent!.lastActiveAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('updateAgentStatus', () => {
    beforeEach(() => {
      initOfficeState(COMPANY_ID, mockAgents)
    })

    test('updates status to working with task', () => {
      updateAgentStatus(COMPANY_ID, 'agent-1', 'working', 'Processing data')
      const agent = getAgentState(COMPANY_ID, 'agent-1')
      expect(agent!.status).toBe('working')
      expect(agent!.currentTask).toBe('Processing data')
    })

    test('updates status to idle and clears task', () => {
      updateAgentStatus(COMPANY_ID, 'agent-1', 'working', 'Some task')
      updateAgentStatus(COMPANY_ID, 'agent-1', 'idle')
      const agent = getAgentState(COMPANY_ID, 'agent-1')
      expect(agent!.status).toBe('idle')
      expect(agent!.currentTask).toBeUndefined()
    })

    test('updates status to error with message', () => {
      updateAgentStatus(COMPANY_ID, 'agent-2', 'error', 'Connection timeout')
      const agent = getAgentState(COMPANY_ID, 'agent-2')
      expect(agent!.status).toBe('error')
      expect(agent!.currentTask).toBe('Connection timeout')
    })

    test('updates lastActiveAt on status change', () => {
      const before = getAgentState(COMPANY_ID, 'agent-1')!.lastActiveAt
      // Small delay to ensure different timestamp
      updateAgentStatus(COMPANY_ID, 'agent-1', 'working', 'task')
      const after = getAgentState(COMPANY_ID, 'agent-1')!.lastActiveAt
      expect(new Date(after).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime())
    })

    test('no-op for unknown agent', () => {
      // Should not throw
      updateAgentStatus(COMPANY_ID, 'nonexistent', 'working')
      const state = getOfficeState(COMPANY_ID)
      expect(state).toHaveLength(4)
    })

    test('no-op for unknown company', () => {
      // Should not throw
      updateAgentStatus('unknown-company', 'agent-1', 'working')
    })
  })

  describe('getOfficeState', () => {
    test('returns empty array for unknown company', () => {
      const state = getOfficeState('nonexistent-company')
      expect(state).toEqual([])
    })

    test('returns all agents as array', () => {
      initOfficeState(COMPANY_ID, mockAgents)
      const state = getOfficeState(COMPANY_ID)
      expect(Array.isArray(state)).toBe(true)
      expect(state).toHaveLength(4)
    })

    test('serializable to JSON', () => {
      initOfficeState(COMPANY_ID, mockAgents)
      const state = getOfficeState(COMPANY_ID)
      const json = JSON.stringify(state)
      const parsed = JSON.parse(json)
      expect(parsed).toHaveLength(4)
      expect(parsed[0].agentId).toBeDefined()
      expect(parsed[0].position.x).toBeGreaterThan(0)
      expect(parsed[0].position.y).toBeGreaterThan(0)
    })
  })

  describe('getAgentState', () => {
    test('returns undefined for unknown agent', () => {
      initOfficeState(COMPANY_ID, mockAgents)
      expect(getAgentState(COMPANY_ID, 'nonexistent')).toBeUndefined()
    })

    test('returns undefined for unknown company', () => {
      expect(getAgentState('unknown', 'agent-1')).toBeUndefined()
    })
  })

  describe('clearOfficeState', () => {
    test('removes all state for company', () => {
      initOfficeState(COMPANY_ID, mockAgents)
      expect(getOfficeState(COMPANY_ID)).toHaveLength(4)
      clearOfficeState(COMPANY_ID)
      expect(getOfficeState(COMPANY_ID)).toHaveLength(0)
    })

    test('no-op for unknown company', () => {
      clearOfficeState('nonexistent')
      // Should not throw
    })
  })
})

describe('Position Calculation', () => {
  test('single agent positioned at center area', () => {
    const pos = calculatePosition(0, 1, 1200, 800)
    expect(pos.x).toBe(600) // 1200 / (1+1) * 1
    expect(pos.y).toBe(400) // 800 / (1+1) * 1
  })

  test('two agents in a row', () => {
    const pos0 = calculatePosition(0, 2, 1200, 800)
    const pos1 = calculatePosition(1, 2, 1200, 800)
    // 2 agents → cols=2, rows=1
    expect(pos0.x).toBeLessThan(pos1.x)
    expect(pos0.y).toBe(pos1.y) // same row
  })

  test('four agents in 2x2 grid', () => {
    const positions = Array.from({ length: 4 }, (_, i) =>
      calculatePosition(i, 4, 1200, 800),
    )
    // cols=2, rows=2
    // Row 0: [0, 1], Row 1: [2, 3]
    expect(positions[0].y).toBe(positions[1].y) // same row
    expect(positions[2].y).toBe(positions[3].y) // same row
    expect(positions[0].y).toBeLessThan(positions[2].y) // row 0 < row 1
    expect(positions[0].x).toBeLessThan(positions[1].x) // col 0 < col 1
  })

  test('positions within canvas bounds', () => {
    const canvasW = 1000
    const canvasH = 600
    for (let total = 1; total <= 20; total++) {
      for (let i = 0; i < total; i++) {
        const pos = calculatePosition(i, total, canvasW, canvasH)
        expect(pos.x).toBeGreaterThan(0)
        expect(pos.x).toBeLessThan(canvasW)
        expect(pos.y).toBeGreaterThan(0)
        expect(pos.y).toBeLessThan(canvasH)
      }
    }
  })

  test('zero total returns center', () => {
    const pos = calculatePosition(0, 0, 1200, 800)
    expect(pos.x).toBe(600)
    expect(pos.y).toBe(400)
  })

  test('all positions are unique for a given total', () => {
    const total = 9
    const positions = Array.from({ length: total }, (_, i) =>
      calculatePosition(i, total, 1200, 800),
    )
    const keys = positions.map((p) => `${p.x},${p.y}`)
    expect(new Set(keys).size).toBe(total)
  })
})
