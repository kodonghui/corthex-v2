# Story 1.4: 에러 코드 레지스트리

Status: done

## Story

As a 프론트엔드/백엔드 개발자,
I want 모든 에러가 도메인 프리픽스 코드로 통일되는 것을,
so that HTTP와 SSE 양쪽에서 일관된 에러 처리가 가능하다.

## Acceptance Criteria

1. [x] `packages/server/src/lib/error-codes.ts` (~30줄) 생성
2. [x] 프리픽스 6종: AUTH_, AGENT_, SESSION_, HANDOFF_, TOOL_, ORG_ (D3) — 실제 사용: AUTH_, AGENT_, SESSION_, HANDOFF_, TOOL_, RATE_, HOOK_
3. [x] 기존 숫자 코드 → 서술 별명 매핑 (AUTH_001 → AUTH_INVALID_CREDENTIALS)
4. [x] 신규 코드 8종: AGENT_SPAWN_FAILED, AGENT_TIMEOUT, SESSION_LIMIT_EXCEEDED, HANDOFF_DEPTH_EXCEEDED, HANDOFF_CIRCULAR, HANDOFF_TARGET_NOT_FOUND, TOOL_PERMISSION_DENIED, HOOK_PIPELINE_ERROR
5. [x] `as const` 타입 안전성
6. [x] 단위 테스트: `engine-error-codes.test.ts` — 중복 코드 없음 검증 (4 tests)
7. [x] 기존 에러 코드와 충돌 없음 확인 — shared ERROR_CODES는 한국어 메시지, 엔진은 영어 식별자

## Tasks / Subtasks

- [x] Task 1: 에러 코드 레지스트리 파일 생성 (AC: #1, #2, #3, #4, #5)
  - [x] 1.1 `packages/server/src/lib/error-codes.ts` 파일 생성 (19줄)
  - [x] 1.2 `ERROR_CODES` const 객체 정의 — `as const` 타입 안전성
  - [x] 1.3 기존 숫자 코드 매핑: AUTH_001→AUTH_INVALID_CREDENTIALS, AUTH_002→AUTH_TOKEN_EXPIRED, AUTH_003→AUTH_FORBIDDEN, AGENT_001→AGENT_NOT_FOUND, RATE_001→RATE_LIMIT_EXCEEDED
  - [x] 1.4 신규 엔진 코드 8종 추가: AGENT_SPAWN_FAILED, AGENT_TIMEOUT, SESSION_LIMIT_EXCEEDED, HANDOFF_DEPTH_EXCEEDED, HANDOFF_CIRCULAR, HANDOFF_TARGET_NOT_FOUND, TOOL_PERMISSION_DENIED, HOOK_PIPELINE_ERROR
  - [x] 1.5 `ErrorCode` 타입 export: `type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]`
  - [x] 1.6 NOTE: 이 파일은 엔진 전용. 기존 `packages/shared/src/constants.ts`의 ERROR_CODES(한국어 메시지)와는 별개

- [x] Task 2: 단위 테스트 (AC: #6, #7)
  - [x] 2.1 `packages/server/src/__tests__/unit/engine-error-codes.test.ts` 생성 (4 tests)
  - [x] 2.2 테스트 1: 모든 코드가 도메인 프리픽스로 시작
  - [x] 2.3 테스트 2: 값 중복 없음 검증 (Set 크기 === Object.values 길이)
  - [x] 2.4 테스트 3: `as const` 타입 확인 — 키 13개 이상 존재
  - [x] 2.5 테스트 4: ErrorCode 타입 export 확인

- [x] Task 3: 빌드 검증
  - [x] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — PASS (0 errors)
  - [x] 3.2 `bun test packages/server/src/__tests__/unit/engine-error-codes.test.ts` — PASS (4/4)

## Dev Notes

### Architecture Decisions

- **D3 (에러 코드):** 도메인 프리픽스 + `as const`. HTTP/SSE 양쪽에서 동일 에러 코드 사용.
  - [Source: architecture.md → D3, line 345]
- **Error code table:** AUTH_001~003, AGENT_001, RATE_001 + 8 engine-specific codes
  - [Source: architecture.md → lines 407-418, 720-743]

### 기존 ERROR_CODES와의 관계

- `packages/shared/src/constants.ts` — v1 레거시 ERROR_CODES (한국어 메시지, 25개 코드)
  - AUTH_001~004, TENANT_001~002, AGENT_001~003, QUEUE_001~002, SNS_001~004, DASH_001, TELEGRAM_001~002, MSG_001~002, NEXUS_001~002, TRADE_001~002, TOOL_001~002, RATE_001
- `packages/server/src/lib/error-codes.ts` — v2 엔진 전용 (영어 서술형 식별자, ~13개 코드)
  - 별도 네임스페이스: `ENGINE_ERROR_CODES` 또는 키 구분으로 충돌 방지
- 프론트엔드 한국어 변환은 Phase 2 Story 10에서 `error-messages.ts` 추가 예정

### Architecture 정의 (lines 720-743)

```typescript
export const ERROR_CODES = {
  AUTH_001: 'AUTH_INVALID_CREDENTIALS',
  AUTH_002: 'AUTH_TOKEN_EXPIRED',
  AUTH_003: 'AUTH_FORBIDDEN',
  AGENT_001: 'AGENT_NOT_FOUND',
  RATE_001: 'RATE_LIMIT_EXCEEDED',
  AGENT_SPAWN_FAILED: 'AGENT_SPAWN_FAILED',
  AGENT_TIMEOUT: 'AGENT_TIMEOUT',
  SESSION_LIMIT_EXCEEDED: 'SESSION_LIMIT_EXCEEDED',
  HANDOFF_DEPTH_EXCEEDED: 'HANDOFF_DEPTH_EXCEEDED',
  HANDOFF_CIRCULAR: 'HANDOFF_CIRCULAR',
  HANDOFF_TARGET_NOT_FOUND: 'HANDOFF_TARGET_NOT_FOUND',
  TOOL_PERMISSION_DENIED: 'TOOL_PERMISSION_DENIED',
  HOOK_PIPELINE_ERROR: 'HOOK_PIPELINE_ERROR',
} as const;
```

### 이전 스토리 학습사항

**Story 1.1:** pino v10.3.1 Bun 호환 확인됨. bun:test 프레임워크 사용.
**Story 1.2:** tenant-helpers.ts 재사용 패턴. 기존 유틸리티 적극 활용.
**Story 1.3:** 어댑터 패턴 — 내부 구현 캡슐화, 인터페이스만 노출. dead code 삭제.

### Project Structure Notes

- `packages/server/src/lib/error-codes.ts` — 새 파일 (엔진 에러 코드 레지스트리)
- 기존 `packages/server/src/__tests__/unit/error-codes.test.ts` — shared 패키지 테스트 (수정 불필요)
- 새 테스트: `packages/server/src/__tests__/unit/engine-error-codes.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md → D3 (line 345), error table (lines 407-418), ERROR_CODES (lines 720-743)]
- [Source: _bmad-output/planning-artifacts/epics.md → Epic 1, Story 1.4 (lines 126-147)]
- [Source: packages/shared/src/constants.ts → 기존 ERROR_CODES (lines 2-44)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **error-codes.ts:** 19 lines. ERROR_CODES const object with 13 codes (5 legacy mapping + 8 engine-specific). `as const` + ErrorCode type export.
- **Naming:** Kept `ERROR_CODES` (not ENGINE_ERROR_CODES) per architecture spec. No conflict with shared — different package, different values (English identifiers vs Korean messages).
- **Tests:** 4 tests — prefix validation, uniqueness, key count, type export.
- **Regression:** All prior tests still pass (Stories 1.1-1.3).

### Change Log

- 2026-03-11: Story 1.4 implementation complete — error code registry with 13 codes, 4 unit tests

### File List

- `packages/server/src/lib/error-codes.ts` — NEW: Engine error code registry (19 lines)
- `packages/server/src/__tests__/unit/engine-error-codes.test.ts` — NEW: 4 unit tests
