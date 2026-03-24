/**
 * Story 29.8: AI Sprite Approval & v1 Feature Parity Tests
 */
import { describe, test, expect, beforeEach } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  initOfficeState,
  getAgentState,
  clearOfficeState,
  updateAgentSprite,
} from '../../services/office-state'

const COMPANY_ID = 'test-co-29-8'

const mockAgents = [
  { id: 'agent-1', name: 'Alpha', tier: 'manager', departmentName: 'Engineering' },
  { id: 'agent-2', name: 'Bravo', tier: 'specialist' },
]

describe('Sprite Customization — office-state', () => {
  beforeEach(() => {
    clearOfficeState(COMPANY_ID)
    initOfficeState(COMPANY_ID, mockAgents)
  })

  test('updateAgentSprite sets color', () => {
    updateAgentSprite(COMPANY_ID, 'agent-1', { color: '#ff6b6b' })
    const agent = getAgentState(COMPANY_ID, 'agent-1')
    expect(agent?.sprite?.color).toBe('#ff6b6b')
  })

  test('updateAgentSprite sets icon', () => {
    updateAgentSprite(COMPANY_ID, 'agent-1', { icon: '🤖' })
    const agent = getAgentState(COMPANY_ID, 'agent-1')
    expect(agent?.sprite?.icon).toBe('🤖')
  })

  test('updateAgentSprite merges with existing sprite settings', () => {
    updateAgentSprite(COMPANY_ID, 'agent-1', { color: '#ff6b6b' })
    updateAgentSprite(COMPANY_ID, 'agent-1', { icon: '🤖' })
    const agent = getAgentState(COMPANY_ID, 'agent-1')
    expect(agent?.sprite?.color).toBe('#ff6b6b')
    expect(agent?.sprite?.icon).toBe('🤖')
  })

  test('updateAgentSprite overwrites existing field', () => {
    updateAgentSprite(COMPANY_ID, 'agent-1', { color: '#ff6b6b' })
    updateAgentSprite(COMPANY_ID, 'agent-1', { color: '#00ff00' })
    const agent = getAgentState(COMPANY_ID, 'agent-1')
    expect(agent?.sprite?.color).toBe('#00ff00')
  })

  test('updateAgentSprite is no-op for unknown agent', () => {
    updateAgentSprite(COMPANY_ID, 'nonexistent', { color: '#ff6b6b' })
    // Should not throw
  })

  test('updateAgentSprite is no-op for unknown company', () => {
    updateAgentSprite('unknown-company', 'agent-1', { color: '#ff6b6b' })
    // Should not throw
  })

  test('agent without sprite settings has undefined sprite', () => {
    const agent = getAgentState(COMPANY_ID, 'agent-2')
    expect(agent?.sprite).toBeUndefined()
  })
})

describe('Sprite API — Route Source', () => {
  const routeSrc = readFileSync(
    resolve(__dirname, '../../routes/workspace/office.ts'),
    'utf-8',
  )

  test('has PUT /agent/:agentId/sprite endpoint', () => {
    expect(routeSrc).toContain("officeRoute.put('/agent/:agentId/sprite'")
  })

  test('validates color format (#RRGGBB)', () => {
    expect(routeSrc).toContain('#[0-9a-fA-F]{6}')
  })

  test('validates icon length (max 10 chars)', () => {
    expect(routeSrc).toContain('icon.length > 10')
  })

  test('returns updated agent in response', () => {
    expect(routeSrc).toContain('data: { agent: updated }')
  })

  test('returns 404 for unknown agent', () => {
    expect(routeSrc).toContain('AGENT_NOT_FOUND')
  })

  test('imports updateAgentSprite', () => {
    expect(routeSrc).toContain('updateAgentSprite')
  })
})

describe('Shared Types — AgentSpriteSettings', () => {
  const typesSrc = readFileSync(
    resolve(__dirname, '../../../../shared/src/types.ts'),
    'utf-8',
  )

  test('AgentSpriteSettings type exists', () => {
    expect(typesSrc).toContain('AgentSpriteSettings')
  })

  test('AgentSpriteSettings has color field', () => {
    expect(typesSrc).toContain("color?: string")
  })

  test('AgentSpriteSettings has icon field', () => {
    expect(typesSrc).toContain("icon?: string")
  })

  test('AgentOfficeState includes sprite field', () => {
    expect(typesSrc).toContain('sprite?: AgentSpriteSettings')
  })
})

describe('v1 Feature Parity — Virtual Office', () => {
  // v1 did not have a dedicated virtual office feature.
  // These features are new in v3 but must cover the v1 real-time requirements.

  test('Real-time agent status visibility (29.2-29.4)', () => {
    const pollerSrc = readFileSync(
      resolve(__dirname, '../../services/office-poller.ts'),
      'utf-8',
    )
    expect(pollerSrc).toContain('office_state')
    expect(pollerSrc).toContain('broadcastToCompany')
  })

  test('Agent activity indicators (29.4)', () => {
    const spriteSrc = readFileSync(
      resolve(__dirname, '../../../../office/src/sprites/AgentSprite.ts'),
      'utf-8',
    )
    expect(spriteSrc).toContain('STATUS_COLORS')
    expect(spriteSrc).toContain('working')
    expect(spriteSrc).toContain('pulsePhase')
  })

  test('Mobile support (29.5)', () => {
    const mobileSrc = readFileSync(
      resolve(__dirname, '../../../../office/src/components/MobileAgentList.tsx'),
      'utf-8',
    )
    expect(mobileSrc).toContain('MobileAgentList')
    expect(mobileSrc).toContain('sortAgentsByStatus')
  })

  test('Accessibility (29.6)', () => {
    const canvasSrc = readFileSync(
      resolve(__dirname, '../../../../office/src/components/OfficeCanvas.tsx'),
      'utf-8',
    )
    expect(canvasSrc).toContain('role="application"')
    expect(canvasSrc).toContain('aria-label')
    expect(canvasSrc).toContain('ScreenReaderAnnouncer')
  })

  test('REST fallback for mobile clients', () => {
    const routeSrc = readFileSync(
      resolve(__dirname, '../../routes/workspace/office.ts'),
      'utf-8',
    )
    expect(routeSrc).toContain("officeRoute.get('/state'")
  })
})
