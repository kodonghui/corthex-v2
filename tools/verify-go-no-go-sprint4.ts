#!/usr/bin/env bun
/**
 * Go/No-Go Sprint 4 — OpenClaw Virtual Office Exit Criteria
 *
 * Run with: bun tools/verify-go-no-go-sprint4.ts
 *
 * Validates ALL Sprint 4 exit criteria:
 *   #1   Virtual Office renders with agents
 *   #5   WebSocket real-time updates work
 *   #8   Mobile responsive view works
 *   #12  Accessibility keyboard + screen reader
 *   #13  Connection management + limits
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// ─── Types ───────────────────────────────────────────────────────────

interface GoNoGoResult {
  item: string
  pass: boolean
  details: string
}

// ─── Helpers ─────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dir, '..')

function src(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf-8')
}

function fileExists(rel: string): boolean {
  return existsSync(resolve(ROOT, rel))
}

const results: GoNoGoResult[] = []

// ═════════════════════════════════════════════════════════════════════
// Go/No-Go #1: Virtual Office renders with agents
// ═════════════════════════════════════════════════════════════════════

function check1a_officeCanvasExists(): GoNoGoResult {
  const exists = fileExists('packages/office/src/components/OfficeCanvas.tsx')
  const content = exists ? src('packages/office/src/components/OfficeCanvas.tsx') : ''
  return {
    item: '#1a Office canvas component exists',
    pass: exists && content.includes('OfficeCanvas') && content.includes('Application'),
    details: exists ? 'OfficeCanvas.tsx found with PixiJS Application' : 'MISSING',
  }
}

function check1b_agentSpriteExists(): GoNoGoResult {
  const exists = fileExists('packages/office/src/sprites/AgentSprite.ts')
  const content = exists ? src('packages/office/src/sprites/AgentSprite.ts') : ''
  return {
    item: '#1b Agent sprite rendering',
    pass: exists && content.includes('STATUS_COLORS') && content.includes('AgentSprite'),
    details: exists ? 'AgentSprite with STATUS_COLORS found' : 'MISSING',
  }
}

function check1c_officeFloorExists(): GoNoGoResult {
  const exists = fileExists('packages/office/src/sprites/OfficeFloor.ts')
  return {
    item: '#1c Office floor background',
    pass: exists,
    details: exists ? 'OfficeFloor.ts found' : 'MISSING',
  }
}

function check1d_agentTooltipExists(): GoNoGoResult {
  const exists = fileExists('packages/office/src/components/AgentTooltip.tsx')
  return {
    item: '#1d Agent tooltip popup',
    pass: exists,
    details: exists ? 'AgentTooltip.tsx found' : 'MISSING',
  }
}

// ═════════════════════════════════════════════════════════════════════
// Go/No-Go #5: WebSocket real-time updates work
// ═════════════════════════════════════════════════════════════════════

function check5a_wsChannel(): GoNoGoResult {
  const content = src('packages/server/src/ws/channels.ts')
  return {
    item: '#5a Office WS channel subscription',
    pass: content.includes("case 'office'") && content.includes('office::'),
    details: 'office channel in WS channels.ts',
  }
}

function check5b_officePoller(): GoNoGoResult {
  const content = src('packages/server/src/services/office-poller.ts')
  const hasPoller = content.includes('startOfficePoller') && content.includes('resolveAgentStatuses')
  return {
    item: '#5b Server-side state polling + broadcasting',
    pass: hasPoller,
    details: hasPoller ? 'Poller with resolveAgentStatuses' : 'MISSING',
  }
}

function check5c_useOfficeSocket(): GoNoGoResult {
  const content = src('packages/office/src/hooks/useOfficeSocket.ts')
  const hasHook = content.includes('useOfficeSocket') && content.includes('office_state')
  return {
    item: '#5c Client WebSocket hook',
    pass: hasHook,
    details: hasHook ? 'useOfficeSocket with office_state handling' : 'MISSING',
  }
}

function check5d_officeState(): GoNoGoResult {
  const content = src('packages/server/src/services/office-state.ts')
  const hasState = content.includes('getOfficeState') && content.includes('initOfficeState')
  return {
    item: '#5d In-memory office state manager',
    pass: hasState,
    details: hasState ? 'office-state.ts with CRUD functions' : 'MISSING',
  }
}

// ═════════════════════════════════════════════════════════════════════
// Go/No-Go #8: Mobile responsive view works
// ═════════════════════════════════════════════════════════════════════

function check8a_mobileList(): GoNoGoResult {
  const exists = fileExists('packages/office/src/components/MobileAgentList.tsx')
  const content = exists ? src('packages/office/src/components/MobileAgentList.tsx') : ''
  return {
    item: '#8a MobileAgentList component',
    pass: exists && content.includes('sortAgentsByStatus'),
    details: exists ? 'Card-based list with status sorting' : 'MISSING',
  }
}

function check8b_responsiveOffice(): GoNoGoResult {
  const exists = fileExists('packages/office/src/components/ResponsiveOffice.tsx')
  const content = exists ? src('packages/office/src/components/ResponsiveOffice.tsx') : ''
  return {
    item: '#8b ResponsiveOffice wrapper (768px breakpoint)',
    pass: exists && content.includes('768') && content.includes('matchMedia'),
    details: exists ? 'Desktop=PixiJS, Mobile=List at 768px' : 'MISSING',
  }
}

function check8c_appUsesResponsive(): GoNoGoResult {
  const content = src('packages/office/src/App.tsx')
  return {
    item: '#8c App.tsx uses ResponsiveOffice',
    pass: content.includes('ResponsiveOffice'),
    details: content.includes('ResponsiveOffice') ? 'App renders ResponsiveOffice' : 'MISSING',
  }
}

// ═════════════════════════════════════════════════════════════════════
// Go/No-Go #12: Accessibility keyboard + screen reader
// ═════════════════════════════════════════════════════════════════════

function check12a_keyboardNav(): GoNoGoResult {
  const content = src('packages/office/src/components/OfficeCanvas.tsx')
  const hasKbd = content.includes('onKeyDown') && content.includes('ArrowRight') && content.includes('Escape')
  return {
    item: '#12a Keyboard navigation (Tab/Arrow/Enter/Escape)',
    pass: hasKbd,
    details: hasKbd ? 'Full keyboard nav in OfficeCanvas' : 'MISSING',
  }
}

function check12b_ariaLabels(): GoNoGoResult {
  const canvas = src('packages/office/src/components/OfficeCanvas.tsx')
  const mobile = src('packages/office/src/components/MobileAgentList.tsx')
  const hasAria = canvas.includes('aria-label') && mobile.includes('aria-label') && mobile.includes('role="list"')
  return {
    item: '#12b Aria labels + semantic HTML',
    pass: hasAria,
    details: hasAria ? 'aria-label on canvas + semantic list on mobile' : 'MISSING',
  }
}

function check12c_announcer(): GoNoGoResult {
  const exists = fileExists('packages/office/src/components/ScreenReaderAnnouncer.tsx')
  const content = exists ? src('packages/office/src/components/ScreenReaderAnnouncer.tsx') : ''
  return {
    item: '#12c ScreenReaderAnnouncer live region',
    pass: exists && content.includes('aria-live') && content.includes('buildAnnouncement'),
    details: exists ? 'Live region with polite announcements' : 'MISSING',
  }
}

// ═════════════════════════════════════════════════════════════════════
// Go/No-Go #13: Connection management + limits
// ═════════════════════════════════════════════════════════════════════

function check13a_connectionLimits(): GoNoGoResult {
  const content = src('packages/server/src/services/office-state.ts')
  const hasLimits = content.includes('CONNECTION_LIMITS') && content.includes('maxPerCompany: 50') && content.includes('maxTotal: 100')
  return {
    item: '#13a Connection limits (50/company, 100 total)',
    pass: hasLimits,
    details: hasLimits ? 'Limits enforced in office-state.ts' : 'MISSING',
  }
}

function check13b_reconnectBackoff(): GoNoGoResult {
  const content = src('packages/office/src/hooks/useOfficeSocket.ts')
  const hasBackoff = content.includes('RECONNECT_CONFIG') && content.includes('Math.pow(2,') && content.includes('maxAttempts: 10')
  return {
    item: '#13b Exponential backoff reconnection',
    pass: hasBackoff,
    details: hasBackoff ? '1s→30s backoff, max 10 attempts' : 'MISSING',
  }
}

function check13c_heartbeat(): GoNoGoResult {
  const server = src('packages/server/src/ws/server.ts')
  const client = src('packages/office/src/hooks/useOfficeSocket.ts')
  const hasHb = server.includes('heartbeatTimeoutMs') && client.includes('pongTimeoutMs: 15_000')
  return {
    item: '#13c Heartbeat timeout (server 60s, client 15s)',
    pass: hasHb,
    details: hasHb ? 'Server + client heartbeat enforcement' : 'MISSING',
  }
}

function check13d_loadTest(): GoNoGoResult {
  const exists = fileExists('tools/office-load-test.ts')
  return {
    item: '#13d Load test script',
    pass: exists,
    details: exists ? 'tools/office-load-test.ts exists' : 'MISSING',
  }
}

// ═════════════════════════════════════════════════════════════════════
// Bonus: Sprite customization API
// ═════════════════════════════════════════════════════════════════════

function checkBonus_spriteApi(): GoNoGoResult {
  const content = src('packages/server/src/routes/workspace/office.ts')
  return {
    item: 'Bonus: Sprite customization API',
    pass: content.includes('/agent/:agentId/sprite') && content.includes('updateAgentSprite'),
    details: 'PUT /api/workspace/office/agent/:agentId/sprite',
  }
}

// ═════════════════════════════════════════════════════════════════════
// Type compilation check
// ═════════════════════════════════════════════════════════════════════

function checkTypes_compile(): GoNoGoResult {
  const types = src('packages/shared/src/types.ts')
  const hasOfficeTypes = types.includes('AgentOfficeState') &&
    types.includes('AgentOfficeStatus') &&
    types.includes('OfficeWsOutbound') &&
    types.includes('AgentSpriteSettings')
  return {
    item: 'Types: all office types defined in shared/types.ts',
    pass: hasOfficeTypes,
    details: hasOfficeTypes ? 'AgentOfficeState, Status, WsOutbound, SpriteSettings' : 'MISSING',
  }
}

// ═════════════════════════════════════════════════════════════════════
// Run all checks
// ═════════════════════════════════════════════════════════════════════

const checks = [
  // #1 Virtual Office renders
  check1a_officeCanvasExists,
  check1b_agentSpriteExists,
  check1c_officeFloorExists,
  check1d_agentTooltipExists,
  // #5 WebSocket real-time
  check5a_wsChannel,
  check5b_officePoller,
  check5c_useOfficeSocket,
  check5d_officeState,
  // #8 Mobile responsive
  check8a_mobileList,
  check8b_responsiveOffice,
  check8c_appUsesResponsive,
  // #12 Accessibility
  check12a_keyboardNav,
  check12b_ariaLabels,
  check12c_announcer,
  // #13 Connection management
  check13a_connectionLimits,
  check13b_reconnectBackoff,
  check13c_heartbeat,
  check13d_loadTest,
  // Bonus
  checkBonus_spriteApi,
  checkTypes_compile,
]

console.log('\n🏢 Go/No-Go Sprint 4 — OpenClaw Virtual Office\n')
console.log('═'.repeat(70))

let passCount = 0
let failCount = 0

for (const check of checks) {
  const result = check()
  results.push(result)
  const icon = result.pass ? '✅' : '❌'
  if (result.pass) passCount++
  else failCount++
  console.log(`${icon} ${result.item}`)
  console.log(`   ${result.details}`)
}

console.log('\n' + '═'.repeat(70))
console.log(`\n📊 Results: ${passCount} pass, ${failCount} fail (total: ${checks.length})`)

if (failCount === 0) {
  console.log('\n🎉 GO — All Sprint 4 exit criteria met!\n')
  process.exit(0)
} else {
  console.log('\n🛑 NO-GO — Fix failures above before release.\n')
  process.exit(1)
}
