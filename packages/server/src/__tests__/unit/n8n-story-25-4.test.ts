import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'

/**
 * Story 25.4: CEO Workflow Results View & Admin n8n Editor
 * References: FR-N8N2, FR-N8N5, FR-N8N6, UXR119, UXR121
 *
 * Tests cover:
 * 1. Server: /n8n/health endpoint (FR-N8N5)
 * 2. Server: /n8n/executions endpoint (FR-N8N2)
 * 3. CEO app: n8n-workflows page (UXR119, UXR121)
 * 4. Admin app: n8n-editor page (FR-N8N6)
 * 5. Routing: both apps register routes
 * 6. Sidebar: both apps have navigation entries
 */

const readFile = (relPath: string) => fs.readFileSync(relPath, 'utf-8')

// === 1. Server: /n8n/health endpoint (FR-N8N5) ===

describe('25.4: FR-N8N5 — n8n health endpoint', () => {
  test('/n8n/health GET endpoint exists', () => {
    const src = readFile('packages/server/src/routes/admin/n8n-proxy.ts')
    expect(src).toContain("n8nProxyRoute.get('/n8n/health'")
  })

  test('calls checkN8nHealth()', () => {
    const src = readFile('packages/server/src/routes/admin/n8n-proxy.ts')
    const healthSection = src.slice(src.indexOf("'/n8n/health'"))
    expect(healthSection).toContain('checkN8nHealth()')
  })

  test('returns { success: true, data: health }', () => {
    const src = readFile('packages/server/src/routes/admin/n8n-proxy.ts')
    const healthSection = src.slice(src.indexOf("'/n8n/health'"), src.indexOf("'/n8n/health'") + 200)
    expect(healthSection).toContain('success: true')
    expect(healthSection).toContain('data: health')
  })
})

// === 2. Server: /n8n/executions endpoint (FR-N8N2) ===

describe('25.4: FR-N8N2 — n8n executions endpoint', () => {
  test('/n8n/executions GET endpoint exists', () => {
    const src = readFile('packages/server/src/routes/admin/n8n-proxy.ts')
    expect(src).toContain("n8nProxyRoute.get('/n8n/executions'")
  })

  test('injects company tag for tenant isolation', () => {
    const src = readFile('packages/server/src/routes/admin/n8n-proxy.ts')
    const execSection = src.slice(src.indexOf("'/n8n/executions'"))
    expect(execSection).toContain('injectCompanyTag(tenant.companyId, targetUrl)')
  })

  test('supports query filters: limit, cursor, status, workflowId', () => {
    const src = readFile('packages/server/src/routes/admin/n8n-proxy.ts')
    const execSection = src.slice(src.indexOf("'/n8n/executions'"))
    expect(execSection).toContain("c.req.query('limit')")
    expect(execSection).toContain("c.req.query('cursor')")
    expect(execSection).toContain("c.req.query('status')")
    expect(execSection).toContain("c.req.query('workflowId')")
  })

  test('returns 502 on n8n failure with N8N_UNAVAILABLE', () => {
    const src = readFile('packages/server/src/routes/admin/n8n-proxy.ts')
    const execSection = src.slice(src.indexOf("'/n8n/executions'"))
    expect(execSection).toContain('N8N_UNAVAILABLE')
    expect(execSection).toContain('502')
  })

  test('returns standard { success, data } format', () => {
    const src = readFile('packages/server/src/routes/admin/n8n-proxy.ts')
    const execSection = src.slice(src.indexOf("'/n8n/executions'"))
    expect(execSection).toContain('success: true, data')
  })
})

// === 3. CEO App: n8n-workflows page (UXR119, UXR121) ===

describe('25.4: CEO n8n-workflows page', () => {
  const pagePath = 'packages/app/src/pages/n8n-workflows.tsx'

  test('page file exists', () => {
    expect(fs.existsSync(pagePath)).toBe(true)
  })

  test('exports N8nWorkflowsPage component', () => {
    const src = readFile(pagePath)
    expect(src).toMatch(/export\s+function\s+N8nWorkflowsPage/)
  })

  test('UXR119: workflow list with active/inactive display', () => {
    const src = readFile(pagePath)
    expect(src).toContain('workflow.active')
    expect(src).toContain('활성')
    expect(src).toContain('비활성')
  })

  test('UXR119: shows last update date', () => {
    const src = readFile(pagePath)
    expect(src).toContain('updatedAt')
    expect(src).toContain('마지막 수정')
  })

  test('FR-N8N2: read-only execution results view', () => {
    const src = readFile(pagePath)
    expect(src).toContain('실행 결과')
    expect(src).toContain('ExecutionRow')
    expect(src).toContain('execution.status')
  })

  test('FR-N8N2: execution status display (success/error/running/waiting)', () => {
    const src = readFile(pagePath)
    expect(src).toContain("success:")
    expect(src).toContain("error:")
    expect(src).toContain("running:")
    expect(src).toContain("waiting:")
  })

  test('FR-N8N5: shows service suspended banner on n8n failure', () => {
    const src = readFile(pagePath)
    expect(src).toContain('ServiceSuspendedBanner')
    expect(src).toContain('워크플로우 서비스 일시 중단')
  })

  test('UXR121: error handling for API failures', () => {
    const src = readFile(pagePath)
    expect(src).toContain('wfError')
    expect(src).toContain('워크플로우 목록을 불러올 수 없습니다')
  })

  test('fetches from /admin/n8n endpoints', () => {
    const src = readFile(pagePath)
    expect(src).toContain("'/admin/n8n/health'")
    expect(src).toContain("'/admin/n8n/workflows'")
    expect(src).toContain('/admin/n8n/executions')
  })

  test('uses useQuery hooks for data fetching', () => {
    const src = readFile(pagePath)
    expect(src).toContain('useN8nHealth')
    expect(src).toContain('useN8nWorkflows')
    expect(src).toContain('useN8nExecutions')
  })

  test('health check auto-refreshes every 30s', () => {
    const src = readFile(pagePath)
    expect(src).toContain('refetchInterval: 30_000')
  })

  test('empty state: no workflows message', () => {
    const src = readFile(pagePath)
    expect(src).toContain('등록된 워크플로우가 없습니다')
  })

  test('empty state: no executions message', () => {
    const src = readFile(pagePath)
    expect(src).toContain('실행 기록이 없습니다')
  })

  test('displays execution duration', () => {
    const src = readFile(pagePath)
    expect(src).toContain('formatDuration')
  })

  test('Korean date formatting (ko-KR)', () => {
    const src = readFile(pagePath)
    expect(src).toContain("'ko-KR'")
  })
})

// === 4. Admin App: n8n-editor page (FR-N8N6) ===

describe('25.4: Admin n8n-editor page (FR-N8N6)', () => {
  const pagePath = 'packages/admin/src/pages/n8n-editor.tsx'

  test('page file exists', () => {
    expect(fs.existsSync(pagePath)).toBe(true)
  })

  test('exports N8nEditorPage component', () => {
    const src = readFile(pagePath)
    expect(src).toMatch(/export\s+function\s+N8nEditorPage/)
  })

  test('loads n8n editor in iframe', () => {
    const src = readFile(pagePath)
    expect(src).toContain('<iframe')
    expect(src).toContain('/api/admin/n8n-editor/')
  })

  test('iframe has security sandbox', () => {
    const src = readFile(pagePath)
    expect(src).toContain('sandbox=')
    expect(src).toContain('allow-same-origin')
    expect(src).toContain('allow-scripts')
  })

  test('health check monitors n8n availability', () => {
    const src = readFile(pagePath)
    expect(src).toContain('useN8nHealth')
    expect(src).toContain("'/admin/n8n/health'")
  })

  test('FR-N8N5: shows suspended state when n8n unavailable', () => {
    const src = readFile(pagePath)
    expect(src).toContain('워크플로우 서비스 일시 중단')
    expect(src).toContain('!isAvailable')
  })

  test('has refresh button', () => {
    const src = readFile(pagePath)
    expect(src).toContain('새로고침')
    expect(src).toContain('setIframeKey')
  })

  test('has open-in-new-tab link', () => {
    const src = readFile(pagePath)
    expect(src).toContain('새 탭')
    expect(src).toContain('target="_blank"')
  })

  test('shows n8n response time', () => {
    const src = readFile(pagePath)
    expect(src).toContain('responseTimeMs')
  })

  test('loading state shows spinner', () => {
    const src = readFile(pagePath)
    expect(src).toContain('isLoading')
    expect(src).toContain('animate-spin')
  })
})

// === 5. Routing: both apps register routes ===

describe('25.4: Route registration', () => {
  test('CEO app registers /n8n-workflows route', () => {
    const src = readFile('packages/app/src/App.tsx')
    expect(src).toContain('N8nWorkflowsPage')
    expect(src).toContain('path="n8n-workflows"')
  })

  test('Admin app registers /n8n-editor route', () => {
    const src = readFile('packages/admin/src/App.tsx')
    expect(src).toContain('N8nEditorPage')
    expect(src).toContain('path="n8n-editor"')
  })

  test('CEO app lazy-loads N8nWorkflowsPage', () => {
    const src = readFile('packages/app/src/App.tsx')
    expect(src).toContain("import('./pages/n8n-workflows')")
  })

  test('Admin app lazy-loads N8nEditorPage', () => {
    const src = readFile('packages/admin/src/App.tsx')
    expect(src).toContain("import('./pages/n8n-editor')")
  })
})

// === 6. Sidebar: both apps have navigation entries ===

describe('25.4: Sidebar navigation', () => {
  test('CEO sidebar has n8n 자동화 entry', () => {
    const src = readFile('packages/app/src/components/sidebar.tsx')
    expect(src).toContain("'/n8n-workflows'")
    expect(src).toContain('n8n 자동화')
  })

  test('Admin sidebar has n8n 에디터 entry', () => {
    const src = readFile('packages/admin/src/components/sidebar.tsx')
    expect(src).toContain("'/n8n-editor'")
    expect(src).toContain('n8n 에디터')
  })

  test('CEO sidebar uses Hexagon icon for n8n', () => {
    const src = readFile('packages/app/src/components/sidebar.tsx')
    expect(src).toContain('Hexagon')
  })

  test('Admin sidebar uses Hexagon icon for n8n', () => {
    const src = readFile('packages/admin/src/components/sidebar.tsx')
    expect(src).toContain('Hexagon')
  })
})
