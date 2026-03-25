# Story 25.2 — Phase B Review: N8N-SEC 8-Layer Security
**Critic-A (Winston) — Architect Review**
**Date**: 2026-03-24

## Files Reviewed
1. `infrastructure/n8n/firewall.sh` — SEC-1 VPS iptables firewall
2. `packages/server/src/middleware/n8n-security.ts` — SEC-2/3/8 middleware
3. `packages/server/src/services/n8n-webhook-hmac.ts` — SEC-4 HMAC verification
4. `packages/server/src/services/n8n-security-audit.ts` — AR34 all-or-nothing audit
5. `packages/server/src/__tests__/unit/n8n-sec-8layer.test.ts` — 32 tests

## Architecture Assessment

### SEC-1: VPS Firewall (firewall.sh)
- iptables rules: allow localhost (127.0.0.1) + Docker internal (172.16.0.0/12), DROP all else on port 5678
- apply/remove/status commands with idempotent rule insertion (`iptables -C` check before `-A`)
- Root check, colored output, `set -euo pipefail` — production-grade ops script
- **Verdict**: Solid

### SEC-2: Admin JWT Guard (n8n-security.ts)
- `n8nAdminGuard` checks `tenant.companyId` (401) then role string equality for `super_admin`/`company_admin` (403)
- Error codes N8N_SEC_001/002, Korean error messages (matches project convention)
- String equality for role check is appropriate here — no role hierarchy needed for binary admin gate
- **Verdict**: Correct

### SEC-3: Tag-based Tenant Isolation (n8n-security.ts)
- `injectCompanyTag(companyId, url)` appends `?tags=company:{companyId}` to /workflows and /executions list endpoints
- `n8nTagIsolation` middleware stores tag via `c.set('n8nCompanyTag', ...)`
- **Observation**: JSDoc comment says "For individual workflow access, verifies the workflow's tag matches the requesting company" but the function only handles list endpoints. The individual-access verification is deferred to the proxy layer (Story 25.3+). This is acceptable — the mechanism is provided, the proxy will consume it.
- `as never` type casts — standard Hono custom context workaround, non-blocking
- **Verdict**: Acceptable with noted deferral

### SEC-4: HMAC Webhook Verification (n8n-webhook-hmac.ts)
- `generateHmacSignature` — HMAC-SHA256, format `sha256=<hex>`
- `verifyHmacSignature` — Buffer length pre-check before `timingSafeEqual` (prevents timing leak on length mismatch)
- `generateWebhookSecret` — 32 random bytes → 64-char hex
- **Minor inconsistency**: `generateWebhookSecret()` uses `require('crypto')` while the file has top-level `import { createHmac, timingSafeEqual } from 'crypto'`. Should use top-level import for consistency. Non-blocking.
- **Verdict**: Cryptographically sound

### SEC-5/6/7: Docker Resource Limits, DB Isolation, Credential Encryption
- Verified in `docker-compose.n8n.yml` (from Story 25.1)
- memory: 2g, cpus: 2, NODE_OPTIONS max-old-space-size=1536
- DB_TYPE=sqlite, no PostgreSQL config
- N8N_ENCRYPTION_KEY required via `:?` bash substitution
- **Verdict**: Correct

### SEC-8: Rate Limiting (n8n-security.ts)
- In-memory Map keyed by `n8n:${tenant.companyId}` (not IP — correct for authenticated endpoint)
- 60 requests/min window, returns 429 with N8N_SEC_008 and `retryAfter` seconds
- 5-minute cleanup interval prevents memory leak
- **Note**: Map-based store is single-process only. Acceptable for single-server deployment; Redis upgrade deferred.
- Functional test confirms 60 pass → 61st blocked — excellent coverage
- **Verdict**: Correct

### AR34: All-or-Nothing Security Audit (n8n-security-audit.ts)
- `runN8nSecurityAudit()` checks all 8 layers via file existence + source pattern matching
- `allPassed = layers.every(l => l.status === 'pass')` — exact AR34 requirement
- Static file-based verification (consistent with Go/No-Go pattern from 24.8)
- Test suite validates runtime audit returns 8 layers all 'pass'
- **Verdict**: Sound

### Test Coverage (32 tests)
- SEC-1: 3 tests (existence, content patterns, commands)
- SEC-2: 3 tests (export, role rejection, auth rejection)
- SEC-3: 4 tests (function export, tag format, endpoint coverage, middleware export)
- SEC-4: 7 tests (generate, verify valid/invalid/undefined/wrong-secret, timing-safe, secret generation)
- SEC-5: 2 tests (memory+cpus, NODE_OPTIONS)
- SEC-6: 2 tests (SQLite present, no PostgreSQL)
- SEC-7: 1 test (encryption key required)
- SEC-8: 5 tests (export, rate values, companyId key, error code, functional 60→61)
- AR34: 5 tests (file exists, export, 8 layers, allPassed logic, runtime audit)
- **Verdict**: Comprehensive

## Observations (Non-blocking)
1. **SEC-3 individual workflow verification**: Comment describes it but implementation defers to proxy layer — acceptable for this story's scope
2. **`require('crypto')` in generateWebhookSecret**: Inconsistent with top-level import — trivial cleanup
3. **`as never` type casts**: Hono custom context workaround — standard pattern
4. **In-memory rate limit store**: Single-process only — documented as acceptable for current architecture

## Scoring (Critic-A Weights)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 Completeness | 9 | 15% | 1.35 |
| D2 UX/Clarity | 9 | 10% | 0.90 |
| D3 Accuracy | 8 | 25% | 2.00 |
| D4 Implementability | 9 | 20% | 1.80 |
| D5 Spec Alignment | 9 | 15% | 1.35 |
| D6 Risk | 8 | 15% | 1.20 |
| **Total** | | | **8.60** |

D3 and D6 at 8 due to SEC-3 individual-access deferral and in-memory rate limit store — both acceptable architectural decisions but noted for completeness.

## Verdict: **PASS** (8.60/10)

All 8 N8N-SEC layers implemented, AR34 all-or-nothing audit functional, 32 tests with both static and functional coverage. Cryptographic primitives (HMAC-SHA256, timing-safe comparison) correctly applied. No blocking issues.
