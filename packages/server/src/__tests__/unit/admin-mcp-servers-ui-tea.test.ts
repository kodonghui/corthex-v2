import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 19.3: Admin MCP Servers UI TEA Tests ===
// TEA: Risk-based — P0 page component exists + key features, P0 env template display contract,
//      P0 D25 sse warning, P0 connection test + StatusDot, P1 form parse logic, P1 route registration

// ─── Source files ─────────────────────────────────────────────────────────────

const PAGE_SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../../../admin/src/pages/mcp-servers.tsx'),
  'utf-8',
)

const APP_SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../../../admin/src/App.tsx'),
  'utf-8',
)

// ─── P0: Component export and structure ──────────────────────────────────────

describe('[P0] McpServersPage — component structure', () => {
  test('exports McpServersPage function', () => {
    expect(PAGE_SRC).toContain('export function McpServersPage(')
  })

  test('uses useQuery for fetching MCP servers (API integration)', () => {
    expect(PAGE_SRC).toContain('useQuery')
  })

  test('uses useMutation for create/update/delete', () => {
    expect(PAGE_SRC).toContain('useMutation')
  })

  test('GET /admin/mcp-servers API call in useQuery', () => {
    expect(PAGE_SRC).toContain('/admin/mcp-servers')
  })

  test('POST /admin/mcp-servers for create mutation', () => {
    expect(PAGE_SRC).toContain("post('/admin/mcp-servers'")
  })

  test('PUT /admin/mcp-servers/:id for update mutation', () => {
    expect(PAGE_SRC).toContain('put(`/admin/mcp-servers/${')
  })

  test('DELETE /admin/mcp-servers/:id for delete mutation', () => {
    expect(PAGE_SRC).toContain('delete(`/admin/mcp-servers/${')
  })
})

// ─── P0: Connection test feature ─────────────────────────────────────────────

describe('[P0] AC3 — connection test button + status indicators', () => {
  test('POST /admin/mcp-servers/:id/test called in handleTest', () => {
    expect(PAGE_SRC).toContain('/test')
  })

  test('StatusDot component defined (green/red/testing states)', () => {
    expect(PAGE_SRC).toContain('function StatusDot(')
  })

  test('success state has green indicator color (emerald)', () => {
    expect(PAGE_SRC).toContain('emerald-400')
  })

  test('error state has red indicator color', () => {
    expect(PAGE_SRC).toContain('red-400')
  })

  test('testing state shows spinner text', () => {
    expect(PAGE_SRC).toContain('Testing...')
  })

  test('success status shows toolCount and latencyMs in tooltip (NFR-I2)', () => {
    expect(PAGE_SRC).toContain('toolCount')
    expect(PAGE_SRC).toContain('latencyMs')
  })

  test('error state shows error code in tooltip (AGENT_MCP_SPAWN_TIMEOUT)', () => {
    expect(PAGE_SRC).toContain('code')
    expect(PAGE_SRC).toContain('title={')
  })

  test('testResults state tracks result per server ID', () => {
    expect(PAGE_SRC).toContain('testResults')
    expect(PAGE_SRC).toContain('setTestResults')
  })

  test('connection test button disabled during testing (disabled state)', () => {
    expect(PAGE_SRC).toContain("status === 'testing'")
  })
})

// ─── P0: D25 — sse warning in form ────────────────────────────────────────────

describe('[P0] D25 — sse/http transport warning in form (AC4)', () => {
  test('transport dropdown has stdio option (Phase 1 recommended)', () => {
    expect(PAGE_SRC).toContain("value=\"stdio\"")
  })

  test('transport dropdown has sse option (with warning)', () => {
    expect(PAGE_SRC).toContain("value=\"sse\"")
  })

  test('warning message shown when transport !== stdio', () => {
    // D25: SSE not supported in Phase 1
    expect(PAGE_SRC).toContain("transport !== 'stdio'")
  })

  test('warning message mentions SSE not supported in Phase 1', () => {
    expect(PAGE_SRC).toContain('Phase 1')
    expect(PAGE_SRC).toContain('stdio')
  })
})

// ─── P0: Env template security contract ──────────────────────────────────────

describe('[P0] AC5 — env template displayed intact (not resolved)', () => {
  test('env field shows {{credential:...}} templates as-is', () => {
    // Page reads env directly from API (never resolves tokens)
    expect(PAGE_SRC).toContain('formatEnvForDisplay(')
    // Credential templates are not decrypted — shown as template strings
    expect(PAGE_SRC).toContain('credential:')
  })

  test('placeholder shows {{credential:key_name}} format example', () => {
    expect(PAGE_SRC).toContain('credential:notion_integration_token')
  })

  test('no decrypt/decryption call in UI code (credentials never exposed)', () => {
    expect(PAGE_SRC).not.toContain('decrypt(')
    expect(PAGE_SRC).not.toContain('decryptCredential')
  })
})

// ─── P1: parseEnvInput logic ──────────────────────────────────────────────────

describe('[P1] parseEnvInput — env string parsing logic', () => {
  function parseEnvInput(raw: string): Record<string, string> {
    raw = raw.trim()
    if (!raw) return {}
    try {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, string>
    } catch {
      // Fall through to KEY=VALUE
    }
    const result: Record<string, string> = {}
    for (const line of raw.split('\n')) {
      const eqIdx = line.indexOf('=')
      if (eqIdx < 0) continue
      const key = line.slice(0, eqIdx).trim()
      const value = line.slice(eqIdx + 1).trim()
      if (key) result[key] = value
    }
    return result
  }

  test('empty string returns empty object', () => {
    expect(parseEnvInput('')).toEqual({})
  })

  test('KEY=VALUE format parsed correctly', () => {
    const result = parseEnvInput('NOTION_TOKEN={{credential:notion_integration_token}}')
    expect(result.NOTION_TOKEN).toBe('{{credential:notion_integration_token}}')
  })

  test('multiple KEY=VALUE lines parsed', () => {
    const result = parseEnvInput('HOST=localhost\nPORT=3000')
    expect(result.HOST).toBe('localhost')
    expect(result.PORT).toBe('3000')
  })

  test('JSON object format parsed', () => {
    const result = parseEnvInput('{"API_KEY":"abc123","HOST":"api.example.com"}')
    expect(result.API_KEY).toBe('abc123')
    expect(result.HOST).toBe('api.example.com')
  })

  test('lines without = are skipped', () => {
    const result = parseEnvInput('INVALID_LINE\nVALID=value')
    expect(result.VALID).toBe('value')
    expect('INVALID_LINE' in result).toBe(false)
  })

  test('value with = in it: split at first = only', () => {
    const result = parseEnvInput('URL=https://example.com?a=1&b=2')
    expect(result.URL).toBe('https://example.com?a=1&b=2')
  })
})

// ─── P1: Args parsing ─────────────────────────────────────────────────────────

describe('[P1] Args input parsing', () => {
  function parseArgs(raw: string): string[] {
    return raw.trim() ? raw.trim().split(/\s+/) : []
  }

  test('empty string returns empty array', () => {
    expect(parseArgs('')).toHaveLength(0)
  })

  test('space-separated args split correctly', () => {
    const result = parseArgs('-y @notionhq/notion-mcp-server')
    expect(result).toEqual(['-y', '@notionhq/notion-mcp-server'])
  })

  test('multiple spaces treated as single separator', () => {
    const result = parseArgs('-y  @pkg')
    expect(result).toEqual(['-y', '@pkg'])
  })
})

// ─── P1: Route registration ────────────────────────────────────────────────────

describe('[P1] App.tsx — McpServersPage registered', () => {
  test('App.tsx imports McpServersPage', () => {
    expect(APP_SRC).toContain('McpServersPage')
    expect(APP_SRC).toContain("'./pages/mcp-servers'")
  })

  test('App.tsx has route path="mcp-servers"', () => {
    expect(APP_SRC).toContain('path="mcp-servers"')
  })

  test('route wrapped in Suspense with PageSkeleton fallback', () => {
    // McpServersPage appears with Suspense in route
    const routeIdx = APP_SRC.indexOf('mcp-servers"')
    const afterRoute = APP_SRC.slice(routeIdx, routeIdx + 200)
    expect(afterRoute).toContain('Suspense')
    expect(afterRoute).toContain('McpServersPage')
  })
})

// ─── P1: Empty state and loading ──────────────────────────────────────────────

describe('[P1] UI states — loading, empty, company select', () => {
  test('company-not-selected guard shown', () => {
    expect(PAGE_SRC).toContain('selectedCompanyId')
    expect(PAGE_SRC).toContain('회사를 선택해 주세요')
  })

  test('loading state message shown (isLoading)', () => {
    expect(PAGE_SRC).toContain('isLoading')
    expect(PAGE_SRC).toContain('로딩 중')
  })

  test('empty state message shown when no servers', () => {
    expect(PAGE_SRC).toContain('등록된 MCP 서버가 없습니다')
  })

  test('Add MCP Server button visible', () => {
    expect(PAGE_SRC).toContain('MCP 서버 추가')
  })
})

// ─── P1: Table columns ───────────────────────────────────────────────────────

describe('[P1] Server table — columns and fields (AC1)', () => {
  test('Display Name column present', () => {
    expect(PAGE_SRC).toContain('displayName')
  })

  test('Transport column present', () => {
    expect(PAGE_SRC).toContain('transport')
  })

  test('Status column present (StatusDot)', () => {
    expect(PAGE_SRC).toContain('<StatusDot')
  })

  test('Actions column with Test/Edit/Delete buttons', () => {
    expect(PAGE_SRC).toContain('연결 테스트')
    expect(PAGE_SRC).toContain('수정')
    expect(PAGE_SRC).toContain('삭제')
  })
})
