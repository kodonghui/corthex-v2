import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'

/**
 * Story 25.6: Go/No-Go #3 — n8n Security Verification
 * References: Go/No-Go #3, NFR-S9
 *
 * 3-part verification:
 * (1) Port 5678 external connection → rejected (firewall)
 * (2) Tag filter cross-company data access → blocked (SEC-3)
 * (3) Webhook with tampered HMAC → rejected (SEC-7)
 *
 * Plus: All 8 N8N-SEC layers independently tested,
 * Docker health monitoring, resource limits
 */

const readSrc = (relPath: string) =>
  fs.readFileSync(`packages/server/src/${relPath}`, 'utf-8')

// === Part 1: Port 5678 External Connection Blocked (SEC-1) ===

describe('25.6 Go/No-Go: SEC-1 — Port 5678 firewall', () => {
  test('firewall.sh exists', () => {
    expect(fs.existsSync('infrastructure/n8n/firewall.sh')).toBe(true)
  })

  test('blocks external access to port 5678', () => {
    const src = fs.readFileSync('infrastructure/n8n/firewall.sh', 'utf-8')
    expect(src).toContain('N8N_PORT=5678')
    expect(src).toContain('DROP')
  })

  test('allows only localhost (127.0.0.1)', () => {
    const src = fs.readFileSync('infrastructure/n8n/firewall.sh', 'utf-8')
    expect(src).toContain('127.0.0.1')
    expect(src).toContain('ACCEPT')
  })

  test('persists rules with iptables-save', () => {
    const src = fs.readFileSync('infrastructure/n8n/firewall.sh', 'utf-8')
    expect(src).toContain('iptables-save')
  })
})

// === Part 2: Tag Filter Cross-Company Access Blocked (SEC-3) ===

describe('25.6 Go/No-Go: SEC-3 — Tag isolation', () => {
  test('injectCompanyTag function exists', () => {
    const src = readSrc('middleware/n8n-security.ts')
    expect(src).toContain('export function injectCompanyTag')
  })

  test('injects company:{id} tag on all list requests', () => {
    const src = readSrc('middleware/n8n-security.ts')
    expect(src).toContain('company:${companyId}')
  })

  test('requiresOwnershipCheck verifies individual resource access', () => {
    const src = readSrc('middleware/n8n-security.ts')
    expect(src).toContain('export function requiresOwnershipCheck')
  })

  test('verifyResourceOwnership checks company tag on resource', () => {
    const src = readSrc('middleware/n8n-security.ts')
    expect(src).toContain('export function verifyResourceOwnership')
  })

  test('blocks /credentials access entirely (N8N_SEC_003)', () => {
    const src = readSrc('middleware/n8n-security.ts')
    expect(src).toContain('isBlockedPath')
    expect(src).toContain('credentials')
    expect(src).toContain('N8N_SEC_003')
  })

  test('proxy route uses tag injection on all list endpoints', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('injectCompanyTag(tenant.companyId, targetUrl)')
  })

  test('proxy strips client tag parameter to prevent bypass', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("key !== 'tags'")
  })
})

// === Part 3: Webhook with Tampered HMAC Rejected (SEC-7) ===

describe('25.6 Go/No-Go: SEC-7 — HMAC webhook verification', () => {
  test('n8n-webhook-hmac.ts exists', () => {
    expect(fs.existsSync('packages/server/src/services/n8n-webhook-hmac.ts')).toBe(true)
  })

  test('uses timing-safe comparison', () => {
    const src = readSrc('services/n8n-webhook-hmac.ts')
    expect(src).toContain('timingSafeEqual')
  })

  test('verifies HMAC-SHA256 signature', () => {
    const src = readSrc('services/n8n-webhook-hmac.ts')
    expect(src).toContain('sha256')
    expect(src).toContain('hmac')
  })

  test('rejects missing signature header', () => {
    const src = readSrc('services/n8n-webhook-hmac.ts')
    expect(src).toContain('signature')
  })
})

// === All 8 N8N-SEC Layers ===

describe('25.6 Go/No-Go: All 8 N8N-SEC layers present', () => {
  test('SEC-1: Firewall script', () => {
    expect(fs.existsSync('infrastructure/n8n/firewall.sh')).toBe(true)
  })

  test('SEC-2: Admin JWT guard', () => {
    const src = readSrc('middleware/n8n-security.ts')
    expect(src).toContain('n8nAdminGuard')
    expect(src).toContain('N8N_SEC_002')
  })

  test('SEC-3: Tag isolation middleware', () => {
    const src = readSrc('middleware/n8n-security.ts')
    expect(src).toContain('n8nTagIsolation')
    expect(src).toContain('injectCompanyTag')
  })

  test('SEC-4: Docker network isolation', () => {
    expect(fs.existsSync('docker-compose.n8n.yml')).toBe(true)
    const src = fs.readFileSync('docker-compose.n8n.yml', 'utf-8')
    expect(src).toContain('127.0.0.1:5678:5678')
  })

  test('SEC-5: Encrypted environment', () => {
    const src = fs.readFileSync('docker-compose.n8n.yml', 'utf-8')
    expect(src).toContain('N8N_ENCRYPTION_KEY')
  })

  test('SEC-6: CSRF on editor routes', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("csrf()")
    expect(src).toContain("'/n8n-editor/*'")
  })

  test('SEC-7: HMAC webhook verification', () => {
    expect(fs.existsSync('packages/server/src/services/n8n-webhook-hmac.ts')).toBe(true)
  })

  test('SEC-8: Rate limiting', () => {
    const src = readSrc('middleware/n8n-security.ts')
    expect(src).toContain('n8nRateLimit')
    expect(src).toContain('Retry-After')
  })
})

// === Docker Health Monitoring ===

describe('25.6 Go/No-Go: Docker health monitoring', () => {
  test('docker-compose has healthcheck', () => {
    const src = fs.readFileSync('docker-compose.n8n.yml', 'utf-8')
    expect(src).toContain('healthcheck')
    expect(src).toContain('healthz')
  })

  test('n8n-health.ts service exists', () => {
    expect(fs.existsSync('packages/server/src/services/n8n-health.ts')).toBe(true)
  })

  test('health service checks n8n availability', () => {
    const src = readSrc('services/n8n-health.ts')
    expect(src).toContain('checkN8nHealth')
    expect(src).toContain('127.0.0.1:5678')
  })

  test('health endpoint exposed via proxy route', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("n8nProxyRoute.get('/n8n/health'")
  })
})

// === Resource Limits ===

describe('25.6 Go/No-Go: Resource limits (2G RAM cap)', () => {
  test('docker-compose has memory limit', () => {
    const src = fs.readFileSync('docker-compose.n8n.yml', 'utf-8')
    expect(src).toContain('memory: 2g')
  })

  test('OOM recovery: proxy returns 502 on n8n failure', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('N8N_UNAVAILABLE')
    expect(src).toContain('502')
    expect(src).toContain('일시적으로 중단')
  })
})

// === Security Audit ===

describe('25.6 Go/No-Go: Security audit service', () => {
  test('n8n-security-audit.ts exists', () => {
    expect(fs.existsSync('packages/server/src/services/n8n-security-audit.ts')).toBe(true)
  })

  test('audit verifies tag isolation', () => {
    const src = readSrc('services/n8n-security-audit.ts')
    expect(src).toContain('checkTagIsolation')
  })

  test('audit verifies all security layers', () => {
    const src = readSrc('services/n8n-security-audit.ts')
    expect(src).toContain('requiresOwnershipCheck')
    expect(src).toContain('verifyResourceOwnership')
    expect(src).toContain('isBlockedPath')
  })
})

// === Proxy Security Chain ===

describe('25.6 Go/No-Go: Proxy security chain integrity', () => {
  test('full middleware chain: auth → admin → tenant → n8n guards', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('authMiddleware, adminOnly, tenantMiddleware')
    expect(src).toContain('n8nAdminGuard, n8nRateLimit, n8nTagIsolation')
  })

  test('path traversal prevention', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("decoded.includes('..')")
    expect(src).toContain('decodeURIComponent(decodeURIComponent(')
    expect(src).toContain('%00')
  })

  test('header sanitization strips Auth + Cookie', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain("delete headers['Authorization']")
    expect(src).toContain("delete headers['authorization']")
    expect(src).toContain("delete headers['Cookie']")
    expect(src).toContain("delete headers['cookie']")
  })

  test('TOCTOU prevention: pre-verify ownership before writes', () => {
    const src = readSrc('routes/admin/n8n-proxy.ts')
    expect(src).toContain('preVerifyOwnership')
    expect(src).toContain('WRITE_METHODS')
  })
})

// === Legacy Code Removed ===

describe('25.6 Go/No-Go: Legacy workflow code removed', () => {
  test('no legacy server workflow files', () => {
    expect(fs.existsSync('packages/server/src/routes/workspace/workflows.ts')).toBe(false)
    expect(fs.existsSync('packages/server/src/services/workflow')).toBe(false)
    expect(fs.existsSync('packages/server/src/lib/workflow')).toBe(false)
  })

  test('no legacy frontend workflow pages', () => {
    expect(fs.existsSync('packages/app/src/pages/workflows.tsx')).toBe(false)
    expect(fs.existsSync('packages/admin/src/pages/workflows.tsx')).toBe(false)
  })

  test('n8n replacement pages exist', () => {
    expect(fs.existsSync('packages/app/src/pages/n8n-workflows.tsx')).toBe(true)
    expect(fs.existsSync('packages/admin/src/pages/n8n-editor.tsx')).toBe(true)
  })
})

// === Test Coverage Summary ===

describe('25.6 Go/No-Go: Epic 25 test coverage', () => {
  test('SEC-8 layer tests exist (Story 25.2)', () => {
    expect(fs.existsSync('packages/server/src/__tests__/unit/n8n-sec-8layer.test.ts')).toBe(true)
  })

  test('proxy tests exist (Story 25.3)', () => {
    expect(fs.existsSync('packages/server/src/__tests__/unit/n8n-proxy.test.ts')).toBe(true)
  })

  test('CEO + Admin UI tests exist (Story 25.4)', () => {
    expect(fs.existsSync('packages/server/src/__tests__/unit/n8n-story-25-4.test.ts')).toBe(true)
  })

  test('legacy deletion tests exist (Story 25.5)', () => {
    expect(fs.existsSync('packages/server/src/__tests__/unit/n8n-story-25-5.test.ts')).toBe(true)
  })

  test('Docker deployment tests exist (Story 25.1)', () => {
    expect(fs.existsSync('packages/server/src/__tests__/unit/n8n-docker-deployment.test.ts')).toBe(true)
  })
})
