import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../types'
import { HTTPError } from './error'

/**
 * Story 25.2: N8N-SEC Security Middleware
 *
 * Combines layers SEC-2 (Admin JWT), SEC-3 (tag isolation), SEC-8 (rate limit).
 * Applied to all /admin/n8n/* proxy routes.
 */

// === SEC-2: Admin-only access ===

/**
 * N8N-SEC-2: Only company_admin and super_admin can access n8n proxy.
 * Must be used AFTER auth + tenant middleware in the chain.
 */
export const n8nAdminGuard: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')

  if (!tenant?.companyId) {
    throw new HTTPError(401, 'n8n 접근에는 인증이 필요합니다.', 'N8N_SEC_001')
  }

  if (tenant.role !== 'super_admin' && tenant.role !== 'company_admin') {
    throw new HTTPError(403, 'n8n은 관리자만 접근할 수 있습니다.', 'N8N_SEC_002')
  }

  await next()
}

// === SEC-3: Tag-based tenant isolation ===

/**
 * N8N-SEC-3: Auto-inject company tag into n8n API requests.
 * Ensures each company only sees their own workflows.
 *
 * - List endpoints (/workflows, /executions): adds `?tags=company:{companyId}` filter
 * - Individual resource paths (/workflows/{id}, /executions/{id}): flagged for
 *   post-fetch ownership verification via `verifyResourceOwnership()`
 * - Credentials access: blocked (no tag-based isolation possible)
 */
export function injectCompanyTag(companyId: string, url: URL): URL {
  const tagValue = `company:${companyId}`

  // For list endpoints, add tag filter
  if (url.pathname.endsWith('/workflows') || url.pathname.endsWith('/executions')) {
    url.searchParams.set('tags', tagValue)
  }

  return url
}

// Individual resource paths that require post-fetch ownership verification
const INDIVIDUAL_RESOURCE_RE = /\/(workflows|executions)\/[^/]+$/
const BLOCKED_PATHS_RE = /\/credentials(\/|$)/

/**
 * Check if a path accesses an individual resource (needs ownership verification).
 * The proxy layer (25.3) must call this and verify response tags after fetch.
 */
export function requiresOwnershipCheck(pathname: string): boolean {
  return INDIVIDUAL_RESOURCE_RE.test(pathname)
}

/**
 * Check if a path is blocked entirely (no tag isolation possible).
 */
export function isBlockedPath(pathname: string): boolean {
  return BLOCKED_PATHS_RE.test(pathname)
}

/**
 * Verify that an n8n resource belongs to the requesting company.
 * Called by proxy after fetching individual resources from n8n.
 * Returns false if tags are missing or don't contain the company tag.
 */
export function verifyResourceOwnership(
  resourceTags: Array<{ name: string }> | undefined,
  companyId: string,
): boolean {
  if (!resourceTags || resourceTags.length === 0) return false
  const expectedTag = `company:${companyId}`
  return resourceTags.some(tag => tag.name === expectedTag)
}

/**
 * Middleware that adds company tag to proxied n8n requests.
 * Also blocks access to paths that cannot be tenant-isolated.
 */
export const n8nTagIsolation: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')
  const pathname = new URL(c.req.url).pathname

  // Block paths that cannot be tenant-isolated
  const n8nPath = pathname.replace(/^.*\/n8n/, '')
  if (isBlockedPath(n8nPath)) {
    throw new HTTPError(403, 'n8n credentials 접근은 허용되지 않습니다.', 'N8N_SEC_003')
  }

  // Store companyId tag for proxy to use
  c.set('n8nCompanyTag' as never, `company:${tenant.companyId}` as never)
  // Flag if proxy needs ownership verification after fetch
  c.set('n8nRequiresOwnershipCheck' as never, requiresOwnershipCheck(n8nPath) as never)

  await next()
}

// === SEC-8: n8n API rate limiting (60/min per company) ===

const n8nRateLimitStore = new Map<string, { count: number; resetAt: number }>()
const N8N_RATE_LIMIT = 60
const N8N_RATE_WINDOW_MS = 60_000

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of n8nRateLimitStore) {
    if (entry.resetAt < now) n8nRateLimitStore.delete(key)
  }
}, 5 * 60_000)

/**
 * N8N-SEC-8: Rate limit n8n API access to 60 requests per minute per company.
 * Keyed by companyId (not IP) since this is behind admin auth.
 */
export const n8nRateLimit: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')
  const key = `n8n:${tenant.companyId}`
  const now = Date.now()

  const entry = n8nRateLimitStore.get(key)
  if (!entry || entry.resetAt < now) {
    n8nRateLimitStore.set(key, { count: 1, resetAt: now + N8N_RATE_WINDOW_MS })
    return next()
  }

  if (entry.count >= N8N_RATE_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    c.header('Retry-After', String(retryAfter))
    return c.json(
      { error: { code: 'N8N_SEC_008', message: 'n8n API 요청 한도 초과 (60/분)', retryAfter } },
      429,
    )
  }

  entry.count++
  return next()
}

// === Export rate limit internals for testing ===
export const _testRateLimitStore = n8nRateLimitStore
export const _N8N_RATE_LIMIT = N8N_RATE_LIMIT
