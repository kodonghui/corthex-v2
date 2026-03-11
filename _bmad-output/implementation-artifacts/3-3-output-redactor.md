# Story 3.3: output-redactor — PostToolUse Hook

Status: done

## Story

As a 보안 시스템,
I want credential-scrubber가 놓친 추가 민감 패턴도 마스킹되는 것을,
so that 이중 방어선으로 정보 유출을 방지한다.

## Acceptance Criteria

1. [ ] `packages/server/src/engine/hooks/output-redactor.ts` (~15줄) 생성
2. [ ] PostToolUse 시그니처: `(ctx, toolName, toolOutput) => string` (E2)
3. [ ] 커스텀 패턴: 이메일, 전화번호, 주민번호(Korean resident ID), 계좌번호(bank account)
4. [ ] 회사별 추가 패턴 설정 가능 (DB에서 로드 — Phase 1에서는 하드코딩, TODO 주석)
5. [ ] PostToolUse 순서: **2번째** — scrubber 이후, delegation-tracker 이전 (D4)
6. [ ] 단위 테스트: 4개+ 패턴 마스킹 확인

## Tasks / Subtasks

- [x] Task 1: output-redactor.ts 구현 (AC: #1~#5)
  - [x] 1.1 `output-redactor.ts` 파일 생성 in `engine/hooks/`
  - [x] 1.2 PostToolUse 시그니처: `(ctx, toolName, toolOutput) => string` (동기 함수)
  - [x] 1.3 정규식 패턴: 이메일, 전화번호, 주민번호, 계좌번호
  - [x] 1.4 패턴 매칭 → `[REDACTED]` 치환 (credential-scrubber와 구분)
  - [x] 1.5 TODO 주석: 회사별 DB 패턴 로딩 (Phase 2+)

- [x] Task 2: 단위 테스트 (AC: #6)
  - [x] 2.1 `packages/server/src/__tests__/unit/output-redactor.test.ts` 생성
  - [x] 2.2 테스트: 이메일 마스킹 (user@example.com)
  - [x] 2.3 테스트: 전화번호 마스킹 (010-1234-5678, 02-123-4567)
  - [x] 2.4 테스트: 주민번호 마스킹 (900101-1234567)
  - [x] 2.5 테스트: 계좌번호 마스킹 (110-123-456789)
  - [x] 2.6 테스트: 민감 정보 없는 문자열 → 원본 반환
  - [x] 2.7 테스트: 여러 패턴 동시 존재 → 모두 마스킹

- [x] Task 3: 빌드 검증
  - [x] 3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 3.2 `bun test packages/server/src/__tests__/unit/output-redactor.test.ts` — 11 PASS

## Dev Notes

### Architecture Decisions

- **D4 (Hook 순서):** PostToolUse에서 output-redactor가 **2번째**. credential-scrubber(1st) 이후, delegation-tracker(3rd) 이전.
- **E2 (Hook 구현 표준):** PostToolUse 시그니처: `(ctx: SessionContext, toolName: string, toolOutput: string) => string`. 동기 함수.
- **분리 원칙:** credential-scrubber = 범용 (API 키, 토큰), output-redactor = 도메인 특화 (한국 PII).
- **마스킹 형식:** `[REDACTED]` (credential-scrubber의 `***REDACTED***`와 구분하여 어떤 레이어에서 마스킹됐는지 추적 가능)

### Function Signature

```typescript
export function outputRedactor(
  _ctx: SessionContext,
  _toolName: string,
  toolOutput: string,
): string
```

### Imports

```typescript
import type { SessionContext } from '../types'
```

### 정규식 패턴 설계

```typescript
const REDACTED = '[REDACTED]'

const PII_PATTERNS: RegExp[] = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,          // Email
  /\b0\d{1,2}[-.]?\d{3,4}[-.]?\d{4}\b/g,                       // Korean phone (010-1234-5678, 02-123-4567)
  /\b\d{6}[-]?\d{7}\b/g,                                         // Korean resident ID (주민번호 900101-1234567)
  /\b\d{3,4}[-]?\d{2,4}[-]?\d{4,6}\b/g,                         // Bank account (계좌번호)
]
```

Note: 계좌번호 패턴은 broad하므로 전화번호와 겹칠 수 있음. 순서를 조정하여 전화번호를 먼저 매칭.

### Previous Story Intelligence (Story 3.2)

- **패턴:** credential-scrubber와 동일 구조 (정규식 배열 + replace 루프)
- **차이점:** JSON 파싱 불필요 (PII는 텍스트 패턴만), DB 로드 없음 (Phase 1)
- **테스트:** 모킹 불필요 — 순수 함수
- **빌드:** tsc 0 errors + bun test PASS 필수

### Project Structure Notes

- `packages/server/src/engine/hooks/` 디렉토리 존재
- 테스트: `packages/server/src/__tests__/unit/output-redactor.test.ts`

### References

- [Source: epics.md → Story 3.3 (lines 401-417)]
- [Source: architecture.md → D4 (Hook 순서), E2 (Hook 구현 표준)]
- [Source: engine/types.ts → SessionContext]
- [Source: Story 3.2 → credential-scrubber 패턴, 정규식 루프 구조]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **output-redactor.ts:** 24 lines. Synchronous PostToolUse hook with 4 Korean PII regex patterns (email, phone, resident ID, bank account). TODO for Phase 2+ company-specific DB patterns.
- **Masking format:** `[REDACTED]` (distinct from credential-scrubber's `***REDACTED***` for audit trail)
- **Tests:** 11 tests — 7 functional (email, mobile phone, landline, resident ID, bank account, clean passthrough, multi-pattern) + 4 TEA P0 source introspection.
- **tsc:** 0 errors. All 11 tests pass.

### File List

- `packages/server/src/engine/hooks/output-redactor.ts` — NEW: PostToolUse PII redactor (24 lines)
- `packages/server/src/__tests__/unit/output-redactor.test.ts` — NEW: 11 unit tests (7 functional + 4 TEA)
