import { describe, test, expect } from 'bun:test'
import type { AgentOfficeState, AgentOfficeStatus } from '@corthex/shared'
import { STATUS_COLORS, AgentSprite } from '../sprites/AgentSprite'
import { OfficeFloor } from '../sprites/OfficeFloor'

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

describe('STATUS_COLORS', () => {
  test('has all 5 status colors defined', () => {
    const statuses: AgentOfficeStatus[] = ['idle', 'working', 'reflecting', 'error', 'offline']
    for (const s of statuses) {
      expect(STATUS_COLORS[s]).toBeDefined()
      expect(typeof STATUS_COLORS[s]).toBe('number')
    }
  })

  test('idle is gray (0x6b7280)', () => {
    expect(STATUS_COLORS.idle).toBe(0x6b7280)
  })

  test('working is green (0x22c55e)', () => {
    expect(STATUS_COLORS.working).toBe(0x22c55e)
  })

  test('reflecting is blue (0x3b82f6)', () => {
    expect(STATUS_COLORS.reflecting).toBe(0x3b82f6)
  })

  test('error is red (0xef4444)', () => {
    expect(STATUS_COLORS.error).toBe(0xef4444)
  })

  test('offline is dark gray (0x374151)', () => {
    expect(STATUS_COLORS.offline).toBe(0x374151)
  })
})

describe('AgentSprite', () => {
  test('constructor sets agentId and initial position', () => {
    const agent = makeAgent({ agentId: 'test-123', position: { x: 50, y: 75 } })
    const sprite = new AgentSprite(agent)

    expect(sprite.agentId).toBe('test-123')
    expect(sprite.x).toBe(50)
    expect(sprite.y).toBe(75)
  })

  test('constructor stores agentState', () => {
    const agent = makeAgent({ name: 'Bravo', tier: 'T2' })
    const sprite = new AgentSprite(agent)

    expect(sprite.agentState.name).toBe('Bravo')
    expect(sprite.agentState.tier).toBe('T2')
  })

  test('is interactive (eventMode = static, cursor = pointer)', () => {
    const sprite = new AgentSprite(makeAgent())
    expect(sprite.eventMode).toBe('static')
    expect(sprite.cursor).toBe('pointer')
  })

  test('has children (circle, glow, initial, name, status labels)', () => {
    const sprite = new AgentSprite(makeAgent())
    // glowCircle, circle, initialLabel, nameLabel, statusLabel = 5 children
    expect(sprite.children.length).toBe(5)
  })

  test('update changes agentState and agentId', () => {
    const sprite = new AgentSprite(makeAgent())
    const updated = makeAgent({ agentId: 'agent-2', name: 'Charlie', status: 'working' })
    sprite.update(updated)

    expect(sprite.agentId).toBe('agent-2')
    expect(sprite.agentState.name).toBe('Charlie')
    expect(sprite.agentState.status).toBe('working')
  })

  test('update sets target position without immediately moving', () => {
    const sprite = new AgentSprite(makeAgent({ position: { x: 0, y: 0 } }))
    sprite.update(makeAgent({ position: { x: 500, y: 500 } }))

    // Position should not have jumped yet (lerp hasn't ticked)
    expect(sprite.x).toBe(0)
    expect(sprite.y).toBe(0)
  })

  test('tick lerps position toward target', () => {
    const sprite = new AgentSprite(makeAgent({ position: { x: 0, y: 0 } }))
    sprite.update(makeAgent({ position: { x: 100, y: 100 } }))

    // Tick several frames
    for (let i = 0; i < 50; i++) {
      sprite.tick(1)
    }

    // Should have moved closer to target (not exact due to lerp)
    expect(sprite.x).toBeGreaterThan(50)
    expect(sprite.y).toBeGreaterThan(50)
  })

  test('tick snaps to target when very close', () => {
    const sprite = new AgentSprite(makeAgent({ position: { x: 100, y: 100 } }))
    sprite.update(makeAgent({ position: { x: 100.3, y: 100.3 } }))

    sprite.tick(1)

    // Should snap since delta < 0.5
    expect(sprite.x).toBe(100.3)
    expect(sprite.y).toBe(100.3)
  })

  test('offline agents are dimmed (alpha = 0.5)', () => {
    const sprite = new AgentSprite(makeAgent({ status: 'idle' }))
    expect(sprite.alpha).toBe(1)

    sprite.update(makeAgent({ status: 'offline' }))
    expect(sprite.alpha).toBe(0.5)
  })

  test('getTooltipPosition returns position above sprite', () => {
    const sprite = new AgentSprite(makeAgent({ position: { x: 200, y: 300 } }))
    const pos = sprite.getTooltipPosition()
    // y should be above the sprite
    expect(pos.y).toBeLessThan(300)
  })
})

describe('OfficeFloor', () => {
  test('constructor accepts dimensions', () => {
    const floor = new OfficeFloor(1200, 800)
    expect(floor).toBeDefined()
    // Has background graphics child
    expect(floor.children.length).toBeGreaterThanOrEqual(1)
  })

  test('addDepartmentLabel adds a child', () => {
    const floor = new OfficeFloor(1200, 800)
    const before = floor.children.length
    floor.addDepartmentLabel('Engineering', 600, 400)
    expect(floor.children.length).toBe(before + 1)
  })

  test('resize updates floor', () => {
    const floor = new OfficeFloor(1200, 800)
    // Should not throw
    floor.resize(1600, 900)
    expect(floor.children.length).toBeGreaterThanOrEqual(1)
  })
})

describe('Component exports', () => {
  test('OfficeCanvas exports correctly', async () => {
    const mod = await import('../components/OfficeCanvas')
    expect(mod.OfficeCanvas).toBeDefined()
    expect(typeof mod.OfficeCanvas).toBe('function')
  })

  test('AgentTooltip exports correctly', async () => {
    const mod = await import('../components/AgentTooltip')
    expect(mod.AgentTooltip).toBeDefined()
    expect(typeof mod.AgentTooltip).toBe('function')
  })

  test('AgentSprite exports correctly', async () => {
    const mod = await import('../sprites/AgentSprite')
    expect(mod.AgentSprite).toBeDefined()
    expect(mod.STATUS_COLORS).toBeDefined()
  })

  test('OfficeFloor exports correctly', async () => {
    const mod = await import('../sprites/OfficeFloor')
    expect(mod.OfficeFloor).toBeDefined()
  })
})
