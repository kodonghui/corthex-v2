# Story 25.6: Go/No-Go #3 — n8n Security Verification

## Story
**As a** QA engineer,
**I want** Sprint 2 n8n exit criteria verified,
**So that** n8n deployment is security-certified.

## References
- Go/No-Go #3, NFR-S9

## 3-Part Verification

### Part 1: Port 5678 External Connection → Rejected
- `infrastructure/n8n/firewall.sh` blocks all external access to port 5678
- Only `127.0.0.1` (localhost) allowed via iptables ACCEPT rule
- All other traffic → DROP
- Rules persisted with `iptables-save`

### Part 2: Tag Filter Cross-Company Access → Blocked
- `injectCompanyTag()` adds `company:{id}` tag to all list requests
- `requiresOwnershipCheck()` validates individual resource access
- `verifyResourceOwnership()` checks company tag on resource data
- `isBlockedPath()` blocks `/credentials` access entirely (N8N_SEC_003)
- Client tag parameter stripped to prevent bypass (`key !== 'tags'`)

### Part 3: Webhook with Tampered HMAC → Rejected
- `n8n-webhook-hmac.ts` verifies HMAC-SHA256 signatures
- Uses `timingSafeEqual` to prevent timing attacks
- Missing signature header → rejected

## All 8 N8N-SEC Layers Verified

| Layer | Description | Implementation |
|-------|-------------|----------------|
| SEC-1 | VPS Firewall | `infrastructure/n8n/firewall.sh` — iptables DROP external |
| SEC-2 | Admin JWT | `n8nAdminGuard` — company_admin/super_admin only |
| SEC-3 | Tag Isolation | `n8nTagIsolation` + `injectCompanyTag` + ownership check |
| SEC-4 | Docker Network | `docker-compose.n8n.yml` — `127.0.0.1:5678:5678` |
| SEC-5 | Encrypted Env | `N8N_ENCRYPTION_KEY` for credential encryption |
| SEC-6 | CSRF | `csrf()` on `/n8n-editor/*` routes |
| SEC-7 | HMAC Webhook | `n8n-webhook-hmac.ts` — SHA256 + timing-safe |
| SEC-8 | Rate Limit | `n8nRateLimit` with `Retry-After` header |

## Additional Verifications
- Docker healthcheck: `wget -qO- http://localhost:5678/healthz` every 30s
- Resource limits: `memory: 2g`, `cpus: "2"`, `NODE_OPTIONS=--max-old-space-size=1536`
- OOM recovery: proxy returns 502 + health status on n8n failure
- Path traversal: double-decode + null byte + double-dot blocking
- Header sanitization: Auth/Cookie stripped (HTTP/1.1 + HTTP/2 variants)
- TOCTOU prevention: pre-verify ownership before write operations
- Legacy code removed: all old workflow files deleted (Story 25.5)

## Tests
- `n8n-story-25-6-go-no-go.test.ts`: 44 tests, 71 assertions
- Total Epic 25 tests: 247 tests, 469 assertions across 6 test files

## Go/No-Go Decision: GO ✅
All exit criteria met. n8n deployment is security-certified.
