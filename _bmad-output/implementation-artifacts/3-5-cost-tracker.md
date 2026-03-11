# Story 3.5: cost-tracker — Stop Hook

Status: review

## Story

As a 관리자/CEO,
I want 모든 에이전트 호출의 토큰 사용량과 비용이 자동 기록되는 것을,
so that 에이전트별/모델별/부서별 비용을 추적할 수 있다.

## Acceptance Criteria

1. [x] `packages/server/src/engine/hooks/cost-tracker.ts` (~20줄) 생성
2. [x] Stop 시그니처: `(ctx, usage: { inputTokens, outputTokens, model }) => Promise<void>` (E2)
3. [x] 비용 계산: 모델별 가격 × 토큰 수
4. [x] DB 기록: costRecords 테이블 (agent_id, model, input_tokens, output_tokens, cost_usd_micro, session_id)
5. [x] 핸드오프 체인 내 각 에이전트별 개별 기록
6. [x] getDB(companyId).insertCostRecord() 추가 (scoped-query.ts 확장)
7. [x] 단위 테스트: 비용 계산, DB 기록 호출 검증

## Tasks / Subtasks

- [x] Task 1: scoped-query.ts에 insertCostRecord 추가 (AC: #6)
  - [x] 1.1 costRecords 테이블 import 추가
  - [x] 1.2 insertCostRecord 메서드 추가

- [x] Task 2: cost-tracker.ts 구현 (AC: #1~#5)
  - [x] 2.1 `cost-tracker.ts` 파일 생성 in `engine/hooks/`
  - [x] 2.2 Stop 시그니처: async function
  - [x] 2.3 모델별 가격 상수 (USD per token)
  - [x] 2.4 비용 계산: (inputTokens × inputPrice + outputTokens × outputPrice) → costUsdMicro
  - [x] 2.5 getDB().insertCostRecord() 호출

- [x] Task 3: 단위 테스트 (AC: #7)
  - [x] 3.1 `packages/server/src/__tests__/unit/cost-tracker.test.ts` 생성
  - [x] 3.2 테스트: 비용 정확 계산 (모델별 가격)
  - [x] 3.3 테스트: DB insertCostRecord 호출 검증
  - [x] 3.4 테스트: 올바른 필드 전달 (agentId, model, tokens, costUsdMicro, sessionId)
  - [x] 3.5 테스트: unknown 모델 → 기본 가격 적용

- [x] Task 4: 빌드 검증
  - [x] 4.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 4.2 `bun test` on test file — 9 pass, 0 fail

## Dev Notes

### Architecture Decisions

- **Stop Hook:** 세션 종료 시 1회 호출. 각 에이전트 실행 완료 후 비용 기록.
- **D1 (DB 격리):** getDB(ctx.companyId).insertCostRecord()으로만 접근.
- **costUsdMicro:** 정수 (1 = $0.000001). 부동소수점 오류 방지.

### Model Pricing (Phase 1 hardcoded)

```typescript
const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6': { input: 3, output: 15 },    // $3/$15 per 1M tokens
  'claude-haiku-4-5': { input: 0.8, output: 4 },    // $0.80/$4 per 1M tokens
  'claude-opus-4-6': { input: 15, output: 75 },     // $15/$75 per 1M tokens
}
// prices in USD per 1M tokens → convert to micro-USD per token
```

### DB Schema: costRecords

```
id, companyId, agentId, sessionId, provider, model, inputTokens, outputTokens, costUsdMicro, source, isBatch, createdAt
```

### References

- [Source: epics.md → Story 3.5 (lines 443-461)]
- [Source: db/schema.ts → costRecords (lines 551-568)]
- [Source: engine/model-selector.ts → TIER_MODEL_MAP]
- [Source: db/scoped-query.ts → getDB pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- dev-story complete: all 4 tasks done, 9/9 tests pass, 0 type errors
- scoped-query.ts extended with costRecords import + insertCostRecord method
- cost-tracker.ts: 39 lines, Stop hook signature, 3 model prices + default, costUsdMicro integer math
- Tests: 5 functional (sonnet calc, haiku calc, field pass-through, unknown model default, zero tokens) + 4 TEA P0 introspection

### File List

- `packages/server/src/engine/hooks/cost-tracker.ts` — NEW (39 lines)
- `packages/server/src/db/scoped-query.ts` — MODIFIED (added costRecords import + insertCostRecord)
- `packages/server/src/__tests__/unit/cost-tracker.test.ts` — NEW (137 lines, 9 tests)
