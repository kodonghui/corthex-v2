# Story 3.3: Provider Fallback Strategy

Status: done

## Story

As a **system (LLM Router)**,
I want **automatic provider fallback when an LLM provider fails, switching through Claude -> GPT -> Gemini within 5 seconds, with circuit breaker protection to avoid hammering failed providers**,
so that **LLM calls remain resilient even when a single provider is down, users experience minimal disruption, and failed providers recover without being overwhelmed by retry storms**.

## Acceptance Criteria

1. **Fallback chain**: When a provider call fails, automatically try the next provider in fallbackOrder from models.yaml: `[anthropic, openai, google]` -- using an equivalent-tier model from each provider
2. **5-second fallback budget (NFR26)**: Total time from first failure to successful fallback response must be < 5 seconds
3. **Same-tier model mapping**: Fallback selects equivalent model from next provider (e.g., claude-sonnet-4-6 -> gpt-4.1 -> gemini-2.5-pro for managers; claude-haiku-4-5 -> gpt-4.1-mini -> gemini-2.5-flash for specialist/worker)
4. **Circuit breaker**: After 3 consecutive failures for a provider, mark it as "open" (skip it) for 60 seconds before allowing a probe request
5. **All providers fail**: If all providers in the chain fail, throw a comprehensive error with details from each provider's failure
6. **Fallback audit log**: Every fallback event records: original provider, fallback provider, reason, latency -- via audit log system
7. **Cost recording on fallback**: Successful fallback calls still record cost via CostTracker (with the actual provider/model used)
8. **Streaming fallback**: `stream()` also supports fallback -- if streaming fails mid-stream, fall back to non-streaming call on next provider
9. **Circuit breaker state observable**: Expose `getCircuitBreakerStatus()` returning per-provider state (closed/open/half-open, failure count, last failure time)
10. **Retryable error detection**: Only attempt fallback on retryable errors (server_error, timeout, rate_limit) -- not on auth_error or invalid_request

## Tasks / Subtasks

- [x] Task 1: Implement equivalent-tier model mapping (AC: #3)
  - [x] 1.1 Create `getFallbackModels(originalModel: string): string[]` -- returns ordered list of equivalent models from other providers
  - [x] 1.2 Model tier mapping: manager-tier (claude-sonnet-4-6, gpt-4.1, gemini-2.5-pro), specialist/worker-tier (claude-haiku-4-5, gpt-4.1-mini, gemini-2.5-flash)
  - [x] 1.3 Derive mapping from models.yaml config (inputPricePer1M >= $1 threshold for manager-tier)

- [x] Task 2: Implement circuit breaker (AC: #4, #9)
  - [x] 2.1 Create `CircuitBreaker` class with states: closed (normal), open (skip), half-open (probe)
  - [x] 2.2 Per-provider circuit breaker instances (Map<LLMProviderName, CircuitBreaker>)
  - [x] 2.3 Transition: closed -> open after 3 consecutive failures
  - [x] 2.4 Transition: open -> half-open after 60-second cooldown
  - [x] 2.5 Transition: half-open -> closed on success, half-open -> open on failure
  - [x] 2.6 `getCircuitBreakerStatus()` returns all provider states
  - [x] 2.7 `isAvailable(provider)` checks if circuit is not open
  - [x] 2.8 `recordSuccess(provider)` and `recordFailure(provider)` update state

- [x] Task 3: Implement fallback logic in LLMRouter (AC: #1, #2, #5, #7, #10)
  - [x] 3.1 Fallback integrated directly into `call()` method (builds attempt chain: primary + fallback models)
  - [x] 3.2 On retryable error: get fallback models, skip circuit-open providers, try next
  - [x] 3.3 5-second fallback budget: tracks elapsed time, stops attempting when budget exhausted
  - [x] 3.4 Non-retryable errors (auth_error, invalid_request): throw immediately, no fallback
  - [x] 3.5 All providers fail: throw aggregated error with all failure details
  - [x] 3.6 Cost recording uses actual model/provider that succeeded
  - [x] 3.7 Fallback built into existing `call()` method directly (not separate method)

- [x] Task 4: Implement streaming fallback (AC: #8)
  - [x] 4.1 Fallback integrated directly into `stream()` method
  - [x] 4.2 If stream fails before yielding any chunk: fallback to next provider's stream
  - [x] 4.3 If stream fails mid-stream (after some chunks yielded): fall back to non-streaming `call()` on next provider, return complete response
  - [x] 4.4 Fallback built into existing `stream()` method directly

- [x] Task 5: Audit logging for fallback events (AC: #6)
  - [x] 5.1 Added `LLM_FALLBACK: 'llm.fallback'` to AUDIT_ACTIONS constant
  - [x] 5.2 Log fallback event: originalProvider, originalModel, fallbackProvider, fallbackModel, reason, latencyMs
  - [x] 5.3 Fire-and-forget via createAuditLog().catch(() => {})

- [x] Task 6: Unit tests (AC: all)
  - [x] 6.1 Circuit breaker: closed -> open after 3 failures
  - [x] 6.2 Circuit breaker: open -> half-open after cooldown
  - [x] 6.3 Circuit breaker: half-open -> closed on success
  - [x] 6.4 Circuit breaker: half-open -> open on repeated failure
  - [x] 6.5 Fallback: provider A fails -> provider B succeeds
  - [x] 6.6 Fallback: provider A,B fail -> provider C succeeds
  - [x] 6.7 Fallback: all providers fail -> aggregated error
  - [x] 6.8 Fallback: non-retryable error -> no fallback, immediate throw
  - [x] 6.9 Fallback: circuit-open provider skipped
  - [x] 6.10 Fallback: 5-second budget enforcement
  - [x] 6.11 Fallback: correct cost recording with fallback provider
  - [x] 6.12 Fallback model mapping: manager-tier models
  - [x] 6.13 Fallback model mapping: specialist/worker-tier models
  - [x] 6.14 Stream fallback: stream fails before chunks -> next provider stream
  - [x] 6.15 Stream fallback: mid-stream failure -> non-streaming fallback
  - [x] 6.16 Audit log recorded on fallback event
  - [x] 6.17 getCircuitBreakerStatus() returns correct state

## Dev Notes

### CRITICAL: Existing Code to Reuse (DO NOT recreate)

**Story 3-1 built these:**
- `packages/server/src/lib/llm/types.ts` -- LLMProvider interface, ModelConfig, ModelsConfig
- `packages/server/src/lib/llm/index.ts` -- `createProvider(name, apiKey)` factory
- `packages/server/src/lib/llm/anthropic.ts` -- AnthropicAdapter
- `packages/server/src/lib/llm/openai.ts` -- OpenAIAdapter
- `packages/server/src/lib/llm/google.ts` -- GoogleAdapter
- `packages/server/src/config/models.yaml` -- model catalog with fallbackOrder + tierDefaults
- `packages/server/src/config/models.ts` -- `getModelConfig()`, `getTierDefaultModel()`, `getFallbackOrder()`, `getModelsByProvider()`

**Story 3-2 built these (MODIFY, don't recreate):**
- `packages/server/src/services/llm-router.ts` -- LLMRouter class with call() and stream()
- `packages/server/src/__tests__/unit/llm-router.test.ts` -- 37 existing tests

**Key functions already available:**
- `getFallbackOrder()` from `config/models.ts` returns `['anthropic', 'openai', 'google']`
- `getModelsByProvider(provider)` returns all models for a provider
- `getModelConfig(modelId)` returns model config with provider, pricing, tier info
- `resolveProvider(modelId)` maps model -> provider name
- `createProvider(name, apiKey)` creates adapter instance
- `getCredentials(companyId, provider)` gets API key from vault
- `recordCost({...})` fire-and-forget cost recording
- `normalizeLLMError(err, provider)` normalizes errors to LLMError format

**Existing audit log system:**
- `packages/server/src/services/audit-log.ts` -- `logAuditEvent()` function
- `AUDIT_ACTIONS` constant -- add `LLM_FALLBACK: 'llm.fallback'` here
- Audit log table already has: action, actorId, resourceType, resourceId, details (JSONB), companyId

**Shared types (packages/shared/src/types.ts):**
- `LLMError = { provider, code, message, retryable }` -- `code` includes: 'auth_error' | 'rate_limit' | 'timeout' | 'server_error' | 'invalid_request' | 'unknown'
- `retryable` boolean already exists on LLMError -- use this to decide fallback eligibility

### Architecture Compliance

**File locations:**
- Circuit breaker: `packages/server/src/lib/llm/circuit-breaker.ts` (lib/ -- utility, no business logic)
- Fallback logic: modify `packages/server/src/services/llm-router.ts` (existing service)
- Tests: `packages/server/src/__tests__/unit/provider-fallback.test.ts` (new test file)

**Architecture Decision #3 (LLM Provider Router) specifies:**
```typescript
class LLMRouter {
  async call(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await provider.call(request);
      await this.trackCost(request, response);
      return response;
    } catch (err) {
      return this.fallback(request, err);  // <-- THIS IS OUR STORY
    }
  }
}
```

**Architecture NFR mapping:**
- NFR26: fallback < 5 seconds
- NFR3: individual provider timeout 30 seconds (but fallback budget is 5s total)
- FR34: provider fallback

### Model Tier Mapping Strategy

Use models.yaml to derive equivalent-tier models. Group by approximate pricing tier:

**Manager tier** (high capability):
- anthropic: claude-sonnet-4-6 (input: $3/1M)
- openai: gpt-4.1 (input: $2.5/1M)
- google: gemini-2.5-pro (input: $1.25/1M)

**Specialist/Worker tier** (cost-efficient):
- anthropic: claude-haiku-4-5 (input: $0.8/1M)
- openai: gpt-4.1-mini (input: $0.4/1M)
- google: gemini-2.5-flash (input: $0.075/1M)

Implementation: Build a static mapping from models.yaml tierDefault arrays + fallbackOrder. If a model has tierDefault: [manager], its fallback is other providers' manager-tier models.

### Circuit Breaker Design

```
State Machine:
  CLOSED (normal) --[3 consecutive failures]--> OPEN (skip)
  OPEN --[60s cooldown]--> HALF_OPEN (probe)
  HALF_OPEN --[1 success]--> CLOSED
  HALF_OPEN --[1 failure]--> OPEN (reset cooldown)

Per-provider state:
  { state: 'closed'|'open'|'half-open', consecutiveFailures: number, lastFailureAt: number | null }
```

### Fallback Timeout Budget

Total budget: 5 seconds (NFR26). Strategy:
- Use AbortController with timeout per attempt
- First attempt: remaining budget (start with full 5s)
- Each subsequent attempt: remaining budget from 5s start time
- If budget exhausted before all providers tried: throw timeout error

### CredentialVault Provider Key Mapping

Remember from Story 3-2: CredentialVault uses `google_ai` but models.yaml uses `google`. The `toCredentialProvider()` function in llm-router.ts already handles this mapping.

### Testing Strategy

- **Framework:** bun:test (NOT vitest, NOT jest)
- **Test file:** `packages/server/src/__tests__/unit/provider-fallback.test.ts`
- **Mock pattern:** Same as llm-router.test.ts -- mock.module() for credential-vault, cost-tracker, createProvider
- **Circuit breaker:** Test with fake timers for cooldown period
- **Fallback:** Mock first provider to throw retryable error, second to succeed
- **Budget:** Use Date.now() mocking or measure actual elapsed time

### Anti-Pattern Prevention

1. **DO NOT** implement retry on same provider -- fallback means switch to DIFFERENT provider
2. **DO NOT** add sleep/delay between fallback attempts -- immediately try next provider
3. **DO NOT** cache circuit breaker state in DB -- in-memory only (resets on restart is acceptable)
4. **DO NOT** make fallback configurable per-request -- use global models.yaml config
5. **DO NOT** break existing call()/stream() signatures -- add fallback internally
6. **DO NOT** log full API keys in fallback audit events
7. **DO NOT** use vitest or jest -- use bun:test
8. **DO NOT** create new types for LLMRequest/LLMResponse -- use @corthex/shared
9. **DO NOT** block on audit logging -- fire-and-forget pattern

### Project Structure Notes

- Circuit breaker goes in `lib/llm/` alongside adapters (it's a utility pattern, not business service)
- Fallback logic integrates INTO existing llm-router.ts (not a separate service)
- New test file to keep fallback tests separate from basic routing tests (3-2)
- No new DB tables needed -- uses existing audit_logs and cost_records

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#3. LLM Provider Router -- fallback design]
- [Source: _bmad-output/planning-artifacts/epics.md#E3-S3 -- acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md#FR34 -- provider fallback]
- [Source: _bmad-output/planning-artifacts/architecture.md#NFR26 -- fallback < 5 seconds]
- [Source: packages/server/src/services/llm-router.ts -- existing router to modify]
- [Source: packages/server/src/config/models.yaml -- fallbackOrder config]
- [Source: packages/server/src/config/models.ts -- getFallbackOrder(), getModelsByProvider()]
- [Source: packages/server/src/services/audit-log.ts -- logAuditEvent + AUDIT_ACTIONS]
- [Source: packages/server/src/lib/llm/types.ts -- LLMProvider interface]
- [Source: packages/shared/src/types.ts -- LLMError with retryable flag]
- [Source: _bmad-output/implementation-artifacts/3-2-llm-router-3tier-model-assignment.md -- previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- CircuitBreaker class: 3-state machine (closed/open/half-open), per-provider tracking, 3-failure threshold, 60s cooldown
- getFallbackModels(): derives equivalent-tier models from models.yaml using inputPricePer1M >= $1 as manager-tier threshold
- LLMRouter.call(): fallback chain integrated -- primary model + fallback models, 5s budget, circuit breaker checks, retryable error detection
- LLMRouter.stream(): streaming fallback -- pre-chunk failure falls back to next stream, mid-stream failure falls back to non-streaming call
- Audit logging: LLM_FALLBACK action added, fire-and-forget via createAuditLog with full metadata (original/fallback provider+model, reason, latency)
- Cost recording: always uses actual provider/model that succeeded (not the original requested model)
- Non-retryable errors (auth_error, invalid_request) throw immediately without fallback
- Constructor accepts optional CircuitBreaker for testing dependency injection
- 34 new tests passing (circuit breaker: 8, fallback models: 7, router fallback: 19)
- 37 existing llm-router tests still passing (no regressions)
- 28 audit-log tests still passing
- 61 llm-adapter + cost-tracker tests still passing

### File List

- packages/server/src/lib/llm/circuit-breaker.ts (NEW)
- packages/server/src/services/llm-router.ts (MODIFIED -- fallback chain + circuit breaker integration)
- packages/server/src/config/models.ts (MODIFIED -- added getFallbackModels())
- packages/server/src/services/audit-log.ts (MODIFIED -- added LLM_FALLBACK action)
- packages/server/src/__tests__/unit/provider-fallback.test.ts (NEW -- 34 tests)
