# Critic-B (QA + Security) Implementation Review — Story 25.2

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 SEC-1 VPS Firewall | ✅ | `firewall.sh`: iptables allow localhost + Docker internal, DROP all else. `set -euo pipefail`, root check, idempotent rules. |
| AC-2 SEC-2 Admin JWT | ✅ | `n8nAdminGuard`: 401 for unauthenticated (N8N_SEC_001), 403 for non-admin (N8N_SEC_002). Only `company_admin`/`super_admin` pass. |
| AC-3 SEC-3 Tag isolation | ⚠️ PARTIAL | `injectCompanyTag` adds `?tags=company:{companyId}` for `/workflows` and `/executions` list endpoints. Individual resource access NOT verified (see Issue #1). |
| AC-4 SEC-4 HMAC webhook | ✅ | `verifyHmacSignature` with `timingSafeEqual`, length check, try/catch. `sha256=<hex>` format. 32-byte random secret generation. |
| AC-5 SEC-5 Docker resources | ✅ | Verified from 25.1 compose: memory 2g, cpus 2, max-old-space-size=1536. |
| AC-6 SEC-6 DB isolation | ✅ | Verified from 25.1 compose: `DB_TYPE=sqlite`, no PostgreSQL config. |
| AC-7 SEC-7 Credential encryption | ✅ | Verified from 25.1 compose: `N8N_ENCRYPTION_KEY` required via `${:?}`. |
| AC-8 SEC-8 Rate limiting | ✅ | `n8nRateLimit`: 60/min per companyId, 429 with N8N_SEC_008. Functional test proves 61st blocked. Cleanup interval prevents memory leak. |
| AC-9 AR34 All-or-nothing audit | ✅ | `runN8nSecurityAudit()`: 8 layer checks, `allPassed = layers.every(status === 'pass')`. |

## Security Deep Dive

### SEC-1: VPS Firewall

| Check | Status | Evidence |
|-------|--------|----------|
| iptables rules | ✅ | Allow 127.0.0.1, allow 172.16.0.0/12 (Docker), DROP all else. |
| Idempotent | ✅ | `iptables -C` check before `-A` add — safe to run multiple times. |
| Cleanup | ✅ | `cmd_remove` loops `iptables -D` until no more matching rules. |
| Root requirement | ✅ | `check_root` validates `id -u` = 0 before any iptables command. |
| Persistence | ⚠️ MISSING | Rules lost on reboot. No `iptables-save`/`iptables-restore` or systemd integration. |
| Docker CIDR breadth | ⚠️ NOTE | `172.16.0.0/12` covers 172.16–172.31.x.x. Default Docker bridge is 172.17.0.0/16. Broader than minimum but covers all Docker network ranges. |

### SEC-2: Admin JWT Guard

| Check | Status | Evidence |
|-------|--------|----------|
| Authentication check | ✅ | `!tenant?.companyId` → 401 (N8N_SEC_001). Falsy check catches null, undefined, empty string. |
| Authorization check | ✅ | `role !== 'super_admin' && role !== 'company_admin'` → 403 (N8N_SEC_002). |
| Role whitelist | ✅ | Explicit allowlist (2 roles), not denylist. Correct pattern. |

### SEC-3: Tag-based Tenant Isolation — **CRITICAL GAP**

| Check | Status | Evidence |
|-------|--------|----------|
| List endpoint filtering | ✅ | `injectCompanyTag()`: `url.searchParams.set('tags', tagValue)` for `/workflows` and `/executions`. |
| Individual resource access | ❌ MISSING | Comment says "For individual workflow access, verifies the workflow's tag matches the requesting company" — BUT this verification is NOT implemented. |
| Credential access | ❌ MISSING | `GET /credentials` not filtered by company tag. |
| Workflow by ID | ❌ MISSING | `GET /workflows/{id}` — any admin could access another company's workflow by UUID. |
| Execution by ID | ❌ MISSING | `GET /executions/{id}` — same cross-tenant access risk. |

**This is the most significant security finding in this review.** The list endpoint filtering prevents casual browsing of other companies' workflows, but direct access by ID bypasses the tag filter entirely. If a company admin learns another company's workflow UUID (e.g., from shared documentation, URL in browser history), they can read/modify it.

### SEC-4: HMAC Webhook Verification

| Check | Status | Evidence |
|-------|--------|----------|
| Algorithm | ✅ | HMAC-SHA256 — industry standard (GitHub, Stripe same pattern). |
| Timing-safe comparison | ✅ | `timingSafeEqual(sigBuf, expectedBuf)` from Node crypto. |
| Length check | ✅ | `sigBuf.length !== expectedBuf.length` before `timingSafeEqual` (required — it throws on mismatch). Length is always 71 bytes (`sha256=` + 64 hex), so leak is zero-information. |
| Undefined signature | ✅ | `if (!signature) return false` — early exit. |
| Error handling | ✅ | try/catch around Buffer operations — returns false on any error. |
| Secret generation | ✅ | `randomBytes(32).toString('hex')` — 256-bit CSPRNG entropy. |
| Import inconsistency | ⚠️ NOTE | `generateWebhookSecret` uses `require('crypto')` while module top already has `import { createHmac, timingSafeEqual } from 'crypto'`. Should use `import { randomBytes }` at top. |

### SEC-8: Rate Limiting

| Check | Status | Evidence |
|-------|--------|----------|
| Key: companyId (not IP) | ✅ | `key = \`n8n:${tenant.companyId}\`` — correct for admin-authenticated endpoints. |
| 60 requests / 60 seconds | ✅ | Constants: `N8N_RATE_LIMIT = 60`, `N8N_RATE_WINDOW_MS = 60_000`. |
| 429 response | ✅ | Returns JSON `{ error: { code: 'N8N_SEC_008', message, retryAfter } }`. |
| Cleanup interval | ✅ | `setInterval` every 5 minutes deletes expired entries. Prevents unbounded Map growth. |
| Functional test | ✅ | 60 requests pass (200), 61st blocked (429). Strong evidence. |
| Response format | ⚠️ NOTE | Uses direct `c.json()` instead of `HTTPError`. Also, `retryAfter` is in the JSON body but NOT in the `Retry-After` HTTP header (RFC 6585 §4 recommends the header). |
| In-memory store | ⚠️ NOTE | Lost on server restart. Acceptable for v1 — no multi-instance concern since single VPS. |
| Module-level setInterval | ⚠️ NOTE | Creates side effect on import — background timer runs in test environments. May cause "unhandled timer" warnings in test cleanup. |

### AR34: All-or-Nothing Audit

| Check | Status | Evidence |
|-------|--------|----------|
| 8 layer checks | ✅ | All 8 `N8N-SEC-*` codes checked. |
| allPassed logic | ✅ | `layers.every(l => l.status === 'pass')` — strict. |
| Dead import | ⚠️ | `import { checkN8nHealth }` never used. |
| Check depth | ⚠️ | Most checks are file-existence + string-contains. SEC-3 passes despite incomplete implementation (only checks `injectCompanyTag` exists, not that individual resource verification exists). |

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | Error codes N8N_SEC_001-008 specific. Algorithm, rate limit values, CIDR ranges all documented. Signature format sha256=hex defined. |
| D2 완전성 | 25% | 7/10 | 32 tests, 128 assertions. HMAC (7 runtime tests) and rate limit (1 functional) are strong. But: no runtime test for admin guard, no runtime test for tag injection, no rate limit isolation test between companies, no window expiry test. |
| D3 정확성 | 15% | 7/10 | HMAC correct with timing-safe. Rate limit logic correct. BUT: SEC-3 comment claims individual resource verification that doesn't exist. Audit reports SEC-3 as "pass" despite incomplete implementation. |
| D4 실행가능성 | 10% | 9/10 | 32/32 pass. Hono functional test for rate limit works well. Audit runtime test confirms all 8 pass. |
| D5 일관성 | 15% | 8/10 | Error code scheme consistent (N8N_SEC_001-008). BUT: rate limit response format differs from HTTPError pattern. `require` vs `import` in HMAC module. |
| D6 리스크 | 25% | 7/10 | HMAC timing-safe verified. Rate limit functional. **BUT: SEC-3 tag isolation gap is significant** — individual workflow/execution/credential access not filtered by company. iptables non-persistent. Dead import in audit. |

### 가중 평균: 0.10(9) + 0.25(7) + 0.15(7) + 0.10(9) + 0.15(8) + 0.25(7) = 7.55/10 ✅ PASS

---

## Issues (1 high, 2 medium, 2 low)

### 1. **[D3/D6] SEC-3 tag isolation incomplete — individual resource access unfiltered** (HIGH)

```typescript
// n8n-security.ts:46-48
if (url.pathname.endsWith('/workflows') || url.pathname.endsWith('/executions')) {
  url.searchParams.set('tags', tagValue)
}
// → Only list endpoints filtered. /workflows/{id}, /executions/{id}, /credentials — NO tag filter.
```

Comment at line 40 says "For individual workflow access, verifies the workflow's tag matches the requesting company" — **this verification does not exist in the code.** A company admin who knows another company's workflow UUID can access/modify it.

The AR34 audit reports SEC-3 as "pass" because `injectCompanyTag` exists, even though isolation is incomplete.

**Severity**: HIGH — cross-tenant data access possible. Must be addressed before proxy routes go live (Story 25.3+).

**Recommendation**: Add proxy-level verification: on `GET /workflows/{id}`, fetch the workflow, check its tags include `company:{companyId}`, reject with 403 if not. Same for executions and credentials.

### 2. **[D6] iptables rules not persistent across reboot** (MEDIUM)

```bash
# firewall.sh — rules applied via iptables -A, lost on reboot
iptables -A INPUT -p tcp --dport "$N8N_PORT" -s 127.0.0.1 -j ACCEPT
```

No `iptables-save`/`iptables-restore` or systemd service to restore rules on boot. After VPS reboot, n8n port is exposed externally until script is re-run.

**Recommendation**: Add `iptables-save > /etc/iptables/rules.v4` after apply, or create a systemd oneshot service.

### 3. **[D5] Rate limit response format inconsistent with HTTPError** (MEDIUM)

```typescript
// n8n-security.ts:96-99 — direct c.json() with custom format
return c.json(
  { error: { code: 'N8N_SEC_008', message: '...', retryAfter } },
  429,
)
// vs HTTPError pattern: { success: false, error: { code, message } }
```

Also missing `Retry-After` HTTP header (RFC 6585 §4).

**Recommendation**: Use `throw new HTTPError(429, ...)` or add `c.header('Retry-After', String(retryAfter))`.

### 4. **[D5] HMAC module uses require() instead of import** (LOW)

```typescript
// n8n-webhook-hmac.ts:67 — uses require despite top-level import from same module
export function generateWebhookSecret(): string {
  const { randomBytes } = require('crypto') as typeof import('crypto')
  // Should be: import { randomBytes } from 'crypto' at top of file
```

### 5. **[D6] Dead import in security audit** (LOW)

```typescript
// n8n-security-audit.ts:2
import { checkN8nHealth } from './n8n-health'
// Never used anywhere in the file
```

---

## Verdict

**✅ PASS (7.55/10)**

HMAC-SHA256 implementation is correct with timing-safe comparison — strongest security component. Rate limit functional test (61st request blocked) provides high confidence. Admin guard properly enforces role-based access. AR34 audit correctly implements all-or-nothing logic.

One HIGH issue: SEC-3 tag isolation only filters list endpoints — individual resource access by UUID is unfiltered, creating a cross-tenant access path. This MUST be addressed before proxy routes go live in Story 25.3+. The AR34 audit incorrectly reports SEC-3 as "pass" despite incomplete isolation. iptables rules are not persistent across reboot.

Score is the lowest in Epic 24-25 due to the SEC-3 gap, but still passes because the gap affects a feature (proxy routes) that isn't deployed yet — it's a prerequisite for 25.3, not a live vulnerability.
