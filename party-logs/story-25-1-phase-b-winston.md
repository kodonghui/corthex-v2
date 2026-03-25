# Critic-A Review — Story 25.1: n8n Docker Container Deployment

**Reviewer:** Winston (Architect)
**Date:** 2026-03-24

---

## Files Reviewed (5)

| # | File | Status | Notes |
|---|------|--------|-------|
| 1 | `docker-compose.n8n.yml` | ✅ | n8n sidecar config |
| 2 | `infrastructure/n8n/.env.example` | ✅ | Env template |
| 3 | `infrastructure/n8n/deploy.sh` | ✅ | Deploy script |
| 4 | `packages/server/src/services/n8n-health.ts` | ✅ | Health check service |
| 5 | `__tests__/unit/n8n-docker-deployment.test.ts` | ✅ | 38 tests |

---

## Architecture Requirements Verification

### AR33: Pinned Image ✅
- `n8nio/n8n:2.12.3` — exact version, no floating tags
- Test confirms no `:latest` tag anywhere in compose

### N8N-SEC-5 + NFR-SC9: Resource Limits ✅
| Setting | Value | Status |
|---------|-------|--------|
| Memory limit | 2g | ✅ |
| CPU limit | 2 | ✅ |
| Memory reservation | 512m | ✅ |
| CPU reservation | 0.5 | ✅ |
| NODE_OPTIONS | --max-old-space-size=1536 | ✅ |

### N8N-SEC-6: SQLite Database ✅
- `DB_TYPE=sqlite` — n8n uses its own SQLite, NOT shared PostgreSQL
- `DB_SQLITE_DATABASE=/home/node/.n8n/database.sqlite`
- No PostgreSQL config present (test verifies no `DB_POSTGRESDB`)

### N8N-SEC-7: Credential Encryption ✅
- `N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY:?N8N_ENCRYPTION_KEY is required}`
- `:?` syntax = compose fails if unset (Docker Compose mandatory variable)
- `.env.example` has `openssl rand -hex 32` generation instruction
- deploy.sh auto-generates key on first run

### NFR-O9: Healthcheck ✅
| Setting | Value |
|---------|-------|
| Endpoint | `/healthz` |
| Interval | 30s |
| Timeout | 10s |
| Retries | 3 |
| Start period | 30s |

### AR36: Callbacks ✅
- `extra_hosts: host.docker.internal:host-gateway` — container→host networking
- `WEBHOOK_URL=http://host.docker.internal:${CORTHEX_PORT:-3000}/api/n8n/webhook`

### FR-N8N5: Isolation ✅
| Mechanism | Implementation |
|-----------|----------------|
| Separate container | `docker-compose.n8n.yml` (not in main Dockerfile) |
| Restart policy | `restart: unless-stopped` |
| Resource limits | memory 2g, cpus 2 |
| No-new-privileges | `security_opt: no-new-privileges:true` |
| Health service fault-tolerance | n8n-health.ts never throws |

---

## Security Hardening ✅

| Setting | Value | Purpose |
|---------|-------|---------|
| Port binding | `127.0.0.1:5678:5678` | Localhost only, not exposed |
| N8N_HOST=0.0.0.0 | Inside container | Correct: internal listener, host maps to 127.0.0.1 |
| N8N_DIAGNOSTICS_ENABLED | false | No telemetry |
| N8N_VERSION_NOTIFICATIONS_ENABLED | false | No phone-home |
| N8N_TEMPLATES_ENABLED | false | No template gallery |
| N8N_COMMUNITY_PACKAGES_ENABLED | false | No untrusted plugins |
| EXECUTIONS_DATA_PRUNE | true, 168h (7 days) | Data retention limit |
| no-new-privileges | true | Prevent privilege escalation |
| .env in .gitignore | Line 7 | Secrets not committed |

---

## n8n-health.ts Service ✅

| Feature | Implementation |
|---------|----------------|
| Timeout protection | AbortController, 5s timeout |
| Never throws | catch returns `{ available: false, error }` (FR-N8N5) |
| Response time tracking | `Date.now()` delta |
| N8nHealthStatus interface | available, url, status, responseTimeMs, error |
| Convenience function | `isN8nAvailable()` boolean shortcut |

**Minor observation:** `clearTimeout` only called on success path (line 32). If `fetch` throws, the timeout fires harmlessly (abort on already-settled controller). Not a bug — just a minor cleanup opportunity.

---

## deploy.sh ✅

| Feature | Status |
|---------|--------|
| `set -euo pipefail` | ✅ Strict error handling |
| Docker + Compose preflight | ✅ Checks both installed |
| Auto-create .env from template | ✅ |
| Auto-generate encryption key | ✅ `openssl rand -hex 32` |
| Validate encryption key set | ✅ |
| Health wait loop | ✅ 10 attempts × 5s |
| 5 commands (up/down/restart/status/logs) | ✅ |

---

## Test Coverage (38 tests, 54 assertions) ✅

| Section | Tests | What's Verified |
|---------|-------|-----------------|
| AR33: Image pinning | 2 | Exact version, no :latest |
| N8N-SEC-5/NFR-SC9: Resources | 3 | Memory, CPU, NODE_OPTIONS |
| Localhost binding | 2 | 127.0.0.1, no 0.0.0.0 in ports |
| N8N-SEC-6: SQLite | 3 | DB_TYPE, path, no PostgreSQL |
| N8N-SEC-7: Encryption | 2 | Key present, required syntax |
| NFR-O9: Healthcheck | 4 | Endpoint, interval, retries, start_period |
| AR36: Callbacks | 2 | host.docker.internal, WEBHOOK_URL |
| FR-N8N5: Isolation | 4 | Restart, name, no-new-priv, volume |
| Security hardening | 5 | Telemetry, notifications, community, templates, pruning |
| Health service | 6 | Existence, exports, endpoint, timeout, no-throw, interface |
| Infrastructure files | 5 | deploy.sh, .env.example, .env not committed, separate compose |

---

## E8 Boundary ✅

- n8n-health.ts in `services/` (not engine/)
- No engine/ modifications
- docker-compose.n8n.yml at project root (infrastructure-level, not in packages/)

---

## Scoring (Critic-A Weights)

| Dimension | Weight | Score | Weighted | Notes |
|-----------|--------|-------|----------|-------|
| D1 Requirements | 15% | 9 | 1.35 | All AR/SEC/NFR/FR refs covered |
| D2 Simplicity | 15% | 9 | 1.35 | Clean compose, minimal health service |
| D3 Accuracy | 25% | 9 | 2.25 | Docker best practices, security correct |
| D4 Implementability | 20% | 9 | 1.80 | Ready to deploy, preflight checks |
| D5 Innovation | 15% | 7 | 1.05 | Standard Docker sidecar pattern |
| D6 Clarity | 10% | 9 | 0.90 | Good comments, AR refs inline |
| **Total** | | | **8.70** | |

## Verdict: ✅ PASS (8.70 ≥ 7.0)

### Recommended (non-blocking)

1. Add `clearTimeout(timeout)` in the catch block of n8n-health.ts for cleanup completeness
