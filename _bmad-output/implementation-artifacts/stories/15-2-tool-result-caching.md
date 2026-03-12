# Story 15.2: Tool Result Caching (인메모리 Map)
Status: backlog
Story Points: 8
Priority: P1
blockedBy: none (15.1, 15.3과 독립 병렬 개발 가능)

## Story
As a platform operator,
I want tool execution results cached in memory with per-tool TTL,
so that repeated identical tool calls (e.g. kr_stock, search_web) don't hit external APIs unnecessarily and agent session costs are reduced.

## Context

**아키텍처 결정 D18** (`epic-15-architecture-addendum.md` 참조):
- Tool Cache 위치: `packages/server/src/lib/tool-cache.ts` — `engine/` 밖 `lib/` 레이어
- E8 경계 외부 — 도구 핸들러에서 직접 import 가능 (engine/ 내부 배치 시 E8 위반)
- Phase 4 Redis 전환 대비: `CacheStore` 인터페이스 분리 (`{ get, set, delete }`) → 전환 시 구현체만 교체, `withCache()` API 유지

**결정 D20** — companyId 격리:
- Cache key 형식: `${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())}`
- `Object.entries(params).sort()` — 파라미터 순서 차이에 관계없이 동일 키 생성
- `companyId` 미전달 시: 캐싱 없이 원본 함수 실행 (타입 시스템으로 강제 — NFR-CACHE-S4)

**NFR 핵심**:
- NFR-CACHE-R1: `withCache()` 예외 발생 시 원본 함수 실행 (세션 중단 0건)
- NFR-CACHE-SC1: 10,000 항목 상한, LRU 교체 (만재 시 heapUsed 증가 ≤ 100MB)
- NFR-CACHE-SC3: 1분 cleanup 타이머 이벤트 루프 블로킹 ≤ 10ms
- NFR-CACHE-O4: heapUsed ≥ 100MB 시 `log.warn({ event:'tool_cache_memory_exceeded' })` + LRU 추가 정리

**도구별 TTL (FR-CACHE-2.5, `lib/tool-cache-config.ts`)**:
| 도구 이름 | TTL (ms) | 환산 |
|-----------|----------|------|
| `kr_stock` | 60,000 | 1분 |
| `search_news` | 900,000 | 15분 |
| `search_web` | 1,800,000 | 30분 |
| `dart_api` | 3,600,000 | 1시간 |
| `law_search` | 86,400,000 | 24시간 |
| `get_current_time` | 0 | 캐시 없음 |
| `generate_image` | 0 | 캐시 없음 |

미등록 신규 도구 기본값: 캐시 없음 (`TTL=0` 처리)

## Acceptance Criteria

1. **Given** `withCache()` 래퍼가 존재하고 도구 핸들러에 적용되었을 때, **When** 동일 `companyId` + 동일 파라미터로 TTL 내에 두 번째 호출이 발생하면, **Then** 실제 도구 함수 없이 캐시 결과가 반환되고 `log.info({ event:'tool_cache_hit' })`가 기록된다

2. **Given** TTL이 만료된 캐시 항목, **When** 동일 파라미터로 호출되면, **Then** 실제 도구 함수가 실행되고 결과가 갱신 저장되며 `log.info({ event:'tool_cache_miss' })`가 기록된다

3. **Given** 서로 다른 `companyId` A, B가 동일 도구를 동일 파라미터로 호출할 때, **When** A가 먼저 호출 완료된 후 B가 호출하면, **Then** B는 A의 캐시를 히트하지 않고 독립적으로 도구 함수를 실행한다 (NFR-CACHE-S1)

4. **Given** `TTL=0`으로 등록된 도구 (`get_current_time`, `generate_image`), **When** 호출되면, **Then** 캐시를 확인하지 않고 항상 원본 함수를 실행한다

5. **Given** `withCache()` 내부에서 예외가 발생하면, **When** 도구 호출 시, **Then** `log.warn({ event:'tool_cache_error', toolName, err })`를 기록하고 원본 도구 함수를 실행하여 에이전트 세션이 중단되지 않는다 (NFR-CACHE-R1)

6. **Given** 캐시 항목이 10,000개에 도달하면, **When** 새 항목을 추가하면, **Then** LRU 정책으로 가장 오래된 항목 1개가 제거되고 신규 항목이 삽입된다 (NFR-CACHE-SC1, SC2)

7. **Given** 1분 cleanup 타이머, **When** 만료 항목이 존재하면, **Then** `expiresAt < Date.now()` 항목이 일괄 삭제되며 이벤트 루프 블로킹이 ≤ 10ms이다 (NFR-CACHE-SC3)

8. **Given** `process.memoryUsage().heapUsed`가 100MB를 초과하면, **When** cleanup 체크 시, **Then** `log.warn({ event:'tool_cache_memory_exceeded', usedMB })`를 기록하고 LRU 추가 정리를 즉시 실행한다 (NFR-CACHE-O4)

9. **Given** 파라미터 순서가 다른 두 호출 `{ a: 1, b: 2 }`와 `{ b: 2, a: 1 }`, **When** cache key를 생성하면, **Then** 동일한 key가 생성된다 (`Object.entries().sort()` 적용)

10. **Given** 모든 변경 완료 후, **When** `npx tsc --noEmit -p packages/server/tsconfig.json`을 실행하면, **Then** 타입 오류 0건이다

## Tasks / Subtasks

- [ ] Task 1: lib/tool-cache.ts 생성 (AC: #1, #2, #3, #4, #5, #6, #7, #8, #9)
  - [ ] `CacheStore` 인터페이스 정의: `{ get(key): CacheEntry | undefined; set(key, entry): void; delete(key): void; entries(): IterableIterator<[string, CacheEntry]> }`
  - [ ] `InMemoryMap` 구현: Map 기반, LRU 순서 추적 (접근 시 순서 업데이트)
  - [ ] `withCache<T>(toolName, ttlMs, companyId, params, fn)` 함수 구현:
    - key: `${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())}`
    - `ttlMs === 0`: 캐시 없이 즉시 fn 실행
    - `companyId` 미전달 시 타입 오류 (string 타입 강제 — undefined 불가)
    - try-catch: 예외 시 `log.warn` + 원본 fn 실행
  - [ ] 10,000 항목 상한 LRU 교체 로직
  - [ ] `setInterval(cleanup, 60_000)`: 만료 항목 일괄 삭제 + heapUsed ≥ 100MB 체크

- [ ] Task 2: lib/tool-cache-config.ts 생성 (AC: #4)
  - [ ] `TOOL_TTL_MS` 상수 맵: 7개 도구 TTL 등록 (위 테이블 기준)
  - [ ] `getToolTtl(toolName: string): number` 함수: 미등록 도구 → 0 반환
  - [ ] **Admin UX 연동 (Story 15.3)**: `getCacheRecommendation(toolName)` 함수 — TTL=0→'none', TTL≤900,000→'warning', else→'ok'. Story 15.3에서 enableSemanticCache 토글의 추천 표시에 활용 예정

- [ ] Task 3: 기존 도구 핸들러에 withCache 적용 (AC: #1)
  - [ ] `packages/server/src/tool-handlers/` (또는 실제 경로) 내 7개 도구 파일 확인
  - [ ] 각 도구 핸들러 함수를 `withCache(toolName, getToolTtl(toolName), companyId, params, originalFn)`으로 래핑
  - [ ] `companyId`가 핸들러 컨텍스트에서 어떻게 전달되는지 확인 (SessionContext 또는 ToolExecContext)
  - [ ] TTL=0 도구(`get_current_time`, `generate_image`)는 withCache 적용 불필요 — 확인만

- [ ] Task 4: 검증 (AC: #10)
  - [ ] `npx tsc --noEmit -p packages/server/tsconfig.json` — 오류 0건
  - [ ] bun:test 작성:
    - 히트: TTL 내 동일 파라미터 2회 호출 → 도구 fn 1회만 실행
    - 미스: TTL 만료 후 재호출 → 도구 fn 재실행
    - companyId 격리: A, B 다른 companyId → 교차 히트 없음
    - TTL=0: 항상 fn 실행
    - graceful fallback: 캐시 예외 → fn 실행 (세션 유지)
    - LRU: 10,001번째 항목 추가 → 10,000개 유지
    - 파라미터 순서 무관 key 동일성

## Dev Notes

- **파일 경로**: `packages/server/src/lib/tool-cache.ts`, `packages/server/src/lib/tool-cache-config.ts`
- **도구 핸들러 실제 경로**: 구현 전 `git ls-files packages/server/src | grep tool` 로 확인
- **companyId 전달 방식**: 현재 도구 핸들러가 `ctx.companyId` 또는 `session.companyId` 형식으로 받는지 확인 필요
- **LRU 구현 방법**: `Map`은 삽입 순서 유지. 접근 시 해당 키를 delete 후 재삽입하면 삽입 순서가 갱신됨 — `Map.keys().next()` 로 가장 오래된 항목 접근 가능
- **Phase 4 Redis 전환**: `CacheStore` 인터페이스를 `InMemoryMap`에서 `RedisStore`로만 교체 — `withCache()` 호출부 수정 불필요 (D18, D21)
- **memory 계산**: `process.memoryUsage().heapUsed` 단위는 bytes → MB 변환: `/ (1024 * 1024)`
- **blocked_by**: 없음. 15.1, 15.3과 독립 개발 가능
