# Phase B: PM Implementation Review — Story 22.2

**Reviewer:** John (PM, Critic-C)
**Date:** 2026-03-24
**Story:** Voyage AI SDK Integration
**Outcome:** APPROVED

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 Package swap | ✅ | `voyageai: "0.2.1"` exact pin in package.json:40. `@google/generative-ai` absent. Grep: zero `@google/generative-ai` imports in source. |
| AC-2 Single-source | ✅ | `voyage-embedding.ts` exports `getEmbedding(companyId, text)` → 1024d. `getEmbeddingBatch(companyId, texts[], batchSize=32)`. Grep: only `voyage-embedding.ts` imports `voyageai`. |
| AC-3 Backoff | ✅ | `RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]`, `MAX_RETRY_DELAY = 30_000`. `isRetryable()`: 429, 5xx, timeout, network. NOT 400/401/403. |
| AC-4 Null fallback | ✅ | All error paths → `null`. Never throws. Outer try/catch as final safety net. |
| AC-5 Multi-tenant | ✅ | `getCredentials(companyId, 'voyage_ai')` in both `getEmbedding` and `getEmbeddingBatch`. No global key. |
| AC-6 Google removal | ✅ | `google.ts` deleted. `createProvider('google')` throws descriptive error. `circuit-breaker.ts`: only `['anthropic', 'openai']`. |
| AC-7 Caller migration | ✅ | 5/5 callers verified: `semantic-search.ts`, `semantic-cache.ts`, `knowledge.ts` (workspace), `sketches.ts`, `knowledge.ts` (admin). |
| AC-8 Credential vault | ✅ | `voyage_ai: ['api_key']` in PROVIDER_SCHEMAS. `google_ai` preserved. |
| AC-9 Zero regression | ✅ | Type-check 0 errors. Tests pass (pre-existing env-dependent excluded). |

## Product Value Assessment

**Caller simplification delivered as spec'd:**
- `semantic-cache.ts`: 90→70 lines. `getGoogleApiKey()` helper eliminated entirely. 3 imports → 1 import.
- `semantic-search.ts`: 70→54 lines. Credential fetching boilerplate removed. 3 imports → 2 imports.
- Every caller: 4-line credential pattern → 1-line `getEmbedding(companyId, text)`.

**Behavior improvement over old code:**
- `embedAllDocuments()` no longer throws on missing credentials (old: `throw new Error('No Google AI API key configured')`). Now degrades gracefully per VEC-2 — failed docs counted, no crash.

## Infrastructure Cleanup Verified

- `models.yaml`: 6→4 models, gemini entries removed, `fallbackOrder: [anthropic, openai]`
- `lib/llm/index.ts`: GoogleAdapter import/export removed, `'google'` case throws
- `circuit-breaker.ts`: 3→2 providers
- `embedding-service.ts`: deleted
- `google.ts`: deleted

## Security Check

- No API keys in log output — only `{ companyId, model, errorType }` logged ✅
- `extractApiKey()` made internal (not exported) — reduces API surface ✅
- `updateDocEmbedding`: parameterized SQL, NaN/Infinity validation ✅
- No hardcoded credentials ✅

## Risk Assessment

- **Dimension gap (22.2→22.3)**: Known, accepted, documented in spec. `embedDocument()` catches DB errors → returns `false`. No crash.
- **VoyageAI SDK 0.x**: Exact-pinned. `VoyageAIClient`, `VoyageAIError`, `VoyageAITimeoutError` — proper typed error handling.
- **Credential absence**: `getEmbedding` returns `null` when no `voyage_ai` credentials configured. Graceful.

## Verdict

**APPROVED.** Clean implementation, spec-compliant, all 9 ACs verified. The 4-line→1-line caller simplification is exactly the product value this story promised. No issues found.
