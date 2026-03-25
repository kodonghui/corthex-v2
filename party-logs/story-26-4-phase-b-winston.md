# Story 26.4 — Phase B Review: API Failure Fallback & Error Handling
**Critic-A (Winston) — Architect Review**
**Date**: 2026-03-24

## Files Reviewed
1. `packages/server/src/services/marketing-fallback.ts` — Retry + fallback + circuit breaker (332 lines)
2. `packages/server/src/__tests__/unit/marketing-fallback-26-4.test.ts` — 38 tests, 89 assertions

## Architecture Assessment

### Types (lines 14-39)
- `ErrorCategory`: 6 categories — timeout, rate_limit, auth, server_error, network, unknown
- `RetryConfig`: maxRetries, baseDelayMs, timeoutMs
- `FallbackChain`: category + primary + fallbacks array — generic per EngineCategory
- `EngineCallResult<T>`: generic result with full observability — attempts, usedFallback, fallbackProvider, totalDurationMs, errorCategory
- **Verdict**: Well-typed, observable

### DEFAULT_RETRY_CONFIG (lines 43-47)
- maxRetries: 2, baseDelayMs: 1000 (1s), timeoutMs: 30_000 (30s)
- Matches MKT-2 spec exactly

### Error Categorization (lines 61-79)
- `categorizeError()`: string pattern-matching on error.message.toLowerCase()
  - timeout: 'timeout' | 'aborted'
  - rate_limit: '429' | 'rate limit' | 'too many'
  - auth: '401' | '403' | 'unauthorized' | 'forbidden'
  - server_error: '500' | '502' | '503' | '504'
  - network: 'fetch' | 'econnrefused' | 'network'
  - Fallback: 'unknown'
- `isRetryable()`: `category !== 'auth'` — auth errors are NOT retryable (bad API key won't fix itself). All others are.
- **Verdict**: Correct. Rate limits ARE retryable (succeed after backoff). Auth is not.

### Circuit Breaker (lines 83-120)
- Map-based state per provider: `{ failures, lastFailure, isOpen }`
- `checkCircuit()`: no state or closed → allow. Open → check cooldown (60s). If passed → half-open (reset failures=0, isOpen=false, allow attempt)
- `recordFailure()`: increment failures, open at threshold (3)
- `recordSuccess()`: `circuitState.delete(provider)` — full reset on success
- `getCircuitStates()`: monitoring visibility
- `resetAllCircuits()`: admin/testing utility

Half-open transition: on cooldown expiry, state resets before attempt. If that attempt fails, `recordFailure` starts fresh (failures=1), requiring 3 more failures to re-open. Standard half-open behavior — correct.

### buildFallbackChain (lines 128-143)
- Reads providers from `MARKETING_ENGINE_PROVIDERS[category]` (imported from Story 26.1)
- Excludes primary provider (`provider.id !== primaryProvider`)
- Uses `provider.models[0]` for each fallback (first model = recommended)
- Returns `{ category, primary, fallbacks }` struct
- **Verdict**: Clean chain construction

### executeWithFallback (lines 151-255)
Flow:
1. Try primary engine with full retries (maxRetries=2 → 3 total attempts)
2. On success: `recordSuccess(primary)`, return `usedFallback: false`
3. On failure: iterate fallback engines
   - Skip if circuit open for provider
   - Each fallback gets `maxRetries: 1` (2 total attempts) — fewer retries for fallbacks
   - On fallback success: `recordSuccess`, EventBus notification ("마케팅 엔진 폴백 활성화"), return `usedFallback: true`
   - On fallback failure: `recordFailure`
4. All engines fail: EventBus notification ("마케팅 엔진 전체 실패"), return failure with error/category

- Notifications only emitted when `companyId` provided — optional parameter for testing
- `totalDurationMs` tracked from start of entire operation
- `attempts` accumulated across primary + all fallbacks
- **Verdict**: Correct flow, good observability

### attemptWithRetry (lines 267-325)
- Loop: `attempt = 0` to `config.maxRetries` inclusive (so maxRetries=2 → attempts 0,1,2 → 3 total). Correct per MKT-2 "retry 2x".
- Per-attempt circuit breaker check
- AbortController + setTimeout → timeout enforcement
- `clearTimeout` in both try and catch paths — no timer leak
- Non-retryable (auth) → immediate return + `recordFailure`
- Exponential backoff: `baseDelayMs * 2^attempt` → 1s, 2s. Skip delay on last attempt (no useless wait before giving up).
- After all retries: `recordFailure`
- **Verdict**: Correct retry semantics

### Test Coverage (38 tests)
- Service existence + types (4), retry config (3), error categorization (5)
- Circuit breaker (7), fallback chain builder (4)
- executeWithFallback core (9), MKT-5 platform handling (2), provider integration (2)
- Good coverage of all exported functions and behavior

## Observations

| # | Severity | Issue |
|---|----------|-------|
| 1 | **LOW** | `categorizeError` uses string matching on error messages. If a message happens to contain "429" or "500" as substring of other content, it could be miscategorized. Standard limitation — acceptable. |
| 2 | **LOW** | Circuit breaker is in-memory (Map). State lost on server restart. Fine for single-instance deployment. |

## Scoring (Critic-A Weights)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 Completeness | 9 | 15% | 1.35 |
| D2 UX/Clarity | 9 | 10% | 0.90 |
| D3 Accuracy | 9 | 25% | 2.25 |
| D4 Implementability | 9 | 20% | 1.80 |
| D5 Spec Alignment | 9 | 15% | 1.35 |
| D6 Risk | 9 | 15% | 1.35 |
| **Total** | | | **9.00** |

## Verdict: **PASS** (9.00/10)

Clean retry + fallback + circuit breaker implementation. Correct exponential backoff (1s, 2s), auth-skip logic, half-open circuit transition, fallback retry reduction (maxRetries: 1), and EventBus notifications for both fallback activation and total failure. Well-structured generic API (`executeWithFallback<T>`) that integrates cleanly with Story 26.1 engine providers.
