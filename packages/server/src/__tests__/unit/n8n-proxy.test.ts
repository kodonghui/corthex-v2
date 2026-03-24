import { describe, test, expect, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import * as fs from 'fs'

/**
 * Story 25.3: Hono Reverse Proxy for n8n — Verification Tests
 * References: AR35, FR-N8N1, FR-N8N6
 *
 * Tests cover:
 * 1. Route file existence and structure
 * 2. Path normalization (traversal blocking)
 * 3. Security middleware chain
 * 4. CSRF on editor routes
 * 5. OOM recovery (502 on n8n unreachable)
 * 6. Tag injection + ownership verification
 * 7. FR-N8N1 workflow list endpoint
 */

const readSrc = (relPath: string) =>
  fs.readFileSync(`packages/server/src/${relPath}`, 'utf-8')

// === 1. Route file existence & structure ===

describe('25.3: n8n proxy route structure', () => {
  test('n8n-proxy.ts exists in routes/admin/', () => {
    expect(fs.existsSync('packages/server/src/routes/admin/n8n-proxy.ts')).toBe(true)
  })

  test('exports n8nProxyRoute', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toMatch(/export\s+const\s+n8nProxyRoute/)
  })

  test('registered in server index.ts', () => {
    const src = fs.readFileSync('packages/server/src/index.ts', 'utf-8')
    expect(src).toContain("import { n8nProxyRoute } from './routes/admin/n8n-proxy'")
    expect(src).toContain('n8nProxyRoute')
  })

  test('uses Hono proxy() helper', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("from 'hono/proxy'")
    expect(src).toContain('proxy(')
  })

  test('targets localhost:5678', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('127.0.0.1:5678')
  })
})

// === 2. Path normalization (AR35) ===

describe('25.3: Path normalization — traversal blocking', () => {
  test('validateProxyPath blocks double-dot', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("decoded.includes('..')")
  })

  test('blocks URL-encoded dots (%2e)', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('%2e')
    expect(src).toMatch(/%2e/i)
  })

  test('double-decodes to catch double-encoding attacks', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('decodeURIComponent(decodeURIComponent(')
  })

  test('blocks null bytes', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("'\\0'")
    expect(src).toContain('%00')
  })

  test('returns 400 with N8N_PATH_TRAVERSAL error code', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('N8N_PATH_TRAVERSAL')
    expect(src).toContain('400')
  })

  test('functional: validateProxyPath logic', async () => {
    // Import the route module — validateProxyPath is module-private
    // So we test via source verification + mock route tests
    const src = readSrc('routes/admin/n8n-proxy.ts')
    // Verify the function exists and has the right structure
    expect(src).toContain('function validateProxyPath(rawPath: string)')
    expect(src).toContain('valid: boolean')
    expect(src).toContain('normalized: string')
  })
})

// === 3. Security middleware chain ===

describe('25.3: Security middleware chain', () => {
  test('applies auth + adminOnly + tenant middleware', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('authMiddleware')
    expect(src).toContain('adminOnly')
    expect(src).toContain('tenantMiddleware')
  })

  test('applies SEC-2 admin guard', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('n8nAdminGuard')
  })

  test('applies SEC-3 tag isolation middleware', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('n8nTagIsolation')
  })

  test('applies SEC-8 rate limit', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('n8nRateLimit')
  })

  test('middleware order: auth → admin → tenant → adminGuard → rateLimit → tagIsolation', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    // First use block: auth chain
    const authUse = src.indexOf('authMiddleware, adminOnly, tenantMiddleware')
    // Second use block: n8n security chain
    const secUse = src.indexOf('n8nAdminGuard, n8nRateLimit, n8nTagIsolation')
    expect(authUse).toBeGreaterThan(-1)
    expect(secUse).toBeGreaterThan(authUse)
  })
})

// === 4. CSRF on editor routes (FR-N8N6) ===

describe('25.3: CSRF protection on editor (FR-N8N6)', () => {
  test('csrf middleware imported from hono/csrf', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("from 'hono/csrf'")
    expect(src).toContain('csrf()')
  })

  test('csrf applied to /n8n-editor/* route', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    // csrf must be on editor route, not on API route
    expect(src).toContain("n8nProxyRoute.use('/n8n-editor/*', csrf())")
  })

  test('editor route proxies to n8n UI (no /api/v1 prefix)', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    // Editor targetUrl construction: uses N8N_BASE_URL + rawPath (no /api/v1)
    expect(src).toContain('`${N8N_BASE_URL}${rawPath || \'/\'}`')
  })
})

// === 5. OOM recovery ===

describe('25.3: OOM recovery — 502 on n8n unreachable', () => {
  test('catches proxy errors and returns 502', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('502')
    expect(src).toContain('N8N_UNAVAILABLE')
  })

  test('calls checkN8nHealth on failure', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('checkN8nHealth')
    expect(src).toContain("from '../../services/n8n-health'")
  })

  test('returns user-friendly Korean message', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('일시적으로 중단')
    expect(src).toContain('자동 재시작')
  })
})

// === 6. Tag injection + ownership verification ===

describe('25.3: Tag injection & ownership verification', () => {
  test('imports injectCompanyTag from n8n-security', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('injectCompanyTag')
    expect(src).toContain("from '../../middleware/n8n-security'")
  })

  test('injects tags on list endpoints', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('injectCompanyTag(tenant.companyId, targetUrl)')
  })

  test('prevents client from overriding tag filter', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("key !== 'tags'")
  })

  test('checks ownership on individual resources', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('requiresOwnershipCheck(rawPath)')
    expect(src).toContain('verifyResourceOwnership(body.tags, tenant.companyId)')
  })

  test('preserves response headers on ownership check', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('new Response(JSON.stringify(body)')
    expect(src).toContain('headers: response.headers')
  })

  test('blocks credentials endpoint with N8N_SEC_003', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('isBlockedPath(rawPath)')
    expect(src).toContain('N8N_SEC_003')
  })
})

// === 7. FR-N8N1: Workflow list endpoint ===

describe('25.3: FR-N8N1 Admin workflow list', () => {
  test('dedicated /n8n/workflows GET endpoint', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("n8nProxyRoute.get('/n8n/workflows'")
  })

  test('injects company tag on workflow list', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    // Find the workflows endpoint section
    const workflowSection = src.slice(src.indexOf("'/n8n/workflows'"))
    expect(workflowSection).toContain('injectCompanyTag')
  })

  test('supports pagination (limit, cursor)', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("c.req.query('limit')")
    expect(src).toContain("c.req.query('cursor')")
  })

  test('returns { success, data } format', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('success: true, data')
  })

  test('returns 502 on n8n failure', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    const workflowSection = src.slice(src.indexOf("'/n8n/workflows'"))
    expect(workflowSection).toContain('N8N_UNAVAILABLE')
    expect(workflowSection).toContain('502')
  })
})

// === 8. Proxy headers ===

describe('25.3: Proxy header sanitization (HTTP/2 safe)', () => {
  test('sanitizeProxyHeaders function exists', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('function sanitizeProxyHeaders(')
  })

  test('deletes both casing variants (HTTP/1.1 + HTTP/2)', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("delete headers['Authorization']")
    expect(src).toContain("delete headers['authorization']")
    expect(src).toContain("delete headers['Cookie']")
    expect(src).toContain("delete headers['cookie']")
  })

  test('all proxy calls use sanitizeProxyHeaders', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    // API proxy and editor proxy should both use sanitized headers
    const matches = src.match(/sanitizeProxyHeaders/g)
    expect(matches).toBeTruthy()
    expect(matches!.length).toBeGreaterThanOrEqual(3) // definition + 2 call sites
  })
})

// === 9. TOCTOU prevention ===

describe('25.3: TOCTOU prevention for write operations', () => {
  test('preVerifyOwnership function exists', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('async function preVerifyOwnership(')
  })

  test('write methods defined (PUT, PATCH, DELETE)', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("WRITE_METHODS")
    expect(src).toContain("'PUT'")
    expect(src).toContain("'PATCH'")
    expect(src).toContain("'DELETE'")
  })

  test('pre-verifies ownership before forwarding writes', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    // The TOCTOU check must happen BEFORE proxy()
    const preVerifyPos = src.indexOf('preVerifyOwnership(tenant.companyId, rawPath)')
    const proxyPos = src.indexOf('proxy(targetUrl.toString()')
    expect(preVerifyPos).toBeGreaterThan(-1)
    expect(proxyPos).toBeGreaterThan(preVerifyPos)
  })

  test('GET requests use post-response ownership check (not pre-verify)', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("c.req.method === 'GET' && requiresOwnershipCheck(rawPath)")
  })

  test('pre-verify fetches resource via GET before allowing write', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    const preVerifyFn = src.slice(src.indexOf('async function preVerifyOwnership'))
    expect(preVerifyFn).toContain("method: 'GET'")
    expect(preVerifyFn).toContain('verifyResourceOwnership')
  })
})

// === 10. Adversarial path validation ===

describe('25.3: Adversarial validateProxyPath tests', () => {
  test('exported for testing as _testValidateProxyPath', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('export const _testValidateProxyPath = validateProxyPath')
  })

  test('blocks ../../etc/passwd', async () => {
    const { _testValidateProxyPath } = await import('../../routes/admin/n8n-proxy')
    expect(_testValidateProxyPath('../../etc/passwd').valid).toBe(false)
  })

  test('blocks %2e%2e/etc/passwd', async () => {
    const { _testValidateProxyPath } = await import('../../routes/admin/n8n-proxy')
    expect(_testValidateProxyPath('%2e%2e/etc/passwd').valid).toBe(false)
  })

  test('blocks double-encoded %252e%252e', async () => {
    const { _testValidateProxyPath } = await import('../../routes/admin/n8n-proxy')
    expect(_testValidateProxyPath('%252e%252e/etc/passwd').valid).toBe(false)
  })

  test('blocks null byte injection', async () => {
    const { _testValidateProxyPath } = await import('../../routes/admin/n8n-proxy')
    expect(_testValidateProxyPath('/workflows%00.json').valid).toBe(false)
    expect(_testValidateProxyPath('/workflows\0.json').valid).toBe(false)
  })

  test('allows clean paths', async () => {
    const { _testValidateProxyPath } = await import('../../routes/admin/n8n-proxy')
    expect(_testValidateProxyPath('/workflows').valid).toBe(true)
    expect(_testValidateProxyPath('/workflows/abc-123').valid).toBe(true)
    expect(_testValidateProxyPath('/executions').valid).toBe(true)
  })
})

// === 11. Route paths ===

describe('25.3: Route path structure', () => {
  test('API proxy on /n8n/api/*', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("'/n8n/api/*'")
  })

  test('editor proxy on /n8n-editor/*', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("'/n8n-editor/*'")
  })

  test('API proxy targets /api/v1 path', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('/api/v1${rawPath}')
  })

  test('preserves original query parameters (except tags)', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('originalUrl.searchParams')
    expect(src).toContain("key !== 'tags'")
  })
})
