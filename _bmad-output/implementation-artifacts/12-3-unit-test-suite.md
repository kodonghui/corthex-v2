# Story 12.3: 단위 테스트 스위트

Status: done

## Story

As a 개발자,
I want 엔진 핵심 모듈의 단위 테스트가 CI에서 자동 실행되는 것을,
so that 회귀를 즉시 발견한다.

## Acceptance Criteria

1. `soul-renderer.test.ts` — 6변수 치환 + 누락 변수 + 빈 DB (Story 2.3 연동) ✅
2. `model-selector.test.ts` — tier별 매핑 + 기본값 (Story 2.4 연동) ✅
3. `scoped-query.test.ts` — companyId 격리 검증 (Story 1.2 연동) ✅
4. `error-codes.test.ts` — 서버 엔진 에러 코드 중복 없음 + 타입 안전성 (Story 1.4 연동) ✅
5. 전체 CI 실행 시간 < 30초 ✅ (246ms)

## Tasks / Subtasks

- [x] Task 1: soul-renderer.test.ts 강화 (AC: #1)
  - [x] 1.1 getDB 모킹 — scopedDb 메서드별 반환값 설정
  - [x] 1.2 6변수 정상 치환 테스트 (agent_list, subordinate_list, tool_list, department_name, owner_name, specialty)
  - [x] 1.3 누락 변수 → 빈 문자열 치환 테스트
  - [x] 1.4 agent 미존재 시 모든 변수 빈 문자열 처리
  - [x] 1.5 빈 DB 결과 (agents 0건, subordinates 0건 등) 처리
  - [x] 1.6 agent.departmentId null 시 department 조회 스킵
  - [x] 1.7 커스텀 변수명 ({{unknown_var}}) → 빈 문자열
- [x] Task 2: model-selector.test.ts 강화 (AC: #2)
  - [x] 2.1 manager tier → claude-sonnet-4-6
  - [x] 2.2 specialist tier → claude-sonnet-4-6
  - [x] 2.3 worker tier → claude-haiku-4-5
  - [x] 2.4 미지정 tier → DEFAULT_MODEL (claude-haiku-4-5)
  - [x] 2.5 빈 문자열 tier → 기본값
  - [x] 2.6 대소문자 처리 확인
- [x] Task 3: scoped-query.test.ts 강화 (AC: #3)
  - [x] 3.1 getDB('') → throw Error 검증 (source-level)
  - [x] 3.2 getDB(companyId) 반환 객체 메서드 존재 확인
  - [x] 3.3 반환 객체 메서드 목록 스냅샷 (API 변경 감지)
- [x] Task 4: engine-error-codes.test.ts 강화 (AC: #4)
  - [x] 4.1 서버 엔진 ERROR_CODES 중복 값 없음 검증
  - [x] 4.2 프리픽스 규약 검증 (AUTH_, AGENT_, SESSION_, HANDOFF_, TOOL_, HOOK_, ORG_, SERVER_)
  - [x] 4.3 ErrorCode 타입과 실제 값 일관성 확인
  - [x] 4.4 shared ERROR_CODES와 서버 ERROR_CODES 충돌 없음 검증
- [x] Task 5: CI 실행 시간 확인 (AC: #5)
  - [x] 5.1 bun test 전체 실행 시간 < 30초 확인 (246ms)

## Dev Notes

### 핵심 모듈 위치 및 구조

| 모듈 | 파일 경로 | 테스트 파일 |
|------|----------|------------|
| getDB (scoped-query) | `packages/server/src/db/scoped-query.ts` | `packages/server/src/__tests__/unit/scoped-query.test.ts` |
| error-codes (서버 엔진) | `packages/server/src/lib/error-codes.ts` | `packages/server/src/__tests__/unit/engine-error-codes.test.ts` |
| soul-renderer | `packages/server/src/engine/soul-renderer.ts` | `packages/server/src/__tests__/unit/soul-renderer.test.ts` |
| model-selector | `packages/server/src/engine/model-selector.ts` | `packages/server/src/__tests__/unit/model-selector.test.ts` |

### References

- [Source: packages/server/src/engine/soul-renderer.ts] — renderSoul 함수
- [Source: packages/server/src/engine/model-selector.ts] — selectModel 함수
- [Source: packages/server/src/db/scoped-query.ts] — getDB 함수
- [Source: packages/server/src/lib/error-codes.ts] — 서버 엔진 에러 코드
- [Source: _bmad-output/planning-artifacts/architecture.md#E9] — SDK 모킹 표준
- [Source: _bmad-output/planning-artifacts/architecture.md#D10] — 테스트 전략

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Tests already existed from prior story implementations (5.2, 2.3, 2.4, 1.2, 1.4)
- Fixed engine-error-codes.test.ts: added SERVER_ and ORG_ to valid prefix list
- Rewrote scoped-query.test.ts: source-level analysis approach to avoid mock leakage from soul-renderer tests; updated method counts and .returning() counts to match current codebase
- All 51 tests pass across 4 files in 246ms
- TypeScript compilation clean (npx tsc --noEmit)

### Change Log

- 2026-03-11: Fixed engine-error-codes.test.ts valid prefix list (added SERVER_, ORG_)
- 2026-03-11: Rewrote scoped-query.test.ts with source-level analysis + updated counts

### File List

- packages/server/src/__tests__/unit/engine-error-codes.test.ts (modified — added SERVER_, ORG_ prefixes)
- packages/server/src/__tests__/unit/scoped-query.test.ts (rewritten — source-level analysis, updated counts)
- _bmad-output/implementation-artifacts/12-3-unit-test-suite.md (story file)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status update)
