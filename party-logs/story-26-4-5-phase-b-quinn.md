# Critic-B (QA + Security) Implementation Review — Stories 26.4 + 26.5

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## Story 26.4: API Failure Fallback & Error Handling

### AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 FR-MKT7: Error categorization (6 types) | ✅ | `categorizeError()`: timeout, rate_limit, auth, server_error, network, unknown. String-matching on `error.message.toLowerCase()`. |
| AC-2 MKT-2: Retry 2x with 30s timeout | ✅ | `DEFAULT_RETRY_CONFIG`: maxRetries:2, timeoutMs:30_000, baseDelayMs:1000. `AbortController` per attempt. `clearTimeout` in catch. |
| AC-3 MKT-2: Exponential backoff | ✅ | `config.baseDelayMs * Math.pow(2, attempt)` → 1s, 2s, 4s delays. Skip delay on last attempt. |
| AC-4 MKT-2: Fallback engine auto-switch | ✅ | `buildFallbackChain()` from `MARKETING_ENGINE_PROVIDERS`. `executeWithFallback()` tries primary → fallbacks. Fallbacks get `maxRetries: 1`. |
| AC-5 Circuit breaker | ✅ | Module-level `Map<string, state>`. 3 failures → open. 60s cooldown → half-open (allow one attempt). `recordSuccess()` resets. |
| AC-6 Auth errors not retryable | ✅ | `isRetryable()`: `category !== 'auth'`. Auth errors → immediate `recordFailure` + return. No retry. |
| AC-7 EventBus notifications | ✅ | `marketing_engine_fallback` on auto-switch. `marketing_engine_all_failed` when all engines fail. Both include category + provider details. |
| AC-8 MKT-5: Platform API changes (n8n node only) | ✅ | Platform posting uses n8n webhooks (`/webhook/marketing/post/`). Preset stages use `n8nNodeType: 'n8n-nodes-base.*'`. Platform API changes = n8n node updates only, no code changes. |

### Security Assessment

| Check | Status | Evidence |
|-------|--------|----------|
| No user input in service | ✅ SAFE | All provider/model strings from `MARKETING_ENGINE_PROVIDERS` or caller params. No URL construction from user input. |
| AbortController cleanup | ✅ SAFE | `clearTimeout(timeout)` in both try and catch paths. No leaked timers. |
| EventBus payloads | ✅ SAFE | Provider names and categories from controlled sources. No user-supplied strings in notifications. |
| No DB interaction | ✅ SAFE | Pure in-memory service. No SQL, no JSONB, no injection surface. |
| Circuit state isolation | ✅ SAFE | Module-level Map — process-local. No cross-tenant state leakage (provider names are global, not tenant-scoped). |

### 차원별 점수 (Story 26.4)

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | 6 error categories, RetryConfig with 3 params, FallbackChain, EngineCallResult with full tracking fields. Constants well-defined. |
| D2 완전성 | 25% | 8/10 | 38 tests, 89 assertions across 6 groups. Covers types, retry, circuit breaker, fallback chain, integration. Missing: no test for double-counting recordFailure. |
| D3 정확성 | 15% | 7/10 | Circuit breaker double-counts failures for fallback providers (see Issue #1). No jitter in exponential backoff. Error categorization via string matching is pragmatic but imprecise. |
| D4 실행가능성 | 10% | 9/10 | 38/38 pass. Type-check clean. |
| D5 일관성 | 15% | 9/10 | Korean notifications. EventBus pattern matches codebase. MARKETING_ENGINE_PROVIDERS integration correct. |
| D6 리스크 | 25% | 8/10 | In-memory circuit state (lost on restart — acceptable for single-instance). Double-counting is main architectural concern. No imports from other services yet (standalone). |

**가중 평균: 0.10(9) + 0.25(8) + 0.15(7) + 0.10(9) + 0.15(9) + 0.25(8) = 8.20/10 ✅ PASS**

### Issues (2)

#### 1. **[D3/D6] Circuit breaker double-counts failures for fallback providers** (MEDIUM)

```typescript
// marketing-fallback.ts — TWO recordFailure calls per failed fallback

// Call 1: Inside attemptWithRetry (line 301 for auth, line 318 for exhausted retries)
recordFailure(provider) // internal

// Call 2: In executeWithFallback outer loop (line 225)
recordFailure(fallback.provider) // external

// Result: 2 failures recorded per failed fallback attempt
// With CIRCUIT_FAILURE_THRESHOLD = 3, circuit opens after just 2 failed attempts (2×2=4 > 3)
// PRIMARY engine only records 1 failure (no double-count) — asymmetric behavior
```

**Risk:** Fallback providers get penalized 2x faster than primary providers. A provider that fails twice as a fallback will have its circuit opened (4 recorded failures > threshold 3), even though it was only attempted twice. This is more aggressive than the intended 3-failure threshold.

**Fix:** Remove the `recordFailure` from inside `attemptWithRetry`, since `executeWithFallback` handles it:
```typescript
// In attemptWithRetry: just return the failure, don't record it
// Let the caller (executeWithFallback) decide when to recordFailure
```
Or remove line 225 and rely on the internal recording only.

#### 2. **[D3] No jitter in exponential backoff** (LOW)

```typescript
// marketing-fallback.ts:312
const delay = config.baseDelayMs * Math.pow(2, attempt)
// → 1000, 2000, 4000 — deterministic, no jitter
```

With multiple concurrent retries (e.g., multiple fallback chains running simultaneously), all retries fire at the same times (thundering herd). Low practical risk for single-user pattern, but standard practice is to add jitter:
```typescript
const delay = config.baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5)
```

### Observations (non-scoring)

#### No Importers Yet
`marketing-fallback.ts` has zero imports from other modules (confirmed via grep). It's a standalone library awaiting integration. The `executeWithFallback` function is designed to wrap any engine call, but no caller exists yet. This is likely intentional — the service layer is built first, integration comes in a future story or sprint.

#### In-Memory Circuit State
Circuit breaker state is process-local (`const circuitState = new Map()`). Server restart clears all circuit states. For a single-instance deployment this is fine. Multi-instance would need Redis/shared state — consistent with the "Redis deferred to Phase 4" decision.

---

## Story 26.5: Marketing E2E Verification

### AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 All 5 story services exist | ✅ | Tests verify: marketing-settings.ts, n8n-preset-workflows.ts, marketing-approval.ts, marketing-fallback.ts |
| AC-2 Pipeline flow integrity (6 stages) | ✅ | Verifies stage order: topic-input → ai-research → card-news + short-form → human-approval → multi-platform-post. Branch/merge verified. |
| AC-3 NFR-P17 performance targets | ✅ | Image ≤2min, video ≤10min, posting ≤30s. AbortController verified. Fallback timeout 30s matches. |
| AC-4 Fallback engine chain | ✅ | Retry 2x, fallback continuation, auth skip, 4 image providers, 4 video providers all verified. |
| AC-5 Admin notifications | ✅ | 4 notification types: fallback activation, all-failed, partial posting failure, approval request. |
| AC-6 All routes registered | ✅ | Admin marketing settings, admin n8n presets, workspace marketing approval — all in index.ts. |
| AC-7 CEO + Admin UI pages | ✅ | CEO: marketing-pipeline + marketing-approval pages + sidebar. Admin: marketing-settings page + sidebar. |
| AC-8 Security — API key encryption | ✅ | AES-256-GCM encryption verified. GET returns boolean flags only. |
| AC-9 Sprint 2 exit criteria | ✅ | All 5 test files, all 4 services, preset JSON (6 stages), onboarding integration. |

### 차원별 점수 (Story 26.5)

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | Covers all 5 stories, 6-stage pipeline, 5 platforms, all routes, UI pages, encryption, onboarding. |
| D2 완전성 | 25% | 9/10 | 38 tests, 93 assertions across 10 groups. Comprehensive cross-story verification. Only gap: platforms >= 3 check (should be == 5). |
| D3 정확성 | 15% | 9/10 | Pipeline stage order correct. Performance targets correct. All route registrations verified. |
| D4 실행가능성 | 10% | 10/10 | 38/38 pass. Type-check clean. |
| D5 일관성 | 15% | 9/10 | Verifies cross-story consistency: routes, sidebar entries, App.tsx registrations all align across CEO and Admin apps. |
| D6 리스크 | 25% | 9/10 | Comprehensive exit verification. Source-reading pattern consistent with project. |

**가중 평균: 0.10(9) + 0.25(9) + 0.15(9) + 0.10(10) + 0.15(9) + 0.25(9) = 9.10/10 ✅ PASS**

### Issues (1)

#### 1. **[D2] Loose platform count check** (LOW)

```typescript
// marketing-e2e-26-5.test.ts:305
expect(preset.platforms.length).toBeGreaterThanOrEqual(3)
// Should be exactly 5: instagram, tiktok, youtube_shorts, linkedin, x
```

The E2E verification should pin the exact expected count. `>= 3` would pass even if 2 platforms were accidentally removed.

**Fix:**
```typescript
expect(preset.platforms.length).toBe(5)
```

---

## Combined Epic 26 Summary

| Story | Score | Issues |
|-------|-------|--------|
| 26.1 Marketing Settings | 8.50 | 2 (deleteApiKey no validation, AES key management) |
| 26.2 Preset Workflows | 8.35 | 3 (hardcoded preset, unfiltered executions, JSONB path) |
| 26.3 Human Approval | 8.10 | 3 (post without check, r-m-w race, hardcoded platform) |
| 26.4 Fallback & Error Handling | 8.20 | 2 (circuit double-count, no jitter) |
| 26.5 E2E Verification | 9.10 | 1 (loose platform check) |
| **Epic 26 Average** | **8.45** | **11 total** |

---

## Verdict

**Story 26.4: ✅ PASS (8.20/10)** — Well-structured retry + fallback + circuit breaker. Main issue: `recordFailure` double-counting for fallback providers accelerates circuit opening beyond the 3-failure threshold. Standalone library with no importers yet.

**Story 26.5: ✅ PASS (9.10/10)** — Thorough Epic 26 exit verification covering all 5 stories, pipeline flow, performance targets, routes, UI, security, and onboarding. Strongest E2E verification in Epic 26.
