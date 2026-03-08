/**
 * 플랫폼별 Rate Limiter (인메모리 슬라이딩 윈도우)
 */

import type { SnsPlatform } from './types'

interface RateConfig {
  maxRequests: number
  windowMs: number
}

const RATE_LIMITS: Record<string, RateConfig> = {
  instagram: { maxRequests: 25, windowMs: 3600_000 },       // 25/hr
  twitter: { maxRequests: 100, windowMs: 3600_000 },        // 100/hr
  facebook: { maxRequests: 200, windowMs: 3600_000 },       // 200/hr
  naver_blog: { maxRequests: 5, windowMs: 3600_000 },       // 5/hr
  tistory: { maxRequests: 10, windowMs: 3600_000 },         // 10/hr
  daum_cafe: { maxRequests: 5, windowMs: 3600_000 },        // 5/hr (legacy)
}

// 인메모리 슬라이딩 윈도우 — 플랫폼별 타임스탬프 배열
const windows: Map<string, number[]> = new Map()

function getWindow(platform: string): number[] {
  if (!windows.has(platform)) {
    windows.set(platform, [])
  }
  return windows.get(platform)!
}

function cleanExpired(timestamps: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs
  return timestamps.filter((t) => t > cutoff)
}

export function canPublish(platform: SnsPlatform): boolean {
  const config = RATE_LIMITS[platform]
  if (!config) return true // 알 수 없는 플랫폼은 제한 없음

  const timestamps = cleanExpired(getWindow(platform), config.windowMs)
  windows.set(platform, timestamps)

  return timestamps.length < config.maxRequests
}

export function recordPublish(platform: SnsPlatform): void {
  const config = RATE_LIMITS[platform]
  if (!config) return

  const timestamps = cleanExpired(getWindow(platform), config.windowMs)
  timestamps.push(Date.now())
  windows.set(platform, timestamps)
}

export function getWaitTime(platform: SnsPlatform): number {
  const config = RATE_LIMITS[platform]
  if (!config) return 0

  const timestamps = cleanExpired(getWindow(platform), config.windowMs)
  windows.set(platform, timestamps)

  if (timestamps.length < config.maxRequests) return 0

  // 가장 오래된 요청이 만료될 때까지 대기
  const oldestTimestamp = timestamps[0]
  const expiresAt = oldestTimestamp + config.windowMs
  return Math.max(0, expiresAt - Date.now())
}

export function getRateLimit(platform: SnsPlatform): RateConfig | undefined {
  return RATE_LIMITS[platform]
}

// 테스트용 리셋
export function resetRateLimits(): void {
  windows.clear()
}
