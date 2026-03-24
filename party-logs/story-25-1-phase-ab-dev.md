# Story 25.1: n8n Docker Container Deployment — Phase A+B (dev)

## Summary

Created isolated n8n Docker sidecar deployment with all security and infrastructure requirements. Docker Compose config, health check service, deployment script, and 38 verification tests.

## What Changed

### Docker Compose (`docker-compose.n8n.yml`)
- **Image**: `n8nio/n8n:2.12.3` pinned (ARM64 verified via `docker manifest inspect`)
- **Port**: `127.0.0.1:5678:5678` — localhost only, not exposed externally
- **Database**: SQLite (`DB_TYPE=sqlite`) — completely isolated from CORTHEX PostgreSQL
- **Resources**: memory 2g, cpus 2, NODE_OPTIONS max-old-space-size=1536
- **Encryption**: N8N_ENCRYPTION_KEY required via `${:?}` syntax (fail-fast if unset)
- **Healthcheck**: wget /healthz every 30s, 3 retries, 30s start_period, auto-restart
- **Callbacks**: `host.docker.internal:host-gateway` + `WEBHOOK_URL`
- **Security hardening**: no-new-privileges, telemetry off, community packages off, templates off
- **Data**: named volume `n8n_data`, execution prune after 7 days

### Health Check Service (`services/n8n-health.ts`)
- `checkN8nHealth()`: fetch /healthz with 5s AbortController timeout
- Returns `N8nHealthStatus { available, url, status, responseTimeMs, error }`
- **Never throws** (FR-N8N5) — catch block returns `{ available: false, error }`
- `isN8nAvailable()`: boolean shorthand for guard clauses

### Deploy Script (`infrastructure/n8n/deploy.sh`)
- Commands: up, down, restart, status, logs
- Pre-flight: checks Docker, compose plugin, .env file
- Auto-creates .env from .env.example with auto-generated encryption key
- Health wait loop after `docker compose up`

## Files

- `docker-compose.n8n.yml` — n8n Docker Compose (NEW)
- `infrastructure/n8n/.env.example` — environment template (NEW)
- `infrastructure/n8n/deploy.sh` — deployment script (NEW)
- `packages/server/src/services/n8n-health.ts` — health check service (NEW)
- `packages/server/src/__tests__/unit/n8n-docker-deployment.test.ts` — 38 tests (NEW)
- `_bmad-output/implementation-artifacts/stories/25-1-n8n-docker-deployment.md` — story spec (NEW)

## Test Results

```
AR33 image pinning: 2 pass
N8N-SEC-5/NFR-SC9 resources: 3 pass
Localhost binding: 2 pass
N8N-SEC-6 SQLite: 3 pass
N8N-SEC-7 encryption: 2 pass
NFR-O9 healthcheck: 4 pass
AR36 host.docker.internal: 2 pass
FR-N8N5 isolation: 4 pass
Security hardening: 5 pass
Health service: 6 pass
Infrastructure files: 5 pass
Total: 38 pass, 0 fail, 54 expect() assertions
Type-check: clean
```
