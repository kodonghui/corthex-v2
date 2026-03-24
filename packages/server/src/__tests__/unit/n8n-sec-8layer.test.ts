import { describe, test, expect, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import * as fs from 'fs'

/**
 * Story 25.2: N8N-SEC 8-Layer Security — Verification Tests
 * References: AR34, N8N-SEC-1~8, NFR-S9
 *
 * AR34: All 8 layers must pass — partial deployment forbidden.
 */

// === SEC-1: VPS Firewall ===

describe('N8N-SEC-1: VPS Firewall', () => {
  test('firewall.sh exists and is executable', () => {
    const path = 'infrastructure/n8n/firewall.sh'
    expect(fs.existsSync(path)).toBe(true)
    const stat = fs.statSync(path)
    expect(stat.mode & 0o111).toBeGreaterThan(0)
  })

  test('firewall script blocks port 5678 externally', () => {
    const src = fs.readFileSync('infrastructure/n8n/firewall.sh', 'utf-8')
    expect(src).toContain('5678')
    expect(src).toContain('iptables')
    expect(src).toContain('DROP')
    expect(src).toContain('127.0.0.1')
  })

  test('firewall script supports apply/remove/status', () => {
    const src = fs.readFileSync('infrastructure/n8n/firewall.sh', 'utf-8')
    expect(src).toContain('cmd_apply')
    expect(src).toContain('cmd_remove')
    expect(src).toContain('cmd_status')
  })
})

// === SEC-2: Admin JWT ===

describe('N8N-SEC-2: Admin-only access via JWT', () => {
  test('n8nAdminGuard exported from n8n-security middleware', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toMatch(/export\s+const\s+n8nAdminGuard/)
  })

  test('rejects non-admin roles with 403', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toContain('company_admin')
    expect(src).toContain('super_admin')
    expect(src).toContain('403')
    expect(src).toContain('N8N_SEC_002')
  })

  test('rejects unauthenticated with 401', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toContain('401')
    expect(src).toContain('N8N_SEC_001')
  })
})

// === SEC-3: Tag-based tenant isolation ===

describe('N8N-SEC-3: Tag-based multi-tenant isolation', () => {
  test('injectCompanyTag function exported', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toMatch(/export\s+function\s+injectCompanyTag/)
  })

  test('tag format is company:{companyId}', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toContain('company:${companyId}')
  })

  test('tags injected for workflow and execution list endpoints', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toContain('/workflows')
    expect(src).toContain('/executions')
    expect(src).toContain('searchParams')
  })

  test('n8nTagIsolation middleware exported', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toMatch(/export\s+const\s+n8nTagIsolation/)
  })

  test('requiresOwnershipCheck detects individual resource paths', async () => {
    const { requiresOwnershipCheck } = await import('../../middleware/n8n-security')
    expect(requiresOwnershipCheck('/workflows/abc-123')).toBe(true)
    expect(requiresOwnershipCheck('/executions/xyz-456')).toBe(true)
    expect(requiresOwnershipCheck('/workflows')).toBe(false)
    expect(requiresOwnershipCheck('/executions')).toBe(false)
  })

  test('isBlockedPath blocks credentials access', async () => {
    const { isBlockedPath } = await import('../../middleware/n8n-security')
    expect(isBlockedPath('/credentials')).toBe(true)
    expect(isBlockedPath('/credentials/abc')).toBe(true)
    expect(isBlockedPath('/workflows')).toBe(false)
  })

  test('verifyResourceOwnership checks company tag', async () => {
    const { verifyResourceOwnership } = await import('../../middleware/n8n-security')
    expect(verifyResourceOwnership([{ name: 'company:co-1' }], 'co-1')).toBe(true)
    expect(verifyResourceOwnership([{ name: 'company:co-2' }], 'co-1')).toBe(false)
    expect(verifyResourceOwnership(undefined, 'co-1')).toBe(false)
    expect(verifyResourceOwnership([], 'co-1')).toBe(false)
  })
})

// === SEC-4: HMAC webhook verification ===

describe('N8N-SEC-4: Webhook HMAC signature verification', () => {
  test('generateHmacSignature produces sha256 signature', async () => {
    const { generateHmacSignature } = await import('../../services/n8n-webhook-hmac')
    const sig = generateHmacSignature('test-payload', 'test-secret')
    expect(sig).toMatch(/^sha256=[a-f0-9]{64}$/)
  })

  test('verifyHmacSignature accepts valid signature', async () => {
    const { generateHmacSignature, verifyHmacSignature } = await import('../../services/n8n-webhook-hmac')
    const payload = '{"event":"workflow.completed","data":{"id":"123"}}'
    const secret = 'company-webhook-secret-abc'
    const sig = generateHmacSignature(payload, secret)
    expect(verifyHmacSignature(payload, sig, secret)).toBe(true)
  })

  test('verifyHmacSignature rejects invalid signature', async () => {
    const { verifyHmacSignature } = await import('../../services/n8n-webhook-hmac')
    expect(verifyHmacSignature('payload', 'sha256=invalid', 'secret')).toBe(false)
  })

  test('verifyHmacSignature rejects undefined signature', async () => {
    const { verifyHmacSignature } = await import('../../services/n8n-webhook-hmac')
    expect(verifyHmacSignature('payload', undefined, 'secret')).toBe(false)
  })

  test('verifyHmacSignature rejects wrong secret', async () => {
    const { generateHmacSignature, verifyHmacSignature } = await import('../../services/n8n-webhook-hmac')
    const sig = generateHmacSignature('payload', 'correct-secret')
    expect(verifyHmacSignature('payload', sig, 'wrong-secret')).toBe(false)
  })

  test('uses timing-safe comparison', () => {
    const src = fs.readFileSync('packages/server/src/services/n8n-webhook-hmac.ts', 'utf-8')
    expect(src).toContain('timingSafeEqual')
  })

  test('generateWebhookSecret produces 64-char hex', async () => {
    const { generateWebhookSecret } = await import('../../services/n8n-webhook-hmac')
    const secret = generateWebhookSecret()
    expect(secret).toMatch(/^[a-f0-9]{64}$/)
  })
})

// === SEC-5: Docker resource limits (verified from 25.1) ===

describe('N8N-SEC-5: Docker resource limits', () => {
  test('compose has memory 2g and cpus 2', () => {
    const src = fs.readFileSync('docker-compose.n8n.yml', 'utf-8')
    expect(src).toMatch(/memory:\s*2g/)
    expect(src).toMatch(/cpus:\s*["']?2["']?/)
  })

  test('NODE_OPTIONS max-old-space-size=1536', () => {
    const src = fs.readFileSync('docker-compose.n8n.yml', 'utf-8')
    expect(src).toContain('--max-old-space-size=1536')
  })
})

// === SEC-6: DB isolation ===

describe('N8N-SEC-6: Database isolation (SQLite only)', () => {
  test('DB_TYPE=sqlite in compose', () => {
    const src = fs.readFileSync('docker-compose.n8n.yml', 'utf-8')
    expect(src).toContain('DB_TYPE=sqlite')
  })

  test('no PostgreSQL config in compose', () => {
    const src = fs.readFileSync('docker-compose.n8n.yml', 'utf-8')
    expect(src).not.toContain('DB_POSTGRESDB')
    expect(src).not.toContain('DATABASE_URL=postgres')
  })
})

// === SEC-7: Credential encryption ===

describe('N8N-SEC-7: AES-256-GCM credential encryption', () => {
  test('N8N_ENCRYPTION_KEY required in compose', () => {
    const src = fs.readFileSync('docker-compose.n8n.yml', 'utf-8')
    expect(src).toContain('N8N_ENCRYPTION_KEY')
    expect(src).toMatch(/N8N_ENCRYPTION_KEY.*:?\?/)
  })
})

// === SEC-8: Rate limiting ===

describe('N8N-SEC-8: API rate limiting (60/min per company)', () => {
  test('n8nRateLimit middleware exported', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toMatch(/export\s+const\s+n8nRateLimit/)
  })

  test('rate limit is 60 per minute', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toContain('N8N_RATE_LIMIT = 60')
    expect(src).toContain('N8N_RATE_WINDOW_MS = 60_000')
  })

  test('keyed by companyId (not IP)', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toContain('tenant.companyId')
    expect(src).toContain('n8n:${tenant.companyId}')
  })

  test('returns 429 with error code N8N_SEC_008', () => {
    const src = fs.readFileSync('packages/server/src/middleware/n8n-security.ts', 'utf-8')
    expect(src).toContain('429')
    expect(src).toContain('N8N_SEC_008')
  })

  test('functional: rate limit blocks at 61st request', async () => {
    const { n8nRateLimit, _testRateLimitStore } = await import('../../middleware/n8n-security')
    _testRateLimitStore.clear()

    const app = new Hono()
    // Mock tenant middleware
    app.use('*', async (c, next) => {
      c.set('tenant' as never, { companyId: 'test-co-rate', role: 'company_admin', userId: 'u1' } as never)
      await next()
    })
    app.use('/n8n/*', n8nRateLimit)
    app.get('/n8n/test', (c) => c.json({ data: 'ok' }))

    // 60 requests should pass
    for (let i = 0; i < 60; i++) {
      const res = await app.request('/n8n/test')
      expect(res.status).toBe(200)
    }

    // 61st should be blocked
    const res = await app.request('/n8n/test')
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBeTruthy()
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('N8N_SEC_008')

    _testRateLimitStore.clear()
  })
})

// === AR34: All-or-nothing security audit ===

describe('AR34: All-or-nothing security audit', () => {
  test('n8n-security-audit.ts exists', () => {
    expect(fs.existsSync('packages/server/src/services/n8n-security-audit.ts')).toBe(true)
  })

  test('runN8nSecurityAudit exported', () => {
    const src = fs.readFileSync('packages/server/src/services/n8n-security-audit.ts', 'utf-8')
    expect(src).toMatch(/export\s+async\s+function\s+runN8nSecurityAudit/)
  })

  test('checks all 8 layers', () => {
    const src = fs.readFileSync('packages/server/src/services/n8n-security-audit.ts', 'utf-8')
    expect(src).toContain('SEC-1')
    expect(src).toContain('SEC-2')
    expect(src).toContain('SEC-3')
    expect(src).toContain('SEC-4')
    expect(src).toContain('SEC-5')
    expect(src).toContain('SEC-6')
    expect(src).toContain('SEC-7')
    expect(src).toContain('SEC-8')
  })

  test('allPassed only true when all 8 pass', () => {
    const src = fs.readFileSync('packages/server/src/services/n8n-security-audit.ts', 'utf-8')
    expect(src).toContain('allPassed')
    expect(src).toContain("every(l => l.status === 'pass')")
  })

  test('security audit passes all 8 layers', async () => {
    const { runN8nSecurityAudit } = await import('../../services/n8n-security-audit')
    const result = await runN8nSecurityAudit()
    expect(result.layers).toHaveLength(8)
    for (const layer of result.layers) {
      expect(layer.status).toBe('pass')
    }
    expect(result.allPassed).toBe(true)
  })
})
