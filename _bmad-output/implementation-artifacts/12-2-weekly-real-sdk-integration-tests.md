# Story 12.2: 주간 실제 SDK 통합 테스트

Status: done

## Story

As a QA,
I want 주 1회 실제 SDK query()를 사용한 통합 테스트가 자동 실행되는 것을,
so that SDK 업데이트로 인한 호환성 문제를 조기에 발견한다.

## Acceptance Criteria

1. `.github/workflows/weekly-sdk-test.yml` 생성 — 주간 CI 워크플로우
2. 매주 월요일 03:00 UTC 스케줄 + `workflow_dispatch` (수동 실행 가능)
3. `packages/server/src/__tests__/sdk/real-sdk.test.ts` 생성 — 실제 SDK 통합 테스트
4. 실제 `query()` 호출 → 응답 수신 확인 (비용 ~$1/회)
5. 토큰 로그 금지 (보안) — API 키가 테스트 출력에 노출되지 않아야 함
6. 실패 시 GitHub Actions 알림 — 기본 GitHub notification

## Tasks / Subtasks

- [x] Task 1: GitHub Actions 워크플로우 생성 (AC: #1, #2, #6)
  - [x] 1.1 `.github/workflows/weekly-sdk-test.yml` 생성
  - [x] 1.2 스케줄 cron: `0 3 * * 1` (매주 월요일 03:00 UTC)
  - [x] 1.3 `workflow_dispatch` 추가 — 수동 트리거 가능
  - [x] 1.4 `self-hosted` 러너 사용 (기존 deploy.yml과 동일)
  - [x] 1.5 환경변수: `ANTHROPIC_API_KEY: ${{ secrets.CORTHEX_CLI_TOKEN }}`
  - [x] 1.6 실행 명령: `bun test packages/server/src/__tests__/sdk/`
  - [x] 1.7 실패 시 GitHub 기본 알림 (별도 설정 불필요 — Actions 기본 동작)

- [x] Task 2: 실제 SDK 통합 테스트 파일 생성 (AC: #3, #4, #5)
  - [x] 2.1 `packages/server/src/__tests__/sdk/` 디렉토리 생성
  - [x] 2.2 `packages/server/src/__tests__/sdk/real-sdk.test.ts` 생성
  - [x] 2.3 테스트 1: `query()` 기본 호출 — 단순 프롬프트 → 응답 수신 확인
  - [x] 2.4 테스트 2: `query()` 스트리밍 — AsyncGenerator 반복 → assistant + result 이벤트 확인
  - [x] 2.5 테스트 3: 토큰/비용 보고 — `result.total_cost_usd >= 0`, `usage.input_tokens > 0`
  - [x] 2.6 테스트 4: 에러 핸들링 — 잘못된 API 키로 호출 시 에러 반환 확인
  - [x] 2.7 API 키 환경변수 검증: `ANTHROPIC_API_KEY` 없으면 전체 테스트 skip
  - [x] 2.8 토큰 로그 금지: 테스트 출력에 API 키 문자열 포함 여부 검증
  - [x] 2.9 타임아웃 설정: 개별 테스트 30초 (LLM 응답 대기)

- [x] Task 3: 수동 실행 스크립트 (편의) (AC: #2)
  - [x] 3.1 `package.json` scripts에 `"test:sdk": "bun test packages/server/src/__tests__/sdk/"` 추가 (packages/server/package.json)
  - [x] 3.2 README 없이 — 스크립트 자체가 문서

## Dev Notes

### Architecture Compliance

**D10 테스트 전략:**
| 레이어 | 도구 | CI 실행 | 비용 |
|--------|------|---------|------|
| 실제 SDK 통합 테스트 | bun:test + 실제 query() | 주 1회 스케줄 | ~$1/회 |

[Source: architecture.md#D10]

**핵심 원칙:**
- 이 테스트는 **모킹 없이 실제 SDK query()를 호출**한다
- Story 12.1의 모킹 헬퍼와는 완전히 분리 — `__tests__/sdk/` 디렉토리에 위치
- 단위/모킹 통합 테스트(CI 매커밋)와 달리 **주 1회만** 실행
- 비용 ~$1/회 — 최소한의 프롬프트로 검증

### SDK query() 사용법 (agent-loop.ts 실제 코드 참고)

```typescript
// packages/server/src/engine/agent-loop.ts:42-50
import { query } from '@anthropic-ai/claude-agent-sdk'

for await (const msg of query({
  prompt: message,
  options: {
    systemPrompt: soul,
    maxTurns: 10,
    permissionMode: 'bypassPermissions',
    env,
  },
})) {
  // msg.type === 'assistant' → text or tool_use blocks
  // msg.type === 'result' → success/error with cost/tokens
}
```

[Source: packages/server/src/engine/agent-loop.ts]

### SDK query() 반환 이벤트 타입

```typescript
// assistant 이벤트
{ type: 'assistant', message: { content: [{ type: 'text', text: '...' }] } }

// result 성공
{ type: 'result', subtype: 'success', total_cost_usd: number, usage: { input_tokens: number, output_tokens: number } }

// result 에러
{ type: 'result', subtype: 'error', error: string }
```

[Source: packages/server/src/__tests__/helpers/sdk-mock.ts — Mock이 이 형식을 따름]

### SDK 패키지 정보

- 패키지: `@anthropic-ai/claude-agent-sdk@0.2.72` (exact pin, ^ 없음)
- import: `import { query } from '@anthropic-ai/claude-agent-sdk'`
- env 필수: `ANTHROPIC_API_KEY` — API 키 또는 CLI 토큰
- env 선택: `CLAUDECODE: ''` — 프로그래매틱 호출 시그널

[Source: architecture.md#V1,V6 — 0.x 패키지 exact pin 전략]

### GitHub Actions 워크플로우 참고 (Architecture S8)

아키텍처 문서에 정확한 CI YAML 예시가 있음:

```yaml
# .github/workflows/weekly-sdk-test.yml
name: Weekly SDK Integration Test
on:
  schedule:
    - cron: '0 3 * * 1'  # 매주 월요일 03:00 UTC
  workflow_dispatch: {}
jobs:
  sdk-test:
    runs-on: self-hosted
    env:
      ANTHROPIC_API_KEY: ${{ secrets.CORTHEX_CLI_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - run: bun install
      - run: bun test packages/server/src/__tests__/sdk/
```

[Source: architecture.md#S8 — Weekly SDK Test CI]

### 테스트 작성 가이드라인

1. **최소 프롬프트** — 비용 절약을 위해 짧은 프롬프트 사용 (예: "Say hello in one word")
2. **타임아웃** — LLM 응답 대기 30초 (`{ timeout: 30_000 }`)
3. **환경변수 가드** — `ANTHROPIC_API_KEY` 없으면 `test.skip()` 또는 `describe.skip()`
4. **토큰 보안** — 테스트 코드에 API 키 하드코딩 금지, 환경변수만 사용
5. **에러 핸들링** — SDK 네트워크 에러 시 테스트가 타임아웃이 아닌 명확한 에러 반환
6. **테스트 격리** — 각 테스트는 독립적, 순서 의존성 없음

### 보안 주의사항 (AC #5)

- `ANTHROPIC_API_KEY` 환경변수를 GitHub Secrets (`CORTHEX_CLI_TOKEN`)에서 주입
- 테스트 출력에 API 키나 토큰이 절대 로깅되지 않아야 함
- `console.log(process.env.ANTHROPIC_API_KEY)` 같은 코드 금지
- SDK 응답 로깅 시 토큰/키 관련 필드 제외

### 테스트 프레임워크

- **bun:test** — `import { describe, test, expect, beforeAll } from 'bun:test'`
- 기존 unit 테스트와 다른 디렉토리: `__tests__/sdk/` (CI에서 분리 실행)
- `bun test packages/server/src/__tests__/sdk/` 명령으로 실행

### 기존 CI와의 관계

- `deploy.yml`: 매 push → `bun test` (unit + mocking integration) → $0 비용
- `weekly-sdk-test.yml` (NEW): 주 1회 → `bun test __tests__/sdk/` → ~$1 비용
- 두 워크플로우는 **완전히 독립** — deploy에서 sdk 테스트 실행 안 함

### Story 12.1에서 가져온 인텔리전스

**파일 구조 패턴:**
- 헬퍼: `__tests__/helpers/` — sdk-mock.ts, db-mock.ts, tool-mock.ts, index.ts
- 단위: `__tests__/unit/` — sdk-mock-demo.test.ts, sdk-mock-tea.test.ts
- SDK: `__tests__/sdk/` (NEW) — real-sdk.test.ts

**SDK Mock 패턴 참고 (모킹 아닌 실제 호출이지만 구조 참고):**
- `query()` 호출 → AsyncGenerator → `for await` 반복
- 이벤트 타입: `assistant` (텍스트/도구), `result` (성공/에러)

**테스트 코드 규칙:**
- bun:test 사용 (vitest 아님)
- 파일명: kebab-case
- imports: `import { describe, test, expect } from 'bun:test'`

[Source: _bmad-output/implementation-artifacts/12-1-sdk-mocking-standards.md]

### Project Structure Notes

- 새 파일 위치: `packages/server/src/__tests__/sdk/real-sdk.test.ts`
- CI 워크플로우: `.github/workflows/weekly-sdk-test.yml`
- package.json 스크립트: `packages/server/package.json` → `"test:sdk"`
- 기존 파일 수정: `packages/server/package.json` (scripts에 test:sdk 추가)
- 기존 테스트 영향: 없음 (완전 분리 디렉토리)

### Anti-Patterns (하지 말 것)

- SDK를 모킹하지 말 것 — 이건 **실제** SDK 테스트
- 비싼 프롬프트 사용하지 말 것 — 최소한의 토큰으로 검증
- API 키 하드코딩하지 말 것 — 환경변수만 사용
- deploy.yml에 sdk 테스트 추가하지 말 것 — 별도 워크플로우로 분리
- `__tests__/unit/`에 넣지 말 것 — `__tests__/sdk/` 디렉토리에 위치
- 테스트 출력에 API 키/토큰 노출하지 말 것

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#D10] — 테스트 전략 (단위+모킹통합 CI, 실제SDK 주1회)
- [Source: _bmad-output/planning-artifacts/architecture.md#S8] — Weekly SDK Test CI YAML 예시
- [Source: _bmad-output/planning-artifacts/architecture.md#E9] — SDK 모킹 표준 (참고용 — 이 스토리는 모킹 안 함)
- [Source: _bmad-output/planning-artifacts/epics.md#Story12.2] — 스토리 요구사항
- [Source: packages/server/src/engine/agent-loop.ts] — 실제 query() 사용 코드
- [Source: packages/server/src/engine/types.ts] — SessionContext, SSEEvent 타입
- [Source: packages/server/src/__tests__/helpers/sdk-mock.ts] — Mock 헬퍼 (구조 참고)
- [Source: _bmad-output/implementation-artifacts/12-1-sdk-mocking-standards.md] — Story 12.1 완료 인텔리전스

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- 5 tests pass, 0 fail, 17 expect() calls (real-sdk.test.ts — ran with real API key)
- tsc --noEmit: 0 errors
- Existing tests (error-codes, rate-limit, crypto): 14 pass, 0 fail — no regressions

### Completion Notes List

- Created `.github/workflows/weekly-sdk-test.yml` following Architecture S8 spec exactly
- Workflow: cron `0 3 * * 1` (Monday 03:00 UTC) + `workflow_dispatch` for manual runs
- Uses `self-hosted` runner, `ANTHROPIC_API_KEY` from `secrets.CORTHEX_CLI_TOKEN`
- Created `packages/server/src/__tests__/sdk/real-sdk.test.ts` with 5 tests:
  1. Basic query() call — prompt → response validation
  2. Streaming — AsyncGenerator event ordering (assistant before result)
  3. Cost/token reporting — total_cost_usd, input_tokens, output_tokens
  4. Error handling — invalid API key → error result or thrown exception
  5. Token security — API key not leaked in test output
- Environment guard: `describe.skip` when `ANTHROPIC_API_KEY` is not set
- All tests use 30s timeout for LLM response latency
- Minimal prompts ("Reply with exactly one word: hello") to keep cost ~$1/run
- Added `test:sdk` script to `packages/server/package.json`
- Code Review: Refactored TEA tests to use shared `beforeAll` SDK import (reduces redundant imports)
- Code Review: Added secret availability check to CI workflow (prevents false green on missing secret)
- Code Review: Updated File List with TEA test file

### File List

- `.github/workflows/weekly-sdk-test.yml` (NEW) — Weekly SDK integration test CI workflow
- `packages/server/src/__tests__/sdk/real-sdk.test.ts` (NEW) — 5 real SDK integration tests
- `packages/server/src/__tests__/sdk/real-sdk-tea.test.ts` (NEW) — 7 TEA risk-based tests
- `packages/server/package.json` (MODIFIED) — Added `test:sdk` script
