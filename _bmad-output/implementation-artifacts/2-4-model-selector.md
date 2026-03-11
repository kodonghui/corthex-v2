# Story 2.4: model-selector.ts — 티어→모델 매핑

Status: done

## Story

As a 에이전트 시스템,
I want 에이전트 tier에 따라 적절한 Claude 모델이 자동 선택되는 것을,
so that Manager는 Sonnet, Worker는 Haiku로 비용이 최적화된다.

## Acceptance Criteria

1. [ ] `packages/server/src/engine/model-selector.ts` (~20줄) 생성
2. [ ] Phase 1: 에이전트 tier enum(manager/specialist/worker) → Claude 모델 매핑 (하드코딩)
3. [ ] Phase 1~4: Claude 전용 (claude-sonnet-4-6, claude-haiku-4-5) (E6)
4. [ ] tier 미설정/unknown 시 기본값: claude-haiku-4-5
5. [ ] 단위 테스트: `model-selector.test.ts` — tier별 매핑 + 기본값 케이스
6. [ ] engine 내부 전용 (E8: 외부 import 금지)

## Tasks / Subtasks

- [x] Task 1: model-selector.ts 구현 (AC: #1, #2, #3, #4, #6)
  - [x]1.1 `packages/server/src/engine/model-selector.ts` 파일 생성
  - [x]1.2 `selectModel(tier: string): string` 함수 export
  - [x]1.3 하드코딩 tier→model 매핑: manager→sonnet, specialist→sonnet, worker→haiku
  - [x]1.4 unknown/undefined tier → claude-haiku-4-5 기본값

- [x] Task 2: 단위 테스트 (AC: #5)
  - [x]2.1 `packages/server/src/__tests__/unit/model-selector.test.ts` 생성
  - [x]2.2 테스트 1: manager → claude-sonnet-4-6
  - [x]2.3 테스트 2: specialist → claude-sonnet-4-6
  - [x]2.4 테스트 3: worker → claude-haiku-4-5
  - [x]2.5 테스트 4: unknown tier → claude-haiku-4-5 (기본값)
  - [x]2.6 테스트 5: empty string tier → claude-haiku-4-5

- [x] Task 3: 빌드 검증
  - [x]3.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x]3.2 `bun test packages/server/src/__tests__/unit/model-selector.test.ts` — PASS

## Dev Notes

### Architecture Decisions

- **E6 (model-selector 티어 매핑):** `tierConfig.modelPreference → SDK model string`. Phase 1~4 Claude 전용. 라우팅 로직 추가 금지.
- **E8 (engine 경계):** model-selector.ts는 engine 내부 전용. agent-loop.ts에서만 호출.
- **llm-router.ts 동결:** Phase 5+ 재설계. 라우팅 로직 추가 금지.
- **tier_configs 테이블:** Story 8.1 (Phase 3)에서 생성. Phase 1은 하드코딩 매핑 사용.

### Function Signature

```typescript
export function selectModel(tier: string): string
```

순수 함수 — DB 접근 없음. Phase 1은 하드코딩 매핑만.

### Phase 1 Tier → Model Mapping

| Tier | Model | 이유 |
|------|-------|------|
| `manager` | `claude-sonnet-4-6` | 고급 추론/오케스트레이션 |
| `specialist` | `claude-sonnet-4-6` | 전문 분석/작업 |
| `worker` | `claude-haiku-4-5` | 빠른 반복/단순 작업, 비용 절감 |
| (기본값) | `claude-haiku-4-5` | 안전한 기본값, 최소 비용 |

### DB Schema Context

```typescript
// schema.ts — 현재 tier enum
export const agentTierEnum = pgEnum('agent_tier', ['manager', 'specialist', 'worker'])

// agents table
tier: agentTierEnum('tier').notNull().default('specialist'),
modelName: varchar('model_name', { length: 100 }).notNull().default('claude-haiku-4-5'),
```

**참고:** agents.modelName 필드가 이미 존재하지만, model-selector는 tier 기반으로 동적 결정. Phase 3+ tier_configs 테이블 생성 후 DB 조회로 전환 예정.

### Implementation (~20 lines)

```typescript
const DEFAULT_MODEL = 'claude-haiku-4-5'

const TIER_MODEL_MAP: Record<string, string> = {
  manager: 'claude-sonnet-4-6',
  specialist: 'claude-sonnet-4-6',
  worker: 'claude-haiku-4-5',
}

export function selectModel(tier: string): string {
  return TIER_MODEL_MAP[tier] || DEFAULT_MODEL
}
```

### Previous Story Intelligence (Story 2.3)

- **패턴:** bun:test로 순수 함수 테스트 — mock 불필요 (DB 접근 없음)
- **교훈:** E8 경계 테스트가 이미 soul-renderer 포함 — model-selector도 자동 적용됨
- **구조:** 최소 코드 (~15줄), 테스트 5개

### Anti-Patterns to Avoid

- DB 접근 추가 (Phase 1에서는 하드코딩만)
- llm-router.ts에 라우팅 로직 추가 (동결)
- barrel export(index.ts) 생성 금지
- GPT/Gemini 모델 추가 (Phase 1~4는 Claude 전용)

### References

- [Source: architecture.md → E6 (lines 663-665), E8 (lines 681-687)]
- [Source: epics.md → Story 2.4 (lines 276-293)]
- [Source: schema.ts → agentTierEnum (line 19), agents.tier (line 151)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **model-selector.ts:** 18 lines. Pure function `selectModel(tier)` — hardcoded tier→model map. No DB access (Phase 1).
- **Mapping:** manager→sonnet, specialist→sonnet, worker→haiku, default→haiku
- **Tests:** 5 tests — all 3 tiers + unknown tier + empty string. No mocking needed (pure function).
- **tsc:** 0 errors. All 5 tests pass.

### Change Log

- 2026-03-11: Story 2.4 implementation complete — model-selector.ts + 5 unit tests
- 2026-03-11: TEA — 3 risk-based tests added (8 total)
- 2026-03-11: QA — all 6 ACs verified PASS
- 2026-03-11: Code Review — 0 issues (clean pure function)

### File List

- `packages/server/src/engine/model-selector.ts` — NEW: Tier→Model mapping (18 lines)
- `packages/server/src/__tests__/unit/model-selector.test.ts` — NEW: 5 unit tests
