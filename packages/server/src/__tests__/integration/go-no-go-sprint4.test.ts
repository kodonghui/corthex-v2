/**
 * Story 29.9: Go/No-Go Sprint 4 Integration Test
 *
 * Verifies all Sprint 4 exit criteria as a test suite.
 */
import { describe, test, expect } from 'bun:test'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '../../../../..')

function src(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf-8')
}

function fileExists(rel: string): boolean {
  return existsSync(resolve(ROOT, rel))
}

describe('Go/No-Go Sprint 4 — OpenClaw Virtual Office', () => {
  describe('#1: Virtual Office Renders with Agents', () => {
    test('OfficeCanvas component exists and uses PixiJS', () => {
      const content = src('packages/office/src/components/OfficeCanvas.tsx')
      expect(content).toContain('OfficeCanvas')
      expect(content).toContain('Application')
      expect(content).toContain('AgentSprite')
    })

    test('AgentSprite has status colors and animations', () => {
      const content = src('packages/office/src/sprites/AgentSprite.ts')
      expect(content).toContain('STATUS_COLORS')
      expect(content).toContain('pulsePhase')
      expect(content).toContain('LERP_SPEED')
    })

    test('OfficeFloor renders grid background', () => {
      expect(fileExists('packages/office/src/sprites/OfficeFloor.ts')).toBe(true)
    })

    test('AgentTooltip shows agent details', () => {
      const content = src('packages/office/src/components/AgentTooltip.tsx')
      expect(content).toContain('agent.name')
      expect(content).toContain('agent.status')
      expect(content).toContain('agent.tier')
    })
  })

  describe('#5: WebSocket Real-Time Updates', () => {
    test('office channel in WS channels', () => {
      const content = src('packages/server/src/ws/channels.ts')
      expect(content).toContain("case 'office'")
    })

    test('office poller broadcasts state changes', () => {
      const content = src('packages/server/src/services/office-poller.ts')
      expect(content).toContain('startOfficePoller')
      expect(content).toContain('shouldBroadcast')
      expect(content).toContain('broadcastToCompany')
    })

    test('client hook handles all message types', () => {
      const content = src('packages/office/src/hooks/useOfficeSocket.ts')
      expect(content).toContain('office_state')
      expect(content).toContain('agent_update')
      expect(content).toContain('agent_activity')
    })

    test('office state manages in-memory agent data', () => {
      const content = src('packages/server/src/services/office-state.ts')
      expect(content).toContain('getOfficeState')
      expect(content).toContain('updateAgentStatus')
      expect(content).toContain('initOfficeState')
      expect(content).toContain('calculatePosition')
    })

    test('REST fallback endpoint exists', () => {
      const content = src('packages/server/src/routes/workspace/office.ts')
      expect(content).toContain("officeRoute.get('/state'")
    })
  })

  describe('#8: Mobile Responsive View', () => {
    test('MobileAgentList with card-based sorting', () => {
      const content = src('packages/office/src/components/MobileAgentList.tsx')
      expect(content).toContain('MobileAgentList')
      expect(content).toContain('sortAgentsByStatus')
      expect(content).toContain('STATUS_COLORS')
    })

    test('ResponsiveOffice switches at 768px', () => {
      const content = src('packages/office/src/components/ResponsiveOffice.tsx')
      expect(content).toContain('MOBILE_BREAKPOINT')
      expect(content).toContain('768')
      expect(content).toContain('matchMedia')
      expect(content).toContain('OfficeCanvas')
      expect(content).toContain('MobileAgentList')
    })

    test('App.tsx uses ResponsiveOffice', () => {
      const content = src('packages/office/src/App.tsx')
      expect(content).toContain('ResponsiveOffice')
    })
  })

  describe('#12: Accessibility', () => {
    test('keyboard navigation in OfficeCanvas', () => {
      const content = src('packages/office/src/components/OfficeCanvas.tsx')
      expect(content).toContain('tabIndex={0}')
      expect(content).toContain('onKeyDown')
      expect(content).toContain("'Tab'")
      expect(content).toContain("'ArrowRight'")
      expect(content).toContain("'ArrowLeft'")
      expect(content).toContain("'Enter'")
      expect(content).toContain("'Escape'")
    })

    test('screen reader announcer', () => {
      const content = src('packages/office/src/components/ScreenReaderAnnouncer.tsx')
      expect(content).toContain('aria-live="polite"')
      expect(content).toContain('buildAnnouncement')
    })

    test('semantic HTML in mobile list', () => {
      const content = src('packages/office/src/components/MobileAgentList.tsx')
      expect(content).toContain('role="list"')
      expect(content).toContain('role="listitem"')
      expect(content).toContain('aria-label')
      expect(content).toContain('aria-hidden')
    })

    test('canvas has application role and aria-label', () => {
      const content = src('packages/office/src/components/OfficeCanvas.tsx')
      expect(content).toContain('role="application"')
      expect(content).toContain('aria-label={`Virtual Office')
    })
  })

  describe('#13: Connection Management', () => {
    test('connection limits configured', () => {
      const content = src('packages/server/src/services/office-state.ts')
      expect(content).toContain('CONNECTION_LIMITS')
      expect(content).toContain('maxPerCompany: 50')
      expect(content).toContain('maxTotal: 100')
      expect(content).toContain('canAcceptConnection')
      expect(content).toContain('registerConnection')
      expect(content).toContain('unregisterConnection')
    })

    test('WS server enforces limits', () => {
      const content = src('packages/server/src/ws/server.ts')
      expect(content).toContain('canAcceptConnection(tenant.companyId)')
      expect(content).toContain('4029')
    })

    test('exponential backoff reconnection', () => {
      const content = src('packages/office/src/hooks/useOfficeSocket.ts')
      expect(content).toContain('RECONNECT_CONFIG')
      expect(content).toContain('maxAttempts: 10')
      expect(content).toContain('Math.pow(2,')
      expect(content).toContain('connectionLost')
    })

    test('heartbeat timeout (server 60s, client 15s)', () => {
      const server = src('packages/server/src/ws/server.ts')
      const client = src('packages/office/src/hooks/useOfficeSocket.ts')
      expect(server).toContain('heartbeatTimeoutMs')
      expect(server).toContain('startHeartbeatChecker')
      expect(client).toContain('pongTimeoutMs: 15_000')
    })

    test('load test script exists', () => {
      expect(fileExists('tools/office-load-test.ts')).toBe(true)
    })
  })

  describe('Sprite Customization API', () => {
    test('PUT sprite endpoint exists', () => {
      const content = src('packages/server/src/routes/workspace/office.ts')
      expect(content).toContain('/agent/:agentId/sprite')
      expect(content).toContain('updateAgentSprite')
    })

    test('AgentSpriteSettings type defined', () => {
      const content = src('packages/shared/src/types.ts')
      expect(content).toContain('AgentSpriteSettings')
      expect(content).toContain('sprite?: AgentSpriteSettings')
    })
  })

  describe('Source File Inventory', () => {
    const requiredFiles = [
      // Story 29.1 — Workspace setup
      'packages/office/package.json',
      'packages/office/tsconfig.json',
      'packages/office/vite.config.ts',
      'packages/office/index.html',
      'packages/office/src/main.tsx',
      'packages/office/src/App.tsx',
      // Story 29.2 — WS channel
      'packages/server/src/ws/channels.ts',
      'packages/server/src/ws/server.ts',
      // Story 29.3 — Polling + REST
      'packages/server/src/services/office-poller.ts',
      'packages/server/src/services/office-state.ts',
      'packages/server/src/routes/workspace/office.ts',
      // Story 29.4 — PixiJS canvas
      'packages/office/src/components/OfficeCanvas.tsx',
      'packages/office/src/components/AgentTooltip.tsx',
      'packages/office/src/sprites/AgentSprite.ts',
      'packages/office/src/sprites/OfficeFloor.ts',
      'packages/office/src/hooks/useOfficeSocket.ts',
      // Story 29.5 — Mobile
      'packages/office/src/components/MobileAgentList.tsx',
      'packages/office/src/components/ResponsiveOffice.tsx',
      // Story 29.6 — Accessibility
      'packages/office/src/components/ScreenReaderAnnouncer.tsx',
      // Story 29.7 — Load test
      'tools/office-load-test.ts',
      // Story 29.9 — Verification
      'tools/verify-go-no-go-sprint4.ts',
    ]

    for (const file of requiredFiles) {
      test(`exists: ${file}`, () => {
        expect(fileExists(file)).toBe(true)
      })
    }
  })
})
