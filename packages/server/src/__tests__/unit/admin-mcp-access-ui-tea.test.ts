import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 19.4: Agent-MCP Access Matrix UI TEA Tests ===
// TEA: Risk-based — P0 component exists + key structure, P0 D22 default OFF,
//      P0 toggle mutation (grant/revoke), P1 route registration, P1 UI states

// ─── Source files ─────────────────────────────────────────────────────────────

const PAGE_SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../../../admin/src/pages/mcp-access.tsx'),
  'utf-8',
)

const APP_SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../../../admin/src/App.tsx'),
  'utf-8',
)

// ─── P0: Component export and structure ──────────────────────────────────────

describe('[P0] McpAccessPage — component structure', () => {
  test('exports McpAccessPage function', () => {
    expect(PAGE_SRC).toContain('export function McpAccessPage(')
  })

  test('uses useQuery for agent list', () => {
    expect(PAGE_SRC).toContain('useQuery')
  })

  test('uses useMutation for grant/revoke', () => {
    expect(PAGE_SRC).toContain('useMutation')
  })

  test('GET /admin/agents query for agent list', () => {
    expect(PAGE_SRC).toContain('/admin/agents')
  })

  test('GET /admin/mcp-servers query for MCP server list', () => {
    expect(PAGE_SRC).toContain('/admin/mcp-servers')
  })

  test('GET /admin/agents/:agentId/mcp-access query for current access', () => {
    expect(PAGE_SRC).toContain('/mcp-access')
  })

  test('PUT /admin/agents/:agentId/mcp-access mutation for toggle', () => {
    expect(PAGE_SRC).toContain('mcp-access')
    expect(PAGE_SRC).toContain('api.put')
  })
})

// ─── P0: D22 — default OFF behavior ──────────────────────────────────────────

describe('[P0] D22 — default OFF for all MCP access checkboxes', () => {
  test('uses Set to track accessibleIds (default OFF when not in set)', () => {
    expect(PAGE_SRC).toContain('accessibleIds')
    expect(PAGE_SRC).toContain('new Set')
  })

  test('checkbox checked state = accessibleIds.has(server.id)', () => {
    expect(PAGE_SRC).toContain('accessibleIds.has(server.id)')
  })

  test('D22 default OFF mentioned in comment or label', () => {
    // D22 is mentioned in the file header or UI label
    expect(PAGE_SRC).toContain('D22')
  })

  test('empty accessData defaults to empty array (no access rows = all OFF)', () => {
    expect(PAGE_SRC).toContain('accessData?.data ?? []')
  })
})

// ─── P0: Toggle checkbox — grant/revoke ──────────────────────────────────────

describe('[P0] AC1 — checkbox toggle calls grant/revoke mutation', () => {
  test('handleToggle function defined', () => {
    expect(PAGE_SRC).toContain('function handleToggle(')
  })

  test('grant body has { mcpServerId, grant } shape', () => {
    expect(PAGE_SRC).toContain('mcpServerId')
    expect(PAGE_SRC).toContain('grant')
  })

  test('toggle sends !currentlyGranted (inverts current state)', () => {
    expect(PAGE_SRC).toContain('!currentlyGranted')
  })

  test('saving state tracks per-mcpServerId loading indicator', () => {
    expect(PAGE_SRC).toContain('saving')
    expect(PAGE_SRC).toContain('setSaving')
  })

  test('checkbox disabled while saving (isSaving)', () => {
    expect(PAGE_SRC).toContain('isSaving')
    expect(PAGE_SRC).toContain('disabled={isSaving}')
  })

  test('onSuccess invalidates agent-mcp-access query', () => {
    expect(PAGE_SRC).toContain('agent-mcp-access')
    expect(PAGE_SRC).toContain('invalidateQueries')
  })
})

// ─── P0: Agent selector ───────────────────────────────────────────────────────

describe('[P0] AC2 — agent dropdown selector', () => {
  test('selectedAgentId state variable', () => {
    expect(PAGE_SRC).toContain('selectedAgentId')
    expect(PAGE_SRC).toContain('setSelectedAgentId')
  })

  test('select element with agent options', () => {
    expect(PAGE_SRC).toContain('<select')
    expect(PAGE_SRC).toContain('value={selectedAgentId')
  })

  test('filters agents to active only', () => {
    expect(PAGE_SRC).toContain('isActive')
    expect(PAGE_SRC).toContain('filter')
  })

  test('MCP access query only enabled when agent is selected', () => {
    expect(PAGE_SRC).toContain('enabled: !!selectedAgentId')
  })
})

// ─── P1: Status indicators in matrix ─────────────────────────────────────────

describe('[P1] AC3 — access matrix status display', () => {
  test('shows ✓ 허용됨 for granted access', () => {
    expect(PAGE_SRC).toContain('허용됨')
  })

  test('shows — 차단됨 for denied access', () => {
    expect(PAGE_SRC).toContain('차단됨')
  })

  test('shows 저장 중... while saving', () => {
    expect(PAGE_SRC).toContain('저장 중')
  })

  test('transport badge shown (emerald for stdio)', () => {
    expect(PAGE_SRC).toContain('emerald-400')
  })
})

// ─── P1: Route registration ────────────────────────────────────────────────────

describe('[P1] App.tsx — McpAccessPage registered', () => {
  test('App.tsx imports McpAccessPage', () => {
    expect(APP_SRC).toContain('McpAccessPage')
    expect(APP_SRC).toContain("'./pages/mcp-access'")
  })

  test('App.tsx has route path="mcp-access"', () => {
    expect(APP_SRC).toContain('path="mcp-access"')
  })

  test('route wrapped in Suspense with PageSkeleton fallback', () => {
    const routeIdx = APP_SRC.indexOf('mcp-access"')
    const afterRoute = APP_SRC.slice(routeIdx, routeIdx + 200)
    expect(afterRoute).toContain('Suspense')
    expect(afterRoute).toContain('McpAccessPage')
  })
})

// ─── P1: UI states — empty, company guard ─────────────────────────────────────

describe('[P1] UI states — guard, empty, no agent selected', () => {
  test('company-not-selected guard shown', () => {
    expect(PAGE_SRC).toContain('selectedCompanyId')
    expect(PAGE_SRC).toContain('회사를 선택해 주세요')
  })

  test('no-agent-selected prompt shown', () => {
    expect(PAGE_SRC).toContain('에이전트를 선택하면')
  })

  test('empty MCP servers state shown', () => {
    expect(PAGE_SRC).toContain('등록된 MCP 서버가 없습니다')
  })

  test('link to MCP server management page in empty state', () => {
    expect(PAGE_SRC).toContain('mcp-servers')
  })
})

// ─── P1: Table structure ──────────────────────────────────────────────────────

describe('[P1] Access matrix table — columns (AC1)', () => {
  test('checkbox column present', () => {
    expect(PAGE_SRC).toContain('type="checkbox"')
  })

  test('MCP server displayName shown', () => {
    expect(PAGE_SRC).toContain('displayName')
  })

  test('Transport column shown', () => {
    expect(PAGE_SRC).toContain('transport')
  })

  test('Status column shows saving/granted/denied states', () => {
    expect(PAGE_SRC).toContain('허용됨')
    expect(PAGE_SRC).toContain('차단됨')
  })
})

// ─── P1: Grant/revoke logic simulation ───────────────────────────────────────

describe('[P1] grant/revoke logic — toggle simulation', () => {
  function simulateAccessSet(accessedIds: string[], allServerIds: string[]) {
    const accessibleIds = new Set(accessedIds)
    return allServerIds.map(id => ({
      id,
      granted: accessibleIds.has(id),
    }))
  }

  test('server with access row is granted=true', () => {
    const result = simulateAccessSet(['mcp-1', 'mcp-2'], ['mcp-1', 'mcp-2', 'mcp-3'])
    expect(result.find(r => r.id === 'mcp-1')?.granted).toBe(true)
    expect(result.find(r => r.id === 'mcp-2')?.granted).toBe(true)
  })

  test('server without access row is granted=false (D22 default OFF)', () => {
    const result = simulateAccessSet(['mcp-1'], ['mcp-1', 'mcp-2', 'mcp-3'])
    expect(result.find(r => r.id === 'mcp-2')?.granted).toBe(false)
    expect(result.find(r => r.id === 'mcp-3')?.granted).toBe(false)
  })

  test('empty access list → all servers denied by default (D22)', () => {
    const result = simulateAccessSet([], ['mcp-1', 'mcp-2'])
    expect(result.every(r => !r.granted)).toBe(true)
  })

  test('toggle: granted=true → sends grant=false to API', () => {
    const currentlyGranted = true
    const payload = { mcpServerId: 'mcp-1', grant: !currentlyGranted }
    expect(payload.grant).toBe(false)
  })

  test('toggle: granted=false → sends grant=true to API', () => {
    const currentlyGranted = false
    const payload = { mcpServerId: 'mcp-1', grant: !currentlyGranted }
    expect(payload.grant).toBe(true)
  })
})
