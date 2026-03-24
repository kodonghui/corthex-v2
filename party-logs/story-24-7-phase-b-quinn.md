# Critic-B (QA + Security) Implementation Review — Story 24.7

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 CallAgentResponse interface (AR73) | ✅ | `engine/types.ts:95-101`: `{ status: 'success'|'failure'|'partial', summary, delegatedTo, next_actions?, artifacts? }`. Exported via barrel. |
| AC-2 parseChildResponse (AR73) | ✅ | `call-agent.ts:104-132`: 3-way status determination — error+no content=failure, error+content=partial, no error=success. Summary truncated to 500 chars. |
| AC-3 Structured result in call_agent generator | ✅ | `call-agent.ts:98`: Yields `[call_agent_result: ${JSON.stringify(response)}]` as final message event. |
| AC-4 agent-loop inline handler uses AR73 format | ✅ | `agent-loop.ts:238-243`: Creates CallAgentResponse with status/summary/delegatedTo/next_actions. |
| AC-5 REFLECTION_MODEL constant (AR74) | ✅ | `model-selector.ts:14`: `'claude-haiku-4-5-20251001'` — pinned version, cheapest model. |
| AC-6 selectModelWithCostPreference (AR74) | ✅ | `model-selector.ts:56-61`: 3 preferences (quality/balanced/cost). Cost preference downgrades tier 2 from Sonnet to Haiku. |
| AC-7 CostPreference type (AR74) | ✅ | `model-selector.ts:37`: `'quality' | 'balanced' | 'cost'`. Exported via barrel. |
| AC-8 llm-router.ts frozen (AR74) | ✅ | `git log` confirms zero recent commits to llm-router.ts. |
| AC-9 FR3/FR4 handoff unchanged | ✅ | call-agent.ts: depth check, circular detection, agent lookup, child context creation all preserved from pre-24.7. |

## Security Assessment

| Item | Status | Evidence |
|------|--------|----------|
| Depth limit enforcement | ✅ SAFE | `call-agent.ts:24`: `ctx.depth >= ctx.maxDepth` checked before any execution. |
| Circular detection | ✅ SAFE | `call-agent.ts:34`: `ctx.visitedAgents.includes(targetAgentId)` prevents loops. |
| Context immutability | ✅ SAFE | `call-agent.ts:55-59`: Spread copy with `readonly` arrays — original ctx not mutated. Test verifies (line 164-165). |
| Summary truncation | ✅ SAFE | `parseChildResponse`: `content.slice(0, 500)`. Inline handler: `message.slice(0, 100)` for next_actions. |
| targetAgentId in inline summary | ⚠️ NOTE | `agent-loop.ts:240`: `` `작업이 ${to}에게 위임되었습니다.` `` embeds raw `targetAgentId` (from model tool_use) into tool_result string. Goes back to the model as context, not to the user. Low-risk prompt influence, not XSS. |
| artifacts type permissiveness | ⚠️ NOTE | `types.ts:100`: `artifacts?: object[]` — accepts any object shape. Not validated. Currently unused by parseChildResponse. |
| Model ID injection | ✅ SAFE | REFLECTION_MODEL and all model maps are hardcoded constants — no user/agent input. |

## Architectural Observation: Dual call_agent Implementations

**Production path**: `agent-loop.ts` inline handler (lines 232-254)
- Always returns `status: 'success'`
- Does NOT execute child agent
- Optimistic acknowledgment to the calling model

**Test/library path**: `call-agent.ts` `callAgent()` generator
- Properly categorizes success/failure/partial via `parseChildResponse()`
- Actually executes child agent via `runAgent()`
- Used in unit tests and integration tests only (not imported by any route/service)

`callAgent()` is NOT imported by any route or service file — confirmed via grep. The inline handler is the only production code path.

**Impact**: The inline handler always tells the model "success" before verifying agent existence, depth limits, or actual execution outcome. The model receives a false positive tool_result. This is a pre-existing pattern (was `{ success: true, delegatedTo }` before), and Story 24.7 improved it by adding structured format. But the always-success behavior diverges from AR73's intent.

**Severity**: Medium — not a security issue but a correctness concern. The model may chain further tool calls based on a false success. Recommend future story to unify the two paths.

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | CallAgentResponse interface precise. Model IDs specific. CostPreference enum clear. REFLECTION_MODEL pinned to version. |
| D2 완전성 | 25% | 8/10 | 30 tests: parseChildResponse (6), type compliance (4), selectModelWithCostPreference (9), REFLECTION_MODEL (2), callAgent (8 updated). No test for inline handler always-success behavior. |
| D3 정확성 | 15% | 8/10 | parseChildResponse 3-way logic correct. Model maps match tier spec. Inline handler improved from v1 format to CallAgentResponse. But inline handler always 'success' diverges from AR73 structured intent. |
| D4 실행가능성 | 10% | 9/10 | 30/30 tests pass. Type-check clean. Barrel exports correct. llm-router.ts confirmed untouched. |
| D5 일관성 | 15% | 8/10 | CallAgentResponse type shared between both paths. E8 boundary respected (engine/ barrel only). Korean strings consistent. But dual implementation creates behavioral inconsistency. |
| D6 리스크 | 25% | 8/10 | Depth/circular guards intact. Summary truncation prevents large payloads. Model IDs hardcoded. targetAgentId in summary is low-risk (model context, not user-facing). artifacts type too permissive but unused. |

### 가중 평균: 0.10(9) + 0.25(8) + 0.15(8) + 0.10(9) + 0.15(8) + 0.25(8) = 8.20/10 ✅ PASS

---

## Issues (3: 1 medium, 2 low)

### 1. **[D3/D5] Inline handler always returns 'success' — diverges from AR73** (MEDIUM)

```typescript
// agent-loop.ts:238-243
const response: CallAgentResponse = {
  status: 'success',  // ALWAYS 'success'
  summary: `작업이 ${to}에게 위임되었습니다.`,
  delegatedTo: to,
  next_actions: message ? [`${to}가 "${message.slice(0, 100)}" 처리 중`] : undefined,
}
```

The inline handler doesn't check depth, circular detection, or agent existence before returning 'success'. The model receives this tool_result and may make decisions based on a false positive.

Meanwhile, `call-agent.ts:parseChildResponse()` properly handles failure/partial states — but this function is never called in the production path.

**Recommendation**: Have the inline handler call through to `callAgent()` from call-agent.ts, or at minimum check depth/circular before optimistically returning success. Can be a follow-up story.

### 2. **[D6] `artifacts?: object[]` type too permissive** (LOW)

```typescript
// types.ts:100
artifacts?: object[]
```

Accepts any object shape. If a child agent returns unexpected data via artifacts, the calling model receives it unvalidated. Currently unused by `parseChildResponse()`, so no immediate risk.

**Recommendation**: Define a specific `CallAgentArtifact` type when artifacts are actually used.

### 3. **[D2] Missing mock for soul-enricher in call-agent.test.ts** (LOW)

```typescript
// call-agent.test.ts — mocks getDB, renderSoul, runAgent, but NOT soul-enricher or knowledge-injector
mock.module('../../db/scoped-query', () => ({ getDB: mockGetDB }))
mock.module('../../engine/soul-renderer', () => ({ renderSoul: mockRenderSoul }))
mock.module('../../engine/agent-loop', () => ({ runAgent: mockRunAgent, ... }))
// soul-enricher NOT mocked — relies on getDB mock returning agents without personalityTraits
```

`enrich()` is called in call-agent.ts but not explicitly mocked. Tests work because mock agents lack `personalityTraits`, so enrich returns empty vars. Fragile — if enrich() changes DB methods, tests break silently.

**Severity**: Low — tests pass today. Recommend explicit mock for `soul-enricher` module.

---

## Verdict

**✅ PASS (8.20/10)**

AR73 CallAgentResponse type well-defined and thoroughly tested via parseChildResponse. AR74 cost-aware model selection correct with proper tier downgrades. 30 tests cover both features. llm-router.ts confirmed frozen. One medium issue: inline handler in agent-loop.ts always returns 'success' without validation, diverging from AR73's structured response intent. This is a pre-existing pattern that Story 24.7 improved (added structured format) but didn't fully resolve. Recommend follow-up to unify the dual call_agent paths.
