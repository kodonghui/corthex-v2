# Story 3.1: LLM Provider Adapters (Claude/GPT/Gemini)

Status: done

## Story

As a **system (LLMRouter)**,
I want **unified provider adapters for Anthropic (Claude), OpenAI (GPT), and Google (Gemini) SDKs**,
so that **the orchestration engine can route LLM calls to any provider through a single interface**.

## Acceptance Criteria

1. **LLMProvider interface** defined with `call(request): Promise<LLMResponse>`, `estimateCost(tokens): number`, `supportsBatch: boolean`
2. **AnthropicAdapter**: Claude Sonnet 4.6 / Haiku 4.5 calls work + tool call response parsing
3. **OpenAIAdapter**: GPT-4.1 / GPT-4.1-mini calls work + tool call response parsing
4. **GoogleAdapter**: Gemini 2.5 Pro / Flash calls work + tool call response parsing
5. **Timeout**: Each adapter has 30-second call timeout (NFR3)
6. **Streaming**: Each adapter supports streaming responses via async iterators
7. **Credential isolation**: API keys fetched from CredentialVault per-company (companyId), never exposed in prompts (NFR11)
8. **Unified response**: All adapters normalize responses to `LLMResponse { content, toolCalls, usage: { inputTokens, outputTokens }, model, provider }`
9. **Error handling**: Provider-specific errors normalized to `LLMError { provider, code, message, retryable }`
10. **models.yaml**: Model catalog with pricing (input/output per 1M tokens), provider mapping, tier defaults

## Tasks / Subtasks

- [x] Task 1: Define LLM types and interfaces (AC: #1, #8, #9)
  - [x] 1.1 Create `packages/shared/src/types/llm.ts` -- LLMRequest, LLMResponse, LLMError, TokenCount, LLMProviderName
  - [x] 1.2 Create `packages/server/src/lib/llm/types.ts` -- LLMProvider interface, LLMCallOptions, LLMStreamChunk
- [x] Task 2: Create models.yaml config (AC: #10)
  - [x] 2.1 Create `packages/server/src/config/models.yaml` with all 6 models + pricing
  - [x] 2.2 Create `packages/server/src/config/models.ts` -- YAML loader + typed access
- [x] Task 3: Implement AnthropicAdapter (AC: #2, #5, #6, #7, #8, #9)
  - [x] 3.1 Create `packages/server/src/lib/llm/anthropic.ts`
  - [x] 3.2 Implement `call()` with Messages API
  - [x] 3.3 Implement tool_use response parsing (content_block type="tool_use")
  - [x] 3.4 Implement streaming via `stream()` with async iterator
  - [x] 3.5 30s timeout via AbortController
  - [x] 3.6 API key from CredentialVault (provider: 'anthropic')
- [x] Task 4: Implement OpenAIAdapter (AC: #3, #5, #6, #7, #8, #9)
  - [x] 4.1 Create `packages/server/src/lib/llm/openai.ts`
  - [x] 4.2 Implement `call()` with Chat Completions API
  - [x] 4.3 Implement tool_calls response parsing (message.tool_calls array)
  - [x] 4.4 Implement streaming via `stream()` with async iterator
  - [x] 4.5 30s timeout via AbortController
  - [x] 4.6 API key from CredentialVault (provider: 'openai')
- [x] Task 5: Implement GoogleAdapter (AC: #4, #5, #6, #7, #8, #9)
  - [x] 5.1 Create `packages/server/src/lib/llm/google.ts`
  - [x] 5.2 Implement `call()` with Generative AI API
  - [x] 5.3 Implement functionCall response parsing (parts[].functionCall)
  - [x] 5.4 Implement streaming via `stream()` with async iterator
  - [x] 5.5 30s timeout via AbortController
  - [x] 5.6 API key from CredentialVault (provider: 'google_ai')
- [x] Task 6: Create adapter index + factory (AC: #1)
  - [x] 6.1 Create `packages/server/src/lib/llm/index.ts` -- createProvider(name, apiKey) factory
- [x] Task 7: Extend existing CostTracker (AC: #10)
  - [x] 7.1 Update `packages/server/src/lib/cost-tracker.ts` to read pricing from models.yaml instead of hardcoded values
  - [x] 7.2 Add provider field to cost recording

## Dev Notes

### CRITICAL: Existing Code Analysis

**v1 code exists** (`packages/server/src/lib/ai.ts`) -- This is a v1 monolithic implementation using Anthropic SDK directly. DO NOT extend it. Build new adapters in `lib/llm/` directory as specified by architecture.

**Existing CostTracker** (`packages/server/src/lib/cost-tracker.ts`):
- Already has `calculateCostMicro()`, `recordCost()`, `microToUsd()`
- Currently hardcodes only Claude model pricing (3 models)
- Uses `costUsdMicro` (1 = $0.000001) stored as integer
- **EXTEND this** -- add models.yaml loading + multi-provider pricing
- `recordCost()` already accepts `model` param, needs `provider` param added

**Existing CredentialVault** (`packages/server/src/services/credential-vault.ts`):
- Already supports providers: `anthropic`, `openai`, `google_ai`
- Per-company credential isolation (companyId)
- `getCredential(companyId, provider)` returns decrypted fields
- Use `getCredential()` in each adapter to get API key
- **DO NOT** hardcode API keys or use environment variables

**Existing DB Schema** (`packages/server/src/db/schema.ts`):
- `costRecords` table: id, companyId, agentId, sessionId, **provider**, model, inputTokens, outputTokens, costUsdMicro, source
- `agents` table: has `tier` (manager/specialist/worker), `modelName` (default 'claude-haiku-4-5')
- `agentTierEnum`: 'manager', 'specialist', 'worker'
- Provider field already exists on cost_records -- just populate it

**Existing Anthropic SDK** in package.json: `@anthropic-ai/sdk: ^0.78.0`
- Need to ADD: `openai`, `@google/generative-ai` packages

### Architecture Compliance

**File Locations (Architecture Decision):**
```
packages/server/src/lib/llm/
  anthropic.ts     # Claude SDK wrapper
  openai.ts        # GPT SDK wrapper
  google.ts        # Gemini SDK wrapper
  types.ts         # LLMProvider interface + types
  index.ts         # Factory + exports
packages/server/src/config/
  models.yaml      # Model pricing catalog
  models.ts        # YAML loader
packages/shared/src/types/
  llm.ts           # Shared LLM types (LLMRequest, LLMResponse)
```

**Design Pattern:** Strategy pattern -- each adapter implements LLMProvider interface. LLMRouter (Story 3-2) will use this interface for routing.

**Naming Convention:** kebab-case files, PascalCase classes (AnthropicAdapter, OpenAIAdapter, GoogleAdapter)

### Model Catalog (from Architecture)

| Model ID | Provider | Tier Default | Input $/1M | Output $/1M |
|----------|----------|-------------|------------|-------------|
| claude-sonnet-4-6 | anthropic | manager | 3 | 15 |
| claude-haiku-4-5 | anthropic | specialist, worker | 0.8 | 4 |
| gpt-4.1 | openai | (manager alt) | 2.5 | 10 |
| gpt-4.1-mini | openai | (specialist alt) | 0.4 | 1.6 |
| gemini-2.5-pro | google | (manager alt) | 1.25 | 10 |
| gemini-2.5-flash | google | (worker alt) | 0.075 | 0.3 |

### Tool Call Response Parsing (Provider-Specific)

**Anthropic**: `content_block` with `type: "tool_use"` has `{ id, name, input }`
**OpenAI**: `message.tool_calls[]` has `{ id, function: { name, arguments } }` (arguments is JSON string)
**Google**: `parts[].functionCall` has `{ name, args }` (args is object)

Normalize all to:
```typescript
interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}
```

### SDK Installation Notes

```bash
# Already installed:
# @anthropic-ai/sdk ^0.78.0

# Need to install:
bun add openai @google/generative-ai
```

**OpenAI SDK**: Use `openai` package (not `@azure/openai`). Current stable: ^4.x
**Google Generative AI SDK**: Use `@google/generative-ai` package. Current stable: ^0.x

### Testing Strategy

- Unit tests in `packages/server/src/__tests__/unit/lib/llm/`
- Each adapter should be testable with mocked SDK calls
- Test tool call parsing with real response shapes
- Test timeout handling
- Test credential retrieval integration
- Test error normalization (rate limit, auth error, server error)
- Test models.yaml loading + pricing calculation
- **Framework**: bun:test (NOT vitest, NOT jest)

### Previous Story Intelligence

**From Epic 1 Retrospective:**
- "기존 코드 읽고 확장" 전략이 핵심 -- 기존 cost-tracker.ts, credential-vault.ts를 반드시 읽고 확장
- 테스트는 bun:test 사용, 기존 581건 통과 상태 유지 필수
- withTenant(), scopedWhere() 등 tenant 헬퍼 사용 패턴 확립됨
- ERROR_CODES는 `@corthex/shared`에서 import
- HTTPError는 `middleware/error`에서 import

**From Epic 1 code patterns:**
- Services export pure functions (not classes) -- e.g., `recordCost()`, `createAuditLog()`
- DB access through `db` import from `../db`
- Async/await throughout, fire-and-forget for non-critical ops (cost recording)

### Anti-Pattern Prevention

1. **DO NOT** create a new cost tracker -- extend `packages/server/src/lib/cost-tracker.ts`
2. **DO NOT** hardcode API keys -- always use CredentialVault
3. **DO NOT** use v1's `lib/ai.ts` patterns (monolithic, single-provider) -- create clean adapters
4. **DO NOT** skip timeout implementation -- 30s AbortController is NFR3 requirement
5. **DO NOT** expose credentials in error messages or logs
6. **DO NOT** use `vitest` or `jest` -- use `bun:test`
7. **DO NOT** create adapter instances at module level -- use factory pattern with per-request credential lookup
8. **DO NOT** add Anthropic SDK again -- already in package.json

### Project Structure Notes

- Alignment: `lib/llm/` directory matches architecture tree exactly
- `config/models.yaml` is new directory -- create `packages/server/src/config/` if not exists
- Shared types in `packages/shared/src/types/llm.ts` -- monorepo cross-package import

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#3. LLM Provider Router]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3 - E3-S1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR30-FR34]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#4. LLM Multi-Provider Router]
- [Source: packages/server/src/lib/cost-tracker.ts -- existing cost tracking]
- [Source: packages/server/src/services/credential-vault.ts -- credential providers]
- [Source: packages/server/src/db/schema.ts#costRecords -- cost_records table]
- [Source: packages/server/src/lib/ai.ts -- v1 monolithic pattern (DO NOT extend)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Ultimate context engine analysis completed -- comprehensive developer guide created
- All 3 provider SDKs identified with specific response parsing patterns
- Existing code analysis: cost-tracker.ts (extend), credential-vault.ts (use), ai.ts (DO NOT use)
- models.yaml pricing catalog defined from architecture spec

### File List

- packages/shared/src/types/llm.ts (NEW)
- packages/server/src/lib/llm/types.ts (NEW)
- packages/server/src/lib/llm/anthropic.ts (NEW)
- packages/server/src/lib/llm/openai.ts (NEW)
- packages/server/src/lib/llm/google.ts (NEW)
- packages/server/src/lib/llm/index.ts (NEW)
- packages/server/src/config/models.yaml (NEW)
- packages/server/src/config/models.ts (NEW)
- packages/server/src/lib/cost-tracker.ts (MODIFY -- extend pricing)
