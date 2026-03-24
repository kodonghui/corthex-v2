import { Hono } from 'hono'
import { proxy } from 'hono/proxy'
import { csrf } from 'hono/csrf'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import {
  n8nAdminGuard,
  n8nTagIsolation,
  n8nRateLimit,
  injectCompanyTag,
  requiresOwnershipCheck,
  isBlockedPath,
  verifyResourceOwnership,
} from '../../middleware/n8n-security'
import { checkN8nHealth } from '../../services/n8n-health'
import type { AppEnv } from '../../types'

/**
 * Story 25.3: Hono Reverse Proxy for n8n
 *
 * References: AR35, FR-N8N1, FR-N8N6
 *
 * Routes:
 *   /n8n/api/*        — n8n REST API proxy (workflow CRUD, executions, etc.)
 *   /n8n-editor/*     — n8n editor UI proxy (FR-N8N6, CSRF protected)
 *
 * Security chain (per request):
 *   auth → adminOnly → tenant → SEC-2 adminGuard → SEC-8 rateLimit → SEC-3 tagIsolation
 *   → path normalization → TOCTOU pre-check (writes) → proxy → ownership verification (reads)
 *
 * Dependency: routes/admin/n8n-proxy.ts → middleware/, services/n8n-health.ts, Docker proxy
 * Forbidden: engine/ (per E20 dependency rules)
 */

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://127.0.0.1:5678'

export const n8nProxyRoute = new Hono<AppEnv>()

// === Common middleware chain (SEC-2 + SEC-8 + SEC-3) ===
n8nProxyRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)
n8nProxyRoute.use('*', n8nAdminGuard, n8nRateLimit, n8nTagIsolation)

// === Path normalization: block path traversal (AR35) ===

/**
 * Decode and validate path — blocks:
 * - Double-dot (..) in decoded path
 * - URL-encoded dots (%2e, %2E) in raw path (single or double encoded)
 * - Null bytes
 */
function validateProxyPath(rawPath: string): { valid: boolean; normalized: string } {
  // Block null bytes
  if (rawPath.includes('\0') || rawPath.includes('%00')) {
    return { valid: false, normalized: '' }
  }

  // Block URL-encoded dot variants in raw path (before decoding)
  if (/%2e/i.test(rawPath)) {
    return { valid: false, normalized: '' }
  }

  // Double-decode to catch double-encoding attacks
  let decoded: string
  try {
    decoded = decodeURIComponent(decodeURIComponent(rawPath))
  } catch {
    // Invalid encoding — block it
    return { valid: false, normalized: '' }
  }

  // Block path traversal in decoded form
  if (decoded.includes('..')) {
    return { valid: false, normalized: '' }
  }

  return { valid: true, normalized: decoded }
}

// Export for adversarial testing
export const _testValidateProxyPath = validateProxyPath

// === Header sanitization ===

/**
 * Build sanitized headers for proxy requests.
 * Uses lowercase keys (HTTP/2 compatible) to ensure proper override.
 */
function sanitizeProxyHeaders(reqHeaders: Record<string, string>): Record<string, string | undefined> {
  const headers: Record<string, string | undefined> = { ...reqHeaders }
  // Delete both casing variants to handle HTTP/1.1 and HTTP/2
  delete headers['Authorization']
  delete headers['authorization']
  delete headers['Cookie']
  delete headers['cookie']
  return headers
}

// === TOCTOU prevention: pre-verify ownership for write operations ===

const WRITE_METHODS = new Set(['PUT', 'PATCH', 'DELETE', 'POST'])

/**
 * For write operations on individual resources, pre-verify ownership
 * by fetching the resource first. Prevents TOCTOU: mutation succeeds
 * before post-response ownership check returns 403.
 */
async function preVerifyOwnership(
  companyId: string,
  resourcePath: string,
): Promise<{ allowed: boolean; error?: string }> {
  try {
    const checkUrl = new URL(`${N8N_BASE_URL}/api/v1${resourcePath}`)
    const res = await fetch(checkUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      return { allowed: false, error: `n8n resource not found (${res.status})` }
    }
    const body = await res.json() as { tags?: Array<{ name: string }> }
    if (!verifyResourceOwnership(body.tags, companyId)) {
      return { allowed: false, error: 'Cross-tenant access denied' }
    }
    return { allowed: true }
  } catch {
    return { allowed: false, error: 'n8n unreachable' }
  }
}

// === n8n API proxy: /n8n/api/* ===

n8nProxyRoute.all('/n8n/api/*', async (c) => {
  const tenant = c.get('tenant')
  const rawPath = c.req.path.replace(/^.*\/n8n\/api/, '')

  // Path validation
  const { valid } = validateProxyPath(rawPath)
  if (!valid) {
    return c.json(
      { success: false, error: { code: 'N8N_PATH_TRAVERSAL', message: 'Invalid path' } },
      400,
    )
  }

  // SEC-3: Block credential access (no tenant isolation possible)
  if (isBlockedPath(rawPath)) {
    return c.json(
      { success: false, error: { code: 'N8N_SEC_003', message: 'n8n credentials 접근은 허용되지 않습니다.' } },
      403,
    )
  }

  // TOCTOU prevention: for write operations on individual resources,
  // pre-verify ownership BEFORE forwarding the mutation to n8n
  const isWrite = WRITE_METHODS.has(c.req.method) && c.req.method !== 'POST'
  if (isWrite && requiresOwnershipCheck(rawPath)) {
    const check = await preVerifyOwnership(tenant.companyId, rawPath)
    if (!check.allowed) {
      return c.json(
        { success: false, error: { code: 'N8N_SEC_003', message: '다른 회사의 리소스에 접근할 수 없습니다.' } },
        403,
      )
    }
  }

  // Build target URL with tag injection (SEC-3)
  const targetUrl = new URL(`${N8N_BASE_URL}/api/v1${rawPath}`)

  // Preserve original query parameters
  const originalUrl = new URL(c.req.url)
  for (const [key, value] of originalUrl.searchParams) {
    if (key !== 'tags') { // Don't let client override tag filter
      targetUrl.searchParams.set(key, value)
    }
  }

  // Inject company tag for list endpoints
  injectCompanyTag(tenant.companyId, targetUrl)

  // Proxy to n8n with OOM recovery
  try {
    const response = await proxy(targetUrl.toString(), {
      ...c.req,
      headers: sanitizeProxyHeaders(c.req.header()),
    })

    // Individual resource ownership verification for GET (SEC-3)
    if (c.req.method === 'GET' && requiresOwnershipCheck(rawPath) && response.ok) {
      try {
        const body = await response.json() as { tags?: Array<{ name: string }> }
        if (!verifyResourceOwnership(body.tags, tenant.companyId)) {
          return c.json(
            { success: false, error: { code: 'N8N_SEC_003', message: '다른 회사의 리소스에 접근할 수 없습니다.' } },
            403,
          )
        }
        // Re-create response preserving original headers
        return new Response(JSON.stringify(body), {
          status: response.status,
          headers: response.headers,
        })
      } catch {
        // If body parse fails, pass through as-is (non-JSON response)
        return response
      }
    }

    return response
  } catch (err) {
    // OOM recovery: n8n unreachable → 502
    const health = await checkN8nHealth()
    return c.json(
      {
        success: false,
        error: {
          code: 'N8N_UNAVAILABLE',
          message: 'n8n 서비스가 일시적으로 중단되었습니다. 자동 재시작 중입니다.',
          detail: health.status,
        },
      },
      502,
    )
  }
})

// === n8n Editor UI proxy: /n8n-editor/* (FR-N8N6) ===

// CSRF protection on editor routes — only same-origin allowed
n8nProxyRoute.use('/n8n-editor/*', csrf())

n8nProxyRoute.all('/n8n-editor/*', async (c) => {
  const rawPath = c.req.path.replace(/^.*\/n8n-editor/, '')

  // Path validation
  const { valid } = validateProxyPath(rawPath)
  if (!valid) {
    return c.json(
      { success: false, error: { code: 'N8N_PATH_TRAVERSAL', message: 'Invalid path' } },
      400,
    )
  }

  // Proxy to n8n UI (no /api/v1 prefix — serves HTML/JS/CSS)
  const targetUrl = `${N8N_BASE_URL}${rawPath || '/'}`

  try {
    return await proxy(targetUrl, {
      ...c.req,
      headers: sanitizeProxyHeaders(c.req.header()),
    })
  } catch {
    // OOM recovery
    const health = await checkN8nHealth()
    return c.json(
      {
        success: false,
        error: {
          code: 'N8N_UNAVAILABLE',
          message: 'n8n 에디터가 일시적으로 중단되었습니다. 자동 재시작 중입니다.',
          detail: health.status,
        },
      },
      502,
    )
  }
})

// === FR-N8N5: n8n health status endpoint ===

n8nProxyRoute.get('/n8n/health', async (c) => {
  const health = await checkN8nHealth()
  return c.json({ success: true, data: health })
})

// === FR-N8N2: Execution results endpoint (CEO read-only) ===

n8nProxyRoute.get('/n8n/executions', async (c) => {
  const tenant = c.get('tenant')

  const targetUrl = new URL(`${N8N_BASE_URL}/api/v1/executions`)
  injectCompanyTag(tenant.companyId, targetUrl)

  const limit = c.req.query('limit')
  const cursor = c.req.query('cursor')
  const status = c.req.query('status')
  const workflowId = c.req.query('workflowId')
  if (limit) targetUrl.searchParams.set('limit', limit)
  if (cursor) targetUrl.searchParams.set('cursor', cursor)
  if (status) targetUrl.searchParams.set('status', status)
  if (workflowId) targetUrl.searchParams.set('workflowId', workflowId)

  try {
    const response = await proxy(targetUrl.toString(), {
      headers: { Accept: 'application/json', Authorization: undefined, Cookie: undefined },
    })

    if (!response.ok) {
      return c.json(
        { success: false, error: { code: 'N8N_API_ERROR', message: `n8n API error: ${response.status}` } },
        response.status as any,
      )
    }

    const data = await response.json()
    return c.json({ success: true, data })
  } catch {
    const health = await checkN8nHealth()
    return c.json(
      {
        success: false,
        error: {
          code: 'N8N_UNAVAILABLE',
          message: 'n8n 서비스가 일시적으로 중단되었습니다.',
          detail: health.status,
        },
      },
      502,
    )
  }
})

// === FR-N8N1: Convenience endpoint — Admin workflow list ===

n8nProxyRoute.get('/n8n/workflows', async (c) => {
  const tenant = c.get('tenant')

  const targetUrl = new URL(`${N8N_BASE_URL}/api/v1/workflows`)
  injectCompanyTag(tenant.companyId, targetUrl)

  // Pagination support
  const limit = c.req.query('limit')
  const cursor = c.req.query('cursor')
  if (limit) targetUrl.searchParams.set('limit', limit)
  if (cursor) targetUrl.searchParams.set('cursor', cursor)

  try {
    const response = await proxy(targetUrl.toString(), {
      headers: { Accept: 'application/json', Authorization: undefined, Cookie: undefined },
    })

    if (!response.ok) {
      return c.json(
        { success: false, error: { code: 'N8N_API_ERROR', message: `n8n API error: ${response.status}` } },
        response.status as any,
      )
    }

    const data = await response.json()
    return c.json({ success: true, data })
  } catch {
    const health = await checkN8nHealth()
    return c.json(
      {
        success: false,
        error: {
          code: 'N8N_UNAVAILABLE',
          message: 'n8n 서비스가 일시적으로 중단되었습니다.',
          detail: health.status,
        },
      },
      502,
    )
  }
})
