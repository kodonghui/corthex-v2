/**
 * MCP 도구 실행 속도 제한 — 인메모리 슬라이딩 윈도우
 */

const MCP_RATE_LIMIT_PER_MIN = 20
const CLEANUP_INTERVAL_MS = 5 * 60_000 // 5분마다 만료 엔트리 정리

const counters = new Map<string, { count: number; windowStart: number }>()

export function checkMcpRateLimit(userId: string): {
  allowed: boolean
  remaining: number
  retryAfterSec?: number
} {
  const now = Date.now()
  const entry = counters.get(userId)

  if (!entry || now - entry.windowStart > 60_000) {
    counters.set(userId, { count: 1, windowStart: now })
    return { allowed: true, remaining: MCP_RATE_LIMIT_PER_MIN - 1 }
  }

  if (entry.count >= MCP_RATE_LIMIT_PER_MIN) {
    const retryAfterSec = Math.ceil((entry.windowStart + 60_000 - now) / 1000)
    return { allowed: false, remaining: 0, retryAfterSec }
  }

  entry.count++
  return { allowed: true, remaining: MCP_RATE_LIMIT_PER_MIN - entry.count }
}

// 주기적 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of counters) {
    if (now - entry.windowStart > 60_000) {
      counters.delete(key)
    }
  }
}, CLEANUP_INTERVAL_MS)
