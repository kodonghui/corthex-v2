# Story 25.2: N8N-SEC 8-Layer Security — Phase A+B (dev)

## Summary

Implemented all 8 N8N-SEC security layers with AR34 all-or-nothing enforcement. 32 tests covering each layer individually + combined audit.

## What Changed

### SEC-1: VPS Firewall (`infrastructure/n8n/firewall.sh`)
- iptables rules: allow 127.0.0.1 + Docker 172.16.0.0/12, DROP all external
- Commands: apply, remove, status
- Comment-tagged rules for clean removal

### SEC-2: Admin JWT (`middleware/n8n-security.ts`)
- `n8nAdminGuard`: checks `company_admin` or `super_admin` role
- 401 if no tenant/auth, 403 if non-admin role
- Error codes: N8N_SEC_001, N8N_SEC_002

### SEC-3: Tag Isolation (`middleware/n8n-security.ts`)
- `injectCompanyTag(companyId, url)`: appends `?tags=company:{companyId}` to list endpoints
- `n8nTagIsolation` middleware: stores tag for proxy use
- Targets: `/workflows`, `/executions` list endpoints

### SEC-4: Webhook HMAC (`services/n8n-webhook-hmac.ts`)
- `generateHmacSignature(payload, secret)`: SHA256 hex digest
- `verifyHmacSignature(payload, signature, secret)`: timing-safe comparison
- `generateWebhookSecret()`: 32 random bytes → 64 hex chars
- Format: `sha256=<hex>` in `x-n8n-signature` header

### SEC-5/6/7: Already in Story 25.1
- Docker memory 2g, cpus 2
- SQLite only, no PostgreSQL
- N8N_ENCRYPTION_KEY required

### SEC-8: Rate Limiting (`middleware/n8n-security.ts`)
- `n8nRateLimit`: 60 requests/min per companyId (not IP)
- In-memory store with 5-min cleanup interval
- Returns 429 with N8N_SEC_008 error code
- Functional test: 60 pass, 61st → 429

### AR34: Security Audit (`services/n8n-security-audit.ts`)
- `runN8nSecurityAudit()`: checks all 8 layers via file existence + source patterns
- Returns `{ allPassed: boolean, layers: SecurityLayerStatus[] }`
- `allPassed` = every layer status === 'pass'

### Bug Fix
- `n8n-health.ts`: moved `controller`/`timeout` outside try block for proper scope in catch

## Files

- `infrastructure/n8n/firewall.sh` — SEC-1 iptables (NEW)
- `packages/server/src/middleware/n8n-security.ts` — SEC-2, SEC-3, SEC-8 (NEW)
- `packages/server/src/services/n8n-webhook-hmac.ts` — SEC-4 HMAC (NEW)
- `packages/server/src/services/n8n-security-audit.ts` — AR34 audit (NEW)
- `packages/server/src/services/n8n-health.ts` — timeout scope fix (MODIFIED)
- `packages/server/src/__tests__/unit/n8n-sec-8layer.test.ts` — 32 tests (NEW)
- `_bmad-output/implementation-artifacts/stories/25-2-n8n-sec-8layer-security.md` (NEW)

## Test Results

```
SEC-1 Firewall: 3 pass
SEC-2 Admin JWT: 3 pass
SEC-3 Tag Isolation: 4 pass
SEC-4 HMAC: 7 pass
SEC-5 Resources: 2 pass
SEC-6 DB Isolation: 2 pass
SEC-7 Encryption: 1 pass
SEC-8 Rate Limit: 5 pass
AR34 Audit: 5 pass
Total: 32 pass, 0 fail, 128 expect() assertions
Type-check: clean
```
