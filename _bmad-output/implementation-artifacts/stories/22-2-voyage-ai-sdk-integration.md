# Story 22.2: Voyage AI SDK Integration

Status: ready-for-dev

## Story

As a developer,
I want the Voyage AI embedding SDK integrated as a single-source service,
so that all vector operations use Voyage AI instead of Gemini.

## Acceptance Criteria

1. **AC-1: Package swap**
   **Given** `@google/generative-ai` (0.24.1) is currently installed
   **When** it is deleted and `voyageai@0.2.1` (exact pin, no `^`) is installed
   **Then** `bun install --frozen-lockfile` succeeds
   **And** `turbo build` + `turbo type-check` pass with zero errors
   **And** no source file contains `import ... from '@google/generative-ai'`

2. **AC-2: Single-source service file**
   **Given** `services/voyage-embedding.ts` is created
   **When** any code needs an embedding
   **Then** it calls `getEmbedding(companyId, text): Promise<number[] | null>` returning 1024-dimension vectors
   **And** `getEmbeddingBatch(companyId, texts[], batchSize=32): Promise<(number[] | null)[]>` is available for batch operations
   **And** no source file outside `voyage-embedding.ts` imports `voyageai` directly

3. **AC-3: Exponential backoff**
   **Given** Voyage AI rate limits are 300 RPM and 1M tokens/min
   **When** a rate limit or transient error occurs
   **Then** the service retries with exponential backoff: 1s → 2s → 4s → max 30s (max 5 retries)
   **And** after all retries exhausted, returns `null` (never throws)

4. **AC-4: Null fallback (VEC-2)**
   **Given** embedding generation fails for any reason (network, rate limit, invalid input)
   **When** the caller receives the result
   **Then** it gets `null` (not a thrown error)
   **And** callers handle `null` gracefully (existing pattern — semantic search falls back to keyword search)

5. **AC-5: Multi-tenant isolation**
   **Given** every embedding call requires `companyId`
   **When** credentials are fetched
   **Then** `getCredentials(companyId, 'voyage_ai')` is used (per-company credential vault)
   **And** no shared/global API key is used

6. **AC-6: GoogleAdapter + google.ts removal**
   **Given** `@google/generative-ai` is being fully removed
   **When** `lib/llm/google.ts` (GoogleAdapter) is deleted
   **Then** `lib/llm/index.ts` no longer exports or instantiates GoogleAdapter
   **And** LLM provider routing treats `'google'` as unsupported (throw/skip, not crash)
   **And** `circuit-breaker.ts` no longer includes `'google'` in its provider loop
   **And** all GoogleAdapter test files are deleted or updated

7. **AC-7: Caller migration**
   **Given** 5 source files currently import from `embedding-service.ts`
   **When** they are updated to import from `voyage-embedding.ts`
   **Then** all callers compile and function correctly:
   - `services/semantic-search.ts`
   - `engine/semantic-cache.ts`
   - `routes/workspace/knowledge.ts`
   - `routes/workspace/sketches.ts`
   - `routes/admin/knowledge.ts`

8. **AC-8: Credential vault update**
   **Given** the credential vault has `google_ai` as a provider
   **When** `voyage_ai` is added to `PROVIDER_SCHEMAS`
   **Then** `voyage_ai: ['api_key']` is registered
   **And** `google_ai` remains for backward compatibility (other potential uses)

9. **AC-9: Zero regression**
   **Given** all changes are complete
   **When** `bun test` runs across all workspaces
   **Then** all existing tests pass (minus intentionally deleted GoogleAdapter tests)
   **And** new voyage-embedding tests pass

## Tasks / Subtasks

- [ ] Task 1: Install voyageai SDK, remove @google/generative-ai (AC: #1)
  - [ ] 1.1 `cd packages/server && bun add voyageai@0.2.1` (exact pin, no `^`)
  - [ ] 1.2 `cd packages/server && bun remove @google/generative-ai`
  - [ ] 1.3 Verify `packages/server/package.json` shows `"voyageai": "0.2.1"` (no `^`)
  - [ ] 1.4 Run `bun install --frozen-lockfile` from root — must succeed
  - [ ] 1.5 Update `dependency-verification.test.ts`: remove `@google/generative-ai` assertions, add `voyageai: 0.2.1` assertions

- [ ] Task 2: Create `services/voyage-embedding.ts` (AC: #2, #3, #4, #5)
  - [ ] 2.1 Create file at `packages/server/src/services/voyage-embedding.ts`
  - [ ] 2.2 Implement `getEmbedding(companyId: string, text: string): Promise<number[] | null>`
    - Fetch API key via `getCredentials(companyId, 'voyage_ai')`
    - Extract key: `credentials.api_key` (underscore — credential vault stores snake_case). Carry over `extractApiKey()` helper internally for robustness (handles `api_key`, `apiKey`, or first value)
    - Instantiate `new VoyageAIClient({ apiKey })` (per-call, no global cache needed — SDK is lightweight)
    - Call `client.embed({ input: [text], model: 'voyage-3' })` → extract `result.data[0].embedding`
    - Validate result is 1024-dimension array
    - On any error: log warning with `{ companyId, model: 'voyage-3', errorType }` only — NEVER log apiKey, request text, or embedding vectors. Return `null` (never throw)
  - [ ] 2.3 Implement `getEmbeddingBatch(companyId: string, texts: string[], batchSize = 32): Promise<(number[] | null)[]>`
    - Chunk `texts` into groups of `batchSize`
    - Call `client.embed({ input: batch, model: 'voyage-3' })` for each chunk
    - 100ms delay between batches (rate limit compliance)
    - Individual batch failure → `null` for those items, continue remaining
  - [ ] 2.4 Implement exponential backoff wrapper
    - Wrap `client.embed()` calls with retry logic
    - Delays: 1s → 2s → 4s → 8s → 16s (capped at 30s), max 5 retries
    - Retry on: HTTP 429 (rate limit), 5xx (server errors), network errors
    - Do NOT retry on: 400/401/403 (client errors — bad key, invalid input)
  - [ ] 2.5 Export `prepareText(title, content)` — carry over from embedding-service.ts (same logic, `MAX_TEXT_LENGTH = 10_000`)
  - [ ] 2.6 Export `EMBEDDING_MODEL = 'voyage-3'` and `EMBEDDING_DIMENSIONS = 1024` as constants

- [ ] Task 3: Migrate callers from embedding-service.ts → voyage-embedding.ts (AC: #7)
  - [ ] 3.1 Update `services/semantic-search.ts`:
    - `import { getEmbedding } from './voyage-embedding'`
    - Remove `extractApiKey` import — `getEmbedding` now handles credentials internally
    - Remove `getCredentials` import — no longer needed at caller level
    - Simplify: `const embedding = await getEmbedding(companyId, query)` (was: fetch apiKey, then generateEmbedding(apiKey, text))
  - [ ] 3.2 Update `engine/semantic-cache.ts`:
    - `import { getEmbedding } from '../services/voyage-embedding'`
    - Remove `extractApiKey`, `getCredentials` imports
    - Remove `getGoogleApiKey()` helper function entirely
    - `checkSemanticCache`: `const embedding = await getEmbedding(companyId, query)`
    - `saveToSemanticCache`: `const embedding = await getEmbedding(companyId, query)`
  - [ ] 3.3 Update `routes/workspace/knowledge.ts`:
    - `import { triggerEmbedding } from '../../services/voyage-embedding'`
    - (triggerEmbedding signature unchanged — still `(docId, companyId): void`)
  - [ ] 3.4 Update `routes/workspace/sketches.ts`:
    - `import { triggerEmbedding } from '../../services/voyage-embedding'`
  - [ ] 3.5 Update `routes/admin/knowledge.ts`:
    - `import { embedAllDocuments } from '../../services/voyage-embedding'`
    - (embedAllDocuments now uses getEmbedding/getEmbeddingBatch internally)
  - [ ] 3.6 Re-export convenience functions from voyage-embedding.ts:
    - `triggerEmbedding(docId, companyId)` — fire-and-forget background embedding
    - `embedDocument(docId, companyId)` — single doc embedding
    - `embedAllDocuments(companyId)` — batch embed all unembedded docs
    - `updateDocEmbedding(docId, companyId, embedding, model?)` — DB update helper
    - These functions carry over from embedding-service.ts with minimal changes (swap generateEmbedding → getEmbedding)

- [ ] Task 4: Remove GoogleAdapter + google.ts + google routing (AC: #6)
  - [ ] 4.1 Delete `packages/server/src/lib/llm/google.ts`
  - [ ] 4.2 Update `packages/server/src/lib/llm/index.ts`:
    - Remove `import { GoogleAdapter } from './google'`
    - Remove `case 'google': return new GoogleAdapter(apiKey)` from factory
    - Remove `export { GoogleAdapter } from './google'`
    - For `'google'` provider: throw descriptive error ("Google/Gemini provider removed — use Anthropic or OpenAI")
  - [ ] 4.3 Update `packages/server/src/lib/llm/circuit-breaker.ts`:
    - Remove `'google'` from the provider loop at line 82
    - Only iterate `['anthropic', 'openai']`
  - [ ] 4.4 **CRITICAL**: Do NOT remove `'google'` from `LLMProviderName` type in `shared/types.ts`
    - Existing DB records (costs, activity_logs) contain `provider = 'google'` — removing the type would break dashboard aggregation and TypeScript casts
    - Keep `LLMProviderName = 'anthropic' | 'openai' | 'google'` for backward data compatibility
    - The factory in `lib/llm/index.ts` throws on `'google'` — that's sufficient enforcement
  - [ ] 4.5 Update `services/dashboard.ts` line 183: keep `'google'` in `allProviders` array (historical data display)
  - [ ] 4.6 Update `services/llm-router.ts`:
    - `toCredentialProvider()` line 84: `'google' → 'google_ai'` mapping becomes dead code after models.yaml cleanup (no models resolve to `'google'` anymore). Keep it as defensive code — costs DB may still contain `provider='google'` and dashboard queries may hit this path. Add `// dead code after 22.2 — kept for backward compat` comment
    - `resolveProvider()`: model resolution comes from models.yaml — handled in 4.8
  - [ ] 4.7 **Update `services/batch-collector.ts`** (MISSED — Quinn #1):
    - Delete entire `flushGoogleFallback()` method (lines 437-496)
    - Remove google routing block in `flush()` (lines 163-166: `const googleItems = byProvider.get('google')...`)
    - Google-provider batch items will simply not be flushed (items stay in queue → expire → fail gracefully)
  - [ ] 4.8 **Update `config/models.yaml`** (MISSED — Quinn #2):
    - Delete gemini-2.5-pro entry (lines 42-49)
    - Delete gemini-2.5-flash entry (lines 51-57)
    - Update `fallbackOrder: [anthropic, openai]` (remove `google`)
    - This prevents the crash chain: anthropic fail → openai fail → google attempt → factory throw

- [ ] Task 5: Delete old embedding-service.ts (AC: #1)
  - [ ] 5.1 Delete `packages/server/src/services/embedding-service.ts`
  - [ ] 5.2 Verify no remaining imports reference `embedding-service` (grep entire codebase)

- [ ] Task 6: Update credential vault (AC: #8)
  - [ ] 6.1 Add `voyage_ai: ['api_key']` to `PROVIDER_SCHEMAS` in `services/credential-vault.ts`
  - [ ] 6.2 Keep `google_ai` entry (backward compatibility — users may have stored google_ai credentials; removing would break Admin UI display)

- [ ] Task 7: Update/create tests (AC: #9)
  - [ ] 7.1 Create `__tests__/unit/voyage-embedding.test.ts`:
    - Mock `voyageai` module
    - Test `getEmbedding` returns 1024-dim array on success
    - Test `getEmbedding` returns `null` on API error
    - Test `getEmbedding` returns `null` on dimension mismatch
    - Test `getEmbeddingBatch` processes chunks of batchSize
    - Test `getEmbeddingBatch` returns `null` for failed items, continues rest
    - Test exponential backoff: retries on 429, does NOT retry on 400
    - Test `prepareText` (carry-over tests from embedding-service.test.ts)
    - Test credential fetching uses `'voyage_ai'` provider
    - Test `EMBEDDING_DIMENSIONS === 1024` constant
    - Test `getEmbedding` returns `null` when no `voyage_ai` credentials exist (credential absence)
  - [ ] 7.2 Delete `__tests__/unit/embedding-service.test.ts` (replaced by voyage-embedding.test.ts)
  - [ ] 7.3 Update `__tests__/unit/embedding-tea.test.ts`:
    - Change mock from `@google/generative-ai` to `voyageai`
    - Update dimension assertions from 768 → 1024
    - Update import paths from `embedding-service` → `voyage-embedding`
  - [ ] 7.4 Delete or update GoogleAdapter tests in `__tests__/unit/llm-provider-adapters.test.ts`:
    - Remove `describe('GoogleAdapter', ...)` block
    - Remove `test('creates GoogleAdapter for "google"', ...)` assertion
  - [ ] 7.5 Delete or update `__tests__/unit/llm-provider-adapters-tea.test.ts`:
    - Remove all `TEA: GoogleAdapter` describe blocks
  - [ ] 7.6 Update `__tests__/unit/dependency-verification.test.ts`:
    - Remove `@google/generative-ai` preservation tests (lines 297-303)
    - Add `voyageai: 0.2.1` exact-pin assertion
    - Add test: `@google/generative-ai` is NOT in dependencies
  - [ ] 7.7 Update test files referencing `'google'` as a provider:
    - `batch-collector.test.ts`: Delete entire `flushGoogleFallback` describe block + `Google partial failure` describe block + all `mockGoogleCall` setup. Remove gemini model references in `resolveProvider` mock. Change any remaining `provider: 'google'` to `'anthropic'`. Full locations: lines 49, 57-71, 176, 289, 297, 372-382, 440-450, 634, 662, 811-839
    - `provider-fallback.test.ts` (line 340): remove `'google'` from 3-provider fallback test
    - `provider-fallback-tea.test.ts` (line 308): remove `'google'` from circuit breaker provider loop test
    - `cost-recording.test.ts` (line 546): update google model test
    - `cost-recording-tea.test.ts`: check for gemini model references
    - `llm-provider-adapters.test.ts` (line 11-12): update provider count test from 3 → 2
    - `llm-router-tea.test.ts` (line 205): update `validProviders` array — remove `'google'`
    - `llm-router.test.ts`: check for gemini/google references
    - `dashboard-tea.test.ts` + `dashboard.test.ts`: keep `'google'` in type (historical data) but verify chart handles zero-data gracefully
    - `org-template-ui-tea.test.ts`, `agent-management-ui.test.ts`, `org-chart-tea.test.ts`: check for gemini model name references in mocks — update to anthropic/openai models
    - `company-settings-ui.test.ts`, `ceo-cost-drilldown.test.ts`, `ceo-cost-drilldown-tea.test.ts`: check for gemini references in cost display tests

- [ ] Task 8: Build + type-check verification (AC: #1, #9)
  - [ ] 8.1 `turbo build` — all workspaces succeed
  - [ ] 8.2 `turbo type-check` — zero type errors
  - [ ] 8.3 `bun test` — all tests pass (baseline minus deleted google tests)
  - [ ] 8.4 Grep codebase: zero `@google/generative-ai` imports remain
  - [ ] 8.5 Grep codebase: `voyageai` import only in `voyage-embedding.ts`

## Dev Notes

### Architecture References

- **D31 (Voyage AI client)**: Architecture provides reference implementation at lines 522-554. `services/voyage-embedding.ts` replaces `services/embedding-service.ts`. Pattern: `getCredentials(companyId, 'voyage_ai')` → `new VoyageAIClient({ apiKey })` → `client.embed({ input, model: 'voyage-3' })`.
- **E18 (Voyage Embedding Rules)**: All embedding via `getEmbedding()` or `getEmbeddingBatch()`. Model `voyage-3` hardcoded. Credential via `getCredentials(companyId, 'voyage_ai')`. SDK import only in this file.
- **확정 결정 #1**: Gemini API 전면 금지. `@google/generative-ai` 제거 필수.

### API Signature Changes

Old (embedding-service.ts):
```typescript
generateEmbedding(apiKey: string, text: string): Promise<number[] | null>
generateEmbeddings(apiKey: string, texts: string[]): Promise<(number[] | null)[]>
```

New (voyage-embedding.ts):
```typescript
getEmbedding(companyId: string, text: string): Promise<number[] | null>
getEmbeddingBatch(companyId: string, texts: string[], batchSize?: number): Promise<(number[] | null)[]>
```

Key change: callers no longer fetch API keys themselves. The service handles credentials internally via `getCredentials(companyId, 'voyage_ai')`. This simplifies every caller (semantic-search.ts, semantic-cache.ts, etc.).

### Exponential Backoff Implementation

```typescript
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000] // ms, capped at 30s
const MAX_RETRY_DELAY = 30_000
const RETRYABLE_STATUS = [429, 500, 502, 503, 504]

async function withBackoff<T>(fn: () => Promise<T>): Promise<T | null> {
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === RETRY_DELAYS.length) return null
      if (!isRetryable(err)) return null
      const delay = Math.min(RETRY_DELAYS[attempt], MAX_RETRY_DELAY)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  return null
}
```

### Voyage AI SDK API (voyageai@0.2.1)

```typescript
import { VoyageAIClient } from 'voyageai'
const client = new VoyageAIClient({ apiKey: 'xxx' })
const result = await client.embed({
  input: ['text1', 'text2'],  // string or string[]
  model: 'voyage-3',          // 1024 dimensions
})
// result.data = [{ embedding: number[] }, ...]
```

### Files Changed

| File | Action | Details |
|------|--------|---------|
| `packages/server/package.json` | MODIFY | Remove `@google/generative-ai`, add `voyageai: 0.2.1` |
| `packages/server/src/services/voyage-embedding.ts` | CREATE | New single-source embedding service |
| `packages/server/src/services/embedding-service.ts` | DELETE | Replaced by voyage-embedding.ts |
| `packages/server/src/services/semantic-search.ts` | MODIFY | Import from voyage-embedding, simplify credential logic |
| `packages/server/src/services/credential-vault.ts` | MODIFY | Add `voyage_ai: ['api_key']` |
| `packages/server/src/engine/semantic-cache.ts` | MODIFY | Import from voyage-embedding, remove getGoogleApiKey() |
| `packages/server/src/routes/workspace/knowledge.ts` | MODIFY | Import path change |
| `packages/server/src/routes/workspace/sketches.ts` | MODIFY | Import path change |
| `packages/server/src/routes/admin/knowledge.ts` | MODIFY | Import path change |
| `packages/server/src/lib/llm/google.ts` | DELETE | GoogleAdapter removed (Gemini ban) |
| `packages/server/src/lib/llm/index.ts` | MODIFY | Remove GoogleAdapter import/export/factory case |
| `packages/server/src/lib/llm/circuit-breaker.ts` | MODIFY | Remove 'google' from provider list |
| `packages/server/src/services/batch-collector.ts` | MODIFY | Delete flushGoogleFallback() + google routing block |
| `packages/server/src/config/models.yaml` | MODIFY | Remove gemini entries + google from fallbackOrder |
| `packages/server/src/services/llm-router.ts` | MODIFY | Keep toCredentialProvider backward compat |
| `packages/server/src/__tests__/unit/voyage-embedding.test.ts` | CREATE | New test file |
| `packages/server/src/__tests__/unit/embedding-service.test.ts` | DELETE | Replaced |
| `packages/server/src/__tests__/unit/embedding-tea.test.ts` | MODIFY | Update mocks + dimensions |
| `packages/server/src/__tests__/unit/dependency-verification.test.ts` | MODIFY | voyageai assertions |
| `packages/server/src/__tests__/unit/llm-provider-adapters.test.ts` | MODIFY | Remove GoogleAdapter tests |
| `packages/server/src/__tests__/unit/llm-provider-adapters-tea.test.ts` | MODIFY | Remove GoogleAdapter tests |
| `packages/server/src/__tests__/unit/batch-collector.test.ts` | MODIFY | Change provider 'google' references |
| `packages/server/src/__tests__/unit/provider-fallback.test.ts` | MODIFY | Remove 'google' from providers |
| `packages/server/src/__tests__/unit/provider-fallback-tea.test.ts` | MODIFY | Remove 'google' from providers |
| `packages/server/src/__tests__/unit/cost-recording.test.ts` | MODIFY | Update google model test |
| `packages/server/src/__tests__/unit/cost-recording-tea.test.ts` | MODIFY | Check gemini references |
| `packages/server/src/__tests__/unit/llm-router-tea.test.ts` | MODIFY | Remove 'google' from validProviders |
| `packages/server/src/__tests__/unit/llm-router.test.ts` | MODIFY | Check gemini/google references |
| `packages/shared/src/types.ts` | NO CHANGE | Keep `'google'` in LLMProviderName (historical data) |
| `packages/app/src/pages/dashboard.tsx` | NO CHANGE | Keep google provider colors (historical data display) |
| `bun.lock` | MODIFY | Regenerated |

### What NOT to Do

- Do NOT change vector dimensions in schema.ts or pgvector.ts — that is Story 22.3 scope
- Do NOT run re-embedding of existing docs — that is Story 22.3 scope
- Do NOT modify migration SQL files (0049, 0051) — 22.3 creates new migration
- Do NOT change `db/pgvector.ts` default dimension (768) — 22.3 scope
- Do NOT add ESLint rule for SDK import restriction — code review enforcement is sufficient per AC
- Do NOT remove `google_ai` from credential vault — backward compatibility
- Do NOT touch `packages/server/src/db/scoped-query.ts` — its `searchSimilarDocs` function is dimension-agnostic

### Deployment Steps (Post-Merge)

After this story is deployed, existing companies need `voyage_ai` credentials configured:

1. **Admin → Settings → API Keys**: Add `voyage_ai` provider with Voyage AI API key
2. Without this, all `getEmbedding()` calls return `null` (graceful — semantic search falls back to keyword search, semantic cache misses, embeddings skipped)
3. This is a **non-breaking** deployment — null fallback means no crashes, just degraded search until keys are configured
4. Story 22.3 (re-embedding) will not work until voyage_ai credentials are set

### Dimension Mismatch Warning

After this story, `voyage-embedding.ts` produces 1024d vectors but `schema.ts` still has `VECTOR(768)`. This is intentional — Story 22.3 handles the migration. Until 22.3 completes, embedding operations will fail dimension validation. This is acceptable because:
1. The v3 app is not in production yet
2. Story 22.3 immediately follows 22.2
3. We want clean separation of concerns (SDK swap vs data migration)

### Caller Simplification Pattern

Before (each caller manages credentials):
```typescript
const credentials = await getCredentials(companyId, 'google_ai')
const apiKey = extractApiKey(credentials)
if (!apiKey) return null
const embedding = await generateEmbedding(apiKey, text)
```

After (service manages everything):
```typescript
const embedding = await getEmbedding(companyId, text)
// null = any failure (credentials, network, rate limit)
```

### LLM Provider System Impact

Removing GoogleAdapter means the `lib/llm/` factory no longer instantiates a Google provider. However, **`LLMProviderName = 'anthropic' | 'openai' | 'google'` in `shared/types.ts` must NOT be changed** — existing DB records (`costs`, `activity_logs`) contain `provider = 'google'` and the dashboard aggregates by provider. Removing the type would break TypeScript casts on historical data reads.

Instead:
- `lib/llm/index.ts` factory: throw descriptive error for `'google'` case
- `circuit-breaker.ts`: remove `'google'` from active provider iteration (status endpoint only reports active providers)
- `dashboard.ts`: keep `'google'` in `allProviders` (displays historical cost data)
- `llm-router.ts`: `resolveProvider()` returns error for gemini model prefixes

### Project Structure Notes

- Monorepo: Turborepo, Bun 1.3.10
- Server: Hono + Bun runtime
- Tests: `bun:test` framework
- All server source in `packages/server/src/`
- Services pattern: `packages/server/src/services/` — self-contained modules
- Engine boundary (E8): `engine/` files import from `services/`, never the reverse

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — D31 "Voyage AI 클라이언트"]
- [Source: _bmad-output/planning-artifacts/architecture.md — E18 "Voyage Embedding 규칙"]
- [Source: _bmad-output/planning-artifacts/architecture.md — 확정 결정 #1 "Gemini 금지"]
- [Source: _bmad-output/planning-artifacts/architecture.md — Pre-Sprint item #2]
- [Source: _bmad-output/planning-artifacts/architecture.md — v3 Anti-Patterns]
- [Source: _bmad-output/planning-artifacts/epics-and-stories.md — Story 22.2 lines 1343-1360]
- [Source: _bmad-output/implementation-artifacts/stories/22-1-dependency-verification-version-pinning.md — Task 2.5]
- [Source: CLAUDE.md — "NO Gemini API. Voyage AI or Claude ecosystem only"]

## Dependencies

- **Depends on**: Story 22.1 (dependency pinning complete — `@google/generative-ai` is exact-pinned)
- **Blocks**: Story 22.3 (vector migration 768→1024 — needs voyage-embedding.ts in place first)
- **CRITICAL**: Story 22.3 MUST immediately follow 22.2 — no other stories between them. Between 22.2 and 22.3, ALL embedding operations return null (1024d vectors from Voyage vs 768d schema = dimension mismatch). Functions affected: `getEmbedding()`, `embedDocument()`, `embedAllDocuments()`, semantic search, semantic cache. All degrade gracefully (null fallback) but provide no vector functionality.

## Testing Strategy

1. **Unit tests** (`__tests__/unit/voyage-embedding.test.ts`):
   - Mock `voyageai` module — verify `getEmbedding` returns 1024d vector
   - Verify `null` return on API failure, bad credentials, dimension mismatch
   - Verify `getEmbeddingBatch` chunking logic (batchSize boundaries)
   - Verify exponential backoff: retry count, delay pattern, retryable vs non-retryable errors
   - Verify `prepareText` truncation at 10,000 chars
   - Verify credential fetching uses `'voyage_ai'` provider type

2. **Integration verification** (no live API needed):
   - `turbo build` — all workspaces compile
   - `turbo type-check` — zero type errors
   - `bun test` — full suite passes

3. **Dependency verification** (`dependency-verification.test.ts`):
   - `voyageai: 0.2.1` in dependencies (exact pin)
   - `@google/generative-ai` NOT in dependencies
   - No `^` prefix on voyageai

4. **Grep verification** (Task 8):
   - Zero `@google/generative-ai` imports in source
   - `voyageai` import only in `voyage-embedding.ts`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
