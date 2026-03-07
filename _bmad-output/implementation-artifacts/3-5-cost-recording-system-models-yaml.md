# Story 3.5: 비용 기록 시스템 (models.yaml + CostTracker)

Status: done

## Story

As a **system (LLM Router / CostTracker)**,
I want **every LLM call to automatically record token counts and calculate cost using the models.yaml price table, persisting the result to the cost_records table with full context (agentId, model, provider, companyId, source)**,
so that **the platform has accurate per-call cost tracking that enables Epic 7's 3-axis cost aggregation, budget limits, and cost dashboards**.

## Acceptance Criteria

1. **models.yaml price table**: All 6 models have accurate inputPricePer1M and outputPricePer1M values. Price lookup by model ID returns correct pricing. Unknown models fall back to a safe default
2. **CostTracker.recordCost()**: Receives usage data (model, inputTokens, outputTokens, companyId, agentId, source) and persists to cost_records table with calculated costUsdMicro. Fire-and-forget (errors logged, never thrown)
3. **calculateCostMicro()**: Correctly calculates cost in microdollars: `(inputTokens / 1M) * inputPrice * 1M + (outputTokens / 1M) * outputPrice * 1M`, rounded to integer
4. **LLM Router integration**: Every successful LLM call via `llmRouter.call()` and `llmRouter.stream()` records cost automatically. This is already implemented -- this story validates and extends it
5. **companyId isolation**: All cost_records have companyId for tenant isolation. Queries must filter by companyId
6. **Batch API flag**: cost_records should support distinguishing batch vs real-time calls (isBatch field or source='batch')
7. **Cost query helpers**: Add `getCostSummary(companyId, dateRange)` and `getAgentCostBreakdown(companyId, agentId, dateRange)` query functions for Epic 7's aggregation API
8. **microToUsd()**: Utility to convert microdollars to display USD
9. **Edge cases**: Zero tokens = zero cost, negative tokens rejected, null agentId allowed (system calls)

## Tasks / Subtasks

- [x] Task 1: Validate and extend models.yaml pricing (AC: #1)
  - [x]1.1 Verify all 6 models have correct 2026 pricing in models.yaml
  - [x]1.2 Ensure `getModelConfig()` returns pricing correctly for all models
  - [x]1.3 Verify DEFAULT_PRICING fallback works for unknown models

- [x]Task 2: Validate and extend CostTracker (AC: #2, #3, #8)
  - [x]2.1 Verify `calculateCostMicro()` formula is correct for all 6 models
  - [x]2.2 Verify `recordCost()` persists correctly to cost_records table
  - [x]2.3 Verify fire-and-forget pattern (errors logged, not thrown)
  - [x]2.4 Verify `microToUsd()` conversion

- [x]Task 3: Add batch source support (AC: #6)
  - [x]3.1 Add `isBatch` boolean column to cost_records schema (migration needed)
  - [x]3.2 Update RecordParams to accept `isBatch` optional flag
  - [x]3.3 Update recordCost() to persist isBatch field

- [x]Task 4: Add cost query helpers (AC: #7)
  - [x]4.1 `getCostSummary(companyId, dateRange)`: Returns total inputTokens, outputTokens, costUsdMicro, count grouped by date
  - [x]4.2 `getAgentCostBreakdown(companyId, agentId, dateRange)`: Returns per-model breakdown for an agent
  - [x]4.3 `getDepartmentCostBreakdown(companyId, dateRange)`: Returns per-department cost (joins agents -> departments)
  - [x]4.4 `getModelCostBreakdown(companyId, dateRange)`: Returns per-model cost breakdown

- [x]Task 5: LLM Router integration validation (AC: #4)
  - [x]5.1 Verify llmRouter.call() calls recordCost() on every success
  - [x]5.2 Verify llmRouter.stream() calls recordCost() on every success
  - [x]5.3 Verify fallback scenarios record cost for the actual provider used (not the original)

- [x]Task 6: Edge case handling (AC: #9)
  - [x]6.1 Zero tokens produces zero cost
  - [x]6.2 Null agentId allowed (system-level calls)
  - [x]6.3 Unknown model falls back to DEFAULT_PRICING

- [x]Task 7: Unit tests (AC: all)
  - [x]7.1 calculateCostMicro: all 6 models with known token counts
  - [x]7.2 calculateCostMicro: unknown model uses DEFAULT_PRICING
  - [x]7.3 calculateCostMicro: zero tokens = zero cost
  - [x]7.4 recordCost: DB insert with correct fields
  - [x]7.5 recordCost: fire-and-forget (error swallowed)
  - [x]7.6 recordCost: null agentId allowed
  - [x]7.7 recordCost: isBatch flag persisted
  - [x]7.8 microToUsd: conversion accurate
  - [x]7.9 getCostSummary: date range filtering + aggregation
  - [x]7.10 getAgentCostBreakdown: per-model breakdown
  - [x]7.11 getDepartmentCostBreakdown: joins agents to departments
  - [x]7.12 getModelCostBreakdown: per-model aggregation
  - [x]7.13 models.yaml pricing: all 6 models return correct prices
  - [x]7.14 models.yaml pricing: unknown model returns undefined (triggers fallback)
  - [x]7.15 LLM Router integration: call() triggers recordCost
  - [x]7.16 LLM Router integration: stream() triggers recordCost
  - [x]7.17 LLM Router integration: fallback records cost for actual provider

## Dev Notes

### CRITICAL: Existing Code to Reuse (DO NOT recreate)

**Already built (Story 3-1, 3-2, 3-3):**
- `packages/server/src/lib/cost-tracker.ts` -- `recordCost()`, `calculateCostMicro()`, `microToUsd()` already exist
- `packages/server/src/config/models.yaml` -- 6 models with pricing already defined
- `packages/server/src/config/models.ts` -- `getModelConfig()`, `loadModelsConfig()` already exist
- `packages/server/src/services/llm-router.ts` -- Already calls `recordCost()` in both `call()` and `stream()`
- `packages/server/src/db/schema.ts` line 468-481 -- `cost_records` table already defined

**This story EXTENDS, not recreates. Focus on:**
1. Adding `isBatch` column to cost_records schema
2. Adding cost query helper functions (for Epic 7)
3. Comprehensive test coverage of the cost pipeline
4. Validating the existing integration works correctly end-to-end

### Architecture Compliance

**File locations:**
- CostTracker: `packages/server/src/lib/cost-tracker.ts` (existing -- extend)
- Schema: `packages/server/src/db/schema.ts` (add isBatch column)
- Tests: `packages/server/src/__tests__/unit/cost-recording.test.ts` (NEW -- dedicated cost tests)
- models.yaml: `packages/server/src/config/models.yaml` (existing -- validate)
- models.ts: `packages/server/src/config/models.ts` (existing -- validate)

**Naming conventions:**
- File names: kebab-case (`cost-tracker.ts`)
- DB columns: snake_case (`cost_usd_micro`, `is_batch`)
- Functions: camelCase (`calculateCostMicro`, `getCostSummary`)
- Types: PascalCase (`CostSummary`, `CostBreakdown`)

**Architecture Decision #7 (Cost Tracking System):**
```
CostTracker -> DB (cost_records)
LLMRouter -> CostTracker (after every successful call)
```
- Cost recording is fire-and-forget (`.catch(() => {})`)
- Never blocks the LLM response path
- companyId isolation is mandatory

### cost_records Table (Already Exists)

```sql
cost_records:
  id: uuid PK
  company_id: uuid FK -> companies (NOT NULL)
  agent_id: uuid FK -> agents (nullable -- system calls)
  session_id: uuid FK -> chat_sessions (nullable)
  provider: varchar(50) NOT NULL DEFAULT 'anthropic'
  model: varchar(100) NOT NULL
  input_tokens: integer NOT NULL DEFAULT 0
  output_tokens: integer NOT NULL DEFAULT 0
  cost_usd_micro: integer NOT NULL DEFAULT 0  -- 1 = $0.000001
  source: varchar(50)  -- 'chat' | 'delegation' | 'job' | 'sns'
  created_at: timestamp NOT NULL DEFAULT NOW()
```

**To add:** `is_batch: boolean NOT NULL DEFAULT false`

### models.yaml Pricing (Already Exists)

| Model | Provider | Input $/1M | Output $/1M |
|-------|----------|-----------|------------|
| claude-sonnet-4-6 | anthropic | 3 | 15 |
| claude-haiku-4-5 | anthropic | 0.8 | 4 |
| gpt-4.1 | openai | 2.5 | 10 |
| gpt-4.1-mini | openai | 0.4 | 1.6 |
| gemini-2.5-pro | google | 1.25 | 10 |
| gemini-2.5-flash | google | 0.075 | 0.3 |

### Cost Calculation Formula

```typescript
costMicro = Math.round(
  (inputTokens / 1_000_000) * inputPricePer1M * 1_000_000 +
  (outputTokens / 1_000_000) * outputPricePer1M * 1_000_000
)
// Simplifies to: inputTokens * inputPrice + outputTokens * outputPrice (in microdollars)
```

Example: claude-sonnet-4-6, 1000 input, 500 output
- Input: 1000 * 3 = 3000 micro
- Output: 500 * 15 = 7500 micro
- Total: 10500 micro = $0.0105

### Cost Query Helpers Design

```typescript
type DateRange = { from: Date; to: Date }

type CostSummary = {
  totalInputTokens: number
  totalOutputTokens: number
  totalCostMicro: number
  recordCount: number
  byDate: Array<{ date: string; costMicro: number; recordCount: number }>
}

type CostBreakdown = {
  items: Array<{
    key: string  // agentId, model, departmentId
    label: string
    inputTokens: number
    outputTokens: number
    costMicro: number
    recordCount: number
  }>
  total: { inputTokens: number; outputTokens: number; costMicro: number }
}
```

### Previous Story Intelligence (3-4 AgentRunner)

- AgentRunner aggregates `calculateCostMicro` for TaskResponse cost field
- llmRouter.call() already calls recordCost() with `.catch(() => {})` -- fire-and-forget
- Test framework: bun:test, mock.module() for DB mocking
- All 38 AgentRunner tests pass, 79 related tests (llm-router + cost-tracker) pass
- Patterns established: mock the DB layer, test pure functions independently

### Testing Strategy

- **Framework:** bun:test (NOT vitest, NOT jest)
- **Test file:** `packages/server/src/__tests__/unit/cost-recording.test.ts`
- **Mock pattern:** mock.module() for `../db` (mock db.insert, db.select)
- **Pure function tests:** `calculateCostMicro()` and `microToUsd()` need no mocks
- **Query tests:** Mock db.select() chains for getCostSummary/getBreakdown functions
- **Integration validation:** Verify llmRouter calls recordCost with correct params

### Anti-Pattern Prevention

1. **DO NOT** recreate cost-tracker.ts from scratch -- extend the existing one
2. **DO NOT** add new model pricing to hardcoded constants -- use models.yaml only
3. **DO NOT** make cost recording synchronous/blocking -- keep fire-and-forget
4. **DO NOT** use vitest or jest -- use bun:test
5. **DO NOT** create a separate cost-records service -- extend cost-tracker.ts
6. **DO NOT** skip companyId in any cost query -- tenant isolation is mandatory
7. **DO NOT** hardcode model prices in tests -- use getModelConfig() or known yaml values
8. **DO NOT** duplicate the recordCost call in AgentRunner -- it's already in LLMRouter
9. **DO NOT** create new DB migrations -- add isBatch column directly to schema.ts
10. **DO NOT** import from v1 code -- build fresh following v2 architecture

### Project Structure Notes

- Cost tracker is in `lib/` (utility layer), not `services/` (business logic layer)
- Query helpers go in the same file since they're cost-domain utilities
- New types can be added to cost-tracker.ts (no need for shared types -- these are server-internal)
- Test file is separate from existing cost-tracker tests in llm-router tests

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 7 -- Cost Tracking System]
- [Source: _bmad-output/planning-artifacts/epics.md#E3-S5 -- acceptance criteria]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 7 -- CostTracker dependency]
- [Source: packages/server/src/lib/cost-tracker.ts -- existing implementation]
- [Source: packages/server/src/config/models.yaml -- model pricing]
- [Source: packages/server/src/config/models.ts -- model config parser]
- [Source: packages/server/src/services/llm-router.ts#175-184 -- recordCost integration in call()]
- [Source: packages/server/src/services/llm-router.ts#310-321 -- recordCost integration in stream()]
- [Source: packages/server/src/db/schema.ts#468-481 -- cost_records table]
- [Source: _bmad-output/implementation-artifacts/3-4-agent-runner-stateless-executor.md -- previous story]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Extended cost_records schema with `is_batch` boolean column + indexes (company_created, agent)
- Added negative token guard to calculateCostMicro (returns 0 for negative inputs)
- Added isBatch persistence to recordCost() (was in params but not saved to DB)
- Added 'batch' as valid source type for RecordParams
- Added 4 cost query helpers for Epic 7: getCostSummary, getAgentCostBreakdown, getDepartmentCostBreakdown, getModelCostBreakdown
- Exported RecordParams, CostSummary, CostBreakdown, CostBreakdownItem, DateRange types
- 40 new unit tests in cost-recording.test.ts covering all ACs
- 8 existing cost-tracker tests continue to pass (0 regressions)
- 38 agent-runner tests pass, 37 llm-router tests pass, 20 schema tests pass

### File List

- packages/server/src/db/schema.ts (MODIFIED -- added isBatch column + indexes to cost_records)
- packages/server/src/lib/cost-tracker.ts (MODIFIED -- isBatch persistence, negative guard, 4 query helpers, type exports)
- packages/server/src/__tests__/unit/cost-recording.test.ts (NEW -- 40 tests)
