# Story 25.2 Phase B Review — Critic-C (John, Product + Delivery)

## AC Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | N8N-SEC-1 VPS Firewall | PASS | `infrastructure/n8n/firewall.sh` — iptables allow 127.0.0.1 + 172.16.0.0/12 (Docker), DROP external. Idempotent (checks with `-C` before adding). apply/remove/status commands. |
| AC-2 | N8N-SEC-2 Admin JWT | PASS | `n8nAdminGuard` in n8n-security.ts:18 — checks `company_admin`/`super_admin`, throws HTTPError 401 (N8N_SEC_001) / 403 (N8N_SEC_002). |
| AC-3 | N8N-SEC-3 Tag isolation | PARTIAL | `injectCompanyTag` auto-injects `?tags=company:{companyId}` for list endpoints (`/workflows`, `/executions`). However, **no verification for individual resource access** (GET `/workflows/123`). Code comment at line 40 promises "verifies the workflow's tag matches" but this isn't implemented. See Issue #1. |
| AC-4 | N8N-SEC-4 Webhook HMAC | PASS | `n8n-webhook-hmac.ts` — HMAC-SHA256 with `crypto.timingSafeEqual`, Buffer length check before comparison, `sha256=<hex>` signature format (standard GitHub/Stripe pattern). `generateWebhookSecret()` uses `randomBytes(32)`. |
| AC-5 | N8N-SEC-5 Docker limits | PASS | From Story 25.1. Compose verified: memory 2g, cpus 2, max-old-space-size=1536. |
| AC-6 | N8N-SEC-6 DB isolation | PASS | From Story 25.1. DB_TYPE=sqlite, no PostgreSQL config. |
| AC-7 | N8N-SEC-7 Encryption | PASS | From Story 25.1. N8N_ENCRYPTION_KEY required via `:?` syntax. |
| AC-8 | N8N-SEC-8 Rate limit | PASS | `n8nRateLimit` middleware — 60/min per companyId (keyed by tenant, not IP). Returns 429 with `N8N_SEC_008`. Map-based store with 5-min cleanup interval. Functional test confirms 61st request blocked. |
| AC-9 | AR34 All-or-nothing | PASS | `runN8nSecurityAudit()` checks all 8 layers. `allPassed = layers.every(l => l.status === 'pass')`. Runtime test confirms all 8 pass. |

## Dimension Scores (Critic-C Weights)

| Dim | Dimension | Score | Weight | Notes |
|-----|-----------|-------|--------|-------|
| D1 | Specificity | 9 | 20% | All 8 layers mapped with codes (N8N-SEC-1~8). Error codes structured (N8N_SEC_001/002/008). Middleware chain clearly separated: admin guard → tag isolation → rate limit. HMAC service is self-contained with generate + verify + header + secret generation. |
| D2 | Completeness | 8 | 20% | All 8 layers + AR34 audit. 32 tests include functional HMAC tests (generate→verify round-trip) and rate limit functional test (60 pass, 61st→429). SEC-3 tag isolation gap: only filters list endpoints, not individual resource access. Path traversal protection deferred (out of scope — belongs to proxy route story). |
| D3 | Accuracy | 9 | 15% | Matches D25 architecture spec exactly: 60req/min (not PRD's 100/min — D25 explicitly chose 60), HMAC-SHA256 with timing-safe, iptables DROP for external, Docker subnet 172.16.0.0/12 allowed. Firewall `RULE_COMMENT` tag enables clean rule management. |
| D4 | Implementability | 8 | 15% | Clean middleware pattern (`MiddlewareHandler<AppEnv>`). Minor issues: `c.set('n8nCompanyTag' as never, ...)` bypasses type system (should extend AppEnv), `generateWebhookSecret` uses `require('crypto')` at line 67 despite top-level `import { createHmac, timingSafeEqual } from 'crypto'` at line 1. Security audit is file-based (good for CI, won't catch runtime firewall state). |
| D5 | Consistency | 9 | 10% | Follows CORTHEX patterns: middleware in `middleware/`, services in `services/`, HTTPError for structured errors, Korean error messages. Error code naming sequential (001/002/008). Rate limiter follows same Map + cleanup pattern as existing limiters. |
| D6 | Risk Awareness | 8 | 20% | AR34 all-or-nothing is strong — prevents partial deployment. HMAC timing-safe comparison prevents timing attacks. Rate limit keyed by companyId (correct — admin routes are authenticated). Missing: SEC-3 individual resource isolation (tag verified on lists but not individual GETs), and architecture-flagged path traversal risk not addressed (deferred to proxy story). |

## Weighted Score

(9×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.60 + 1.35 + 1.20 + 0.90 + 1.60 = **8.45 / 10**

## Issues

| # | Severity | Description |
|---|----------|-------------|
| 1 | MEDIUM | **SEC-3 individual resource isolation gap**: `injectCompanyTag` only adds `?tags=company:{id}` to list endpoints (`/workflows`, `/executions`). A request to GET `/workflows/{workflowId}` bypasses tag filtering. The code comment (lines 39-41) promises verification for "individual workflow access" but this isn't implemented. A company admin who guesses another company's workflow ID could potentially read it via the proxy. **Fix**: either (a) add a post-proxy response check that verifies the returned workflow has the correct company tag, or (b) add tag filtering to all n8n API calls, not just list endpoints. |
| 2 | LOW | **`as never` type casting**: `n8nTagIsolation` (line 60) uses `c.set('n8nCompanyTag' as never, ...)` to bypass Hono's type system. The `AppEnv` interface in `types.ts` should be extended to include `n8nCompanyTag: string` so the type system catches misuse. |
| 3 | LOW | **Inconsistent crypto import**: `n8n-webhook-hmac.ts` line 1 imports `{ createHmac, timingSafeEqual } from 'crypto'` at top level, but `generateWebhookSecret` (line 67) uses `require('crypto')` for `randomBytes`. Should add `randomBytes` to the top-level import. |

## Product Assessment

Solid 8-layer security implementation that matches the D25 architecture spec. The key deliverables — firewall script, admin guard middleware, HMAC webhook verification, rate limiting, and the AR34 all-or-nothing audit — are all well-implemented and tested.

The HMAC implementation is notably clean: standard `sha256=<hex>` format, timing-safe comparison with Buffer length pre-check, and proper secret generation via `randomBytes(32)`. The rate limiter correctly keys by companyId (not IP) since this is behind admin auth.

The SEC-3 tag isolation gap (Issue #1) is the most significant concern — list endpoints are filtered but individual resource access isn't. This should be addressed before the proxy route story (25.3+) since it's a multi-tenancy isolation gap.

The AR34 security audit service is a good pattern — gives operators a one-call verification that all layers are active. The file-based checking approach is pragmatic for CI/CD gates.

## Cross-Talk Notes

- **Winston/Amelia (Critic-A, Architecture)**: The architecture explicitly warns about path traversal on the n8n proxy: "path normalization 미적용 시 traversal 공격 가능. Hono proxy에서 path prefix strict match + double-dot 차단 필수." This story doesn't address it (correctly — it's the proxy route's responsibility, not the security layer's). Verify this is covered in the proxy route story (likely 25.3).
- **Quinn/Dana (Critic-B, QA/Security)**: SEC-4 HMAC functional tests are good (5 runtime tests including undefined/wrong-secret/wrong-payload). SEC-8 rate limit functional test (61st request → 429) is the strongest test in the suite. Recommend adding a test for SEC-3 tag isolation on individual resource endpoints once the proxy route is implemented.

---

**Verdict: PASS (8.45/10) — with 1 MEDIUM fix recommended (SEC-3 individual resource isolation)**

Epic 25 Critic-C: 25.1=8.80, 25.2=8.45 (2/6 stories reviewed, avg 8.63)
