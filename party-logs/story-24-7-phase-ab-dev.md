# Story 24.7: call_agent Response Standardization & Model Routing — Phase A+B (dev)

## Summary

Implemented AR73 call_agent response standardization (structured `{ status, summary, delegatedTo }` format) and AR74 cost-aware model routing (REFLECTION_MODEL constant + selectModelWithCostPreference function).

## What Changed

### AR73: Response Standardization

**`engine/types.ts`** — New `CallAgentResponse` interface:
```typescript
interface CallAgentResponse {
  status: 'success' | 'failure' | 'partial'
  summary: string
  delegatedTo: string
  next_actions?: string[]
  artifacts?: object[]
}
```

**`call-agent.ts`** — Major changes:
- Collects child events (message parts + error tracking) during forward loop
- `parseChildResponse()`: determines status from content/error state
  - success: content + no error
  - failure: error + no content
  - partial: error + some content (includes next_actions)
- Yields final `[call_agent_result: {...}]` message with structured response
- Summary truncated to 500 chars

**`agent-loop.ts`** — Inline call_agent handler updated:
- Old: `{ success: true, delegatedTo: to }`
- New: `CallAgentResponse` with status/summary/delegatedTo/next_actions

### AR74: Cost-Aware Model Routing

**`model-selector.ts`**:
- `REFLECTION_MODEL = 'claude-haiku-4-5-20251001'` — cheapest model for ARGOS cron
- `CostPreference` type: `'quality' | 'balanced' | 'cost'`
- `selectModelWithCostPreference(tierLevel, preference)`:
  - quality/balanced: original mapping (Sonnet for tier 1-2, Haiku for tier 3)
  - cost: specialists (tier 2) downgraded to Haiku
- `COST_AWARE_MODEL_MAP`: tier 2 → Haiku instead of Sonnet
- `llm-router.ts` untouched (frozen per AR74)

### Tests (30 total)

**AR73 (11)**: parseChildResponse — success/failure/partial, truncation, empty content, fallback message, type compliance
**AR74 (11)**: REFLECTION_MODEL value, selectModelWithCostPreference — quality/balanced/cost × 3 tiers, unknown tier, valid model IDs
**call-agent.test.ts (8)**: Updated for AR73 structured response — extra event, extraVars arg

## Files

- `packages/server/src/engine/types.ts` — CallAgentResponse interface
- `packages/server/src/engine/index.ts` — barrel exports
- `packages/server/src/engine/agent-loop.ts` — inline handler → structured format
- `packages/server/src/engine/model-selector.ts` — REFLECTION_MODEL, selectModelWithCostPreference
- `packages/server/src/tool-handlers/builtins/call-agent.ts` — parseChildResponse, event collection
- `packages/server/src/__tests__/unit/call-agent.test.ts` — updated
- `packages/server/src/__tests__/unit/ar73-response-standardization.test.ts` — NEW
- `packages/server/src/__tests__/unit/ar74-cost-aware-model.test.ts` — NEW

## Test Results

```
AR73: 11 pass, 0 fail
AR74: 11 pass, 0 fail (requires CREDENTIAL_ENCRYPTION_KEY env — pre-existing)
call-agent: 8 pass, 0 fail
Type-check: clean (server)
```
