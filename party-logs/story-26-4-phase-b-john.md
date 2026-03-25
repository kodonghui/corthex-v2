# Story 26.4 Phase B Review — Critic-C (John, Product + Delivery)

## AC Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| FR-MKT7 | Error workflow: timeout → retry → fallback | PASS | `executeWithFallback()` — tries primary with retry, then iterates fallback chain. `attemptWithRetry()` handles per-attempt AbortController timeout, exponential backoff, auth short-circuit. |
| MKT-2 | Retry 2x + fallback engine auto-switch | PASS | `DEFAULT_RETRY_CONFIG: { maxRetries: 2, baseDelayMs: 1000, timeoutMs: 30_000 }`. Exponential backoff: `baseDelayMs * Math.pow(2, attempt)` (1s, 2s). Fallback engines get `maxRetries: 1`. `buildFallbackChain()` generates fallbacks from `MARKETING_ENGINE_PROVIDERS`. |
| MKT-5 | Platform API change handling | PASS | Platform posting via n8n webhooks (`/webhook/marketing/post/`). Preset workflows use `n8nNodeType` (`n8n-nodes-base.*`). API changes handled by updating n8n nodes, not code. |

## Dimension Scores (Critic-C Weights)

| Dim | Dimension | Score | Weight | Notes |
|-----|-----------|-------|--------|-------|
| D1 | Specificity | 9 | 20% | 6 error categories with matching heuristics. Retry config: maxRetries=2, 30s timeout, 1s base delay. Circuit: 3 failures threshold, 60s cooldown. Fallback chain excludes primary, uses first model per provider. EventBus types: `marketing_engine_fallback`, `marketing_engine_all_failed`. |
| D2 | Completeness | 9 | 20% | FR-MKT7, MKT-2, MKT-5 all covered. Full resilience stack: error categorization, retry, backoff, fallback, circuit breaker, monitoring (`getCircuitStates`), reset (`resetAllCircuits`). Auth errors non-retryable. 38 tests, 89 assertions. Integration test with 26.1 providers. |
| D3 | Accuracy | 9 | 15% | Exponential backoff formula correct (`2^attempt`). Circuit breaker state machine: closed → open (3 failures) → half-open (60s) → closed (success). Auth short-circuit prevents wasting retries on bad API keys. AbortController + clearTimeout in finally. Fallback gets fewer retries (1 vs 2). |
| D4 | Implementability | 8 | 15% | Clean generic API: `callFn(provider, model, signal) => Promise<T>`. Module-level Map for circuit state. `_testBuildN8nWorkflow` pattern (from 26.2) for testability. But: in-memory circuit state doesn't survive restarts. `categorizeError` string-matching is fragile (relies on error message content, not HTTP status codes). |
| D5 | Consistency | 9 | 10% | Imports providers from 26.1's `marketing-settings`. EventBus pattern matches 26.3 (approval + posting notifications). Korean notification messages. AbortController pattern matches NFR-P17 from 26.3. `as const` for config immutability. |
| D6 | Risk Awareness | 9 | 20% | Auth errors non-retryable (bad key won't self-fix). Circuit breaker prevents hammering failed providers. Fallback activation → admin notification. All-engines-failed → critical notification. 30s timeout prevents hung connections. `recordSuccess` resets circuit on recovery. `resetAllCircuits` for emergency recovery. |

## Weighted Score

(9×0.20) + (9×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.20 + 0.90 + 1.80 = **8.85 / 10**

## Issues

| # | Severity | Description |
|---|----------|-------------|
| 1 | LOW | **In-memory circuit state doesn't persist**: `circuitState` is a module-level `Map`. Server restart resets all circuits. Multi-instance deployment has independent circuit state per instance. Acceptable for single-VPS deployment, but document for future scaling. Consider: Redis-backed state if instances increase. |
| 2 | LOW | **`categorizeError` string-matching fragility**: Categorization relies on `msg.includes('429')`, `msg.includes('timeout')`, etc. Different API providers format error messages differently. More robust: parse HTTP status codes directly from response objects (not error messages). Currently works because `postToPlatform` in 26.3 throws `"Platform API error: ${response.status}"` which contains the status code. |

## Product Assessment

Strongest story in Epic 26. The retry + fallback + circuit breaker pattern is a complete resilience stack that handles the full spectrum of API failures:

1. **Retry** — Exponential backoff (1s, 2s) gives transient failures time to recover without hammering the API. Auth errors (401/403) short-circuit immediately — a wrong API key won't fix itself on retry.

2. **Fallback** — `buildFallbackChain()` generates alternatives from the same category (e.g., Flux fails → try DALL-E, Midjourney, Stable Diffusion). Fallback engines get only 1 retry (vs 2 for primary) to limit total latency. Circuit breaker skips providers known to be down.

3. **Circuit breaker** — Classic pattern: 3 failures → open → 60s cooldown → half-open → test one request. `recordSuccess` fully resets on recovery. `getCircuitStates` enables monitoring. `resetAllCircuits` enables admin emergency recovery.

The `executeWithFallback<T>` generic API is well-designed — the caller provides `callFn(provider, model, signal)` and gets back a typed `EngineCallResult<T>` with full telemetry (attempts, usedFallback, fallbackProvider, totalDurationMs, errorCategory).

Two notification flows cover the admin: "engine X failed, auto-switched to Y" (informational) and "all engines in category Z failed, admin action required" (critical).

## Cross-Talk Notes

- **Winston/Amelia (Critic-A, Architecture)**: The generic `executeWithFallback<T>` function with a `callFn` callback is the right abstraction — it doesn't know about HTTP, n8n, or specific APIs. The circuit breaker uses the standard closed/open/half-open state machine. The import from `marketing-settings` for provider lists keeps the fallback chain in sync with the admin's engine selections.
- **Quinn/Dana (Critic-B, QA/Security)**: Auth errors (401/403) correctly skip retries. The circuit breaker prevents amplifying a provider outage into a DoS on their API. The 30s timeout per attempt × 3 attempts = 90s max for primary, then 30s × 2 per fallback. Worst case (4 providers × all fail): ~10+ minutes total. This is within acceptable bounds for content generation but worth documenting as a max latency envelope.

---

**Verdict: PASS (8.85/10)**
