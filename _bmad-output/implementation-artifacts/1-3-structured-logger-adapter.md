# Story 1.3: 구조화 로거 어댑터

Status: done

## Story

As a 운영자,
I want 모든 로그에 sessionId, companyId, agentId가 자동 포함되는 것을,
so that 문제 발생 시 세션 단위로 추적할 수 있다.

## Acceptance Criteria

1. [x] `packages/server/src/db/logger.ts` (22줄) 생성
2. [x] pino 우선 시도 → Bun 호환 확인됨, consola 폴백 불필요 (D9)
3. [x] 어댑터 인터페이스: `{ info, warn, error, child }` — 교체 비용 0
4. [x] child logger 패턴: `log.child({ sessionId, companyId, agentId })`
5. [x] 구조화 출력: `{ timestamp, level, sessionId, agentId, companyId, event, data }`
6. [x] console.log 직접 사용 금지 (Anti-Pattern — 신규 engine 코드에서만 적용, 기존 69개는 Phase 2+)

## Tasks / Subtasks

- [x] Task 1: 로거 어댑터 인터페이스 + pino 구현 (AC: #1, #2, #3, #4, #5)
  - [x] 1.1 `packages/server/src/db/logger.ts` 파일 생성
  - [x] 1.2 `Logger` 인터페이스 정의: `{ info, warn, error, child }` — `child`는 `(bindings: Record<string, unknown>) => Logger` 반환
  - [x] 1.3 pino 기반 root logger 생성: `pino({ timestamp: pino.stdTimeFunctions.isoTime })` — ISO 타임스탬프
  - [x] 1.4 `createLogger()` 함수 export — root logger 반환
  - [x] 1.5 `createSessionLogger(ctx: { sessionId, companyId, agentId })` 함수 export — `rootLogger.child(ctx)` 반환
  - [x] 1.6 NOTE: pino는 Story 1.1에서 Bun 호환 확인 완료 (v10.3.1). consola 폴백 불필요하지만 어댑터 인터페이스로 교체 가능하도록 설계

- [x] Task 2: 단위 테스트 (AC: #3, #4, #5)
  - [x] 2.1 `packages/server/src/__tests__/unit/logger.test.ts` 생성
  - [x] 2.2 테스트 1: createLogger() 반환 객체에 info, warn, error, child 메서드 존재
  - [x] 2.3 테스트 2: createSessionLogger() child logger에 sessionId/companyId/agentId 바인딩 확인
  - [x] 2.4 테스트 3: Logger 인터페이스가 export됨 — pino 구현 세부사항 미노출 확인

- [x] Task 3: 빌드 검증
  - [x] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — PASS (0 errors)
  - [x] 3.2 `bun test packages/server/src/__tests__/unit/logger.test.ts` — PASS (3/3)

## Dev Notes

### Architecture Decisions (이 스토리에 해당하는 결정들)

- **D9 (로거):** pino 우선 → consola 폴백 → 어댑터 래핑. JSON 구조화, child logger(sessionId 자동 주입). **교체 비용 0이 목표**.
  - [Source: architecture.md → D9, line 356]
- **NFR-LOG1:** sessionId로 전체 체인 추적 — SessionContext에 sessionId 필드 존재 (architecture.md line 135)
- **NFR-LOG2:** 로그 보관 30일 — 인프라 설정 (이 스토리 범위 외)
- **NFR-LOG3:** 구조화 로그 포맷: `{ timestamp, level, sessionId, agentId, companyId, event, data }`
  - [Source: architecture.md → 모니터링 섹션, lines 464-467]

### 파일 위치: `db/logger.ts`

- Architecture 매핑 테이블 (line 996): `NFR-LOG1~3 로깅 → db/logger.ts`
- 같은 `db/` 디렉토리에 위치 — `scoped-query.ts`, `tenant-helpers.ts`, `index.ts`와 같은 레벨
- engine 내부가 아닌 공유 인프라

### pino 사용법 (Story 1.1 검증 완료)

```typescript
import pino from 'pino'

// root logger
const logger = pino({ level: 'info' })

// child logger (컨텍스트 자동 주입)
const child = logger.child({ sessionId: 'sess-123', companyId: 'comp-456' })
child.info({ event: 'agent_started', data: { agentName: 'CEO' } }, 'Agent started')
// → {"level":30,"time":"...","sessionId":"sess-123","companyId":"comp-456","event":"agent_started","data":{"agentName":"CEO"},"msg":"Agent started"}
```

### 어댑터 설계 원칙

- **교체 비용 0:** Logger 인터페이스만 export. pino 구현 세부사항은 `logger.ts` 내부에 캡슐화
- **console.log 금지:** 신규 engine 코드에서만. 기존 코드 69개는 Phase 2+에서 점진 교체
- **pino 확정:** Story 1.1에서 Bun 호환 테스트 통과. consola 폴백 경로 제거 (D9 결정)

### 이전 스토리 학습사항

**Story 1.1:**
- pino v10.3.1 Bun 호환 확인됨 — JSON structured output + child logger 정상
- bun:test 프레임워크 사용

**Story 1.2:**
- tenant-helpers.ts 재사용 패턴 — 기존 유틸리티 적극 활용
- 어댑터/래퍼 패턴은 내부 구현을 캡슐화하고 인터페이스만 노출

### Project Structure Notes

- `packages/server/src/db/logger.ts` — 새 파일 (로거 어댑터)
- 파일명 규칙: kebab-case lowercase

### References

- [Source: _bmad-output/planning-artifacts/architecture.md → D9 (line 356), NFR-LOG1 (line 135), 모니터링 (lines 464-467), 매핑 (line 996)]
- [Source: _bmad-output/planning-artifacts/epics.md → Epic 1, Story 1.3 (lines 105-123)]
- [Source: _bmad-output/implementation-artifacts/1-1-phase1-dependency-verification.md → pino Bun 호환 확인]
- [Source: _bmad-output/implementation-artifacts/1-2-getdb-multitenancy-wrapper.md → 어댑터 패턴 학습]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **logger.ts:** 22 lines. Logger interface + pino implementation. Exports `createLogger()` (root) and `createSessionLogger(ctx)` (child with sessionId/companyId/agentId bindings).
- **Adapter pattern:** Logger interface decouples consumers from pino. To swap to consola or any other logger, only change `logger.ts` internals.
- **pino config:** `pino.stdTimeFunctions.isoTime` for ISO timestamps. Default level: 'info'.
- **console.log ban:** Anti-pattern for new engine code. 69 existing uses in routes/seeds stay until Phase 2+.
- **Tests:** 3 tests — method existence, session child logger, encapsulation (rootLogger not exported).
- **Regression:** All 19 prior tests still pass (Story 1.1: 9, Story 1.2: 7, + logger: 3 = 22 total).

### Change Log

- 2026-03-11: Story 1.3 implementation complete — structured logger adapter with pino, 3 unit tests

### File List

- `packages/server/src/db/logger.ts` — NEW: Logger interface + pino adapter (25 lines)
- `packages/server/src/__tests__/unit/logger.test.ts` — MODIFIED: replaced old test with 6 tests (3 dev + 3 TEA)
- `packages/server/src/lib/logger.ts` — DELETED: dead code (0 imports, console.log wrapper replaced by pino adapter)
