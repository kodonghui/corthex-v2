# Story 1.5: 세션 Rate Limiter 미들웨어

Status: done

## Story

As a 시스템 관리자,
I want 동시 에이전트 세션이 20개를 초과하지 않는 것을,
so that 4코어 서버의 CPU가 포화되지 않는다.

## Acceptance Criteria

1. [x] `packages/server/src/middleware/rate-limiter.ts` 생성 (40줄)
2. [x] 동시 세션 제한 (NFR-SC1: 20) — Map<string, number> 기반 활성 세션 카운터
3. [x] 초과 시 HTTP 429 + `SESSION_LIMIT_EXCEEDED` 에러 코드 (Story 1.4 import)
4. [x] 세션 종료 시 카운트 감소 (`releaseSession()` 함수)
5. [x] 설정 가능: 환경변수 `MAX_CONCURRENT_SESSIONS` (기본 20)

## Tasks / Subtasks

- [ ] Task 1: 동시 세션 제한 미들웨어 구현 (AC: #1, #2, #3, #4, #5)
  - [ ] 1.1 `packages/server/src/middleware/rate-limiter.ts` 파일 생성
  - [ ] 1.2 `SessionLimiter` 구현: 활성 세션 카운터 (Map<string, number> or simple counter)
  - [ ] 1.3 `sessionLimiter()` 미들웨어 export: 동시 세션 수 체크 → 초과 시 429 + SESSION_LIMIT_EXCEEDED
  - [ ] 1.4 `releaseSession(sessionId: string)` export: 세션 종료 시 카운트 감소
  - [ ] 1.5 `MAX_CONCURRENT_SESSIONS` 환경변수 지원 (기본 20)
  - [ ] 1.6 `getActiveSessionCount()` export: 현재 활성 세션 수 조회 (모니터링용)
  - [ ] 1.7 NOTE: 기존 `rate-limit.ts` (요청 빈도 제한)와 별개 — 이 파일은 동시 세션 수 제한

- [ ] Task 2: 단위 테스트 (AC: #2, #3, #4, #5)
  - [ ] 2.1 `packages/server/src/__tests__/unit/session-limiter.test.ts` 생성
  - [ ] 2.2 테스트 1: 세션 제한 미만에서 acquireSession 성공
  - [ ] 2.3 테스트 2: 제한 도달 시 acquireSession 실패 (SESSION_LIMIT_EXCEEDED)
  - [ ] 2.4 테스트 3: releaseSession 후 다시 acquire 가능
  - [ ] 2.5 테스트 4: MAX_CONCURRENT_SESSIONS 환경변수 적용
  - [ ] 2.6 테스트 5: getActiveSessionCount() 정확한 카운트 반환

- [ ] Task 3: 빌드 검증
  - [ ] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [ ] 3.2 `bun test packages/server/src/__tests__/unit/session-limiter.test.ts` — PASS

## Dev Notes

### Architecture Decisions

- **NFR-SC1:** 동시 세션 상한 20. CPU 4코어 기준. CLI rate limit으로 추가 조정 가능
  - [Source: architecture.md → line 209, 994-995]
- **D3 에러 코드:** SESSION_LIMIT_EXCEEDED (Story 1.4에서 정의)
  - [Source: packages/server/src/lib/error-codes.ts → line 12]

### 기존 rate-limit.ts와의 관계

- `packages/server/src/middleware/rate-limit.ts` — 요청 빈도 제한 (IP 기반, 분당 N회)
  - loginRateLimit: 분당 5회
  - apiRateLimit: 분당 100회
- `packages/server/src/middleware/rate-limiter.ts` — 동시 세션 수 제한 (전체 서버 기준, 최대 20)
  - 완전히 다른 개념: 요청 빈도 vs 동시 활성 세션 수

### hono-rate-limiter 패키지

- package.json에 등록되어 있으나 node_modules에 설치되지 않음
- hono-rate-limiter는 요청 빈도 제한용 — 동시 세션 카운팅에는 부적합
- 간단한 Map/counter 기반 구현이 더 적합 (세션 acquire/release 패턴)

### 이전 스토리 학습사항

**Story 1.4:** ERROR_CODES에 SESSION_LIMIT_EXCEEDED 코드 정의 완료 — import하여 사용

### References

- [Source: _bmad-output/planning-artifacts/architecture.md → NFR-SC1 (line 209), rate-limiter.ts (line 855, 995)]
- [Source: _bmad-output/planning-artifacts/epics.md → Epic 1, Story 1.5 (lines 149-166)]
- [Source: packages/server/src/middleware/rate-limit.ts → 기존 요청 빈도 제한]
- [Source: packages/server/src/lib/error-codes.ts → SESSION_LIMIT_EXCEEDED]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **rate-limiter.ts:** 40 lines. Map-based concurrent session counter. acquireSession/releaseSession/getActiveSessionCount + sessionLimiter middleware.
- **Design:** hono-rate-limiter unused — request rate limiting package, not for session counting. Custom Map implementation is simpler and correct.
- **Error integration:** imports ERROR_CODES.SESSION_LIMIT_EXCEEDED from Story 1.4.
- **Tests:** 8 tests — 5 dev + 3 TEA (limit exceeded, ERROR_CODES integration, env var source).
- **Regression:** All prior tests still pass (Stories 1.1-1.4).

### Change Log

- 2026-03-11: Story 1.5 implementation complete — session rate limiter middleware, 8 unit tests

### File List

- `packages/server/src/middleware/rate-limiter.ts` — NEW: Concurrent session limiter (40 lines)
- `packages/server/src/__tests__/unit/session-limiter.test.ts` — NEW: 8 unit tests
- `_bmad-output/test-artifacts/tea-1-5-session-rate-limiter.md` — TEA artifact
