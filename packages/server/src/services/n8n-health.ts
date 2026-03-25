/**
 * Story 25.1: n8n Health Check Service
 *
 * Monitors n8n container health from CORTHEX side.
 * FR-N8N5: n8n failure must not crash CORTHEX — all checks are fault-tolerant.
 */

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://127.0.0.1:5678'
const HEALTH_TIMEOUT_MS = 5_000

export interface N8nHealthStatus {
  available: boolean
  url: string
  status?: string
  responseTimeMs?: number
  error?: string
}

/**
 * Check if n8n container is healthy.
 * Returns status object — never throws (FR-N8N5).
 */
export async function checkN8nHealth(): Promise<N8nHealthStatus> {
  const start = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)
  try {
    const res = await fetch(`${N8N_BASE_URL}/healthz`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const responseTimeMs = Date.now() - start
    return {
      available: res.ok,
      url: N8N_BASE_URL,
      status: res.ok ? 'healthy' : `unhealthy (${res.status})`,
      responseTimeMs,
    }
  } catch (err) {
    clearTimeout(timeout)
    return {
      available: false,
      url: N8N_BASE_URL,
      status: 'unreachable',
      responseTimeMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * Quick boolean check — is n8n available?
 * Use this for guard clauses before proxying requests.
 */
export async function isN8nAvailable(): Promise<boolean> {
  const health = await checkN8nHealth()
  return health.available
}
