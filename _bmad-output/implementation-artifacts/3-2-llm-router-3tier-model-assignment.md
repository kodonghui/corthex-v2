# Story 3.2: LLMRouter + 3-Tier Model Assignment

Status: done

## Story

As a **system (orchestration engine)**,
I want **an LLMRouter that routes LLM requests to the correct provider adapter based on model name, with automatic 3-tier model assignment by agent rank**,
so that **every agent gets the right model (Manager=Sonnet, Specialist=Haiku, Worker=Haiku) automatically, admins can override per-agent, and all calls go through a single routing layer with cost tracking**.

## Acceptance Criteria

1. **LLMRouter.call(request)** resolves provider from model name via models.yaml, calls the correct adapter, returns LLMResponse
2. **3-tier auto-assignment**: Manager=claude-sonnet-4-6, Specialist=claude-haiku-4-5, Worker=claude-haiku-4-5 when agent has no manual override
3. **Manual override**: If `agents.modelName` is set to a non-default value, use that model instead of tier default (FR31)
4. **resolveModel(agent)**: Pure function that returns the model to use — checks agent.modelName first, falls back to tierDefaults from models.yaml
5. **Provider resolution**: Extract provider from model ID via models.yaml config (e.g., "claude-sonnet-4-6" -> "anthropic")
6. **Credential lookup**: LLMRouter fetches API key from CredentialVault per companyId before each call
7. **Cost recording**: Every successful LLM call records cost via CostTracker (fire-and-forget)
8. **Routing decision log**: Log model resolution decisions (tier-based vs manual override) for debugging
9. **Error handling**: Provider errors normalized to LLMError, propagated to caller
10. **Streaming support**: LLMRouter.stream(request) routes streaming calls to correct adapter

## Tasks / Subtasks

- [x] Task 1: Create LLMRouter service (AC: #1, #5, #6, #7, #9)
  - [x] 1.1 Create `packages/server/src/services/llm-router.ts`
  - [x] 1.2 Implement `call(request, context)` — resolve provider from model, get API key from CredentialVault, call adapter, record cost
  - [x] 1.3 Implement `stream(request, context)` — same routing but returns AsyncGenerator
  - [x] 1.4 Implement `resolveProvider(modelId)` — lookup models.yaml to get provider name
  - [x] 1.5 Error handling: catch adapter errors, normalize to LLMError

- [x] Task 2: Implement resolveModel logic (AC: #2, #3, #4)
  - [x] 2.1 Create `resolveModel(agent)` function — if agent.modelName differs from schema default ('claude-haiku-4-5'), treat as manual override; otherwise use tierDefaults[agent.tier]
  - [x] 2.2 Export as standalone pure function for unit testing

- [x] Task 3: Implement routing decision logging (AC: #8)
  - [x] 3.1 Log format: `[LLMRouter] model=${model} provider=${provider} agent=${name} company=${companyId}`

- [x] Task 4: Create LLMRouterContext type (AC: #6)
  - [x] 4.1 Define context: `{ companyId, agentId?, agentName?, sessionId?, source }`
  - [x] 4.2 Context flows through to CostTracker.recordCost()

- [x] Task 5: Unit tests (AC: all)
  - [x] 5.1 Test resolveModel with tier defaults (manager->sonnet, specialist->haiku, worker->haiku)
  - [x] 5.2 Test resolveModel with manual override
  - [x] 5.3 Test provider resolution from model ID
  - [x] 5.4 Test call() routes to correct adapter (mocked)
  - [x] 5.5 Test stream() routes to correct adapter (mocked)
  - [x] 5.6 Test cost recording after successful call
  - [x] 5.7 Test error propagation
  - [x] 5.8 Test credential lookup per companyId

## Dev Notes

### CRITICAL: Existing Code to Reuse

**Story 3-1 built these (DO NOT recreate):**
- `packages/server/src/lib/llm/types.ts` — LLMProvider interface, ModelConfig, ModelsConfig
- `packages/server/src/lib/llm/index.ts` — `createProvider(name, apiKey)` factory
- `packages/server/src/lib/llm/anthropic.ts` — AnthropicAdapter
- `packages/server/src/lib/llm/openai.ts` — OpenAIAdapter
- `packages/server/src/lib/llm/google.ts` — GoogleAdapter
- `packages/server/src/config/models.yaml` — model catalog with tierDefaults section
- `packages/server/src/config/models.ts` — `getModelConfig()`, `getTierDefaultModel()`, `getFallbackOrder()`, `getModelsByProvider()`

**Existing CostTracker** (`packages/server/src/lib/cost-tracker.ts`):
- `recordCost({ companyId, agentId, sessionId, provider, model, inputTokens, outputTokens, source })` — fire-and-forget
- `calculateCostMicro(model, inputTokens, outputTokens)` — uses models.yaml pricing
- Already handles unknown models with fallback pricing

**Existing CredentialVault** (`packages/server/src/services/credential-vault.ts`):
- `getCredentials(companyId, provider)` returns decrypted API key fields
- Supports providers: 'anthropic', 'openai', 'google_ai'

**Shared types** (`packages/shared/src/types.ts`):
- `LLMProviderName = 'anthropic' | 'openai' | 'google'`
- `LLMRequest`, `LLMResponse`, `LLMStreamChunk`, `LLMError`, `LLMToolCall`

**DB Schema** (`packages/server/src/db/schema.ts`):
- `agents.tier`: agentTierEnum('manager', 'specialist', 'worker')
- `agents.modelName`: varchar default 'claude-haiku-4-5'
- `costRecords`: already has provider, model, inputTokens, outputTokens, costUsdMicro, source fields

### Architecture Compliance

**File location:** `packages/server/src/services/llm-router.ts` (per architecture tree)

**Architecture specifies** (Decision #3):
```typescript
class LLMRouter {
  providers: Map<string, LLMProvider>;
  async call(request: LLMRequest): Promise<LLMResponse> {
    const provider = this.resolveProvider(request.model);
    try {
      const response = await provider.call(request);
      await this.trackCost(request, response);
      return response;
    } catch (err) {
      return this.fallback(request, err);  // Story 3-3 scope
    }
  }
}
```

**Important:** Fallback logic is Story 3-3 scope. This story implements routing + cost tracking only. The fallback method should exist as a stub that just rethrows for now.

**Pattern:** Export as module functions (not class) — consistent with cost-tracker.ts, credential-vault.ts patterns from Epic 1. However, architecture shows a class. Use a class here since LLMRouter needs internal state (provider cache). Export a singleton.

### Model Resolution Logic

```
resolveModel(agent: { tier, modelName }):
  1. If agent.modelName is set AND differs from default ('claude-haiku-4-5'):
     -> return agent.modelName (manual override)
  2. Otherwise:
     -> return tierDefaults[agent.tier] from models.yaml

tierDefaults (from models.yaml):
  manager: claude-sonnet-4-6
  specialist: claude-haiku-4-5
  worker: claude-haiku-4-5
```

**Edge case:** A manager with default modelName 'claude-haiku-4-5' should STILL get claude-sonnet-4-6 (tier default overrides schema default). The schema default is just the DB column default, not the intended model for managers.

**Better approach:** Check if modelName is null/empty OR matches the DB column default. Then use tier defaults. If modelName is explicitly set to something else, that's a manual override.

### CredentialVault Provider Key Mapping

The CredentialVault uses these provider keys:
- `anthropic` -> for Claude models
- `openai` -> for GPT models
- `google_ai` -> for Gemini models

Note: models.yaml uses `google` but CredentialVault uses `google_ai`. The router must map `google` -> `google_ai` when calling getCredential.

### Testing Strategy

- Unit tests in `packages/server/src/__tests__/unit/llm-router.test.ts`
- Mock: CredentialVault, LLM adapters (createProvider), CostTracker
- Test framework: **bun:test** (NOT vitest, NOT jest)
- Test patterns from Story 3-1: mock SDK calls, verify normalized responses

### Anti-Pattern Prevention

1. **DO NOT** call SDK directly — always go through createProvider() factory from lib/llm/index.ts
2. **DO NOT** hardcode model-to-provider mapping — use models.yaml via getModelConfig()
3. **DO NOT** implement fallback logic — that's Story 3-3
4. **DO NOT** cache provider instances with API keys — create per-request (API keys may rotate)
5. **DO NOT** skip cost recording — every call must record via CostTracker
6. **DO NOT** expose API keys in logs or error messages
7. **DO NOT** use vitest or jest — use bun:test
8. **DO NOT** create new types for LLMRequest/LLMResponse — use @corthex/shared

### Project Structure Notes

- File goes in `services/` not `lib/` — llm-router is a service (per architecture tree)
- Adapters stay in `lib/llm/` — low-level, no business logic
- Router is the business layer that combines adapters + credentials + cost tracking

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#3. LLM Provider Router]
- [Source: _bmad-output/planning-artifacts/epics.md#E3-S2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR30-FR32]
- [Source: packages/server/src/lib/llm/index.ts -- createProvider factory]
- [Source: packages/server/src/config/models.ts -- getModelConfig, getTierDefaultModel]
- [Source: packages/server/src/lib/cost-tracker.ts -- recordCost]
- [Source: packages/server/src/services/credential-vault.ts -- getCredentials]
- [Source: packages/server/src/db/schema.ts -- agents.tier, agents.modelName]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- LLMRouter class implemented with call() and stream() methods routing to correct provider adapters
- resolveModel() pure function: Manager->claude-sonnet-4-6, Specialist/Worker->claude-haiku-4-5 (tier defaults)
- Manual override detection: if agent.modelName differs from schema default, use it directly
- resolveProvider() maps model ID -> provider name via models.yaml config
- CredentialVault provider key mapping: google -> google_ai for credential lookup
- Cost recording via fire-and-forget after every successful call/stream
- API key sanitization in error messages (sk-*** pattern)
- Singleton export `llmRouter` for application-wide use
- 37 tests passing: resolveModel (10), resolveProvider (7), call (9), stream (3), singleton (1), integration (5), logging (1)
- No regressions in related tests (98 total across llm-router + llm-provider-adapters + cost-tracker)

### File List

- packages/server/src/services/llm-router.ts (NEW)
- packages/server/src/__tests__/unit/llm-router.test.ts (NEW)
