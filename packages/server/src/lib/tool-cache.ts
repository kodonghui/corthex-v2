/**
 * Tool Result Cache (Story 15.2)
 *
 * lib/ 레이어 — engine/ 외부, E8 경계 준수
 * D18: CacheStore 인터페이스 분리 → Phase 4 Redis 전환 시 구현체만 교체
 * D20: companyId 격리 — 키 형식: ${companyId}:${toolName}:${sorted_params}
 */

const MAX_ENTRIES = 10_000
const MEMORY_WARN_BYTES = 100 * 1024 * 1024 // 100MB
const CLEANUP_INTERVAL_MS = 60_000

// === CacheStore 인터페이스 (D18: Redis 전환 대비) ===

export interface CacheEntry {
  value: string
  expiresAt: number
}

export interface CacheStore {
  get(key: string): CacheEntry | undefined
  set(key: string, entry: CacheEntry): void
  delete(key: string): void
  entries(): IterableIterator<[string, CacheEntry]>
  readonly size: number
}

// === InMemoryMap 구현 (LRU) ===

export class InMemoryMap implements CacheStore {
  private map = new Map<string, CacheEntry>()

  get size(): number {
    return this.map.size
  }

  get(key: string): CacheEntry | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined
    // LRU: 접근 시 끝으로 이동 (Map은 삽입 순서 유지)
    this.map.delete(key)
    this.map.set(key, entry)
    return entry
  }

  set(key: string, entry: CacheEntry): void {
    if (this.map.has(key)) {
      this.map.delete(key)
    } else if (this.map.size >= MAX_ENTRIES) {
      // LRU 교체: 가장 오래된 항목(첫 번째) 제거
      const firstKey = this.map.keys().next().value
      if (firstKey !== undefined) this.map.delete(firstKey)
    }
    this.map.set(key, entry)
  }

  delete(key: string): void {
    this.map.delete(key)
  }

  entries(): IterableIterator<[string, CacheEntry]> {
    return this.map.entries()
  }
}

// === 전역 인스턴스 ===

const globalCache: CacheStore = new InMemoryMap()

// === 1분 cleanup 타이머 ===

function runCleanup(): void {
  const now = Date.now()

  // 만료 항목 수집 후 삭제 (iteration 중 삭제 방지)
  const toDelete: string[] = []
  for (const [key, entry] of globalCache.entries()) {
    if (entry.expiresAt < now) toDelete.push(key)
  }
  for (const key of toDelete) globalCache.delete(key)

  // NFR-CACHE-O4: heapUsed >= 100MB → warn + extra LRU cleanup
  const { heapUsed } = process.memoryUsage()
  if (heapUsed >= MEMORY_WARN_BYTES) {
    const usedMB = Math.round(heapUsed / (1024 * 1024))
    console.warn(JSON.stringify({ event: 'tool_cache_memory_exceeded', usedMB }))
    // 추가 10% LRU 정리
    const extraEvict = Math.ceil(globalCache.size * 0.1)
    let count = 0
    for (const [key] of globalCache.entries()) {
      if (count >= extraEvict) break
      globalCache.delete(key)
      count++
    }
  }
}

const cleanupTimer = setInterval(runCleanup, CLEANUP_INTERVAL_MS)
// Node.js/Bun: 타이머가 프로세스를 붙잡지 않도록
if (typeof cleanupTimer.unref === 'function') cleanupTimer.unref()

// === withCache 래퍼 ===

/**
 * 도구 실행 결과를 캐싱하는 래퍼
 *
 * @param toolName  도구 이름 (캐시 키 구성)
 * @param ttlMs     TTL(ms). 0이면 캐싱 없이 즉시 fn 실행
 * @param companyId 회사 ID (격리 보장 — string 강제, undefined 불가)
 * @param params    도구 입력 파라미터 (순서 무관 정렬 키)
 * @param fn        실제 도구 실행 함수
 *
 * NFR-CACHE-R1: 예외 발생 시 원본 fn 실행 (세션 중단 0건)
 */
export async function withCache(
  toolName: string,
  ttlMs: number,
  companyId: string,
  params: Record<string, unknown>,
  fn: () => Promise<string>,
): Promise<string> {
  // TTL=0: 캐싱 없이 즉시 실행
  if (ttlMs === 0) return fn()

  try {
    // D20: 파라미터 순서 무관 키 생성
    const key = `${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())}`
    const now = Date.now()

    const cached = globalCache.get(key)
    if (cached && cached.expiresAt > now) {
      console.info(JSON.stringify({ event: 'tool_cache_hit', toolName, companyId }))
      return cached.value
    }

    console.info(JSON.stringify({ event: 'tool_cache_miss', toolName, companyId }))
    const result = await fn()
    globalCache.set(key, { value: result, expiresAt: now + ttlMs })
    return result
  } catch (err) {
    // NFR-CACHE-R1: 예외 시 경고 로그 + 원본 fn 실행
    console.warn(JSON.stringify({ event: 'tool_cache_error', toolName, err: String(err) }))
    return fn()
  }
}

// 테스트용 내부 접근자
export function _getCacheForTesting(): CacheStore {
  return globalCache
}
