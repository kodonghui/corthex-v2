# Phase D: TEA Tests — Story 22.2: Voyage AI SDK Integration

**Reviewer**: Quinn (QA)
**Date**: 2026-03-24

---

## Test Coverage Analysis

### Before Phase D: 70 tests (30 base + 40 TEA)

| Area | Tests | Coverage |
|------|-------|----------|
| Constants (MODEL, DIMENSIONS) | 2 | Complete |
| prepareText | 7 base + 7 TEA = 14 | Complete (unicode, emoji, truncation, boundary) |
| getEmbedding success | 2 base + 3 TEA = 5 | Complete |
| getEmbedding failure modes | 5 base + 6 TEA = 11 | Complete (null data, wrong dims, no creds, empty key, TypeError) |
| getEmbeddingBatch | 4 base + 3 TEA = 7 | Complete (chunking, partial failure, empty, all fail) |
| updateDocEmbedding | 4 base + 6 TEA = 10 | Complete (NaN, Infinity, negative, large, empty) |
| embedDocument | 0 base + 7 TEA = 7 | Complete (cred fallback, doc not found) |
| triggerEmbedding | 3 base + 3 TEA = 6 | Complete (fire-and-forget, non-blocking) |
| embedAllDocuments | 0 base + 1 TEA = 1 | Minimal (only zero docs) |
| Module exports | 1 base + 4 TEA = 5 | Complete |
| Vector string format | 1 base + 1 TEA = 2 | Complete |
| **Exponential backoff (AC-3)** | **0** | **MISSING** |

### Gap Found: Exponential Backoff Completely Untested

The story spec Task 7.1 requires: "Test exponential backoff: retries on 429, does NOT retry on 400". Neither test file covered `withBackoff()` or `isRetryable()`.

### Tests Added: 11 new tests

```
exponential backoff
  ✅ does NOT retry on 400 (bad request) — returns null after 1 call
  ✅ does NOT retry on 401 (unauthorized) — returns null after 1 call
  ✅ does NOT retry on 403 (forbidden) — returns null after 1 call
  ✅ retries on 429 (rate limit) then succeeds
  ✅ retries on 500 (server error) then succeeds
  ✅ retries on 502 (bad gateway) then succeeds
  ✅ retries on VoyageAITimeoutError then succeeds
  ✅ retries on network error (TypeError with fetch) then succeeds
  ✅ does NOT retry on generic Error (non-retryable)
  ✅ returns null after all retries exhausted on persistent 429
  ✅ getEmbeddingBatch retries individual batch on 429
```

### After Phase D: 81 tests (41 base + 40 TEA)

All 81 pass. 1,158 expect() calls. Execution time: 37.86s (backoff retries use real delays).

### Technical Note: Mock Class Identity

bun's `mock.module()` creates class instances inside the factory. `require('voyageai')` inside tests may return a different class identity than the `import` in the service file, causing `instanceof` checks to fail. Fix: define error classes (`MockVoyageAIError`, `MockVoyageAITimeoutError`) outside `mock.module()` and reference them in both the mock and the tests.

### Coverage Summary

| AC | Test Coverage | Status |
|----|---------------|--------|
| AC-1 Package swap | dependency-verification.test.ts | ✅ |
| AC-2 Single-source | module exports test | ✅ |
| AC-3 Exponential backoff | **11 new tests** | ✅ ADDED |
| AC-4 Null fallback | 11 failure→null tests | ✅ |
| AC-5 Multi-tenant | credential provider test | ✅ |
| AC-6 GoogleAdapter removal | llm-provider-adapters tests | ✅ |
| AC-7 Caller migration | import path tests (build) | ✅ |
| AC-8 Credential vault | credential-vault tests | ✅ |
| AC-9 Zero regression | full suite (81 pass) | ✅ |
