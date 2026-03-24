# Critic-A Review — Story 24.7: call_agent Response Standardization & Model Routing

**Reviewer:** Winston (Architect)
**Date:** 2026-03-24

---

## Files Reviewed (7 modified + 2 new tests)

| # | File | Status | Notes |
|---|------|--------|-------|
| 1 | `engine/types.ts` | ✅ | CallAgentResponse interface |
| 2 | `engine/index.ts` | ✅ | Barrel exports updated |
| 3 | `engine/model-selector.ts` | ✅ | AR74 cost-aware routing |
| 4 | `engine/agent-loop.ts` | ✅ | Inline handler → CallAgentResponse format |
| 5 | `tool-handlers/builtins/call-agent.ts` | ✅ | parseChildResponse + structured yield |
| 6 | `engine/llm-router.ts` | ✅ | UNTOUCHED (confirmed, AR74 frozen) |
| 7 | `ar73-response-standardization.test.ts` | ✅ | 11 tests |
| 8 | `ar74-cost-aware-model.test.ts` | ⚠️ | 11 tests — E8 import path |
| 9 | `call-agent.test.ts` | ✅ | 8 tests updated |

---

## AR73: Response Standardization

### CallAgentResponse (types.ts:95-101)

```typescript
interface CallAgentResponse {
  status: 'success' | 'failure' | 'partial'
  summary: string
  delegatedTo: string
  next_actions?: string[]
  artifacts?: object[]
}
```

| Check | Status |
|-------|--------|
| 3-value status enum | ✅ |
| Required fields: status, summary, delegatedTo | ✅ |
| Optional fields: next_actions, artifacts | ✅ |
| Exported from barrel (index.ts:14) | ✅ |

### parseChildResponse (call-agent.ts:104-132)

| Input State | Status | Correct? |
|-------------|--------|----------|
| error + no content | `failure` | ✅ |
| error + content | `partial` + next_actions | ✅ |
| no error | `success` | ✅ |
| empty content, no error | `success` (empty summary) | ✅ |
| summary > 500 chars | truncated `.slice(0, 500)` | ✅ |
| failure with empty errorMessage | fallback `"${agentName} 작업 실패"` | ✅ |

### Dual Implementation Architecture

Two call_agent handlers exist — this is the documented E7 Phase 1 design:

| Path | Location | Status Determination | Used In |
|------|----------|---------------------|---------|
| Inline handler | `agent-loop.ts:232-254` | Always `'success'` (delegation accepted) | **Production** |
| Full generator | `call-agent.ts:17-99` | Real status from child events | **Tests + future Phase 2** |

Both return `CallAgentResponse` type — **type-consistent**. The inline handler returns 'success' because at the point of delegation, the request is always accepted. Actual outcome determination via `parseChildResponse()` is for the full recursive path (Phase 2+).

**Not a bug** — this pattern pre-dates Story 24.7 (previously `{ success: true, delegatedTo }`). The story standardized the response FORMAT, not the execution model.

### call-agent.ts Structured Yield (line 98)

```typescript
yield { type: 'message', content: `\n[call_agent_result: ${JSON.stringify(response)}]` }
```

The `[call_agent_result: {...}]` marker is appended as a final message event after all child events are forwarded. Model sees structured data. ✅

---

## AR74: Cost-Aware Model Routing

### model-selector.ts

| Feature | Value | Status |
|---------|-------|--------|
| REFLECTION_MODEL | `'claude-haiku-4-5-20251001'` | ✅ Cheapest available |
| CostPreference type | `'quality' \| 'balanced' \| 'cost'` | ✅ |
| Existing selectModel() | UNCHANGED | ✅ |
| Existing selectModelFromDB() | UNCHANGED | ✅ |

### selectModelWithCostPreference Results

| Tier | quality | balanced | cost |
|------|---------|----------|------|
| 1 (Manager) | Sonnet | Sonnet | Sonnet |
| 2 (Specialist) | Sonnet | Sonnet | **Haiku** ← cost savings |
| 3 (Worker) | Haiku | Haiku | Haiku |
| unknown | Haiku | Haiku | Haiku |

Logical and correct. Only tier 2 downgrades under 'cost' preference — managers keep Sonnet for complex reasoning. ✅

### Production Consumers

`selectModelWithCostPreference` and `REFLECTION_MODEL` are exported but NOT yet consumed in production. This is Sprint 1 infrastructure — consumers expected in Sprint 2+. Correct for story scope. ✅

### llm-router.ts

UNTOUCHED — confirmed via `git log`. AR74 frozen requirement met. ✅

---

## E8 Boundary Compliance

| Check | Status |
|-------|--------|
| engine/ index.ts barrel updated | ✅ All new exports through barrel |
| model-selector.ts stays in engine/ | ✅ Internal, exported via barrel |
| call-agent.ts in tool-handlers/ | ✅ Outside engine, imports from `../../engine` |
| agent-loop.ts uses local types | ✅ |

### Minor E8 Import Violation (non-blocking)

Test files bypass barrel with direct imports:

| File | Import | Should Be |
|------|--------|-----------|
| `ar74-cost-aware-model.test.ts:5` | `../../engine/model-selector` | `../../engine` |
| `ar74-cost-aware-model.test.ts:6` | `../../engine/model-selector` | `../../engine` |
| `ar73-response-standardization.test.ts:6` | `../../engine/types` | `../../engine` |

All symbols exist in barrel. Trivial fix. Not blocking.

---

## Test Coverage (30 total)

| File | Count | What's Tested |
|------|-------|---------------|
| ar73-response-standardization.test.ts | 11 | parseChildResponse 6 cases + type compliance 5 |
| ar74-cost-aware-model.test.ts | 11 | REFLECTION_MODEL 2 + selectModelWithCostPreference 9 |
| call-agent.test.ts | 8 | Handoff chain + AR73 structured response assertions |

---

## Scoring (Critic-A Weights)

| Dimension | Weight | Score | Weighted | Notes |
|-----------|--------|-------|----------|-------|
| D1 Requirements | 15% | 9 | 1.35 | Both ACs met: AR73 type + format, AR74 selector + constant |
| D2 Simplicity | 15% | 9 | 1.35 | Clean, no over-engineering |
| D3 Accuracy | 25% | 8 | 2.00 | Correct logic, minor E8 test imports |
| D4 Implementability | 20% | 9 | 1.80 | Type-check clean, 30 tests pass |
| D5 Innovation | 15% | 7 | 1.05 | Solid infrastructure, straightforward |
| D6 Clarity | 10% | 9 | 0.90 | Good comments, clear naming |
| **Total** | | | **8.45** | |

## Verdict: ✅ PASS (8.45 ≥ 7.0)

### Recommended (non-blocking)

1. Fix E8 test imports: `../../engine/model-selector` → `../../engine`, `../../engine/types` → `../../engine`
