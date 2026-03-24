# Story 24.7: call_agent Response Standardization & Model Routing

Status: implemented

## Story

As a developer,
I want call_agent responses in a structured format and cost-aware model selection,
So that downstream consumers get predictable data and costs are optimized.

## Acceptance Criteria

1. **AC-1: AR73 structured response format**
   **Given** call_agent.ts forwards child events
   **When** child agent completes
   **Then** responses parsed into `{ status: 'success'|'failure'|'partial', summary, delegatedTo, next_actions?, artifacts? }`

2. **AC-2: agent-loop.ts inline handler standardized**
   **Given** call_agent tool use in agent-loop
   **When** tool result returned to model
   **Then** uses CallAgentResponse format instead of `{ success: true, delegatedTo }`

3. **AC-3: Existing handoff unchanged (FR3, FR4)**
   **Given** the call_agent execution flow
   **When** handoff events emitted
   **Then** depth limit, circular detection, handoff events unchanged

4. **AC-4: AR74 cost-aware model selection**
   **Given** model-selector.ts
   **When** selectModelWithCostPreference called with cost preference
   **Then** specialists downgraded to Haiku, managers keep Sonnet

5. **AC-5: AR74 reflection cron model**
   **Given** REFLECTION_MODEL constant
   **Then** hardcoded to `claude-haiku-4-5-20251001` (cheapest)

6. **AC-6: llm-router.ts frozen**
   **Given** llm-router.ts
   **Then** no changes made (AR74 scope: model-selector.ts only)

## Dev Notes

### AR73: call_agent response standardization

- `CallAgentResponse` type in `engine/types.ts`: `{ status, summary, delegatedTo, next_actions?, artifacts? }`
- `call-agent.ts`: collects child events, uses `parseChildResponse()` to determine status
  - success: content + no error
  - failure: error + no content
  - partial: error + some content
- `agent-loop.ts` inline handler: returns structured format with status/summary/delegatedTo
- Summary truncated to 500 chars

### AR74: cost-aware model routing

- `REFLECTION_MODEL = 'claude-haiku-4-5-20251001'` exported constant
- `selectModelWithCostPreference(tierLevel, preference)`:
  - 'quality'/'balanced': original mapping
  - 'cost': specialist → Haiku (downgraded from Sonnet)
- `CostPreference` type: 'quality' | 'balanced' | 'cost'

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- CallAgentResponse interface + parseChildResponse function
- agent-loop.ts inline handler returns structured format
- call-agent.ts collects events + yields AR73 structured response
- REFLECTION_MODEL constant + selectModelWithCostPreference
- 30 tests (11 AR73 + 11 AR74 + 8 call-agent updated)

### File List

- `packages/server/src/engine/types.ts` — CallAgentResponse interface (MODIFIED)
- `packages/server/src/engine/index.ts` — barrel exports (MODIFIED)
- `packages/server/src/engine/agent-loop.ts` — inline call_agent handler → structured format (MODIFIED)
- `packages/server/src/engine/model-selector.ts` — REFLECTION_MODEL, selectModelWithCostPreference, CostPreference (MODIFIED)
- `packages/server/src/tool-handlers/builtins/call-agent.ts` — parseChildResponse, AR73 event collection (MODIFIED)
- `packages/server/src/__tests__/unit/call-agent.test.ts` — updated for AR73 (MODIFIED)
- `packages/server/src/__tests__/unit/ar73-response-standardization.test.ts` — 11 tests (NEW)
- `packages/server/src/__tests__/unit/ar74-cost-aware-model.test.ts` — 11 tests (NEW)
