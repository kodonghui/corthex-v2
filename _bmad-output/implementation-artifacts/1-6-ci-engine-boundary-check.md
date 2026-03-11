# Story 1.6: CI Engine 경계 검증 스크립트

Status: done

## Story

As a 개발자,
I want engine/ 내부 모듈이 외부에서 직접 import되면 CI가 실패하는 것을,
so that 아키텍처 경계(E8, E10)가 자동으로 보호된다.

## Acceptance Criteria

1. [x] `.github/scripts/engine-boundary-check.sh` 생성 (33줄)
2. [x] `grep -rn "from.*engine/hooks/"` routes/, lib/, middleware/ → 발견 시 exit 1
3. [x] `grep -rn "from.*engine/soul-renderer"` routes/, lib/, middleware/ → 발견 시 exit 1
4. [x] `grep -rn "from.*engine/model-selector"` routes/, lib/, middleware/ → 발견 시 exit 1
5. [x] `deploy.yml`에 step 추가 (빌드 전 실행)
6. [x] 허용: `engine/agent-loop`, `engine/types` import만 — 스크립트에 문서화

## Tasks / Subtasks

- [ ] Task 1: 경계 검증 스크립트 생성 (AC: #1, #2, #3, #4, #6)
  - [ ] 1.1 `.github/scripts/` 디렉토리 생성
  - [ ] 1.2 `engine-boundary-check.sh` 생성 — grep으로 금지 패턴 검색
  - [ ] 1.3 금지 패턴 3종: `engine/hooks/`, `engine/soul-renderer`, `engine/model-selector`
  - [ ] 1.4 검색 대상: `packages/server/src/routes/`, `packages/server/src/lib/`
  - [ ] 1.5 허용 패턴 문서화: `engine/agent-loop`, `engine/types` (검사 대상 아님)
  - [ ] 1.6 chmod +x

- [ ] Task 2: deploy.yml 수정 (AC: #5)
  - [ ] 2.1 빌드 전 step으로 engine-boundary-check.sh 추가

- [ ] Task 3: 단위 테스트 (스크립트 동작 검증)
  - [ ] 3.1 `packages/server/src/__tests__/unit/engine-boundary.test.ts` — bun:test로 금지 import 부재 검증

- [ ] Task 4: 빌드 검증
  - [ ] 4.1 `bash .github/scripts/engine-boundary-check.sh` — PASS (exit 0)
  - [ ] 4.2 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors

## Dev Notes

### Architecture Decisions

- **E8:** engine/ 공개 API = `agent-loop.ts` + `types.ts` 2개만. 나머지는 내부 전용.
  - [Source: architecture.md → E8, line 681-687]
- **E10:** CI 경계 검증. engine/ 외부에서 hooks 직접 import 시 빌드 실패.
  - [Source: architecture.md → E10, lines 708-718]

### 금지 import 패턴 (engine/ 외부에서)

- `from.*engine/hooks/` — Hook 파이프라인 내부
- `from.*engine/soul-renderer` — 시스템 프롬프트 렌더링 내부
- `from.*engine/model-selector` — 모델 선택 로직 내부
- `from.*engine/sse-adapter` — SSE 어댑터 내부 (architecture E8에 명시)

### 허용 import

- `engine/agent-loop` — runAgent() 진입점
- `engine/types` — SessionContext, SSEEvent 등 타입

### References

- [Source: architecture.md → E8 (line 681), E10 (lines 708-718), tree (lines 809-812)]
- [Source: epics.md → Story 1.6 (lines 169-187)]
- [Source: .github/workflows/deploy.yml → CI steps (lines 42-54)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **engine-boundary-check.sh:** 33 lines. grep-based boundary check for 4 forbidden patterns across routes/, lib/, middleware/.
- **deploy.yml:** Added "Engine boundary check (E10)" step before build.
- **Extra:** Added sse-adapter to forbidden patterns (E8 mentions it but epics didn't). Added middleware/ to search dirs.
- **Tests:** 7 tests — 4 dev + 3 TEA (deploy.yml integration, executable permission, middleware/ coverage).

### Change Log

- 2026-03-11: Story 1.6 implementation complete — CI engine boundary check script, deploy.yml integration, 7 unit tests

### File List

- `.github/scripts/engine-boundary-check.sh` — NEW: E10 boundary check (33 lines)
- `.github/workflows/deploy.yml` — MODIFIED: added boundary check step
- `packages/server/src/__tests__/unit/engine-boundary.test.ts` — NEW: 7 unit tests
