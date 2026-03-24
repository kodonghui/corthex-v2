# Story 25.2: N8N-SEC 8-Layer Security Implementation

Status: implemented

## Story

As a security engineer,
I want all 8 security layers enforced on the n8n integration,
So that no partial deployment creates a security gap.

## Acceptance Criteria

1. **AC-1: N8N-SEC-1 VPS Firewall** — iptables blocks port 5678 externally
2. **AC-2: N8N-SEC-2 Admin JWT** — n8n proxy requires company_admin/super_admin role
3. **AC-3: N8N-SEC-3 Tag isolation** — Auto-inject `company:{companyId}` tags
4. **AC-4: N8N-SEC-4 Webhook HMAC** — SHA256 + timing-safe verification
5. **AC-5: N8N-SEC-5 Docker limits** — memory 2g, cpus 2 (from 25.1)
6. **AC-6: N8N-SEC-6 DB isolation** — SQLite only (from 25.1)
7. **AC-7: N8N-SEC-7 Encryption** — AES-256-GCM required (from 25.1)
8. **AC-8: N8N-SEC-8 Rate limit** — 60/min per company, keyed by companyId
9. **AC-9: AR34 All-or-nothing** — Security audit verifies all 8 pass

## Dev Notes

### Layer Implementation Map

| Layer | File | What |
|-------|------|------|
| SEC-1 | `infrastructure/n8n/firewall.sh` | iptables: allow 127.0.0.1+Docker, drop external |
| SEC-2 | `middleware/n8n-security.ts` | `n8nAdminGuard`: 401/403 for non-admin |
| SEC-3 | `middleware/n8n-security.ts` | `injectCompanyTag` + `n8nTagIsolation`: `?tags=company:{id}` |
| SEC-4 | `services/n8n-webhook-hmac.ts` | HMAC-SHA256, timingSafeEqual, generateWebhookSecret |
| SEC-5 | `docker-compose.n8n.yml` | memory 2g, cpus 2, heap 1536m (Story 25.1) |
| SEC-6 | `docker-compose.n8n.yml` | DB_TYPE=sqlite, no PostgreSQL (Story 25.1) |
| SEC-7 | `docker-compose.n8n.yml` | N8N_ENCRYPTION_KEY required (Story 25.1) |
| SEC-8 | `middleware/n8n-security.ts` | `n8nRateLimit`: 60/min per companyId, 429 on exceed |

### AR34 All-or-Nothing Audit
- `services/n8n-security-audit.ts`: `runN8nSecurityAudit()` checks all 8 layers
- Returns `{ allPassed, layers: SecurityLayerStatus[] }`
- Each layer checked via file existence + source pattern verification

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- SEC-1: firewall.sh with iptables apply/remove/status
- SEC-2: n8nAdminGuard middleware (401/403)
- SEC-3: injectCompanyTag + n8nTagIsolation middleware
- SEC-4: HMAC-SHA256 with timing-safe comparison
- SEC-8: 60/min rate limit per companyId (functional test: 60 pass, 61st → 429)
- AR34: Security audit verifies all 8 layers pass
- 32 tests, all passing

### File List
- `infrastructure/n8n/firewall.sh` — SEC-1 iptables (NEW)
- `packages/server/src/middleware/n8n-security.ts` — SEC-2, SEC-3, SEC-8 (NEW)
- `packages/server/src/services/n8n-webhook-hmac.ts` — SEC-4 HMAC (NEW)
- `packages/server/src/services/n8n-security-audit.ts` — AR34 audit (NEW)
- `packages/server/src/services/n8n-health.ts` — timeout scope fix (MODIFIED)
- `packages/server/src/__tests__/unit/n8n-sec-8layer.test.ts` — 32 tests (NEW)
